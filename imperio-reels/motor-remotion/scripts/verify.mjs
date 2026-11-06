#!/usr/bin/env node
// QA de un reel renderizado: chequea resolución 1080x1920, stream de audio
// presente, duración (contra la esperada si se pasa) y extrae 3 frames para
// revisar a ojo. Devuelve exit 1 si algo falla → sirve para cortar el batch.
//
// Uso:
//   node <my-video>/scripts/verify.mjs --video edited/NN-FINAL.mp4 \
//     [--expect-duration 30] [--tol 1.5] [--frames 30,450,860] [--out-dir <carpeta>]

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const get = (f, d = null) => {
  const i = args.indexOf(f);
  return i === -1 ? d : args[i + 1];
};

const video = get("--video");
if (!video) {
  console.error("Falta --video");
  process.exit(1);
}
const videoAbs = path.resolve(video);
if (!fs.existsSync(videoAbs)) {
  console.error(`No existe: ${videoAbs}`);
  process.exit(1);
}

const ffprobe = (a) =>
  execFileSync("ffprobe", ["-v", "quiet", ...a], { encoding: "utf8" }).trim();

const duration = Number(
  ffprobe(["-show_entries", "format=duration", "-of", "csv=p=0", videoAbs]),
);
// parseInt corta en el primer no-dígito → robusto ante separadores basura de ffprobe
const width = parseInt(
  ffprobe(["-select_streams", "v:0", "-show_entries", "stream=width", "-of", "csv=p=0", videoAbs]),
  10,
);
const height = parseInt(
  ffprobe(["-select_streams", "v:0", "-show_entries", "stream=height", "-of", "csv=p=0", videoAbs]),
  10,
);
const dims = `${width}x${height}`;
const audioCodec = ffprobe([
  "-select_streams", "a:0", "-show_entries", "stream=codec_name",
  "-of", "csv=p=0", videoAbs,
]);

const fails = [];
if (dims !== "1080x1920") fails.push(`resolución ${dims} (esperada 1080x1920)`);
if (!audioCodec) fails.push("sin stream de audio");
const expectDur = get("--expect-duration");
if (expectDur) {
  const tol = Number(get("--tol", "1.5"));
  if (Math.abs(duration - Number(expectDur)) > tol)
    fails.push(`duración ${duration.toFixed(2)}s (esperada ~${expectDur}s ±${tol})`);
}

// extraer frames
const fps = 30;
const framesArg = get("--frames");
const frames = framesArg
  ? framesArg.split(",").map(Number)
  : [Math.round(duration * fps * 0.15), Math.round(duration * fps * 0.5), Math.round(duration * fps * 0.85)];
const outDir = get("--out-dir", path.join(os.tmpdir(), "reel-verify"));
fs.mkdirSync(outDir, { recursive: true });
const base = path.basename(videoAbs, path.extname(videoAbs));
const shots = [];
for (const f of frames) {
  const t = f / fps;
  const out = path.join(outDir, `${base}-f${f}.jpg`);
  spawnSync("ffmpeg", ["-y", "-v", "quiet", "-ss", String(t), "-i", videoAbs, "-frames:v", "1", out]);
  if (fs.existsSync(out)) shots.push(out);
}

console.log(`verify ${base}`);
console.log(`   ${duration.toFixed(2)}s · ${dims} · audio:${audioCodec || "NO"}`);
console.log(`   frames: ${shots.join(" ")}`);
if (fails.length) {
  console.log(`   ❌ FALLA: ${fails.join(" | ")}`);
  process.exit(1);
}
console.log(`   ✅ OK`);
