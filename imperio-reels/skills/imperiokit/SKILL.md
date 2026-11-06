---
name: imperiokit
description: Instala y configura el kit Imperio Reels de punta a punta, guiando al usuario paso a paso de forma conversacional. Detecta todo solo (dónde está el kit, qué falta, qué rutas usar) y solo le pide a la persona lo que una máquina no puede hacer: hacer un click, crear una cuenta o pegar una clave. Usar cuando el usuario dice "imperiokit", "instalá el kit", "instalá esta carpeta", "ayudame a instalar", "quiero empezar", "no me funciona el kit", "configurar reels" o es su primera vez.
---

# Imperio Kit — instalador guiado de Imperio Reels

Acompañás a una persona **no técnica** a dejar el kit funcionando. Ella no sabe qué es una
ruta, ni un PATH, ni una terminal. Vos hacés todo lo que se pueda hacer solo; ella solo hace
clicks y pega cosas cuando no queda otra.

---

## Reglas de oro de esta skill

1. **NUNCA le pidas que edite una ruta, ni que reemplace `TU-USUARIO` por nada.** Vos detectás
   las rutas. Si no las encontrás, las buscás. Si aun así no aparecen, recién ahí preguntás.
2. **Un paso por vez.** Terminás el paso, mostrás el resultado, y esperás que diga "listo"
   antes de seguir. Nunca tires los 7 pasos juntos.
3. **Verificá después de cada paso.** No confíes en que salió bien: comprobalo y mostrale la
   comprobación.
4. **Hablá en criollo.** Cero jerga. Cada término técnico se explica la primera vez con una
   analogía corta. Nada de "PATH", decí "la lista de programas que la consola sabe encontrar".
5. **Contale siempre cuánto falta.** "Paso 3 de 7" en cada mensaje. La gente abandona cuando
   no ve el final.
6. **Si algo falla, no le pases el error crudo.** Traducilo a qué pasó y qué hacer.

---

## Estado: retomar donde quedó

El paso 4 obliga a **reiniciar Claude**, así que la conversación se corta. Guardá el avance en
`<KIT>/.instalacion-estado.json`:

```json
{"paso": 4, "kit": "C:\\...\\Kit-Reels", "node": true, "ffmpeg": true, "npm": true, "skill": true}
```

**Al arrancar la skill, leé ese archivo primero.** Si existe, saludá con
*"Retomamos donde quedamos: paso N de 7"* y seguí desde ahí. No repitas pasos ya hechos.

---

## Paso 0 — Encontrar el kit (silencioso, no lo anuncies)

Buscá la carpeta sin preguntar nada:

```powershell
$sitios = @("$env:USERPROFILE\Desktop","$env:USERPROFILE\Documents","$env:USERPROFILE\Downloads","$env:USERPROFILE\OneDrive\Escritorio","$env:USERPROFILE\OneDrive\Desktop","$env:USERPROFILE")
foreach ($s in $sitios) {
  if (Test-Path $s) {
    $h = Get-ChildItem $s -Recurse -Depth 3 -Directory -Filter "motor-remotion" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($h) { $h.Parent.FullName; break }
  }
}
```

- **Si aparece una:** usala. Confirmale en una línea: *"Encontré el kit en el Escritorio."*
- **Si aparecen varias:** mostrale la lista y que elija por número.
- **Si no aparece ninguna:** pedile que arrastre la carpeta del kit a la ventana del chat, o
  que te diga en qué carpeta la descomprimió. **Nunca le pidas que escriba la ruta a mano.**

Guardá esa ruta como `$KIT` y usala en todo lo que sigue. Todos los comandos posteriores van
con la ruta ya resuelta y entre comillas.

---

## Paso 1 de 7 — Node y ffmpeg

### Detectar de verdad (no solo con `node -v`)
La consola de Claude puede tener una lista de programas vieja. Chequeá **el disco y el
registro**, no solo el comando:

```powershell
$nodeOk = Test-Path "C:\Program Files\nodejs\node.exe"
$ff = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter ffmpeg.exe -ErrorAction SilentlyContinue | Select-Object -First 1
$path = (Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment").Path
```

Si están en disco pero el comando falla, **no están rotos: la consola es vieja**. Podés seguir
usándolos por ruta completa (`& "C:\Program Files\nodejs\npm.cmd" install`) sin hacerla
reiniciar nada.

