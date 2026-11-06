import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import type { BRollSegment } from "./types";

const FADE_FRAMES = 8;

const SFX_MAP = {
  swoosh: staticFile("assets/sfx/swoosh1.mp3"),
  click: staticFile("assets/sfx/click1.mp3"),
  whoosh: staticFile("assets/sfx/whoosh1.mp3"),
};

export const BRollOverlay: React.FC<{ segment: BRollSegment }> = ({ segment }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, FADE_FRAMES, segment.durationFrames - FADE_FRAMES, segment.durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scale = segment.kenBurns
    ? interpolate(frame, [0, segment.durationFrames], [1, 1.12], { extrapolateRight: "clamp" })
    : segment.transition === "zoomIn"
      ? interpolate(frame, [0, FADE_FRAMES], [1.15, 1], { extrapolateRight: "clamp" })
      : 1;

  const translateY = segment.transition === "slideUp"
    ? interpolate(frame, [0, FADE_FRAMES], [40, 0], { extrapolateRight: "clamp" })
    : 0;

  const fit = segment.objectFit ?? "cover";

  return (
    <AbsoluteFill style={{ opacity }}>
      {segment.sfx && (
        <Audio src={SFX_MAP[segment.sfx]} volume={0.6} />
      )}
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translateY(${translateY}px)`,
          overflow: "hidden",
          backgroundColor: segment.bgColor ?? "transparent",
        }}
      >
        {segment.type === "video" ? (
          <OffthreadVideo
            muted
            src={segment.src}
            startFrom={segment.startFrom ?? 0}
            style={{
              width: "100%",
              height: "100%",
              objectFit: fit,
            }}
          />
        ) : (
          <Img
            src={segment.src}
            style={{
              width: "100%",
              height: "100%",
              objectFit: fit,
            }}
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
