// Lo que cambia cuando Daily corre como app de las tiendas (Capacitor): avisos del teléfono y entrada nativa.
// En el navegador nada de esto existe y la app sigue como siempre.
const C = () => window.Capacitor;
export const esNativo = () => !!(C() && C().isNativePlatform && C().isNativePlatform());
export const plataforma = () => (C() && C().getPlatform ? C().getPlatform() : "web");
export const plugin = (n) => (esNativo() && C().Plugins ? C().Plugins[n] : null);

/* ── avisos del teléfono (llegan aunque la app esté cerrada) ── */
const ID_MANANA = 1, ID_NOCHE = 2, ID_TAREAS = 1000;
let permiso = null;
export async function pedirPermisoAvisos() {
  const LN = plugin("LocalNotifications"); if (!LN) return false;
  try { let p = await LN.checkPermissions(); if (p.display !== "granted") p = await LN.requestPermissions(); permiso = p.display === "granted"; return permiso; }
  catch (e) { return false; }
}
function hashId(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return ID_TAREAS + (Math.abs(h) % 900000); }

/* rec: {on, m:"07:30", n:"21:30"} · tareas: [{id,t,f:"AAAA-MM-DD",hr:"HH:MM",ok}] */
export async function programarAvisosNativos(rec, tareas) {
  const LN = plugin("LocalNotifications"); if (!LN) return false;
  try {
    const pend = await LN.getPending(); if (pend.notifications.length) await LN.cancel({ notifications: pend.notifications.map((n) => ({ id: n.id })) });
    if (!rec || !rec.on) return true;
    if (permiso === null) await pedirPermisoAvisos(); if (!permiso) return false;
    const L = [];
    const diario = (id, hm, title, body) => { if (!hm) return; const [h, m] = hm.split(":").map(Number); L.push({ id, title, body, schedule: { on: { hour: h, minute: m }, allowWhileIdle: true }, smallIcon: "ic_stat_vela" }); };
    diario(ID_MANANA, rec.m, "Oración de la mañana", "Señor, en tus manos pongo este día.");
    diario(ID_NOCHE, rec.n, "Oración de la noche", "Dos minutos para dejar el día en manos de Dios.");
    const ahora = Date.now();
    (tareas || []).filter((p) => !p.ok && (p.f || p.d) && p.hr).forEach((p) => {
      const at = new Date((p.f || p.d) + "T" + p.hr); if (at.getTime() > ahora) L.push({ id: hashId(p.id), title: p.t, body: "Tarea · " + p.hr, schedule: { at, allowWhileIdle: true }, smallIcon: "ic_stat_vela" });
    });
    if (L.length) await LN.schedule({ notifications: L.slice(0, 60) });
    return true;
  } catch (e) { return false; }
}

/* ── Scaeli+ y donaciones: compras de Google Play y App Store, a través de RevenueCat ──
   Completar las claves públicas de RevenueCat (Project settings → API keys) antes de compilar para las tiendas.
   Productos: suscripción con el permiso (entitlement) «plus» y paquetes $rc_monthly y $rc_annual en la oferta actual;
   donaciones: productos consumibles scaeli_donacion_1, scaeli_donacion_2 y scaeli_donacion_3. */
export const RC_CLAVES = { android: "", ios: "" };
export const DONACIONES = ["scaeli_donacion_1", "scaeli_donacion_2", "scaeli_donacion_3"];
let rcListo = null;
const rc = () => plugin("Purchases");
export const comprasDisponibles = () => !!(rc() && RC_CLAVES[plataforma()]);
export async function comprasIniciar(appUserID) {
  if (!comprasDisponibles()) return false;
  if (!rcListo) rcListo = rc().configure({ apiKey: RC_CLAVES[plataforma()], appUserID: appUserID || undefined }).then(() => true).catch(() => false);
  const ok = await rcListo; if (ok && appUserID) { try { await rc().logIn({ appUserID }); } catch (e) {} } return ok;
}
const activo = (info) => !!(info && info.entitlements && info.entitlements.active && info.entitlements.active.plus);
/* el detalle del entitlement «plus» para el documento compartido users/{uid}/settings/plus: {activo, until (YYYY-MM-DD o null), plan} */
export const detallePlus = (info) => { const e = info && info.entitlements && info.entitlements.active && info.entitlements.active.plus; if (!e) return { activo: false, until: null, plan: null };
  const exp = e.expirationDate || e.expirationDateMillis; let until = null; try { if (exp) until = new Date(typeof exp === "number" ? exp : String(exp)).toISOString().slice(0, 10); } catch (x) {}
  const id = String(e.productIdentifier || ""); return { activo: true, until, plan: /anual|annual|year/i.test(id) ? "anual" : /mensual|month/i.test(id) ? "mensual" : null }; };
export async function comprasDetalle() { if (!(await comprasIniciar())) return null; try { const { customerInfo } = await rc().getCustomerInfo(); return detallePlus(customerInfo); } catch (e) { return null; } }
export async function comprasEstado() { if (!(await comprasIniciar())) return null; try { const { customerInfo } = await rc().getCustomerInfo(); return activo(customerInfo); } catch (e) { return null; } }
export async function comprasPlanes() {
  if (!(await comprasIniciar())) return null;
  try { const o = await rc().getOfferings(); const P = (o && o.current && o.current.availablePackages) || [];
    const ver = (t) => P.find((p) => p.packageType === t || p.identifier === "$rc_" + t.toLowerCase());
    return { mensual: ver("MONTHLY"), anual: ver("ANNUAL") }; } catch (e) { return null; }
}
export async function comprar(paquete) { const { customerInfo } = await rc().purchasePackage({ aPackage: paquete }); return detallePlus(customerInfo); }
export async function restaurarCompras() { if (!(await comprasIniciar())) return null; const { customerInfo } = await rc().restorePurchases(); return detallePlus(customerInfo); }
export async function donacionesProductos() {
  if (!(await comprasIniciar())) return [];
  try { const r = await rc().getProducts({ productIdentifiers: DONACIONES, type: "NON_SUBSCRIPTION" }); return (r && r.products) || []; } catch (e) { return []; }
}
export async function donar(producto) { await rc().purchaseStoreProduct({ product: producto }); return true; }
