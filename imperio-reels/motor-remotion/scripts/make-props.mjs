#!/usr/bin/env node
// Arma el props JSON de la composición "Reel" a partir de los assets de un producto.
// Copia video/brolls/música a public/reels/<slug>/ y convierte el JSON de
// ElevenLabs Scribe a palabras {text,start,end}.
//
// Uso (desde cualquier carpeta):
//   node <my-video>/scripts/make-props.mjs --slug legal-ia-01 \
//     --video heygen/01-raw.mp4 --scribe captions/01.json \
//     --broll "brolls/landing-1.mp4@21" --broll "brolls/landing-2.mp4@33:2.5" \
//     [--music assets/music.mp3] [--music-vol N  (default: MEDIDO, 8 dB bajo la voz)] \
//     [--speed 1.15] [--color "#E8372A"] [--no-zoom] [--captions-y 72] \
//     [--caption-style pop|karaoke] \
//     [--hook "TEXTO DEL HOOK|parte resaltada"] \
//     [--zoom-hit "palabra:basta[:0.12]"] [--impact "palabra:estudio[:impact]"] \
//     [--sfx-cue "palabra:igual:wrong"] [--intro-sfx riser] \
//     [--cta "Texto|BOTÓN →|palabra:enlace"] \
//     [--keyword "gratis[:emoji]"] [--no-grade] [--progress  (barra arriba; default APAGADA)]
//
// B-roll con modificadores al final del spec (en cualquier orden tras los tiempos):
//   pip (ventana flotante sobre el avatar) | cut | whip | slide | fade (transición)
//   Ej: --broll "brolls/landing.mp4@palabra:sistema:2.5:pip"
//       --broll "brolls/mama.mp4@12:3:whip"
//
// Modo kinetic (ad de texto animado + voz, sin avatar — composición "Kinetic"):
//   node <my-video>/scripts/make-props.mjs --kinetic --slug legal-ia-01-kinetic \
//     --audio audios/01.mp3 --scribe captions/01.json [--bg "#0B0B0F"] [--color ...]
//
// Formato --broll: "<ruta>@<start>[:<duration>[:<startFrom>]]"
//   (tiempos en segundos del timeline ORIGINAL del audio, sin acelerar)
// Overlays (priceTag/counter/ctaCard/badges): quedan en null/[] en el JSON —
//   editarlos a mano ahí (ver tipos en src/reels/types.ts).
// Salida: <my-video>/props/<slug>.json + comando de render listo para copiar.

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const myVideoDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
const get = (flag) => {
  const i = args.indexOf(flag);
  return i === -1 ? null : args[i + 1];
};
const getAll = (flag) =>
  args.flatMap((a, i) => (a === flag ? [args[i + 1]] : []));
const has = (flag) => args.includes(flag);

const kinetic = has("--kinetic");
const slug = get("--slug");
const videoArg = get("--video");
const audioArg = get("--audio");
const scribeArg = get("--scribe");
if (!slug || !scribeArg || (kinetic ? !audioArg : !videoArg)) {
  console.error(
    kinetic
      ? "Faltan argumentos: --slug, --audio y --scribe son obligatorios con --kinetic."
      : "Faltan argumentos: --slug, --video y --scribe son obligatorios.",
  );
  process.exit(1);
}
if (!/^[a-z0-9-]+$/i.test(slug)) {
  console.error(`Slug inválido "${slug}": solo letras, números y guiones.`);
  process.exit(1);
}

const speed = Number(get("--speed") ?? 1.15);
const color = get("--color") ?? "#E8372A";
const captionsY = Number(get("--captions-y") ?? 72);
// "pop" (default del kit) | "karaoke" (perfil TESTEO 1: blanco/gris, sin animación)
const captionStyle = get("--caption-style") ?? "pop";
if (!["pop", "karaoke"].includes(captionStyle)) {
  console.error(`--caption-style inválido "${captionStyle}": usar pop o karaoke.`);
  process.exit(1);
}
const musicArg = get("--music");
const musicVolArg = get("--music-vol");

const publicDir = path.join(myVideoDir, "public", "reels", slug);
fs.mkdirSync(publicDir, { recursive: true });
fs.mkdirSync(path.join(myVideoDir, "props"), { recursive: true });

const copyAsset = (srcPath, destName) => {
  const abs = path.resolve(srcPath);
  if (!fs.existsSync(abs)) {
    console.error(`No existe: ${abs}`);
    process.exit(1);
  }
  fs.copyFileSync(abs, path.join(publicDir, destName));
  return `reels/${slug}/${destName}`; // staticFile usa forward slashes
};

const probeDuration = (absPath) => {
  const out = execFileSync(
    "ffprobe",
    ["-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", absPath],
    { encoding: "utf8" },
  );
  return Number(out.trim());
};

