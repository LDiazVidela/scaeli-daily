/* Daily 2.2 · rezar con audio (Scaeli+).
   Música para rezar hecha en el momento con Web Audio (sin archivos, sin derechos de terceros): órgano suave, noche y
   silencio con campana. Y la voz para el Rosario guiado: la del sistema (speechSynthesis) o, en la app nativa, el plugin
   TextToSpeech de Capacitor si está instalado. */

let ctx=null, master=null, verb=null, timers=[], voces=[], estado=null, finT=null, onCambio=()=>{};

function abrir(){ if(ctx) { if(ctx.state==="suspended") ctx.resume(); return ctx; }
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return null; ctx=new AC();
  master=ctx.createGain(); master.gain.value=0; const comp=ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
  // reverberación de iglesia: un impulso de ruido que se apaga en 4 segundos
  verb=ctx.createConvolver(); const n=ctx.sampleRate*4, b=ctx.createBuffer(2,n,ctx.sampleRate);
  for(let c=0;c<2;c++){ const d=b.getChannelData(c); for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.6); }
  verb.buffer=b; const vg=ctx.createGain(); vg.gain.value=.55; verb.connect(vg); vg.connect(master); return ctx; }
const hz=m=>440*Math.pow(2,(m-69)/12);

/* una nota sostenida: tubos de órgano (8' + 4' + quinta suave) con un filtro que la redondea */
function tubo(m,t0,dur,vol,brillo,dest){ const g=ctx.createGain(), f=ctx.createBiquadFilter(); f.type="lowpass"; f.frequency.value=brillo; f.Q.value=.4;
  g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(vol,t0+2.2); g.gain.setValueAtTime(vol,t0+dur-2.4); g.gain.linearRampToValueAtTime(0,t0+dur+.2);
  [[1,"sine",1],[2,"triangle",.32],[3,"sine",.12],[1.003,"sine",.5]].forEach(([k,tipo,a])=>{ const o=ctx.createOscillator(), ga=ctx.createGain(); o.type=tipo; o.frequency.value=hz(m)*k; ga.gain.value=a; o.connect(ga); ga.connect(f); o.start(t0); o.stop(t0+dur+.4); voces.push(o); });
  f.connect(g); g.connect(dest); g.connect(verb); }

/* la campana: parciales inarmónicos que se apagan despacio */
export function campana(vol=.5){ if(!abrir()) return; const t=ctx.currentTime+.05; if(!estado) master.gain.setTargetAtTime(.9,ctx.currentTime,.05);
  [[.5,1,7],[1,.8,5],[1.19,.45,4],[1.56,.35,3.4],[2,.5,3],[2.51,.25,2.4],[3,.2,2],[4.07,.12,1.4]].forEach(([k,a,dec])=>{ const o=ctx.createOscillator(), g=ctx.createGain(); o.type="sine"; o.frequency.value=hz(64)*k;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(a*vol*.35,t+.008); g.gain.exponentialRampToValueAtTime(.0001,t+dec); o.connect(g); g.connect(master); g.connect(verb); o.start(t); o.stop(t+dec+.1); }); }

const PIEZAS={
  /* órgano suave: un coral en re mayor que va y viene, ocho segundos por acorde */
  organo:{ n:"Órgano suave", acordes:[[50,62,66,69],[47,62,67,71],[43,59,67,71],[45,61,64,69],[50,62,66,69],[43,62,67,71],[45,61,67,69],[50,57,62,66]], dur:8, vol:.055, brillo:1900 },
  /* noche: acordes graves en la menor, más oscuros, con alguna nota alta como una estrella */
  noche:{ n:"Noche", acordes:[[45,57,60,64],[41,57,60,65],[48,55,60,64],[43,55,59,62]], dur:11, vol:.05, brillo:700, estrellas:[76,79,81,84,88] },
  /* silencio: solo la campana al empezar y al terminar */
  campana:{ n:"Silencio con campana" }
};
export const MUSICAS=[["organo","Órgano suave","Un coral lento, como en la iglesia vacía"],["noche","Noche","Acordes graves y alguna estrella, para la oración de la noche"],["campana","Silencio con campana","Una campana para empezar y otra para terminar"]];

