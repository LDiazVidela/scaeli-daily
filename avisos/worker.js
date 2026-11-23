// Scaeli · servidor de avisos (Cloudflare Worker «scaeli-avisos», 2.11)
// Manda al teléfono, aunque la app esté cerrada:
//   1) los recordatorios que cada uno eligió (Evangelio, Laudes, Ángelus, Vísperas, Completas), a su hora;
//   2) los mensajes nuevos del grupo, a los demás miembros.
// Push web de Firebase Cloud Messaging (HTTP v1). En iPhone llega solo con Scaeli agregada a la pantalla de inicio.
// Guarda en D1 (base «scaeli-avisos», schema.sql) el token de cada dispositivo y sus horas, ya pasadas a UTC.
// Secreto: FIREBASE_SA (la clave JSON de la cuenta de servicio de Firebase). Lee Firestore con esa cuenta
// (los mensajes y los miembros del grupo) solo para comprobar quién escribió y a quién avisar.

const PROY = "scaeli";
const SITIO = "https://daily.scaeli.com.ar/";
const ORIGENES = ["https://daily.scaeli.com.ar", "http://daily.scaeli.com.ar", "https://ldiazvidela.github.io", "capacitor://localhost", "https://localhost", "http://localhost"];
const TIPOS = {
  ev: { t: "Evangelio del día", b: "Un rato con la Palabra de hoy.", link: "./?abrir=evangelio" },
  lau: { t: "Laudes", b: "Alabá a Dios al empezar el día.", link: "./?abrir=horas&h=laudes" },
  ang: { t: "Ángelus", b: "El ángel del Señor anunció a María.", link: "./?abrir=angelus" },
  vis: { t: "Vísperas", b: "Agradecé a Dios el día que termina.", link: "./?abrir=horas&h=visperas" },
  com: { t: "Completas", b: "La última oración antes de dormir.", link: "./?abrir=horas&h=completas" },
};
export const TIPOS_K = Object.keys(TIPOS);
const HM = /^([01]\d|2[0-3]):[0-5]\d$/;

/* ── utilidades ── */
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64urlTxt = (s) => b64url(new TextEncoder().encode(s));
const deB64url = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
const json = (o, st = 200, h = {}) => new Response(JSON.stringify(o), { status: st, headers: { "content-type": "application/json; charset=utf-8", ...h } });

