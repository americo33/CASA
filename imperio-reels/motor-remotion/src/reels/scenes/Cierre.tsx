import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SCENE_FONT, type SceneComponent } from "./types";

// props: {
//   image: string        ruta en public/ — puede ser una landing MUY alta
//   scrollTo?: number    px que se desliza hacia arriba (default 1400). 0 = imagen fija con zoom
//   titulo?: string
//   sub?: string
//   flecha?: boolean     flecha rebotando abajo a la derecha (default true)
//   oscurecer?: number   0-1, velo negro para que el texto se lea (default 0.35)
// }
// Placa de cierre: la landing propia deslizándose hacia abajo, como la edita
// el usuario a mano. Texto y flecha animados encima.
export const Cierre: SceneComponent = ({ durationInFrames, color, props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const image = (props.image as string) ?? "";
  const scrollTo = (props.scrollTo as number) ?? 1400;
  const titulo = (props.titulo as string) ?? "";
  const sub = (props.sub as string) ?? "";
  const flecha = props.flecha !== false;
  const oscurecer = (props.oscurecer as number) ?? 0.35;

  // deslizamiento vertical: arranca quieto un toque y baja parejo
  const desplazamiento = interpolate(
    frame,
    [0, durationInFrames],
    [0, -scrollTo],
    { extrapolateRight: "clamp", easing: Easing.inOut(Easing.ease) },
  );
  // si no hay scroll, zoom lento
  const zoom =
    scrollTo === 0
      ? interpolate(frame, [0, durationInFrames], [1, 1.1], {
          extrapolateRight: "clamp",
        })
      : 1;

  const entra = spring({
    frame: frame - 5,
    fps,
    config: { damping: 16, stiffness: 150, mass: 0.9 },
  });
  const entraSub = spring({
    frame: frame - 14,
    fps,
    config: { damping: 16, stiffness: 150, mass: 0.9 },
  });
  const rebote = Math.sin((frame / fps) * Math.PI * 2.2) * 14;
  const flechaEntra = spring({
    frame: frame - 20,
    fps,
    config: { damping: 14, stiffness: 140, mass: 0.8 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {image ? (
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <Img
            src={staticFile(image)}
            style={{
              width: "100%",
              height: "auto",
              position: "absolute",
              top: 0,
              left: 0,
              transform: `translateY(${desplazamiento}px) scale(${zoom})`,
              transformOrigin: "top center",
            }}
          />
        </AbsoluteFill>
      ) : null}

      {/* velo para que el texto se lea sobre cualquier parte de la landing */}
      <AbsoluteFill
        style={{ backgroundColor: `rgba(0,0,0,${oscurecer})` }}
      />

      {titulo ? (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 60,
            paddingRight: 60,
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontFamily: SCENE_FONT,
              fontWeight: 900,
              fontSize: 104,
              lineHeight: 1.0,
              color: "#FFFFFF",
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: -1,
              textShadow:
                "0 0 40px rgba(0,0,0,1), 0 8px 30px rgba(0,0,0,0.95)",
              opacity: entra,
              transform: `translateY(${(1 - entra) * 45}px)`,
            }}
          >
            {titulo}
          </div>
          {sub ? (
            <div
              style={{
                marginTop: 20,
                fontFamily: SCENE_FONT,
                fontWeight: 800,
                fontSize: 52,
                color,
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: 2,
                textShadow: "0 0 30px rgba(0,0,0,1), 0 4px 18px rgba(0,0,0,1)",
                opacity: entraSub,
                transform: `translateY(${(1 - entraSub) * 28}px)`,
              }}
            >
              {sub}
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {flecha ? (
        <div
          style={{
            position: "absolute",
            right: 150,
            bottom: 250,
            opacity: flechaEntra,
            transform: `translateY(${rebote * flechaEntra}px) scale(${flechaEntra})`,
          }}
        >
          <svg width="120" height="140" viewBox="0 0 120 140" fill="none">
            <path
              d="M60 8 V104"
              stroke={color}
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M18 70 L60 116 L102 70"
              stroke={color}
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
