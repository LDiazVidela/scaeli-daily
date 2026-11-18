// t42 · Daily 2.6: pantalla Grupo en la barra, «Más» dentro de Yo, avisos de Scaeli (push), topes de grupos 2 y 10,
// consagrados adultos y mayores, barbas y caras del joven (capas de PixelLab), piel oscura pareja (orejas y contorno).
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const errs = [], fails = []; const ok = (c, m) => { if (process.env.V) console.log((c ? '  ok ' : '  XX ') + m); if (!c) fails.push(m); };
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);
  await p.click('#invitado'); await p.waitForTimeout(2200);
  const A = async (a, q, ms = 450) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const T = () => p.evaluate(() => document.querySelector('#app').innerText);
  const app = fs.readFileSync(__dirname + '/../js/app.js', 'utf8'), sw = fs.readFileSync(__dirname + '/../sw.js', 'utf8'), fb = fs.readFileSync(__dirname + '/../js/firebase.js', 'utf8');
  // 1 · la barra: Hoy, Rezar, Grupo, Día, Yo
  const nav = await p.evaluate(() => [...document.querySelectorAll('#nav button')].map(x => x.dataset.view).join(','));
  ok(nav === 'hoy,rezar,grupo,dia,yo', 'barra: ' + nav);
  await p.click('#nav button[data-view="grupo"]'); await p.waitForTimeout(600); let t = await T();
  ok(await p.evaluate(() => window.DAILY.get().view === 'grupo') && /grupo/i.test(t) && await p.$('#app [data-a="grupo"]'), 'sin grupo: la pantalla invita a crear o unirse');
  await A('gEjemplo', undefined, 900); await A('cerrar'); await p.evaluate(() => window.DAILY.ir('grupo')); await p.waitForTimeout(600); t = await T();
  ok((await p.$$('#app .gmenu .gfila')).length >= 5 && /Chat/.test(t) && /Intenciones/.test(t) && /Encuentros/.test(t) && /Cantos del grupo/.test(t) && /Ranking/.test(t), 'con grupo: chat, intenciones, desafío, encuentros, cantos y ranking a un toque');
  await p.click('#app .gmenu .gfila'); await p.waitForTimeout(600); ok(await p.evaluate(() => { const s = window.DAILY.get().sheet; return s && s.view === 'grupo'; }), 'la primera fila abre el grupo'); await A('cerrar');
  ok(/<symbol id="i-send"[^>]*><path d="M12 19V5"/.test(fs.readFileSync(__dirname + '/../index.html', 'utf8')), 'ícono de enviar nuevo (flecha)');
  // 2 · Más vive dentro de Yo
  await p.click('#nav button[data-view="yo"]'); await p.waitForTimeout(500); ok(await p.$('#app .yomas') && await p.$('#app .irmas'), 'Yo: «Ajustes y más»');
  await p.click('#app .yomas'); await p.waitForTimeout(500); t = await T();
  ok(await p.evaluate(() => window.DAILY.get().view === 'mas') && /Avisos de Scaeli/.test(t), 'abre Más, con «Avisos de Scaeli»');
  ok(await p.evaluate(() => document.querySelector('#nav button[data-view="yo"]').getAttribute('aria-current') === 'page' || document.querySelector('#nav button[data-view="yo"]').classList.contains('on') || document.querySelector('#nav button[data-view="yo"]').getAttribute('aria-pressed') === 'true'), 'en Más queda marcado Yo');
  await A('irYo'); ok(await p.evaluate(() => window.DAILY.get().view === 'yo'), 'y se vuelve a Yo');
  // 3 · avisos (push): la clave pública, el service worker y la privacidad
  ok(/PUSH_VAPID\s*=\s*"B[\w-]{80,}"/.test(fb) && /addEventListener\("push"/.test(sw) && /notificationclick/.test(sw) && /firebase-messaging\.js/.test(sw), 'push: clave web, service worker con «push» y «notificationclick»');
  ok(/Avisos de Scaeli/.test(fs.readFileSync(__dirname + '/../privacidad.html', 'utf8')), 'la privacidad cuenta los avisos');
  // 4 · topes de grupos
  ok(/GRUPOS_PLUS=10/.test(app) && /GRUPOS_GRATIS=2/.test(app), 'topes: 2 gratis, 10 con Scaeli+');
  // 5 · personaje
  const r = await p.evaluate(async () => { const PJ = await import('./js/personaje.js'); await PJ.cargar();
    const px = P => { const cv = document.createElement('canvas'); PJ.pintar(cv, P); return cv.getContext('2d').getImageData(0, 0, 128, 128).data; };
    const dif = (a, c) => { let n = 0, y0 = 128, y1 = 0; for (let i = 0; i < a.length; i += 4) if (a[i] !== c[i] || a[i + 1] !== c[i + 1] || a[i + 2] !== c[i + 2]) { n++; const y = (i >> 2) >> 7; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [n, y0, y1]; };
    const o = { cons: {}, barbas: {}, caras: {} };
    for (const [sx, e, pr] of [['m', 'adulto', 'sotana'], ['m', 'mayor', 'clergyman'], ['f', 'adulto', 'carmelita'], ['f', 'mayor', 'caridad']]) { const P = PJ.normal({ sx, edad: e, prenda: pr }); o.cons[sx + e + pr] = P.tipo === pr && P.edad === e && PJ.opciones(P).prendas.some(x => x[0] === pr); }
    const m0 = px({ sx: 'm', prenda: 'remera:azul', peinado: 'corto' });
    for (const [k] of PJ.BARBAS.slice(1)) o.barbas[k] = dif(m0, px({ sx: 'm', prenda: 'remera:azul', peinado: 'corto', barba: k }));
    for (const sx of ['m', 'f']) { const c0 = px({ sx, prenda: 'buzo:gris' }); for (const [k] of PJ.CARAS[sx].slice(1)) o.caras[sx + k] = dif(c0, px({ sx, prenda: 'buzo:gris', cara: k })); }
    o.opM = PJ.opciones(PJ.normal({ sx: 'm' })); o.opF = PJ.opciones(PJ.normal({ sx: 'f' })); o.opA = PJ.opciones(PJ.normal({ sx: 'm', edad: 'adulto' }));
    o.noF = PJ.normal({ sx: 'f', barba: 'completa' }).barba; o.noA = PJ.normal({ sx: 'm', edad: 'adulto', barba: 'completa', cara: 'pecas' });
    // la barba no toma el tono de piel; la piel de alrededor sí
    const bb = px({ sx: 'm', prenda: 'deportiva', barba: 'completa' }), bo = px({ sx: 'm', prenda: 'deportiva', barba: 'completa', tono: 'muyoscura' }), s0 = px({ sx: 'm', prenda: 'deportiva' });
    let igual = 0, tot = 0; for (let i = 0; i < bb.length; i += 4) if (bb[i] !== s0[i] || bb[i + 1] !== s0[i + 1]) { tot++; if (bb[i] === bo[i] && bb[i + 1] === bo[i + 1] && bb[i + 2] === bo[i + 2]) igual++; } o.barbaTono = [igual, tot];
    // piel muy oscura: no quedan puntos anaranjados claros (orejas, dedos, contorno) en los dibujos del joven
    let naranja = 0; for (const P of [{ sx: 'm', prenda: 'deportiva' }, { sx: 'f', prenda: 'deportiva' }, { sx: 'm', prenda: 'remera:blanco' }, { sx: 'f', prenda: 'remera:blanco', peinado: 'suelto' }]) { const d = px({ ...P, tono: 'muyoscura' }); for (let i = 0; i < d.length; i += 4) if (d[i + 3] && d[i] > 185 && d[i] > d[i + 1] + 50 && d[i + 1] > d[i + 2] + 20 && d[i + 2] < 120) naranja++; } o.naranja = naranja;
    return o; });
  ok(Object.values(r.cons).every(Boolean), 'consagrados adultos y mayores, él y ella: ' + JSON.stringify(r.cons));
  ok(Object.keys(r.barbas).length === 4 && Object.values(r.barbas).every(d => d[0] >= 20 && d[1] >= 17 && d[2] <= 50), 'cuatro barbas, de la nariz para abajo: ' + JSON.stringify(r.barbas));
  ok(Object.keys(r.caras).length === 6 && Object.values(r.caras).every(d => d[0] >= 12 && d[1] >= 12 && d[2] <= 36), 'tres caras para él y tres para ella, solo en la cara: ' + JSON.stringify(r.caras));
  ok(r.opM.barbas.length === 5 && r.opM.caras.length === 4 && r.opF.barbas.length === 0 && r.opF.caras.length === 4 && r.opA.barbas.length === 0 && r.opA.caras.length === 0, 'barba solo para el joven; caras para él y ella jóvenes');
  ok(r.noF === 'no' && r.noA.barba === 'no' && r.noA.cara === 'base', 'lo que no existe cae en lo de siempre');
  ok(r.barbaTono[1] > 100 && r.barbaTono[0] > r.barbaTono[1] * 0.8, 'la barba no cambia con el tono de piel: ' + JSON.stringify(r.barbaTono));
  ok(r.naranja <= 12, 'piel muy oscura sin puntos anaranjados: ' + r.naranja);
  // en Yo se eligen y se guardan
  await p.evaluate(() => window.DAILY.ir('yo')); await p.waitForTimeout(500); await A('pjSet', 'sx|m'); await A('pjSet', 'edad|joven');
  ok(await p.$('#app button[data-p="barba|candado"]') && await p.$('#app button[data-p="cara|anteojos"]'), 'Yo ofrece Cara y Barba');
  await p.click('#app button[data-p="barba|candado"]'); await p.waitForTimeout(500); await p.click('#app button[data-p="cara|pecas"]'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => { const P = JSON.parse(localStorage.getItem('scaeli-daily-local'))['daily_settings/profile'] || {}; return P.barba === 'candado' && P.cara === 'pecas'; }), 'se guardan en el perfil');
  ok(await p.evaluate(() => document.querySelector('#app button[data-p="barba|candado"]').getAttribute('aria-pressed') === 'true'), 'y quedan marcadas');
  await A('pjSet', 'sx|f'); ok(!(await p.$('#app button[data-p^="barba|"]')) && await p.$('#app button[data-p="cara|rubor"]'), 'ella: sin barba, con sus caras');
  await A('pjSet', 'edad|mayor'); ok(!(await p.$('#app button[data-p^="cara|"]')), 'las otras edades tienen su propia cara');
  ok(/"\.\/assets\/personaje\/extras\.png"/.test(sw), 'la hoja de capas queda guardada para usar sin conexión');
  ok(/\["2\.6",\[/.test(app), 'las novedades de la 2.6 siguen en la lista');
  await b.close(); if (errs.length) fails.push(...errs);
  if (fails.length) { console.log('t42 FALLA\n - ' + fails.join('\n - ')); process.exit(1); } console.log('t42 OK'); })();
