// Moscow, 1147-2026: the world, its landmarks and its houses. The story clock (cards) is linear by era;
// the vertical short (mshort.js) maps video seconds onto it.
import * as E from './engine.js';
import * as K from './city.js';
import * as R from './rome.js';
import * as MD from './modern.js';
const {THREE,add,frame,B,clamp,lerp,smooth,hash2,mulberry,fbm,NO,rotTo,rotXZ}=E;
const rr=mulberry(1147);
const darker=(c,k=0.8)=>new THREE.Color(c).multiplyScalar(k);

/* =====================================================================
   1. WORLD: Moskva and Yauza rivers, Borovitsky hill, Sparrow Hills (1 unit ~ 100 m, Kremlin at 0,0, north = -z)
   ===================================================================== */
const MOSKVA=[[-170,-40],[-130,-58],[-100,-45],[-88,-15],[-98,12],[-78,24],[-58,10],[-42,2],[-30,10],[-28,28],[-32,44],[-20,52],[-8,42],[-8,26],[0,13],[12,12],[24,18],[32,30],[40,46],[54,62],[64,82],[88,96],[125,104],[170,124],[260,150]];
const YAUZA=[[45,-140],[40,-100],[36,-62],[30,-34],[26,-12],[23,4],[22,15]];
const RIVERS=[{pts:MOSKVA,sig:3.2,depth:3.6},{pts:YAUZA,sig:1.5,depth:2.6}];
const SEGS=[];for(const [ri,rv] of RIVERS.entries())for(let i=0;i<rv.pts.length-1;i++){const [ax,az]=rv.pts[i],[bx,bz]=rv.pts[i+1];SEGS.push({ax,az,bx,bz,ri})}
const GC=12,GRID=new Map();
for(const [si,s] of SEGS.entries()){const pad=14,x0=Math.floor((Math.min(s.ax,s.bx)-pad)/GC),x1=Math.floor((Math.max(s.ax,s.bx)+pad)/GC),z0=Math.floor((Math.min(s.az,s.bz)-pad)/GC),z1=Math.floor((Math.max(s.az,s.bz)+pad)/GC);
  for(let i=x0;i<=x1;i++)for(let j=z0;j<=z1;j++){const k=i+','+j;if(!GRID.has(k))GRID.set(k,[]);GRID.get(k).push(si)}}
function segD(px,pz,s){const dx=s.bx-s.ax,dz=s.bz-s.az,L2=dx*dx+dz*dz,u=clamp(((px-s.ax)*dx+(pz-s.az)*dz)/L2);return Math.hypot(px-(s.ax+dx*u),pz-(s.az+dz*u))}
function riverNear(x,z){            // [distance to Moskva, distance to Yauza]
  const out=[99,99],a=GRID.get(Math.floor(x/GC)+','+Math.floor(z/GC));
  if(a)for(const si of a){const s=SEGS[si],d=segD(x,z,s);if(d<out[s.ri])out[s.ri]=d}
  return out;
}
const HILLS=[[-1,-2,1.4,5],[-34,60,6,10],[-50,56,5,9],[-62,118,7,30],[60,-40,3,18],[-90,-90,4,26],[110,-70,4,24]];
function heightAt(x,z){
  let h=1.3+0.9*fbm(x*0.02+3,z*0.02+7)+2.2*fbm(x*0.006+11,z*0.006+2);
  for(const [hx,hz,hh,s] of HILLS)h+=hh*Math.exp(-((x-hx)**2+(z-hz)**2)/(2*s*s));
  const rd=riverNear(x,z);
  for(const [ri,rv] of RIVERS.entries())h-=rv.depth*Math.exp(-((rd[ri]/rv.sig)**2));
  return h;
}
function riverDist(x,z){const rd=riverNear(x,z);return Math.min(rd[0]*(4.4/RIVERS[0].sig),rd[1]*(4.4/RIVERS[1].sig)*0.75)}
E.setWorld({heightAt,riverDist,marshAt:()=>0});
const H=E.heightAt;

/* =====================================================================
   2. STORY CLOCK, POPULATION, RULERS
   ===================================================================== */
