// El personaje de Daily: solo los dibujos de PixelLab, tal cual (herramientas/pj_crudo.py). Es un avatar: se ve solo de frente.
// Cada combinación de ropa, color y peinado es un dibujo entero (PixelLab; desde 2.1.2 con la misma cara, caras.py, y desde 2.1.3
// con los peinados nuevos de Gemini, peinados.py): acá no se pega, no se tiñe ni se agrega nada.
const VISTAS=["south"];   // desde la 1.6.1 la hoja trae solo el frente

export const COLORES=[["gris","Gris","#A9ABB2"],["blanco","Blanco","#EEEDE8"],["negro","Negro","#2C2D33"],["azul","Azul","#2E3E66"],["bordo","Bordó","#6E1E2E"]];
export const PRENDAS={m:[["base","Camisa clara"],["remera","Remera"],["buzo","Buzo"],["camisa","Camisa"],["deportiva","Deportiva"],["guardapolvo","Guardapolvo"],["rayada","Remera rayada"],["jardinero","Jardinero"],["sotana","Sotana"],["clergyman","Clergyman"]],
  f:[["base","Blusa y jean"],["remera","Remera"],["buzo","Buzo"],["pollera","Pollera"],["deportiva","Deportiva"],["guardapolvo","Guardapolvo"],["vestido","Vestido"],["jardinero","Jardinero"],["consagrada","Consagrada"],["caridad","Misionera de la Caridad"],["dominica","Dominica"],["carmelita","Carmelita"]]};
export const CON_COLOR=["remera","buzo","camisa","pollera"];
export const VELO=["consagrada","caridad","dominica","carmelita"];
export const FIJO={};   // 2.1.3: el clergyman y la deportiva ya tienen varios peinados (los que no existen no se ofrecen)
export const ALTURAS=[["baja","Baja"],["media","Media"],["alta","Alta"]];
/* Tonos de piel. 2.3.1: cada tono es una rampa de 5 colores (luz → sombra) y cada píxel de piel ({hoja}_piel.png,
   herramientas/piel_mascara.py) toma el color de la rampa según su luz, entre la más clara y la más oscura de la piel de esa hoja
   (pj.json, «luz»). Así la piel queda pareja y con las sombras del dibujo. "base" = el dibujo tal cual. El color de la muestra es el 2.º de la rampa. */
const RAMPAS={clara:["FBDDC4","F2C8A7","E4B08D","CC9573","A97558"],triguena:["EFBD93","DFA67B","CB8D63","B0744F","8C5A3C"],
  morena:["D99A68","C4824F","AC6B40","905532","6F3F24"],oscura:["B8774C","A26340","8A5132","713F27","55301D"],muyoscura:["9A6040","824F34","6C412A","583421","42261A"]};
export const TONOS=[["clara","Clara","#F2C8A7"],["base","Media","#F09C6B"],["triguena","Trigueña","#DFA67B"],["morena","Morena","#C4824F"],["oscura","Oscura","#A26340"],["muyoscura","Muy oscura","#824F34"]];
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
/* 2.1.3: peinados nuevos, los del creador de personajes del juego (herramientas/peinados.py) */
export const PEINADOS={m:[["base","Medio"],["corto","Corto"],["ondulado","Ondulado"],["rulos","Rulos"],["lacio","Lacio"],["rapado","Rapado"]],
  f:[["base","Colita"],["suelto","Suelto"],["corto","Carré"],["ondas","Ondas"],["trenza","Trenza"],["flequillo","Flequillo"],["rodete","Rodete"]]};   // rodete: solo la mayor (2.3.1)

/* 2.3.1: edades, todas de PixelLab (herramientas/edades_pixellab.py). Adulto y mayor: la cabeza de la edad (PixelLab editó el
   dibujo del joven) sobre toda la ropa laica del joven; niño y niña: dibujo propio, más bajo, con base, buzo, remera, deportiva
   y pollera. La mayor tiene dos peinados (anteojos y rodete). 2.6: consagrados también adultos y mayores (herramientas/consagrados_edades.py). */
