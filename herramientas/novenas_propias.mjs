// Scaeli Daily · genera data/novenas.js y novenas/<id>.json con las 30 novenas propias (herramientas/textos/novenas.mjs),
// con las lecturas de la Biblia Platense. Correr: node herramientas/novenas_propias.mjs
import { writeFile, readdir, unlink } from "node:fs/promises";
import { textoDe } from "./platense.mjs";
import { NOV } from "./textos/novenas.mjs";

const PESAME = "Pésame, Dios mío, y me arrepiento de todo corazón de haberte ofendido. Pésame por el infierno que merecí y por el cielo que perdí; pero mucho más me pesa porque, pecando, ofendí a un Dios tan bueno y tan grande como Tú. Antes querría haber muerto que haberte ofendido, y propongo firmemente, con tu gracia, no pecar más y evitar las ocasiones de pecado. Amén.";
const CARP = new URL("../novenas/", import.meta.url);
const vista = c => c.replace(/\(\d+\)/, "").replace(",", ", ");   // «Sal 51(50),12-14» → «Sal 51, 12-14»

const meta = [];
for (const N of NOV) {
  const d = N.d || 9;
  if (N.dias.length !== d) throw new Error(N.id + ": tiene " + N.dias.length + " días");
  const intro = ["En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.", "Acto de contrición:", PESAME, N.quien,
    "Oración " + N.a + ":", N.ora, "Para terminar:", "Padrenuestro, Avemaría y Gloria. Pedí con confianza la gracia que necesitás.",
    "En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén."].join("\n\n");
  const dias = [];
  for (let k = 0; k < d; k++) {
    const [tema, cita, pide] = N.dias[k];
    const r = await textoDe(cita);
    if (!r) throw new Error(N.id + " día " + (k + 1) + ": no encuentro " + cita);
    dias.push([(d === 10 ? "Día " : "Día ") + (k + 1) + " · " + tema, "Palabra de Dios · " + vista(cita) + ":", r.texto, "Para rezar:", pide,
      "Se sigue con la oración " + N.a + ", el Padrenuestro, el Avemaría y el Gloria."].join("\n\n"));
  }
  await writeFile(new URL(N.id + ".json", CARP), JSON.stringify({ intro, dias }) + "\n");
  const m = { id: N.id, n: N.n, t: (d === 10 ? "Decenario " : "Novena ") + N.a, d, propia: 1 };
  if (N.movil) m.movil = N.movil; else m.u = N.u;
  meta.push(m);
}
// se borran los textos que ya no están en la app
const ids = new Set(NOV.map(n => n.id + ".json"));
for (const f of await readdir(CARP)) if (f.endsWith(".json") && !ids.has(f)) await unlink(new URL(f, CARP));
await writeFile(new URL("../data/novenas.js", import.meta.url),
  "// Las novenas de Daily (2.1): texto propio de Scaeli, con lecturas de la Biblia Platense. Lo generó herramientas/novenas_propias.mjs: no editar a mano.\n" +
  "// u = último día (MM-DD); movil = [desde, días] el último día se cuenta desde Pascua o desde el 1.er domingo de Adviento; d = días (9 o 10).\n" +
  "export const NOVENAS=[" + meta.map(m => JSON.stringify(m)).join(",\n") + "];\n" +
  "export const NOV_MAS=\"https://es.catholic.net/op/categoria/1097/novenas.html\";\n");
console.log(meta.length, "novenas");