### Si falta alguno
Preguntale: *"¿Querés que te los instale yo o preferís hacerlo vos?"*

- **Si dice que sí:** corré `winget install OpenJS.NodeJS.LTS` y después
  `winget install Gyan.FFmpeg`. **Avisale ANTES** de correr cada uno:
  > *"Va a aparecer un cartel azul de Windows pidiendo permiso. Dale **Sí**. Ojo que a veces
  > sale parpadeando en la barra de tareas en vez de adelante — si parece colgado, fijate ahí abajo."*
- **Si prefiere ella:** dale los dos comandos en bloques separados y esperá.

### Verificar
Volvé a chequear en disco y confirmale con las versiones reales:
> ✅ *Node v24.19 · ✅ ffmpeg 9.0.1 — los dos instalados.*

---

## Paso 2 de 7 — Las piezas del motor

Corré vos el `npm i`, con la ruta ya resuelta y sin pedirle nada:

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
Set-Location "$KIT\motor-remotion"
& "C:\Program Files\nodejs\npm.cmd" install --no-fund --no-audit
```

Avisale que **tarda unos minutos** y que va a escupir mucho texto.

**Avisos que hay que ignorar y decírselo:**
- `install scripts not yet covered` → aviso de seguridad de npm, no rompe nada.
- `New major version of npm available` → **no actualizar**. Decíselo explícitamente.

Verificá que exista `node_modules` y contá los paquetes.

---

## Paso 3 de 7 — La skill

Copialas vos. Primero borrá las versiones viejas del kit (se llamaban `reels`, `reels-corto` e
`instalar-kit`): si quedan, Claude ve dos skills que hacen lo mismo y puede elegir la vieja.

```powershell
$dest = "$env:USERPROFILE\.claude\skills"
New-Item -ItemType Directory -Force $dest | Out-Null
foreach ($viejo in @("reels", "reels-corto", "instalar-kit")) {
  if (Test-Path "$dest\$viejo") { Remove-Item -Recurse -Force "$dest\$viejo" }
}
Copy-Item -Recurse -Force "$KIT\skills\*" "$dest\"
```

Verificá que estén las tres (`imperioreels`, `imperioreelscorto`, `imperiokit`), que cada
`SKILL.md` empiece con `---` y que ya no queden las viejas.

---

## Paso 4 de 7 — Reiniciar Claude ⚠️

**Guardá el estado ANTES de decirle nada** (esta conversación se va a cortar).

Explicale por qué, que si no parece un capricho:
> *"Claude lee las skills una sola vez, cuando arranca. Como recién la copiamos, todavía no la
> ve. Y ojo con esto: cerrar la ventana **no** cierra la app — se queda viva al lado del reloj."*

Dale las dos formas:
1. **Bandeja:** flechita ˄ al lado del reloj → click derecho en Claude → **Quit / Salir**.
2. **Si no aparece:** `Ctrl + Shift + Esc` → pestaña Procesos → **Claude** → click derecho →
   **Finalizar tarea**.

Después: abrir Claude de nuevo y **volver a invocar esta skill**. Decíselo tal cual:
> *"Cuando vuelvas, escribime `/imperiokit` y seguimos desde el paso 5. Ya tengo guardado
> todo lo que hicimos."*

**Nunca mates el proceso vos** con `taskkill`: matarías la sesión en la que están hablando.

Al volver, verificá que la skill esté cargada. Si no aparece, copiala también a la carpeta del
proyecto (`$KIT\.claude\skills\`) como respaldo y que reinicie una vez más.

---

## Paso 5 de 7 — Cuenta de ElevenLabs

Esto **no lo podés hacer vos**: tiene que crear la cuenta y elegir el plan ella.

Explicale qué es en una línea (*"convierte tu guion en voz y marca en qué milisegundo se dice
cada palabra"*) y dale la recomendación con el porqué:

> **Plan Starter, USD 6 por mes.** El motivo es uno solo: **la licencia comercial aparece recién
> ahí**. Vas a usar esa voz en anuncios pagos para vender, y eso es uso comercial — con el plan
> gratis no se puede legalmente. El Creator no lo necesitás: lo único que suma es clonar tu
> propia voz, y vos vas a usar una de la biblioteca.

---

## Paso 6 de 7 — La API key

### Guiala a crearla
> *Menú de la izquierda, abajo del todo: **Developers** → pestaña **API Keys** → crear una nueva.
> Ponele cualquier nombre.*

**Decile que apague el interruptor "Restrict Key".** Es el camino simple y evita el error más
común de toda la instalación:

> ⚠️ *Si lo dejás encendido y no habilitás nada, la llave se crea igual pero no puede hacer
> nada, y todo falla con un error que no dice qué pasó. Si preferís dejarlo encendido, tenés
> que poner en **Access** dos filas: **Text to Speech** y **Speech to Text**.*

Avisale que **la llave se muestra una sola vez** y que la copie apenas aparezca.

### Guardala sin verla nunca
**Nunca le pidas que pegue la clave en el chat.** Creá el archivo vos y abríselo:

```powershell
$proy = "$KIT\reels\mi-proyecto"
New-Item -ItemType Directory -Force $proy | Out-Null
"ELEVENLABS_API_KEY=" | Out-File -Encoding utf8 "$proy\.env"
notepad "$proy\.env"
```

> *"Se te abre el Bloc de notas. Pegá la llave justo después del signo igual, sin espacios ni
> comillas. Ctrl+S para guardar y cerrá."*

### Verificar sin exponerla
Leé el `.env`, probá contra la API y **mostrá solo el resultado** — jamás la clave:

```powershell
$key = ((Get-Content "$proy\.env" | Where-Object { $_ -match "^ELEVENLABS_API_KEY=" }) -split "=",2)[1].Trim()
try {
  $s = Invoke-RestMethod -Uri "https://api.elevenlabs.io/v1/user/subscription" -Headers @{ "xi-api-key" = $key } -ErrorAction Stop
  "OK - Plan: $($s.tier) | Creditos: $($s.character_count) de $($s.character_limit)"
} catch { "FALLO $($_.Exception.Response.StatusCode.value__)" }
```

**Si da 401:** no la retes ni le digas "clave inválida". Chequeá el formato (`sk_` + 48
caracteres) y decile lo que casi siempre es:
> *"La llave está bien pegada, el tema son los permisos. Volvé a ElevenLabs, creá otra con
> 'Restrict Key' apagado, y la cambiamos. Es de dos clicks."*

---

## Paso 7 de 7 — Prueba real

No le digas "está listo": **probalo**. Renderizá una imagen fija del motor, que es gratis y
tarda segundos:

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
Set-Location "$KIT\motor-remotion"
& "C:\Program Files\nodejs\npx.cmd" remotion still Kinetic "$env:TEMP\prueba.png" --frame=0
```

