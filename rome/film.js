import * as E from './engine.js';
import * as K from './city.js';
import * as R from './rome.js';
import * as M from './medieval.js';
import * as MD from './modern.js';
const {mulberry,hash2,lerp,clamp,B,C,heightAt,riverDist,rotTo,rotXZ,NO,THREE}=E;

/* =====================================================================
   1. TIMELINE: 26 chapters of growth, ~4 minutes. Camera keys are given as fractions of each chapter.
   ===================================================================== */
const SPEC=[
 {y0:-753,y1:-700,d:8,title:"The Founding",sub:"Legend says Romulus founded Rome on the Palatine in 753 BC: a few huts above the Tiber marshes.",cam:[[0,[420,34,35,-110,120]],[0.55,[230,34,10,-30,50]],[1,[70,36,-15,3,10]]]},
 {y1:-600,d:7,title:"Villages on the Hills",sub:"Latin and Sabine villages spread over the Palatine, the Capitoline and the Quirinal.",cam:[[0.3,[60,36,-20,2,8]],[1,[75,38,-5,0,4]]]},
 {y1:-509,d:8,title:"The Etruscan Kings",sub:"The Cloaca Maxima drained the marsh. The Forum was paved and a great temple rose on the Capitol.",cam:[[0.2,[45,34,10,-4,4]],[0.65,[38,30,35,-10,-2]],[1,[55,36,40,-8,0]]]},
 {y1:-378,d:8,title:"The Young Republic",sub:"New temples ringed the Forum, and the Servian Wall enclosed the seven hills.",cam:[[0.2,[50,38,20,-4,3]],[0.7,[85,42,0,2,6]],[1,[95,42,-10,2,6]]]},
 {y1:-300,d:6,title:"Water and Roads",sub:"In 312 BC Rome built its first aqueduct, the Aqua Appia, and its first great road, the Appian Way.",cam:[[0.25,[70,40,-40,25,15]],[1,[80,38,-55,30,20]]]},
 {y1:-146,d:8,title:"Mistress of Italy",sub:"Rome grew rich: the Circus Maximus, the first basilicas and ever longer aqueducts.",cam:[[0.2,[55,36,30,-3,14]],[0.6,[45,34,0,-3,0]],[1,[90,40,-20,10,6]]]},
 {y1:-27,d:8,title:"Capital of the Mediterranean",sub:"Half a million people crowded into tall apartment blocks. Caesar rebuilt the Forum.",cam:[[0.25,[75,40,-10,0,4]],[1,[60,36,15,-8,2]]]},
 {y1:64,d:8,title:"A City of Marble",sub:"Augustus boasted he found Rome in brick and left it in marble. Emperors built palaces on the Palatine.",cam:[[0.2,[50,36,20,4,10]],[0.65,[45,32,-20,-18,4]],[1,[80,40,-30,2,6]]]},
 {y1:100,d:8,title:"The Colosseum",sub:"After the great fire of 64, Vespasian began the Colosseum. It opened in 80 AD.",cam:[[0.15,[45,32,25,14,3]],[0.8,[34,28,60,14,3]],[1,[45,32,80,10,3]]]},
 {y1:140,d:8,title:"Trajan and Hadrian",sub:"Trajan's Column, the Pantheon and Hadrian's tomb: Rome at its height, a city of a million.",cam:[[0.15,[45,32,10,-5,-9]],[0.5,[34,30,-10,-12,-16]],[0.82,[40,32,-35,-30,-16]],[1,[60,36,-30,-20,-8]]]},
 {y1:271,d:7,title:"The Baths of Caracalla",sub:"Vast public baths held some sixteen hundred bathers at a time.",cam:[[0.2,[60,36,30,10,22]],[0.55,[40,30,50,14,29]],[1,[70,40,40,8,20]]]},
 {y1:330,d:6,title:"The Aurelian Wall",sub:"A new wall nineteen kilometres long enclosed the city. Constantine built the first great churches.",cam:[[0.2,[110,46,10,2,6]],[0.7,[115,46,-15,-10,0]],[1,[80,40,-30,-30,-10]]]},
 {y1:600,d:8,title:"The Long Decline",sub:"The capital moved east, the aqueducts fell silent, and Rome shrank from a million people to tens of thousands.",cam:[[0.25,[95,42,-15,0,4]],[1,[100,44,10,2,6]]]},
 {y1:1000,d:8,title:"Rome of the Popes",sub:"Fields and vineyards filled the empty hills. In 852 Pope Leo IV walled the Vatican.",cam:[[0.2,[100,44,10,2,6]],[0.6,[75,40,-20,-40,-14]],[1,[60,38,-30,-55,-20]]]},
 {y1:1300,d:8,title:"A City of Towers",sub:"Noble families built fortress towers, and cows grazed among the ruins of the Forum.",cam:[[0.2,[70,40,10,-10,-2]],[0.6,[45,34,30,-4,2]],[1,[80,40,10,-10,0]]]},
 {y1:1450,d:7,title:"Popes in Avignon",sub:"The popes lived in France for seventy years. In 1349 an earthquake toppled part of the Colosseum.",cam:[[0.2,[60,36,40,10,4]],[0.55,[38,30,70,14,3]],[1,[80,40,20,-10,-2]]]},
 {y1:1550,d:8,title:"The Renaissance",sub:"Popes rebuilt the city. In 1506 Julius II began a new St. Peter's on the Vatican hill.",cam:[[0.2,[85,40,0,-30,-8]],[0.5,[50,34,-20,-55,-22]],[0.82,[45,32,30,-14,-4]],[1,[70,38,10,-20,-8]]]},
 {y1:1650,d:9,title:"Domes and Obelisks",sub:"Michelangelo's dome crowned St. Peter's. Sixtus V cut straight streets and raised obelisks.",cam:[[0.15,[55,34,-30,-58,-24]],[0.45,[48,32,-5,-58,-24]],[0.78,[80,40,20,10,-14]],[1,[85,40,0,-10,-12]]]},
 {y1:1700,d:7,title:"Baroque Rome",sub:"Bernini's colonnade embraced St. Peter's Square, and Piazza Navona gained its fountains.",cam:[[0.2,[50,36,-20,-52,-24]],[0.6,[38,32,10,-27,-11]],[1,[60,36,20,-20,-10]]]},
 {y1:1800,d:8,title:"The Grand Tour",sub:"The Spanish Steps and the Trevi Fountain made Rome the favourite stage of European travellers.",cam:[[0.2,[50,34,10,4,-24]],[0.6,[36,30,-10,-2,-20]],[1,[90,40,0,-8,-6]]]},
 {y1:1870,d:8,title:"The Last Papal City",sub:"Rome was still a town of two hundred thousand people inside its ancient walls.",cam:[[0.2,[110,44,-10,-8,0]],[1,[120,44,15,0,4]]]},
 {y1:1911,d:9,title:"Capital of Italy",sub:"New ministries, bridges and whole districts were built. The Vittoriano rose beside the Capitol.",cam:[[0.15,[120,44,10,4,4]],[0.6,[50,34,30,-8,-8]],[1,[130,46,0,0,6]]]},
 {y1:1945,d:9,title:"New Avenues",sub:"Via dei Fori Imperiali cut through the ancient Forum, and the planned district of EUR rose in the south.",cam:[[0.15,[90,40,10,4,0]],[0.55,[60,38,-10,-6,60]],[1,[150,46,-20,0,20]]]},
 {y1:1960,d:9,title:"The Boom",sub:"Termini Station, the Olympic Stadium and the ring road. In 1960 Rome hosted the Olympic Games.",cam:[[0.15,[150,46,-20,0,10]],[0.45,[60,38,-40,-40,-40]],[1,[180,48,10,0,6]]]},
 {y1:1990,d:10,title:"The Sprawl",sub:"Apartment blocks spread for miles. Fiumicino airport opened by the sea in 1961.",cam:[[0.15,[200,48,10,0,6]],[0.5,[140,40,40,-150,150]],[1,[260,48,0,-20,30]]]},
 {y1:2026,d:12,title:"Rome Today",sub:"Nearly three million people live in the Eternal City, 2,779 years after its legendary founding.",cam:[[0.1,[260,46,0,-20,30]],[0.5,[200,44,30,0,10]],[1,[430,40,40,-60,80]]]},
];
const TOTAL=240,SCALE=TOTAL/SPEC.reduce((s,c)=>s+c.d,0);
const CARDS=[];
{let t=0,y=null;
 for(const s of SPEC){const d=s.d*SCALE,y0=s.y0??y;CARDS.push({t0:t,t1:t+d,y0,y1:s.y1,title:s.title,sub:s.sub,cam:s.cam.map(([f,v])=>[f*d,v])});t+=d;y=s.y1}
}
const DURATION=CARDS[CARDS.length-1].t1;
const CAMK={dist:[],elev:[],az:[],tx:[],tz:[]};
let lastT=-1;
for(const c of CARDS)for(const [dt,v] of c.cam){let t=c.t0+dt;if(t<=lastT+0.05)t=lastT+0.05;lastT=t;CAMK.dist.push([t,v[0]]);CAMK.elev.push([t,v[1]]);CAMK.az.push([t,v[2]]);CAMK.tx.push([t,v[3]]);CAMK.tz.push([t,v[4]])}
for(const k of Object.keys(CAMK)){const last=CAMK[k][CAMK[k].length-1];CAMK[k].push([DURATION+1,last[1]])}

