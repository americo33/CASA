---
name: imperioreels
description: Genera y edita reels UGC verticales listos para redes - voz (ElevenLabs), avatar (HeyGen) y edición completa con Remotion (captions karaoke, jumpcut, zooms, b-rolls, escenas animadas, SFX, música y overlays). Edita con el Estándar Imperio: elegante, minimalista, fluido, transiciones de nivel After Effects, pack de producto con mockups reales, música sin copyright. Usar cuando el usuario dice "imperioreels", "reels", "un reel", "videos UGC", "editá este reel", "hacé un video de mi producto" o pasa un audio + un avatar para editar.
---

# Imperio Reels — generación + edición premium automática

Convierte un guion en un reel editado listo para subir: voz (ElevenLabs) → avatar hablando
(HeyGen) → b-rolls → **edición local con Remotion** (composición `Reel` del motor). En un solo
render arma captions karaoke, come los silencios (jumpcut), mete zooms en los cortes, encaja
b-rolls y escenas animadas, suma SFX, música y overlays — vertical 1080x1920.

> **Regla de oro:** validá UN reel de punta a punta con **stills** (que son gratis) antes de
> renderizar en serie. Renderizar cuesta minutos; los stills, segundos. Y si ya tenés el audio y
> el video de avatar hechos, saltá directo a la **§6a-bis (jumpcut)**.

> **🔴 Antes de cualquier otra cosa:** si la sesión NO está corriendo en **Opus 5.5**, lo PRIMERO
> es preguntarle al usuario si quiere pasar a Opus 5.5 (se cambia desde el selector de modelo de
> la app). Una sola pregunta, y recién después se arranca. Si ya está en Opus 5.5, no preguntar.

## ⭐ Estándar Imperio de edición (obligatorio, en TODOS los reels)

El listón: que parezca editado por un profesional en After Effects. **Elegante, minimalista,
prolijo y fluido.** Nada tosco, nada gritón. Se aplica SIEMPRE, aunque el usuario no lo pida.

**Antes de editar**
1. **Si el producto tiene un anuncio ganador, estudiarlo primero.** Transcribirlo con Scribe (§6a)
   y mirarlo cuadro por cuadro:
   `ffmpeg -i ganador.mp4 -vf "fps=1,scale=150:-1,tile=7x3" -frames:v 1 hoja1.jpg` (y otra hoja
   con `-ss 21` para la segunda mitad). Copiar su estructura de guion **y** su estilo de edición:
   cómo entran los productos, cada cuánto cambia el plano, qué texto aparece y dónde.
2. **Revisar CADA clip antes de usarlo** con una hoja de contacto
   (`-vf "fps=1/3,scale=240:-1,tile=4x1" -frames:v 1`). Descartar todo lo que tenga subtítulos
   quemados, marcas de agua, logos o productos de otras marcas, texto en otro idioma o una temática
   que no corresponde (San Valentín, Pascua…). El material bajado de TikTok casi siempre trae texto:
   buscar las versiones "crudas". Revisar el tramo exacto que se va a usar, no solo el comienzo.
3. **Si el producto tiene bonos, el guion los nombra** (uno por uno) antes del CTA, y el cierre
   muestra el producto y los bonos (escena `bundle`).

**Montaje**
4. **Nunca cortes secos.** El video base se arma con `scripts/cine-base.mjs` (§4, Opción C): cada
   plano con movimiento de cámara continuo (zoom lento que alterna acercar / alejar) y transiciones
   de 0,3 s centradas en el corte (`smoothleft`, `smoothright`, `smoothup`, `hblur`, `fade`,
   `slideup`). **No usar `zoomin`**: se mete al centro del plano y deja un cuadro plano de color.
5. **Ritmo:** un cambio de plano cada ~2 s, con los cortes anclados a palabras del Scribe.
6. **Escenas animadas (números, checklist): nunca sobre negro liso.** El motor las pone sobre el
   mismo video desenfocado. Para un fondo todavía más suave, marcar ese plano con `"blur": true`
   en el plan de `cine-base`.

**Cierre y conversión**
7. **Producto y bonos = escena `bundle`** con mockups 3D (§6b). Nunca la tapa plana pegada.
   El producto entra solo y grande, se corre a su lugar, y los bonos llegan deslizándose desde los
   costados, cada uno en la palabra que lo nombra.
8. **El mockup conserva la tapa EXACTA.** Buscar primero los que ya existen en la carpeta del
   producto (`Mockup*.png`). Si vienen con fondo pegado, recortarlo (Higgsfield:
   `media_upload` → `remove_background`). Si no existen, generarlos a partir de la tapa original
   sin que la IA la redibuje, y compararlos contra la tapa antes de usarlos.
9. **CTA minimalista:** píldora blanca + flecha en círculo negro (default del motor). El texto del
   botón va en oración normal ("Ver todo lo que incluye"), no en MAYÚSCULAS. Cuando entra el CTA,
   los subtítulos se apagan solos (el botón ya lo dice).

