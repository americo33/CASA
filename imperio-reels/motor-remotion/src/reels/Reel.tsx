import {
  AbsoluteFill,
  Audio,
  Easing,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { BRoll } from "./BRoll";
import { Badge } from "./Badge";
import { Captions } from "./Captions";
import { Counter } from "./Counter";
import { CtaCard } from "./CtaCard";
import { HookTitle } from "./HookTitle";
import { PriceTag } from "./PriceTag";
import { ProgressBar } from "./ProgressBar";
import { SafeZones } from "./SafeZones";
import { SceneOverlay } from "./SceneOverlay";
import { Sfx, rotateSfx, type SfxName } from "./Sfx";
import { SCENES } from "./scenes/registry";
import type { ReelProps } from "./types";

export const REEL_FPS = 30;

// La duración final = duración original / speed (el 1.3x se aplica acá,
// NO correr atempo/setpts con ffmpeg después).
export const calculateReelMetadata: CalculateMetadataFunction<ReelProps> = ({
  props,
}) => {
  const speed = props.speed ?? 1.3;
  return {
    durationInFrames: Math.max(
      1,
      Math.ceil((props.durationSeconds / speed) * REEL_FPS),
    ),
  };
};

export const Reel: React.FC<ReelProps> = ({
  videoSrc,
  speed = 1.3,
  words = [],
  brolls = [],
  music = null,
  highlightColor = "#E8372A",
  zoom = true,
  captionsY = 68,
  captionStyle = "pop",
  badges = [],
  scenes = [],
  priceTag = null,
  counter = null,
  ctaCard = null,
  punchZoom = null,
  zoomHits = [],
  impacts = [],
  sfxCues = [],
  hookTitle = null,
  progressBar = true,
  keywords = [],
  autoKeywords = true,
  grade = true,
  debugSafeZones = false,
  sfx = true,
  sfxVolume = 0.7,
  introSfx = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // tiempos de props (timeline original del audio) → frames del timeline final
  const toFrames = (s: number) => Math.round((s / speed) * fps);
  // resuelve el SFX de entrada: respeta el override del item (false = mudo), si no el default
  const pickSfx = (
    override: SfxName | false | undefined,
    fallback: SfxName,
  ): SfxName | null =>
    !sfx ? null : override === false ? null : (override ?? fallback);

  // Escala del video base. Con punchZoom, alterna el nivel de zoom en cada corte
  // del jumpcut (empuje con ease corto) para disimular el salto; si no, drift lento.
  let baseScale = 1;
  if (punchZoom && punchZoom.cuts.length > 0) {
    const amount = punchZoom.amount ?? 0.05;
    const cutsF = punchZoom.cuts.map(toFrames);
    let seg = 0;
    while (seg < cutsF.length && frame >= cutsF[seg]) seg++;
    const segStartF = seg === 0 ? 0 : cutsF[seg - 1];
    const target = seg % 2 === 0 ? 0 : amount; // alterna 1.0 ↔ 1+amount
    const prev = seg === 0 ? 0 : (seg - 1) % 2 === 0 ? 0 : amount;
    const eased = interpolate(frame, [segStartF, segStartF + 5], [prev, target], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    baseScale = 1 + eased + 0.0004 * (frame - segStartF); // + micro drift dentro del segmento
  } else if (zoom) {
    baseScale = Math.min(1 + 0.0006 * frame, 1.12);
  }

  // Punch-zoom en palabras clave: empuje rápido (4f), hold corto y vuelta suave.
  // Se suma al zoom base — funciona con o sin jumpcut.
  let hitBoost = 0;
  for (const h of zoomHits) {
    const hf = toFrames(h.start);
    const d = frame - hf;
    if (d < 0 || d > 26) continue;
    const amount = h.amount ?? 0.12;
    const env =
      d <= 4
        ? interpolate(d, [0, 4], [0, 1], {
            easing: Easing.out(Easing.cubic),
            extrapolateRight: "clamp",
          })
        : d <= 14
          ? 1
          : interpolate(d, [14, 26], [1, 0], {
              easing: Easing.inOut(Easing.quad),
              extrapolateRight: "clamp",
            });
    hitBoost += amount * env;
  }

  // Impacto del dato duro: micro-shake + pulso de zoom que decaen en ~12 frames.
  let shakeX = 0;
  let shakeY = 0;
  let pulse = 0;
  for (const im of impacts) {
    const d = frame - toFrames(im.start);
    if (d < 0 || d > 12) continue;
    const decay = 1 - d / 12;
    shakeX += 12 * decay * Math.sin(d * 2.4);
    shakeY += 9 * decay * Math.cos(d * 1.9);
    pulse += 0.06 * decay;
  }

  const baseTransform = `translate(${shakeX.toFixed(2)}px, ${shakeY.toFixed(2)}px) scale(${baseScale + hitBoost + pulse})`;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {sfx && introSfx ? <Sfx name={introSfx} volume={sfxVolume} /> : null}
      {impacts.map((im, i) => {
        const snd = pickSfx(im.sfx, "impact");
        return snd ? (
          <Sequence
            key={`impact-${i}`}
            from={toFrames(im.start)}
            durationInFrames={90}
          >
            <Sfx name={snd} volume={sfxVolume} />
          </Sequence>
        ) : null;
      })}
      {sfx
        ? sfxCues.map((c, i) => (
            <Sequence
              key={`cue-${i}`}
              from={toFrames(c.start)}
              durationInFrames={90}
            >
              <Sfx name={c.name} volume={sfxVolume} />
            </Sequence>
          ))
        : null}
      <AbsoluteFill
        style={{
          transform: baseTransform,
          // grade sutil: saca lo "plano IA" del video de HeyGen
          filter: grade ? "contrast(1.05) saturate(1.1) brightness(1.01)" : undefined,
        }}
      >
        <OffthreadVideo
          src={staticFile(videoSrc)}
          playbackRate={speed}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      {grade ? (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.26) 100%)",
          }}
        />
      ) : null}

      {brolls.map((b, i) => {
        const from = toFrames(b.start);
        const dur = toFrames(b.duration ?? 2.5);
        // default de sonido acorde a la entrada: pip=pop, whip=swoosh, resto=sweep.
        // pop y sweep ROTAN por índice (rotateSfx) para que dos b-rolls seguidos
        // no suenen idénticos — swoosh del whip queda fijo (el largo no sirve para cortes).
        const fallback: SfxName = b.pip
          ? rotateSfx("pop", i)
          : b.transition === "whip"
            ? "swoosh"
            : rotateSfx("sweep", i);
        const snd = pickSfx(b.sfx, fallback);
        return (
          <Sequence key={`broll-${i}`} from={from} durationInFrames={dur}>
            {snd ? <Sfx name={snd} volume={sfxVolume} /> : null}
            <BRoll item={b} durationInFrames={dur} />
          </Sequence>
        );
      })}

      {scenes.map((s, i) => {
        const SceneComp = SCENES[s.name];
        if (!SceneComp) {
          throw new Error(
            `Escena desconocida "${s.name}" — registrarla en src/reels/scenes/registry.tsx`,
          );
        }
        const dur = toFrames(s.duration ?? 3);
        // whoosh ROTA por índice: escenas consecutivas nunca con el mismo sonido.
        const snd = pickSfx(s.sfx, rotateSfx("whoosh", i));
        return (
          <Sequence
            key={`scene-${i}`}
            from={toFrames(s.start)}
            durationInFrames={dur}
          >
            {snd ? <Sfx name={snd} volume={sfxVolume} /> : null}
            <SceneOverlay durationInFrames={dur} bg={s.bg}>
              <SceneComp
                durationInFrames={dur}
                color={highlightColor}
                props={s.props ?? {}}
                sfxEnabled={sfx}
                sfxVolume={sfxVolume}
              />
            </SceneOverlay>
          </Sequence>
        );
      })}

      <Captions
        // Estándar Imperio: cuando entra el CTA se apagan los subtítulos (el botón ya lo dice)
        words={ctaCard ? words.filter((w) => w.start < ctaCard.start) : words}
        speed={speed}
        highlightColor={highlightColor}
        captionsY={captionsY}
        keywords={keywords}
        autoKeywords={autoKeywords}
        captionStyle={captionStyle}
      />

      {hookTitle ? (
        <Sequence
          from={toFrames(hookTitle.start ?? 0)}
          durationInFrames={toFrames(hookTitle.duration ?? 3.2)}
        >
          <HookTitle
            item={hookTitle}
            color={highlightColor}
            durationInFrames={toFrames(hookTitle.duration ?? 3.2)}
          />
        </Sequence>
      ) : null}

      {badges.map((bd, i) => (
        <Sequence
          key={`badge-${i}`}
          from={toFrames(bd.start)}
          durationInFrames={toFrames(bd.duration)}
        >
          {sfx ? <Sfx name="pop" volume={sfxVolume} /> : null}
          <Badge item={bd} fallbackBg={highlightColor} />
        </Sequence>
      ))}

      {priceTag ? (
        <Sequence
          from={toFrames(priceTag.start)}
          durationInFrames={toFrames(priceTag.duration)}
        >
          {sfx ? <Sfx name="pop" volume={sfxVolume} /> : null}
          <PriceTag item={priceTag} color={highlightColor} />
        </Sequence>
      ) : null}

      {counter ? (
        <Sequence
          from={toFrames(counter.start)}
          durationInFrames={toFrames(counter.duration)}
        >
          {sfx ? <Sfx name="pop" volume={sfxVolume} /> : null}
          <Counter
            item={counter}
            durationInFrames={toFrames(counter.duration)}
            color={highlightColor}
          />
        </Sequence>
      ) : null}

      {ctaCard ? (
        <Sequence from={toFrames(ctaCard.start)}>
          {sfx ? <Sfx name="windSwoosh" volume={sfxVolume} /> : null}
          <CtaCard item={ctaCard} color={highlightColor} />
        </Sequence>
      ) : null}

      {music ? (
        <Audio
          loop
          src={staticFile(music.src)}
          volume={music.volume ?? 0.032}
        />
      ) : null}

      {progressBar ? <ProgressBar color={highlightColor} /> : null}

      {debugSafeZones ? <SafeZones /> : null}
    </AbsoluteFill>
  );
};
