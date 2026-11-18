// t40 · Daily 2.4: el salmo de la Misa con la numeración correcta y «el Señor», lecturas de los próximos días, hábitos de días
// pasados con «Deshacer», el grupo con pestañas, novedades cortas, cancionero con acordes, biblioteca con documentos y formación de cada día.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => { const errs = [], fails = []; const ok = (c, m) => { if (process.env.V) console.log((c ? '  ok ' : '  XX ') + m); if (!c) fails.push(m); };
  // 1 · las lecturas (sin navegador)
  const P = await import(path.join(__dirname, '..', 'herramientas', 'platense.mjs'));
  const vg = (h, v) => P.salmoVg(h, v).join(':');
  ok(vg(8, 2) === '8:2' && vg(9, 5) === '9:5' && vg(10, 1) === '9:22' && vg(23, 1) === '22:1' && vg(51, 3) === '50:3', 'salmos 1 a 113: número hebreo → Vulgata');
  ok(vg(114, 1) === '113:1' && vg(115, 1) === '113:9' && vg(116, 9) === '114:9' && vg(116, 10) === '115:1' && vg(117, 1) === '116:1' && vg(146, 7) === '145:7', 'salmos 114 a 146');
  ok(vg(147, 11) === '146:11' && vg(147, 12) === '147:1' && vg(148, 1) === '148:1' && vg(150, 6) === '150:6', 'salmos 147 a 150 (el 150 no se corre)');
  const s150 = await P.textoDe('Ps 150(149),1-2.3-4.5-6.'), s23 = await P.textoDe('Ps 23(22),1-3a.3b-4.5.6.'), s15 = await P.textoDe('Ps 15(14),2-3ab.3cd-4ab.5.');
  ok(s150 && /^¡Aleluya!\nAlabad al Señor en su Santuario/.test(s150.texto), 'el salmo 150 es el 150: ' + (s150 && s150.texto.slice(0, 40)));
  ok(s23 && /^El Señor es mi pastor/.test(s23.texto) && !/Yahv/.test(s23.texto), 'salmo 23: «El Señor es mi pastor»');
  const lineas = t => t.split('\n').filter(Boolean), dup = t => { const L = lineas(t); return L.some((x, i) => x.length > 12 && L.indexOf(x) !== i); };
  ok(s23 && !dup(s23.texto) && s15 && !dup(s15.texto), 'el versículo partido en dos estrofas no se repite');
  ok(P.senor('Bendice a Yahvé, alma mía') === 'Bendice al Señor, alma mía' && P.senor('la casa de Yahvé') === 'la casa del Señor' && P.senor('Escucha, oh Yahvé, mi voz') === 'Escucha, oh Señor, mi voz' && P.senor('Yahvé, el Señor, dice') === 'El Señor Dios, dice' && P.senor('junto a tus altares, Yahvé de los ejércitos,') === 'junto a tus altares, Señor de los ejércitos,', '«Yahvé» → «el Señor» con su gramática');
  const guardadas = fs.readdirSync(path.join(__dirname, '..', 'evangelio')).filter(f => /^\d{4}/.test(f)).map(f => fs.readFileSync(path.join(__dirname, '..', 'evangelio', f), 'utf8')).join('');
  ok(!/Yahv|Hallelú/.test(guardadas), 'las lecturas guardadas no dicen «Yahvé»');

  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);
  await p.click('#invitado'); await p.waitForTimeout(2200);
  const A = async (a, q, ms = 450) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const SH = () => p.evaluate(() => (document.querySelector('#sheetIn') || {}).innerText || '');
  const visible = sel => p.evaluate(s => { const e = document.querySelector(s); return !!e && e.offsetParent !== null; }, sel);

  // 2 · las lecturas de los próximos días
  await A('evangelio', undefined, 1500); const tira = await p.$$('.evtira button');
  ok(tira.length >= 3, 'el Evangelio ofrece los próximos días: ' + tira.length);
  if (tira.length >= 2) { const f = await p.evaluate(() => document.querySelectorAll('.evtira button')[1].dataset.p); await A('evDia', f, 1500); const t = await SH();
    ok(/Evangelio según san/i.test(t) && await p.evaluate(f => window.DAILY.get().sheet.f === f, f), 'se abre la lectura de mañana'); }
  await A('cerrar');

  // 3 · hábitos: días pasados, deshacer y el «+»
  await A('irDia'); await p.fill('form[data-f="habito"] input', 'Rezar antes de comer'); await p.press('form[data-f="habito"] input', 'Enter'); await p.waitForTimeout(400);
  const dias = await p.evaluate(() => [...document.querySelectorAll('.habtira button')].map(x => x.dataset.p));
  ok(dias.length === 7 && await p.evaluate(() => { const t = document.querySelector('.habtira'); return t.scrollWidth <= t.clientWidth + 1; }), 'la tira de hábitos muestra los 7 días sin cortarse');
  await A('habDia', dias[5]); ok(/Estás anotando/.test(await p.evaluate(() => document.body.innerText)), 'avisa que estás anotando otro día');
  await p.click('[data-a="habMas"]'); await p.waitForTimeout(500);
  const hb = f => p.evaluate(f => { const d = window.DAILY.get().days[f]; return d && d.hb ? Object.values(d.hb)[0] : null; }, f);
  ok(((await hb(dias[5])) || {}).p === 1 && !(await hb(dias[6])), 'el hábito queda anotado ayer y no hoy');
  ok(await p.$('.toast.con-deshacer .lnk'), 'el aviso trae «Deshacer»'); await p.click('.toast .lnk'); await p.waitForTimeout(500);
  ok(!((await hb(dias[5])) || {}).p, '«Deshacer» saca el toque equivocado');
  await p.evaluate(() => window.DAILY.ir('hoy')); await p.waitForTimeout(400);
  ok(await p.evaluate(() => { const c = document.querySelector('.hck:not(.on)'); if (!c) return false; const col = getComputedStyle(c).color.match(/\d+/g).map(Number), bg = getComputedStyle(document.body).backgroundColor.match(/\d+/g).map(Number); return Math.abs(col[0] - bg[0]) + Math.abs(col[1] - bg[1]) + Math.abs(col[2] - bg[2]) > 150; }), 'el «+» del hábito se ve en modo oscuro');

  // 4 · el grupo con pestañas
  await A('grupo'); await A('gEjemplo', null, 1200);
  ok((await p.$$('.gtabs button')).length === 4 && await visible('.gpan[data-gp="hoy"]') && !(await visible('.gpan[data-gp="miembros"]')), 'el grupo abre en «Hoy» con cuatro pestañas');
  ok(/Desafío de la semana/i.test(await SH()) && !/Intenciones del grupo/i.test(await SH()), 'en «Hoy» no se mezclan las intenciones');
  await A('gTab', 'miembros'); ok(await visible('.gpan[data-gp="miembros"]') && (await p.$$('.gmiem .grow')).length === 5 && /Recé por vos/.test(await SH()), '«Miembros»: una tarjeta por persona con botones con texto');
  const otro = await p.evaluate(() => document.querySelector('[data-a="gMas"]').dataset.p);
  ok(!(await visible('.grow .gmas:not([hidden])')), 'reportar, bloquear y sacar quedan guardados'); await A('gMas', otro);
  ok(await visible('.grow .gmas:not([hidden])') && /Bloquear/.test(await SH()), '«más» los muestra con su nombre');
  await A('gTab', 'muro'); ok(await visible('form[data-f="muro"]'), '«Muro» con su caja para escribir');
  await A('gTab', 'ranking'); ok(/Ranking de grupos/i.test(await SH()), '«Ranking»'); await A('cerrar');

  // 5 · novedades: pocas y en una sola lista
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  await p.evaluate(() => { localStorage.setItem('daily_ver_vista', '2.2.6'); localStorage.setItem('daily_prueba_novedades', '1'); }); await p.reload(); await p.waitForTimeout(2600);
  const nov = await p.evaluate(() => ({ v: window.DAILY.get().sheet && window.DAILY.get().sheet.view, n: document.querySelectorAll('#sheetIn .nov-lista li').length, c: document.querySelectorAll('#sheetIn .nov-lista .card').length }));
  ok(nov.v === 'novedades' && nov.n >= 1 && nov.n <= 5 && nov.c === 1, 'novedades: una sola tarjeta con 5 líneas como mucho: ' + JSON.stringify(nov));
  ok((app.match(/const NOVEDADES=\[[\s\S]*?\]\];/) || [''])[0].split('\n').every(l => (l.match(/","/g) || []).length <= 5), 'ninguna versión lleva más de 5 líneas');
  await p.evaluate(() => localStorage.removeItem('daily_prueba_novedades')); await A('cerrar');

  // 6 · cancionero
  const C = await import(path.join(__dirname, '..', 'data', 'cancionero.js'));
  ok(C.CANTOS.length >= 25 && new Set(C.CANTOS.map(x => x.id)).size === C.CANTOS.length && C.CANTOS.every(x => x.t && x.a && x.l && x.cat.length && x.cat.every(c => C.CANTOS_CAT.some(k => k[0] === c))), 'cancionero: ' + C.CANTOS.length + ' cantos con título, autor, letra y categoría');
  ok(C.CANTOS.every(x => (x.l.match(/\[([^\]]+)\]/g) || []).every(c => /^\[[A-G][#b]?(m|7|m7|maj7|sus4|dim)?(\/[A-G][#b]?)?\]$/.test(c))), 'todos los acordes están bien escritos');
  ok(C.CANTOS.filter(x => /\[/.test(x.l)).every(x => x.ton), 'los cantos con acordes dicen su tono');
  await p.evaluate(() => window.DAILY.ir('rezar')); await p.waitForTimeout(500); ok(await p.$('.cov[data-a="cancionero"]'), 'portada del Cancionero en Rezar');
  await A('cancionero'); await A('cancCat', ''); ok((await p.$$('.cantos .row')).length === C.CANTOS.length, 'lista completa');
  await p.fill('#cancQ', 'estrella de paz'); await p.waitForTimeout(500); ok((await p.$$('.cantos .row')).length === 1, 'busca por la letra');
  await A('cantoAbrir', 'noche-de-paz'); ok(!(await p.$('.cletra .cs')) && /Noche de paz, noche de amor/.test(await SH()) && await p.$('.plusrow[data-a="plus"][data-p="cancionero"]'), 'sin Scaeli+: la letra completa y la invitación a los acordes');
  await A('cantoNuevo'); ok(await p.evaluate(() => window.DAILY.get().sheet.view === 'plus'), 'cargar cantos propios es de Scaeli+');
  await p.evaluate(() => localStorage.setItem('daily_plus_prueba', '1')); await A('cantoAbrir', 'noche-de-paz');
  const ac = () => p.evaluate(() => [...document.querySelectorAll('.cletra .cs i')].map(x => x.textContent).filter(Boolean).slice(0, 3).join(' '));
  ok(await ac() === 'Sol Re7 Sol', 'con Scaeli+: acordes sobre la letra en Do Re Mi: ' + await ac());
  await A('cantoTono', '1'); await A('cantoTono', '1'); ok(await ac() === 'La Mi7 La' && /La/.test(await p.evaluate(() => document.querySelector('.ctono b').textContent)), 'sube un tono: ' + await ac());
  await A('cantoPref', 'lat'); ok(await ac() === 'A E7 A', 'cifrado americano: ' + await ac()); await A('cantoPref', 'lat');
  await A('cantoPref', 'ac'); ok(!(await p.$('.cletra .cs')), 'se pueden ocultar los acordes'); await A('cantoPref', 'ac');
  await A('cantoNuevo'); await p.fill('form[data-f=canto] input[name=t]', 'Canto de prueba'); await p.fill('form[data-f=canto] textarea', '[Lam]Hola [sol7]mundo\n\n> [Fa#m]coro [Sib]dos'); await p.click('form[data-f=canto] button[type=submit]'); await p.waitForTimeout(600);
  const mio = await p.evaluate(() => JSON.parse(localStorage.getItem('daily_cantos_mios'))[0]);
  ok(mio && mio.l === '[Am]Hola [G7]mundo\n\n> [F#m]coro [Bb]dos' && await ac() === 'Lam Sol7 Fa#m', 'canto propio: guarda los acordes escritos en Do Re Mi: ' + JSON.stringify(mio && mio.l));
  await A('cancionero'); await A('cancCat', 'mios'); ok((await p.$$('.cantos .row')).length === 1, '«Mis cantos»');

  // 7 · biblioteca: documentos de la Iglesia y formación de cada día
  const LB = await import(path.join(__dirname, '..', 'data', 'libros.js'));
  ok(LB.DOCS.length >= 30 && LB.DOCS.every(x => x.length === 4 && /^https:\/\//.test(x[3])) && LB.DOCS.some(x => /Suma Teológica/.test(x[1])), 'documentos: ' + LB.DOCS.length + ' enlaces, con la Suma Teológica');
  ok(LB.LIBROS.every(x => fs.existsSync(path.join(__dirname, '..', 'libros', x.id + '.json'))), 'cada libro de la biblioteca tiene su archivo');
  for (const x of LB.LIBROS) { const j = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'libros', x.id + '.json'), 'utf8')); if (j.caps.length !== x.n || !j.caps.every(c => c.t && c.p.length)) fails.push('libro ' + x.id + ': capítulos ' + j.caps.length + ' ≠ ' + x.n); }
  await A('libros'); ok((await p.$$('.ltabs button')).length === 2 && (await p.$$('#sheetIn .libro[data-a="libAbrir"]')).length === LB.LIBROS.length, 'Biblioteca: pestaña «Libros» con ' + LB.LIBROS.length);
  await A('libTab', 'docs'); ok((await p.$$('#sheetIn a.libro.doc')).length === LB.DOCS.length && /Lumen gentium/.test(await SH()) && /vatican\.va/.test(await SH()), 'pestaña «Documentos de la Iglesia»');
  const CT = await import(path.join(__dirname, '..', 'data', 'catecismo.js'));
  ok(CT.CIC.length >= 80 && CT.CIC.every(x => /^[a-z0-9_-]+_sp\.html$/.test(x[0]) && x[1] && x[2] > 0 && x[3] >= x[2] && x[4] >= 0), 'catecismo: ' + CT.CIC.length + ' secciones con su título y sus números');
  ok(CT.CIC[0][2] <= 30 && CT.CIC[CT.CIC.length - 1][3] === 2865, 'del principio al número 2865');
  await A('catecismo', undefined, 600); let t = await SH();
  ok(await p.evaluate(() => window.DAILY.get().sheet.view === 'catecismo') && /Números \d+ a \d+/.test(t) && await p.$('#sheetIn a.catir[href^="https://www.vatican.va/archive/catechism_sp/"]'), 'formación de hoy: una sección del Catecismo con sus números y el enlace');
  const t1 = await p.evaluate(() => document.querySelector('#sheetIn .cath h3').textContent); await A('catOtra'); const t2 = await p.evaluate(() => document.querySelector('#sheetIn .cath h3').textContent);
  ok(t1 && t2 && t1 !== t2, '«otra» recomienda una sección distinta');
  await p.reload(); await p.waitForTimeout(2400); await A('catecismo', undefined, 600); ok(await p.evaluate(() => document.querySelector('#sheetIn .cath h3').textContent) === t1, 'la del día es la misma todo el día');
  await p.evaluate(() => localStorage.removeItem('daily_plus_prueba')); await A('cerrar'); await A('catecismo', undefined, 500); ok(await p.evaluate(() => window.DAILY.get().sheet.view === 'plus'), 'la formación de cada día es de Scaeli+');
  console.log(errs.join('\n')); console.log(fails.length ? 'FALLAS:\n' + fails.join('\n') : 'OK t40');
  await b.close(); process.exit(fails.length || errs.length ? 1 : 0); })();
