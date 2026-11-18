const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const out = process.argv[2];
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage(); p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('http://localhost:8766/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900); await p.click('#invitado'); await p.waitForTimeout(2000);
  const A = async (a, q, ms = 400) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  await A('irDia'); for (const t of ['Rezar antes de comer','No quejarme']) { await p.fill('form[data-f="habito"] input', t); await p.press('form[data-f="habito"] input','Enter'); await p.waitForTimeout(300); }
  console.log('tira', await p.evaluate(() => [...document.querySelectorAll('.habtira button')].map(x => x.innerText.replace(/\n/g,' ') + '|' + x.dataset.p).join(' · ')));
  await p.locator('.habtira').scrollIntoViewIfNeeded(); await p.screenshot({ path: out + '_1.png' });
  const ay = await p.evaluate(() => document.querySelectorAll('.habtira button')[5].dataset.p); await A('habDia', ay, 400);
  await p.click('[data-a="habMas"]'); await p.waitForTimeout(500); await p.screenshot({ path: out + '_2.png' });
  console.log('toast', await p.evaluate(() => (document.querySelector('.toast')||{}).innerText));
  console.log('dia ayer', await p.evaluate(f => JSON.stringify(window.DAILY.get().days[f] && window.DAILY.get().days[f].hb), ay));
  await p.click('.toast .lnk'); await p.waitForTimeout(500);
  console.log('tras deshacer', await p.evaluate(f => JSON.stringify(window.DAILY.get().days[f] && window.DAILY.get().days[f].hb), ay));
  await p.evaluate(() => window.DAILY.ir('hoy')); await p.waitForTimeout(500); const h = p.locator('.hck').first(); await h.scrollIntoViewIfNeeded(); await p.screenshot({ path: out + '_3.png' });
  await b.close(); })();
