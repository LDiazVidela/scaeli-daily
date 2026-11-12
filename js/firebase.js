// Conexión con Firebase (proyecto "scaeli", el mismo de Scaeli Fit y del juego). La configuración es pública por diseño:
// la seguridad está en las reglas (firestore.rules). Todo lo de Daily vive en users/{uid}/daily_* para no pisar lo de Fit.
// El SDK viene con la app (vendor/firebase, la misma versión 10.14.1 de gstatic): anda sin conexión y dentro de la app de las tiendas.
// Si por algo no carga, se prueba desde gstatic; y si tampoco, el modo sin cuenta sigue andando.
import { esNativo, plugin } from "./nativo.js";
const SDK_LOCAL=new URL("../vendor/firebase/",import.meta.url).href, SDK_CDN="https://www.gstatic.com/firebasejs/10.14.1/";
let F=null;
async function sdk(){ if(F) return F;
  for(const base of [SDK_LOCAL,SDK_CDN]){ try{ const [A,U,S]=await Promise.all([import(base+"firebase-app.js"),import(base+"firebase-auth.js"),import(base+"firebase-firestore.js")]); F={...A,...U,...S}; return F; }catch(e){} }
  throw new Error("sdk"); }

export const firebaseConfig = {
  apiKey: "AIzaSyDmiaXoh1wQGloS6KqDOOoZhWMkfQsOGnw",
  authDomain: "scaeli.firebaseapp.com",
  projectId: "scaeli",
  storageBucket: "scaeli.firebasestorage.app",
  messagingSenderId: "985684720340",
  appId: "1:985684720340:web:1a7cf65f28a56132aad941"
};

let app=null, auth=null, db=null, provider=null;
export async function conectar(){
  if(app) return true;
  try{
    const f=await sdk();
    app=f.initializeApp(firebaseConfig); auth=f.getAuth(app); provider=new f.GoogleAuthProvider();
    try{ db=f.initializeFirestore(app,{ localCache: f.persistentLocalCache({ tabManager: f.persistentMultipleTabManager() }) }); }
    catch(e){ db=f.initializeFirestore(app,{}); }
    return true;
  }catch(e){ app=null; return false; }
}
const standalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

