// t36 · Daily 2.2.1–2.2.2: seguridad y cobros. Con PAGOS_WEB=true (solo web): los botones de Scaeli+ van a los planes de
// Mercado Pago (mensual $4.700 y anual $31.600), sin PayPal hasta que haya links; donaciones sin link = montos sin botón;
// el botón de arrepentimiento y el de baja en Más, en el paywall y al pie de los términos; los dos formularios arman el mail
// a scaeli.app@gmail.com; gracias.html explica cómo activar el código; en la app nativa nada de esto (solo las tiendas);
// las reglas de codes usan get (no list) y los códigos nuevos tienen 12 caracteres al azar.
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const errs = [], fails = []; const ok = (c, m) => { if (process.env.V) console.log((c ? '  ok ' : '  XX ') + m); if (!c) fails.push(m); };
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);
  await p.click('#invitado'); await p.waitForTimeout(1000);
  const A = async (a, q, ms = 450) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  await A('plus'); let t = await p.evaluate(() => document.querySelector('#sheetIn').innerText);
  const planes = await p.evaluate(() => [...document.querySelectorAll('#sheetIn a.plan')].map(a => [a.href, a.innerText.replace(/\s+/g, ' ')]));
  ok(planes.some(x => x[0] === 'https://mpago.la/1edv2dB' && /Mensual/.test(x[1]) && /\$4\.700/.test(x[1])), 'plan mensual → Mercado Pago «Scaeli+ mensual» $4.700');
  ok(planes.some(x => x[0] === 'https://mpago.la/2HEee7L' && /Anual/.test(x[1]) && /\$31\.600/.test(x[1])), 'plan anual → Mercado Pago «Scaeli+ anual» $31.600');
  ok(planes.length === 2 && !(await p.$('#sheetIn a[href*="paypal"]')) && !/PayPal ·/.test(t), 'sin PayPal mientras no haya links');
  ok(!/llega pronto/.test(t) && await p.$('#sheetIn form[data-f="plusCodigo"]'), 'paywall activo y con el canje de códigos');
  ok(await p.$('#sheetIn a[href="arrepentimiento.html"]') && await p.$('#sheetIn a[href="baja.html"]') && /menor de 18/.test(t), 'el paywall enlaza arrepentimiento y baja, y avisa a los menores');
  await A('donarVer'); t = await p.evaluate(() => document.querySelector('#sheetIn').innerText);
  ok(!(await p.$('#sheetIn a.donm')) && (await p.$$('#sheetIn .donm.off')).length === 3 && /se activan en estos días/.test(t), 'donaciones: sin links todavía, montos sin botón');
  await A('cerrar'); await p.evaluate(() => window.DAILY.ir('mas')); await p.waitForTimeout(300);
  ok(await p.$('#app a[href="arrepentimiento.html"]') && await p.$('#app a[href="baja.html"]'), 'Más muestra el botón de arrepentimiento y el de baja (sin cuenta)');
  for (const [pg, asunto, re] of [['arrepentimiento.html', 'Arrepentimiento · Scaeli+', /Tenés 10 días corridos desde el pago para arrepentirte sin dar motivos; te devolvemos el dinero\./], ['baja.html', 'Baja · Scaeli+', /mercadopago\.com\.ar\/subscriptions[\s\S]*paypal\.com\/myaccount\/autopay/]]) {
    await p.goto('http://localhost:8765/' + pg); const h = await p.content();
    ok(re.test(h) && await p.$('form input[type=email]'), pg + ': texto y enlaces');
    await p.fill('input[type=email]', 'prueba@ejemplo.com'); if (await p.$('input[type=date]')) await p.fill('input[type=date]', '2026-11-15');
    const m = await p.evaluate(() => new Promise(res => { const f = document.getElementById('f'); f.addEventListener('submit', () => setTimeout(() => res([window.__mailto || '', document.getElementById('ok').classList.contains('on')]), 50)); f.requestSubmit(); }));
    const u = decodeURIComponent(m[0]);
    ok(m[0].startsWith('mailto:scaeli.app@gmail.com?subject=') && u.includes(asunto) && u.includes('prueba@ejemplo.com') && m[1], pg + ': el pedido va a scaeli.app@gmail.com con el asunto y los datos');
  }
  await p.goto('http://localhost:8765/gracias.html'); const gh = await p.content();
  ok(/Más → Scaeli\+/.test(gh) && /¿Tenés un código\?/.test(gh) && /SCAELI-7KQ2-M9XA-4TPE/.test(gh) && /arrepentimiento\.html/.test(gh) && /baja\.html/.test(gh), 'gracias.html explica cómo activar el código y enlaza arrepentimiento y baja');
  await p.goto('http://localhost:8765/terminos.html'); const th = await p.content();
  ok(/Si sos menor de 18 años, necesitás la autorización de tu mamá, papá o tutor para pagar Scaeli\+ o hacer una donación\./.test(th), 'términos: autorización de los menores');
  ok(/href="arrepentimiento.html"[\s\S]*href="baja.html"[\s\S]*<\/main>/.test(th) && /class="card botones"/.test(th), 'términos: los dos botones al pie');
  const rules = fs.readFileSync(__dirname + '/../firestore.rules', 'utf8'); const codes = rules.slice(rules.indexOf('match /codes/'));
  ok(/allow get: if request\.auth != null;/.test(codes) && !/allow read/.test(codes), 'reglas: codes con get y sin read');
  const gen = require('child_process').execSync('node ' + __dirname + '/../herramientas/codigo_plus.mjs 3 31 x').toString();
  ok((gen.match(/^SCAELI-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/gm) || []).length === 3, 'códigos nuevos de 12 caracteres al azar');
  const app = fs.readFileSync(__dirname + '/../js/app.js', 'utf8');
  ok(/const PAGOS_WEB=true;/.test(app), 'PAGOS_WEB activado');
  ok(/\(PAGOS_WEB&&!esNativo\(\)\?/.test(app) && /\(nat\?'<div class="planes">/.test(app) && /:donarWeb\(\)\)/.test(app) && /nat\?'La suscripción se renueva sola/.test(app), 'en la app nativa no hay Mercado Pago, PayPal ni sus botones');
  console.log(errs.join('\n')); console.log(fails.length ? 'FALLAS:\n' + fails.join('\n') : 'OK t36');
  await b.close(); process.exit(fails.length || errs.length ? 1 : 0); })();