const ERAS=[[1147,1300],[1300,1500],[1500,1700],[1700,1812],[1812,1900],[1900,1950],[1950,1990],[1990,2026]];
const CARDS=ERAS.map(([y0,y1],i)=>({t0:i*10,t1:(i+1)*10,y0,y1,title:'',sub:'',cam:[]}));
const SH='<path d="M2 2h20v14c0 6-5 9-10 11C7 25 2 22 2 16z"';
const sv=(fill,inner)=>`<svg viewBox="0 0 24 28">${SH} fill="${fill}" stroke="#e9d6a1" stroke-width="1.4"/>${inner}</svg>`;
const RIDER='<circle cx="12" cy="12" r="5" fill="none" stroke="#f0cf6a" stroke-width="1.6"/><path d="M12 7v-3M12 17v6" stroke="#f0cf6a" stroke-width="1.6"/>';
const EAGLE2='<path d="M12 6l-2 4-6-2 3 5-3 3 5-1 3 5 3-5 5 1-3-3 3-5-6 2z" fill="#f0cf6a"/>';
const POLITIES=[
 {from:-9999,name:"Vladimir-Suzdal",svg:sv('#3a5a8a',RIDER)},
 {from:1263,name:"Principality of Moscow",svg:sv('#a3221f',RIDER)},
 {from:1328,name:"Grand Duchy of Moscow",svg:sv('#a3221f',RIDER)},
 {from:1547,name:"Tsardom of Russia",svg:sv('#a3221f',EAGLE2)},
 {from:1721,name:"Russian Empire",svg:sv('#c9a227','<path d="M12 6l-2 4-6-2 3 5-3 3 5-1 3 5 3-5 5 1-3-3 3-5-6 2z" fill="#1a1a1a"/>')},
 {from:1917.85,name:"Soviet Russia",svg:sv('#b3181f','<path d="M7 17l5-9 5 9M8 11h8" stroke="#f0cf6a" stroke-width="1.8" fill="none"/>')},
 {from:1922.99,name:"Soviet Union",svg:sv('#b3181f','<polygon points="12,6 13.500,10.500 18,10.500 14.500,13.500 16,18 12,15 8,18 9.500,13.500 6,10.500 10.500,10.500" fill="#f0cf6a"/>')},
 {from:1991.98,name:"Russian Federation",svg:`<svg viewBox="0 0 24 28">${SH} fill="#f4f4f4" stroke="#e9d6a1" stroke-width="1.4"/><rect x="3" y="10" width="18" height="6" fill="#2a4fa0"/><path d="M3 16h18v1c0 4-4 7-9 9-5-2-9-5-9-9z" fill="#c4262b"/></svg>`},
];
const POP=[[1147,500],[1300,5000],[1400,30000],[1500,100000],[1600,100000],[1700,150000],[1800,250000],[1811,270000],[1813,215000],[1850,370000],[1900,1040000],[1917,1850000],[1920,1030000],[1939,4100000],[1959,6000000],[1979,7900000],[1989,8900000],[2002,10400000],[2010,11500000],[2026,13100000]];
E.setup({marsh:false,dryness:0.15,cards:CARDS,pop:POP,polities:POLITIES,
  camera:{dist:[[0,200],[80,200]],elev:[[0,45],[80,45]],az:[[0,0],[80,0]],tx:[[0,0],[80,0]],tz:[[0,0],[80,0]]}});

/* =====================================================================
   3. BUILDING KIT
   ===================================================================== */