**Audio**
10. **Siempre música**, alegre y acorde al producto, **sin copyright. Nunca créditos en pantalla.**
    - **Primera opción — generarla con ElevenLabs Music** (`POST /v1/music`, `music_length_ms` =
      duración del reel + 2 s): es original, con licencia comercial y sin reclamos de Content ID.
      Cuesta centavos. Prompt: estilo + *"no vocals, steady groove, no big drops, sits under a
      voiceover"*.
    - **Segunda opción — Pixabay** (Pixabay Content License: uso comercial, sin pagar, sin
      atribución). Si la pista dice "Content ID Registered", avisarle al usuario: en Meta no pasa
      nada; en YouTube puede llegar un reclamo que se disputa con el link de la licencia.
    - Nunca usar una pista sin saber de dónde salió.
11. **La música se tiene que ESCUCHAR.** `make-props` la mide sola (LUFS) y la deja 8 dB bajo la voz.
    `--music-vol` solo para pisarlo. Para calcularlo aparte: `node scripts/music-vol.mjs --music
    assets/music.mp3 --voice audios/NN.mp3`.
12. **Masterizado final a −12 LUFS** (§6d). Sin esto el reel suena más bajo que el resto del feed.

**Prolijidad**
13. **Sin barra de progreso** (default apagada; `--progress` la prende si el usuario la pide).
14. **Validar con stills cada momento clave:** el hook, una transición a mitad de camino, cada
    escena, cada paso del `bundle` y el CTA. Mirar: nada tapado, nada duplicado (subtítulo encima
    del mismo texto), nada negro liso, nada pixelado, nada en la zona de la UI de Meta.
15. **Ojo con los nombres de archivo:** `make-props` copia el video como
    `public/reels/<slug>/base.mp4`. Si después se rehace el video base, pisar ESE archivo (no uno
    con otro nombre), o el render sigue usando el viejo sin avisar.
16. **Cada pedido de cambio del usuario se aplica y se vuelve a validar con stills** antes de
    re-renderizar. Entregar siempre con la versión numerada (`NN-<angulo>-FINAL.mp4`).

## 0. Prerrequisitos (verificar antes de arrancar)

1. **Claude Code**, **Node** (v18+) y **ffmpeg / ffprobe** en el PATH (`ffmpeg -version`, `node -v`).
2. El **motor de edición Remotion** (carpeta `motor-remotion/` de este kit) con dependencias
   instaladas: entrá a la carpeta y corré `npm i` **una vez**. Anotá su ruta absoluta — en esta
   skill se la llama `$MOTOR` (ej: `C:\Users\vos\Kit-Reels\motor-remotion`).
3. **API keys** en un `.env` en la raíz de tu carpeta de trabajo:
   `ELEVENLABS_API_KEY=...` y `HEYGEN_API_KEY=...`. **NUNCA** imprimir su valor en el chat ni en
   archivos. Para usarlas en curl sin exponerlas:
   `export $(grep -v '^#' .env | grep -v '^$' | tr -d '\r' | xargs)` y referenciar como
   `$ELEVENLABS_API_KEY` / `$HEYGEN_API_KEY`.
4. Carpeta de trabajo del reel: `reels/<proyecto>/` con subcarpetas
   `guiones/ audios/ avatar/ heygen/ brolls/ captions/ edited/ assets/` y un `config.md`
   (ahí se anotan voice_id, talking_photo_id/avatar_id y ajustes, para reusarlos en la próxima tanda).
5. **Créditos:** HeyGen y ElevenLabs consumen créditos por minuto generado. Confirmá con el
   usuario cuántos reels antes de generar en masa.

## 1. Molde del guion

- Si el usuario tiene un reel de referencia que funciona (archivo/URL): extraer audio
  (`ffmpeg -i ref.mp4 -vn -c:a libmp3lame ref.mp3`), transcribir con Scribe (§6a) y **copiar su
  estructura** (qué dice cada bloque, duración, dónde entran b-rolls).
- **Duración recomendada para reel de venta UGC: 2:00–3:00 min** (el default apunta a 2:30). Los
  reels muy cortos (15–45s) quedan cortos para "hipnotizar" en venta directa. Formato voz en off
  de ~1:30 es válido si el visual ES el producto/resultado (§4-C).
- ⚠️ **HOOK = LA SOLUCIÓN en los primeros 3 segundos**, nunca el dolor ni el contexto. Arrancá con
  el resultado ya logrado ("esto fue lo que me resolvió X"), y el dolor entra DESPUÉS como
  validación corta. Un buildup de dolor al inicio pierde al espectador.
- Molde **confesional largo** (default para venta directa), con el arranque hook-solución:
  `hook-solución (0-3s) → qué es, ya (3-10s) → dolor como validación corta (10-25s) → dato duro que
  reencuadra el problema [salud / científico / filosófico] (25-45s) → punto de giro "dije basta"
  (45-60s) → solución + cómo funciona en detalle (60-110s) → segundo dato o prueba de volumen
  (110-130s) → objeción destruida (130-150s) → CTA a la oferta (150-170s+)`
- Molde alternativo (**venta directa, 7 pasos**): `HOOK (5s) → RE-HOOK empatía (8s) → dato que
  reencuadra (12s) → "hasta que descubrí X" (10s) → beneficios (20s) → mecánica 1-2-3 en detalle
  (35s) → prueba social + segundo dato (20s) → objeción (15s) → CTA (10s)`.

