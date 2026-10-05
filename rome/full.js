import * as E from './engine.js';
import * as K from './city.js';
import * as R from './rome.js';
import * as M from './medieval.js';
import * as MD from './modern.js';
import * as A from './armies.js';
const {mulberry,hash2,lerp,clamp,B,C,heightAt,riverDist,rotTo,rotXZ,NO,THREE}=E;

/* =====================================================================
   1. TIMELINE: eras (fast) and wars (slow, so the event lands on its year)
   ===================================================================== */
const SPEC=[
 {id:'E1',y0:-753,y1:-650,d:3.5,title:"A Village on Seven Hills",sub:"Legend says Romulus founded Rome on the Palatine in 753 BC, between the Tiber and the sea.",cam:[[0,[250,34,35,-70,40]],[3.4,[125,33,-18,0,16]]]},
 {id:'E2',y1:-509,d:3.0,title:"The Seven Kings",sub:"Etruscan kings drained the marsh with the Cloaca Maxima and laid out the Forum.",cam:[[0,[105,33,-16,2,8]]]},
 {id:'E3',y1:-399,d:2.5,title:"The Republic",sub:"In 509 BC the last king was expelled. Rome chose two consuls and began to conquer its neighbours.",cam:[[0,[92,34,-10,2,6]]]},
 {id:'W1',ev:-396,tEv:1.9,d:4.0,title:"Rome Destroys Veii",sub:"After a ten-year siege Rome took the Etruscan city of Veii in 396 BC and razed it.",cam:[[0,[170,52,0,-8,-45]],[3.6,[150,52,0,-8,-45]]]},
 {id:'W2',ev:-390,tEv:2.4,d:4.5,title:"The Gauls Sack Rome",sub:"Brennus's Gauls crushed the Romans at the Allia and burned the city in 390 BC. Only the Capitol held.",cam:[[0,[180,50,0,-4,-70]],[2.3,[110,44,0,-2,-30]]]},
 {id:'E4',y1:-216,d:2.5,title:"Walled and Wiser",sub:"Rome built the Servian Wall, its first aqueduct and the Appian Way.",cam:[[0,[92,36,6,2,6]]]},
 {id:'W3',ev:-211,tEv:2.4,d:4.0,title:"Hannibal at the Gates",sub:"In 211 BC the Carthaginian Hannibal camped three miles from Rome. He could not take it, and withdrew.",cam:[[0,[170,48,-25,50,-12]],[2.4,[140,46,-20,36,-4]]]},
 {id:'E5',y1:-51,d:2.5,title:"Master of the Mediterranean",sub:"Carthage fell in 146 BC. Wealth and slaves poured in, and civil wars tore the Republic apart.",cam:[[0,[95,36,0,2,6]]]},
 {id:'W4',ev:-49,tEv:2.2,d:3.5,title:"Caesar Crosses the Rubicon",sub:"In 49 BC Julius Caesar marched on Rome with his army. His victory ended the Republic.",cam:[[0,[180,50,0,2,-80]],[2.2,[120,44,0,0,-30]]]},
 {id:'E6',y1:62,d:3.5,title:"A City of Marble",sub:"In 27 BC Augustus became the first emperor. He boasted he found Rome in brick and left it in marble.",cam:[[0,[88,38,8,3,6]]]},
 {id:'E7',y1:130,d:3.5,title:"Fire, Colosseum, Pantheon",sub:"Nero's fire gutted Rome in 64. Then rose the Colosseum and the Pantheon, in a city of a million.",cam:[[0,[70,38,10,3,8]]]},
 {id:'E8',y1:271,d:2.0,title:"The Aurelian Wall",sub:"Barbarian raids forced Rome, after six centuries, to wall itself in again.",cam:[[0,[92,40,10,3,6]]]},
 {id:'E9',y1:406,d:1.5,title:"Rome in Crisis",sub:"Emperors now ruled from elsewhere. In 330 Constantine founded a new capital, Constantinople.",cam:[[0,[92,40,8,3,6]]]},
 {id:'W5',ev:410,tEv:2.4,d:3.5,title:"Alaric's Goths",sub:"In 410 the Visigoths under Alaric entered through the Salarian Gate and plundered Rome for three days.",cam:[[0,[190,52,-30,70,-60]],[2.4,[110,44,-20,28,-14]]]},
 {id:'E10',y1:452,d:1.2,title:"The Empire Crumbles",sub:"",cam:[[0,[100,40,0,3,6]]]},
 {id:'W6',ev:455,tEv:2.6,d:4.0,title:"The Vandals",sub:"In 455 Geiseric's Vandals landed at Ostia and plundered Rome for two weeks.",cam:[[0,[210,48,-45,-70,70]],[2.6,[170,46,-40,-50,40]]]},
 {id:'W7',ev:476,tEv:2.0,d:3.0,title:"The Last Emperor",sub:"In 476 Odoacer deposed Romulus Augustulus. The Western Roman Empire was over.",cam:[[0,[160,50,0,2,-50]],[2.0,[110,44,0,0,-20]]]},
 {id:'E11',y1:534,d:2.0,title:"Theodoric's Italy",sub:"The Ostrogoths ruled from Ravenna. Rome kept its Senate, its churches and its ruins.",cam:[[0,[96,40,5,3,6]]]},
 {id:'W8',ev:537.3,tEv:3.0,d:5.0,title:"Belisarius and the Goths",sub:"Byzantine troops took Rome in 536. The Goths besieged it for a year and cut the aqueducts.",cam:[[0,[190,50,35,60,60]],[3.0,[130,44,25,28,24]]]},
 {id:'E12',y1:754,d:2.0,title:"Rome of the Popes",sub:"The city shrank to a few thousand souls. Popes became its rulers and churches replaced temples.",cam:[[0,[100,40,10,0,0]]]},
 {id:'W9',ev:800,tEv:2.2,d:3.5,title:"Charlemagne",sub:"In 756 the Franks gave the pope a state. On Christmas Day 800 Charlemagne was crowned in St. Peter's.",cam:[[0,[190,50,-10,-30,-110]],[2.2,[100,42,-10,-48,-20]]]},
 {id:'E13',y1:842,d:1.2,title:"",sub:"",cam:[[0,[100,40,10,-20,0]]]},
 {id:'W10',ev:846,tEv:2.4,d:3.5,title:"Saracens at St. Peter's",sub:"Arab raiders sailed up from Ostia in 846 and looted St. Peter's. Pope Leo IV then walled the Vatican.",cam:[[0,[200,48,-35,-100,50]],[2.4,[110,42,-20,-60,-18]]]},
 {id:'E14',y1:1082,d:2.5,title:"A City of Towers",sub:"Noble clans built fortress towers among the ruins, and cows grazed in the Forum.",cam:[[0,[100,40,10,-10,0]]]},
 {id:'W11',ev:1084,tEv:2.0,d:3.5,title:"The Norman Sack",sub:"In 1084 Robert Guiscard's Normans freed the pope and burned Rome from the Lateran to the Colosseum.",cam:[[0,[190,50,30,70,70]],[2.0,[110,44,25,28,16]]]},
 {id:'E15',y1:1504,d:4.0,title:"Avignon and the Renaissance",sub:"The popes left for Avignon in 1309 and an earthquake toppled the Colosseum in 1349. By 1506 a new St. Peter's was rising.",cam:[[0,[100,40,10,-20,-4]],[2.0,[90,40,-10,-40,-10]]]},
 {id:'W12',ev:1527,tEv:2.6,d:4.0,title:"The Sack of Rome",sub:"On 6 May 1527 the unpaid troops of Charles V stormed the city and plundered it for months.",cam:[[0,[190,50,-5,-60,-140]],[2.6,[100,42,-5,-48,-16]]]},
 {id:'E16',y1:1795,d:4.0,title:"Baroque Rome",sub:"Sixtus V cut straight streets and raised obelisks. Bernini's colonnade, Piazza Navona, the Spanish Steps and the Trevi Fountain followed.",cam:[[0,[95,40,-5,-32,-8]],[2.0,[85,40,8,-26,-6]]]},
 {id:'W13',ev:1798,tEv:2.2,d:3.5,title:"Rome Under the French",sub:"In 1798 French revolutionary troops proclaimed a Roman Republic. The pope was carried off to France.",cam:[[0,[185,50,0,-20,-120]],[2.2,[100,42,0,-12,-20]]]},
 {id:'E17',y1:1846,d:3.0,title:"Napoleon and the Restoration",sub:"Napoleon annexed Rome in 1809. After 1814 the popes returned.",cam:[[0,[100,42,6,-14,-6]],[2.8,[110,44,0,-34,-6]]]},
 {id:'W14',ev:1849.5,tEv:2.2,d:4.0,title:"Garibaldi's Republic",sub:"In 1849 Mazzini and Garibaldi defended a new Roman Republic on the Janiculum until French troops took it in July.",cam:[[0,[180,48,-25,-100,-20]],[2.3,[100,42,-20,-44,6]]]},
 {id:'E18',y1:1867,d:1.5,title:"The Last Years of the Papal State",sub:"",cam:[[0,[100,42,6,-10,-4]]]},
 {id:'W15',ev:1870.72,tEv:2.4,d:3.5,title:"Breach at Porta Pia",sub:"On 20 September 1870 Italian troops breached the Aurelian Wall at Porta Pia. Rome became the capital of Italy.",cam:[[0,[185,50,30,80,-70]],[2.4,[100,42,24,26,-16]]]},
 {id:'E19',y1:1920,d:3.0,title:"Capital of Italy",sub:"Ministries, railways and the Vittoriano monument remade the city. Rome's population passed half a million.",cam:[[0,[110,42,10,0,4]]]},
 {id:'W16',ev:1922.83,tEv:2.0,d:3.0,title:"March on Rome",sub:"In October 1922 Mussolini's blackshirts marched on Rome, and the king handed him the government.",cam:[[0,[185,50,0,0,-110]],[1.8,[120,44,0,0,-20]]]},
 {id:'E20',y1:1942,d:2.5,title:"Fascist Rome",sub:"Mussolini cleared the Forum for Via dei Fori Imperiali. The Lateran Treaty of 1929 created Vatican City.",cam:[[0,[120,44,8,0,4]]]},
 {id:'W17',ev:1944.43,tEv:2.8,d:4.5,title:"Occupation and Liberation",sub:"German troops occupied Rome in September 1943. The Allies liberated it on 4 June 1944.",cam:[[0,[190,50,30,60,80]],[2.9,[130,44,20,10,10]]]},
 {id:'E21',y1:1975,d:3.5,title:"The Republic and the Boom",sub:"Italy became a republic in 1946. Rome hosted the 1960 Olympics and spread far beyond its ancient walls.",cam:[[0,[140,46,10,0,6]]]},
 {id:'E22',y1:2026,d:5.0,title:"Rome Today",sub:"Nearly three million people live in the Eternal City, 2,779 years after its legendary founding.",cam:[[0,[175,46,10,0,6]],[4.5,[240,40,20,-10,20]]]},
];
const CARDS=[];
{let t=0,y=null;
 for(const s of SPEC){
  const y0=s.y0??y,y1=s.ev!==undefined?y0+(s.ev-y0)*s.d/s.tEv:s.y1;
  CARDS.push({id:s.id,t0:t,t1:t+s.d,y0,y1,title:s.title,sub:s.sub,tEv:s.ev!==undefined?t+s.tEv:null,cam:s.cam});t+=s.d;y=y1}
}
const card=id=>CARDS.find(c=>c.id===id);
const DURATION=CARDS[CARDS.length-1].t1;
// camera keyframes
const CAMK={dist:[],elev:[],az:[],tx:[],tz:[]};
for(const c of CARDS)for(const [dt,v] of c.cam){const t=c.t0+dt;CAMK.dist.push([t,v[0]]);CAMK.elev.push([t,v[1]]);CAMK.az.push([t,v[2]]);CAMK.tx.push([t,v[3]]);CAMK.tz.push([t,v[4]])}
for(const k of Object.keys(CAMK)){const last=CAMK[k][CAMK[k].length-1];CAMK[k].push([DURATION,last[1]])}

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
window.__cards=CARDS;
const rr=mulberry(777);