/* entrar: "google" o "apple". En la app de las tiendas, con la cuenta del teléfono (plugin nativo); en el navegador, con la ventana de Google o Apple. */
const CAL="https://www.googleapis.com/auth/calendar.events";
async function credNativa(quien, scopes){
  const FA=plugin("FirebaseAuthentication"); if(!FA) throw Object.assign(new Error("Falta el módulo de inicio de sesión de la app."),{code:"nativo"});
  if(quien==="apple"){ const r=await FA.signInWithApple({skipNativeAuth:true}); const c=r.credential||{}; return new F.OAuthProvider("apple.com").credential({idToken:c.idToken,rawNonce:c.nonce}); }
  const r=await FA.signInWithGoogle({skipNativeAuth:true,scopes:scopes||[]}); const c=r.credential||{};
  return { cred:F.GoogleAuthProvider.credential(c.idToken||null,c.accessToken||null), accessToken:c.accessToken };
}
function proveedorWeb(quien){ if(quien==="apple"){ const p=new F.OAuthProvider("apple.com"); p.addScope("email"); p.addScope("name"); p.setCustomParameters({locale:"es"}); return p; } return provider; }
export async function login(quien="google") {
  if(!(await conectar())) throw Object.assign(new Error("Acá no se puede entrar (no carga el servicio). Usá «Probar sin cuenta» o abrí la app desde su dirección."), { code: "sdk" });
  try {
    if(esNativo()){ const c=await credNativa(quien); return await F.signInWithCredential(auth, c.cred||c); }
    return await F.signInWithPopup(auth, proveedorWeb(quien)); }
  catch (e) {
    const code = (e && e.code) || "";
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") throw Object.assign(new Error("Cerraste la ventana de Google antes de terminar."), { code });
    if (code === "auth/operation-not-allowed") throw Object.assign(new Error("Falta activar el ingreso con "+(quien==="apple"?"Apple":"Google")+" en Firebase → Authentication → Sign-in method."), { code });
    if (code === "auth/account-exists-with-different-credential") throw Object.assign(new Error("Ese correo ya tiene cuenta con el otro botón: entrá con ese."), { code });
    if (/cancel/i.test(String(e&&e.message)) && esNativo()) throw Object.assign(new Error("Se canceló el ingreso."), { code:"cancel" });
    if (code === "auth/unauthorized-domain") throw Object.assign(new Error("Este dominio no está autorizado en Firebase: agregá " + location.hostname + " en Authentication → Dominios autorizados."), { code });
    if (standalone() || code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment")
      throw Object.assign(new Error("Acá no se puede abrir la ventana de Google. Entrá desde Safari o Chrome (no desde el ícono de inicio) y después volvé."), { code });
    throw e;
  }
}
/* Google Calendar: pide el permiso para leer y crear eventos y devuelve el token (dura una hora) */
export async function calendarioToken(){
  if(!(await conectar())) throw Object.assign(new Error("Acá no se puede conectar con Google (no carga el servicio)."),{code:"sdk"});
  if(esNativo()){ const c=await credNativa("google",[CAL]); if(!c.accessToken) throw new Error("Google no devolvió el permiso."); return c.accessToken; }
  const prov=new F.GoogleAuthProvider(); prov.addScope(CAL);
  const res = auth.currentUser ? await F.reauthenticateWithPopup(auth.currentUser, prov) : await F.signInWithPopup(auth, prov);
  const cred=F.GoogleAuthProvider.credentialFromResult(res); if(!cred||!cred.accessToken) throw new Error("Google no devolvió el permiso.");
  return cred.accessToken;
}
export const logout = async () => { try{ const FA=plugin("FirebaseAuthentication"); if(FA) await FA.signOut(); }catch(e){} return auth ? F.signOut(auth) : null; };

/* ── borrar la cuenta (pedido de Google Play y de Apple) ──
   Borra los datos de Daily y la cuenta de ingreso. La cuenta es la misma de Scaeli Fit y del juego: lo de ellos lo borra la extensión
   «Delete User Data» de Firebase (users/{UID}, recursivo), que corre sola cuando se borra la cuenta. */
export async function borrarCuenta(backend, cols){
  if(!(await conectar())||!auth.currentUser) throw new Error("No hay una cuenta abierta.");
  if(backend&&backend.borrarCols) await backend.borrarCols(cols);
  try{ await auth.currentUser.delete(); }
  catch(e){
    if(e&&e.code==="auth/requires-recent-login"){
      const quien=(auth.currentUser.providerData[0]||{}).providerId==="apple.com"?"apple":"google";
      if(esNativo()){ const c=await credNativa(quien); await F.reauthenticateWithCredential(auth.currentUser, c.cred||c); }
      else await F.reauthenticateWithPopup(auth.currentUser, proveedorWeb(quien));
      await auth.currentUser.delete();
    } else throw e;
  }
  try{ const FA=plugin("FirebaseAuthentication"); if(FA) await FA.signOut(); }catch(e){}
  return true;
}
export const watchAuth = async (cb) => { if(!(await conectar())){ cb(null); return ()=>{}; } return F.onAuthStateChanged(auth, cb); };
export const finishRedirect = async () => (await conectar()) ? F.getRedirectResult(auth).catch(() => null) : null;

/* ── Capa de datos en Firestore: users/{uid}/daily_<col>/<id> ── */
export function userBackend(uid, onError) {
  const path = (p) => F.doc(db, "users/" + uid + "/" + p);
  const col = (c) => F.collection(db, "users/" + uid + "/" + c);
  const err = (e) => onError && onError(e);
  return {
    mode: "firestore", uid,
    watchDoc(p, cb) { return F.onSnapshot(path(p), (s) => cb(s.exists() ? s.data() : null), err); },
    watchCol(c, cb) { return F.onSnapshot(col(c), (s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() }))), err); },
    setDoc(p, data) { return F.setDoc(path(p), data); },
    delDoc(p) { return F.deleteDoc(path(p)); },
    async importAll(dump) {
      let n = 0, batch = F.writeBatch(db), inBatch = 0;
      for (const c of Object.keys(dump)) for (const id of Object.keys(dump[c] || {})) {
        batch.set(path(c + "/" + id), dump[c][id]); n++; inBatch++;
        if (inBatch >= 400) { await batch.commit(); batch = F.writeBatch(db); inBatch = 0; }
      }
      if (inBatch) await batch.commit();
      return n;
    },
    async borrarCols(cols) {
      for (const c of cols) { const s = await F.getDocs(col(c)); let batch = F.writeBatch(db), n = 0;
        for (const d of s.docs) { batch.delete(d.ref); if (++n >= 400) { await batch.commit(); batch = F.writeBatch(db); n = 0; } }
        if (n) await batch.commit(); }
    },
    async exportAll(cols) {
      const out = {};
      for (const c of cols) { const s = await F.getDocs(col(c)); out[c] = {}; s.docs.forEach((d) => out[c][d.id] = d.data()); }
      return out;
    }
  };
}

