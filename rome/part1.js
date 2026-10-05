import * as E from './engine.js';
import * as K from './city.js';
import * as R from './rome.js';
const SH='<path d="M2 2h20v14c0 6-5 9-10 11C7 25 2 22 2 16z"';
const EAGLE='<path d="M12 6l-1.6 3L3.5 8l3.5 4-2 4 5-2 2.5 5 2.5-5 5 2-2-4 3.5-4-6.900 1z" fill="#f0cf6a"/>';
E.setup({
  marsh:true,
  cards:[
   {t0:0,   t1:3.2, y0:-753,y1:-700,title:"A Village on Seven Hills",sub:"Legend says Romulus founded Rome on the Palatine Hill on 21 April 753 BC."},
   {t0:3.2, t1:6,   y0:-700,y1:-509,title:"The Seven Kings",sub:"Etruscan kings drained the marsh with the Cloaca Maxima and built the Forum."},
   {t0:6,   t1:9,   y0:-509,y1:-390,title:"The Republic",sub:"In 509 BC the last king was driven out. Rome chose two consuls instead."},
   {t0:9,   t1:11.5,y0:-390,y1:-312,title:"Sacked, then Walled",sub:"Gauls burned Rome in 390 BC. The city built the Servian Wall and its first aqueduct."},
   {t0:11.5,t1:14.5,y0:-312,y1:-146,title:"The Road to Empire",sub:"Legions conquered Italy, then Carthage. Grain, slaves and gold poured into the city."},
   {t0:14.5,t1:17,  y0:-146,y1:-27, title:"Caesar and Civil War",sub:"A century of civil war ended with Augustus. The Republic became an empire."},
   {t0:17,  t1:19.5,y0:-27, y1:64,  title:"A City of Marble",sub:"Augustus boasted that he found Rome built of brick and left it made of marble."},
   {t0:19.5,t1:22,  y0:64,  y1:80,  title:"The Great Fire of 64",sub:"Fire raged for six days. From the ruins rose the Colosseum."},
   {t0:22,  t1:24.8,y0:80,  y1:126, title:"The Pantheon",sub:"Under Hadrian, Rome was the largest city in the world, home to a million people."},
   {t0:24.8,t1:26.9,y0:126, y1:275, title:"Rome Walls Itself In",sub:"Barbarians on the frontier forced the capital to build the Aurelian Wall."},
   {t0:26.9,t1:30,  y0:275, y1:476, title:"The Last Days",sub:"The Visigoths sacked Rome in 410. In 476 the last western emperor was deposed."},
  ],
  pop:[[-753,1000],[-700,2000],[-600,8000],[-509,25000],[-390,40000],[-312,80000],[-200,200000],[-146,300000],[-27,700000],[1,900000],[64,1000000],[126,1100000],[200,1000000],[275,800000],[330,700000],[395,500000],[410,400000],[455,150000],[476,80000]],
  polities:[
   {from:-9999,name:"Kingdom of Rome",svg:`<svg viewBox="0 0 24 28">${SH} fill="#6a2c8f" stroke="#e9d6a1" stroke-width="1.4"/><polygon points="6,18 7,9 10,13 12,7 14,13 17,9 18,18" fill="#f0cf6a"/></svg>`},
   {from:-509,name:"Roman Republic",svg:`<svg viewBox="0 0 24 28">${SH} fill="#a3221f" stroke="#e9d6a1" stroke-width="1.4"/><text x="12" y="17" text-anchor="middle" font-size="6.2" font-family="Cinzel,serif" font-weight="700" fill="#f0cf6a">SPQR</text></svg>`},
   {from:-27,name:"Roman Empire",svg:`<svg viewBox="0 0 24 28">${SH} fill="#7a1d3e" stroke="#e9d6a1" stroke-width="1.4"/>${EAGLE}</svg>`},
   {from:395,name:"Western Roman Empire",svg:`<svg viewBox="0 0 24 28">${SH} fill="#3d2a7a" stroke="#e9d6a1" stroke-width="1.4"/>${EAGLE}</svg>`},
  ],
  camera:{
    dist:[[0,132],[4,100],[9,70],[14,60],[19,64],[25,74],[30,86]],
    elev:[[0,26],[6,32],[16,37],[30,44]],
    az:[[0,-34],[15,-8],[30,22]],
    tx:[[0,2],[10,2],[30,3]],tz:[[0,9],[10,7],[30,7]],
  },
});
const city=R.buildRome({});
const fires=R.FIRES_DEF.map(f=>({...f,t0:E.B(f.year+(f.shift||0))}));
for(const h of city.houses)K.emitHouse(h,fires);
R.scatterTrees(city.houses,{marsh:true});
// 6 river boats
const boats=[],rb=E.mulberry(8);
for(let i=0;i<6;i++){
  const g=new E.THREE.Group(),hull=new E.THREE.Mesh(new E.THREE.BoxGeometry(2.2,0.4,0.8),new E.THREE.MeshStandardMaterial({color:'#6b4a2a',flatShading:true}));
  hull.position.y=0.3;hull.castShadow=true;g.add(hull);
  const sail=new E.THREE.Mesh(new E.THREE.PlaneGeometry(1.2,1.4),new E.THREE.MeshStandardMaterial({color:'#f4ead2',side:E.THREE.DoubleSide,flatShading:true}));
  sail.position.set(0,1.1,0);sail.rotation.y=Math.PI/2;sail.castShadow=true;g.add(sail);
  E.scene.add(g);boats.push({g,off:i*40+rb()*10,speed:1.1+rb()*0.6,dir:i%2?1:-1,born:E.B(-700+i*55)});
}
E.hooks.update.push(t=>{
  for(const b of boats){
    const gz=((b.off+t*b.speed*b.dir*3)%240+240)%240-120,gx=E.xr(gz),dx=E.xr(gz+b.dir)-gx;
    b.g.position.set(gx+Math.sin(t*1.3+b.off)*0.4,0.15,gz);b.g.rotation.y=Math.atan2(dx,b.dir)+Math.PI/2;
    b.g.visible=t>b.born;b.g.scale.setScalar(E.clamp((t-b.born)/0.5));
  }
});
E.start(fires);
window.__dbg=()=>({clear:city.houses.filter(h=>h.clear!==undefined).length,died:city.houses.filter(h=>h.dieY!=null).length,stats:K.stats,houses:city.houses.length,roads:K.roads.length,items:Object.fromEntries(Object.entries(E.items).map(([k,v])=>[k,v.length]))});
window.__probe=(x,z)=>K.collide(K.rect(x,z,0.8,0.7,0),0.14).map(o=>({t:o.t,x:+o.x.toFixed(1),z:+o.z.toFixed(1),hw:o.hw,hd:o.hd,r:o.r,mon:o.mon,road:o.road,house:!!o.house}));
window.__grid=()=>{const rows=[];for(let z=-34;z<=44;z+=2){let r='';for(let x=-40;x<=44;x+=1){const hs=K.collide(K.rect(x,z,0.05,0.05,0),0.0);r+=hs.length===0?'.':hs.some(o=>o.mon)?'M':hs.some(o=>o.road!==undefined)?'r':hs.some(o=>o.house)?'h':'w'}rows.push(r)}return rows.join('\n')};
window.__big=()=>K.OBS_DEBUG().slice(0,12).map(o=>[o.t,+o.x.toFixed(1),+o.z.toFixed(1),+o.rad.toFixed(1),o.mon?'mon':'',o.road!==undefined?'road':'',o.house?'house':''].join(' '));
window.__obs=()=>K.OBS_DEBUG();
