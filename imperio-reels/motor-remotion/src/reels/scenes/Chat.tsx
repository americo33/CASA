import {
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Sfx, type SfxName } from "../Sfx";
import { SCENE_TEXT_FONT, type SceneComponent } from "./types";

// props: { messages: [{ text: string, side?: "in" | "out", sfx?: SfxName }] }
// Prueba social estilo chat de WhatsApp (modo oscuro), burbujas entrando escalonadas.
// Cada mensaje puede llevar su propio SFX (ej "wrong" en un "❌ no existe").
export const Chat: SceneComponent = ({
  durationInFrames,
  props,
  sfxEnabled,
  sfxVolume = 0.7,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const messages =
    (props.messages as {
      text: string;
      side?: "in" | "out";
      sfx?: SfxName;
    }[]) ?? [];

  const stagger =
    messages.length > 1
      ? Math.max(5, Math.floor((durationInFrames * 0.55) / messages.length))
      : 0;
  const entranceF = (i: number) => 6 + i * stagger;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 70px",
        gap: 34,
        fontFamily: SCENE_TEXT_FONT,
      }}
    >
      {sfxEnabled
        ? messages.map((m, i) =>
            m.sfx ? (
              <Sequence
                key={`sfx-${i}`}
                from={entranceF(i)}
                durationInFrames={45}
              >
                <Sfx name={m.sfx} volume={sfxVolume} />
              </Sequence>
            ) : null,
          )
        : null}
      {messages.map((m, i) => {
        const isOut = m.side === "out";
        const enter = spring({
          frame: frame - 6 - i * stagger,
          fps,
          config: { damping: 13, stiffness: 200, mass: 0.6 },
        });
        return (
          <div
            key={i}
            style={{
              alignSelf: isOut ? "flex-end" : "flex-start",
              maxWidth: "78%",
              opacity: enter,
              transform: `translateY(${interpolate(enter, [0, 1], [40, 0])}px) scale(${interpolate(enter, [0, 1], [0.85, 1])})`,
              transformOrigin: isOut ? "bottom right" : "bottom left",
              background: isOut ? "#005C4B" : "#202C33",
              color: "#E9EDEF",
              fontSize: 44,
              lineHeight: 1.3,
              fontWeight: 600,
              padding: "24px 32px",
              borderRadius: 26,
              borderBottomRightRadius: isOut ? 8 : 26,
              borderBottomLeftRadius: isOut ? 26 : 8,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            {m.text}
            {isOut ? (
              <span
                style={{ color: "#53BDEB", fontSize: 32, marginLeft: 14 }}
              >
                ✓✓
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
