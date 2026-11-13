# Scaeli Daily · LEEME para seguir en otro chat

Pegale esto al chat nuevo (o decile «leé LEEME-DAILY.md del proyecto»). Estado al **13/11/2026, versión 2.0.1**.

## Qué es
App de oración diaria de Scaeli (PWA + app nativa con Capacitor), hermana de Scaeli Fit y del juego. Lema «Tu fe, a otro nivel». Español rioplatense con voseo. Estilo (desde 2.0): bordó oscuro y crema («rojo y blanco»), tipografía del sistema, sobrio, católico, con aspecto de app nativa de Apple; pixel art de PixelLab en personaje e ilustraciones (no se retoca por código). Guía visual vigente: doc del proyecto `claude/LEEME-DISENO-2.0.md` (paleta, medidas y lienzo de diseño).

## Dónde está todo
- **Código**: GitHub `LDiazVidela/scaeli-daily`, rama `main`. El chat nuevo lo clona (no hace falta zip): `gh repo clone LDiazVidela/scaeli-daily` (si no tiene acceso, agregar el repo a la sesión).
- **App publicada**: https://ldiazvidela.github.io/scaeli-daily/ — cada push a `main` despliega solo (`.github/workflows/pages.yml`). Si el despliegue da error 500 de GitHub, relanzar: `gh api repos/LDiazVidela/scaeli-daily/actions/workflows/pages.yml/dispatches --method POST -f ref=main`.
- **Vista previa**: Artifact https://claude.ai/artifact/P66mHh3tnxMV1vLUqQin9x (versión 34 = Daily 2.0.1). Se publica con `root` = carpeta del repo y `files` = solo los archivos cambiados; label «Daily X.Y · vista previa».
- **Historia completa versión por versión**: doc del proyecto `LEEME-PRIMERO.md`, en el párrafo que empieza «**Daily 1.4.1**» (todo lo de Daily está ahí, en orden).
- **Firebase**: proyecto `scaeli` (compartido con Fit y el juego). Contrato de Scaeli+ y reglas: `docs/SCAELI_PLUS_COMPARTIDO.md` (copia idéntica del repo de Fit, no se modifica).

## Cómo está hecha
- `index.html` (íconos SVG `<symbol id="i-…">`), `css/app.css` + **`css/v2.css`** (la piel 2.0: se carga después y solo pisa lo visual; los cambios de aspecto van ahí), `js/app.js` (todo: vistas, `ACC` = acciones de `data-a`, `openSheet/renderSheet`), `js/firebase.js` (backend Firestore y local sin cuenta, grupos, `plusBackend`), `js/nativo.js` (Capacitor, RevenueCat), `js/personaje.js`.
- Datos: `data/juego.js` (ORACIONES con `lat`, CONFESION, misterios…), `data/oraciones_mas.js` (GENERADO por `herramientas/texto_extra.py` desde `herramientas/textos/*.json`), `data/examen.js` (CAPITALES, VIDA, CONF_CIERRE), `data/habitos.js` (126, `g` j/a), `data/cartas.js` (GENERADO por `herramientas/cartas_santos.py`: las 79 cartas del álbum, con `assets/santos/*.png` del juego), `data/novenas.js` + `novenas/`, `data/libros.js` + `libros/`, `biblia/`, `evangelio/`, `horas/`, `data/ordo/` (hay que sumar 2029 antes de fin de 2028).
- Service worker `sw.js`: **subir `scaeli-daily-vN` en cada entrega** (hoy v29) y `VERSION` en `js/app.js` (hoy "2.0.1").
- No cambiar claves internas con «scala»/«scaeli-daily» de localStorage ni de caché.

## Cómo se prueba (todo verde o no se entrega)
```
node --experimental-vm-modules <chequeo de sintaxis>   # node --check no detecta strings rotos
bash pruebas/todo.sh                                     # levanta el servidor en :8765, corre t11–t31 y el barrido estético
```
- Pases visuales: `pruebas/v19.js`, `v19b.js` (Lectio con teclado), `v193.js` (iPhone instalado: márgenes). Capturas en `pruebas/salida/`.
- `pruebas/barrido.js`: abre todas las vistas y paneles en 360/390 px, oscuro y claro, y avisa desbordes, cosas que se pisan y texto cortado. Capturas en `pruebas/salida/barrido/` (mirarlas antes de entregar).
- Las pruebas de versión leen `VERSION` de app.js: no hay que tocarlas al subir de versión.
- Ruido esperado en t11: 2–3 «Failed to load resource» (ya filtrado).

## Cómo se entrega
1. Pruebas verdes. 2. Commit (co-autor Claude) y push a `main` → Pages. 3. Publicar el Artifact. 4. `scaeli-app.zip` (el sitio sin `.git .github app-nativa herramientas tienda docs pruebas`) y `scaeli-paquete-vX.Y.zip` (repo sin node_modules ni builds nativos). 5. Sumar la versión al párrafo de Daily de `LEEME-PRIMERO.md` y subirlo al proyecto. 6. Resumen corto con lo que se decidió.

## Reglas de Lorenzo
- Se programa/publica cuando Lorenzo dice «programar» (o «dale»); si no, se mandan propuestas.
- Listas largas: todo en una sola entrega. Respuestas cortas.
- Personaje: solo dibujos de PixelLab tal cual (`herramientas/pj_crudo.py`); nada de pegar caras por código.
- Examen y textos de oración: tono sobrio, sin malas palabras ni lunfardo.
- Scaeli+ y `firestore.rules` siguen el contrato compartido: las reglas se publican enteras (users + grupos con miembros y mensajes + codes), nunca por partes.