// --- asset base (video o audio según modo) ---
const baseArg = kinetic ? audioArg : videoArg;
const baseAbs = path.resolve(baseArg);
const ext = path.extname(baseAbs) || (kinetic ? ".mp3" : ".mp4");
const baseSrc = copyAsset(baseAbs, `base${ext}`);
const durationSeconds = probeDuration(baseAbs);
if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
  console.error(`ffprobe no pudo leer la duración de ${baseAbs}`);
  process.exit(1);
}

// --- palabras de Scribe ---
const scribe = JSON.parse(fs.readFileSync(path.resolve(scribeArg), "utf8"));
const words = (scribe.words ?? [])
  .filter((w) => w.type === "word")
  .map((w) => ({ text: w.text, start: w.start, end: w.end }));
if (words.length === 0) {
  console.error("El JSON de Scribe no tiene palabras type=word.");
  process.exit(1);
}

// busca la primera palabra que contenga <needle> (sin tildes/puntuación) y da su start
const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const findWordStart = (needle, ctx = "--broll") => {
  const n = norm(needle);
  const hit = words.find((w) => norm(w.text).includes(n));
  if (!hit) {
    console.error(`${ctx} palabra:"${needle}" no encontrada en la transcripción.`);
    process.exit(1);
  }
  return hit.start;
};

// parsea tokens de tiempo: ["palabra","basta",...] o ["12.5",...] →
// {start, rest} donde rest son los tokens que sobran
const parseStart = (tokens, ctx) => {
  if (tokens[0] === "palabra" || tokens[0] === "p" || tokens[0] === "w") {
    return { start: findWordStart(tokens[1], ctx), rest: tokens.slice(2) };
  }
  const start = Number(tokens[0]);
  if (!Number.isFinite(start)) {
    console.error(`${ctx}: tiempo inválido "${tokens[0]}" (número o palabra:<texto>).`);
    process.exit(1);
  }
  return { start, rest: tokens.slice(1) };
};

// --- b-rolls ---
// formato: "ruta@START[:dur[:startFrom]]" donde START es un número (seg) o
//   "palabra:<texto>" para clavarlo cuando se dice esa palabra. Ej:
//   "landing-1.mp4@22"  |  "landing-1.mp4@palabra:sistema:2.5"
const BROLL_MODS = ["pip", "cut", "whip", "slide", "fade"];
const brolls = getAll("--broll").map((spec, i) => {
  const at = spec.lastIndexOf("@");
  if (at === -1) {
    console.error(`--broll inválido "${spec}" — formato: ruta@start[:dur[:startFrom]][:pip][:cut|whip|slide|fade]`);
    process.exit(1);
  }
  const file = spec.slice(0, at);
  const { start, rest } = parseStart(spec.slice(at + 1).split(":"), "--broll");
  const bext = path.extname(file) || ".mp4";
  const item = { src: copyAsset(file, `broll-${i + 1}${bext}`), start };
  // tokens restantes: números en orden (duration, startFrom) + modificadores
  const nums = [];
  for (const t of rest) {
    if (BROLL_MODS.includes(t)) {
      if (t === "pip") item.pip = true;
      else item.transition = t;
    } else if (t.startsWith("sfx=")) {
      const v = t.slice(4);
      item.sfx = v === "false" ? false : v; // override del sonido de entrada
    } else if (Number.isFinite(Number(t))) {
      nums.push(Number(t));
    } else {
      console.error(`--broll "${spec}": token desconocido "${t}".`);
      process.exit(1);
    }
  }
  if (nums.length > 0) item.duration = nums[0];
  if (nums.length > 1) item.startFrom = nums[1];
  return item;
});

// --- zoom-hits, impactos, hook, keywords ---
const zoomHits = getAll("--zoom-hit").map((spec) => {
  const { start, rest } = parseStart(spec.split(":"), "--zoom-hit");
  const item = { start };
  if (rest.length > 0 && Number.isFinite(Number(rest[0]))) item.amount = Number(rest[0]);
  return item;
});

const impacts = getAll("--impact").map((spec) => {
  const { start, rest } = parseStart(spec.split(":"), "--impact");
  const item = { start };
  if (rest.length > 0) item.sfx = rest[0]; // nombre de SFX (default "impact")
  return item;
});

// --sfx-cue "palabra:X:nombre" o "seg:nombre" — sonido suelto sin visual
const sfxCues = getAll("--sfx-cue").map((spec) => {
  const { start, rest } = parseStart(spec.split(":"), "--sfx-cue");
  if (rest.length === 0) {
    console.error(`--sfx-cue "${spec}": falta el nombre del SFX (ej palabra:igual:wrong).`);
    process.exit(1);
  }
  return { start, name: rest[0] };
});

// --cta "Texto|TEXTO DEL BOTÓN|start" — tarjeta CTA final (corre hasta el final)
let ctaCard = null;
const ctaArg = get("--cta");
if (ctaArg) {
  const parts = ctaArg.split("|");
  if (parts.length < 3) {
    console.error(`--cta inválido: formato "Texto|BOTÓN →|palabra:enlace" (o segundos).`);
    process.exit(1);
  }
  const { start } = parseStart(parts[2].split(":"), "--cta");
  ctaCard = { text: parts[0].trim(), buttonText: parts[1].trim(), start };
}

