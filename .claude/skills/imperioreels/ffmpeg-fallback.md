# Fallback: edición con ffmpeg en 3 pasadas (pipeline viejo)

Usar SOLO si el render con Remotion falla (proyecto `my-video/` roto, node sin instalar, etc.).
Era el pipeline original de la skill hasta 2026-07: montaje → velocidad → música.
Problema conocido: en Windows los captions .ass pierden las tildes (ver fix abajo).

## a. Captions .ass (después de transcribir con Scribe)

```bash
node .claude/skills/reels/scripts/words-to-ass.js captions/NN.json captions/NN.ass
```
(color de resaltado default `#E8372A`; con color de marca, pasarlo con `--color`)

**Fix encoding Windows:** `words-to-ass.js` puede generar acentos rotos (é → Ã©) porque
ffmpeg/libass lee el .ass como Latin-1. Alternativa: script Python `reels/tmp/gen_ass.py`
que lee el JSON con `encoding='utf-8'` y stripea acentos con `unicodedata.normalize('NFKD')`
— captions sin tildes pero legibles. Para tildes correctas usar el filtro `subtitles` con
`charenc=UTF-8` o renderizar en Linux. (Con Remotion este problema no existe.)

## b. Pasada 1 — Montaje (base + zoom + b-rolls + captions)

```bash
ffmpeg -y -i heygen/NN-raw.mp4 -i brolls/<b1>.mp4 -i brolls/<b2>.mp4 -filter_complex "
[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,
     zoompan=z='min(1+0.0006*in,1.12)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30[base];
[1:v]trim=0:2.5,setpts=PTS-STARTPTS[b1];
[2:v]trim=0:2.5,setpts=PTS-STARTPTS[b2];
[base][b1]overlay=enable='between(t,<t1>,<t1>+2.5)'[v1];
[v1][b2]overlay=enable='between(t,<t2>,<t2>+2.5)'[v2];
[v2]ass=captions/NN.ass[vout]" \
-map "[vout]" -map 0:a -c:v libx264 -crf 18 -preset fast -c:a aac -b:a 192k tmp/NN-montaje.mp4
```
Los `<t1>,<t2>` salen de las marcas `[BROLL @ ~Xs]` del guion, ajustadas a los timestamps
reales de la transcripción.

## c. Pasada 2 — Velocidad 1.3x (saltear si la voz ya es rápida)

```bash
ffmpeg -y -i tmp/NN-montaje.mp4 -vf "setpts=PTS/1.3" -af "atempo=1.3" -c:v libx264 -crf 18 tmp/NN-13x.mp4
```

## d. Pasada 3 — Música (voz +4dB, beat -30dB)

```bash
ffmpeg -y -i tmp/NN-13x.mp4 -stream_loop -1 -i assets/music.mp3 -filter_complex "
[0:a]volume=4dB[voz];[1:a]volume=-30dB[beat];[voz][beat]amix=inputs=2:duration=first:normalize=0[aout]" \
-map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k -shortest edited/NN-<angulo>-FINAL.mp4
```
