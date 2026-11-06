# Config del reel — plantilla

Esta es tu carpeta de trabajo. Un reel = una carpeta como esta. Acá se anotan los IDs y ajustes
para reusarlos en la próxima tanda (así no volvés a crear el avatar ni buscar la voz).

## Subcarpetas
- `guiones/` — el texto hablado (lo que se manda a TTS)
- `audios/` — las voces de ElevenLabs (NN.mp3)
- `avatar/` — tu foto para el Photo Avatar de HeyGen
- `heygen/` — los videos de avatar (NN-raw.mp4, NN-tight.mp4)
- `brolls/` — tus b-rolls normalizados a 9:16 (hay 3 de ejemplo de Pexels)
- `captions/` — transcripciones con timestamps (NN.json)
- `assets/` — música de fondo (music.mp3), opcional
- `edited/` — acá salen los reels finales

## Datos a guardar (completar a medida que trabajás)
- **voice_id (ElevenLabs):** ...
- **talking_photo_id (HeyGen):** ...
- **color de marca:** #E8372A
- **velocidad:** 1.15 (default)
- **música:** archivo + de dónde salió (ElevenLabs Music, o link de Pixabay). Nunca créditos en pantalla.
- **mockups:** rutas de los `Mockup*.png` del producto y de cada bono (para la escena `bundle`)
- **notas:** ...

## B-rolls
Los 3 `ejemplo-N.mp4` son stock libre de Pexels para que pruebes el pipeline. Para los tuyos:
bajá gratis de **Pexels/Pixabay**, o hacé capturas de tu producto/landing, y normalizalos a 9:16:
`ffmpeg -i in.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30" -an brolls/nombre.mp4`
NUNCA uses ads rippeados de otros (copyright / rechazo de Meta).