function gable(f,lx,yTop,lz,len,wid,P,roofCol,wallCol,db,o,ovh=0.12){
  const half0=wid/2,halfS=half0+ovh,slope=P/half0,al=Math.atan(slope),th=0.07,Ls=halfS*Math.hypot(1,slope),cy=yTop+P-slope*halfS/2+(th/2)/Math.cos(al)+0.012;
  f.a('tri',lx,yTop,lz,len,P,wid,wallCol,db,o);
  for(const sg of [1,-1])f.a('slab',lx,cy,lz+sg*halfS/2,len+0.2,th,Ls,roofCol,db+0.1,o,0,sg*al,0);
  f.a('box',lx,yTop+P+0.04,lz,len+0.26,0.07,0.16,darker(roofCol,0.78),db+0.2,o);
}
const GOLD='#d9b04a',WHITE='#efe9dc',BRICK='#a8402f';
/** Orthodox church: white cube, apse, one or five onion domes on drums, optional bell tower */
function church(x,z,face,year,o={}){
  const s=o.s??1,y=H(x,z),b=B(year),f=frame(x,y,z,face,b,1.0),od=o.die?{d:B(o.die)}:{};
  const wall=o.wall??WHITE,dome=o.dome??GOLD;
  K.reg(K.rect(x,z,1.6*s+(o.bell?1.2*s:0),1.4*s,face,{mon:1,late:year}));
  f.a('box',0,-0.4,0,2.4*s,0.6,2.2*s,'#b9b2a2',0,od);
  f.a('box',0,0.1,0,2.0*s,1.8*s,1.8*s,wall,0.1,od);
  f.a('cyl',-1.0*s,0.1,0,1.2*s,1.4*s,1.2*s,wall,0.15,od);
  f.a('box',0,0.1+1.8*s,0,2.1*s,0.12,1.9*s,o.roof??'#5f7d5a',0.3,od);
  const drums=o.domes===5?[[0,0,1],[0.6,0.55,0.62],[-0.6,0.55,0.62],[0.6,-0.55,0.62],[-0.6,-0.55,0.62]]:[[0,0,1]];
  drums.forEach(([dx,dz,k],i)=>{
    f.a('cyl8',dx*s,0.2+1.8*s,dz*s,0.55*s*k,0.75*s*k,0.55*s*k,wall,0.4+i*0.05,od);
    f.a('onion',dx*s,0.2+1.8*s+0.75*s*k,dz*s,0.78*s*k,1.15*s*k,0.78*s*k,i===0?dome:(o.dome2??dome),0.55+i*0.05,od);
    f.a('box',dx*s,0.2+1.8*s+1.9*s*k,dz*s,0.04,0.35*s*k,0.04,GOLD,0.7,od);
  });
  if(o.bell){const bx=1.8*s;
    f.a('box',bx,-0.3,0,1.0*s,3.6*s,1.0*s,wall,0.3,od);
    f.a('arch',bx,2.4*s,0,0.4*s,0.7*s,1.04*s,'#3a2e24',0.4,od);f.a('arch',bx,2.4*s,0,0.4*s,0.7*s,1.04*s,'#3a2e24',0.4,od,Math.PI/2);
    if(o.tent)f.a('roofP',bx,3.3*s,0,1.1*s,1.8*s,1.1*s,'#5f7d5a',0.5,od);
    else{f.a('cyl8',bx,3.3*s,0,0.5*s,0.4*s,0.5*s,wall,0.5,od);f.a('onion',bx,3.7*s,0,0.6*s,0.9*s,0.6*s,dome,0.6,od)}
  }
}
/** walls along a polyline, with towers; styles: wood, white, brick, earth */
const WSTY={
  wood:{h:1.1,t:0.5,col:'#7a5634',tow:'#6e4c2e',roof:'#5a4a3a',tent:1.3},
  white:{h:1.5,t:0.6,col:'#e6e1d4',tow:'#ddd7c8',roof:'#6e5a46',tent:1.6},
  brick:{h:2.0,t:0.7,col:BRICK,tow:'#9c3a2a',roof:'#4f7a5a',tent:2.6},
  earth:{h:1.0,t:1.6,col:'#7d8a52',tow:'#6f7c48',roof:'#5a4a3a',tent:0},
};
function wallPath(pts,closed,year,die,sty,o={}){
  const S=WSTY[sty],b0=B(year),od=die?{d:B(die)}:{},n=pts.length-(closed?0:1);let k=0;
  for(let i=0;i<n;i++){
    const [x0,z0]=pts[i],[x1,z1]=pts[(i+1)%pts.length],L=Math.hypot(x1-x0,z1-z0),m=Math.max(1,Math.round(L/2.2)),ry=rotTo(x1-x0,z1-z0);
    for(let j=0;j<m;j++){
      const u=(j+0.5)/m,x=lerp(x0,x1,u),z=lerp(z0,z1,u);
      if(riverDist(x,z)<4.2)continue;
      if(o.gaps&&o.gaps.some(([gx,gz])=>Math.hypot(gx-x,gz-z)<2.2))continue;
      const gy=H(x,z),b=b0+(k++%40)*0.02;
      add('box',x,gy-0.4,z,ry,L/m*1.04,S.h+0.4,S.t,S.col,b,{dur:0.6,...od});
      if(!o.noReg)K.reg(K.rect(x,z,L/m/2,S.t/2+0.3,ry,{mon:1,wallSeg:1}));
      if(sty==='brick')for(const q of [-0.3,0,0.3]){const [ox,oz]=rotXZ(q*L/m,0,ry);add('box',x+ox,gy+S.h,z+oz,ry,0.22,0.32,S.t*0.7,'#9c3a2a',b+0.1,{dur:0.5,...od})}
    }
  }
  if(S.tent===0)return;
  pts.forEach(([x,z],i)=>{
    if(!closed&&(i===0||i===pts.length-1)&&o.noEndTowers)return;
    if(riverDist(x,z)<4.0)return;
    const gy=H(x,z),b=b0+0.2+i*0.03,w=S.t*2.3,th=S.h*1.9;
    add(sty==='white'?'cyl':'box',x,gy-0.4,z,0,w,th+0.4,w,S.tow,b,{dur:0.7,...od});
    add('roofP',x,gy+th,z,0,w*1.15,S.tent,w*1.15,S.roof,b+0.15,{dur:0.7,...(o.tentDie?{d:B(o.tentDie)}:od)});
    if(o.stars)add('box',x,gy+th+S.tent,z,0,0.26,0.26,0.08,'#d8262b',B(o.stars),{dur:0.5,...od});
  });
}
function bellTowerIvan(x,z,year){
  const y=H(x,z),f=frame(x,y,z,0,B(year),1.2);K.reg(K.circ(x,z,1.4,{mon:1,late:year}));
  for(let k=0;k<4;k++){const r=1.3-k*0.22,h=1.6-k*0.15,y0=-0.3+[0,1.6,3.05,4.4][k];f.a('cyl8',0,y0,0,r*2,h,r*2,WHITE,k*0.25);f.a('arch',0,y0+h*0.4,0,0.35,h*0.45,r*2+0.05,'#3a2e24',k*0.25+0.1)}
  f.a('cyl8',0,5.6,0,1.2,0.8,1.2,WHITE,1.1);f.a('onion',0,6.4,0,1.5,2.0,1.5,GOLD,1.3);f.a('box',0,8.4,0,0.06,0.6,0.06,GOLD,1.4);
}
function stBasil(x,z,year){
  const y=H(x,z),f=frame(x,y,z,0.3,B(year-6),1.1);K.reg(K.circ(x,z,3.4,{mon:1,late:year}));
  f.a('box',0,-0.4,0,5.2,0.9,5.2,'#b4402e',0);
  f.a('cyl8',0,0.5,0,2.0,3.0,2.0,'#c8553a',0.3);f.a('roofP',0,3.5,0,2.0,2.8,2.0,'#d6b04c',0.6);f.a('onion',0,6.2,0,0.6,0.8,0.6,GOLD,0.8);
  const cols=[['#2f8a4a','#e8d24a'],['#c4262b','#f2efe2'],['#2a5fa8','#e8d24a'],['#e0a03a','#2f8a4a'],['#2f8a4a','#c4262b'],['#c4262b','#2a5fa8'],['#2a5fa8','#f2efe2'],['#e8d24a','#c4262b']];
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2,r=i%2?1.75:1.95,dx=Math.cos(a)*r,dz=Math.sin(a)*r,hh=i%2?1.7:2.3;
    f.a('cyl8',dx,0.5,dz,0.95,hh,0.95,'#c25a3c',0.4+i*0.05);f.a('onion',dx,0.5+hh,dz,1.15,1.5,1.15,cols[i][0],0.7+i*0.05);
    f.a('onion',dx,0.5+hh+0.2,dz,0.7,0.9,0.7,cols[i][1],0.75+i*0.05)}
}
function monastery(x,z,year,o={}){
  const s=o.s??1,R=3.4*s,pts=[[x-R,z-R],[x+R,z-R],[x+R,z+R],[x-R,z+R]];
  K.reg(K.rect(x,z,R+0.6,R+0.6,0,{mon:1,late:year,wallSeg:1}));
  wallPath(pts,true,year+20,null,o.wall??'white',{noReg:true});
  church(x,z+0.5,0,year,{domes:5,s:0.9*s,dome:o.dome??GOLD,noReg:true});
  church(x+1.6*s,z-2.0*s,0,year+60,{s:0.55*s,bell:true,tent:o.tent});
}
function palace(x,z,ry,year,len,wid,floors,col,o={}){
  const y=H(x,z),b=B(year),f=frame(x,y,z,ry,b,1.0),od=o.die?{d:B(o.die)}:{};
  K.reg(K.rect(x,z,len/2+0.4,wid/2+0.4,ry,{mon:1,late:year}));
  const fh=0.8,hh=floors*fh;
  f.a('box',0,-0.4,0,len+0.1,0.6,wid+0.1,'#b9b2a2',0,od);f.a('box',0,0.1,0,len,hh,wid,col,0.1,od);
  for(let k=1;k<floors;k++)f.a('box',0,0.1+k*fh-0.03,0,len+0.05,0.06,wid+0.05,darker(col,0.9),0.15,od);
  for(let k=0;k<floors;k++)f.a('box',0,0.1+k*fh+0.3,0,len*0.9,0.24,wid+0.05,'#3a3530',0.2+k*0.03,od);
  f.a('box',0,0.1+hh,0,len+0.16,0.1,wid+0.16,'#f2eee4',0.3,od);
  if(o.flat)f.a('box',0,0.2+hh,0,len,0.12,wid,o.roof??'#7a7f80',0.4,od);else gable(f,0,0.2+hh,0,len,wid,wid*0.22,o.roof??'#4f7a5a',col,0.4,od);
  if(o.portico){for(let i=0;i<(o.cols??6);i++)f.a('cyl8',-len*0.22+len*0.44*i/((o.cols??6)-1),0.1,wid/2+0.45,0.24,hh-0.1,0.24,'#f2eee4',0.5+i*0.03,od);
    f.a('box',0,hh-0.05,wid/2+0.45,len*0.5,0.2,0.8,'#f2eee4',0.7,od);
    f.a('tri',0,hh+0.15,wid/2+0.45,len*0.5,0.55,0.8,'#f2eee4',0.75,od,Math.PI/2*0)}
  if(o.dome){f.a('cyl8',0,0.2+hh,0,1.6,0.6,1.6,col,0.6,od);f.a('dome',0,0.8+hh,0,1.6,1.4,1.6,o.domeCol??'#4f7a5a',0.7,od)}
}
function stalinTower(x,z,year,h,w,o={}){
  const y=H(x,z),b=B(year-4),f=frame(x,y,z,o.ry??0,b,0.8),col=o.col??'#d8c7a2';
  K.reg(K.rect(x,z,w*0.9+(o.wings?w:0),w*0.9,o.ry??0,{mon:1,late:year}));
  if(o.wings)for(const sg of [1,-1]){f.a('box',sg*w*1.1,-0.3,0,w*1.2,h*0.32,w*0.9,col,0.1);f.a('box',sg*w*1.1,h*0.32-0.3,0,w*0.5,h*0.12,w*0.5,col,0.3)}
  f.a('box',0,-0.3,0,w,h*0.5,w,col,0.2);f.a('box',0,h*0.5-0.3,0,w*0.72,h*0.22,w*0.72,col,0.5);f.a('box',0,h*0.72-0.3,0,w*0.5,h*0.12,w*0.5,col,0.8);
  for(let k=1;k<9;k++)f.a('box',0,-0.3+h*0.5*k/9,0,w*1.01,0.05,w*1.01,darker(col,0.88),0.3);
  f.a('cone',0,h*0.84-0.3,0,w*0.32,h*0.24,w*0.32,'#c9b78e',1.0);f.a('box',0,h*1.08-0.3,0,0.1,0.5,0.1,GOLD,1.2);f.a('box',0,h*1.13-0.3,0,0.4,0.4,0.1,'#c4262b',1.3);
}
function glassTower(x,z,year,w,d,h,col,o={}){
  const y=H(x,z),b=B(year-3),f=frame(x,y,z,o.ry??0,b,0.9);K.reg(K.rect(x,z,w/2+0.3,d/2+0.3,o.ry??0,{mon:1,late:year}));
  f.a('box',0,-0.3,0,w,h,d,col,0);
  for(let k=1;k<h/1.6;k++)f.a('box',0,-0.3+k*1.6,0,w+0.04,0.05,d+0.04,darker(col,1.15),0.4);
  if(o.spire)f.a('cone',0,h-0.3,0,w*0.5,o.spire,d*0.5,darker(col,1.1),1.0);else f.a('box',0,h-0.3,0,w*0.7,0.5,d*0.7,darker(col,0.9),1.0);
}
function ostankino(x,z,year){
  const y=H(x,z),f=frame(x,y,z,0,B(year-4),2.2);K.reg(K.circ(x,z,3,{mon:1,late:year}));
  f.a('cone',0,-0.2,0,4.4,5.0,4.4,'#d8d6cf',0);
  const tiers=[[1.5,6],[1.2,6],[0.95,5],[0.75,4]];let yy=3.5;
  tiers.forEach(([r,h],i)=>{f.a('cyl',0,yy,0,r,h,r,'#e2e0d8',0.4+i*0.25);yy+=h});
  f.a('cyl',0,17,0,2.2,1.1,2.2,'#bcc6cc',1.4);f.a('cyl',0,yy,0,0.5,4,0.5,'#d8262b',1.6);f.a('cyl',0,yy+4,0,0.3,3,0.3,'#f2efe8',1.7);
}

