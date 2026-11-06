---
name: imperioreelscorto
description: Arma anuncios verticales de venta directa para Meta con parámetros medidos sobre anuncios que ya facturaron. Tres perfiles — A corto (15-22s, producto físico, cierre con landing), B TESTEO 1 (30-37s, formación, captions karaoke blanco/gris, audio sin silencios, sin placa) y C híbrido (esqueleto validado corto + terminación de B). Incluye minado de fuentes 4K propias a biblioteca de b-rolls, elección de voz por ritmo, control de velocidad y masterizado a −12 LUFS. Edita con el Estándar Imperio (elegante, minimalista, fluido). Usar cuando el usuario dice "imperioreelscorto" o pide "un reel corto", "un anuncio corto", "un ad para Meta", "otro ángulo", "variaciones", o cuando pasa clips y quiere que se los edite. Complementa a la skill imperioreels (formatos largos y cierres con pack de producto).
---

# Imperio Reels Corto — anuncios de venta directa con perfiles medidos

> **🔴 Antes de cualquier otra cosa:** si la sesión NO está corriendo en **Opus 5.5**, lo PRIMERO
> es preguntarle al usuario si quiere pasar a Opus 5.5 (se cambia desde el selector de modelo de
> la app). Una sola pregunta; si ya está en Opus 5.5, no preguntar.

> **⭐ Estándar Imperio de edición:** esta skill aplica el estándar completo de `imperioreels`
> (leer su sección *Estándar Imperio*): video base con `cine-base.mjs` y transiciones, escenas
> nunca sobre negro, CTA minimalista, cierre con mockups reales en la escena `bundle`, música
> sin copyright que se escuche, sin barra de progreso y masterizado a −12 LUFS. Cuando un perfil
> de acá dice algo distinto (por ejemplo B: sin placa final), manda el perfil.

Convierte un ángulo de venta en un anuncio vertical listo para Meta. Los números **no son
criterio estético**: salen de medir anuncios que ya facturaron.

> **Las dos reglas de oro**
>
> 1. **El material manda sobre el guion.** Verificar qué tomas existen ANTES de escribir. Un
>    guion que nombra un objeto que no está en pantalla es un anuncio roto, y no se arregla
>    editando: hay que regenerar la voz. Ver §1.
> 2. **Validar con stills antes de renderizar.** Un still tarda segundos, un render tarda
>    minutos. Los errores más caros se cazan mirando 3 stills.

---

## 0. Elegir perfil ANTES de escribir el guion

Los tres comparten el pipeline (material → guion → voz → jumpcut → tomas → props → render).
Cambian los números, el estilo de captions y el cierre. **Preguntar cuál usar si no está claro.**

| | **A — corto** | **B — TESTEO 1** | **C — híbrido** |
|---|---|---|---|
| Para qué | Producto físico, oferta directa | Venta de formación / infoproducto | Variar un ganador corto ya validado |
| Duración | **15-22s** (objetivo 17s) | **30-37s** (objetivo 33s) | **15-20s** |
| Palabras | **55-70** | **95-110** | **45-55** |
| Estructura | 4 bloques | 6 tiempos | 5 bloques del ganador |
| Planos | ~8-10 · medio **2s** | **18-34** · medio **0,9-1,8s** | **10-14** · medio **1,4s** |
| Captions | `pop` | `karaoke` | `karaoke` |
| `--captions-y` | 72 (centro) | 32 (borde superior) | 32 |
| `--speed` | 1.15 | **1.0** (ver §5) | 1.0 – 1.2 |
| Cierre | Landing deslizándose 3,8s | **Sin placa** | Landing 3,3s |
| Música | 10%, fade out 3,4s | 10%, entra a los 8-18s | 10%, entra a los 2-6s |

### De dónde sale cada perfil
- **A:** promedio de 16,7s medido sobre 10 anuncios reales de producto físico.
- **B:** desarme cuadro a cuadro de 5 anuncios ganadores de un infoproducto de manualidades: detección
  de cortes, muestreo de píxeles en los captions, medición EBU R128.
- **C:** producido sobre un anuncio ganador validado de un ebook de manualidades. Nace de una
  regla: **cuando variás un ganador, se conserva su esqueleto y su largo.** Estirar un guion de
  49 palabras a 33 segundos rompe justo lo que lo hizo ganar (una sola idea). Lo que sí se
  actualiza es la terminación: captions karaoke y audio masterizado.

---

## 0-bis. Reglas de montaje (valen para los tres)

- **Cortes 100% secos.** Cero disolvencias, cortinillas, zooms de transición o desenfoques. En
  los 5 anuncios ganadores no hay **ni una sola** transición en 163 segundos.
- **El caption NO se corta con la imagen.** Una misma frase se sostiene fija mientras abajo
  cambian dos o tres planos. Imagen y texto corren en pistas independientes: eso evita que el
  corte rápido se lea como caótico. **Nunca sincronizar caption con cambio de plano.**
