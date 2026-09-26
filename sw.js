const V='tp-154596ff';
const CORE=['./','index.html','booking.html','leaflet.css','leaflet.js','manifest.json','icon-180.png','icon-192.png','icon-512.png','photos/p00.jpg','photos/p01.jpg','photos/p02.jpg','photos/p03.jpg','photos/p04.jpg','photos/p05.jpg','photos/p06.jpg','photos/p07.jpg','photos/p08.jpg','photos/p09.jpg','photos/p10.jpg','photos/p11.jpg','photos/p12.jpg','photos/p13.jpg','photos/p14.jpg','photos/p15.jpg','photos/p16.jpg','photos/p17.jpg','photos/p18.jpg','photos/p19.jpg','photos/p20.jpg','photos/p23.jpg','photos/p25.jpg','photos/p26.jpg','photos/p27.jpg','photos/p28.jpg','photos/p29.jpg','photos/p30.jpg','photos/p31.jpg'];
const TILE='tp-tiles';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==TILE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 if(e.request.method!=='GET')return;
 if(/autonavi\.com|openstreetmap\.org|arcgisonline\.com|^mt\d\.google\.com$/.test(u.hostname)){
  e.respondWith(caches.open(TILE).then(c=>c.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{c.put(e.request,r.clone());return r}))));
  return;
 }
 if(u.origin!==location.origin)return;
 e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));
});
