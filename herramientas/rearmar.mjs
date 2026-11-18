// Scaeli Daily · vuelve a armar el texto de las lecturas ya guardadas en evangelio/ a partir de su cita,
// sin pedir nada a internet. Sirve cuando cambia herramientas/platense.mjs.   Uso: node herramientas/rearmar.mjs
import { readFile, writeFile, readdir } from "node:fs/promises";
import { textoDe, tituloDe } from "./platense.mjs";
const C = new URL("../evangelio/", import.meta.url); let n = 0;
for (const f of (await readdir(C)).filter(x => /^\d{4}-\d{2}-\d{2}\.json$/.test(x))) {
  const u = new URL(f, C), j = JSON.parse(await readFile(u, "utf8")); let cambio = false;
  for (const k of ["primera", "salmo", "segunda", "evangelio"]) {
    if (!j[k] || !j[k].cita) continue;
    const r = await textoDe(j[k].cita); if (!r) { console.log("sin texto:", f, k, j[k].cita); continue; }
    if (r.texto !== j[k].texto) { j[k].texto = r.texto; j[k].titulo = tituloDe(k, r); cambio = true; }
  }
  if (cambio) { await writeFile(u, JSON.stringify(j, null, 1) + "\n"); n++; }
}
console.log("Días rearmados:", n);