/* =====================================================================
   2. WHO RULES ROME
   ===================================================================== */
const SH='<path d="M2 2h20v14c0 6-5 9-10 11C7 25 2 22 2 16z"';
const sv=(fill,inner)=>`<svg viewBox="0 0 24 28">${SH} fill="${fill}" stroke="#e9d6a1" stroke-width="1.4"/>${inner}</svg>`;
const EAGLE='<path d="M12 6l-1.6 3L3.5 8l3.5 4-2 4 5-2 2.5 5 2.5-5 5 2-2-4 3.5-4-6.900 1z" fill="#f0cf6a"/>';
const KEYS='<path d="M8 20l8-12M16 20L8 8" stroke="#f0cf6a" stroke-width="2"/><circle cx="8" cy="8" r="2" fill="none" stroke="#f0cf6a" stroke-width="1.3"/><circle cx="16" cy="8" r="2" fill="none" stroke="#e8e8e8" stroke-width="1.3"/>';
const TRI='<rect x="2" y="2" width="6.7" height="25" fill="#2f8a3c"/><rect x="8.7" y="2" width="6.7" height="25" fill="#f4f0e4"/><rect x="15.4" y="2" width="6.7" height="25" fill="#c4262b"/>';
const POLITIES=[
 {from:-9999,name:"Kingdom of Rome",svg:sv('#6a2c8f','<polygon points="6,18 7,9 10,13 12,7 14,13 17,9 18,18" fill="#f0cf6a"/>')},
 {from:-509,name:"Roman Republic",svg:sv('#a3221f','<text x="12" y="17" text-anchor="middle" font-size="6.2" font-family="Cinzel,serif" font-weight="700" fill="#f0cf6a">SPQR</text>')},
 {from:-27,name:"Roman Empire",svg:sv('#7a1d3e',EAGLE)},
 {from:395,name:"Western Roman Empire",svg:sv('#3d2a7a',EAGLE)},
 {from:476,name:"Kingdom of Odoacer",svg:sv('#5a5a62','<path d="M12 5v17M7 9h10" stroke="#d4d0c0" stroke-width="2.2"/>')},
 {from:493,name:"Ostrogothic Kingdom",svg:sv('#1f5a3a','<path d="M12 5v17M7 9h10" stroke="#f0cf6a" stroke-width="2.2"/>')},
 {from:536.9,name:"Byzantine Empire",svg:sv('#6a1f6e','<path d="M12 5l-1.4 3-6.600-1 3.200 4-1.600 4.400 4.800-1.800 1.600 4.800 1.600-4.800 4.800 1.800-1.600-4.400 3.200-4-6.600 1z" fill="#f0cf6a"/>')},
 {from:756,name:"Papal States",svg:sv('#a3221f',KEYS)},
 {from:1798.1,name:"Roman Republic",svg:sv('#2a4a9a','<rect x="3" y="12" width="18" height="4" fill="#f4f0e4"/><rect x="3" y="16" width="18" height="4" fill="#c4262b"/>')},
 {from:1799.7,name:"Papal States",svg:sv('#a3221f',KEYS)},
 {from:1809.4,name:"French Empire",svg:sv('#1f3a8a',EAGLE)},
 {from:1814.4,name:"Papal States",svg:sv('#a3221f',KEYS)},
 {from:1849.1,name:"Roman Republic",svg:sv('#2f8a3c','<rect x="9" y="3" width="6" height="22" fill="#f4f0e4"/><rect x="15" y="3" width="7" height="22" fill="#c4262b"/>')},
 {from:1849.5,name:"Papal States",svg:sv('#a3221f',KEYS)},
 {from:1870.7,name:"Kingdom of Italy",svg:sv('#c4262b','<path d="M12 5v17M6 13h12" stroke="#f4f0e4" stroke-width="3.2"/>')},
 {from:1946.4,name:"Italian Republic",svg:sv('#2f8a3c','<polygon points="12,6 14,11 19,11 15,14.500 16.500,19.500 12,16.500 7.500,19.500 9,14.500 5,11 10,11" fill="#f4f0e4"/>')},
];
const POP=[[-753,1000],[-700,2000],[-600,8000],[-509,25000],[-390,40000],[-312,80000],[-200,200000],[-146,300000],[-27,700000],[1,900000],[64,1000000],[126,1100000],[200,1000000],[275,800000],[330,700000],[395,500000],[410,400000],[455,150000],[476,80000],[500,60000],[537,40000],[550,30000],[600,25000],[800,30000],[1000,35000],[1100,30000],[1200,35000],[1300,30000],[1377,20000],[1450,30000],[1527,55000],[1530,35000],[1600,100000],[1700,140000],[1800,160000],[1850,180000],[1871,226000],[1901,463000],[1921,692000],[1931,930000],[1951,1651000],[1971,2782000],[1991,2775000],[2011,2761000],[2026,2750000]];

