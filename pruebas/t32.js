// t32 · Daily 2.0.2: ninguna ilustración se repite dentro de una misma pantalla y las grillas de portadas no dejan huecos
// (una tarjeta chica sola en su fila). Recorre las cinco secciones a la mañana, al mediodía, a la tarde y a la noche,
// sin grupo ni novena y con novena en curso y camino guiado (Scaeli+), en 360 y 390 px.
const { chromium } = require('playwright');
const HORAS = [7, 12, 17, 22];
(async () => { const b = await chromium.launch(); const errs = [], fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
  for (const W of [360, 390]) for (const H of HORAS) for (const extra of [0, 1, 2]) {
    const ctx = await b.newContext({ viewport: { width: W, height: 844 } }); const p = await ctx.newPage();
    p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    await p.addInitScript(([H]) => { const R = Date; const base = new R(); base.setHours(H, 10, 0, 0); const d0 = base.getTime() - R.now();
      class F extends R { constructor(...a) { if (a.length) super(...a); else super(R.now() + d0); } static now() { return R.now() + d0; } } window.Date = F; }, [H]);
    await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(800);
    await p.click('#invitado'); await p.waitForTimeout(900);
    if (extra) { await p.evaluate(() => { localStorage.setItem('daily_plus_prueba', '1'); const K = 'scaeli-daily-local'; const s = JSON.parse(localStorage.getItem(K) || '{}');
        const pad = n => String(n).padStart(2, '0'), d = new Date(), f = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
        s['daily_novenas/cristorey'] = { libre: 1, ult: f, d: { 1: 1 } }; s['daily_settings/rutina'] = { diarias: [{ id: 'd1', t: 'Leer' }], habitos: [{ id: 'h1', t: 'Rezar antes de comer' }] };
        localStorage.setItem(K, JSON.stringify(s)); }); await p.reload(); await p.waitForTimeout(1200); }
    if (extra === 2) { await p.evaluate(() => window.DAILY.ACC.fondoSet('noche')); await p.waitForTimeout(500); }   // el fondo de la noche a cualquier hora
    for (const v of ['hoy', 'rezar', 'dia', 'yo', 'mas']) {
      await p.evaluate(v => window.DAILY.ir(v), v); await p.waitForTimeout(500);
      const r = await p.evaluate(() => { const m = document.querySelector('#main') || document.body;
        // el selector de fondos (Yo, plegado) muestra todas las opciones a propósito: no cuenta
        const src = [...m.querySelectorAll('img')].filter(i => !i.closest('.fondos')).map(i => i.getAttribute('src') || '').filter(s => /assets\/ilus\//.test(s));
        const bg = [...m.querySelectorAll('*')].filter(e => !e.closest('.fondos')).map(e => (getComputedStyle(e).backgroundImage.match(/assets\/ilus\/[^")]+/) || [])[0]).filter(Boolean);
        const all = src.concat(bg).map(s => s.replace(/^.*assets/, 'assets')); const rep = all.filter((s, i) => all.indexOf(s) !== i);
        const huecos = [...m.querySelectorAll('.covers')].map(g => { const gw = g.getBoundingClientRect().width; const filas = {};
          [...g.children].forEach(c => { const r = c.getBoundingClientRect(); const k = Math.round(r.top); filas[k] = (filas[k] || 0) + r.width; });
          return Object.values(filas).filter(w => w < gw * 0.8).length; }).reduce((a, n) => a + n, 0);
        return { rep: [...new Set(rep)], huecos }; });
      ok(!r.rep.length, W + 'px ' + H + 'h ' + (['', 'con Scaeli+ ', 'con fondo de noche '][extra]) + v + ': imagen repetida ' + r.rep.join(', '));
      ok(!r.huecos, W + 'px ' + H + 'h ' + (['', 'con Scaeli+ ', 'con fondo de noche '][extra]) + v + ': ' + r.huecos + ' fila(s) con hueco en las portadas');
    }
    await ctx.close(); }
  console.log('T32', [...new Set(errs.concat(fails))].join('\n') || 'OK'); await b.close(); })();
