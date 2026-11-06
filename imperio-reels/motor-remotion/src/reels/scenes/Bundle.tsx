import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SCENE_FONT, SCENE_TEXT_FONT, type SceneComponent } from "./types";

// props: {
//   bg: string                 imagen de fondo (se desenfoca y oscurece)
//   kickerSmall?: string       línea chica arriba ("INCLUYE")
//   kicker?: string            titular arriba ("3 BONOS DE REGALO")
//   kickerAt?: number          seg (locales a la escena) en que entra el titular
//   hero: { src, aspect, slot: {x,y,w}, big?: {x,y,w}, moveAt? }
//   items: [{ src, aspect, at, from: "left"|"right"|"top"|"bottom", slot: {x,y,w}, rot? }]
//   cta?: { at, button, sub? }
// }
// Pack de producto estilo "bundle": el producto principal entra solo y grande,
// después los bonos llegan deslizándose desde los costados y se acomodan
// alrededor. aspect = ancho/alto del PNG. Coordenadas en px del lienzo 1080x1920.

type Slot = { x: number; y: number; w: number };
type Item = {
  src: string;
  aspect: number;
  at: number;
  from?: "left" | "right" | "top" | "bottom";
  slot: Slot;
  rot?: number;
};

const SPRING = { damping: 17, stiffness: 120, mass: 1 };

const FROM: Record<string, { dx: number; dy: number; rot: number }> = {
  left: { dx: -900, dy: 60, rot: -16 },
  right: { dx: 900, dy: 60, rot: 16 },
  top: { dx: 120, dy: -1100, rot: 10 },
  bottom: { dx: 0, dy: 1000, rot: 0 },
};

const Mockup: React.FC<{
  src: string;
  x: number;
  y: number;
  w: number;
  aspect: number;
  rot: number;
  dx: number;
  dy: number;
  scale: number;
  opacity: number;
  float: number;
  shine: number;
  z: number;
  blur?: number;
}> = ({ src, x, y, w, aspect, rot, dx, dy, scale, opacity, float, shine, z, blur = 0 }) => {
  const h = w / aspect;
  const url = staticFile(src);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        zIndex: z,
        opacity,
        transform: `translate(${dx}px, ${dy + float}px) rotate(${rot}deg) scale(${scale})`,
        transformOrigin: "50% 60%",
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
      }}
    >
      <Img
        src={url}
        style={{
          width: "100%",
          height: "100%",
          filter:
            "drop-shadow(0 38px 46px rgba(0,0,0,0.62)) drop-shadow(0 6px 10px rgba(0,0,0,0.35))",
        }}
      />
      {/* reflejo de luz que barre la tapa, recortado a la silueta del mockup */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.42) 50%, transparent 62%)",
          backgroundSize: "320% 100%",
          backgroundPosition: `${interpolate(shine, [0, 1], [130, -30])}% 0`,
          opacity: shine > 0 && shine < 1 ? 1 : 0,
          WebkitMaskImage: `url(${url})`,
          WebkitMaskSize: "100% 100%",
          maskImage: `url(${url})`,
          maskSize: "100% 100%",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
};

