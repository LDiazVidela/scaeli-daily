// t29 · Daily 1.11.1: Credo e inicio del Rosario, cuentas parejas con colgante, Oraciones prolijas, actividad del grupo con «Amén»
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [], fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900); await p.click('#invitado'); await p.waitForTimeout(1100);
  const A = async (a, q, ms = 450) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const SH = async () => p.evaluate(() => document.querySelector('#sheet').innerText);
  const LS = async () => p.evaluate(() => JSON.parse(localStorage.getItem('scaeli-daily-local') || '{}'));
  // Rosario: Credo → Padrenuestro + 3 Avemarías + Gloria → misterios
  await A('rosario'); let t = await SH(); ok(/Al empezar/i.test(t) && /Completo/.test(t) && /Solo el Credo/.test(t), 'selector del inicio');
  await A('rosEmpezar', 'gozosos'); t = await SH(); ok(/Credo de los Apóstoles/.test(t) && /Creo en Dios/.test(t) && /Para empezar/i.test(t), 'pantalla del Credo');
  await A('rosLat'); t = await SH(); ok(/Symbolum Apostolorum/.test(t) && /Credo in Deum/.test(t), 'Credo en latín'); await A('rosLat');
  await A('rosAv'); t = await SH(); ok(/Padrenuestro/i.test(t) && /Por la fe, la esperanza y la caridad/.test(t), 'Padrenuestro del inicio');
  await A('rosAv'); t = await SH(); ok(/por la fe/i.test(t), 'primera Avemaría: por la fe'); await A('rosAv'); await A('rosAv'); t = await SH(); ok(/por la caridad/i.test(t), 'tercera: por la caridad');
  await A('rosAv'); await A('rosAv'); t = await SH(); ok(/1\.er misterio/i.test(t), 'después del Gloria, el primer misterio');
  await A('rosAtras'); t = await SH(); ok(/Gloria/.test(t) && /Por la fe/.test(t), 'atrás vuelve al Gloria del inicio');
  await A('rosIrMis'); await A('rosAv'); await A('rosAv'); await A('rosAv');
  const geo = await p.evaluate(() => { const c = [...document.querySelectorAll('svg.anillo circle.cu:not(.med)')].map(e => [+e.getAttribute('cx'), +e.getAttribute('cy')]); const pad = document.querySelector('svg.anillo rect.cu');
    const ang = c.map(([x, y]) => Math.atan2(y - 130, x - 130) * 180 / Math.PI); const d = ang.map((a, i) => i ? ((a - ang[i - 1] + 360) % 360) : 0).slice(1);
    return { n: c.length, paso: d, cruz: !!document.querySelector('svg.anillo .cruz'), med: !!document.querySelector('svg.anillo .cu.med'), pad: pad && +pad.getAttribute('x') }; });
  ok(geo.n === 10 && geo.paso.every(x => Math.abs(x - 360 / 11) < .5), 'diez cuentas parejas: ' + JSON.stringify(geo.paso)); ok(geo.cruz && geo.med && geo.pad === 119, 'medalla, crucifijo y Padrenuestro arriba');
  const cen = await p.evaluate(() => { const b = document.querySelector('.rtap').getBoundingClientRect(), a = document.querySelector('.acentro').getBoundingClientRect(); return [(a.left + a.right) / 2 - (b.left + b.right) / 2, (a.top + a.bottom) / 2 - b.top - b.width * 130 / 260]; });
  ok(Math.abs(cen[0]) < 2 && Math.abs(cen[1]) < 3, 'el número queda en el centro del círculo: ' + cen);
  await A('cerrar'); let d = await p.$('.dlg button.primary'); if (d) await d.click(); await p.waitForTimeout(300);
  // Solo el Credo
  await A('rosario'); await A('rosCorto', '1'); await A('rosEmpezar', 'gozosos'); await A('rosAv'); t = await SH(); ok(/1\.er misterio/i.test(t), 'solo el Credo: después van los misterios');
  await A('cerrar'); d = await p.$('.dlg button.primary'); if (d) await d.click(); await p.waitForTimeout(300); await A('rosCorto', '0');
  // Oraciones: selector a lo ancho y todas las filas con subtítulo
  await A('oraciones', null, 700); const o = await p.evaluate(() => { const s = document.querySelector('.lat-seg').getBoundingClientRect(), l = document.querySelector('#sheet .list').getBoundingClientRect(); const H = [...document.querySelectorAll('#sheet .list .food')].map(e => Math.round(e.getBoundingClientRect().height)); return { w: Math.abs(s.width - l.width), H: [Math.min(...H), Math.max(...H)], sin: [...document.querySelectorAll('#sheet .list .food')].filter(e => !e.querySelector('small')).length }; });
  ok(o.w < 2, 'selector Español/Latín a lo ancho'); ok(o.sin === 0 && o.H[1] - o.H[0] <= 2, 'filas parejas: ' + JSON.stringify(o)); t = await SH(); ok(/Cántico de María/.test(t), 'subtítulo del Magníficat'); await A('cerrar');
  // Actividad del grupo
  await A('grupo'); await A('gEjemplo', null, 1300); t = await SH(); ok(/Hoy en el grupo/i.test(t) && /rezó el Rosario/.test(t), 'actividad del grupo'); ok(!/Que no estoy solo/.test(t), 'no muestra lo escrito');
  const amId = await p.evaluate(() => document.querySelector('.gact .amen2[data-a=actAmen]').dataset.p); await A('actAmen', amId, 800);
  ok(await p.evaluate(id => document.querySelector('.gact .amen2[data-p="' + id + '"]').getAttribute('aria-pressed') === 'true', amId), 'Amén marcado');
  let st = await LS(); ok(st['daily_settings/actividad'] && st['daily_settings/actividad'].am[amId], 'Amén guardado'); await A('cerrar');
  await p.evaluate(() => window.DAILY.ir('hoy')); await p.waitForTimeout(500); t = await p.evaluate(() => (document.querySelector('.actban') || {}).innerText || ''); ok(/ya rezaron el Rosario hoy|ya rezó el Rosario hoy/.test(t) && /Me sumo/.test(t), 'aviso en Hoy: ' + t);
  // registro propio: Evangelio y Rosario
  await A('diaria', 'e', 700); st = await LS(); let L = (st['daily_settings/actividad'] || {}).L || []; ok(L.some(a => a.k === 'e'), 'mi Evangelio queda en la actividad');
  await p.waitForTimeout(1500); const fic = await p.evaluate(() => { const st = JSON.parse(localStorage.getItem('scaeli-daily-grupos')); const g = Object.values(st)[0]; return Object.values(g.m).filter(x => (x.act || []).some(a => a[1] === 'e' && a[0].startsWith('e') && a[0].length > 3)).length; }); ok(fic >= 1, 'viaja en la ficha del grupo');
  await A('grupo', null, 800); t = await SH(); ok(/Vos leyó el Evangelio|Vos\s+leyó el Evangelio/.test(t), 'me veo en la actividad'); await A('cerrar');
  // apagar
  await p.evaluate(() => window.DAILY.ir('mas')); await p.waitForTimeout(400); await A('actOff', null, 1500); const fic2 = await p.evaluate(() => { const st = JSON.parse(localStorage.getItem('scaeli-daily-grupos')); const g = Object.values(st)[0]; return Object.values(g.m).filter(x => (x.act || []).some(a => a[1] === 'e' && a[0].length > 3)).length; }); ok(fic2 === 0, 'sin compartir, no viaja');
  await A('actOff', null, 500);
  console.log('T29', errs.concat(fails).join('\n') || 'OK'); await b.close(); })();
