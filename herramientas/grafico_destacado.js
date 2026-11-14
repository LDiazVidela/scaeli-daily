// Gráfico destacado de Google Play (1024×500) → tienda/grafico-destacado.png. Con el servidor en :8765: node herramientas/grafico_destacado.js
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1024, height: 500 }, deviceScaleFactor: 1 })).newPage();
  await p.goto('http://localhost:8765/herramientas/grafico_destacado.html'); await p.waitForSelector('body[data-listo="1"]', { timeout: 15000 }); await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(__dirname, '..', 'tienda', 'grafico-destacado.png') }); console.log('GRÁFICO OK'); await b.close(); })();
