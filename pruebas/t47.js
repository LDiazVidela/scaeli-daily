// t47 · Daily 2.11: recordatorios que llegan con la app cerrada (Evangelio, Laudes, Ángelus, Vísperas, Completas, cada uno con su hora),
// avisos de los mensajes del grupo, el paso de los recordatorios viejos, abrir lo de cada aviso, iPhone sin instalar y la app de Android.
// El servidor (avisos/worker.js) tiene sus propias pruebas: avisos/prueba.mjs.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => { const b = await chromium.launch(); const errs = [], fails = []; const ok = (c, m) => { if (process.env.V) console.log((c ? '  ok ' : '  XX ') + m); if (!c) fails.push('FALLA ' + m); };
  const nueva = async (ua) => { const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, ...(ua ? { userAgent: ua } : {}), serviceWorkers: 'block' })).newPage();
    p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); }); return p; };
  const LS = p => p.evaluate(() => JSON.parse(localStorage.getItem('scaeli-daily-local') || '{}'));
  const sembrar = (p, rec) => p.evaluate(r => { const K = 'scaeli-daily-local'; const st = JSON.parse(localStorage.getItem(K) || '{}'); st['daily_settings/recordatorios'] = r; localStorage.setItem(K, JSON.stringify(st)); localStorage.setItem('daily_invitado', '1'); }, rec);
  const R = 'http://localhost:8765/index.html';

  // 1) Ajustes: cada recordatorio con su hora y su interruptor, y los mensajes del grupo
  let p = await nueva(); await p.goto(R); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900); await p.click('#invitado'); await p.waitForTimeout(1200);
  await p.evaluate(() => window.DAILY.ir('mas')); await p.waitForTimeout(400);
  let t = await p.evaluate(() => document.querySelector('.recc').textContent);
  const filas = await p.$$eval('.recc .recit', L => L.map(x => [x.querySelector('b').textContent, x.querySelector('input[type=time]').value, x.querySelector('.swt').dataset.p, x.querySelector('.swt').getAttribute('aria-checked')]));
  ok(filas.map(x => x[0]).join() === 'Evangelio del día,Laudes,Ángelus,Vísperas,Completas', 'cinco recordatorios: ' + filas.map(x => x[0]).join());
  ok(filas.map(x => x[1]).join() === '07:00,07:30,12:00,19:00,22:30' && filas.map(x => x[3]).join() === 'true,false,false,false,false', 'horas por defecto; el Evangelio viene elegido');
  ok(/Mensajes del grupo/.test(t) && await p.$('.recc .swt[data-a="recGr"][aria-checked="true"]') && /Entrá con tu cuenta para recibirlos con la app cerrada/.test(t), 'mensajes del grupo (prendido) y, sin cuenta, el aviso de que hace falta entrar');
  ok(/Llegan aunque la app esté cerrada/.test(t) && !/mientras la app está abierta/.test(t) && !(await p.$('.recc .recprueba')), 'ya no dice «mientras la app está abierta»; sin servidor no ofrece la prueba');
  await p.click('.swt[data-a="recTipo"][data-p="vis"]'); await p.waitForTimeout(400);
  await p.fill('input[data-rec="ev"]', '06:45'); await p.dispatchEvent('input[data-rec="ev"]', 'change'); await p.waitForTimeout(400);
  await p.click('.swt[data-a="recGr"]'); await p.waitForTimeout(400);
  let r = (await LS(p))['daily_settings/recordatorios'];
  ok(r && r.v === 2 && r.vis.on === true && r.vis.h === '19:00' && r.ev.h === '06:45' && r.ev.on === true && r.gr === false, 'se guardan el interruptor, la hora y los mensajes del grupo: ' + JSON.stringify(r));
  await p.click('.swt[data-a="recTipo"][data-p="lau"]'); await p.waitForTimeout(400); t = await p.evaluate(() => document.body.textContent);
  ok(/Prendé «Avisos» para que te lleguen/.test(t), 'si los avisos están apagados, lo dice');
  ok(await p.evaluate(() => { const e = document.querySelector('.recit input[type=time]'), s = e.getBoundingClientRect(), f = e.closest('.row').getBoundingClientRect(); return s.right <= f.right && s.height >= 36; }), 'la hora entra en la fila');
  await p.close();

  // 2) recordatorios de antes (hasta 2.10): mañana → Laudes, noche → Completas, Ángelus igual
  p = await nueva(); await p.goto(R); await p.evaluate(() => localStorage.clear()); await sembrar(p, { on: true, m: '07:15', n: '21:45', ang: true }); await p.reload(); await p.waitForTimeout(1500);
  await p.evaluate(() => window.DAILY.ir('mas')); await p.waitForTimeout(400);
  const v = await p.$$eval('.recc .recit', L => Object.fromEntries(L.map(x => [x.querySelector('.swt').dataset.p, x.querySelector('input').value + (x.querySelector('.swt').getAttribute('aria-checked') === 'true' ? '+' : '-')])));
  ok(v.lau === '07:15+' && v.com === '21:45+' && v.ang === '12:00+' && v.ev === '07:00+' && v.vis === '19:00-', 'los avisos de antes siguen: ' + JSON.stringify(v));
  await p.close();

  // 3) tocar un aviso abre lo suyo
  for (const [q, chk, msg] of [['?abrir=evangelio', s => s && s.view === 'evangelio', 'Evangelio'], ['?abrir=horas&h=laudes', s => s && s.view === 'hora_lh' && s.p === 'laudes', 'Laudes'], ['?abrir=horas&h=completas', s => s && s.view === 'hora_lh' && s.p === 'completas', 'Completas'], ['?abrir=angelus', s => s && s.view === 'hora' && s.p === 'mediodia', 'Ángelus']]) {
    p = await nueva(); await p.goto(R); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('daily_invitado', '1'); }); await p.goto(R + q); await p.waitForTimeout(1600);
    const s = await p.evaluate(() => window.DAILY.get().sheet); ok(chk(s) && await p.evaluate(() => location.search === ''), 'el aviso del ' + msg + ' abre ' + msg + ' (y limpia la dirección)'); await p.close(); }
  p = await nueva(); await p.goto(R); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('daily_invitado', '1'); }); await p.goto(R + '?abrir=horas&h=<script>'); await p.waitForTimeout(1500);
  ok((await p.evaluate(() => window.DAILY.get().sheet || {})).view === 'horas', 'una Hora desconocida abre la lista de las Horas'); await p.close();

  // 4) iPhone sin instalar: explica cómo agregarla a la pantalla de inicio
  p = await nueva('Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1');
  await p.goto(R); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900); await p.click('#invitado'); await p.waitForTimeout(1200);
  await p.evaluate(() => window.DAILY.ir('mas')); await p.waitForTimeout(400); t = await p.evaluate(() => document.querySelector('.recc').textContent);
  ok(/Compartir y después «Agregar a inicio»/.test(t) && /primero agregá Scaeli a la pantalla de inicio/.test(t), 'iPhone en Safari: explica Compartir → Agregar a inicio');
  await p.click('.swt[data-a="recOn"]'); await p.waitForTimeout(400); t = await p.evaluate(() => document.body.textContent);
  ok(/Agregar a inicio/.test(t) && !((await LS(p))['daily_settings/recordatorios'] || {}).on, 'y no prende avisos que no pueden llegar'); await p.close();

  // 5) la app de Android programa en el teléfono los mismos cinco
  p = await nueva(); await p.goto(R); await p.waitForTimeout(600);
  const prog = await p.evaluate(async () => { const L = []; window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', Plugins: { LocalNotifications: {
      checkPermissions: async () => ({ display: 'granted' }), requestPermissions: async () => ({ display: 'granted' }), getPending: async () => ({ notifications: [] }), cancel: async () => {}, schedule: async (x) => { L.push(...x.notifications); } } } };
    const N = await import('./js/nativo.js'); await N.programarAvisosNativos({ v: 2, on: true, ev: { on: true, h: '06:30' }, lau: { on: false, h: '07:30' }, ang: { on: true, h: '12:00' }, vis: { on: true, h: '19:15' }, com: { on: false, h: '22:30' } }, []);
    delete window.Capacitor; return L.map(n => n.title + ' ' + n.schedule.on.hour + ':' + n.schedule.on.minute); });
  ok(prog.join() === 'Evangelio del día 6:30,Ángelus 12:0,Vísperas 19:15', 'Android: los elegidos, a su hora: ' + prog.join()); await p.close();

  // 6) el service worker y la configuración
  const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8'), pg = fs.readFileSync(path.join(__dirname, '..', '.github', 'workflows', 'pages.yml'), 'utf8'), wf = fs.readFileSync(path.join(__dirname, '..', '.github', 'workflows', 'avisos.yml'), 'utf8');
  ok(/"\.\/js\/avisos-url\.js"/.test(sw) && /renotify/.test(sw) && /notificationclick/.test(sw), 'service worker: guarda avisos-url.js y vuelve a sonar con avisos del mismo grupo');
  ok(/--exclude avisos/.test(pg) && /wrangler-action/.test(wf) && /FIREBASE_SA/.test(wf) && /avisos-url\.js/.test(wf), 'el servidor no se publica en el sitio; lo despliega su propio workflow');
  ok(/export const AVISOS_URL = "(https:\/\/[\w.-]+\.workers\.dev)?";/.test(fs.readFileSync(path.join(__dirname, '..', 'js', 'avisos-url.js'), 'utf8')), 'avisos-url.js con la dirección del servidor (o vacía hasta desplegarlo)');
  ok(/servidor de avisos/.test(fs.readFileSync(path.join(__dirname, '..', 'privacidad.html'), 'utf8')) && /Cloudflare/.test(fs.readFileSync(path.join(__dirname, '..', 'privacidad.html'), 'utf8')), 'la privacidad cuenta el servidor de avisos');

  console.log(errs.concat(fails).join('\n') || 'T47 OK'); await b.close(); process.exit(errs.length || fails.length ? 1 : 0); })();
