import * as E from './engine.js';
import * as K from './city.js';
import * as R from './rome.js';
import * as M from './medieval.js';
const {mulberry,hash2,lerp,clamp,B,C,heightAt,riverDist,rotTo,rotXZ,NO}=E;
const SH='<path d="M2 2h20v14c0 6-5 9-10 11C7 25 2 22 2 16z"';
const EAGLE='<path d="M12 6l-1.6 3L3.5 8l3.5 4-2 4 5-2 2.5 5 2.5-5 5 2-2-4 3.5-4-6.900 1z" fill="#f0cf6a"/>';
E.setup({
  marsh:false,dryness:0.9,
  cards:[
   {t0:0,   t1:2.8, y0:476, y1:520, title:"After the Fall",sub:"A barbarian general deposed the last western emperor in 476. Rome never again ruled an empire."},
   {t0:2.8, t1:5.2, y0:520, y1:570, title:"The Gothic War",sub:"In 537 the Goths cut the aqueducts. Rome, once a million strong, shrank to a few thousand."},
   {t0:5.2, t1:7.6, y0:570, y1:800, title:"Rome of the Popes",sub:"Churches rose where temples stood, and the popes became the city's true rulers."},
   {t0:7.6, t1:10,  y0:800, y1:1084,title:"Raiders and a Wall",sub:"Saracens plundered St. Peter's in 846. Pope Leo IV ringed the Vatican with a wall."},
   {t0:10,  t1:12.4,y0:1084,y1:1300,title:"A City of Towers",sub:"Noble clans built fortress towers among the ruins, and cows grazed in the Forum."},
   {t0:12.4,t1:14.8,y0:1300,y1:1450,title:"Popes in Avignon",sub:"For seventy years the popes lived in France. In 1349 an earthquake toppled the Colosseum's wall."},
   {t0:14.8,t1:17.4,y0:1450,y1:1526,title:"The Renaissance",sub:"In 1506 Pope Julius II began a new St. Peter's, tearing down the ancient basilica."},
   {t0:17.4,t1:19.6,y0:1526,y1:1590,title:"The Sack of Rome",sub:"Imperial troops sacked Rome in 1527. Sixtus V later cut straight streets and raised obelisks."},
   {t0:19.6,t1:22.6,y0:1590,y1:1700,title:"Baroque Rome",sub:"Michelangelo's dome crowned St. Peter's and Bernini's colonnade embraced the square."},
   {t0:22.6,t1:26,  y0:1700,y1:1800,title:"The Grand Tour",sub:"Piazzas, fountains and the Spanish Steps made Rome the favourite stage of Europe."},
   {t0:26,  t1:30,  y0:1800,y1:1871,title:"Capital of Italy",sub:"In 1870 Italian troops entered through Porta Pia, and Rome became the capital of a united Italy."},
  ],
  pop:[[476,80000],[500,60000],[537,40000],[550,30000],[600,25000],[800,30000],[1000,35000],[1100,30000],[1200,35000],[1300,30000],[1377,20000],[1450,30000],[1527,55000],[1530,35000],[1600,100000],[1700,140000],[1800,160000],[1850,180000],[1871,226000]],
  polities:[
   {from:-9999,name:"Kingdom of Odoacer",svg:`<svg viewBox="0 0 24 28">${SH} fill="#3d2a7a" stroke="#e9d6a1" stroke-width="1.4"/>${EAGLE}</svg>`},
   {from:493,name:"Ostrogothic Kingdom",svg:`<svg viewBox="0 0 24 28">${SH} fill="#1f5a3a" stroke="#e9d6a1" stroke-width="1.4"/><path d="M12 5v17M7 9h10" stroke="#f0cf6a" stroke-width="2.2"/></svg>`},
   {from:538,name:"Byzantine Empire",svg:`<svg viewBox="0 0 24 28">${SH} fill="#6a1f6e" stroke="#e9d6a1" stroke-width="1.4"/><path d="M12 5l-1.4 3-6.600-1 3.200 4-1.600 4.400 4.800-1.800 1.600 4.800 1.600-4.800 4.800 1.800-1.600-4.400 3.200-4-6.600 1z" fill="#f0cf6a"/></svg>`},
   {from:756,name:"Papal States",svg:`<svg viewBox="0 0 24 28">${SH} fill="#a3221f" stroke="#e9d6a1" stroke-width="1.4"/><path d="M8 20l8-12M16 20L8 8" stroke="#f0cf6a" stroke-width="2"/><circle cx="8" cy="8" r="2" fill="none" stroke="#f0cf6a" stroke-width="1.3"/><circle cx="16" cy="8" r="2" fill="none" stroke="#e8e8e8" stroke-width="1.3"/></svg>`},
   {from:1870,name:"Kingdom of Italy",svg:`<svg viewBox="0 0 24 28">${SH} fill="#c4262b" stroke="#e9d6a1" stroke-width="1.4"/><path d="M12 5v17M6 13h12" stroke="#f4f0e4" stroke-width="3.2"/></svg>`},
  ],
  camera:{
    dist:[[0,86],[6,82],[12,76],[16,64],[22,66],[30,74]],
    elev:[[0,44],[10,42],[16,38],[30,40]],
    az:[[0,22],[10,12],[16,6],[24,2],[30,-4]],
    tx:[[0,3],[8,-4],[14,-26],[18,-42],[24,-38],[30,-32]],tz:[[0,7],[8,0],[14,-8],[18,-12],[24,-10],[30,-6]],
  },
});
const rr=mulberry(777);
/* ---- the same Roman city as at the end of part 1, decaying ---- */
const AQ={'-312':537,'-272':537,'-144':600};
const city=R.buildRome({
  mon:{circus:1060,aqueduct:y=>AQ[y],servian:900,jupiter:1000,basilica:820,
    colosseumDie:(t,s)=>{if(t>=1&&s.frac>0.36&&s.frac<0.66)return 1349;if(t>=2&&hash2(s.i,7)<0.7)return 1480+hash2(s.i,9)*260;if(t===3&&hash2(s.i,5)<0.7)return 1400+hash2(s.i,3)*300;return undefined}},
  slot:{minH:0.28,marsh:1},
});
const fires=[...R.FIRES_DEF.map(f=>({...f,t0:-10})),
  {year:846,x:-58,z:-22,r:8,dur:1.4,rebuild:false},{year:1084,x:10,z:12,r:14,dur:1.6,rebuild:false},{year:1527,x:-26,z:-8,r:15,dur:2.0,rebuild:true}]
  .map(f=>({...f,t0:f.t0??B(f.year)}));