E.setup({marsh:true,dryness:0.7,cards:CARDS,pop:POP,polities:POLITIES,camera:CAMK,shadow:2048});
const rr=mulberry(777);

/* =====================================================================
   3. THE ROMAN CITY (753 BC - 476 AD) AND ITS FATE
   ===================================================================== */
const city=R.buildRome({
  mon:{circus:1060,servian:900,jupiter:1000,basilica:600,vitt:1885,
    colosseumDie:(t,s)=>{if(t>=1&&s.frac>0.3&&s.frac<0.7)return 1349;if(t===3&&hash2(s.i,5)<0.3)return 1450+hash2(s.i,3)*280;return undefined}},
  slot:{minH:0.28,marsh:1},
});
// only the Great Fire of 64 is shown; the house generator's other fires are dropped
const FIRES=R.FIRES_DEF.map((f,i)=>({...f,dur:Math.min(f.dur,1.6),t0:i===1?B(f.year):-1000}));
for(const h of city.houses)if(h.fire&&h.fire.i!==1)h.fire=null;
const roman=city.houses.slice();
for(const h of city.houses){           // a house that burned and was rebuilt lives twice
  if(h.fire&&h.fire.rebuild){const f=R.FIRES_DEF[h.fire.i];h.fire.rebuild=false;
    const c={...h,fire:null,b:f.year+3+h.fire.rd*10,soft:[],clone:null};h.clone=c;roman.push(c)}
}
const aliveRoman=h=>h.b<=476&&!(h.dieY!=null&&h.dieY<476)&&!h.fire;
const life=h=>h.clone||h;
const endYear=h=>{const l=life(h);if(l.dead&&!l.dieY&&!l.fire)return -9999;if(l.dieY!=null)return l.dieY;if(l.fire)return FIRES[l.fire.i].year+1;return Infinity};

