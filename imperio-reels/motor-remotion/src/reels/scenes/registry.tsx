import { Barras } from "./Barras";
import { Bundle } from "./Bundle";
import { Chat } from "./Chat";
import { Cierre } from "./Cierre";
import { Checklist } from "./Checklist";
import { Stat } from "./Stat";
import { Titular } from "./Titular";
import type { SceneComponent } from "./types";

// Registro de escenas animadas disponibles desde el props JSON:
//   "scenes": [{ "name": "checklist", "start": 15, "duration": 4, "props": {...} }]
//
// Para una escena NUEVA a medida (estilo remotion.dev/prompts): crear el
// componente en esta carpeta siguiendo el contrato SceneComponent y sumarlo acá.
export const SCENES: Record<string, SceneComponent> = {
  checklist: Checklist, // { title?, items: string[] } — beneficios / pasos
  chat: Chat, // { messages: [{text, side?: "in"|"out"}] } — prueba social WhatsApp
  barras: Barras, // { title?, bars: [{label, value}], suffix? } — chart comparativo
  titular: Titular, // { kicker?, headline, highlight? } — nota de diario resaltada
  stat: Stat, // { value, prefix?, suffix?, label } — número gigante contando
  cierre: Cierre, // { image, titulo, sub?, flecha? } — placa final de marca + flecha al link
  bundle: Bundle, // { bg, kicker?, hero, items[], cta? } — pack de producto: bonos que entran y se acomodan
};
