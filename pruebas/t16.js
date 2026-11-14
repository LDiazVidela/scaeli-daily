const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor:2 }); const errs=[]; p.on('pageerror', e => errs.push('PAGEERROR '+e.message));
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1500); await p.click('#invitado'); await p.waitForTimeout(1500);
  const A = async (a, q, ms = 400) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  await p.click('#nav button[data-view="yo"]'); await p.waitForTimeout(800);
  await A('pjSet','prenda|clergyman',800); await p.screenshot({path:'r_pj1.png',fullPage:false});
  const t=await p.textContent('#app'); if(/Peinado/.test(t)) errs.push('FALLA peinado visible con clergyman');
  await A('pjSet','sx|f',800); await A('pjSet','prenda|buzo:bordo',600); await A('pjSet','peinado|corto',800); await p.screenshot({path:'r_pj2.png'});
  console.log('T16',errs.join('\n')||'OK'); await b.close(); })();
