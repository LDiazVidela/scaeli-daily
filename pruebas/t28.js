// t28 · Daily 1.11: Álbum de santos con cartas del juego, álbum del grupo, un sobre por semana, diploma y migración del álbum de 1.10
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [], fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);
  await p.click('#invitado'); await p.waitForTimeout(1100);
  const A = async (a, q, ms = 500) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const SH = async () => p.evaluate(() => document.querySelector('#sheet').innerText);
  const LS = async () => p.evaluate(() => JSON.parse(localStorage.getItem('scaeli-daily-local') || '{}'));
  const dias = async (n) => { await p.evaluate(n => { const K = 'scaeli-daily-local'; const s = JSON.parse(localStorage.getItem(K) || '{}'); const pad = x => String(x).padStart(2, '0'); const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
      const h = new Date(); const lun = new Date(h); lun.setDate(h.getDate() - ((h.getDay() + 6) % 7)); Object.keys(s).filter(k => k.startsWith('daily_days/')).forEach(k => delete s[k]);
      for (let i = 0; i < 7 && n > 0; i++) { const d = new Date(lun); d.setDate(lun.getDate() + i); if (d > h) break; s['daily_days/' + iso(d)] = { m: 1, t: Date.now() }; n--; } localStorage.setItem(K, JSON.stringify(s)); }, n); await p.reload(); await p.waitForTimeout(1300); };
  const hoyDow = await p.evaluate(() => (new Date().getDay() + 6) % 7);   // 0 = lunes
  // sin grupo: se ve el álbum, pero no se abren sobres
  await A('album', null, 700); let t = await SH(); ok(/Álbum de santos/.test(t) && /0\s*\/\s*79/.test(t.replace(/\n/g, ' ')), 'álbum vacío de 79');
  ok(/Sumate a un grupo/.test(t), 'pide grupo para el sobre'); ok((await p.$$('.albgrid .albcel')).length === 79, '79 lugares');
  ok((await p.$$('.albgrid .hueco')).length === 79, 'todos vacíos');
  await A('sobreAbrir', null, 400); ok(!(await LS())['daily_settings/album'], 'sin grupo no abre'); await A('cerrar');
  // con grupo de ejemplo: el álbum suma lo de todos
  await A('grupo'); await A('gEjemplo', null, 1200); await A('cerrar');
  await A('album', null, 700); const nG = await p.evaluate(() => document.querySelectorAll('.albgrid .cw:not(.hueco)').length); ok(nG > 5 && nG < 79, 'cartas de los demás en el álbum del grupo: ' + nG);
  t = await SH(); ok(/Los de la parroquia/.test(t), 'dice de qué grupo es'); ok(/Juan|Clari|Mateo|Sofi/.test(await p.evaluate(() => document.querySelector('.albgrid').innerText)), 'muestra quién sumó cada carta');
  ok(await p.evaluate(() => { const c = document.querySelector('.albgrid .cw:not(.hueco)'); return c && Math.abs(c.getBoundingClientRect().width - c.parentElement.getBoundingClientRect().width) < 2 && c.querySelector('.carta').getBoundingClientRect().width < 140; }), 'la carta se escala a su celda');
  ok(await p.evaluate(() => [...document.querySelectorAll('.albgrid .carta img.cpj')].every(i => i.complete && i.naturalWidth > 0)), 'dibujos del juego cargados');
  // menos de 5 días con Dios: no hay sobre
  if (hoyDow >= 4) { await dias(4); await A('album', null, 600); t = await SH(); ok(/Te falta 1 día/.test(t), 'faltan días'); await A('sobreAbrir', null, 400); ok(!(await LS())['daily_settings/album'], 'con 4 días no abre'); await A('cerrar'); }
  // 5 días (o forzado si la semana recién empieza)
  if (hoyDow >= 4) await dias(5); else await p.evaluate(() => { window.__fuerza = 1; });
  if (hoyDow < 4) { await p.evaluate(() => { const K = 'scaeli-daily-local'; const s = JSON.parse(localStorage.getItem(K)); const pad = x => String(x).padStart(2, '0'); const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); const d = new Date(); s['daily_days/' + iso(d)] = { m: 1, t: Date.now() }; localStorage.setItem(K, JSON.stringify(s)); }); await p.reload(); await p.waitForTimeout(1300); }
  await A('album', null, 600); t = await SH();
  if (hoyDow >= 4) {
    ok(/sobre de la semana está listo/.test(t), 'sobre listo'); await A('cerrar'); await p.evaluate(() => window.DAILY.ir('hoy')); await p.waitForTimeout(400); ok(await p.$('#app .albc.listo') !== null, 'aviso del sobre en Hoy');
    const antes = nG; await A('sobreAbrir', null, 900); t = await SH(); ok(/Tocá el sobre/.test(t) && await p.$('.sbgrande .sobre3') !== null, 'sobre cerrado');
    await p.click('.sbgrande'); await p.waitForTimeout(2600); ok((await p.$$('.sobrev .sale .flip')).length === 3, 'salen 3 cartas'); t = await SH(); ok(/Nueva|Ya estaba/i.test(t), 'marca nueva / ya estaba');
    const sale = await p.evaluate(() => [...document.querySelectorAll('.sobrev .sale')].map(e => e.dataset.p));
    let st = await LS(); let al = st['daily_settings/album']; ok(al && al.v === 2 && al.ab.length === 1 && sale.every(id => al.c[id] >= 1 && al.t[id] > 0), 'cartas guardadas: ' + JSON.stringify(al && al.ab));
    const ficha = await p.evaluate(() => { const st = JSON.parse(localStorage.getItem('scaeli-daily-grupos')); const g = Object.values(st)[0]; const me = Object.values(g.m).find(x => x.cs && Object.keys(x.cs).length && !/^ej/.test(x.n)); return me ? Object.keys(me.cs) : []; });
    await p.waitForTimeout(1200); const ficha2 = await p.evaluate(() => { const st = JSON.parse(localStorage.getItem('scaeli-daily-grupos')); const g = Object.values(st)[0]; return Object.entries(g.m).filter(([u]) => !/^ej/.test(u)).map(([u, x]) => Object.keys(x.cs || {})).flat(); });
    ok(sale.every(id => ficha2.includes(id)), 'las cartas viajan en la ficha del grupo');
    await A('figu', sale[0], 600); t = await SH(); ok(/sumaste vos|La sumó/.test(t) && await p.$('#sheet .figuwrap .carta') !== null, 'detalle de la carta');
    await A('sobreAbrir', null, 400); st = await LS(); ok(st['daily_settings/album'].ab.length === 1, 'un solo sobre por semana');
    await A('album', null, 600); t = await SH(); ok(/Ya abriste el sobre/.test(t), 'avisa que ya lo abrió');
  }
  // álbum completo → diploma con código
  await p.evaluate(() => { const K = 'scaeli-daily-local'; const s = JSON.parse(localStorage.getItem(K)); const a = s['daily_settings/album'] || { v: 2, c: {}, t: {}, ab: [] }; a.v = 2; a.t = a.t || {}; a.c = a.c || {};
    ['virgenmaria', 'miguel', 'gabriel', 'rafael', 'jp2', 'reymago', 'juanbautista', 'pedro', 'pablo', 'juan', 'abraham', 'moises', 'francisco', 'carlo', 'teresita', 'brochero', 'bosco', 'jose', 'teresa', 'antula', 'cayetano', 'ignacio', 'javier', 'avila', 'clara', 'rosa', 'porres', 'tomas', 'antonio', 'benito', 'pio', 'faustina', 'juana', 'agustin', 'jeronimo', 'ambrosio', 'crisostomo', 'atanasio', 'andres', 'santiago', 'frassati', 'josegregorio', 'rendiles', 'bartololongo', 'isabel', 'marta', 'mariabetania', 'lazaro', 'samaritana', 'magdalena', 'natanael', 'kolbe', 'lorenzo', 'esteban', 'sebastian', 'ines', 'cecilia', 'tarcisio', 'joselito', 'tomasmoro', 'romero', 'angelelli', 'torot', 'lucia', 'pastor', 'chiaracorbella', 'negromanuel', 'gaudi', 'lejeune', 'talbot', 'shaw', 'benitaarias', 'camilarolon', 'lauravicuna', 'chiarabadano', 'pironio', 'esquiu', 'carlosaustria', 'ceferino'].forEach((id, i) => { a.c[id] = a.c[id] || 1; a.t[id] = a.t[id] || 1762500000 + i; }); s['daily_settings/album'] = a; localStorage.setItem(K, JSON.stringify(s)); });
  await p.reload(); await p.waitForTimeout(1500); await A('album', null, 700); t = await SH(); ok(/79\s*\/\s*79/.test(t.replace(/\n/g, ' ')) && /Álbum completo/.test(t), 'álbum completo');
  await A('diploma', null, 600); t = await SH(); const cod = await p.evaluate(() => document.querySelector('.diploma .dcod b').innerText); ok(/^ALB-[A-Z0-9]+-[A-Z0-9]{4}$/.test(cod), 'código: ' + cod); ok(/Los de la parroquia/.test(t) && /Juan/.test(t), 'diploma con grupo y miembros');
  await A('cerrar');
  // migración del álbum de 1.10 (figuritas por fecha) a cartas
  await p.evaluate(() => { const K = 'scaeli-daily-local'; const s = JSON.parse(localStorage.getItem(K)); s['daily_settings/album'] = { c: { '10-04': 2, '03-19': 1, '07-30': 1 }, ab: 2, ini: '2026-11-06', cj: 0, rec: [], env: [] }; localStorage.setItem(K, JSON.stringify(s)); });
  await p.reload(); await p.waitForTimeout(1600); const m = (await LS())['daily_settings/album']; ok(m.v === 2 && m.c.francisco === 2 && m.c.jose === 1 && Object.keys(m.c).length === 2 && Array.isArray(m.ab) && !m.mig, 'migración 1.10 → cartas: ' + JSON.stringify(m));
  const VER = require('fs').readFileSync(require('path').join(__dirname, '..', 'js', 'app.js'), 'utf8').match(/VERSION="([^"]+)"/)[1]; ok(VER === '1.11' || VER > '1.11', 'versión ' + VER);
  console.log('T28', errs.concat(fails).join('\n') || 'OK'); await b.close(); })();
