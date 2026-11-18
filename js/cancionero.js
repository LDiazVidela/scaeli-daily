// Scaeli Daily 2.4 · Cancionero con acordes: cantos de dominio público (data/cancionero.js) y los que carga cada uno.
// Gratis: las letras. Scaeli+: los acordes, el cambio de tono y «Mis cantos».
import { CANTOS, CANTOS_CAT } from "../data/cancionero.js";

const NOTAS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const IDX = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
const LAT = { C: "Do", D: "Re", E: "Mi", F: "Fa", G: "Sol", A: "La", B: "Si" };
/* un acorde en cifrado americano, subido `st` semitonos y, si `lat`, escrito en Do Re Mi («Am7» → «Lam7») */
export function acorde(ch, st, lat) {
  return String(ch).replace(/[A-G][#b]?/g, n => { let x = NOTAS[(IDX[n] + (st || 0) + 120) % 12]; if (lat) x = LAT[x[0]] + (x[1] || ""); return x; });
}
/* lo que escribe la gente («[Lam]», «[sol7]», «[Sib]», «[Fa#m]») → cifrado americano */
export function aAmericano(ch) {
  const m = String(ch).trim().match(/^(do|re|mi|fa|sol|la|si)([#♯b♭]?)(.*)$/i);
  if (!m) return String(ch).trim();
  const n = { do: "C", re: "D", mi: "E", fa: "F", sol: "G", la: "A", si: "B" }[m[1].toLowerCase()];
  const alt = m[2] === "♯" ? "#" : m[2] === "♭" ? "b" : m[2];
  return n + alt + m[3].replace(/\/(do|re|mi|fa|sol|la|si)([#♯b♭]?)/i, (x, a, b) => "/" + aAmericano(a + b));
}
export const normalizarLetra = l => String(l || "").replace(/\r/g, "").replace(/\[([^\]\n]{1,12})\]/g, (x, c) => "[" + aAmericano(c) + "]").replace(/\n{3,}/g, "\n\n").trim();
export const tieneAcordes = l => /\[[A-G][^\]]*\]/.test(l || "");
const sinTilde = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const K_PREF = "daily_canc", K_MIOS = "daily_cantos_mios";
const leer = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || "null") || d; } catch (e) { return d; } };
const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
export const cantosMios = () => leer(K_MIOS, []).filter(x => x && x.id && x.t);
const pref = () => ({ lat: 1, ac: 1, tam: 0, ...leer(K_PREF, {}) });
const catDeTiempo = n => ({ Adviento: "adviento", Navidad: "navidad", Cuaresma: "cuaresma", Triduo: "cuaresma", Pascua: "pascua", "Pentecostés": "espiritu" }[n] || "");

export function cancionero(api) {
  const { esc, ic, shTop, esPlus, hoja, openSheet, renderSheet, renderSheetQuieto, toast, confirmar, tiempoLit } = api, GR = api.grupo || { hay: () => false, cantos: () => [] };
  /* 2.5: los cantos del grupo (los comparte un miembro y los ven todos) van junto a los propios y los de la app */
  const todos = () => [...cantosMios().map(x => ({ ...x, mio: 1 })), ...(GR.hay() ? GR.cantos() : []), ...CANTOS];
  /* la letra con los acordes arriba de su sílaba */
  function letraHTML(l, st, P, conAc) {
    return String(l).split(/\n\s*\n/).map(est => {
      const L = est.split("\n"), coro = L.every(x => x.startsWith("> "));
      return '<div class="cest' + (coro ? " coro" : "") + '">' + L.map(x => {
        x = x.replace(/^> /, "");
        if (!conAc || !/\[/.test(x)) return '<div class="cl">' + esc(x.replace(/\[[^\]]*\]/g, "")) + '</div>';
        const partes = x.split(/\[([^\]]+)\]/); let h = partes[0] ? '<span class="cs"><i></i>' + esc(partes[0]) + '</span>' : "";
        for (let i = 1; i < partes.length; i += 2) h += '<span class="cs"><i>' + esc(acorde(partes[i], st, P.lat)) + '</i>' + (esc(partes[i + 1] || "") || "&nbsp;") + '</span>';
        return '<div class="cl ac">' + h + '</div>';
      }).join("") + '</div>';
    }).join("");
  }
  const fila = x => '<button class="row canto" data-a="cantoAbrir" data-p="' + esc(x.id) + '"><span class="n"><b>' + esc(x.t) + '</b><small>' + esc(x.grp ? (x.a ? x.a + " · " : "") + "lo compartió " + x.por : x.a || (x.mio ? "Mi canto" : "")) + '</small></span>' + (tieneAcordes(x.l) ? '<span class="cton">' + ic("music") + '</span>' : (x.lat ? '<span class="cton txt">Latín</span>' : '')) + ic("right") + '</button>';

  function shCancionero() {
    const s = hoja(), T = todos(), sug = catDeTiempo(tiempoLit().n); if (s.cat === undefined) s.cat = sug;
    const q = sinTilde(s.q || "").trim(), cat = q ? "" : s.cat;
    const L = T.filter(x => q ? sinTilde(x.t + " " + x.l.replace(/\[[^\]]*\]/g, "")).includes(q) : cat === "mios" ? x.mio : cat === "grupo" ? x.grp : !cat || (x.cat || []).includes(cat)).sort((a, b) => (b.mio || 0) - (a.mio || 0) || a.t.localeCompare(b.t, "es"));
    const chip = (k, t) => '<button data-a="cancCat" data-p="' + k + '" aria-pressed="' + (cat === k) + '">' + t + '</button>';
    return shTop("Cancionero", "Cantos para la Misa y la oración, con acordes") + '<div class="scroll"><div class="sbanner"><img src="assets/ilus/daily_cancionero.png" alt=""><span class="g"></span></div>' +
      '<input type="search" id="cancQ" placeholder="Buscar por título o por letra…" value="' + esc(s.q || "") + '" style="height:46px;margin-bottom:10px">' +
      '<div class="chips bfil canc">' + chip("", "Todos") + CANTOS_CAT.map(c => chip(c[0], c[1] + (c[0] === sug ? " · ahora" : ""))).join("") + (GR.hay() ? chip("grupo", "Del grupo") : "") + chip("mios", "Mis cantos") + '</div>' +
      (L.length ? '<div class="list libcaps cantos">' + L.map(fila).join("") + '</div>' :  '<p class="empty">' + (cat === "grupo" ? "Tu grupo todavía no tiene cantos. Cargá uno en «Mis cantos» y tocá «Compartir con mi grupo»: lo van a ver todos." : cat === "mios" ? "Todavía no cargaste ningún canto. Sumá los que cantan en tu parroquia o en tu grupo, con sus acordes." : "No hay cantos con esa palabra.") + '</p>') +
      '<button class="plusrow" data-a="cantoNuevo"><span class="n"><b>Agregar un canto</b><small>Pegá la letra y poné los acordes entre corchetes: [Do] [Lam] [Sol7]</small></span>' + (esPlus() ? ic("plus") : '<span class="plus-mini">' + ic("lock") + ' Scaeli+</span>') + '</button>' +
      (GR.hay() ? '<p class="hint" style="margin-top:14px">Lo que cargás en «Mis cantos» lo podés compartir con tu grupo: lo ven todos los miembros, con acordes quien tiene Scaeli+.</p>' : '') +
      '<p class="hint" style="margin-top:14px">Los cantos que trae la app son tradicionales o de dominio público. Los de autores actuales tienen derechos: por eso no vienen cargados, pero podés sumar los tuyos en «Mis cantos».</p>' +
      '</div><button class="primary ink" data-a="cerrar">Volver</button>';
  }
  function shCanto() {
    const s = hoja(), x = todos().find(c => c.id === s.p); if (!x) return shTop("Canto") + '<p class="hint">No está.</p><button class="primary ink" data-a="cancionero">Cancionero</button>';
    const P = pref(), plus = esPlus(), hayAc = tieneAcordes(x.l), conAc = hayAc && plus && P.ac, st = s.st || 0;
    const ton = x.ton ? acorde(x.ton, st, P.lat) : "";
    const enGrupo = x.mio && GR.hay() && GR.cantos().some(c => c.t === x.t && c.u === GR.yo());
    return shTop(esc(x.t), esc(x.grp ? "Canto del grupo · lo compartió " + x.por : x.a || (x.mio ? "Mi canto" : ""))) + '<div class="scroll">' +
      (hayAc && plus ? '<div class="cbar"><div class="ctono"><button class="iconbtn" data-a="cantoTono" data-p="-1" aria-label="Bajar medio tono">' + ic("minus") + '</button><span><small>Tono</small><b>' + (ton ? esc(ton) : (st > 0 ? "+" : "") + st) + '</b></span><button class="iconbtn" data-a="cantoTono" data-p="1" aria-label="Subir medio tono">' + ic("plus") + '</button></div>' +
        '<div class="seg cseg"><button data-a="cantoPref" data-p="ac" aria-pressed="' + !!P.ac + '">Acordes</button><button data-a="cantoPref" data-p="lat" aria-pressed="' + !!P.lat + '">' + (P.lat ? "Do Re Mi" : "C D E") + '</button><button data-a="cantoPref" data-p="tam" aria-pressed="' + !!P.tam + '">Letra grande</button></div></div>' : '') +
      (hayAc && !plus ? '<button class="plusrow" data-a="plus" data-p="cancionero"><span class="n"><b>Ver los acordes y cambiar el tono</b><small>Con Scaeli+: acordes sobre la letra, en Do Re Mi o cifrado americano, y transporte a tu tono.</small></span><span class="plus-mini">' + ic("lock") + ' Scaeli+</span></button><div style="height:14px"></div>' : '') +
      '<div class="cletra' + (P.tam ? " grande" : "") + (x.lat ? " latin" : "") + '">' + letraHTML(x.l, st, P, conAc) + '</div>' +
      (!hayAc && x.lat && !x.mio ? '<p class="hint" style="margin-top:14px">Canto gregoriano: se canta sin acompañamiento.</p>' : '') +
      (x.mio && GR.hay() ? '<button class="primary cshare" data-a="cantoCompartir" data-p="' + esc(x.id) + '"' + (enGrupo ? " disabled" : "") + ' style="margin-top:16px">' + ic(enGrupo ? "check" : "send") + (enGrupo ? " Ya está en «" + esc(GR.nombre()) + "»" : " Compartir con «" + esc(GR.nombre()) + "»") + '</button>' : '') +
      (x.grp && (x.u === GR.yo() || GR.creador()) ? '<button class="ghost g peligro" data-a="cantoQuitar" data-p="' + esc(x.mid) + '" style="margin-top:16px;justify-content:center">' + ic("trash") + ' Quitar del grupo</button>' : '') +
      (x.mio ? '<div class="grid2" style="margin-top:16px"><button class="ghost g" data-a="cantoEditar" data-p="' + esc(x.id) + '">' + ic("pen") + ' Editar</button><button class="ghost g peligro" data-a="cantoBorrar" data-p="' + esc(x.id) + '">' + ic("trash") + ' Borrar</button></div>' : '') +
      '</div><button class="ghost g" data-a="cancionero" style="justify-content:center;height:48px">' + ic("left") + ' Cancionero</button>';
  }
  function shCantoEd() {
    const s = hoja(), x = s.p ? cantosMios().find(c => c.id === s.p) : null;
    return shTop(x ? "Editar el canto" : "Agregar un canto", "Queda guardado en este dispositivo") + '<div class="scroll"><form data-f="canto" class="gform cform">' +
      '<label class="f">Título<input type="text" name="t" maxlength="80" required autocomplete="off" value="' + esc(x ? x.t : "") + '"></label>' +
      '<label class="f">Autor (opcional)<input type="text" name="a" maxlength="80" autocomplete="off" value="' + esc(x ? x.a || "" : "") + '"></label>' +
      '<label class="f">Letra y acordes<textarea name="l" rows="12" required placeholder="[Do]Vienen con ale[Sol]gría, Señor…">' + esc(x ? x.l.replace(/\[([^\]]+)\]/g, (m, c) => "[" + acorde(c, 0, 1) + "]") : "") + '</textarea></label>' +
      '<p class="hint">Poné cada acorde entre corchetes, justo antes de la sílaba donde cae: <b>[Do]</b>, <b>[Lam]</b>, <b>[Sol7]</b> (también vale <b>[C]</b>, <b>[Am]</b>). Dejá una línea en blanco entre estrofas. Si una línea empieza con <b>&gt;</b> es estribillo.</p>' +
      '<button class="primary" type="submit">Guardar</button></form></div><button class="ghost g" data-a="cancionero" style="justify-content:center;height:48px">' + ic("left") + ' Cancionero</button>';
  }
  function guardarForm(f) {
    const F = new FormData(f), t = String(F.get("t") || "").trim().slice(0, 80), l = normalizarLetra(String(F.get("l") || "")).slice(0, 12000); if (!t || !l) return;
    const s = hoja(), M = cantosMios(), id = s.p || "mio-" + Date.now().toString(36), m = l.match(/\[([A-G][#b]?m?)/);
    const x = { id, t, a: String(F.get("a") || "").trim().slice(0, 80), l, ton: m ? m[1] : "", cat: [] }, i = M.findIndex(c => c.id === id);
    if (i >= 0) M[i] = x; else M.unshift(x); guardar(K_MIOS, M.slice(0, 300)); toast("Canto guardado"); openSheet({ view: "canto", p: id });
  }
  const ACC = {
    cancionero() { const s = hoja(); openSheet({ view: "cancionero", cat: s && s.vcat !== undefined ? s.vcat : undefined }); },
    cancCat(p) { const s = hoja(); s.cat = p; s.q = ""; renderSheet(); },
    cantoAbrir(p) { const s = hoja(); openSheet({ view: "canto", p, vcat: s ? s.cat : undefined }); },
    cantoTono(p) { const s = hoja(); s.st = (((s.st || 0) + Number(p)) % 12 + 12) % 12; if (s.st > 6) s.st -= 12; renderSheetQuieto(); },
    cantoPref(p) { const P = pref(); P[p] = P[p] ? 0 : 1; guardar(K_PREF, P); renderSheetQuieto(); },
    cantoNuevo() { if (!esPlus()) { openSheet({ view: "plus", desde: "cancionero" }); return; } openSheet({ view: "cantoEd" }); },
    cantoEditar(p) { if (!esPlus()) { openSheet({ view: "plus", desde: "cancionero" }); return; } openSheet({ view: "cantoEd", p }); },
    async cantoCompartir(p) { const x = cantosMios().find(c => c.id === p); if (!x || !GR.hay()) return; if (!esPlus()) { openSheet({ view: "plus", desde: "cancionero" }); return; }
      toast(await GR.compartir(x) ? "Compartido con «" + GR.nombre() + "»" : "No se pudo compartir"); renderSheetQuieto(); },
    async cantoQuitar(p) { if (!await confirmar("¿Quitar este canto del grupo?", "Deja de verse para todos. Quien lo cargó lo conserva en «Mis cantos».", "Quitar")) return; toast(await GR.quitar(p) ? "Canto quitado del grupo" : "No se pudo quitar"); openSheet({ view: "cancionero", cat: "grupo" }); },
    async cantoBorrar(p) { if (!await confirmar("¿Borrar este canto?", "Se borra de este dispositivo.", "Borrar")) return; guardar(K_MIOS, cantosMios().filter(c => c.id !== p)); toast("Canto borrado"); openSheet({ view: "cancionero", cat: "mios" }); }
  };
  return { shCancionero, shCanto, shCantoEd, guardarForm, ACC, letraHTML };
}
