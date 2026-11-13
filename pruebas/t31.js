// t31 · Daily 2.0: piel nueva (bordó y crema, tipografía del sistema, barra flotante), entrada con la «Puerta de luz»,
// ocho rangos con insignias y puntitos (Celestial y Divino piden racha de más de 30 días), portadas propias, Ángelus y latín en Más.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [], fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);
  // Entrada
  let t = await p.evaluate(() => document.querySelector('.login').innerText);
  ok(/Tu fe, a otro nivel/.test(t) && /Scaeli\s*Daily/.test(t), 'entrada con el lema y la marca: ' + t.slice(0, 80).replace(/\n/g, ' | '));
  ok(await p.evaluate(() => { const i = document.querySelector('.login .marca img'); return !!i && /icons\/icon-512\.png$/.test(i.src) && i.naturalWidth === 512; }), 'ícono Puerta de luz en la entrada');
  ok(await p.evaluate(() => getComputedStyle(document.body).backgroundColor) === 'rgb(23, 10, 13)', 'fondo bordó oscuro');
  ok(await p.evaluate(() => /^-apple-system/.test(getComputedStyle(document.body).fontFamily)), 'tipografía del sistema');
  ok(await p.evaluate(() => Math.round(document.querySelector('#invitado').getBoundingClientRect().height)) === 54, 'botones de la entrada de 54');
  await p.click('#invitado'); await p.waitForTimeout(1100);
  const A = async (a, q, ms = 450) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const LS = async () => p.evaluate(() => JSON.parse(localStorage.getItem('scaeli-daily-local') || '{}'));
  const K = 'scaeli-daily-local';
  // Barra flotante con las cinco secciones y su nombre a la vista
  const nav = await p.evaluate(() => { const n = document.querySelector('#nav .in'), B = [...n.querySelectorAll('button')]; return { h: Math.round(n.getBoundingClientRect().height), n: B.length, vis: B.every(x => getComputedStyle(x.querySelector('span')).display !== 'none'), act: B.filter(x => x.getAttribute('aria-current') === 'page').map(x => x.innerText.trim()).join() }; });
  ok(nav.h === 64 && nav.n === 5 && nav.vis && nav.act === 'Hoy', 'barra flotante: ' + JSON.stringify(nav));
  // Rangos: 30 días perfectos = 540 = Diamante I, y ya no es el más alto
  const sembrar = async (n) => { await p.evaluate(([K, n]) => { const s = JSON.parse(localStorage.getItem(K) || '{}'); Object.keys(s).filter(k => k.startsWith('daily_days/')).forEach(k => delete s[k]); const pad = x => String(x).padStart(2, '0'); const f = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); for (let i = 0; i < n; i++) { const d = new Date(); d.setDate(d.getDate() - i); s['daily_days/' + f(d)] = { m: 1, r: 1, rn: 1, t: Date.now() }; } localStorage.setItem(K, JSON.stringify(s)); }, [K, n]);
    await p.reload(); await p.waitForTimeout(1300); await p.evaluate(() => window.DAILY.ir('yo')); await p.waitForTimeout(500);
    return p.evaluate(() => { const c = document.querySelector('.rangoc'); return { t: c.innerText.replace(/\s+/g, ' '), on: c.querySelectorAll('.rgtop .rgd i.on').length, esc: c.querySelectorAll('.rgesc span').length, yo: (c.querySelector('.rgesc span.yo') || {}).innerText, img: (c.querySelector('.rgtop img.escudo') || {}).src || '', nat: (c.querySelector('.rgtop img.escudo') || {}).naturalWidth, faltan: c.querySelectorAll('.rgesc span.falta').length }; }); };
  let r = await sembrar(30);
  ok(/Diamante I\b/.test(r.t) && /\b540 puntos/.test(r.t) && /faltan 50 puntos para Celestial III/.test(r.t) && r.on === 3 && r.yo === 'Diamante' && r.faltan === 2, '30 días: Diamante I, 540, tres puntitos: ' + JSON.stringify(r).slice(0, 220));
  ok(r.esc === 8 && /assets\/rangos\/diamante\.png$/.test(r.img) && r.nat === 64, 'escalera de ocho e insignia de PixelLab: ' + r.esc + ' ' + r.img.slice(-30) + ' ' + r.nat);
  r = await sembrar(40); ok(/Celestial III\b/.test(r.t) && /\b590 puntos/.test(r.t) && r.on === 1 && r.yo === 'Celestial', 'racha de 40: Celestial III con 590 y un puntito: ' + r.t.slice(0, 120));
  r = await sembrar(68); ok(/Celestial I\b/.test(r.t) && /\b730 puntos/.test(r.t) && r.on === 3, 'racha de 68: Celestial I con 730: ' + r.t.slice(0, 120));
  r = await sembrar(110); ok(/Divino I\b/.test(r.t) && /\b940 puntos/.test(r.t) && /rango más alto/.test(r.t) && r.on === 3 && r.faltan === 0 && /divino\.png$/.test(r.img), 'racha de 110: Divino I con 940, el más alto: ' + r.t.slice(0, 140));
  r = await sembrar(400); ok(/\b940 puntos/.test(r.t), 'tope de 940 aunque la racha siga: ' + r.t.slice(0, 90));
  r = await sembrar(10); ok(/Plata II\b/.test(r.t) && /\b180 puntos/.test(r.t) && r.on === 2, 'los rangos de antes no cambian (10 días = Plata II, 180): ' + r.t.slice(0, 100));
  // Portadas propias (los caminos guiados son de Scaeli+: se activa el gancho de prueba solo para mirar la portada)
  await p.evaluate(() => localStorage.setItem('daily_plus_prueba', '1'));
  for (const [view, extra, nom] of [['libros', {}, 'biblioteca'], ['donar', {}, 'donar'], ['grupo', {}, 'grupo'], ['camino', {}, 'camino']]) {
    await p.evaluate(([view, extra]) => window.DAILY.openSheet({ view, ...extra }), [view, extra]); await p.waitForTimeout(700);
    const im = await p.evaluate(() => { const i = document.querySelector('#sheet .sbanner img'); return i ? { src: i.getAttribute('src'), w: i.naturalWidth, h: i.naturalHeight } : null; });
    ok(im && im.src === 'assets/ilus/daily_' + nom + '.png' && im.w === 320 && im.h === 184, 'portada propia de ' + view + ': ' + JSON.stringify(im)); await p.evaluate(() => window.DAILY.closeSheet()); await p.waitForTimeout(200); }
  await p.evaluate(() => localStorage.removeItem('daily_plus_prueba'));
  // Más: interruptores, Ángelus y latín
  await p.evaluate(() => window.DAILY.ir('mas')); await p.waitForTimeout(400);
  ok((await p.$$('.swt[role="switch"]')).length >= 5, 'interruptores en Más');
  await p.click('.swt[data-a="recAng"]'); await p.waitForTimeout(500); let st = await LS();
  ok(st['daily_settings/recordatorios'] && st['daily_settings/recordatorios'].ang === true && await p.evaluate(() => document.querySelector('.swt[data-a="recAng"]').getAttribute('aria-checked')) === 'true', 'aviso del Ángelus activado');
  await p.click('.swt[data-a="prefLat"]'); await p.waitForTimeout(600); st = await LS(); ok(st['daily_settings/profile'] && st['daily_settings/profile'].lat === true, 'preferencia de latín guardada');
  await A('oraciones'); ok(await p.evaluate(() => { const x = document.querySelector('#sheet .lat-seg button[aria-pressed="true"]'); return !!x && /Lat/.test(x.innerText); }), 'Oraciones abre en latín');
  await A('oracion', 1); t = await p.evaluate(() => document.querySelector('#sheet').innerText); ok(/Pater noster/i.test(t), 'el Padrenuestro en latín: ' + t.slice(0, 60).replace(/\n/g, ' | '));
  await A('oraLat', 0); t = await p.evaluate(() => document.querySelector('#sheet').innerText); ok(/Padre nuestro/i.test(t), 'se puede volver al español ahí mismo');
  await p.evaluate(() => window.DAILY.closeSheet()); await p.waitForTimeout(200);
  await p.click('.swt[data-a="tema"]'); await p.waitForTimeout(500); ok(await p.evaluate(() => document.documentElement.getAttribute('data-theme')) === 'light' && await p.evaluate(() => getComputedStyle(document.body).backgroundColor) === 'rgb(250, 244, 234)', 'modo claro en crema');
  await p.click('.swt[data-a="tema"]'); await p.waitForTimeout(400);
  // Lo que se instala
  const sw = await p.evaluate(() => fetch('sw.js').then(r => r.text())); ok(/scaeli-daily-v30/.test(sw) && /css\/v2\.css/.test(sw) && /assets\/rangos\//.test(sw) && /"biblioteca","donar","grupo","camino"/.test(sw), 'el service worker guarda lo nuevo');
  const mf = await p.evaluate(() => fetch('manifest.webmanifest').then(r => r.json())); ok(mf.theme_color === '#170A0D' && mf.background_color === '#170A0D', 'manifest en bordó');
  ok(await p.evaluate(() => import('./js/app.js').then(m => m.VERSION)) === '2.0.2', 'versión 2.0.2');
  console.log('T31', errs.concat(fails).join('\n') || 'OK'); await b.close(); })();
