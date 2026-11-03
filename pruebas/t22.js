// guía del celebrante en varias fechas + examen capitales
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs=[]; const ok=(c,m)=>{ if(!c) errs.push('FALLA '+m); };
  async function dia(fecha,shot,checks){ const ctx=await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2 }); const p=await ctx.newPage(); await p.clock.setFixedTime(new Date(fecha));
    p.on('pageerror', e => errs.push('PAGEERROR '+fecha+' '+e.message));
    await p.goto('http://localhost:8765/index.html'); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1200); await p.click('#invitado'); await p.waitForTimeout(1200);
    await p.evaluate(()=>window.DAILY.ACC.misa()); await p.waitForTimeout(1500); const t=await p.textContent('#sheet');
    for(const c of checks) ok(t.includes(c),fecha+' falta «'+c+'» en: '+t.slice(0,400));
    if(shot){ await p.screenshot({path:shot}); await p.evaluate(()=>{ document.querySelector('#sheet .scroll').scrollTop=700; }); await p.waitForTimeout(150); await p.screenshot({path:shot.replace('.png','b.png')}); }
    await ctx.close(); return t; }
  await dia('2026-10-31T09:00:00-03:00','m_hoy.png',['Sábado de la XXX Semana','Gloria','Credo','No','Verde','común I a VI','Santa María en sábado']);
  await dia('2026-11-01T09:00:00-03:00','m_santos.png',['Todos los Santos','Solemnidad','La gloria de la Jerusalén celestial','I o III','Ciclo A']);
  await dia('2026-12-13T09:00:00-03:00',null,['Gaudete','Rosa','de Adviento I','rosa']);
  await dia('2026-12-20T09:00:00-03:00',null,['de Adviento II','Ciclo B']);
  await dia('2027-02-10T09:00:00-03:00',null,['Ceniza','imposición de la ceniza','Cuaresma III o IV','sin Aleluya']);
  await dia('2027-03-26T09:00:00-03:00',null,['no se celebra la Misa']);
  await dia('2027-03-28T09:00:00-03:00',null,['Pascua','Secuencia obligatoria','doble aleluya']);
  await dia('2027-05-16T09:00:00-03:00',null,['Pentecostés','propio: El misterio de Pentecostés','Secuencia obligatoria']);
  await dia('2027-03-25T09:00:00-03:00',null,['Jueves Santo','Canon romano']);
  await dia('2026-11-02T09:00:00-03:00',null,['tres Misas']);
  // examen
  const ctx=await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2 }); const p=await ctx.newPage(); p.on('pageerror', e => errs.push('PAGEERROR '+e.message));
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1200); await p.click('#invitado'); await p.waitForTimeout(1200);
  const A = async (a, q, ms = 400) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  await A('examen'); for(let i=0;i<3;i++) await A('exPaso','1'); let t=await p.textContent('#sheet'); ok(t.includes('Los siete pecados capitales')&&t.includes('Soberbia')&&t.includes('La sana la humildad'),'examen diario capitales');
  await A('exNo','Soberbia'); ok(await p.$('.hq.cap button.on'),'marca'); await p.screenshot({path:'x_cap.png'});
  await A('cerrar'); await A('exConf'); t=await p.textContent('#sheet'); ok(t.includes('Capitales')&&t.includes('Mi vida')&&t.includes('Mandamientos'),'modo');
  await A('confModo','cap'); await A('hojaPaso','1'); t=await p.textContent('#sheet'); ok(t.includes('Soberbia'),'pag soberbia'); await A('hojaQ','1'); 
  for(let i=0;i<7;i++) await A('hojaPaso','1',250); t=await p.textContent('#sheet'); ok(t.includes('Quise imponer siempre mi opinión'),'hoja con capital'); await p.screenshot({path:'x_hoja.png'});
  await A('hojaPaso','-1',200); for(let i=0;i<8;i++) await A('hojaPaso','-1',150); await A('confModo','man'); await A('hojaPaso','1'); t=await p.textContent('#sheet'); ok(t.includes('Primer mandamiento')&&!/putear/.test(t),'mandamientos sin malas palabras'); for(let i=0;i<9;i++) await A('hojaPaso','-1',120); await A('confModo','vida'); await A('hojaPaso','1'); t=await p.textContent('#sheet'); ok(t.includes('Mi relación con Dios')&&t.includes('solamente cuando necesito algo'),'Mi vida (material de Lorenzo)');
  // hoja vieja por número
  await p.evaluate(()=>localStorage.setItem('daily_hoja',JSON.stringify({m:{"0":[1]},n:{"0":"viejo"},u:""}))); await A('cerrar'); await A('exConf'); await A('confModo','man'); for(let i=0;i<11;i++) await A('hojaPaso','1',150);
  t=await p.textContent('#sheet'); ok(t.includes('viejo')&&t.includes('Primer mandamiento'),'migra hoja vieja');
  console.log('T22',errs.join('\n')||'OK'); await b.close(); })();
