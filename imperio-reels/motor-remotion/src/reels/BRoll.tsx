import {
  AbsoluteFill,
  Easing,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { BRollItem } from "./types";

const FADE_FRAMES = 7;

// Se monta dentro de un <Sequence>, así que frame arranca en 0.
export const BRoll: React.FC<{
  item: BRollItem;
  durationInFrames: number;
}> = ({ item, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const kenBurns = item.kenBurns ?? true;
  const kbScale = kenBurns
    ? interpolate(frame, [0, durationInFrames], [1, 1.08], {
        extrapolateRight: "clamp",
      })
    : 1;

  const video = (
    <OffthreadVideo
      muted
      src={staticFile(item.src)}
      startFrom={Math.round((item.startFrom ?? 0) * fps)}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );

  // --- modo PiP: ventana flotante sobre el avatar (la cara sigue visible) ---
  if (item.pip) {
    const pop = spring({
      frame,
      fps,
      config: { damping: 14, stiffness: 160, mass: 0.7 },
    });
    const out = interpolate(
      frame,
      [durationInFrames - FADE_FRAMES, durationInFrames],
      [1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    return (
      <div
        style={{
          position: "absolute",
          top: `${item.pipY ?? 30}%`,
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          transform: "translateY(-50%)",
          opacity: out,
        }}
      >
        <div
          style={{
            width: 700,
            height: 880,
            borderRadius: 32,
            overflow: "hidden",
            border: "6px solid #fff",
            boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
            transform: `scale(${0.75 + 0.25 * pop})`,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              transform: `scale(${kbScale})`,
            }}
          >
            {video}
          </div>
        </div>
      </div>
    );
  }

  // --- pantalla completa con transición de entrada/salida ---
  const transition = item.transition ?? "fade";
  let opacity = 1;
  let transform = `scale(${kbScale})`;

  if (transition === "fade") {
    opacity = interpolate(
      frame,
      [0, FADE_FRAMES, durationInFrames - FADE_FRAMES, durationInFrames],
      [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
  } else if (transition === "cut") {
    // corte seco: aparece y desaparece sin fade (lee más nativo con jumpcut)
    opacity = 1;
  } else if (transition === "whip") {
    // entra barrido desde la derecha con blur, sale con fade corto
    const inX = interpolate(frame, [0, 6], [100, 0], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    const blur = interpolate(frame, [0, 6], [18, 0], {
      extrapolateRight: "clamp",
    });
    opacity = interpolate(
      frame,
      [durationInFrames - 4, durationInFrames],
      [1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    return (
      <AbsoluteFill style={{ opacity }}>
        <AbsoluteFill
          style={{
            transform: `translateX(${inX}%) scale(${kbScale})`,
            filter: blur > 0.5 ? `blur(${blur}px)` : undefined,
          }}
        >
          {video}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  } else if (transition === "slide") {
    // sube desde abajo con spring, sale con fade corto
    const up = spring({
      frame,
      fps,
      config: { damping: 16, stiffness: 140, mass: 0.8 },
    });
    opacity = interpolate(
      frame,
      [durationInFrames - 4, durationInFrames],
      [1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    transform = `translateY(${(1 - up) * 100}%) scale(${kbScale})`;
  }

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ transform }}>{video}</AbsoluteFill>
    </AbsoluteFill>
  );
};