## Pendientes
- **Hecho el 13/11 (ya no es pendiente)**: `firestore.rules` publicado entero en la consola (con `mensajes` y `ranking/{gid}`; comprobado idéntico al del repo) y copiado igual en scaeli-fit; Actions corre solo; capturas de tienda, gráfico destacado e íconos nativos rehechos con 2.0; atleta sin logo y versión mujer (2.0.1); aviso a Fit en su LEEME.
- **Solo Lorenzo** (piden sus cuentas, claves o pagos): cuentas de desarrollador de Apple y Google Play; claves de RevenueCat (`RC_CLAVES`) y los productos en cada tienda; `google-services.json` / `GoogleService-Info.plist` (se bajan de Firebase al registrar las apps Android/iOS; Android pide la huella SHA-1 de la clave de firma); compilar y firmar en Android Studio / Xcode; mandar el correo a participa@catholic.net por las novenas (borrador pasado el 13/11); `codes/SCAELI-PRUEBA` solo si lo quiere.
- **PixelLab**: la cuenta principal se renueva el 24/11; la de prueba quedó con 4 generaciones. Método que funcionó para variantes del personaje: Creator → Edit → «Edit image» (Pixen, 1 generación, «No Background»), subiendo el dibujo de 128×128: conserva la cara y la silueta.
- **Más adelante**: caras iguales en todos los dibujos (`claude/pixellab-tanda-1.8.md`); poses de oración; audio guiado; insignias del grupo leídas por el juego; el logo del atleta en las 8 vistas de Fit.

## Últimas versiones (detalle en LEEME-PRIMERO.md)
- **2.0.1**: ropa «Deportiva» sin el logo de la remera y **versión mujer** (dibujos de PixelLab tal cual: `herramientas/pixellab_extra/atleta_south.png` y `atleta_f_south.png`; fila 34 de `m.png` y fila 52 de `f.png`); se fue el «próximamente». Material de tiendas rehecho con 2.0 (`herramientas/capturas_tienda.js`, `grafico_destacado.js`) e íconos nativos generados. SW v29.
- **2.0**: rediseño completo («Diseño 2.0», lienzo https://claude.ai/artifact/8RyraZ8DYw3utLscURXKf5): `css/v2.css` (bordó oscuro `#170A0D` y crema `#FFF4D2`, modo claro en crema y bordó, tipografía del sistema, tarjetas radio 22, botón principal 54 y de fila 44, barra inferior flotante de vidrio con las cinco secciones a la vista, control segmentado e interruptores estilo iOS), ícono y entrada «Puerta de luz» con el lema, **ocho rangos** (suma Celestial y Divino: 24 escalones, pisos 590…940; lo que pasa de 540 se gana con +5 por día de racha después del día 30, tope 400), insignias de PixelLab en `assets/rangos/` con tres puntitos de subnivel y escalera de ocho, portadas propias de Biblioteca, Ayudar a Scaeli, Grupo y Caminos guiados, aviso del Ángelus a las 12 y preferencia «Oraciones en latín» en Más. El color por defecto de la app pasó de «Ámbar» a «Crema» (misma clave `ambar`); «Tu año con Dios», la imagen para compartir y las páginas `privacidad/terminos/borrar-cuenta.html` también llevan la piel nueva. Pruebas: `t31.js`; el barrido mide 54/44.
- **1.12**: Rosario compartido con Fit sin contar dos veces (`id` + `rids`, `src`), entrenos de Fit (solo lectura; el ofrecido es día con Dios), rango de perseverancia (Hierro III → Diamante I, últimos 30 días), ranking de GRUPOS (`ranking/{gid}`, regla nueva) sin ranking interno, ropa Deportiva (atleta de Fit, solo varón).
- **1.11.1**: Rosario con cuentas parejas y crucifijo, Credo al empezar (completo o solo el Credo), Oraciones prolijas y actividad del grupo («Romina rezó el Rosario», «Amén», aviso «Me sumo» en Hoy; se apaga en Ajustes). Push de verdad: necesita Cloud Functions (plan Blaze).
- **1.11**: álbum de santos nuevo: 79 cartas premium con los santos del juego (Gloria, Mártir, Oro, Plata), un álbum por grupo que se llena entre todos, un sobre de 3 cartas por semana con 5 días con Dios, animación del sobre y diploma con código para canjear el álbum impreso (código `ALB-{gid}-{control}`: se busca el grupo en Firebase).
- **1.9**: oraciones en latín (selector y Rosario), 8 oraciones nuevas, muro del grupo con recordatorios, portada del grupo desde la galería, 56 hábitos para adultos, pie estático en pantalla completa, sin emoji en el rosario.
- **1.9.1**: ícono nuevo (libro sobre la escalera). **1.9.2**: el ícono en la pantalla de entrada.
- **1.10**: botones en tres medidas y todo centrado, logo nuevo en la entrada, avatar → personalización, Palabra del día, misiones diarias del grupo (suman y restan), premios semanales (rosarios y colores de la app) y álbum de santos con sobres, canje y regalos.
- **1.9.4**: pulido estético con barrido automático (tareas fecha/hora, bordes en pantalla completa, selectores, pies parejos, desplegables, vela en modo claro, santoral, textos cortados).
- **1.9.3**: examen de conciencia con el material «La Reconciliación» de Lorenzo (modo Mi vida, capitales con explicación, cierre), sin «putear»; márgenes seguros en iPhone instalado y pie siempre visible.
