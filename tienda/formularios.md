# Scaeli Daily · cómo completar los formularios de las tiendas

## Google Play · Seguridad de los datos
- ¿La app recopila o comparte datos? **Sí, recopila. No comparte.** (RevenueCat actúa como proveedor de servicios: según Google, eso no cuenta como «compartir».)
- ¿Los datos se cifran en tránsito? **Sí.**
- ¿Se puede pedir que se borren? **Sí** (en la app y en https://ldiazvidela.github.io/scaeli-daily/borrar-cuenta.html).

| Tipo de dato | Se recopila | Obligatorio | Para qué |
|---|---|---|---|
| Información personal → Nombre | Sí | Opcional (se puede usar sin cuenta) | Funcionalidad de la app, administración de la cuenta |
| Información personal → Dirección de correo | Sí | Opcional | Administración de la cuenta |
| Información personal → ID de usuario | Sí | Opcional | Administración de la cuenta |
| Actividad en la app → Otro contenido generado por el usuario (diario, intenciones, hábitos, tareas) | Sí | Opcional | Funcionalidad de la app |
| Actividad en la app → Interacciones con la app (oraciones marcadas, racha) | Sí | Opcional | Funcionalidad de la app |
| Información financiera → Historial de compras | Sí, solo si compra Scaeli+ o dona (lo procesa la tienda; RevenueCat guarda el estado de la suscripción) | Opcional | Funcionalidad de la app (saber si Scaeli+ está activo) |
| Calendario → Eventos del calendario | Sí, solo si conecta Google Calendar; no se guardan en nuestros servidores | Opcional | Funcionalidad de la app |

Nada de: ubicación, contactos, fotos, audio, salud, datos de pago (los maneja la tienda), identificadores de publicidad, historial web. Ningún dato se usa para publicidad ni analíticas.

## Google Play · otras declaraciones
- **Anuncios:** no contiene anuncios.
- **Acceso a la app:** «Toda la funcionalidad está disponible sin restricciones» — el revisor puede tocar **Probar sin cuenta**. Scaeli+ se prueba con una cuenta de prueba de licencias (Play Console → Configuración → Pruebas de licencias): ahí las compras no se cobran.
- **Público objetivo:** 13 a 15, 16 a 17 y 18 o más. **No** marcar menores de 13 (si se marca, entra en el programa Familias y cambian las reglas).
- **Clasificación de contenido (IARC):** categoría «Referencia, noticias o educación» / «Otros». Violencia, sexo, lenguaje, drogas, apuestas: **No**. Interacción entre usuarios: **No**. Comparte ubicación: **No**. Compras digitales: **Sí** (Scaeli+ y donaciones). Resultado esperado: Apto para todo público / PEGI 3.
- **App de noticias:** No. **App de salud:** No. **Gobierno:** No.
- **Permiso de alarmas exactas:** no se usa.
- **Prueba cerrada antes de producción (cuentas personales nuevas):** mínimo 12 personas anotadas durante 14 días seguidos.

## App Store · Privacidad de la app («etiquetas de privacidad»)
- **Datos vinculados a vos:** Información de contacto → Nombre, Correo electrónico · Identificadores → ID de usuario · Contenido del usuario → Otro contenido del usuario · Compras → Historial de compras (solo si compra Scaeli+ o dona). Uso: **Funcionalidad de la app**.
- **Rastreo:** **No** (no se usa para rastrear). No hace falta el aviso de App Tracking Transparency.
- **Datos no recopilados:** todo lo demás.

## App Store · otros datos de la revisión
- **Clasificación por edad:** responder «Ninguno» en todo → 4+. Si preferís que figure para 12+, marcá «Temas para mayores» = Infrecuente (no hace falta).
- **Inicio de sesión para la revisión:** no hace falta cuenta de prueba: explicar en las notas que se puede usar **Probar sin cuenta**, y que Entrar con Apple y Entrar con Google funcionan.
- **Notas para el revisor (pegar):** «Scaeli Daily es una app católica de oración. Funciona sin cuenta (botón Probar sin cuenta). Con cuenta, sincroniza en Firebase. Los recordatorios usan notificaciones locales. Borrar cuenta: Más → Borrar mi cuenta. Google Calendar es opcional (Tu día → Conectar Google Calendar). Scaeli+ (Más → Scaeli+) es una suscripción auto-renovable con compra de Apple (StoreKit, vía RevenueCat): desbloquea Tu progreso (Hoy → Tu progreso y tus virtudes) y el Camino de Adviento. Restaurar compras está en la misma pantalla. Las donaciones (Más → Ayudar a Scaeli) son compras consumibles que no desbloquean nada.»
- **Cifrado de exportación:** «No usa cifrado propio» (solo HTTPS) → en Xcode ya queda `ITSAppUsesNonExemptEncryption = NO`.
- **Funciones nativas** (para la guía 4.2): avisos locales programados, entrada con Apple/Google nativa, funciona sin conexión.

## Compras dentro de la app (Scaeli+ y donaciones)
- **App Store Connect → Suscripciones:** grupo «Scaeli+», dos suscripciones auto-renovables: `scaeli_plus_mensual` (1 mes, USD 2,99) y `scaeli_plus_anual` (1 año, USD 19,99). Nombre visible: «Scaeli+ mensual» / «Scaeli+ anual». Descripción: «Tu progreso, tus virtudes y caminos guiados». Captura para la revisión: la pantalla de Scaeli+ (`tienda/` → captura de Más → Scaeli+).
- **App Store Connect → Compras dentro de la app:** tres **consumibles**: `scaeli_donacion_1` (USD 1,99, «Donación»), `scaeli_donacion_2` (USD 4,99, «Donación»), `scaeli_donacion_3` (USD 9,99, «Donación»).
- **App Store → Información de la app:** cargar la URL de los términos (https://ldiazvidela.github.io/scaeli-daily/terminos.html) en «Contrato de licencia» o en la descripción, y la de privacidad. Apple pide los dos enlaces cuando hay suscripciones.
- **Play Console → Monetizar → Productos → Suscripciones:** `scaeli_plus` con dos planes base: `mensual` (renovación mensual, USD 2,99) y `anual` (renovación anual, USD 19,99). **Productos integrados (únicos):** los mismos tres `scaeli_donacion_1/2/3`, marcados como consumibles en RevenueCat.
- **Precios locales:** dejá que cada tienda convierta a pesos y demás monedas (o ajustalos a mano en Argentina).
- **Edad:** las compras quedan sujetas a los controles parentales de cada tienda; no hace falta cambiar la clasificación.
