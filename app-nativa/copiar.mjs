// Copia la app web (la carpeta de arriba) a www/, que es lo que Capacitor mete adentro de la app de Android y de iPhone.
import { cpSync, rmSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const AQUI = dirname(fileURLToPath(import.meta.url)), WEB = join(AQUI, ".."), WWW = join(AQUI, "www");
const LLEVAR = ["index.html", "privacidad.html", "terminos.html", "borrar-cuenta.html", "manifest.webmanifest", "css", "js", "data", "assets", "icons", "vendor", "biblia", "novenas", "libros"];
rmSync(WWW, { recursive: true, force: true }); mkdirSync(WWW, { recursive: true });
for (const x of LLEVAR) if (existsSync(join(WEB, x))) cpSync(join(WEB, x), join(WWW, x), { recursive: true });
console.log("www listo:", LLEVAR.join(", "));
