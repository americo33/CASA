import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SCENE_FONT, type SceneComponent } from "./types";

// props: { title?: string, bars: [{ label: string, value: number }], suffix?: string }
// Chart de barras horizontales creciendo (prueba de números / comparaciones).
export const Barras: SceneComponent = ({
  durationInFrames,
  color,
  props,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = (props.title as string) ?? "";
  const bars = (props.bars as { label: string; value: number }[]) ?? [];
  const suffix = (props.suffix as string) ?? "";
  const max = Math.max(...bars.map((b) => b.value), 1);

  const stagger =
    bars.length > 1
      ? Math.max(4, Math.floor((durationInFrames * 0.4) / bars.length))
      : 0;
  const growFrames = Math.max(10, Math.round(durationInFrames * 0.4));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 90px",
        fontFamily: SCENE_FONT,
      }}
    >
      {title ? (
        <div
          style={{
            color: "#fff",
            fontWeight: 900,
            fontSize: 62,
            textTransform: "uppercase",
            textAlign: "center",
            marginBottom: 70,
            letterSpacing: 1,
          }}
        >
          {title}
        </div>
      ) : null}
      {bars.map((b, i) => {
        const local = frame - 6 - i * stagger;
        const enter = spring({
          frame: local,
          fps,
          config: { damping: 200, stiffness: 300 },
          durationInFrames: 6,
        });
        const grow = interpolate(local, [4, 4 + growFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        const shownNum = b.value * grow;
        const shown = Number.isInteger(b.value)
          ? String(Math.round(shownNum))
          : shownNum.toFixed(2).replace(".", ",");
        return (
          <div key={i} style={{ marginBottom: 52, opacity: enter }}>
            <div
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: 42,
                marginBottom: 16,
              }}
            >
              {b.label}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
              }}
            >
              <div
                style={{
                  height: 54,
                  width: `${(b.value / max) * 78 * grow}%`,
                  minWidth: 8,
                  background: i === 0 ? color : "rgba(255,255,255,0.28)",
                  borderRadius: 14,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
                }}
              />
              <div
                style={{
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 48,
                  whiteSpace: "nowrap",
                }}
              >
                {shown}
                {suffix}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
