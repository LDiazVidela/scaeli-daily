// pase visual 1.9: latín, biblioteca adultos, muro del grupo, portada, rosario sin emoji, lectio
const { chromium } = require('playwright');
const out = process.argv[2] || '.';
(async () => { const b = await chromium.launch(); const errs=[]; const ctx=await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2 }); const p=await ctx.newPage();
  p.on('pageerror', e => errs.push('PAGEERROR '+e.message)); p.on('console', m => { if(m.type()==='error') errs.push('CONSOLE '+m.text()); });
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1200); await p.click('#invitado'); await p.waitForTimeout(1200);
  const A = async (a, q, ms = 500) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  const S = async (n) => p.screenshot({ path: out + '/' + n + '.png' });
  await p.evaluate(()=>window.DAILY.ir('rezar')); await p.waitForTimeout(400);
  await A('oraciones'); await S('v19_ora_es'); await A('oraLat',1); await S('v19_ora_lat'); await A('oracion',1); await S('v19_pater'); await A('oracion',16); await S('v19_extra_lat'); await A('oraLat',0); await S('v19_extra_es'); await A('cerrar');
  // rosario en latín
  await A('rosario',null,700); await S('v19_ros0'); await A('rosAv'); await A('rosAv'); await S('v19_ros_padre'); await A('rosLat',null,600); await S('v19_ros_lat'); await A('rosAv'); await S('v19_ros_ave_lat'); await A('rosLat'); await A('cerrar',null,300); await p.click('.dlg button.primary'); await p.waitForTimeout(500);
  // biblioteca
  await p.evaluate(()=>window.DAILY.ir('dia')); await p.waitForTimeout(400); await A('biblioteca'); await S('v19_bib'); await A('bibliFiltro','g|a'); await S('v19_bib_adultos'); await A('bibliFiltro','a|matrimonio'); await S('v19_bib_matri'); await A('cerrar');
  // grupo de ejemplo + muro
  await p.evaluate(()=>window.DAILY.ir('hoy')); await p.waitForTimeout(400); await A('grupo'); await A('gEjemplo',null,900); await S('v19_grupo');
  await p.evaluate(()=>document.querySelector('#sheet .scroll').scrollTo(0,420)); await p.waitForTimeout(300); await S('v19_muro');
  await p.fill('form[data-f=muro] input','Buen día a todos, hoy rezo por ustedes'); await p.press('form[data-f=muro] input','Enter'); await p.waitForTimeout(600); await S('v19_muro2');
  await A('mRec'); await S('v19_rec'); await A('mRecOk',3,600); await S('v19_rec2');
  await A('mAmen','e2'); await p.waitForTimeout(400); await S('v19_amen');
  await p.evaluate(()=>document.querySelector('#sheet .scroll').scrollTo(0,0)); const gp = await p.$('.gport'); console.log('gport', !!gp);
  // portada: subir una imagen de prueba
  await p.setInputFiles('#gPortada', { name:'foto.png', mimeType:'image/png', buffer: require('fs').readFileSync(require('path').join(__dirname,'..')+'/assets/ilus/daily_mediodia.png') }).catch(e=>console.log('portada', e.message));
  await p.waitForTimeout(900); await S('v19_portada');
  const meta = await p.evaluate(()=>{ const st=JSON.parse(localStorage.getItem('scaeli-daily-grupos')||'{}'); const g=Object.values(st)[0]; return g&&g.meta.portada?g.meta.portada.slice(0,30)+' len='+g.meta.portada.length:'sin portada'; }); console.log('meta', meta);
  await A('cerrar'); await p.evaluate(()=>{ localStorage.setItem('daily_muro_visto','1'); window.DAILY.ir('hoy'); }); await p.waitForTimeout(500); await p.evaluate(()=>window.scrollTo(0,700)); await p.waitForTimeout(300); await S('v19_hoy_aviso');
  // lectio pantalla completa (tecleo)
  await p.evaluate(()=>window.DAILY.ir('rezar')); await p.waitForTimeout(300); await A('lectio',null,700).catch(()=>{}); await S('v19_lectio');
  console.log('V19', errs.join('\n')||'OK'); await b.close(); })();
