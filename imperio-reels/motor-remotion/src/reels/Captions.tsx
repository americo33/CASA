import { useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionKeyword, CaptionStyle, CaptionWord } from "./types";

const KEYWORD_COLOR = "#FFD400"; // amarillo por defecto: lee bien sobre el stroke negro

// misma normalización que make-props: minúsculas, sin tildes ni puntuación
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

type KeywordStyle = { color: string; emoji?: string };

const buildKeywordMap = (
  keywords: CaptionKeyword[],
): Map<string, KeywordStyle> => {
  const map = new Map<string, KeywordStyle>();
  for (const k of keywords) {
    const item = typeof k === "string" ? { word: k } : k;
    map.set(norm(item.word), {
      color: item.color ?? KEYWORD_COLOR,
      emoji: item.emoji,
    });
  }
  return map;
};

export type FrameWord = CaptionWord & { startF: number; endF: number };
export type Page = { words: FrameWord[]; fromF: number; toF: number };

const MAX_GAP_SECONDS = 0.6;

export const buildPages = (
  words: CaptionWord[],
  speed: number,
  fps: number,
  maxWordsPerPage = 3,
): Page[] => {
  const fw: FrameWord[] = words.map((w) => ({
    ...w,
    startF: Math.round((w.start / speed) * fps),
    endF: Math.round((w.end / speed) * fps),
  }));

  const groups: FrameWord[][] = [];
  let cur: FrameWord[] = [];
  for (const w of fw) {
    const prev = cur[cur.length - 1];
    const gapTooBig = prev !== undefined && w.start - prev.end > MAX_GAP_SECONDS;
    // cortar la página al final de cada frase o inciso (punto, coma, dos puntos…)
    const endOfPhrase = prev !== undefined && /[.,;:!?…]$/.test(prev.text);
    if (cur.length >= maxWordsPerPage || gapTooBig || endOfPhrase) {
      groups.push(cur);
      cur = [];
    }
    cur.push(w);
  }
  if (cur.length > 0) groups.push(cur);

  return groups.map((g, i) => {
    const next = groups[i + 1];
    const lastEnd = g[g.length - 1].endF;
    // extender la página hasta la siguiente para que no parpadee, con tope
    const toF = next
      ? Math.min(next[0].startF, lastEnd + Math.round(0.4 * fps))
      : lastEnd + Math.round(0.4 * fps);
    return { words: g, fromF: g[0].startF, toF };
  });
};

// ---------------------------------------------------------------------------
// Modo "karaoke" — perfil medido sobre los anuncios ganadores de TESTEO 1.
// Lo ya dicho va en blanco, lo que falta en gris, el bloque se ancla por arriba
// y NO hay ninguna animación de posición ni de escala. Ver la skill
// `reels-corto`, sección "Perfil B".
// ---------------------------------------------------------------------------
const KARAOKE_SPOKEN = "#E9E9E9"; // palabra ya pronunciada
const KARAOKE_PENDING = "#8F8988"; // palabra que todavía no se dijo
const KARAOKE_STROKE_PX = 7;
const KARAOKE_MAX_CHARS = 16; // ancho de línea antes de bajar a la siguiente
const KARAOKE_MAX_LINES = 3;
const KARAOKE_FONT_MIN = 42;
const KARAOKE_FONT_MAX = 104;
const KARAOKE_BOX_W = 980; // 1080 menos los 50px de padding de cada lado
const KARAOKE_WORD_GAP = 8; // margen horizontal por lado de cada palabra, en px
const KARAOKE_ADVANCE = 0.78; // ancho medio de glifo en mayúsculas pesadas, en em

// Scribe devuelve las palabras con puntuación; los anuncios de referencia no
// muestran ni un punto ni una coma. Se limpia solo el final de la palabra para
// no romper casos como "3,5" o "U$S".
const limpio = (s: string) => s.replace(/[.,;:]+$/u, "");

// Reparte las palabras de la página en hasta 3 líneas cortas, igual que los
// anuncios de referencia: la línea se corta por cantidad de caracteres, no por
// cantidad de palabras.
const splitLines = (ws: FrameWord[]): FrameWord[][] => {
  const lines: FrameWord[][] = [];
  let cur: FrameWord[] = [];
  let len = 0;
  for (const w of ws) {
    const largo = limpio(w.text).length;
    const add = largo + (cur.length > 0 ? 1 : 0);
    const full = len + add > KARAOKE_MAX_CHARS;
    const hayLugar = lines.length < KARAOKE_MAX_LINES - 1;
    if (cur.length > 0 && full && hayLugar) {
      lines.push(cur);
      cur = [];
      len = 0;
    }
    len += cur.length === 0 ? largo : add;
    cur.push(w);
  }
  if (cur.length > 0) lines.push(cur);
  return lines;
};

