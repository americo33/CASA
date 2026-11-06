// Contrato de toda escena animada: recibe su duración en frames, el color de
// marca y un objeto de props libre (definido por cada escena en el props JSON).
export type SceneComponentProps = {
  durationInFrames: number;
  color: string;
  props: Record<string, unknown>;
  sfxEnabled?: boolean; // si el reel tiene SFX activados (para sonidos internos de la escena)
  sfxVolume?: number; // volumen master heredado del reel
};

export type SceneComponent = React.FC<SceneComponentProps>;

export const SCENE_FONT =
  "'Montserrat', 'Segoe UI Black', 'Arial Black', sans-serif";
export const SCENE_TEXT_FONT = "'Segoe UI', 'Helvetica Neue', sans-serif";
