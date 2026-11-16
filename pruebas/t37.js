// t37 · Daily 2.2.6: el «−» de las caídas también en Hoy (a la izquierda del círculo), los signos dibujados (centrados), lo que rezás en la app
// marca solo el hábito que se llama igual (y se descuenta si sacás la marca), sin acceso a Scaeli Fit, el lápiz del personaje en la esquina (2.3).
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [], fails = []; const ok = (c, m) => { if (process.env.V) console.log((c ? '  ok ' : '  XX ') + m); if (!c) fails.push(m); };
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);
  await p.click('#invitado'); await p.waitForTimeout(1000);
  await p.evaluate(() => { const K = 'scaeli-daily-local'; const s = JSON.parse(localStorage.getItem(K) || '{}'); const r = s['daily_settings/rutina'] || { diarias: [], habitos: [] };
    r.habitos = [{ id: 'h1', t: 'Ser puntual', v: 'justicia' }, { id: 'h2', t: 'Ir a Misa', v: 'piedad' }, { id: 'h3', t: 'Rezar el Ángelus', v: 'piedad' }]; s['daily_settings/rutina'] = r; localStorage.setItem(K, JSON.stringify(s)); });
  await p.reload(); await p.waitForTimeout(1300); if (await p.$('#invitado')) { await p.click('#invitado'); await p.waitForTimeout(1000); }
  const A = async (a, q, ms = 450) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const HB = () => p.evaluate(() => { const s = JSON.parse(localStorage.getItem('scaeli-daily-local')); const d = new Date(), iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); return (s['daily_days/' + iso] || {}).hb || {}; });
  // Hoy: cada hábito tiene «−» y círculo; el «−» anota la caída sin ir a Día
  await p.evaluate(() => window.DAILY.ir('hoy')); await p.waitForTimeout(500);
  const hoyF = await p.evaluate(() => [...document.querySelectorAll('.habhoy .hrow3')].map(r => [...r.children].map(e => e.dataset.a || e.className.split(' ')[0]).join(',')));
  ok(hoyF.length === 3 && hoyF.every(x => /habMenos,habMas$/.test(x)), 'Hoy: «−» y círculo en cada hábito, el − a la izquierda: ' + hoyF.join(' | '));
  await p.click('.habhoy .hrow3 [data-a="habMenos"][data-p="h1"]'); await p.waitForTimeout(500);
  let hb = await HB(); ok(hb.h1 && hb.h1.m === 1, 'desde Hoy se anota la caída: ' + JSON.stringify(hb.h1));
  ok(await p.evaluate(() => /1 caída hoy/.test(document.querySelector('.habhoy').innerText) && !!document.querySelector('.habhoy .hmn.on')), 'Hoy muestra «1 caída hoy» y el − en rojo');
  ok(await p.evaluate(() => [...document.querySelectorAll('.hmn svg use')].every(u => u.getAttribute('href') === '#i-minus') && !!document.querySelector('#i-minus')), 'el − es un dibujo (centrado), no un carácter');
  // Día: el panel de corrección usa signos dibujados y el − queda a la izquierda del +
  await p.evaluate(() => window.DAILY.ir('dia')); await p.waitForTimeout(400); await A('habEd', 'h1');
  const pm = await p.evaluate(() => [...document.querySelectorAll('.hajuste .pm')].map(b => b.querySelector('use') && b.querySelector('use').getAttribute('href')));
  ok(pm.join() === '#i-minus,#i-plus,#i-minus,#i-plus', 'panel: − y + dibujados, el − a la izquierda: ' + pm.join());
  // lo que rezás en la app marca el hábito del mismo nombre, una vez, y se descuenta al sacar la marca
  await A('misaOk', undefined, 600); hb = await HB(); ok(hb.h2 && hb.h2.p === 1, '«Fui a Misa hoy» marca el hábito «Ir a Misa»');
  await A('misaOk', undefined, 600); hb = await HB(); ok(hb.h2.p === 1, 'no suma dos veces');
  await A('desmarcar', 'misa', 600); hb = await HB(); ok(hb.h2.p === 0, 'sacar la marca de Misa descuenta el hábito');
  await A('horaOk', 'a', 600); hb = await HB(); ok(hb.h3 && hb.h3.p === 1 && !(hb.h1 && hb.h1.p), 'el Ángelus marca «Rezar el Ángelus» y nada más');
  // sin acceso a Scaeli Fit; el lápiz del personaje arriba, junto a la cabeza
  await p.evaluate(() => window.DAILY.ir('mas')); await p.waitForTimeout(400);
  ok(!(await p.$('#app a[href*="scaeli-fit"]')) && !/Ordenar el cuerpo/.test(await p.evaluate(() => document.querySelector('#app').innerText)), 'Más ya no tiene el acceso a Scaeli Fit');
  await p.evaluate(() => window.DAILY.ir('hoy')); await p.waitForTimeout(500);
  const lap = await p.evaluate(() => { const e = document.querySelector('.hero2 .pjedit'), h = document.querySelector('.hero2'); if (!e || !h) return null; const a = e.getBoundingClientRect(), b = h.getBoundingClientRect(); return [Math.round(a.top - b.top), Math.round(a.left - b.left), getComputedStyle(document.querySelector('.pjbtn'), '::after').display]; });
  ok(lap && lap[0] <= 16 && lap[1] <= 16 && lap[2] === 'none', '2.3: el lápiz del personaje va en la esquina de la tarjeta: ' + JSON.stringify(lap));
  console.log(errs.join('\n')); console.log(fails.length ? 'FALLAS:\n' + fails.join('\n') : 'OK t37');
  await b.close(); process.exit(fails.length || errs.length ? 1 : 0); })();