let hookTitle = null;
const hookArg = get("--hook");
if (hookArg) {
  const [text, highlight] = hookArg.split("|");
  hookTitle = { text: text.trim() };
  if (highlight) hookTitle.highlight = highlight.trim();
}

// --keyword "palabra[:emoji]" — la palabra queda coloreada en los captions
const keywords = getAll("--keyword").map((spec) => {
  const sep = spec.indexOf(":");
  if (sep === -1) return spec;
  return { word: spec.slice(0, sep), emoji: spec.slice(sep + 1) };
});

// --- música ---
let music = null;
if (musicArg) {
  const mext = path.extname(musicArg) || ".mp3";
  // Estándar Imperio: la música tiene que ESCUCHARSE. Se mide la sonoridad (LUFS) de la
  // música y de la voz y la música queda 8 dB por debajo. El viejo default fijo (0.032)
  // la dejaba ~20 dB abajo: no se oía.
  let musicVol = musicVolArg != null ? Number(musicVolArg) : null;
  if (musicVol === null) {
    const lufs = (f) => {
      const r = spawnSync("ffmpeg", ["-nostats", "-i", f, "-af", "ebur128", "-f", "null", "-"], { encoding: "utf8" });
      const m = [...String(r.stderr).matchAll(/^\s+I:\s+(-?[\d.]+) LUFS/gm)].pop();
      return m ? Number(m[1]) : null;
    };
    const lm = lufs(path.resolve(musicArg));
    const lv = lufs(path.resolve(baseArg));
    musicVol = lm !== null && lv !== null ? Math.min(1, Math.pow(10, (lv - 8 - lm) / 20)) : 0.12;
    console.log(`   musica ${lm} LUFS · voz ${lv} LUFS -> volumen ${musicVol.toFixed(3)} (8 dB bajo la voz)`);
  }
  music = { src: copyAsset(musicArg, `music${mext}`), volume: Number(musicVol.toFixed(3)) };
}

// overlays de conversión: ctaCard sale del flag --cta; priceTag/counter se
// editan a mano en el JSON (tipos en src/reels/types.ts)
//   priceTag: {oldPrice, newPrice, start, duration, y?}
//   counter:  {prefix?, from, to, suffix?, start, duration, y?}
const overlays = { priceTag: null, counter: null, ctaCard };

// punch-zoom: cortes del jumpcut. --cuts <file>, o autodetecta el sidecar que
// deja tighten.mjs junto al video (<video>.cuts.json).
let punchZoom = null;
if (!kinetic) {
  const cutsArg = get("--cuts");
  const cutsPath = cutsArg
    ? path.resolve(cutsArg)
    : baseAbs.replace(/\.[^.]+$/, ".cuts.json");
  if (fs.existsSync(cutsPath)) {
    const cuts = JSON.parse(fs.readFileSync(cutsPath, "utf8"));
    if (Array.isArray(cuts) && cuts.length > 0) punchZoom = { cuts };
  }
}

const props = kinetic
  ? {
      audioSrc: baseSrc,
      durationSeconds,
      speed,
      words,
      bg: get("--bg") ?? "#0B0B0F",
      highlightColor: color,
      music,
      ...overlays,
    }
  : {
      videoSrc: baseSrc,
      durationSeconds,
      speed,
      words,
      brolls,
      music,
      highlightColor: color,
      zoom: !has("--no-zoom"),
      captionsY,
      captionStyle,
      badges: [], // agregar a mano si el reel lleva badges: {text, start, duration, y}
      // escenas animadas (reemplazo de b-roll): {name, start, duration, props}
      // nombres disponibles en src/reels/scenes/registry.tsx
      scenes: [],
      punchZoom,
      zoomHits,
      impacts,
      sfxCues,
      hookTitle,
      keywords,
      introSfx: get("--intro-sfx") ?? false,
      progressBar: has("--progress"),
      grade: !has("--no-grade"),
      ...overlays,
    };

const propsPath = path.join(myVideoDir, "props", `${slug}.json`);
fs.writeFileSync(propsPath, JSON.stringify(props, null, 2), "utf8");

const compId = kinetic ? "Kinetic" : "Reel";
const finalSecs = (durationSeconds / speed).toFixed(1);
console.log(`OK ${propsPath} (composicion ${compId})`);
console.log(`   base: ${durationSeconds.toFixed(2)}s original -> ~${finalSecs}s a ${speed}x`);
console.log(`   palabras: ${words.length} | brolls: ${brolls.length} | musica: ${music ? "si" : "no"}`);
console.log("");
console.log("Validar con still:");
console.log(`   npx remotion still ${compId} check.png --frame=60 --props=props/${slug}.json`);
console.log("Render final:");
console.log(`   npx remotion render ${compId} out/${slug}.mp4 --props=props/${slug}.json`);