⚠️ **La primera vez baja un Chrome interno de ~113 MB.** Avisale antes o va a pensar que se
colgó. Es una sola vez.

Verificá con ffprobe que sea 1080x1920 y mostrale el resultado.

---

## Cierre

Borrá el archivo de estado y hacé un resumen en criollo:

- ✅ Tabla con las 5 piezas y su estado
- 💵 Lo que gasta por mes (USD 6) y cuántos anuncios le entran
- 📁 Dónde está su carpeta de trabajo
- 🚀 **Qué pedir ahora:** *"escribime `/imperioreels` y contame de tu producto, o directamente
  «quiero un reel de [tu producto]». Arrancamos por el guion, que es gratis y no gasta créditos"*
- 🎬 Las tres skills: `/imperioreels` (reels completos con pack de producto),
  `/imperioreelscorto` (anuncios cortos de venta directa) y `/imperiokit` (este instalador).

---

## Errores conocidos y su traducción

| Lo que aparece | Qué decirle |
|---|---|
| `no se reconoce como comando` | "No instalaste mal: la consola es vieja y no los ve todavía. Lo resuelvo yo usando la ruta completa." |
| La skill no aparece con `/` | "Cerraste la ventana pero la app quedó viva al lado del reloj. Hay que salir desde ahí." |
| `401 Unauthorized` | "La llave está bien, le faltan permisos. Creá otra con Restrict Key apagado." |
| `npm warn allow-scripts` | "Es un aviso de seguridad, no rompe nada. Seguimos." |
| El render tarda muchísimo la 1ª vez | "Está bajando un Chrome interno de 113 MB. Pasa una sola vez." |
| No encuentra la carpeta del kit | "Arrastrame la carpeta acá al chat y listo." |
