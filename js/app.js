// Scaeli Daily · rezar todos los días. Hermana de Scaeli Fit (misma base, misma cuenta) y del juego Scaeli.
import { gruposBackend, gruposLocal, plusBackend } from "./firebase.js";
import { login, logout, watchAuth, finishRedirect, userBackend, localBackend, calendarioToken, borrarCuenta } from "./firebase.js";
import { esNativo, plataforma, pedirPermisoAvisos, programarAvisosNativos, comprasDisponibles, comprasDetalle, comprasIniciar, comprasEstado, comprasPlanes, comprar, restaurarCompras, donacionesProductos, donar } from "./nativo.js";
import { VIRTUDES, PISTAS_VIRTUD, CAMINOS } from "../data/plus.js";
import { ORACIONES, SANTOS, MISTERIOS, ROS_MED, ROS_FATIMA, ROS_DIAS_N, CONFESION, CONFESION_N, PASOS_CONFESION, PASOS_EXAMEN, LECTIO, MJ_POOL, MISA_PARTES, LH_HORAS, EX9_LUZ, EX9_GRACIAS, MISIONES_MES } from "../data/juego.js";
import { HORA, IDEAS } from "../data/propio.js";
import { ORACIONES_MAS } from "../data/oraciones_mas.js";
import { NOVENAS } from "../data/novenas.js";
import { CAPITALES, CAPITALES_N, VIDA, CONF_CIERRE } from "../data/examen.js";
import { BIBLIOTECA, AREAS, PUBLICOS } from "../data/habitos.js";
import { LIBROS } from "../data/libros.js";
import { MISA_ORDINARIO, PREF_SANTOS, PREF_PROPIO } from "../data/misa.js";
import { SANTOS_MAS, tipoSanto, oracionSanto } from "../data/santos.js";
import { SANTORAL } from "../data/santoral.js";
import * as PJ from "./personaje.js";

