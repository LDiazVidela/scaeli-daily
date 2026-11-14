const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor:2 }); const errs=[]; p.on('pageerror', e => errs.push('PAGEERROR '+e.message));
  const ok=(c,m)=>{ if(!c) errs.push('FALLA '+m); };
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1500); await p.click('#invitado'); await p.waitForTimeout(1500);
  const A = async (a, q, ms = 400) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  ok((await p.textContent('#app')).includes('Escribir uno'),'cta habitos');
  await A('irDia'); for (const t of ['Rezar antes de comer','No quejarme']) { await p.fill('form[data-f="habito"] input', t); await p.press('form[data-f="habito"] input','Enter'); await p.waitForTimeout(300); }
  await p.click('#nav button[data-view="hoy"]'); await p.waitForTimeout(500);
  const hs=await p.$$eval('.habhoy [data-a="habMas"]',e=>e.map(x=>x.dataset.p)); ok(hs.length===2,'2 habitos en hoy');
  await A('habMas',hs[0],600); const t=await p.textContent('#app'); ok(t.includes('1 de 7 días'),'1 de 7'); ok(t.includes('Tu progreso y tus virtudes'),'fila de progreso');
  await p.evaluate(()=>{ const el=document.querySelector('.habhoy'); el&&el.scrollIntoView(); }); await p.waitForTimeout(300); await p.screenshot({path:'r_hab.png'});
  await p.click('#nav button[data-view="yo"]'); await p.waitForTimeout(600); await A('pjSet','alt|alta',600); await p.screenshot({path:'r_alta.png'}); await A('pjSet','alt|baja',600); await p.screenshot({path:'r_baja.png'});
  ok((await p.textContent('#app')).includes('Altura'),'altura ui');
  console.log('T17',errs.join('\n')||'OK'); await b.close(); })();
