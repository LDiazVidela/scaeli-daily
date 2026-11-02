# Scaeli Daily para Google Play y App Store

Esta carpeta es la app de las tiendas (Capacitor 8). Por dentro es la misma app web de la carpeta de arriba: `copiar.mjs` la copia a `www/` y Capacitor la mete en la app de Android (`android/`) y de iPhone (`ios/`). Lo que cambia en el teléfono:

- **Avisos del teléfono** (`@capacitor/local-notifications`): mañana, noche y tareas con hora; llegan aunque la app esté cerrada.
- **Entrada nativa con Google y Apple** (`@capacitor-firebase/authentication`, con `skipNativeAuth`: el teléfono da la credencial y la app entra a Firebase con el mismo SDK web).
- **Sin conexión**: todo viene adentro de la app; los Evangelios del día se leen de `https://ldiazvidela.github.io/scaeli-daily/evangelio/`.
- **Borrar cuenta**: Más → Borrar mi cuenta (lo piden las dos tiendas).

Identificador: `io.github.ldiazvidela.scaelidaily` (se puede cambiar en `capacitor.config.json` **antes** de la primera subida; después, no).

## Qué necesitás en tu compu
- Node 20 o más nuevo.
- **Android:** Android Studio (trae el SDK 36 y Java 21).
- **iPhone:** una Mac con Xcode 16.3 o más nuevo, y la cuenta de Apple Developer (USD 99 por año).

Primera vez, dentro de esta carpeta: `npm install`.

## 1 · Firebase (una sola vez)
En https://console.firebase.google.com → proyecto **scaeli**:

1. **Agregar app Android** con el paquete `io.github.ldiazvidela.scaelidaily`. Cargá las huellas **SHA-1 y SHA-256** de tu llave de firma (Android Studio → Gradle → `signingReport`) **y** las de la llave de Google Play (Play Console → Configuración → Integridad de la app → Firma de apps). Bajá `google-services.json` y ponelo en `android/app/`.
2. **Agregar app iOS** con el mismo identificador. Bajá `GoogleService-Info.plist` y arrastralo en Xcode a `App/App` (marcá «Copy items if needed»).
3. **Authentication → Sign-in method:** Google ya está. Activá **Apple**: en https://developer.apple.com → Certificates, IDs & Profiles creá un **Services ID** (por ejemplo `io.github.ldiazvidela.scaelidaily.web`) con «Sign in with Apple» y como Return URL `https://scaeli.firebaseapp.com/__/auth/handler`; creá una **Key** con «Sign in with Apple» y cargá en Firebase el Services ID, tu Team ID, el Key ID y el archivo .p8.
4. **Authentication → Settings → Dominios autorizados:** que esté `ldiazvidela.github.io`.
5. **Extensiones → «Delete User Data»** (de Firebase): instalala con la ruta de Firestore `users/{UID}` y borrado recursivo. Así, cuando alguien borra su cuenta, se borra también lo de Scaeli Fit y del juego.

## 2 · iPhone (Xcode)
`npm run ios` (copia la web, sincroniza y abre Xcode). En Xcode, target **App**:
- **Signing & Capabilities:** elegí tu Team; agregá **Sign in with Apple**.
- **Info → URL Types:** agregá uno con el valor de `REVERSED_CLIENT_ID` que está dentro de `GoogleService-Info.plist` (lo necesita Entrar con Google).
- Versión y build: `1.4.0` / `1`.
- Probá en un iPhone, después **Product → Archive → Distribute App → App Store Connect**.

## 3 · Android (Android Studio)
`npm run android` (copia la web, sincroniza y abre Android Studio).
- Probá en un teléfono con «Run».
- Para subir: **Build → Generate Signed App Bundle** (.aab). Creá una llave nueva y **guardala con su contraseña en un lugar seguro**: sin ella no podés actualizar la app nunca más (o usá la firma de Google Play, que la guarda por vos).
- `versionCode` y `versionName` están en `android/app/build.gradle`: subí `versionCode` en cada actualización.

## 4 · Cada vez que cambie la app web
`npm run sync` y volvés a compilar en Android Studio / Xcode. Los íconos y la pantalla de inicio salen de `assets/` con `npm run iconos`.

## 5 · Google Play: antes de producción
Con una cuenta personal nueva hay que hacer una **prueba cerrada con al menos 12 personas durante 14 días seguidos** (Play Console → Pruebas → Prueba cerrada). Recién después se pide el acceso a producción. Los textos, capturas y respuestas de los formularios están en `../tienda/`.

## 6 · Scaeli+ y donaciones (RevenueCat)
La app ya trae el plugin `@revenuecat/purchases-capacitor`. Falta crear los productos y poner las claves:
1. **Tiendas:** crear los productos tal como dice `../tienda/formularios.md` → «Compras dentro de la app» (suscripción mensual y anual, y las tres donaciones consumibles). En Apple hace falta tener firmado el acuerdo de «Apps pagas» (Acuerdos, impuestos y banca) y cargada la cuenta bancaria; en Google, el perfil de pagos.
2. **RevenueCat** (app.revenuecat.com, gratis hasta USD 2.500 por mes de ingresos): crear el proyecto «Scaeli», agregar la app de Android (con la cuenta de servicio de Google Play) y la de iOS (con la clave de compras dentro de la app de App Store Connect).
3. **Entitlement** `plus` y adjuntarle las dos suscripciones de cada tienda.
4. **Offering** «default» (actual) con dos paquetes: `$rc_monthly` (las mensuales) y `$rc_annual` (las anuales).
5. Cargar los tres productos de donación (no van en ningún entitlement).
6. Copiar las **claves públicas** (Project settings → API keys: la de Google empieza con `goog_`, la de Apple con `appl_`) en `../js/nativo.js` → `RC_CLAVES`, y `npm run sync`.
7. **Probar:** en Android, con una cuenta de «Pruebas de licencias»; en iPhone, con un usuario de Sandbox. En la app: Más → Scaeli+ → elegir plan; después, borrar y reinstalar y tocar «Restaurar compras».

Mientras `RC_CLAVES` esté vacío, la app muestra la pantalla de Scaeli+ con los planes desactivados y el aviso «Las compras todavía no están activas»: se puede subir igual a una prueba cerrada.
El código de prueba de Scaeli+ (`SCAELI-PRUEBA`) **solo funciona en la web**; en las apps de las tiendas no aparece (Apple no permite desbloquear funciones sin su sistema de compras). La cuenta lorenzodiazvidela@gmail.com tiene Scaeli+ siempre, en la web y en las apps, para probar.

## 7 · Google Calendar
Es un permiso «sensible»: en Google Cloud (proyecto **scaeli**) → Pantalla de consentimiento OAuth → enviar a **verificación** con la política de privacidad, el uso del permiso y un video corto mostrando cómo se usa. Hasta que lo aprueben, solo funciona para los usuarios de prueba que cargues (hasta 100).
