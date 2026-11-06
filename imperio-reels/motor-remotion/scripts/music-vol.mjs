#!/usr/bin/env node
// Calcula el "music.volume" del props JSON MIDIENDO, no a ojo.
// Mide la sonoridad (LUFS) de la música y de la voz y devuelve el factor para que la
// música quede N dB por debajo de la voz (default 8 dB: se escucha clara y no tapa).
// El default del motor (0.032) deja la música ~20 dB abajo: prácticamente no se oye.
//
// Uso: node scripts/music-vol.mjs --music assets/music.mp3 --voice audios/NN.mp3 [--below 8]
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const get = (k) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : undefined;
};
const music = get("--music");
const voice = get("--voice");
const below = Number(get("--below") ?? 8);
if (!music || !voice) {
  console.error("Uso: node scripts/music-vol.mjs --music m.mp3 --voice v.mp3 [--below 8]");
  process.exit(1);
}
const lufs = (f) => {
  const r = spawnSync("ffmpeg", ["-nostats", "-i", f, "-af", "ebur128", "-f", "null", "-"], { encoding: "utf8" });
  const m = [...String(r.stderr).matchAll(/^\s+I:\s+(-?[\d.]+) LUFS/gm)].pop();
  if (!m) throw new Error(`No pude medir ${f}`);
  return Number(m[1]);
};
const lm = lufs(music);
const lv = lufs(voice);
const vol = Math.min(1, Math.pow(10, (lv - below - lm) / 20));
console.log(`musica ${lm} LUFS · voz ${lv} LUFS · objetivo ${below} dB abajo de la voz`);
console.log(`music.volume = ${vol.toFixed(3)}`);
