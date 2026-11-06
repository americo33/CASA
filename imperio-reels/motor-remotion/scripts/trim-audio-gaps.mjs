// Corta huecos de un audio usando los gaps entre palabras del Scribe (determinístico, no por dB).
// uso: node trim-audio-gaps.mjs <audio-in> <scribe-in> <audio-out> [gapThresh=0.25] [pad=0.08]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const [,, audioIn, scribeIn, audioOut, gapArg, padArg] = process.argv;
const GAP = parseFloat(gapArg ?? '0.25');
const PAD = parseFloat(padArg ?? '0.08');

const scribe = JSON.parse(fs.readFileSync(scribeIn, 'utf8'));
const words = scribe.words.filter(w => w.type === 'word' && typeof w.start === 'number');
if (!words.length) { console.error('sin palabras'); process.exit(1); }

// construir segmentos [start,end] a conservar, comprimiendo los gaps > GAP a PAD*2
const segs = [];
let segStart = 0; // desde el arranque del audio
for (let i = 0; i < words.length - 1; i++) {
  const gap = words[i + 1].start - words[i].end;
  if (gap > GAP) {
    segs.push([segStart, words[i].end + PAD]);
    segStart = words[i + 1].start - PAD;
  }
}
segs.push([segStart, words[words.length - 1].end + 0.30]); // cola final

// filtro ffmpeg: atrim cada segmento + aconcat
const parts = segs.map((s, i) => `[0:a]atrim=start=${s[0].toFixed(3)}:end=${s[1].toFixed(3)},asetpts=PTS-STARTPTS[a${i}]`);
const concat = segs.map((_, i) => `[a${i}]`).join('') + `concat=n=${segs.length}:v=0:a=1[out]`;
const filter = parts.join(';') + ';' + concat;

execFileSync('ffmpeg', ['-y', '-i', audioIn, '-filter_complex', filter, '-map', '[out]', audioOut, '-loglevel', 'error']);
const kept = segs.reduce((a, s) => a + (s[1] - s[0]), 0);
console.log(`segmentos: ${segs.length} | huecos comprimidos: ${segs.length - 1} | dur estimada: ${kept.toFixed(1)}s`);
