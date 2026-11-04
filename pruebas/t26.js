// t26 · Daily 1.9: latín (lista, oración, extras, rosario), biblioteca adultos, muro del grupo (escribir, recordatorio, amén, reportar, borrar, límite, filtro), portada, aviso en Hoy, pie estático, sin emoji en el rosario
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs=[], fails=[]; const ok=(c,m)=>{ if(!c) fails.push(m); };
  const ctx=await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2 }); const p=await ctx.newPage();
  p.on('pageerror', e => errs.push('PAGEERROR '+e.message)); p.on('console', m => { if(m.type()==='error'&&!/Failed to load resource/.test(m.text())) errs.push('CONSOLE '+m.text()); });
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1200); await p.click('#invitado'); await p.waitForTimeout(1200);
  const A = async (a, q, ms = 400) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const T = async () => p.evaluate(()=>document.body.innerText);
  const SH = async () => p.evaluate(()=>document.querySelector('#sheet').innerText);
  // 1 · oraciones en latín
  await p.evaluate(()=>window.DAILY.ir('rezar')); await p.waitForTimeout(300); await A('oraciones'); let t=await SH();
  ok(/Padrenuestro/.test(t)&&/Magníficat/.test(t)&&/Te Deum/.test(t)&&/Acordaos/.test(t),'lista con las 23 oraciones (15 + 8 extra)');
  ok(!/Pater noster, qui/.test(t),'lista en español por defecto');
  await A('oraLat',1); t=await SH(); ok(/Pater Noster/.test(t)&&/Magnificat/.test(t)&&/Memorare/.test(t),'títulos en latín al cambiar');
  await A('oracion',1); t=await SH(); ok(/Pater noster, qui es in c/.test(t)&&!/Padre nuestro, que est/.test(t),'Padrenuestro en latín');
  ok(await p.$('.pray .q.lat')!==null,'clase lat en el texto');
  await A('oraLat',0); t=await SH(); ok(/Padre nuestro, que est/.test(t),'vuelve al español');
  await A('oraciones'); await A('oracion',15); t=await SH(); ok(/Proclama mi alma/.test(t),'Magníficat en español'); await A('oraLat',1); t=await SH(); ok(/Magníficat ánima mea/.test(t),'Magníficat en latín');
  await A('oracion',22); t=await SH(); ok(/Te Deum laud/.test(t),'Te Deum en latín'); await A('cerrar');
  // 2 · rosario en latín y sin emoji
  await A('rosario',null,600); await A('rosAv'); await A('rosAv'); t=await SH(); ok(/Padre nuestro, que est/.test(t)&&/Padrenuestro/i.test(t),'rosario: Padrenuestro en español');
  ok(!/✝|✦/.test(t),'sin emoji de cruz en el anillo'); ok(await p.$('.acentro svg.i')!==null,'ícono SVG en el centro del anillo');
  await A('rosLat',null,500); t=await SH(); ok(/Pater noster, qui/.test(t)&&/Pater noster/i.test(t)&&/En español/.test(t),'rosario en latín + botón «En español»');
  await A('rosAv'); t=await SH(); ok(/Ave María, grátia plena/.test(t)&&/Ave Maria/i.test(t),'Avemaría en latín, etiqueta Ave Maria');
  for(let i=0;i<10;i++) await A('rosAv',null,80); t=await SH(); ok(/Glória Patri/.test(t)&&/O mi Iesu/.test(t),'Gloria y jaculatoria de Fátima en latín');
  const prof=await p.evaluate(()=>JSON.parse(localStorage.getItem('scaeli-daily-local'))['daily_settings/profile']); ok(prof&&prof.rosLat===true,'rosLat guardado en el perfil');
  await A('rosLat',null,400); t=await SH(); ok(/Gloria al Padre/.test(t)&&/Oh, Jesús mío/.test(t),'vuelve al español');
  await A('cerrar',null,300); await p.click('.dlg button.primary'); await p.waitForTimeout(400);
  // 3 · biblioteca: adultos
  await p.evaluate(()=>window.DAILY.ir('dia')); await p.waitForTimeout(300); await A('biblioteca'); t=await SH();
  const nTodos=(t.match(/Agregar/g)||[]).length; ok(nTodos>=120,'biblioteca con 120+ hábitos: '+nTodos); ok(/Matrimonio/.test(t)&&/Hijos/.test(t)&&/Parroquia/.test(t)&&/Dinero/.test(t),'áreas nuevas');
  await A('bibliFiltro','g|a'); t=await SH(); const nA=(t.match(/Agregar/g)||[]).length; ok(nA<nTodos&&nA>=100&&/Rezar Laudes/.test(t)&&!/Jugar con mis hermanos/.test(t),'filtro adultos: '+nA);
  await A('bibliFiltro','g|j'); t=await SH(); const nJ=(t.match(/Agregar/g)||[]).length; ok(nJ<nTodos&&/Jugar con mis hermanos/.test(t)&&!/Rezar Laudes/.test(t),'filtro jóvenes: '+nJ);
  await A('bibliFiltro','g|'); await A('bibliFiltro','a|matrimonio'); t=await SH(); ok(/Rezar juntos antes de dormir/.test(t)&&!/Jugar con mis hermanos/.test(t),'área matrimonio');
  await A('bibliFiltro','g|'); await A('bibliFiltro','a|hijos'); t=await SH(); ok(/Bendecir a mis hijos/.test(t),'área hijos');
  await p.click('.bibli .brow button'); await p.waitForTimeout(400); t=await SH(); ok(/Ya está en tu día/.test(await p.evaluate(()=>document.querySelector('#sheet').innerHTML)),'agregar desde adultos'); await A('cerrar');
  // 4 · grupo de ejemplo: muro
  await p.evaluate(()=>window.DAILY.ir('hoy')); await p.waitForTimeout(300); await A('grupo'); await A('gEjemplo',null,900); t=await SH();
  ok(/Muro del grupo/i.test(t)&&/No se olviden de rezar el Evangelio hoy/.test(t)&&/Recé la decena por todos/.test(t),'muro con los mensajes de ejemplo');
  ok(/Amén · 2/.test(t),'contador de amén');
  await p.fill('form[data-f=muro] input','Hola grupo, rezo por ustedes'); await p.press('form[data-f=muro] input','Enter'); await p.waitForTimeout(500); t=await SH(); ok(/Hola grupo, rezo por ustedes/.test(t)&&/Peregrino/.test(t),'mensaje propio publicado con mi nombre');
  await p.fill('form[data-f=muro] input','otro ya'); await p.press('form[data-f=muro] input','Enter'); await p.waitForTimeout(400); t=await SH(); ok(!/otro ya/.test(t),'anti-spam: 15 s entre mensajes');
  await p.fill('form[data-f=muro] input','sos un pelotudo'); await p.press('form[data-f=muro] input','Enter'); await p.waitForTimeout(400); t=await SH(); ok(!/pelotudo/.test(t),'filtro de palabras');
  await A('mRec'); t=await SH(); ok(/Mañana es domingo/.test(t)&&/Acuérdense del examen/.test(t),'recordatorios listos'); await A('mRecOk',3,500); t=await SH(); ok(/Mañana es domingo: ¿vamos a Misa\?/.test(t)&&(await p.$$('.msg.rec')).length>=2,'recordatorio publicado como mensaje destacado');
  await A('mAmen','e2'); t=await SH(); ok(/Amén · 3/.test(t),'amén suma'); await A('mAmen','e2'); t=await SH(); ok(/Amén · 2/.test(t)&&!/Amén · 3/.test(t),'amén se saca');
  let st=await p.evaluate(()=>JSON.parse(localStorage.getItem('scaeli-daily-grupos'))); let g=Object.values(st)[0]; ok(g.muro.length===5,'5 mensajes guardados: '+g.muro.length);
  await A('mBorrar','e3'); t=await SH(); ok(!/Buen día grupo, hoy ofrezco/.test(t),'creador borra un mensaje ajeno');
  // reportar: lo oculto para mí
  await p.evaluate(()=>{ const K='scaeli-daily-grupos'; const st=JSON.parse(localStorage.getItem(K)); const g=Object.values(st)[0]; g.muro.push({id:'x1',u:'ej1',n:'Clari',tx:'mensaje feo',t:Date.now()-5000}); localStorage.setItem(K,JSON.stringify(st)); });
  await p.reload(); await p.waitForTimeout(1500); await A('grupo',null,800); t=await SH(); ok(/mensaje feo/.test(t),'mensaje visible antes de reportar');
  await A('mReportar','x1'); t=await SH(); ok(!/mensaje feo/.test(t),'reportado se oculta');
  // límite 100 (local)
  await p.evaluate(()=>{ const K='scaeli-daily-grupos'; const st=JSON.parse(localStorage.getItem(K)); const g=Object.values(st)[0]; for(let i=0;i<120;i++) g.muro.push({id:'z'+i,u:'ej2',n:'Mateo',tx:'msg '+i,t:Date.now()-1e6-i}); localStorage.setItem(K,JSON.stringify(st)); });
  await p.reload(); await p.waitForTimeout(1500); await A('grupo',null,800); t=await SH(); ok(/Ver más/.test(t),'botón Ver más'); await A('mMas'); t=await SH(); ok((t.match(/Amén/g)||[]).length>=30,'ver más muestra más');
  // 5 · portada
  ok(await p.$('.gport')!==null,'botón de portada para el creador');
  await p.setInputFiles('#gPortada',{name:'f.png',mimeType:'image/png',buffer:require('fs').readFileSync(require('path').join(__dirname,'..')+'/assets/ilus/daily_rosario.png')}); await p.waitForTimeout(900);
  st=await p.evaluate(()=>JSON.parse(localStorage.getItem('scaeli-daily-grupos'))); g=Object.values(st)[0]; ok(g.meta.portada&&g.meta.portada.startsWith('data:image/jpeg')&&g.meta.portada.length<260000,'portada JPEG guardada en el grupo');
  const dim=await p.evaluate(()=>{ const i=document.querySelector('.gban img'); return i.naturalWidth+'x'+i.naturalHeight+' '+i.className; }); ok(/^800x450 .*foto/.test(dim),'portada 800×450 sin pixelado: '+dim);
  t=await SH(); ok(/Quitar la portada/.test(t),'enlace quitar'); await A('gPortadaQuitar',null,500); st=await p.evaluate(()=>JSON.parse(localStorage.getItem('scaeli-daily-grupos'))); g=Object.values(st)[0]; ok(!g.meta.portada,'portada quitada');
  // 6 · aviso en Hoy
  await A('cerrar'); await p.evaluate(()=>{ localStorage.setItem('daily_muro_visto','1'); const K='scaeli-daily-grupos'; const st=JSON.parse(localStorage.getItem(K)); const g=Object.values(st)[0]; g.muro.unshift({id:'n1',u:'ej0',n:'Juan',tx:'Recemos por la misión',t:Date.now()}); localStorage.setItem(K,JSON.stringify(st)); });
  await p.reload(); await p.waitForTimeout(1500); t=await T(); if(!/Juan escribió/.test(t)) console.log('HOY', t.slice(t.indexOf('parroquia')-40, t.indexOf('parroquia')+300)); ok(/Juan\s*escribió: «Recemos por la misión»/.test(t),'aviso «X escribió» en Hoy');
  await A('grupo',null,600); await A('cerrar'); t=await T(); ok(!/Juan escribió/.test(t),'al abrir el grupo el aviso se da por visto');
  // 7 · pantalla completa: pie estático
  await p.evaluate(()=>window.DAILY.ir('rezar')); await p.waitForTimeout(300); await A('lectioYa',null,600); const pos=await p.evaluate(()=>getComputedStyle(document.querySelector('.fpie')).position); ok(pos==='static','pie de pantalla completa estático: '+pos);
  const inOv=await p.evaluate(()=>getComputedStyle(document.querySelector('#sheet .in')).overflowY); ok(inOv==='auto','cuerpo scrolleable');
  await A('cerrar',null,300); const d=await p.$('.dlg button.primary'); if(d){ await d.click(); await p.waitForTimeout(300); }
  // 8 · versión, SW, reglas
  await p.evaluate(()=>window.DAILY.ir('mas')); await p.waitForTimeout(300); t=await T(); const VER=require('fs').readFileSync(require('path').join(__dirname,'..','js','app.js'),'utf8').match(/VERSION="([^"]+)"/)[1]; ok(t.includes('Scaeli Daily '+VER),'versión '+VER);
  const sw=require('fs').readFileSync(require('path').join(__dirname,'..')+'/sw.js','utf8'); ok(/scaeli-daily-v\d+/.test(sw)&&/oraciones_mas/.test(sw),'SW v19 con oraciones_mas');
  const rules=require('fs').readFileSync(require('path').join(__dirname,'..')+'/firestore.rules','utf8'); ok(/match \/mensajes\/\{mid\}/.test(rules)&&/match \/users\//.test(rules)&&/match \/codes\//.test(rules)&&/match \/grupos\//.test(rules),'reglas: users + grupos + mensajes + codes');
  console.log('T26', errs.concat(fails).join('\n')||'OK'); await b.close(); })();
