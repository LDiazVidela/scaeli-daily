// Scaeli Daily · trae la Liturgia de las Horas de los próximos días desde liturgiadelashoras.github.io
// y deja un archivo por día en horas/AAAA-MM-DD.json ({laudes:"<html>", …}), para que la app la lea
// desde su propio sitio (sin depender de que el teléfono pueda llegar al otro sitio).
// Lo corre GitHub Actions todos los días (ver .github/workflows/evangelio.yml).
import { mkdir, writeFile, readdir, unlink, access } from "node:fs/promises";

const SITIO = "https://liturgiadelashoras.github.io";
const HORAS = ["oficio", "laudes", "tercia", "sexta", "nona", "visperas", "completas"];
const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DIAS = Math.min(45, Number(process.env.DIAS || 40));   // el sitio publica mes a mes: lo que todavía no está se reintenta al otro día
const GUARDAR_DIAS_VIEJOS = 3;
const CARPETA = new URL("../horas/", import.meta.url);
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function traer(d, h) {
  const url = `${SITIO}/sync/${d.getFullYear()}/${MES[d.getMonth()]}/${pad(d.getDate())}/${h}.htm`;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": "Scaeli-Daily/1.0 (Liturgia de las Horas; contacto en el repositorio)" } });
      if (r.status === 404) return null;
      if (r.ok) {
        const html = new TextDecoder("latin1").decode(await r.arrayBuffer());
        const i0 = html.search(/<div id="cuerpo"/i);
        if (i0 < 0) return null;
        let cuerpo = html.slice(i0).replace(/<\/body>[\s\S]*$/i, "");
        cuerpo = cuerpo.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\s+/g, " ").trim();
        return cuerpo.length > 400 ? cuerpo : null;
      }
    } catch (e) { /* reintenta */ }
    await espera(1500 * (i + 1));
  }
  return null;
}

await mkdir(CARPETA, { recursive: true });
const hoy = new Date(); hoy.setHours(12, 0, 0, 0);
let nuevos = 0;
for (let k = 0; k < DIAS; k++) {
  const d = new Date(hoy); d.setDate(hoy.getDate() + k);
  const f = new URL(iso(d) + ".json", CARPETA);
  try { await access(f); continue; } catch (e) { /* no está todavía */ }
  const dia = {};
  for (const h of HORAS) { const t = await traer(d, h); if (t) dia[h] = t; await espera(250); }
  if (Object.keys(dia).length === HORAS.length) { await writeFile(f, JSON.stringify(dia)); nuevos++; console.log("ok", iso(d)); }
  else if (!Object.keys(dia).length) { console.log("todavía no está", iso(d)); break; }   // el sitio no publicó más allá de esta fecha
  else console.log("incompleto, se reintenta", iso(d));
}
const limite = new Date(hoy); limite.setDate(hoy.getDate() - GUARDAR_DIAS_VIEJOS);
for (const n of await readdir(CARPETA)) {
  const m = n.match(/^(\d{4}-\d{2}-\d{2})\.json$/);
  if (m && m[1] < iso(limite)) await unlink(new URL(n, CARPETA));
}
console.log("listo:", nuevos, "días nuevos");