/* =====================================================================
   4. LANDMARKS (registered before any house)
   ===================================================================== */
const KR=[[-9,6],[9,6],[-1.5,-10]];                       // Kremlin triangle
const kremlinRect=K.reg(K.rect(-0.5,0.6,8.6,7.0,0,{mon:1,wallSeg:1}));
wallPath(KR,true,1156,1339,'wood');
wallPath(KR,true,1339,1367,'wood');
wallPath(KR,true,1367,1485,'white');
wallPath(KR,true,1485,null,'brick',{tentDie:null,stars:1935,noReg:true});
// inside the Kremlin
church(-1.2,-1.4,-Math.PI/2,1479,{domes:5,s:1.0,noReg:true});            // Assumption
church(2.8,2.0,-Math.PI/2,1508,{domes:5,s:1.0,dome:'#cfd3d6',noReg:true}); // Archangel
church(-4.0,1.3,-Math.PI/2,1489,{domes:5,s:0.8,noReg:true});           // Annunciation
bellTowerIvan(1.8,-2.4,1508);
palace(-2.5,4.2,0,1849,7.0,2.0,3,'#efe1c2',{roof:'#5f7d5a'});             // Grand Kremlin Palace
palace(-1.3,-5.6,0,1787,3.0,1.5,3,'#e8cf86',{dome:true,domeCol:'#4f7a5a'}); // Senate
// Red Square, St Basil's, GUM, Historical Museum, Mausoleum
const rsAng=rotTo(-10.5,-16),[rsx,rsz]=[3.75+0.84*4.2,-2-0.55*4.2];
K.reg(K.rect(rsx,rsz,7.4,2.3,rsAng,{mon:1,late:1493}));
add('box',rsx,H(rsx,rsz)-0.05,rsz,rsAng,14.5,0.12,4.2,'#a39282',B(1493),{dur:1.2});
stBasil(10.8,3.6,1561);
{const gx=rsx+0.84*3.9,gz=rsz-0.55*3.9;palace(gx,gz,rsAng,1893,9.5,2.0,3,'#dccbb0',{roof:'#8a9aa0'})}
palace(-4.0,-11.6,rsAng+Math.PI/2*0,1883,3.2,2.0,3,'#a8402f',{roof:'#4f7a5a'});
{const mx=rsx-0.84*1.4,mz=rsz+0.55*1.4,f=frame(mx,H(mx,mz),mz,rsAng,B(1930),1.0);f.a('box',0,-0.2,0,2.2,0.6,1.4,'#5a2622',0);f.a('box',0,0.4,0,1.5,0.5,1.0,'#6a2a26',0.2);f.a('box',0,0.9,0,0.8,0.4,0.6,'#5a2622',0.4)}
// Kitai-gorod, White City, Earth City walls -> later boulevards and the Garden Ring
wallPath([[-1.5,-10],[4,-14],[18,-13],[22,-3],[20,8]],false,1538,1934,'brick',{noEndTowers:true});
const arc=(R,a0,a1,n)=>{const p=[];for(let i=0;i<=n;i++){const a=lerp(a0,a1,i/n);p.push([R*Math.cos(a),R*Math.sin(a)])}return p};
wallPath(arc(16,Math.PI*0.93,Math.PI*2.03,22),false,1585,1775,'white');
wallPath(arc(25,0,Math.PI*2,40),true,1592,1816,'earth');
// monasteries ring
monastery(-21,22,1524,{s:0.95});                 // Novodevichy
monastery(-3,52,1591,{s:0.9,wall:'brick'});      // Donskoy
monastery(10,48,1282,{s:0.8});                   // Danilov
monastery(40,34,1370,{s:0.9});                   // Simonov
monastery(30,-2,1357,{s:0.75});                  // Andronikov
monastery(20,26,1490,{s:0.8});                   // Novospassky
// Kolomenskoye: the tent-roofed Church of the Ascension
{const x=72,z=100,f=frame(x,H(x,z),z,0,B(1532),1.2);K.reg(K.circ(x,z,2.5,{mon:1}));f.a('box',0,-0.3,0,2.6,1.2,2.6,WHITE,0);f.a('cyl8',0,0.9,0,1.9,2.0,1.9,WHITE,0.2);f.a('roofP',0,2.9,0,1.9,4.2,1.9,'#e8e2d4',0.5);f.a('onion',0,7.0,0,0.5,0.7,0.5,GOLD,0.8)}
// classical and imperial Moscow
palace(4,-17,0,1825,4.0,2.8,3,'#efe3c2',{portico:true,cols:8,roof:'#7a7f80'});                 // Bolshoi Theatre
church(-14,8,0,1883,{domes:5,s:2.1,die:1931});                                                   // Christ the Saviour (old)
add('cyl',-14,H(-14,8)+0.05,8,0,7,0.15,7,'#5aa0c8',B(1960),{dur:1,d:B(1994)});                  // Moskva swimming pool
church(-14.2,8,0,2000,{domes:5,s:2.1,noReg:true});                                              // rebuilt
// Stalin's Seven Sisters
stalinTower(-34,66,1953,13,3.2,{wings:true});    // Moscow State University
stalinTower(-38,-8,1957,8,2.4);                  // Hotel Ukraina
stalinTower(20,9,1952,7.5,2.6,{wings:true,ry:0.6});// Kotelnicheskaya
stalinTower(-22,0,1953,8,2.4);                   // Foreign Ministry
stalinTower(21,-24,1954,7,2.0);                  // Leningradskaya
stalinTower(-25,-10,1954,7.4,2.4);               // Kudrinskaya
stalinTower(18,-14,1953,6.8,2.4);                // Red Gates
MD.stadium(-19,33,0.8,1956);                     // Luzhniki
ostankino(4,-82,1967);
{const x=14,z=-90,f=frame(x,H(x,z),z,0,B(1939),1.2);K.reg(K.rect(x,z,3,4,0,{mon:1}));f.a('box',0,-0.2,0,4,0.3,6,'#d8d0c0',0);f.a('box',0,0.1,-1.5,2.4,2.4,1.6,'#efe3c2',0.2);f.a('cone',0,2.5,-1.5,0.6,3.2,0.6,GOLD,0.5);f.a('cyl',0,0.1,1.6,1.8,0.3,1.8,'#5aa0c8',0.4)} // VDNKh
// Moscow City
[[-52,-12,2.6,2.6,48,2016,'#4f7fae',5],[-49,-8,2.8,2.4,38,2015,'#6f9cc4'],[-55,-6,2.4,2.4,34,2007,'#8fb3cf'],[-46,-14,2.2,2.2,28,2010,'#5d88b3'],
 [-56,-15,2.4,2.8,42,2014,'#3f6f9e',4],[-50,-17,2.2,2.2,24,2005,'#a5c2d8'],[-45,-7,2.0,2.0,20,2003,'#b8cfe0'],[-59,-10,2.2,2.2,31,2019,'#5f8db8']]
  .forEach(([x,z,w,d,h,y,c,sp])=>glassTower(x,z,y,w,d,h,c,{spire:sp}));
