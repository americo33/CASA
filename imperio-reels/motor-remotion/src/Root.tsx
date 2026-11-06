import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { Reel, REEL_FPS, calculateReelMetadata } from "./reels/Reel";
import {
  Kinetic,
  KINETIC_FPS,
  calculateKineticMetadata,
} from "./reels/Kinetic";
import type { KineticProps, ReelProps } from "./reels/types";

const reelDefaults: ReelProps = {
  videoSrc: "",
  durationSeconds: 30,
  speed: 1.3,
  words: [],
  brolls: [],
  music: null,
  highlightColor: "#E8372A",
  zoom: true,
  captionsY: 68,
  badges: [],
  priceTag: null,
  counter: null,
  ctaCard: null,
  punchZoom: null,
  zoomHits: [],
  impacts: [],
  sfxCues: [],
  hookTitle: null,
  progressBar: true,
  keywords: [],
  autoKeywords: true,
  grade: true,
  debugSafeZones: false,
  sfx: true,
  sfxVolume: 0.7,
  introSfx: false,
};

const kineticDefaults: KineticProps = {
  audioSrc: "",
  durationSeconds: 30,
  speed: 1.3,
  words: [],
  bg: "#0B0B0F",
  highlightColor: "#E8372A",
  music: null,
  priceTag: null,
  counter: null,
  ctaCard: null,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Composición genérica del pipeline /imperioreels — props via --props=<json> */}
      <Composition
        id="Reel"
        component={Reel}
        durationInFrames={900}
        fps={REEL_FPS}
        width={1080}
        height={1920}
        defaultProps={reelDefaults}
        calculateMetadata={calculateReelMetadata}
      />
      {/* Ad de texto animado + voz, sin avatar — props via --props=<json> */}
      <Composition
        id="Kinetic"
        component={Kinetic}
        durationInFrames={900}
        fps={KINETIC_FPS}
        width={1080}
        height={1920}
        defaultProps={kineticDefaults}
        calculateMetadata={calculateKineticMetadata}
      />
      <Composition
        id="AnuncioSueno"
        component={MyComposition}
        durationInFrames={5783}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
