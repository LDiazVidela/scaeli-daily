// Scaeli Daily · arma el texto de una lectura de la Misa con la Biblia Platense (Mons. Juan Straubinger),
// la misma que trae la app en biblia/. De Evangelizo se toma solo la cita (p. ej. «Lc 21,5-11.»):
// el texto de las lecturas nunca se copia de otra traducción.
import { readFile } from "node:fs/promises";

const BIB = new URL("../biblia/", import.meta.url);
// abreviaturas de Evangelizo (francesas, con «_» en lugar del espacio) y españolas → libro de biblia/
const LIB = {
  Gn: "Gen", Gen: "Gen", Ex: "Exod", Lv: "Lev", Nb: "Num", Nm: "Num", Dt: "Deut", Jos: "Josh", Jg: "Judg", Jue: "Judg", Rt: "Ruth", Rut: "Ruth", Dn: "Dan", Dan: "Dan",
  "1 S": "1Sam", "2 S": "2Sam", "1 Sam": "1Sam", "2 Sam": "2Sam", "1 R": "1Kgs", "2 R": "2Kgs", "1 Re": "1Kgs", "2 Re": "2Kgs",
  "1 Ch": "1Chr", "2 Ch": "2Chr", "1 Cr": "1Chr", "2 Cr": "2Chr", Esd: "Ezra", Ne: "Neh", Neh: "Neh", Tb: "Tob", Tob: "Tob", Jdt: "Jdt", Est: "Esth",
  "1 M": "1Macc", "2 M": "2Macc", "1 Mac": "1Macc", "2 Mac": "2Macc", Jb: "Job", Job: "Job", Ps: "Ps", Sal: "Ps", Pr: "Prov", Prov: "Prov",
  Qo: "Eccl", Ecl: "Eccl", Ct: "Song", Cant: "Song", Sg: "Wis", Sab: "Wis", Si: "Sir", Eclo: "Sir", Is: "Isa", Jr: "Jer", Jer: "Jer",
  Lm: "Lam", Lam: "Lam", Ba: "Bar", Bar: "Bar", Ez: "Ezek", Dn: "Dan", Os: "Hos", Jl: "Joel", Am: "Amos", Ab: "Obad", Abd: "Obad",
  Jon: "Jonah", Mi: "Mic", Miq: "Mic", Na: "Nah", Nah: "Nah", Ha: "Hab", Hab: "Hab", So: "Zeph", Sof: "Zeph", Ag: "Hag", Za: "Zech", Zac: "Zech",
  Ml: "Mal", Mal: "Mal", Mt: "Matt", Mc: "Mark", Lc: "Luke", Jn: "John", Ac: "Acts", Hch: "Acts", Rm: "Rom", Rom: "Rom",
  "1 Co": "1Cor", "2 Co": "2Cor", "1 Cor": "1Cor", "2 Cor": "2Cor", Ga: "Gal", "Gál": "Gal", Ep: "Eph", Ef: "Eph", Ph: "Phil", Flp: "Phil",
  Col: "Col", "1 Th": "1Thess", "2 Th": "2Thess", "1 Tes": "1Thess", "2 Tes": "2Thess", "1 Tm": "1Tim", "2 Tm": "2Tim", "1 Tim": "1Tim", "2 Tim": "2Tim",
  Tt: "Titus", Tit: "Titus", Phm: "Phlm", Flm: "Phlm", He: "Heb", Heb: "Heb", Jc: "Jas", Sant: "Jas", "1 P": "1Pet", "2 P": "2Pet", "1 Pe": "1Pet", "2 Pe": "2Pet",
  "1 Jn": "1John", "2 Jn": "2John", "3 Jn": "3John", Jude: "Jude", Jds: "Jude", Ap: "Rev"
};
const cache = {};
const libro = async id => cache[id] || (cache[id] = JSON.parse(await readFile(new URL(id + ".json", BIB), "utf8")));

// los leccionarios numeran como la Biblia hebrea; la Platense, como la Vulgata, en estos lugares:
// Salmos: los leccionarios citan con el número hebreo; la Platense de biblia/ está numerada como la Vulgata.
// (Evangelizo agrega «(n-1)» a ciegas, también donde no corresponde —«150(149)»—: no se usa.)
export function salmoVg(h, v) {
  if (h <= 8 || h >= 148) return [h, v];
  if (h === 9) return [9, v];
  if (h === 10) return [9, v + 21];
  if (h === 114) return [113, v];
  if (h === 115) return [113, v + 8];
  if (h === 116) return v <= 9 ? [114, v] : [115, v - 9];
  if (h === 147) return v <= 11 ? [146, v] : [147, v - 11];
  return [h - 1, v];
}
function ajustar(id, c, v, letra) {
  if (id === "Ps") return salmoVg(c, v);
  if (id === "Isa" && c === 63 && v === 19 && letra === "b") return [64, 1];
  if (id === "Isa" && c === 64) return [64, v + 1];
  if (id === "Mal" && c === 3 && v >= 19) return [4, v - 18];
  if (id === "Joel" && c === 3) return [2, v + 27];
  if (id === "Joel" && c === 4) return [3, v];
  return [c, v];
}