/* ---- landmarks of the later city (registered first so houses keep clear of them) ---- */
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
{const f=E.frame(3,heightAt(3,-22),-22,0.3,B(1583),1.3);K.reg(K.rect(3,-22,4.2,2.6,0.3,{mon:1,late:1583}));M.palazzo(f,0,0,6.8,3.0,3,0.9,'#e0c9a0','#a8512f',0,{},0,{P:0.5})}
M.obelisk(31,19,1588,3.0);M.obelisk(24,-6,1587,3.0);M.obelisk(-8,-33,1589,3.0);
R.bridge(15,1475,true);
/* modern landmarks */
MD.vittoriano(-8,-8,rotTo(1,0.3),1911);
MD.termini(23,-11,0.3,1950);
MD.stadium(-46,-48,0.4,1953);
MD.eur(-8,74,1942);
MD.airport(-188,160,0.9,1961);
MD.park(14,-37,9,26,1605);MD.park(32,42,10,24,1850);MD.park(-62,24,11,26,1650);MD.park(-20,36,6,12,1880);
R.bridge(-30,1911,true);R.bridge(-6,1911,true);R.bridge(22,1888,true);R.bridge(30,1918,true);
MD.avenue([15,0],[-6,-8],1932,2.0,'#6f6c66');
MD.ringRoad(108,1951,2.2,'#4a4a50');MD.ringRoad(60,1962,1.8,'#505056');