// bridges
function bridgeAt(seg,u,year,col){const s=SEGS[seg],x=lerp(s.ax,s.bx,u),z=lerp(s.az,s.bz,u),ry=rotTo(-(s.bz-s.az),s.bx-s.ax),f=frame(x,0,z,ry,B(year),1.0);
  f.a('box',0,0.85,0,11,0.3,1.4,col,0);for(const dx of [-3,0,3])f.a('box',dx,-0.2,0,0.8,1.1,1.2,darker(col,0.9),0.1)}
bridgeAt(13,0.5,1692,'#d9d0bc');bridgeAt(14,0.5,1872,'#9a8f80');bridgeAt(15,0.4,1938,'#8a8a8a');bridgeAt(12,0.5,1938,'#8a8a8a');bridgeAt(10,0.6,1959,'#8a8a8a');bridgeAt(7,0.5,1957,'#9a9a9a');bridgeAt(16,0.5,1938,'#8a8a8a');

/* =====================================================================
   5. STREETS: radials from the Kremlin, rings that replace the walls
   ===================================================================== */
const mains=[];
[-170,-142,-115,-92,-68,-42,-18,8,38,68,100,128,152].forEach((a,k)=>{
  const th=a*Math.PI/180,pts=[];
  for(let r=11;r<=150;r+=(r<40?3:8)){const t2=th+0.08*Math.sin(r*0.07+k);pts.push([r*Math.cos(t2),r*Math.sin(t2)])}
  const m=K.makeRoad(pts,1.5,1200+k*10,4,'main',1.8);m.growth2=2.2;mains.push(m);
});
function ring(R,a0,a1,year,w,col,n){const p=arc(R,a0,a1,n);const r=K.makeRoad(p,w,year,0,'main',2.2);r.fixed=year;if(col)r.col=col;return r}
ring(16,Math.PI*0.93,Math.PI*2.03,1820,1.6);           // Boulevard Ring
ring(25,0,Math.PI*2,1830,2.0);                          // Garden Ring
ring(52,0,Math.PI*2,2003,2.2,'#4a4a50');                // Third Ring
ring(118,0,Math.PI*2,1962,2.6,'#46464c');               // MKAD
const LOCAL=K.localStreets(0,0,20,124,{cell:15,len:16,spacing:6.2,seed:11});

