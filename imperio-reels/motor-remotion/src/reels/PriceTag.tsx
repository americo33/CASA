import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { PriceTagItem } from "./types";

const FONT =
  "'Montserrat', 'Segoe UI Black', 'Arial Black', sans-serif";

// Se monta dentro de un <Sequence>, así que frame arranca en 0.
// Secuencia: entra el precio viejo → línea roja lo tacha → el nuevo aparece con spring.
export const PriceTag: React.FC<{
  item: PriceTagItem;
  color: string;
}> = ({ item, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 300 },
    durationInFrames: 6,
  });

  const strike = interpolate(frame, [8, 16], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const newPop = spring({
    frame: frame - 18,
    fps,
    config: { damping: 11, stiffness: 190, mass: 0.7 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: `${item.y ?? 30}%`,
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 36,
        transform: `translateY(-50%) scale(${interpolate(enter, [0, 1], [0.85, 1])})`,
        opacity: enter,
        fontFamily: FONT,
        fontWeight: 900,
      }}
    >
      <div
        style={{
          position: "relative",
          fontSize: 78,
          color: "#fff",
          opacity: 0.85,
          textShadow: "0 6px 18px rgba(0,0,0,0.55)",
          padding: "6px 10px",
        }}
      >
        {item.oldPrice}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            width: `${strike}%`,
            height: 9,
            background: color,
            borderRadius: 6,
            transform: "rotate(-7deg)",
            boxShadow: "0 3px 10px rgba(0,0,0,0.4)",
          }}
        />
      </div>
      <div
        style={{
          transform: `scale(${newPop}) rotate(-2deg)`,
          background: color,
          color: "#fff",
          fontSize: 92,
          padding: "16px 44px",
          borderRadius: 26,
          boxShadow: "0 14px 36px rgba(0,0,0,0.5)",
        }}
      >
        {item.newPrice}
      </div>
    </div>
  );
};
