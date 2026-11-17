# Scaeli Daily · cómo completar los formularios de las tiendas

**Correo de contacto (soporte, privacidad y reportes de abuso):** scaeli.app@gmail.com

## Google Play · Seguridad de los datos
- ¿La app recopila o comparte datos? **Sí, recopila. No comparte.** (RevenueCat actúa como proveedor de servicios: según Google, eso no cuenta como «compartir».)
- ¿Los datos se cifran en tránsito? **Sí.**
- ¿Se puede pedir que se borren? **Sí** (en la app y en https://daily.scaeli.com.ar/borrar-cuenta.html).

| Tipo de dato | Se recopila | Obligatorio | Para qué |
|---|---|---|---|
| Información personal → Nombre | Sí | Opcional (se puede usar sin cuenta) | Funcionalidad de la app, administración de la cuenta |
| Información personal → Dirección de correo | Sí | Opcional | Administración de la cuenta |
| Información personal → ID de usuario | Sí | Opcional | Administración de la cuenta |
| Información personal → Creencias políticas o religiosas: **creencias religiosas** (lo que rezás muestra tu fe; vinculadas a la cuenta, **no compartidas**; se pide consentimiento expreso) | Sí | Opcional | Funcionalidad de la app |
| Actividad en la app → Otro contenido generado por el usuario (diario, intenciones, hábitos, tareas, mensajes del muro del grupo) | Sí | Opcional | Funcionalidad de la app |
| Fotos y videos → Fotos (solo la portada del grupo, si su creador la elige; no compartidas fuera de la app) | Sí | Opcional | Funcionalidad de la app |
| Actividad en la app → Interacciones con la app (oraciones marcadas, racha) | Sí | Opcional | Funcionalidad de la app |
| Información financiera → Historial de compras | Sí, solo si compra Scaeli+ o dona (lo procesa la tienda; RevenueCat guarda el estado de la suscripción) | Opcional | Funcionalidad de la app (saber si Scaeli+ está activo) |
| Actividad en la app → Interacciones con la app y Información y rendimiento de la app → Diagnósticos (**Google Analytics**, desde el 16/11: uso estadístico con un identificador de instalación al azar, sin nombre ni correo) | Sí | Obligatorio (corre siempre que hay conexión) | Estadísticas (analytics) |
| Identificadores del dispositivo u otros → ID de instancia de la app (Google Analytics) | Sí | Obligatorio | Estadísticas (analytics) |
| Calendario → Eventos del calendario | Sí, solo si conecta Google Calendar; no se guardan en nuestros servidores | Opcional | Funcionalidad de la app |

Nada de: ubicación, contactos, fotos (salvo la portada del grupo), audio, salud, datos de pago (los maneja la tienda), identificadores de publicidad, historial web. Ningún dato se usa para publicidad. Desde el 16/11 hay **Google Analytics** (Firebase) solo para estadísticas de uso, configurado sin compartir datos con Google.

## Google Play · otras declaraciones
- **Anuncios:** no contiene anuncios.
- **Acceso a la app:** «Toda la funcionalidad está disponible sin restricciones» — el revisor puede tocar **Probar sin cuenta**. Scaeli+ se prueba con una cuenta de prueba de licencias (Play Console → Configuración → Pruebas de licencias): ahí las compras no se cobran.
- **Público objetivo:** 13 a 15, 16 a 17 y 18 o más. **No** marcar menores de 13 (si se marca, entra en el programa Familias y cambian las reglas).
- **Clasificación de contenido (IARC):** categoría «Referencia, noticias o educación» / «Otros». Violencia, sexo, lenguaje, drogas, apuestas: **No**. Interacción entre usuarios: **Sí** (grupos privados por código: muro de mensajes, intenciones y aliento; con filtro de palabras, reportar, bloquear y moderación del creador). Comparte ubicación: **No**. Compras digitales: **Sí** (Scaeli+ y donaciones). Resultado esperado: Apto para todo público / PEGI 3.
- **App de noticias:** No. **App de salud:** No. **Gobierno:** No.
- **Permiso de alarmas exactas:** no se usa.
- **Prueba cerrada antes de producción (cuentas personales nuevas):** mínimo 12 personas anotadas durante 14 días seguidos.

## App Store · Privacidad de la app («etiquetas de privacidad»)
- **Datos vinculados a vos:** Información de contacto → Nombre, Correo electrónico · Información confidencial (creencias religiosas: lo que rezás) · Identificadores → ID de usuario · Contenido del usuario → Fotos o videos (portada del grupo) y Otro contenido del usuario (incluye mensajes del grupo) · Compras → Historial de compras (solo si compra Scaeli+ o dona). Uso: **Funcionalidad de la app**.
- **Datos no vinculados a vos (Google Analytics, desde el 16/11):** Datos de uso → Interacción con el producto · Diagnóstico. Uso: **Analíticas**.
- **Rastreo:** **No** (no se usa para rastrear). No hace falta el aviso de App Tracking Transparency.
- **Datos no recopilados:** todo lo demás.

## App Store · otros datos de la revisión
- **Clasificación por edad:** «Ninguno» en violencia, sexo, lenguaje, etc.; en **contenido generado por usuarios / mensajes** responder **Sí** (el muro del grupo). Apple lo clasifica según eso (probablemente 13+). Guía 1.2: la app filtra palabras ofensivas, permite reportar mensajes e intenciones, bloquear a otro miembro, el creador borra mensajes y saca miembros, y hay un correo de contacto en los términos (respuesta en 24 h).
- **Inicio de sesión para la revisión:** no hace falta cuenta de prueba: explicar en las notas que se puede usar **Probar sin cuenta**, y que Entrar con Google funciona. «Continuar con Apple» está oculto hasta activarlo (2.3.2): en iOS, Apple exige «Iniciar sesión con Apple» si se ofrece Google, así que antes de mandar a revisión hay que activarlo (cuenta de Apple Developer) y poner `APPLE_LISTO=true`.
- **Notas para el revisor (pegar):** «Scaeli Daily es una app católica de oración. Funciona sin cuenta (botón Probar sin cuenta). Con cuenta, sincroniza en Firebase. Los recordatorios usan notificaciones locales. Borrar cuenta: Más → Borrar mi cuenta. Grupos (Hoy → Grupo): muro con filtro de palabras, reportar y bloquear (ícono del candado junto a cada miembro). Con cuenta se pide consentimiento para los datos sensibles (creencias religiosas). Google Calendar es opcional (Tu día → Conectar Google Calendar). Scaeli+ (Más → Scaeli+) es una suscripción auto-renovable con compra de Apple (StoreKit, vía RevenueCat): desbloquea Tu progreso (Hoy → Tu progreso y tus virtudes) y el Camino de Adviento. Restaurar compras está en la misma pantalla. Las donaciones (Más → Ayudar a Scaeli) son compras consumibles que no desbloquean nada.»
- **Cifrado de exportación:** «No usa cifrado propio» (solo HTTPS) → en Xcode ya queda `ITSAppUsesNonExemptEncryption = NO`.
- **Funciones nativas** (para la guía 4.2): avisos locales programados, entrada con Apple/Google nativa, funciona sin conexión.

## Compras dentro de la app (Scaeli+ y donaciones)
- **App Store Connect → Suscripciones:** grupo «Scaeli+», dos suscripciones auto-renovables: `scaeli_plus_mensual` (1 mes, USD 2,99) y `scaeli_plus_anual` (1 año, USD 19,99). Nombre visible: «Scaeli+ mensual» / «Scaeli+ anual». Descripción: «Tu progreso, tus virtudes y caminos guiados». Captura para la revisión: la pantalla de Scaeli+ (`tienda/` → captura de Más → Scaeli+).
- **App Store Connect → Compras dentro de la app:** tres **consumibles**: `scaeli_donacion_1` (USD 1,99, «Donación»), `scaeli_donacion_2` (USD 4,99, «Donación»), `scaeli_donacion_3` (USD 9,99, «Donación»).
- **App Store → Información de la app:** cargar la URL de los términos (https://daily.scaeli.com.ar/terminos.html) en «Contrato de licencia» o en la descripción, y la de privacidad. Apple pide los dos enlaces cuando hay suscripciones.
- **Play Console → Monetizar → Productos → Suscripciones:** `scaeli_plus` con dos planes base: `mensual` (renovación mensual, USD 2,99) y `anual` (renovación anual, USD 19,99). **Productos integrados (únicos):** los mismos tres `scaeli_donacion_1/2/3`, marcados como consumibles en RevenueCat.
- **Precios locales:** dejá que cada tienda convierta a pesos y demás monedas (o ajustalos a mano en Argentina).
- **Edad:** las compras quedan sujetas a los controles parentales de cada tienda; no hace falta cambiar la clasificación.

## Contenido y derechos (2.1)
- Todos los textos bíblicos son de la Biblia Platense; de Evangelizo solo se toman las citas del día. La Liturgia de las Horas se abre como enlace externo (no está copiada). Novenas, examen y caminos son textos propios. Detalle en Más → Créditos y licencias y en `LICENCIAS-TERCEROS.md`.
- Tipografías dentro de la app (OFL), sin Google Fonts. El sitio está alojado en GitHub Pages.
