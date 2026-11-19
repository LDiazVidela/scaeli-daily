// Service worker: la app funciona sin señal. El índice se busca primero en la red (para recibir versiones nuevas) y cae al caché.
// Los Evangelios (evangelio/*.json) y las novenas se guardan al pasar, así quedan los días ya vistos.
const VERSION = "scaeli-daily-v55";
const SHELL = ["./", "./index.html", "./css/app.css", "./css/v2.css", "./js/app.js", "./js/firebase.js", "./js/nativo.js", "./vendor/firebase/firebase-app.js", "./vendor/firebase/firebase-auth.js", "./vendor/firebase/firebase-firestore.js", "./vendor/firebase/firebase-analytics.js", "./vendor/firebase/firebase-messaging.js", "./privacidad.html", "./terminos.html", "./data/plus.js", "./data/retiros.js", "./js/audio.js", "./data/habitos.js", "./data/oraciones_mas.js", "./data/palabra.js", "./data/libros.js", "./data/cancionero.js", "./js/cancionero.js", "./data/catecismo.js", "./data/novenas.js", "./data/examen.js", "./data/misa.js", "./data/juego.js", "./data/propio.js", "./data/santos.js", "./data/santoral.js", "./data/santoral-mas.js", "./biblia/indice.json", "./js/personaje.js", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./data/citas.js", "./assets/fuentes/inter.woff2",
  "./data/cartas.js", "./assets/fuentes/cinzel.woff2", "./assets/fuentes/cormorant-i.woff2",
  ...["abraham","agustin","ambrosio","andres","angelelli","antonio","antula","atanasio","avila","bartololongo","benitaarias","benito","bosco","brochero","camilarolon","carlo","carlosaustria","cayetano","cecilia","ceferino","chiarabadano","chiaracorbella","clara","crisostomo","esquiu","esteban","faustina","francisco","frassati","gabriel","gaudi","ignacio","ines","isabel","javier","jeronimo","jose","josegregorio","joselito","jp2","juan","juana","juanbautista","kolbe","lauravicuna","lazaro","lejeune","lorenzo","lucia","magdalena","mariabetania","marta","miguel","moises","natanael","negromanuel","pablo","pastor","pedro","pio","pironio","porres","rafael","rendiles","reymago","romero","rosa","samaritana","santiago","sebastian","shaw","talbot","tarcisio","teresa","teresita","tomas","tomasmoro","torot","virgenmaria"].map((k) => "./assets/santos/" + k + ".png"),
  ...["hierro","bronce","plata","oro","platino","diamante","celestial","divino"].map((k) => "./assets/rangos/" + k + ".png"),
  "./assets/personaje/m.png", "./assets/personaje/f.png", "./assets/personaje/pj.json", "./assets/personaje/extras.png", "./assets/personaje/m_piel.png", "./assets/personaje/f_piel.png",
  ...["m_nino","f_nino","m_adulto","f_adulto","m_mayor","f_mayor"].flatMap((k) => ["./assets/personaje/" + k + ".png", "./assets/personaje/" + k + "_piel.png"]),
  ...["marco-gloria.png","marco-martir.png","marco-oro.png","marco-plata.png","dorso.webp","sobre.png","album.webp"].map((k) => "./assets/cartas/" + k),
  ...["manana","mediodia","tarde","noche","evangelio","rosario","horas","oraciones","novenas","examen","confesion","misa","santo","biblia","gozosos","luminosos","dolorosos","gloriosos","biblioteca","donar","grupo","camino","cancionero"].map((k) => "./assets/ilus/daily_" + k + ".png")];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // la Biblia (biblia/*.json) y lo que se abre se guarda al pasar: lo leído queda para leer sin señal
  if (url.origin !== location.origin) return; // Firebase y los sitios de afuera van directo a la red (2.1: nada de terceros en el caché)
  e.respondWith(
    fetch(e.request).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); } return res; })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});

// 2.6 · Avisos de Scaeli (push web de Firebase Cloud Messaging). Sin SDK acá: el aviso llega como JSON
// {notification:{title,body,image}, data, fcmOptions:{link}} y se muestra tal cual. Tocar el aviso abre la app (o el enlace del aviso).
self.addEventListener("push", (e) => {
  let p = {}; try { p = e.data ? e.data.json() : {}; } catch (err) { p = {}; }
  const n = p.notification || {}, d = p.data || {}, titulo = n.title || d.title || "Scaeli";
  const link = (p.fcmOptions && p.fcmOptions.link) || n.click_action || d.link || "./";
  e.waitUntil(self.registration.showNotification(titulo, { body: n.body || d.body || "", icon: n.icon || "./icons/icon-192.png", badge: "./icons/icon-192.png", image: n.image || undefined, tag: d.tag || "scaeli-aviso", data: { link } }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close(); const link = new URL((e.notification.data && e.notification.data.link) || "./", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => { const c = cs.find((x) => x.url.startsWith(self.registration.scope)); if (c) { c.focus(); if (link !== c.url && c.navigate) return c.navigate(link); return; } return self.clients.openWindow(link); }));
});