/* ── Modo invitado: la misma capa, guardada en este dispositivo (localStorage). Sirve sin cuenta y para las pruebas. ── */
export function localBackend() {
  const K = "scaeli-daily-local";
  let store = {}; try { store = JSON.parse(localStorage.getItem(K) || "{}"); } catch (e) { store = {}; }
  const save = () => { try { localStorage.setItem(K, JSON.stringify(store)); } catch (e) {} };
  const subs = [];   // [{p|c, cb}]
  const emit = () => subs.forEach((s) => { try { s.c ? s.cb(listCol(s.c)) : s.cb(store[s.p] === undefined ? null : store[s.p]); } catch (e) {} });
  const listCol = (c) => Object.keys(store).filter((k) => k.startsWith(c + "/")).map((k) => ({ id: k.slice(c.length + 1), ...store[k] }));
  return {
    mode: "local", uid: "local",
    watchDoc(p, cb) { const s = { p, cb }; subs.push(s); setTimeout(() => cb(store[p] === undefined ? null : store[p]), 0); return () => { const i = subs.indexOf(s); if (i >= 0) subs.splice(i, 1); }; },
    watchCol(c, cb) { const s = { c, cb }; subs.push(s); setTimeout(() => cb(listCol(c)), 0); return () => { const i = subs.indexOf(s); if (i >= 0) subs.splice(i, 1); }; },
    async setDoc(p, data) { store[p] = JSON.parse(JSON.stringify(data)); save(); emit(); },
    async delDoc(p) { delete store[p]; save(); emit(); },
    async importAll(dump) { let n = 0; for (const c of Object.keys(dump)) for (const id of Object.keys(dump[c] || {})) { store[c + "/" + id] = dump[c][id]; n++; } save(); emit(); return n; },
    async exportAll(cols) { const out = {}; for (const c of cols) { out[c] = {}; listCol(c).forEach((d) => { const { id, ...r } = d; out[c][id] = r; }); } return out; },
    async borrarCols() { store = {}; save(); emit(); },
    _borrarTodo() { store = {}; save(); emit(); }
  };
}

/* ── Grupos de perseverancia (1.8): grupos/{gid} (nombre, creador) y grupos/{gid}/miembros/{uid} (lo de cada uno).
   Cada persona escribe SOLO su propio documento de miembro; el ranking, el desafío y los alientos se calculan leyendo los de todos. ── */
