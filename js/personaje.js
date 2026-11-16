// El personaje de Daily: solo los dibujos de PixelLab, tal cual (herramientas/pj_crudo.py). Es un avatar: se ve solo de frente.
// Cada combinación de ropa, color y peinado es un dibujo entero (PixelLab; desde 2.1.2 con la misma cara, caras.py, y desde 2.1.3
// con los peinados nuevos de Gemini, peinados.py): acá no se pega, no se tiñe ni se agrega nada.
const VISTAS=["south"];   // desde la 1.6.1 la hoja trae solo el frente

export const COLORES=[["gris","Gris","#A9ABB2"],["blanco","Blanco","#EEEDE8"],["negro","Negro","#2C2D33"],["azul","Azul","#2E3E66"],["bordo","Bordó","#6E1E2E"]];
export const PRENDAS={m:[["base","Camisa clara"],["remera","Remera"],["buzo","Buzo"],["camisa","Camisa"],["deportiva","Deportiva"],["sotana","Sotana"],["clergyman","Clergyman"]],
  f:[["base","Blusa y jean"],["remera","Remera"],["buzo","Buzo"],["pollera","Pollera"],["deportiva","Deportiva"],["consagrada","Consagrada"],["caridad","Misionera de la Caridad"],["dominica","Dominica"],["carmelita","Carmelita"]]};
export const CON_COLOR=["remera","buzo","camisa","pollera"];
export const VELO=["consagrada","caridad","dominica","carmelita"];
export const FIJO={};   // 2.1.3: el clergyman y la deportiva ya tienen varios peinados (los que no existen no se ofrecen)
export const ALTURAS=[["baja","Baja"],["media","Media"],["alta","Alta"]];
/* 2.3: tonos de piel. Solo se tiñen los píxeles de piel de cada dibujo ({m,f}_piel.png, herramientas/piel_mascara.py),
   escalando cada canal desde el tono del dibujo (REF) al elegido: se conservan las sombras y los rasgos. "base" = el dibujo tal cual. */
export const TONOS=[["clara","Clara","#F6CDAE"],["base","Media","#F09C6B"],["triguena","Trigueña","#D0905E"],["morena","Morena","#A9693F"],["oscura","Oscura","#7E4A2B"],["muyoscura","Muy oscura","#55321D"]];
const REF={m:[245,156,107],f:[236,142,93]};
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
/* 2.1.3: peinados nuevos, los del creador de personajes del juego (herramientas/peinados.py) */
export const PEINADOS={m:[["base","Medio"],["corto","Corto"],["ondulado","Ondulado"],["rulos","Rulos"],["lacio","Lacio"],["rapado","Rapado"]],
  f:[["base","Colita"],["suelto","Suelto"],["corto","Carré"],["ondas","Ondas"],["trenza","Trenza"],["flequillo","Flequillo"],["rodete","Rodete"]]};   // rodete: solo la mayor (2.3.1)

/* 2.3.1: edades, todas de PixelLab (herramientas/edades_pixellab.py). Adulto y mayor: la cabeza de la edad (PixelLab editó el
   dibujo del joven) sobre toda la ropa laica del joven; niño y niña: dibujo propio, más bajo, con base, buzo, remera, deportiva
   y pollera. La mayor tiene dos peinados (anteojos y rodete). Los consagrados quedan en Joven. */
export const EDADES=[["nino","Niño"],["joven","Joven"],["adulto","Adulto"],["mayor","Mayor"]];
export const EDADES_F={nino:"Niña",joven:"Joven",adulto:"Adulta",mayor:"Mayor"};
const HOJAS=["m","f","m_nino","f_nino","m_adulto","f_adulto","m_mayor","f_mayor"];
/* las edades que se ofrecen (2.3.1: se ocultaron las de Gemini y volvieron rehechas en PixelLab) */
export const EDADES_LISTAS=["nino","joven","adulto","mayor"];
const hojaDe=(sx,edad)=>edad&&edad!=="joven"?sx+"_"+edad:sx;
let META=null; const HOJA={}, PIEL={}; let listo=null;
function cargarImg(src){ return new Promise((ok,mal)=>{ const im=new Image(); im.onload=()=>ok(im); im.onerror=mal; im.src=src; }); }
export function cargar(base){ if(listo) return listo; base=base||"assets/personaje/";
  listo=(async()=>{ META=await (await fetch(base+"pj.json")).json();
    await Promise.all(HOJAS.filter(h=>META[h]).map(async h=>{ try{ HOJA[h]=await cargarImg(base+h+".png"); }catch(e){ if(h.length===1) throw e; delete META[h]; } }));
    await Promise.all(HOJAS.filter(h=>META[h]).map(async h=>{ try{ PIEL[h]=await cargarImg(base+h+"_piel.png"); }catch(e){} }));   // sin la máscara, tono original
    return true; })();
  return listo; }
export const cargado=()=>!!(META&&HOJA.m&&HOJA.f);

/* qué hay dibujado: solo se ofrecen las combinaciones que existen (pj.json) */
const hay=(h,prenda,peinado)=>!!(META&&META[h]&&META[h].combos[prenda+"|"+peinado]);
const hayAlgo=(h,pred)=>!!META&&!!META[h]&&Object.keys(META[h].combos).some(k=>pred(...k.split("|")));
export function opciones(P){ if(!META) return {peinados:[],prendas:[],colores:[],edades:[]}; const sx=P.hoja, sxx=P.sx;
  const edades=EDADES.filter(e=>EDADES_LISTAS.includes(e[0])&&META[hojaDe(sxx,e[0])]).map(e=>[e[0],sxx==="f"?EDADES_F[e[0]]:e[1]]);
  const peinados=P.velo?[]:PEINADOS[sxx].filter(h=>hayAlgo(sx,(pr,pe)=>pe===h[0]&&pr.split(":")[0]===P.tipo));
  const prendas=PRENDAS[sxx].filter(x=>hayAlgo(sx,pr=>pr.split(":")[0]===x[0]));
  const colores=P.color?COLORES.filter(c=>hay(sx,P.tipo+":"+c[0],P.peinado)):[];
  return {peinados,prendas,colores,edades}; }