/* Roman houses standing where a later landmark rises are cleared when it is built */
for(const h of roman){
  const late=K.collide(K.rect(h.x,h.z,h.w/2,h.d/2,h.ry),0).filter(o=>o.late>476);
  if(late.length)h.landmark=Math.min(...late.map(o=>o.late));
}
for(const h of roman)if(h.hut&&!h.fire&&(h.dieY==null||h.dieY>-100))h.dieY=-200+rr()*100;   // no thatched huts in imperial Rome
for(const h of roman){
  if(!aliveRoman(h)){h.dead=true;continue}
  const nearTiber=Math.hypot(h.x+24,h.z+8)<12;
  if(nearTiber&&rr()<0.55)h.dieY=null;else h.dieY=480+Math.pow(rr(),1.4)*680;
  if(h.landmark!==undefined)h.dieY=Math.min(h.dieY??9999,h.landmark-0.6);
}

/* =====================================================================
   4. NEIGHBOURING TOWNS
   ===================================================================== */
function village(cx,cz,R,n,b0,b1,o={}){
  const out=[];
  for(let i=0;i<n*8&&out.length<n;i++){
    const a=rr()*Math.PI*2,r=Math.sqrt(rr())*R,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,w=1.4+rr()*0.7,d=1.2+rr()*0.5,ry=rr()*0.4+(o.ry??0);
    const sl=K.slopeOK(x,z,w,d,ry,1.4);if(!sl)continue;if(riverDist(x,z)<5||heightAt(x,z)<0.5)continue;
    const rc=K.rect(x,z,w/2,d/2,ry);if(K.collide(rc,0.2).length)continue;
    const h={x,z,ry,w,d,...sl,soft:[],style:o.style,road:-1,s:0,b:lerp(b0,b1,out.length/n),gen:0,lod:1};
    K.reg(Object.assign(rc,{house:h}));out.push(h);
  }
  return out;
}
const towns=[];
{
  const veii=village(-62,-150,8,30,-900,-900,{style:'roman'});
  for(const h of veii){K.dress(h);h.dieY=-396+rr()*120}                       // Veii fades after Rome absorbs it
  towns.push(...veii);
  const ostia=village(-192,228,8,40,-340,200,{style:'roman'});for(const h of ostia){K.dress(h);h.dieY=700+rr()*400}
  towns.push(...ostia);
  const tibur=village(250,-90,8,30,-900,-900,{style:'roman'});for(const h of tibur)K.dress(h);towns.push(...tibur);
  for(const [x,z,n,b0,b1] of [[118,138,22,1100,1750],[108,178,20,1150,1800],[150,120,16,1200,1800]]){const v=village(x,z,7,n,b0,b1);for(const h of v)K.dress(h);towns.push(...v)}
  for(const [x,z,R,n,b0,b1] of [[-196,214,10,60,1920,2005],[-196,186,9,40,1960,2010],[250,-90,13,40,1950,2010]]){const v=village(x,z,R,n,b0,b1);for(const h of v){h.style=h.b<1945?'umbertino':'postwar';h.lod=0;K.dress(h)}towns.push(...v)}
  const f0=E.frame(-62,heightAt(-62,-150),-150,0,B(-900),1.0);
  for(let i=0;i<30;i++){const a=i/30*Math.PI*2,x=-62+Math.cos(a)*10.5,z=-150+Math.sin(a)*10.5;
    E.add('box',x,heightAt(x,z)-0.3,z,rotTo(-Math.sin(a),Math.cos(a)),2.3,1.5,0.6,'#bdb08e',-10,{d:B(-300)+hash2(i,2)*2})}
}

