import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { BadgeItem } from "./types";

// Se monta dentro de un <Sequence>, así que frame arranca en 0.
export const Badge: React.FC<{
  item: BadgeItem;
  fallbackBg: string;
}> = ({ item, fallbackBg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.6 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: `${item.y ?? 20}%`,
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        transform: `translateY(-50%)`,
      }}
    >
      <div
        style={{
          transform: `scale(${pop}) rotate(-2deg)`,
          background: item.bg ?? fallbackBg,
          color: "#fff",
          fontFamily:
            "'Montserrat', 'Segoe UI Black', 'Arial Black', sans-serif",
          fontWeight: 900,
          fontSize: 58,
          textTransform: "uppercase",
          letterSpacing: 1,
          padding: "22px 46px",
          borderRadius: 999,
          boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
          whiteSpace: "nowrap",
        }}
      >
        {item.text}
      </div>
    </div>
  );
};
