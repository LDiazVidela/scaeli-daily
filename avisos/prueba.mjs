// Pruebas del servidor de avisos, sin red: Google, Firestore, FCM y el sitio se simulan; D1 es SQLite en memoria.
// node --experimental-sqlite avisos/prueba.mjs
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import W, { offsetMin, aUTC, fechaEn, suscribir, recordatorios, avisarGrupo, verificarFirebase } from "./worker.js";

const fails = []; const ok = (c, m) => { if (process.env.V) console.log((c ? "  ok " : "  XX ") + m); if (!c) fails.push("FALLA " + m); };
const ESQ = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
function d1() { const db = new DatabaseSync(":memory:"); db.exec(ESQ);
  const st = (sql, a = []) => ({ bind: (...b) => st(sql, b), all: async () => ({ results: db.prepare(sql).all(...a) }), first: async () => db.prepare(sql).get(...a), run: async () => ({ meta: { changes: Number(db.prepare(sql).run(...a).changes) } }) });
  return { prepare: (s) => st(s), batch: async (L) => { const r = []; for (const s of L) r.push(await s.run()); return r; }, _db: db }; }
const b64url = (b) => Buffer.from(b).toString("base64url");

// llaves de prueba: la de la «cuenta de servicio» y la que firma los tokens de Firebase Auth
const sa = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const pem = "-----BEGIN PRIVATE KEY-----\n" + Buffer.from(await crypto.subtle.exportKey("pkcs8", sa.privateKey)).toString("base64").match(/.{1,64}/g).join("\n") + "\n-----END PRIVATE KEY-----\n";
const fb = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const jwkPub = { ...(await crypto.subtle.exportKey("jwk", fb.publicKey)), kid: "k1", alg: "RS256", use: "sig" };
async function idTok(uid, extra = {}) { const ahora = Math.floor(Date.now() / 1000);
  const h = b64url(JSON.stringify({ alg: "RS256", kid: "k1", typ: "JWT" })), c = b64url(JSON.stringify({ aud: "scaeli", iss: "https://securetoken.google.com/scaeli", sub: uid, iat: ahora - 10, exp: ahora + 3600, ...extra }));
  return h + "." + c + "." + b64url(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", fb.privateKey, new TextEncoder().encode(h + "." + c))); }

// red simulada
const enviados = []; let muertos = new Set(); const FSDOC = {};
const fsVal = (v) => typeof v === "number" ? { integerValue: String(v) } : { stringValue: String(v) };
globalThis.fetch = async (url, op = {}) => { url = String(url);
  const R = (o, st = 200, h = {}) => new Response(typeof o === "string" ? o : JSON.stringify(o), { status: st, headers: h });
  if (url.startsWith("https://oauth2.googleapis.com/token")) return R({ access_token: "acceso-prueba", expires_in: 3600 });
  if (url.includes("securetoken@system")) return R({ keys: [jwkPub] }, 200, { "cache-control": "public, max-age=3600" });
  if (url.includes("fcm.googleapis.com")) { const m = JSON.parse(op.body).message; if (muertos.has(m.token)) return R({ error: { status: "NOT_FOUND", details: [{ errorCode: "UNREGISTERED" }] } }, 404); enviados.push(m); return R({ name: "x" }); }
  if (url.includes("/evangelio/")) return R({ evangelio: { cita: "Lc 21,1-4.", texto: "Levantando los ojos, Jesús vio a unos ricos que echaban sus ofrendas en el tesoro del Templo." } });
  if (url.includes("firestore.googleapis.com")) { const ruta = decodeURIComponent(url.split("/documents/")[1].split("?")[0]);
    if (ruta.endsWith("/miembros")) return R({ documents: (FSDOC[ruta] || []).map((id) => ({ name: "projects/scaeli/databases/(default)/documents/" + ruta + "/" + id })) });
    const d = FSDOC[ruta]; if (!d) return R({}, 404); return R({ fields: Object.fromEntries(Object.entries(d).map(([k, v]) => [k, fsVal(v)])) }); }
  return R("no simulado: " + url, 500);
};
const env = { DB: d1(), FIREBASE_SA: JSON.stringify({ client_email: "avisos@scaeli.iam.gserviceaccount.com", private_key: pem }) };
const filas = (sql, ...a) => env.DB._db.prepare(sql).all(...a);

// horas
ok(offsetMin("America/Argentina/Buenos_Aires", new Date("2026-11-23T12:00:00Z")) === -180, "Argentina va 3 horas atrás de UTC");
ok(aUTC("07:30", "America/Argentina/Buenos_Aires") === "10:30" && aUTC("22:30", "America/Argentina/Buenos_Aires") === "01:30", "07:30 y 22:30 de Argentina → 10:30 y 01:30 UTC");
ok(aUTC("12:00", "Europe/Madrid", new Date("2026-01-15T10:00:00Z")) === "11:00" && aUTC("12:00", "Europe/Madrid", new Date("2026-07-15T10:00:00Z")) === "10:00", "Madrid, invierno y verano");
ok(fechaEn("America/Argentina/Buenos_Aires", new Date("2026-11-24T02:00:00Z")) === "2026-11-23", "a las 23 de Argentina todavía es el mismo día");

// quién llama
ok(await verificarFirebase(await idTok("uidA")) === "uidA", "token de Firebase válido");
let rech = 0; for (const t of [await idTok("uidA", { aud: "otro" }), await idTok("uidA", { exp: 1 }), (await idTok("uidA")).slice(0, -4) + "AAAA", "basura"]) { try { await verificarFirebase(t); } catch (e) { rech++; } }
ok(rech === 4, "rechaza otro proyecto, vencido, firma cambiada y basura");

// alta
const TA = "tokA".padEnd(40, "x"), TB = "tokB".padEnd(40, "x"), TC = "tokC".padEnd(40, "x"), TD = "tokD".padEnd(40, "x");
await suscribir(env, "uidA", { token: TA, tz: "America/Argentina/Buenos_Aires", items: { ev: "07:00", lau: "07:30", ang: "12:00", nada: "08:00", vis: "25:00" }, gr: true, bloq: [] });
ok(filas("SELECT k, hl, hm FROM horas WHERE token=? ORDER BY k", TA).map((x) => x.k + x.hl + x.hm).join() === "ang12:0015:00,ev07:0010:00,lau07:3010:30", "guarda solo los recordatorios válidos, en UTC");
await suscribir(env, "uidA", { token: TA, tz: "America/Argentina/Buenos_Aires", items: { ev: "06:45" }, gr: false });
ok(filas("SELECT k FROM horas WHERE token=?", TA).length === 1 && filas("SELECT gr FROM subs WHERE token=?", TA)[0].gr === 0, "al cambiar, reemplaza las horas y el aviso del grupo");
await suscribir(env, "uidA", { token: TA, tz: "America/Argentina/Buenos_Aires", items: { ev: "07:00", ang: "12:00" }, gr: true });
await suscribir(env, "uidB", { token: TB, items: { ang: "12:00" }, gr: true });
await suscribir(env, "uidC", { token: TC, items: {}, gr: false });
await suscribir(env, "uidD", { token: TD, items: {}, gr: true, bloq: ["uidA"] });

// recordatorios
enviados.length = 0; let r = await recordatorios(env, new Date("2026-11-23T10:00:20Z"));
ok(r.ok === 1 && enviados[0].token === TA && /Evangelio del día · Lc 21,1-4$/.test(enviados[0].notification.title) && /^Levantando los ojos/.test(enviados[0].notification.body) && enviados[0].data.link === "./?abrir=evangelio", "a las 07:00 llega el Evangelio, con la cita y el comienzo");
ok(enviados[0].webpush.notification.icon.startsWith("https://") && enviados[0].webpush.headers.TTL === "10800", "con ícono y vence a las 3 horas");
enviados.length = 0; muertos = new Set([TB]); r = await recordatorios(env, new Date("2026-11-23T15:00:05Z"));
ok(r.ok === 1 && r.baja === 1 && enviados[0].notification.title === "Ángelus" && enviados[0].data.link === "./?abrir=angelus", "a las 12:00 el Ángelus; el token vencido...");
ok(!filas("SELECT 1 FROM subs WHERE token=?", TB).length && !filas("SELECT 1 FROM horas WHERE token=?", TB).length, "...se borra solo");
await suscribir(env, "uidB", { token: TB, items: { ang: "12:00" }, gr: true }); muertos = new Set();
enviados.length = 0; r = await recordatorios(env, new Date("2026-11-23T11:11:00Z")); ok(r.ok === 0 && !enviados.length, "a una hora sin recordatorios no manda nada");

// grupo
FSDOC["grupos/G1234"] = { n: "Los de la parroquia", creador: "uidA" };
FSDOC["grupos/G1234/miembros"] = ["uidA", "uidB", "uidC", "uidD"];
FSDOC["grupos/G1234/mensajes/mensaje0001"] = { u: "uidA", n: "Lorenzo", tx: "¿Rezamos el Rosario hoy a las 21?", t: Date.now() };
enviados.length = 0; r = await avisarGrupo(env, "uidA", "G1234", "mensaje0001");
ok(r.ok === 1 && enviados.length === 1 && enviados[0].token === TB, "avisa a los otros miembros con el aviso del grupo prendido (no a quien lo apagó, ni a quien te bloqueó, ni a vos)");
ok(enviados[0].notification.title === "Los de la parroquia" && enviados[0].notification.body === "Lorenzo: ¿Rezamos el Rosario hoy a las 21?" && enviados[0].data.link === "./?abrir=grupo&gid=G1234" && enviados[0].data.tag === "grupo-G1234", "título del grupo, quién y qué escribió, y abre el chat");
enviados.length = 0; r = await avisarGrupo(env, "uidA", "G1234", "mensaje0001"); ok(r.err === "repetido" && !enviados.length, "el mismo mensaje no se avisa dos veces");
FSDOC["grupos/G1234/mensajes/mensaje0002"] = { u: "uidB", n: "Clari", tx: "Hola", t: Date.now() };
r = await avisarGrupo(env, "uidA", "G1234", "mensaje0002"); ok(r.err === "no es tuyo", "no se puede avisar por un mensaje de otro");
FSDOC["grupos/G9999"] = { n: "Otro" }; FSDOC["grupos/G9999/miembros"] = ["uidB"]; FSDOC["grupos/G9999/mensajes/mensaje0003"] = { u: "uidA", n: "Lorenzo", tx: "x", t: Date.now() };
r = await avisarGrupo(env, "uidA", "G9999", "mensaje0003"); ok(r.err === "no sos miembro", "ni en un grupo del que no sos miembro");
FSDOC["grupos/G1234/mensajes/mensaje0004"] = { u: "uidA", n: "Lorenzo", tx: "Mañana Misa a las 19", tipo: "rec", t: Date.now() };
enviados.length = 0; await avisarGrupo(env, "uidA", "G1234", "mensaje0004"); ok(enviados[0] && enviados[0].notification.body === "Recordatorio de Lorenzo: Mañana Misa a las 19", "recordatorio del grupo");
FSDOC["grupos/G1234/mensajes/mensaje0005"] = { u: "uidA", n: "Lorenzo", tx: "viejo", t: Date.now() - 3600e3 };
r = await avisarGrupo(env, "uidA", "G1234", "mensaje0005"); ok(r.err === "viejo", "un mensaje de hace una hora no se avisa");

// por la red (fetch del Worker)
const req = async (ruta, body, tok, origin = "https://daily.scaeli.com.ar") => W.fetch(new Request("https://x.workers.dev" + ruta, { method: "POST", headers: { origin, "content-type": "application/json", ...(tok ? { authorization: "Bearer " + tok } : {}) }, body: JSON.stringify(body) }), env);
let res = await req("/suscribir", { token: TC, items: { vis: "19:00" } }); ok(res.status === 401, "sin sesión: 401");
res = await req("/suscribir", { token: TC, items: { vis: "19:00" }, gr: true }, await idTok("uidC")); ok(res.status === 200 && (await res.json()).n === 1 && res.headers.get("access-control-allow-origin") === "https://daily.scaeli.com.ar", "con sesión se suscribe (y responde a la app)");
res = await W.fetch(new Request("https://x.workers.dev/suscribir", { method: "OPTIONS", headers: { origin: "capacitor://localhost" } }), env); ok(res.status === 204 && res.headers.get("access-control-allow-origin") === "capacitor://localhost", "la app de Android también puede llamar");
res = await req("/baja", { token: TC }, await idTok("uidB")); ok(filas("SELECT 1 FROM subs WHERE token=?", TC).length === 1, "nadie puede dar de baja el dispositivo de otro");
res = await req("/baja", { token: TC }, await idTok("uidC")); ok(!filas("SELECT 1 FROM subs WHERE token=?", TC).length && !filas("SELECT 1 FROM horas WHERE token=?", TC).length, "baja");
enviados.length = 0; res = await req("/prueba", {}, await idTok("uidA")); ok((await res.json()).ok === 1 && enviados[0].token === TA, "aviso de prueba a tus dispositivos");

console.log(fails.join("\n") || "AVISOS OK"); process.exit(fails.length ? 1 : 0);