/* =====================================================================
   5. MEDIEVAL, RENAISSANCE AND BAROQUE ROME (generation 2)
   ===================================================================== */
function district(cx,cz,n,len,w=0.85){
  for(let k=0;k<n;k++){
    const a=k/n*Math.PI*2+rr()*0.6,pts=[[cx,cz]];let ang=a;
    for(let r=2.4;r<=len;r+=2.6){ang+=(rr()-0.5)*0.5;const [px,pz]=pts[pts.length-1];pts.push([px+Math.cos(ang)*2.6,pz+Math.sin(ang)*2.6])}
    K.makeRoad(pts,w,99999,0,'minor').g2=true;
  }
}
district(-24,-8,9,17);district(-18,-20,5,12);district(-30,2,5,12);district(-51,12,7,11);district(-55,-14,6,10);district(8,-14,4,10);
function straight(p0,p1,year){const L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]),n=Math.round(L/3),pts=[];for(let i=0;i<=n;i++)pts.push([lerp(p0[0],p1[0],i/n),lerp(p0[1],p1[1],i/n)]);const r=K.makeRoad(pts,1.3,year,0,'main');r.fixed=year;r.g2=true;return r}
straight([-4,-36],[-12,-8],1586);straight([30,22],[28,-12],1586);straight([28,-14],[9,-26],1587);straight([9,-26],[-2,-16],1590);

const accept2=h=>{for(const s of h.soft||[])if(endYear(s)===Infinity)return false;return true};
const gen2=[];
for(const r of K.roads){if(!r.g2||r.houses.length||r.emitted)continue;
  const s=K.houseSlots(r,{soft:true,gen:2,accept:accept2,minH:0.28,marsh:1,skip:0.1,wmin:1.25,wvar:0.7,dmin:1.1,dvar:0.4,start:1.2});
  s.forEach(h=>r.houses.push(h));gen2.push(...s)}
gen2.push(...K.infill(16000,()=>true,{areas:[[-24,-8,18,0.9],[-51,12,10,1],[-55,-14,9,1],[-18,-22,10,1],[-6,-22,12,1],[10,-16,8,1],[20,-4,9,1]],soft:true,gen:2,accept:accept2,minH:0.28,marsh:1,wmin:1.2,wvar:0.7,dmin:1.05,dvar:0.4,maxD:90}));
const BUILT2=[[476,0],[800,0.04],[1100,0.12],[1300,0.2],[1420,0.26],[1500,0.42],[1527,0.5],[1600,0.72],[1700,0.9],[1800,1.0]];
const yearOf2=f=>{for(let i=0;i<BUILT2.length-1;i++){const [y0,f0]=BUILT2[i],[y1,f1]=BUILT2[i+1];if(f<=f1)return lerp(y0,y1,(f-f0)/(f1-f0+1e-9))}return 1800};
for(const h of gen2)h.score=Math.hypot(h.x+24,h.z+8)*(h.x<-40?0.7:1)+(rr()-0.5)*7;
gen2.sort((a,b)=>a.score-b.score);
gen2.forEach((h,i)=>{h.b=yearOf2((i+0.5)/gen2.length)});
const lives2=[];
for(const h of gen2){
  let ok=true;
  for(const s of h.soft||[]){const e=endYear(s);if(e===Infinity){ok=false;break}h.b=Math.max(h.b,e+1.5)}
  if(!ok||h.b>1850)continue;
  if(h.clear!==undefined&&h.b>=h.clear-1)continue;
  K.dress(h);
  if(h.clear!==undefined)h.dieY=h.clear-0.6;
  lives2.push(h);
}

/* =====================================================================
   6. MODERN ROME (generation 3): the sprawl
   ===================================================================== */
for(const k of Object.keys(K.stats))delete K.stats[k];
const mainIds=new Set(city.mains.map(r=>r.id));
const Rlim=(x,z)=>{const th=Math.atan2(z-C[1],x-C[0]);return 70+62*E.fbm(Math.cos(th)*1.7+5,Math.sin(th)*1.7+5)};
const accept3=h=>{
  const dd=Math.hypot(h.x-C[0],h.z-C[1]);
  if(dd>Rlim(h.x,h.z)&&!(mainIds.has(h.road)&&dd<150&&rr()<0.35))return false;
  h.pend=[];
  for(const s of h.soft||[]){if(endYear(s)===Infinity){if(rr()<0.6)h.pend.push(s);else return false}}
  return true};
