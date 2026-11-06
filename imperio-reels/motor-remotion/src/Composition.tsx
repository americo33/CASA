import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { BRollOverlay } from "./BRollOverlay";
import type { BRollSegment } from "./types";

const FPS = 30;
const sec = (s: number) => Math.round(s * FPS);

const BROLL_SEGMENTS: BRollSegment[] = [
  {
    type: "image",
    src: staticFile("assets/Up at 3AM Again_.jpg"),
    startFrame: sec(0.5),
    durationFrames: sec(4),
    transition: "crossfade",
    kenBurns: true,
    sfx: "whoosh",
  },
  {
    type: "video",
    src: staticFile("assets/optimized/broll4.mp4"),
    startFrame: sec(5.5),
    durationFrames: sec(4),
    startFrom: sec(2),
    transition: "crossfade",
    sfx: "swoosh",
  },
  {
    type: "image",
    src: staticFile("assets/Exaustão mental em mães_ por que você nunca consegue descansar_.jpg"),
    startFrame: sec(11),
    durationFrames: sec(4),
    transition: "crossfade",
    kenBurns: true,
    sfx: "swoosh",
  },
  {
    type: "video",
    src: staticFile("assets/optimized/broll2.mp4"),
    startFrame: sec(34),
    durationFrames: sec(4),
    startFrom: 0,
    transition: "zoomIn",
    sfx: "click",
  },
  {
    type: "video",
    src: staticFile("assets/optimized/broll1.mp4"),
    startFrame: sec(44.5),
    durationFrames: sec(5),
    startFrom: sec(5),
    transition: "crossfade",
    sfx: "swoosh",
  },
  {
    type: "image",
    src: staticFile("assets/ventanas-sueno.png"),
    startFrame: sec(56),
    durationFrames: sec(4.5),
    transition: "slideUp",
    kenBurns: false,
    sfx: "click",
    objectFit: "contain",
    bgColor: "#1a1040",
  },
  {
    type: "video",
    src: staticFile("assets/optimized/broll3.mp4"),
    startFrame: sec(66),
    durationFrames: sec(5),
    startFrom: 0,
    transition: "crossfade",
    sfx: "swoosh",
  },
  {
    type: "video",
    src: staticFile("assets/optimized/broll5.mp4"),
    startFrame: sec(96.5),
    durationFrames: sec(5),
    startFrom: sec(3),
    transition: "zoomIn",
    sfx: "click",
  },
  {
    type: "image",
    src: staticFile("assets/Exaustão mental em mães_ por que você nunca consegue descansar_.jpg"),
    startFrame: sec(105),
    durationFrames: sec(5),
    transition: "crossfade",
    kenBurns: true,
    sfx: "whoosh",
  },
  {
    type: "video",
    src: staticFile("assets/optimized/broll6.mp4"),
    startFrame: sec(119),
    durationFrames: sec(4.5),
    startFrom: sec(2),
    transition: "crossfade",
    sfx: "swoosh",
  },
  {
    type: "video",
    src: staticFile("assets/optimized/broll1.mp4"),
    startFrame: sec(129),
    durationFrames: sec(5),
    startFrom: sec(15),
    transition: "crossfade",
    sfx: "swoosh",
  },
  {
    type: "image",
    src: staticFile("assets/ventanas-sueno.png"),
    startFrame: sec(135),
    durationFrames: sec(4),
    transition: "slideUp",
    kenBurns: false,
    sfx: "click",
    objectFit: "contain",
    bgColor: "#1a1040",
  },
  {
    type: "image",
    src: staticFile("assets/ChatGPT Image 19 jun 2026, 11_05_11 a.m. (2).png"),
    startFrame: sec(166),
    durationFrames: sec(4.5),
    transition: "zoomIn",
    kenBurns: true,
    sfx: "whoosh",
  },
  {
    type: "video",
    src: staticFile("assets/optimized/broll4.mp4"),
    startFrame: sec(179),
    durationFrames: sec(5),
    startFrom: sec(10),
    transition: "crossfade",
    sfx: "swoosh",
  },
];

export const MyComposition = () => {
  const frame = useCurrentFrame();

  const mainScale = interpolate(
    frame % sec(20),
    [0, sec(20)],
    [1, 1.03],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${mainScale})`,
          transformOrigin: "center center",
        }}
      >
        <OffthreadVideo
          src={staticFile("assets/optimized/main.mp4")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </AbsoluteFill>

      {BROLL_SEGMENTS.map((segment, i) => (
        <Sequence
          key={i}
          from={segment.startFrame}
          durationInFrames={segment.durationFrames}
        >
          <BRollOverlay segment={segment} />
        </Sequence>
      ))}

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
