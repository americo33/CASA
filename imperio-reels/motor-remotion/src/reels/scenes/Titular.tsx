import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SCENE_FONT, type SceneComponent } from "./types";

// props: { kicker?: string, headline: string, highlight?: string }
// Titular estilo nota de diario con resaltador de marca barriendo la frase clave.
export const Titular: SceneComponent = ({ color, props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const kicker = (props.kicker as string) ?? "";
  const headline = (props.headline as string) ?? "";
  const highlight = (props.highlight as string) ?? "";

  const enter = spring({
    frame: frame - 3,
    fps,
    config: { damping: 15, stiffness: 170, mass: 0.8 },
  });
  const sweep = interpolate(frame, [14, 32], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const idx = highlight ? headline.indexOf(highlight) : -1;
  const before = idx >= 0 ? headline.slice(0, idx) : headline;
  const after = idx >= 0 ? headline.slice(idx + highlight.length) : "";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 70px",
      }}
    >
      <div
        style={{
          background: "#FAF7F0",
          borderRadius: 30,
          padding: "70px 64px",
          width: "100%",
          boxShadow: "0 24px 70px rgba(0,0,0,0.5)",
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [70, 0])}px) rotate(-1.5deg)`,
        }}
      >
        {kicker ? (
          <div
            style={{
              fontFamily: SCENE_FONT,
              fontWeight: 900,
              fontSize: 34,
              letterSpacing: 4,
              textTransform: "uppercase",
              color,
              marginBottom: 28,
            }}
          >
            {kicker}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 700,
            fontSize: 68,
            lineHeight: 1.22,
            color: "#111",
          }}
        >
          {before}
          {idx >= 0 ? (
            <span style={{ position: "relative", whiteSpace: "pre-wrap" }}>
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: "8%",
                  height: "88%",
                  width: `${sweep}%`,
                  background: color,
                  opacity: 0.45,
                  borderRadius: 10,
                }}
              />
              <span style={{ position: "relative" }}>{highlight}</span>
            </span>
          ) : null}
          {after}
        </div>
      </div>
    </div>
  );
};
