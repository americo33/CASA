import { Audio, staticFile } from "remotion";

// Biblioteca de SFX (public/assets/sfx/). Cada uno con su volumen relativo para
// que los cinematográficos (riser/impact) no revienten sobre la voz. El volumen
// final = master (sfxVolume del reel) × vol del sonido.
// Todo es royalty-free de Mixkit (sin atribución). Para sumar un sonido: bajarlo
// con  curl -L -o assets/sfx/<archivo> https://assets.mixkit.co/active_storage/sfx/<ID>/<ID>.wav
// y registrarlo acá. Los que rotan solos en los cortes viven en SFX_FAMILIES (abajo).
const REG = {
  // transiciones cortas — el backbone de los cortes (rotan solas, ver SFX_FAMILIES)
  sweep: { src: "assets/sfx/mixkit-fast-small-sweep-transition-166.wav", vol: 0.7 },
  sweep2: { src: "assets/sfx/mixkit-sweep-transition-175.wav", vol: 0.7 },
  whoosh: { src: "assets/sfx/whoosh1.mp3", vol: 0.7 },
  whoosh2: { src: "assets/sfx/mixkit-fast-whoosh-transition-1490.wav", vol: 0.6 },
  whoosh3: { src: "assets/sfx/mixkit-cinematic-whoosh-fast-transition-1492.wav", vol: 0.6 },
  swoosh: { src: "assets/sfx/swoosh1.mp3", vol: 0.7 },
  swoosh2: { src: "assets/sfx/mixkit-swoosh-1474.wav", vol: 0.5 }, // largo (3s) — para reveals, no cortes
  windSwoosh: { src: "assets/sfx/mixkit-cinematic-wind-swoosh-1471.wav", vol: 0.5 },
  rewind: { src: "assets/sfx/mixkit-rewind-transition-1088.wav", vol: 0.5 }, // "volvamos atrás" / recap
  // acentos de UI / aparición (pop rota solo)
  pop: { src: "assets/sfx/mixkit-long-pop-2358.wav", vol: 0.7 },
  pop2: { src: "assets/sfx/mixkit-long-pop-2-2364.wav", vol: 0.7 },
  pop3: { src: "assets/sfx/mixkit-pop-up-2356.wav", vol: 0.8 }, // corto y brillante
  click: { src: "assets/sfx/click1.mp3", vol: 0.8 },
  doubleClick: { src: "assets/sfx/mixkit-fast-double-click-on-mouse-275.wav", vol: 0.7 },
  typewriter: { src: "assets/sfx/mixkit-keyboard-typewriter-2531.wav", vol: 0.6 }, // texto que se escribe
  // dinero / reveal de precio — el arma para infoproductos low-ticket
  cash: { src: "assets/sfx/mixkit-gold-coin-prize-1999.wav", vol: 0.5 }, // moneda-premio, win limpio
  cashWin: { src: "assets/sfx/mixkit-magical-coin-win-1936.wav", vol: 0.5 }, // win con brillo
  coins: { src: "assets/sfx/mixkit-clinking-coins-1993.wav", vol: 0.55 }, // monedas cayendo
  priceReveal: { src: "assets/sfx/mixkit-melodic-gold-price-2000.wav", vol: 0.5 }, // aparición del precio
  // notificación / chat
  msgIn: { src: "assets/sfx/mixkit-bubble-pop-up-alert-2357.wav", vol: 0.7 }, // mensaje entrante (chat)
  bubble: { src: "assets/sfx/mixkit-bubble-pop-up-alert-2357.wav", vol: 0.7 }, // alias de msgIn
  notify: { src: "assets/sfx/mixkit-positive-notification-951.wav", vol: 0.55 },
  // tonales — win / error / lúdicos (usar puntual)
  correct: { src: "assets/sfx/mixkit-correct-answer-tone-2870.wav", vol: 0.5 },
  wrong: { src: "assets/sfx/mixkit-wrong-answer-bass-buzzer-948.wav", vol: 0.5 },
  bells: { src: "assets/sfx/mixkit-kids-cartoon-close-bells-2256.wav", vol: 0.5 },
  laugh: { src: "assets/sfx/mixkit-happy-child-laughing-2265.wav", vol: 0.6 },
  // sparkle / win / garantía — remates positivos
  sparkle: { src: "assets/sfx/mixkit-magic-sparkle-whoosh-2350.wav", vol: 0.5 }, // reveal mágico (3.5s)
  fairy: { src: "assets/sfx/mixkit-fairy-arcade-sparkle-866.wav", vol: 0.55 },
  success: { src: "assets/sfx/mixkit-happy-bells-notification-937.wav", vol: 0.5 }, // logro / garantía
  // cinematográficos — hooks / reveals / golpes
  riser: { src: "assets/sfx/mixkit-cinematic-trailer-riser-790.wav", vol: 0.4 },
  impact: { src: "assets/sfx/mixkit-movie-trailer-epic-impact-2908.wav", vol: 0.4 },
  impactIntro: { src: "assets/sfx/mixkit-movie-impact-intro-presentation-2902.wav", vol: 0.4 },
  boom: { src: "assets/sfx/mixkit-cinematic-impact-2198.wav", vol: 0.4 }, // impacto seco, más grave
  hit: { src: "assets/sfx/mixkit-cinematic-hit-677.wav", vol: 0.4 },
  heartbeat: { src: "assets/sfx/mixkit-heartbeat-492.wav", vol: 0.5 }, // tensión (2 latidos)
} as const;

export type SfxName = keyof typeof REG;

// Familias que ROTAN solas en cortes consecutivos (Reel.tsx pasa el índice) para
// que dos b-rolls/escenas seguidos NUNCA suenen con el mismo whoosh — la marca de
// un editor amateur es el mismo sonido repetido en cada corte.
export const SFX_FAMILIES = {
  whoosh: ["whoosh", "whoosh2", "whoosh3"],
  sweep: ["sweep", "sweep2"],
  pop: ["pop", "pop2", "pop3"],
} as const satisfies Record<string, readonly SfxName[]>;

export const rotateSfx = (
  family: keyof typeof SFX_FAMILIES,
  i: number,
): SfxName => {
  const arr = SFX_FAMILIES[family];
  return arr[i % arr.length];
};

// One-shot: se monta dentro de un <Sequence> y suena una vez en su frame de inicio.
export const Sfx: React.FC<{ name: SfxName; volume?: number }> = ({
  name,
  volume = 0.7,
}) => {
  const s = REG[name];
  return <Audio src={staticFile(s.src)} volume={volume * s.vol} />;
};
