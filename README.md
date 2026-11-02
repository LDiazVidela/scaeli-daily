# Scaeli Daily

**Rezar todos los días.** El Evangelio del día, el Rosario guiado cuenta por cuenta, la Liturgia de las Horas, las oraciones de la mañana y de la noche, el examen del día, novenas, el santoral, propósitos y diario, y tu personaje. Hermana de [Scaeli](https://github.com/LDiazVidela/scala-paradisi) (el juego) y de [Scaeli Fit](https://github.com/LDiazVidela/scaeli-fit).

App web instalable (PWA), sin servidor propio: los datos de cada persona viven en su cuenta de Google a través de Firebase. También se puede usar **sin cuenta** (queda guardado solo en ese dispositivo).

## Usar la app

1. Abrí la dirección publicada (GitHub Pages de este repositorio) desde el celular.
2. Entrá con tu cuenta de Google, o tocá «Probar sin cuenta».
3. Agregala a la pantalla de inicio: en iPhone, Compartir → **Agregar a inicio**; en Android, el menú del navegador → **Instalar app**.

## Qué hace

- **Hoy** — la cabecera ilustrada según la hora (mañana, mediodía, tarde, noche) con tu personaje y la oración del momento; la hora de la Liturgia que toca ahora; Evangelio, Rosario, Examen del día y la novena en curso con sus portadas; el santo del día; tu semana con Dios y la racha.
- **Rezar** — cada sección con su ilustración; al terminar una oración se toca «Amén» (queda registrada, sin tildes de tarea): Evangelio (con Lectio Divina opcional en cuatro pasos, libre, con una guía «Cómo hacer la Lectio»), Santo Rosario (los misterios del día, cuenta por cuenta, con la meditación y el fruto de cada misterio, Fátima, Salve y por el Papa; se puede dejar y seguir después, empezar de cero u ocultar las oraciones y quedarse solo con el contador), Liturgia de las Horas (los textos vienen de liturgiadelashoras.github.io), Oraciones, Novenas (las del mes: cuál está en curso y en qué día va), Examen del día en cinco pasos, Santoral (un santo por día, con buscador), Confesión (pasos y examen por mandamientos, para jóvenes y para chicos), la Misa de hoy (lecturas y partes).
- **Tu día** (al estilo Habitica) — diarias con racha (las cinco oraciones del día y las tuyas), hábitos con + y − que cuentan por día (con «Deshacer» y un editor para corregir), tareas con fecha y hora de aviso; diario privado y calendario del mes conectado a Google Calendar (ver y agregar eventos).
- **Santoral** — además del santo principal de cada día, 3 o 4 santos más del Martirologio Romano (`data/santoral-mas.js`, 1.392 fichas cortas; se carga recién al abrir el santoral) y el buscador los encuentra a todos.
- **Santo del día** — patronazgo, vida, biografía amplia, una frase y una oración para pedirle (`data/santoral.js`: un santo por día con ficha verificada en el Dicasterio para las Causas de los Santos y otras fuentes católicas; `data/santos.js` de respaldo).
- **Yo** — tu personaje: varón o mujer, peinado, ropa (cada prenda en cinco colores dibujados en PixelLab), ropa de consagrados (él: sotana, clergyman, seminarista; ella: consagrada, Misionera de la Caridad, dominica, carmelita; con velo no hay peinado ni color de pelo), accesorios para él (barba, anteojos, cruz; la barba toma el color del pelo), altura, color de piel y de pelo; cuatro vistas; la cara no cambia con el peinado. Las vestimentas de santos y los sets se ganan jugando Scaeli.
- **Más** — recordatorios de mañana y noche, modo claro, exportar e importar todos tus datos, enlaces a Scaeli Fit y al juego, cerrar sesión.

## Cómo está hecha

- HTML, CSS y JavaScript sin frameworks ni compilación. `index.html` + `css/app.css` + `js/app.js` + `js/firebase.js`.
- `data/juego.js`: oraciones, santos, misterios, meditaciones, examen, confesión, lectio, misiones; sale del juego con `herramientas/extraer.js` (así los tres productos dicen lo mismo). `data/propio.js`: novenas, oraciones de la hora, ideas.
- **Firebase**: Authentication (Google) y Firestore con caché local, proyecto `scaeli` (el mismo de Fit). Daily guarda en `users/{uid}/daily_days`, `daily_settings`, `daily_novenas`; no pisa nada de Fit. `firestore.rules` es la misma regla: cada uno lee y escribe solo lo suyo.
- **Evangelio del día**: `herramientas/evangelio.mjs` deja un archivo por día en `evangelio/AAAA-MM-DD.json`; la GitHub Action `.github/workflows/evangelio.yml` lo corre cada noche. Si falta el día, la app muestra un pasaje de respaldo.
- `sw.js` + `manifest.webmanifest`: instalable y disponible sin conexión (guarda también las Horas y los Evangelios ya vistos).
- Identidad: tipografía Bricolage Grotesque, grafito + ámbar (como Fit) con el bordó de Daily en el héroe; íconos de línea propios (`index.html`, símbolos SVG).
- El personaje: `js/personaje.js` arma cada cuadro desde `assets/personaje/{m,f}.png` (todas las combinaciones prenda × peinado en 4 vistas), `{m,f}_reg.png` (la región de cada píxel: piel, pelo, arriba, abajo, calzado) y `pj.json` (anclas para la altura). Lo genera `herramientas/pj_armar.py` desde los zips de PixelLab (`yo`, `yo_f`, cada prenda en gris y en `_blanco`, `_negro`, `_azul`, `_bordo`: `yo_remera`, `yo_buzo`, `yo_camisa`, `yo_pelo_corto`, `yo_pelo_largo`, `yo_f_remera`, `yo_f_buzo`, `yo_f_pollera`, `yo_f_pelo_suelto`, `yo_f_pelo_corto`). Prueba visual: `herramientas/prueba-pj.html`.
- Ilustraciones: `assets/ilus/daily_*.png` (PixelLab). Logo: el arco con la escalera y la vela (`herramientas/logo_daily_original.png`); `herramientas/logo_daily.py` arma los íconos y `assets/logo-daily.png`.

## Las tiendas

- `app-nativa/`: la app de Google Play y App Store (Capacitor 8): avisos del teléfono, entrada nativa con Google y Apple, sin conexión. Pasos en `app-nativa/LEEME.md`.
- `tienda/`: textos de la ficha, respuestas de los formularios, capturas y gráfico destacado.
- `privacidad.html` (política de privacidad) y `borrar-cuenta.html` (borrar la cuenta desde la web): las piden las dos tiendas.
- `vendor/firebase/`: el SDK de Firebase 10.14.1 adentro de la app (anda sin conexión y en las tiendas).

## Publicar

1. Repositorio público en GitHub → Settings → Pages → Branch `main`, carpeta `/ (root)`.
2. En Firebase Console → Authentication → Settings → Dominios autorizados: agregar `ldiazvidela.github.io` (si ya está por Fit, no hace falta).
3. Firestore → Reglas: ya cubre `users/{uid}/**`, así que no hay que cambiar nada si está publicada la regla de Fit. Si no, pegar `firestore.rules` y publicar.
4. Google Calendar: en Google Cloud (proyecto `scaeli`) habilitar **Google Calendar API**; en la pantalla de consentimiento OAuth agregar el permiso `calendar.events` y, mientras no esté verificada, los correos de prueba (hasta 100).
5. Para que el Evangelio se actualice solo: Settings → Actions → General → Workflow permissions → **Read and write**.

## Probar

`python3 -m http.server 8765` en la carpeta y abrir `http://localhost:8765/`. Tocar «Probar sin cuenta». En consola, `window.DAILY.ACC` tiene todas las acciones (`hora`, `rosario`, `rosAv`, `examen`, `exPaso`, `novena`, `exportar`…) y `window.DAILY.get()` el estado.
