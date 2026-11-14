const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs=[]; const ok=(c,m)=>{ if(!c) errs.push('FALLA '+m); };
  async function pagina(fecha){ const ctx=await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2 }); const p=await ctx.newPage();
    if(fecha) await p.clock.setFixedTime(new Date(fecha));
    p.on('pageerror', e => errs.push('PAGEERROR '+e.message)); p.on('console', m=>{ if(m.type()==='error'&&!/Failed to load resource/.test(m.text())) errs.push('CONSOLE '+m.text()); });
    await p.goto('http://localhost:8765/index.html'); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1500); await p.click('#invitado'); await p.waitForTimeout(1500); return p; }
  let p=await pagina();
  const A = async (a, q, ms = 450) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const sh = async (n)=>{ await p.screenshot({path:n}); };
  await A('irDia'); for (const t of ['Rezar antes de comer','No quejarme','Levantarme temprano']) { await p.fill('form[data-f="habito"] input', t); await p.press('form[data-f="habito"] input','Enter'); await p.waitForTimeout(300); }
  const ids=await p.$$eval('[data-a="habMas"]',e=>e.map(x=>x.dataset.p)); ok(ids.length===3,'3 habitos');
  await A('habMas',ids[0]); await A('habMas',ids[0]); await A('habMas',ids[2]);
  await A('habEd',ids[1]); const vt=await p.textContent('.hvirt'); ok(vt.includes('Templanza')&&vt.includes('Fe'),'chips virtud'); 
  const on=await p.$$eval('.hvirt button.on',e=>e.map(x=>x.textContent)); ok(on.length===1,'una virtud marcada '+on);
  await p.evaluate(()=>document.querySelector('.hvirt').scrollIntoView({block:'center'})); await sh('s_virt.png');
  await A('habVirtud',ids[1]+'|justicia',600); await A('habEd',ids[1]);
  await p.click('#nav button[data-view="hoy"]'); await p.waitForTimeout(500);
  ok((await p.textContent('#app')).includes('Tu progreso y tus virtudes'),'fila progreso en hoy');
  await A('progreso',null,700); ok((await p.textContent('#sheet')).includes('Scaeli+'),'progreso sin plus abre paywall'); await sh('s_pay_web.png');
  // código de prueba
  await p.click('details.codigo summary'); await p.fill('form[data-f="plusCodigo"] input','mal'); await p.press('form[data-f="plusCodigo"] input','Enter'); await p.waitForTimeout(400);
  ok(!(await p.evaluate(()=>localStorage.getItem('daily_plus_prueba'))),'codigo malo no activa'); ok((await p.textContent('#toast')).includes('entrá con tu cuenta'),'sin cuenta pide entrar');
  await p.click('details.codigo summary').catch(()=>{}); await p.waitForTimeout(200);
  if(!(await p.isVisible('form[data-f="plusCodigo"] input'))) await p.click('details.codigo summary');
  await p.evaluate(()=>{ localStorage.setItem('daily_plus_prueba','1'); }); await A('cerrar',null,300); await A('progreso',null,800);
  ok((await p.textContent('#sheet')).includes('Más trabajadas'),'codigo activa y abre progreso'); await sh('s_pay_on.png');
  await A('progreso',null,800); const tp=await p.textContent('#sheet'); ok(tp.includes('Más trabajadas')&&tp.includes('Te faltan'),'virtudes'); ok(await p.$('svg.radar'),'radar');
  ok(/Más trabajadas: Fe y Fortaleza/.test(tp),'mas trabajadas fe/fortaleza');
  await sh('s_prog1.png'); await p.evaluate(()=>{ const s=document.querySelector('#sheet .scroll'); s.scrollTop=520; }); await p.waitForTimeout(200); await sh('s_prog2.png');
  await p.evaluate(()=>{ const s=document.querySelector('#sheet .scroll'); s.scrollTop=99999; }); await p.waitForTimeout(200); await sh('s_prog3.png');
  const sug=await p.$$eval('[data-a="habSugerido"]',e=>e.map(x=>x.dataset.p)); ok(sug.length>=3,'sugerencias');
  await A('habSugerido',sug[0],800); ok((await p.evaluate(()=>window.DAILY&&1)),'x');
  const tp2=await p.textContent('#sheet'); ok(tp2.includes('Te faltan'),'sigue abierto');
  // caminos
  await A('camino','adviento',700); const tc=await p.textContent('#sheet'); ok(tc.includes('Semana 1')&&tc.includes('Mc 13,33-37')&&tc.includes('Empieza'),'camino'); await sh('s_cam.png');
  await A('camCita','Mt 24,37-44',1500); const tb=await p.textContent('#sheet'); ok(/Mateo|San Mateo/.test(tb)&&tb.includes('24'),'cita abre biblia'); await sh('s_cam_bib.png');
  // donar
  await A('donarVer',null,600); ok((await p.textContent('#sheet')).includes('USD 4,99'),'donar'); await sh('s_donar.png');
  await A('cerrar'); await p.click('#nav button[data-view="mas"]'); await p.waitForTimeout(500); ok((await p.textContent('#app')).includes('Scaeli+ activo'),'mas plus'); await sh('s_mas.png');
  await A('plus',null,500); await A('plusComoGratis',null,500); await A('cerrar'); await p.waitForTimeout(300); ok((await p.textContent('#app')).includes('desde USD'),'como gratis'); await A('plus',null,400); await A('plusComoGratis',null,400); await A('cerrar');
  await p.context().close();
  // en Adviento
  p=await pagina('2026-12-08T10:00:00-03:00');
  await p.evaluate(()=>localStorage.setItem('daily_plus_prueba','1')); await p.reload(); await p.waitForTimeout(1800);
  const th=await p.textContent('#app'); ok(th.includes('Camino de Adviento · día 10 de 26'),'card hoy adviento'); 
  await p.evaluate(()=>document.querySelector('.camhoy').scrollIntoView({block:'center'})); await sh('s_cam_hoy.png');
  await A('camino','adviento',700); const y0=await p.evaluate(()=>document.querySelector('#sheet .scroll').scrollTop); ok(y0>500,'scroll a hoy '+y0); await A('camOk','2026-12-08',600); ok(await p.evaluate(()=>document.querySelector('#sheet .scroll').scrollTop)>500,'mantiene scroll');
  ok(await p.$('.camd.hoy .ck.on'),'marcado'); ok((await p.textContent('#sheet')).includes('1 de 26'),'progreso camino'); await sh('s_cam_dia.png');
  await A('cerrar'); await p.click('#nav button[data-view="rezar"]'); await p.waitForTimeout(500); ok((await p.textContent('#app')).includes('Camino de Adviento'),'cover rezar');
  await p.evaluate(()=>window.scrollTo(0,99999)); await p.waitForTimeout(300); await sh('s_rezar.png');
  await p.context().close();
  console.log('T18',errs.join('\n')||'OK'); await b.close(); })();