**Regla "lavador de cerebro":** el guion tiene que hipnotizar hasta el CTA. Para eso se meten
**datos duros (salud / científicos / filosóficos) que reencuadren el problema y el deseo**:
- El dato entra SOLO si suma al ángulo (refuerza el dolor, valida la solución o rompe una
  objeción). Nunca de adorno ni para rellenar.
- Concretos y memorables (un número, un estudio, un mecanismo del cuerpo/mente). Que suenen a
  "verdad que nadie te contó". 1–2 por guion (hasta 3 en uno de 3:00).
- Encadenar en **loop abierto**: cada bloque abre una micro-pregunta que el siguiente responde.
- Dato dudoso o inventado NO se usa (mata la credibilidad). Ante la duda, conocimiento general verificable.

**Regla modular (ahorra créditos):** el cuerpo del guion se genera UNA vez por ángulo; las
variaciones son solo del arranque (hook + re-hook, primeros ~6s). En HeyGen: generás el cuerpo una
vez y N intros cortas, y ensamblás con ffmpeg (concat) — N variaciones al precio de ~1.3 videos.
Cuando un reel vende: 10 variaciones de b-rolls/hook visual sobre el MISMO audio antes de gastar
en guiones nuevos.

## 2. Guion → `guiones/NN-<angulo>.md`

Texto plano hablado, **exactamente** lo que se manda a TTS (sin acotaciones), en el idioma y
registro del mercado del producto (¡no siempre español!). Un ángulo por guion si se hace tanda
(fatiga, escala, FOMO, prueba social, volumen, precio, urgencia…).

**Registro y tono:**
- Español pan-LATAM: neutro "tú", **nunca voseo** (el neutro llega a más público). Voseo solo si el
  público es 100% argentino.
- Venta directa: tono default **agresivo** (hook confrontativo, consecuencias reales, cierre que
  pincha). Confesional suave solo si el molde ganador del nicho lo es.

**Duración → palabras (español, ritmo UGC natural, tras el 1.15x del render):**
| Target       | Palabras | Tras 1.15x queda |
|--------------|----------|------------------|
| 2:00 (mín.)  | 310-340  | ~104s            |
| 2:30         | 390-420  | ~130s            |
| 3:00 (máx.)  | 470-520  | ~157s            |

Contar las palabras ANTES de mandar a TTS. El objetivo es densidad de valor + datos, no aire.

Cada archivo lleva: el script hablado, marcas de b-roll `[BROLL: <clip> @ ~Xs]` (una cada 10-15s),
y el CTA exacto del final.

## 3. Voz → `audios/NN.mp3` (ElevenLabs)

- ⚠️ **Acento nativo del mercado.** La voz tiene que sonar del PAÍS del avatar (guion en voseo =
  acento argentino, no "LATAM neutro"; un neutro leyendo voseo canta a fake). Si la cuenta no tiene
  voz nativa, buscarla en la librería compartida
  (`GET /v1/shared-voices?search=<pais/acento>&gender=female&language=es`) y agregarla
  (`POST /v1/voices/add/{public_owner_id}/{voice_id}` con `{"new_name":"..."}`). (Excepción:
  productos pan-LATAM con guion en "tú" neutro → voz neutra.)
- Listar voces de la cuenta: `curl -s https://api.elevenlabs.io/v1/voices -H "xi-api-key: $ELEVENLABS_API_KEY"`.
  Elegir una acorde al avatar (mujer joven suele rendir en UGC) y guardar el `voice_id` en `config.md`.
- Generar:
```bash
curl -s -X POST "https://api.elevenlabs.io/v1/text-to-speech/<VOICE_ID>?output_format=mp3_44100_128" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" -H "Content-Type: application/json" \
  -d '{"text":"<script>","model_id":"eleven_multilingual_v2","voice_settings":{"stability":0.4,"similarity_boost":0.8,"style":0.35}}' \
  -o audios/NN.mp3
```
- Para más actuación (suspiros, énfasis): `model_id: eleven_v3` con audio tags (`[sighs]`, `[excited]`) — probar en el reel de validación primero.
- **Verificar duración enseguida:** `ffprobe -v quiet -show_entries format=duration -of csv=p=0 audios/NN.mp3`.
  Si se pasa del target +20%, el guion tiene demasiadas palabras → recortar y regenerar ANTES de
  gastar en HeyGen (cada generación cuesta créditos y tarda ~3 min).

## 4. Avatar → `heygen/NN-raw.mp4` (HeyGen)

HeyGen NO genera voz: recibe el audio de ElevenLabs y lo lip-syncea.

**Opción A — Photo Avatar con Avatar IV (preferida): tu propia foto/imagen.**
Mejor una foto del personaje EN SU CONTEXTO (mamá en la cocina, abogado en un podcast, escritorio
con diplomas) que un avatar de stock con fondo blanco. Reusar el mismo avatar entre tandas:
guardar su `talking_photo_id` en `config.md`. Avatar IV anima desde una sola foto la cara Y el
cuerpo (cabeza, manos), controlado por `motion_prompt` + `expressiveness`.
1. Subir la imagen como talking photo:
```bash
curl -s -X POST https://upload.heygen.com/v1/talking_photo -H "X-Api-Key: $HEYGEN_API_KEY" \
  -H "Content-Type: image/jpeg" --data-binary @avatar/NN.jpg
```
   → guardar el `talking_photo_id`. (PNG: `Content-Type: image/png`.)