export const Bundle: SceneComponent = ({ durationInFrames, props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const bg = (props.bg as string) ?? "";
  const kickerSmall = (props.kickerSmall as string) ?? "";
  const kicker = (props.kicker as string) ?? "";
  const kickerAt = (props.kickerAt as number) ?? 0.8;
  const hero = props.hero as Item & { big?: Slot; moveAt?: number };
  const items = (props.items as Item[]) ?? [];
  const cta = props.cta as { at: number; button: string; sub?: string } | undefined;

  const sp = (at: number, cfg = SPRING) =>
    spring({ frame: frame - Math.round(at * fps), fps, config: cfg });
  const shineAt = (at: number) =>
    interpolate(frame, [Math.round((at + 0.35) * fps), Math.round((at + 1.25) * fps)], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // empuje lento de cámara sobre todo el pack
  const push = interpolate(frame, [0, durationInFrames], [1, 1.045]);
  const bgZoom = interpolate(frame, [0, durationInFrames], [1.12, 1.24]);

  // héroe: entra grande desde abajo y después se corre a su lugar
  const heroIn = sp(0);
  const heroMove = hero.moveAt !== undefined ? sp(hero.moveAt, { damping: 20, stiffness: 90, mass: 1 }) : 1;
  const big = hero.big ?? hero.slot;
  const hx = interpolate(heroMove, [0, 1], [big.x, hero.slot.x]);
  const hy = interpolate(heroMove, [0, 1], [big.y, hero.slot.y]);
  const hw = interpolate(heroMove, [0, 1], [big.w, hero.slot.w]);

  const kIn = sp(kickerAt);
  const ctaIn = cta ? sp(cta.at) : 0;
  const pulse = cta ? 1 + 0.018 * Math.sin((t - cta.at) * Math.PI * 1.6) * ctaIn : 1;
  // brillo del botón, se repite cada 1.8s
  const btnShine = cta ? (((t - cta.at - 0.6) % 1.8) + 1.8) % 1.8 / 0.9 : 2;

  return (
    <AbsoluteFill style={{ backgroundColor: "#07070A", overflow: "hidden" }}>
      {bg ? (
        <Img
          src={staticFile(bg)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${bgZoom})`,
            filter: "blur(30px) brightness(0.40) saturate(1.15)",
          }}
        />
      ) : null}
      {/* halo cálido detrás del pack + viñeta */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 60% 38% at 50% 44%, rgba(255,214,150,0.22) 0%, rgba(255,214,150,0.06) 45%, transparent 70%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 22%, transparent 58%, rgba(0,0,0,0.82) 82%, rgba(0,0,0,0.9) 100%)",
        }}
      />

      {/* titular */}
      {kicker ? (
        <div
          style={{
            position: "absolute",
            top: 232,
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: kIn,
            transform: `translateY(${(1 - kIn) * -30}px)`,
          }}
        >
          {kickerSmall ? (
            <div
              style={{
                fontFamily: SCENE_TEXT_FONT,
                fontWeight: 600,
                fontSize: 28,
                letterSpacing: 9,
                color: "rgba(255,255,255,0.72)",
                marginBottom: 6,
              }}
            >
              {kickerSmall}
            </div>
          ) : null}
          <div
            style={{
              fontFamily: SCENE_FONT,
              fontWeight: 900,
              fontSize: 64,
              letterSpacing: 1,
              color: "#FFFFFF",
              textShadow: "0 6px 30px rgba(0,0,0,0.7)",
            }}
          >
            {kicker}
          </div>
        </div>
      ) : null}

      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 42%" }}>
        <Mockup
          src={hero.src}
          x={hx}
          y={hy}
          w={hw}
          aspect={hero.aspect}
          rot={(hero.rot ?? 0) * heroMove}
          dx={0}
          dy={(1 - heroIn) * 700}
          scale={0.8 + 0.2 * heroIn}
          opacity={Math.min(1, heroIn * 1.6)}
          float={Math.sin(t * Math.PI * 0.9) * 7 * heroIn}
          shine={shineAt(0)}
          z={2}
        />
        {items.map((it, i) => {
          const p = sp(it.at);
          const f = FROM[it.from ?? "right"];
          return (
            <Mockup
              key={i}
              src={it.src}
              x={it.slot.x}
              y={it.slot.y}
              w={it.slot.w}
              aspect={it.aspect}
              rot={(it.rot ?? 0) + (1 - p) * f.rot}
              dx={(1 - p) * f.dx}
              dy={(1 - p) * f.dy}
              scale={0.9 + 0.1 * p}
              opacity={Math.min(1, p * 2)}
              float={Math.sin(t * Math.PI * 0.9 + (i + 1) * 1.7) * 6 * p}
              shine={shineAt(it.at)}
              z={it.from === "top" ? 1 : 3 + i}
              blur={(1 - p) * 14}
            />
          );
        })}
      </AbsoluteFill>

      {/* CTA minimalista */}
      {cta ? (
        <div
          style={{
            position: "absolute",
            top: 1336,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: ctaIn,
            transform: `translateY(${(1 - ctaIn) * 40}px)`,
          }}
        >
          {cta.sub ? (
            <div
              style={{
                fontFamily: SCENE_TEXT_FONT,
                fontWeight: 600,
                fontSize: 25,
                letterSpacing: 7,
                color: "rgba(255,255,255,0.78)",
                marginBottom: 20,
                textTransform: "uppercase",
              }}
            >
              {cta.sub}
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
                fontFamily: SCENE_TEXT_FONT,
                fontWeight: 700,
                fontSize: 38,
                letterSpacing: 0.3,
                color: "#0B0B0F",
              }}
            >
              {cta.button}
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
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h13M13 6l6 6-6 6" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.0) 40%, rgba(180,180,190,0.35) 50%, transparent 60%)",
                backgroundSize: "300% 100%",
                backgroundPosition: `${interpolate(Math.min(btnShine, 1), [0, 1], [130, -30])}% 0`,
                opacity: btnShine < 1 ? 1 : 0,
              }}
            />
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
