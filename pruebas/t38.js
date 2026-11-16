// t38 · Daily 2.3: aviso de novedades al actualizar (una vez, solo a quien ya usaba la app), tonos de piel del personaje,
// lo ya rezado con tilde y el inicio que pasa a lo que falta, Liturgia de las Horas explicada, NOVEDADES con la versión actual.
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const errs = [], fails = []; const ok = (c, m) => { if (process.env.V) console.log((c ? '  ok ' : '  XX ') + m); if (!c) fails.push(m); };
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);
  await p.click('#invitado'); await p.waitForTimeout(2200);
  const A = async (a, q, ms = 450) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  ok(!(await p.evaluate(() => window.DAILY.get().sheet)), 'quien entra por primera vez no ve «Novedades»');
  const app = fs.readFileSync(__dirname + '/../js/app.js', 'utf8'); const ver = (app.match(/VERSION="([\d.]+)"/) || [])[1];
  ok(new RegExp('\\["' + ver.replace(/\./g, '\\.') + '",\\[').test(app), 'NOVEDADES tiene la entrada de la versión ' + ver);
  // quien venía de una versión anterior ve las novedades una sola vez
  await p.evaluate(() => { localStorage.setItem('daily_ver_vista', '2.2.6'); localStorage.setItem('daily_prueba_novedades', '1'); }); await p.reload(); await p.waitForTimeout(800); if (await p.$('#invitado')) { await p.click('#invitado'); }
  await p.waitForTimeout(2200);
  let sh = await p.evaluate(() => window.DAILY.get().sheet && window.DAILY.get().sheet.view); let t = await p.evaluate(() => (document.querySelector('#sheetIn') || {}).innerText || '');
  ok(sh === 'novedades' && /Novedades/.test(t) && /tono de piel/.test(t) && /niño, joven, adulto o mayor/.test(t) && /2\.2\.7/.test(t), 'al actualizar aparece «Novedades» con lo de esta versión y las anteriores');
  ok(await p.evaluate(v => localStorage.getItem('daily_ver_vista') === v, ver), 'queda anotada la versión vista');
  await A('cerrar'); await p.reload(); await p.waitForTimeout(800); if (await p.$('#invitado')) await p.click('#invitado'); await p.waitForTimeout(2200);
  ok(!(await p.evaluate(() => window.DAILY.get().sheet)), 'no vuelve a aparecer');
  ok(/controllerchange/.test(app) && /Hay una versión nueva de Scaeli/.test(app), 'con la app abierta, aviso «Hay una versión nueva · Actualizar»');
  // tonos de piel: tiñe solo la piel
  const tono = await p.evaluate(async () => { const PJ = await import('./js/personaje.js'); await PJ.cargar(); const px = t => { const cv = document.createElement('canvas'); PJ.pintar(cv, { sx: 'm', tono: t }); return cv.getContext('2d').getImageData(0, 0, 128, 128).data; };
    const a = px('base'), o = px('oscura'); let piel = 0, otro = 0; for (let i = 0; i < a.length; i += 4) { if (a[i] !== o[i] || a[i + 1] !== o[i + 1]) { if (o[i] < a[i]) piel++; else otro++; } } return [PJ.TONOS.length, piel, otro]; });
  ok(tono[0] >= 6 && tono[1] > 200 && tono[2] === 0, 'tonos de piel: ' + tono[0] + ' tonos; «oscura» oscurece solo la piel: ' + JSON.stringify(tono));
  await p.evaluate(() => window.DAILY.ir('yo')); await p.waitForTimeout(500);
  ok((await p.$$('.sw.piel button')).length === tono[0], 'Yo ofrece los tonos de piel');
  await p.click('.sw.piel button[data-p="tono|morena"]'); await p.waitForTimeout(600);
  ok(await p.evaluate(() => (JSON.parse(localStorage.getItem('scaeli-daily-local'))['daily_settings/profile'] || {}).tono === 'morena'), 'el tono elegido se guarda');
  // edades: niño, joven, adulto y mayor, con su dibujo, sus colores y la piel
  const listas = await p.evaluate(async () => (await import('./js/personaje.js')).EDADES_LISTAS);
  ok((await p.$$('.seg.edad button')).length === (listas.length > 1 ? listas.length : 0), 'Yo ofrece solo las edades listas: ' + listas);
  if (listas.length === 4) {   // con todas las edades listas: cada una con su dibujo
  const ed = await p.evaluate(async () => { const PJ = await import('./js/personaje.js'); await PJ.cargar(); const px = q => { const cv = document.createElement('canvas'); PJ.pintar(cv, q); return cv.toDataURL(); };
    const r = {}; for (const sx of ['m', 'f']) for (const e of ['nino', 'joven', 'adulto', 'mayor']) r[sx + e] = px({ sx, edad: e, prenda: 'buzo:azul' });
    const n = PJ.normal({ sx: 'f', edad: 'mayor', prenda: 'sotana', peinado: 'trenza' }); const o = PJ.opciones(n);
    return { distintos: new Set(Object.values(r)).size, n, prendas: o.prendas.map(x => x[0]), colores: PJ.opciones(PJ.normal({ sx: 'm', edad: 'nino', prenda: 'remera:azul' })).colores.length,
      piel: px({ sx: 'm', edad: 'adulto', tono: 'oscura' }) !== px({ sx: 'm', edad: 'adulto' }) }; });
  ok(ed.distintos === 8, 'cada edad tiene su propio dibujo: ' + ed.distintos);
  ok(ed.n.edad === 'mayor' && ed.n.tipo === 'base' && ed.n.peinado === 'base' && !ed.prendas.includes('sotana'), 'lo que no hay en una edad cae en lo que sí: ' + JSON.stringify([ed.n.tipo, ed.n.peinado, ed.prendas]));
  ok(ed.colores === 5 && ed.piel, 'las edades tienen los cinco colores y aceptan el tono de piel');
  const pm = await p.evaluate(async () => { const PJ = await import('./js/personaje.js'); await PJ.cargar(); const o = PJ.opciones(PJ.normal({ sx: 'f', edad: 'mayor', prenda: 'buzo:azul' })); const oj = PJ.opciones(PJ.normal({ sx: 'f', prenda: 'buzo:azul' }));
    const cv = document.createElement('canvas'), cv2 = document.createElement('canvas'); PJ.pintar(cv, { sx: 'f', edad: 'mayor', peinado: 'rodete', prenda: 'buzo:azul' }); PJ.pintar(cv2, { sx: 'f', edad: 'mayor', prenda: 'buzo:azul' });
    return { pe: o.peinados.map(x => x[0]), joven: oj.peinados.map(x => x[0]), distinto: cv.toDataURL() !== cv2.toDataURL(), pr: PJ.opciones(PJ.normal({ sx: 'm', edad: 'adulto' })).prendas.map(x => x[0]) }; });
  ok(pm.pe.join() === 'base,rodete' && !pm.joven.includes('rodete') && pm.distinto, 'la mayor tiene anteojos o rodete (y la joven no tiene rodete): ' + JSON.stringify(pm));
  ok(['remera', 'buzo', 'camisa', 'deportiva'].every(x => pm.pr.includes(x)) && !pm.pr.includes('sotana'), 'el adulto tiene toda la ropa laica del joven: ' + pm.pr);
  }
  if (listas.includes('nino')) { await p.click('.seg.edad button[data-p="edad|nino"]'); await p.waitForTimeout(600);
  ok(await p.evaluate(() => (JSON.parse(localStorage.getItem('scaeli-daily-local'))['daily_settings/profile'] || {}).edad === 'nino'), 'la edad elegida se guarda'); }
  else ok(await p.evaluate(async () => { const PJ = await import('./js/personaje.js'); return PJ.normal({ sx: 'm', edad: 'nino' }).edad === 'joven'; }), 'una edad oculta cae en Joven (quien ya la había elegido ve al joven)');
  // lo ya rezado: tilde en las portadas y el inicio pasa a lo que falta
  await p.evaluate(() => window.DAILY.ir('hoy')); await p.waitForTimeout(400);
  await A('evOk', undefined, 600); await p.evaluate(() => window.DAILY.ir('hoy')); await p.waitForTimeout(400);
  ok(await p.evaluate(() => !!document.querySelector('.cov.hecho[data-a="evangelio"] .covok')), 'el Evangelio leído lleva el tilde en su portada');
  const hz = await p.evaluate(() => document.querySelector('.hero2').innerText);
  ok(!/Leer · 5 min|Volver a leer/.test(hz), 'el inicio ya no ofrece el Evangelio leído: ' + hz.replace(/\s+/g, ' ').slice(0, 80));
  // Liturgia de las Horas: qué es y para qué sirve
  await A('horas'); t = await p.evaluate(() => document.querySelector('#sheetIn').innerText);
  ok(/oración oficial de la Iglesia/.test(t) && /¿Para qué sirve\?/.test(t) && await p.$('#sheetIn details.lhque[open]'), 'Horas: explicación abierta la primera vez');
  await A('horaLH', 'laudes'); t = await p.evaluate(() => document.querySelector('#sheetIn').innerText);
  ok(/Alabar a Dios al empezar el día/.test(t) && await p.$('#sheetIn details.lhque'), 'cada Hora dice para qué es');
  console.log(errs.join('\n')); console.log(fails.length ? 'FALLAS:\n' + fails.join('\n') : 'OK t38');
  await b.close(); process.exit(fails.length || errs.length ? 1 : 0); })();
