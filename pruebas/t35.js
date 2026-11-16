// t35 · Daily 2.2: más Scaeli+. Caminos largos de oración (Consagración a María, Ejercicios, retiro de 7 días, San Marcos),
// rezar con audio (música hecha con Web Audio y el Rosario guiado con voz), el diario completo y en PDF, y hasta 3 grupos.
// Sin Scaeli+: todo eso muestra el candado y lleva a la pantalla de Scaeli+; la oración diaria sigue gratis.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [], fails = []; const ok = (c, m) => { if (process.env.V) console.log((c ? "  ok " : "  XX ") + m); if (!c) fails.push(m); };
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.addInitScript(() => { window.__dicho = []; const fake = { speak(u) { window.__dicho.push(u.text); setTimeout(() => u.onend && u.onend(), 5); }, cancel() {}, getVoices() { return [{ lang: 'es-AR', name: 'x' }]; } };
    Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true }); window.SpeechSynthesisUtterance = function (t) { this.text = t; }; });
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);
  await p.click('#invitado'); await p.waitForTimeout(1000);
  const A = async (a, q, ms = 450) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const H = () => p.evaluate(() => document.querySelector('#sheetIn') ? document.querySelector('#sheetIn').innerText : '');
  const titulo = () => p.evaluate(() => { const h = document.querySelector('#sheetIn h3'); return h ? h.firstChild.firstChild.textContent : ''; });

  // los datos de los caminos
  const R = await p.evaluate(async () => { const m = await import('./data/retiros.js'); const bib = await fetch('biblia/indice.json').then(r => r.json());
    const abr = new Set((bib.libros || bib).map(x => x.a || x.abr || x[1]).filter(Boolean)); const out = {};
    for (const [k, R] of Object.entries(m.RETIROS)) out[k] = { n: R.dias.length, bien: R.dias.every(d => d.length === 5 && d.every(x => typeof x === 'string' && x.trim())), citas: R.dias.map(d => d[1]), etapas: R.etapas.every(e => e[0] < R.dias.length) };
    return { out, abr: [...abr] }; });
  ok(R.out.consagracion.n === 33 && R.out.ejercicios.n === 30 && R.out.retiro7.n === 7 && R.out.marcos.n === 16, 'los cuatro caminos con 33, 30, 7 y 16 días');
  ok(Object.values(R.out).every(x => x.bien && x.etapas), 'cada día con título, cita, reflexión, pregunta y gesto');
  ok(R.out.marcos.citas.every((c, i) => c.startsWith('Mc ' + (i + 1) + ',')), 'San Marcos: un capítulo por día, del 1 al 16');
  // todas las citas abren en la Biblia de la app
  const citasMal = await p.evaluate(async (L) => { const mal = []; for (const c of L) { window.DAILY.closeSheet(); await window.DAILY.ACC.camCita(c); await new Promise(r => setTimeout(r, 60)); if (!window.DAILY.get().sheet || window.DAILY.get().sheet.view !== 'biblia') mal.push(c); } window.DAILY.closeSheet(); return mal; }, Object.values(R.out).flatMap(x => x.citas));
  ok(!citasMal.length, 'todas las citas se abren en la Biblia: ' + citasMal.join(', '));

  // ── sin Scaeli+ ──
  await p.evaluate(() => window.DAILY.ir('rezar')); await p.waitForTimeout(400);
  const rez = await p.evaluate(() => document.querySelector('#app').innerText);
  ok(/Caminos de oración/.test(rez) && /Rezar con música/.test(rez), 'Rezar tiene «Caminos de oración» y «Rezar con música»');
  await A('retiros'); ok(/Consagración a María/.test(await H()) && (await p.$$('#sheetIn .retc')).length === 4, 'la lista de los 4 caminos se ve sin Scaeli+');
  ok((await p.$$('#sheetIn .retc .plus-mini')).length === 4, 'con candado de Scaeli+');
  await A('retiro', 'consagracion'); ok(await titulo() === 'Scaeli+', 'abrir un camino sin Scaeli+ lleva a Scaeli+');
  const pay = await H(); ok(/Caminos largos de oración/.test(pay) && /Rezar con audio/.test(pay) && /Grupos y diario sin límites/.test(pay), 'la pantalla de Scaeli+ cuenta lo nuevo');
  await A('musica'); ok(await titulo() === 'Scaeli+', 'la música sin Scaeli+ lleva a Scaeli+');
  await A('rosario'); ok(await p.$('#sheetIn .rvozrow .plus-mini'), 'el Rosario guiado con voz tiene candado'); await A('rosVoz'); ok(await titulo() === 'Scaeli+', 'la voz sin Scaeli+ lleva a Scaeli+');
  // el diario: gratis los últimos 30 días
  await p.evaluate(() => { const d = window.DAILY.get().days; const f = n => { const x = new Date(); x.setDate(x.getDate() - n); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
    d[f(3)] = { nota: 'Hoy Dios me habló en el silencio' }; d[f(12)] = { nota: 'Gracias por mi familia' }; d[f(45)] = { nota: 'Un día difícil, pero con paz' }; d[f(200)] = { nota: 'Empiezo este diario' }; window.DAILY.closeSheet(); });
  await p.evaluate(() => window.DAILY.ir('dia')); await p.waitForTimeout(300); ok(/Mi diario · 4/.test(await p.evaluate(() => document.querySelector('#app').innerText)), 'Tu día muestra «Mi diario · 4»');
  await A('diario'); let dia = await H();
  ok(/silencio/.test(dia) && /familia/.test(dia) && !/difícil/.test(dia) && !/Empiezo/.test(dia), 'gratis: solo los últimos 30 días');
  ok(/2 días más antiguos/.test(dia) && await p.$('#sheetIn .dlock .plus-mini'), 'gratis: los más antiguos con candado (no se borran)');
  await A('diarioPdf'); ok(await titulo() === 'Scaeli+', 'el PDF del diario sin Scaeli+ lleva a Scaeli+');
  await A('misOraciones'); ok(await titulo() === 'Mis oraciones', 'Mis oraciones sigue gratis');
  // grupos: gratis, uno
  await A('gEjemplo', null, 700); ok(/Los de la parroquia/.test(await H()), 'grupo de ejemplo');
  const g2 = await p.evaluate(() => window.DAILY.grupoBE().crear('Confirmación', { n: 'Ana' }));
  await A('gUnirme', g2, 700); ok(await titulo() === 'Scaeli+', 'gratis: sumarse a un 2.º grupo lleva a Scaeli+');

  // ── con Scaeli+ ──
  await p.evaluate(() => localStorage.setItem('daily_plus_prueba', '1')); await p.reload(); await p.waitForTimeout(1200);
  if (await p.$('#invitado')) { await p.click('#invitado'); await p.waitForTimeout(1000); }
  await A('retiros'); ok(!(await p.$('#sheetIn .retc .plus-mini')), 'con Scaeli+ no hay candados');
  await A('retiro', 'retiro7'); ok(await titulo() === 'Retiro de 7 días', 'abre el retiro de 7 días');
  ok(/Empezar hoy/.test(await H()) && (await p.$$('#sheetIn .retd .ck.lk')).length === 7, 'antes de empezar, los 7 días cerrados');
  await A('retEmpezar', 'retiro7'); let t = await H();
  ok(/Frenar/.test(t) && /Para rezar/i.test(t) && /Gesto/i.test(t) && /Recé el día 1/i.test(t), 'día 1 abierto con reflexión, pregunta y gesto');
  ok((await p.$$('#sheetIn .retd .ck.lk')).length === 6, 'los otros 6 cerrados');
  await A('retOk', 'retiro7|0'); t = await H(); ok(/1 de 7 días/.test(t) && /se abre mañana/.test(t), 'marcar el día 1: el 2 se abre mañana');
  await A('retOk', 'retiro7|0'); // desmarca
  ok(/Recé el día 1/.test(await H()), 'desmarcar el día 1 lo vuelve a abrir');
  await A('retOk', 'retiro7|0');
  await A('cerrar'); await p.evaluate(() => window.DAILY.ir('hoy')); await p.waitForTimeout(400);
  ok(/Retiro de 7 días · día 2 de 7/i.test(await p.evaluate(() => document.querySelector('#app').innerText)), 'Hoy muestra el camino en curso');
  // la música
  await A('musica'); ok(await titulo() === 'Rezar con música' && (await p.$$('#sheetIn .musc')).length === 3, 'la música: órgano, noche y campana');
  await A('musSel', 'noche'); await A('musMin', '5'); await A('musPlay', null, 800);
  ok(await p.evaluate(() => document.querySelector('#musChip') && document.querySelector('#musChip').hidden), 'en la pantalla de la música, el botoncito no tapa nada');
  await A('cerrar'); ok(await p.$('#musChip') && /Noche · [45]:\d\d/.test(await p.evaluate(() => document.querySelector('#musChip').innerText)), 'suena la noche con el botoncito y la cuenta regresiva');
  const ctxOk = await p.evaluate(() => !!(window.AudioContext || window.webkitAudioContext)); ok(ctxOk, 'Web Audio disponible');
  await A('retiros'); ok(await p.evaluate(() => !document.querySelector('#musChip').hidden), 'la música sigue en otras pantallas'); await A('cerrar');
  await A('musStop', null, 300); ok(!(await p.$('#musChip')), 'parar la música saca el botoncito');
  // el Rosario guiado con voz
  await A('rosario'); await A('rosVoz'); ok(await p.$('#sheetIn .rvozrow .ck.on'), 'voz activada en el Rosario');
  await A('rosEmpezar', 'gozosos', 2600);
  const dicho = await p.evaluate(() => window.__dicho.slice());
  ok(dicho.some(x => /Creo en Dios/.test(x)), 'la voz reza el Credo');
  ok(dicho.some(x => /Primer misterio gozoso/.test(x) || /Yo confieso|Confieso/.test(x)), 'y sigue sola con lo que viene');
  const fase = await p.evaluate(() => window.DAILY.get().rosario && window.DAILY.get().rosario.fase); ok(fase && fase !== 'credo', 'el Rosario avanza solo con la voz (va por ' + fase + ')');
  await A('rosVoz'); const n1 = await p.evaluate(() => window.__dicho.length); await p.waitForTimeout(1500); const fase2 = await p.evaluate(() => window.DAILY.get().rosario.fase);
  await p.waitForTimeout(1200); ok(await p.evaluate(() => window.DAILY.get().rosario.fase) === fase2, 'sin voz deja de avanzar solo');
  await p.evaluate(() => { window.DAILY.ACC.rosSalir(); }); await p.waitForTimeout(400); const dlg = await p.$('.dlg [data-r="1"]'); if (dlg) { await dlg.click(); await p.waitForTimeout(300); }
  // el diario completo
  await p.evaluate(() => { const d = window.DAILY.get().days; const f = n => { const x = new Date(); x.setDate(x.getDate() - n); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); }; d[f(3)] = { nota: 'Hoy Dios me habló en el silencio' }; d[f(45)] = { nota: 'Un día difícil, pero con paz' }; d[f(200)] = { nota: 'Empiezo este diario' }; });
  await A('diario'); dia = await H(); ok(/difícil/.test(dia) && /Empiezo/.test(dia) && !(await p.$('#sheetIn .dlock')), 'con Scaeli+ se ve todo el diario');
  ok(await p.$('#diaQ'), 'con buscador');
  const doc = await p.evaluate(() => new Promise(res => { const o = window.print; let html = ''; const obs = new MutationObserver(() => { const f = document.querySelector('iframe[aria-hidden]'); if (f) { setTimeout(() => { html = f.contentDocument.body.innerText; obs.disconnect(); res(html); }, 400); } }); obs.observe(document.body, { childList: true }); window.DAILY.ACC.diarioPdf(); setTimeout(() => res(html), 2500); }));
  ok(/Mi diario/.test(doc) && /Empiezo este diario/.test(doc) && /Tu fe, a otro nivel/.test(doc), 'el PDF del diario arma la página para imprimir');
  // grupos: hasta 3
  await A('grupo'); await A('gUnirme', g2, 800); t = await H(); ok(/Confirmación/.test(t) && (await p.$$('#sheetIn .gsw button')).length === 2, 'con Scaeli+: entrar a un 2.º grupo, con el selector');
  const set = await p.evaluate(() => JSON.parse(JSON.stringify(window.DAILY.get().grupo.gid)));
  ok(set === g2, 'el grupo nuevo es el que ves');
  const g3 = await p.evaluate(() => window.DAILY.grupoBE().crear('Familia', { n: 'Papá' }));
  await A('gUnirme', g3, 800); ok((await p.$$('#sheetIn .gsw button')).length === 3, 'un 3.er grupo');
  const g4 = await p.evaluate(() => window.DAILY.grupoBE().crear('Otro más', { n: 'X' }));
  await A('gUnirme', g4, 800); ok((await p.$$('#sheetIn .gsw button')).length === 3 && await p.evaluate(() => window.DAILY.get().grupo.gid) === g3, 'el tope es 3 grupos');
  const primero = await p.evaluate(() => [...document.querySelectorAll('#sheetIn .gsw button')].map(b => b.dataset.p).find(g => g !== window.DAILY.get().grupo.gid));
  await A('gCambiar', primero, 700); ok(await p.evaluate(() => window.DAILY.get().grupo.gid) === primero && (await p.$$('#sheetIn .gsw button')).length === 3, 'cambiar de grupo con el selector');
  // la ficha se publica en todos los grupos
  await p.waitForTimeout(1500);
  const enTodos = await p.evaluate(([a, b2, c]) => { const st = JSON.parse(localStorage.getItem('scaeli-daily-grupos') || '{}'); return [a, b2, c].map(g => !!(st[g] && st[g].m && st[g].m.local)); }, [g2, g3, primero]);
  ok(enTodos.every(Boolean), 'estás como miembro en los 3 grupos: ' + enTodos);
  await p.evaluate(() => { window.DAILY.ACC.gSalir(); }); await p.waitForTimeout(400); const c1 = await p.$('.dlg [data-r="1"]'); if (c1) await c1.click(); await p.waitForTimeout(900);
  ok((await p.$$('#sheetIn .gsw button')).length === 2 && await p.evaluate(() => !!window.DAILY.get().grupo.gid), 'salir de uno: pasás al siguiente y quedan 2');
  await p.screenshot({ path: 't35.png' });

  console.log(errs.join('\n')); console.log(fails.length ? 'FALLAS:\n' + fails.join('\n') : 'OK t35');
  await b.close(); process.exit(fails.length || errs.length ? 1 : 0); })();