- **Racimo rápido en el medio.** Ráfaga de 0,13 a 0,4s donde se muestran los resultados
  terminados. Funciona como catálogo comprimido.
- **Ningún plano pasa de 5s.** El más largo medido fue 4,88s.
- **Sin SFX en los cortes.** Se buscaron transitorios alineados a los cambios de plano y no
  existen. El montaje es rápido; el audio no lo subraya.
- **Cenital, manos, sin cara.** En los 5 ganadores no aparece un solo rostro.

---

## 1. Material PRIMERO, guion DESPUÉS

Este orden no es una preferencia: se invirtió dos veces y las dos veces salió mal.

- Se escribió un guion sobre **mates** y después se descubrió que no existe ninguna toma del
  mate saliendo marmolado: solo entrando. Guion tirado, voz regenerada.
- Se escribió *"este reloj y este plato"* y en pantalla había botellas de pintura y discos
  **sin pintar**. **El plato terminado no existía en todo el banco.** Anuncio entregado roto y
  corregido después.

**Regla dura: no nombrar un objeto que no esté verificado en pantalla.** Si el material no lo
sostiene, se cambia el guion — no se estira la interpretación de la imagen.

### 1a. Filtro obligatorio: nada identificable

Revisar **el clip entero**, no el primer cuadro: la cámara se mueve y una marca puede entrar a
mitad de toma.

**Descartar o recortar si aparece:** personas, caras o torsos · marcas, logos, watermarks o
URLs · subtítulos quemados de otro video · patentes · datos personales.
**Solo se ve:** las manos (o guantes) y el objeto.

Casos reales encontrados, para saber qué buscar:

| Qué apareció | Dónde |
|---|---|
| Marca de agua de **TikTok** + @usuario de otro creador | clips sueltos y sets ya usados en producciones viejas |
| Logo de **otra empresa** | sobre el final del clip, invisible en el primer cuadro |
| Cartel con el **dominio de otra marca** de fondo | en todo el metraje, más una cara |
| **Torso** con camisa visible arriba del cuadro | el objeto estaba bien; la persona entraba por el borde |
| Overlay **"$2.000"** del anuncio original | texto grande que el recorte no saca |
| Placas finales del anuncio fuente | siempre en los últimos 3-4s |

⚠️ **Compliance de producto.** Además del filtro visual, respetar lo que el producto prohíbe.
Ejemplo: si el ebook **prohíbe usar la técnica sobre cierto objeto** (por seguridad), toda toma
de ese objeto queda fuera aunque sea limpia. Revisar el `config.md` del proyecto antes de elegir tomas.

### 1b. Verificar de a UN clip, nunca por grilla

Leer una grilla de contactos de 50+ clips y mapear posición → nombre de archivo **falla**. Se
hizo dos veces y las dos veces se identificó mal el clip.

- ✅ **Un frame, un clip, mirado solo**, cuando la decisión importa (el plano del hook, el que
  nombra un objeto).
- ✅ Grillas sí, pero solo para **descartar en bloque** (ver qué tiene marca de agua, qué es
  placa) — nunca para elegir el plano que va a sostener una frase.
- ✅ Si igual se usa una fila de 6, **enunciar el orden explícitamente** antes de mirarla y
  contar de izquierda a derecha con cuidado.

### 1c. Minar fuentes propias 4K a una biblioteca

Los anuncios ya publicados del propio cliente son la mejor fuente: material propio, sin riesgo
de copyright, en 4K. Este flujo convierte 10 anuncios en una biblioteca de ~50 planos limpios.

```bash
LIB="<proyecto>/B-Rolls/LIB"; mkdir -p "$LIB"
CROP="crop=1339:2380:410:0"        # ver §1d: medir antes

for f in "ADS"/*.mp4; do
  n=$(basename "$f" .mp4)
  DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$f")
  CUTS=$(ffmpeg -nostdin -hide_banner -nostats -i "$f" \
        -filter_complex "select='gt(scene,0.30)',showinfo" -an -f null - 2>&1 \
        | grep -oE "pts_time:[0-9.]+" | sed 's/pts_time://' | tr '\n' ' ')
  prev=0; i=0
  for t in $CUTS $DUR; do
    len=$(awk "BEGIN{printf \"%.2f\", $t-$prev}")
    # ≥0,7s y que no caiga en la placa final (últimos 3,5s)
    keep=$(awk "BEGIN{print ($len>=0.7 && $prev<$DUR-3.5)?1:0}")
    if [ "$keep" = "1" ]; then
      i=$((i+1)); d=$(awk "BEGIN{print ($len>3.0)?3.0:$len}")
      ffmpeg -nostdin -hide_banner -loglevel error -y -ss "$prev" -i "$f" -t "$d" \
        -vf "$CROP,scale=1080:1920,fps=30" -an \
        -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
        "$LIB/$n-$(printf '%02d' $i).mp4"
    fi
    prev=$t
  done
done
```

