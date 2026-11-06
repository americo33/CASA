import { useCurrentFrame, useVideoConfig } from "remotion";

// Barra de progreso arriba: se llena a lo largo de todo el reel. Truco de
// retención — el cerebro quiere verla completarse. Va a y=2% para quedar
// visible bajo la UI de Reels sin molestar.
export const ProgressBar: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = Math.min(frame / Math.max(durationInFrames - 1, 1), 1);

  return (
    <div
      style={{
        position: "absolute",
        top: "2%",
        left: "4%",
        width: "92%",
        height: 12,
        borderRadius: 999,
        background: "rgba(255,255,255,0.28)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          borderRadius: 999,
          background: color,
        }}
      />
    </div>
  );
};
