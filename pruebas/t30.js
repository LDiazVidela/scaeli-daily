// t30 · Daily 1.12: Rosario compartido con Fit (sin contar dos veces), entrenos de Fit, rango de perseverancia, ranking de grupos, ropa Deportiva
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [], fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900); await p.click('#invitado'); await p.waitForTimeout(1100);
  const A = async (a, q, ms = 450) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const SH = async () => p.evaluate(() => document.querySelector('#sheet').innerText);
  const LS = async () => p.evaluate(() => JSON.parse(localStorage.getItem('scaeli-daily-local') || '{}'));
  const iso = await p.evaluate(() => { const pad = n => String(n).padStart(2, '0'), d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); });
  const poner = async (k, v) => { await p.evaluate(([k, v]) => { const K = 'scaeli-daily-local'; const s = JSON.parse(localStorage.getItem(K) || '{}'); if (v === null) delete s[k]; else s[k] = v; localStorage.setItem(K, JSON.stringify(s)); }, [k, v]); };
  // Rosario: id propio y no se cuenta dos veces
  await A('rosario'); await A('rosEmpezar', 'gozosos'); let r = (await LS())['daily_settings/rosario']; ok(r && r.id && r.id.length >= 6, 'el Rosario lleva id: ' + (r && r.id));
  await poner('daily_settings/rosario', { ...r, fase: 'papa', c: 4 }); await p.reload(); await p.waitForTimeout(1300); await A('rosario'); await A('rosAv', null, 700);
  let d = (await LS())['daily_days/' + iso]; ok(d && d.rn === 1 && d.src === 'daily' && (d.rids || []).includes(r.id), 'contado una vez con rids: ' + JSON.stringify(d));
  await A('cerrar'); await poner('daily_settings/rosario', { ...r, fase: 'papa', c: 4 }); await p.reload(); await p.waitForTimeout(1300); await A('rosario'); await A('rosAv', null, 700);
  d = (await LS())['daily_days/' + iso]; ok(d.rn === 1, 'el mismo Rosario (terminado también en Fit) no suma otra vez'); await A('cerrar');
  // Rosario que viene de Fit: aviso y etiqueta
  await p.evaluate(() => window.DAILY.ir('dia')); await p.waitForTimeout(400);
  await p.evaluate(iso => { window.__store = 1; }, iso);
  const K = 'scaeli-daily-local';
  await p.evaluate(([K, iso]) => { const s = JSON.parse(localStorage.getItem(K)); s['daily_days/' + iso] = { ...s['daily_days/' + iso], r: 1, rn: 2, src: 'fit', rids: ['x1', 'fit1'], t: Date.now() }; localStorage.setItem(K, JSON.stringify(s)); }, [K, iso]);
  await p.reload(); await p.waitForTimeout(1300); await p.evaluate(() => window.DAILY.ir('dia')); await p.waitForTimeout(400);
  let t = await p.evaluate(() => document.body.innerText); ok(/Rezado en Scaeli Fit/.test(t), 'el día dice «Rezado en Scaeli Fit»');
  // Entreno de Fit ofrecido
  await poner('daily_days/' + iso, null); await poner('workouts/' + iso, { done: true, offered: true, intention: 'mi abuela', summary: { name: 'Torso A', dur: 52 * 60000, sets: 18, vol: 5200, xp: 120 } });
  await p.reload(); await p.waitForTimeout(1300); await p.evaluate(() => window.DAILY.ir('dia')); await p.waitForTimeout(400); t = await p.evaluate(() => document.body.innerText);
  ok(/Entrenaste · Torso A · 52 min/.test(t) && /Ofreciste tu entreno por mi abuela/.test(t), 'entreno en el día');
  await p.evaluate(() => window.DAILY.ir('hoy')); await p.waitForTimeout(400); ok(await p.evaluate(() => /1|2/.test(document.querySelector('.vch') ? document.querySelector('.vch').innerText : '')), 'el entreno ofrecido cuenta como día con Dios (racha)');
  await poner('workouts/' + iso, { done: true, offered: false, summary: { name: 'Piernas', dur: 30 * 60000 } }); await p.reload(); await p.waitForTimeout(1300);
  ok(await p.evaluate(() => /^\D*0/.test(document.querySelector('.vch') ? document.querySelector('.vch').innerText : '0')), 'sin ofrecer no cuenta'); t = await p.evaluate(() => { window.DAILY.ir('dia'); return new Promise(r => setTimeout(() => r(document.body.innerText), 400)); }); ok(/Entrenaste · Piernas · 30 min/.test(t) && /ofrecelo la próxima/.test(t), 'entreno sin ofrecer');
  let st = await LS(); ok(Object.keys(st).filter(k => k.startsWith('workouts/')).length === 1 && st['workouts/' + iso].offered === false, 'Daily no escribe en workouts');
  // Rango
  await p.evaluate(([K]) => { const s = JSON.parse(localStorage.getItem(K)); const pad = n => String(n).padStart(2, '0'); const f = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); for (let i = 0; i < 30; i++) { const d = new Date(); d.setDate(d.getDate() - i); s['daily_days/' + f(d)] = { m: 1, r: 1, rn: 1, t: Date.now() }; } localStorage.setItem(K, JSON.stringify(s)); }, [K]);
  await p.reload(); await p.waitForTimeout(1300); await p.evaluate(() => window.DAILY.ir('yo')); await p.waitForTimeout(500); t = await p.evaluate(() => document.querySelector('.rangoc').innerText.replace(/\s+/g, ' '));
  ok(/Diamante I\b/.test(t) && /540 puntos/.test(t) && /faltan 50 puntos para Celestial III/.test(t), 'rango Diamante I con 540 (desde la 2.0 siguen Celestial y Divino): ' + t.replace(/\n/g, ' | ').slice(0, 120));
  await p.evaluate(([K]) => { const s = JSON.parse(localStorage.getItem(K)); Object.keys(s).filter(k => k.startsWith('daily_days/')).sort().slice(0, 20).forEach(k => delete s[k]); localStorage.setItem(K, JSON.stringify(s)); }, [K]);
  await p.reload(); await p.waitForTimeout(1300); await p.evaluate(() => window.DAILY.ir('yo')); await p.waitForTimeout(500); t = await p.evaluate(() => document.querySelector('.rangoc').innerText.replace(/\s+/g, ' '));
  ok(/Plata II\b/.test(t) && /180 puntos/.test(t) && /faltan 10 puntos para\s+Plata I\b/.test(t), '10 días + racha 10 + 10 rosarios = 180, Plata II: ' + t.replace(/\n/g, ' | ').slice(0, 160));
  ok(await p.$('.rangoc img.escudo') !== null, 'insignia del rango');
  // Ranking de grupos
  await A('grupo'); await A('gEjemplo', null, 1500); t = await SH(); ok(/Ranking de grupos/i.test(t) && /de 7 grupos/.test(t) && /Los de la parroquia \(tu grupo\)/.test(t), 'ranking de grupos con el mío: ' + t.slice(t.indexOf('Ranking de grupos'), t.indexOf('Ranking de grupos') + 400).replace(/\n/g, ' | '));
  ok(!/Ranking de la semana/.test(t) && (await p.$$('.podio')).length === 0, 'sin ranking interno'); ok((await p.$$('.grow .rgk img.escudo')).length === 5, 'insignia de rango en cada miembro');
  const rk = await p.evaluate(() => JSON.parse(localStorage.getItem('scaeli-daily-ranking') || '{}')); const mio = Object.entries(rk).find(([k]) => !k.startsWith('EJR'));
  ok(mio && mio[1].n === 'Los de la parroquia' && mio[1].m === 5 && typeof mio[1].pts === 'number' && mio[1].sem.length === 10 && Object.keys(mio[1]).sort().join() === 'm,n,pts,sem,t', 'mi grupo publica {n,sem,pts,m,t}: ' + JSON.stringify(mio && mio[1]));
  const pos = await p.evaluate(() => document.querySelector('.granq .gpos b').innerText); ok(/^\d\.º$/.test(pos), 'posición: ' + pos); await A('cerrar');
  await p.evaluate(() => window.DAILY.ir('hoy')); await p.waitForTimeout(400); t = await p.evaluate(() => document.querySelector('.grupoc').innerText); ok(/tu grupo va \d\.º de 7/.test(t), 'Hoy muestra el puesto del grupo');
  // Ropa deportiva
  await p.evaluate(() => window.DAILY.ir('yo')); await p.waitForTimeout(400); t = await p.evaluate(() => document.body.innerText); ok(/Deportiva/.test(t), 'opción Deportiva');
  await A('pjSet', 'prenda|deportiva', 600); st = await LS(); ok(st['daily_settings/profile'].prenda === 'deportiva', 'se elige Deportiva');
  const px = await p.evaluate(() => { const c = document.querySelector('#pjsec canvas.pj, canvas.pj'); const x = c.getContext('2d').getImageData(0, 0, 128, 128).data; let n = 0; for (let i = 3; i < x.length; i += 4) if (x[i]) n++; return n; }); ok(px > 1500, 'se dibuja el atleta: ' + px);
  await A('pjSet', 'sx|f', 600); t = await p.evaluate(() => document.body.innerText); ok(/\bDeportiva\b/.test(t) && !/próximamente/.test(t), 'para mujer también hay Deportiva (2.0.1)');
  await A('pjSet', 'prenda|deportiva', 600); st = await LS(); ok(st['daily_settings/profile'].prenda === 'deportiva' && st['daily_settings/profile'].sx === 'f', 'ella elige Deportiva');
  const pxf = await p.evaluate(() => { const c = document.querySelector('#pjsec canvas.pj, canvas.pj'); const x = c.getContext('2d').getImageData(0, 0, 128, 128).data; let n = 0; for (let i = 3; i < x.length; i += 4) if (x[i]) n++; return n; }); ok(pxf > 1500 && pxf !== px, 'se dibuja la atleta: ' + pxf);
  console.log('T30', errs.concat(fails).join('\n') || 'OK'); await b.close(); })();
