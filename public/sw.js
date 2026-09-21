// Service worker de Lexio.
// Deux rôles : rendre l'application installable sur mobile, et afficher le
// rappel quotidien même quand l'onglet est fermé.

const CACHE = "lexio-v1";
const COQUILLE = ["/", "/presentation", "/icone-192.png"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(COQUILLE)).catch(() => undefined),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(noms.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

// Réseau d'abord, cache en secours : l'élève garde accès à sa séance dans le
// métro, mais voit toujours la version à jour dès qu'il a du réseau.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  if (req.url.includes("/api/")) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copie = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copie)).catch(() => undefined);
        return res;
      })
      .catch(() => caches.match(req).then((r) => r ?? caches.match("/"))),
  );
});

self.addEventListener("push", (event) => {
  let charge = { titre: "Lexio", corps: "Ta séance de cinq minutes t'attend." };
  try {
    if (event.data) charge = { ...charge, ...event.data.json() };
  } catch {
    /* charge illisible : on garde le message par défaut */
  }
  event.waitUntil(
    self.registration.showNotification(charge.titre, {
      body: charge.corps,
      icon: "/icone-192.png",
      badge: "/icone-192.png",
      lang: "fr",
      tag: "lexio-rappel",
      renotify: true,
      data: { url: charge.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const cible = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((fenetres) => {
      for (const f of fenetres) {
        if (f.url.includes(self.location.origin) && "focus" in f) {
          f.navigate(cible);
          return f.focus();
        }
      }
      return self.clients.openWindow(cible);
    }),
  );
});
