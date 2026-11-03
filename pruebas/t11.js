const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await p.route(/gstatic\.com/, r => r.abort());
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1500);
  await p.click('#invitado'); await p.waitForTimeout(1800);
  const A = async (a, q, ms = 200) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const T = async () => (await p.textContent('#sheetIn') || '').replace(/\s+/g, ' ');
  const ok=(c,m)=>{ if(!c) errs.push('FALLA '+m); };
  for (const m of ['manana','mediodia','tarde','noche']) { await A('hora', m); ok((await T()).includes('Amén'),'hora '+m); await A('horaOk', {manana:'m',mediodia:'a',tarde:'ta',noche:'n'}[m]); }
  const d=await p.evaluate(()=>window.DAILY.get().days); const k=Object.keys(d)[0]; ok(d[k].m&&d[k].a&&d[k].ta&&d[k].n,'cuatro horas marcadas');
  await A('evangelio'); ok(/(Mt|Mc|Lc|Jn) \d/.test(await T()),'evangelio'); await A('evOk');
  await A('santo'); ok((await T()).includes('Pedile hoy'),'santo'); await A('santoOk');
  await A('rosario'); await A('rosEmpezar','gozosos'); let n=0; while(n<120 && await p.$('#sheetIn [data-a="rosAv"]')){ await A('rosAv',undefined,15); n++; } ok(n>70,'rosario pasos '+n);
  ok((await p.evaluate(()=>window.DAILY.get().days))[k].r,'rosario marcado');
  await A('horas'); await A('horaLH','laudes',5000); ok((await T()).length>500,'laudes'); await A('lhOk','laudes');
  await A('oraciones'); await A('oracion','2'); ok((await T()).includes('Amén'),'oracion');
  await A('novenas'); const nid = await p.$eval('#sheetIn [data-a="novena"]', e => e.dataset.p); await A('novena', nid); const nb=await p.$('#sheetIn [data-a="novOk"]'); if(nb){ await A('novOk', await nb.evaluate(e=>e.dataset.p),400); ok((await p.evaluate(()=>window.DAILY.get().novenas)).length>0,'novena'); }
  await A('examen'); for(let i=0;i<4;i++) await A('exPaso','1'); await A('exOk'); ok((await p.evaluate(()=>window.DAILY.get().days))[k].x,'examen');
  await A('confesion'); await A('confNinos','1'); await A('misa'); await A('misaOk');
  for (const v of ['hoy','rezar','dia','yo','mas']) { await p.click(`#nav button[data-view="${v}"]`); await p.waitForTimeout(300); }
  // personaje: todas las combinaciones sin errores
  await p.click('#nav button[data-view="yo"]');
  for (const sx of ['m','f']) { await A('pjSet','sx|'+sx); const pr=sx==='m'?['base','remera:azul','buzo:bordo','camisa:negro','sotana','clergyman','seminarista']:['base','remera:blanco','buzo:azul','pollera:bordo','consagrada','caridad','dominica','carmelita']; const pe=sx==='m'?['base','corto','largo']:['base','suelto','corto'];
    for (const a of pr) for (const c of pe) { await A('pjSet','prenda|'+a,60); await A('pjSet','peinado|'+c,60); for (const v of ['south']) { const blank=await p.evaluate(()=>{ const c=document.querySelector('.big canvas'); const d=c.getContext('2d').getImageData(0,0,128,128).data; let n=0; for(let i=3;i<d.length;i+=4) if(d[i]) n++; return n; }); ok(blank>1500,'pj vacío '+sx+a+c+v+' '+blank); } } }
  await A('pjSet','sx|m'); for(const a of ['barba','anteojos','cruz']) await A('pjSet','acc|'+a,80); ok(!(await p.textContent('#app')).includes('Accesorios'),'sin retoques UI'); ok(!(await p.textContent('#app')).includes('Espalda'),'solo de frente');
  // nuevo 1.2
  await A('evangelio'); await A('lectio'); ok((await T()).includes('Antes de empezar'),'guia lectio'); await A('lectio'); for(let i=0;i<4;i++) await A('lecPaso','1'); ok((await T()).includes('Contemplar'),'lectio'); await A('lecOk');
  await A('rosario'); await A('rosEmpezar','gozosos'); await A('rosAv'); await A('rosAv'); await A('rosSolo',undefined,400); ok(await p.$('#sheetIn .rtap.solo'),'solo contador'); await A('rosCero',undefined,300); ok((await T()).includes('¿Qué misterios'),'empezar de cero'); await A('rosSolo',undefined,300); await A('cerrar');
  await A('santoral'); await p.fill('#salQ','cayetano'); await p.waitForTimeout(300); ok((await T()).includes('Cayetano'),'buscar santo'); await A('salVer','08-07'); ok((await T()).includes('Pedile hoy'),'ficha santo'); await A('santoral'); ok(await p.$('#salQ'),'volver santoral'); await A('cerrar');
  await A('novenas'); console.log('novenas mes:', (await T()).slice(0,200)); await A('cerrar');
  console.log('S1'); await p.click('#nav button[data-view="dia"]'); await p.waitForTimeout(300); console.log('S2');
  await p.fill('form[data-f="habito"] input','No quejarme'); await p.press('form[data-f="habito"] input','Enter'); await p.waitForTimeout(300);
  console.log('S3'); const hid=await p.$eval('[data-a="habMas"]',e=>e.dataset.p); await A('habMas',hid); await A('habMas',hid); await A('deshacer'); await A('habEd',hid); await A('habAj',hid+'|m|1');
  const hb=(await p.evaluate(()=>window.DAILY.get().days))[k].hb[hid]; ok(hb.p===1&&hb.m===1,'habito '+JSON.stringify(hb));
  await p.fill('form[data-f="prop"] input[name="t"]','Llamar'); await p.fill('form[data-f="prop"] input[name="hr"]','18:30'); await p.click('form[data-f="prop"] button[type="submit"]'); await p.waitForTimeout(300);
  console.log('S4'); ok((await p.textContent('#app')).includes('18:30'),'tarea con hora');
  console.log('S5'); await A('calMes','1'); console.log('S6'); await A('calMes','-1'); console.log('S7'); await A('calDia',k); console.log('S8'); ok((await p.textContent('#app')).includes('Llamar'),'agenda del día');
  // exportar e importar
  await p.click('#nav button[data-view="mas"]');
  console.log('S9'); const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 5000 }).catch(() => null), A('exportar')]); console.log('S10'); ok(dl,'export');
  console.log(errs.join('\n') || 'TODO OK'); await b.close();
})().catch(e=>{console.log('EXC',e.message);process.exit(1)});