const GID_LETRAS="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const nuevoGid=()=>{ const a=new Uint8Array(8); (crypto.getRandomValues?crypto.getRandomValues(a):a.forEach((_,i)=>a[i]=Math.random()*256)); return Array.from(a,x=>GID_LETRAS[x%GID_LETRAS.length]).join(""); };
export function gruposBackend(uid){
  const g=(gid)=>F.doc(db,"grupos/"+gid), m=(gid,u)=>F.doc(db,"grupos/"+gid+"/miembros/"+u), col=(gid)=>F.collection(db,"grupos/"+gid+"/miembros");
  return {
    mode:"firestore",
    async crear(nombre,miembro){ const gid=nuevoGid(); await F.setDoc(g(gid),{n:nombre,creador:uid,t:Date.now()}); await F.setDoc(m(gid,uid),{...miembro,t:Date.now()}); return gid; },
    async leer(gid){ const s=await F.getDoc(g(gid)); return s.exists()?{id:gid,...s.data()}:null; },
    watch(gid,cb){ let meta=null, L=null; const emit=()=>cb(meta,L);
      const u1=F.onSnapshot(g(gid),s=>{ meta=s.exists()?{id:gid,...s.data()}:false; emit(); },e=>cb(null,null,e));
      const u2=F.onSnapshot(col(gid),s=>{ L=s.docs.map(d=>({uid:d.id,...d.data()})); emit(); },e=>cb(null,null,e));
      return ()=>{ u1(); u2(); }; },
    setMiembro(gid,data){ return F.setDoc(m(gid,uid),{...data,t:Date.now()},{merge:true}); },
    async salir(gid){ await F.deleteDoc(m(gid,uid)); try{ const s=await F.getDocs(col(gid)); if(s.empty){ const d=await F.getDoc(g(gid)); if(d.exists()&&d.data().creador===uid) await F.deleteDoc(g(gid)); } }catch(e){} },
    echar(gid,u){ return F.deleteDoc(m(gid,u)); },
    setMeta(gid,patch){ return F.updateDoc(g(gid),patch); },
    /* muro del grupo (1.9): grupos/{gid}/mensajes/{id} = {u, n, tx, t, tipo?, a:{uid:1}, rep:{uid:1}} · últimos 100 */
    watchMuro(gid,cb){ const q=F.query(F.collection(db,"grupos/"+gid+"/mensajes"),F.orderBy("t","desc"),F.limit(100)); return F.onSnapshot(q,s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))),()=>cb([])); },
    escribir(gid,msg){ return F.addDoc(F.collection(db,"grupos/"+gid+"/mensajes"),{...msg,u:uid,t:Date.now()}); },
    borrarMsg(gid,id){ return F.deleteDoc(F.doc(db,"grupos/"+gid+"/mensajes/"+id)); },
    amenMsg(gid,id,on){ return F.updateDoc(F.doc(db,"grupos/"+gid+"/mensajes/"+id),{["a."+uid]:on?1:F.deleteField()}); },
    reportarMsg(gid,id){ return F.updateDoc(F.doc(db,"grupos/"+gid+"/mensajes/"+id),{["rep."+uid]:1}); },
    /* ranking de grupos (1.12): ranking/{gid} = {n, sem, pts, m, t}; lo escribe cualquier miembro, lo leen todos */
    setRanking(gid,d){ return F.setDoc(F.doc(db,"ranking/"+gid),d); },
    watchRanking(sem,cb){ const q=F.query(F.collection(db,"ranking"),F.where("sem","==",sem)); return F.onSnapshot(q,s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))),()=>cb([])); }
  }; }