const LOCAL3=K.localStreets(C[0],C[1],34,140,{cell:15,len:16,spacing:6.2,seed:5});
const gen3=[];
for(const m of [...city.mains,...LOCAL3]){
  const s=K.houseSlots(m,{soft:true,gen:3,accept:accept3,minH:0.28,marsh:1,skip:0.08,wmin:1.8,wvar:1.1,dmin:1.5,dvar:0.8,start:36});
  gen3.push(...s);
}
{
  const inMod=h=>Math.hypot(h.x-C[0],h.z-C[1])<=150;
  gen3.push(...K.infill(160000,inMod,{soft:true,gen:3,accept:accept3,R:150,R0:10,minH:0.28,marsh:1,wmin:1.7,wvar:1.2,dmin:1.4,dvar:0.9,maxD:14}));
}
const BUILT3=[[1850,0],[1880,0.07],[1911,0.2],[1930,0.33],[1945,0.4],[1960,0.65],[1975,0.88],[2000,0.97],[2026,1.0]];
const yearOf3=f=>{for(let i=0;i<BUILT3.length-1;i++){const [y0,f0]=BUILT3[i],[y1,f1]=BUILT3[i+1];if(f<=f1)return lerp(y0,y1,(f-f0)/(f1-f0+1e-9))}return 2026};
for(const h of gen3)h.score=Math.hypot(h.x-C[0]+4,h.z-C[1]+2)+(rr()-0.5)*46;
gen3.sort((a,b)=>a.score-b.score);
gen3.forEach((h,i)=>{h.b=yearOf3((i+0.5)/gen3.length)});
const lives3=[];
for(const h of gen3){
  let ok=true;const pend=h.pend||[];
  for(const s of h.soft||[]){const e=endYear(s);if(e!==Infinity)h.b=Math.max(h.b,e+1.2)}
  if(!ok||h.b>2024)continue;
  if(h.clear!==undefined&&h.b>=h.clear-1)continue;
  h.style=h.b<1945?'umbertino':'postwar';h.lodR=h.b<1945?42:50;
  K.dress(h);
  if(h.clear!==undefined)h.dieY=h.clear-0.6;
  for(const s of pend){const l=life(s);l.dieY=h.b-0.3;l.fire=null;if(l.dead)l.dead=false}
  lives3.push(h);
}

/* =====================================================================
   7. EMIT EVERYTHING
   ===================================================================== */
K.emitRoads();
const all=[...roman,...towns,...lives2,...lives3];
const nFixed=K.resolveOverlaps(all,h=>h.dieY??(h.fire?FIRES[h.fire.i].year:Infinity));
for(const h of all)K.emitHouse(h,FIRES);
K.urbanGround(all.filter(h=>h.gen===3),1870,'#8f8c85');
R.scatterTrees(all,{marsh:true,n:7000,span:520,clusters:true});

/* =====================================================================
   8. CONSTRUCTION: cranes on the great building sites, and names as they rise
   ===================================================================== */