2. Subir el audio como asset:
```bash
curl -s -X POST https://upload.heygen.com/v1/asset -H "X-Api-Key: $HEYGEN_API_KEY" \
  -H "Content-Type: audio/mpeg" --data-binary @audios/NN.mp3
```
   → guardar el `id` del asset.
3. Generar con la **API v3**:
```bash
curl -s -X POST https://api.heygen.com/v3/videos -H "X-Api-Key: $HEYGEN_API_KEY" \
  -H "Content-Type: application/json" -d '{
  "type":"avatar","title":"reel-NN",
  "avatar_id":"<TALKING_PHOTO_ID>","audio_asset_id":"<ASSET_ID>",
  "engine":{"type":"avatar_iv"},
  "motion_prompt":"hablando a camara con gestos naturales de manos, como en un podcast, movimientos sutiles de cabeza",
  "expressiveness":"medium","aspect_ratio":"9:16","resolution":"1080p"}'
```
   - ⚠️ **`engine` es REQUERIDO y debe ser OBJETO** `{"type":"avatar_iv"}` (como string da
     `invalid_parameter`; sin el campo, devuelve un `resource_not_found` engañoso).
   - `expressiveness`: `medium` de base; `high` para hooks energéticos, `low` para tono serio.
   - Si el plan no soporta 1080p, usar `"resolution":"720p"` y escalar en la edición.
   Requisitos de la foto: cara frontal, ojos abiertos, boca neutra, buena luz, un solo rostro
   nítido, NADA tapando la boca/mandíbula. No pedir "texto legible" en prompts de imagen (la IA lo
   genera gibberish) — texto de fondo desenfocado.

**Opción B — Avatar de stock (si no hay foto):** misma voz, **avatar distinto por reel** (parece
gente distinta = más ángulos de test):
`curl -s https://api.heygen.com/v2/avatars -H "X-Api-Key: $HEYGEN_API_KEY"` → elegir 8-10 estilo
UGC. Endpoint v2 clásico:
```bash
curl -s -X POST https://api.heygen.com/v2/video/generate -H "X-Api-Key: $HEYGEN_API_KEY" \
  -H "Content-Type: application/json" -d '{
  "video_inputs":[{"character":{"type":"avatar","avatar_id":"<AVATAR_ID>","avatar_style":"normal"},
                   "voice":{"type":"audio","audio_asset_id":"<ASSET_ID>"}}],
  "dimension":{"width":1080,"height":1920}}'
```

**Opción C — Voz en off sobre b-rolls (SIN HeyGen):** cuando el visual ES el producto/resultado o
para bajar costo. Cero créditos HeyGen; el "video base" se arma con ffmpeg:
1. Banco de clips (§5) que cubra TODO el audio (15-17 segmentos de 5-8s por reel de ~1:30-2:00).
2. **Video base cinematográfico con `cine-base.mjs`** (NUNCA concat seco). Armar `plan.json`:
```json
{ "T": 0.30, "end": 29.83,
  "cuts": [2.30, 4.00, 5.40],
  "transitions": ["smoothright", "smoothleft", "hblur"],
  "clips": [
    { "src": "C:/.../hero.mp4", "ss": 0 },
    { "src": "C:/.../manzana.mp4", "ss": 1.1 },
    { "src": "C:/.../plano-bajo-escena.mp4", "ss": 0.9, "blur": true },
    { "src": "C:/.../tapa.png", "image": true }
  ] }
```
   - `cuts` = segundos donde se PERCIBE cada cambio de plano (uno menos que `clips`), anclados a
     palabras del Scribe del audio tight. `end` = duración del audio tight.
   - `ss` = desde qué segundo del clip fuente. `"dir": "in"|"out"` opcional (alterna solo).
   - `transitions` opcional (rota una paleta prolija). Nunca `zoomin`.
```bash
node "$MOTOR/scripts/cine-base.mjs" --plan plan.json --out brolls/base.mp4 --audio audios/NN.mp3
```
   El script corta cada clip con el margen justo para que la transición quede CENTRADA en el corte
   (los tiempos del audio y de las escenas no se corren), le da movimiento, encadena las
   transiciones y muxea la voz con la duración exacta.
3. Ese mp4 entra a §6b como `--video` (sin tighten.mjs: los silencios ya se cortaron en el mp3).

**Poll y descarga (A y B):**
```bash
curl -s "https://api.heygen.com/v1/video_status.get?video_id=<ID>" -H "X-Api-Key: $HEYGEN_API_KEY"
```
Cada 30-60s hasta `completed` → descargar `video_url` enseguida (el link expira). Verificar con
ffprobe que la duración ≈ la del audio (±1s).

## 5. Banco de b-rolls → `brolls/` (compartido entre reels)