/* la misma capa sin cuenta: en este dispositivo (sirve para probar la pantalla; un grupo de verdad necesita la cuenta de Google) */
export function gruposLocal(uid){ const K="scaeli-daily-grupos"; let st={}; try{ st=JSON.parse(localStorage.getItem(K)||"{}"); }catch(e){ st={}; }
  const save=()=>{ try{ localStorage.setItem(K,JSON.stringify(st)); }catch(e){} }; const subs=[], msubs=[], rsubs=[]; const rlist=sem=>{ let R={}; try{ R=JSON.parse(localStorage.getItem("scaeli-daily-ranking")||"{}"); }catch(e){} return Object.entries(R).filter(([k,v])=>v.sem===sem).map(([k,v])=>({id:k,...v})); };
  const emitMuro=gid=>msubs.filter(s=>s.gid===gid).forEach(s=>s.cb(st[gid]?(st[gid].muro||[]).slice():[]));
  const emit=gid=>subs.filter(s=>s.gid===gid).forEach(s=>{ const G=st[gid]; s.cb(G?{id:gid,...G.meta}:false,G?Object.entries(G.m).map(([u,d])=>({uid:u,...d})):[]); });
  return {
    mode:"local",
    async crear(nombre,miembro){ const gid=nuevoGid(); st[gid]={meta:{n:nombre,creador:uid,t:Date.now()},m:{[uid]:{...miembro,t:Date.now()}}}; save(); return gid; },
    async leer(gid){ return st[gid]?{id:gid,...st[gid].meta}:null; },
    watch(gid,cb){ const s={gid,cb}; subs.push(s); setTimeout(()=>emit(gid),0); return ()=>{ const i=subs.indexOf(s); if(i>=0) subs.splice(i,1); }; },
    async setMiembro(gid,data){ const G=st[gid]; if(!G) return; G.m[uid]={...(G.m[uid]||{}),...JSON.parse(JSON.stringify(data)),t:Date.now()}; save(); emit(gid); },
    async salir(gid){ const G=st[gid]; if(!G) return; delete G.m[uid]; if(!Object.keys(G.m).length) delete st[gid]; save(); emit(gid); },
    async echar(gid,u){ const G=st[gid]; if(G){ delete G.m[u]; save(); emit(gid); } },
    async setMeta(gid,patch){ const G=st[gid]; if(G){ Object.assign(G.meta,patch); save(); emit(gid); } },
    _sembrar(gid,miembros){ if(!st[gid]) return; Object.assign(st[gid].m,miembros); save(); emit(gid); },
    watchMuro(gid,cb){ const s={gid,cb,muro:1}; msubs.push(s); setTimeout(()=>emitMuro(gid),0); return ()=>{ const i=msubs.indexOf(s); if(i>=0) msubs.splice(i,1); }; },
    async escribir(gid,msg){ const G=st[gid]; if(!G) return; G.muro=G.muro||[]; G.muro.unshift({id:"m"+Date.now().toString(36)+Math.random().toString(36).slice(2,6),...JSON.parse(JSON.stringify(msg)),u:uid,t:Date.now()}); G.muro=G.muro.slice(0,100); save(); emitMuro(gid); },
    async borrarMsg(gid,id){ const G=st[gid]; if(!G||!G.muro) return; G.muro=G.muro.filter(x=>x.id!==id); save(); emitMuro(gid); },
    async amenMsg(gid,id,on){ const G=st[gid], x=G&&(G.muro||[]).find(y=>y.id===id); if(!x) return; x.a=x.a||{}; if(on) x.a[uid]=1; else delete x.a[uid]; save(); emitMuro(gid); },
    async setRanking(gid,d){ let R={}; try{ R=JSON.parse(localStorage.getItem("scaeli-daily-ranking")||"{}"); }catch(e){} R[gid]=JSON.parse(JSON.stringify(d)); try{ localStorage.setItem("scaeli-daily-ranking",JSON.stringify(R)); }catch(e){} rsubs.forEach(s=>s.cb(rlist(s.sem))); },
    watchRanking(sem,cb){ const s={sem,cb}; rsubs.push(s); setTimeout(()=>cb(rlist(sem)),0); return ()=>{ const i=rsubs.indexOf(s); if(i>=0) rsubs.splice(i,1); }; },
    async reportarMsg(gid,id){ const G=st[gid], x=G&&(G.muro||[]).find(y=>y.id===id); if(!x) return; x.rep=x.rep||{}; x.rep[uid]=1; save(); emitMuro(gid); },
    _sembrarMuro(gid,msgs){ const G=st[gid]; if(!G) return; G.muro=msgs.concat(G.muro||[]).slice(0,100); save(); emitMuro(gid); }
  }; }

/* ── Scaeli+ compartido con Scaeli Fit (docs/SCAELI_PLUS_COMPARTIDO.md): users/{uid}/settings/plus es la fuente de verdad; codes/{CODIGO} los códigos ── */
export function plusBackend(uid){ const ref=()=>F.doc(db,"users/"+uid+"/settings/plus");
  return {
    watch(cb){ return F.onSnapshot(ref(),s=>cb(s.exists()?s.data():null),()=>cb(null)); },
    async leer(){ try{ const s=await F.getDoc(ref()); return s.exists()?s.data():null; }catch(e){ return null; } },
    escribir(doc){ return F.setDoc(ref(),{...doc,app:"daily",updated:Date.now()},{merge:true}); },
    /* canjear un código: valida max y until, suma un uso y escribe el documento */
    async canjear(codigo){ const c=String(codigo||"").trim().toUpperCase(); if(!c) return {ok:false,msg:"Escribí el código."};
      const cref=F.doc(db,"codes/"+c); let s; try{ s=await F.getDoc(cref); }catch(e){ return {ok:false,msg:"No se pudo leer el código. Revisá la conexión."}; }
      if(!s.exists()) return {ok:false,msg:"Ese código no es válido."}; const d=s.data(), hoy=new Date().toISOString().slice(0,10);
      if(d.until&&String(d.until)<hoy) return {ok:false,msg:"Ese código ya venció."}; if(d.max&&(d.uses||0)>=d.max) return {ok:false,msg:"Ese código ya se usó todas las veces posibles."};
      try{ await F.updateDoc(cref,{uses:F.increment(1)}); }catch(e){ return {ok:false,msg:"No se pudo canjear el código."}; }
      let until=null; if(d.days){ const t=new Date(); t.setDate(t.getDate()+Number(d.days)); until=t.toISOString().slice(0,10); }
      const doc={active:true,source:"code",plan:null,code:c,since:hoy,until}; await this.escribir(doc); return {ok:true,doc,label:d.label||""}; }
  }; }
