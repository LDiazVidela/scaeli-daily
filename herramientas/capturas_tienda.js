// Capturas para las tiendas con el diseño vigente. Uso (con el servidor en :8765, desde la raíz del repo):
//   python3 -m http.server 8765 &   →   node herramientas/capturas_tienda.js
// Deja tienda/capturas/android/01–08.png (1080×1920), tienda/capturas/iphone/01–08.png (1290×2796)
// y tienda/capturas/revision-scaeli-plus.png (la pantalla de Scaeli+ para la revisión de compras).
// Orden: 1 Hoy · 2 Rosario · 3 La Biblia · 4 Lectio · 5 Rezar · 6 Tu día · 7 Tu personaje · 8 Santo del día.
const { chromium } = require('playwright'); const path = require('path'); const RAIZ = path.join(__dirname, '..');
const sembrar = () => { const pad = n => String(n).padStart(2, '0'); const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const K = 'scaeli-daily-local'; const st = JSON.parse(localStorage.getItem(K) || '{}');
  st['daily_settings/rutina'] = { diarias: [{ id: 'd1', t: 'Leer diez minutos de un libro espiritual' }, { id: 'd2', t: 'Rezar el Ángelus al mediodía' }], habitos: [{ id: 'h1', t: 'Rezar antes de comer', v: 'templanza' }, { id: 'h2', t: 'Ayudar en casa sin que me lo pidan', v: 'caridad' }] };
  st['daily_settings/profile'] = { sx: 'm', prenda: 'buzo:bordo', peinado: 'corto' };
  st['daily_settings/premios'] = { items: [], vis: ['2000-01-03'] };
  st['daily_settings/propositos'] = { list: [{ id: 'p1', t: 'Llamar a la abuela', f: iso(new Date()), hr: '18:30', d: iso(new Date()) }] };
  for (let i = 0; i < 24; i++) { const d = new Date(); d.setDate(d.getDate() - i); st['daily_days/' + iso(d)] = i === 0 ? { m: 1, dd: { d1: 1 }, hb: { h1: { p: 1 } }, t: Date.now() } : { m: 1, e: 1, r: i % 3 ? 1 : 0, rn: 1, x: i % 2, n: 1, dd: { d1: 1, d2: i % 2 }, hb: { h1: { p: 2 }, h2: { p: i % 2 } }, t: Date.now() }; }
  localStorage.setItem(K, JSON.stringify(st)); };
(async () => { const b = await chromium.launch(); const errs = [];
  for (const [dir, W, H] of [['android', 360, 640], ['iphone', 430, 932]]) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 3, locale: 'es-AR', timezoneId: 'America/Argentina/Buenos_Aires' }); const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(dir + ' ' + e.message));
    await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);
    await p.click('#invitado'); await p.waitForTimeout(1000); await p.evaluate(sembrar); await p.reload(); await p.waitForTimeout(5200);
    const A = async (a, q, ms = 450) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
    const foto = n => p.screenshot({ path: path.join(RAIZ, 'tienda/capturas', dir, n + '.png') });
    const ir = async v => { await p.evaluate(() => window.DAILY.closeSheet && window.DAILY.closeSheet()); await p.evaluate(v => window.DAILY.ir(v), v); await p.waitForTimeout(700); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(150); };
    await ir('hoy'); await foto('01');
    await A('rosario', null, 600); await p.click('[data-a="rosEmpezar"]'); await p.waitForTimeout(500); await A('rosIrMis'); await A('rosAv'); for (let i = 0; i < 5; i++) await A('rosAv', null, 150); await p.waitForTimeout(500); await foto('02');
    await p.evaluate(() => window.DAILY.closeSheet()); await p.waitForTimeout(300); const dlg = await p.$('.dlgc .primary, .dlgc button'); if (dlg) { await p.evaluate(() => { const B = [...document.querySelectorAll('.dlgc button')]; const s = B.find(x => /salir|sí|seguir después/i.test(x.innerText)) || B[B.length - 1]; s && s.click(); }); await p.waitForTimeout(400); }
    await A('biblia', null, 1200); await A('bibLibro', 'John', 900); const caps = await p.$$('#sheet .bibcaps button'); if (caps.length > 2) { await caps[2].click(); await p.waitForTimeout(1300); } await foto('03');
    await p.evaluate(() => window.DAILY.closeSheet()); await p.waitForTimeout(300);
    await p.evaluate(() => { try { localStorage.setItem('daily_lecguia', '1'); } catch (e) {} window.DAILY.openSheet({ view: 'lectio', lp: 1, full: 1 }); }); await p.waitForTimeout(900); await foto('04');
    await ir('rezar'); await foto('05');
    await ir('dia'); await foto('06');
    await ir('yo'); await foto('07');
    await A('santo', null, 900); await foto('08'); await p.evaluate(() => window.DAILY.closeSheet());
    await ctx.close(); }
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'es-AR', timezoneId: 'America/Argentina/Buenos_Aires' }); const p = await ctx.newPage();
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900); await p.click('#invitado'); await p.waitForTimeout(1000);
  await p.evaluate(() => window.DAILY.openSheet({ view: 'plus' })); await p.waitForTimeout(900); await p.screenshot({ path: path.join(RAIZ, 'tienda/capturas/revision-scaeli-plus.png') });
  console.log(errs.join('\n') || 'CAPTURAS OK'); await b.close(); })();