/* =====================================================================
   6. HOUSES, generation by generation
   ===================================================================== */
const KITS={
  izba:   {fh:0.62,floors:[1,1,2],wall:['#7a5634','#6e4c2e','#8a6240'],roof:['#6b5a48','#5e5040'],P:0.8,win:'small'},
  posad:  {fh:0.7,floors:[1,2,2],wall:['#8a6240','#e6d6b0','#d9b98a','#c99a6a'],roof:['#5f7d5a','#6b5a48','#7a7f80'],P:0.5,win:'grid'},
  classic:{fh:0.8,floors:[2,2,3],wall:['#e8c86e','#efe3c2','#d9b37c','#e6d0a0','#f0e6cf'],roof:['#4f7a5a','#7a8486','#5f7d5a'],P:0.24,win:'grid',portico:0.18},
  dohod:  {fh:0.75,floors:[4,5,6],wall:['#a8553f','#d8c2a0','#b8b2a6','#c4a582','#e0d2b4'],roof:['#7a8486','#6a6f72'],P:0.18,win:'grid'},
  stalin: {fh:0.72,floors:[7,8,10],wall:['#d9c9a8','#c9b48e','#d6bf98','#e0d4bb'],roof:['#8a8780'],flat:true,win:'rows'},
  panel5: {fh:0.6,floors:[5,5,5],wall:['#dcdcd6','#c8ccd0','#e2dccf','#d4d0c4'],roof:['#7f8084'],flat:true,win:'rows'},
  panel16:{fh:0.6,floors:[9,12,16],wall:['#e4e2dc','#cfd4d8','#e8e0d0','#d0cfc6','#c9d3d9'],roof:['#7f8084'],flat:true,win:'rows'},
  modern: {fh:0.6,floors:[12,16,22],wall:['#7d93a8','#b8c4cc','#e2d6c0','#c9b8a6','#9fb2c0','#e8e4dc'],roof:['#6a6c70'],flat:true,win:'rows'},
};
const kitOf=y=>y<1700?'izba':y<1812?'posad':y<1870?'classic':y<1930?'dohod':y<1956?'stalin':y<1972?'panel5':y<1991?'panel16':'modern';
const pick=a=>a[Math.floor(rr()*a.length)];
function dressM(h){const k=KITS[h.kit],c=new THREE.Color(pick(k.wall));c.offsetHSL((rr()-0.5)*0.02,(rr()-0.5)*0.08,(rr()-0.5)*0.06);h.wall=c;h.roof=new THREE.Color(pick(k.roof));h.fl=pick(k.floors);h.seed=rr();
  if(h.lod===undefined)h.lod=Math.hypot(h.x,h.z)>42?0:1}
