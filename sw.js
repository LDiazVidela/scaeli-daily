// Service worker: la app funciona sin señal. El índice se busca primero en la red (para recibir versiones nuevas) y cae al caché.
// Los Evangelios (evangelio/*.json) y las Horas se guardan al pasar, así quedan los días ya vistos.
const VERSION = "scaeli-daily-v20";
const SHELL = ["./", "./index.html", "./css/app.css", "./js/app.js", "./js/firebase.js", "./js/nativo.js", "./vendor/firebase/firebase-app.js", "./vendor/firebase/firebase-auth.js", "./vendor/firebase/firebase-firestore.js", "./privacidad.html", "./terminos.html", "./data/plus.js", "./data/habitos.js", "./data/oraciones_mas.js", "./data/libros.js", "./data/novenas.js", "./data/examen.js", "./data/misa.js", "./data/juego.js", "./data/propio.js", "./data/santos.js", "./data/santoral.js", "./data/santoral-mas.js", "./biblia/indice.json", "./js/personaje.js", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./assets/logo-daily.png", "./assets/logo-horizontal.png",
  "./assets/personaje/m.png", "./assets/personaje/f.png", "./assets/personaje/pj.json",
  ...["manana","mediodia","tarde","noche","evangelio","rosario","horas","oraciones","novenas","examen","confesion","misa","santo","biblia","gozosos","luminosos","dolorosos","gloriosos"].map((k) => "./assets/ilus/daily_" + k + ".png")];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  const horas = url.hostname === "liturgiadelashoras.github.io";
  // la Biblia (biblia/*.json) y las Horas (horas/*.json) se guardan al pasar: lo leído queda para leer sin señal
  if (url.origin !== location.origin && !horas) return; // Firebase y fuentes van directo a la red
  e.respondWith(
    fetch(e.request).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); } return res; })
      .catch(() => caches.match(e.request).then((r) => r || (horas ? Response.error() : caches.match("./index.html"))))
  );
});