/* =====================================================================
   3. THE ROMAN CITY (753 BC - 476 AD) AND ITS FATE
   ===================================================================== */
const AQ={'-312':537.3,'-272':537.3,'-144':600};
const wallBreach=th=>{const d=Math.abs(th-5.356);return d<0.1?1870.72:undefined};
const city=R.buildRome({
  mon:{circus:1060,aqueduct:y=>AQ[y],servian:900,jupiter:1000,basilica:410,vitt:1885,aurelianDie:wallBreach,
    colosseumDie:(t,s)=>{if(t>=1&&s.frac>0.3&&s.frac<0.7)return 1349;if(t===3&&hash2(s.i,5)<0.3)return 1450+hash2(s.i,3)*280;return undefined}},
  slot:{minH:0.28,marsh:1},
});
const FIRES_BASE=R.FIRES_DEF.map(f=>({...f,shift:0,dur:Math.min(f.dur,1.4)}));           // 0: -390, 1: 64, 2: 410
const FIRE_EXTRA=[
 {year:-396,x:-15,z:-92,r:9,dur:1.8,rebuild:false},               // 3 Veii
 {year:846,x:-60,z:-22,r:8,dur:1.4,rebuild:false},                 // 4 Saracens at St. Peter's
 {year:1084,x:10,z:12,r:14,dur:1.6,rebuild:false},                 // 5 Normans
 {year:1527,x:-26,z:-8,r:15,dur:2.0,rebuild:true},                 // 6 Sack of Rome
 {year:1849.5,x:-52,z:6,r:7,dur:1.4,rebuild:true},                 // 7 French bombardment of the Janiculum
 {year:1870.72,x:30,z:-24,r:5,dur:1.0,rebuild:true},               // 8 Porta Pia
];
const FIRES=[...FIRES_BASE,...FIRE_EXTRA].map(f=>({...f,t0:B(f.year)}));

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
MD.airport(-124,96,0.9,1961);
MD.park(14,-37,9,26,1605);MD.park(32,42,10,24,1850);MD.park(-62,24,11,26,1650);MD.park(-20,36,6,12,1880);
R.bridge(-30,1911,true);R.bridge(-6,1911,true);R.bridge(22,1888,true);R.bridge(30,1918,true);
MD.avenue([15,0],[-6,-8],1932,2.0,'#6f6c66');
MD.ringRoad(108,1951,2.2,'#4a4a50');MD.ringRoad(60,1962,1.8,'#505056');

