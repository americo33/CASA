#!/usr/bin/env node
/**
 * words-to-ass.js — Convierte una transcripción con timestamps por palabra
 * (JSON de ElevenLabs Scribe) en subtítulos .ass estilo TikTok karaoke:
 * líneas cortas centradas en el tercio inferior, palabra activa resaltada.
 *
 * Uso:
 *   node words-to-ass.js input.json output.ass [--color E8372A] [--font "Arial Black"] [--size 92] [--words 3]
 *
 * Acepta dos formatos de entrada:
 *   - ElevenLabs Scribe: { words: [{ text, start, end, type: "word"|"spacing" }] }
 *   - Genérico:          { words: [{ word|text, start, end }] }
 */

const fs = require("fs");

function parseArgs(argv) {
  const args = { positional: [], color: "E8372A", font: "Arial Black", size: 92, words: 3 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--color") args.color = argv[++i].replace(/^#/, "");
    else if (a === "--font") args.font = argv[++i];
    else if (a === "--size") args.size = parseInt(argv[++i], 10);
    else if (a === "--words") args.words = parseInt(argv[++i], 10);
    else args.positional.push(a);
  }
  return args;
}

// #RRGGBB -> formato ASS &HAABBGGRR& (alpha 00 = opaco)
function hexToAss(hex) {
  const r = hex.slice(0, 2), g = hex.slice(2, 4), b = hex.slice(4, 6);
  return `&H00${b}${g}${r}&`.toUpperCase();
}

function toAssTime(sec) {
  if (sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const cs = Math.round((sec - Math.floor(sec)) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function escapeAss(text) {
  return text.replace(/\\/g, "\\\\").replace(/\{/g, "(").replace(/\}/g, ")").replace(/\n/g, " ");
}

const args = parseArgs(process.argv);
const [inputPath, outputPath] = args.positional;
if (!inputPath || !outputPath) {
  console.error('Uso: node words-to-ass.js input.json output.ass [--color E8372A] [--font "Arial Black"] [--size 92] [--words 3]');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const source = raw.words || raw.segments || [];
const words = source
  .filter((w) => (w.type ? w.type === "word" : true))
  .map((w) => ({
    text: String(w.text ?? w.word ?? "").trim(),
    start: Number(w.start),
    end: Number(w.end),
  }))
  .filter((w) => w.text.length > 0 && Number.isFinite(w.start) && Number.isFinite(w.end));

if (words.length === 0) {
  console.error("No se encontraron palabras con timestamps en " + inputPath);
  process.exit(1);
}

// Agrupar en líneas: máx N palabras, y cortar antes si hay puntuación fuerte o pausa > 0.6s
const lines = [];
let current = [];
for (const w of words) {
  const prev = current[current.length - 1];
  const gap = prev ? w.start - prev.end : 0;
  if (current.length > 0 && (current.length >= args.words || gap > 0.6 || /[.!?…]$/.test(prev.text))) {
    lines.push(current);
    current = [];
  }
  current.push(w);
}
if (current.length > 0) lines.push(current);

const highlight = hexToAss(args.color);
const white = "&H00FFFFFF&";

const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,${args.font},${args.size},${white},${white},&H00000000&,&H80000000&,-1,0,0,0,100,100,0,0,1,7,2,2,60,60,420,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

// Un evento Dialogue por palabra: muestra la línea completa con la palabra activa resaltada.
// La última palabra de cada línea extiende su evento hasta el inicio de la línea siguiente
// (o +0.4s en la última) para que el caption no parpadee entre palabras.
let events = "";
for (let li = 0; li < lines.length; li++) {
  const line = lines[li];
  const nextLineStart = li + 1 < lines.length ? lines[li + 1][0].start : line[line.length - 1].end + 0.4;
  for (let wi = 0; wi < line.length; wi++) {
    const start = line[wi].start;
    const end = wi + 1 < line.length ? line[wi + 1].start : nextLineStart;
    if (end <= start) continue;
    const text = line
      .map((w, i) =>
        i === wi
          ? `{\\c${highlight}}${escapeAss(w.text)}{\\c${white}}`
          : escapeAss(w.text)
      )
      .join(" ");
    events += `Dialogue: 0,${toAssTime(start)},${toAssTime(end)},Caption,,0,0,0,,${text}\n`;
  }
}

// BOM para que libass detecte UTF-8 (sin esto, los acentos salen mojibake en Windows)
fs.writeFileSync(outputPath, "﻿" + header + events, "utf8");
console.log(`OK: ${lines.length} lineas, ${words.length} palabras -> ${outputPath}`);