export const VERSION="1.9.3";
const LOGO_GOOGLE='<svg class="logo-g" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
const LOGO_APPLE='<svg class="logo-a" viewBox="0 0 814 1000" aria-hidden="true"><path fill="currentColor" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/></svg>';
/* la dirección publicada: la app de las tiendas lee de acá los Evangelios del día (los genera la GitHub Action cada noche) */
const SITIO="https://ldiazvidela.github.io/scaeli-daily/";
const ilu=k=>"assets/ilus/daily_"+k+".png";
const ic=n=>`<svg class="i" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad=n=>String(n).padStart(2,"0");
const iso=d=>{d=d||new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())};
const parse=s=>{const[a,b,c]=s.split("-").map(Number);return new Date(a,b-1,c)};
const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return iso(d)};
const DOW=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"], DOWS=["D","L","M","M","J","V","S"];
const MESES=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const fLarga=s=>{const d=parse(s);return DOW[d.getDay()]+" "+d.getDate()+" de "+MESES[d.getMonth()]};
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const newId=p=>p+"-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const semilla=(s)=>{let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h};

/* ── el año litúrgico (como en el juego) ── */
function pascua(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mes=Math.floor((h+l-7*m+114)/31),dia=((h+l-7*m+114)%31)+1;return new Date(y,mes-1,dia)}
const masDias=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const domDespues=d=>masDias(d,(7-d.getDay())%7);
export function tiempoLit(f){ f=f||new Date(); const y=f.getFullYear(),P=pascua(y),nav=new Date(y,11,25);
  const ceniza=masDias(P,-46),jueves=masDias(P,-3),pent=masDias(P,49);
  const domAntesNav=masDias(nav,-(nav.getDay()===0?7:nav.getDay())),adv=masDias(domAntesNav,-21), bautismo=domDespues(new Date(y,0,6));
  const t=new Date(f.getFullYear(),f.getMonth(),f.getDate());
  if(t<=bautismo) return {n:"Navidad",c:"#c9a24a",l:"Tiempo de Navidad"};
  if(t>=adv&&t<nav) return {n:"Adviento",c:"#7a5ea8",l:"Tiempo de Adviento"};
  if(t>=nav) return {n:"Navidad",c:"#c9a24a",l:"Tiempo de Navidad"};
  if(t>=ceniza&&t<jueves) return {n:"Cuaresma",c:"#7a5ea8",l:"Tiempo de Cuaresma"};
  if(t>=jueves&&t<P) return {n:"Triduo",c:"#b04545",l:"Triduo Pascual"};
  if(t.getTime()===pent.getTime()) return {n:"Pentecostés",c:"#b04545",l:"Pentecostés"};
  if(t>=P&&t<pent) return {n:"Pascua",c:"#c9a24a",l:"Tiempo Pascual"};
  return {n:"Ordinario",c:"#4e8a5f",l:"Tiempo Ordinario"}; }
const santoDe=s=>SANTOS[s.slice(5)]||null;
/* la ficha de un santo: la del santoral (fuentes católicas, data/santoral.js) o, si falta, la corta */
function fuenteNom(u){ try{ const h=new URL(u).hostname.replace(/^www\./,""); return {"vatican.va":"Santa Sede","causesanti.va":"Dicasterio para las Causas de los Santos","vaticannews.va":"Vatican News","gcatholic.org":"GCatholic"}[h]||h; }catch(e){ return "Fuente"; } }
function fichaSanto(mm){ const sn=SANTOS[mm]; if(!sn) return null; const x=SANTORAL[mm]||SANTOS_MAS[mm]||{};
  return {mm,n:(SANTORAL[mm]&&SANTORAL[mm].n)||sn[0],p:x.p||[],b:x.b||sn[1],f:x.f||null,vida:x.vida||null,src:x.src||null}; }
const misteriosHoy=(d)=>{const w=(d||new Date()).getDay();for(const k in MISTERIOS)if(MISTERIOS[k].d.includes(w))return k;return "gozosos"};
const TODAS_ORA=()=>ORACIONES.concat(ORACIONES_MAS);
const rosLat=()=>!!(profile&&profile.rosLat);
const oraTxt=(n,lat)=>{const o=TODAS_ORA().find(x=>x.n===n);if(!o) return "";return (lat&&o.lat&&o.lat.length?o.lat:o.es).join("\n")};
const momento=(d)=>{const h=(d||new Date()).getHours();return h<4?"noche":h<11?"manana":h<14?"mediodia":h<19?"tarde":"noche"};

/* ── estado ── */
let user=null, backend=null, unsubs=[], ready=false, statusTxt="";
let view="hoy", sub=null, sheet=null;
let habEd=null;
let days={}, profile=null, recordatorios={m:"07:30",n:"22:00",on:false}, intents=[], rosario=null, novenas=[], propositos=[], rutina={diarias:[],habitos:[]}, editRut=false;
let evHoy=null, evEstado="", lhCache={};
const hoy=()=>iso();
const dayOf=(s)=>days[s]||{};
async function setDay(s,patch){ const d={...(days[s]||{}),...patch}; days[s]=d; await backend.setDoc("daily_days/"+s,d); render(); }
const marcar=(k,s)=>setDay(s||hoy(),{[k]:1,t:Date.now()});
/* 1.8.1: toda marca tiene vuelta atrás. Saca solo la marca; lo escrito (oraciones, Lectio, examen, diario) queda. */
async function desmarcar(k,f){ f=f||hoy(); const d=dayOf(f);
  if(k==="r"){ const n=Math.max(0,(d.rn||(d.r?1:0))-1); return setDay(f,{r:n?1:0,rn:n,t:Date.now()}); }
  if(k.startsWith("h:")){ const h={...(d.h||{})}; delete h[k.slice(2)]; return setDay(f,{h,t:Date.now()}); }
  if(k.startsWith("dd:")){ const dd={...(d.dd||{})}; delete dd[k.slice(3)]; return setDay(f,{dd,t:Date.now()}); }
  return setDay(f,{[k]:0,t:Date.now()}); }
const amenToast=(k,txt)=>toast(txt||"Amén",()=>desmarcar(k));
const desLink=(k,txt)=>'<button class="lnk des" data-a="desmarcar" data-p="'+k+'">'+ic("x")+' '+(txt||"Marcar como no rezado")+'</button>';

/* la racha y la semana: un día cuenta si rezaste algo (las oraciones del día, Evangelio, rosario, horas, examen, santo) */
const rezoAlgo=d=>!!(d&&(d.m||d.a||d.ta||d.e||d.r||d.x||d.n||d.s||d.cj||(d.h&&Object.keys(d.h).length)));
function racha(){ let n=0, s=hoy(); if(!rezoAlgo(dayOf(s))) s=addDays(s,-1); while(rezoAlgo(dayOf(s))){ n++; s=addDays(s,-1); if(n>3650) break; } return n; }
function semanaHTML(){ const d=parse(hoy()); const lun=addDays(hoy(),-((d.getDay()+6)%7)); let o='<div class="week">';
  for(let i=0;i<7;i++){ const s=addDays(lun,i), x=dayOf(s), full=rezoAlgo(x)&&(x.m||x.n)&&(x.e||x.r), half=rezoAlgo(x)&&!full; const fut=s>hoy();
    o+='<div class="d"><i class="'+(full?"on":half?"half":"")+(s===hoy()?" hoy":"")+'">'+(full?"✓":half?"·":fut?"":"")+'</i>'+DOWS[(i+1)%7]+'</div>'; }
  return o+'</div>'; }

/* ── el Evangelio del día: un archivo por día que GitHub deja listo en evangelio/ (herramientas/evangelio.mjs) ── */
async function cargarEvangelio(){ const f=hoy(); if(evHoy&&evHoy.fecha===f) return; if(evEstado===f) return; evEstado=f;
  try{ const r=await fetch((esNativo()?SITIO:"")+"evangelio/"+f+".json",{cache:"no-store"}); if(!r.ok) throw 0; const j=await r.json(); if(!j||!j.evangelio||!j.evangelio.texto) throw 0; evHoy=j; }
  catch(e){ const L=LECTIO[semilla(f)%LECTIO.length]; evHoy={fecha:f,dia:"",evangelio:{titulo:"Evangelio según "+L[0].split(" ")[0],cita:L[0],texto:L.slice(1).map(x=>x[1]).join("\n\n")},respaldo:true}; }
  render(); }
const ideaHoy=()=>IDEAS[semilla(hoy()+"i")%IDEAS.length];
/* las citas vienen con abreviaturas francesas (Evangelizo): se pasan a las españolas */
const ABR={Gn:"Gén",Ex:"Éx",Lv:"Lev",Nb:"Núm",Jg:"Jue",Rt:"Rut","1 S":"1 Sam","2 S":"2 Sam","1 R":"1 Re","2 R":"2 Re","1 Ch":"1 Cró","2 Ch":"2 Cró",Ne:"Neh",Tb:"Tob",Jb:"Job",Ps:"Sal",Pr:"Prov",Qo:"Ecl",Ct:"Cant",Sg:"Sab",Si:"Eclo",Jr:"Jer",Lm:"Lam",Ba:"Bar",Dn:"Dan",Jl:"Jl",Mi:"Miq",So:"Sof",Ha:"Hab",Za:"Zac",Ml:"Mal","1 M":"1 Mac","2 M":"2 Mac",Ac:"Hch",Rm:"Rom","1 Co":"1 Cor","2 Co":"2 Cor",Ga:"Gál",Ep:"Ef",Ph:"Flp","1 Th":"1 Tes","2 Th":"2 Tes",Tt:"Tit",Phm:"Flm",He:"Heb",Jc:"Sant","1 P":"1 Pe","2 P":"2 Pe",Jude:"Jds"};
const citaCorta=c=>{ const s=String(c||"").replace(/\.$/,"").trim(); const m=s.match(/^((?:[123] )?[A-Z][a-z]{0,3})\s+(.*)$/); return m&&ABR[m[1]]?ABR[m[1]]+" "+m[2]:s; };

/* ── la Liturgia de las Horas, de liturgiadelashoras.github.io (como en el juego) ── */
const LH_SITIO="https://liturgiadelashoras.github.io", LH_MES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const lhURL=(d,h)=>LH_SITIO+"/sync/"+d.getFullYear()+"/"+LH_MES[d.getMonth()]+"/"+pad(d.getDate())+"/"+h+".htm";
function lhParse(html){ const doc=new DOMParser().parseFromString(String(html),"text/html"); const raiz=doc.querySelector("#cuerpo")||doc.body; if(!raiz) return "";
  raiz.querySelectorAll("script,style").forEach(e=>e.remove());
  /* los títulos del sitio van en rojo y negrita: los marco como encabezados */
  raiz.querySelectorAll("strong,b").forEach(e=>{ const f=e.closest("font"); const rojo=f&&/^#?ff0000$/i.test(f.getAttribute("color")||""); const t=e.textContent.trim(); if(rojo&&t.length<60&&t===t.toUpperCase()) e.textContent="\n\n§"+t+"\n"; });
  /* el resto del texto en rojo (V., R., Ant., títulos de los salmos) queda marcado con ⟦ ⟧ para darle formato */
  const tw=doc.createTreeWalker(raiz,NodeFilter.SHOW_TEXT); const rojos=[]; while(tw.nextNode()){ const n=tw.currentNode, f=n.parentElement&&n.parentElement.closest("font"); if(f&&/^#?ff0000$/i.test(f.getAttribute("color")||"")&&n.textContent.trim()&&!n.textContent.includes("§")) rojos.push(n); }
  rojos.forEach(n=>{ n.textContent=n.textContent.replace(/^(\s*)(.*?)(\s*)$/s,(m,a,b,c)=>a+"⟦"+b+"⟧"+c); });
  raiz.querySelectorAll("br").forEach(e=>e.replaceWith("\n")); raiz.querySelectorAll("p,div,li,tr,h1,h2,h3,h4").forEach(e=>{ e.append("\n"); });
  const ls=raiz.textContent.split("\n").map(x=>x.replace(/[ \t\u00a0]+/g," ").trim()).filter((x,i,a)=>x||a[i-1]);
  const out=[]; for(const l of ls){ if(!l){ out.push(""); continue; } if(/^(Inicio|Volver|Índice|Menú|Compartir|Calendario|Ayuda|tamaño: ?A ?A ?A)$/i.test(l)) continue; out.push(l); }
  return out.join("\n").replace(/\n{3,}/g,"\n\n").trim(); }
async function lhTraer(h){ const d=new Date(); const k=iso(d)+"|"+h; if(lhCache[k]!==undefined) return lhCache[k]; lhCache[k]=null; render();
  /* primero el archivo del día que GitHub deja en horas/ (herramientas/horas.mjs); si no está, el sitio de las Horas */
  try{ if(!lhDia[iso(d)]) lhDia[iso(d)]=fetch((esNativo()?SITIO:"")+"horas/"+iso(d)+".json",{cache:"no-store"}).then(r=>r.ok?r.json():{}).catch(()=>({}));
    const dia=await lhDia[iso(d)]; if(dia&&dia[h]){ const t=lhParse(dia[h]); if(t.length>200){ lhCache[k]=t; render(); return t; } } }catch(e){}
  try{ const r=await fetch(lhURL(d,h)); if(!r.ok) throw 0; const t=lhParse(new TextDecoder("iso-8859-1").decode(await r.arrayBuffer())); lhCache[k]=t.length>200?t:""; }catch(e){ lhCache[k]=""; } render(); return lhCache[k]; }
const lhDia={};
/* la Liturgia de las Horas para rezar despacio: estrofas con aire, los dos coros alternados en los salmos, V./R. y antífonas marcadas */
function lhHTML(t){ const out=[]; let est=[], enSalmo=false, n=0;
  const rojo=s=>esc(s).replace(/⟦(.*?)⟧/g,'<span class="rb">$1</span>').replace(/[⟦⟧]/g,"");
  const cerrar=()=>{ if(!est.length) return; const txt=est.join("\n"), dox=/^Gloria al Padre/i.test(est[0]); const c=enSalmo&&!dox?(n++%2?" c2":" c1"):"";
    out.push('<p class="est'+c+(dox?" dox":"")+'">'+est.map(rojo).join("<br>")+'</p>'); est=[]; };
  const titulo=l=>{ const s=l.replace(/[⟦⟧§]/g,"").trim(); return l.startsWith("§")||(s.length<48&&/[A-ZÁÉÍÓÚÑ]{3}/.test(s)&&s===s.toUpperCase()&&!/^(V|R)\.\s/.test(s)&&/^(⟦[^⟧]*⟧)$/.test(l.trim())||(s.length<48&&s===s.toUpperCase()&&/[A-ZÁÉÍÓÚÑ]{4}/.test(s)&&!/[a-záéíóúñ]/.test(l)&&!/^(V|R)\./.test(s))); };
  for(const raw of String(t).split("\n")){ const l=raw.trim();
    if(!l){ cerrar(); continue; }
    const s=l.replace(/[⟦⟧]/g,"").trim();
    if(titulo(l)){ cerrar(); enSalmo=false; out.push('<h4>'+esc(s.replace(/^§/,""))+'</h4>'); continue; }
    if(/^⟦[^⟧]*⟧$/.test(l)){ cerrar(); enSalmo=/^(Salmo|Cántico|Cantico|Sal\s)/i.test(s); n=0; out.push('<p class="lhr">'+esc(s)+'</p>'); continue; }
    const m=s.match(/^(Ant\.?\s*\d*\.?|V\.|R\.|℣\.?|℟\.?)\s*(.*)$/);
    if(m&&/^⟦/.test(l)){ cerrar(); if(/^Ant/i.test(m[1])) enSalmo=false; out.push('<p class="'+(/^Ant/i.test(m[1])?"ant":"vr")+'"><b>'+esc(m[1].trim())+'</b> '+esc(m[2])+'</p>'); continue; }
    est.push(l); }
  cerrar(); return out.join(""); }

/* ── el personaje (js/personaje.js): los dibujos de PixelLab tal cual: varón o mujer, prenda, color y peinado ── */
PJ.cargar().then(()=>render()).catch(()=>{});
function personajeHTML(cls,v,tam){ return '<canvas class="pj '+(cls||"")+'" data-pj="'+(v||"south")+'" data-tam="'+(tam||160)+'" width="128" height="128" aria-label="Tu personaje"></canvas>'; }
function pintarPersonajes(){ document.querySelectorAll("canvas[data-pj]").forEach(cv=>{ let p=profile; if(cv.dataset.pjp){ try{ p=JSON.parse(cv.dataset.pjp); }catch(e){} } PJ.pintar(cv,p,cv.dataset.pj,+cv.dataset.tam); }); }
const momKey={manana:"m",mediodia:"a",tarde:"ta",noche:"n"};

/* ── render ── */
const typing=()=>{const a=document.activeElement;return a&&(a.tagName==="INPUT"||a.tagName==="TEXTAREA")};
let dirty=false;
function render(){ if(typing()){dirty=true;return} renderNow(); }
function irA(v){ if(typing()&&document.activeElement.blur) document.activeElement.blur(); view=v; sub=null; dirty=false; window.scrollTo(0,0); renderNow(); }
function renderNow(){ if(!ready){ renderLogin(); return; }
  document.querySelectorAll(".nav button").forEach(b=>{ if(b.dataset.view===view) b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current"); });
  const R={hoy:renderHoy,rezar:renderRezar,dia:renderDia,yo:renderYo,mas:renderMas}[view]||renderHoy;
  $("#app").innerHTML=R(); pintarPersonajes(); if(sheet) renderSheetQuieto(); }
function setStatus(t,bad){ statusTxt=t; const e=$("#status"); if(e){ e.textContent=t; e.style.color=bad?"var(--over)":""; } }
let deshacerFn=null;
function toast(t,deshacer){ const e=$("#toast"); deshacerFn=deshacer||null; e.innerHTML=esc(t)+(deshacer?' <button class="lnk" data-a="deshacer">Deshacer</button>':''); e.hidden=false; clearTimeout(toast.t); toast.t=setTimeout(()=>{ e.hidden=true; deshacerFn=null; },deshacer?4000:2200); }
function saludo(){ const h=new Date().getHours(); return h<6?"Buenas noches":h<13?"Buen día":h<20?"Buenas tardes":"Buenas noches"; }
function cab(ey,t,der){ return '<div class="top"><div class="l"><div class="eyebrow">'+ey+'</div><h1 class="title">'+t+'</h1></div><div class="r">'+(der||'')+'</div></div>'; }
/* la racha es una vela: encendida si hoy ya la cumpliste, en riesgo si todavía no (se apaga al terminar el día), apagada si la perdiste */
const VELA_SVG='<svg class="vl" viewBox="0 14 16 26" aria-hidden="true"><path class="hm" d="M8 12c-1.5-2.5 1.5-4 0-6.5"/><path class="fl" d="M8 3c2.2 2.6 3.6 4.6 3.6 7.1A3.6 3.6 0 0 1 4.4 10.1C4.4 7.6 5.8 5.6 8 3z"/><path class="hu" d="M8 7.2c1 1.3 1.6 2.3 1.6 3.4a1.6 1.6 0 0 1-3.2 0c0-1.1.6-2.1 1.6-3.4z"/><path class="me" d="M8 11.5v3.2"/><rect class="cu" x="2.5" y="14.5" width="11" height="24" rx="1.4"/><path class="go" d="M2.5 14.5h11v2.4l-1.8 1.2v4.6a1.1 1.1 0 0 1-2.2 0v-4l-1.4-.9-1.8 1H2.5z"/></svg>';
const velaHTML=(n,hoyOk,cls)=>'<span class="vela '+(n?(hoyOk?"on":"riesgo"):"off")+(cls?" "+cls:"")+'" title="'+(n?(hoyOk?"Racha de "+n:"Hoy todavía no · racha de "+n):"Sin racha")+'">'+VELA_SVG+'<b>'+n+'</b></span>';
const rachaChip=()=>'<span class="chip vch">'+velaHTML(racha(),rezoAlgo(dayOf(hoy())))+' '+(racha()===1?"día":"días")+'</span>';
const tile=(k,icn,t,s,done,extra)=>'<button class="tile'+(done?" done":"")+(extra||"")+'" data-a="'+k+'"><div class="ic">'+(done?ic("check"):ic(icn))+'</div><b>'+t+'</b><small>'+s+'</small></button>';

const horaLHahora=()=>{ const h=new Date().getHours(); return h<9?"laudes":h<12?"tercia":h<15?"sexta":h<18?"nona":h<21?"visperas":"completas"; };
function cov(k,img,t,s,done,cls,p){ return '<button class="cov'+(cls?" "+cls:"")+'" data-a="'+k+'"'+(p?' data-p="'+p+'"':'')+'><img src="'+ilu(img)+'" alt="" loading="lazy"><span class="g"></span><span class="c"><b>'+t+'</b><small>'+s+'</small></span>'+'</button>'; }
/* una novena está en curso si llegan los nueve días antes de la fiesta, o si la empezaste vos («libre»): entonces el día es el que sigue al último rezado */
function novEstado(n){ const D=novDias(n), mia=novenas.find(x=>x.id===n.id)||{}, hechos=mia.dias||[];
  if(mia.libre&&hechos.length<D.d){ const h=hechos.length; const hoyYa=mia.ult===hoy(); return {...D,dia:hoyYa?h:h+1,libre:true,hoyYa,hechos}; }
  return {...D,libre:false,hoyYa:hechos.includes(D.dia),hechos}; }
const novEn=D=>D.dia>=1&&D.dia<=(D.d||9);
function novenaEnCurso(){ let mejor=null; for(const n of NOVENAS){ const D=novEstado(n); if(novEn(D)&&(!mejor||(D.libre&&!mejor.D.libre))) mejor={n,D}; } return mejor; }

/* ── los hábitos de la semana (las medallas de la 1.5.2–1.8 se reemplazaron por el nivel y los logros en la 1.8.1) ── */
const lunesDe=s=>addDays(s,-((parse(s).getDay()+6)%7));
const diaConHabito=s=>{ const hb=dayOf(s).hb||{}; return Object.values(hb).some(x=>x&&x.p>0); };
function diasHabitoSemana(lun){ let n=0; for(let i=0;i<7;i++) if(diaConHabito(addDays(lun,i))) n++; return n; }
const medallaSVG=(t,on)=>{ const C={oro:["#F5C542","#B8860B"],plata:["#D9DCE3","#8D93A0"],bronce:["#D9895B","#8C4A26"]}[t]; return '<svg class="med'+(on?"":" off")+'" viewBox="0 0 24 28" aria-hidden="true"><path d="M7 1h4l2 7H9zM13 1h4l-2 7h-4z" fill="'+(on?"#7A2233":"var(--track)")+'"/><circle cx="12" cy="17" r="9" fill="'+(on?C[0]:"var(--track)")+'" stroke="'+(on?C[1]:"var(--line2)")+'" stroke-width="2"/><path d="M12 12.5l1.4 2.9 3.1.4-2.3 2.2.6 3.1-2.8-1.5-2.8 1.5.6-3.1-2.3-2.2 3.1-.4z" fill="'+(on?C[1]:"var(--line2)")+'"/></svg>'; };
/* ── 1.8.1 · Nivel, experiencia y ánimo (estilo Habitica), todo calculado de los días guardados: si destildás algo, se devuelve solo.
   Experiencia: diaria 10 · hábito 5 · Rosario 15 · Evangelio 10 · examen 10 · oración de la mañana/noche 10 · novena 10 · hora de la Liturgia 5 · santo 5 · Misa 10 · camino 10.
   Ánimo (0–100): −5 por cada caída (− en un hábito), −3 por cada diaria sin hacer al cerrar el día (hasta −15), +10 por cada día con Dios, 100 al confesarte.
   Si llega a 0, bajás un nivel (nunca menos del 1) y vuelve a 50. ── */
const XP={m:10,n:10,e:10,x:10,r:15,nov:10,s:5,misa:10,dd:10,hab:5,h:5,cam:10};
function xpDia(f){ const d=dayOf(f); if(!d) return 0; let p=0; ["m","n","e","x","s","nov","misa"].forEach(k=>{ if(d[k]) p+=XP[k]; }); if(d.r) p+=XP.r*Math.max(1,d.rn||1);
  p+=XP.dd*Object.values(d.dd||{}).filter(Boolean).length; p+=XP.h*Object.values(d.h||{}).filter(Boolean).length; p+=XP.cam*Object.values(d.cam||{}).filter(Boolean).length;
  Object.values(d.hb||{}).forEach(x=>{ p+=XP.hab*(x.p||0); }); return p; }
const xpNivel=n=>Math.round(100*Math.pow(n,1.3));   // lo que cuesta pasar del nivel n al n+1
const TITULOS=[[1,"Peregrino","Peregrina"],[5,"Discípulo","Discípula"],[10,"Servidor","Servidora"],[20,"Testigo","Testigo"],[30,"Apóstol","Apóstol"],[50,"Santo en camino","Santa en camino"]];
function nivelDe(){ const ks=Object.keys(days).filter(k=>/^\d{4}-\d\d-\d\d$/.test(k)).sort(); let xp=0, an=100, caidas=0; const ini=ks[0];
  if(ini){ let f=ini; const h=hoy(); while(f<=h){ const d=dayOf(f); xp+=xpDia(f); if(d.cj) an=100;
    if(rezoAlgo(d)) an+=10; Object.values(d.hb||{}).forEach(x=>{ an-=5*(x.m||0); });
    if(f<h){ let sin=0; DIARIAS.forEach(x=>{ if(!d[x[0]]) sin++; }); (rutina.diarias||[]).forEach(x=>{ if(!(d.dd&&d.dd[x.id])) sin++; }); an-=Math.min(15,3*sin); }
    an=Math.min(100,an); if(an<=0){ caidas++; an=50; } f=addDays(f,1); } }
  let n=1, resto=xp; while(resto>=xpNivel(n)){ resto-=xpNivel(n); n++; } const nivel=Math.max(1,n-caidas);
  const P=PJ.normal(profile||{}), T=[...TITULOS].reverse().find(t=>nivel>=t[0]); return {xp,nivel,resto,falta:xpNivel(n),animo:Math.max(0,an),caidas,titulo:P.sx==="f"?T[2]:T[1],sinDatos:!ini}; }
let nivelAntes=null;
function nivelAviso(){ const N=nivelDe(); if(nivelAntes!==null){ if(N.nivel>nivelAntes.nivel) toast("¡Subiste al nivel "+N.nivel+"! "+N.titulo); else if(N.nivel<nivelAntes.nivel) toast("Bajaste al nivel "+N.nivel+". El ánimo vuelve a 50: la Confesión lo restaura entero."); else if(N.animo<=20&&nivelAntes.animo>20) toast("¡Ojo! Tu ánimo está en "+N.animo+". Rezá algo hoy o confesate."); } nivelAntes=N; return N; }
const corazonSVG='<svg class="cor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.5-9.3C1 7.6 3.6 4 7.2 4c2 0 3.4 1 4.8 2.7C13.4 5 14.8 4 16.8 4 20.4 4 23 7.6 21.5 11.7 19.5 16.4 12 21 12 21z"/></svg>';
function nivelHTML(cls){ const N=nivelDe(), f=N.resto/N.falta, C=2*Math.PI*26;
  return '<div class="nivel '+(cls||"")+'"><span class="nv"><svg viewBox="0 0 60 60" aria-hidden="true"><circle class="t" cx="30" cy="30" r="26"/><circle class="p" cx="30" cy="30" r="26" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+(C*(1-f)).toFixed(1)+'"/></svg><b>'+N.nivel+'</b></span>'+
   '<span class="nx"><b class="nt">'+esc(N.titulo)+' · nivel '+N.nivel+'</b><small>'+N.resto+' de '+N.falta+' de experiencia para el '+(N.nivel+1)+'</small><span class="bar"><i style="width:'+Math.round(f*100)+'%"></i></span></span>'+
   '<span class="na'+(N.animo<=20?" bajo":"")+'" title="Ánimo">'+corazonSVG+'<b>'+N.animo+'</b><small>ánimo</small></span></div>'; }
/* los fondos del personaje: ilustraciones de la app que se desbloquean con el nivel y los logros */
const FONDOS=[["manana","Mañana",null],["mediodia","La parroquia",null],["tarde","Atardecer",null],["noche","Capilla de noche",null],
  ["horas","El claustro",["nivel",3,"Nivel 3"]],["luminosos","El Jordán",["logro","r7","7 días seguidos"]],["gloriosos","La Resurrección",["nivel",5,"Nivel 5"]],["gozosos","Belén",["logro","ros30","30 Rosarios"]],
  ["evangelio","La Palabra",["logro","ev10","10 Evangelios"]],["dolorosos","El Huerto",["logro","nov1","Una novena completa"]],["santo","Los santos",["nivel",10,"Nivel 10"]],["misa","El altar",["logro","conf1","Una confesión"]],["oraciones","Manos en oración",["nivel",20,"Nivel 20"]]];
function fondoLibre(F,N,L){ if(!F[2]) return true; const [t,v]=F[2]; return t==="nivel"?N.nivel>=v:!!(L.find(x=>x.k===v)||{}).ok; }
function fondoActual(){ const k=(profile||{}).fondo; const N=nivelDe(), L=logros(); const F=FONDOS.find(x=>x[0]===k); return F&&fondoLibre(F,N,L)?F[0]:null; }
function fondosHTML(){ const N=nivelDe(), L=logros(), act=fondoActual()||"";
  return '<div class="fondos">'+FONDOS.map(F=>{ const ok=fondoLibre(F,N,L); return '<button class="fondo'+(F[0]===act?" on":"")+(ok?"":" lock")+'" data-a="fondoSet" data-p="'+F[0]+'"'+(ok?'':' aria-disabled="true"')+'><img src="'+ilu(F[0])+'" alt="" loading="lazy">'+(ok?'':'<span class="lk">'+ic("lock")+'</span>')+'<b>'+esc(F[1])+'</b><small>'+(ok?(F[2]?"Desbloqueado":"De siempre"):esc(F[2][2]))+'</small></button>'; }).join("")+'</div>'; }
/* los logros: se ganan una sola vez, se calculan de lo guardado */
const LOGROS=[["ros1","Primer Rosario","Rezaste tu primer Rosario","rosary",D=>D.ros>=1],["ros30","30 Rosarios","Treinta coronas para María","rosary",D=>D.ros>=30],["ev10","10 Evangelios","Diez días con la Palabra","book",D=>D.ev>=10],["ev100","100 Evangelios","Cien días con la Palabra","book",D=>D.ev>=100],
  ["r7","7 días seguidos","Una semana con Dios sin cortar","candle",D=>D.rmax>=7],["r30","30 días seguidos","Un mes entero con Dios","candle",D=>D.rmax>=30],["r100","100 días seguidos","Cien velas encendidas","candle",D=>D.rmax>=100],
  ["nov1","Primera novena","Nueve días con un santo","star",D=>D.nov>=1],["ex10","10 exámenes","Mirarte con verdad, diez noches","check",D=>D.ex>=10],["or10","10 oraciones","Diez veces con tus palabras","pen",D=>D.or>=10],
  ["hab100","100 hábitos","Cien pequeños sí","plus",D=>D.hab>=100],["conf1","Confesión","Volviste a casa","cross",D=>D.conf>=1],["lib1","Un libro entero","Llegaste al final de un clásico","book",D=>D.lib>=1],["n5","Nivel 5","Discípulo","user",D=>D.nivel>=5],["n10","Nivel 10","Servidor","user",D=>D.nivel>=10]];
function logrosDatos(){ const D={ros:0,ev:0,ex:0,or:0,hab:0,conf:0,rmax:0,nov:0,lib:0}; let r=0; Object.keys(days).filter(k=>/^\d{4}-\d\d-\d\d$/.test(k)).sort().forEach(k=>{ const d=days[k]; if(d.r) D.ros+=Math.max(1,d.rn||1); if(d.e) D.ev++; if(d.x) D.ex++; if(d.cj) D.conf++; const o=d.or||{}; if(o.m) D.or++; if(o.n) D.or++; Object.values(d.hb||{}).forEach(x=>{ D.hab+=x.p||0; }); });
  { let s2=addDays(hoy(),-400); while(s2<=hoy()){ if(rezoAlgo(dayOf(s2))){ r++; D.rmax=Math.max(D.rmax,r); } else r=0; s2=addDays(s2,1); } }
  novenas.forEach(x=>{ const N=NOVENAS.find(n=>n.id===x.id); if(N&&(x.dias||[]).length>=(N.d||9)) D.nov++; }); const g=libGuardado(); LIBROS.forEach(L=>{ if(g[L.id]&&g[L.id].fin) D.lib++; }); D.nivel=nivelDe().nivel; return D; }
function logros(){ const D=logrosDatos(); return LOGROS.map(l=>({k:l[0],t:l[1],d:l[2],i:l[3],ok:!!l[4](D)})); }
function logrosHTML(todos){ const L=logros(), g=L.filter(x=>x.ok); return '<div class="logros">'+(todos?L:g).map(x=>'<span class="logro'+(x.ok?" on":"")+'">'+ic(x.i)+'<b>'+esc(x.t)+'</b><small>'+esc(x.d)+'</small></span>').join("")+'</div>'+(todos?'':(g.length?'':'<p class="hint">Todavía ninguno. El primero llega con tu primer Rosario o con siete días seguidos.</p>')); }
function habitosHoyHTML(){ const H=rutina.habitos||[], lun=lunesDe(hoy()), n=diasHabitoSemana(lun);
  if(!H.length) return '<div class="card habhoy"><div class="hd"><div class="eyebrow">Tus hábitos esta semana</div></div><p class="hint" style="margin:6px 0 12px">Un hábito es algo que querés hacer crecer: rezar antes de comer, no quejarte, agradecer. Cada vez que lo hacés sumás experiencia; cada caída te baja el ánimo.</p><div class="grid2"><button class="ghost" data-a="biblioteca">'+ic("book")+' Biblioteca</button><button class="ghost g" data-a="irDia">'+ic("plus")+' Escribir uno</button></div></div>';
  const dots=h=>{ let o='<span class="hdots">'; for(let i=0;i<7;i++){ const s=addDays(lun,i), x=(dayOf(s).hb||{})[h.id]||{}; o+='<i class="'+(x.p>0?"on":x.m>0?"cae":"")+(s===hoy()?" hoy":"")+(s>hoy()?" fut":"")+'"></i>'; } return o+'</span>'; };
  const tot=h=>{ let p=0; for(let i=0;i<7;i++) p+=(((dayOf(addDays(lun,i)).hb||{})[h.id]||{}).p||0); return p; };
  return '<div class="card habhoy"><div class="hd"><div class="eyebrow">Tus hábitos esta semana</div><span class="hint" style="margin:0">'+n+' de 7 días</span></div>'+
   '<div class="hdias"><span></span><span class="hdots dw">'+[0,1,2,3,4,5,6].map(i=>'<i>'+DOWS[(i+1)%7]+'</i>').join("")+'</span><span></span></div>'+
   H.map(h=>'<div class="hrow2"><span class="n"><b>'+esc(h.t)+'</b><small>'+velaHTML(rachaHab(h.id),(((dayOf(hoy()).hb||{})[h.id]||{}).p||0)>0,"chica")+' · +'+tot(h)+' esta semana</small></span>'+dots(h)+'<button class="pm a" data-a="habMas" data-p="'+h.id+'" aria-label="Sumar">+</button></div>').join("")+
   '<button class="plusrow" data-a="progreso"><span class="n"><b>Tu progreso y tus virtudes</b><small>'+(esPlus()?'Qué virtudes trabajás y cuáles te faltan':'Con Scaeli+')+'</small></span>'+(esPlus()?ic("right"):'<span class="plus-mini">'+ic("lock")+' Scaeli+</span>')+'</button></div>'; }
/* el camino del tiempo litúrgico: se ve una semana antes de empezar y hasta el último día */
function caminoActivo(){ const h=hoy(); return Object.entries(CAMINOS).find(([k,C])=>h>=addDays(C.ini,-7)&&h<=C.fin)||null; }
function caminoHoyHTML(){ const A=caminoActivo(); if(!A) return ""; const [k,C]=A, i=caminoDia(C), d=i>=0?C.dias[i]:null, ok=d&&(dayOf(d[0]).cam||{})[k];
  return '<button class="card camhoy" data-a="camino" data-p="'+k+'"><span class="n"><span class="eyebrow">'+(d?'Camino de '+esc(C.n)+' · día '+(i+1)+' de '+C.dias.length:'Empieza el '+esc(fLarga(C.ini)))+'</span><b>'+(d?esc(d[3]):esc(C.sub))+'</b><small>'+(d?esc(d[2])+(ok?' · hecho':''):'Camino de '+esc(C.n))+'</small></span>'+(esPlus()?(ok?'<span class="ck on">'+ic("check")+'</span>':ic("right")):'<span class="plus-mini">'+ic("lock")+' Scaeli+</span>')+'</button>'; }
/* el inicio de Hoy según la hora: a la mañana y a la noche, tu propia oración; al mediodía, el Ángelus; a la tarde, el Evangelio */
const ORAR={m:["Tu oración de la mañana","¿Qué le querés decir a Dios al empezar el día?","Contale cómo empezás el día, qué te espera, qué le pedís y por quién rezás."],
  n:["Tu oración de la noche","¿Cómo estuvo tu día con Dios?","Agradecé lo bueno, pedí perdón por lo que no estuvo bien y dejá en sus manos lo que te preocupa."]};
function heroTexto(mo,d,ev){
  if(mo==="mediodia"){ const H=HORA.mediodia; return '<div class="tx"><div class="eyebrow">'+esc(H.t)+'</div><p class="q">«'+esc(H.txt.split("\n")[0].replace(/[,;:]$/,""))+'»</p><button class="ghost" data-a="hora" data-p="mediodia">'+ic("play")+' Rezar · 1 min</button></div>'; }
  if(mo==="tarde"){ const c=ev&&ev.evangelio?citaCorta(ev.evangelio.cita):""; const fr=ev&&ev.evangelio&&ev.evangelio.texto?String(ev.evangelio.texto).replace(/\s+/g," ").trim().split(/(?<=[.;:!?»])\s/)[0]:""; const q=fr?(fr.length>72?fr.slice(0,fr.lastIndexOf(" ",66))+"…":fr):"Un rato con la Palabra de hoy";
    return '<div class="tx"><div class="eyebrow">Evangelio del día</div><p class="q">'+(fr?'«'+esc(q.replace(/^[«"“]|[»"”]$/g,""))+'»':esc(q))+'</p><button class="ghost" data-a="evangelio">'+ic("book")+' '+(d.e?'Volver a leer':'Leer · 5 min')+'</button></div>'; }
  const k=mo==="manana"?"m":"n", ya=((d.or||{})[k]); return '<div class="tx"><div class="eyebrow">'+esc(ORAR[k][0])+'</div><p class="q">'+esc(ORAR[k][1])+'</p><button class="ghost" data-a="orar" data-p="'+(k==="m"?"manana":"noche")+'">'+ic("pen")+' '+(ya?'Seguir escribiendo':d[k]?'Rezaste · escribir':'Rezar')+'</button></div>'; }
function renderHoy(){ cargarEvangelio(); const d=dayOf(hoy()), nom=(profile&&profile.nombre)||(user&&user.displayName&&user.displayName.split(" ")[0])||"";
  const L=tiempoLit(), mm=hoy().slice(5), santo=SANTOS[mm], mo=momento(), H=HORA[mo], ev=evHoy, k=momKey[mo];
  const lh=horaLHahora(), LHn=LH_HORAS.find(x=>x[0]===lh)||["","",""], lhOk=!!((d.h||{})[lh]);
  const mes=MISIONES_MES[new Date().getMonth()], nv=novenaEnCurso();
  return cab(cap(fLarga(hoy()))+' · '+esc(L.l),saludo()+(nom?',<br>'+esc(nom):''),rachaChip())+
   '<div class="hero2"><img class="bg" src="'+ilu(fondoActual()||mo)+'" alt=""><span class="sh"></span>'+personajeHTML("vivo","south",150)+
     heroTexto(mo,d,ev)+'</div>'+nivelHTML("card")+
   (anioListo()?'<button class="card anioc" data-a="anio"><span class="n"><span class="eyebrow">Cristo Rey · termina el año litúrgico</span><b>Tu año con Dios · '+hoy().slice(0,4)+'</b><small>Mirá tu año en historias y compartilo</small></span>'+(esPlus()?ic("right"):'<span class="plus-mini">'+ic("lock")+' Scaeli+</span>')+'</button>':'')+
   '<button class="card lhnow" data-a="horaLH" data-p="'+lh+'"><span class="n"><span class="eyebrow">Ahora · Liturgia de las Horas</span><b>'+esc(LHn[1])+'</b><small>'+esc(LHn[2])+'</small></span><span class="ghost">Rezar</span></button>'+caminoHoyHTML()+
   '<div class="covers">'+
     cov("evangelio","evangelio","Evangelio",ev?esc(citaCorta(ev.evangelio.cita)):"Del día")+
     cov("rosario",misteriosHoy(),"Rosario",MISTERIOS[misteriosHoy()].n.replace("Misterios ",""))+
     cov("examen","examen","Examen del día","A la noche")+
     (nv?cov("novena","novenas","Novena",esc(nv.n.n)+" · día "+nv.D.dia,0,"",nv.n.id):cov("orar","noche","Tu oración de la noche","¿Cómo estuvo tu día con Dios?","","","noche"))+
     (santo?cov("santo","santo",esc(santo[0].split(",")[0]),"Santo del día"+(fichaSanto(mm).p?" · "+esc(fichaSanto(mm).p[0]):""),0,"w"):'')+
   '</div>'+
   habitosHoyHTML()+grupoCardHTML()+
   '<div class="card"><div class="eyebrow" style="margin-bottom:12px">Tu semana con Dios</div>'+semanaHTML()+'<p class="hint" style="margin-top:12px">'+esc(mes[0])+'. '+esc(mes[1])+'</p></div>'; }

function renderRezar(){ const d=dayOf(hoy()); const nv=novenaEnCurso(); const lh=horaLHahora(), LHn=LH_HORAS.find(x=>x[0]===lh)||["",""];
  return cab("Rezar","¿Cómo querés<br>rezar hoy?",rachaChip())+'<div class="covers">'+
   (caminoActivo()?cov("camino","noche","Camino de "+esc(caminoActivo()[1].n),esc(caminoActivo()[1].sub)+(esPlus()?"":" · Scaeli+"),0,"w",caminoActivo()[0]):'')+
   cov("rosario","rosario","Santo Rosario",MISTERIOS[misteriosHoy()].n+" · 20 min",0,"w")+
   cov("evangelio","evangelio","Evangelio del día","5 min")+
   cov("horas","horas","Liturgia de las Horas","Ahora: "+esc(LHn[1]))+
   cov("oraciones","oraciones","Oraciones","Las de siempre")+
   cov("novenas","novenas","Novenas",nv?esc(nv.n.n)+" · día "+nv.D.dia:"Nueve días con un santo")+
   cov("biblia","biblia","La Biblia",bibUltima()?"Seguir en "+esc(bibUltima()):"Buscá un libro, un capítulo o una palabra",0,"w")+
   cov("libros","oraciones","Biblioteca",libUltimo()?"Seguir con "+esc(libUltimo().L.t):"Santa Teresa, San Juan de la Cruz, Kempis…")+
   cov("examen","examen","Examen del día","A la noche · 5 min")+
   cov("confesion","confesion","Confesión","Los pasos y el examen")+
   cov("misa","misa","La Misa de hoy","Guía del celebrante y lecturas")+
   cov("santoral","santo","Santoral","Todos los santos del año")+
   '</div><p class="hint" style="text-align:center;padding:8px 0">«Vengan a mí todos los que están afligidos y agobiados, y yo los aliviaré.» <span class="muted">Mt 11, 28</span></p>'; }

/* ── Tu día: diarias (con racha), hábitos (+ y −) y tareas, al estilo Habitica; abajo el diario y el mes ── */
const DIARIAS=[["m","Oración de la mañana","orar","manana"],["e","Evangelio del día","evangelio",""],["r","Santo Rosario","rosario",""],["x","Examen del día","examen",""],["n","Oración de la noche","orar","noche"]];
function rachaDe(test){ let n=0,s=hoy(); if(!test(dayOf(s))) s=addDays(s,-1); while(test(dayOf(s))){ n++; s=addDays(s,-1); if(n>3650) break; } return n; }
const rachaHab=id=>rachaDe(z=>!!(z.hb&&z.hb[id]&&z.hb[id].p>0));
function diariasHoy(){ const d=dayOf(hoy()), dd=d.dd||{};
  return [...DIARIAS.map(x=>({k:x[0],t:x[1],a:x[2],p:x[3],ok:!!d[x[0]],racha:rachaDe(z=>!!z[x[0]]),fija:1})),
          ...(rutina.diarias||[]).map(x=>({k:x.id,t:x.t,ok:!!dd[x.id],racha:rachaDe(z=>!!(z.dd&&z.dd[x.id])),fija:0}))]; }
function fechaTarea(f){ if(!f) return ""; const h=hoy(); if(f===h) return "Hoy"; if(f===addDays(h,1)) return "Mañana"; if(f<h) return "Venció "+(f===addDays(h,-1)?"ayer":fLarga(f).replace(/^\w+ /,"")); return cap(fLarga(f)); }
function renderDia(){ const s=hoy(), d=dayOf(s), hb=d.hb||{};
  const D=diariasHoy(), hechas=D.filter(x=>x.ok).length;
  const ed=(t)=>'<div class="hd"><div class="eyebrow">'+t+'</div><button class="lnk" data-a="rutEdit">'+(editRut?"Listo":"Editar")+'</button></div>';

  const tareas=propositos.filter(p=>!p.ok||p.d===s).sort((a,b)=>(a.ok?1:0)-(b.ok?1:0)||String(a.f||"9").localeCompare(String(b.f||"9")));
  return cab(cap(fLarga(s)),"Tu día",'<span class="chip">'+hechas+' de '+D.length+'</span>')+
   '<div class="bar"><i style="width:'+Math.round(hechas/Math.max(1,D.length)*100)+'%"></i></div>'+
   '<div class="card hab">'+ed("Diarias")+D.map(x=>'<div class="hrow"><button class="ck'+(x.ok?' on':'')+'" data-a="diaria" data-p="'+x.k+'" aria-label="Hecha">'+(x.ok?ic("check"):'')+'</button>'+
      (x.a?'<button class="n" data-a="'+x.a+'"'+(x.p?' data-p="'+x.p+'"':'')+'><b'+(x.ok?' class="tach"':'')+'>'+esc(x.t)+'</b><small>Tocá para rezar</small></button>':'<span class="n"><b'+(x.ok?' class="tach"':'')+'>'+esc(x.t)+'</b></span>')+
      velaHTML(x.racha,x.ok)+(editRut&&!x.fija?'<button class="sm" data-a="rutDel" data-p="d|'+x.k+'" aria-label="Borrar">'+ic("trash")+'</button>':'')+'</div>').join("")+
     '<form data-f="diaria" class="add"><input type="text" name="t" placeholder="Nueva diaria: leer 10 minutos…" maxlength="60" required><button class="iconbtn acc" type="submit" aria-label="Agregar">'+ic("plus")+'</button></form></div>'+
   '<div class="card hab">'+ed("Hábitos")+
     ((rutina.habitos||[]).length?(rutina.habitos||[]).map(h=>{ const x=hb[h.id]||{}, ab=habEd===h.id;
       return '<div class="hrow"><button class="pm a" data-a="habMas" data-p="'+h.id+'" aria-label="Sumar">+</button><button class="n" data-a="habEd" data-p="'+h.id+'"><b>'+esc(h.t)+'</b><small>Hoy <b class="mas">+'+(x.p||0)+'</b> · <b class="men">−'+(x.m||0)+'</b> · tocá para corregir</small></button>'+velaHTML(rachaHab(h.id),(x.p||0)>0)+(editRut?'<button class="sm" data-a="rutDel" data-p="h|'+h.id+'" aria-label="Borrar">'+ic("trash")+'</button>':'<button class="pm" data-a="habMenos" data-p="'+h.id+'" aria-label="Restar">−</button>')+'</div>'+
         (ab?'<div class="hajuste"><span>Hechos hoy</span><button class="pm" data-a="habAj" data-p="'+h.id+'|p|-1">−</button><b>'+(x.p||0)+'</b><button class="pm" data-a="habAj" data-p="'+h.id+'|p|1">+</button><span>Caídas</span><button class="pm" data-a="habAj" data-p="'+h.id+'|m|-1">−</button><b>'+(x.m||0)+'</b><button class="pm" data-a="habAj" data-p="'+h.id+'|m|1">+</button></div><div class="hvirt"><span>Virtud</span>'+VIRTUDES.map(v=>'<button class="'+(virtudDe(h)===v[0]?"on":"")+'" data-a="habVirtud" data-p="'+h.id+'|'+v[0]+'">'+v[1]+'</button>').join("")+'</div>':''); }).join(""):'<p class="empty">Lo que querés hacer más (+) o dejar de hacer (−): rezar antes de comer, no quejarme…</p>')+
     '<form data-f="habito" class="add"><input type="text" name="t" placeholder="Nuevo hábito…" maxlength="60" required><button class="iconbtn acc" type="submit" aria-label="Agregar">'+ic("plus")+'</button></form>'+
     '<button class="plusrow" data-a="biblioteca"><span class="n"><b>Biblioteca de hábitos y virtudes</b><small>'+BIBLIOTECA.length+' propuestas por virtud y por área, para agregar con un toque</small></span>'+ic("right")+'</button></div>'+
   '<div class="card hab"><div class="hd"><div class="eyebrow">Tareas</div></div>'+
     (tareas.length?tareas.map(p=>{ const fe=fechaTarea(p.f), venc=p.f&&p.f<s&&!p.ok;
       const cuando=[fe,p.hr].filter(Boolean).join(" · ")||p.h;
       return '<div class="hrow"><button class="ck'+(p.ok?' on':'')+'" data-a="propOk" data-p="'+p.id+'" aria-label="Hecha">'+(p.ok?ic("check"):'')+'</button><span class="n"><b'+(p.ok?' class="tach"':'')+'>'+esc(p.t)+'</b>'+(cuando?'<small'+(venc?' class="venc"':'')+'>'+(p.hr?ic("bell")+' ':'')+esc(cuando)+'</small>':'')+'</span><button class="sm" data-a="propDel" data-p="'+p.id+'" aria-label="Borrar">'+ic("trash")+'</button></div>'; }).join(""):'<p class="empty">Nada pendiente. Anotá lo que tengas que hacer.</p>')+
     '<form data-f="prop" class="add2"><input type="text" name="t" placeholder="Confesarme, llamar a la abuela…" maxlength="80" required><div class="grid2" style="grid-template-columns:1fr 1fr auto"><input type="date" name="f" value="'+s+'"><input type="time" name="hr" aria-label="Hora del aviso"><button class="iconbtn acc" type="submit" aria-label="Agregar">'+ic("plus")+'</button></div><p class="hint">Con hora, te avisa al celular (por ahora, con la app abierta; con la app de las tiendas, siempre).</p></form></div>'+
   '<button class="card plusmas orlink" data-a="misOraciones">'+ic("book")+'<span class="n"><b>Mis oraciones</b><small>Lo que le escribiste a Dios a la mañana y a la noche, para releer y ver cómo crecés</small></span>'+ic("right")+'</button>'+
   '<div class="card"><div class="eyebrow">Diario</div><p class="hint" style="margin:6px 0 10px">¿Qué te dijo Dios hoy? Privado, solo para vos.</p><textarea class="inset" data-nota="'+s+'" placeholder="Escribí lo que quieras…">'+esc(d.nota||"")+'</textarea><div style="display:flex;justify-content:flex-end;margin-top:8px"><button class="ghost g" data-a="notaOk">Guardar</button></div></div>'+
   calendarioHTML(); }
/* ── el calendario: tu Google Calendar, las tareas y los santos del día ── */
let calMes=null, calSel=null, gcal={tok:null,exp:0}, gcalEv={}, gcalCarga={}, gcalErr="", calForm=false;
try{ const g=JSON.parse(localStorage.getItem("daily_gcal")||"null"); if(g&&g.exp>Date.now()) gcal=g; }catch(e){}
const gcalOk=()=>gcal.tok&&gcal.exp>Date.now();
const mesKey=d=>d.getFullYear()+"-"+pad(d.getMonth()+1);
async function gcalPedir(path,opt){ const r=await fetch("https://www.googleapis.com/calendar/v3/"+path,{...(opt||{}),headers:{Authorization:"Bearer "+gcal.tok,"Content-Type":"application/json"}});
  if(r.status===401){ gcal={tok:null,exp:0}; try{ localStorage.removeItem("daily_gcal"); }catch(e){} throw new Error("El permiso de Google venció: volvé a conectar."); }
  if(!r.ok) throw new Error("Google Calendar respondió "+r.status+"."); return r.json(); }
async function gcalMes(d){ const k=mesKey(d); if(!gcalOk()||gcalCarga[k]) return; gcalCarga[k]=1;
  try{ const ini=new Date(d.getFullYear(),d.getMonth(),1), fin=new Date(d.getFullYear(),d.getMonth()+1,1);
    const j=await gcalPedir("calendars/primary/events?singleEvents=true&orderBy=startTime&maxResults=250&timeMin="+encodeURIComponent(ini.toISOString())+"&timeMax="+encodeURIComponent(fin.toISOString()));
    const por={}; (j.items||[]).forEach(e=>{ const st=e.start||{}; const dia=(st.dateTime||st.date||"").slice(0,10); const hora=st.dateTime?new Date(st.dateTime).toTimeString().slice(0,5):""; if(dia) (por[dia]=por[dia]||[]).push({t:e.summary||"(sin título)",h:hora}); });
    gcalEv[k]=por; gcalErr=""; }catch(e){ gcalErr=e.message; gcalCarga[k]=0; } render(); }
function calendarioHTML(){ const hoyS=hoy(); if(!calMes){ const d=new Date(); calMes=new Date(d.getFullYear(),d.getMonth(),1); } if(!calSel) calSel=hoyS;
  const y=calMes.getFullYear(), m=calMes.getMonth(), n=new Date(y,m+1,0).getDate(), ini=(new Date(y,m,1).getDay()+6)%7, ev=gcalEv[mesKey(calMes)]||{};
  if(gcalOk()) gcalMes(calMes);
  let o='<div class="card calc"><div class="calhd"><button class="iconbtn ghost" data-a="calMes" data-p="-1" aria-label="Mes anterior">'+ic("left")+'</button><b>'+cap(MESES[m])+' '+y+'</b><button class="iconbtn ghost" data-a="calMes" data-p="1" aria-label="Mes siguiente">'+ic("right")+'</button></div><div class="cal">'+["L","M","M","J","V","S","D"].map(x=>'<div class="h">'+x+'</div>').join("");
  for(let i=0;i<ini;i++) o+='<div></div>';
  for(let i=1;i<=n;i++){ const s=y+"-"+pad(m+1)+"-"+pad(i), x=dayOf(s), rezo=rezoAlgo(x), tg=(ev[s]||[]).length, tt=propositos.some(p=>p.f===s&&!p.ok);
    o+='<button class="c'+(s===calSel?" sel":"")+(s===hoyS?" hoy":"")+(rezo?" rezo":"")+'" data-a="calDia" data-p="'+s+'">'+i+'<span class="pts">'+(tg?'<i class="g"></i>':'')+(tt?'<i class="t"></i>':'')+'</span></button>'; }
  o+='</div><div class="leyenda"><span><i class="g"></i>Google</span><span><i class="t"></i>Tareas</span><span><i class="r"></i>Rezaste</span></div></div>';
  const evs=(gcalEv[calSel.slice(0,7)]||{})[calSel]||[], ts=propositos.filter(p=>p.f===calSel), sn=SANTOS[calSel.slice(5)];
  o+='<div class="card agenda"><div class="eyebrow">'+cap(fLarga(calSel))+'</div><div class="list">'+
    evs.map(e=>'<div class="row"><div class="n"><b>'+esc(e.t)+'</b><small>'+(e.h||"Todo el día")+' · Google Calendar</small></div></div>').join("")+
    ts.map(p=>'<div class="row"><div class="n"><b'+(p.ok?' class="tach"':'')+'>'+esc(p.t)+'</b><small>'+(p.hr||"Tarea")+'</small></div></div>').join("")+
    (sn?'<button class="row lnkrow" data-a="santo" data-p="'+calSel.slice(5)+'"><div class="n"><b>'+esc(sn[0])+'</b><small>Santoral</small></div>'+ic("right")+'</button>':'')+
    (!evs.length&&!ts.length?'<p class="empty">Nada anotado para este día.</p>':'')+'</div>';
  if(gcalOk()){ o+=calForm?'<form data-f="evento" class="add2"><input type="text" name="t" placeholder="Nuevo evento…" maxlength="80" required><div class="grid2" style="grid-template-columns:1fr 1fr auto"><input type="time" name="hi" aria-label="Empieza"><input type="time" name="hf" aria-label="Termina"><button class="iconbtn acc" type="submit" aria-label="Guardar">'+ic("check")+'</button></div><p class="hint">Sin hora, queda para todo el día. Se guarda en tu Google Calendar.</p></form>':'<button class="ghost" data-a="calNuevo" style="margin-top:10px">'+ic("plus")+' Evento</button>'; }
  else if(backend&&backend.mode==="firestore") o+='<button class="ghost" data-a="gcalCon" style="margin-top:10px">'+ic("today")+' Conectar Google Calendar</button>';
  else o+='<p class="hint" style="margin-top:10px">Entrá con Google (en Más) para ver acá tu Google Calendar.</p>';
  if(gcalErr) o+='<p class="hint" style="color:var(--over);margin-top:8px">'+esc(gcalErr)+'</p>';
  return o+'</div>'; }

/* ── Yo: el personaje y su personalización básica (lo demás se gana jugando Scaeli) ── */
function renderYo(){ const raw=profile||{}, P=PJ.normal(raw), nom=raw.nombre||(user&&user.displayName)||(P.sx==="f"?"Peregrina":"Peregrino"); const tot=Object.values(days);
  const st=[["Rosarios",tot.filter(x=>x.r).length],["Evangelios",tot.filter(x=>x.e).length],["Exámenes",tot.filter(x=>x.x).length],["Días con Dios",tot.filter(rezoAlgo).length]];
  const chips=(campo,L,val)=>'<div class="chips">'+L.map(x=>'<button data-a="pjSet" data-p="'+campo+'|'+x[0]+'" aria-pressed="'+(val===x[0])+'">'+esc(x[1])+'</button>').join("")+'</div>';
  const OP=PJ.opciones(P);
  const ropa=f=>'<div class="chips">'+OP.prendas.filter(f).map(x=>'<button data-a="pjSet" data-p="prenda|'+(PJ.CON_COLOR.includes(x[0])?x[0]+":"+(P.tipo===x[0]?P.color:"gris"):x[0])+'" aria-pressed="'+(P.tipo===x[0])+'">'+esc(x[1])+'</button>').join("")+'</div>';
  const sw=(campo,L,val)=>'<div class="sw">'+L.map((c,i)=>'<button data-a="pjSet" data-p="'+campo+'|'+i+'" aria-pressed="'+(val===i)+'" aria-label="'+esc(c[0])+'" title="'+esc(c[0])+'"'+(c[1]?' style="background:'+c[1]+'"':' class="orig"')+'></button>').join("")+'</div>';
  return cab("Tu personaje",esc(nom),rachaChip())+
   '<div class="card big'+(fondoActual()?' confondo':'')+'">'+(fondoActual()?'<img class="bg" src="'+ilu(fondoActual())+'" alt=""><span class="sh"></span>':'')+personajeHTML("vivo","south",256)+'</div>'+
   '<details class="card opt fondos-d"'+(sheet&&sheet.view==="x"?"":"")+'><summary><span class="eyebrow">Fondo</span><b>'+esc((FONDOS.find(x=>x[0]===fondoActual())||["","Mañana"])[1])+'</b><span class="muted">'+ic("down")+'</span></summary><p class="hint" style="margin:8px 0 10px">Se desbloquean con tu nivel y tus logros. El elegido va también al inicio de Hoy.</p>'+fondosHTML()+'</details>'+
   '<div class="card opt">'+
     '<div class="eyebrow">Soy</div><div class="seg">'+[["m","Varón"],["f","Mujer"]].map(x=>'<button data-a="pjSet" data-p="sx|'+x[0]+'" aria-pressed="'+(P.sx===x[0])+'">'+x[1]+'</button>').join("")+'</div>'+
     (OP.peinados.length<2?'':'<div class="eyebrow">Peinado</div>'+chips("peinado",OP.peinados,P.peinado))+
     '<div class="eyebrow">Ropa</div>'+ropa(x=>x[0]==="base"||PJ.CON_COLOR.includes(x[0]))+
     '<div class="eyebrow">'+(P.sx==="f"?"Consagradas":"Consagrados")+'</div>'+ropa(x=>x[0]!=="base"&&!PJ.CON_COLOR.includes(x[0]))+
     (P.color&&OP.colores.length>1?'<div class="eyebrow">Color</div><div class="sw">'+OP.colores.map(c=>'<button data-a="pjSet" data-p="prenda|'+P.tipo+':'+c[0]+'" aria-pressed="'+(P.color===c[0])+'" aria-label="'+esc(c[1])+'" title="'+esc(c[1])+'" style="background:'+c[2]+'"></button>').join("")+'</div>':'')+
     '<div class="eyebrow">Altura</div><div class="seg">'+PJ.ALTURAS.map(x=>'<button data-a="pjSet" data-p="alt|'+x[0]+'" aria-pressed="'+(P.alt===x[0])+'">'+x[1]+'</button>').join("")+'</div>'+

     '<label class="f" style="margin-top:6px">Cómo te llamás<input type="text" data-nombre value="'+esc(raw.nombre||"")+'" placeholder="'+esc(user&&user.displayName||"Tu nombre")+'" maxlength="24"></label></div>'+
   '<div class="sect">Se gana jugando Scaeli</div><div class="tiles">'+
   '<div class="tile lock"><div class="ic">'+ic("lock")+'</div><b>Vestimentas de santos</b><small class="l">San Francisco, Carlo Acutis, Teresita…</small></div>'+
   '<div class="tile lock"><div class="ic">'+ic("lock")+'</div><b>Sets y caminos</b><small class="l">Caballero, monje, predicador, pontífice</small></div>'+
   '<div class="tile lock"><div class="ic">'+ic("lock")+'</div><b>Compañero</b><small class="l">Tu ángel y tus mascotas</small></div>'+
   '<a class="tile" href="https://ldiazvidela.github.io/scaeli/" target="_blank" rel="noopener" style="text-decoration:none"><div class="ic">'+ic("game")+'</div><b>Jugar Scaeli</b><small>Lo que ganás en el juego aparece acá</small></a></div>'+
   '<div class="card"><div class="eyebrow" style="margin-bottom:10px">Tu nivel</div>'+nivelHTML()+'<p class="hint" style="margin:8px 0 0">Cada diaria, hábito u oración suma experiencia. Las caídas y las diarias sin hacer bajan el ánimo; si llega a 0, bajás un nivel. La Confesión lo restaura entero.</p></div>'+
   '<div class="card"><div class="eyebrow" style="margin-bottom:10px">Tus logros</div>'+logrosHTML(true)+'</div>'+
   '<div class="card"><div class="eyebrow" style="margin-bottom:12px">Tu camino</div><div class="grid2">'+st.map(x=>'<div class="stat"><div class="v">'+x[1]+'</div><small class="d">'+x[0]+'</small></div>').join("")+'</div>'+
     '<button class="plusrow" data-a="anio"><span class="n"><b>Tu año con Dios</b><small>'+(esPlus()?"Tu año en historias, para ver y compartir":"Con Scaeli+")+'</small></span>'+(esPlus()?ic("right"):'<span class="plus-mini">'+ic("lock")+' Scaeli+</span>')+'</button></div>'+
   '<div class="card"><div class="eyebrow">Intenciones</div><p class="hint" style="margin:6px 0 10px">Por quién rezás estos días. Aparecen en el Rosario y en las Horas.</p><div class="chips">'+intents.map((t,i)=>'<button class="on" data-a="intDel" data-p="'+i+'">'+esc(t)+' ✕</button>').join("")+'</div><form data-f="int" style="margin-top:10px"><div class="grid2" style="grid-template-columns:1fr auto"><input type="text" name="t" placeholder="Por mi familia…" maxlength="40" required><button class="iconbtn acc" type="submit" aria-label="Agregar">'+ic("plus")+'</button></div></form></div>'; }

function renderMas(){ const claro=document.documentElement.getAttribute("data-theme")==="light";
  return cab("Más","Ajustes")+
   '<div class="card"><div class="eyebrow">Recordatorios</div><p class="hint" style="margin:6px 0 10px">'+(esNativo()?'Avisos del teléfono, aunque la app esté cerrada (también las tareas con hora).':'Avisos mientras la app está abierta o instalada'+("Notification" in window?'':' (este navegador no los permite)')+'.')+'</p>'+
   '<div class="grid2"><label class="f">Mañana<input type="time" data-rec="m" value="'+esc(recordatorios.m)+'"></label><label class="f">Noche<input type="time" data-rec="n" value="'+esc(recordatorios.n)+'"></label></div>'+
   '<div style="margin-top:10px"><button class="ghost'+(recordatorios.on?'':' g')+'" data-a="recOn">'+ic("bell")+' '+(recordatorios.on?"Activados":"Activar")+'</button></div></div>'+
   '<button class="card plusmas" data-a="plus"><span class="plus-tag">Scaeli<b>+</b></span><span class="n"><b>'+(esPlus()?"Scaeli+ activo":"Scaeli+")+'</b><small>'+(esPlus()?"Tu progreso, tus virtudes y los caminos guiados":"Tu progreso, tus virtudes y caminos guiados · desde USD 1,67 por mes")+'</small></span>'+ic("right")+'</button>'+
   '<div class="card list"><div class="row"><div class="n"><b>Ayudar a Scaeli</b><small>Una donación para sostener el proyecto</small></div><button class="ghost g" data-a="donarVer">'+ic("heart")+' Donar</button></div></div>'+
   '<div class="card list"><div class="row"><div class="n"><b>Modo claro</b><small>Para leer de día</small></div><button class="ghost g" data-a="tema">'+(claro?"Oscuro":"Claro")+'</button></div>'+
   '<div class="row"><div class="n"><b>Exportar mis datos</b><small>Un archivo con todo lo tuyo</small></div><button class="ghost g" data-a="exportar">Exportar</button></div>'+
   '<div class="row"><div class="n"><b>Importar</b><small>Desde un archivo exportado</small></div><button class="ghost g" data-a="importar">Importar</button><input type="file" id="impFile" accept="application/json" hidden></div></div>'+
   '<div class="card list"><div class="row"><div class="n"><b>Scaeli Fit</b><small>Ordenar el cuerpo desde la templanza</small></div><a class="ghost g" href="https://ldiazvidela.github.io/scaeli-fit/" target="_blank" rel="noopener">Abrir</a></div>'+
   '<div class="row"><div class="n"><b>Scaeli</b><small>El juego</small></div><a class="ghost g" href="https://ldiazvidela.github.io/scaeli/" target="_blank" rel="noopener">Abrir</a></div></div>'+
   '<div class="card list"><div class="row"><div class="n"><b>'+(backend&&backend.mode==="firestore"?esc(user.displayName||user.email||"Tu cuenta"):"Sin cuenta")+'</b><small>'+(backend&&backend.mode==="firestore"?"Guardado en tu cuenta de Google":"Guardado solo en este dispositivo")+'</small></div>'+(backend&&backend.mode==="firestore"?'<button class="ghost g" id="logout">'+ic("out")+' Salir</button>':'<button class="ghost g" id="login" data-q="google">'+LOGO_GOOGLE+' Entrar con Google</button>')+'</div>'+
     (backend&&backend.mode==="firestore"?'<div class="row"><div class="n"><b>Borrar mis datos de Daily</b><small>Tu cuenta sigue</small></div><button class="ghost g" data-a="borrar" data-p="datos">Borrar</button></div><div class="row"><div class="n"><b>Borrar mi cuenta</b><small>La cuenta y todos sus datos (Daily, Fit y el juego)</small></div><button class="ghost g peligro" data-a="borrar" data-p="cuenta">Borrar</button></div>'
       :'<div class="row"><div class="n"><b>Borrar mis datos</b><small>Lo guardado en este dispositivo</small></div><button class="ghost g peligro" data-a="borrar" data-p="datos">Borrar</button></div>')+
     '<div class="row"><div class="n"><b>Política de privacidad</b><small>Qué guardamos y para qué</small></div><a class="ghost g" href="privacidad.html" target="_blank" rel="noopener">Leer</a></div>'+
     '<div class="row"><div class="n"><b>Términos de uso</b><small>Incluye Scaeli+</small></div><a class="ghost g" href="terminos.html" target="_blank" rel="noopener">Leer</a></div></div>'+
   '<p class="hint" style="text-align:center">Scaeli Daily '+VERSION+' · Lecturas: evangeliodeldia.org · Horas: liturgiadelashoras.github.io · Biblia Platense (Mons. Straubinger)</p>'; }


/* ── la Biblia: Biblia Platense (Mons. Juan Straubinger, La Plata, 1948), un archivo por libro en biblia/ (herramientas/biblia.py) ── */
const BIB={idx:null,lib:{},cargando:{}};
const BIB_K="daily_biblia";
function bibGuardado(){ try{ return JSON.parse(localStorage.getItem(BIB_K)||"null"); }catch(e){ return null; } }
function bibUltima(){ const g=bibGuardado(); if(!g||!BIB.idx) return ""; const L=BIB.idx.find(x=>x.id===g.b); return L?L.n+" "+g.c:""; }
const bibURL=f=>"biblia/"+f;   // viene adentro de la app: se lee sin internet
async function bibIndice(){ if(BIB.idx) return BIB.idx; if(!BIB.cargando.idx) BIB.cargando.idx=fetch(bibURL("indice.json")).then(r=>r.json()).then(j=>{ BIB.idx=j; return j; }); return BIB.cargando.idx; }
async function bibLibro(id){ if(BIB.lib[id]) return BIB.lib[id]; if(!BIB.cargando[id]) BIB.cargando[id]=fetch(bibURL(id+".json")).then(r=>{ if(!r.ok) throw 0; return r.json(); }).then(j=>{ BIB.lib[id]=j; return j; }).catch(e=>{ delete BIB.cargando[id]; throw e; }); return BIB.cargando[id]; }
bibIndice().catch(()=>{});
/* los Salmos: esta Biblia los numera como la Vulgata; también se muestra (y se busca) la numeración de hoy */
function salmoHoy(v){ return v<=8||v>=148?String(v):v===9?"9-10":v<=112?String(v+1):v===113?"114-115":v<=115?"116":v<=145?String(v+1):"147"; }
function salmoVulg(h){ return h<=8||h>=148?h:h<=10?9:h<=113?h-1:h<=115?113:h===116?114:h<=146?h-1:146; }
const GRUPOS_AT=["Pentateuco","Históricos","Sapienciales","Proféticos"], GRUPOS_NT=["Evangelios","Hechos","Cartas","Apocalipsis"];
function bibBuscarLibro(t){ const q=sinTilde(t).replace(/\./g,"").replace(/\s+/g," ").trim(); if(!q||!BIB.idx) return null;
  const sin=x=>sinTilde(x).replace(/\s+/g,""), qq=q.replace(/\s+/g,"");
  return BIB.idx.find(b=>sin(b.a)===qq)||BIB.idx.find(b=>sin(b.n)===qq)||BIB.idx.find(b=>sin(b.n).startsWith(qq)&&qq.length>=2)||null; }
function bibReferencia(t){ const m=sinTilde(t).trim().match(/^((?:[123]\s*)?[a-zñ][a-zñ\s.]*?)\s*(\d+)(?:\s*[,:.]\s*(\d+)(?:\s*-\s*(\d+))?)?$/); if(!m) return null;
  const b=bibBuscarLibro(m[1]); if(!b) return null; let c=+m[2]; if(b.id==="Ps") c=salmoVulg(c); if(c<1||c>b.k) return null; return {b:b.id,c,v:m[3]?+m[3]:0}; }
function bibAbrir(b,c,v){ try{ localStorage.setItem(BIB_K,JSON.stringify({b,c})); }catch(e){}
  sheet.m="leer"; sheet.b=b; sheet.c=c; sheet.v=v||0; renderSheet(); }
function shBiblia(){ const m=sheet.m||"libros";
  if(!BIB.idx){ bibIndice().then(()=>renderSheet()).catch(()=>{ sheet.err="No se pudo abrir la Biblia. Revisá la conexión."; renderSheet(); }); return shTop("La Biblia")+'<p class="hint">'+(sheet.err?esc(sheet.err):"Abriendo…")+'</p>'; }
  const buscador='<form class="bibq" data-f="bibBuscar"><input type="search" id="bibQ" placeholder="Jn 3,16 · Salmo 23 · una palabra" value="'+esc(sheet.q||"")+'" enterkeyhint="search" autocomplete="off"><button class="primary" type="submit" aria-label="Buscar">Buscar</button></form>';
  if(m==="libros"){ const g=bibGuardado(), gL=g&&BIB.idx.find(x=>x.id===g.b);
    const grupo=(t,gs)=>'<div class="sect">'+t+'</div>'+gs.map(gn=>'<div class="bibg"><small>'+gn+'</small><div class="bibl">'+BIB.idx.filter(b=>b.g===gn).map(b=>'<button data-a="bibLibro" data-p="'+b.id+'">'+esc(b.n)+'</button>').join("")+'</div></div>').join("");
    return shTop("La Biblia","Biblia Platense · Mons. Juan Straubinger")+'<div class="scroll"><div class="sbanner"><img src="'+ilu("biblia")+'" alt=""><span class="g"></span></div>'+buscador+
     (gL?'<button class="card lhnow" data-a="bibIr" data-p="'+g.b+'|'+g.c+'"><span class="n"><span class="eyebrow">Seguir leyendo</span><b>'+esc(gL.n)+' '+(g.b==="Ps"?salmoHoy(g.c):g.c)+'</b></span>'+ic("right")+'</button>':'')+
     grupo("Antiguo Testamento",GRUPOS_AT)+grupo("Nuevo Testamento",GRUPOS_NT)+'<p class="hint" style="margin-top:14px">Texto: Biblia Platense o Biblia Comentada, traducción católica hecha en La Plata por Mons. Juan Straubinger (1948). Los Salmos llevan la numeración de esta Biblia y, entre paréntesis, la de hoy.</p></div>'+
     '<button class="primary ink" data-a="cerrar">Volver</button>'; }
  if(m==="caps"){ const b=BIB.idx.find(x=>x.id===sheet.b);
    return shTop(esc(b.n),b.k+(b.k===1?" capítulo":" capítulos"))+'<div class="scroll"><div class="bibcaps">'+Array.from({length:b.k},(_,i)=>'<button data-a="bibIr" data-p="'+b.id+'|'+(i+1)+'">'+(b.id==="Ps"?salmoHoy(i+1):i+1)+'</button>').join("")+'</div></div>'+
     '<button class="ghost g" data-a="bibVolver" style="justify-content:center;height:48px">'+ic("left")+' Libros</button>'; }
  if(m==="leer"){ const b=BIB.idx.find(x=>x.id===sheet.b), L=BIB.lib[sheet.b], c=sheet.c;
    if(!L){ bibLibro(sheet.b).then(()=>renderSheet()).catch(()=>{ sheet.err="No se pudo abrir este libro. Revisá la conexión."; renderSheet(); }); return shTop(esc(b.n+" "+c))+'<p class="hint">'+(sheet.err?esc(sheet.err):"Abriendo…")+'</p>'; }
    const vs=L.c[c-1]||[], tt=L.t||{}, nom=b.id==="Ps"?"Salmo "+c+(salmoHoy(c)!==String(c)?" ("+salmoHoy(c)+")":""):b.n+" "+c;
    const cuerpo=vs.map((t,i)=>{ const v=i+1, tit=tt[c+":"+v]; return (tit?'<h4 class="bibtit">'+esc(tit)+'</h4>':'')+(t?'<p id="bv'+v+'" class="'+(sheet.v===v?"marcado":"")+'"><sup>'+v+'</sup>'+esc(t)+'</p>':''); }).join("");
    if(sheet.v) setTimeout(()=>{ const e=$("#bv"+sheet.v); if(e) e.scrollIntoView({block:"center"}); },30);
    return shTop(esc(nom),'<button class="lnk" data-a="bibCaps" data-p="'+b.id+'" style="padding:0;font-size:12px">'+esc(b.n)+' · capítulos</button>')+'<div class="scroll biblia">'+cuerpo+'</div>'+
     '<div class="grid2"><button class="ghost g" data-a="bibIr" data-p="'+b.id+'|'+(c-1)+'"'+(c<=1?" disabled":"")+'>'+ic("left")+' '+(c>1?(b.id==="Ps"?salmoHoy(c-1):c-1):"")+'</button><button class="ghost g" data-a="bibIr" data-p="'+b.id+'|'+(c+1)+'"'+(c>=b.k?" disabled":"")+' style="justify-content:flex-end">'+(c<b.k?(b.id==="Ps"?salmoHoy(c+1):c+1):"")+' '+ic("right")+'</button></div>'; }
  if(m==="buscar"){ const R=sheet.res||[], q=sheet.q||"";
    const recorte=t=>{ const i=sinTilde(t).indexOf(sinTilde(q)); if(t.length<=150||i<60) return t.length>150?t.slice(0,150)+"…":t; const a=Math.max(0,i-60); return "…"+t.slice(a,a+150)+(a+150<t.length?"…":""); };
    const marca=t=>{ const i=sinTilde(t).indexOf(sinTilde(q)); return i<0?esc(t):esc(t.slice(0,i))+'<mark>'+esc(t.slice(i,i+q.length))+'</mark>'+esc(t.slice(i+q.length)); };
    return shTop("Buscar en la Biblia",sheet.busy?"Buscando… "+(sheet.prog||0)+" de "+BIB.idx.length+" libros":R.length?(R.length>=200?"Más de 200 versículos; se muestran los primeros":R.length+(R.length===1?" versículo":" versículos")):"")+'<div class="scroll">'+buscador+
     (R.length?'<div class="list">'+R.map(r=>'<button class="food" data-a="bibIr" data-p="'+r.b+'|'+r.c+'|'+r.v+'"><div><b>'+esc(r.n)+' '+(r.b==="Ps"?salmoHoy(r.c):r.c)+', '+r.v+'</b><br><small class="bibres">'+marca(recorte(r.t))+'</small></div></button>').join("")+'</div>':(!sheet.busy?'<p class="empty">No aparece esa palabra. Probá con otra, o buscá por cita: «Lc 15», «Sal 23», «1 Cor 13,4».</p>':''))+'</div>'+
     '<button class="ghost g" data-a="bibVolver" style="justify-content:center;height:48px">'+ic("left")+' Libros</button>'; }
  return ""; }
async function bibBuscarPalabra(q){ const t=sinTilde(q).trim(); if(t.length<3){ toast("Escribí al menos 3 letras"); return; }
  sheet.m="buscar"; sheet.q=q; sheet.res=[]; sheet.busy=true; sheet.prog=0; renderSheet(); const yo=sheet;
  for(const b of BIB.idx){ if(sheet!==yo) return; let L; try{ L=await bibLibro(b.id); }catch(e){ continue; }
    L.c.forEach((vs,ci)=>vs.forEach((tx,vi)=>{ if(yo.res.length<200&&tx&&sinTilde(tx).includes(t)) yo.res.push({b:b.id,n:b.n,c:ci+1,v:vi+1,t:tx}); }));
    yo.prog++; if(yo.prog%8===0&&sheet===yo) renderSheet(); if(yo.res.length>=200) break; }
  if(sheet===yo){ yo.busy=false; renderSheet(); } }


/* ══ Scaeli+ : la suscripción (tu progreso y tus virtudes, caminos guiados) y las donaciones ══
   Lo esencial de la oración es gratis siempre. Se compra solo desde la app de las tiendas (RevenueCat, js/nativo.js). */
const PLUS_EQUIPO=["lorenzodiazvidela@gmail.com"];          // acceso completo para probar (dueño del proyecto)
/* Scaeli+ compartido con Scaeli Fit (docs/SCAELI_PLUS_COMPARTIDO.md): la fuente de verdad es users/{uid}/settings/plus.
   RevenueCat y localStorage quedan solo de respaldo. Los códigos viven en codes/{CODIGO} y se canjean solo en la web. */
let plusTienda=(()=>{ try{ return localStorage.getItem("daily_plus_tienda")==="1"; }catch(e){ return false; } })();
let plusDoc=null, plusBE=null;
const lsGet=k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } }, lsSet=(k,v)=>{ try{ if(v==null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){} };
const delEquipo=()=>!!(user&&user.email&&PLUS_EQUIPO.includes(String(user.email).toLowerCase()));
const plusPrueba=()=>!esNativo()&&lsGet("daily_plus_prueba")==="1";
const plusDocActivo=()=>!!(plusDoc&&plusDoc.active===true&&(plusDoc.until==null||String(plusDoc.until)>=hoy()));
function esPlus(){ if(lsGet("daily_plus_como_gratis")==="1") return false; return plusDocActivo()||plusTienda||delEquipo()||plusPrueba(); }
async function plusEscribir(doc){ if(!plusBE) return; try{ await plusBE.escribir(doc); }catch(e){} }
/* al entrar: escuchar el documento; si es del equipo y no está anotado, anotarlo (source team, sin vencimiento) */
function plusEscuchar(){ if(!plusBE) return null; return plusBE.watch(d=>{ plusDoc=d; if(delEquipo()&&!(d&&d.active&&(d.source==="team"||d.source==="code"))) plusEscribir({active:true,source:"team",plan:null,since:hoy(),until:null}); render(); if(sheet) renderSheetQuieto(); }); }
async function plusRefrescar(){ if(!esNativo()) return; await comprasIniciar(user&&user.uid&&user.uid!=="local"?user.uid:undefined); const D=await comprasDetalle(); if(D===null) return; plusTienda=!!D.activo; lsSet("daily_plus_tienda",D.activo?"1":"0");
  if(D.activo) await plusEscribir({active:true,source:"store",plan:D.plan,since:(plusDoc&&plusDoc.since)||hoy(),until:D.until||null});
  else if(plusDoc&&plusDoc.source==="store"&&plusDoc.active&&plusDoc.until&&String(plusDoc.until)<hoy()) await plusEscribir({active:false});   // nunca se pisa un documento code o team
  render(); if(sheet) renderSheet(); }

/* las virtudes de cada hábito: la que eligió el usuario o, si no eligió, la que sugieren sus palabras */
function virtudSugerida(t){ const s=sinTilde(t); for(const [v,L] of PISTAS_VIRTUD) if(L.some(w=>s.includes(sinTilde(w)))) return v; return "caridad"; }
const virtudDe=h=>h.v||virtudSugerida(h.t);
const VNOM=k=>(VIRTUDES.find(x=>x[0]===k)||["","",""])[1];
function virtudesCuenta(dias){ const c={}; VIRTUDES.forEach(v=>c[v[0]]=0); const H=rutina.habitos||[];
  for(let i=0;i<dias;i++){ const hb=dayOf(addDays(hoy(),-i)).hb||{}; H.forEach(h=>{ const x=hb[h.id]; if(x&&x.p) c[virtudDe(h)]+=x.p; }); } return c; }
function radarSVG(c){ const K=VIRTUDES.map(v=>v[0]), mx=Math.max(1,...K.map(k=>c[k])), R=84, cx=120, cy=110, N=K.length;
  const pt=(i,r)=>{ const a=-Math.PI/2+i*2*Math.PI/N; return [cx+r*Math.cos(a),cy+r*Math.sin(a)]; };
  const anillo=f=>K.map((k,i)=>pt(i,R*f).map(n=>n.toFixed(1)).join(",")).join(" ");
  const forma=K.map((k,i)=>pt(i,R*Math.max(.06,c[k]/mx)).map(n=>n.toFixed(1)).join(",")).join(" ");
  return '<svg class="radar" viewBox="-24 0 288 220" role="img" aria-label="Tus virtudes">'+[1,.66,.33].map(f=>'<polygon points="'+anillo(f)+'" class="rg"/>').join("")+
   K.map((k,i)=>{ const [x,y]=pt(i,R); return '<line x1="'+cx+'" y1="'+cy+'" x2="'+x.toFixed(1)+'" y2="'+y.toFixed(1)+'" class="rl"/>'; }).join("")+
   '<polygon points="'+forma+'" class="rf"/>'+K.map((k,i)=>{ const [x,y]=pt(i,R+16); return '<text x="'+x.toFixed(1)+'" y="'+(y+4).toFixed(1)+'" text-anchor="middle" class="rt'+(c[k]?"":" cero")+'">'+VNOM(k)+'</text>'; }).join("")+'</svg>'; }
function barras(vals,max,etq){ return '<div class="barras">'+vals.map((v,i)=>'<div class="bcol"><i'+(v?'':' class="z"')+' style="height:'+Math.round(v/Math.max(1,max)*100)+'%"></i><small>'+etq(i)+'</small></div>').join("")+'</div>'; }

/* Tu progreso (Scaeli+) */
function shProgreso(){ if(!esPlus()) return shPlusPaywall("progreso");
  const c=virtudesCuenta(30), K=VIRTUDES.map(v=>v[0]), orden=[...K].sort((a,b)=>c[b]-c[a]), mas=orden.filter(k=>c[k]>0).slice(0,2), faltan=K.filter(k=>!c[k]);
  const lun=lunesDe(hoy()), sem=Array.from({length:12},(_,i)=>addDays(lun,-7*(11-i)));
  const hab=sem.map(l=>diasHabitoSemana(l)), rez=sem.map(l=>{ let n=0; for(let i=0;i<7;i++) if(rezoAlgo(dayOf(addDays(l,i)))) n++; return n; });
  const etq=i=>{ const d=parse(sem[i]); return i%3===0?d.getDate()+"/"+(d.getMonth()+1):""; };
  const anio=hoy().slice(0,4); let ros=0, ev=0, ex=0, dias=0, rmax=0, r=0;
  Object.keys(days).sort().forEach(k=>{ if(!/^\d{4}-\d\d-\d\d$/.test(k)) return; const d=days[k]; if(k.startsWith(anio)){ if(d.r) ros++; if(d.e) ev++; if(d.x) ex++; if(rezoAlgo(d)) dias++; } });
  { let s=addDays(hoy(),-400); while(s<=hoy()){ if(rezoAlgo(dayOf(s))){ r++; rmax=Math.max(rmax,r); } else r=0; s=addDays(s,1); } }
  return shTop("Tu progreso","Scaeli+ · los últimos tres meses")+'<div class="scroll">'+
   '<button class="card anioc" data-a="anio"><span class="n"><span class="eyebrow">'+(anioListo()?"Ya está listo":"Hasta hoy")+'</span><b>Tu año con Dios · '+anio+'</b><small>Tu año en historias, con una imagen para compartir</small></span>'+ic("right")+'</button>'+
   '<div class="card"><div class="eyebrow">Tus virtudes · últimos 30 días</div>'+((rutina.habitos||[]).length?radarSVG(c)+
     (mas.length?'<p class="texto chico"><b>Más trabajadas:</b> '+mas.map(VNOM).join(" y ")+'.</p>':'<p class="hint">Todavía no sumaste hábitos este mes.</p>')+
     (faltan.length?'<p class="texto chico"><b>Te faltan:</b> '+faltan.map(VNOM).join(", ")+'.</p><div class="sect" style="margin-top:16px">Para empezar</div>'+faltan.slice(0,2).map(k=>{ const V=VIRTUDES.find(x=>x[0]===k); return '<div class="vsug"><b>'+V[1]+'</b><small>'+esc(V[2])+'</small><div class="chips">'+V[3].map(t=>'<button data-a="habSugerido" data-p="'+k+'|'+esc(t)+'">'+ic("plus")+' '+esc(t)+'</button>').join("")+'</div></div>'; }).join(""):'<p class="texto chico">Estás trabajando las siete virtudes. ¡Seguí así!</p>')
     :'<p class="hint">Sumá hábitos en «Tu día» y acá vas a ver qué virtudes estás trabajando.</p>')+'</div>'+
   '<div class="card"><div class="eyebrow">Hábitos · días por semana</div>'+barras(hab,7,etq)+'</div>'+
   '<div class="card"><div class="eyebrow">Oración · días por semana</div>'+barras(rez,7,etq)+
     '<div class="stats"><span><b>'+racha()+'</b><small>racha actual</small></span><span><b>'+rmax+'</b><small>racha más larga</small></span><span><b>'+dias+'</b><small>días con Dios en '+anio+'</small></span></div>'+
     '<div class="stats"><span><b>'+ros+'</b><small>Rosarios</small></span><span><b>'+ev+'</b><small>Evangelios</small></span><span><b>'+ex+'</b><small>Exámenes</small></span></div></div>'+
   '</div><button class="primary ink" data-a="cerrar">Volver</button>'; }

/* ── Grupos de perseverancia: invitás amigos, un desafío semanal en común, intenciones por las que rezan los demás, aliento y un ranking
   semanal con insignias. Cada miembro publica solo lo suyo (puntos de la semana, Rosarios, Evangelios, intención); el resto se calcula acá. ── */
let grupo={gid:null,meta:null,L:null,unsub:null,err:""}, grupoBE=null, gsyncT=null, gUltimo="", muro=[], muroUnsub=null;
const RECORDATORIOS=["No se olviden de rezar el Evangelio hoy","Una decena del Rosario por el grupo antes de dormir","Acuérdense del examen a la noche","Mañana es domingo: ¿vamos a Misa?","Recen por las intenciones del grupo","Hoy ofrezcan algo chiquito por los demás","Vamos por el desafío de la semana, falta poco","¿Alguien se confiesa esta semana? Rezo por ustedes"];
const muroVisto=()=>+(lsGet("daily_muro_visto")||0);
const gPortada=()=>grupo.meta&&grupo.meta.portada?grupo.meta.portada:ilu("mediodia");
const hace=t=>{ const m=Math.round((Date.now()-t)/60000); return m<1?"ahora":m<60?"hace "+m+" min":m<1440?"hace "+Math.round(m/60)+" h":m<2880?"ayer":"hace "+Math.round(m/1440)+" días"; };
const GRUPO_TOPE=12;
const DESAFIOS=[["r","Rosarios",3,"rosary"],["e","Evangelios",5,"book"],["d","Días con Dios",5,"flame"],["x","Exámenes del día",4,"check"],["o","Oraciones escritas",4,"pen"]];
const ALIENTOS=["¡Vamos, que podés!","Hoy rezo por vos","Una decena por vos","No aflojes, falta poco","Dios te ve y te quiere","Te espero en el ranking","Encendé la vela hoy"];
const MALAS=["puto","puta","mierda","pelotudo","pelotuda","boludo","boluda","forro","forra","culo","verga","pija","concha","carajo","hdp","sorete"];
const limpio=t=>{ const q=sinTilde(t); return !MALAS.some(w=>new RegExp("(^|[^a-z])"+w+"(s|$|[^a-z])").test(q)); };
const semanaDe=f=>lunesDe(f||hoy());
const nSemana=f=>Math.floor((parse(semanaDe(f))-parse("2024-01-01"))/864e5/7);
const desafioDe=f=>DESAFIOS[((nSemana(f)%DESAFIOS.length)+DESAFIOS.length)%DESAFIOS.length];
const puntosDia=f=>{ const d=dayOf(f); let c=0; Object.values(d.hb||{}).forEach(x=>{ c+=5*(x.m||0); }); return Math.max(0,xpDia(f)-c); };   // la misma experiencia de la app, menos las caídas
function statsSemana(lun){ const o={r:0,e:0,d:0,x:0,o:0,p:0}; for(let i=0;i<7;i++){ const f=addDays(lun,i); if(f>hoy()) break; const d=dayOf(f); if(d.r) o.r+=Math.max(1,d.rn||1); if(d.e) o.e++; if(d.x) o.x++; if(rezoAlgo(d)) o.d++; const or=d.or||{}; if(or.m) o.o++; if(or.n) o.o++; o.p+=puntosDia(f); } return o; }
function miFicha(){ const P=PJ.normal(profile||{}), raw=profile||{}; const nom=(raw.nombre||(user&&user.displayName&&user.displayName.split(" ")[0])||(P.sx==="f"?"Peregrina":"Peregrino")).slice(0,24);
  const s={}; [0,1,2,3,4,5].forEach(i=>{ const l=addDays(semanaDe(),-7*i); s[l]=statsSemana(l); }); return {n:nom,av:{sx:P.sx,prenda:P.prenda,peinado:P.peinado},s}; }
function grupoSync(){ if(!grupo.gid||!grupoBE||!grupo.meta) return; clearTimeout(gsyncT); gsyncT=setTimeout(async()=>{ const f=miFicha(), k=JSON.stringify(f); if(k===gUltimo) return; gUltimo=k; try{ await grupoBE.setMiembro(grupo.gid,f); }catch(e){} },800); }
function grupoAbrir(gid){ grupoCerrar(); if(!gid||!grupoBE) return; grupo={gid,meta:null,L:null,unsub:null,err:""};
  grupo.unsub=grupoBE.watch(gid,(meta,L,err)=>{ if(err){ grupo.err="No se pudo leer el grupo."; render(); return; } if(meta===false){ grupo.meta=false; grupo.L=[]; render(); if(sheet&&sheet.view==="grupo") renderSheetQuieto(); return; }
    if(meta&&meta.tipo){ grupo.meta=false; grupo.L=[]; render(); return; }   // los grupos de Scaeli Fit (tipo: entreno) no se muestran acá
    grupo.meta=meta; grupo.L=L; if(meta&&!muroUnsub&&grupoBE.watchMuro) muroUnsub=grupoBE.watchMuro(gid,M=>{ muro=M||[]; if(sheet&&sheet.view==="grupo") renderSheetQuieto(); else render(); muroPodar(); });
    if(meta&&L&&L.length&&!L.some(x=>x.uid===(user&&user.uid))&&!grupo.saliendo){ grupo.saliendo=1; backend.setDoc("daily_settings/grupo",{gid:null}).catch(()=>{}); toast("Ya no estás en el grupo «"+meta.n+"»"); return; } render(); if(sheet&&sheet.view==="grupo") renderSheetQuieto(); grupoSync(); }); }
function muroPodar(){ if(!grupo.meta||grupo.meta.creador!==yo()||muro.length<100) return; muro.slice(100).forEach(m=>grupoBE.borrarMsg(grupo.gid,m.id).catch(()=>{})); }
function grupoCerrar(){ if(muroUnsub){ try{ muroUnsub(); }catch(e){} muroUnsub=null; muro=[]; } if(grupo.unsub){ try{ grupo.unsub(); }catch(e){} } grupo={gid:null,meta:null,L:null,unsub:null,err:""}; gUltimo=""; }
const yo=()=>user&&user.uid;
function rankingDe(lun){ const L=(grupo.L||[]).map(x=>({...x,pts:((x.s||{})[lun]||{}).p||0})).sort((a,b)=>b.pts-a.pts||String(a.n).localeCompare(String(b.n))); let r=0, prev=null; L.forEach((x,i)=>{ if(x.pts!==prev){ r=i+1; prev=x.pts; } x.rank=r; }); return L; }
function desafioEstado(lun){ const D=desafioDe(lun), L=grupo.L||[], n=L.length, meta=D[2]*Math.max(1,n); let tot=0; L.forEach(x=>{ tot+=((x.s||{})[lun]||{})[D[0]]||0; }); return {D,meta,tot,ok:tot>=meta,n}; }
/* las insignias salen de las semanas ya terminadas: vela de oro, plata y bronce por el ranking y «equipo» si el grupo cumplió la meta */
function insignias(){ const out=[]; if(!grupo.L) return out; const u=yo(); for(let i=1;i<=6;i++){ const lun=addDays(semanaDe(),-7*i); const R=rankingDe(lun); if(!R.some(x=>x.pts>0)) continue; const me=R.find(x=>x.uid===u); if(me&&me.pts>0&&me.rank<=3) out.push({k:["oro","plata","bronce"][me.rank-1],lun}); const E=desafioEstado(lun); if(E.ok&&me) out.push({k:"equipo",lun,d:E.D}); } return out; }
const INSIG={oro:["Vela de oro","Primero del grupo en una semana"],plata:["Vela de plata","Segundo del grupo en una semana"],bronce:["Vela de bronce","Tercero del grupo en una semana"],equipo:["Meta del grupo","El grupo cumplió el desafío de la semana"]};
const insigniaSVG=k=>k==="equipo"?'<span class="ins eq">'+ic("heart")+'</span>':'<span class="ins '+k+'">'+VELA_SVG+'</span>';
function avatarHTML(av,tam){ return '<canvas class="pj" data-pj="south" data-pjp=\''+esc(JSON.stringify(av||{}))+'\' data-tam="'+(tam||56)+'" width="128" height="128" aria-hidden="true"></canvas>'; }
function grupoCardHTML(){ if(backend&&backend.mode==="local"&&!grupo.gid) return '<button class="card grupoc" data-a="grupo"><span class="n"><span class="eyebrow">Grupo de perseverancia</span><b>Rezá con tus amigos</b><small>Un desafío por semana, intenciones y ranking. Para armar uno, entrá con Google.</small></span>'+ic("right")+'</button>';
  if(!grupo.gid||grupo.meta===false) return '<button class="card grupoc" data-a="grupo"><span class="n"><span class="eyebrow">Grupo de perseverancia</span><b>Rezá con tus amigos</b><small>Invitá a tus amigos: un desafío por semana, intenciones por las que rezar y ranking.</small></span>'+ic("right")+'</button>';
  if(!grupo.meta) return '<button class="card grupoc" data-a="grupo"><span class="n"><span class="eyebrow">Grupo de perseverancia</span><b>Cargando tu grupo…</b></span>'+ic("right")+'</button>';
  const E=desafioEstado(semanaDe()), R=rankingDe(semanaDe()), me=R.find(x=>x.uid===yo());
  const nuevo=muro.find(m=>m.u!==yo()&&m.t>muroVisto()&&!muroOculto(m));
  return '<button class="card grupoc port" data-a="grupo"><img class="bg'+(grupo.meta.portada?" foto":"")+'" src="'+gPortada()+'" alt=""><span class="sh"></span><span class="n"><span class="eyebrow">'+esc(grupo.meta.n)+' · '+R.length+(R.length===1?" miembro":" miembros")+'</span><b>'+esc(E.D[1])+': '+E.tot+' de '+E.meta+(E.ok?' · ¡meta cumplida!':'')+'</b>'+
   '<span class="bar"><i style="width:'+Math.min(100,Math.round(E.tot/E.meta*100))+'%"></i></span><small>'+(me?'Vas '+me.rank+'.º con '+me.pts+' puntos':'')+(R[0]&&R[0].pts?' · primero: '+esc(R[0].n):'')+'</small>'+
   (nuevo?'<small class="mnue">'+ic("chat")+' <b>'+esc(nuevo.n)+'</b> escribió: «'+esc(nuevo.tx.length>60?nuevo.tx.slice(0,58)+'…':nuevo.tx)+'»</small>':'')+'</span>'+ic("right")+'</button>'; }
const muroOculto=m=>{ const r=m.rep||{}; return !!r[yo()]||Object.keys(r).length>=2; };
function shGrupo(){ const local=backend&&backend.mode==="local";
  if(!grupo.gid||grupo.meta===false){ const m=sheet.m||"";
    return shTop("Grupo de perseverancia","Rezar es más fácil acompañado")+'<div class="scroll"><div class="sbanner"><img src="'+ilu("mediodia")+'" alt=""><span class="g"></span></div>'+
     (grupo.meta===false?'<p class="hint">Ese grupo ya no existe.</p>':'')+
     '<div class="list"><div class="benef">'+ic("check")+'<div><b>Un desafío por semana</b><small>Rosarios, Evangelios o días con Dios entre todos; si lo cumplen, todos ganan la insignia.</small></div></div>'+
     '<div class="benef">'+ic("check")+'<div><b>Intenciones</b><small>Cada uno deja por qué pide, y los demás tocan «Recé por vos».</small></div></div>'+
     '<div class="benef">'+ic("check")+'<div><b>Ranking y aliento</b><small>Cada semana se reinicia: gana el más constante y los demás le mandan ánimo. Velas de oro, plata y bronce.</small></div></div></div>'+
     (local?'<p class="texto chico" style="margin-top:14px">Para rezar con tus amigos de verdad hace falta tu cuenta: así te ven con tu nombre. Sin cuenta, podés ver cómo funciona con un grupo de ejemplo.</p><div style="display:flex;flex-direction:column;gap:10px;margin-top:6px"><button class="entrar google" id="login" data-q="google">'+LOGO_GOOGLE+'<span>Continuar con Google</span></button><button class="ghost g" data-a="gEjemplo" style="justify-content:center;height:48px">'+ic("user")+' Ver un grupo de ejemplo</button></div>':
      (m==="crear"?'<form data-f="grupoCrear" class="gform"><label class="f">Nombre del grupo<input type="text" name="n" placeholder="Los de la parroquia" maxlength="40" required autocomplete="off"></label><button class="primary" type="submit">Crear el grupo</button></form>':
       m==="codigo"?'<form data-f="grupoUnirse" class="gform"><label class="f">Código del grupo<input type="text" name="c" placeholder="8 letras y números" maxlength="8" required autocomplete="off" style="text-transform:uppercase;letter-spacing:.2em" value="'+esc(sheet.inv||"")+'"></label>'+(sheet.err?'<p class="hint" style="color:var(--over)">'+esc(sheet.err)+'</p>':'')+'<button class="primary" type="submit">Entrar al grupo</button></form>':
       '<div class="grid2" style="margin-top:14px"><button class="primary" data-a="grupoModo" data-p="crear">'+ic("plus")+' Crear un grupo</button><button class="ghost g" data-a="grupoModo" data-p="codigo">'+ic("key")+' Tengo un código</button></div>')+
      '<p class="hint" style="margin-top:14px">Hasta '+GRUPO_TOPE+' personas. Tus amigos ven tu nombre, tu personaje, tus puntos de la semana y tu intención; nada más.</p>')+
     '</div><button class="primary ink" data-a="cerrar">Volver</button>'; }
  if(!grupo.meta) return shTop("Tu grupo")+'<p class="hint">'+(grupo.err?esc(grupo.err):"Cargando…")+'</p>';
  const G=grupo.meta, lun=semanaDe(), R=rankingDe(lun), E=desafioEstado(lun), u=yo(), me=R.find(x=>x.uid===u)||{}, creador=G.creador===u, ant=rankingDe(addDays(lun,-7)), ganador=ant[0]&&ant[0].pts>0?ant[0]:null;
  const miRep=(me.rep||{}), reportado=x=>!!miRep[x.uid]||R.filter(y=>(y.rep||{})[x.uid]).length>=2;
  const recibidos=R.filter(x=>x.uid!==u&&x.rece&&x.rece[u]&&x.rece[u].t>Date.now()-7*864e5).length, alientos=R.filter(x=>x.uid!==u&&x.al&&x.al[u]&&x.al[u][1]>Date.now()-3*864e5).map(x=>({n:x.n,t:ALIENTOS[x.al[u][0]]||""}));
  const podio=[R[1],R[0],R[2]].map((x,i)=>x?'<div class="pod p'+[2,1,3][i]+'">'+avatarHTML(x.av,[52,68,48][i])+'<b>'+esc(x.n)+'</b><small>'+x.pts+' pts</small><i>'+x.rank+'</i></div>':'<div class="pod vacio"></div>').join("");
  const fila=x=>{ const esYo=x.uid===u, oculta=x.int&&reportado(x), rece=me.rece&&me.rece[x.uid]&&me.rece[x.uid].t>Date.now()-864e5;
    return '<div class="grow'+(esYo?" yo":"")+'"><span class="rk">'+x.rank+'</span>'+avatarHTML(x.av,40)+'<span class="n"><b>'+esc(x.n)+(esYo?' (vos)':'')+'</b>'+(x.int&&!oculta?'<small class="int">«'+esc(x.int)+'»</small>':x.int&&oculta?'<small class="int muted">Intención ocultada</small>':'<small class="muted">Sin intención todavía</small>')+'</span><span class="pts">'+x.pts+'<small>pts</small></span>'+
     (esYo?'':'<span class="acts">'+(x.int&&!oculta?'<button class="gb" data-a="gRece" data-p="'+x.uid+'" aria-pressed="'+!!rece+'">'+ic("rosary")+' '+(rece?"Rezaste ✓":"Recé")+'</button>':'')+'<button class="gb" data-a="gAliento" data-p="'+x.uid+'" aria-pressed="'+(sheet.al===x.uid)+'">'+ic("heart")+' Aliento</button>'+(x.int&&!oculta?'<button class="sm" data-a="gReportar" data-p="'+x.uid+'" aria-label="Reportar la intención" title="Reportar">'+ic("x")+'</button>':'')+(creador?'<button class="sm" data-a="gEchar" data-p="'+x.uid+'" aria-label="Sacar del grupo" title="Sacar del grupo">'+ic("trash")+'</button>':'')+'</span>')+
     (sheet.al===x.uid?'<div class="chips gal">'+ALIENTOS.map((a,i)=>'<button data-a="gAlientoOk" data-p="'+x.uid+'|'+i+'">'+esc(a)+'</button>').join("")+'</div>':'')+'</div>'; };
  const I=insignias(); if(muro.length) lsSet("daily_muro_visto",Date.now());
  return shTop("Tu grupo","Grupo de perseverancia")+'<div class="scroll"><div class="sbanner gban"><img class="'+(G.portada?"foto":"")+'" src="'+gPortada()+'" alt=""><span class="g"></span>'+
   (creador?'<label class="gport" title="Cambiar la portada">'+ic("image")+'<input type="file" accept="image/*" id="gPortada"></label>':'')+'<span class="gt"><b>'+esc(G.n)+'</b><small>'+R.length+(R.length===1?" miembro":" miembros")+' · código '+G.id+'</small></span></div>'+
   (alientos.length?'<div class="card gali">'+alientos.map(a=>'<p>'+ic("heart")+' <b>'+esc(a.n)+'</b> te manda: «'+esc(a.t)+'»</p>').join("")+'</div>':'')+
   '<div class="card gdes"><div class="hd"><div class="eyebrow">Desafío de la semana</div><span class="chip">'+ic(E.D[3])+' '+E.D[2]+' c/u</span></div><b class="gt">'+esc(E.D[1])+' entre todos: '+E.tot+' de '+E.meta+'</b><div class="bar3"><i style="width:'+Math.min(100,Math.round(E.tot/E.meta*100))+'%"></i></div><p class="hint">'+(E.ok?'¡Meta cumplida! Todos se llevan la insignia del equipo.':'Si llegan antes del domingo, todos ganan la insignia del equipo. Lo tuyo: '+(((me.s||{})[lun]||{})[E.D[0]]||0)+'.')+'</p></div>'+
   muroHTML(u,creador)+
   '<div class="card"><div class="hd"><div class="eyebrow">Ranking de la semana</div><span class="hint" style="margin:0">Se reinicia el lunes</span></div><div class="podio">'+podio+'</div>'+(ganador?'<p class="hint" style="text-align:center">La semana pasada ganó <b>'+esc(ganador.n)+'</b> con '+ganador.pts+' puntos.</p>':'')+
     '<p class="hint" style="margin-top:6px">Los puntos son tu experiencia de la semana (lo que suma cada diaria, hábito u oración), menos las caídas.</p></div>'+
   '<div class="card"><div class="hd"><div class="eyebrow">Intenciones</div>'+(recibidos?'<span class="hint" style="margin:0;color:var(--accent);display:inline-flex;align-items:center;gap:5px;white-space:nowrap">'+ic("heart")+' '+recibidos+' rezaron por vos</span>':'')+'</div>'+
     '<form data-f="grupoInt" class="add"><input type="text" name="i" placeholder="Por qué pedís esta semana…" maxlength="80" value="'+esc(me.int||"")+'" autocomplete="off"><button class="iconbtn acc" type="submit" aria-label="Guardar">'+ic("check")+'</button></form>'+
     R.map(fila).join("")+'</div>'+
   (I.length?'<div class="card"><div class="eyebrow" style="margin-bottom:8px">Tus insignias</div><div class="insrow">'+I.map(x=>'<span class="insc">'+insigniaSVG(x.k)+'<b>'+esc(INSIG[x.k][0])+'</b><small>'+esc(fLarga(x.lun).replace(/^\w+ /,""))+'</small></span>').join("")+'</div></div>':'<p class="hint">Las insignias llegan cuando termina la semana: velas de oro, plata y bronce para los tres primeros, y la del equipo si cumplen la meta. Lo que ganás acá va a quedar en tu cuenta para el juego Scaeli.</p>')+
   '<div class="gbot"><button class="primary" data-a="gInvitar">'+ic("plus")+' Invitar amigos</button><button class="ghost g" data-a="gSalir">'+ic("out")+' Salir del grupo</button></div>'+
   '<p class="hint" style="text-align:center;margin-top:10px">Código: <b style="letter-spacing:.2em">'+G.id+'</b>'+(creador&&G.portada?' · <button class="lnk" data-a="gPortadaQuitar">Quitar la portada</button>':'')+'</p>'+
   '</div><button class="primary ink" data-a="cerrar">Volver</button>'; }

function muroHTML(u,creador){ const M=muro.filter(m=>!muroOculto(m)), ver=sheet.mver||12, L=M.slice(0,ver);
  const msg=m=>{ const mio=m.u===u, a=m.a||{}, n=Object.keys(a).length, yo1=!!a[u], rec=m.tipo==="rec";
    return '<div class="msg'+(rec?" rec":"")+(mio?" mio":"")+'"><div class="mh"><b>'+(rec?ic("bell")+' ':'')+esc(m.n||"")+'</b><small>'+hace(m.t)+'</small></div><p>'+esc(m.tx)+'</p><div class="mf"><button class="amen'+(yo1?" on":"")+'" data-a="mAmen" data-p="'+m.id+'" aria-pressed="'+yo1+'">'+ic("rosary")+' Amén'+(n?' · '+n:'')+'</button>'+
      (mio||creador?'<button class="sm" data-a="mBorrar" data-p="'+m.id+'" aria-label="Borrar" title="Borrar">'+ic("trash")+'</button>':'<button class="sm" data-a="mReportar" data-p="'+m.id+'" aria-label="Reportar" title="Reportar">'+ic("x")+'</button>')+'</div></div>'; };
  return '<div class="card muro"><div class="hd"><div class="eyebrow">Muro del grupo</div><button class="lnk" data-a="mRec">'+ic("bell")+' Recordar algo</button></div>'+
   (sheet.mrec?'<div class="chips mrec">'+RECORDATORIOS.map((r,i)=>'<button data-a="mRecOk" data-p="'+i+'">'+esc(r)+'</button>').join("")+'</div>':'')+
   '<form data-f="muro" class="add"><input type="text" name="m" placeholder="Escribile al grupo…" maxlength="140" autocomplete="off"><button class="iconbtn acc" type="submit" aria-label="Enviar">'+ic("send")+'</button></form>'+
   (L.length?'<div class="msgs">'+L.map(msg).join("")+'</div>'+(M.length>ver?'<button class="lnk" data-a="mMas" style="margin:8px auto 0;display:block">Ver más</button>':''):'<p class="hint" style="margin:6px 0 0">Todavía no escribió nadie. Un «buen día» o un recordatorio para rezar ya alcanza.</p>')+'</div>'; }

/* ── Tu año con Dios (Scaeli+): el año en historias, como el resumen de fin de año de Spotify ── */
const CRISTO_REY=y=>{ const d=new Date(y,11,3); d.setDate(3-d.getDay()-7); return iso(d); };   // el domingo anterior al 1.º de Adviento (el domingo entre el 27/11 y el 3/12)
const anioListo=()=>hoy()>=CRISTO_REY(parse(hoy()).getFullYear());
function anioDatos(){ const Y=hoy().slice(0,4), ks=Object.keys(days).filter(k=>k.startsWith(Y)&&/^\d{4}-\d\d-\d\d$/.test(k)).sort(), D={anio:Y,dias:0,ros:0,ev:0,lec:0,ex:0,hab:0,or:0,orPal:0,m:0,n:0,pasados:0,meses:{},rmax:0,rIni:"",rFin:"",nov:[],primero:ks[0]||""};
  const ini=Y+"-01-01"; let s2=ini, r=0, ri=""; while(s2<=hoy()){ const d=dayOf(s2); if(rezoAlgo(d)){ if(!r) ri=s2; r++; if(r>D.rmax){ D.rmax=r; D.rIni=ri; D.rFin=s2; } } else r=0; D.pasados++; s2=addDays(s2,1); }
  ks.forEach(k=>{ const d=days[k]; if(rezoAlgo(d)){ D.dias++; const m=k.slice(5,7); D.meses[m]=(D.meses[m]||0)+1; } if(d.r) D.ros+=Math.max(1,d.rn||1); if(d.e) D.ev++; if(d.lec&&d.lec.t) D.lec++; if(d.x) D.ex++; if(d.m) D.m++; if(d.n) D.n++;
    Object.values(d.hb||{}).forEach(x=>{ D.hab+=x.p||0; }); const o=d.or||{}; [o.m,o.n,d.lec&&d.lec.t].forEach(t=>{ if(t){ D.or++; D.orPal+=String(t).split(/\s+/).length; } }); });
  D.mes=Object.entries(D.meses).sort((a,b)=>b[1]-a[1])[0]||null;
  const H=rutina.habitos||[], vc={}; VIRTUDES.forEach(v=>vc[v[0]]=0); ks.forEach(k=>{ const hb=days[k].hb||{}; H.forEach(h=>{ const x=hb[h.id]; if(x&&x.p) vc[virtudDe(h)]+=x.p; }); }); D.virtud=Object.entries(vc).sort((a,b)=>b[1]-a[1])[0]; if(!D.virtud[1]) D.virtud=null;
  const hc={}; ks.forEach(k=>{ const hb=days[k].hb||{}; H.forEach(h=>{ const x=hb[h.id]; if(x&&x.p) hc[h.id]=(hc[h.id]||0)+x.p; }); }); D.logros=logros().filter(x=>x.ok).length; D.nivel=nivelDe().nivel; const hb1=Object.entries(hc).sort((a,b)=>b[1]-a[1])[0]; D.habTop=hb1?{t:(H.find(h=>h.id===hb1[0])||{}).t||"",n:hb1[1]}:null;
  novenas.forEach(x=>{ const N=NOVENAS.find(n=>n.id===x.id); if(N&&(x.dias||[]).length>=(N.d||9)&&String(x.ult||x.ini||"").startsWith(Y)) D.nov.push(N.n); });
  return D; }
function anioSlides(D){ const nom=(profile&&profile.nombre)||(user&&user.displayName&&user.displayName.split(" ")[0])||"", listo=anioListo(), pct=D.pasados?Math.round(D.dias/D.pasados*100):0, fe=f=>f?fLarga(f).replace(/^\w+ /,""):"";
  const S=[]; const add=(k,h)=>S.push({k,h});
  add("portada",'<div class="eyebrow">Scaeli Daily</div><h2>Tu año con Dios</h2><p class="big">'+D.anio+'</p>'+(nom?'<p class="sub">'+esc(nom)+', esto fue lo que vivieron juntos.</p>':'<p class="sub">Esto fue lo que vivieron juntos.</p>')+(listo?'':'<p class="chico">Hasta hoy. El resumen completo llega en Cristo Rey.</p>'));
  add("dias",'<div class="eyebrow">Días con Dios</div><p class="num">'+D.dias+'</p><p class="sub">'+(D.dias===1?"día":"días")+' en que rezaste algo: el Evangelio, el Rosario, las Horas, el examen o tu oración.</p><p class="chico">'+pct+' % de los días que pasaron del año.</p>');
  if(D.rmax>1) add("racha",'<div class="eyebrow">Tu racha más larga</div><p class="num">'+D.rmax+'</p><p class="sub">días seguidos con Dios.</p><p class="chico">Del '+esc(fe(D.rIni))+' al '+esc(fe(D.rFin))+'.</p>');
  if(D.ros) add("rosario",'<div class="eyebrow">Rosarios</div><p class="num">'+D.ros+'</p><p class="sub">'+(D.ros===1?"Rosario rezado":"Rosarios rezados")+'. '+(D.ros>=50?"María te tuvo muy cerca.":D.ros>=10?"Unas cuantas coronas de rosas.":"Cada uno vale.")+'</p>');
  if(D.ev) add("evangelio",'<div class="eyebrow">La Palabra</div><p class="num">'+D.ev+'</p><p class="sub">'+(D.ev===1?"Evangelio leído":"Evangelios leídos")+'.</p>'+(D.lec?'<p class="chico">Y '+D.lec+' '+(D.lec===1?"Lectio escrita":"Lectios escritas")+'.</p>':''));
  if(D.ex) add("examen",'<div class="eyebrow">Mirar el día</div><p class="num">'+D.ex+'</p><p class="sub">'+(D.ex===1?"examen del día":"exámenes del día")+'. Mirarse con verdad es el primer paso.</p>');
  if(D.or) add("oracion",'<div class="eyebrow">Tus palabras</div><p class="num">'+D.or+'</p><p class="sub">'+(D.or===1?"oración escrita":"oraciones escritas")+' con tus palabras.</p><p class="chico">'+D.orPal+' palabras dichas a Dios.</p>');
  if(D.m||D.n) add("momento",'<div class="eyebrow">Tu momento</div><h2>'+(D.m>=D.n?"Sos de la mañana":"Sos de la noche")+'</h2><p class="sub">'+(D.m>=D.n?D.m+" "+(D.m===1?"mañana":"mañanas")+" empezaron con Dios":D.n+" "+(D.n===1?"noche":"noches")+" terminaron con Dios")+'.</p>');
  if(D.mes) add("mes",'<div class="eyebrow">Tu mes más fiel</div><h2>'+cap(MESES[+D.mes[0]-1])+'</h2><p class="sub">'+D.mes[1]+' días con Dios.</p>');
  if(D.hab) add("habitos",'<div class="eyebrow">Hábitos</div><p class="num">'+D.hab+'</p><p class="sub">veces que sumaste un hábito.</p>'+(D.habTop?'<p class="chico">El que más: «'+esc(D.habTop.t)+'», '+D.habTop.n+' veces.</p>':''));
  if(D.virtud) add("virtud",'<div class="eyebrow">La virtud que más creció</div><h2>'+VNOM(D.virtud[0])+'</h2><p class="sub">'+esc((VIRTUDES.find(v=>v[0]===D.virtud[0])||[])[2]||"")+'</p>');
  if(D.nov.length) add("novenas",'<div class="eyebrow">Novenas completas</div><p class="num">'+D.nov.length+'</p><p class="sub">'+esc(D.nov.slice(0,4).join(" · "))+(D.nov.length>4?" y más":"")+'.</p>');
  add("nivel",'<div class="eyebrow">Tu nivel</div><p class="num">'+D.nivel+'</p><p class="sub">'+esc(nivelDe().titulo)+'. '+D.logros+' '+(D.logros===1?"logro ganado":"logros ganados")+'.</p>');
  add("final",'<div class="eyebrow">'+D.anio+'</div><h2>Gracias por este año</h2><p class="sub">Lo que sembraste con Dios no se pierde. Que el que viene sea todavía más suyo.</p><button class="primary" data-a="anioCompartir">'+ic("heart")+' Compartir mi año</button>');
  return S; }
function shAnio(){ if(!esPlus()) return shPlusPaywall("anio"); const D=sheet.D||(sheet.D=anioDatos()), S=sheet.S||(sheet.S=anioSlides(D)), i=Math.max(0,Math.min(S.length-1,sheet.i||0)), sl=S[i];
  clearTimeout(sheet.timer); if(i<S.length-1) sheet.timer=setTimeout(()=>{ if(sheet&&sheet.view==="anio"&&!sheet.pausa){ sheet.i=i+1; renderSheet(); } },6500);
  return '<div class="story bg-'+sl.k+'"><div class="sbars">'+S.map((x,k)=>'<i class="'+(k<i?"ok":k===i?"on":"")+'"></i>').join("")+'</div>'+
   '<div class="ftop"><span class="ft">Tu año con Dios · '+D.anio+'</span><span style="flex:1"></span><button class="iconbtn ghost g" data-a="cerrar" aria-label="Salir">'+ic("x")+'</button></div>'+
   '<div class="sbody" key="'+i+'">'+(sl.k==="portada"||sl.k==="final"?personajeHTML("vivo","south",150):'')+sl.h+'</div>'+
   '<button class="stap l" data-a="anioIr" data-p="-1" aria-label="Anterior"></button><button class="stap r" data-a="anioIr" data-p="1" aria-label="Siguiente"></button>'+
   '<p class="shint">'+(i+1)+' de '+S.length+' · tocá para pasar</p></div>'; }
/* la imagen para compartir: 1080×1920, como una historia */
async function anioImagen(D){ const cv=document.createElement("canvas"); cv.width=1080; cv.height=1920; const x=cv.getContext("2d");
  const g=x.createLinearGradient(0,0,0,1920); g.addColorStop(0,"#400E1E"); g.addColorStop(.55,"#1A1420"); g.addColorStop(1,"#0C0D10"); x.fillStyle=g; x.fillRect(0,0,1080,1920);
  const fk=fondoActual(); if(fk){ try{ const im=await new Promise((ok,no)=>{ const i=new Image(); i.onload=()=>ok(i); i.onerror=no; i.src=ilu(fk); }); x.imageSmoothingEnabled=false; const sc=Math.max(1080/im.width,760/im.height); x.drawImage(im,(1080-im.width*sc)/2,0,im.width*sc,im.height*sc); const g2=x.createLinearGradient(0,300,0,800); g2.addColorStop(0,"rgba(26,20,32,0)"); g2.addColorStop(1,"#1A1420"); x.fillStyle=g2; x.fillRect(0,300,1080,500); }catch(e){} }
  const rg=x.createRadialGradient(540,520,10,540,520,560); rg.addColorStop(0,"rgba(242,181,68,.28)"); rg.addColorStop(1,"rgba(242,181,68,0)"); x.fillStyle=rg; x.fillRect(0,0,1080,1200);
  const pj=document.createElement("canvas"); if(PJ.pintar(pj,profile,"south")){ x.imageSmoothingEnabled=false; x.drawImage(pj,0,0,128,128,540-224,250,448,448); x.imageSmoothingEnabled=true; }
  const nom=(profile&&profile.nombre)||(user&&user.displayName&&user.displayName.split(" ")[0])||"";
  x.textAlign="center"; x.fillStyle="#F2B544"; x.font="600 34px 'Bricolage Grotesque',system-ui,sans-serif"; x.fillText("SCAELI DAILY · "+D.anio,540,160);
  x.fillStyle="#F3F1EC"; x.font="300 96px 'Bricolage Grotesque',system-ui,sans-serif"; x.fillText(nom?"El año de "+nom:"Mi año con Dios",540,800);
  const filas=[[D.dias,"días con Dios"],[D.rmax,"días seguidos, mi racha más larga"],[D.ros,"Rosarios"],[D.ev,"Evangelios"],[D.ex,"exámenes del día"],[D.or,"oraciones con mis palabras"],[D.hab,"hábitos sumados"]].filter(f=>f[0]>0).slice(0,6);
  let y=920; filas.forEach(f=>{ x.textAlign="left"; x.fillStyle="#F2B544"; x.font="500 84px 'Bricolage Grotesque',system-ui,sans-serif"; x.fillText(String(f[0]),120,y); x.fillStyle="#F3F1EC"; x.font="300 44px 'Bricolage Grotesque',system-ui,sans-serif"; x.fillText(f[1],120+x.measureText("").width+Math.max(150,String(f[0]).length*52+40),y-8); y+=136; });
  if(D.virtud){ x.textAlign="center"; x.fillStyle="#7E8087"; x.font="500 34px 'Bricolage Grotesque',system-ui,sans-serif"; x.fillText("LA VIRTUD QUE MÁS CRECIÓ",540,y+40); x.fillStyle="#F3F1EC"; x.font="300 72px 'Bricolage Grotesque',system-ui,sans-serif"; x.fillText(VNOM(D.virtud[0]),540,y+130); }
  x.textAlign="center"; x.fillStyle="#7E8087"; x.font="400 34px 'Bricolage Grotesque',system-ui,sans-serif"; x.fillText("Tu fe, a otro nivel · ldiazvidela.github.io/scaeli-daily",540,1840);
  return new Promise(ok=>cv.toBlob(ok,"image/png")); }

/* los caminos guiados (Scaeli+) */
function caminoDia(C){ const h=hoy(); return C.dias.findIndex(d=>d[0]===h); }
function shCamino(){ const C=CAMINOS[sheet.p||"adviento"]; if(!esPlus()) return shPlusPaywall("camino");
  const i=caminoDia(C), antes=hoy()<C.ini, hechos=C.dias.filter(d=>(dayOf(d[0]).cam||{})[sheet.p||"adviento"]).length;
  const semana=k=>Math.min(3,Math.floor((parse(C.dias[k][0])-parse(C.ini))/864e5/7));
  const fila=(d,k)=>{ const ok=!!(dayOf(d[0]).cam||{})[sheet.p||"adviento"], esHoy=k===i, fut=d[0]>hoy();
    return (k===0||semana(k)!==semana(k-1)?'<div class="sect camsem">Semana '+(semana(k)+1)+' · '+esc(C.semanas[semana(k)][0])+'<small class="muted" style="display:block;text-transform:none;letter-spacing:0">'+esc(C.semanas[semana(k)][1])+'</small></div>':'')+
     '<div class="camd'+(esHoy?" hoy":"")+(fut?" fut":"")+'"><button class="ck'+(ok?" on":"")+'" data-a="camOk" data-p="'+d[0]+'"'+(fut?" disabled":"")+' aria-label="Hecho">'+(ok?ic("check"):"")+'</button><div class="n"><small>'+esc(cap(fLarga(d[0])))+' · '+esc(d[1])+'</small><button class="lnk cita" data-a="camCita" data-p="'+esc(d[2])+'">'+ic("book")+' '+esc(d[2])+'</button><p>'+esc(d[3])+'</p></div></div>'; };
  return shTop(esc(C.n),esc(C.sub))+'<div class="scroll"><div class="sbanner"><img src="'+ilu("noche")+'" alt=""><span class="g"></span></div>'+
   '<p class="texto chico">'+esc(C.intro)+'</p>'+'<div class="camprog">'+(antes?'<p class="hint">Empieza el '+esc(fLarga(C.ini))+'. Ya podés ver todo el camino.</p>':'<div class="bar"><i style="width:'+Math.round(hechos/C.dias.length*100)+'%"></i></div><p class="hint">'+hechos+' de '+C.dias.length+' días</p>')+'</div>'+
   C.dias.map(fila).join("")+'</div><button class="primary ink" data-a="cerrar">Volver</button>'; }

/* ── tu oración: a la mañana y a la noche, con tus palabras; queda en tu historial ── */
function shOrar(){ const k=sheet.p==="noche"?"n":"m", d=dayOf(hoy()), prev=((d.or||{})[k])||"", txt=sheet.otxt!=null?sheet.otxt:prev, I=ORAR[k];
  return '<div class="ftop"><button class="iconbtn ghost g" data-a="cerrar" aria-label="Salir">'+ic("x")+'</button><span style="flex:1"></span><span class="ft">'+esc(cap(fLarga(hoy())))+'</span></div>'+
   '<div class="fcuerpo"><div class="fla">'+esc(I[0])+'</div><h2 class="fh">'+esc(I[1])+'</h2><p class="fhint">'+esc(I[2])+'</p>'+
   '<textarea class="fta" id="orTxt" placeholder="Señor…" aria-label="Tu oración">'+esc(txt)+'</textarea>'+
   '<p class="fhint chico">'+ic("lock")+' Solo vos la ves. Queda en tu historial para ver cómo vas creciendo.</p></div>'+
   '<div class="fpie"><button class="lnk" data-a="misOraciones">'+ic("book")+' Mis oraciones</button><button class="primary" data-a="orGuardar">'+(prev?"Guardar":"Amén")+'</button></div>'; }
const OR_NOM={m:"Mañana",n:"Noche",lec:"Lectio"};
function misOracionesLista(){ const L=[]; Object.keys(days).filter(f=>/^\d{4}-\d\d-\d\d$/.test(f)).forEach(f=>{ const d=days[f], o=d.or||{};
  if(o.m) L.push({f,k:"m",t:o.m}); if(d.lec&&d.lec.t) L.push({f,k:"lec",t:d.lec.t}); if(o.n) L.push({f,k:"n",t:o.n}); });
  const ord={n:0,lec:1,m:2}; return L.sort((a,b)=>b.f.localeCompare(a.f)||ord[a.k]-ord[b.k]); }
function oracionCerca(L,dias,marg){ const obj=addDays(hoy(),-dias); let mejor=null, dm=1e9;
  L.forEach(x=>{ const dd=Math.abs((parse(x.f)-parse(obj))/864e5); if(dd<=marg&&dd<dm){ dm=dd; mejor=x; } }); return mejor; }
function shMisOraciones(){ const L=misOracionesLista(), q=sinTilde(sheet.q||"").trim(), V=q?L.filter(x=>sinTilde(x.t).includes(q)):L;
  const tarj=(x,cls)=>'<div class="orc'+(cls?" "+cls:"")+'"><div class="orh"><span>'+esc(cap(fLarga(x.f)))+' · '+OR_NOM[x.k]+'</span>'+(cls?'':'<button class="sm" data-a="orBorrar" data-p="'+x.f+'|'+x.k+'" aria-label="Borrar">'+ic("trash")+'</button>')+'</div><p>'+esc(x.t)+'</p></div>';
  const ult=L[0], mes=oracionCerca(L,30,6), anio=oracionCerca(L,365,20);
  const cmp=ult&&(mes||anio)&&!q?'<div class="card orcmp"><div class="eyebrow">Mirá tu camino</div>'+(anio?'<div class="sect">Hace un año</div>'+tarj(anio,"ant"):'')+(mes?'<div class="sect">Hace un mes</div>'+tarj(mes,"ant"):'')+'<div class="sect">La última</div>'+tarj(ult,"ant")+'</div>':'';
  let grupos="", mesAct="";
  V.forEach(x=>{ const m=x.f.slice(0,7); if(m!==mesAct){ mesAct=m; const D=parse(m+"-01"); grupos+='<div class="sect">'+cap(MESES[D.getMonth()])+' '+D.getFullYear()+'</div>'; } grupos+=tarj(x); });
  return shTop("Mis oraciones",L.length?L.length+(L.length===1?" oración":" oraciones")+" desde el "+esc(fLarga(L[L.length-1].f).replace(/^\w+ /,"")):"Lo que le decís a Dios, guardado para vos")+
   '<div class="scroll">'+(L.length?'<input type="search" id="orQ" placeholder="Buscar una palabra…" value="'+esc(sheet.q||"")+'" style="height:46px;margin-bottom:10px">'+cmp+(grupos||'<p class="empty">No hay oraciones con esa palabra.</p>')
     :'<p class="empty">Todavía no guardaste ninguna oración. A la mañana y a la noche, en Hoy, escribile a Dios con tus palabras: acá vas a poder releerlas y ver cómo vas creciendo.</p>')+
   '</div><div class="grid2"><button class="ghost g" data-a="orar" data-p="'+(momento()==="manana"||momento()==="mediodia"?"manana":"noche")+'">'+ic("pen")+' Escribir</button><button class="primary ink" data-a="cerrar">Volver</button></div>'; }

/* ── los libros: clásicos católicos libres de derechos (herramientas/libros_mb.py), un archivo por libro en libros/ ── */
const LIB={}, LIB_K="daily_libros";
function libGuardado(){ try{ return JSON.parse(localStorage.getItem(LIB_K)||"{}")||{}; }catch(e){ return {}; } }
function libMarcar(id,c,fin){ try{ const g=libGuardado(); g[id]={c,t:Date.now(),fin:(g[id]&&g[id].fin)||fin||0}; g.ult=id; localStorage.setItem(LIB_K,JSON.stringify(g)); }catch(e){} }
function libTexto(id){ if(LIB[id]) return Promise.resolve(LIB[id]); return fetch("libros/"+id+".json").then(r=>{ if(!r.ok) throw new Error("x"); return r.json(); }).then(j=>{ LIB[id]=j; return j; }); }
function libUltimo(){ const g=libGuardado(), L=g.ult&&LIBROS.find(x=>x.id===g.ult); return L?{L,c:(g[g.ult]||{}).c||0}:null; }
const libMin=L=>Math.max(1,Math.round(L.w/200/L.n));   // minutos por capítulo, a 200 palabras por minuto
function libParr(p){ if(p.startsWith("## ")) return '<h4 class="bibtit">'+esc(p.slice(3))+'</h4>'; if(p.startsWith("> ")) return '<p class="resumen">'+esc(p.slice(2))+'</p>'; const m=p.match(/^(\d+\.|\[\d+\])\s*/); return '<p'+(p.includes("\n")?' class="verso"':'')+'>'+(m?'<sup>'+esc(m[1].replace(/[\[\].]/g,""))+'</sup>'+esc(p.slice(m[0].length)):esc(p))+'</p>'; }
function shLibros(){ const g=libGuardado(), u=libUltimo();
  const aut=[...new Set(LIBROS.map(x=>x.a.split(" · ")[0]))];
  return shTop("Biblioteca","Clásicos católicos, libres de derechos")+'<div class="scroll"><div class="sbanner"><img src="'+ilu("oraciones")+'" alt=""><span class="g"></span></div>'+
   (u?'<button class="card lhnow" data-a="libIr" data-p="'+u.L.id+'|'+u.c+'"><span class="n"><span class="eyebrow">Seguir leyendo</span><b>'+esc(u.L.t)+'</b><small>'+esc(u.L.caps?u.L.caps[u.c].t:"capítulo "+(u.c+1))+'</small></span>'+ic("right")+'</button>':'')+
   aut.map(a=>'<div class="sect">'+esc(a)+'</div>'+LIBROS.filter(x=>x.a.split(" · ")[0]===a).map(x=>{ const m=g[x.id]; return '<button class="libro" data-a="libAbrir" data-p="'+x.id+'"><span class="tapa"><i></i><b>'+esc(x.t)+'</b></span><span class="n"><b>'+esc(x.t)+'</b><small>'+esc(x.sub)+'</small><small class="muted">'+x.n+' capítulos · '+libMin(x)+' min cada uno'+(m?' · vas por el '+(m.c+1):'')+'</small></span>'+ic("right")+'</button>'; }).join("")).join("")+
   '<p class="hint" style="margin-top:14px">Obras de dominio público: escritas en castellano por sus autores, y la Imitación de Cristo en la traducción clásica del P. Nieremberg (siglo XVII). El texto, tal cual lo publica el archivo de libros de mercaba.es; puede traer alguna errata de la edición digital.</p>'+
   '</div><button class="primary ink" data-a="cerrar">Volver</button>'; }
function shLibro(){ const L=LIBROS.find(x=>x.id===sheet.p); if(!L) return shTop("Libro")+'<p class="hint">No está.</p>'; const T=LIB[L.id];
  if(!T){ libTexto(L.id).then(()=>renderSheet()).catch(()=>{ sheet.err="No se pudo abrir este libro. Revisá la conexión."; renderSheet(); }); return shTop(esc(L.t),esc(L.a))+'<p class="hint">'+(sheet.err?esc(sheet.err):"Abriendo…")+'</p>'; }
  const g=libGuardado()[L.id];
  if(sheet.m!=="leer"){ let sec=""; return shTop(esc(L.t),esc(L.a)+(L.y?" · "+esc(L.y):""))+'<div class="scroll"><p class="texto chico">'+esc(L.sub)+'</p>'+
    (g?'<button class="card lhnow" data-a="libIr" data-p="'+L.id+'|'+g.c+'"><span class="n"><span class="eyebrow">Seguir leyendo</span><b>'+esc(T.caps[g.c].t)+'</b></span>'+ic("right")+'</button>':'')+
    '<div class="list libcaps">'+T.caps.map((c,i)=>{ const h=c.s&&c.s!==sec?'<div class="sect">'+esc(c.s)+'</div>':""; sec=c.s||sec; return h+'<button class="row" data-a="libIr" data-p="'+L.id+'|'+i+'"><span class="n"><b>'+esc(c.t)+'</b>'+(c.p[0]&&c.p[0].startsWith("> ")?'<small>'+esc(c.p[0].slice(2))+'</small>':'')+'</span>'+(g&&g.c===i?'<span class="ck on">'+ic("check")+'</span>':ic("right"))+'</button>'; }).join("")+'</div>'+
    '<p class="hint" style="margin-top:12px">Fuente: <a href="'+esc(L.url)+'" target="_blank" rel="noopener">mercaba.es</a>.</p></div><button class="ghost g" data-a="libros" style="justify-content:center;height:48px">'+ic("left")+' Biblioteca</button>'; }
  const i=sheet.c||0, C=T.caps[i];
  return shTop(esc(C.t),'<button class="lnk" data-a="libAbrir" data-p="'+L.id+'" style="padding:0;font-size:12px">'+esc(L.t)+(C.s?' · '+esc(C.s):'')+' · capítulos</button>')+'<div class="scroll biblia lib">'+C.p.map(libParr).join("")+
   (i>=T.caps.length-1?'<p class="hint" style="text-align:center;margin-top:20px">Fin del libro. '+esc(L.a)+'.</p>':'')+
   (yaEnRutina("Leer diez minutos de un libro espiritual")?'':'<button class="plusrow" data-a="bibliAddLeer"><span class="n"><b>Sumar «Leer diez minutos de un libro espiritual»</b><small>Como diaria en Tu día, con su vela</small></span>'+ic("plus")+'</button>')+'</div>'+
   '<div class="grid2"><button class="ghost g" data-a="libIr" data-p="'+L.id+'|'+(i-1)+'"'+(i<=0?" disabled":"")+'>'+ic("left")+' '+(i>0?esc(T.caps[i-1].t.slice(0,16)):"")+'</button><button class="ghost g" data-a="libIr" data-p="'+L.id+'|'+(i+1)+'"'+(i>=T.caps.length-1?" disabled":"")+' style="justify-content:flex-end">'+(i<T.caps.length-1?esc(T.caps[i+1].t.slice(0,16)):"")+' '+ic("right")+'</button></div>'; }

/* ── la biblioteca de hábitos y virtudes: propuestas para sumar a Tu día con un toque ── */
function yaEnRutina(t){ const q=sinTilde(t); return (rutina.diarias||[]).some(x=>sinTilde(x.t)===q)||(rutina.habitos||[]).some(x=>sinTilde(x.t)===q); }
function shBiblioteca(){ const a=sheet.a||"", v=sheet.v||"", g=sheet.g||"", L=BIBLIOTECA.filter(x=>(!a||x.a===a)&&(!v||x.v===v)&&(!g||!x.g||x.g===g));
  const chip=(k,val,txt,on)=>'<button data-a="bibliFiltro" data-p="'+k+'|'+val+'" aria-pressed="'+on+'">'+txt+'</button>';
  return shTop("Biblioteca de hábitos","Elegí lo que querés hacer crecer")+'<div class="scroll">'+
   '<div class="seg lat-seg pub-seg">'+PUBLICOS.map(x=>'<button class="'+(g===x[0]?"on":"")+'" data-a="bibliFiltro" data-p="g|'+x[0]+'">'+x[1]+'</button>').join("")+'</div>'+
   '<div class="chips bfil">'+chip("a","","Todas",!a)+AREAS.map(x=>chip("a",x[0],x[1],a===x[0])).join("")+'</div>'+
   '<div class="chips bfil virt">'+chip("v","","Toda virtud",!v)+VIRTUDES.map(x=>chip("v",x[0],x[1],v===x[0])).join("")+'</div>'+
   (v?'<p class="hint" style="margin:4px 0 10px">'+esc(VIRTUDES.find(x=>x[0]===v)[2])+'</p>':'')+
   '<div class="list bibli">'+L.map(x=>{ const ya=yaEnRutina(x.t); return '<div class="brow"><span class="n"><b>'+esc(x.t)+'</b><small>'+VNOM(x.v)+' · '+(x.d?"Diaria":"Hábito")+' · '+esc((AREAS.find(y=>y[0]===x.a)||["",""])[1])+'</small></span>'+(ya?'<span class="ck on" aria-label="Ya está en tu día">'+ic("check")+'</span>':'<button class="ghost g" data-a="bibliAdd" data-p="'+esc(x.t)+'">'+ic("plus")+' Agregar</button>')+'</div>'; }).join("")+'</div>'+
   '<p class="hint" style="margin-top:12px">Las diarias se hacen una vez por día y tienen su vela; los hábitos se suman cada vez que los hacés. Todo esto va a «Tu día», y también podés escribir el tuyo.</p>'+
   '</div><button class="primary ink" data-a="cerrar">Volver</button>'; }

/* un «¿estás seguro?» propio de la app (los diálogos del navegador traban la app nativa) */
function confirmar(tit,txt,ok,no){ return new Promise(res=>{ const el=document.createElement("div"); el.className="dlg"; el.setAttribute("role","alertdialog"); el.setAttribute("aria-modal","true");
  el.innerHTML='<div class="dlgc"><h3>'+esc(tit)+'</h3>'+(txt?'<p>'+esc(txt)+'</p>':'')+'<div class="grid2"><button class="ghost g" data-r="0">'+esc(no||"Cancelar")+'</button><button class="primary" data-r="1">'+esc(ok||"Aceptar")+'</button></div></div>';
  const fin=v=>{ el.remove(); res(v); }; el.addEventListener("click",e=>{ const b=e.target.closest("[data-r]"); if(b){ e.stopPropagation(); e.preventDefault(); fin(b.dataset.r==="1"); } else if(e.target===el) fin(false); });
  document.body.appendChild(el); setTimeout(()=>{ const b=el.querySelector('[data-r="0"]'); if(b) b.focus(); },30); }); }

/* la pantalla de Scaeli+ (también aparece al tocar algo premium) */
function shPlusPaywall(desde){ const nat=esNativo(), P=sheet.planes, eq=delEquipo()||plusPrueba(), activo=esPlus();
  if(nat&&comprasDisponibles()&&!P&&!sheet.cargandoP){ sheet.cargandoP=1; comprasPlanes().then(x=>{ if(sheet){ sheet.planes=x||{}; renderSheet(); } }); }
  const precio=(p,def)=>p&&p.product&&p.product.priceString?p.product.priceString:def;
  const ben=[["Incluye Scaeli Fit","Una sola suscripción para las dos apps: ayuno con planes, rutinas por objetivo, escaneo de comidas por foto e informes."],["Tu progreso y tus virtudes","Tus hábitos y tu oración semana a semana, y el esquema de las virtudes que más trabajás y las que te faltan."],["Caminos guiados","Adviento, día por día: el Evangelio de la Misa y un gesto concreto para vivirlo. En su tiempo se suman la Cuaresma y el Mes de María."],["Tu año con Dios","Tu año en historias: días con Dios, rachas, Rosarios, Evangelios, novenas y medallas, con una imagen para compartir."],["Sostenés Scaeli","Un proyecto para acercar a los jóvenes a Dios, sin publicidad."]];
  const anual=P&&P.anual, mensual=P&&P.mensual, pa=anual&&anual.product&&anual.product.price, pm=mensual&&mensual.product&&mensual.product.price;
  const ahorro=pa&&pm?Math.round((1-pa/(pm*12))*100):44;
  return shTop("Scaeli+",activo?"Lo tenés activo":"Para crecer en lo que ya rezás")+'<div class="scroll"><div class="plus-hero"><span class="plus-tag">Scaeli<b>+</b></span><p>La oración es gratis siempre. Scaeli+ te ayuda a ver tu camino y a sostenerlo.</p></div>'+
   '<div class="list">'+ben.map(b=>'<div class="benef">'+ic("check")+'<div><b>'+b[0]+'</b><small>'+b[1]+'</small></div></div>').join("")+'</div>'+
   (activo?'<p class="hint" style="text-align:center;margin-top:14px">'+(plusDoc&&plusDoc.active?(plusDoc.source==="code"?"Activado con el código "+esc(plusDoc.code||"")+(plusDoc.until?" hasta el "+esc(fLarga(plusDoc.until).replace(/^\w+ /,"")):""):plusDoc.source==="team"?"Acceso del equipo.":"Gracias por sostener Scaeli."+(plusDoc.until?" Renueva el "+esc(fLarga(plusDoc.until).replace(/^\w+ /,""))+".":""))+" Vale también en Scaeli Fit.":(eq&&!plusTienda?"Acceso de prueba activo.":"Gracias por sostener Scaeli."))+'</p>'+(desde?'<button class="primary" data-a="'+(desde==="camino"?"camino":desde==="anio"?"anio":"progreso")+'" style="margin-top:8px">Abrir</button>':''):
   (nat?'<div class="planes"><button class="plan dest" data-a="plusComprar" data-p="anual"'+(anual?'':' disabled')+'>'+(ahorro>0?'<span class="ah">Ahorrás '+ahorro+'%</span>':'')+'<b>Anual</b><small>'+esc(precio(anual,"USD 19,99"))+' por año</small></button>'+
     '<button class="plan" data-a="plusComprar" data-p="mensual"'+(mensual?'':' disabled')+'><b>Mensual</b><small>'+esc(precio(mensual,"USD 2,99"))+' por mes</small></button></div>'+
     (comprasDisponibles()?'':'<p class="hint" style="text-align:center">Las compras todavía no están activas en esta versión.</p>')+
     '<button class="lnk" data-a="plusRestaurar" style="display:block;margin:10px auto 0">Restaurar compras</button>':
     '<div class="planes"><div class="plan dest"><span class="ah">Ahorrás 44%</span><b>Anual</b><small>USD 19,99 por año</small></div><div class="plan"><b>Mensual</b><small>USD 2,99 por mes</small></div></div><p class="hint" style="text-align:center">Scaeli+ se activa desde la app de Scaeli Daily para Android o iPhone.</p>'+
     '<details class="codigo"><summary class="hint">¿Tenés un código?</summary><form data-f="plusCodigo" class="add"><input type="text" name="c" placeholder="Código de Scaeli+" autocomplete="off" style="text-transform:uppercase"><button class="iconbtn acc" type="submit" aria-label="Activar">'+ic("check")+'</button></form></details>'))+
   (eq?'<button class="lnk" data-a="plusComoGratis" style="display:block;margin:12px auto 0">'+(lsGet("daily_plus_como_gratis")==="1"?"Volver a ver Scaeli+":"Ver la app como usuario gratis")+'</button>':'')+
   '<p class="legal">La suscripción se renueva sola al final de cada período, al mismo precio, salvo que la canceles al menos 24 horas antes desde tu cuenta de Google Play o del App Store. El pago se cobra en tu cuenta de la tienda. <a href="terminos.html" target="_blank" rel="noopener">Términos de uso</a> · <a href="privacidad.html" target="_blank" rel="noopener">Privacidad</a></p>'+
   '</div><button class="primary ink" data-a="cerrar">'+(activo?"Volver":"Ahora no")+'</button>'; }
function shPlus(){ return shPlusPaywall(""); }

/* donar: para quien quiera ayudar, con o sin Scaeli+ */
function shDonar(){ const nat=esNativo(), D=sheet.dons;
  if(nat&&comprasDisponibles()&&!D&&!sheet.cargandoD){ sheet.cargandoD=1; donacionesProductos().then(x=>{ if(sheet){ sheet.dons=x||[]; renderSheet(); } }); }
  const montos=["USD 1,99","USD 4,99","USD 9,99"];
  return shTop("Ayudar a Scaeli","Una donación, cuando quieras")+'<div class="scroll"><div class="sbanner"><img src="'+ilu("novenas")+'" alt=""><span class="g"></span></div>'+
   '<p class="texto chico">Scaeli es un proyecto personal de un educador católico de Buenos Aires para acercar a los jóvenes a Dios, sin publicidad y sin vender tus datos. Si te sirve y querés ayudar a sostenerlo, podés hacer una donación. No te da nada extra en la app: es un regalo.</p>'+
   '<div class="donmontos">'+montos.map((m,i)=>{ const p=D&&D.find(x=>x.identifier==="scaeli_donacion_"+(i+1)); return '<button class="donm" data-a="donar" data-p="'+(i+1)+'"'+(nat&&!p?' disabled':'')+'>'+ic("heart")+'<b>'+esc(p&&p.priceString||m)+'</b></button>'; }).join("")+'</div>'+
   (nat?(comprasDisponibles()?'':'<p class="hint">Las donaciones todavía no están activas en esta versión.</p>'):'<p class="hint">Las donaciones se hacen desde la app de Scaeli Daily para Android o iPhone.</p>')+
   '</div><button class="primary ink" data-a="cerrar">Volver</button>'; }

/* ── el panel inferior: las oraciones, el rosario, las horas, el examen… ── */
function openSheet(s){ sheet=s; $("#scrim").hidden=false; $("#sheet").hidden=false; renderSheet(); window.scrollTo(0,0); }
function closeSheet(){ if(sheet&&sheet.timer) clearTimeout(sheet.timer); sheet=null; $("#scrim").hidden=true; $("#sheet").hidden=true; $("#sheet").classList.remove("full"); document.body.classList.remove("enfoque"); render(); }
function renderSheet(){ if(!sheet) return; const S={hora:shHora,evangelio:shEvangelio,rosario:shRosario,horas:shHoras,hora_lh:shHoraLH,oraciones:shOraciones,oracion:shOracion,novenas:shNovenas,novena:shNovena,examen:shExamen,confesion:shConfesion,misa:shMisa,santo:shSanto,santoral:shSantoral,lectio:shLectio,lectioGuia:shLectioGuia,exConf:shExConf,biblia:shBiblia,progreso:shProgreso,camino:shCamino,anio:shAnio,grupo:shGrupo,biblioteca:shBiblioteca,libros:shLibros,libro:shLibro,orar:shOrar,misOraciones:shMisOraciones,plus:shPlus,donar:shDonar,borrar:shBorrar}[sheet.view];
  $("#sheetIn").innerHTML=S?S():""; pintarPersonajes(); $("#sheet").classList.toggle("short",!!sheet.short); $("#sheet").classList.toggle("full",!!sheet.full); document.body.classList.toggle("enfoque",!!sheet.full); const sc=$("#sheet .scroll"); if(sc&&sheet.top!==false) sc.scrollTop=0; }
function renderSheetQuieto(){ const sc=$("#sheet .scroll"), y=sc?sc.scrollTop:0; renderSheet(); const s2=$("#sheet .scroll"); if(s2) s2.scrollTop=y; }
const shTop=(t,sub)=>'<h3><span>'+t+(sub?'<small class="muted" style="display:block;font-size:12px;font-weight:400;letter-spacing:0">'+sub+'</small>':'')+'</span><button class="iconbtn ghost" data-a="cerrar" aria-label="Cerrar">'+ic("x")+'</button></h3>';
const intHTML=()=>intents.length?'<p class="hint">Por: '+intents.map(esc).join(" · ")+'</p>':'';

const amen='<button class="primary" data-a="AOK">Amén</button>';
function shHora(){ const H=HORA[sheet.p]||HORA.mediodia, k=momKey[sheet.p], d=dayOf(hoy());
  return '<div class="scroll"><div class="sbanner"><img src="'+ilu(sheet.p)+'" alt=""><span class="g"></span><button class="iconbtn x" data-a="cerrar" aria-label="Cerrar">'+ic("x")+'</button></div><div class="eyebrow">'+esc(H.s)+'</div><h2 class="st">'+esc(H.t)+'</h2><div class="pray"><p class="q">'+esc(H.txt)+'</p>'+intHTML()+'<p class="hint"><b class="ref">'+esc(H.fin)+'</b></p></div></div>'+
   amen.replace("AOK","horaOk").replace('">',  '" data-p="'+k+'">'); }
function shEvangelio(){ const ev=evHoy; if(!ev) return shTop("Evangelio del día")+'<p class="hint">Cargando…</p>';
  return '<div class="scroll lecturas"><div class="sbanner"><img src="'+ilu("evangelio")+'" alt=""><span class="g"></span><button class="iconbtn x" data-a="cerrar" aria-label="Cerrar">'+ic("x")+'</button></div><div class="eyebrow">'+esc(ev.dia||"Evangelio del día")+'</div><h2 class="st">'+esc(citaCorta(ev.evangelio.cita))+'</h2><h4>'+esc(ev.evangelio.titulo)+'</h4><p>'+esc(ev.evangelio.texto)+'</p>'+(ev.respaldo?'<p class="hint">Hoy no se pudieron traer las lecturas del día; este es un pasaje para quedarse con Él.</p>':'')+
   '<div class="card pad" style="margin-top:12px"><div class="eyebrow">Para hoy</div><p style="margin:6px 0 0">'+esc(ideaHoy())+'</p></div></div>'+'<div class="grid2"><button class="ghost g" data-a="lectio">'+ic("pen")+' Hacer lectio</button>'+(dayOf(hoy()).e?'<button class="ghost g" data-a="desmarcar" data-p="e">'+ic("x")+' Ya leído · sacar</button>':'<button class="primary" data-a="evOk" style="height:40px;font-size:14px">Amén</button>')+'</div>'; }
/* los otros santos de cada día (data/santoral-mas.js, del Martirologio Romano): se cargan recién cuando se abre el santoral */
let MAS=null, masCarga=null;
function cargarMas(){ if(MAS||masCarga) return; masCarga=import("../data/santoral-mas.js").then(m=>{ MAS=m.SANTORAL_MAS||{}; if(sheet&&/santo/.test(sheet.view)) renderSheet(); }).catch(()=>{ masCarga=null; }); }
const masDe=mm=>(MAS&&MAS[mm])||[];
function fichaMas(mm,i){ const x=masDe(mm)[i]; return x?{mm,n:x.n,p:x.p||[],b:x.b,f:null,vida:x.vida||null,src:null,mas:true}:null; }
function shSanto(){ const [mm,iS]=String(sheet.p||hoy().slice(5)).split("|"), i=iS===undefined?-1:+iS; cargarMas();
  const F=i>=0?fichaMas(mm,i):fichaSanto(mm); if(!F) return shTop("Santoral")+'<p class="hint">'+(i>=0?"Cargando…":"Ese día no tiene memoria propia.")+'</p>';
  const t=i>=0?"santo":tipoSanto(F.n,mm), esHoy=mm===hoy().slice(5), [M,D]=mm.split("-").map(Number);
  const ey=(t==="fiesta"?"Fiesta":t==="maria"?"La Virgen":t==="difuntos"?"Hoy rezamos por":esHoy&&i<0?"Santo del día":"Santoral")+' · '+D+' de '+MESES[M-1];
  const otros=[[-1,fichaSanto(mm)],...masDe(mm).map((x,k)=>[k,x])].filter(([k,x])=>x&&k!==i);
  return '<div class="scroll"><div class="sbanner alto"><img src="'+ilu("santo")+'" alt=""><span class="g"></span><button class="iconbtn x" data-a="cerrar" aria-label="Cerrar">'+ic("x")+'</button></div>'+
   '<div class="eyebrow">'+ey+'</div><h2 class="st">'+esc(F.n)+'</h2>'+
   (F.p.length?'<div class="chips tags">'+F.p.map((q,i)=>'<span class="'+(i?"":"on")+'">'+esc(q)+'</span>').join("")+'</div>':'')+
   (F.vida?'<p class="hint vida">'+esc(F.vida)+'</p>':'')+
   '<p class="texto">'+esc(F.b)+'</p>'+(F.f?'<blockquote class="frase">«'+esc(F.f[0])+'»<cite>'+esc(F.f[1])+'</cite></blockquote>':'')+
   '<div class="card pide"><div class="eyebrow">Pedile hoy</div><p class="q sm">'+esc(oracionSanto(F.n,i>=0?"00-00":mm))+'</p></div>'+
   (F.src?'<p class="hint" style="margin-top:12px">Fuente: <a href="'+esc(F.src)+'" target="_blank" rel="noopener">'+esc(fuenteNom(F.src))+'</a></p>':F.mas?'<p class="hint" style="margin-top:12px">Fuente: Martirologio Romano</p>':'')+
   (otros.length?'<div class="sect" style="margin-top:18px">'+(i<0?"También se recuerda hoy":"Ese mismo día")+'</div><div class="list">'+otros.map(([k,x])=>'<button class="food" data-a="salVer" data-p="'+mm+(k>=0?"|"+k:"")+'"><div style="flex:1;min-width:0"><b>'+esc(x.n)+'</b><br><small>'+esc((x.p&&x.p[0])||"")+'</small></div>'+ic("right")+'</button>').join("")+'</div>':'')+'</div>'+
   (sheet.desde?'<div class="grid2"><button class="ghost g" data-a="santoral">'+ic("left")+' Santoral</button><button class="primary" data-a="santoOk" style="height:40px;font-size:14px">Amén</button></div>':(esHoy&&i<0&&dayOf(hoy()).s?'<button class="primary ok" data-a="desmarcar" data-p="s">'+ic("x")+' Ya rezado · sacar la marca</button>':amen.replace("AOK","santoOk"))); }

/* el santoral: todos los días del año, con buscador */
const sinTilde=t=>String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function shSantoral(){ const q=sinTilde(sheet.q||""); const mes=sheet.m; cargarMas();
  const L=Object.keys(SANTOS).sort().filter(k=>q?sinTilde(SANTOS[k][0]+" "+(fichaSanto(k).p||[]).join(" ")).includes(q):(+k.slice(0,2)===mes+1));
  /* en la búsqueda también aparecen los otros santos del día */
  const LM=q&&MAS?Object.keys(MAS).sort().flatMap(k=>MAS[k].map((x,i)=>[k,i,x]).filter(([,,x])=>sinTilde(x.n+" "+(x.p||[]).join(" ")).includes(q))):[];
  return shTop("Santoral","Los santos de cada día")+'<input type="search" id="salQ" placeholder="Buscar un santo…" value="'+esc(sheet.q||"")+'" style="height:46px">'+
   (q?'':'<div class="chips meses">'+MESES.map((m,i)=>'<button data-a="salMes" data-p="'+i+'" aria-pressed="'+(i===mes)+'">'+cap(m.slice(0,3))+'</button>').join("")+'</div>')+
   '<div class="scroll"><div class="list">'+(L.length?L.map(k=>{ const [M,D]=k.split("-").map(Number), F=fichaSanto(k);
     const n=masDe(k).length;
     return '<button class="food sal'+(k===hoy().slice(5)?' hoy':'')+'" data-a="salVer" data-p="'+k+'"><span class="dia"><b>'+D+'</b><small>'+MESES[M-1].slice(0,3)+'</small></span><div style="flex:1;min-width:0"><b>'+esc(F.n)+'</b><br><small>'+esc((F.p[0]||F.b).slice(0,60))+(n&&!q?' · y '+n+' más':'')+'</small></div>'+ic("right")+'</button>'; }).join(""):'')+
     LM.slice(0,60).map(([k,i,x])=>{ const [M,D]=k.split("-").map(Number); return '<button class="food sal" data-a="salVer" data-p="'+k+'|'+i+'"><span class="dia"><b>'+D+'</b><small>'+MESES[M-1].slice(0,3)+'</small></span><div style="flex:1;min-width:0"><b>'+esc(x.n)+'</b><br><small>'+esc((x.p&&x.p[0])||"")+'</small></div>'+ic("right")+'</button>'; }).join("")+
     (!L.length&&!LM.length?'<p class="empty">'+(q&&!MAS?"Buscando…":"No encontré ese santo.")+'</p>':'')+'</div></div>'; }

/* la lectio divina (optativa) sobre el Evangelio del día */
const LECTIO_PASOS=[["Leer","Leé el Evangelio despacio. Si podés, dos veces."],["Meditar","Volvé al texto a tu ritmo. Quedate donde Dios te detenga."],["Rezar","Hablale con tus palabras. Si querés escribir, queda solo para vos."],["Contemplar","Quedate en silencio con Él, el tiempo que quieras."]];
/* la guía de la Lectio: qué es y cómo se hace, sin decirle a nadie qué tiene que sentir */
const LECTIO_GUIA=[
 ["Qué es","La Lectio Divina es una forma antigua de rezar con la Biblia: leer la Palabra de Dios despacio y dejar que Él te hable. No es estudiar ni sacar conclusiones: es escuchar."],
 ["Antes de empezar","Buscá un lugar tranquilo y unos 10 o 15 minutos. Dejá el celular en silencio (salvo para leer). Pedí la ayuda del Espíritu Santo con tus palabras o con un «Ven, Espíritu Santo»."],
 ["1 · Leer","Leé el Evangelio sin apuro, si podés dos veces. Fijate qué dice: quiénes están, qué pasa, qué dice Jesús. Todavía no busques nada para vos."],
 ["2 · Meditar","Volvé al texto. Puede ser que una palabra, una escena o un gesto te detenga: quedate ahí y dejá que resuene. Si nada te detiene, también está bien: seguí leyendo con calma."],
 ["3 · Rezar","Ahora hablale a Dios de lo que apareció: agradecé, pedí, contale lo que te pasa. Con tus palabras, como le hablás a alguien que te quiere. Podés escribirlo."],
 ["4 · Contemplar","Quedate en silencio con Él. No hace falta decir ni pensar nada. Es estar, como dos amigos que se quieren y no necesitan hablar."],
 ["Si te distraés","Es normal. Cuando te des cuenta, volvé al texto sin enojarte. No hay respuestas correctas ni un resultado que tengas que lograr."],
 ["Después","Podés llevarte una palabra para el día, o un pequeño gesto concreto si te nace. La Iglesia la recomienda a todos: «Lectio divina» quiere decir «lectura de Dios»."]];
function shLectioGuia(){ return shTop("Cómo hacer la Lectio","Una guía corta")+'<div class="scroll"><div class="steps">'+LECTIO_GUIA.map((x,i)=>'<div class="step on"><i>'+(i+1)+'</i><div><b>'+esc(x[0])+'</b><p>'+esc(x[1])+'</p></div></div>').join("")+'</div></div>'+
   '<button class="primary" data-a="lectioYa">'+(sheet.desde?"Empezar":"Ir a la Lectio")+'</button>'; }
/* borrar datos o cuenta: siempre con una confirmación clara */
function shBorrar(){ const cuenta=sheet.p==="cuenta", local=backend&&backend.mode==="local";
  const t=local?"Borrar los datos de este dispositivo":cuenta?"Borrar mi cuenta":"Borrar mis datos de Daily";
  const txt=local?"Se borra todo lo que guardaste en Daily en este dispositivo: oraciones marcadas, diario, hábitos, tareas, novenas y tu personaje. No se puede deshacer."
   :cuenta?"Se borra tu cuenta de Scaeli y todo lo que guardaste: lo de Daily, lo de Scaeli Fit y tu progreso del juego (es la misma cuenta). No se puede deshacer. Si querés, antes exportá tus datos."
   :"Se borra todo lo que guardaste en Daily (oraciones marcadas, diario, hábitos, tareas, novenas y tu personaje). Tu cuenta sigue, y lo de Scaeli Fit y el juego no se toca. No se puede deshacer.";
  return shTop(t,"Pensalo un momento")+'<div class="scroll"><p class="texto">'+esc(txt)+'</p>'+(sheet.err?'<p class="hint" style="color:var(--rojo,#d66)">'+esc(sheet.err)+'</p>':'')+'</div>'+
   '<div class="grid2"><button class="ghost g" data-a="cerrar">Cancelar</button><button class="primary peligro" data-a="borrarOk"'+(sheet.busy?' disabled':'')+'>'+(sheet.busy?"Borrando…":"Borrar")+'</button></div>'; }
/* pantalla completa (Lectio, Examen, hoja de confesión): una cosa por pantalla, sin menús */
const fullTop=(i,n,t)=>'<div class="ftop"><button class="iconbtn ghost g" data-a="cerrar" aria-label="Salir">'+ic("x")+'</button><div class="fprog">'+Array.from({length:n},(_,k)=>'<i class="'+(k<i?"ya":k===i?"on":"")+'"></i>').join("")+'</div><span class="ft">'+esc(t||"")+'</span></div>';
const fullPie=(atras,sigA,sigTxt,sigP)=>'<div class="fpie">'+(atras?'<button class="lnk" '+atras+'>'+ic("left")+' Atrás</button>':'<span></span>')+'<button class="primary" data-a="'+sigA+'"'+(sigP!=null?' data-p="'+sigP+'"':'')+'>'+sigTxt+'</button></div>';
function shLectio(){ const ev=evHoy, p=sheet.lp||0, d=dayOf(hoy()), cita=ev?citaCorta(ev.evangelio.cita):"", txt=ev?ev.evangelio.texto:"";
  const N=5, nom=["Antes de empezar","Leer","Meditar","Rezar","Contemplar"][p];
  let c="";
  if(p===0) c='<div class="fcen"><div class="fla">Lectio divina</div><h2 class="fh">'+esc(cita)+'</h2><p class="fq">Ven, Espíritu Santo.\nAbrí mis oídos para escuchar tu Palabra.</p><p class="fhint">Buscá un lugar tranquilo. Vamos a leer, meditar, rezar y quedarnos con Él, una cosa por vez.</p><button class="lnk" data-a="lecGuia">¿Cómo se hace?</button></div>';
  else if(p===1) c='<div class="fla">1 · Leer</div><p class="fhint">'+esc(LECTIO_PASOS[0][1])+'</p><h2 class="fh">'+esc(cita)+'</h2><p class="ftexto">'+esc(txt)+'</p>';
  else if(p===2) c='<div class="fla">2 · Meditar</div><p class="fhint">'+esc(LECTIO_PASOS[1][1])+'</p><p class="ftexto suave">'+esc(txt)+'</p>';
  else if(p===3) c='<div class="fla">3 · Rezar</div><p class="fhint">'+esc(LECTIO_PASOS[2][1])+'</p><textarea class="fta" id="lecTxt" placeholder="Jesús, hoy…">'+esc(sheet.ltxt!=null?sheet.ltxt:((d.lec||{}).t||""))+'</textarea>';
  else c='<div class="fcen"><div class="fla">4 · Contemplar</div><div class="respira" aria-hidden="true"></div><p class="fhint">'+esc(LECTIO_PASOS[3][1])+'</p></div>';
  return fullTop(p,N,nom)+'<div class="scroll fcuerpo">'+c+'</div>'+
   fullPie(p>0?'data-a="lecPaso" data-p="-1"':'data-a="evangelio"',p<4?"lecPaso":"lecOk",p===0?"Empezar":p<4?"Seguir":"Amén",p<4?1:null); }


/* el Santo Rosario: intro → 5 decenas (anuncio, Padrenuestro, 10 Avemarías, Gloria y jaculatoria) → Salve → por el Papa → fin */
function rosNuevo(set){ return {set:set||misteriosHoy(),mis:0,fase:"intro",c:0,f:hoy()}; }
async function rosGuardar(r){ rosario=r; await backend.setDoc("daily_settings/rosario",r); renderSheet(); }
const rosEnCurso=()=>!!(sheet&&sheet.view==="rosario"&&rosario&&rosario.f===hoy()&&rosario.fase&&rosario.fase!=="fin"&&rosario.fase!=="intro");
/* ── el Santo Rosario, a pantalla completa: elegís los misterios que quieras, cuando quieras ── */
const ORD_M=["1.er","2.º","3.er","4.º","5.º"], ADJ={gozosos:"gozoso",luminosos:"luminoso",dolorosos:"doloroso",gloriosos:"glorioso"};
const diasMist=k=>MISTERIOS[k].d.map(w=>ROS_DIAS_N[w]).join(" y ");
function rosIntro(act){ const d=dayOf(hoy()), hk=misteriosHoy(), sel=sheet.rset||(act&&act.fase==="intro"&&MISTERIOS[act.set]?act.set:hk), n=d.rn||(d.r?1:0);
  return '<div class="ftop"><button class="iconbtn ghost g" data-a="cerrar" aria-label="Salir">'+ic("x")+'</button><span style="flex:1"></span><span class="ft">'+(n?(n===1?"Hoy rezaste 1 Rosario":"Hoy rezaste "+n+" Rosarios"):"Santo Rosario")+'</span></div>'+
   '<div class="scroll fcuerpo rosin"><div class="fla">Santo Rosario</div><h2 class="fh">¿Qué misterios querés rezar?</h2><p class="fhint">Los de hoy, '+ROS_DIAS_N[new Date().getDay()]+', son los '+esc(MISTERIOS[hk].n.replace("Misterios ","").toLowerCase())+'. Podés rezar los que quieras, todas las veces que quieras.</p>'+
   '<div class="mgrid">'+Object.keys(MISTERIOS).map(k=>'<button class="mcard'+(k===sel?" on":"")+'" data-a="rosElegir" data-p="'+k+'" aria-pressed="'+(k===sel)+'"><img src="'+ilu(k)+'" alt="" loading="lazy"><span class="g"></span><span class="c"><b>'+esc(MISTERIOS[k].n.replace("Misterios ",""))+'</b><small>'+(k===hk?"Los de hoy":esc(diasMist(k)))+'</small></span>'+(k===sel?'<span class="ok">'+ic("check")+'</span>':'')+'</button>').join("")+'</div>'+
   '<ol class="mlist">'+MISTERIOS[sel].m.map(m=>'<li>'+esc(m[0])+'</li>').join("")+'</ol>'+
   '<details class="rprep"><summary>Para empezar: la señal de la cruz y el acto de contrición</summary><p>'+esc(oraTxt("Señal de la cruz"))+'</p><p>'+esc(oraTxt("Acto de contrición"))+'</p></details>'+intHTML()+'</div>'+
   '<div class="fpie"><span></span><button class="primary" data-a="rosEmpezar" data-p="'+sel+'">Empezar</button></div>'; }
function rosAnillo(n,hechos,actual,padre,centro,sub){ const R=104, c=130, pos=k=>{ const ang=(n===10?-60+k*30:[-30,90,210][k])*Math.PI/180; return [c+R*Math.cos(ang),c+R*Math.sin(ang)]; };
  let s='<svg class="anillo" viewBox="0 0 260 260" aria-hidden="true"><circle cx="130" cy="130" r="'+R+'" class="hilo"/>';
  for(let k=0;k<n;k++){ const [x,y]=pos(k), st=k<hechos?"ya":k===actual?"on":""; s+=(st==="on"?'<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="17" class="halo"/>':'')+'<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(st==="on"?10:8)+'" class="cu '+st+'"/>'; }
  s+='<rect x="119" y="'+(c-R-11)+'" width="22" height="22" rx="6" class="cu p '+padre+'"/>'+(padre==="on"?'<rect x="111" y="'+(c-R-19)+'" width="38" height="38" rx="12" class="halo"/>':'');
  return s+'</svg><div class="acentro"><b>'+centro+'</b><span>'+sub+'</span></div>'; }
function shRosario(){ const act=rosario&&rosario.f===hoy()?rosario:null, r=act&&act.fase!=="fin"&&act.fase!=="intro"?act:null; if(!r) return rosIntro(act);
  const M=MISTERIOS[r.set], i=r.mis, mis=M.m[i], med=(ROS_MED[r.set]||[])[i], solo=!!(profile&&profile.rosSolo), fin=r.fase==="salve"||r.fase==="papa";
  const etiqueta=fin?"Para terminar":ORD_M[i]+" misterio "+(ADJ[r.set]||"");
  const top='<div class="ftop"><button class="iconbtn ghost g" data-a="cerrar" aria-label="Salir">'+ic("x")+'</button><div class="fprog">'+[0,1,2,3,4].map(k=>'<i class="'+(k<i||fin?"ya":k===i?"on":"")+'"></i>').join("")+'</div><span class="ft">'+(fin?"Para terminar":"Misterio "+(i+1)+" de 5")+'</span></div>';
  const pie=(der)=>'<div class="fpie"><button class="lnk" data-a="rosAtras">'+ic("left")+' Atrás</button>'+der+'</div>';
  if(r.fase==="anuncio") return top+'<div class="scroll fcuerpo ros2"><div class="rmis"><img src="'+ilu(r.set)+'" alt=""><span class="g"></span><div class="tx"><div class="fla">'+esc(etiqueta)+'</div><h2 class="fh">'+esc(mis[0])+'</h2></div></div>'+
     (med?'<p class="rmed">«'+esc(med[0].replace(/^«|»$/g,""))+'»</p><p class="rcita">'+esc(med[1])+'</p><p class="rfruto"><span>Fruto</span>'+esc(med[2])+'</p>':'<p class="rcita">'+esc(mis[1])+'</p>')+'<p class="fhint">Contemplá la escena un momento, en silencio, antes de empezar.</p></div>'+
     pie('<button class="primary" data-a="rosAv">Comenzar la decena</button>');
  if(r.fase==="salve") return top+'<div class="scroll fcuerpo ros2"><div class="fla">Para terminar</div><h2 class="fh">'+(rosLat()?"Salve, Regina":"Dios te salve, Reina y Madre")+'</h2><p class="rora'+(rosLat()?" lat":"")+'">'+esc(oraTxt("Salve",rosLat()))+'</p></div>'+pie('<button class="primary" data-a="rosAv">Amén</button>');
  let ora, anillo;
  if(r.fase==="papa"){ const c=r.c; ora=c===0?"Padrenuestro":c<=3?"Avemaría":"Gloria"; anillo=rosAnillo(3,c===0?0:Math.min(3,c-1+(c>3?1:0)),c>=1&&c<=3?c-1:-1,c===0?"on":"ya",c>=1&&c<=3?String(c):ora==="Padrenuestro"?ic("cross"):ic("star"),c>=1&&c<=3?"de 3 · Avemaría":ora); }
  else { ora=r.fase==="padre"?"Padrenuestro":r.fase==="ave"?"Avemaría":"Gloria";
    anillo=rosAnillo(10,r.fase==="ave"?r.c-1:r.fase==="gloria"?10:0,r.fase==="ave"?r.c-1:-1,r.fase==="padre"?"on":"ya",r.fase==="ave"?String(r.c):r.fase==="padre"?ic("cross"):ic("star"),r.fase==="ave"?"de 10 · Avemaría":ora); }
  const LBL={Padrenuestro:"Pater noster",Avemaría:"Ave Maria",Gloria:"Gloria Patri"}; if(rosLat()) anillo=anillo.replace(">"+ora+"<",">"+LBL[ora]+"<").replace("· Avemaría","· Ave Maria");
  const lt=rosLat(), texto=solo?'':'<p class="rora'+(lt?" lat":"")+'">'+esc(oraTxt(ora,lt))+'</p>'+(ora==="Gloria"&&r.fase==="gloria"?'<p class="rora jac'+(lt?" lat":"")+'">'+esc(lt?oraTxt("Oración de Fátima",1):ROS_FATIMA)+'</p>':'');
  return top+'<div class="scroll fcuerpo ros2"><div class="rcab">'+(r.fase==="papa"?'Por el Papa y la Iglesia':esc(mis[0]))+'</div>'+
    '<button class="rtap'+(solo?" solo":"")+'" data-a="rosAv" aria-label="Pasar la cuenta">'+anillo+'</button><p class="rhint">Tocá el rosario para pasar la cuenta</p>'+texto+
    '<div class="solo-row"><button class="lnk solo-t" data-a="rosSolo">'+(solo?"Mostrar las oraciones":"Solo el contador")+'</button>'+(solo?'':'<button class="lnk solo-t" data-a="rosLat">'+(lt?"En español":"En latín")+'</button>')+'</div></div>'+
    pie('<button class="lnk" data-a="rosSalir">Seguir después</button>'); }
async function rosAvanzar(){ let r={...(rosario||rosNuevo())}; if(r.f!==hoy()) r=rosNuevo(r.set);
  if(r.fase==="intro") r.fase="anuncio";
  else if(r.fase==="anuncio"){ r.fase="padre"; r.c=0; }
  else if(r.fase==="padre"){ r.fase="ave"; r.c=1; }
  else if(r.fase==="ave"){ if(r.c<10) r.c++; else r.fase="gloria"; }
  else if(r.fase==="gloria"){ if(r.mis<4){ r.mis++; r.fase="anuncio"; r.c=0; } else { r.fase="salve"; } }
  else if(r.fase==="salve"){ r.fase="papa"; r.c=0; }
  else if(r.fase==="papa"){ if(r.c<4) r.c++; else { r.fase="fin"; const dd=dayOf(hoy()), n=(dd.rn||(dd.r?1:0))+1; await setDay(hoy(),{r:1,rn:n,t:Date.now()}); toast(n>1?"Rezaste "+n+" Rosarios hoy":"Rezaste el Santo Rosario",()=>desmarcar("r")); } }
  await rosGuardar(r); if(r.fase==="fin") closeSheet(); }
async function rosAtras(){ let r={...rosario}; if(r.fase==="papa"){ if(r.c>0) r.c--; else r.fase="salve"; } else if(r.fase==="salve"){ r.fase="gloria"; r.mis=4; } else if(r.fase==="ave"){ if(r.c>1) r.c--; else r.fase="padre"; } else if(r.fase==="gloria"){ r.fase="ave"; r.c=10; } else if(r.fase==="padre"){ r.fase="anuncio"; } else if(r.fase==="anuncio"&&r.mis>0){ r.mis--; r.fase="gloria"; } else if(r.fase==="anuncio"){ r.fase="intro"; sheet.rset=r.set; } await rosGuardar(r); }

/* la Liturgia de las Horas */
function shHoras(){ const d=dayOf(hoy()), h=d.h||{}; const ahora=new Date().getHours(); const sug=ahora<9?"laudes":ahora<12?"tercia":ahora<15?"sexta":ahora<18?"nona":ahora<21?"visperas":"completas";
  return shTop("Liturgia de las Horas",cap(fLarga(hoy())))+'<div class="scroll"><div class="sbanner"><img src="'+ilu("horas")+'" alt=""><span class="g"></span></div><div class="list">'+LH_HORAS.map(x=>'<button class="food" data-a="horaLH" data-p="'+x[0]+'"><div><b>'+esc(x[1])+(h[x[0]]?' <span class="ck on mini-ck">'+ic("check")+'</span>':'')+'</b><br><small>'+esc(x[2])+(x[0]===sug?' · ahora':'')+'</small></div>'+ic("right")+'</button>'+(h[x[0]]?'<div class="deslinea">'+desLink("h:"+x[0],"Marcar "+esc(x[1])+" como no rezada")+'</div>':'')).join("")+'</div><p class="hint" style="margin-top:12px">Los textos vienen de liturgiadelashoras.github.io. Si no hay señal, rezá la oración del momento desde Hoy.</p></div><button class="primary ink" data-a="cerrar">Volver</button>'; }
const lhConLeyenda=h=>(h.includes('est c2')?'<div class="lhcoros"><span><i></i>Coro 1</span><span><i class="c2"></i>Coro 2, con sangría</span></div>':'')+h;
function shHoraLH(){ const h=sheet.p, nom=(LH_HORAS.find(x=>x[0]===h)||[])[1]||h; const k=hoy()+"|"+h, t=lhCache[k]; if(t===undefined) lhTraer(h);
  const hecha=!!((dayOf(hoy()).h||{})[h]);
  return shTop(esc(nom),"Liturgia de las Horas")+'<div class="scroll lecturas lh">'+(t===undefined||t===null?'<p class="hint">Trayendo la oración de hoy…</p>':t===""?'<p class="hint">No se pudo traer '+esc(nom)+' de hoy. Probá más tarde, o escribile a Dios con tus palabras.</p><button class="ghost" data-a="orar" data-p="'+(h==="laudes"||h==="oficio"?"manana":"noche")+'" style="margin-top:10px">'+ic("pen")+' Tu oración</button>':lhConLeyenda(lhHTML(t)))+intHTML()+'</div>'+
   '<div class="grid2"><button class="ghost g" data-a="horas">'+ic("left")+' Horas</button>'+(((dayOf(hoy()).h||{})[h])?'<button class="ghost g" data-a="desmarcar" data-p="h:'+h+'">'+ic("x")+' Ya rezada · sacar</button>':'<button class="primary" data-a="lhOk" data-p="'+h+'" style="height:40px;font-size:14px">Amén</button>')+'</div>'; }

/* las oraciones de siempre */
function shOraciones(){ const L=TODAS_ORA(), lat=!!sheet.lat; return shTop("Oraciones","Las de siempre")+'<div class="scroll"><div class="sbanner"><img src="'+ilu("oraciones")+'" alt=""><span class="g"></span></div>'+
  '<div class="seg lat-seg"><button class="'+(lat?"":"on")+'" data-a="oraLat" data-p="0">Español</button><button class="'+(lat?"on":"")+'" data-a="oraLat" data-p="1">Latín</button></div>'+
  '<div class="list">'+L.map((o,i)=>'<button class="food" data-a="oracion" data-p="'+i+'"><div><b>'+esc(lat&&o.la?o.la:o.n)+'</b>'+(o.la?'<br><small>'+esc(lat?o.n:o.la)+'</small>':'')+'</div>'+ic("right")+'</button>').join("")+'</div></div><button class="primary ink" data-a="cerrar">Volver</button>'; }
function shOracion(){ const o=TODAS_ORA()[+sheet.p], lat=!!sheet.lat&&!!(o.lat&&o.lat.length), tx=(lat?o.lat:o.es).join("\n"); return shTop(esc(lat&&o.la?o.la:o.n),o.la?esc(lat?o.n:o.la):"")+'<div class="scroll">'+
  (o.lat&&o.lat.length?'<div class="seg lat-seg"><button class="'+(lat?"":"on")+'" data-a="oraLat" data-p="0">Español</button><button class="'+(lat?"on":"")+'" data-a="oraLat" data-p="1">Latín</button></div>':'')+
  '<div class="pray"><p class="q'+(tx.length>500?' sm':'')+(lat?' lat':'')+'">'+esc(tx)+'</p></div></div><div class="grid2"><button class="ghost g" data-a="oraciones">'+ic("left")+' Todas</button><button class="primary" data-a="cerrar" style="height:40px;font-size:14px">Amén</button></div>'; }

/* las novenas */
/* el último día de la novena en un año: fijo (u, MM-DD) o contado desde Pascua o desde el primer domingo de Adviento (movil) */
function novUlt(n,y){ if(!n.movil) return parse(y+"-"+n.u); const [desde,k]=n.movil;
  if(desde==="pascua") return masDias(pascua(y),k);
  const nav=new Date(y,11,25), adv=masDias(masDias(nav,-(nav.getDay()===0?7:nav.getDay())),-21); return masDias(adv,k); }
function novDias(n){ const d=n.d||9, y=new Date().getFullYear(), h=parse(hoy()); let ult=novUlt(n,y); if(ult<h) ult=novUlt(n,y+1);
  const ini=masDias(ult,-(d-1)); const dia=Math.floor((h-ini)/864e5)+1; return {ini:iso(ini),ult:iso(ult),fin:iso(ult),d,dia,falta:Math.round((ini-h)/864e5)}; }
function novRango(D){ const a=parse(D.ini), b=parse(D.ult); return "Se reza del "+a.getDate()+(a.getMonth()!==b.getMonth()?" de "+MESES[a.getMonth()]:"")+" al "+b.getDate()+" de "+MESES[b.getMonth()]; }
/* el texto de cada novena (novenas/<id>.json): el de Catholic.net, separado por días */
const NOVTXT={};
function novChip(){ setTimeout(()=>{ const c=document.querySelector("#sheet .novdias .on"); if(c) c.parentNode.scrollLeft=c.offsetLeft-c.parentNode.offsetLeft-40; },80); }
function novTexto(id){ if(NOVTXT[id]) return Promise.resolve(NOVTXT[id]); return fetch("novenas/"+id+".json").then(r=>{ if(!r.ok) throw 0; return r.json(); }).then(j=>(NOVTXT[id]=j)); }
function novParrafos(t,tit){ return String(t||"").split(/\n{2,}/).map((p,k)=>{ const s=p.trim(); if(!s) return ""; if(tit&&k===0&&s.length<90&&!/\n/.test(s)) return '<h4 class="nh">'+esc(s.replace(/:$/,""))+'</h4>';
  const corto=s.length<70&&!/\n/.test(s), mayus=corto&&s===s.toUpperCase()&&/[A-ZÁÉÍÓÚÑ]{3}/.test(s), titulo=corto&&(mayus||/:$/.test(s)||/^(d[ií]a|oraci[oó]n|acto|gozos|invocaci[oó]n|preces|antífona|reflexi[oó]n|compromiso)\b/i.test(s));
  if(titulo) return '<h4 class="nh">'+esc(s.replace(/:$/,""))+'</h4>';
  if(/^(V\.|R\.|V\/|R\/|℣|℟)/.test(s)) return '<p class="vr">'+esc(s)+'</p>';
  return '<p>'+esc(s)+'</p>'; }).join(""); }
const ordenSanto=t=>sinTilde(t).replace(/^(san|santa|santo|santos|beato|beata|nuestra senora de(l| la| los)?|la|los|el|maria)\s+/,"");
function shNovenas(){ const mes=hoy().slice(0,7), todas=sheet.todas!==false, q=sinTilde(sheet.q||"").trim(); const T=NOVENAS.map(n=>({...n,...novEstado(n)}));
  const enCurso=T.filter(novEn); let L=todas?T.filter(n=>!novEn(n)).sort((a,b)=>ordenSanto(a.n).localeCompare(ordenSanto(b.n),"es")):T.filter(n=>!novEn(n)&&(n.fin.slice(0,7)===mes||n.ini.slice(0,7)===mes)).sort((a,b)=>a.fin.localeCompare(b.fin));
  if(q) L=T.filter(n=>!novEn(n)&&(sinTilde(n.n).includes(q)||sinTilde(n.t).includes(q))).sort((a,b)=>ordenSanto(a.n).localeCompare(ordenSanto(b.n),"es"));
  const fila=n=>{ const en=novEn(n), h=n.hechos.length;
    return '<button class="food" data-a="novena" data-p="'+n.id+'"><div><b>'+esc(n.n)+'</b><br><small>'+(en?(n.libre?'La empezaste vos · día '+n.dia+' de '+n.d:'En curso · día '+n.dia+' de '+n.d)+(h?' · '+h+' rezados':''):n.falta>0&&n.falta<=60?'Empieza en '+n.falta+' días ('+esc(fLarga(n.ini).replace(/^\w+ /,''))+')':esc(novRango(n)))+'</small></div>'+(en?'<span class="pill on">'+ic("candle")+' Ahora</span>':ic("right"))+'</button>'; };
  return shTop("Novenas",NOVENAS.length+" novenas de Catholic.net, para empezar el día que quieras")+'<div class="scroll"><div class="sbanner"><img src="'+ilu("novenas")+'" alt=""><span class="g"></span></div>'+
   '<input type="search" id="novQ" placeholder="Buscar un santo o una advocación…" value="'+esc(sheet.q||"")+'" style="height:46px;margin-bottom:10px">'+
   (q?'':'<div class="seg" style="margin-bottom:10px"><button data-a="novTodas" data-p="1" aria-pressed="'+todas+'">Todas</button><button data-a="novTodas" data-p="0" aria-pressed="'+!todas+'">Las de '+MESES[new Date().getMonth()]+'</button></div>')+
   (enCurso.length&&!q?'<div class="sect">En curso</div><div class="list">'+enCurso.map(fila).join("")+'</div>':'')+
   (L.length?'<div class="sect">'+(q?"Resultados":todas?"Elegí una":"Por fecha, este mes")+'</div><div class="list">'+L.map(fila).join("")+'</div>':(q?'<p class="empty">No hay una novena con ese nombre. Probá con otra palabra.</p>':enCurso.length?'':'<p class="empty">Este mes no hay novenas por fecha. Tocá «Todas» y empezá la que quieras.</p>'))+
   '</div><button class="primary ink" data-a="cerrar">Volver</button>'; }
function shNovena(){ const n=NOVENAS.find(x=>x.id===sheet.p); if(!n) return shTop("Novena")+'<p class="hint">Esta novena ya no está en la app.</p><button class="primary ink" data-a="novenas">Novenas</button>';
  const D=novEstado(n), hechos=D.hechos, en=novEn(D), T=NOVTXT[n.id];
  if(!T){ novTexto(n.id).then(()=>{ if(sheet&&sheet.view==="novena"){ renderSheet(); novChip(); } }).catch(()=>{ if(sheet){ sheet.err=1; renderSheet(); } }); }
  const ver=sheet.vd||(en?D.dia:1), nd=T?T.dias.length:0;
  const cuerpo=!T?'<p class="hint">'+(sheet.err?'No se pudo abrir el texto. Revisá la conexión.':'Abriendo…')+'</p>':
   (nd?(T.intro?'<details class="novtodos"'+(sheet.cerrarTodos?'':' open')+'><summary>Para todos los días</summary><div class="novtx">'+novParrafos(T.intro)+'</div></details>':'')+'<div class="novtx">'+novParrafos(T.dias[Math.min(nd,ver)-1],1)+'</div>'
     :'<div class="novtx">'+novParrafos(T.intro)+'</div>');
  const fuente='<p class="novsrc">'+(n.por?'Por '+esc(n.por)+' · ':'')+'Fuente: '+esc(n.fuente)+' · <a href="'+esc(n.url)+'" target="_blank" rel="noopener">Catholic.net</a></p>';
  const chips=nd>1?'<div class="chips novdias">'+T.dias.map((x,k)=>'<button data-a="novVer" data-p="'+(k+1)+'"'+(k+1===ver?' class="on"':'')+'>'+(hechos.includes(k+1)?ic("check"):'')+'Día '+(k+1)+'</button>').join("")+'</div>':'';
  const desNov=hechos.includes(ver)?'<p class="hint" style="margin:4px 0 8px">Día '+ver+' rezado · <button class="lnk des" data-a="novDes" data-p="'+n.id+'|'+ver+'">'+ic("x")+' Desmarcar</button></p>':'';
  const aviso=(en?'<div class="la">'+(D.libre?'La empezaste vos':'En curso')+' · hoy es el día '+D.dia+' de '+D.d+(ver!==D.dia?' · estás viendo el día '+ver:'')+'</div>'
    :'<p class="hint">'+(hechos.length>=D.d&&!D.libre&&D.falta>300?'Ya la rezaste completa. ':'')+esc(novRango(D))+(D.falta>0&&D.falta<=60?': faltan '+D.falta+' días y te la recordamos en Hoy.':'.')+' También podés empezarla hoy y rezarla '+(D.d===10?'diez':'nueve')+' días seguidos.</p>')+desNov;
  return shTop(esc(n.n),esc(n.t))+'<div class="scroll">'+aviso+chips+cuerpo+intHTML()+'<div class="beads" style="margin:16px 0 6px">'+Array.from({length:D.d},(x,k)=>'<i class="'+(hechos.includes(k+1)?"on":"")+'"></i>').join("")+'</div>'+fuente+'</div>'+
   '<div class="grid2"><button class="ghost g" data-a="novenas">'+ic("left")+' Novenas</button>'+(en?(D.hoyYa?'<button class="ghost g" data-a="cerrar">Hoy ya rezada</button>':'<button class="primary" data-a="novOk" data-p="'+n.id+'|'+D.dia+'" style="height:40px;font-size:14px">Amén · día '+D.dia+'</button>'):'<button class="primary" data-a="novEmpezar" data-p="'+n.id+'" style="height:40px;font-size:14px">Empezar hoy</button>')+'</div>'; }

/* el examen de conciencia: cinco pasos */
const VICIOS=["Impaciencia","Vanidad","Mentira","Crítica","Desobediencia","Egoísmo"];
function shExamen(){ const ex=sheet.ex||{p:0,no:[],prop:"",gracias:""}; sheet.ex=ex; const P=PASOS_EXAMEN[ex.p];
  let c='<div class="fla">'+(ex.p+1)+' · '+esc(P[0])+'</div><p class="fhint">'+esc(P[1])+'</p>';
  if(ex.p===0) c+=(dayOf(hoy()).x?'<p class="fhint">'+desLink("x","Hoy ya está marcado como hecho · sacar la marca")+'</p>':'')+'<p class="fq">'+esc(EX9_LUZ)+'</p><label class="f">Hoy le doy gracias por…<input type="text" data-ex="gracias" value="'+esc(ex.gracias)+'" placeholder="Una cosa concreta"></label>';
  else if(ex.p===1) c+='<p class="fq">Ven, Espíritu Santo, llená mi corazón y encendé en él el fuego de tu amor.</p><p class="fhint">Mirá el día como lo ve Dios: sin excusas y sin angustia.</p>';
  else if(ex.p===2) c+='<p class="fq">¿Dónde estuvo Dios hoy?\n¿Dónde lo esquivé?</p><p class="fhint">Repasá el día con calma: la mañana, la tarde, la noche. Las personas con las que estuviste.</p>';
  else if(ex.p===3) c+='<p class="fq">¿Dónde le dije que no?</p><div class="sect">Los siete pecados capitales</div><div class="hq cap">'+CAPITALES.map(v=>{ const on=ex.no.includes(v.n); return '<button data-a="exNo" data-p="'+v.n+'" class="'+(on?"on":"")+'"><span class="cb">'+(on?ic("check"):"")+'</span><span><b>'+esc(v.n)+'</b> · '+esc(v.q[0].replace(/^¿|\?$/g,""))+'<small>'+esc(v.s)+'</small></span></button>'; }).join("")+'</div>'+
    '<div class="sect">Otras cosas</div><div class="chips">'+VICIOS.filter(v=>!CAPITALES.some(c=>c.n===v)).map(v=>'<button data-a="exNo" data-p="'+v+'" class="'+(ex.no.includes(v)?"on":"")+'">'+v+'</button>').join("")+'</div><p class="fq sm">'+esc(oraTxt("Acto de contrición"))+'</p>';
  else c+='<label class="f">Mañana, una sola cosa<input type="text" data-ex="prop" value="'+esc(ex.prop)+'" placeholder="Levantarme a la primera alarma"></label><p class="fq">'+esc(EX9_GRACIAS)+'</p>';
  return fullTop(ex.p,PASOS_EXAMEN.length,"Examen del día")+'<div class="scroll fcuerpo">'+c+(ex.p===0?'<button class="lnk" data-a="exConf">Prepararme para confesarme</button>':'')+'</div>'+
   fullPie(ex.p>0?'data-a="exPaso" data-p="-1"':null,ex.p<4?"exPaso":"exOk",ex.p<4?"Seguir":"Amén",ex.p<4?1:null); }

/* el examen para confesarse: pantalla completa, mandamiento por mandamiento; al final, la hoja para llevar.
   La hoja queda solo en este teléfono (no se sube a la cuenta) y se borra con un toque. */
const HOJA_K="daily_hoja";
function hojaLeer(){ let h; try{ h=JSON.parse(localStorage.getItem(HOJA_K)||"null")||{m:{},n:{},u:""}; }catch(e){ h={m:{},n:{},u:""}; }
  /* las hojas de antes se guardaban por número de mandamiento: pasan a guardarse por nombre */
  for(const g of ["m","n"]) for(const k of Object.keys(h[g]||{})) if(/^\d+$/.test(k)&&CONFESION[+k]){ h[g][CONFESION[+k].n]=h[g][k]; delete h[g][k]; }
  return h; }
const exLista=()=>{ const ni=sheet&&sheet.ninos, modo=(sheet&&sheet.modo)||"vida", M=ni?CONFESION_N:CONFESION, C=ni?CAPITALES_N:CAPITALES, V=ni?CONFESION_N:VIDA; return modo==="man"?M:modo==="cap"?C:V; };
function hojaGuardar(h){ try{ localStorage.setItem(HOJA_K,JSON.stringify(h)); }catch(e){} }
function hojaVacia(h){ return !Object.values(h.m||{}).some(a=>a&&a.length)&&!Object.values(h.n||{}).some(t=>String(t||"").trim()); }
function shExConf(){ const L=exLista(), h=sheet.h, p=sheet.p, N=L.length+2, modo=sheet.modo||"vida";
  if(p===0) return fullTop(0,N,"Para confesarme")+'<div class="scroll fcuerpo"><div class="fcen"><div class="fla">Antes de empezar</div><h2 class="fh">Examen de conciencia</h2><p class="fq">Ven, Espíritu Santo.\nMostrame mi vida como Vos la ves, con verdad y con misericordia.</p><p class="fhint">No se trata de buscar errores por buscar ni de sentir culpa por todo: es mirar tu vida delante de Dios con sinceridad. Tocá las preguntas que te tocan y escribí con tus palabras lo que quieras recordar. Al final te queda una hoja para llevar a la confesión.</p><p class="fhint chico">'+ic("lock")+' La hoja queda solo en este teléfono: no se guarda en tu cuenta ni la ve nadie. La podés borrar cuando quieras.</p>'+
   '<div class="seg" style="margin-top:6px"><button data-a="confNinosF" data-p="0" aria-pressed="'+!sheet.ninos+'">Jóvenes y adultos</button><button data-a="confNinosF" data-p="1" aria-pressed="'+!!sheet.ninos+'">Chicos</button></div>'+
   '<div class="sect" style="margin-top:6px">Examen por</div><div class="seg"><button data-a="confModo" data-p="vida" aria-pressed="'+(modo==="vida")+'">Mi vida</button><button data-a="confModo" data-p="man" aria-pressed="'+(modo==="man")+'">Mandamientos</button><button data-a="confModo" data-p="cap" aria-pressed="'+(modo==="cap")+'">Capitales</button></div>'+
   '<label class="f" style="margin-top:8px">Mi última confesión fue hace…<input type="text" id="hojaU" value="'+esc(h.u||"")+'" placeholder="Por ejemplo: dos meses"></label></div></div>'+fullPie(null,"hojaPaso","Empezar",1);
  if(p<=L.length){ const c=L[p-1], k=c.n, m=h.m[k]||[];
    return fullTop(p,N,c.n)+'<div class="scroll fcuerpo"><div class="fla">'+esc(c.n)+'</div><h2 class="fh">'+esc(c.s)+'</h2>'+(c.d?'<p class="fhint">'+esc(c.d)+'</p>':'')+'<div class="hq">'+c.q.map((q,i)=>'<button data-a="hojaQ" data-p="'+i+'" class="'+(m.includes(i)?"on":"")+'"><span class="cb">'+(m.includes(i)?ic("check"):"")+'</span><span>'+esc(q)+'</span></button>').join("")+'</div>'+
     '<label class="f">Con mis palabras<textarea class="fta chico" id="hojaN" placeholder="Lo que quiero decir en la confesión">'+esc(h.n[k]||"")+'</textarea></label></div>'+fullPie('data-a="hojaPaso" data-p="-1"',"hojaPaso","Seguir",1); }
  const items=L.map(c=>({c,m:(h.m[c.n]||[]).map(i=>c.q[i]).filter(Boolean),n:String(h.n[c.n]||"").trim()})).filter(x=>x.m.length||x.n);
  return fullTop(N-1,N,"Tu hoja")+'<div class="scroll fcuerpo"><div class="hoja"><div class="fla">Para confesarme</div>'+(h.u?'<p class="hint">Mi última confesión: hace '+esc(h.u)+'.</p>':'')+
   (items.length?'<p class="hint">'+esc(CONF_CIERRE.nota)+'</p>'+items.map(x=>'<div class="hoja-g"><b>'+esc(x.c.n)+'</b>'+x.m.map(q=>'<p>· '+esc(q.replace(/^¿|\?$/g,""))+'</p>').join("")+(x.n?'<p class="mia">'+esc(x.n)+'</p>':'')+'</div>').join(""):'<p class="hint">No marcaste nada. Si querés, volvé atrás y repasá con calma.</p>')+
   '<div class="hoja-g"><b>Cómo es la confesión</b><p>Saludá al sacerdote y hacé la señal de la cruz. Decí cuánto hace de tu última confesión y tus pecados, con claridad. Escuchá el consejo y la penitencia. Rezá el acto de contrición y recibí la absolución.</p></div>'+
   '<div class="hoja-g"><b>Acto de contrición</b><p>'+esc(oraTxt("Acto de contrición"))+'</p></div>'+
   '<div class="hoja-g"><b>Para terminar</b><p>'+esc(CONF_CIERRE.oracion)+'</p><p class="hint">'+esc(CONF_CIERRE.recorda)+'</p></div></div>'+
   '<button class="lnk peligro-t" data-a="hojaBorrar">Borrar la hoja</button></div>'+fullPie('data-a="hojaPaso" data-p="-1"',"cerrar","Listo"); }
function hojaNotas(){ if(!sheet||!sheet.h) return; const t=$("#hojaN"), u=$("#hojaU"), c=exLista()[sheet.p-1]; if(t&&c) sheet.h.n[c.n]=t.value; if(u) sheet.h.u=u.value.trim(); hojaGuardar(sheet.h); }
function shConfesion(){ const ninos=!!sheet.ninos, L=ninos?CONFESION_N:CONFESION;
  return shTop("Confesión","Los pasos y el examen")+'<div class="scroll"><div class="sbanner"><img src="'+ilu("confesion")+'" alt=""><span class="g"></span></div><div class="steps">'+PASOS_CONFESION.map((x,i)=>'<div class="step on"><i>'+(i+1)+'</i><div><b>'+esc(x[0])+'</b><p>'+esc(x[1])+'</p></div></div>').join("")+'</div>'+
   '<button class="primary" data-a="exConf" style="margin-top:14px">'+ic("pen")+' Hacer mi examen y armar la hoja</button>'+(dayOf(hoy()).cj?'<p class="hint" style="text-align:center;margin:10px 0 0">Hoy te confesaste: el ánimo volvió a 100. '+desLink("cj","Sacar la marca")+'</p>':'<button class="ghost g" data-a="confHoy" style="margin:10px auto 0;display:flex">'+ic("heart")+' Hoy me confesé</button>')+'<p class="hint" style="text-align:center;margin:6px 0 0">Pantalla completa, sin distracciones. La hoja queda solo en este teléfono.</p>'+
   '<p class="hint" style="margin-top:16px;font-style:italic">'+esc(CONF_CIERRE.cita)+'</p><div class="sect" style="margin-top:12px">Examen</div><div class="seg" style="margin:8px 0"><button data-a="confNinos" data-p="0" aria-pressed="'+!ninos+'">Jóvenes y adultos</button><button data-a="confNinos" data-p="1" aria-pressed="'+ninos+'">Chicos</button></div>'+
   (ninos?'':'<div class="sect" style="margin-top:12px">Por áreas de mi vida</div>'+VIDA.map(c=>'<details><summary><b>'+esc(c.n)+'</b> <small class="muted">'+esc(c.s)+'</small></summary><p class="texto chico">'+c.q.map(esc).join("<br>")+'</p></details>').join(""))+
   '<div class="sect" style="margin-top:16px">'+(ninos?'Con Dios, con los demás y conmigo':'Por mandamientos')+'</div>'+L.map(c=>'<details><summary><b>'+esc(c.n)+'</b> <small class="muted">'+esc(c.s)+'</small></summary><p class="texto chico">'+c.q.map(esc).join("<br>")+'</p></details>').join("")+
   '<div class="sect" style="margin-top:16px">Por pecados capitales</div>'+(ninos?CAPITALES_N:CAPITALES).map(c=>'<details><summary><b>'+esc(c.n)+'</b> <small class="muted">'+esc(c.s)+'</small></summary><p class="texto chico">'+(c.d?'<i>'+esc(c.d)+'</i><br>':'')+c.q.map(esc).join("<br>")+'</p></details>').join("")+
   '<div class="sect" style="margin-top:16px">Para decir al confesarte</div><p class="texto chico">'+esc(oraTxt("Yo confieso"))+'</p><div class="sect">Acto de contrición</div><p class="texto chico">'+esc(oraTxt("Acto de contrición"))+'</p></div><button class="primary ink" data-a="cerrar">Volver</button>'; }
/* ── la Misa de hoy: guía del celebrante (calendario de la Argentina, data/ordo/AAAA.json, de GCatholic.org) ── */
const ORDO={}, ordoCarga={};
function ordoDia(f){ const y=f.slice(0,4); if(ORDO[y]) return ORDO[y][f.slice(5)]||null;
  if(!ordoCarga[y]) ordoCarga[y]=fetch("data/ordo/"+y+".json").then(r=>{ if(!r.ok) throw 0; return r.json(); }).then(j=>{ ORDO[y]=j; if(sheet&&sheet.view==="misa") renderSheet(); }).catch(()=>{ ORDO[y]={}; if(sheet&&sheet.view==="misa") renderSheet(); });
  return undefined; }
const COLOR_LIT={w:["Blanco","#EDE7D6"],r:["Rojo","#B0302C"],g:["Verde","#3F7A4F"],v:["Morado","#6A4C93"],p:["Rosa","#D98BA6"],b:["Negro","#1A1A1A"]};
const GRADO={S:"Solemnidad",F:"Fiesta",M:"Memoria obligatoria",m:"Memoria libre",c:"Conmemoración"};
function cicloDe(f){ const d=parse(f), y=d.getFullYear(), nav=new Date(y,11,25), adv=masDias(masDias(nav,-(nav.getDay()===0?7:nav.getDay())),-21), ly=d>=adv?y+1:y;
  return {dom:["C","A","B"][ly%3], fer:ly%2?"I":"II"}; }
function misaGuia(f,O){ const d=parse(f), dow=d.getDay(), T=tiempoLit(d).n, y=d.getFullYear(), P=pascua(y), dP=Math.round((d-P)/864e5);
  const c0=O.c[0]||["","g",""], nom=c0[2], g=c0[0], dom=dow===0&&!g||/Domingo/.test(nom), solem=g==="S", fiesta=g==="F", memo=g==="M";
  const libres=O.c.slice(1).filter(x=>x[0]==="m"||x[0]===""||x[0]==="c");
  const mmdd=f.slice(5), ndc=dP>=0&&dP<=7, ocNav=(mmdd>="12-25"||mmdd==="01-01"), cuaresma=T==="Cuaresma", adv=T==="Adviento";
  const R=[], N=[];
  const ceniza=dP===-46, ramos=dP===-7, jueves=dP===-3, viernes=dP===-2, sabado=dP===-1;
  if(viernes){ N.push("Hoy no se celebra la Misa. A la tarde (cerca de las 15), Celebración de la Pasión del Señor: liturgia de la Palabra con la Pasión según San Juan, oración universal solemne, adoración de la Cruz y comunión con lo reservado el Jueves. Ornamentos rojos."); N.push("Ayuno y abstinencia."); return {R:[],N}; }
  if(sabado){ N.push("Durante el día no se celebra la Misa. La Vigilia Pascual empieza de noche: lucernario, pregón, liturgia de la Palabra (siete lecturas del AT, epístola y Evangelio), liturgia bautismal y liturgia eucarística. Gloria con campanas y Aleluya solemne."); return {R:[],N}; }
  const gloria=solem||fiesta||ndc||(mmdd>="12-25"&&mmdd<="12-31")||mmdd==="01-01"||jueves||(dom&&!adv&&!cuaresma&&!ramos);
  const credo=(dom||solem)&&!jueves;
  R.push(["Gloria",gloria?"Sí":"No"]); R.push(["Credo",credo?"Sí":"No"]);
  R.push(["Antes del Evangelio",cuaresma||ceniza||ramos||jueves?"Aclamación sin Aleluya":"Aleluya"]);
  const sec=dP===0||dP===49?"Secuencia obligatoria":ndc?"Secuencia facultativa":/Cuerpo y la Sangre/.test(nom)?"Secuencia facultativa (Lauda Sion)":/Dolores/.test(nom)?"Secuencia facultativa (Stabat Mater)":"";
  if(sec) R.push(["Secuencia",sec]);
  // prefacio
  let pref=""; const prop=PREF_PROPIO.find(x=>x[0].test(nom));
  if(prop&&(solem||fiesta||dom||jueves||ramos||/Juan Bautista/.test(nom))) pref=prop[1];
  else if(dom&&cuaresma){ const k=Math.round((d-masDias(P,-42))/864e5/7); pref=k===0?"propio: Las tentaciones del Señor":k===1?"propio: La Transfiguración del Señor":"propio del domingo si se leen los Evangelios del ciclo A (la samaritana, el ciego de nacimiento, Lázaro); si no, Cuaresma I o II"; }
  else if(dP===0||ndc) pref="de Pascua I («en este día» / «en esta octava»)";
  else if(T==="Pascua"&&dP>=39) pref="de Pascua I a V o de la Ascensión I o II";
  else if(T==="Pascua") pref="de Pascua I a V";
  else if(adv) pref=mmdd>="12-17"?"de Adviento II":"de Adviento I";
  else if(ramos) pref="propio: La Pasión del Señor";
  else if(cuaresma&&dP>=-6) pref="de la Pasión del Señor II";
  else if(cuaresma&&dP>=-13) pref="de la Pasión del Señor I";
  else if(cuaresma) pref=ceniza?"de Cuaresma III o IV":"de Cuaresma I a IV";
  else if(T==="Navidad") pref=mmdd>="01-06"&&mmdd<"01-14"?"de la Epifanía o de Navidad I a III":"de Navidad I, II o III";
  else if(solem||fiesta||memo){ pref=(prop&&prop[1])||PREF_SANTOS.find(x=>x[0].test(nom))[1]; }
  else if(dom) pref="dominical del Tiempo Ordinario I a VIII";
  else pref="común I a VI (o, si se celebra una memoria libre, el que le corresponde)";
  R.push(["Prefacio",pref]);
  const propio=/^propio/.test(pref);
  R.push(["Plegaria eucarística",jueves?"I (Canon romano), con los textos propios del Jueves Santo":dom||solem?"I o III"+(propio?"":"; la IV, con su prefacio, en un domingo sin prefacio propio"):cuaresma?"II o III; también la de la Reconciliación I o II":"II o III"+(propio?"":"; la IV, con su prefacio, si no hay prefacio propio")]);
  if(ndc||mmdd>="12-25"&&mmdd<="12-31"||mmdd==="01-01"||/Epifan[ií]a|Ascensi[oó]n|Pentecost[eé]s/.test(nom)) N.push("Con la Plegaria I, se dice el «Reunidos en comunión» propio del día.");
  // notas
  if(ceniza) N.push("Bendición e imposición de la ceniza después de la homilía; no se hace el acto penitencial. Ayuno y abstinencia.");
  if(ramos) N.push("Conmemoración de la entrada del Señor en Jerusalén (procesión o entrada solemne) y lectura de la Pasión. Ornamentos rojos.");
  if(jueves) N.push("Misa vespertina de la Cena del Señor: Gloria con campanas, que después callan hasta la Vigilia; lavatorio de los pies (facultativo); al final, traslado del Santísimo al lugar de la reserva. Ornamentos blancos.");
  if(dP===49) N.push("Pentecostés: termina el tiempo pascual; el cirio pascual se apaga y se lleva al baptisterio.");
  if(ndc||dP===49) N.push("Despedida con doble aleluya.");
  if(mmdd==="11-02") N.push("Cada sacerdote puede celebrar tres Misas hoy. Ornamentos morados (o negros).");
  if(mmdd==="12-25") N.push("Hay cuatro formularios: de la vigilia, de la noche, de la aurora y del día. En el Credo, en «y por obra del Espíritu Santo…», todos se arrodillan.");
  if(/Anunciaci[oó]n/.test(nom)) N.push("En el Credo, en «y por obra del Espíritu Santo…», todos se arrodillan.");
  if(dom&&(adv||cuaresma)&&/Gaudete|Laetare/.test(nom)) N.push("Se puede usar el color rosa.");
  if(adv&&!dom&&!solem) N.push(mmdd>="12-17"?"Del 17 al 24 de diciembre las memorias solo pueden hacerse como conmemoración (la colecta del santo); lo demás, de la feria.":"Las memorias libres se pueden celebrar; el Gloria no se dice.");
  if(cuaresma&&!dom&&!ceniza&&!ramos&&dP<-6) N.push("En Cuaresma las memorias pasan a ser conmemoración: se puede decir la colecta del santo en lugar de la de la feria. Sin flores en el altar y con la música más sobria.");
  if(memo&&!adv&&!cuaresma) N.push("Memoria: la colecta es propia del santo; las demás oraciones pueden tomarse del propio o del común correspondiente, o de la feria.");
  if(!g&&!dom&&T==="Ordinario") N.push("Feria del Tiempo Ordinario: se puede celebrar una memoria libre, una Misa votiva, por diversas necesidades o de difuntos.");
  if(dow===6&&T==="Ordinario"&&libres.some(x=>/Santa Mar[ií]a en s[aá]bado/.test(x[2]))) N.push("Sábado: se puede celebrar la memoria de Santa María en sábado.");
  if(dom||solem) N.push("Homilía obligatoria.");
  else if(adv||cuaresma||T==="Pascua") N.push("Homilía muy recomendada en las ferias de este tiempo.");
  return {R,N,libres,dom,g,nom,color:c0[1]}; }
function shMisa(){ const ev=evHoy, f=hoy(), O=ordoDia(f), C=cicloDe(f);
  const lect=ev&&!ev.respaldo?[["1.ª lectura",ev.primera],["Salmo",ev.salmo],["2.ª lectura",ev.segunda],["Evangelio",ev.evangelio]].filter(x=>x[1]&&x[1].cita):[];
  let guia='<p class="hint">Abriendo el calendario…</p>';
  if(O===null) guia='<p class="hint">El calendario de este año todavía no está en la app.</p>';
  else if(O){ const G=misaGuia(f,O), col=COLOR_LIT[G.color]||COLOR_LIT.g;
    guia='<div class="card misahoy"><div class="eyebrow">'+esc(cap(fLarga(f)))+(O.s?' · Semana '+esc(O.s)+' del salterio':'')+'</div><h3>'+esc(G.nom||"")+'</h3>'+
      '<div class="misachips"><span class="lcol"><i style="background:'+col[1]+'"></i>'+col[0]+'</span>'+(G.g?'<span>'+GRADO[G.g]+'</span>':G.dom?'<span>Domingo</span>':'<span>Feria</span>')+'<span>'+(G.dom||G.g==="S"?'Ciclo '+C.dom:'Año '+C.fer)+'</span></div>'+
      (G.libres&&G.libres.length?'<div class="sect">'+(O.c[0][0]===""&&!G.dom&&/Adviento|Cuaresma/.test(tiempoLit(parse(f)).n)?"Se puede hacer conmemoración de":"También se puede celebrar")+'</div>'+G.libres.map(x=>{ const cc=COLOR_LIT[x[1]]||col; return '<p class="lib"><i style="background:'+cc[1]+'"></i>'+esc(x[2])+(x[0]==="m"?' <small>· memoria libre</small>':'')+'</p>'; }).join(""):'')+'</div>'+
      (G.R.length?'<div class="card rubr"><div class="eyebrow">Qué se dice hoy</div>'+G.R.map(r=>'<div class="rrow"><span>'+esc(r[0])+'</span><b class="'+(r[1]==="No"?"no":r[1]==="Sí"?"si":"")+'">'+esc(r[1])+'</b></div>').join("")+'</div>':'')+
      (lect.length?'<div class="card rubr"><div class="eyebrow">Lecturas</div>'+lect.map(x=>'<div class="rrow"><span>'+x[0]+'</span><b>'+esc(citaCorta(x[1].cita))+'</b></div>').join("")+'</div>':'')+
      (G.N.length?'<div class="card"><div class="eyebrow">Para tener en cuenta</div><ul class="notas">'+G.N.map(n=>'<li>'+esc(n)+'</li>').join("")+'</ul></div>':''); }
  const ord='<div class="sect" style="margin-top:18px">El Ordinario de la Misa, paso a paso</div><p class="hint" style="margin:4px 0 8px">Ritos, gestos y posturas, según la Ordenación General del Misal Romano. Los textos están en el Misal.</p>'+
    MISA_ORDINARIO.map(p=>p[1]===null?'<div class="ordp">'+esc(p[0])+'</div>':'<details class="ord"><summary><b>'+esc(p[0])+'</b><small>'+esc(p[2])+'</small></summary><p><span class="ql">Sacerdote</span>'+esc(p[1])+'</p><p><span class="ql">Fieles</span>'+esc(p[2])+'</p>'+(p[3]?'<p class="nota">'+esc(p[3])+'</p>':'')+'</details>').join("");
  const textos=lect.length?'<div class="sect" style="margin-top:18px">Las lecturas completas</div>'+lect.map(x=>'<details class="ord"><summary><b>'+x[0]+'</b><small>'+esc(citaCorta(x[1].cita))+'</small></summary><p class="lecttx">'+esc(x[1].texto)+'</p></details>').join(""):'';
  return shTop("La Misa de hoy","Guía del celebrante")+'<div class="scroll lecturas misa">'+guia+textos+ord+'<p class="novsrc">Calendario de la Argentina: GCatholic.org · Lecturas: evangeliodeldia.org</p></div>'+(dayOf(hoy()).misa?'<button class="primary ok" data-a="desmarcar" data-p="misa">'+ic("x")+' Fui a Misa hoy · sacar la marca</button>':'<button class="primary" data-a="misaOk">Fui a Misa hoy</button>'); }

/* ── login ── */
function renderLogin(){ $("#nav").hidden=true;
  $("#app").innerHTML='<div class="login"><h1 class="logo"><img src="icons/icon-512.png" alt=""><span class="lnom">Scaeli <small>Daily</small></span></h1><p class="hint" style="font-size:15px;margin-top:-10px">Rezar todos los días.</p>'+
   '<p style="margin:0;font-size:19px;font-weight:300;line-height:1.4;max-width:30ch">El Evangelio, el Rosario, las Horas y el examen del día. Tu semana con Dios, guardada en tu cuenta.</p>'+
   '<div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:340px">'+(plataforma()!=="android"?'<button class="entrar apple" id="loginApple" data-q="apple">'+LOGO_APPLE+'<span>Continuar con Apple</span></button>':'')+'<button class="entrar google" id="login" data-q="google">'+LOGO_GOOGLE+'<span>Continuar con Google</span></button><button class="ghost g" id="invitado" style="justify-content:center;height:48px;margin-top:4px">Probar sin cuenta</button></div>'+
   '<p class="hint" id="status">'+esc(statusTxt||"La misma cuenta que Scaeli Fit y el juego. Nada es público.")+'</p><p class="hint"><a href="privacidad.html" target="_blank" rel="noopener">Política de privacidad</a></p></div>'; }
function startSession(u,local){ user=u; unsubs.forEach(f=>{try{f()}catch(e){}}); unsubs=[];
  backend=local?localBackend():userBackend(u.uid,e=>{ if(e&&e.code==="permission-denied") setStatus("La base de datos rechazó la operación: hay que publicar firestore.rules.",true); else setStatus("Sin conexión: los cambios se guardan y se sincronizan después."); });
  setStatus(local?"Guardado solo en este dispositivo":"Sincronizado · "+(u.displayName||u.email||"")); $("#nav").hidden=false;
  const w=(fn)=>{ const un=fn(); if(typeof un==="function") unsubs.push(un); };
  w(()=>backend.watchCol("daily_days",L=>{ days={}; L.forEach(d=>{ const {id,...r}=d; days[id]=r; }); render(); grupoSync(); nivelAviso(); }));
  w(()=>backend.watchDoc("daily_settings/profile",p=>{ profile=p||{}; render(); if(sheet&&sheet.view==="rosario") renderSheet(); grupoSync(); }));
  w(()=>backend.watchDoc("daily_settings/recordatorios",r=>{ if(r) recordatorios=r; programarAvisos(); if(view==="mas") render(); }));
  w(()=>backend.watchDoc("daily_settings/intents",v=>{ intents=(v&&v.list)||[]; render(); }));
  w(()=>backend.watchDoc("daily_settings/rosario",r=>{ rosario=r||null; if(sheet&&sheet.view==="rosario") renderSheet(); }));
  w(()=>backend.watchCol("daily_novenas",L=>{ novenas=L; if(sheet&&/novena/.test(sheet.view)) renderSheet(); }));
  w(()=>backend.watchDoc("daily_settings/propositos",v=>{ propositos=(v&&v.list)||[]; if(view==="dia") render(); }));
  grupoBE=local?gruposLocal("local"):gruposBackend(u.uid); grupoCerrar(); plusBE=local?null:plusBackend(u.uid); plusDoc=null; w(()=>plusEscuchar());
  w(()=>backend.watchDoc("daily_settings/grupo",v=>{ const gid=v&&v.gid||null; if(gid!==grupo.gid) grupoAbrir(gid); else if(!gid) render(); }));
  w(()=>backend.watchDoc("daily_settings/rutina",v=>{ rutina={diarias:(v&&v.diarias)||[],habitos:(v&&v.habitos)||[]}; if(view==="dia"||view==="hoy") render(); if(sheet&&sheet.view==="progreso") renderSheetQuieto(); grupoSync(); }));
  ready=true; render(); cargarEvangelio(); plusRefrescar().catch(()=>{});
  const inv=lsGet("daily_grupo_inv"); if(inv){ if(local) setTimeout(()=>openSheet({view:"grupo"}),300); else setTimeout(()=>openSheet({view:"grupo",m:"codigo",inv}),300); } }
function endSession(){ nivelAntes=null; plusBE=null; plusDoc=null; grupoCerrar(); grupoBE=null; user=null; backend=null; ready=false; unsubs.forEach(f=>{try{f()}catch(e){}}); unsubs=[]; days={}; profile=null; intents=[]; rosario=null; novenas=[]; propositos=[]; rutina={diarias:[],habitos:[]}; sheet=null; $("#scrim").hidden=true; $("#sheet").hidden=true; renderLogin(); }

/* ── recordatorios (mientras la app esté abierta o instalada) ── */
let avisosT=[];
function programarAvisos(){ avisosT.forEach(clearTimeout); avisosT=[];
  if(esNativo()){ programarAvisosNativos(recordatorios,propositos); return; }
  if(!recordatorios.on||!("Notification" in window)||Notification.permission!=="granted") return;
  [["m",recordatorios.m,"Oración de la mañana","Señor, en tus manos pongo este día."],["n",recordatorios.n,"Oración de la noche","Dos minutos para dejar el día en manos de Dios."]].forEach(([k,hm,t,b])=>{ if(!hm) return; const [h,m]=hm.split(":").map(Number); const d=new Date(); d.setHours(h,m,0,0); if(d<=new Date()) d.setDate(d.getDate()+1);
    avisosT.push(setTimeout(()=>{ try{ new Notification(t,{body:b,icon:"icons/icon-192.png"}); }catch(e){} programarAvisos(); },d-new Date())); });
  propositos.filter(p=>!p.ok&&p.f===hoy()&&p.hr).forEach(p=>{ const [h,m]=p.hr.split(":").map(Number); const d=new Date(); d.setHours(h,m,0,0); if(d>new Date()) avisosT.push(setTimeout(()=>{ try{ new Notification(p.t,{body:"Tarea de hoy · "+p.hr,icon:"icons/icon-192.png"}); }catch(e){} },d-new Date())); }); }

/* ── exportar / importar ── */
const COLS=["daily_days","daily_settings","daily_novenas"];
async function exportar(){ const dump=await backend.exportAll(COLS); const b=new Blob([JSON.stringify({app:"scaeli-daily",v:VERSION,fecha:iso(),datos:dump},null,1)],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download="scaeli-daily-"+iso()+".json"; a.click(); toast("Exportado"); }
async function importar(file){ try{ const j=JSON.parse(await file.text()); const n=await backend.importAll(j.datos||j); toast("Importados "+n+" registros"); }catch(e){ toast("No se pudo importar ese archivo"); } }

/* ── acciones ── */
const ACC={
  hora(p){ p=p||momento(); if(p==="mediodia") openSheet({view:"hora",p}); else if(p==="tarde") ACC.evangelio(); else ACC.orar(p); }, "hora:manana"(){ ACC.orar("manana"); }, "hora:noche"(){ ACC.orar("noche"); },
  orar(p){ openSheet({view:"orar",p:p==="noche"||p==="n"?"noche":p==="manana"||p==="m"?"manana":(momento()==="noche"||momento()==="tarde"?"noche":"manana"),full:1}); },
  async orGuardar(){ const k=sheet.p==="noche"?"n":"m", t=String((($("#orTxt")||{}).value)||sheet.otxt||"").trim(), d=dayOf(hoy()), or={...(d.or||{})};
    if(t) or[k]=t; else delete or[k]; await setDay(hoy(),{[k]:1,or,t:Date.now()}); closeSheet(); amenToast(k,t?"Amén · quedó en tus oraciones":"Amén"); },
  misOraciones(){ openSheet({view:"misOraciones"}); },
  async orBorrar(p){ const [f,k]=String(p).split("|"); if(!(await confirmar("¿Borrar esta oración?","Se borra de tu historial y no se puede recuperar.","Borrar"))) return; const d=dayOf(f);
    if(k==="lec"){ await setDay(f,{lec:{...(d.lec||{}),t:""},t:Date.now()}); } else { const or={...(d.or||{})}; delete or[k]; await setDay(f,{or,t:Date.now()}); } toast("Oración borrada"); },
  async horaOk(p){ await marcar(p); closeSheet(); amenToast(p); },
  async desmarcar(p){ await desmarcar(String(p)); toast("Marca sacada"); if(sheet) renderSheetQuieto(); },
  evangelio(){ openSheet({view:"evangelio"}); }, async evOk(){ await marcar("e"); closeSheet(); amenToast("e"); },
  lectio(){ let vista=false; try{ vista=localStorage.getItem("daily_lecguia")==="1"; localStorage.setItem("daily_lecguia","1"); }catch(e){}
    openSheet(vista?{view:"lectio",lp:0,full:1}:{view:"lectioGuia",desde:1}); },
  lecGuia(){ openSheet({view:"lectioGuia"}); }, lectioYa(){ openSheet({view:"lectio",lp:0,full:1}); }, lecPaso(p){ const t=$("#lecTxt"); if(t) sheet.ltxt=t.value; sheet.lp=Math.max(0,Math.min(4,(sheet.lp||0)+(+p))); renderSheet(); },
  async lecOk(){ const t=($("#lecTxt")||{}).value||sheet.ltxt||""; await setDay(hoy(),{e:1,lec:{t:t.trim()},t:Date.now()}); closeSheet(); amenToast("e"); },
  santo(p){ openSheet({view:"santo",p:p||hoy().slice(5)}); }, async santoOk(){ const hoyS=sheet&&sheet.p===hoy().slice(5); if(hoyS) await marcar("s"); closeSheet(); if(hoyS) amenToast("s"); },
  santoral(){ const q=sheet&&sheet.view==="santo"&&sheet.desde?sheet.desde:{q:"",m:new Date().getMonth()}; openSheet({view:"santoral",...q}); }, salMes(p){ sheet.m=+p; renderSheet(); },
  salVer(p){ openSheet({view:"santo",p,desde:{q:sheet.q,m:sheet.m}}); },
  rosario(){ openSheet({view:"rosario",full:1}); }, rosElegir(p){ if(MISTERIOS[p]){ sheet.rset=p; renderSheet(); } }, async rosSet(p){ ACC.rosElegir(p); },
  async rosEmpezar(p){ const set=MISTERIOS[p]?p:(sheet.rset||misteriosHoy()); const r=rosNuevo(set); r.fase="anuncio"; await rosGuardar(r); },
  rosAv(){ rosAvanzar(); }, rosAtras(){ rosAtras(); },
  async rosCero(){ sheet.rset=rosario&&rosario.set; await rosGuardar(rosNuevo(rosario&&rosario.set)); },
  async rosLat(){ await backend.setDoc("daily_settings/profile",{...(profile||{}),rosLat:!rosLat()}); renderSheet(); },
  async rosSolo(){ await backend.setDoc("daily_settings/profile",{...(profile||{}),rosSolo:!(profile&&profile.rosSolo)}); renderSheet(); },
  horas(){ openSheet({view:"horas"}); }, horaLH(p){ openSheet({view:"hora_lh",p}); }, async lhOk(p){ const d=dayOf(hoy()); await setDay(hoy(),{h:{...(d.h||{}),[p]:1},t:Date.now()}); closeSheet(); amenToast("h:"+p); },
  oraciones(){ openSheet({view:"oraciones",lat:sheet&&sheet.lat?1:0}); }, oracion(p){ openSheet({view:"oracion",p,lat:sheet&&sheet.lat?1:0}); }, oraLat(p){ sheet.lat=+p; renderSheet(); },
  novenas(){ openSheet({view:"novenas"}); }, novena(p){ openSheet({view:"novena",p}); novChip(); }, novVer(p){ sheet.vd=+p; sheet.cerrarTodos=1; renderSheet(); novChip(); },
  async novOk(p){ const [id,dia]=p.split("|"); const mia=novenas.find(x=>x.id===id)||{}; const dias=Array.from(new Set([...(mia.dias||[]),+dia])).sort((a,b)=>a-b);
    const N=NOVENAS.find(x=>x.id===id)||{d:9}; const doc={ini:mia.ini||hoy(),dias,ult:hoy(),t:Date.now()}; if(mia.libre){ doc.libre=dias.length<(N.d||9)?1:0; } await backend.setDoc("daily_novenas/"+id,doc); await marcar("nov"); closeSheet(); toast(dias.length>=(N.d||9)?(N.d===10?"Decenario completo":"Novena completa"):"Amén · día "+dia,()=>ACC.novDes(id+"|"+dia+"|1")); },
  async novDes(p){ const [id,dia,sin]=String(p).split("|"); if(!sin&&!(await confirmar("¿Desmarcar el día "+dia+"?","Queda como no rezado; lo podés volver a marcar.","Desmarcar"))) return; const mia=novenas.find(x=>x.id===id)||{}; const dias=(mia.dias||[]).filter(x=>x!==+dia); const N=NOVENAS.find(x=>x.id===id)||{d:9};
    const doc={...mia,dias,t:Date.now()}; delete doc.id; if(doc.ult===hoy()&&+dia===(mia.dias||[]).length) doc.ult=addDays(hoy(),-1); if(mia.libre!==undefined) doc.libre=dias.length<(N.d||9)?1:0; await backend.setDoc("daily_novenas/"+id,doc); if(!dias.length&&!mia.libre){ /* sin días no hace falta el doc */ } toast("Día "+dia+" desmarcado"); if(sheet&&sheet.view==="novena") renderSheetQuieto(); },
  novTodas(p){ sheet.todas=p==="1"; renderSheet(); },
  async novEmpezar(id){ await backend.setDoc("daily_novenas/"+id,{ini:hoy(),dias:[],libre:1,t:Date.now()}); const N=NOVENAS.find(x=>x.id===id)||{}; toast(N.d===10?"Empezaste el decenario: diez días":"Empezaste la novena: nueve días"); },
  examen(){ openSheet({view:"examen",ex:{p:0,no:[],prop:"",gracias:""},full:1}); }, exPaso(p){ sheet.ex.p=Math.max(0,Math.min(4,sheet.ex.p+(+p))); renderSheet(); },
  exNo(p){ const i=sheet.ex.no.indexOf(p); if(i>=0) sheet.ex.no.splice(i,1); else sheet.ex.no.push(p); renderSheet(); },
  async exOk(){ const ex=sheet.ex; await setDay(hoy(),{x:1,ex:{no:ex.no,prop:ex.prop,gracias:ex.gracias},t:Date.now()}); if(ex.prop){ propositos.push({id:newId("p"),t:ex.prop,f:addDays(hoy(),1),d:hoy()}); await backend.setDoc("daily_settings/propositos",{list:propositos}); } closeSheet(); amenToast("x"); },
  confesion(){ openSheet({view:"confesion"}); }, async confHoy(){ await marcar("cj"); try{ localStorage.removeItem(HOJA_K); }catch(e){} toast("Bienvenido a casa: el ánimo vuelve a 100",()=>desmarcar("cj")); renderSheetQuieto(); },
  plus(){ openSheet({view:"plus"}); }, progreso(){ openSheet({view:"progreso"}); }, camino(p){ openSheet({view:"camino",p:p||"adviento"}); setTimeout(()=>{ const e=document.querySelector("#sheet .camd.hoy"); if(e) e.scrollIntoView({block:"center"}); },60); }, donarVer(){ openSheet({view:"donar"}); },
  async plusComprar(p){ const P=sheet.planes||{}, pk=P[p]; if(!pk) return; try{ const D=await comprar(pk); if(D&&D.activo){ plusTienda=true; lsSet("daily_plus_tienda","1"); await plusEscribir({active:true,source:"store",plan:D.plan||p,since:hoy(),until:D.until||null}); toast("¡Bienvenido a Scaeli+! Vale también en Scaeli Fit."); renderSheet(); render(); } }catch(e){ if(!(e&&(e.userCancelled||/cancel/i.test(String(e.message||e))))) toast("No se pudo completar la compra."); } },
  async plusRestaurar(){ try{ const D=await restaurarCompras(); if(D===null){ toast("Las compras no están disponibles."); return; } plusTienda=!!D.activo; lsSet("daily_plus_tienda",D.activo?"1":"0"); if(D.activo) await plusEscribir({active:true,source:"store",plan:D.plan,since:(plusDoc&&plusDoc.since)||hoy(),until:D.until||null}); toast(D.activo?"Scaeli+ restaurado":"No encontramos compras para restaurar"); renderSheet(); render(); }catch(e){ toast("No se pudo restaurar."); } },
  plusComoGratis(){ lsSet("daily_plus_como_gratis",lsGet("daily_plus_como_gratis")==="1"?null:"1"); renderSheet(); render(); },
  async donar(p){ if(!esNativo()){ toast("Se dona desde la app de Android o iPhone"); return; } const D=sheet.dons||[], pr=D.find(x=>x.identifier==="scaeli_donacion_"+p); if(!pr) return; try{ await donar(pr); toast("¡Gracias! Que Dios te lo devuelva."); }catch(e){ if(!(e&&(e.userCancelled||/cancel/i.test(String(e.message||e))))) toast("No se pudo completar la donación."); } },
  async camOk(p){ const d=dayOf(p), c={...(d.cam||{})}, k=sheet.p||"adviento"; c[k]=c[k]?0:1; await setDay(p,{cam:c,t:Date.now()}); renderSheetQuieto(); },
  async camCita(p){ const m=String(p).match(/^((?:[123] )?\S+) (\d+),(\d+)/); if(!m) return; try{ await bibIndice(); }catch(e){ toast("No se pudo abrir la Biblia."); return; } const r=bibReferencia(m[1]+" "+m[2]+","+m[3]); if(!r) return; openSheet({view:"biblia",m:"libros"}); bibAbrir(r.b,r.c,r.v); },
  grupo(){ openSheet({view:"grupo"}); },
  async gEjemplo(){ if(!grupoBE||grupoBE.mode!=="local") return; const gid=await grupoBE.crear("Los de la parroquia",miFicha()); const lun=semanaDe(), ant=addDays(lun,-7), ej={};
    [["Juan",{sx:"m",prenda:"remera:azul",peinado:"corto"},[64,120]],["Clari",{sx:"f",prenda:"buzo:bordo",peinado:"suelto"},[92,70]],["Mateo",{sx:"m",prenda:"camisa:blanco",peinado:"base"},[31,150]],["Sofi",{sx:"f",prenda:"pollera:negro",peinado:"corto"},[77,40]]].forEach((x,i)=>{ const u="ej"+i; ej[u]={n:x[0],av:x[1],int:["Por mi abuela, que está enferma","Por los exámenes","Por mi hermano","Por la misión de verano"][i],s:{[lun]:{r:i+1,e:3-(i%2),d:4,x:2,o:1,p:x[2][0]},[ant]:{r:4,e:5,d:6,x:3,o:2,p:x[2][1]}},rece:{local:{n:1,t:Date.now()}},al:i===1?{local:[1,Date.now()]}:{},t:Date.now()}; });
    grupoBE._sembrar(gid,ej); if(grupoBE._sembrarMuro){ const U=Object.keys(ej); grupoBE._sembrarMuro(gid,[{id:"e1",u:U[0],n:ej[U[0]].n,tx:"No se olviden de rezar el Evangelio hoy",tipo:"rec",t:Date.now()-3600e3,a:{[U[1]]:1}},{id:"e2",u:U[1],n:ej[U[1]].n,tx:"Recé la decena por todos, ¡vamos que llegamos al desafío!",t:Date.now()-7200e3,a:{[U[0]]:1,[U[2]||U[0]]:1}},{id:"e3",u:U[2]||U[0],n:ej[U[2]||U[0]].n,tx:"Buen día grupo, hoy ofrezco el día por los que están lejos.",t:Date.now()-86400e3}]); } await backend.setDoc("daily_settings/grupo",{gid}); openSheet({view:"grupo"}); }, grupoModo(p){ sheet.m=p; sheet.err=""; renderSheet(); setTimeout(()=>{ const i=document.querySelector("#sheet form input"); if(i) i.focus(); },40); },
  async gInvitar(){ const G=grupo.meta; if(!G) return; const url=SITIO+"?grupo="+G.id, txt="Sumate a mi grupo «"+G.n+"» en Scaeli Daily para rezar juntos. Código: "+G.id+" · "+url;
    try{ if(navigator.share){ await navigator.share({title:"Scaeli Daily",text:txt}); return; } }catch(e){ if(/abort/i.test(String(e&&e.name))) return; }
    try{ await navigator.clipboard.writeText(txt); toast("Invitación copiada: pegala en WhatsApp"); }catch(e){ window.open("https://wa.me/?text="+encodeURIComponent(txt),"_blank"); } },
  async gRece(p){ if(!grupo.gid) return; const me=(grupo.L||[]).find(x=>x.uid===yo())||{}; const rece={...(me.rece||{})}; rece[p]={n:((rece[p]||{}).n||0)+1,t:Date.now()}; await grupoBE.setMiembro(grupo.gid,{rece}); toast("Rezaste por su intención"); },
  gAliento(p){ sheet.al=sheet.al===p?null:p; renderSheetQuieto(); },
  mRec(){ sheet.mrec=!sheet.mrec; renderSheetQuieto(); }, mMas(){ sheet.mver=(sheet.mver||12)+20; renderSheetQuieto(); },
  async mRecOk(p){ const t=RECORDATORIOS[+p]; if(!t||!grupo.gid) return; sheet.mrec=false; await muroEscribir(t,"rec"); },
  async mAmen(p){ const m=muro.find(x=>x.id===p); if(!m||!grupo.gid) return; const on=!(m.a||{})[yo()]; try{ await grupoBE.amenMsg(grupo.gid,p,on); }catch(e){ toast("No se pudo guardar"); } },
  async mBorrar(p){ if(!grupo.gid) return; try{ await grupoBE.borrarMsg(grupo.gid,p); }catch(e){ toast("No se pudo borrar"); } },
  async mReportar(p){ if(!grupo.gid) return; try{ await grupoBE.reportarMsg(grupo.gid,p); toast("Mensaje reportado y ocultado"); }catch(e){ toast("No se pudo reportar"); } },
  gPortadaQuitar(){ if(!grupo.gid) return; grupoBE.setMeta(grupo.gid,{portada:null}).then(()=>toast("Portada quitada")).catch(()=>toast("No se pudo quitar")); },
  async gAlientoOk(p){ const [u2,i]=String(p).split("|"); const me=(grupo.L||[]).find(x=>x.uid===yo())||{}; const al={...(me.al||{})}; al[u2]=[+i,Date.now()]; sheet.al=null; await grupoBE.setMiembro(grupo.gid,{al}); toast("Aliento enviado"); },
  async gReportar(p){ if(!(await confirmar("¿Reportar esta intención?","Se oculta para vos; si dos personas la reportan, se oculta para todos.","Reportar"))) return; const me=(grupo.L||[]).find(x=>x.uid===yo())||{}; const rep={...(me.rep||{})}; rep[p]=1; await grupoBE.setMiembro(grupo.gid,{rep}); toast("Intención ocultada"); },
  async gEchar(p){ const x=(grupo.L||[]).find(y=>y.uid===p); if(!x||!(await confirmar("¿Sacar a "+x.n+" del grupo?","Puede volver a entrar con el código.","Sacar"))) return; try{ await grupoBE.echar(grupo.gid,p); toast("Listo"); }catch(e){ toast("No se pudo"); } },
  async gSalir(){ if(!(await confirmar("¿Salir del grupo?","Perdés tu lugar en el ranking; podés volver con el código.","Salir","Quedarme"))) return; const gid=grupo.gid; try{ await grupoBE.salir(gid); }catch(e){} await backend.setDoc("daily_settings/grupo",{gid:null}); grupoCerrar(); closeSheet(); toast("Saliste del grupo"); },
  async gUnirme(p){ const gid=String(p||"").toUpperCase().trim(); if(!gid) return; let G=null; try{ G=await grupoBE.leer(gid); }catch(e){} if(!G){ sheet.err="No encontramos un grupo con ese código."; sheet.m="codigo"; renderSheet(); return; }
    if(G.tipo){ sheet.err="Ese código es de un grupo de Scaeli Fit."; sheet.m="codigo"; renderSheet(); return; }
    try{ await grupoBE.setMiembro(gid,miFicha()); }catch(e){ sheet.err="No se pudo entrar. Revisá la conexión."; sheet.m="codigo"; renderSheet(); return; } await backend.setDoc("daily_settings/grupo",{gid}); lsSet("daily_grupo_inv",null); toast("¡Bienvenido a "+G.n+"!"); openSheet({view:"grupo"}); },
  anio(){ openSheet({view:"anio",i:0,full:1}); }, anioIr(p){ if(!sheet||sheet.view!=="anio") return; const n=(sheet.i||0)+(+p); if(n<0) return; if(sheet.S&&n>=sheet.S.length){ closeSheet(); return; } sheet.i=n; renderSheet(); },
  async anioCompartir(){ if(!sheet||!sheet.D) return; sheet.pausa=1; clearTimeout(sheet.timer); try{ const b=await anioImagen(sheet.D); const f=new File([b],"mi-anio-con-dios-"+sheet.D.anio+".png",{type:"image/png"});
      if(navigator.canShare&&navigator.canShare({files:[f]})){ await navigator.share({files:[f],title:"Mi año con Dios",text:"Mi año con Dios en Scaeli Daily"}); }
      else { const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=f.name; a.click(); toast("Imagen guardada"); } }catch(e){ if(!/abort/i.test(String(e&&e.name))) toast("No se pudo compartir"); } },
  libros(){ openSheet({view:"libros"}); }, libAbrir(p){ openSheet({view:"libro",p,m:"caps"}); },
  libIr(p){ const [id,c]=String(p).split("|"); const L=LIBROS.find(x=>x.id===id); if(!L) return; const n=Math.max(0,+c); libMarcar(id,n,LIB[id]&&n>=LIB[id].caps.length-1?1:0); openSheet({view:"libro",p:id,m:"leer",c:n}); },
  async bibliAddLeer(){ await ACC.bibliAdd("Leer diez minutos de un libro espiritual"); },
  biblioteca(p){ openSheet({view:"biblioteca",a:p||"",v:""}); }, bibliFiltro(p){ const [k,v]=String(p).split("|"); sheet[k]=v; renderSheetQuieto(); },
  async bibliAdd(p){ const x=BIBLIOTECA.find(y=>y.t===p); if(!x||yaEnRutina(x.t)) return; const r={diarias:[...(rutina.diarias||[])],habitos:[...(rutina.habitos||[])]};
    if(x.d) r.diarias.push({id:newId("d"),t:x.t,v:x.v}); else r.habitos.push({id:newId("h"),t:x.t,v:x.v}); await backend.setDoc("daily_settings/rutina",r); toast((x.d?"Diaria agregada: ":"Hábito agregado: ")+x.t); renderSheetQuieto(); },
  async habSugerido(p){ const [v,...t]=String(p).split("|"); const tx=t.join("|"); const r={diarias:[...(rutina.diarias||[])],habitos:[...(rutina.habitos||[]),{id:newId("h"),t:tx,v}]}; await backend.setDoc("daily_settings/rutina",r); toast("Hábito agregado: "+tx); },
  async habVirtud(p){ const [id,v]=String(p).split("|"); const r={diarias:[...(rutina.diarias||[])],habitos:(rutina.habitos||[]).map(h=>h.id===id?{...h,v}:h)}; await backend.setDoc("daily_settings/rutina",r); },
  biblia(){ openSheet({view:"biblia",m:"libros"}); },
  bibLibro(p){ const b=BIB.idx&&BIB.idx.find(x=>x.id===p); if(!b) return; if(b.k===1) bibAbrir(p,1); else { sheet.m="caps"; sheet.b=p; renderSheet(); } bibLibro(p).catch(()=>{}); },
  bibCaps(p){ sheet.m="caps"; sheet.b=p; renderSheet(); },
  bibIr(p){ const [b,c,v]=String(p).split("|"); bibAbrir(b,+c,+(v||0)); },
  bibVolver(){ sheet.m="libros"; sheet.res=null; renderSheet(); },
  exConf(){ openSheet({view:"exConf",p:0,h:hojaLeer(),full:1}); },
  confNinosF(p){ sheet.ninos=p==="1"; renderSheet(); },
  hojaPaso(p){ hojaNotas(); sheet.p=Math.max(0,Math.min(exLista().length+1,sheet.p+(+p))); renderSheet(); },
  confModo(p){ sheet.modo=p; renderSheet(); },
  hojaQ(p){ hojaNotas(); const k=exLista()[sheet.p-1].n, i=+p, m=sheet.h.m[k]||(sheet.h.m[k]=[]); const j=m.indexOf(i); if(j>=0) m.splice(j,1); else m.push(i); m.sort((a,b)=>a-b); hojaGuardar(sheet.h); renderSheet(); },
  async hojaBorrar(){ try{ localStorage.removeItem(HOJA_K); }catch(e){} sheet.h={m:{},n:{},u:""}; sheet.p=0; if(await confirmar("¿Ya te confesaste?","Si hoy te confesaste, lo marcamos y el ánimo vuelve a 100.","Sí, me confesé","Solo borrar")) await marcar("cj"); renderSheet(); toast("Hoja borrada"); }, confNinos(p){ sheet.ninos=p==="1"; renderSheet(); },
  misa(){ openSheet({view:"misa"}); }, async misaOk(){ await marcar("misa"); closeSheet(); amenToast("misa"); },
  cerrar(){ if(rosEnCurso()) ACC.rosSalir(); else closeSheet(); },
  async rosSalir(){ const P=PJ.normal(profile||{}), r=rosario, M=r&&MISTERIOS[r.set], q=P.sx==="f"?"¿Estás segura?":"¿Estás seguro?";
    const donde=r&&r.fase==="decena"&&M?"en el "+["primer","segundo","tercer","cuarto","quinto"][r.mis]+" misterio":"donde lo dejaste";
    if(await confirmar(q,"Tu Rosario queda guardado "+donde+" y podés seguir hoy desde ahí.","Salir","Seguir rezando")) closeSheet(); },
  async fondoSet(p){ const F=FONDOS.find(x=>x[0]===p); if(!F) return; if(!fondoLibre(F,nivelDe(),logros())){ toast("Todavía no: "+F[2][2]); return; } await backend.setDoc("daily_settings/profile",{...(profile||{}),fondo:p}); toast("Fondo: "+F[1]); },
  async pjSet(p){ const [c,v]=String(p).split("|"); const pr={...(profile||{})};
    if(c==="sx"){ if((pr.sx||"m")===v) return; pr.sx=v; pr.prenda="base"; pr.peinado="base"; }
    else if(c==="acc") pr[v]=pr[v]?0:1;
    else pr[c]=/^(piel|pelo)$/.test(c)?+v:v;
    await backend.setDoc("daily_settings/profile",pr); },
  async diaria(p){ const d=dayOf(hoy()); if(DIARIAS.some(x=>x[0]===p)){ await setDay(hoy(),{[p]:d[p]?0:1,t:Date.now()}); } else { const dd={...(d.dd||{})}; if(dd[p]) delete dd[p]; else dd[p]=1; await setDay(hoy(),{dd,t:Date.now()}); } },
  async habMas(p){ await ACC.habAj(p+"|p|1"); toast("+1 · +"+XP.hab+" exp · "+(((rutina.habitos||[]).find(h=>h.id===p)||{}).t||""),()=>ACC.habAj(p+"|p|-1")); if(view==="hoy") render(); },
  irDia(){ irA("dia"); },
  async habMenos(p){ await ACC.habAj(p+"|m|1"); toast("−1 · −5 de ánimo · "+(((rutina.habitos||[]).find(h=>h.id===p)||{}).t||""),()=>ACC.habAj(p+"|m|-1")); },
  rutEdit(){ editRut=!editRut; render(); },
  habEd(p){ habEd=habEd===p?null:p; render(); },
  async habAj(p){ const [id,k,dl]=String(p).split("|"); const d=dayOf(hoy()), hb={...(d.hb||{})}, x={...(hb[id]||{})}; x[k]=Math.max(0,(x[k]||0)+(+dl)); hb[id]=x; await setDay(hoy(),{hb,t:Date.now()}); },
  deshacer(){ const f=deshacerFn; deshacerFn=null; $("#toast").hidden=true; if(f) f(); },
  calMes(p){ calMes=new Date(calMes.getFullYear(),calMes.getMonth()+(+p),1); calForm=false; render(); },
  calDia(p){ calSel=p; calForm=false; render(); },
  calNuevo(){ calForm=true; render(); },
  async gcalCon(){ try{ const tok=await calendarioToken(); gcal={tok,exp:Date.now()+55*60e3}; try{ localStorage.setItem("daily_gcal",JSON.stringify(gcal)); }catch(e){} gcalEv={}; gcalCarga={}; gcalErr=""; render(); }catch(e){ gcalErr=(e&&e.message)||"No se pudo conectar."; render(); } },
  async rutDel(p){ const [t,id]=String(p).split("|"); const r={diarias:[...(rutina.diarias||[])],habitos:[...(rutina.habitos||[])]}; if(t==="d") r.diarias=r.diarias.filter(x=>x.id!==id); else r.habitos=r.habitos.filter(x=>x.id!==id); await backend.setDoc("daily_settings/rutina",r); },
  async propOk(p){ const x=propositos.find(q=>q.id===p); if(!x) return; x.ok=x.ok?0:1; x.d=hoy(); await backend.setDoc("daily_settings/propositos",{list:propositos}); },
  async propDel(p){ propositos=propositos.filter(q=>q.id!==p); await backend.setDoc("daily_settings/propositos",{list:propositos}); },
  async notaOk(){ const t=$("textarea[data-nota]"); if(!t) return; await setDay(hoy(),{nota:t.value.trim(),t:Date.now()}); toast("Guardado"); },
  async intDel(p){ intents.splice(+p,1); await backend.setDoc("daily_settings/intents",{list:intents}); },
  async recOn(){ if(esNativo()){ if(!recordatorios.on&&!(await pedirPermisoAvisos())){ toast("Sin permiso para avisar: activalo en los ajustes del teléfono"); return; } }
    else if("Notification" in window&&Notification.permission!=="granted"){ const r=await Notification.requestPermission(); if(r!=="granted"){ toast("Sin permiso para avisar"); return; } } recordatorios={...recordatorios,on:!recordatorios.on}; await backend.setDoc("daily_settings/recordatorios",recordatorios); programarAvisos(); },
  tema(){ const claro=document.documentElement.getAttribute("data-theme")==="light"; if(claro) document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme","light"); try{ localStorage.setItem("daily_theme",claro?"dark":"light"); }catch(e){} render(); },
  exportar(){ exportar(); }, importar(){ $("#impFile").click(); },
  borrar(p){ openSheet({view:"borrar",p}); },
  async borrarOk(){ if(!sheet||sheet.busy) return; sheet.busy=true; sheet.err=""; renderSheet();
    try{ if(grupo.gid&&grupoBE){ try{ await grupoBE.salir(grupo.gid); }catch(e){} grupoCerrar(); } if(backend.mode==="local"){ await backend.borrarCols(COLS); try{ localStorage.removeItem("daily_invitado"); }catch(e){} invitado=false; closeSheet(); endSession(); toast("Datos borrados"); return; }
      if(sheet.p==="cuenta"){ await borrarCuenta(backend,COLS); invitado=false; closeSheet(); endSession(); toast("Tu cuenta fue borrada"); return; }
      await backend.borrarCols(COLS); closeSheet(); toast("Datos de Daily borrados"); }
    catch(e){ sheet.busy=false; sheet.err=(e&&e.message)||"No se pudo borrar. Probá de nuevo."; renderSheet(); } }
};
document.addEventListener("click",e=>{ const b=e.target.closest("button,a[data-a]"); if(!b) return;
  if(b.id==="login"||b.id==="loginApple"){ const q=b.dataset.q||"google"; b.disabled=true; setStatus(q==="apple"?"Abriendo Apple…":"Abriendo Google…"); login(q).then(()=>setStatus("Entrando…")).catch(err=>{ setStatus(err&&err.message||"No se pudo entrar. Probá de nuevo.",true); b.disabled=false; }); return; }
  if(b.id==="invitado"){ invitado=true; try{ localStorage.setItem("daily_invitado","1"); }catch(e){} startSession({uid:"local",displayName:""},true); return; }
  if(b.id==="logout"){ invitado=false; try{ localStorage.removeItem("daily_invitado"); }catch(e){} if(backend&&backend.mode==="local"){ endSession(); } else logout(); return; }
  if(b.dataset.view){ irA(b.dataset.view); return; }
  const a=b.dataset.a; if(a&&ACC[a]){ e.preventDefault(); ACC[a](b.dataset.p); } });
async function muroEscribir(t,tipo){ t=String(t||"").trim().slice(0,140); if(!t||!grupo.gid||!grupoBE.escribir) return; if(!limpio(t)){ toast("Elegí otras palabras"); return; }
  const ult=muro.find(m=>m.u===yo()); if(ult&&Date.now()-ult.t<15000&&!tipo){ toast("Esperá un momento antes de escribir de nuevo"); return; }
  try{ await grupoBE.escribir(grupo.gid,{n:miFicha().n,tx:t,...(tipo?{tipo}:{})}); lsSet("daily_muro_visto",Date.now()); }catch(e){ toast("No se pudo enviar"); } }
async function portadaSubir(file){ if(!file||!grupo.gid) return; try{ const url=await new Promise((ok,no)=>{ const r=new FileReader(); r.onload=()=>ok(r.result); r.onerror=no; r.readAsDataURL(file); });
    const img=await new Promise((ok,no)=>{ const i=new Image(); i.onload=()=>ok(i); i.onerror=no; i.src=url; });
    const W=800, H=450, c=document.createElement("canvas"); c.width=W; c.height=H; const x=c.getContext("2d"); const k=Math.max(W/img.width,H/img.height), w=img.width*k, h=img.height*k; x.drawImage(img,(W-w)/2,(H-h)/2,w,h);
    let q=.82, out=c.toDataURL("image/jpeg",q); while(out.length>260000&&q>.4){ q-=.1; out=c.toDataURL("image/jpeg",q); }
    await grupoBE.setMeta(grupo.gid,{portada:out}); toast("Portada cambiada"); }catch(e){ toast("No se pudo usar esa foto"); } }
document.addEventListener("submit",e=>{ const f=e.target; if(!f.dataset.f) return; e.preventDefault();
  if(f.dataset.f==="muro"){ const inp=f.querySelector("input"), t=inp.value; inp.value=""; if(document.activeElement&&document.activeElement.blur) document.activeElement.blur(); muroEscribir(t); return; }
  if(f.dataset.f==="plusCodigo"){ const c=String((f.querySelector("input")||{}).value||"").trim().toUpperCase(); if(esNativo()){ toast("Los códigos se canjean desde la web."); return; }
    if(!plusBE){ toast("Para canjear un código, entrá con tu cuenta."); return; } (async()=>{ const r=await plusBE.canjear(c); if(r.ok){ lsSet("daily_plus_como_gratis",null); toast("Scaeli+ activado"+(r.doc.until?" hasta el "+fLarga(r.doc.until).replace(/^\w+ /,""):"")+". Vale también en Scaeli Fit."); } else toast(r.msg); renderSheet(); render(); })(); return; }
  if(f.dataset.f==="grupoCrear"){ const n=String((f.querySelector("input")||{}).value||"").trim().slice(0,40); if(!n) return; if(!limpio(n)){ toast("Elegí otro nombre"); return; }
    (async()=>{ try{ const gid=await grupoBE.crear(n,miFicha()); await backend.setDoc("daily_settings/grupo",{gid}); toast("Grupo creado · código "+gid); openSheet({view:"grupo"}); }catch(e){ toast("No se pudo crear el grupo."); } })(); return; }
  if(f.dataset.f==="grupoUnirse"){ const c=String((f.querySelector("input")||{}).value||"").toUpperCase().replace(/[^A-Z0-9]/g,""); if(document.activeElement&&document.activeElement.blur) document.activeElement.blur(); ACC.gUnirme(c); return; }
  if(f.dataset.f==="grupoInt"){ const t=String((f.querySelector("input")||{}).value||"").trim().slice(0,80); if(t&&!limpio(t)){ toast("Elegí otras palabras"); return; } if(document.activeElement&&document.activeElement.blur) document.activeElement.blur(); grupoBE.setMiembro(grupo.gid,{int:t}).then(()=>toast(t?"Intención guardada":"Intención borrada")).catch(()=>toast("No se pudo guardar")); return; }
  if(f.dataset.f==="bibBuscar"){ const q=($("#bibQ")||{}).value||""; if(!q.trim()) return; const r=bibReferencia(q); if(document.activeElement&&document.activeElement.blur) document.activeElement.blur();
    if(r){ sheet.q=""; bibAbrir(r.b,r.c,r.v); } else bibBuscarPalabra(q.trim()); return; } const F=new FormData(f); if(document.activeElement&&document.activeElement.blur) document.activeElement.blur(); dirty=true;
  if(f.dataset.f==="prop"){ const t=String(F.get("t")||"").trim(); if(t){ propositos.push({id:newId("p"),t,f:String(F.get("f")||"").trim(),hr:String(F.get("hr")||"").trim(),d:hoy()}); backend.setDoc("daily_settings/propositos",{list:propositos}); programarAvisos(); } f.reset(); }
  if(f.dataset.f==="evento"){ const t=String(F.get("t")||"").trim(), hi=String(F.get("hi")||""), hf=String(F.get("hf")||""); if(!t) return;
    const tz=Intl.DateTimeFormat().resolvedOptions().timeZone; const body={summary:t};
    if(hi){ const a=new Date(calSel+"T"+hi), b=hf?new Date(calSel+"T"+hf):new Date(a.getTime()+60*60e3); body.start={dateTime:a.toISOString(),timeZone:tz}; body.end={dateTime:b.toISOString(),timeZone:tz}; }
    else { body.start={date:calSel}; body.end={date:addDays(calSel,1)}; }
    gcalPedir("calendars/primary/events",{method:"POST",body:JSON.stringify(body)}).then(()=>{ calForm=false; delete gcalCarga[calSel.slice(0,7)]; delete gcalEv[calSel.slice(0,7)]; toast("Evento guardado en Google Calendar"); render(); }).catch(e=>{ gcalErr=e.message; render(); }); return; }
  if(f.dataset.f==="diaria"||f.dataset.f==="habito"){ const t=String(F.get("t")||"").trim(); if(t){ const r={diarias:[...(rutina.diarias||[])],habitos:[...(rutina.habitos||[])]}; (f.dataset.f==="diaria"?r.diarias:r.habitos).push(f.dataset.f==="diaria"?{id:newId("d"),t}:{id:newId("h"),t,v:virtudSugerida(t)}); backend.setDoc("daily_settings/rutina",r); } f.reset(); }
  if(f.dataset.f==="int"){ const t=String(F.get("t")||"").trim(); if(t){ intents.push(t); backend.setDoc("daily_settings/intents",{list:intents}); } f.reset(); } });
document.addEventListener("change",e=>{ const t=e.target; if(t.id==="impFile"&&t.files[0]) importar(t.files[0]);
  if(t.id==="gPortada"&&t.files[0]){ portadaSubir(t.files[0]); t.value=""; }
  if(t.dataset.rec){ recordatorios={...recordatorios,[t.dataset.rec]:t.value}; backend.setDoc("daily_settings/recordatorios",recordatorios); }
  if(t.dataset.nombre!==undefined){ backend.setDoc("daily_settings/profile",{...(profile||{}),nombre:t.value.trim()}); }
  if(t.dataset.ex){ sheet.ex[t.dataset.ex]=t.value; } });
document.addEventListener("input",e=>{ const t=e.target; if(t.dataset.ex) sheet.ex[t.dataset.ex]=t.value;
  if((t.id==="hojaN"||t.id==="hojaU")&&sheet&&sheet.h) hojaNotas();
  if(t.id==="orTxt"&&sheet) sheet.otxt=t.value;
  if(t.id==="orQ"&&sheet){ sheet.q=t.value; const pos=t.selectionStart; sheet.top=false; renderSheet(); sheet.top=true; const n=$("#orQ"); if(n){ n.focus(); try{ n.setSelectionRange(pos,pos); }catch(e){} } }
  if(t.id==="novQ"&&sheet){ sheet.q=t.value; const pos=t.selectionStart; sheet.top=false; renderSheet(); sheet.top=true; const n=$("#novQ"); if(n){ n.focus(); try{ n.setSelectionRange(pos,pos); }catch(e){} } }
  if(t.id==="salQ"&&sheet){ sheet.q=t.value; const pos=t.selectionStart; renderSheet(); const n=$("#salQ"); if(n){ n.focus(); try{ n.setSelectionRange(pos,pos); }catch(e){} } }
  if(t.id==="lecTxt"&&sheet) sheet.ltxt=t.value; });
document.addEventListener("focusout",()=>{ if(dirty){ dirty=false; setTimeout(()=>{ if(!typing()) renderNow(); },50); } });
$("#scrim").addEventListener("click",()=>ACC.cerrar());
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&sheet&&!document.querySelector(".dlg")) ACC.cerrar(); });
try{ if(localStorage.getItem("daily_theme")==="light") document.documentElement.setAttribute("data-theme","light"); }catch(e){}
if(!esNativo()&&navigator.serviceWorker&&navigator.serviceWorker.register&&location.protocol!=="file:"){ window.addEventListener("load",()=>{ navigator.serviceWorker.register("sw.js").catch(()=>{}); }); }
renderLogin();
try{ const inv=new URLSearchParams(location.search).get("grupo"); if(inv){ lsSet("daily_grupo_inv",inv.toUpperCase().slice(0,8)); history.replaceState(null,"",location.pathname); } }catch(e){}
let invitado=false; try{ invitado=localStorage.getItem("daily_invitado")==="1"; }catch(e){}
if(invitado){ startSession({uid:"local",displayName:""},true); }
finishRedirect().then(()=>{ watchAuth(u=>{ if(u){ try{ localStorage.removeItem("daily_invitado"); }catch(e){} startSession(u,false); } else if(!invitado&&!(backend&&backend.mode==="local")){ endSession(); } }); }).catch(()=>{});
/* iPhone instalado desde Safari: la barra de estado tapa la fecha si env(safe-area-inset-top) todavía vale 0 al arrancar */
try{ if(navigator.standalone&&/iPhone|iPad/.test(navigator.userAgent)){ const H=Math.max(screen.width,screen.height), notch=H>=812, isla=H>=852&&!/iPad/.test(navigator.userAgent);
  const r=document.documentElement; r.classList.add("ios-pwa"); r.style.setProperty("--sat-min",(isla?59:notch?47:20)+"px"); r.style.setProperty("--sab-min",(notch?34:0)+"px"); } }catch(e){}
/* para las pruebas */
window.DAILY={get:()=>({view,sheet,days,profile,rosario,intents,propositos,novenas,evHoy,backend:backend&&backend.mode,grupo}),ACC,openSheet,closeSheet,render,tiempoLit,ir:irA,grupoBE:()=>grupoBE,miFicha};