export const EDADES=[["nino","Niño"],["joven","Joven"],["adulto","Adulto"],["mayor","Mayor"]];
export const EDADES_F={nino:"Niña",joven:"Joven",adulto:"Adulta",mayor:"Mayor"};
const HOJAS=["m","f","m_nino","f_nino","m_adulto","f_adulto","m_mayor","f_mayor"];
/* 2.6: barbas (él) y caras (él y ella) del joven. Son capas de PixelLab sobre la cara de siempre (herramientas/caras_barbas.py →
   extras.png y «extras» en pj.json): solo lo que cambia. La piel de la capa toma el tono elegido; la barba, las cejas y los anteojos no. */
export const BARBAS=[["no","Sin barba"],["corta","Corta"],["candado","Candado"],["bigote","Bigote"],["completa","Larga"]];
export const CARAS={m:[["base","Clásica"],["anteojos","Anteojos"],["pecas","Pecas"],["cejas","Cejas marcadas"]],f:[["base","Clásica"],["anteojos","Anteojos"],["pecas","Pecas"],["rubor","Rubor"]]};
let EXTRA=null;
const capa=(h,tipo,v)=>{ const e=META&&META.extras&&EXTRA&&(h==="m"||h==="f")&&META.extras[h]; return e&&e[tipo]&&e[tipo][v]!=null?e[tipo][v]:null; };
/* las edades que se ofrecen (2.3.1: se ocultaron las de Gemini y volvieron rehechas en PixelLab) */
export const EDADES_LISTAS=["nino","joven","adulto","mayor"];
const hojaDe=(sx,edad)=>edad&&edad!=="joven"?sx+"_"+edad:sx;
let META=null; const HOJA={}, PIEL={}; let listo=null;
function cargarImg(src){ return new Promise((ok,mal)=>{ const im=new Image(); im.onload=()=>ok(im); im.onerror=mal; im.src=src; }); }
export function cargar(base){ if(listo) return listo; base=base||"assets/personaje/";
  listo=(async()=>{ META=await (await fetch(base+"pj.json")).json();
    await Promise.all(HOJAS.filter(h=>META[h]).map(async h=>{ try{ HOJA[h]=await cargarImg(base+h+".png"); }catch(e){ if(h.length===1) throw e; delete META[h]; } }));
    await Promise.all(HOJAS.filter(h=>META[h]).map(async h=>{ try{ PIEL[h]=await cargarImg(base+h+"_piel.png"); }catch(e){} }));   // sin la máscara, tono original
    if(META.extras){ try{ const im=await cargarImg(base+"extras.png"), c=document.createElement("canvas"); c.width=im.width; c.height=im.height; const x=c.getContext("2d"); x.drawImage(im,0,0); EXTRA={w:im.width,d:x.getImageData(0,0,im.width,im.height).data}; }catch(e){ EXTRA=null; } }   // sin la hoja, no se ofrecen
    return true; })();
  return listo; }
export const cargado=()=>!!(META&&HOJA.m&&HOJA.f);

/* qué hay dibujado: solo se ofrecen las combinaciones que existen (pj.json) */
const hay=(h,prenda,peinado)=>!!(META&&META[h]&&META[h].combos[prenda+"|"+peinado]);
const hayAlgo=(h,pred)=>!!META&&!!META[h]&&Object.keys(META[h].combos).some(k=>pred(...k.split("|")));
export function opciones(P){ if(!META) return {peinados:[],prendas:[],colores:[],edades:[],barbas:[],caras:[]}; const sx=P.hoja, sxx=P.sx;
  const barbas=BARBAS.filter(b=>b[0]==="no"||capa(sx,"barba",b[0])!=null), caras=CARAS[sxx].filter(c=>c[0]==="base"||capa(sx,"cara",c[0])!=null);
  const edades=EDADES.filter(e=>EDADES_LISTAS.includes(e[0])&&META[hojaDe(sxx,e[0])]).map(e=>[e[0],sxx==="f"?EDADES_F[e[0]]:e[1]]);
  const peinados=P.velo?[]:PEINADOS[sxx].filter(h=>hayAlgo(sx,(pr,pe)=>pe===h[0]&&pr.split(":")[0]===P.tipo));
  const prendas=PRENDAS[sxx].filter(x=>hayAlgo(sx,pr=>pr.split(":")[0]===x[0]));
  const colores=P.color?COLORES.filter(c=>hay(sx,P.tipo+":"+c[0],P.peinado)):[];
  return {peinados,prendas,colores,edades,barbas:barbas.length>1?barbas:[],caras:caras.length>1?caras:[]}; }

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
  return { sx, tipo:t, color:c, prenda:c?t+":"+c:t, peinado:pe, velo:VELO.includes(t), fijo:!!FIJO[t], alt:ok(ALTURAS,p.alt,"media"), tono:ok(TONOS,p.tono,"base"), edad, hoja:h,
    barba:capa(h,"barba",p.barba)!=null?p.barba:"no", cara:capa(h,"cara",p.cara)!=null?p.cara:"base" }; }