**Prioridad: b-rolls que NO gastan créditos** (capturas del producto/landing animadas con ffmpeg,
clips reales) — además son los que más convierten.
- Cantidad: alcanzar para **6-10 apoyos visuales por reel** (regla de densidad §6b) — mejor 8-12
  clips variados que 4.
- **Stock real GRATIS (Pexels/Pixabay) — probar ANTES de generar con IA.** B-roll real se ve más
  auténtico que el genérico IA y cuesta $0. **PROHIBIDO material rippeado de marcas ajenas**
  (ads de competidores) = riesgo copyright/rechazo de Meta.
- **Ken Burns de stills (gratis):** cualquier imagen fija → clip con zoom-pan:
  `ffmpeg -loop 1 -i still.jpg -vf "zoompan=z='min(zoom+0.0015,1.15)':d=150:s=1080x1920:fps=30" -t 5 -pix_fmt yuv420p kb-<nombre>.mp4`.
- **Auténticos del producto:** páginas del ebook o la landing (capturas animadas con zoom lento) —
  los que más convierten: incluir al menos 2.
- **Escenas animadas Remotion (cero costo):** si para un momento no hay b-roll útil, o la idea se
  comunica mejor con motion graphics (números, antes/después, beneficios, prueba social), usar una
  escena animada (§6b) en vez de un clip.
- Normalizar todos a 9:16:
  `ffmpeg -i in.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30" -an brolls/<nombre>.mp4`

## 6. Edición con Remotion — el corazón de la skill

El motor es la composición **`Reel`** de `$MOTOR` (`src/reels/`). En un solo render hace lo que
antes eran 3 pasadas de ffmpeg: video base acelerado (pitch corregido), zoom lento, b-rolls
(fullscreen o pip, con transiciones), **captions karaoke** con keywords estilo TikTok (UTF-8: las
tildes salen bien en Windows), titular de hook, punch-zooms, barra de progreso, grade sutil, SFX y
música. Todo se controla con un JSON de props por reel. ffmpeg queda solo para normalizar clips.

**Convención de tiempos:** todos los tiempos de los props van en segundos del timeline ORIGINAL
del audio (sin acelerar) — la composición divide por `speed` internamente. **Velocidad: 1.15x
(default de make-props).** El speed ya está en el render: NUNCA correr atempo/setpts después.

### 6a. Transcripción con timestamps por palabra
```bash
curl -s https://api.elevenlabs.io/v1/speech-to-text -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F model_id=scribe_v1 -F file=@audios/NN.mp3 > captions/NN.json
```

### 6a-bis. Jumpcut: comerse los silencios (⚠️ INDISPENSABLE — nunca saltearlo)
El TTS mete pausas entre oraciones; sin jumpcut el reel queda con huecos. Aplica a los dos formatos:
- **Reel con avatar HeyGen** → `tighten.mjs` sobre el video:
```bash
node "$MOTOR/scripts/tighten.mjs" \
  --video heygen/NN-raw.mp4 --scribe captions/NN.json \
  --out-video heygen/NN-tight.mp4 --out-scribe captions/NN-tight.json \
  [--keep-pad 0.12] [--min-silence 0.30] [--noise -35]
```
  Corta video+audio en sincro (los cortes caen SOLO en silencio, boca quieta → el lip-sync no se
  rompe) y **remapea los timestamps** de las palabras (sin re-transcribir). Baja ~15-20% la
  duración. `--keep-pad`: silencio que se deja por hueco (`0.12` respiro natural; `0.06` más seco).
  De acá en más se usan **`NN-tight.mp4` y `NN-tight.json`**.
  - **Punch-zoom automático:** deja un sidecar `NN-tight.cuts.json`; make-props lo autodetecta y
    empuja un zoom alternado en cada corte para que el salto se lea como edición y no como glitch.
  - ⚠️ Si tighten cortó **>20 huecos**, re-encodear con keyframes densos antes de renderizar:
    `ffmpeg -i heygen/NN-tight.mp4 -c:v libx264 -g 15 -keyint_min 15 -c:a copy heygen/NN-tight-k.mp4`
    (el concat de muchos trims deja keyframes escasos y el render muere por timeout).
- **Reel de voz en off (sin avatar)** → cortar por **word-gaps del Scribe, NO por decibeles** (el
  `silenceremove` por dB no agarra el piso de ruido del TTS):
  1. Audio raw (`NN-raw.mp3`) → Scribe del raw (`captions/NN-raw.json`).
  2. `node "$MOTOR/scripts/trim-audio-gaps.mjs" audios/NN-raw.mp3 captions/NN-raw.json audios/NN.mp3 0.20 0.06`
     (comprime toda pausa >0.20s a 0.12s; baja ~10-20%).
  3. **Re-transcribir el audio cortado** (`Scribe de NN.mp3 → captions/NN.json`) — los timestamps
     cambiaron; props/captions usan ESTE.
  4. Armar el video base con `audios/NN.mp3`. ⚠️ NO usar `tighten.mjs` sobre un concat `-c copy`
     (los PTS quedan inconsistentes y lo destroza).

