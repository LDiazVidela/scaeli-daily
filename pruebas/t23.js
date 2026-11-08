// rosario nuevo: elegir misterios, varios por día, estética
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs=[]; const ok=(c,m)=>{ if(!c) errs.push('FALLA '+m); };
  const ctx=await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2 }); const p=await ctx.newPage(); await p.clock.setFixedTime(new Date('2026-10-31T10:00:00-03:00'));
  p.on('pageerror', e => errs.push('PAGEERROR '+e.message)); p.on('console', m=>{ if(m.type()==='error'&&!/Failed to load resource/.test(m.text())) errs.push('CONSOLE '+m.text()); });
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1500); await p.click('#invitado'); await p.waitForTimeout(1500);
  const A = async (a, q, ms = 350) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  await A('rosario',null,600); let t=await p.textContent('#sheet'); ok(t.includes('¿Qué misterios querés rezar?')&&t.includes('Los de hoy'),'intro'); await p.screenshot({path:'r_in.png'});
  await A('rosElegir','luminosos'); ok((await p.textContent('#sheet')).includes('El Bautismo de Jesús')||(await p.textContent('#sheet')).includes('Bautismo'),'lista luminosos');
  await p.click('[data-a="rosEmpezar"]'); await p.waitForTimeout(500); ok((await p.textContent('#sheet')).includes('Credo de los Apóstoles'),'empieza con el Credo'); await A('rosIrMis'); t=await p.textContent('#sheet'); ok(t.includes('1.er misterio luminoso'),'anuncio luminoso '+t.slice(0,200)); await p.screenshot({path:'r_an.png'});
  await A('rosAv'); await p.screenshot({path:'r_padre.png'}); await A('rosAv'); for(let i=0;i<6;i++) await A('rosAv',null,120); await p.screenshot({path:'r_ave.png'}); ok((await p.textContent('#sheet')).includes('de 10'),'ave');
  // terminar todo
  let g=0; while(g++<120){ const v=await p.evaluate(()=>window.DAILY.get().sheet&&window.DAILY.get().sheet.view); if(v!=='rosario') break; const f=await p.evaluate(()=>window.DAILY.get().rosario&&window.DAILY.get().rosario.fase); if(f==='salve'&&!(await p.$('.shot_salve'))){ await p.screenshot({path:'r_salve.png'}); } await A('rosAv',null,60); }
  ok(g<120,'termina');
  await A('rosario',null,500); t=await p.textContent('#sheet'); ok(t.includes('Hoy rezaste 1 Rosario'),'cuenta 1');
  await A('rosElegir','dolorosos'); await A('rosEmpezar','dolorosos'); g=0; while(g++<120){ const v=await p.evaluate(()=>window.DAILY.get().sheet&&window.DAILY.get().sheet.view); if(v!=='rosario') break; await A('rosAv',null,40); }
  await A('rosario',null,500); ok((await p.textContent('#sheet')).includes('Hoy rezaste 2 Rosarios'),'cuenta 2');
  // atrás desde el primer anuncio vuelve a elegir
  await A('rosEmpezar','gloriosos'); await A('rosAtras'); ok((await p.textContent('#sheet')).includes('¿Qué misterios'),'atras a intro');
  await A('pjSet','alt|media'); await A('donarVer',null,500); t=await p.textContent('#sheet'); ok(!/Una vela|Un Rosario|Una misión/.test(t),'donar sin nombres'); await p.screenshot({path:'r_don.png'});
  console.log('T23',errs.join('\n')||'OK'); await b.close(); })();