Después **cull manual**: una grilla para descartar placas, caras y overlays (§1b), y escribir
un `CATALOGO.md` en `LIB/` agrupando por familia de objeto. Ese catálogo es lo que hace rápida
la próxima tanda.

⚠️ **Una fuente larga no vale por ser larga.** Un archivo de 13,7 minutos parecía la mina del
banco y resultó ser una grabación de pantalla de una persona hablando al micrófono, con marca
de agua. Escanearla antes de contar con ella.

### 1d. El recorte de subtítulos quemados

Un anuncio propio de 2160x3840 tiene el doble de resolución de la que necesita el reel. Esa
mitad que sobra se usa para **recortar la franja de subtítulos** sin perder calidad.

**Medir primero dónde caen**, no asumir:

```bash
ffmpeg -ss 8 -i fuente.mp4 -frames:v 1 -vf "scale=540:-1" -y probe.png   # y mirarlo
```

Recortes ya medidos:
```bash
CROP_ABAJO="crop=1339:2380:410:0"    # subtítulos al 65-70% -> me quedo el 62% de arriba
CROP_ARRIBA="crop=1685:2995:237:845" # subtítulos arriba -> me quedo del 22% para abajo
```

El recorte cierra el encuadre (queda más cerrado que el original). En la práctica **lee mejor**
para producto, pero conviene elegir ventanas donde el objeto esté en la mitad superior.

Para fuentes **más chicas que 1080x1920**, agregar `unsharp=5:5:0.7`. Avisar al usuario: por
debajo de 720x1280 se nota blando y en un anuncio pago eso lee como "barato".

---

## 2. Guion

- **Registro: el del mercado.** Voseo para Argentina, "tú" para pan-LATAM. El neutro llega a
  más gente pero suena a doblaje cuando el producto es local.
- **Un ángulo por reel.** Ángulos que rinden: mecanismo, objeción, volumen, velocidad, regalo.
- Guardar en `guiones/NN-<angulo>.md`: script hablado limpio (sin acotaciones) + plan visual.

### Perfil A — 4 bloques para 17s
`hook = el resultado ya logrado (0-3s) → qué es (3-8s) → cómo/prueba (8-13s) → cierre (13-17s)`

