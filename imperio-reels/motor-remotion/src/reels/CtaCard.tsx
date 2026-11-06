import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { CtaCardItem } from "./types";

const TEXT_FONT = "'Segoe UI', 'Helvetica Neue', sans-serif";

// Se monta dentro de un <Sequence> sin duración (corre hasta el final).
// Estándar Imperio: CTA MINIMALISTA y elegante. Nada de tarjeta negra ni botón rojo
// gritón: una línea chica espaciada arriba (item.text) y una píldora blanca con el
// botón (item.buttonText) + flecha en círculo negro. Late apenas y la cruza un brillo.
// Escribir buttonText en oración normal ("Ver todo lo que incluye"), no en MAYÚSCULAS.
export const CtaCard: React.FC<{
  item: CtaCardItem;
  color: string;
}> = ({ item }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const enter = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 120, mass: 1 },
  });
  const pulse = 1 + 0.018 * Math.sin(t * Math.PI * 1.6) * enter;
  // brillo que cruza el botón cada 1.8s
  const cycle = ((((t - 0.6) % 1.8) + 1.8) % 1.8) / 0.9;
  const button = item.buttonText.replace(/\s*[→>»]+\s*$/, "");

  return (
    <div
      style={{
        position: "absolute",
        top: `${item.y ?? 72}%`,
        left: 0,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `translateY(calc(-50% + ${(1 - enter) * 40}px))`,
        opacity: enter,
      }}
    >
      {item.text ? (
        <div
          style={{
            fontFamily: TEXT_FONT,
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: 7,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.85)",
            textShadow: "0 2px 18px rgba(0,0,0,0.85)",
            marginBottom: 20,
            textAlign: "center",
            padding: "0 60px",
          }}
        >
          {item.text}
        </div>
      ) : null}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "16px 18px 16px 52px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.97)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.4)",
          transform: `scale(${pulse})`,
        }}
      >
        <span
          style={{
            fontFamily: TEXT_FONT,
            fontWeight: 700,
            fontSize: 38,
            letterSpacing: 0.3,
            color: "#0B0B0F",
            whiteSpace: "nowrap",
          }}
        >
          {button}
        </span>
        <span
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            background: "#0B0B0F",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h13M13 6l6 6-6 6"
              stroke="#FFFFFF"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(105deg, transparent 38%, rgba(180,180,190,0.35) 50%, transparent 62%)",
            backgroundSize: "300% 100%",
            backgroundPosition: `${interpolate(Math.min(cycle, 1), [0, 1], [130, -30])}% 0`,
            opacity: cycle < 1 ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
};