### 6b. Props del reel (copia assets + escribe JSON)
Usar los archivos *tight* si se hizo jumpcut:
```bash
node "$MOTOR/scripts/make-props.mjs" --slug <proyecto>-NN \
  --video heygen/NN-tight.mp4 --scribe captions/NN-tight.json \
  --broll "brolls/b1.mp4@palabra:sistema:2.5" --broll "brolls/b2.mp4@<segundos>:2.5:whip" \
  --broll "brolls/captura-landing.mp4@palabra:<cta>:3:pip" \
  --hook "PROMESA EN 5-8 PALABRAS|parte resaltada" \
  --zoom-hit "palabra:basta" --impact "palabra:<dato>" \
  --keyword "<dolor>" --keyword "<beneficio>:✅" \
  --intro-sfx riser [--music assets/music.mp3] [--color "#E8372A"]
```
- Copia los assets a `$MOTOR/public/reels/<slug>/` y escribe `$MOTOR/props/<slug>.json`.
- `--speed`: default **1.15** (solo pasarlo para override puntual).
- Formato `--broll`: `ruta@START[:dur[:startFrom]][:pip][:cut|whip|slide]` (dur default 2.5s).
  **`START` puede ser número (seg) o `palabra:<texto>`** — con `palabra:` clava el b-roll cuando se
  dice esa palabra (más robusto que hardcodear el segundo, se re-ajusta solo si cambia el timing).
- `--color`: color de marca para la palabra activa del karaoke (default `#E8372A`).

**Kit de retención** (todo anclable por `palabra:`):
- `--hook "TEXTO[|resaltado]"` — titular grande sobre el avatar en los primeros ~3s. Ponerlo
  SIEMPRE (el 80% decide en el hook). JSON: `hookTitle {text, highlight?, start?, duration?, y?}`.
- `--zoom-hit "palabra:X[:amount]"` — punch de cámara estilo Hormozi (empuja y vuelve, sin sonido).
  1-3 por reel: el "dije basta", el número del dato, el nombre del método.
- `--impact "palabra:X[:sfx]"` — micro-shake + pulso de zoom + SFX para EL dato duro. 1 por reel
  (máx. 2). No ponerlo dentro de un b-roll fullscreen (el golpe queda tapado).
- `--keyword "palabra[:emoji]"` — esa palabra SIEMPRE en amarillo y más grande en el karaoke. 3-6
  por reel: dolores, "gratis", el método. Los números con cifra se resaltan solos.
- **Barra de progreso:** APAGADA por defecto (Estándar Imperio). `--progress` la prende.
- **Grade** (contraste+saturación+viñeta suave, saca lo "plano IA" del HeyGen): ON por defecto
  (`--no-grade` si el material ya viene editado).

**B-rolls — pip y transiciones:**
- `pip`: ventana flotante redondeada SOBRE el avatar (la boca sigue visible = sigue "hablando").
  Para las capturas que convierten: landing, producto, prueba social. `pipY` en el JSON si tapa los ojos.
- Transición: `fade` (default), `whip` (barrido con blur, SFX `swoosh`), `slide` (sube), `cut`
  (corte seco, pega con jumpcut). El SFX default se adapta (pip=`pop`).
- **Música** (SIEMPRE): track sin copyright de Pixabay en `assets/music.mp3`. `make-props` mide
  música y voz y deja la música **8 dB bajo la voz** (se escucha clara y no tapa). `--music-vol N`
  solo para pisar el cálculo. Nunca créditos en pantalla.
- **Badges** (pill animada): editar el JSON → `"badges":[{"text":"HOY 50% OFF","start":38,"duration":6,"y":20}]`.

**Escenas animadas** (ocupan el lugar de un b-roll, pantalla completa con fade). Editar el JSON:
```json
"scenes": [{"name":"checklist","start":15,"duration":4,"props":{"title":"Lo que te llevás","items":["40 prompts guiados","6 asistentes listos"]}}]
```
Stock (registro en `$MOTOR/src/reels/scenes/registry.tsx`):
| name | props | para qué |
|------|-------|----------|
| `checklist` | `{title?, items[]}` | beneficios / pasos del mecanismo con tildes animadas |
| `chat` | `{messages:[{text, side:"in"\|"out", sfx?}]}` | prueba social estilo WhatsApp |
| `barras` | `{title?, bars:[{label,value}], suffix?}` | comparación antes/después con barras creciendo |
| `titular` | `{kicker?, headline, highlight?}` | nota de diario con resaltador de marca |
| `stat` | `{value, prefix?, suffix?, label}` | número gigante contando. ⚠️ prefix/value/suffix concatenan SIN espacios (pensado para `$`/`%`) |
| `bundle` | `{bg, kickerSmall?, kicker?, kickerAt?, hero, items[], cta?}` | **cierre con producto + bonos** que entran deslizándose y se acomodan (ver abajo) |

Las escenas van por defecto sobre el video de abajo **desenfocado** (nunca negro liso). Para un
fondo opaco propio: `"bg": "#07070A"` en la escena.

