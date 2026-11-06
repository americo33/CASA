// Todos los tiempos (start/end/duration) van en segundos del timeline ORIGINAL
// del audio (sin acelerar). La composición divide por `speed` internamente.

import type { SfxName } from "./Sfx";

export type CaptionWord = {
  text: string;
  start: number;
  end: number;
};

export type BRollTransition = "fade" | "cut" | "whip" | "slide";

export type BRollItem = {
  src: string; // relativo a public/, ej "reels/legal-ia-01/broll-1.mp4"
  start: number;
  duration?: number; // default 2.5
  startFrom?: number; // segundos dentro del clip, default 0
  kenBurns?: boolean; // default true
  sfx?: SfxName | false; // sonido de entrada; false = mudo, default según transición
  transition?: BRollTransition; // default "fade" (pip usa su propio pop)
  pip?: boolean; // ventana flotante sobre el avatar en vez de pantalla completa
  pipY?: number; // % vertical del centro de la ventana pip, default 30
};

export type BadgeItem = {
  text: string;
  start: number;
  duration: number;
  y?: number; // % vertical del centro del badge, default 20
  bg?: string; // default highlightColor
};

export type PriceTagItem = {
  oldPrice: string; // ej "$47"
  newPrice: string; // ej "$19"
  start: number;
  duration: number;
  y?: number; // default 30
};

export type CounterItem = {
  prefix?: string; // ej "QUEDAN"
  from: number;
  to: number;
  suffix?: string; // ej "CUPOS"
  start: number;
  duration: number;
  y?: number; // default 24
};

export type SceneItem = {
  name: string; // clave del registro en scenes/registry.tsx
  start: number;
  duration?: number; // default 3
  bg?: string; // fondo de la escena, default #0B0B0F
  props?: Record<string, unknown>; // props propios de cada escena
  sfx?: SfxName | false; // sonido de entrada; false = mudo, default "whoosh"
};

export type CtaCardItem = {
  text: string; // ej "Descargalo ahora"
  buttonText: string; // ej "QUIERO MI ACCESO →"
  start: number; // se muestra desde acá hasta el final del video
  y?: number; // default 50
};

// Punch-zoom en palabra clave (estilo Hormozi): la cámara empuja cuando se
// dice la palabra fuerte y vuelve sola. Sin sonido — es un acento de cámara.
export type ZoomHit = {
  start: number;
  amount?: number; // cuánto empuja, default 0.12
};

// Acento del dato duro: micro-shake + pulso de zoom + SFX (default "impact").
export type ImpactItem = {
  start: number;
  sfx?: SfxName | false; // default "impact"
};

// Cue de sonido suelto anclado a un momento — sin visual. Para los remates:
// "wrong" en el golpe de dolor, "correct" en el win, "bells" en la garantía.
export type SfxCue = {
  start: number;
  name: SfxName;
};

// Titular grande sobre el avatar durante el hook (primeros segundos).
export type HookTitleItem = {
  text: string;
  highlight?: string; // palabra(s) del texto que van en color de marca
  start?: number; // default 0
  duration?: number; // default 3.2 (seg originales)
  y?: number; // % vertical del centro, default 24
};

// Palabra clave de captions: siempre coloreada (aunque no esté activa) y un
// toque más grande. Con emoji, se agrega después de la palabra.
export type CaptionKeyword =
  | string
  | { word: string; color?: string; emoji?: string };

// Estilo del bloque de captions:
//   "pop"     — default histórico del kit: palabra activa en highlightColor,
//               resto en blanco, con pop de escala por página y por palabra.
//   "karaoke" — perfil TESTEO 1: lo ya dicho en blanco #E9E9E9, lo que falta en
//               gris #8F8988, bloque anclado arriba, hasta 3 líneas con tamaño
//               autoajustado y CERO animación. Ver skill `reels-corto`.
export type CaptionStyle = "pop" | "karaoke";

export type ReelProps = {
  videoSrc: string; // relativo a public/
  durationSeconds: number; // duración del video base SIN acelerar (ffprobe)
  speed?: number; // default 1.3
  words?: CaptionWord[]; // palabras de Scribe (solo type=word)
  brolls?: BRollItem[];
  music?: { src: string; volume?: number } | null; // volume lineal, default 0.032 (~-30dB)
  highlightColor?: string; // default #E8372A
  zoom?: boolean; // zoom lento sobre el video base, default true
  captionsY?: number; // % vertical del bloque de captions, default 72
  // en "karaoke" captionsY es el BORDE SUPERIOR del bloque (el texto crece
  // hacia abajo); en "pop" es el centro vertical. Perfil TESTEO 1: 32.
  captionStyle?: CaptionStyle; // default "pop"
  badges?: BadgeItem[];
  scenes?: SceneItem[]; // escenas animadas que ocupan el lugar de un b-roll
  priceTag?: PriceTagItem | null; // precio tachado animado
  counter?: CounterItem | null; // contador de urgencia
  ctaCard?: CtaCardItem | null; // tarjeta CTA final con botón pulsante
  punchZoom?: PunchZoom | null; // zoom alternado en los cortes del jumpcut
  zoomHits?: ZoomHit[]; // punch-zoom en palabras clave (independiente del jumpcut)
  impacts?: ImpactItem[]; // shake + pulso + SFX en el dato duro
  sfxCues?: SfxCue[]; // sonidos sueltos anclados a palabra (correct/wrong/bells…)
  hookTitle?: HookTitleItem | null; // titular grande durante el hook
  progressBar?: boolean; // barra de progreso arriba, default true
  keywords?: CaptionKeyword[]; // palabras clave de captions (color/emoji)
  autoKeywords?: boolean; // resaltar números/cifras solos, default true
  grade?: boolean; // color grade sutil + viñeta sobre el video base, default true
  debugSafeZones?: boolean; // grilla de zonas seguras de Meta (solo para validar)
  sfx?: boolean; // interruptor global de efectos de sonido, default true
  sfxVolume?: number; // volumen master de SFX (bajo la voz), default 0.7
  introSfx?: SfxName | false; // sonido al frame 0 (ej "riser" bajo el hook), default false
};

// Zoom alternado por segmento para disimular los saltos del jumpcut: en cada
// corte la cámara "empuja" a otro nivel, así el corte se lee como decisión de
// edición y no como glitch. Los cuts los produce tighten.mjs.
export type PunchZoom = {
  cuts: number[]; // límites interiores de segmento, en seg del timeline (tight)
  amount?: number; // cuánto empuja el zoom alternado, default 0.05
};

// Composición "Kinetic": ad de texto puro animado + voz, sin avatar (cero HeyGen)
export type KineticProps = {
  audioSrc: string; // relativo a public/
  durationSeconds: number; // duración del audio SIN acelerar
  speed?: number; // default 1.3
  words?: CaptionWord[];
  bg?: string; // default #0B0B0F
  highlightColor?: string; // default #E8372A
  music?: { src: string; volume?: number } | null;
  priceTag?: PriceTagItem | null;
  counter?: CounterItem | null;
  ctaCard?: CtaCardItem | null;
};
