import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { CounterItem } from "./types";

const FONT =
  "'Montserrat', 'Segoe UI Black', 'Arial Black', sans-serif";

// Se monta dentro de un <Sequence>. El número cuenta de `from` a `to`
// durante el 60% de la duración y después queda clavado.
export const Counter: React.FC<{
  item: CounterItem;
  durationInFrames: number;
  color: string;
}> = ({ item, durationInFrames, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 200, mass: 0.6 },
  });

  const countFrames = Math.max(1, Math.round(durationInFrames * 0.6));
  const value = Math.round(
    interpolate(frame, [4, 4 + countFrames], [item.from, item.to], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }),
  );

  // pulso corto cuando el número clava en el destino
  const landed = frame - (4 + countFrames);
  const landPop =
    landed >= 0
      ? spring({
          frame: landed,
          fps,
          config: { damping: 10, stiffness: 260, mass: 0.5 },
          durationInFrames: 10,
        })
      : 0;
  const scale = enter * (1 + 0.06 * landPop);

  return (
    <div
      style={{
        position: "absolute",
        top: `${item.y ?? 24}%`,
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        transform: "translateY(-50%)",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          background: "rgba(8,8,12,0.82)",
          border: `4px solid ${color}`,
          color: "#fff",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 58,
          textTransform: "uppercase",
          letterSpacing: 1,
          padding: "20px 44px",
          borderRadius: 999,
          boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
          whiteSpace: "nowrap",
        }}
      >
        {item.prefix ? `${item.prefix} ` : ""}
        <span style={{ color, fontSize: 66 }}>{value}</span>
        {item.suffix ? ` ${item.suffix}` : ""}
      </div>
    </div>
  );
};
