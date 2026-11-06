#!/usr/bin/env node
// Jumpcut: elimina los silencios (aire muerto entre oraciones) del video HeyGen
// cortando video+audio en sincro, y REMAPEA los timestamps de las palabras del
// JSON de Scribe para que los captions y las escenas sigan cuadrando — SIN
// re-transcribir (es aritmética pura sobre los cortes). Los cortes caen SOLO en
// silencio (boca quieta), así que el lip-sync de HeyGen no se rompe.
//
// Uso (desde la carpeta 05-ads/reels/ del producto):
//   node <my-video>/scripts/tighten.mjs --video heygen/NN-raw.mp4 --scribe captions/NN.json \
//     --out-video heygen/NN-tight.mp4 --out-scribe captions/NN-tight.json \
//     [--noise -35] [--min-silence 0.30] [--keep-pad 0.12]
//
// --min-silence: solo se cortan huecos más largos que esto (seg).
// --keep-pad: cuánto silencio se DEJA en cada hueco cortado (seg) — 0 = corte seco,
//   0.12 = deja un micro-respiro natural. Bajalo para más dinámico.

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const get = (f, d = null) => {
  const i = args.indexOf(f);
  return i === -1 ? d : args[i + 1];
};

const videoIn = get("--video");
const scribeIn = get("--scribe");
const videoOut = get("--out-video");
const scribeOut = get("--out-scribe");
if (!videoIn || !scribeIn || !videoOut || !scribeOut) {
  console.error("Faltan: --video --scribe --out-video --out-scribe");
  process.exit(1);
}
const noise = get("--noise", "-35");
const minSilence = Number(get("--min-silence", "0.30"));
const keepPad = Number(get("--keep-pad", "0.12"));

const videoAbs = path.resolve(videoIn);
const probe = (p) =>
  Number(
    execFileSync(
      "ffprobe",
      ["-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", p],
      { encoding: "utf8" },
    ).trim(),
  );
const duration = probe(videoAbs);

// 1) detectar silencios (silencedetect escribe a stderr)
const det = spawnSync(
  "ffmpeg",
  ["-i", videoAbs, "-af", `silencedetect=noise=${noise}dB:d=${minSilence}`, "-f", "null", "-"],
  { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
).stderr;
const silences = [];
let curStart = null;
for (const line of det.split(/\r?\n/)) {
  const ms = line.match(/silence_start:\s*([0-9.]+)/);
  const me = line.match(/silence_end:\s*([0-9.]+)/);
  if (ms) curStart = Number(ms[1]);
  if (me && curStart !== null) {
    silences.push([curStart, Number(me[1])]);
    curStart = null;
  }
}

// 2) intervalos a REMOVER: dejar keepPad/2 de cada lado del hueco
const removed = [];
for (const [s, e] of silences) {
  const rs = s + keepPad / 2;
  const re = e - keepPad / 2;
  if (re - rs > 0.02) removed.push([rs, re]);
}
removed.sort((a, b) => a[0] - b[0]);

if (removed.length === 0) {
  console.error("No hay silencios que cortar con estos parámetros.");
  process.exit(1);
}

// 3) segmentos a CONSERVAR (complemento)
const keeps = [];
let cursor = 0;
for (const [rs, re] of removed) {
  if (rs > cursor + 0.02) keeps.push([cursor, rs]);
  cursor = Math.max(cursor, re);
}
if (duration > cursor + 0.02) keeps.push([cursor, duration]);

// 4) jumpcut con ffmpeg (filter_complex vía script para no reventar la línea)
const parts = [];
const labels = [];
keeps.forEach(([s, e], i) => {
  parts.push(`[0:v]trim=start=${s.toFixed(3)}:end=${e.toFixed(3)},setpts=PTS-STARTPTS[v${i}];`);
  parts.push(`[0:a]atrim=start=${s.toFixed(3)}:end=${e.toFixed(3)},asetpts=PTS-STARTPTS[a${i}];`);
  labels.push(`[v${i}][a${i}]`);
});
parts.push(`${labels.join("")}concat=n=${keeps.length}:v=1:a=1[v][a]`);
const filterScript = path.join(os.tmpdir(), `tighten-${Date.now()}.txt`);
fs.writeFileSync(filterScript, parts.join("\n"), "utf8");

fs.mkdirSync(path.dirname(path.resolve(videoOut)), { recursive: true });
execFileSync(
  "ffmpeg",
  ["-y", "-i", videoAbs, "-filter_complex_script", filterScript,
   "-map", "[v]", "-map", "[a]",
   "-c:v", "libx264", "-crf", "18", "-preset", "medium",
   "-c:a", "aac", "-b:a", "192k", path.resolve(videoOut)],
  { stdio: ["ignore", "ignore", "inherit"] },
);
fs.unlinkSync(filterScript);

// 5) remapear timestamps: new_t = t - (silencio removido antes de t)
const removedBefore = (t) => {
  let acc = 0;
  for (const [rs, re] of removed) {
    if (rs >= t) break;
    acc += Math.min(t, re) - rs;
  }
  return acc;
};
const remap = (t) => +(t - removedBefore(t)).toFixed(3);

const scribe = JSON.parse(fs.readFileSync(path.resolve(scribeIn), "utf8"));
const newWords = (scribe.words ?? []).map((w) => ({
  ...w,
  start: remap(w.start),
  end: remap(w.end),
}));
const newDuration = probe(path.resolve(videoOut));
fs.writeFileSync(
  path.resolve(scribeOut),
  JSON.stringify({ ...scribe, words: newWords, audio_duration_secs: newDuration }, null, 2),
  "utf8",
);

// Cortes en el timeline NUEVO (tight) = largos acumulados de los segmentos
// conservados. Sirven para el punch-zoom (que la composición empuje en cada
// corte y disimule el salto). Se escribe junto al video tight como sidecar.
const keptLens = keeps.map(([s, e]) => e - s);
const interiorCuts = [];
let acc2 = 0;
for (let i = 0; i < keptLens.length - 1; i++) {
  acc2 += keptLens[i];
  interiorCuts.push(+acc2.toFixed(3));
}
const cutsOut = path.resolve(videoOut).replace(/\.[^.]+$/, ".cuts.json");
fs.writeFileSync(cutsOut, JSON.stringify(interiorCuts), "utf8");

const removedTotal = removed.reduce((a, [rs, re]) => a + (re - rs), 0);
console.log(`OK jumpcut`);
console.log(`   ${duration.toFixed(2)}s -> ${newDuration.toFixed(2)}s (cortados ${removedTotal.toFixed(2)}s en ${removed.length} huecos)`);
console.log(`   video: ${videoOut}`);
console.log(`   scribe remapeado: ${scribeOut}`);
console.log(`   cortes (punch-zoom): ${path.basename(cutsOut)} (${interiorCuts.length})`);
