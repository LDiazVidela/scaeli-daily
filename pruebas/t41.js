// t41 · Daily 2.5 (actualización de grupos): el muro como chat con recordatorios, las intenciones en su pestaña,
// encuentros con «Voy», cantos del grupo y los cantos nuevos del cancionero.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => { const errs = [], fails = []; const ok = (c, m) => { if (process.env.V) console.log((c ? '  ok ' : '  XX ') + m); if (!c) fails.push(m); };
  const C = await import(path.join(__dirname, '..', 'data', 'cancionero.js'));
  ok(C.CANTOS.length >= 45 && new Set(C.CANTOS.map(x => x.id)).size === C.CANTOS.length, 'cancionero: ' + C.CANTOS.length + ' cantos');
  const reglas = fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8');
  ok(/tx\.size\(\) <= 140/.test(reglas) && /hasOnly\(\['a', 'rep'\]\)/.test(reglas), 'las reglas de mensajes siguen igual (tx hasta 140; solo se tocan a y rep)');

  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);
  await p.click('#invitado'); await p.waitForTimeout(2200);
  const A = async (a, q, ms = 450) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const SH = () => p.evaluate(() => (document.querySelector('#sheetIn') || {}).innerText || '');
  const G = () => p.evaluate(() => Object.values(JSON.parse(localStorage.getItem('scaeli-daily-grupos')))[0]);
  await A('grupo'); await A('gEjemplo', null, 1300);

  // 1 · pestañas
  ok(await p.evaluate(() => [...document.querySelectorAll('.gtabs button')].map(x => x.textContent.trim()).join('|')) === 'Hoy|Chat|Intenciones|Grupo', 'pestañas: Hoy, Chat, Intenciones y Grupo');
  let t = await SH(); ok(/Próximo encuentro/i.test(t) && /Misa y merienda/.test(t), '«Hoy» muestra el próximo encuentro');

  // 2 · chat
  await A('gTab', 'muro');
  const orden = await p.evaluate(() => [...document.querySelectorAll('.chat .bub')].map(x => x.dataset.p));
  ok(orden.join(',') === 'e3,e2,e1', 'chat: lo más viejo arriba, lo nuevo abajo, sin encuentros ni cantos: ' + orden.join(','));
  ok((await p.$$('.chat .cdia')).length >= 2, 'separadores por día');
  ok(await p.evaluate(() => { const c = document.querySelector('.chat .cpie'); return getComputedStyle(c).position === 'sticky'; }), 'la caja de escribir queda fija abajo');
  const largo = 'Hola grupo, ¿quién lleva la guitarra el sábado? ' + 'Yo llevo el cancionero y algo para la merienda. '.repeat(5);
  await p.fill('form[data-f=muro] input', largo); await p.press('form[data-f=muro] input', 'Enter'); await p.waitForTimeout(700);
  let g = await G(), mio = g.muro.find(m => /guitarra/.test(m.tx));
  ok(mio && mio.tx.length === 140 && mio.tl === largo.trim() && !mio.k, 'mensaje largo: tx con 140 letras y el texto entero aparte (' + (mio && mio.tl.length) + ')');
  ok(await p.evaluate(() => { const l = [...document.querySelectorAll('.chat .bub')].pop(); return l.classList.contains('mio') && /merienda\.$/.test(l.querySelector('.bp').textContent.trim()); }), 'lo mío queda abajo, a la derecha y entero');
  ok(await p.evaluate(() => { const s = document.querySelector('#sheet .scroll'); return s.scrollTop + s.clientHeight >= s.scrollHeight - 4; }), 'el chat baja solo al último mensaje');
  ok(await p.evaluate(() => document.activeElement && document.activeElement.name === 'm'), 'el teclado queda listo para seguir escribiendo');
  ok(!(await p.$('.chat .bub .mf')), 'los botones del mensaje no se ven hasta tocarlo'); await p.click('.chat .bub[data-p="e2"] .bp'); await p.waitForTimeout(400);
  ok(await p.$('.chat .bub[data-p="e2"] .mf [data-a="mAmen"]') && await p.$('.chat .bub[data-p="e2"] .mf [data-a="mBorrar"]'), 'tocar un mensaje muestra Amén y Borrar');
  await p.click('.chat .bub[data-p="e2"] .mf [data-a="mAmen"]'); await p.waitForTimeout(400); ok(/Amén 3/.test(await p.evaluate(() => document.querySelector('.chat .bub[data-p="e2"] .bt').textContent)), 'Amén desde el mensaje');
  await p.waitForTimeout(2100); await A('mRec'); ok(await p.$('.chat .crec .mrec button') && await p.evaluate(() => document.querySelector('form[data-f=muro] input').placeholder === 'Tu recordatorio…'), 'la campana abre los recordatorios');
  await p.fill('form[data-f=muro] input', 'Mañana ensayo de coro a las 18'); await p.press('form[data-f=muro] input', 'Enter'); await p.waitForTimeout(600);
  g = await G(); ok(g.muro.some(m => m.tx === 'Mañana ensayo de coro a las 18' && m.tipo === 'rec') && !(await p.$('.chat .crec')), 'recordatorio propio, escrito a mano');

  // 3 · intenciones
  await A('gTab', 'miembros'); t = await SH();
  ok(/Tu intención de la semana/i.test(t) && /Intenciones del grupo/i.test(t) && (await p.$$('.gpan[data-gp="miembros"] .gmiem .grow')).length === 5, 'las intenciones, en su pestaña');
  ok(!(await p.$('.gpan[data-gp="miembros"] [data-a="gInvitar"]')) && await p.$('.gpan[data-gp="ranking"] [data-a="gInvitar"]'), 'invitar y salir pasaron a «Grupo»');

  // 4 · encuentros
  await A('gTab', 'ranking'); t = await SH(); ok(/Encuentros/i.test(t) && /Cantos del grupo/.test(t) && /Constancia de los grupos/i.test(t), '«Grupo»: encuentros, cantos y constancia de los grupos');
  await A('encNuevo'); ok(await p.evaluate(() => window.DAILY.get().sheet.view === 'encuentro'), 'formulario de encuentro');
  const manana = await p.evaluate(() => { const d = new Date(Date.now() + 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); });
  await p.fill('input[name=ti]', 'Adoración y guitarreada'); await p.fill('input[name=f]', manana); await p.fill('input[name=h]', '20:30'); await p.fill('input[name=lu]', 'Capilla del colegio');
  await p.click('form[data-f=encuentro] button[type=submit]'); await p.waitForTimeout(900);
  g = await G(); const enc = g.muro.find(m => m.k === 'enc' && m.ti === 'Adoración y guitarreada');
  ok(enc && enc.f === manana && enc.h === '20:30' && enc.lu === 'Capilla del colegio' && enc.tx.length <= 140 && /^Encuentro: Adoración/.test(enc.tx) && Object.keys(enc.a || {}).length === 1, 'encuentro guardado y quien lo propone ya figura: ' + (enc && enc.tx));
  ok(g.muro.some(m => !m.k && m.tipo === 'rec' && /^Encuentro: Adoración/.test(m.tx)), 'aviso del encuentro en el chat');
  ok(await p.evaluate(() => { const s = window.DAILY.get().sheet; return s.view === 'grupo' && s.gt === 'ranking'; }), 'vuelve a «Grupo»');
  const encs = await p.evaluate(() => [...document.querySelectorAll('.gpan[data-gp="ranking"] .enc .et b')].map(x => x.textContent)); ok(encs.join('|') === 'Adoración y guitarreada|Misa y merienda', 'ordenados por fecha: ' + encs.join('|'));
  t = await SH(); ok(/Mañana, 20:30 h · Capilla del colegio/.test(t) && /Vas vos/.test(t), 'día, hora, lugar y quién va');
  const viejo = (await G()).muro.find(m => m.id === 'e4'); await A('encVoy', 'e4', 500); g = await G();
  ok(Object.keys(g.muro.find(m => m.id === 'e4').a).length === Object.keys(viejo.a).length + 1 && await p.evaluate(() => document.querySelector('[data-a="encVoy"][data-p="e4"]').getAttribute('aria-pressed') === 'true'), '«Voy» me anota');
  await A('encVoy', 'e4', 500); ok(Object.keys((await G()).muro.find(m => m.id === 'e4').a).length === Object.keys(viejo.a).length, 'y me saca');
  await p.evaluate(() => { const K = 'scaeli-daily-grupos', st = JSON.parse(localStorage.getItem(K)), g = Object.values(st)[0]; g.muro.push({ id: 'p1', k: 'enc', u: 'ej1', n: 'Clari', tx: 'Encuentro: viejo', ti: 'Encuentro viejo', f: '2020-01-01', t: 1 }); localStorage.setItem(K, JSON.stringify(st)); });
  await p.reload(); await p.waitForTimeout(1800); await A('grupo', null, 700); await A('gTab', 'ranking'); ok(!/Encuentro viejo/.test(await SH()), 'los encuentros pasados no se muestran');
  await p.evaluate(() => window.DAILY.ACC.cerrar()); await p.waitForTimeout(400); ok(/Próximo encuentro:\s*Adoración y guitarreada/.test(await p.evaluate(() => document.querySelector('.grupoc').innerText)), 'el próximo encuentro también en Hoy');

  // 5 · cantos del grupo
  await A('grupo', null, 600); await A('gTab', 'ranking'); await p.click('[data-a="gCantos"]'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => { const s = window.DAILY.get().sheet; return s.view === 'cancionero' && s.cat === 'grupo'; }) && (await p.$$('.cantos .row')).length === 1 && /lo compartió Clari/.test(await SH()), 'cancionero del grupo con el canto compartido');
  const gid = await p.evaluate(() => document.querySelector('.cantos .row').dataset.p); await A('cantoAbrir', gid);
  ok(/Venimos a tu casa, Señor/.test(await SH()) && !(await p.$('.cletra .cs')) && await p.$('.plusrow[data-a="plus"]'), 'sin Scaeli+: la letra del canto del grupo; los acordes, con Scaeli+');
  await p.evaluate(() => localStorage.setItem('daily_plus_prueba', '1')); await A('cantoAbrir', gid); ok((await p.$$('.cletra .cs i')).length > 3 && await p.$('[data-a="cantoQuitar"]'), 'con Scaeli+: acordes; quien creó el grupo puede quitarlo');
  await A('cantoNuevo'); await p.fill('form[data-f=canto] input[name=t]', 'Canto del coro'); await p.fill('form[data-f=canto] textarea', '[Do]Señor, te [Sol]cantamos\n[Lam]con todo el [Fa]corazón'); await p.click('form[data-f=canto] button[type=submit]'); await p.waitForTimeout(600);
  ok(await p.$('[data-a="cantoCompartir"]:not([disabled])') && /Compartir con «Los de la parroquia»/.test(await SH()), 'un canto propio se puede compartir con el grupo');
  await p.click('[data-a="cantoCompartir"]'); await p.waitForTimeout(700); g = await G(); const cg = g.muro.find(m => m.k === 'canto' && m.ti === 'Canto del coro');
  ok(cg && cg.l === '[C]Señor, te [G]cantamos\n[Am]con todo el [F]corazón' && cg.tx === 'Canto: Canto del coro', 'compartido: queda en el grupo con su letra y acordes');
  ok(await p.$('[data-a="cantoCompartir"][disabled]'), 'no se comparte dos veces');
  await A('cancionero'); await A('cancCat', 'grupo'); ok((await p.$$('.cantos .row')).length === 2, 'el grupo ahora tiene dos cantos');
  await A('cerrar'); await A('grupo', null, 600); await A('gTab', 'muro'); ok(!/Canto del coro/.test(await p.evaluate(() => document.querySelector('.chat').innerText)), 'los cantos no ensucian el chat');
  await A('gTab', 'ranking'); ok(/2 cantos compartidos/.test(await SH()), 'la pestaña Grupo cuenta los cantos');
  console.log(errs.join('\n')); console.log(fails.length ? 'FALLAS:\n' + fails.join('\n') : 'OK t41');
  await b.close(); process.exit(fails.length || errs.length ? 1 : 0); })();
