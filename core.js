/* Pure itinerary rules, also exercised by the Node tests. */
(function(root){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function clock(now=new Date(),zone='America/Los_Angeles'){
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
 return {date:`${p.year}-${p.month}-${p.day}`,time:`${p.hour}:${p.minute}`,minutes:+p.hour*60+(+p.minute)};
}
function minutes(t){const m=String(t).match(/(?:^|\s|~)(\d{1,2}):(\d{2})/);return m?+m[1]*60+(+m[2]):null;}
function next(stops,states={},startId=null){let start=startId?stops.findIndex(s=>s.id===startId):0;if(start<0)start=0;if(startId&&stops[start]?.id===startId&&!states[startId])return stops[start];return stops.slice(start).find(s=>!states[s.id]&&s.kind!=='optional'&&s.kind!=='if-time'&&s.kind!=='rain')||null;}
function pressure(date,time,now=new Date(),zone='America/Los_Angeles'){
 const c=clock(now,zone),m=minutes(time);if(c.date!==date||m===null)return '';
 const n=c.minutes-m;return n>0?`比计划时间晚 ${n} 分钟（尚未确认完成）`:n===0?'到计划时间了':`距计划时间 ${-n} 分钟`;
}
function remaining(date,time,now=new Date(),zone='America/Los_Angeles'){
 const c=clock(now,zone),m=minutes(time);if(date!==c.date||m===null)return '';
 const d=m-c.minutes;return d>=0?`剩余 ${Math.floor(d/60)}h ${d%60}m`:`已过 ${-d} 分钟`;
}
function shiftDate(date,amount){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+amount);return d.toISOString().slice(0,10);}
function ics(days){const escape=s=>String(s).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/([,;])/g,'\\$1');const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Tidepool//Travel//ZH','CALSCALE:GREGORIAN'];for(const d of days)lines.push('BEGIN:VEVENT',`UID:day-${d.d}@tidepool`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART;VALUE=DATE:${d.d.replace(/-/g,'')}`,`DTEND;VALUE=DATE:${shiftDate(d.d,1).replace(/-/g,'')}`,`SUMMARY:${escape(d.t)}`,`DESCRIPTION:${escape(d.items.map(x=>x.join(' ')).join('\n'))}`,'END:VEVENT');lines.push('END:VCALENDAR');return lines.map(l=>{let out='',bytes=0;for(const c of l){const n=new TextEncoder().encode(c).length;if(bytes+n>73){out+='\r\n ';bytes=1;}out+=c;bytes+=n;}return out;}).join('\r\n')+'\r\n';}
function normalizeState(value){const clean={};if(!value||typeof value!=='object'||Array.isArray(value))return clean;for(const [k,v] of Object.entries(value))if(typeof k==='string'&&['done','skipped'].includes(v))clean[k]=v;return clean;}
const api={esc,clock,minutes,next,pressure,remaining,shiftDate,ics,normalizeState};if(typeof module!=='undefined')module.exports=api;root.TripCore=api;
})(typeof window!=='undefined'?window:globalThis);