El hook es **la solución, nunca el dolor**. Arrancar con el resultado ("esto entró blanco y
salió así"), no con el problema.

### Perfil B — 6 tiempos para 33s

| # | Tiempo | Qué hace | Ejemplo medido |
|---|---|---|---|
| 1 | 0-3s | **Imperativo que frena el pulgar.** Verbo en modo orden en la PRIMERA palabra, antes de cualquier contexto. Nunca una pregunta, nunca una presentación. | "Pará" · "Escuchame" · "Mirá esto" |
| 2 | 3-9s | **Reencuadre.** Un objeto que la persona ya tiene y considera sin valor, renombrado como materia prima. | "Lo que para el resto es basura… es tu próximo producto estrella" |
| 3 | 9-13s | **Negación de categoría.** Negarle al oficio su etiqueta menor y subirlo de estatus. | "El [oficio] no es manualidades, es ingeniería simple" |
| 4 | 13-22s | **Prueba visual + aritmética.** Acá va el racimo de cortes. La cuenta en dos frases separadas. | "El costo del material: cero. El valor de venta: altísimo." |
| 5 | 22-28s | **Derribo de la objeción.** Nombrar la excusa que ya está pensando y desarmarla. | "Dejá de pensar que necesitás máquinas importadas" |
| 6 | 28-33s | **Llamado con riesgo cero.** Instrucción física + frase que elimina la barrera. | "Tocá abajo y aprendé a crear valor con cero inversión" |

> Ojo con el tiempo 1: el Perfil A dice "arrancar con el resultado" y el B arranca con un
> **imperativo seco** que no es ni resultado ni dolor. Los dos funcionan; son hooks distintos.
> No mezclarlos en el mismo guion.

### Perfil C — 5 bloques del ganador (~49 palabras)

Molde extraído del anuncio con mejor CPA. **Una sola idea, nada más.**

```
1. HOOK: la transformación, visual, inmediata
2. MECÁNICA COMO VENTAJA: no se puede repetir
3. REMATE EMOCIONAL: única en el mundo
4. EL USO: el regalo que nadie más tiene
5. CTA CONDICIONADO: "si buscás X, tocá el link"
```

**NO menciona:** cómo funciona, materiales, precio, nombre del producto, cuántos estilos.

Al hacer variantes, **cambiar el hook, no solo el objeto.** Cuatro variantes del mismo molde:

| variante | hook |
|---|---|
| comparativo | "Mirá estos dos X. Salieron del mismo balde y no se parecen en nada." |
| resultado primero | "Esta X entró lisa y salió así." |
| temporal | "Este X era blanco hace tres segundos." |
| proceso | "Mirá cómo sale esta X del agua." |

### Compliance Meta (revisar antes de generar la voz)
- ❌ **Nunca prometer ingresos** ("ganá plata con esto", "X pesos por pieza"). Causa número uno
  de rechazo y de cuentas bloqueadas en tráfico frío.
- ❌ Nada que no se pueda sostener. Datos duros solo si son verificables.
- ✅ Mencionar qué incluye el producto sin prometer un resultado económico.

> ⚠️ **Tensión conocida con el Perfil B.** Los anuncios de TESTEO 1 sí insinúan ingresos
> ("te pagarían muy buena plata", "el valor de venta: altísimo") y aun así corrieron. Eso **no**
> vuelve segura la práctica. Al escribir los tiempos 4 y 6, avisar al usuario y ofrecer la
> versión sin promesa económica:
> - *"por el que te pagarían muy buena plata"* → *"que la gente busca y encarga"*
> - *"el valor de venta: altísimo"* → *"lo que vale terminado: otra cosa"*
>
> Si el usuario decide igual la versión con promesa, es su llamada — anotarlo en `config.md`
> para saber qué versión corrió si después hay un rechazo.

---

## 3. Voz

- **Acento nativo obligatorio.** Guion en voseo = voz argentina. Un neutro leyendo voseo suena
  falso y mata la credibilidad.
- Ajustes que suenan a persona y no a locutora:
  `stability: 0.45 · similarity_boost: 0.8 · style: 0.25` con `eleven_multilingual_v2`.
  (Subir `style` a 0.35 sube la actuación y suena más a publicidad.)

```bash
curl -s -X POST "https://api.elevenlabs.io/v1/text-to-speech/<VOICE_ID>?output_format=mp3_44100_128" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" -H "Content-Type: application/json" \
  -d '{"text":"<guion>","model_id":"eleven_multilingual_v2","voice_settings":{"stability":0.45,"similarity_boost":0.8,"style":0.25}}' \
  -o audios/NN-raw.mp3
```

### La voz define el ritmo. Elegirla por velocidad, no solo por timbre.

**Antes de decidir, generar la MISMA frase con todas las voces candidatas y comparar la
duración.** Cuesta centavos y revela el ritmo natural de cada una.

```bash
T="<una frase del guion, ~15 palabras>"
node -e 'require("fs").writeFileSync("pl.json",JSON.stringify({text:process.argv[1],model_id:"eleven_multilingual_v2",voice_settings:{stability:0.45,similarity_boost:0.8,style:0.25}}))' "$T"
while IFS='|' read -r id name; do
  curl -s -X POST "https://api.elevenlabs.io/v1/text-to-speech/$id?output_format=mp3_44100_128" \
    -H "xi-api-key: $ELEVENLABS_API_KEY" -H "Content-Type: application/json" \
    --data-binary @pl.json -o "audios/muestras-voz/$name.mp3"
  printf "%-24s %ss\n" "$name" "$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "audios/muestras-voz/$name.mp3")"
done <<'EOF'
<voice_id>|<nombre>
EOF
```

Medición real sobre 8 voces argentinas, misma frase y mismos ajustes:

| voz | duración | ritmo |
|---|---|---|
| AR-Malena | **4,37s** | la más rápida |
| AR-Agustin (varón) | 4,97s | |
| Franco (varón, Córdoba) | 5,02s | |
| AR-Lore | 5,15s | |
| AR-Argie | 5,48s | |
| AR-Agustina | 5,62s | |
| AR-Marina | 5,76s | |
| Valeria | **6,04s** | la más lenta |

**Malena es 38% más rápida que Valeria sin acelerar nada.** Si el usuario dice que la voz
suena lenta, **la primera opción es cambiar de voz, no aplicar `speed`**: el time-stretch mete
artefacto y se nota en frases largas.

Buscar y agregar voces nuevas del mercado:
```bash
curl -s "https://api.elevenlabs.io/v1/shared-voices?search=<pais>&language=es&page_size=20" \
  -H "xi-api-key: $ELEVENLABS_API_KEY"
curl -s -X POST "https://api.elevenlabs.io/v1/voices/add/<public_owner_id>/<voice_id>" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" -H "Content-Type: application/json" -d '{"new_name":"<nombre>"}'
```
Elegir por `cloned_by_count`: mucho uso = probada en contenido real.

---

## 4. Audio: transcribir → jumpcut → re-transcribir

**Los tres pasos, en orden, siempre.** El jumpcut se come 15-22% de silencios muertos.

```bash
# 1) Scribe del crudo
curl -s https://api.elevenlabs.io/v1/speech-to-text -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F model_id=scribe_v1 -F file=@audios/NN-raw.mp3 > captions/NN-raw.json

# 2) jumpcut por word-gaps (NO por decibeles: el piso de ruido del TTS no lo agarra)
node "$MOTOR/scripts/trim-audio-gaps.mjs" audios/NN-raw.mp3 captions/NN-raw.json audios/NN.mp3 0.12 0.04

# 3) re-transcribir el cortado — los timestamps cambiaron, props y captions usan ESTE
curl -s https://api.elevenlabs.io/v1/speech-to-text -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F model_id=scribe_v1 -F file=@audios/NN.mp3 > captions/NN.json
```

`0.12 0.04` es el ajuste apretado (Perfil B y C). El `0.18 0.05` del Perfil A deja algo más de
aire. En los 5 anuncios de TESTEO 1 **no hay una sola pausa de más de 0,2s** en 163 segundos.
En un feed el silencio es justo el momento donde el dedo se mueve.

```bash
# verificar que no quedaron huecos
ffmpeg -i audios/NN.mp3 -af "silencedetect=noise=-30dB:d=0.20" -f null - 2>&1 | grep silence_start
# no debería imprimir NADA (salvo la cola del final). Si imprime, apretar más.
```

**Sacar los tiempos de las palabras ancla** del JSON final: definen dónde cortan las tomas y
dónde arranca el cierre.

```bash
node -e '
const w=require("./captions/NN.json").words.filter(x=>x.type==="word");
let line="",start=null;
w.forEach((x,i)=>{ if(start===null)start=x.start; line+=x.text+" ";
  if(/[.:]$/.test(x.text)||i===w.length-1){
    console.log(start.toFixed(2).padStart(6)+" - "+x.end.toFixed(2).padStart(6)+"  "+line.trim());
    line="";start=null;}});'
```

---

## 5. Velocidad (`--speed`)

### El Perfil B va a 1.0, no a 1.15

El 1.15x es convención del Perfil A. En el B **el jumpcut solo ya deja el ritmo objetivo**:
95 palabras en 31,8s = **179 ppm**, y el target medido es 176. Aplicarle 1.15 lo llevaría a
206 ppm, fuera de perfil. Medir siempre antes de asumir:

```
ppm = palabras / (duración_final − duración_del_cierre) × 60
```

### Rango sano: 190-240 ppm

El ganador validado corre a ~200 ppm. Medición real al subir de 1.0 a 1.2:

| reel | ppm 1.0 | ppm 1.2 | veredicto |
|---|---|---|---|
| jarrones | 199 | 238 | ok |
| deco | 180 | 216 | ok |
| macetas | 225 | **267** | demasiado rápido |
| termos | 222 | **266** | demasiado rápido |

**Los que ya venían rápidos no aguantan el 1.2.** Antes de aplicar un `speed` global, calcular
el ppm resultante de cada uno; los que pasen de 240 van a 1.1 o quedan en 1.0.

### Cómo aplicar `speed` sin romper el cierre

`speed` divide TODO, incluida la placa de cierre: a 1.2 una placa de 3,3s se encoge a 2,75s.
Para conservarla, escalar la cola y la duración de la escena:

```
cola del video base   = 3,4 × speed        (ej: 4,08 para speed 1.2)
cierre "duration"     = 3,3 × speed        (ej: 3,96 para speed 1.2)
duración final        = base / speed
```

Los tiempos de los props van en **segundos del timeline original**; la composición divide por
`speed` internamente. El `start` del cierre (última palabra + 0,1) no se toca.

⚠️ Al acelerar, el anuncio se acorta. Verificar que no caiga por debajo del piso del perfil
(15s en A y C). A 1.2 dos de cuatro quedaron en 13,4s y 13,9s.

---

## 6. Ensamblado

Cortes secos, sin xfade. El video base dura **la voz + la cola** (§5).

```bash
cd brolls/<reel>
for f in [0-9][0-9].mp4; do echo "file '$f'"; done > lista.txt
ffmpeg -nostdin -hide_banner -loglevel error -y -f concat -safe 0 -i lista.txt -c copy mudo.mp4
ffmpeg -nostdin -hide_banner -loglevel error -y -i mudo.mp4 -i ../../audios/NN.mp3 \
  -map 0:v -map 1:a -c:v copy -c:a aac -t "$TARGET" base.mp4
```

Para que el concat con `-c copy` funcione, **todos los cortes tienen que salir con los mismos
parámetros**: `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30`,
`libx264 -preset medium -crf 18 -pix_fmt yuv420p`, sin audio.

### Repartir los planos para llegar justo al target

Acumular y recortar el último. Dos trampas ya pisadas:

- ⚠️ **El último plano se clampea** si al clip fuente no le queda margen (`-ss 4.9 -t 2.7` sobre
  un clip de 6,2s da 1,3s, no 2,7s). Elegir para el final un clip con margen y **verificar que
  la base llegue al target**, no asumirlo.
- ⚠️ **Si la lista de clips se agota** antes del target, el video queda corto. Poner más clips
  de los necesarios: el bucle corta solo cuando llega.
- ⚠️ **Dos ventanas consecutivas del mismo clip** (0-2,2 y 2,2-3,8) se leen como un plano
  continuo: se pierde el corte. Alternar fuentes.

```bash
acc=0; i=0
for spec in $clips; do
  c="${spec%%:*}"; want="${spec#*:}"; [ "$want" = "$c" ] && want=1.90
  rem=$(awk "BEGIN{printf \"%.3f\", $TARGET-$acc}")
  [ "$(awk "BEGIN{print ($rem<=0.05)?1:0}")" = "1" ] && break
  cd=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$LIB/$c.mp4")
  d=$(awk "BEGIN{m=($cd<$want)?$cd:$want; print (m<$rem)?m:$rem}")
  i=$((i+1))
  ffmpeg -nostdin -hide_banner -loglevel error -y -i "$LIB/$c.mp4" -t "$d" -vf "fps=30" -an \
    -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p "$(printf '%02d' $i).mp4"
  acc=$(awk "BEGIN{printf \"%.3f\", $acc+$d}")
done
```

**El primer plano tiene que cubrir el hook entero.** Si la frase de apertura termina a los
3,78s, el plano que la sostiene no puede durar 2,5s: encadenar con otro coherente. Sacar el
tiempo exacto del JSON de captions (§4).

---

## 7. Música

- Generar original con ElevenLabs Music (`POST /v1/music`, `music_length_ms`): **USD 0,15 por
  minuto**, licencia comercial. Un tema de 20s sale ~5 centavos.
- Direcciones que funcionan: **trap urbano**, **minimal satisfying**, **upbeat DIY**.
- Prompt: pedir *"no vocals, steady groove, no big drops, sits under a voiceover"*.
- Pasar `--music assets/music.mp3`: `make-props` mide la música y la voz y deja la música **8 dB
  bajo la voz**, que se escucha clara y no tapa. `--music-vol` solo para pisar ese cálculo.
- **Nunca créditos en pantalla.** La música generada con ElevenLabs Music es original y con
  licencia comercial: no tiene reclamos de Content ID.

### La música NO arranca a tope

En TESTEO 1 la cama entra o engorda recién entre los **8 y los 18 segundos** (+3 dB medidos en
la banda alta a partir de los 8,4s en ADS 1; a los 17,8s en ADS 5). Los primeros segundos son
casi voz sola: el hook no compite con nada.

```bash
DUR=33; COLA=3.4      # COLA = 3.4 × speed si se acelera (§5)
FADE=$(awk "BEGIN{printf \"%.2f\", $DUR-$COLA}")
# Perfil B (33s): arranca al 40%, full entre 7s y 13s
ffmpeg -nostdin -y -stream_loop 3 -i tema.mp3 -t $DUR \
  -af "volume='min(1,0.40+0.60*max(0\,t-7)/6)':eval=frame,afade=t=out:st=$FADE:d=$COLA" assets/music.mp3
# Perfil A/C (17s): arranca al 50%, full entre 2s y 6s
ffmpeg -nostdin -y -stream_loop 3 -i tema.mp3 -t $DUR \
  -af "volume='min(1,0.50+0.50*max(0\,t-2)/4)':eval=frame,afade=t=out:st=$FADE:d=$COLA" assets/music.mp3
```

**Sin SFX en los cortes.** El Perfil B no lleva `--intro-sfx` ni `--impact`.

---

## 8. Props, captions y cierre

```bash
# Perfil A
node "$MOTOR/scripts/make-props.mjs" --slug <proyecto>-NN \
  --video brolls/NN/base.mp4 --scribe captions/NN.json \
  --music assets/music-NN.mp3 --music-vol 0.10 --color "#00E5FF" \
  --keyword "<palabra>" --zoom-hit "palabra:<X>" --impact "palabra:<Y>" --intro-sfx riser

# Perfil B y C — karaoke, anclado arriba, sin keywords de color
node "$MOTOR/scripts/make-props.mjs" --slug <proyecto>-NN \
  --video brolls/NN/base.mp4 --scribe captions/NN.json \
  --music assets/music-NN.mp3 --music-vol 0.10 \
  --caption-style karaoke --captions-y 32 --speed 1.0 --no-zoom
```

### Captions karaoke — la especificación exacta

Es el elemento más consistente de los 5 anuncios y probablemente el más determinante. Los
valores salen de muestrear los píxeles, no de mirar a ojo.

| Qué | Valor | Nota |
|---|---|---|
| Palabra **ya dicha** | `#E9E9E9` | blanco |
| Palabra **que falta** | `#8F8988` | gris ~55% |
| Contorno | negro sólido, **7px** a 1080 | sin caja de fondo y **sin sombra** |
| Posición | **32% de altura** | es el BORDE SUPERIOR: el bloque crece hacia abajo |
| Líneas | hasta **3** | cada una autoajustada al ancho |
| Animación | **ninguna** | el texto no se mueve, no escala, no rebota |
| Fundido de entrada | ~200ms | la palabra entra un toque antes de decirse |
| Transición gris→blanco | 2-3 cuadros (~70-100ms) | en el momento exacto en que se pronuncia |
| Tipografía | Montserrat Black, mayúsculas | sin puntuación en pantalla |

Lo implementa `captionStyle: "karaoke"` en `$MOTOR/src/reels/Captions.tsx`; alcanza con el flag
`--caption-style karaoke`.

**Por qué el 32% y no el centro:** deja libre la mitad inferior para que se vea el trabajo de
las manos, y esquiva la zona donde Instagram encima el pie y los botones.

**El autoajuste por línea es el rasgo distintivo.** Una línea de una palabra corta se ve enorme
y una de tres se ve más chica. Ese contraste irregular es lo que hace que el ojo no se
acostumbre. Si todas las líneas salen del mismo tamaño, algo está mal.

⚠️ En karaoke **no usar `--keyword` ni `--color`**: el modo ignora los colores de palabra clave
a propósito. Meter amarillos rompe el sistema de dos tonos.

### Cierre

**Perfil B: no hay cierre.** Ni placa, ni logo, ni precio. El video termina sobre material de
trabajo, en seco; el CTA es la voz + el caption. El base dura exactamente lo que la voz.

```json
"ctaCard": null, "hookTitle": null, "progressBar": false, "scenes": []
```

**Perfiles A y C: landing deslizándose.**

```json
"ctaCard": null, "hookTitle": null, "progressBar": false,
"scenes": [{"name":"cierre","start":<última_palabra + 0.1>,"duration":3.3,"props":{
  "image":"assets/landing.png","scrollTo":1200,
  "titulo":"TE DEJO EL","sub":"LINK ABAJO","flecha":true,"oscurecer":0.55
}}]
```

- ❌ **Nada de tarjeta de CTA con botón** — se percibe tosca.
- ❌ **Nada de placas generadas con IA.** Estampa todos los objetos con el mismo patrón y no
  respeta la línea gráfica. Se probó y se descartó.
- ⚠️ **La escena arranca DESPUÉS de la última palabra.** Si arranca antes, el caption karaoke
  se monta sobre el título del cierre.
- Sacar la barra de progreso: sobre la placa molesta.

Copiar la captura larga de la landing a `$MOTOR/public/assets/landing.png`. El componente es
`$MOTOR/src/reels/scenes/Cierre.tsx`. Props: `image` · `scrollTo` (px, 0 = fijo con zoom) ·
`titulo` · `sub` · `flecha` · `oscurecer` (0-1).

> Vale la pena testear el cierre contra la ausencia de cierre. Que los 5 de TESTEO 1 hayan
> ganado sin placa no prueba que la placa reste; prueba que **no es imprescindible**.

---

## 9. Validar, renderizar, masterizar, comprimir

```bash
cd "$MOTOR"
npx remotion still Reel check.png --frame=<F> --props=props/<slug>.json
```

`Frame = (segundos_originales / speed) × 30`. Mirar **4 stills**: el hook, uno con caption
activa, uno del medio y **uno del cierre**.

**En karaoke mirar además, en el still de la frase más larga:**
- Que **ninguna línea se salga del cuadro**. Si aparece una palabra larguísima el autoajuste
  baja el tamaño de toda la línea: ahí conviene reescribir la frase, no tocar el motor.
- Que se distinga **blanco vs gris**. Si está todo blanco, el flag no se aplicó.
- Que el bloque no invada la mitad inferior: con `--captions-y 32` y 3 líneas termina cerca
  del 46%.
- **Que el hook coincida con lo que se ve** (§1). Es el still más importante de los cuatro.

```bash
npx remotion render Reel <ruta>/edited/NN-FINAL.mp4 --props=props/<slug>.json > render.log 2>&1
node "$MOTOR/scripts/verify.mjs" --video <ruta>/edited/NN-FINAL.mp4
```

### Masterizar el audio

El hallazgo más fuerte de TESTEO 1 y el que menos se ve: **−11,7 a −13,0 LUFS con un rango
dinámico de solo 1,6 a 2,0 LU** y picos a 0,0 dB. Es una pared de sonido.

```bash
ffmpeg -nostdin -y -i NN-FINAL.mp4 \
  -af "acompressor=threshold=-18dB:ratio=6:attack=5:release=120:makeup=2,loudnorm=I=-12:TP=-1.0:LRA=3,alimiter=limit=0.97" \
  -c:v copy -c:a aac -b:a 192k NN-MASTER.mp4

ffmpeg -i NN-MASTER.mp4 -af ebur128=framelog=quiet -f null - 2>&1 | tail -12
```

Un render típico entra a −19 LUFS / 2,4 LU y sale a −12 LUFS / 1,5 LU.

**Qué compra, con precisión:** Meta normaliza cerca de −14 LUFS, así que subir a −12 **no** hace
que suene más fuerte en el feed. Compra *densidad*: al aplastar el rango no queda ningún momento
bajo donde el oído afloje. Con el jumpcut sin huecos, el anuncio no da un instante de descanso.

> ⚠️ **Con placa de cierre el LRA no baja de ~2,5, y está bien.** En esos 3,3s la voz para y
> solo queda música: ese tramo bajo ensancha el rango (se midió 5,7-7,1 LU). No es falla del
> masterizado, es la forma del formato. Bajarlo exigiría subir la música durante la placa, lo
> que cambia un elemento validado. Sin placa (Perfil B) sí cierra en 1,5 LU.

### Comprimir SIEMPRE antes de entregar

```bash
# A parte de NN-FINAL.mp4; B y C parten de NN-MASTER.mp4
ffmpeg -nostdin -y -i NN-MASTER.mp4 -c:v libx264 -preset slow -crf 21 -maxrate 9M -bufsize 18M \
  -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart NN-WEB.mp4
```

Deja 17s en ~12 MB y 32s en ~28 MB. **Nunca entregar el FINAL.**

> Referencia: los 5 ganadores están en **1080×1920, 30 fps, ~9,8 Mbps** y pesan 36-45 MB para
> 30-37s. Meta traga bastante más de lo que sugiere un CRF 24 — con detalle fino (papel,
> texturas, cerámica) usar `-crf 21`.

---

## 10. Variaciones baratas

Cuando un reel funciona, **no se escribe otro guion**: se cambian las tomas o el hook.

- Mismo audio + otro set de tomas = variante visual, **cero créditos**.
- Mismo cuerpo + intro distinta de ~3s = N ángulos al precio de uno.
- Cambiar la voz o la música sobre el mismo guion cuesta centavos.
- **`--caption-style pop` vs `karaoke`** = un flag, cero créditos. El A/B más barato para aislar
  el efecto de los captions.
- **Con y sin placa de cierre** = otro A/B de un flag.
- **`--speed` 1.0 vs 1.1 vs 1.2** = otro A/B de un flag (respetando §5).

⚠️ **Variar no es repetir.** Si cuatro variantes usan los mismos seis clips, no son cuatro
anuncios: son uno con el audio cambiado. Antes de una tanda, **minar material nuevo** (§1c) y
asignarle a cada variante una **familia de objeto exclusiva**, sin solapamiento. Cuatro
variantes con paletas y objetos distintos no parecen el mismo anuncio en el feed.

Anotar en `config.md`: voz usada, speed, color, qué toma salió de qué fuente y con qué recorte,
qué material se descartó y por qué. Eso hace repetible la próxima tanda.

---

## 11. Gotchas del entorno (ya pisados, no volver a pisarlos)

| Síntoma | Causa | Solución |
|---|---|---|
| Un bucle `while read` procesa 1 de cada N ítems, nombres de archivo cortados | **ffmpeg se come el stdin del bucle** | `ffmpeg -nostdin` **siempre** |
| `tile` con 60 inputs devuelve una sola imagen | `tile` espera un stream de frames, no N inputs | numerar los PNG y `-framerate 1 -i "%03d.png" -vf tile=9x6` |
| `Pattern type 'glob' ... not supported` | el build de ffmpeg no trae globbing | listar los inputs explícitos o usar secuencia numerada |
| `drawtext` da `Fontconfig error` y segfault | no hay fontconfig en el entorno | no etiquetar dentro del frame; usar nombre de archivo o enunciar el orden |
| El tamaño de archivo sale absurdo (0,2 MB) | `ls -la \| awk '{print $5}'` no cae en la columna correcta | `stat -c%s archivo` |
| `-frames:v N` con `tile` → "Cannot write more than one file" | `tile` produce 1 frame de salida | `-t <dur> -i ... -vf "...,tile=1xN" -frames:v 1` |
| El último plano sale más corto de lo pedido | `-ss` + `-t` se pasa del final del clip fuente | verificar `base` contra `target` y elegir un clip con margen |

**Y la regla de trabajo que más tiempo ahorró:** cuando una medición no cierra, revisarla antes
de reportarla. Dos veces un número llamativo (un archivo "roto" de 0,2 MB, una correlación entre
cortes y audio) resultó ser un error de medición propio, no un hallazgo.
