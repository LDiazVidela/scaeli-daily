// t43 · Daily 2.7: fecha de las intenciones del grupo, fondos especiales de Scaeli+ y la barba corta rehecha.
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const errs = [], fails = []; const ok = (c, m) => { if (process.env.V) console.log((c ? '  ok ' : '  XX ') + m); if (!c) fails.push(m); };
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);
  await p.click('#invitado'); await p.waitForTimeout(2200);
  const A = async (a, q, ms = 450) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const SH = () => p.evaluate(() => (document.querySelector('#sheetIn') || {}).innerText || '');
  // 1 · intenciones con fecha
  await A('gEjemplo', undefined, 900); await A('gTab', 'miembros'); let t = await SH();
  const cu = await p.evaluate(() => [...document.querySelectorAll('.gpan[data-gp="miembros"] .gint .gcu')].map(x => x.textContent + (x.classList.contains('nv') ? '*' : x.classList.contains('vj') ? '~' : '')));
  ok(cu.includes('de hoy*') && cu.includes('hace 2 días') && cu.includes('hace una semana') && cu.includes('hace 5 semanas~'), 'cada intención dice de cuándo es: ' + cu.join(' | '));
  await p.fill('form[data-f=grupoInt] input', 'Por la misión de Salto'); await p.press('form[data-f=grupoInt] input', 'Enter'); await p.waitForTimeout(800);
  const yo = await p.evaluate(() => { const g = window.DAILY.get(); const me = (g.grupoR || g.miembros || []).find && null; return [...document.querySelectorAll('.gpan[data-gp="miembros"] .grow.yo .gint')].map(x => x.textContent).join(''); });
  ok(/Por la misión de Salto/.test(yo) && /de hoy/.test(yo), 'la mía queda con la fecha de hoy: ' + yo); t = await SH();
  ok(/Guardala de nuevo para renovarla/.test(t), 'se explica cómo renovarla');
  await A('cerrar');
  // 2 · fondos de Scaeli+
  await p.evaluate(() => window.DAILY.ir('yo')); await p.waitForTimeout(500); await p.evaluate(() => { const d = document.querySelector('details.fondos-d'); d.open = true; }); await p.waitForTimeout(300);
  ok((await p.$$('.fondo.plus')).length === 4 && (await p.$$('.fondo.plus.lock')).length === 4 && /Especiales de Scaeli\+/i.test(await p.evaluate(() => document.querySelector('#app').innerText)), 'cuatro fondos de Scaeli+, con candado si no sos Scaeli+');
  for (const k of ['catedral', 'escalera', 'galilea', 'monte']) { const f = __dirname + '/../assets/ilus/daily_plus_' + k + '.png'; ok(fs.existsSync(f) && fs.statSync(f).size > 5000, 'está la portada ' + k); }
  ok(await p.evaluate(() => [...document.querySelectorAll('.fondo.plus img')].every(i => i.complete && i.naturalWidth === 320 && i.naturalHeight === 184)), 'se ven y miden 320 × 184');
  await p.click('.fondo.plus[data-p="plus_catedral"]'); await p.waitForTimeout(600);
  ok(await p.evaluate(() => { const s = window.DAILY.get().sheet; return s && s.view === 'plus'; }) && !(await p.evaluate(() => (JSON.parse(localStorage.getItem('scaeli-daily-local'))['daily_settings/profile'] || {}).fondo === 'plus_catedral')), 'sin Scaeli+ abre la invitación y no lo pone');
  ok(/Fondos especiales para tu personaje/.test(await SH()), 'la invitación los nombra'); await A('cerrar');
  await p.evaluate(() => localStorage.setItem('daily_plus_prueba', '1')); await p.reload(); await p.waitForTimeout(900); if (await p.$('#invitado')) await p.click('#invitado'); await p.waitForTimeout(2200);
  await p.evaluate(() => window.DAILY.ir('yo')); await p.waitForTimeout(500); await p.evaluate(() => { document.querySelector('details.fondos-d').open = true; }); await p.waitForTimeout(300);
  ok((await p.$$('.fondo.plus.lock')).length === 0, 'con Scaeli+ están libres');
  await p.click('.fondo.plus[data-p="plus_escalera"]'); await p.waitForTimeout(700);
  ok(await p.evaluate(() => (JSON.parse(localStorage.getItem('scaeli-daily-local'))['daily_settings/profile'] || {}).fondo === 'plus_escalera') && await p.evaluate(() => /daily_plus_escalera/.test((document.querySelector('#pjsec img.bg') || {}).src || '')), 'se elige y queda detrás del personaje');
  await p.evaluate(() => localStorage.removeItem('daily_plus_prueba')); await p.reload(); await p.waitForTimeout(900); if (await p.$('#invitado')) await p.click('#invitado'); await p.waitForTimeout(2200); await p.evaluate(() => window.DAILY.ir('yo')); await p.waitForTimeout(500);
  ok(!(await p.$('#pjsec img.bg')) || !(await p.evaluate(() => /daily_plus_/.test(document.querySelector('#pjsec img.bg').src))), 'si se termina Scaeli+, vuelve el fondo de siempre');
  // 3 · la barba corta nueva: cubre las mejillas (más puntos y más arriba que el candado)
  const r = await p.evaluate(async () => { const PJ = await import('./js/personaje.js'); await PJ.cargar(); const px = P => { const cv = document.createElement('canvas'); PJ.pintar(cv, P); return cv.getContext('2d').getImageData(0, 0, 128, 128).data; };
    const s0 = px({ sx: 'm', prenda: 'deportiva' }); const dif = k => { const c = px({ sx: 'm', prenda: 'deportiva', barba: k }); let n = 0, x0 = 128, x1 = 0; for (let i = 0; i < c.length; i += 4) if (c[i] !== s0[i] || c[i + 1] !== s0[i + 1] || c[i + 2] !== s0[i + 2]) { n++; const x = (i >> 2) & 127; if (x < x0) x0 = x; if (x > x1) x1 = x; } return [n, x1 - x0]; }; return { corta: dif('corta'), candado: dif('candado') }; });
  ok(r.corta[0] > r.candado[0] * 2 && r.corta[1] > r.candado[1] + 4, 'la barba corta es distinta del candado: ' + JSON.stringify(r));
  const app = fs.readFileSync(__dirname + '/../js/app.js', 'utf8'); ok(/\["2\.7",\[/.test(app), 'las novedades de la 2.7 siguen en la lista');
  await b.close(); if (errs.length) fails.push(...errs);
  if (fails.length) { console.log('t43 FALLA\n - ' + fails.join('\n - ')); process.exit(1); } console.log('t43 OK'); })();