/* Roman houses standing where a later landmark rises are cleared when it is built */
for(const h of roman){
  const late=K.collide(K.rect(h.x,h.z,h.w/2,h.d/2,h.ry),0).filter(o=>o.late>476);
  if(late.length)h.landmark=Math.min(...late.map(o=>o.late));
}
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
  const veii=village(-15,-95,8,30,-900,-900,{style:'roman'});
  for(const h of veii){K.dress(h);h.fire={i:3,frac:Math.hypot(h.x+15,h.z+92)/9,rebuild:false,rd:0}}
  towns.push(...veii);
  R.wallRing && 0;
  const ostia=village(-132,122,7,34,-340,200,{style:'roman'});for(const h of ostia){K.dress(h);h.dieY=700+rr()*400}
  towns.push(...ostia);
  const tibur=village(135,-45,8,28,-900,-900,{style:'roman'});for(const h of tibur)K.dress(h);towns.push(...tibur);
  // Veii's wall (Etruscan), gone when the city falls
  const f0=E.frame(-15,heightAt(-15,-95),-95,0,B(-900),1.0);
  for(let i=0;i<30;i++){const a=i/30*Math.PI*2,x=-15+Math.cos(a)*10.5,z=-95+Math.sin(a)*10.5;
    E.add('box',x,heightAt(x,z)-0.3,z,rotTo(-Math.sin(a),Math.cos(a)),2.3,1.5,0.6,'#bdb08e',-10,{d:B(-396)+0.3+hash2(i,2)*0.8})}
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
  else for(let k=0;k<FIRES.length;k++){const f=FIRES[k];if(f.year<=476)continue;const dd=Math.hypot(h.x-f.x,h.z-f.z);
    if(dd<f.r*(0.55+0.45*rr())&&rr()<0.8&&h.b<f.year){h.fire={i:k,frac:dd/f.r,rebuild:f.rebuild,rd:rr()};break}}
  lives2.push(h);
}

