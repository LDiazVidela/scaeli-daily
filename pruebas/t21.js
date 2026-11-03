// oración personal, historial, rosario seguro/segura, horas
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs=[]; const ok=(c,m)=>{ if(!c) errs.push('FALLA '+m); };
  async function pag(fecha){ const ctx=await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2 }); const p=await ctx.newPage(); await p.clock.setFixedTime(new Date(fecha));
    p.on('pageerror', e => errs.push('PAGEERROR '+e.message)); p.on('console', m=>{ if(m.type()==='error'&&!/Failed to load resource/.test(m.text())) errs.push('CONSOLE '+m.text()); });
    await p.goto('http://localhost:8765/index.html'); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1500); await p.click('#invitado'); await p.waitForTimeout(1500); return p; }
  let p=await pag('2026-10-31T08:30:00-03:00');
  const A = async (a, q, ms = 500) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  let t=await p.textContent('#app'); ok(t.includes('Tu oración de la mañana')&&t.includes('¿Qué le querés decir a Dios'),'hero mañana'); ok(!t.includes('Señor, en tus manos pongo este día'),'sin oración inventada');
  await p.screenshot({path:'o_hoy.png'});
  await A('orar','manana',600); ok(await p.$('#orTxt'),'textarea'); await p.fill('#orTxt','Señor, gracias por este día.\nTe pido por mi familia.'); await p.screenshot({path:'o_orar.png'});
  await A('orGuardar',null,700); t=await p.textContent('#app'); ok(t.includes('Seguir escribiendo'),'hero ya escrito');
  // datos viejos para comparar
  await p.evaluate(async()=>{ const D=window.DAILY; const be=D.get().backend; });
  await p.evaluate(async()=>{ for(const [f,k,tx] of [['2026-10-01','n','Hace un mes: estaba enojado con mi hermano. Perdón, Señor.'],['2025-10-30','m','Hace un año: no sabía rezar, Señor, enseñame.']]){ await window.DAILY.ACC.__set?.(f); } });
  await p.evaluate(async()=>{ const m=await import('/js/firebase.js'); });
  // escribir directo con setDay a través del backend local
  await p.evaluate(async()=>{ const be=window.DAILY.get(); });
  console.log('T21a',errs.join('\n')||'OK');
  await A('misOraciones',null,600); t=await p.textContent('#sheet'); ok(t.includes('Señor, gracias por este día'),'historial'); ok(t.includes('1 oración'),'cuenta');
  await p.screenshot({path:'o_hist.png'});
  // borrar con confirmación (cancelar)
  await p.click('[data-a="orBorrar"]'); await p.waitForTimeout(300); ok(await p.$('.dlg'),'dialogo'); await p.screenshot({path:'o_dlg.png'}); await p.click('.dlg [data-r="0"]'); await p.waitForTimeout(300); ok((await p.textContent('#sheet')).includes('gracias por este día'),'no borra');
  await A('cerrar');
  // rosario: salir con confirmación, mujer
  await A('pjSet','sx|f',300); await A('rosario',null,500); await A('rosEmpezar','gozosos',600);
  await p.click('#sheet [data-a="cerrar"]').catch(()=>{}); await p.waitForTimeout(400);
  ok(await p.$('.dlg'),'confirma al cerrar rosario'); const td=await p.textContent('.dlg'); ok(td.includes('¿Estás segura?'),'segura '+td); await p.screenshot({path:'o_ros.png'});
  await p.click('.dlg [data-r="0"]'); await p.waitForTimeout(300); ok(await p.evaluate(()=>window.DAILY.get().sheet&&window.DAILY.get().sheet.view==='rosario'),'sigue en rosario');
  await A('cerrar',null,300); await p.click('.dlg [data-r="1"]'); await p.waitForTimeout(400); ok(await p.evaluate(()=>!window.DAILY.get().sheet),'sale');
  // horas
  await A('horaLH','laudes',2500); const lh=await p.$$eval('#sheet p.est.c2',e=>e.length); ok(lh>2,'coros '+lh); ok(await p.$('#sheet p.ant'),'antifonas');
  await p.screenshot({path:'o_lh1.png'}); await p.evaluate(()=>{ document.querySelector('#sheet .scroll').scrollTop=1500; }); await p.waitForTimeout(200); await p.screenshot({path:'o_lh2.png'});
  await p.context().close();
  p=await pag('2026-10-31T16:30:00-03:00'); t=await p.textContent('#app'); ok(t.includes('Evangelio del día'),'tarde evangelio'); ok(!t.includes('Oración de la tarde'),'sin tarde');
  await p.screenshot({path:'o_tarde.png'}); await p.context().close();
  console.log('T21',errs.join('\n')||'OK'); await b.close(); })();