/** Minutos que la zona horaria va adelantada respecto de UTC en ese momento (Argentina: -180). */
export function offsetMin(tz, d = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(d).map((x) => [x.type, x.value]));
  const comoUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute);
  return Math.round((comoUTC - Math.floor(d.getTime() / 60000) * 60000) / 60000);
}
/** «07:30» en esa zona → «10:30» en UTC (con el corrimiento de hoy). */
export function aUTC(hl, tz, d = new Date()) {
  const [h, m] = hl.split(":").map(Number); const t = (((h * 60 + m - offsetMin(tz, d)) % 1440) + 1440) % 1440;
  return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0");
}
export const fechaEn = (tz, d = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
const tzValida = (tz) => { if (typeof tz !== "string" || !tz || tz.length > 60) return false; try { new Intl.DateTimeFormat("en-US", { timeZone: tz }); return true; } catch (e) { return false; } };

/* ── Google: cuenta de servicio → token de acceso (FCM y Firestore) ── */
let acceso = null;
async function tokenGoogle(env) {
  if (acceso && acceso.hasta > Date.now() + 60000) return acceso.t;
  const sa = JSON.parse(env.FIREBASE_SA); const ahora = Math.floor(Date.now() / 1000);
  const cab = b64urlTxt(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const cue = b64urlTxt(JSON.stringify({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/firebase.messaging https://www.googleapis.com/auth/datastore", aud: "https://oauth2.googleapis.com/token", iat: ahora, exp: ahora + 3600 }));
  const der = Uint8Array.from(atob(sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "")), (c) => c.charCodeAt(0));
  const llave = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const firma = b64url(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", llave, new TextEncoder().encode(cab + "." + cue)));
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: "grant_type=" + encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer") + "&assertion=" + cab + "." + cue + "." + firma });
  const j = await r.json(); if (!j.access_token) throw new Error("google: sin token de acceso");
  acceso = { t: j.access_token, hasta: Date.now() + (j.expires_in || 3600) * 1000 }; return acceso.t;
}

/* ── quién llama: token de Firebase Auth (firmado por Google) ── */
let llavesFB = null;
export async function verificarFirebase(idTok) {
  const [h, c, f] = String(idTok || "").split("."); if (!f) throw new Error("sin token");
  const cab = JSON.parse(new TextDecoder().decode(deB64url(h))), cue = JSON.parse(new TextDecoder().decode(deB64url(c))), ahora = Date.now() / 1000;
  if (cab.alg !== "RS256" || cue.aud !== PROY || cue.iss !== "https://securetoken.google.com/" + PROY || !cue.sub || cue.exp < ahora || cue.iat > ahora + 300) throw new Error("token inválido");
  if (!llavesFB || llavesFB.hasta < Date.now()) {
    const r = await fetch("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com");
    const ma = /max-age=(\d+)/.exec(r.headers.get("cache-control") || ""); llavesFB = { k: (await r.json()).keys || [], hasta: Date.now() + (ma ? +ma[1] : 3600) * 1000 };
  }
  const jwk = llavesFB.k.find((k) => k.kid === cab.kid); if (!jwk) throw new Error("llave desconocida");
  const llave = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  if (!(await crypto.subtle.verify("RSASSA-PKCS1-v1_5", llave, deB64url(f), new TextEncoder().encode(h + "." + c)))) throw new Error("firma inválida");
  return cue.sub;
}

/* ── Firestore (REST, con la cuenta de servicio) ── */
const FS = "https://firestore.googleapis.com/v1/projects/" + PROY + "/databases/(default)/documents/";
const valor = (v) => v == null ? null : "stringValue" in v ? v.stringValue : "integerValue" in v ? +v.integerValue : "doubleValue" in v ? v.doubleValue : "booleanValue" in v ? v.booleanValue : null;
async function fsGet(env, ruta) {
  const r = await fetch(FS + ruta, { headers: { authorization: "Bearer " + (await tokenGoogle(env)) } }); if (r.status === 404) return null; if (!r.ok) throw new Error("firestore " + r.status);
  const d = await r.json(); const o = {}; for (const [k, v] of Object.entries(d.fields || {})) o[k] = valor(v); return o;
}
async function fsIds(env, ruta) {
  const ids = []; let pag = "";
  do { const r = await fetch(FS + ruta + "?pageSize=300&mask.fieldPaths=t" + (pag ? "&pageToken=" + encodeURIComponent(pag) : ""), { headers: { authorization: "Bearer " + (await tokenGoogle(env)) } });
    if (!r.ok) throw new Error("firestore " + r.status); const d = await r.json(); (d.documents || []).forEach((x) => ids.push(x.name.split("/").pop())); pag = d.nextPageToken || ""; } while (pag && ids.length < 600);
  return ids;
}

/* ── mandar un aviso (FCM HTTP v1) ── */
export async function enviar(env, token, { t, b, link, tag, ttl }) {
  const msg = { message: { token, notification: { title: t, body: b }, data: { link: link || "./", tag: tag || "scaeli-aviso" },
    webpush: { headers: { TTL: String(ttl || 3600), Urgency: "high" }, notification: { icon: SITIO + "icons/icon-192.png", badge: SITIO + "icons/icon-192.png", tag: tag || "scaeli-aviso" } } } };
  const r = await fetch("https://fcm.googleapis.com/v1/projects/" + PROY + "/messages:send", { method: "POST", headers: { authorization: "Bearer " + (await tokenGoogle(env)), "content-type": "application/json" }, body: JSON.stringify(msg) });
  if (r.ok) return "ok";
  const e = await r.text(); if (r.status === 404 || /UNREGISTERED|registration-token-not-registered|INVALID_ARGUMENT.*token/i.test(e)) { await env.DB.prepare("DELETE FROM subs WHERE token=?").bind(token).run(); await env.DB.prepare("DELETE FROM horas WHERE token=?").bind(token).run(); return "baja"; }
  return "error";
}
async function enviarTodos(env, L) { const res = { ok: 0, baja: 0, error: 0 }; for (let i = 0; i < L.length; i += 20) { (await Promise.all(L.slice(i, i + 20).map(([tok, a]) => enviar(env, tok, a).catch(() => "error")))).forEach((x) => res[x]++); } return res; }

/* ── 1) recordatorios: cada minuto, a quienes les toca ── */
const evCache = {};
async function evangelioDe(fecha) {
  if (fecha in evCache) return evCache[fecha];
  try { const r = await fetch(SITIO + "evangelio/" + fecha + ".json", { cf: { cacheTtl: 600 } }); const j = r.ok ? await r.json() : null; const e = j && j.evangelio;
    if (!e || !e.texto) return (evCache[fecha] = null);
    const cita = String(e.cita || "").replace(/\.$/, ""), fr = String(e.ta || e.texto).replace(/\s+/g, " ").trim(), corta = fr.length > 110 ? fr.slice(0, fr.lastIndexOf(" ", 104)) + "…" : fr;
    return (evCache[fecha] = { cita, corta });
  } catch (e) { return (evCache[fecha] = null); }
}
export async function recordatorios(env, cuando = new Date()) {
  const hm = cuando.toISOString().slice(11, 16);
  const { results } = await env.DB.prepare("SELECT h.k, h.token, s.tz FROM horas h JOIN subs s ON s.token = h.token WHERE h.hm = ?").bind(hm).all();
  const L = [];
  for (const x of results || []) { const T = TIPOS[x.k]; if (!T) continue; let b = T.b, t = T.t;
    if (x.k === "ev") { const e = await evangelioDe(fechaEn(x.tz, cuando)); if (e) { t = "Evangelio del día · " + e.cita; b = e.corta; } }
    L.push([x.token, { t, b, link: T.link, tag: "rec-" + x.k, ttl: 3 * 3600 }]); }
  if (hm === "06:00") await env.DB.prepare("DELETE FROM subs WHERE act < ?").bind(Date.now() - 120 * 864e5).run().then(() => env.DB.prepare("DELETE FROM horas WHERE token NOT IN (SELECT token FROM subs)").run());
  return { hm, ...(await enviarTodos(env, L)) };
}

/* ── 2) mensajes del grupo ── */
export async function avisarGrupo(env, uid, gid, mid) {
  if (!/^[A-Za-z0-9]{4,20}$/.test(gid) || !/^[A-Za-z0-9]{8,40}$/.test(mid)) return { err: "datos" };
  const nuevo = await env.DB.prepare("INSERT OR IGNORE INTO avisados (mid, t) VALUES (?, ?)").bind(gid + "/" + mid, Date.now()).run();
  if (!nuevo.meta || !nuevo.meta.changes) return { err: "repetido" };
  const m = await fsGet(env, "grupos/" + gid + "/mensajes/" + mid);
  if (!m || m.u !== uid) return { err: "no es tuyo" };
  if (Date.now() - (m.t || 0) > 10 * 60000) return { err: "viejo" };
  const [g, ids] = await Promise.all([fsGet(env, "grupos/" + gid), fsIds(env, "grupos/" + gid + "/miembros")]);
  if (!g || !ids.includes(uid)) return { err: "no sos miembro" };
  const otros = ids.filter((x) => x !== uid); if (!otros.length) return { ok: 0 };
  const subs = [];
  for (let i = 0; i < otros.length; i += 90) { const parte = otros.slice(i, i + 90);
    const { results } = await env.DB.prepare("SELECT token, uid, bloq FROM subs WHERE gr = 1 AND uid IN (" + parte.map(() => "?").join(",") + ")").bind(...parte).all(); subs.push(...(results || [])); }
  const n = String(m.n || "Alguien").slice(0, 24), tx = String(m.tx || "").replace(/\s+/g, " ").slice(0, 140);
  const b = m.k === "canto" ? n + " compartió un canto: «" + String(m.ti || "").slice(0, 60) + "»" : m.tipo === "rec" ? "Recordatorio de " + n + ": " + tx : n + ": " + tx;
  const aviso = { t: String(g.n || "Tu grupo").slice(0, 40), b, link: "./?abrir=grupo&gid=" + gid, tag: "grupo-" + gid, ttl: 86400 };
  const L = subs.filter((s) => { try { return !JSON.parse(s.bloq || "[]").includes(uid); } catch (e) { return true; } }).map((s) => [s.token, aviso]);
  await env.DB.prepare("DELETE FROM avisados WHERE t < ?").bind(Date.now() - 2 * 864e5).run();
  return await enviarTodos(env, L);
}

/* ── alta y baja de un dispositivo ── */
export async function suscribir(env, uid, q) {
  const token = String(q.token || ""); if (token.length < 20 || token.length > 4096) return { err: "token" };
  const tz = tzValida(q.tz) ? q.tz : "America/Argentina/Buenos_Aires", ahora = new Date();
  const items = Object.entries(q.items || {}).filter(([k, hl]) => TIPOS[k] && HM.test(hl));
  const bloq = JSON.stringify((Array.isArray(q.bloq) ? q.bloq : []).filter((x) => typeof x === "string").slice(0, 200));
  await env.DB.batch([
    env.DB.prepare("INSERT INTO subs (token, uid, tz, gr, bloq, plat, act) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(token) DO UPDATE SET uid=excluded.uid, tz=excluded.tz, gr=excluded.gr, bloq=excluded.bloq, plat=excluded.plat, act=excluded.act")
      .bind(token, uid, tz, q.gr === false ? 0 : 1, bloq, String(q.plat || "web").slice(0, 10), Date.now()),
    env.DB.prepare("DELETE FROM horas WHERE token = ?").bind(token),
    ...items.map(([k, hl]) => env.DB.prepare("INSERT INTO horas (token, k, hl, hm) VALUES (?, ?, ?, ?)").bind(token, k, hl, aUTC(hl, tz, ahora))),
  ]);
  return { ok: true, n: items.length };
}

export default {
  async fetch(req, env) {
    const o = req.headers.get("origin") || "", cors = { "access-control-allow-origin": ORIGENES.includes(o) ? o : ORIGENES[0], "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "authorization, content-type", "access-control-max-age": "86400", vary: "origin" };
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const ruta = new URL(req.url).pathname;
    if (req.method === "GET" && ruta === "/") return json({ ok: true, servicio: "Scaeli avisos" }, 200, cors);
    if (req.method !== "POST") return json({ err: "método" }, 405, cors);
    let uid; try { uid = await verificarFirebase((req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "")); } catch (e) { return json({ err: "sesión" }, 401, cors); }
    let q = {}; try { q = await req.json(); } catch (e) { return json({ err: "json" }, 400, cors); }
    try {
      if (ruta === "/suscribir") return json(await suscribir(env, uid, q), 200, cors);
      if (ruta === "/baja") { await env.DB.batch([env.DB.prepare("DELETE FROM subs WHERE token = ? AND uid = ?").bind(String(q.token || ""), uid), env.DB.prepare("DELETE FROM horas WHERE token = ? AND token NOT IN (SELECT token FROM subs)").bind(String(q.token || ""))]); return json({ ok: true }, 200, cors); }
      if (ruta === "/grupo") return json(await avisarGrupo(env, uid, String(q.gid || ""), String(q.mid || "")), 200, cors);
      if (ruta === "/prueba") { const { results } = await env.DB.prepare("SELECT token FROM subs WHERE uid = ?").bind(uid).all(); return json(await enviarTodos(env, (results || []).map((s) => [s.token, { t: "Scaeli", b: "Los avisos llegan bien a este teléfono.", link: "./", tag: "prueba" }])), 200, cors); }
    } catch (e) { return json({ err: "servidor", det: String(e && e.message || e).slice(0, 200) }, 500, cors); }
    return json({ err: "ruta" }, 404, cors);
  },
  async scheduled(ev, env, ctx) { ctx.waitUntil(recordatorios(env, new Date(ev.scheduledTime))); },
};
