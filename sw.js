/* Kitchen Cleanup, offline.
   The whole app is a handful of static files, so the service worker keeps a
   copy of all of them. A file added to the app must be added to SHELL too,
   or an installed copy will not have it offline. The page and roster.csv are
   fetched fresh whenever there is a network (racing a 2.5-second timer, so a
   slow connection cannot hang the launch), so edits to either show up without
   touching this file. Bump CACHE only to make every client drop its copy. */
var CACHE = "kitchen-v1";
var SHELL = [
  "./",
  "index.html",
  "roster.csv",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/icon-32.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
  "fonts/inter-latin.woff2",
  "fonts/inter-latin-ext.woff2",
  "fonts/playfair-display-latin.woff2",
  "fonts/playfair-display-latin-ext.woff2",
  "fonts/playfair-display-italic-latin.woff2",
  "fonts/playfair-display-italic-latin-ext.woff2"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

/* Network first, with the cached copy if the network fails or is slow. */
function fresh(req, key) {
  return caches.open(CACHE).then(function (c) {
    var net = fetch(req, { cache: "no-cache" }).then(function (r) {
      if (r.ok) c.put(key, r.clone());
      return r;
    });
    var timer = new Promise(function (resolve) { setTimeout(resolve, 2500); }).then(function () {
      return c.match(key).then(function (hit) { return hit || net; });
    });
    return Promise.race([net, timer]).catch(function () {
      return c.match(key).then(function (hit) { return hit || Promise.reject(new Error("offline")); });
    });
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.mode === "navigate") { e.respondWith(fresh(req, "index.html")); return; }
  if (/\/roster\.csv$/.test(url.pathname)) { e.respondWith(fresh(req, "roster.csv")); return; }

  /* Everything else (fonts, icons) never changes at its URL: cache first. */
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    return hit || fetch(req);
  }));
});