/* =====================================================================
   6. MODERN ROME (generation 3): the sprawl
   ===================================================================== */
for(const k of Object.keys(K.stats))delete K.stats[k];
const accept3=h=>{
  if(Math.hypot(h.x-C[0],h.z-C[1])>106)return false;
  h.pend=[];
  for(const s of h.soft||[]){if(endYear(s)===Infinity){if(rr()<0.6)h.pend.push(s);else return false}}
  return true};
const gen3=[];
for(const m of city.mains){
  const s=K.houseSlots(m,{soft:true,gen:3,accept:accept3,minH:0.28,marsh:1,skip:0.08,wmin:1.8,wvar:1.1,dmin:1.5,dvar:0.8,start:36});
  gen3.push(...s);
}
{
  const inMod=h=>{const d=Math.hypot(h.x-C[0],h.z-C[1]);return d<=106};
  gen3.push(...K.infill(120000,inMod,{soft:true,gen:3,accept:accept3,R:108,R0:10,minH:0.28,marsh:1,wmin:1.7,wvar:1.2,dmin:1.4,dvar:0.9,maxD:400}));
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
const all=[...roman.filter(h=>!h.dead),...towns,...lives2,...lives3];
for(const h of all)K.emitHouse(h,FIRES);
R.scatterTrees(all,{marsh:true,n:7000,span:520,clusters:true});

/* =====================================================================
   8. WARS
   ===================================================================== */
const W=id=>card(id).t0;
const T=(id,dt)=>W(id)+dt;
function war(id,o){return A.army({tD:T(id,o.dep),tA:T(id,o.arr),hold:o.hold??1,ret:o.ret??0,after:o.ret?'retreat':'vanish',...o})}
// Veii
war('W1',{name:'Roman legions · Camillus',color:'#b3262b',flag:'#e8c34a',n:70,dep:0.2,arr:1.5,hold:1.2,ret:1.2,R:5,path:[[0,-22],[-6,-45],[-11,-70],[-15,-86]]});
war('W1',{name:'Veii',color:'#3a6ea5',flag:'#9ec3e8',n:26,dep:0.0,arr:0.5,hold:1.4,R:5,key:'veii',path:[[-15,-93],[-15,-91]]});
// Gauls
war('W2',{name:'Gauls · Brennus',color:'#7a8a3a',flag:'#d6b030',n:110,dep:0.1,arr:2.2,hold:1.6,ret:1.5,R:5,path:[[30,-210],[18,-150],[6,-100],[-4,-60],[-3,-30],[-2,-12]]});
// Hannibal
war('W3',{name:'Carthaginians · Hannibal',color:'#6a2c8f',flag:'#c9a0e0',n:100,dep:0.2,arr:2.4,hold:1.0,ret:1.4,R:6,big:{n:5},path:[[200,-70],[150,-48],[105,-28],[70,-14],[44,-6]]});
war('W3',{name:'Roman legions',color:'#b3262b',flag:'#e8c34a',n:44,dep:2.0,arr:2.6,hold:1.4,R:3,key:'rl',path:[[26,-10],[36,-8]]});
// Caesar
war('W4',{name:'Caesar · Legio XIII',color:'#b3262b',flag:'#e8c34a',n:100,dep:0.1,arr:2.2,hold:1.2,R:4,path:[[30,-220],[16,-160],[8,-110],[2,-70],[-2,-40],[-3,-14]]});
// Visigoths
war('W5',{name:'Visigoths · Alaric',color:'#8a4a2b',flag:'#c9a040',n:110,dep:0.1,arr:2.3,hold:1.0,ret:1.3,R:5,path:[[200,-150],[140,-100],[90,-66],[50,-42],[30,-26]]});
// Vandals
A.fleet({name:'Vandal fleet',color:'#e8e0cc',hull:'#1f1f22',n:6,tD:T('W6',0.0),tA:T('W6',1.4),hold:2.6,path:[[-310,150],[-220,138],[-150,124]]});
war('W6',{name:'Vandals · Geiseric',color:'#3a3a3a',flag:'#8a1f1f',n:100,dep:1.0,arr:3.2,hold:0.7,ret:1.2,R:4,path:[[-135,118],[-110,95],[-80,72],[-50,52],[-22,38],[-8,24]]});
// Odoacer
war('W7',{name:'Odoacer · Heruli',color:'#7a7a7a',flag:'#d4d0c0',n:90,dep:0.0,arr:1.9,hold:1.0,R:4,path:[[10,-200],[6,-140],[2,-90],[0,-54],[-2,-30],[-4,-10]]});
// Belisarius and the Goths
war('W8',{name:'Belisarius · Byzantines',color:'#6a1f6e',flag:'#d9b24a',n:80,dep:0.1,arr:2.0,hold:3.0,R:4,path:[[190,200],[140,160],[100,120],[64,80],[40,50],[28,34]]});
war('W8',{name:'Goths · Vitiges',color:'#2f5a3a',flag:'#d4c070',n:110,dep:1.4,arr:3.0,hold:1.4,ret:0.6,R:9,key:'vit',path:[[-40,-200],[-30,-140],[-10,-90],[8,-60],[16,-38]]});
// Franks
war('W9',{name:'Franks · Charlemagne',color:'#2b4aa0',flag:'#e8e8f0',n:80,dep:0.1,arr:2.1,hold:1.2,ret:1.0,R:4,path:[[-60,-170],[-58,-120],[-56,-80],[-56,-50],[-58,-28]]});
// Saracens
A.fleet({name:'Saracen ships',color:'#2e8a4a',hull:'#3a2a1c',n:5,tD:T('W10',0.0),tA:T('W10',1.0),hold:1.5,path:[[-310,90],[-200,110],[-150,121]]});
war('W10',{name:'Saracens',color:'#2e8a4a',flag:'#f0f0e0',n:70,dep:0.8,arr:2.3,hold:0.9,ret:1.1,R:4,path:[[-136,117],[-120,90],[-100,50],[-80,10],[-66,-14]]});
// Normans
war('W11',{name:'Normans · Guiscard',color:'#2a3f7a',flag:'#d4af37',n:90,dep:0.0,arr:1.9,hold:1.2,ret:1.1,R:5,path:[[200,170],[150,130],[110,90],[70,56],[44,32],[32,20]]});
// 1527
war('W12',{name:'Imperial troops · Bourbon',color:'#c8aa2b',flag:'#1a1a1a',n:120,dep:0.2,arr:2.5,hold:1.5,ret:0.9,R:5,path:[[-50,-190],[-52,-140],[-52,-100],[-50,-65],[-48,-35],[-46,-14]]});
// French 1798
war('W13',{name:'Army of France',color:'#2a4a9a',flag:'#e8e8e8',n:90,dep:0.1,arr:2.1,hold:1.2,R:4,path:[[-6,-200],[-8,-140],[-8,-90],[-8,-55],[-8,-36]]});
// 1849
war('W14',{name:'French army · Oudinot',color:'#2a3f8a',flag:'#c0382b',n:90,dep:0.1,arr:2.3,hold:1.7,R:5,path:[[-260,-40],[-190,-26],[-120,-14],[-80,-4],[-58,6]]});
war('W14',{name:'Garibaldi',color:'#cc2b2b',flag:'#cc2b2b',n:50,dep:0.3,arr:1.2,hold:2.2,R:3,key:'gar',path:[[-30,2],[-44,4],[-52,6]]});
// 1870
war('W15',{name:'Italian army · Cadorna',color:'#6b7a5a',flag:'#2f8a3c',n:110,dep:0.1,arr:2.3,hold:1.0,R:4,path:[[200,-110],[140,-85],[95,-62],[60,-44],[36,-30]]});
// 1922
war('W16',{name:'Blackshirts',color:'#26262a',flag:'#a31f23',n:100,dep:0.0,arr:1.8,hold:0.8,R:4,path:[[-10,-210],[-6,-150],[-2,-90],[0,-50],[0,-24],[-2,-10]]});
// 1943-44
war('W17',{name:'Wehrmacht',color:'#6a6f66',flag:'#2a2a2a',n:90,dep:0.1,arr:1.3,hold:0.9,ret:1.6,R:4,path:[[-8,-200],[-6,-120],[-3,-60],[-2,-24]]});
war('W17',{name:'Allied army · Fifth Army',color:'#6b7a3a',flag:'#e8e8f0',n:100,dep:0.9,arr:2.9,hold:1.2,R:4,key:'allies',path:[[190,210],[140,160],[90,110],[55,74],[34,50],[22,34]]});
A.finalize();

/* =====================================================================
   9. MAP LABELS
   ===================================================================== */
const pl=(txt,x,z,t0,t1)=>E.addLabel(txt,()=>[x,heightAt(x,z)+3,z],t0,t1,'place');
pl('ROME',2,8,0.3,10);pl('VEII',-15,-95,0,T('W1',3.0));pl('OSTIA',-132,122,0.2,6);pl('TIBUR',135,-45,0.2,6);pl('ALBAN HILLS',150,148,0.2,4);pl('TYRRHENIAN SEA',-210,40,0.0,3.5);pl('TIBER',-48,-30,3.5,9);
pl('VATICAN',-62,-24,T('W9',0),T('W9',3.5));pl('OSTIA',-132,122,T('W6',0),T('W6',4));pl('OSTIA',-132,122,T('W10',0),T('W10',3.5));
pl('PORTA PIA',30,-24,T('W15',1.6),T('W15',3.5));pl('JANICULUM',-52,6,T('W14',1.0),T('W14',4));pl('RUBICON',12,-190,T('W4',0),T('W4',1.6));
E.start(FIRES);
window.__dbg=()=>({gens:(()=>{const c={};for(const o of K.OBS_DEBUG()){if(o.house){const k='g'+(o.gen??'u');c[k]=(c[k]||0)+1}}return c})(),stats:K.stats,lives:all.length,roman:roman.length,gen2:lives2.length,gen3:lives3.length,towns:towns.length,dur:DURATION,cards:CARDS.length,items:Object.fromEntries(Object.entries(E.items).map(([k,v])=>[k,v.length]))});
