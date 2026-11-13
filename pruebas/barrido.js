// Barrido estético: abre todas las vistas y paneles en 360 y 390 px (oscuro y claro), saca capturas de página entera
// y detecta problemas: desborde horizontal, elementos que se pisan dentro de una fila, texto cortado sin «…», cosas fuera de pantalla.
// Uso: node pruebas/barrido.js [carpeta-salida]   (con el servidor en :8765)
const { chromium } = require('playwright');
const out = process.argv[2] || 'barrido'; require('fs').mkdirSync(out, { recursive: true });
const SHEETS = [['hora',{p:'manana'}],['evangelio',{}],['rosario',{}],['horas',{}],['oraciones',{}],['oracion',{p:0}],['novenas',{}],['novena',{p:'jose'}],['examen',{ex:{p:0,no:[],prop:'',gracias:''},full:1}],['confesion',{}],['misa',{}],['santo',{}],['santoral',{}],['lectioGuia',{}],['lectio',{lp:0,full:1}],['exConf',{p:0,h:{m:{},n:{},u:''},full:1}],['biblia',{}],['progreso',{}],['camino',{}],['grupo',{}],['biblioteca',{a:'',v:''}],['libros',{}],['libro',{p:'moradas'}],['orar',{p:'m',full:1}],['misOraciones',{}],['plus',{}],['donar',{}],['borrar',{}],['palabra',{}],['album',{}],['sobre',{full:1,sale:['miguel','kolbe','ceferino'],nuevas:['miguel']}],['sobre',{full:1,abierto:1,sale:['miguel','kolbe','ceferino'],nuevas:['miguel']}],['figu',{p:'virgenmaria'}],['diploma',{full:1}]];
(async () => {
  const b = await chromium.launch(); const informe = [];
  for (const [W, H, tema] of [[360, 740, 'dark'], [390, 844, 'dark'], [390, 844, 'light']]) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);
    if (W === 360 && tema === 'dark') await p.screenshot({ path: `${out}/${W}${tema[0]}_login.png` });
    await p.click('#invitado'); await p.waitForTimeout(1000);
    await p.evaluate((tema) => { const pad = n => String(n).padStart(2, '0'); const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
      const K = 'scaeli-daily-local'; const st = JSON.parse(localStorage.getItem(K) || '{}');
      st['daily_settings/rutina'] = { diarias: [{ id: 'd1', t: 'Leer diez minutos de un libro espiritual' }, { id: 'd2', t: 'Rezar el Ángelus al mediodía' }], habitos: [{ id: 'h1', t: 'Rezar antes de comer', v: 'templanza' }, { id: 'h2', t: 'Ayudar en casa sin que me lo pidan', v: 'caridad' }] };
      st['daily_settings/profile'] = { nombre: 'Lorenzo', sx: 'm', prenda: 'buzo:bordo', peinado: 'corto', tema };
      st['daily_settings/propositos'] = { list: [{ id: 'p1', t: 'Llamar a la abuela', f: iso(new Date()), hr: '18:30', d: iso(new Date()) }, { id: 'p2', t: 'Confesarme antes del domingo, en la parroquia de siempre', f: iso(new Date(Date.now() + 3 * 864e5)), d: iso(new Date()) }] };
      st['daily_settings/intents'] = { list: ['Por mi familia', 'Por los enfermos de la parroquia'] };
      for (let i = 0; i < 40; i++) { const d = new Date(); d.setDate(d.getDate() - i); if (i % 9 === 4) continue; st['daily_days/' + iso(d)] = { m: 1, e: i % 2 ? 1 : 0, r: i % 3 ? 1 : 0, rn: 1, x: i % 4 ? 1 : 0, n: 1, dd: { d1: i < 5 ? 1 : 0 }, hb: { h1: { p: i < 12 ? 2 : 0 }, h2: { p: i % 2 } }, or: { m: 'Señor, gracias por este día ' + i, n: '' }, t: Date.now() }; }
      localStorage.setItem(K, JSON.stringify(st)); localStorage.setItem('daily_plus_prueba', '1'); }, tema);
    await p.reload(); await p.waitForTimeout(1300);
    await p.evaluate(t => { document.documentElement.dataset.theme = t; }, tema);
    const revisar = async (nombre) => {
      const r = await p.evaluate(() => {
        const W = innerWidth, prob = []; const vis = e => { const s = getComputedStyle(e); const r = e.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0; };
        const desc = e => (e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '') + ' «' + (e.innerText || e.value || e.placeholder || '').trim().slice(0, 30) + '»');
        const root = document.querySelector('#sheet:not([hidden])') || document.querySelector('#app');
        const all = [...root.querySelectorAll('*')].filter(vis);
        if (document.documentElement.scrollWidth > W + 1) prob.push('PÁGINA más ancha que la pantalla: ' + document.documentElement.scrollWidth);
        for (const e of all) { const r = e.getBoundingClientRect(); if (r.right > W + 1 && !e.closest('.chips,.bfil,.insrow,.fondos,.hscroll,[style*="overflow-x"]')) { const c = e.closest('[class]'); const s = getComputedStyle(e.parentElement); if (s.overflowX === 'visible') prob.push('SALE por la derecha (' + Math.round(r.right - W) + 'px): ' + desc(e)); } }
        for (const e of all) { if (!['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'LABEL'].includes(e.tagName)) continue; const r = e.getBoundingClientRect();
          for (const s of [...e.parentElement.children]) { if (s === e || !vis(s) || s.contains(e) || e.contains(s)) continue; const q = s.getBoundingClientRect();
            const ix = Math.min(r.right, q.right) - Math.max(r.left, q.left), iy = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
            if (ix > 2 && iy > 2 && getComputedStyle(s).position !== 'absolute' && getComputedStyle(e).position !== 'absolute') prob.push('SE PISAN: ' + desc(e) + ' con ' + desc(s)); } }
        for (const e of all) { const s = getComputedStyle(e); if ((s.overflow === 'hidden' || s.overflowX === 'hidden') && s.textOverflow !== 'ellipsis' && e.scrollWidth > e.clientWidth + 2 && e.children.length === 0 && (e.innerText || '').trim()) prob.push('TEXTO CORTADO: ' + desc(e)); }
        for (const e of all) { if (!e.children.length && (e.innerText || '').trim()) { const r = e.getBoundingClientRect(); const pr = e.parentElement.getBoundingClientRect(); if (r.left < -1) prob.push('SALE por la izquierda: ' + desc(e)); } }
        // sistema de botones (2.0): principal 54 px, de fila e ícono 44 px; los de fila de una misma tarjeta, del mismo ancho
        for (const e of root.querySelectorAll('button.primary, .ghost, .iconbtn')) { if (!vis(e) || e.closest('.hero2,.lhnow,.cov,.chips,.seg')) continue; const h = Math.round(e.getBoundingClientRect().height);
          const grande = e.classList.contains('primary') || e.matches('.sheet .in>.grid2>button, .dlgc .grid2>button'); const ok = grande ? (h >= 53 && h <= 55) : (h >= 43 && h <= 45); if (!ok) prob.push('BOTÓN fuera de medida (' + h + 'px): ' + desc(e)); }
        for (const card of root.querySelectorAll('.card.list')) { const W = [...card.querySelectorAll(':scope>.row>.ghost, :scope>.row>a.ghost')].filter(vis).map(e => Math.round(e.getBoundingClientRect().width)); if (W.length > 1 && Math.max(...W) - Math.min(...W) > 2) prob.push('BOTONES DE FILA de distinto ancho: ' + W.join(', ')); }
        return [...new Set(prob)].slice(0, 25);
      });
      if (r.length) informe.push(`## ${W}${tema[0]} ${nombre}\n` + r.map(x => '- ' + x).join('\n'));
    };
    for (const v of ['hoy', 'dia', 'rezar', 'yo', 'mas']) { await p.evaluate(v => window.DAILY.ir(v), v); await p.waitForTimeout(500); await p.screenshot({ path: `${out}/${W}${tema[0]}_v_${v}.png`, fullPage: true }); await revisar('vista ' + v); }
    for (const [view, extra] of SHEETS) { try { await p.evaluate(([view, extra]) => window.DAILY.openSheet({ view, ...extra }), [view, extra]); await p.waitForTimeout(view === 'libro' || view === 'biblia' || view === 'novena' ? 1200 : 600);
        await p.screenshot({ path: `${out}/${W}${tema[0]}_s_${view}.png` });
        const largo = await p.evaluate(() => { const s = document.querySelector('#sheet .scroll, #sheet .fcuerpo'); return s ? s.scrollHeight : 0; });
        if (largo > 900) { await p.evaluate(() => { const s = document.querySelector('#sheet .scroll, #sheet .fcuerpo'); s.scrollTop = s.scrollHeight; }); await p.waitForTimeout(200); await p.screenshot({ path: `${out}/${W}${tema[0]}_s_${view}_fin.png` }); }
        await revisar('panel ' + view); await p.evaluate(() => window.DAILY.closeSheet()); await p.waitForTimeout(200); } catch (e) { informe.push(`## ${W} ${view}: ERROR ${e.message.slice(0, 120)}`); } }
    if (errs.length) informe.push(`## ${W}${tema[0]} ERRORES JS\n` + errs.map(x => '- ' + x).join('\n'));
    await ctx.close();
  }
  require('fs').writeFileSync(`${out}/informe.md`, informe.join('\n\n') || 'SIN PROBLEMAS');
  console.log(informe.length ? informe.join('\n\n') : 'BARRIDO OK'); await b.close();
})();
