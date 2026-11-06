import { AbsoluteFill } from "remotion";

// Zonas donde la UI de Instagram/Meta Reels pisa el video (aprox, 1080x1920):
//   arriba ~12% (usuario/estado), abajo ~22% (caption, CTA, audio),
//   derecha ~12% (like/comentar/compartir/más).
// Solo para VALIDAR con un still — nunca en el render final.
export const SAFE = {
  top: 0.12,
  bottom: 0.22,
  right: 0.12,
} as const;

export const SafeZones: React.FC = () => {
  const band = (style: React.CSSProperties) => (
    <div
      style={{
        position: "absolute",
        background: "rgba(255,0,60,0.22)",
        border: "2px dashed rgba(255,0,60,0.8)",
        boxSizing: "border-box",
        ...style,
      }}
    />
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {band({ top: 0, left: 0, width: "100%", height: `${SAFE.top * 100}%` })}
      {band({ bottom: 0, left: 0, width: "100%", height: `${SAFE.bottom * 100}%` })}
      {band({ top: 0, right: 0, width: `${SAFE.right * 100}%`, height: "100%" })}
      <div
        style={{
          position: "absolute",
          top: `${SAFE.top * 100}%`,
          left: 0,
          right: `${SAFE.right * 100}%`,
          bottom: `${SAFE.bottom * 100}%`,
          border: "2px solid rgba(0,255,120,0.9)",
          boxSizing: "border-box",
        }}
      />
    </AbsoluteFill>
  );
};
