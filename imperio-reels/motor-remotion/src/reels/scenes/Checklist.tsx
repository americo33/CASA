import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENE_FONT, type SceneComponent } from "./types";

// props: { title?: string, items: string[] }
// Beneficios / pasos del mecanismo apareciendo con tilde animada.
export const Checklist: SceneComponent = ({
  durationInFrames,
  color,
  props,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = (props.title as string) ?? "";
  const items = (props.items as string[]) ?? [];

  const stagger =
    items.length > 1
      ? Math.max(4, Math.floor((durationInFrames * 0.55) / items.length))
      : 0;

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
            fontSize: 66,
            textTransform: "uppercase",
            textAlign: "center",
            marginBottom: 60,
            letterSpacing: 1,
          }}
        >
          {title}
        </div>
      ) : null}
      {items.map((item, i) => {
        const enter = spring({
          frame: frame - 6 - i * stagger,
          fps,
          config: { damping: 15, stiffness: 190, mass: 0.7 },
        });
        const checkPop = spring({
          frame: frame - 10 - i * stagger,
          fps,
          config: { damping: 10, stiffness: 280, mass: 0.5 },
        });
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 30,
              marginBottom: 44,
              opacity: enter,
              transform: `translateX(${interpolate(enter, [0, 1], [-80, 0])}px)`,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                minWidth: 72,
                borderRadius: "50%",
                background: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${checkPop})`,
                boxShadow: "0 8px 22px rgba(0,0,0,0.45)",
                color: "#fff",
                fontSize: 44,
                fontWeight: 900,
              }}
            >
              ✓
            </div>
            <div
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: 50,
                lineHeight: 1.2,
              }}
            >
              {item}
            </div>
          </div>
        );
      })}
    </div>
  );
};