function crane(x,z,y0,y1,modern){
  const gy=heightAt(x,z),b=B(y0),d=Math.max(B(y1),b+2.5)+0.4,col=modern?'#e0b020':'#7a5a36',H=modern?7:4.6;
  E.add('box',x,gy,z,0,0.18,H,0.18,col,b,{d,dur:0.6});
  E.add('box',x,gy+H-0.1,z,0.6,0.12,3.4,0.12,col,b+0.2,{d,dur:0.6,rz:-1.2});
  E.add('box',x+3.2*Math.sin(1.2)*Math.cos(0.6),gy+1.2,z-3.2*Math.sin(1.2)*Math.sin(0.6),0,0.03,H+3.2*Math.cos(1.2)-1.3,0.03,'#3a3a3a',b+0.4,{d,dur:0.5});
}
const SITES=[
 ['Forum',-580,-560,-3,3.2],['Temple of Jupiter',-525,-509,-12,-4],['Servian Wall',-378,-370,2,-20],['Aqua Appia',-312,-310,40,25],
 ['Circus Maximus',-329,-320,-3,15.5],['Basilica Aemilia',-182,-179,-3,-1.3],['Basilica Julia',-50,-46,-3,8],['Palace of the Caesars',-25,6,6,12],
 ['Theatre of Marcellus',-17,-13,-22,3],['Aqua Claudia',38,52,40,-6],['Colosseum',70,80,14,3],['Arch of Titus',81,82,6.2,3.2],["Trajan's Column",107,113,-1.5,-9.5],
 ['Pantheon',113,125,-12,-16],["Hadrian's Tomb",134,139,-37,-17],['Baths of Caracalla',206,216,14,29.5],['Aurelian Wall',271,275,2,-32],
 ['Arch of Constantine',312,315,12.5,13.5],["Old St. Peter's",319,329,-62,-24],['Leonine Wall',848,852,-62,-38],['Ponte Sisto',1473,1479,-30,15],
 ["Castel Sant'Angelo",1492,1497,-37,-17],["New St. Peter's",1506,1626,-62,-24],['Capitoline Square',1538,1560,-12,-4],['Quirinal Palace',1583,1600,3,-22],
 ['Piazza Navona',1644,1652,-27,-11],["St. Peter's Square",1656,1667,-54,-24],['Spanish Steps',1723,1726,9,-28],['Trevi Fountain',1732,1762,-4,-19],
 ['Vittoriano',1885,1911,-8,-8],['Via dei Fori Imperiali',1931,1932,4,-4],['EUR',1938,1942,-8,74],['Termini Station',1947,1950,23,-11],
 ['Olympic Stadium',1950,1953,-46,-48],['Ring road (GRA)',1951,1970,2,-102],['Fiumicino Airport',1958,1961,-188,160],
];
for(const [name,y0,y1,x,z] of SITES){
  const tb=B(y0),te=Math.max(B(y1)+1.5,tb+4.5);
  E.addLabel(name,()=>[x,heightAt(x,z)+5,z],tb,te,'site');
  if(['Colosseum','Pantheon',"New St. Peter's",'Baths of Caracalla','Vittoriano','Temple of Jupiter','Palace of the Caesars',"Old St. Peter's",'Termini Station','EUR','Capitoline Square'].includes(name)){
    const modern=y0>1850;crane(x+5,z-3,y0,y1,modern);crane(x-4,z+5,y0+(y1-y0)*0.3,y1,modern);
  }
}

/* =====================================================================
   9. MAP LABELS
   ===================================================================== */
const pl=(txt,x,z,t0,t1)=>E.addLabel(txt,()=>[x,heightAt(x,z)+3,z],t0,t1,'place');
pl('ROME',2,8,0.3,7);pl('VEII',-62,-150,0.3,6);pl('OSTIA',-192,228,0.3,6);pl('TIBUR',250,-90,0.3,6);pl('ALBAN HILLS',140,155,0.3,6);pl('TYRRHENIAN SEA',-280,120,0.0,6);pl('TIBER',-48,-30,0.3,6);
const T=y=>B(y);
pl('VATICAN',-62,-24,T(1000)-3,T(1000));pl('OSTIA',-196,214,T(1960),T(1990));pl('FIUMICINO',-196,186,T(1965),T(1995));pl('TIVOLI',250,-90,T(1965),T(1995));pl('ALBAN HILLS',140,155,T(1965),T(1995));
pl('ROME',2,8,T(1995),DURATION);pl('TYRRHENIAN SEA',-280,120,T(2005),DURATION);
E.start(FIRES);
window.__dbg=()=>({audit:K.auditOverlaps(all),nFixed,alive10:all.filter(h=>h.tb<=10&&h.td>10).map(h=>[Math.round(h.x),Math.round(h.z),Math.round(h.b),h.hut?1:0]).slice(0,30),n10:all.filter(h=>h.tb<=10&&h.td>10).length,huts:city.houses.filter(h=>h.hut).length,hutsB:city.houses.filter(h=>h.hut).slice(0,8).map(h=>[Math.round(h.b),Math.round(h.x),Math.round(h.z),h.dieY|0]),early:city.houses.filter(h=>h.b<-600).length,lives:all.length,gen2:lives2.length,gen3:lives3.length,towns:towns.length,dur:DURATION,items:Object.fromEntries(Object.entries(E.items).map(([k,v])=>[k,v.length]))});
window.__cards=CARDS;
