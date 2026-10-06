// 40-second vertical short about Moscow: today -> rewind to 1147 -> the city grows again.
import * as E from './engine.js';
const {lerp,clamp}=E;
const VD=40;
const YK=[[0,2026],[1.4,2026],[3.0,1147],[5.5,1330],[8,1420],[10.6,1515],[12.4,1552],[14.6,1565],[16.5,1700],[18.5,1812.6],[19.9,1813.5],[22,1890],[23,1935],[25.2,1957],[27.4,1970],[29.8,1990],[32.6,2005],[35.5,2018],[38,2025],[40,2026]];
function yearOfVideo(t){
  for(let i=0;i<YK.length-1;i++){const [t0,y0]=YK[i],[t1,y1]=YK[i+1];
    if(t<=t1){const u=clamp((t-t0)/(t1-t0));if(i===1){const s=u*u*(3-2*u);return lerp(y0,y1,s)}return lerp(y0,y1,u)}}
  return 2026;
}
const CAM=[[0,230,46,0,0,0],[1.4,210,46,25,0,0],[3.0,70,40,-20,0,0],[5.5,34,34,20,0,-1],[8,30,32,-25,0,-1],[10.6,34,34,30,3,0],
  [12.4,36,44,60,8,2],[14.6,28,46,45,10.8,3.6],[16.5,95,46,10,0,10],[18.5,72,44,-10,0,0],[19.9,62,42,10,0,-2],[22,50,38,25,-2,-6],[23.2,70,36,0,-20,30],
  [25.2,52,34,-20,-34,64],[27.4,56,18,20,4,-82],[29.8,170,46,0,0,0],[32.6,95,28,-40,-52,-12],[35.5,80,24,-65,-52,-12],[38,210,46,20,0,0],[40,235,46,30,0,0]];
const camera={dist:[],elev:[],az:[],tx:[],tz:[]};
for(const [t,d,el,az,tx,tz] of CAM){camera.dist.push([t,d]);camera.elev.push([t,el]);camera.az.push([t,az]);camera.tx.push([t,tx]);camera.tz.push([t,tz])}
const TITLES=[[0.15,1.4,'Moscow, today'],[1.5,3.0,'How did it start?'],[3.1,5.5,'A wooden fort'],[5.6,8,'White-stone Kremlin'],[8.1,10.6,'Red brick walls'],
  [10.7,12.4,'Ivan the Great'],[12.5,14.6,"St. Basil's"],[14.7,16.5,'Monasteries'],[16.6,18.5,'A wooden city'],[18.6,19.9,'The fire of 1812'],[20,22.9,'Rebuilt in stone'],
  [23,25.2,"Stalin's skyscrapers"],[25.3,27.4,'Ostankino Tower'],[27.5,29.8,'Panel blocks'],[29.9,32.5,'The ring road'],[32.6,35.5,'Moscow City'],[35.6,38,'Glass towers'],[38.1,39.9,'13 million people']];
window.__SHORTCFG={videoDur:VD,camVideo:true,fireVideo:true,fire:{t0v:18.62,durv:1.6},noClouds:true,camera,labelsFrom:3.2,
  timeMap:t=>E.B(yearOfVideo(t)),
  titleAt:t=>{for(const [t0,t1,text] of TITLES)if(t>=t0&&t<=t1)return {t0,t1,text};return null}};
await import('./moscow.js');
