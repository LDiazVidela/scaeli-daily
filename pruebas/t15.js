const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor:2 }); const errs=[]; p.on('pageerror', e => errs.push('PAGEERROR '+e.message));
  p.on('console', m => { if(m.type()==='error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE '+m.text()); });
  const ok=(c,m)=>{ if(!c) errs.push('FALLA '+m); };
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1500); await p.click('#invitado'); await p.waitForTimeout(1500);
  const A = async (a, q, ms = 350) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const T = async () => (await p.textContent('#sheetIn') || '').replace(/\s+/g, ' ');
  const shot = async n => p.screenshot({path:n});
  // Biblia
  await p.click('#nav button[data-view="rezar"]').catch(()=>{}); await p.waitForTimeout(400); ok((await p.textContent('#app')).includes('La Biblia'),'cover biblia'); await shot('r_rezar.png');
  await A('biblia',null,900); ok((await T()).includes('Génesis')&&(await T()).includes('Apocalipsis'),'libros'); await shot('r_bib1.png');
  await A('bibLibro','John',900); ok((await T()).includes('21 capítulos'),'caps juan'); await shot('r_bib2.png');
  await A('bibIr','John|3',900); ok((await T()).includes('Porque así amó Dios al mundo'),'jn 3'); await shot('r_bib3.png');
  await A('bibVolver'); await p.fill('#bibQ','Sal 23'); await p.press('#bibQ','Enter'); await p.waitForTimeout(900); ok((await T()).includes('pastor'),'sal 23 -> 22 vulg'); await shot('r_bib4.png');
  await A('bibVolver'); await p.fill('#bibQ','1 Cor 13,4'); await p.press('#bibQ','Enter'); await p.waitForTimeout(900); ok((await T()).includes('La caridad')||(await T()).includes('El amor'),'1cor13'); 
  await A('bibVolver'); await p.fill('#bibQ','misericordia'); await p.press('#bibQ','Enter'); await p.waitForTimeout(9000); const tb=await T(); ok(/\d+ versículos|Más de 200/.test(tb),'busqueda palabra '+tb.slice(0,120)); await shot('r_bib5.png');
  await A('cerrar'); await A('biblia',null,500); ok((await T()).includes('Seguir leyendo'),'seguir leyendo');
  await A('cerrar');
  // Lectio
  await p.evaluate(()=>localStorage.setItem('daily_lecguia','1')); await A('lectio',null,600); ok(await p.evaluate(()=>document.querySelector('#sheet').classList.contains('full')),'lectio full'); await shot('r_lec0.png');
  for(let i=0;i<4;i++){ await A('lecPaso','1',300); if(i===0) await shot('r_lec1.png'); if(i===2){ await p.fill('#lecTxt','Gracias Señor'); await shot('r_lec3.png'); } }
  await shot('r_lec4.png'); ok((await T()).includes('Contemplar'),'contemplar'); await A('lecOk',null,600); ok(!(await p.evaluate(()=>document.body.classList.contains('enfoque'))),'sale de enfoque');
  // Examen
  await A('examen',null,500); ok(await p.evaluate(()=>document.querySelector('#sheet').classList.contains('full')),'examen full'); await shot('r_ex0.png');
  for(let i=0;i<4;i++) await A('exPaso','1',250); await A('exOk',null,600);
  // hoja confesion
  await A('exConf',null,500); await shot('r_h0.png'); await p.fill('#hojaU','dos meses'); await A('hojaPaso','1'); await A('hojaQ','0'); await A('hojaQ','2'); await p.fill('#hojaN','Me enojé con mi hermano'); await p.waitForTimeout(100); await shot('r_h1.png');
  for(let i=0;i<16;i++) await A('hojaPaso','1',150); ok((await T()).includes('Me enojé con mi hermano')&&(await T()).includes('dos meses'),'hoja contenido'); await shot('r_h2.png');
  const hl=await p.evaluate(()=>localStorage.getItem('daily_hoja')); ok(hl&&hl.includes('hermano'),'hoja local');
  const nube=await p.evaluate(()=>(()=>{const g=window.DAILY.get(); delete g.sheet; delete g.evHoy; return JSON.stringify(g).includes('hermano')||Object.keys(localStorage).some(k=>k!=='daily_hoja'&&String(localStorage.getItem(k)).includes('hermano'))})()); ok(!nube,'hoja no en cuenta');
  p.evaluate(()=>window.DAILY.ACC.hojaBorrar()); await p.waitForTimeout(400); await p.click('.dlg [data-r="0"]'); await p.waitForTimeout(400); ok(!(await p.evaluate(()=>localStorage.getItem('daily_hoja'))),'hoja borrada');
  await A('cerrar');
  // Horas
  await A('horaLH','laudes',2500); const th=await T(); ok(th.length>500&&/LAUDES|Laudes/.test(th),'laudes local '+th.slice(0,80)); await shot('r_lh.png');
  await A('cerrar');
  // novenas buscador
  await A('novenas',null,400); await p.fill('#novQ','brochero'); await p.waitForTimeout(300); ok((await T()).includes('Santo Cura Brochero'),'busca brochero'); await shot('r_nov.png');
  console.log('T15',errs.join('\n')||'OK'); await b.close(); })();
