// t27 · Daily 1.10: Palabra del día, misiones del grupo, premios semanales (rosarios y colores), álbum de santos, avatar → personalización, logo
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [], fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1000);
  ok(await p.$('.login .logo img[src*="logo-daily-2"]') !== null, 'logo nuevo en la entrada');
  await p.click('#invitado'); await p.waitForTimeout(1200);
  const A = async (a, q, ms = 450) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const SH = async () => p.evaluate(() => document.querySelector('#sheet').innerText);
  const LS = async () => p.evaluate(() => JSON.parse(localStorage.getItem('scaeli-daily-local')));
  // avatar → personalización
  await p.click('.hero2 .pjbtn'); await p.waitForTimeout(700); ok(await p.evaluate(() => document.querySelector('#pjsec') && Math.abs(document.querySelector('#pjsec').getBoundingClientRect().top) < 140), 'tocar el avatar lleva a la personalización');
  // Palabra del día
  await A('palabra', null, 1500); let t = await SH(); ok(/Palabra del día/i.test(t) && /¿Qué me dice hoy\?/i.test(t) && /¿Cómo lo vivo hoy\?/i.test(t), 'panel de la Palabra del día'); const cita = await p.evaluate(() => document.querySelector('.pal .st').innerText);
  ok(/^\S+ \d+(-\d+)?,\d+(-\d+)?$/.test(cita), 'cita: ' + cita); ok((await p.$$('.paltx sup')).length >= 2, 'texto con versículos');
  await p.fill('#palQ', 'Que no estoy solo'); await p.fill('#palV', 'Llamar a mi abuela'); await A('palOk', null, 600);
  let st = await LS(); const hoyK = Object.keys(st).filter(k => k.startsWith('daily_days/')).sort().pop(); const dd = st[hoyK]; ok(dd && dd.pal && dd.pal.q === 'Que no estoy solo' && dd.pal.r === cita, 'reflexión guardada en el día');
  await A('misOraciones'); t = await SH(); ok(/Palabra del día/.test(t) && /Llamar a mi abuela/.test(t), 'aparece en Mis oraciones'); await A('cerrar');
  await A('biblia', null, 1200); t = await SH(); ok(/Palabra del día/i.test(t) && /Ya la rezaste hoy/i.test(t), 'tarjeta en la Biblia'); await A('cerrar');
  await p.evaluate(() => window.DAILY.ir('rezar')); await p.waitForTimeout(300); t = await p.evaluate(() => document.body.innerText); ok(/Palabra del día/.test(t), 'tile en Rezar');
  // Álbum: 3 sobres de bienvenida + 1 por el día con Dios
  await A('album', null, 500); t = await SH(); ok(/Álbum de santos/.test(t) && /0 \/ \d+|0\s*\/\s*\d+/.test(t.replace(/\n/g, ' ')), 'álbum vacío'); const hay = await p.evaluate(() => +document.querySelector('.albtop .sobrebox b').innerText); ok(hay === 4, 'sobres disponibles: ' + hay);
  const nAlb = await p.evaluate(() => document.querySelectorAll('.albgrid .albcel').length); ok(nAlb >= 80 && nAlb <= 100, 'figuritas en el álbum: ' + nAlb);
  await A('sobreAbrir', null, 1300); ok((await p.$$('.sobrev .sale')).length === 3, 'el sobre trae 3'); t = await SH(); ok(/Nueva|Repetida/i.test(t), 'marca nueva/repetida');
  for (let i = 0; i < 3; i++) await A('sobreAbrir', null, 900);
  st = await LS(); let al = st['daily_settings/album']; ok(al && al.ab === 4 && Object.values(al.c).reduce((s, n) => s + n, 0) === 12, 'cuatro sobres = 12 figuritas: ' + JSON.stringify(al && al.ab));
  await A('sobreAbrir', null, 600); st = await LS(); ok(st['daily_settings/album'].ab === 4, 'sin sobres no abre');
  await A('album', null, 500); const k = await p.evaluate(() => document.querySelector('.albgrid [data-a=figu]').dataset.p); await A('figu', k, 500); t = await SH(); ok(/Común|Rara|Dorada/.test(t) && /N\.º/.test(t), 'ficha de la figurita');
  // canje: forzar repetidas
  await p.evaluate(() => { const K = 'scaeli-daily-local'; const s = JSON.parse(localStorage.getItem(K)); s['daily_settings/album'].c['04-23'] = 6; localStorage.setItem(K, JSON.stringify(s)); }); await p.reload(); await p.waitForTimeout(1300);
  await A('album', null, 500); t = await SH(); ok(/Cambiar 4 repetidas/.test(t), 'botón de canje'); await A('albCanje', null, 600); st = await LS(); al = st['daily_settings/album']; ok(al.cj === 1 && al.c['04-23'] === 2, 'canje: 4 repetidas por un sobre');
  ok(await p.evaluate(() => +document.querySelector('.albtop .sobrebox b').innerText) === 1, 'el canje suma un sobre');
  await A('cerrar');
  // Misiones del grupo
  await A('grupo'); await A('gEjemplo', null, 1000); t = await SH(); ok(/Misiones de hoy/i.test(t) && (await p.$$('.gmis .mrow')).length === 3, 'tres misiones en el grupo'); ok(/perdés 15/.test(t), 'explica la penalización');
  const mis = await p.evaluate(() => [...document.querySelectorAll('.gmis .mrow')].map(e => e.dataset.a)); ok(new Set(mis).size === 3, 'misiones distintas: ' + mis);
  ok(/\d\/3 hoy/.test(t), 'cada miembro muestra sus misiones de hoy');
  // regalo de figurita a alguien del grupo (local)
  const otro = await p.evaluate(() => { const st = JSON.parse(localStorage.getItem('scaeli-daily-grupos')); const g = Object.values(st)[0]; return Object.keys(g.m).find(u => !u.startsWith('local') && u !== 'yo') || Object.keys(g.m)[1]; });
  await A('figu', '04-23', 500); t = await SH(); ok(/Regalar una repetida/i.test(t), 'opción de regalar');
  await p.evaluate(o => { window.__c = window.DAILY.ACC.figuRegalar('04-23|' + o); }, otro); await p.waitForTimeout(400); await p.click('.dlg button.primary'); await p.waitForTimeout(900);
  st = await LS(); ok(st['daily_settings/album'].c['04-23'] === 1 && (st['daily_settings/album'].env || []).length === 1, 'regalo: sale de mi álbum y queda anotado');
  const ficha = await p.evaluate(() => { const st = JSON.parse(localStorage.getItem('scaeli-daily-grupos')); const g = Object.values(st)[0]; const me = Object.values(g.m).find(x => x.reg); return me && me.reg.length; }); ok(ficha === 1, 'el regalo viaja en la ficha del grupo');
  // recibir un regalo
  await p.evaluate(() => { const K = 'scaeli-daily-grupos'; const st = JSON.parse(localStorage.getItem(K)); const g = Object.values(st)[0]; const yoU = Object.keys(g.m).find(u => g.m[u].reg); const o = Object.keys(g.m).find(u => u !== yoU); g.m[o].reg = [{ i: 'g-test', to: yoU, k: '12-12', t: Date.now() }]; localStorage.setItem(K, JSON.stringify(st)); });
  await A('cerrar'); await p.reload(); await p.waitForTimeout(2500); st = await LS(); ok((st['daily_settings/album'].c['12-12'] || 0) >= 1 && st['daily_settings/album'].rec.includes('g-test'), 'regalo recibido una sola vez');
  await p.reload(); await p.waitForTimeout(2500); const st2 = await LS(); ok(st2['daily_settings/album'].c['12-12'] === st['daily_settings/album'].c['12-12'], 'no se recibe dos veces');
  // Premios: semana pasada con 7 días con Dios
  await p.evaluate(() => { const K = 'scaeli-daily-local'; const s = JSON.parse(localStorage.getItem(K)); const pad = n => String(n).padStart(2, '0'); const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    const h = new Date(); const lun = new Date(h); lun.setDate(h.getDate() - ((h.getDay() + 6) % 7) - 7); for (let i = 0; i < 7; i++) { const d = new Date(lun); d.setDate(lun.getDate() + i); s['daily_days/' + iso(d)] = { m: 1, e: 1, t: Date.now() }; } localStorage.setItem(K, JSON.stringify(s)); });
  await p.reload(); await p.waitForTimeout(3200); st = await LS(); const pr = st['daily_settings/premios']; ok(pr && pr.items.length === 1, 'premio de la semana ganado: ' + JSON.stringify(pr));
  await p.evaluate(() => window.DAILY.ir('yo')); await p.waitForTimeout(500); t = await p.evaluate(() => document.querySelector('#premsec').innerText); ok(/Tus premios/i.test(t) && /Rosario/i.test(t) && /Color de la app/i.test(t), 'tarjeta de premios');
  const libre = await p.evaluate(() => [...document.querySelectorAll('#premsec .prem:not(.lock)')].map(e => e.dataset.p)); ok(libre.length === 3, 'desbloqueados: ' + libre);
  const ganado = pr.items[0]; await A('premUsar', ganado, 600);
  if (ganado.startsWith('ac:')) { const a = await p.evaluate(() => document.documentElement.getAttribute('data-acento')); ok(a === ganado.slice(3), 'color de la app aplicado: ' + a); }
  else { await A('rosario', null, 500); await A('rosAv'); await A('rosAv'); ok(await p.$('svg.anillo.r-' + ganado.slice(4)) !== null, 'rosario con el diseño ganado'); await A('cerrar', null, 300); const d = await p.$('.dlg button.primary'); if (d) await d.click(); }
  await A('premUsar', 'ros:oro', 300); st = await LS(); ok(st['daily_settings/profile'].ros !== 'oro', 'no se puede usar uno bloqueado');
  // Ajustes: botones de fila del mismo ancho y campos de hora sin alto fijo
  await p.evaluate(() => window.DAILY.ir('mas')); await p.waitForTimeout(400);
  const anchos = await p.evaluate(() => [...document.querySelectorAll('.card.list>.row>.ghost')].map(e => Math.round(e.getBoundingClientRect().width))); ok(anchos.length >= 5 && Math.max(...anchos) - Math.min(...anchos) <= 2, 'botones de fila parejos: ' + anchos);
  const hr = await p.evaluate(() => { const e = document.querySelector('input[data-rec=m]'); const s = getComputedStyle(e); return [s.paddingTop, s.paddingBottom]; }); ok(hr[0] === hr[1], 'hora centrada en alto');
  const VER = require('fs').readFileSync(require('path').join(__dirname, '..', 'js', 'app.js'), 'utf8').match(/VERSION="([^"]+)"/)[1]; t = await p.evaluate(() => document.body.innerText); ok(t.includes('Scaeli Daily ' + VER), 'versión ' + VER);
  console.log('T27', errs.concat(fails).join('\n') || 'OK'); await b.close(); })();
