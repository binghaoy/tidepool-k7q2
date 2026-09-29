const VERSION='tp-dashboard-20260929-5';
const CORE=['./','index.html','booking.html','booking-redirect.js','styles.css','core.js','app.js','maps.js','conditions.js','offline.js','data/init.js','data/trip.js','data/portland.js','data/ride.js','data/bay.js','data/la.js','data/plans.js','data/photos.js','leaflet.css','leaflet.js','manifest.json','icon-180.png','icon-192.png','icon-512.png'];
const TILE='tp-tiles-v2',PHOTO=VERSION+'-photos';
const regions={portland:['p11','p12','p13','p14','p15','p16','p17','p18','p20','p23','p25','p26','p27','p28','p29','p30','p31'],ride:['p00','p01','p02','p03','p04','p05','p06','p07','p08','p09','p10'],bay:[],la:[]};
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('tp-')&&![VERSION,TILE,PHOTO].includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
const isTile=u=>/^(?:webrd0[1-4]\.is\.autonavi\.com|tile\.openstreetmap\.org|mt[0-3]\.google\.com)$/.test(u.hostname);
async function tileFetch(request){const c=await caches.open(TILE),hit=await c.match(request);if(hit)return hit;const r=await fetch(request);if(r.ok||r.type==='opaque'){await c.put(request,r.clone());const keys=await c.keys();if(keys.length>240)await Promise.all(keys.slice(0,keys.length-240).map(k=>c.delete(k)));}return r;}
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);if(e.request.method!=='GET')return;
 if(isTile(u)){e.respondWith(tileFetch(e.request).catch(()=>Response.error()));return;}
 if(u.origin!==location.origin)return;
 // Only known public assets are cached; private imports never enter this handler.
 const path=u.pathname.slice(new URL(self.registration.scope).pathname.length);
 if(e.request.mode==='navigate'){
  const target=path==='booking.html'?'booking.html':'index.html';
  e.respondWith(caches.open(VERSION).then(async c=>(await c.match(target))||fetch(e.request)));return;
 }
 if(CORE.includes(path)){e.respondWith(caches.open(VERSION).then(async c=>(await c.match(path))||fetch(e.request)));return;}
 if(/^photos\/p\d+\.jpg$/.test(path)){e.respondWith(caches.open(PHOTO).then(async c=>{const hit=await c.match(path);if(hit)return hit;const r=await fetch(e.request);if(r.ok)await c.put(path,r.clone());return r;}));}
});
self.addEventListener('message',e=>{
 const reply=data=>e.ports[0]?.postMessage(data);
 if(e.data?.type==='STATUS')e.waitUntil((async()=>{const c=await caches.open(VERSION);const checks=await Promise.all(CORE.map(f=>c.match(f)));const pc=await caches.open(PHOTO);const ready={};for(const [region,files] of Object.entries(regions))ready[region]=(await Promise.all(files.map(f=>pc.match('photos/'+f+'.jpg')))).every(Boolean);const tiles=await(await caches.open(TILE)).keys();reply({type:'STATUS',version:VERSION,ready:checks.every(Boolean),regions:ready,tiles:tiles.length});})().catch(()=>reply({error:'无法读取缓存状态'})));
 if(e.data?.type==='CACHE_REGION')e.waitUntil((async()=>{const files=regions[e.data.region];if(!files)throw Error('region');const c=await caches.open(PHOTO);let failed=0;for(const f of files){try{const path='photos/'+f+'.jpg';const response=await fetch(path,{cache:'reload'});if(!response.ok)throw Error('fetch');await c.put(path,response);}catch(_){failed++;}}reply({type:'REGION_DONE',region:e.data.region,failed,total:files.length});})().catch(()=>reply({error:'缓存失败，请联网重试'})));
});
