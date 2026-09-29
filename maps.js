/* One Leaflet instance, shared filters, markers and cards for all regions. */
window.TripMap=(()=>{
 let map,layer,baseLayers,region='portland',date='all',markers=new Map();
 function dates(){return TP.days.filter(d=>TP.plans[d.d].region===region||TP.plans[d.d].stops.some(s=>s.region===region));}
 function stopsFor(d){const plan=TP.plans[d];return plan.stops.filter(s=>s.ll&&(s.region===region||(!s.region&&plan.region===region)));}
 function init(){if(map)return true;if(typeof L==='undefined'){$('travel-map').innerHTML='<p class="map-warning">地图库未加载。下方清单和导航仍可使用，联网后刷新。</p>';return false;}
 map=L.map('travel-map',{scrollWheelZoom:false}).setView([45.52,-122.67],10);
 baseLayers={amap:L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',{maxZoom:18,subdomains:['1','2','3','4'],attribution:'&copy; 高德地图'}),osm:L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}),google:L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&hl=zh-CN&gl=US&x={x}&y={y}&z={z}',{maxZoom:20,subdomains:['0','1','2','3'],attribution:'&copy; Google'})};
 let selected=Store.read('tp-map-base','amap');if(!baseLayers[selected])selected='amap';$('map-base').value=selected;baseLayers[selected].addTo(map);layer=L.layerGroup().addTo(map);return true;}
 function filters(){const ds=dates();$('map-region').value=region;$('map-day').innerHTML='<option value="all">全部日期</option>'+ds.map(d=>`<option value="${d.d}">${E(d.d.slice(5))} · ${E(d.t)}</option>`).join('');if(date!=='all'&&!ds.some(d=>d.d===date))date=ds[0]?.d||'all';$('map-day').value=date;}
 function show(r,d){region=r;date=d;filters();draw();if(map)setTimeout(()=>map.invalidateSize(),60);}
 function draw(){const ds=dates().filter(d=>date==='all'||d.d===date);$('map-side').innerHTML=ds.map(d=>`<h2>${E(d.d.slice(5))} · ${E(d.t)}</h2>`+stopsFor(d.d).map(s=>stopHTML(s,{map:true})).join('')).join('')||'<p class="muted">这一天没有地图点位。</p>';if(!init())return;layer.clearLayers();markers.clear();const bounds=[];
 for(const d of ds){const stops=stopsFor(d.d),plan=TP.plans[d.d];const group=(TP[region]||[]).find(g=>g.id===plan.group);const color=group?.color||({bay:'#0e9384',portland:'#16a34a',ride:'#e06c1f',la:'#7c5cd6'}[region]);
 const route=group?.route||stops.filter(s=>s.kind==='must'&&!s.transit).map(s=>s.ll);if(route.length>1){L.polyline(route,{color,weight:3,opacity:.65}).addTo(layer);bounds.push(...route);}if(group?.back)L.polyline(group.back,{color,weight:3,dashArray:'6 8',opacity:.4}).addTo(layer);
 stops.forEach((s,i)=>{bounds.push(s.ll);const state=states[s.id];const icon=L.divIcon({className:'',iconSize:[28,28],iconAnchor:[14,14],html:`<div style="background:${state?'#9ca3af':color};border:2px solid white;border-radius:50%;width:28px;height:28px;color:white;text-align:center;line-height:24px;font-weight:700;box-shadow:0 1px 4px #0004">${state==='done'?'✓':state==='skipped'?'↷':i+1}</div>`});const marker=L.marker(s.ll,{icon}).addTo(layer);marker.bindPopup(`<strong>${E(s.t)}</strong><p>${E(d.d.slice(5))} · ${E(s.time)}</p><p>${E(s.why)}</p>${navLink(s)}`);markers.set(s.id,marker);});
 }
 if(region==='ride')TP.fuel.forEach(s=>{L.marker(s.ll,{icon:L.divIcon({className:'',iconSize:[26,26],html:'<span style="font-size:21px">⛽</span>'})}).bindPopup(`<strong>${E(s.t)}</strong><p>${E(s.time)}</p>`).addTo(layer);});
 if(bounds.length)map.fitBounds(L.latLngBounds(bounds).pad(.15));}
 function focus(id){const mk=markers.get(id);if(mk){map.setView(mk.getLatLng(),15);mk.openPopup();$('travel-map').scrollIntoView({block:'center',behavior:'smooth'});}}
 document.addEventListener('change',e=>{if(e.target.id==='map-region'){region=e.target.value;const valid=dates().some(d=>d.d===selectedDate);date=valid?selectedDate:dates()[0]?.d||'all';filters();draw();}if(e.target.id==='map-day'){date=e.target.value;draw();}if(e.target.id==='map-base'&&map){Object.values(baseLayers).forEach(l=>map.removeLayer(l));baseLayers[e.target.value].addTo(map);Store.write('tp-map-base',e.target.value);}});
 return {show,focus,refresh(){if(map&&view==='map')draw();}};
})();
