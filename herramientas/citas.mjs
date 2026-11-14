// Scaeli Daily · arma data/citas.js: las meditaciones del Rosario y los pasajes de la Lectio de respaldo
// con el texto de la Biblia Platense (Mons. Juan Straubinger). Correr: node herramientas/citas.mjs
import { writeFile } from "node:fs/promises";
import { textoDe } from "./platense.mjs";
import { ROS_MED, LECTIO } from "../data/juego.js";

const NOM = { Mateo: "Mt", Marcos: "Mc", Lucas: "Lc", Juan: "Jn" };
const norm = c => c.replace(/^(Mateo|Marcos|Lucas|Juan)\b/, m => NOM[m]).replace(/\s+/g, " ").replace(/, /g, ",").replace(/\. /g, ".");
const sinComillas = t => /^[“"]/.test(t) && (t.match(/“/g) || []).length === 1 ? t.replace(/^[“"]+/, "").replace(/[”"]+([.,;:!?]*)$/, "$1").trim() : t.trim();

async function pasaje(cita, uno) {
  const partes = cita.split(";").map(s => s.trim());
  const out = [];
  for (const p of partes) {
    const n = norm(p), m = n.match(/^(\S+) (\d+),(.*)$/);
    const vs = m[3].split(".");
    const lista = uno ? vs.flatMap(v => { const [a, b] = v.split("-").map(Number); return Array.from({ length: (b || a) - a + 1 }, (_, i) => String(a + i)); }) : vs;
    for (const v of lista) { const r = await textoDe(m[1] + " " + m[2] + "," + v); if (!r) throw new Error("No encuentro " + p); out.push(sinComillas(r.texto)); }
  }
  return out;
}

const MED = {};
for (const k of Object.keys(ROS_MED)) {
  MED[k] = [];
  for (const [, cita, virtud] of ROS_MED[k]) MED[k].push(["«" + (await pasaje(cita)).join(" […] ").replace(/[,;:]+$/, "") + "»", cita, virtud]);
}
const LEC = [];
for (const L of LECTIO) { const vs = await pasaje(L[0], 1); LEC.push([L[0], ...vs.map((v, i) => [(L[i + 1] || L[L.length - 1])[0], v])]); }
// el versículo al pie de Rezar
const PIE = ["«" + (await pasaje("Mt 11, 28"))[0] + "»", "Mt 11, 28"];

await writeFile(new URL("../data/citas.js", import.meta.url),
  "// Generado por herramientas/citas.mjs con la Biblia Platense (Mons. Juan Straubinger). No editar a mano.\n" +
  "export const ROS_MED=" + JSON.stringify(MED) + ";\nexport const LECTIO=" + JSON.stringify(LEC) + ";\nexport const PIE_REZAR=" + JSON.stringify(PIE) + ";\n");
console.log("data/citas.js listo");