const NF0=R.FIRES_DEF.length;
const aliveRoman=h=>h.b<=476&&!(h.dieY!=null&&h.dieY<476)&&!(h.fire&&!h.fire.rebuild);
const roman=city.houses;
/* ---- landmarks ---- */
function spot(cx,cz,rad,w,d,tries=400){
  for(let i=0;i<tries;i++){const a=rr()*Math.PI*2,r=Math.sqrt(rr())*rad,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,ry=rr()*Math.PI;
    if(riverDist(x,z)<5||heightAt(x,z)<0.6)continue;
    if(!K.slopeOK(x,z,w,d,ry,1.4))continue;
    if(K.collide(K.rect(x,z,w/2+0.4,d/2+0.4,ry),0.2).length)continue;
    return [x,z,ry]}
  return null;
}
for(const [cx,cz,yr,o] of [[30,15,324,{len:6,wid:3,wall:'#dccaa2'}],[23,-9,432,{len:5,wid:2.6}],[-50,12,1140,{len:4,wid:2.2,wall:'#e0b878'}],[16,10,1100,{len:3.6,wid:2}],[-16,-10,1280,{len:4,wid:2.2}],[-9,-5,1584,{len:4.2,wid:2.4,dome:true,wall:'#e6d3ae'}],[22,-19,1650,{len:3,wid:2.2,dome:true,wall:'#e3d1ab'}],[6,-15,1660,{len:2.8,wid:2.2,dome:true,wall:'#e8d5ae'}],[-40,-2,1530,{len:3.2,wid:2,dome:true}]]){
  const p=spot(cx,cz,6,(o.len||4)+2,(o.wid||2)+1.6);if(p)M.church(p[0],p[1],p[2],yr,o);
}
for(let i=0;i<14;i++){const p=spot(C[0]+(rr()-0.5)*50,C[1]+(rr()-0.5)*44,5,1.6,1.6,80);if(p)M.tower(p[0],p[1],1100+rr()*200,3.8+rr()*2.4)}
M.stPeters(-62,-24,rotTo(1,0.05),1550,1506);
M.leonineWall(-62,-24,12,852);
M.bastions(-37,-17,1495);
M.capitoline(-12,-4,1538);
M.navona(-27,-11,1650);
M.trevi(-4,-19,1762);
M.spanishSteps(9,-28,1725);
{const f=E.frame(3,heightAt(3,-22),-22,0.3,B(1583),1.3);K.reg(K.rect(3,-22,4.2,2.6,0.3,{mon:1,late:1583}));M.palazzo(f,0,0,6.8,3.0,3,0.9,'#e0c9a0','#a8512f',0,{},0,{flat:false,P:0.5})}
M.obelisk(31,19,1588,3.0);M.obelisk(24,-6,1587,3.0);M.obelisk(-8,-33,1589,3.0);
R.bridge(15,1475,true);
/* Roman houses that stand where a later monument rises are cleared when it is built */
for(const h of roman){
  if(h.dead)continue;
  const late=K.collide(K.rect(h.x,h.z,h.w/2,h.d/2,h.ry),0).filter(o=>o.late>476);
  if(late.length)h.landmark=Math.min(...late.map(o=>o.late));
}
for(const h of roman){
  if(!aliveRoman(h)){h.dead=true;continue}
  h.fire=null;
  const nearTiber=Math.hypot(h.x+24,h.z+8)<12;
  if(nearTiber&&rr()<0.55)h.dieY=null;else h.dieY=480+Math.pow(rr(),1.4)*680;
  if(h.landmark!==undefined)h.dieY=Math.min(h.dieY??9999,h.landmark-0.6);
}
/* ---- new districts: Campo Marzio, Trastevere, the Borgo, and Sixtus V's straight streets ---- */
function district(cx,cz,n,len,w=0.85){
  for(let k=0;k<n;k++){
    const a=k/n*Math.PI*2+rr()*0.6,pts=[[cx,cz]];let ang=a;
    for(let r=2.4;r<=len;r+=2.6){ang+=(rr()-0.5)*0.5;const [px,pz]=pts[pts.length-1];pts.push([px+Math.cos(ang)*2.6,pz+Math.sin(ang)*2.6])}
    K.makeRoad(pts,w,99999,0,'minor');
  }
}
district(-24,-8,9,17);district(-18,-20,5,12);district(-30,2,5,12);district(-51,12,7,11);district(-55,-14,6,10);district(8,-14,4,10);
function straight(p0,p1,year){const L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]),n=Math.round(L/3),pts=[];for(let i=0;i<=n;i++)pts.push([lerp(p0[0],p1[0],i/n),lerp(p0[1],p1[1],i/n)]);const r=K.makeRoad(pts,1.3,year,0,'main');r.fixed=year;return r}
straight([-4,-36],[-12,-8],1586);straight([30,22],[28,-12],1586);straight([28,-14],[9,-26],1587);straight([9,-26],[-2,-16],1590);
/* ---- new houses ---- */
const newH=[];
for(const r of K.roads){if(r.houses.length||r.emitted)continue;
  const s=K.houseSlots(r,{soft:true,minH:0.28,marsh:1,skip:0.1,wmin:1.25,wvar:0.7,dmin:1.1,dvar:0.4,start:1.2});
  s.forEach(h=>r.houses.push(h));newH.push(...s)}
