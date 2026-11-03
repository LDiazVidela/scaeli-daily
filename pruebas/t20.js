// novenas de Catholic.net
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs=[]; const ok=(c,m)=>{ if(!c) errs.push('FALLA '+m); };
  const ctx=await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2 }); const p=await ctx.newPage(); await p.clock.setFixedTime(new Date('2026-03-14T10:00:00-03:00'));
  p.on('pageerror', e => errs.push('PAGEERROR '+e.message)); p.on('console', m=>{ if(m.type()==='error'&&!/Failed to load resource/.test(m.text())) errs.push('CONSOLE '+m.text()); });
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1500); await p.click('#invitado'); await p.waitForTimeout(1500);
  const A = async (a, q, ms = 500) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  await A('novenas',null,600); const t=await p.textContent('#sheet'); ok(t.includes('87 novenas'),'87'); ok(t.includes('En curso')&&t.includes('San José'),'san jose en curso (14/3)');
  await p.screenshot({path:'nv_lista.png'});
  await A('novena','jose',1200); const tj=await p.textContent('#sheet'); ok(tj.includes('hoy es el día 5 de 9'),'dia 5 '+tj.slice(0,200)); ok(tj.includes('Para todos los días'),'todos'); ok(tj.includes('Catholic.net'),'fuente');
  ok(/5o?\.? ?D[ií]a/i.test(tj),'texto día 5');
  await p.screenshot({path:'nv_jose.png'}); await p.evaluate(()=>{ document.querySelector('#sheet .scroll').scrollTop=600; }); await p.waitForTimeout(150); await p.screenshot({path:'nv_jose2.png'});
  await A('novOk','jose|5',700); await A('novena','jose',800); ok((await p.textContent('#sheet')).includes('Hoy ya rezada'),'marcado');
  await A('novVer','2',400); ok((await p.textContent('#sheet')).includes('estás viendo el día 2'),'ver otro dia');
  // todas abren y tienen texto
  const ids=await p.evaluate(async()=>{ const m=await import('/data/novenas.js'); return m.NOVENAS.map(x=>[x.id,x.d]); });
  for(const [id,d] of ids){ const r=await p.evaluate(async(id)=>{ const j=await (await fetch('/novenas/'+id+'.json')).json(); return [j.intro.length,j.dias.length,j.dias.map(x=>x.length)]; },id);
    ok(r[1]===0||r[1]===d,'dias '+id+' '+r[1]); ok(r[0]+r[2].reduce((a,b)=>a+b,0)>1500,'texto corto '+id); }
  // decenario y movil
  await A('novena','espiritudecenario',900); const te=await p.textContent('#sheet'); ok(te.includes('diez días')||te.includes('Día 10'),'decenario');
  await A('novena','graciafranciscojavier',900); await p.screenshot({path:'nv_unica.png'}); ok(!(await p.$('.chips.novdias')),'sin dias');
  await A('novEmpezar','lorenzo',500); await A('novena','lorenzo',900); ok((await p.textContent('#sheet')).includes('La empezaste vos · hoy es el día 1 de 9'),'libre');
  console.log('T20',errs.join('\n')||'OK'); await b.close(); })();
