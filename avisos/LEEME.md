# Servidor de avisos de Scaeli (2.11)

Manda al teléfono, **aunque la app esté cerrada**:

1. los recordatorios que cada uno elige en Yo → Ajustes y más (Evangelio del día, Laudes, Ángelus, Vísperas, Completas), a su hora;
2. los mensajes nuevos del grupo (chat, recordatorios, encuentros y cantos), a los demás miembros.

Es un Worker de Cloudflare (`scaeli-avisos`, plan gratis) con una base D1 (`scaeli-avisos`, id `5d23d505-756a-436b-83ef-8efa17527345`).
Manda los avisos con Firebase Cloud Messaging (push web). En iPhone llegan solo si Scaeli está agregada a la pantalla de inicio.

- `worker.js`: el servidor. Cada minuto (cron) busca a quién le toca un recordatorio; `POST /suscribir`, `/baja`, `/grupo`, `/prueba` (todas con la sesión de Firebase de la persona).
- `schema.sql`: las tablas (ya creadas el 23/11/2026).
- `prueba.mjs`: pruebas sin red (`node --experimental-sqlite avisos/prueba.mjs`); también corren en `pruebas/todo.sh` y antes de cada despliegue.
- `.github/workflows/avisos.yml`: lo despliega solo al subir cambios de `avisos/` a `main` (o a mano desde Actions), y escribe su dirección en `js/avisos-url.js`.

## Ponerlo en marcha (una sola vez, desde la computadora, ~10 minutos)

Hacen falta tres secretos en GitHub. Ninguno se pega en un chat ni en un archivo del repo.

1. **Clave de Firebase** → consola de Firebase, proyecto *scaeli* → ⚙️ Configuración del proyecto → **Cuentas de servicio** → **Generar nueva clave privada** → se baja un archivo `.json`. Abrilo con el Bloc de notas y copiá todo el texto.
2. **GitHub** → repo `scaeli-daily` → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:
   - Nombre `FIREBASE_SA`, valor: el texto del `.json`. Después borrá el archivo de la computadora.
3. **Cloudflare** → dash.cloudflare.com → arriba a la derecha, tu perfil → **Mi perfil** → **Tokens de API** → **Crear token** → plantilla **Editar Cloudflare Workers** → *Continuar al resumen* → **Crear token** → copiá el token.
   - En GitHub, otro secreto: `CLOUDFLARE_API_TOKEN` con ese token.
4. **Id de la cuenta de Cloudflare** → en Cloudflare, **Workers y Pages** → a la derecha, **ID de cuenta** (Account ID) → copialo.
   - En GitHub, otro secreto: `CLOUDFLARE_ACCOUNT_ID`.
5. GitHub → **Actions** → **Servidor de avisos** → **Run workflow**. Tarda un minuto: despliega el servidor, anota su dirección en la app y vuelve a publicar el sitio.
6. En el iPhone: abrí Scaeli **desde el ícono de la pantalla de inicio** → Yo → Ajustes y más → prendé **Avisos** → *Permitir* → **Mandarme un aviso de prueba**.

## Si algo no llega

- iPhone: tiene que ser iOS 16.4 o más nuevo y la app abierta desde la pantalla de inicio (no desde Safari). En Ajustes del iPhone → Notificaciones → Scaeli, que estén permitidas.
- En la app, apagá y prendé **Avisos** (renueva el permiso y el registro del teléfono).
- Cloudflare → Workers y Pages → `scaeli-avisos` → **Registros** (Logs): ahí se ve cada minuto del cron y cada aviso del grupo.
- La base: Cloudflare → D1 → `scaeli-avisos` → consola: `SELECT uid, plat, datetime(act/1000,'unixepoch') FROM subs;` muestra los teléfonos anotados.