**Escena `bundle` — el cierre con producto y bonos** (estilo de los anuncios ganadores):
```json
{"name":"bundle","start":20.85,"duration":8.98,"bg":"#07070A","sfx":false,"props":{
  "bg":"reels/<slug>/fondo.png","kickerSmall":"INCLUYE","kicker":"3 BONOS DE REGALO","kickerAt":0.85,
  "hero":{"src":"reels/<slug>/mk-producto.png","aspect":0.996,
          "big":{"x":140,"y":500,"w":800},"slot":{"x":120,"y":400,"w":560},"moveAt":2.03,"rot":-2},
  "items":[
    {"src":"reels/<slug>/mk-bono1.png","aspect":0.658,"at":2.03,"from":"right","slot":{"x":650,"y":790,"w":330},"rot":3},
    {"src":"reels/<slug>/mk-bono2.png","aspect":0.796,"at":3.23,"from":"left","slot":{"x":50,"y":815,"w":380},"rot":-4},
    {"src":"reels/<slug>/mk-bono3.png","aspect":0.637,"at":4.57,"from":"top","slot":{"x":715,"y":420,"w":310},"rot":5}],
  "cta":{"at":6.15,"button":"Ver todo lo que incluye","sub":"Acceso inmediato"}}}
```
- `start` = cuando la voz empieza a hablar de los bonos; `duration` = hasta el final del video.
- `at`, `moveAt`, `kickerAt`, `cta.at` van en segundos LOCALES a la escena (= segundo de la palabra − `start`).
  Cada bono entra en la palabra que lo nombra; `moveAt` = cuando entra el primer bono.
- `hero.big` = cómo entra el producto, solo y grande; `slot` = dónde queda cuando llegan los bonos.
  `from: "top"` queda DETRÁS del producto ("aparece arriba"); `left`/`right` quedan adelante.
- `bg` = la tapa de un bono o una foto del producto: se desenfoca y oscurece sola.
- **Mockups:** copiarlos a `$MOTOR/public/reels/<slug>/` preparados con
  `python -I "$MOTOR/scripts/prep-mockup.py" Mockup.png "$MOTOR/public/reels/<slug>/mk-x.png" [--solid]`
  (recorta el margen e imprime el `aspect`; `--solid` si trae una sombra larga). Necesita Python con
  Pillow; si no hay, usar el PNG tal cual y calcular `aspect` = ancho/alto.
- Layout probado para 1080x1920: titular en y≈232, pack entre y≈330 y 1300, CTA en 1336. Nada debajo
  de ~1500 (ahí está la UI de Meta).
- Si la escena trae `cta`, **no** usar `ctaCard`, y borrar del JSON (`words`) las palabras desde el
  CTA para que el subtítulo no se duplique con el botón.
- SFX: un `whoosh` en la entrada de cada bono (`--sfx-cue "palabra:X:whoosh"`), un `sparkle` en el titular.
- Validar con 5 stills: producto solo, primer bono entrando (tiene que verse el desenfoque de
  movimiento), segundo, tercero y el cierre con el CTA.

Si ninguna encaja, **crear una a medida**: componente en `$MOTOR/src/reels/scenes/` cumpliendo el
contrato `SceneComponent` de `scenes/types.ts` (recibe `durationInFrames`, `color`, `props`),
registrarlo en `registry.tsx` y validar con still. Reglas: springs para entradas, stagger para
listas, todo determinista por frame (NUNCA CSS transitions), texto ≥42px, fuente `SCENE_FONT`.

**Overlays de conversión** (van SOBRE el avatar — elegir `y` para no tapar la cara, validar con still):
- `"priceTag": {"oldPrice":"$47","newPrice":"$19","start":32,"duration":5,"y":30}` — precio tachado → nuevo con pop
- `"counter": {"prefix":"QUEDAN","from":100,"to":23,"suffix":"CUPOS","start":38,"duration":5,"y":24}` — contador de urgencia
- `"ctaCard": {"text":"Acceso inmediato","buttonText":"Ver todo lo que incluye","start":43}` — CTA minimalista (línea chica + píldora blanca con flecha), últimos 3-5 s. `y` default 72 (donde van los subtítulos, que se apagan solos al entrar el CTA). Si el cierre es una escena `bundle`, el CTA va adentro de la escena y no se usa `ctaCard`.

**Efectos de sonido (SFX)** — ON por defecto (`"sfx": true`), volumen master `"sfxVolume": 0.7`
(bajo la voz). Suenan solos en las entradas: b-roll→`sweep` (whip→`swoosh`, pip→`pop`),
escena→`whoosh`, precio/contador/badge→`pop`, CTA→`windSwoosh`. **Las transiciones ROTAN solas**
(dos cortes seguidos nunca suenan igual). Biblioteca en `$MOTOR/public/assets/sfx/` (registro en
`src/reels/Sfx.tsx`). Paleta completa:
- **Transiciones:** `sweep sweep2 whoosh whoosh2 whoosh3 swoosh windSwoosh` · `swoosh2` (reveal largo) · `rewind` (recap)
- **UI / aparición:** `pop pop2 pop3 click doubleClick` · `typewriter`
- **💰 Dinero / precio (clave infoproductos):** `cash` · `cashWin` · `coins` · `priceReveal` — poné uno EN EL FRAME DEL PRECIO/OFERTA.
- **Notificación / chat:** `msgIn`/`bubble` · `notify`
- **Sparkle / win / garantía:** `sparkle` · `fairy` · `success` · `correct` · `bells`
- **Tonales / error:** `wrong` (golpe de dolor) · `laugh`
- **Cinematográficos / golpes:** `riser impact impactIntro` · `boom` · `hit` · `heartbeat` (2 latidos bajo un dato)

