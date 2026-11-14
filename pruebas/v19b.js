const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs=[]; const ctx=await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2 }); const p=await ctx.newPage();
  p.on('pageerror', e => errs.push('PAGEERROR '+e.message));
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1200); await p.click('#invitado'); await p.waitForTimeout(1200);
  const A = async (a, q, ms = 500) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  await p.evaluate(()=>window.DAILY.ir('rezar')); await p.waitForTimeout(300); await A('lectioYa',null,700); await A('lecPaso',1); await A('lecPaso',1); await A('lecPaso',1);
  await p.screenshot({path:'shots19/v19_lec3.png'}); await p.fill('#lecTxt','Jesús, hoy te pido por mi familia.\n'.repeat(12)); await p.waitForTimeout(300); await p.screenshot({path:'shots19/v19_lec3b.png'});
  // simular teclado: viewport más chico
  await p.setViewportSize({width:390,height:500}); await p.waitForTimeout(300); await p.screenshot({path:'shots19/v19_lec_kb.png'});
  const info = await p.evaluate(()=>{ const s=document.querySelector('#sheet'); const pie=document.querySelector('.fpie'); return {sheetH:s.getBoundingClientRect().height, pieBottom:pie&&pie.getBoundingClientRect().bottom, bodyScroll:document.body.scrollHeight, inScroll:document.querySelector('#sheet .in').scrollHeight}; }); console.log(info);
  console.log('V19b', errs.join('\n')||'OK'); await b.close(); })();
