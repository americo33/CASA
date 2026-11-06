# Prepara un mockup PNG para la escena "bundle":
#   - recorta el margen transparente (para poder posicionarlo con precisión)
#   - con --solid recorta SOLO el objeto, sin la sombra larga semitransparente
#     (la sombra la pone la escena con CSS)
#   - lo achica a 1400 px de lado máximo
# Imprime el "aspect" (ancho/alto) que va en el props JSON.
#
# El mockup tiene que venir con FONDO TRANSPARENTE. Si viene con fondo pegado,
# recortarlo antes (Higgsfield: media_upload -> remove_background).
#
# Uso: python -I scripts/prep-mockup.py entrada.png salida.png [--solid]
import sys
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
solid = "--solid" in sys.argv
im = Image.open(src).convert("RGBA")
thr = 200 if solid else 8
bb = im.getchannel("A").point(lambda v: 255 if v > thr else 0).getbbox()
if bb is None:
    sys.exit("El PNG no tiene nada visible (¿todo transparente?)")
pad = 20 if solid else 0
bb = (max(bb[0] - pad, 0), max(bb[1] - pad, 0), min(bb[2] + pad, im.width), min(bb[3] + pad, im.height))
im = im.crop(bb)
im.thumbnail((1400, 1400), Image.LANCZOS)
im.save(dst, optimize=True)
print(f"{dst}  {im.size[0]}x{im.size[1]}  aspect={im.size[0] / im.size[1]:.3f}")