// «31,10-13.19-20.30-31» · «1,1-4.2,1-5a» · «9,35-38.10,1.6-8» · «128(127),1-2.3» → tramos [capítulo, desde, hasta]
export function tramos(id, ref) {
  let s = String(ref).replace(/\s+/g, "").replace(/[–—]/g, "-").replace(/\.$/, "");
  const out = []; let cap = null;
  for (const parte of s.split(".")) {
    if (!parte) continue;
    let p = parte;
    const m = p.match(/^(\d+)(?:\((\d+)\))?,(.*)$/);
    if (m) { cap = +m[1]; p = m[3]; }
    if (cap === null) return null;
    const r = p.match(/^(\d+)([a-z]*)(?:-(?:(\d+),)?(\d+)([a-z]*))?$/);
    if (!r) return null;
    const [c1, v1] = ajustar(id, cap, +r[1], r[2]);
    if (!r[4]) { out.push([c1, v1, v1]); continue; }
    if (r[3]) { // el tramo cruza de capítulo: «35-10,1»
      out.push([c1, v1, 999]); cap = +r[3];
      const [c2, v2] = ajustar(id, cap, +r[4], r[5]); out.push([c2, 1, v2]); continue;
    }
    const [c2, v2] = ajustar(id, cap, +r[4], r[5]);
    if (c2 !== c1) { out.push([c1, v1, 999]); out.push([c2, 1, v2]); } else out.push([c1, v1, v2]);
  }
  return out.length ? out : null;
}

// En las lecturas de la Misa no se pronuncia el Nombre divino: «el Señor» (Congregación para el Culto Divino, 2008).
// Solo para las lecturas; la Biblia de la app queda como la tradujo Straubinger.
export function senor(t) {
  return String(t)
    .replace(/¡?Hallelú Yah!?/g, "¡Aleluya!")
    .replace(/Yahvé,? el Señor/g, "el Señor Dios").replace(/el Señor,? Yahvé/g, "el Señor Dios")
    .replace(/\b([Oo]h),? Yahvé/g, "$1 Señor")
    .replace(/(^|[\n“«¡¿(]|[.!?:;] )Yahvé(?=[,!?])/g, "$1Señor")
    .replace(/, Yahvé( de los ejércitos| Sabaot)?(?=[,;.!?:]|\n|$)/g, ", Señor$1")
    .replace(/\b(mismo|nuestro|gran) Yahvé/g, "$1 Señor")
    .replace(/\b([Aa]) Yah\b/g, "$1l Señor").replace(/\bYah\b/g, "el Señor")
    .replace(/\b([Aa]) Yahvé/g, "$1l Señor").replace(/\b([Dd])e Yahvé/g, "$1el Señor")
    .replace(/(^|[\n“«¡¿(]|[.!?] )Yahvé/g, "$1El Señor")
    .replace(/Yahvé/g, "el Señor")
    .replace(/(^|[\n“«¡¿(]|[.!?] )el Señor/g, "$1El Señor");
}
const limpiarV = v => String(v).replace(/^[A-ZÁÉÍÓÚ]{2,6}\.\s+/, "").trim();
// en los salmos, el primer versículo de la Platense trae el epígrafe («Cántico gradual.», «Salmo de David.»): no se lee en la Misa
const sinEpigrafe = v => { const ls = v.split("\n"); return ls.length > 1 && ls[0].length < 70 && /\.$/.test(ls[0]) ? ls.slice(1).join("\n") : v; };

export async function textoDe(cita) {
  const s = String(cita || "").replace(/_/g, " ").replace(/\.$/, "").trim();
  const m = s.match(/^((?:[123] )?[A-ZÁÉÍÓÚ][a-záéíóú]{0,3})\s+(.+)$/);
  if (!m || !LIB[m[1]]) return null;
  const id = LIB[m[1]], T = tramos(id, m[2]);
  if (!T) return null;
  let L; try { L = await libro(id); } catch { return null; }
  const bloques = []; let pc = 0, pb = 0;
  for (let [c, a, b] of T) {
    // «2-3ab.3cd-4»: el versículo partido en dos estrofas se lee una sola vez
    if (c === pc && a <= pb) a = pb + 1;
    if (a > b) continue;
    pc = c; pb = b;
    const ch = L.c[c - 1]; if (!ch || a > ch.length) return null;
    const vs = ch.slice(a - 1, Math.min(b, ch.length)).map((v, i) => { let t = limpiarV(v); if (id === "Ps" && a + i === 1) t = sinEpigrafe(t); return t; }).filter(Boolean);
    if (!vs.length) return null;
    const verso = vs.some(v => v.includes("\n"));
    bloques.push(verso ? vs.join("\n") : vs.join(" "));
  }
  const may = t => t.replace(/^([“«¡¿(—\s]*)(\p{Ll})/u, (x, a, b) => a + b.toUpperCase());
  if (!bloques.length) return null;
  return { libro: id, nombre: L.n, texto: senor(bloques.map(may).join("\n\n")) };
}

// títulos propios (no los del leccionario)
export function tituloDe(k, r) {
  if (!r) return "";
  if (k === "salmo") return "Salmo responsorial";
  if (k === "evangelio") return "Evangelio según " + ({ Matt: "san Mateo", Mark: "san Marcos", Luke: "san Lucas", John: "san Juan" }[r.libro] || r.nombre);
  return r.nombre;
}
