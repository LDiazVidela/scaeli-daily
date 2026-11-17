// t39 · Daily 2.3.1: oraciones en orden alfabético (español y latín) y favoritas fijadas arriba (se guardan); el «+» de los hábitos.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [], fails = []; const ok = (c, m) => { if (process.env.V) console.log((c ? '  ok ' : '  XX ') + m); if (!c) fails.push(m); };
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900); await p.click('#invitado'); await p.waitForTimeout(2000);
  const A = async (a, q, ms = 450) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const clic = async (lista, cual, sel) => { await p.evaluate(([lista, cual, sel]) => { const Ls = [...document.querySelectorAll('#sheetIn .list')]; const l = lista === 'ult' ? Ls[Ls.length - 1] : Ls[0]; const r = [...l.querySelectorAll('.orow')]; (cual === 'ult' ? r[r.length - 1] : r[0]).querySelector(sel).click(); }, [lista, cual, sel]); await p.waitForTimeout(500); };
  const nombres = () => p.evaluate(() => [...document.querySelectorAll('#sheetIn .orow .food b')].map(x => x.textContent));
  const orden = L => { const s = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); return L.every((x, i) => i === 0 || s(L[i - 1]).localeCompare(s(x), 'es') <= 0); };
  await A('oraciones'); let L = await nombres();
  ok(L.length > 10 && orden(L), 'en orden alfabético: ' + L.slice(0, 4).join(', ') + '…');
  ok(!(await p.$('#sheetIn .eyebrow')) || !/Favoritas/.test(await p.textContent('#sheetIn')), 'sin favoritas no hay sección Favoritas');
  // fijar dos favoritas: van arriba, en Favoritas
  const ult = L[L.length - 1];
  await clic('ult', 'ult', '.ofav');
  let t = await p.textContent('#sheetIn'); L = await nombres();
  ok(/Favoritas/.test(t) && L[0] === ult, 'la favorita queda fijada arriba: ' + L[0]);
  await clic('ult', 'pri', '.ofav');
  const F = await p.evaluate(() => [...document.querySelectorAll('#sheetIn .list')[0].querySelectorAll('.orow .food b')].map(x => x.textContent));
  ok(F.length === 2 && orden(F), 'dos favoritas, también en orden: ' + F.join(', '));
  ok(await p.evaluate(() => (JSON.parse(localStorage.getItem('scaeli-daily-local'))['daily_settings/profile'] || {}).oraFav.length === 2), 'las favoritas se guardan');
  await A('cerrar'); await A('oraciones'); ok((await nombres())[0] === F[0], 'al volver a entrar siguen arriba');
  // latín: orden por el nombre que se ve
  await A('oraLat', '1'); L = await p.evaluate(() => [...[...document.querySelectorAll('#sheetIn .list')].pop().querySelectorAll('.orow .food b')].map(x => x.textContent));
  ok(orden(L), 'en latín también en orden alfabético');
  // quitar
  await clic('pri', 'pri', '.ofav');
  ok(await p.evaluate(() => (JSON.parse(localStorage.getItem('scaeli-daily-local'))['daily_settings/profile'] || {}).oraFav.length === 1), 'se puede quitar una favorita');
  // abrir una oración desde la lista sigue andando
  await clic('ult', 'pri', '.food');
  ok(await p.evaluate(() => window.DAILY.get().sheet.view === 'oracion' && document.querySelector('#sheetIn .pray')), 'tocar el nombre abre la oración');
  console.log(errs.join('\n')); console.log(fails.length ? 'FALLAS:\n' + fails.join('\n') : 'OK t39');
  await b.close(); process.exit(fails.length || errs.length ? 1 : 0); })();
