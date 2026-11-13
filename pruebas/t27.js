// t27 · Daily 1.10: Palabra del día, misiones del grupo, premios semanales (rosarios y colores), avatar → personalización, logo
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [], fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1000);
  ok(await p.$('.login .marca img[src*="icon-512"]') !== null, 'ícono nuevo en la entrada');
  await p.click('#invitado'); await p.waitForTimeout(1200);
  const A = async (a, q, ms = 450) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const SH = async () => p.evaluate(() => document.querySelector('#sheet').innerText);
  const LS = async () => p.evaluate(() => JSON.parse(localStorage.getItem('scaeli-daily-local')));
  // avatar → personalización
  await p.click('.hero2 .pjbtn'); await p.waitForTimeout(700); ok(await p.evaluate(() => document.querySelector('#pjsec') && Math.abs(document.querySelector('#pjsec').getBoundingClientRect().top) < 140), 'tocar el avatar lleva a la personalización');
  // Palabra del día
  await A('palabra', null, 1500); let t = await SH(); ok(/Palabra del día/i.test(t) && /¿Qué me dice hoy\?/i.test(t) && /¿Cómo lo vivo hoy\?/i.test(t), 'panel de la Palabra del día'); const cita = await p.evaluate(() => document.querySelector('.pal .st').innerText);
  ok(/^\S+ \d+(-\d+)?,\d+(-\d+)?$/.test(cita), 'cita: ' + cita); ok((await p.$$('.paltx sup')).length >= 2, 'texto con versículos');
  await p.fill('#palQ', 'Que no estoy solo'); await p.fill('#palV', 'Llamar a mi abuela'); await A('palOk', null, 600);
  let st = await LS(); const hoyK = Object.keys(st).filter(k => k.startsWith('daily_days/')).sort().pop(); const dd = st[hoyK]; ok(dd && dd.pal && dd.pal.q === 'Que no estoy solo' && dd.pal.r === cita, 'reflexión guardada en el día');
  await A('misOraciones'); t = await SH(); ok(/Palabra del día/.test(t) && /Llamar a mi abuela/.test(t), 'aparece en Mis oraciones'); await A('cerrar');
  await A('biblia', null, 1200); t = await SH(); ok(/Palabra del día/i.test(t) && /Ya la rezaste hoy/i.test(t), 'tarjeta en la Biblia'); await A('cerrar');
  await p.evaluate(() => window.DAILY.ir('rezar')); await p.waitForTimeout(300); t = await p.evaluate(() => document.body.innerText); ok(/Palabra del día/.test(t), 'tile en Rezar');
  // Misiones del grupo
  await A('grupo'); await A('gEjemplo', null, 1000); t = await SH(); ok(/Misiones de hoy/i.test(t) && (await p.$$('.gmis .mrow')).length === 3, 'tres misiones en el grupo'); ok(/perdés 15/.test(t), 'explica la penalización');
  const mis = await p.evaluate(() => [...document.querySelectorAll('.gmis .mrow')].map(e => e.dataset.a)); ok(new Set(mis).size === 3, 'misiones distintas: ' + mis);
  ok(/\d\/3 hoy/.test(t), 'cada miembro muestra sus misiones de hoy');
  // Premios: semana pasada con 7 días con Dios
  await p.evaluate(() => { const K = 'scaeli-daily-local'; const s = JSON.parse(localStorage.getItem(K)); const pad = n => String(n).padStart(2, '0'); const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    const h = new Date(); const lun = new Date(h); lun.setDate(h.getDate() - ((h.getDay() + 6) % 7) - 7); for (let i = 0; i < 7; i++) { const d = new Date(lun); d.setDate(lun.getDate() + i); s['daily_days/' + iso(d)] = { m: 1, e: 1, t: Date.now() }; } localStorage.setItem(K, JSON.stringify(s)); });
  await p.reload(); await p.waitForTimeout(3200); st = await LS(); const pr = st['daily_settings/premios']; ok(pr && pr.items.length === 1, 'premio de la semana ganado: ' + JSON.stringify(pr));
  await p.evaluate(() => window.DAILY.ir('yo')); await p.waitForTimeout(500); t = await p.evaluate(() => document.querySelector('#premsec').innerText); ok(/Tus premios/i.test(t) && /Rosario/i.test(t) && /Color de la app/i.test(t), 'tarjeta de premios');
  const libre = await p.evaluate(() => [...document.querySelectorAll('#premsec .prem:not(.lock)')].map(e => e.dataset.p)); ok(libre.length === 3, 'desbloqueados: ' + libre);
  const ganado = pr.items[0]; await A('premUsar', ganado, 600);
  if (ganado.startsWith('ac:')) { const a = await p.evaluate(() => document.documentElement.getAttribute('data-acento')); ok(a === ganado.slice(3), 'color de la app aplicado: ' + a); }
  else { await A('rosario', null, 500); await A('rosAv'); await A('rosAv'); ok(await p.$('svg.anillo.r-' + ganado.slice(4)) !== null, 'rosario con el diseño ganado'); await A('cerrar', null, 300); const d = await p.$('.dlg button.primary'); if (d) await d.click(); }
  await A('premUsar', 'ros:oro', 300); st = await LS(); ok(st['daily_settings/profile'].ros !== 'oro', 'no se puede usar uno bloqueado');
  // Ajustes: botones de fila del mismo ancho y campos de hora sin alto fijo
  await p.evaluate(() => window.DAILY.ir('mas')); await p.waitForTimeout(400);
  const anchos = await p.evaluate(() => [...document.querySelectorAll('.card.list>.row>.ghost')].map(e => Math.round(e.getBoundingClientRect().width))); ok(anchos.length >= 5 && Math.max(...anchos) - Math.min(...anchos) <= 2, 'botones de fila parejos: ' + anchos);
  const hr = await p.evaluate(() => { const e = document.querySelector('input[data-rec=m]'); const s = getComputedStyle(e); return [s.paddingTop, s.paddingBottom]; }); ok(hr[0] === hr[1], 'hora centrada en alto');
  const VER = require('fs').readFileSync(require('path').join(__dirname, '..', 'js', 'app.js'), 'utf8').match(/VERSION="([^"]+)"/)[1]; t = await p.evaluate(() => document.body.innerText); ok(t.includes('Scaeli Daily ' + VER), 'versión ' + VER);
  console.log('T27', errs.concat(fails).join('\n') || 'OK'); await b.close(); })();
