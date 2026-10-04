/* Kitchen Cleanup, offline.
   The whole app is a handful of static files, so the service worker keeps a
   copy of all of them. A file added to the app must be added to SHELL too,
   or an installed copy will not have it offline. The page and
   the four CSV files (shifts, students, roles, settings) are fetched fresh
   whenever there is a network (racing a 2.5-second timer, so a slow
   connection cannot hang the launch). Editing a CSV needs no change here.

   Bump CACHE whenever index.html, the data file's name or this file changes.
   The new worker then replaces the old one and reloads any page the old one
   left open, so no phone is stuck on an old page asking for files that are
   gone. */
var CACHE = "kitchen-v19";
var SHELL = [
  "./",
  "index.html",
  "shifts.csv",
  "students.csv",
  "roles.csv",
  "settings.csv",
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
  /* cache:"reload" skips the browser's HTTP cache, which GitHub Pages lets
     keep a file for 10 minutes, so a new worker never stores an old page */
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(SHELL.map(function (u) { return new Request(u, { cache: "reload" }); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  var update = false;
  var ready = caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) {
      if (k === CACHE) return null;
      update = true;
      return caches.delete(k);
    }));
  }).then(function () { return self.clients.claim(); });
  e.waitUntil(ready);
  /* An update, not a first install: reload the pages the old version drew.
     This must stay outside waitUntil. A reload is a fetch, and this worker
     can't answer fetches until it has finished activating, so waiting on
     the reload inside activation would leave both waiting for ever. */
  ready.then(function () {
    if (!update) return;
    return self.clients.matchAll({ type: "window" }).then(function (wins) {
      wins.forEach(function (w) { if (w.navigate) w.navigate(w.url).catch(function () {}); });
    });
  });
});

/* Network first, with the cached copy if the network fails, errors or is slow. */
function fresh(req, key) {
  return caches.open(CACHE).then(function (c) {
    var net = fetch(req, { cache: "no-cache" }).then(function (r) {
      if (r.ok) { c.put(key, r.clone()); return r; }
      return c.match(key).then(function (hit) { return hit || r; });
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
  var csv = url.pathname.match(/\/(shifts|students|roles|settings)\.csv$/);
  if (csv) { e.respondWith(fresh(req, csv[1] + ".csv")); return; }

  /* Everything else (fonts, icons) never changes at its URL: cache first. */
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    return hit || fetch(req);
  }));
});
