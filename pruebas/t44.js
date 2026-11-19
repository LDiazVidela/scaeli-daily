// t44 · Daily 2.8: dos traducciones (Torres Amat por defecto, Platense a elección) en las lecturas de la Misa y en la Biblia.
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const errs = [], fails = []; const ok = (c, m) => { if (process.env.V) console.log((c ? '  ok ' : '  XX ') + m); if (!c) fails.push(m); };
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  const DIA = { fecha: '', dia: 'Jueves de la 33a semana del Tiempo Ordinario',
    primera: { titulo: 'Apocalipsis', cita: 'Ap 5,1-10.', texto: 'Y vi en la diestra de Aquel que estaba sentado sobre el trono un libro.', ta: 'Después vi en la mano derecha del que estaba sentado en el solio, un libro.' },
    salmo: { titulo: 'Salmo responsorial', cita: 'Ps 149(148),1-2.', texto: 'Cantad al Señor el cántico nuevo.' },
    evangelio: { titulo: 'Evangelio según san Lucas', cita: 'Lc 19,41-44.', texto: 'Y cuando estuvo cerca, viendo la ciudad, lloró sobre ella.', ta: 'Al llegar cerca de Jerusalén, poniéndose a mirar esta ciudad, derramó lágrimas sobre ella.' } };
  await p.route('**/evangelio/2*.json', r => { const f = r.request().url().match(/(\d{4}-\d{2}-\d{2})\.json/)[1]; r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ...DIA, fecha: f }) }); });
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);
  await p.click('#invitado'); await p.waitForTimeout(2200);
  const A = async (a, q, ms = 600) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const SH = () => p.evaluate(() => (document.querySelector('#sheetIn') || {}).innerText || '');
  // 1 · las lecturas: Torres Amat por defecto
  await A('evangelio', null, 900); let t = await SH();
  ok(/derramó lágrimas sobre ella/.test(t) && !/lloró sobre ella/.test(t) && /Biblia de Torres Amat \(1823\)/.test(t), 'el Evangelio sale en Torres Amat por defecto');
  ok(await p.evaluate(() => { const s = document.querySelectorAll('#sheetIn .trseg button'); return s.length === 2 && s[0].textContent === 'Torres Amat' && s[0].getAttribute('aria-pressed') === 'true' && s[1].textContent === 'Platense'; }), 'selector: Torres Amat (elegida) y Platense');
  await p.click('#sheetIn .trseg button[data-p="pl"]'); await p.waitForTimeout(700); t = await SH();
  ok(/lloró sobre ella/.test(t) && !/derramó lágrimas/.test(t) && /Biblia Platense/.test(t) && await p.evaluate(() => localStorage.getItem('daily_trad') === 'pl'), 'se pasa a la Platense y queda guardado');
  await p.reload(); await p.waitForTimeout(900); if (await p.$('#invitado')) await p.click('#invitado'); await p.waitForTimeout(2200); await A('evangelio', null, 900); t = await SH();
  ok(/lloró sobre ella/.test(t), 'al volver sigue la Platense');
  await p.click('#sheetIn .trseg button[data-p="ta"]'); await p.waitForTimeout(700); t = await SH(); ok(/derramó lágrimas/.test(t), 'y se vuelve a Torres Amat');
  // otro día: una lectura sin Torres Amat cae en la Platense y se avisa
  const man = await p.evaluate(() => { const d = new Date(Date.now() + 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); });
  await A('evDia', man, 1200); t = await SH();
  ok(/Texto: Biblia de Torres Amat \(1823\)/.test(t) && /EVANGELIO/.test(t) && await p.$('#sheetIn .trseg button[data-p="pl"]'), 'los próximos días también salen en Torres Amat, con el selector');
  await A('cerrar'); await A('misa', null, 900); t = await SH(); ok(/Biblia de Torres Amat/.test(t), 'la Misa de hoy nombra la traducción'); await A('cerrar');
  // 2 · la Biblia
  await A('biblia', null, 1200); t = await SH(); ok(/Biblia de Torres Amat · 1823/.test(t) && /Traducción/i.test(t), 'la Biblia abre en Torres Amat, con el selector');
  await A('bibIr', 'Luke|19', 1200); t = await SH(); ok(/derramó lágrimas sobre ella/.test(t), 'Lucas 19 en Torres Amat');
  await A('tradSet', 'pl', 1200); await A('bibIr', 'Luke|19', 1200); t = await SH(); ok(/lloró sobre ella/.test(t), 'Lucas 19 en la Platense');
  await A('bibIr', 'Dan|13', 1200); t = await SH(); ok(/Susana/.test(t), 'Daniel 13 está en la Platense');
  await A('tradSet', 'ta', 1500); await A('bibIr', 'Dan|13', 1200); t = await SH(); ok(/Susana/.test(t) && /Joakim/.test(t), 'y, desde 2.8.1, también en Torres Amat');
  // 3 · los archivos
  const idx = JSON.parse(fs.readFileSync(__dirname + '/../biblia-ta/indice.json', 'utf8')), mapa = JSON.parse(fs.readFileSync(__dirname + '/../biblia-ta/mapa.json', 'utf8'));
  ok(idx.length === 73 && idx.every(x => fs.existsSync(__dirname + '/../biblia-ta/' + x.id + '.json')), 'biblia-ta/: los 73 libros');
  const idxP = JSON.parse(fs.readFileSync(__dirname + '/../biblia/indice.json', 'utf8')); ok(idx.every((x, i) => x.id === idxP[i].id && x.k === idxP[i].k), 'con los mismos capítulos que la Platense (Ester 16, Daniel 14): canon católico completo');
  const ps = JSON.parse(fs.readFileSync(__dirname + '/../biblia-ta/Ps.json', 'utf8')); ok(ps.c.length === 150 && /El Señor es mi pastor/.test(ps.c[21][0]), 'los Salmos con la numeración de la Vulgata (22: El Señor es mi pastor)');
  ok(JSON.stringify(mapa.Num['30,2']) === '[[30,1]]' && JSON.stringify(mapa.Song['5,17']) === '[[6,1]]', 'mapa de versículos donde las dos Biblias cortan distinto');
  const dias = fs.readdirSync(__dirname + '/../evangelio').filter(f => /^\d{4}/.test(f)); let con = 0, tot = 0; for (const f of dias) { const j = JSON.parse(fs.readFileSync(__dirname + '/../evangelio/' + f, 'utf8')); for (const k of ['primera', 'salmo', 'segunda', 'evangelio']) if (j[k] && j[k].texto) { tot++; if (j[k].ta) con++; } }
  ok(tot > 0 && con / tot > 0.9, 'los días guardados traen las dos traducciones: ' + con + ' de ' + tot);
  const { textoDe } = await import(__dirname + '/../herramientas/platense.mjs');
  const a = await textoDe('Lc 19,41-44', 'ta'), c = await textoDe('Lc 19,41-44'), d = await textoDe('Dn 13,1-9', 'ta'), e = await textoDe('Ps 23(22),1-3', 'ta');
  ok(a && /^Al llegar cerca de Jerusalén,/.test(a.texto) && /Dios te ha visitado\.$/.test(a.texto), 'herramienta: Lc 19,41-44 en Torres Amat');
  ok(c && /lloró sobre ella\. Y dijo/.test(c.texto), 'Platense: mayúscula después del punto al unir versículos');
  ok(d && /^Había un varón, que habitaba en Babilonia, llamado Joakim/.test(d.texto), 'Daniel 13 (Susana) en Torres Amat');
  ok(e && /^El Señor es mi pastor/.test(e.texto), 'el salmo, sin el epígrafe');
  const app = fs.readFileSync(__dirname + '/../js/app.js', 'utf8'); ok(/\["2\.8",\[/.test(app), 'las novedades de la 2.8 están en la lista');
  await b.close(); if (errs.length) fails.push(...errs);
  if (fails.length) { console.log('t44 FALLA\n - ' + fails.join('\n - ')); process.exit(1); } console.log('t44 OK'); })();
