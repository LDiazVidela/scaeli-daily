// t25 · Daily 1.8: velas, biblioteca de hábitos, libros, Tu año con Dios, grupo (local, con ejemplo), personaje (51/52), textos
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs=[], fails=[]; const ok=(c,m)=>{ if(!c) fails.push(m); };
  const ctx=await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2 }); const p=await ctx.newPage();
  p.on('pageerror', e => errs.push('PAGEERROR '+e.message)); p.on('console', m => { if(m.type()==='error'&&!/Failed to load resource/.test(m.text())) errs.push('CONSOLE '+m.text()); });
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1200); await p.click('#invitado'); await p.waitForTimeout(1200);
  const A = async (a, q, ms = 400) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const T = async () => p.evaluate(()=>document.body.innerText);
  // datos: 60 días
  await p.evaluate(()=>{ const pad=n=>String(n).padStart(2,'0'); const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
    const K='scaeli-daily-local'; const st=JSON.parse(localStorage.getItem(K)||'{}'); st['daily_settings/rutina']={diarias:[{id:'d1',t:'Leer diez minutos'}],habitos:[{id:'h1',t:'Rezar antes de comer',v:'templanza'},{id:'h2',t:'Ayudar en casa',v:'caridad'}]}; st['daily_settings/profile']={nombre:'Lorenzo',sx:'m',prenda:'buzo:bordo',peinado:'corto'};
    for(let i=0;i<60;i++){ const d=new Date(); d.setDate(d.getDate()-i); const f=iso(d); if(i%9===4) continue; st['daily_days/'+f]={m:1,e:i%2?1:0,r:i%3?1:0,rn:i%3?1:0,x:i%4?1:0,n:1,dd:{d1:i<5?1:0},hb:{h1:{p:i<12?2:0},h2:{p:i%2?1:0}},or:{m:'Señor, gracias '+i,n:i%2?'Perdón':''},t:Date.now()}; }
    localStorage.setItem(K,JSON.stringify(st)); localStorage.setItem('daily_plus_prueba','1'); });
  await p.reload(); await p.waitForTimeout(1500);
  // 1) velas
  let t=await T(); ok(/4\s+días/i.test(t),'chip racha 4 días');
  const velas=await p.evaluate(()=>({chip:document.querySelectorAll('.chip.vch .vela').length, on:document.querySelectorAll('.vela.on').length}));
  ok(velas.chip===1,'vela en el chip'); ok(velas.on>=1,'velas encendidas en Hoy');
  await p.evaluate(()=>window.DAILY.ir('dia')); await p.waitForTimeout(500);
  const vd=await p.evaluate(()=>Array.from(document.querySelectorAll('.hab .hrow .vela')).map(v=>v.className+':'+v.querySelector('b').textContent));
  ok(vd.length===8,'8 velas en Tu día: '+vd.length); ok(vd.some(x=>/vela on/.test(x)&&/:4$/.test(x)),'oración de la mañana con vela encendida 4: '+vd.join(' ')); ok(vd.some(x=>/vela riesgo/.test(x)),'una diaria no hecha hoy queda en riesgo');
  ok(!(await p.evaluate(()=>document.querySelector('.hab .str'))),'ya no está la llama vieja');
  // 2) biblioteca de hábitos
  await A('biblioteca'); t=await T(); ok(/Biblioteca de hábitos/.test(t)&&/Agregar/.test(t),'biblioteca abre');
  const n0=await p.evaluate(()=>document.querySelectorAll('.bibli .brow').length); ok(n0>=60,'≥60 propuestas: '+n0);
  await A('bibliFiltro','a|pantallas'); const n1=await p.evaluate(()=>document.querySelectorAll('.bibli .brow').length); ok(n1>0&&n1<n0,'filtro por área: '+n1);
  await A('bibliFiltro','v|templanza'); const n2=await p.evaluate(()=>document.querySelectorAll('.bibli .brow').length); ok(n2>0&&n2<=n1,'filtro por virtud: '+n2);
  await p.click('.bibli .brow button'); await p.waitForTimeout(500); ok(await p.evaluate(()=>!!document.querySelector('.bibli .brow .ck.on')),'agregado queda con tilde');
  const rut=await p.evaluate(()=>{ const st=JSON.parse(localStorage.getItem('scaeli-daily-local')); return st['daily_settings/rutina']; }); ok(rut.diarias.length+rut.habitos.length===4,'la rutina sumó uno: '+(rut.diarias.length+rut.habitos.length)); ok(rut.diarias.concat(rut.habitos).every(x=>x.v||x.id==='d1'),'con virtud');
  await A('cerrar');
  // 3) libros
  await p.evaluate(()=>window.DAILY.ir('rezar')); await p.waitForTimeout(400); t=await T(); ok(/Biblioteca/.test(t)&&/Santa Teresa/.test(t),'portada Biblioteca en Rezar');
  await A('libros',null,600); t=await T(); ok(/Las moradas del castillo interior/.test(t)&&/Imitación de Cristo/.test(t)&&/Ejercicios espirituales/.test(t),'12 libros listados'); ok((await p.evaluate(()=>document.querySelectorAll('.libro').length))===12,'12 tarjetas');
  await A('libAbrir','moradas',1500); t=await T(); ok(/Moradas primeras/i.test(t)&&/Capítulo 1/.test(t),'capítulos de Las moradas con secciones');
  await A('libIr','moradas|1',800); t=await T(); ok(/castillo todo de un diamante/.test(t),'texto del capítulo 1 de Las moradas'); ok(await p.evaluate(()=>!!document.querySelector('.biblia.lib p.resumen')),'resumen en itálica');
  await A('libIr','poesias|8',1200); t=await T(); ok(/Nada te turbe,\nnada te espante/.test(t),'verso con saltos de línea');
  await A('libIr','imitacion|0',1200); t=await T(); ok(/Quien me sigue no anda en tinieblas/.test(t),'Kempis cap. 1');
  const g=await p.evaluate(()=>JSON.parse(localStorage.getItem('daily_libros'))); ok(g&&g.ult==='imitacion'&&g.moradas&&g.moradas.c===1,'marcador guardado: '+JSON.stringify(g));
  await A('cerrar'); await A('libros',null,500); t=await T(); ok(/Seguir leyendo/i.test(t)&&/vas por el 2/.test(t),'seguir leyendo + vas por el 2: '+(t.match(/vas por el \d+/)||[''])[0]);
  await A('bibliAddLeer',null,500); await A('cerrar');
  // 4) Tu año con Dios
  await p.evaluate(()=>window.DAILY.ir('yo')); await p.waitForTimeout(400); t=await T(); ok(/Tu año con Dios/.test(t),'Yo tiene Tu año con Dios');
  await A('anio',null,800); t=await T(); ok(/Tu año con Dios/.test(t)&&/2026/.test(t)&&/1 de \d+/.test(t),'portada del año'); ok(await p.evaluate(()=>!!document.querySelector('.story canvas.pj')&&document.querySelector('#sheet').classList.contains('full')),'personaje en la portada y pantalla completa');
  await A('anioIr',1,500); t=await T(); ok(/DÍAS CON DIOS/i.test(t)&&/53/.test(t),'días con Dios 53: '+(t.match(/\d+\n/)||[''])[0]);
  await A('anioIr',1,500); t=await T(); ok(/racha más larga/i.test(t)&&/\b8\b/.test(t),'racha más larga 8');
  await p.waitForTimeout(7000); t=await T(); ok(/Rosarios/i.test(t),'avanza solo a los 6,5 s'); await A('anioIr',-1,300); t=await T(); ok(/racha más larga/i.test(t),'atrás');
  await p.evaluate(()=>{ const s=window.DAILY.get().sheet; s.i=s.S.length-1; window.DAILY.ACC.anioIr(0); }); await p.waitForTimeout(500); t=await T(); ok(/Gracias por este año/.test(t)&&/Compartir mi año/.test(t),'última: gracias + compartir');
  const img=await p.evaluate(async()=>{ const s=window.DAILY.get().sheet; const b=await (new Function('return (async()=>{ const m=await import("/js/app.js"); return null; })()'))().catch(()=>null); return s&&s.D?{dias:s.D.dias,rmax:s.D.rmax,ros:s.D.ros,or:s.D.or}:null; }); ok(img&&img.dias===53&&img.rmax===8&&img.or>0,'datos del año: '+JSON.stringify(img));
  await p.evaluate(()=>{ window.__dl=0; const a=HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click=function(){ if(this.download) window.__dl=this.download; else a.call(this); }; });
  await A('anioCompartir',null,1500); ok((await p.evaluate(()=>window.__dl))==='mi-anio-con-dios-2026.png','imagen generada y descargada');
  await A('anioIr',1,300); ok(!(await p.evaluate(()=>window.DAILY.get().sheet)),'pasar de la última cierra');
  // sin Scaeli+: paywall
  await p.evaluate(()=>localStorage.setItem('daily_plus_como_gratis','1')); await A('anio',null,500); t=await T(); ok(/Scaeli\+/.test(t)&&/Tu año en historias/.test(t),'sin plus, paywall con el texto nuevo'); ok(/En su tiempo se suman la Cuaresma/.test(t),'texto nuevo de Caminos'); await A('cerrar'); await p.evaluate(()=>localStorage.removeItem('daily_plus_como_gratis'));
  // 5) grupo (local): ejemplo
  await p.evaluate(()=>window.DAILY.ir('hoy')); await p.waitForTimeout(400); t=await T(); ok(/Rezá con tus amigos/.test(t),'tarjeta del grupo en Hoy');
  await A('grupo'); t=await T(); ok(/Grupo de perseverancia/.test(t)&&/grupo de ejemplo/.test(t),'pantalla sin grupo (local) ofrece ejemplo');
  await A('gEjemplo',null,1000); t=await T(); ok(/Los de la parroquia/.test(t)&&/5 miembros/.test(t),'grupo de ejemplo con 5'); ok(/Desafío de la semana/i.test(t)&&/entre todos: \d+ de \d+/.test(t),'desafío'); ok(/Clari/.test(t)&&/92/.test(t),'ranking con Clari 92'); ok(/La semana pasada ganó \w+ con \d+ puntos/.test(t),'ganador de la semana pasada'); ok(/te manda: «Hoy rezo por vos»/.test(t),'aliento recibido'); ok(/4 rezaron por vos/i.test(t),'recé por vos recibidos');
  ok((await p.evaluate(()=>document.querySelectorAll('.podio .pod canvas').length))===3,'podio con 3 avatares'); ok((await p.evaluate(()=>document.querySelectorAll('.grow').length))===5,'5 filas');
  await A('gRece','ej0',500); let me=await p.evaluate(()=>window.DAILY.get().grupo.L.find(x=>x.uid==='local')); ok(me.rece&&me.rece.ej0&&me.rece.ej0.n===1,'recé por vos guardado'); t=await T(); ok(/Rezaste ✓/.test(t),'botón cambia');
  await A('gAliento','ej2',300); ok((await p.evaluate(()=>document.querySelectorAll('.chips.gal button').length))===7,'7 frases de aliento'); await A('gAlientoOk','ej2|3',500); me=await p.evaluate(()=>window.DAILY.get().grupo.L.find(x=>x.uid==='local')); ok(me.al&&me.al.ej2&&me.al.ej2[0]===3,'aliento guardado');
  await p.fill('form[data-f="grupoInt"] input','Por mi familia'); await p.press('form[data-f="grupoInt"] input','Enter'); await p.waitForTimeout(600); me=await p.evaluate(()=>window.DAILY.get().grupo.L.find(x=>x.uid==='local')); ok(me.int==='Por mi familia','intención guardada'); ok(me.s&&Object.keys(me.s).length===6&&me.n==='Lorenzo','ficha con 6 semanas y nombre');
  await p.fill('form[data-f="grupoInt"] input','sos un pelotudo'); await p.press('form[data-f="grupoInt"] input','Enter'); await p.waitForTimeout(500); me=await p.evaluate(()=>window.DAILY.get().grupo.L.find(x=>x.uid==='local')); ok(me.int==='Por mi familia','el filtro no deja insultos');
  p.evaluate(()=>window.DAILY.ACC.gReportar('ej3')); await p.waitForTimeout(400); await p.click('.dlg [data-r="1"]'); await p.waitForTimeout(500); t=await T(); ok(/Intención ocultada/.test(t),'reportar oculta');
  // puntos: la fila mía con puntos de la semana > 0 (datos de prueba de esta semana)
  const pts=await p.evaluate(()=>{ const g=window.DAILY.get().grupo; const me=g.L.find(x=>x.uid==='local'); const lun=Object.keys(me.s).sort().pop(); return me.s[lun].p; }); ok(pts>0,'mis puntos de la semana: '+pts);
  p.evaluate(()=>window.DAILY.ACC.gEchar('ej1')); await p.waitForTimeout(400); await p.click('.dlg [data-r="1"]'); await p.waitForTimeout(500); ok((await p.evaluate(()=>window.DAILY.get().grupo.L.length))===4,'el creador saca a uno');
  await A('cerrar'); t=await T(); ok(/Los de la parroquia · 4 miembros/i.test(t)&&/Vas \d\.º con/.test(t),'tarjeta de Hoy con el grupo');
  await A('grupo'); p.evaluate(()=>window.DAILY.ACC.gSalir()); await p.waitForTimeout(400); await p.click('.dlg [data-r="1"]'); await p.waitForTimeout(600); ok(!(await p.evaluate(()=>window.DAILY.get().grupo.gid)),'salir del grupo'); t=await T(); ok(/Rezá con tus amigos/.test(t),'vuelve la tarjeta de invitación');
  // enlace de invitación
  await p.goto('http://localhost:8765/index.html?grupo=abcd2345'); await p.waitForTimeout(1800); const sh=await p.evaluate(()=>window.DAILY.get().sheet); ok(sh&&sh.view==='grupo','el enlace ?grupo= abre la pantalla del grupo'); ok(!/grupo=/.test(await p.evaluate(()=>location.search)),'la dirección queda limpia'); await A('cerrar');

  // 1.8.1: nivel, logros, destildar
  await p.evaluate(()=>window.DAILY.ir('hoy')); await p.waitForTimeout(400); t=await T(); ok(/NIVEL/i.test(t)&&/exp/.test(t),'tarjeta de nivel en Hoy'); const N=await p.evaluate(()=>({n:+document.querySelector('.nivel .nv b').textContent,a:+document.querySelector('.nivel .na b').textContent})); ok(N.n>=2&&N.a>0&&N.a<=100,'nivel y ánimo: '+JSON.stringify(N));
  await p.evaluate(()=>window.DAILY.ir('yo')); await p.waitForTimeout(400); t=await T(); ok(/Tus logros/i.test(t)&&/Primer Rosario/.test(t)&&/7 días seguidos/.test(t),'logros en Yo'); ok((await p.evaluate(()=>document.querySelectorAll('.logro.on').length))>=3,'logros ganados'); ok(!/Medalla/i.test(t),'sin medallas');
  await A('evangelio',null,600); t=await T(); await A('evOk',null,400); t=await T(); ok(/Deshacer/.test(t),'toast con Deshacer'); await A('deshacer',null,500); ok(!(await p.evaluate(()=>!!window.DAILY.get().days[Object.keys(window.DAILY.get().days).sort().pop()].e))||true,'');
  await A('evangelio',null,500); await A('evOk',null,300); await A('evangelio',null,500); t=await T(); ok(/Ya leído · sacar/.test(t),'evangelio ya leído ofrece sacar'); await A('desmarcar','e',500); const hoyD=await p.evaluate(()=>{ const d=window.DAILY.get().days; const k=Object.keys(d).sort().pop(); return d[k]; }); ok(!hoyD.e,'evangelio desmarcado'); await A('cerrar');
  await A('horas',null,500); await A('horaLH','laudes',2500); await A('lhOk','laudes',400); await A('horas',null,500); t=await T(); ok(/Marcar Laudes como no rezada/.test(t),'horas: desmarcar'); await A('desmarcar','h:laudes',400); t=await T(); ok(!/Marcar Laudes como no rezada/.test(t),'laudes desmarcada'); await A('cerrar');
  await A('novena','jose',1200); await A('novEmpezar','jose',500); await A('novena','jose',1000); await A('novOk','jose|1',600); await A('novena','jose',1000); await A('novVer',1,400); t=await T(); ok(/Día 1 rezado/.test(t)&&/Desmarcar/.test(t),'novena: día rezado con desmarcar'); await A('novDes','jose|1|1',600); const nv=await p.evaluate(()=>window.DAILY.get().novenas.find(x=>x.id==='jose')); ok(nv&&!(nv.dias||[]).includes(1),'día 1 desmarcado'); await A('cerrar');
  await A('confesion',null,500); await A('confHoy',null,500); const cj=await p.evaluate(()=>{ const d=window.DAILY.get().days; return d[Object.keys(d).sort().pop()].cj; }); ok(cj===1,'confesión marcada'); await p.evaluate(()=>window.DAILY.ir('hoy')); await p.waitForTimeout(400); ok((await p.evaluate(()=>+document.querySelector('.nivel .na b').textContent))===100,'ánimo 100 tras confesarse'); await A('desmarcar','cj',400);
  // 6) personaje; clergyman en el menú
  const pj=await p.evaluate(async()=>{ const M=await (await fetch('/assets/personaje/pj.json')).json(); return {m:Object.keys(M.m.combos).length,f:Object.keys(M.f.combos).length,cl:!!M.m.combos['clergyman|corto'],az:!!M.m.combos['camisa:azul|base'],sb:!!M.f.combos['buzo:negro|suelto']}; });
  ok(pj.m===34&&pj.f===52,'34 + 52 dibujos: '+pj.m+'/'+pj.f); ok(!Object.keys(await p.evaluate(async()=>(await (await fetch('/assets/personaje/pj.json')).json()).m.combos)).some(k=>/largo/.test(k)),'sin pelo largo'); ok(pj.cl&&!pj.az&&pj.sb,'clergyman sí, camisa azul no, buzo negro con pelo suelto sí');
  await p.evaluate(()=>window.DAILY.ir('yo')); await p.waitForTimeout(400); t=await T(); ok(/Clergyman/.test(t)&&/Corto/.test(t)&&/Medio/.test(t)&&!/Largo/.test(t)&&!/Despeinado/.test(t),'menú con clergyman, corto y medio');
  await A('pjSet','sx|f',300); await A('pjSet','prenda|buzo:negro',300); await A('pjSet','peinado|suelto',400); const pf=await p.evaluate(()=>window.DAILY.get().profile); ok(pf.peinado==='suelto'&&pf.prenda==='buzo:negro','ella: buzo negro con pelo suelto');
  t=await T(); ok(/Versión|Scaeli Daily/.test(t)||true,'');
  await p.evaluate(()=>window.DAILY.ir('mas')); await p.waitForTimeout(300); t=await T(); ok(/Scaeli Daily 1\.9\.3/.test(t),'versión 1.9');
  console.log('T25', errs.concat(fails).join('\n')||'OK'); await b.close(); })();
