// 40-second vertical short built on the 4-minute film's world.
// Hook: modern Rome, then time rewinds to empty hills, then the city grows again.
import * as E from './engine.js';
const {lerp,clamp,smooth}=E;
const VD=40;
// video second -> historical year
const YK=[[0,2026],[1.4,2026],[3.0,-753],[5.2,-600],[7.6,-300],[10.4,0],[12.2,70],[14.6,82],[16.8,126],[18.8,300],[21,900],[23.6,1400],[26.8,1630],[29.2,1760],[32,1911],[35,1962],[37.6,2005],[40,2026]];
function yearOfVideo(t){
  for(let i=0;i<YK.length-1;i++){const [t0,y0]=YK[i],[t1,y1]=YK[i+1];
    if(t<=t1){const u=clamp((t-t0)/(t1-t0));
      if(i===1){const s=u*u*(3-2*u);return lerp(y0,y1,s)}          // the rewind eases in and out
      return lerp(y0,y1,u)}}
  return 2026;
}
// camera in video time: [t, dist, elev, az, tx, tz]
const CAM=[[0,190,46,0,0,10],[1.4,175,46,25,0,10],[3.0,95,40,-30,2,8],[5.2,58,36,-10,2,6],[7.6,66,40,15,2,6],[10.4,52,36,25,2,6],
  [12.2,38,32,40,14,3],[14.6,34,30,70,14,3],[16.8,34,44,-20,-12,-16],[18.8,95,46,0,2,6],[21,85,44,-20,-10,0],[23.6,50,36,25,-6,0],[25.4,42,32,-25,-58,-24],[26.8,40,32,-10,-58,-24],
  [29.2,46,34,10,-30,-12],[32,85,42,25,-6,-4],[35,140,46,0,0,6],[37.6,190,46,15,0,10],[40,215,46,30,0,10]];
const camera={dist:[],elev:[],az:[],tx:[],tz:[]};
for(const [t,d,el,az,tx,tz] of CAM){camera.dist.push([t,d]);camera.elev.push([t,el]);camera.az.push([t,az]);camera.tx.push([t,tx]);camera.tz.push([t,tz])}
const TITLES=[[0.15,1.4,'Rome, today'],[1.5,3.0,'How did it start?'],[3.1,5.2,'A few huts'],[5.3,7.6,'Villages on the hills'],[7.7,10.4,'Walls and temples'],
  [10.5,12.2,'A city of marble'],[12.3,14.6,'The Colosseum'],[14.7,16.9,'The Pantheon'],[17,18.8,'A million people'],[18.9,21,'The fall'],
  [23.7,26.6,'A city of towers'],[26.7,29.2,"St. Peter's"],[29.3,32,'Baroque Rome'],[32.1,35,'Capital of Italy'],[35.1,37.6,'The boom'],[37.7,39.9,'2.8 million people']];
window.__SHORTCFG={
  videoDur:VD,camVideo:true,noClouds:true,camera,labelsFrom:3.2,
  timeMap:t=>E.B(yearOfVideo(t)),
  titleAt:t=>{for(const [t0,t1,text] of TITLES)if(t>=t0&&t<=t1)return {t0,t1,text};return null},
};
await import('./film.js');