function programar(P,desde){ let t=desde, i=0; const lote=()=>{ if(!estado||estado.k!==P.k) return; const fin=ctx.currentTime+20;
    while(t<fin){ const A=P.acordes[i%P.acordes.length]; A.forEach((m,j)=>tubo(m,t,P.dur+2.2,P.vol*(j===0?1.15:1),P.brillo,master));
      if(P.estrellas&&Math.random()<.6){ const s=P.estrellas[Math.floor(Math.random()*P.estrellas.length)], ts=t+2+Math.random()*(P.dur-3), o=ctx.createOscillator(), g=ctx.createGain(); o.type="sine"; o.frequency.value=hz(s); g.gain.setValueAtTime(0,ts); g.gain.linearRampToValueAtTime(.018,ts+.6); g.gain.exponentialRampToValueAtTime(.0001,ts+5); o.connect(g); g.connect(verb); o.start(ts); o.stop(ts+5.2); }
      t+=P.dur; i++; }
    voces=voces.slice(-400);   // las viejas ya se apagaron solas
    timers.push(setTimeout(lote,8000)); };
  lote(); }

/* empezar: k = organo | noche | campana; min = minutos (0 = sin fin). Al terminar suena la campana y se apaga solo. */
export function musicaPlay(k,min){ if(!abrir()) return false; musicaStop(true); const P={...PIEZAS[k],k}; if(!P.n) return false;
  estado={k,n:P.n,ini:Date.now(),fin:min?Date.now()+min*60000:0};
  master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(.9,ctx.currentTime,.3);
  if(k==="campana") campana(); else programar(P,ctx.currentTime+.1);
  if(min) finT=setTimeout(()=>{ campana(.6); setTimeout(()=>musicaStop(),k==="campana"?7000:4000); },min*60000);
  onCambio(); return true; }
export function musicaStop(silencioso){ timers.forEach(clearTimeout); timers=[]; clearTimeout(finT); finT=null;
  if(ctx&&master){ const t=ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value,t); master.gain.linearRampToValueAtTime(0,t+1.2);
    const vv=voces; voces=[]; setTimeout(()=>vv.forEach(o=>{ try{ o.stop(); }catch(e){} }),1400); }
  const habia=!!estado; estado=null; if(habia&&!silencioso) onCambio(); }
export const musicaEstado=()=>estado;
export function musicaAlCambiar(f){ onCambio=f||(()=>{}); }

/* ── la voz: speechSynthesis en el navegador; en la app nativa, el plugin TextToSpeech si está ── */
const TTS=()=>{ const C=window.Capacitor; return C&&C.isNativePlatform&&C.isNativePlatform()&&C.Plugins&&C.Plugins.TextToSpeech?C.Plugins.TextToSpeech:null; };
export const vozDisponible=()=>!!TTS()||("speechSynthesis" in window&&typeof window.SpeechSynthesisUtterance==="function");
let vozId=0;
function vozElegida(){ try{ const V=speechSynthesis.getVoices()||[]; return V.find(v=>/^es[-_]AR/i.test(v.lang))||V.find(v=>/^es[-_](419|US|MX)/i.test(v.lang))||V.find(v=>/^es/i.test(v.lang))||null; }catch(e){ return null; } }
/* decir un texto; fin() se llama cuando termina de hablar (no si se cortó) */
export function decir(txt,fin){ const id=++vozId; const listo=()=>{ if(id===vozId&&fin) fin(); };
  const T=TTS(); if(T){ T.stop&&T.stop().catch(()=>{}); T.speak({text:txt,lang:"es-AR",rate:.92,pitch:1}).then(listo).catch(()=>{}); return; }
  if(!("speechSynthesis" in window)) return; try{ speechSynthesis.cancel(); }catch(e){}
  // el navegador corta los textos largos: se dicen por frases, una detrás de otra
  const partes=String(txt).replace(/\s+/g," ").match(/[^.;:!?]+[.;:!?»]*\s*/g)||[txt]; let i=0;
  const sig=()=>{ if(id!==vozId) return; if(i>=partes.length){ listo(); return; } const u=new SpeechSynthesisUtterance(partes[i++].trim()); const v=vozElegida(); if(v) u.voice=v; u.lang=v?v.lang:"es-AR"; u.rate=.92; u.onend=sig; u.onerror=()=>{}; speechSynthesis.speak(u); };
  sig(); }
export function callar(){ vozId++; const T=TTS(); if(T&&T.stop) T.stop().catch(()=>{}); try{ if("speechSynthesis" in window) speechSynthesis.cancel(); }catch(e){} }
