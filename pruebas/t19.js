// Scaeli+ en la app nativa, con RevenueCat simulado
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs=[]; const ok=(c,m)=>{ if(!c) errs.push('FALLA '+m); };
  const ctx=await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2, colorScheme:'light' }); const p=await ctx.newPage();
  p.on('pageerror', e => errs.push('PAGEERROR '+e.message));
  await p.route('**/js/nativo.js', async r=>{ const res=await r.fetch(); let t=await res.text(); t=t.replace('RC_CLAVES = { android: "", ios: "" }','RC_CLAVES = { android: "goog_test", ios: "appl_test" }'); r.fulfill({response:res, body:t}); });
  await p.addInitScript(()=>{ let plus=false; const L=window.__rc=[];
    const info=()=>({customerInfo:{entitlements:{active:plus?{plus:{}}:{}}}});
    const pk=(t,id,pr)=>({packageType:t,identifier:id,product:{priceString:pr,price:t==="MONTHLY"?3299:19999}});
    window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>"android",Plugins:{
      Purchases:{ configure:async o=>{L.push('configure:'+o.apiKey+':'+(o.appUserID||''));}, logIn:async o=>{L.push('logIn:'+o.appUserID);},
        getCustomerInfo:async()=>info(), getOfferings:async()=>({current:{availablePackages:[pk("MONTHLY","$rc_monthly","ARS 3.299,00"),pk("ANNUAL","$rc_annual","ARS 21.999,00")]}}),
        purchasePackage:async o=>{ L.push('buy:'+o.aPackage.identifier); plus=true; return info(); }, restorePurchases:async()=>{ L.push('restore'); return info(); },
        getProducts:async o=>({products:o.productIdentifiers.map((id,i)=>({identifier:id,priceString:["ARS 1.999","ARS 4.999","ARS 9.999"][i]}))}),
        purchaseStoreProduct:async o=>{ L.push('don:'+o.product.identifier); return {}; } } } };
    try{ localStorage.setItem('daily_theme','light'); }catch(e){} });
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1500); await p.click('#invitado'); await p.waitForTimeout(1800);
  const A = async (a, q, ms = 500) => { await p.evaluate(([a, q]) => window.DAILY.ACC[a](q), [a, q]); await p.waitForTimeout(ms); };
  let L=await p.evaluate(()=>window.__rc.slice()); ok(L.some(x=>x==='configure:goog_test:'),'configure sin id compartido '+L);
  await p.click('#nav button[data-view="mas"]'); await p.waitForTimeout(400); const tema=await p.evaluate(()=>document.documentElement.getAttribute('data-theme')); if(tema!=='light') await A('tema');
  await A('plus',null,900); const t=await p.textContent('#sheet'); ok(t.includes('ARS 21.999,00')&&t.includes('ARS 3.299,00'),'precios de la tienda'); ok(!t.includes('Código de prueba'),'sin código en nativo'); ok(t.includes('Restaurar compras'),'restaurar'); ok(t.includes('Ahorrás 49%'),'ahorro calculado');
  await p.screenshot({path:'n_pay.png'});
  await p.evaluate(()=>{ const s=document.querySelector('#sheet .scroll'); s.scrollTop=9999; }); await p.waitForTimeout(200); await p.screenshot({path:'n_pay2.png'});
  await A('plusComprar','anual',900); L=await p.evaluate(()=>window.__rc.slice()); ok(L.includes('buy:$rc_annual'),'compra anual'); ok((await p.textContent('#sheet')).includes('Gracias por sostener'),'activo tras compra');
  await A('progreso',null,700); ok((await p.textContent('#sheet')).includes('Tus virtudes'),'progreso abierto'); await p.screenshot({path:'n_prog.png'});
  await A('donarVer',null,900); ok((await p.textContent('#sheet')).includes('ARS 4.999'),'precio donación'); await A('donar','2',600); L=await p.evaluate(()=>window.__rc.slice()); ok(L.includes('don:scaeli_donacion_2'),'donación'); await p.screenshot({path:'n_donar.png'});
  await A('plus',null,600); await A('plusRestaurar',null,600); L=await p.evaluate(()=>window.__rc.slice()); ok(L.includes('restore'),'restore');
  console.log('T19',errs.join('\n')||'OK'); await b.close(); })();
