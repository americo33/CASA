import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SCENE_FONT, type SceneComponent } from "./types";

// props: { value: number, prefix?: string, suffix?: string, label: string }
// Número gigante contando hacia arriba (dato de volumen / prueba).
export const Stat: SceneComponent = ({ durationInFrames, color, props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const value = (props.value as number) ?? 0;
  const prefix = (props.prefix as string) ?? "";
  const suffix = (props.suffix as string) ?? "";
  const label = (props.label as string) ?? "";

  const enter = spring({
    frame: frame - 3,
    fps,
    config: { damping: 14, stiffness: 180, mass: 0.7 },
  });
  const countFrames = Math.max(12, Math.round(durationInFrames * 0.55));
  const shown = Math.round(
    interpolate(frame, [5, 5 + countFrames], [0, value], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }),
  );
  const landed = frame - (5 + countFrames);
  const landPop =
    landed >= 0
      ? spring({
          frame: landed,
          fps,
          config: { damping: 10, stiffness: 260, mass: 0.5 },
          durationInFrames: 10,
        })
      : 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: SCENE_FONT,
        opacity: enter,
        transform: `scale(${interpolate(enter, [0, 1], [0.85, 1]) * (1 + 0.05 * landPop)})`,
      }}
    >
      <div
        style={{
          color,
          fontWeight: 900,
          fontSize: 190,
          lineHeight: 1,
          textShadow: "0 16px 50px rgba(0,0,0,0.55)",
        }}
      >
        {prefix}
        {shown.toLocaleString("es-AR")}
        {suffix}
      </div>
      <div
        style={{
          color: "#fff",
          fontWeight: 800,
          fontSize: 54,
          textTransform: "uppercase",
          letterSpacing: 2,
          marginTop: 34,
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        {label}
      </div>
    </div>
  );
};