const areas=[[-24,-8,18,0.9],[-51,12,10,1],[-55,-14,9,1],[-18,-22,10,1],[-6,-22,12,1],[10,-16,8,1],[20,-4,9,1]];
newH.push(...K.infill(16000,h=>true,{areas,soft:true,minH:0.28,marsh:1,wmin:1.2,wvar:0.7,dmin:1.05,dvar:0.4,maxD:90}));
const BUILT2=[[476,0],[800,0.04],[1100,0.12],[1300,0.2],[1420,0.26],[1500,0.42],[1527,0.5],[1600,0.72],[1700,0.9],[1800,1.0]];
const yearOf=f=>{for(let i=0;i<BUILT2.length-1;i++){const [y0,f0]=BUILT2[i],[y1,f1]=BUILT2[i+1];if(f<=f1)return lerp(y0,y1,(f-f0)/(f1-f0+1e-9))}return 1800};
for(const h of newH)h.score=Math.hypot(h.x+24,h.z+8)*(h.x<-40?0.7:1)+(rr()-0.5)*7;
newH.sort((a,b)=>a.score-b.score);
newH.forEach((h,i)=>{h.b=yearOf((i+0.5)/newH.length);h.frac=(i+0.5)/newH.length});
const finalNew=[];
for(const h of newH){
  let ok=true;
  for(const s of h.soft||[]){if(s.dead)continue;if(s.dieY==null){ok=false;break}h.b=Math.max(h.b,s.dieY+1.5)}
  if(!ok||h.b>1850)continue;
  if(h.clear!==undefined&&h.b>=h.clear-1)continue;
  K.dress(h);
  if(h.clear!==undefined)h.dieY=h.clear-0.6;
  else for(let fi=NF0;fi<fires.length;fi++){const f=fires[fi],dd=Math.hypot(h.x-f.x,h.z-f.z);
    if(dd<f.r*(0.55+0.45*rr())&&rr()<0.8&&h.b<f.year){h.fire={i:fi,frac:dd/f.r,rebuild:f.rebuild,rd:rr()};break}}
  finalNew.push(h);
}
K.emitRoads();
const all=[...roman.filter(h=>!h.dead),...finalNew];
for(const h of all)K.emitHouse(h,fires);
M.plots(all,16,700,1150,{die:1640});
M.cows(700,8);
R.scatterTrees(all,{marsh:false,n:1500});
E.start(fires);
window.__dbg=()=>({roman:roman.length,alive:roman.filter(h=>!h.dead).length,newH:finalNew.length});
