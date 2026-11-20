// t46 · Daily 2.10: modo sobrio para adultos (sin personaje ni juego), la pantalla «¿Cómo querés usar Scaeli?» una sola vez,
// consagrados solo para quien lo marca, ranking de grupos opcional («Constancia de los grupos»), «Glorioso» y los textos nuevos.
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const errs = [], fails = []; const ok = (c, m) => { if (process.env.V) console.log((c ? '  ok ' : '  XX ') + m); if (!c) fails.push('FALLA ' + m); };
  // textos (Magisterium): Encarnación y cierre del examen
  const RT = await import(path.join(__dirname, '..', 'data', 'retiros.js')), EX = await import(path.join(__dirname, '..', 'data', 'examen.js'));
  const rt = JSON.stringify(RT.RETIROS);
  ok(/la Trinidad entera quiere y obra la Encarnación, y solo el Hijo se hace hombre para salvarlo/.test(rt) && !/las tres Personas deciden que el Hijo/.test(rt), 'Ejercicios: la Trinidad entera quiere y obra la Encarnación');
  ok(/con su especie y número \(qué fue y cuántas veces\), hasta donde te acuerdes después de examinarte bien; los veniales no es obligatorio confesarlos, pero es muy recomendable/.test(EX.CONF_CIERRE.nota), 'cierre del examen: especie y número, veniales recomendados');
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.clock.setFixedTime(new Date('2026-11-20T10:00:00-03:00'));
  const A = async (a, q, ms = 450) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const SH = () => p.evaluate(() => document.querySelector('#sheet').textContent);   // textContent: los títulos van en mayúsculas por CSS
  const APP = () => p.evaluate(() => document.querySelector('#app').textContent);
  const PR = () => p.evaluate(() => (JSON.parse(localStorage.getItem('scaeli-daily-local') || '{}')['daily_settings/profile']) || {});
  const ir = async v => { await p.evaluate(v => window.DAILY.ir(v), v); await p.waitForTimeout(450); };

  // 1) «¿Cómo querés usar Scaeli?»: se ofrece una vez al entrar, no bloquea
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('daily_prueba_modo', '1'); }); await p.reload(); await p.waitForTimeout(900); await p.click('#invitado'); await p.waitForTimeout(3300);
  let st = await p.evaluate(() => window.DAILY.get().sheet); let t = await SH();
  ok(st && st.view === 'modo' && /¿Cómo querés usar Scaeli\?/.test(t) && /Con personaje/.test(t) && /Sobrio/.test(t) && /Ahora no/.test(t), 'al entrar se ofrece elegir con personaje o sobrio');
  await A('cerrar'); ok(!(await p.evaluate(() => window.DAILY.get().sheet)) && (await PR()).sobrio === undefined, '«Ahora no» cierra sin elegir');
  await p.reload(); await p.waitForTimeout(3300); ok(!(await p.evaluate(() => window.DAILY.get().sheet)), 'se ofrece una sola vez');
  ok(await p.$('#app .hero2 .pjbtn') && await p.$('#app .nivel') && await p.$('#app .vch'), 'por defecto, con personaje, nivel y racha');
  await A('modoVer'); await p.click('#sheet [data-a="modoElegir"][data-p="sobrio"]'); await p.waitForTimeout(700);
  ok((await PR()).sobrio === true && await p.evaluate(() => document.body.classList.contains('sobrio')) && !(await p.evaluate(() => window.DAILY.get().sheet)), 'elegir «Sobrio» lo guarda en la cuenta');

  // 2) modo sobrio: Hoy sin personaje, fondos, nivel, racha ni álbum; la oración igual
  await ir('hoy'); t = await APP();
  ok(!(await p.$('#app .pjbtn')) && !(await p.$('#app .pjedit')) && await p.$('#app .hero2.sob') && !(await p.$('#app .nivel')) && !(await p.$('#app .vela')) && !(await p.$('#app .vch')), 'Hoy: sin personaje, nivel ni velas');
  const covs = await p.$$eval('#app .cov', L => L.map(x => x.dataset.a));
  ok(['evangelio', 'rosario', 'examen'].every(k => covs.includes(k)) && await p.$('#app .lhnow') && /Tus hábitos esta semana/.test(t) && /Tu semana con Dios/.test(t), 'Hoy: Evangelio, Rosario, Examen, Horas y hábitos siguen');
  ok(/Anotalo cada vez que lo hacés/.test(t) && !/experiencia/.test(t), 'hábitos sin experiencia ni ánimo');
  await ir('rezar'); ok(!(await p.$('#app .vch')) && (await p.$$('#app .cov')).length > 10, 'Rezar: igual, sin racha');
  await ir('dia'); ok(!(await p.$('#app .vela')) && !(await p.$('#app .hmejor')), 'Día: sin velas');
  await ir('yo'); t = await APP();
  ok(!(await p.$('#pjsec')) && !(await p.$('#app canvas.pj')) && !(await p.$('#app .rangoc')) && !(await p.$('#app .logros')) && !(await p.$('#app .premc')) && !(await p.$('#app .fondos')) && !/Tu nivel|Tus logros|Se gana jugando/.test(t), 'Yo: sin personaje, nivel, logros, rango, álbum ni premios');
  ok(/^\s*Vos/.test(t) && /Intenciones/.test(t) && /Tu camino/.test(t) && /Días con Dios/.test(t) && await p.$('#app [data-a="irMas"]') && await p.$('#app input[data-nombre]'), 'Yo se llama «Vos»: nombre, intenciones, Tu camino y Ajustes');
  ok(await p.evaluate(() => document.querySelector('.nav button[data-view="yo"] span').textContent === 'Vos'), 'la barra dice «Vos»');
  await ir('mas'); ok(await p.$('#app [data-a="sobrioSet"][aria-checked="true"]') && !(await p.$('#app [data-a="rankOff"]')) && !(await p.$('#app .juegop')), 'Ajustes: modo sobrio prendido (sin el interruptor del ranking ni el juego)');

  // 3) el grupo en sobrio: intenciones, chat, encuentros y cantos; círculo con la inicial
  await A('grupo'); await A('gEjemplo', null, 1500); t = await SH();
  const tabs = await p.$$eval('#sheet .gtabs button', L => L.map(x => x.dataset.p));
  ok(tabs.join() === 'muro,miembros,ranking' && await p.evaluate(() => window.DAILY.get().sheet.gt === undefined) && !(await p.$('#sheet .gpan[data-gp="hoy"]')), 'grupo: Chat, Intenciones y Grupo (sin Hoy de desafío y misiones)');
  ok(!(await p.$('#sheet canvas.pj')) && (await p.$$('#sheet .gmiem .ini')).length === 5 && await p.evaluate(() => [...document.querySelectorAll('#sheet .gmiem .ini')].map(x => x.textContent).includes('J')), 'en lugar del personaje, el círculo con la inicial');
  ok(!(await p.$('#sheet .rgk')) && !(await p.$('#sheet .mhc')) && !/Desafío de la semana|Misiones de hoy/.test(t), 'sin rangos, misiones ni desafío');
  ok(/te manda: «Hoy rezo por vos»/.test(t) && /Por mi abuela/.test(t) && await p.$('#sheet [data-a="gRece"]'), 'intenciones, «Recé por vos» y los alientos recibidos');
  await A('gTab', 'ranking'); t = await SH(); ok(/Encuentros/.test(t) && /Cantos del grupo/.test(t) && !(await p.$('#sheet .granq')) && !/Tus insignias/.test(t), 'pestaña Grupo: encuentros y cantos, sin ranking ni insignias');
  await A('gTab', 'muro'); ok(await p.$('#sheet .chat .msgs'), 'el chat sigue');
  await A('cerrar'); await ir('grupo'); t = await APP();
  ok(/Chat/.test(t) && /Intenciones/.test(t) && /Encuentros/.test(t) && /Cantos del grupo/.test(t) && !/Desafío y misiones/.test(t) && !/Constancia de los grupos/.test(t) && !/\.º de \d+ grupos/.test(t), 'pantalla Grupo sin desafío ni ranking');
  await ir('hoy'); t = await APP(); ok(/intenciones para rezar/.test(t) && !/Misiones de hoy/.test(t) && !/tu grupo va/.test(t), 'tarjeta del grupo en Hoy: intenciones, sin misiones ni posición');

  // 4) volver al personaje
  await A('sobrioSet', null, 700); await ir('yo');
  ok((await PR()).sobrio === false && !(await p.evaluate(() => document.body.classList.contains('sobrio'))) && await p.$('#pjsec') && await p.$('#app .rangoc'), 'el interruptor devuelve el personaje');

  // 5) ranking de grupos opcional y renombrado
  await A('grupo', null, 700); await A('gTab', 'ranking'); t = await SH();
  ok(/Constancia de los grupos/.test(t) && !/Ranking de grupos/.test(t) && /Cuenta la constancia registrada, no mide la santidad de nadie/.test(t), '«Constancia de los grupos», con la aclaración');
  await A('gAliento', 'ej0'); const al = await p.$$eval('#sheet .gal button', L => L.map(x => x.textContent));
  ok(al.length === 7 && !al.some(x => /ranking/i.test(x)) && al.includes('Te acompaño con mi oración'), 'alientos sin «Te espero en el ranking»: ' + al.join(' | '));
  await A('cerrar'); await ir('mas'); ok(await p.$('#app [data-a="rankOff"][aria-checked="true"]') && await p.$('#app [data-a="sobrioSet"][aria-checked="false"]'), 'Ajustes: «Mostrar el ranking de grupos», prendido por defecto');
  await A('rankOff', null, 600); ok((await PR()).rankOff === true && await p.$('#app [data-a="rankOff"][aria-checked="false"]'), 'apagarlo se guarda');
  await ir('grupo'); t = await APP(); ok(!/Constancia de los grupos/.test(t) && !/\.º de \d+ grupos/.test(t) && /Desafío y misiones/.test(t), 'apagado: la pantalla Grupo no muestra el ranking ni la posición (el desafío sigue)');
  await ir('hoy'); t = await APP(); ok(!/tu grupo va/.test(t) && /Misiones de hoy/.test(t), 'apagado: la tarjeta del grupo sin posición');
  await A('grupo', null, 700); await A('gTab', 'ranking'); ok(!(await p.$('#sheet .granq')), 'apagado: la hoja del grupo sin la tabla'); await A('cerrar');
  await ir('mas'); await A('rankOff', null, 600); await ir('grupo'); ok(/Constancia de los grupos/.test(await APP()), 'prendido otra vez, vuelve');

  // 6) consagrados: solo para quien lo marca
  await ir('yo'); await A('pjSet', 'sx|m', 600);
  const ropa = () => p.$$eval('#app .card.opt .chips button', L => L.map(x => x.dataset.p));
  let R = await ropa(); t = await APP();
  ok((await p.$$('#app .chips.estado button')).length === 3 && await p.$('#app .chips.estado [data-p="estado|laico"][aria-pressed="true"]'), 'chips de estado de vida: laico (por defecto), sacerdote o seminarista, religioso o consagrado');
  ok(!/Consagrados/.test(t) && !R.some(x => /prenda\|(sotana|clergyman|seminarista)/.test(x)), 'a un laico no se le ofrecen sotana, clergyman ni hábito');
  await A('pjSet', 'estado|sacerdote', 600); R = await ropa(); t = await APP();
  ok(/Consagrados/.test(t) && ['sotana', 'clergyman'].every(k => R.includes('prenda|' + k)), 'sacerdote o seminarista: aparecen los consagrados');
  await A('pjSet', 'prenda|sotana', 600); await A('pjSet', 'estado|laico', 600); R = await ropa(); t = await APP();
  ok((await PR()).prenda === 'sotana' && R.includes('prenda|sotana') && !R.includes('prenda|clergyman') && !/Consagrados/.test(t) && await p.$('#app [data-p="prenda|sotana"][aria-pressed="true"]'), 'un laico que ya la tenía puesta la conserva, pero no se le ofrecen las demás');
  await A('pjSet', 'prenda|base', 600); await A('pjSet', 'sx|f', 700); R = await ropa();
  ok((await p.$$('#app .chips.estado button')).length === 2 && !R.some(x => /prenda\|(consagrada|caridad|dominica|carmelita)/.test(x)), 'ella: laica o religiosa; sin hábitos si es laica');
  await A('pjSet', 'estado|religioso', 600); R = await ropa(); ok(/Consagradas/.test(await APP()) && ['consagrada', 'carmelita'].every(k => R.includes('prenda|' + k)), 'religiosa o consagrada: aparecen las consagradas');
  await A('pjSet', 'sx|m', 600);

  // 7) «Glorioso»: cambia el nombre, no el dibujo
  const esc = await p.$$eval('#app .rgesc span', L => L.map(x => [x.textContent.trim(), x.querySelector('img').getAttribute('src')]));
  ok(esc.length === 8 && esc[7][0] === 'Glorioso' && /divino\.png$/.test(esc[7][1]) && !/Divino/.test(await APP()) && /de Hierro a Glorioso/.test(await APP()), 'el octavo rango se llama Glorioso (dibujo: divino.png)');

  console.log(errs.concat(fails).join('\n') || 'T46 OK'); await b.close(); process.exit(errs.length || fails.length ? 1 : 0); })();