// Autoajuste por línea: una línea de una palabra corta se ve enorme y una de
// tres palabras se ve más chica. Ese contraste es el que da el ritmo
// tipográfico irregular del formato.
const lineFontSize = (line: FrameWord[]): number => {
  const palabras = line.map((w) => limpio(w.text));
  const chars = palabras.reduce((n, t) => n + t.length, 0);
  const masLarga = palabras.reduce((n, t) => Math.max(n, t.length), 1);
  const util = Math.max(160, KARAOKE_BOX_W - KARAOKE_WORD_GAP * 2 * palabras.length);
  // Dos límites: tiene que entrar la línea entera Y la palabra más larga. Una
  // palabra sola no se puede partir, así que si no entra se sale del cuadro.
  const porLinea = util / Math.max(chars, 1) / KARAOKE_ADVANCE;
  const porPalabra =
    (KARAOKE_BOX_W - KARAOKE_WORD_GAP * 2) / masLarga / KARAOKE_ADVANCE;
  const fit = Math.min(porLinea, porPalabra);
  return Math.max(KARAOKE_FONT_MIN, Math.min(KARAOKE_FONT_MAX, fit));
};

export const Captions: React.FC<{
  words: CaptionWord[];
  speed: number;
  highlightColor: string;
  captionsY: number;
  keywords?: CaptionKeyword[];
  autoKeywords?: boolean;
  captionStyle?: CaptionStyle;
}> = ({
  words,
  speed,
  highlightColor,
  captionsY,
  keywords = [],
  autoKeywords = true,
  captionStyle = "pop",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const karaoke = captionStyle === "karaoke";

  const pages = useMemo(
    () => buildPages(words, speed, fps, karaoke ? 5 : 3),
    [words, speed, fps, karaoke],
  );
  const kwMap = useMemo(() => buildKeywordMap(keywords), [keywords]);

  const page = pages.find((p) => frame >= p.fromF && frame < p.toF);
  if (!page) return null;

  if (karaoke) {
    // la palabra entra con un fundido corto, un toque antes de pronunciarse
    const leadF = Math.round(0.25 * fps);
    const fadeF = Math.max(1, Math.round(0.2 * fps));
    const dichas = page.words.filter((w) => frame >= w.startF).length;

    let cursor = 0;
    const lineas = splitLines(page.words).map((line) => {
      const desde = cursor;
      cursor += line.length;
      return { line, desde };
    });

    return (
      <div
        style={{
          position: "absolute",
          top: `${captionsY}%`,
          left: 0,
          width: "100%",
          padding: "0 50px",
          boxSizing: "border-box",
          textAlign: "center",
          fontFamily:
            "'Montserrat', 'Segoe UI Black', 'Arial Black', sans-serif",
          fontWeight: 900,
          textTransform: "uppercase",
          lineHeight: 1.02,
          WebkitTextStrokeWidth: `${KARAOKE_STROKE_PX}px`,
          WebkitTextStrokeColor: "#000",
          paintOrder: "stroke fill",
        }}
      >
        {lineas.map(({ line, desde }, li) => (
          <div key={li} style={{ fontSize: lineFontSize(line) }}>
            {line.map((w, wi) => {
              const i = desde + wi;
              const fadeStart = Math.max(page.fromF, w.startF - leadF);
              const opacity = Math.max(
                0,
                Math.min(1, (frame - fadeStart) / fadeF),
              );
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    margin: `0 ${KARAOKE_WORD_GAP}px`,
                    color: i < dichas ? KARAOKE_SPOKEN : KARAOKE_PENDING,
                    opacity,
                  }}
                >
                  {limpio(w.text)}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  const popIn = spring({
    frame: frame - page.fromF,
    fps,
    config: { damping: 200, stiffness: 400 },
    durationInFrames: 5,
  });
  const pageScale = interpolate(popIn, [0, 1], [0.88, 1]);

  // palabra activa: la última cuyo start ya pasó
  let activeIdx = 0;
  for (let i = 0; i < page.words.length; i++) {
    if (frame >= page.words[i].startF) activeIdx = i;
  }

  const stroke =
    "-4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 4px 4px 0 #000, " +
    "0 -4px 0 #000, 0 4px 0 #000, -4px 0 0 #000, 4px 0 0 #000, " +
    "0 10px 28px rgba(0,0,0,0.5)";

  return (
    <div
      style={{
        position: "absolute",
        top: `${captionsY}%`,
        left: 0,
        width: "100%",
        transform: `translateY(-50%) scale(${pageScale})`,
        display: "flex",
        justifyContent: "center",
        padding: "0 50px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontFamily:
            "'Montserrat', 'Segoe UI Black', 'Arial Black', sans-serif",
          fontWeight: 900,
          fontSize: 62,
          lineHeight: 1.15,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {page.words.map((w, i) => {
          const isActive = i === activeIdx;
          const kw =
            kwMap.get(norm(w.text)) ??
            (autoKeywords && /\d/.test(w.text)
              ? { color: KEYWORD_COLOR }
              : undefined);
          const wordPop = isActive
            ? spring({
                frame: frame - w.startF,
                fps,
                config: { damping: 200, stiffness: 500 },
                durationInFrames: 4,
              })
            : 0;
          // keyword: siempre coloreada y un toque más grande, aunque no esté activa
          const scale = (kw ? 1.06 : 1) + 0.08 * wordPop;
          const color = kw ? kw.color : isActive ? highlightColor : "#fff";
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                margin: "0 18px",
                color,
                textShadow: stroke,
                transform: `scale(${scale})`,
              }}
            >
              {w.text}
              {kw?.emoji ? (
                <span style={{ textShadow: "0 10px 28px rgba(0,0,0,0.5)" }}>
                  {" "}
                  {kw.emoji}
                </span>
              ) : null}
            </span>
          );
        })}
      </div>
    </div>
  );
};
