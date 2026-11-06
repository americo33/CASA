#!/usr/bin/env node
// Arma el VIDEO BASE "cinematográfico" de un reel de voz en off:
//   - cada plano con movimiento de cámara continuo (zoom lento, alterna in / out)
//   - transiciones xfade encadenadas (nada de cortes secos)
//   - imágenes fijas (mockups, portadas) como planos con Ken Burns
//   - blur quemado opcional en los planos que van debajo de una escena animada
//   - mux de la voz al final
//
// Uso:
//   node scripts/cine-base.mjs --plan plan.json --out brolls/base.mp4 [--audio audios/NN.mp3]
//
// plan.json:
// {
//   "T": 0.30,                       duración de cada transición (seg)
//   "end": 29.83,                    fin del video (= duración del audio tight)
//   "cuts": [2.30, 4.00, ...],       segundos donde se PERCIBE cada corte (N-1 cortes para N clips)
//   "transitions": ["smoothleft", ...],  N-1 tipos xfade (default: rota una paleta prolija)
//   "clips": [
//     { "src": "C:/ruta/clip.mp4", "ss": 1.2, "dir": "in", "blur": false },
//     { "src": "C:/ruta/tapa.png", "image": true }
//   ]
// }
// Cada clip se corta con margen T (la mitad a cada lado) para que la transición quede
// CENTRADA en el corte: así los tiempos del audio y de las escenas no se corren.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const get = (k) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : undefined;
};
const planPath = get("--plan");
const out = get("--out");
const audio = get("--audio");
if (!planPath || !out) {
  console.error("Uso: node scripts/cine-base.mjs --plan plan.json --out base.mp4 [--audio voz.mp3]");
  process.exit(1);
}

const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
const T = plan.T ?? 0.3;
const { cuts, clips, end } = plan;
if (cuts.length !== clips.length - 1) {
  console.error(`cuts (${cuts.length}) tiene que ser clips-1 (${clips.length - 1})`);
  process.exit(1);
}
// Paleta prolija. NO usar "zoomin": se mete al centro del plano y deja un frame plano de color.
const PALETA = ["smoothleft", "fade", "smoothup", "hblur", "smoothright", "fade", "slideup", "hblur"];
const transitions = plan.transitions ?? cuts.map((_, i) => PALETA[i % PALETA.length]);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cine-"));
const run = (a) => {
  const r = spawnSync("ffmpeg", ["-y", "-v", "error", ...a], { stdio: ["ignore", "inherit", "inherit"] });
  if (r.status !== 0) {
    console.error("ffmpeg falló:", a.join(" ").slice(0, 300));
    process.exit(1);
  }
};

const durs = clips.map((_, k) => {
  if (k === 0) return cuts[0] + T / 2;
  if (k === clips.length - 1) return end - cuts[k - 1] + T / 2;
  return cuts[k] - cuts[k - 1] + T;
});

const segs = clips.map((c, k) => {
  const d = durs[k].toFixed(3);
  const dir = c.dir ?? (k % 2 === 0 ? "in" : "out");
  const z = dir === "in" ? "1.00+0.0011*on" : "1.09-0.0011*on";
  const blur = c.blur ? "boxblur=14:2,eq=brightness=-0.10," : "";
  const zp = `zoompan=z='${z}':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30`;
  const seg = path.join(tmp, `s${String(k).padStart(2, "0")}.mp4`);
  const enc = ["-an", "-c:v", "libx264", "-preset", "fast", "-crf", "19", seg];
  if (c.image) {
    run([
      "-loop", "1", "-framerate", "30", "-i", c.src, "-t", d,
      "-vf", `scale=1296:2304:force_original_aspect_ratio=increase,crop=1296:2304,${blur}${zp},fps=30,setsar=1,format=yuv420p`,
      ...enc,
    ]);
  } else {
    run([
      "-ss", String(c.ss ?? 0), "-i", c.src, "-t", d,
      "-vf", `scale=1296:2304:force_original_aspect_ratio=increase,crop=1296:2304,${blur}${zp},fps=30,setsar=1,format=yuv420p`,
      ...enc,
    ]);
  }
  console.log(`  plano ${k + 1}/${clips.length}  ${d}s  ${dir}${c.blur ? " +blur" : ""}  ${path.basename(c.src)}`);
  return seg;
});

// cadena xfade: offset = corte percibido - T/2
let fc = "";
let prev = "[0:v]";
cuts.forEach((c, k) => {
  const o = k === cuts.length - 1 ? "[vout]" : `[x${k}]`;
  fc += `${prev}[${k + 1}:v]xfade=transition=${transitions[k]}:duration=${T}:offset=${(c - T / 2).toFixed(3)}${o};`;
  prev = `[x${k}]`;
});
fc = fc.replace(/;$/, "");
const mudo = audio ? path.join(tmp, "mudo.mp4") : out;
run([
  ...segs.flatMap((s) => ["-i", s]),
  "-filter_complex", fc, "-map", "[vout]",
  "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-g", "15", "-keyint_min", "15",
  "-pix_fmt", "yuv420p", "-r", "30", mudo,
]);
if (audio) {
  run(["-i", mudo, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", String(end), out]);
}
fs.rmSync(tmp, { recursive: true, force: true });
const p = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out]);
console.log(`OK ${out} · ${String(p.stdout).trim()}s · ${clips.length} planos · ${cuts.length} transiciones de ${T}s`);