/* perfil por defecto: siempre cae en un dibujo que existe */
export function normal(p){ p=p||{}; const sx=p.sx==="f"?"f":"m";
  const ok=(L,v,d)=>L.some(x=>x[0]===v)?v:d;
  const [tipo,col]=String(p.prenda||"base").split(":"); let t=ok(PRENDAS[sx],tipo,"base"); let c=CON_COLOR.includes(t)?ok(COLORES,col,"gris"):null;
  let pe=FIJO[t]||(VELO.includes(t)?"base":ok(PEINADOS[sx],p.peinado,"base"));
  let edad=ok(EDADES,p.edad,"joven"); if(!EDADES_LISTAS.includes(edad)||(META&&!META[hojaDe(sx,edad)])) edad="joven"; const h=hojaDe(sx,edad);
  if(META&&META[h]){ let pr=c?t+":"+c:t;
    if(!hay(h,pr,pe)){ const alt=Object.keys(META[h].combos).map(k=>k.split("|"));
      const m=alt.find(([a,b])=>a===pr)||alt.find(([a,b])=>a.split(":")[0]===t&&b===pe)||alt.find(([a,b])=>a.split(":")[0]===t)||alt.find(([a,b])=>a==="base"&&b===pe)||["base","base"];
      [pr,pe]=m; [t,c]=pr.split(":"); c=c||null; } }
  return { sx, tipo:t, color:c, prenda:c?t+":"+c:t, peinado:pe, velo:VELO.includes(t), fijo:!!FIJO[t], alt:ok(ALTURAS,p.alt,"media"), tono:ok(TONOS,p.tono,"base"), edad, hoja:h }; }
/* tiñe la piel del cuadro ya pintado (antes de cambiar la altura, para que la máscara coincida) */
function tenir(x, P, fila){ if(P.tono==="base"||!PIEL[P.hoja]) return; const T=hex(TONOS.find(t=>t[0]===P.tono)[2]), R0=REF[P.sx];
  const mc=document.createElement("canvas"); mc.width=128; mc.height=128; const mx=mc.getContext("2d"); mx.drawImage(PIEL[P.hoja],0,fila*128,128,128,0,0,128,128);
  const m=mx.getImageData(0,0,128,128).data, im=x.getImageData(0,0,128,128), d=im.data;
  for(let i=0;i<d.length;i+=4){ if(m[i]<128||!d[i+3]) continue; for(let c=0;c<3;c++) d[i+c]=Math.max(0,Math.min(255,Math.round(T[c]*d[i+c]/R0[c]))); }
  x.putImageData(im,0,0); }

function combo(P){ const C=META[P.hoja].combos; return C[P.prenda+"|"+P.peinado]||C["base|base"]; }

/* pinta en un <canvas> el dibujo tal cual: el lienzo queda a 128 y el tamaño en pantalla se ajusta para que cada píxel sea entero */
export function pintar(cv, perfil, vista, cssObjetivo){
  if(!cargado()) return false; const P=normal(perfil), v=0, k=combo(P);
  cv.width=128; cv.height=128; const x=cv.getContext("2d"); x.imageSmoothingEnabled=false; x.clearRect(0,0,128,128);
  x.drawImage(HOJA[P.hoja],v*128,k.fila*128,128,128,0,0,128,128);
  tenir(x,P,k.fila);
  /* altura: se repiten (alta) o se sacan (baja) tres filas enteras, una del torso y dos de las piernas; la cara y los pies no se tocan */
  if(P.alt!=="media"){ const im=x.getImageData(0,0,128,128), d=im.data; let top=128, bot=-1;
    for(let y=0;y<128;y++) for(let xx=0;xx<128;xx++) if(d[(y*128+xx)*4+3]){ if(y<top) top=y; if(y>bot) bot=y; }
    if(bot>top){ const h=bot-top, lugar=P.alt==="alta"?Math.min(3,top+127-bot):3, esp=[Math.round(top+h*0.40),Math.round(top+h*0.63),Math.round(top+h*0.82)].slice(0,lugar);
      const filas=[]; for(let y=0;y<128;y++){ const e=esp.includes(y); if(P.alt==="baja"&&e) continue; filas.push(y); if(P.alt==="alta"&&e) filas.push(y); }
      const out=new Uint8ClampedArray(128*128*4), sobra=filas.length-128, off=sobra>0?Math.min(sobra,top):sobra;   // al crecer se usa el aire de arriba (nunca se corta la cabeza)
      for(let y=0;y<128;y++){ const src=filas[y+off]; if(src==null) continue; out.set(d.subarray(src*512,src*512+512),y*512); }
      x.putImageData(new ImageData(out,128,128),0,0); } }
  if(cssObjetivo){ const dpr=window.devicePixelRatio||1; const s=Math.max(1,Math.round(cssObjetivo*dpr/128)); const css=128*s/dpr; cv.style.width=css+"px"; cv.style.height=css+"px"; }
  return true; }

/* el cuadro como ImageData (para las hojas de control) */
export function cuadro(perfil, vista){ const cv=document.createElement("canvas"); if(!pintar(cv,perfil,vista)) return null; return cv.getContext("2d").getImageData(0,0,128,128); }
