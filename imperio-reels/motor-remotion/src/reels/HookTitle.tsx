import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { HookTitleItem } from "./types";

// Titular grande sobre el avatar durante el hook (se monta en un <Sequence>).
// Mismo lenguaje visual que los captions: Montserrat 900 con stroke negro.
// `highlight` pinta esa(s) palabra(s) del texto con el color de marca.
export const HookTitle: React.FC<{
  item: HookTitleItem;
  color: string;
  durationInFrames: number;
}> = ({ item, color, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 180, mass: 0.7 },
  });
  const out = interpolate(
    frame,
    [durationInFrames - 6, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const stroke =
    "-4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 4px 4px 0 #000, " +
    "0 -4px 0 #000, 0 4px 0 #000, -4px 0 0 #000, 4px 0 0 #000, " +
    "0 12px 32px rgba(0,0,0,0.55)";

  // parte el texto en segmentos normal/highlight (case-insensitive)
  const hl = item.highlight?.trim();
  let segments: { text: string; hot: boolean }[] = [
    { text: item.text, hot: false },
  ];
  if (hl) {
    const idx = item.text.toLowerCase().indexOf(hl.toLowerCase());
    if (idx !== -1) {
      segments = [
        { text: item.text.slice(0, idx), hot: false },
        { text: item.text.slice(idx, idx + hl.length), hot: true },
        { text: item.text.slice(idx + hl.length), hot: false },
      ].filter((s) => s.text.length > 0);
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        top: `${item.y ?? 24}%`,
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "0 60px",
        boxSizing: "border-box",
        transform: `translateY(-50%) scale(${0.85 + 0.15 * pop})`,
        opacity: Math.min(pop * 1.4, 1) * out,
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontFamily:
            "'Montserrat', 'Segoe UI Black', 'Arial Black', sans-serif",
          fontWeight: 900,
          fontSize: 84,
          lineHeight: 1.12,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: "#fff",
          textShadow: stroke,
        }}
      >
        {segments.map((s, i) => (
          <span key={i} style={{ color: s.hot ? color : "#fff" }}>
            {s.text}
          </span>
        ))}
      </div>
    </div>
  );
};
