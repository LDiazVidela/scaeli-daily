// t34 · Daily 2.1.2: los personajes con la cara del deportivo y la deportiva (la misma cara en los 88 dibujos)
// y las cartas, el dorso, el sobre y la portada del álbum en pixel art (assets/cartas)
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [], fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  const malos = []; p.on('response', r => { if (/assets\/(cartas|personaje)\//.test(r.url()) && r.status() >= 400) malos.push(r.url()); });
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);
  await p.click('#invitado'); await p.waitForTimeout(1000);
  const A = async (a, q, ms = 600) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  // la cara: en cada dibujo, la zona de ojos, nariz y boca es igual píxel a píxel a la del deportivo (buscando el corrimiento)
  const caras = await p.evaluate(async () => {
    const meta = await fetch('assets/personaje/pj.json').then(r => r.json()); const res = {};
    for (const sx of ['m', 'f']) {
      const im = new Image(); im.src = 'assets/personaje/' + sx + '.png'; await im.decode();
      const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; const x = cv.getContext('2d'); x.drawImage(im, 0, 0);
      const d = x.getImageData(0, 0, im.width, im.height).data, W = im.width;
      const px = (f, X, Y) => { const i = ((f * 128 + Y) * W + X) * 4; return d[i] + ',' + d[i + 1] + ',' + d[i + 2] + ',' + d[i + 3]; };
      const dep = meta[sx].combos['deportiva|base'].fila, y0 = sx === 'm' ? 19 : 17, y1 = y0 + 8;
      let malos = [];
      for (const [k, v] of Object.entries(meta[sx].combos)) { if (k === 'deportiva|base') continue; let igual = false;
        for (let dy = -4; dy <= 4 && !igual; dy++) for (let dx = -4; dx <= 4 && !igual; dx++) { let n = 0, t = 0;
          for (let Y = y0; Y < y1; Y++) for (let X = 58; X < 69; X++) { t++; if (px(v.fila, X + dx, Y + dy) === px(dep, X, Y)) n++; }
          if (n / t > 0.9) igual = true; }
        if (!igual) malos.push(k); }
      res[sx] = malos; }
    return res; });
  ok(caras.m.length === 0, 'varón con la cara del deportivo: ' + caras.m.join(' ')); ok(caras.f.length === 0, 'mujer con la cara de la deportiva: ' + caras.f.join(' '));
  // las cartas
  await p.evaluate(() => { const K = 'scaeli-daily-local'; const s = JSON.parse(localStorage.getItem(K) || '{}'); const t = Math.round(Date.now() / 1000); s['daily_settings/album'] = { v: 2, c: { virgenmaria: 1, kolbe: 1, reymago: 1, pastor: 1 }, t: { virgenmaria: t, kolbe: t, reymago: t, pastor: t }, ab: [] }; localStorage.setItem(K, JSON.stringify(s)); });
  await p.reload(); await p.waitForTimeout(1300);
  await A('album', null, 1200);
  ok(await p.evaluate(() => { const i = document.querySelector('.albport img'); return i && i.complete && i.naturalWidth > 0; }), 'portada del álbum');
  ok(await p.evaluate(() => { const L = [...document.querySelectorAll('.albgrid .carta img.marco')]; return L.length === 4 && L.every(i => i.complete && i.naturalWidth > 0); }), 'marcos de las cartas');
  ok(await p.evaluate(() => [...document.querySelectorAll('.albgrid .carta')].map(c => c.className.match(/r-(\w+)/)[1] + ':' + c.querySelector('img.marco').getAttribute('src').match(/marco-(\w+)/)[1]).every(s => s.split(':')[0] === s.split(':')[1])), 'cada rareza con su marco');
  ok(await p.evaluate(() => /^\d+$/.test(document.querySelector('.albgrid .carta .cnum').innerText.trim())), 'número en el medallón');
  ok(await p.evaluate(() => { const i = document.querySelector('.sobrec .sb-img'); return i && i.complete && i.naturalWidth > 0; }), 'sobre dibujado');
  await A('figu', 'pedro', 900);
  ok(await p.evaluate(() => { const i = document.querySelector('.figuwrap .dorso .dimg'); return i && i.complete && i.naturalWidth > 0; }), 'dorso dibujado');
  await A('figu', 'kolbe', 900);
  ok(await p.evaluate(() => { const c = document.querySelector('.figuwrap .carta'), pn = c.querySelector('.panel').getBoundingClientRect(), m = c.querySelector('img.marco').getBoundingClientRect(); return pn.left > m.left && pn.right < m.right && pn.top > m.top && pn.bottom < m.bottom; }), 'el panel queda dentro del marco');
  ok(malos.length === 0, 'archivos que no cargan: ' + malos.join(' '));
  console.log('T34', errs.concat(fails).join('\n') || 'OK'); await b.close(); })();
