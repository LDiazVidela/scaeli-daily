// Ícono «Puerta de luz» (Daily 2.0): genera icons/icon-1024/512/192, apple-touch-icon, maskable-512 y assets/puerta.svg
// Uso: node herramientas/icono_puerta.js   (necesita playwright)
const { chromium } = require('playwright'); const fs = require('fs');
const P = 'M302 812V452a210 210 0 0 1 420 0V812ZM302 812V738H382V664H462V590H562V664H642V738H722V812ZM494 392h36v54h54v36h-54v108h-36v-108h-54v-36h54Z';
const svg = (esc) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024"><defs>
<linearGradient id="f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B3304A"/><stop offset="1" stop-color="#5A1524"/></linearGradient>
<radialGradient id="l" cx="512" cy="330" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFEFD8"/></linearGradient></defs>
<rect width="1024" height="1024" fill="url(#f)"/><rect width="1024" height="1024" fill="url(#l)"/>
<g transform="translate(512 527) scale(${esc}) translate(-512 -527)"><path fill-rule="evenodd" fill="url(#s)" d="${P}"/></g></svg>`;
(async () => {
  fs.writeFileSync('assets/puerta.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="302 242 420 570"><path fill-rule="evenodd" fill="#FFFFFF" d="${P}"/></svg>`);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1024, height: 1024 } });
  for (const [f, esc, lado] of [['icon-1024', 1, 1024], ['icon-512', 1, 512], ['icon-192', 1, 192], ['apple-touch-icon', 1, 180], ['maskable-512', 0.8, 512]]) {
    await p.setViewportSize({ width: lado, height: lado });
    await p.setContent(`<body style="margin:0">${svg(esc).replace('width="1024" height="1024"', `width="${lado}" height="${lado}"`)}</body>`);
    await p.screenshot({ path: `icons/${f}.png`, clip: { x: 0, y: 0, width: lado, height: lado } }); }
  // fuentes del proyecto nativo (app-nativa/assets, para @capacitor/assets): ícono, capas del ícono adaptable y pantalla de arranque
  const fondo = svg(1).replace(/<g transform[\s\S]*<\/g>/, '');
  for (const [f, cont] of [['icon-only', svg(1)], ['icon-foreground', svg(0.62)], ['icon-background', fondo]]) { await p.setViewportSize({ width: 1024, height: 1024 }); await p.setContent(`<body style="margin:0">${cont}</body>`); await p.screenshot({ path: `app-nativa/assets/${f}.png`, clip: { x: 0, y: 0, width: 1024, height: 1024 } }); }
  const arranque = `<body style="margin:0;width:2732px;height:2732px;background:radial-gradient(60% 36% at 50% 42%,rgba(163,43,65,.5) 0%,rgba(23,10,13,0) 70%),#170A0D;display:grid;place-items:center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="302 242 420 570" width="420" height="570"><path fill-rule="evenodd" fill="#FFFFFF" d="${P}"/></svg></body>`;
  for (const f of ['splash', 'splash-dark']) { await p.setViewportSize({ width: 2732, height: 2732 }); await p.setContent(arranque); await p.screenshot({ path: `app-nativa/assets/${f}.png`, clip: { x: 0, y: 0, width: 2732, height: 2732 } }); }
  await b.close(); console.log('íconos listos');
})();