const FIRES=[{year:1812.7,x:2,z:-2,r:28,dur:(window.__SHORTCFG?0.08:2.4),rebuild:false,...(window.__SHORTCFG?.fire||{})}].map(f=>({...f,t0:B(f.year)}));
function emitM(h){
  const k=KITS[h.kit],f=frame(h.x,0,h.z,h.ry,B(h.b),0.8);
  let dT=NO;if(h.fire){const fr=FIRES[0];dT=fr.t0+h.fire.frac*fr.dur*0.7}else if(h.dieY!=null)dT=B(h.dieY);
  const o={d:dT,dur:0.8+hash2(Math.round(h.x*7),Math.round(h.z*7))*0.6};
  h.tb=B(h.b);h.td=dT;
  if(dT<=h.tb)return;
  const base=h.ymax+0.1,{w,d}=h,wh=h.fl*k.fh,lod0=h.lod===0;
  f.a('box',0,h.ymin-0.25,0,w+(lod0?0:0.1),base-(h.ymin-0.25),d+(lod0?0:0.1),'#9a9387',-0.05,o);
  f.a('box',0,base,0,w,wh,d,h.wall,0,o);
  if(k.flat){f.a('box',0,base+wh,0,w+0.08,0.1,d+0.08,h.roof,0.5,o);
    if(!lod0){const step=h.fl>10?2:1;for(let q=0;q<h.fl;q+=step)f.a('box',0,base+q*k.fh+k.fh*0.38,0,w*0.86,0.18,d+0.05,'#36393f',0.3+q*0.01,o);
      f.a('box',w*0.2,base+wh+0.1,0,w*0.25,0.3,d*0.3,'#8f8f8a',0.6,o)}
    return}
  if(!lod0&&h.fl>=2)for(let q=1;q<h.fl;q++)f.a('box',0,base+q*k.fh-0.03,0,w+0.05,0.06,d+0.05,darker(h.wall,0.9),0.05,o);
  gable(f,0,base+wh,0,w,d,d*k.P,h.roof,h.wall,0.45,o,0.13);
  if(lod0)return;
  f.a('box',w>1.5?-w*0.22:0,base,0,0.3,0.52,d+0.07,'#3e2f22',0.2,o);
  const n=k.win==='small'?1:Math.max(1,Math.min(4,Math.floor(w/0.6)));
  for(let q=0;q<h.fl;q++)for(let i=0;i<n;i++){
    const xx=n===1?(w>1.5?w*0.22:0):-w/2+w*(i+0.5)/n,wy=base+q*k.fh+k.fh*0.36;
    if(q===0&&n>1&&i===0&&w>1.5)continue;
    if(k.win==='small'){f.a('box',xx,wy-0.04,0,0.3,0.32,d+0.06,'#efe7d6',0.5,o);f.a('box',xx,wy,0,0.18,0.22,d+0.075,'#2b2219',0.55,o)}
    else f.a('box',xx,wy,0,0.17,0.26,d+0.06,'#2b2219',0.5+q*0.03,o);
  }
  if(k.portico&&h.seed<k.portico&&w>1.9){for(let i=0;i<4;i++)f.a('cyl8',-0.6+i*0.4,base,d/2+0.3,0.16,wh-0.1,0.16,'#f2eee4',0.4,o);f.a('box',0,base+wh-0.12,d/2+0.3,1.5,0.14,0.5,'#f2eee4',0.5,o)}
}
const lives=[];
function endY(s){if(s.dieY!=null)return s.dieY;if(s.fire)return 1813;return Infinity}
/** place one generation: slots along roads + infill, soft over older generations, years by distance */
function generation(o){
  const out=[];
  const accept=h=>{const d=Math.hypot(h.x,h.z);if(d<o.R0||d>o.Rlim(h))return false;h.pend=[];
    for(const s of h.soft||[]){if(endY(s)===Infinity){if(rr()<o.demolish)h.pend.push(s);else return false}}return true};
  const opt={soft:true,gen:o.gen,accept,minH:0.4,wmin:o.w[0],wvar:o.w[1],dmin:o.d[0],dvar:o.d[1]};
  if(o.roads)for(const r of o.roads)out.push(...K.houseSlots(r,{...opt,skip:0.1,start:2}));
  out.push(...K.infill(o.tries,()=>true,{...opt,R:o.R1,R0:o.R0,maxD:o.maxD??200}));
  for(const h of out)h.score=Math.hypot(h.x+(o.cx??0),h.z+(o.cz??0))+(rr()-0.5)*o.noise;
  out.sort((a,b)=>a.score-b.score);
  const res=[];
  out.forEach((h,i)=>{
    const fr=(i+0.5)/out.length;let y=o.y0;for(let j=0;j<o.built.length-1;j++){const [y0,f0]=o.built[j],[y1,f1]=o.built[j+1];if(fr<=f1){y=lerp(y0,y1,(fr-f0)/(f1-f0+1e-9));break}}
    h.b=y;for(const s of h.soft||[]){const e=endY(s);if(e!==Infinity)h.b=Math.max(h.b,e+1)}
    if(h.b>=o.y1)return;
    if(h.clear!==undefined){if(h.b>=h.clear-1)return;h.dieY=h.clear-0.5}
    h.kit=o.kit?o.kit(h):kitOf(h.b);dressM(h);
    for(const s of h.pend){s.dieY=Math.min(s.dieY??9999,h.b-0.3);s.fire=null}
    res.push(h);
  });
  lives.push(...res);return res;
}
const hutsMain=mains.map(m=>m);
// wooden Moscow, 1147-1812
const g0=generation({gen:1,R0:0,R1:44,Rlim:()=>44,tries:9000,roads:mains,demolish:0,noise:6,w:[1.2,0.5],d:[1.1,0.3],y0:1147,y1:1812,
  built:[[1147,0],[1250,0.03],[1400,0.12],[1500,0.3],[1600,0.48],[1700,0.7],[1812,1]]});