/* 2.6: pone la cara y la barba elegidas sobre el cuadro (antes de teñir). Devuelve, para cada punto que tocó, si es piel (1) o no (2).
   La cara solo se pone donde la cara está a la vista (piel, o igual a la cara base): un flequillo no se pisa. La barba va siempre. */
function capas(x, P, k){ const ic=capa(P.hoja,"cara",P.cara), ib=capa(P.hoja,"barba",P.barba); if(ic==null&&ib==null) return null;
  const [X0,Y0,N]=META.extras.caja, [dx,dy]=k.cara||[0,0], E=EXTRA.d, W=EXTRA.w, ref=META.extras[P.hoja].ref;
  const im=x.getImageData(0,0,128,128), d=im.data, ov=new Uint8Array(128*128); let m=null;
  if(PIEL[P.hoja]){ const mc=document.createElement("canvas"); mc.width=128; mc.height=128; const mx=mc.getContext("2d"); mx.drawImage(PIEL[P.hoja],0,k.fila*128,128,128,0,0,128,128); m=mx.getImageData(0,0,128,128).data; }
  const poner=(celda,cuidar)=>{ for(let y=0;y<N;y++) for(let xx=0;xx<N;xx++){ const e=((celda*N+y)*W+xx)*4; if(!E[e+3]) continue;
      const px=X0+xx+dx, py=Y0+y+dy; if(px<0||py<0||px>127||py>127) continue; const j=py*128+px, i=j*4; if(!d[i+3]) continue;
      if(cuidar&&!(m&&m[i]>=128)){ const r=((ref*N+y)*W+xx)*4; if(Math.abs(d[i]-E[r])+Math.abs(d[i+1]-E[r+1])+Math.abs(d[i+2]-E[r+2])>40) continue; }
      d[i]=E[e]; d[i+1]=E[e+1]; d[i+2]=E[e+2]; ov[j]=E[e+N*4]>=128?1:2; } };
  if(ic!=null) poner(ic,true); if(ib!=null) poner(ib,false);
  x.putImageData(im,0,0); return ov; }
/* tiñe la piel del cuadro ya pintado (antes de cambiar la altura, para que la máscara coincida) */
function tenir(x, P, fila, ov){ if(P.tono==="base"||!PIEL[P.hoja]||!RAMPAS[P.tono]) return;
  const RP=RAMPAS[P.tono].map(h=>[0,2,4].map(i=>parseInt(h.slice(i,i+2),16))), [L0,L1]=(META[P.hoja]&&META[P.hoja].luz)||[90,200], n=RP.length-1;
  const mc=document.createElement("canvas"); mc.width=128; mc.height=128; const mx=mc.getContext("2d"); mx.drawImage(PIEL[P.hoja],0,fila*128,128,128,0,0,128,128);
  const m=mx.getImageData(0,0,128,128).data, im=x.getImageData(0,0,128,128), d=im.data;
  for(let i=0;i<d.length;i+=4){ const o=ov?ov[i>>2]:0; if((o?o!==1:m[i]<128)||!d[i+3]) continue;
    const L=.299*d[i]+.587*d[i+1]+.114*d[i+2]; const t=Math.pow(Math.min(1,Math.max(0,(L1-L)/(L1-L0))),1.25)*n, a=Math.floor(t), b=Math.min(a+1,n), f=t-a;
    const k=L<L0?Math.max(.62,.62+.38*L/L0):1;   /* 2.6: el contorno de la piel (más oscuro que su sombra) también toma el tono, un poco más oscuro */
    for(let c=0;c<3;c++) d[i+c]=Math.round((RP[a][c]*(1-f)+RP[b][c]*f)*k); }
  x.putImageData(im,0,0); }

