// t33 · Daily 2.1: textos con derechos cuidados (Biblia Platense, traducciones propias), créditos, caminos nuevos, bloquear en el grupo, sin Google Fonts
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [], fails = []; const ok = (c, m) => { if (!c) fails.push('FALLA ' + m); };
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); const afuera = [];
  p.on('request', r => { const u = r.url(); if (!/^http:\/\/localhost:8765/.test(u) && !/^data:/.test(u)) afuera.push(u); });
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.clock.setFixedTime(new Date('2026-11-15T10:00:00-03:00'));
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1200); await p.click('#invitado'); await p.waitForTimeout(1500);
  const A = async (a, q, ms = 500) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const SH = () => p.evaluate(() => document.querySelector('#sheet').textContent);
  ok(!afuera.some(u => /fonts\.(googleapis|gstatic)/.test(u)), 'sin Google Fonts: ' + afuera.join(' '));
  ok(await p.evaluate(() => document.fonts.check('16px Inter')), 'Inter cargada desde la app');
  // Evangelio del día con la Biblia Platense
  await A('evangelio', null, 900); let t = await SH(); ok(/Mt 25/.test(t) && /Biblia Platense/.test(t) && /talentos/.test(t), 'Evangelio con texto Platense'); ok(!/Libro del Pueblo/i.test(t), 'nada del Libro del Pueblo de Dios'); await A('cerrar');
  await A('misa', null, 900); t = await SH(); ok(/Las lecturas completas/i.test(t) && /Biblia Platense/.test(t) && /1 Tes 5,1-6/.test(t), 'Misa: lecturas con la Platense'); await A('cerrar');
  // pie de Rezar
  await p.evaluate(() => window.DAILY.ir('rezar')); await p.waitForTimeout(500); t = await p.evaluate(() => document.querySelector('#app').innerText); ok(/Venid a Mí todos los agobiados/.test(t), 'pie de Rezar con la Platense');
  // oraciones: cánticos de la Platense y traducciones propias
  const ora = await p.evaluate(async () => { const m = await import('/data/oraciones_mas.js'); const g = id => m.ORACIONES_MAS.find(x => x.id === id).es.join(' '); return [g('magnificat'), g('te_deum'), g('veni_creator')]; });
  ok(/Glorifica mi alma al Señor/.test(ora[0]) && /Biblia Platense/.test(ora[0]), 'Magníficat de la Platense'); ok(/Te alabamos, oh Dios; te confesamos Señor/.test(ora[1]) && /Traducción del latín de Scaeli/.test(ora[1]), 'Te Deum propio'); ok(/ven a las almas de los tuyos/.test(ora[2]), 'Veni Creator propio');
  // Rosario: meditación de la Platense
  const med = await p.evaluate(async () => (await import('/data/citas.js')).ROS_MED.gozosos[0][0]); ok(/Salve, llena de gracia/.test(med), 'meditación de la Platense');
  // examen propio
  const ex = await p.evaluate(async () => { const m = await import('/data/examen.js'); return [m.CAPITALES[0].d, m.VIDA[4].n, m.CONF_CIERRE.cita]; }); ok(/Ponerme por encima/.test(ex[0]) && ex[1] === 'Lo que digo y comparto' && /Evangelii gaudium/.test(ex[2]), 'examen con texto propio');
  // Horas: solo enlace, sin copias
  await A('horaLH', 'laudes', 700); t = await SH(); ok(/Abrir Laudes/.test(t), 'Horas como enlace'); ok((await p.evaluate(async () => (await fetch('/horas/indice.json')).status)) === 404, 'no quedan copias de las Horas'); await A('cerrar');
  // créditos y licencias
  await p.evaluate(() => window.DAILY.ir('mas')); await p.waitForTimeout(400); ok(/Créditos y licencias/.test(await p.evaluate(() => document.querySelector('#app').innerText)), 'fila de créditos en Más');
  await A('creditos', null, 500); t = await SH(); ok(/Biblia Platense/.test(t) && /SIL Open Font License/.test(t) && /Texto propio de Scaeli/.test(t) && /PixelLab/.test(t), 'pantalla de créditos'); await A('cerrar');
  ok((await p.evaluate(async () => (await fetch('/assets/fuentes/licencias/OFL-Inter.txt')).status)) === 200, 'licencia OFL publicada');
  // caminos nuevos
  const cam = await p.evaluate(async () => { const m = await import('/data/plus.js'); return Object.fromEntries(Object.entries(m.CAMINOS).map(([k, C]) => [k, [C.dias.length, C.semanas.length]])); });
  ok(cam.navidad && cam.navidad[0] === 17 && cam.cuaresma[0] === 46 && cam.pascua[0] === 50, 'caminos de Navidad, Cuaresma y Pascua: ' + JSON.stringify(cam));
  // grupo de ejemplo: bloquear y desbloquear
  await A('grupo', null, 600); await A('gEjemplo', null, 1400); t = await SH(); const otro = await p.evaluate(() => { const b = document.querySelector('[data-a="gBloquear"]'); return b && b.dataset.p; }); ok(!!otro, 'botón Bloquear junto a cada miembro');
  const nom = await p.evaluate(u => { const r = [...document.querySelectorAll('.grow')].find(x => x.querySelector('[data-a="gBloquear"][data-p="' + u + '"]')); return r ? r.querySelector('.n b').innerText : ''; }, otro);
  p.evaluate(u => window.DAILY.ACC.gBloquear(u), otro); await p.waitForTimeout(400); await p.click('.dlg button.primary'); await p.waitForTimeout(900);
  t = await SH(); ok(/Bloqueado: no ves nada suyo/.test(t), 'queda bloqueado'); const st = await p.evaluate(() => JSON.parse(localStorage.getItem('scaeli-daily-local'))['daily_settings/profile'].bloq); ok(st && st[otro], 'bloqueo guardado en el perfil');
  ok(!(await p.evaluate(n => [...document.querySelectorAll('.gact .ac b')].some(b => b.innerText === n), nom)), 'su actividad no se ve');
  await A('gDesbloquear', otro, 900); t = await SH(); ok(!/Bloqueado: no ves nada suyo/.test(t), 'se desbloquea'); await A('cerrar');
  console.log('T33', errs.concat(fails).join('\n') || 'OK'); await b.close(); })();