for(const h of g0){const dd=Math.hypot(h.x-2,h.z+2);if(dd<28&&rr()<0.78&&h.b<1812.6&&(h.dieY==null||h.dieY>1812.7))h.fire={frac:dd/28}}
// stone Moscow after the fire, 1813-1870
generation({gen:2,R0:0,R1:30,Rlim:()=>30,tries:7000,roads:mains,demolish:0.3,noise:8,w:[1.5,0.7],d:[1.3,0.4],y0:1813,y1:1870,built:[[1813,0],[1830,0.5],[1870,1]]});
// apartment houses, 1870-1930
generation({gen:3,R0:0,R1:46,Rlim:()=>46,tries:9000,maxD:30,roads:[...mains,...LOCAL],demolish:0.45,noise:10,w:[1.7,0.8],d:[1.5,0.5],y0:1870,y1:1930,built:[[1870,0],[1900,0.5],[1930,1]]});
// Stalin blocks along the avenues, 1930-1956
generation({gen:4,R0:8,R1:60,Rlim:()=>60,tries:2500,maxD:14,roads:[...mains,...LOCAL],demolish:0.6,noise:14,w:[3,1.4],d:[2,0.6],y0:1930,y1:1956,built:[[1930,0],[1956,1]]});
// Soviet panel districts, 1956-1991
const Rlim5=h=>{const a=Math.atan2(h.z,h.x);return 100+22*fbm(Math.cos(a)*1.6+4,Math.sin(a)*1.6+4)};
generation({gen:5,R0:30,R1:125,Rlim:Rlim5,tries:60000,roads:LOCAL,demolish:0.5,noise:22,w:[3.2,2.4],d:[1.4,0.4],y0:1956,y1:1991,built:[[1956,0],[1972,0.55],[1991,1]],maxD:14});
// new Moscow, 1991-2026
generation({gen:6,R0:6,R1:125,Rlim:()=>125,tries:9000,roads:LOCAL,demolish:0.5,noise:60,w:[2.2,1.2],d:[2.2,1.0],y0:1991,y1:2026,built:[[1991,0],[2026,1]],maxD:14});
// villages around: Kolomenskoye, Tushino, Kuntsevo, Izmailovo ... later swallowed by the city
for(let [x,z,n,b0] of [[70,92,14,1400],[-70,-60,12,1500],[-75,8,12,1450],[70,-20,12,1500],[30,-95,10,1550],[-30,-95,10,1500],[90,40,10,1600]]){
  for(let i=0;i<n*6&&n>0;i++){const a=rr()*Math.PI*2,r=Math.sqrt(rr())*6,hx=x+Math.cos(a)*r,hz=z+Math.sin(a)*r,w=1.2+rr()*0.4,d=1.1+rr()*0.3,ry=rr()*0.5;
    const sl=K.slopeOK(hx,hz,w,d,ry,1.3);if(!sl||riverDist(hx,hz)<5)continue;const rc=K.rect(hx,hz,w/2,d/2,ry);const hit=K.collide(rc,0.2);if(hit.length)continue;
    const h={x:hx,z:hz,ry,w,d,...sl,soft:[],b:b0+rr()*150,kit:'izba',lod:0};dressM(h);
    for(const lv of lives)if(lv.gen>=5&&Math.hypot(lv.x-hx,lv.z-hz)<3){h.dieY=Math.min(h.dieY??9999,lv.b-0.3)}
    K.reg(Object.assign(rc,{house:h,gen:0}));lives.push(h);n--;}
}

/* =====================================================================
   7. EMIT
   ===================================================================== */
K.emitRoads();
const nFixed=K.resolveOverlaps(lives,h=>endY(h));
for(const h of lives)emitM(h);
const nTiles=K.urbanGround(lives,1870,'#8f8c85');
R.scatterTrees(lives,{marsh:false,n:9000,span:600,clusters:true});
const SITES=[['Wooden Kremlin',1156,0,-2],['White-stone Kremlin',1367,0,-2],['Red brick walls',1485,0,-2],['Assumption Cathedral',1479,-1.2,-1.4],['Ivan the Great Bell Tower',1508,1.8,-2.4],
 ["St. Basil's Cathedral",1555,10.8,3.6],['Kitai-gorod wall',1538,14,-13],['Novodevichy Convent',1524,-21,22],['Bolshoi Theatre',1825,4,-17],['Cathedral of Christ the Saviour',1860,-14,8],
 ['Grand Kremlin Palace',1849,-2.5,4.2],['GUM',1893,9,-3],['Lenin Mausoleum',1930,5,-1],['Moscow State University',1949,-34,66],['Luzhniki',1956,-19,33],['MKAD',1962,0,-118],
 ['Ostankino Tower',1963,4,-82],['Christ the Saviour, rebuilt',1995,-14,8],['Moscow City',2003,-52,-12],['Third Ring',2003,0,-52]];
for(const [n,y,x,z] of SITES)E.addLabel(n,()=>[x,H(x,z)+6,z],B(y),B(y)+2.6,'site');
E.start(FIRES);
window.__cards=CARDS;
window.__dbg=()=>({audit:K.auditOverlaps(lives),nFixed,tiles:nTiles,local:LOCAL.length,lives:lives.length,items:Object.fromEntries(Object.entries(E.items).map(([k,v])=>[k,v.length]))});