function combo(P){ const C=META[P.hoja].combos; return C[P.prenda+"|"+P.peinado]||C["base|base"]; }

/* pinta en un <canvas> el dibujo tal cual: el lienzo queda a 128 y el tamaño en pantalla se ajusta para que cada píxel sea entero */
export function pintar(cv, perfil, vista, cssObjetivo){
  if(!cargado()) return false; const P=normal(perfil), v=0, k=combo(P);
  /* 2.4: el mismo personaje no se vuelve a armar en cada pantalla (teñir la piel y cambiar la altura recorre los 16.000 puntos):
     el dibujo ya armado se guarda y después solo se copia. */
  const clave=P.hoja+"|"+k.fila+"|"+P.tono+"|"+P.alt+"|"+P.barba+"|"+P.cara, listo=HECHOS.get(clave);
  cv.width=128; cv.height=128; const x=cv.getContext("2d"); x.imageSmoothingEnabled=false; x.clearRect(0,0,128,128);
  if(listo){ x.drawImage(listo,0,0); tamano(cv,cssObjetivo); return true; }
  x.drawImage(HOJA[P.hoja],v*128,k.fila*128,128,128,0,0,128,128);
  tenir(x,P,k.fila,capas(x,P,k));
  /* altura: se repiten (alta) o se sacan (baja) tres filas enteras, una del torso y dos de las piernas; la cara y los pies no se tocan */
  if(P.alt!=="media"){ const im=x.getImageData(0,0,128,128), d=im.data; let top=128, bot=-1;
    for(let y=0;y<128;y++) for(let xx=0;xx<128;xx++) if(d[(y*128+xx)*4+3]){ if(y<top) top=y; if(y>bot) bot=y; }
    if(bot>top){ const h=bot-top, lugar=P.alt==="alta"?Math.min(3,top+127-bot):3, esp=[Math.round(top+h*0.40),Math.round(top+h*0.63),Math.round(top+h*0.82)].slice(0,lugar);
      const filas=[]; for(let y=0;y<128;y++){ const e=esp.includes(y); if(P.alt==="baja"&&e) continue; filas.push(y); if(P.alt==="alta"&&e) filas.push(y); }
      const out=new Uint8ClampedArray(128*128*4), sobra=filas.length-128, off=sobra>0?Math.min(sobra,top):sobra;   // al crecer se usa el aire de arriba (nunca se corta la cabeza)
      for(let y=0;y<128;y++){ const src=filas[y+off]; if(src==null) continue; out.set(d.subarray(src*512,src*512+512),y*512); }
      x.putImageData(new ImageData(out,128,128),0,0); } }
  try{ const c=document.createElement("canvas"); c.width=128; c.height=128; c.getContext("2d").drawImage(cv,0,0); if(HECHOS.size>60) HECHOS.clear(); HECHOS.set(clave,c); }catch(e){}
  tamano(cv,cssObjetivo); return true; }
const HECHOS=new Map();
function tamano(cv,cssObjetivo){ if(cssObjetivo){ const dpr=window.devicePixelRatio||1; const s=Math.max(1,Math.round(cssObjetivo*dpr/128)); const css=128*s/dpr; cv.style.width=css+"px"; cv.style.height=css+"px"; } }

/* el cuadro como ImageData (para las hojas de control) */
export function cuadro(perfil, vista){ const cv=document.createElement("canvas"); if(!pintar(cv,perfil,vista)) return null; return cv.getContext("2d").getImageData(0,0,128,128); }
