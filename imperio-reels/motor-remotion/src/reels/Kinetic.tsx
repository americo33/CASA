import { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { buildPages } from "./Captions";
import { Counter } from "./Counter";
import { CtaCard } from "./CtaCard";
import { PriceTag } from "./PriceTag";
import type { KineticProps } from "./types";

export const KINETIC_FPS = 30;

export const calculateKineticMetadata: CalculateMetadataFunction<
  KineticProps
> = ({ props }) => {
  const speed = props.speed ?? 1.3;
  return {
    durationInFrames: Math.max(
      1,
      Math.ceil((props.durationSeconds / speed) * KINETIC_FPS),
    ),
  };
};

const FONT =
  "'Montserrat', 'Segoe UI Black', 'Arial Black', sans-serif";

// Ad de texto puro animado + voz (kinetic typography). Sin avatar: cero HeyGen.
export const Kinetic: React.FC<KineticProps> = ({
  audioSrc,
  speed = 1.3,
  words = [],
  bg = "#0B0B0F",
  highlightColor = "#E8372A",
  music = null,
  priceTag = null,
  counter = null,
  ctaCard = null,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const toFrames = (s: number) => Math.round((s / speed) * fps);

  const pages = useMemo(
    () => buildPages(words, speed, fps, 4),
    [words, speed, fps],
  );
  const pageIdx = pages.findIndex((p) => frame >= p.fromF && frame < p.toF);
  const page = pageIdx === -1 ? null : pages[pageIdx];

  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      {/* viñeta sutil para que el texto respire */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 55%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {page ? (
        <PageView
          key={pageIdx}
          page={page}
          pageIdx={pageIdx}
          frame={frame}
          fps={fps}
          highlightColor={highlightColor}
        />
      ) : null}

      {priceTag ? (
        <Sequence
          from={toFrames(priceTag.start)}
          durationInFrames={toFrames(priceTag.duration)}
        >
          <PriceTag item={priceTag} color={highlightColor} />
        </Sequence>
      ) : null}

      {counter ? (
        <Sequence
          from={toFrames(counter.start)}
          durationInFrames={toFrames(counter.duration)}
        >
          <Counter
            item={counter}
            durationInFrames={toFrames(counter.duration)}
            color={highlightColor}
          />
        </Sequence>
      ) : null}

      {ctaCard ? (
        <Sequence from={toFrames(ctaCard.start)}>
          <CtaCard item={ctaCard} color={highlightColor} />
        </Sequence>
      ) : null}

      <Audio src={staticFile(audioSrc)} playbackRate={speed} />
      {music ? (
        <Audio
          loop
          src={staticFile(music.src)}
          volume={music.volume ?? 0.032}
        />
      ) : null}
    </AbsoluteFill>
  );
};

const PageView: React.FC<{
  page: ReturnType<typeof buildPages>[number];
  pageIdx: number;
  frame: number;
  fps: number;
  highlightColor: string;
}> = ({ page, pageIdx, frame, fps, highlightColor }) => {
  const pop = spring({
    frame: frame - page.fromF,
    fps,
    config: { damping: 16, stiffness: 220, mass: 0.7 },
  });
  // rotación leve alternada, determinística por página
  const rotate = ((pageIdx * 37) % 5) - 2;

  let activeIdx = 0;
  for (let i = 0; i < page.words.length; i++) {
    if (frame >= page.words[i].startF) activeIdx = i;
  }

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 70px",
        transform: `scale(${interpolate(pop, [0, 1], [0.8, 1])}) rotate(${rotate}deg)`,
        opacity: pop,
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 78,
          lineHeight: 1.12,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: "#fff",
        }}
      >
        {page.words.map((w, i) => {
          const isActive = i === activeIdx;
          const wordPop = isActive
            ? spring({
                frame: frame - w.startF,
                fps,
                config: { damping: 200, stiffness: 500 },
                durationInFrames: 4,
              })
            : 0;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                margin: "0 20px",
                color: isActive ? highlightColor : "#fff",
                transform: `scale(${1 + 0.07 * wordPop})`,
                textShadow: "0 12px 40px rgba(0,0,0,0.6)",
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
