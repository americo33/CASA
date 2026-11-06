import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

const FADE_FRAMES = 7;

// Envuelve una escena animada para que ocupe el lugar de un b-roll, con fade de
// entrada/salida.
// Estándar Imperio: NUNCA fondo negro liso. Por default la escena va sobre el mismo
// video de abajo, DESENFOCADO (backdrop blur) y apenas oscurecido para que el texto se lea.
// Para un fondo opaco propio pasar "bg" con un color sin transparencia.
export const SceneOverlay: React.FC<{
  durationInFrames: number;
  bg?: string;
  children: React.ReactNode;
}> = ({ durationInFrames, bg = "rgba(8,8,12,0.45)", children }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, FADE_FRAMES, durationInFrames - FADE_FRAMES, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundColor: bg,
        backdropFilter: "blur(26px) saturate(1.1)",
        WebkitBackdropFilter: "blur(26px) saturate(1.1)",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
