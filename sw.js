// Service worker Whatsschat: notifikasi pesan + cache supaya aplikasi bisa dibuka cepat dan tampil saat offline.
const V = "wsc-v2";
const SHELL = ["./", "index.html", "css/style.css", "css/ai.css", "js/script.js", "js/ai.js", "js/pwa.js", "js/trail.js", "js/firebase-config.js", "manifest.json", "assets/logo.jpg", "assets/icon-192.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin || u.pathname.includes("/api/")) return;
  e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })
    .catch(() => caches.match(r).then(m => m || (r.mode === "navigate" ? caches.match("index.html") : Response.error()))));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const ch = e.notification.data && e.notification.data.ch;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) { if ("focus" in c) { await c.focus(); if (ch) c.postMessage({ type: "open", ch }); return; } }
    if (self.clients.openWindow) await self.clients.openWindow("./" + (ch && ch !== "test" ? "?ch=" + encodeURIComponent(ch) : ""));
  })());
});