Overrides: cualquier b-roll/escena acepta `"sfx": "<nombre>"` (o `"sfx": false` para mudo). Además:
- `--intro-sfx riser` — sonido al arranque (tensión bajo el hook). Ponerlo SIEMPRE.
- `--sfx-cue "palabra:X:nombre"` — sonido suelto anclado a palabra, sin visual (remates: `wrong` en
  el golpe de dolor, `success` en el win, `bells` en la garantía, `cash`/`priceReveal` en el precio).
- **Regla de densidad:** en un reel de 2-3 min → sonido en CADA transición + intro riser + 2
  impactos + 2-3 cues tonales + **1 sonido de dinero en el frame del precio** + windSwoosh del CTA
  (~15-20 eventos en 2 min). Siempre BAJO la voz. Reel mudo: `"sfx": false` global.

**Regla de densidad de b-rolls:** un apoyo visual cada 10-15s → **6-10 b-rolls/escenas** en 2-3
min (no 2-4). Sin huecos de más de ~20s de avatar solo (ahí va un zoom-hit o impacto). Variar
transiciones y usar pip para las capturas de prueba.

### 6c. Validar con stills ANTES de renderizar (rápido y gratis)
```bash
cd "$MOTOR"
npx remotion still Reel check.png --frame=<F> --props=props/<slug>.json
```
Renderizar 3-4 stills y MIRARLOS: uno del hook (que el titular no tape los ojos), uno con caption
activa (tildes, color, keywords), uno dentro de un b-roll (si hay pip: que no tape la boca), uno
del CTA. `Frame = (segundos_originales / speed) * 30`. **El frame no puede pasar de
`duración_final_seg × 30`.**

**Zonas seguras de Meta/redes:** la UI tapa arriba (~12%), abajo (~22%: caption/CTA) y derecha
(~12%: botones). Nada importante debe caer ahí (defaults ya seguros, `captionsY: 68`). Para
validar, agregar `"debugSafeZones": true` al JSON y renderizar un still (pinta las zonas); sacar el
flag antes del render final.

### 6d. Render final
```bash
npx remotion render Reel <ruta>/edited/NN-<angulo>-FINAL.mp4 --props=props/<slug>.json
```
Sale h264 1080x1920 30fps con la duración ya acelerada. Tarda unos minutos por reel — correrlo en
background si hay más trabajo. **Capturar SIEMPRE el log completo (`> render.log 2>&1`), nunca
`| tail`** — si el render muere, el error real queda arriba.

**Masterizado (SIEMPRE, último paso):** llevar el audio a −12 LUFS sin tocar la imagen.
```bash
ffmpeg -i edited/NN-raw.mp4 -c:v copy -af "loudnorm=I=-12:TP=-1.0:LRA=7" -c:a aac -b:a 192k -ar 48000 edited/NN-<angulo>-FINAL.mp4
```
Renderizar a `NN-raw.mp4`, masterizar al FINAL y borrar el raw.

### 6e. QA y batch
```bash
node "$MOTOR/scripts/verify.mjs" --video edited/NN-<angulo>-FINAL.mp4 [--expect-duration 30]
```
Chequea 1080x1920, audio presente, duración y extrae 3 frames (exit 1 si falla → corta el batch).
- **El reel dura lo que dura el audio — NUNCA cortarlo para llegar a un target.** Si quedó largo,
  el guion tenía demasiadas palabras: recortar el guion y regenerar el audio (§3).
- **Reel 01 primero:** correr 6a-6d + verify, mostrárselo al usuario y esperar el OK. Con el OK,
  correr los demás en batch (los props quedan en `$MOTOR/props/`, los assets en
  `$MOTOR/public/reels/` — se pueden borrar después del render).
- Si Remotion falla y no se arregla rápido: fallback de 3 pasadas de ffmpeg en `ffmpeg-fallback.md`.

## 7. Variaciones y formato Kinetic (mismo audio, cero créditos)

- **Variaciones visuales:** cuando un reel vende, duplicar el props JSON y cambiar solo
  `brolls`/`scenes`/`badges`/overlays/`highlightColor` → re-render, sin tocar ElevenLabs ni HeyGen.
- **Kinetic (texto animado + voz, SIN avatar):** ad de kinetic typography, cero HeyGen:
```bash
node "$MOTOR/scripts/make-props.mjs" --kinetic --slug <proyecto>-NN-kinetic \
  --audio audios/NN.mp3 --scribe captions/NN.json [--bg "#0B0B0F"] [--color "#E8372A"]
npx remotion render Kinetic edited/NN-<angulo>-KINETIC.mp4 --props=props/<slug>.json
```
  Acepta los mismos overlays de conversión (`priceTag`/`counter`/`ctaCard`) en el JSON.

## 8. Cerrar
Anotar en `config.md` qué molde, voz, avatar y ajustes se usaron (hace repetible la próxima tanda)
y dejar los reels finales en `edited/`.
