// t36 · Daily 2.2.1: seguridad y cobros. Con PAGOS_WEB=false no hay ningún botón de pago (Scaeli+ ni donaciones) y el
// paywall dice «Scaeli+ llega pronto», pero el código se puede canjear; las páginas del botón de arrepentimiento y de baja
// existen y los términos las enlazan, con la autorización para menores; las reglas de codes usan get (no list).
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const errs = [], fails = []; const ok = (c, m) => { if (process.env.V) console.log((c ? '  ok ' : '  XX ') + m); if (!c) fails.push(m); };
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);
  await p.click('#invitado'); await p.waitForTimeout(1000);
  const A = async (a, q, ms = 450) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  await A('plus'); let t = await p.evaluate(() => document.querySelector('#sheetIn').innerText);
  ok(/Scaeli\+ llega pronto/.test(t), 'el paywall dice «Scaeli+ llega pronto»');
  ok(!(await p.$('#sheetIn a.plan')) && !(await p.$('#sheetIn a[href*="mpago"]')) && !(await p.$('#sheetIn a[href*="paypal"]')), 'sin botones de Mercado Pago ni PayPal');
  ok(await p.$('#sheetIn form[data-f="plusCodigo"]'), 'el código se puede seguir canjeando');
  await A('donarVer'); t = await p.evaluate(() => document.querySelector('#sheetIn').innerText);
  ok(/Las donaciones llegan pronto/.test(t) && !(await p.$('#sheetIn a.donm')), 'donaciones: llegan pronto y sin botones');
  await A('cerrar'); await p.evaluate(() => window.DAILY.ir('mas')); await p.waitForTimeout(300);
  ok(!(await p.$('a[href="arrepentimiento.html"]')), 'con los cobros apagados, Más no muestra los botones todavía');
  for (const [pg, re] of [['arrepentimiento.html', /Tenés 10 días corridos desde el pago para arrepentirte sin dar motivos; te devolvemos el dinero\./], ['baja.html', /mercadopago\.com\.ar\/subscriptions[\s\S]*paypal\.com\/myaccount\/autopay/]]) {
    await p.goto('http://localhost:8765/' + pg); const h = await p.content();
    ok(re.test(h) && /mailto:scaeli\.app@gmail\.com/.test(h) && await p.$('form input[type=email]'), pg + ': texto, enlaces y formulario por mail');
    await p.fill('input[type=email]', 'prueba@ejemplo.com'); if (await p.$('input[type=date]')) await p.fill('input[type=date]', '2026-11-15');
    const pedido = await p.evaluate(() => new Promise(res => { const f = document.getElementById('f'); f.addEventListener('submit', () => setTimeout(() => res(document.getElementById('ok').classList.contains('on')), 50)); f.requestSubmit(); }));
    ok(pedido, pg + ': al mandar el formulario se arma el mail');
  }
  await p.goto('http://localhost:8765/terminos.html'); const th = await p.content();
  ok(/Si sos menor de 18 años, necesitás la autorización de tu mamá, papá o tutor para pagar Scaeli\+ o hacer una donación\./.test(th), 'términos: autorización de los menores');
  ok(/href="arrepentimiento.html"[\s\S]*href="baja.html"[\s\S]*<\/main>/.test(th) && /class="card botones"/.test(th), 'términos: los dos botones al pie');
  const rules = fs.readFileSync(__dirname + '/../firestore.rules', 'utf8'); const codes = rules.slice(rules.indexOf('match /codes/'));
  ok(/allow get: if request\.auth != null;/.test(codes) && !/allow read/.test(codes), 'reglas: codes con get y sin read');
  const gen = require('child_process').execSync('node ' + __dirname + '/../herramientas/codigo_plus.mjs 3 31 x').toString();
  ok((gen.match(/^SCAELI-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/gm) || []).length === 3, 'códigos nuevos de 12 caracteres al azar');
  const app = fs.readFileSync(__dirname + '/../js/app.js', 'utf8');
  ok(/const PAGOS_WEB=false;/.test(app) && /\(PAGOS_WEB&&!esNativo\(\)\?/.test(app), 'PAGOS_WEB apagado y los botones solo en la web');
  console.log(errs.join('\n')); console.log(fails.length ? 'FALLAS:\n' + fails.join('\n') : 'OK t36');
  await b.close(); process.exit(fails.length || errs.length ? 1 : 0); })();
