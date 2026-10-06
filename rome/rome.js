import * as E from './engine.js';
import * as K from './city.js';
const {THREE,add,frame,B,heightAt,riverDist,xr,marshAt,rotTo,rotXZ,clamp,lerp,smooth,hash2,mulberry,NO,C,hooks,scene,fbm}=E;
const {STONE,MARBLE,TRAV,BRICK,DARK,TERRA,temple,basilica,triumphalArch,reg,rect,circ}=K;
const darker=(c,k=0.8)=>new THREE.Color(c).multiplyScalar(k);

/* ---------- ring helper: segments along an ellipse, outward = -local z ---------- */
export function ringSegs(cx,cz,a,b,ry0,N,fn,a0=0,a1=Math.PI*2){
  for(let i=0;i<N;i++){
    const th=lerp(a0,a1,(i+0.5)/N),dth=(a1-a0)/N;
    const lx=a*Math.cos(th),lz=b*Math.sin(th),tx=-a*Math.sin(th),tz=b*Math.cos(th);
    const [wx,wz]=rotXZ(lx,lz,ry0),[wtx,wtz]=rotXZ(tx,tz,ry0);
    const len=Math.hypot(tx,tz)*dth;
    fn({i,th,x:cx+wx,z:cz+wz,ry:rotTo(wtx,wtz),len,frac:i/N,ox:-wtz/Math.hypot(wtx,wtz),oz:wtx/Math.hypot(wtx,wtz)});
  }
}

/* ---------- Colosseum ---------- */
export function colosseum(x,z,year,opt={}){
  const a=8.0,bb=6.6,ry0=0.5,h=1.15,b0=B(year),N=64;
  reg(circ(x,z,9.3,{mon:1,late:year}));
  add('cyl',x,h-0.05,z,ry0,2*(a-2.4),0.1,2*(bb-2.4),'#cdb27a',b0,{dur:1,d:opt.die?B(opt.die):undefined});
  for(let k=0;k<4;k++){          // stepped seating bowl
    const r=a-0.7-0.55*k,q=bb-0.7-0.55*k,H=3.5-0.8*k;
    add('cyl',x,h-0.05,z,ry0,2*r,H,2*q,k%2?'#d7c391':'#c9b184',b0+0.2+k*0.1,{dur:1.0,d:opt.die?B(opt.die):undefined});
  }
  for(let t=0;t<4;t++){
    const fh=t===3?1.0:1.35,y=h+t*1.35;
    ringSegs(x,z,a,bb,ry0,N,s=>{
      const dieY=opt.dieFn?opt.dieFn(t,s):opt.die,o={dur:0.7};if(dieY)o.d=B(dieY);
      const bs=b0+t*0.42+s.frac*0.55;
      add('box',s.x,y,s.z,s.ry,s.len*1.02,fh,0.75,t===3?'#cdb98c':TRAV,bs,o);
      if(t<3){
        add('arch',s.x,y+0.2,s.z,s.ry,s.len*0.5,0.85,0.82,'#30241a',bs+0.05,o);
        add('box',s.x,y+fh-0.1,s.z,s.ry,s.len*1.02,0.1,0.92,'#eadfbd',bs+0.08,o);
      }else if(s.i%2===0){
        add('box',s.x,y+0.3,s.z,s.ry,0.16,0.3,0.82,'#30241a',bs+0.05,o);
        add('box',s.x,y+fh-0.05,s.z,s.ry,s.len*1.02,0.1,0.92,'#e6d9b2',bs+0.08,o);
      }
    });
  }
}

/* ---------- Circus Maximus (with racing chariots) ---------- */
export function circus(x,z,year,opt={}){
  const a=7.4,bb=2.5,ry0=rotTo(0.58,0.81),h=0.95,b0=B(year);
  reg(rect(x,z,a+1.5,bb+1.5,ry0,{mon:1,late:year}));
  const od=opt.die?{d:B(opt.die)}:{};
  add('cyl',x,h+0.02,z,ry0,2*a,0.1,2*bb,'#d8bf7f',b0,{dur:1.2,...od});
  const f=frame(x,h,z,ry0,b0+0.2,0.9);
  f.a('box',0,0.1,0,a*1.5,0.3,0.28,'#cfc2a0',0,od);
  f.a('box',0,0.4,0,0.14,1.0,0.14,'#c97a45',0.2,od);f.a('cone',0,1.4,0,0.2,0.3,0.2,'#d9b24a',0.3,od);
  for(const sx of [-1,1])for(let k=-1;k<=1;k++)f.a('cone',sx*a*0.78,0.1,k*0.4,0.22,0.55,0.22,'#d9cfb2',0.1,od);
  for(let k=0;k<8;k++)f.a('arch',-a-0.3,0.0,-bb+0.4+k*(2*bb-0.8)/7,0.45,0.5,0.35,'#3a2a1c',0.05,od,Math.PI/2);
  ringSegs(x,z,a+0.45,bb+0.45,ry0,44,s=>{
    const o={dur:0.8,...od};
    const hs=heightAt(s.x,s.z);
    add('box',s.x,hs-0.6,s.z,s.ry,s.len*1.05,1.1,0.55,'#d9ccaa',b0+s.frac*0.8,o);
    add('box',s.x,hs+0.45,s.z,s.ry,s.len*1.05,0.55,0.5,'#e6d9b8',B(opt.year2??-46)+s.frac*0.6,o);
  });
  const teams=['#b3282b','#f2eee0','#2f5ea8','#3b8a3f'],cars=teams.map((c,i)=>{
    const g=new THREE.Group();
    const body=new THREE.Mesh(new THREE.BoxGeometry(0.26,0.14,0.16),new THREE.MeshStandardMaterial({color:c,flatShading:true}));body.position.y=0.12;
    const h1=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.14,0.13),new THREE.MeshStandardMaterial({color:'#6b4a2a',flatShading:true}));h1.position.set(0.26,0.13,0);
    body.castShadow=h1.castShadow=true;g.add(body,h1);scene.add(g);return {g,off:i*0.5};
  });
  hooks.update.push(t=>{
    cars.forEach(c=>{
      const th=-(t*1.7+c.off)+0,lx=(a-0.15)*Math.cos(th)*1.0,lz=(bb-0.45-c.off*0.08)*Math.sin(th);
      const [wx,wz]=rotXZ(lx,lz,ry0),[tx,tz]=rotXZ(-(a-0.15)*Math.sin(th),(bb-0.45)*Math.cos(th),ry0);
      c.g.position.set(x+wx,h+0.1,z+wz);c.g.rotation.y=rotTo(-tx,-tz);
      c.g.visible=t>b0+1.6&&(opt.die===undefined||t<B(opt.die));
    });
  });
}

/* ---------- Pantheon ---------- */
export function pantheon(x,z,year,opt={}){
  const y=heightAt(x,z),b=B(year),face=rotTo(0.35,0.94),f=frame(x,y,z,face,b,1.1),o=opt.die?{d:B(opt.die)}:{};
  reg(circ(x,z,5.2,{mon:1,late:year}));
  const R=2.1;
  f.a('box',2.6,-0.3,0,2.6,0.4,5.2,'#cfc5a8',0,o);                           // forecourt
  f.a('cyl',-0.2,-0.2,0,R*2+0.3,0.4,R*2+0.3,'#cbb68f',0.05,o);
  f.a('cyl',-0.2,0.2,0,R*2,1.9,R*2,'#c79e76',0.1,o);                         // drum
  f.a('cyl',-0.2,2.1,0,R*2+0.12,0.12,R*2+0.12,'#e4d6b8',0.2,o);
  for(let k=0;k<3;k++)f.a('cyl',-0.2,2.22+k*0.14,0,(R*2-0.1)-k*0.5,0.14,(R*2-0.1)-k*0.5,k%2?'#a8a090':'#b7b0a0',0.3+k*0.05,o);
  f.a('dome',-0.2,2.64,0,R*1.62,R*1.1,R*1.62,'#a9a597',0.5,o);
  f.a('cyl',-0.2,2.64+R*0.55-0.04,0,0.7,0.06,0.7,'#1d1812',0.7,o);            // oculus
  const px=R-0.2+0.9;                                                          // portico
  f.a('box',px,0.2,0,1.8,1.3,3.4,'#c79e76',0.15,o);
  for(let i=0;i<8;i++){const zz=-1.55+3.1*i/7;K_col(f,px+0.8,zz,0.2,1.45,0.11,MARBLE,0.3+i*0.02,o);if(i%7)K_col(f,px+0.3,zz,0.2,1.45,0.11,MARBLE,0.34,o)}
  f.a('box',px+0.1,1.65,0,2.0,0.2,3.6,'#ece3ce',0.5,o);
  const P=0.62;
  roofGableX(f,px+0.1,1.85,0,2.0,3.6,P,'#9a5a3a','#ebe2cc',0.6,o);
  f.a('arch',px+0.82,0.2,0,0.5,0.9,0.5,'#2a2118',0.4,o,Math.PI/2);
}
function K_col(f,lx,lz,y,h,r,col,db,o){
  f.a('box',lx,y,lz,r*2.9,0.1,r*2.9,col,db,o);f.a('cyl8',lx,y+0.1,lz,r*2,h-0.2,r*2,col,db+0.04,o);f.a('box',lx,y+h-0.1,lz,r*3.1,0.1,r*3.1,col,db+0.08,o);
}
function roofGableX(f,lx,yTop,lz,len,wid,P,roofCol,wallCol,db,o){
  const half0=wid/2,ovh=0.12,halfS=half0+ovh,slope=P/half0,al=Math.atan(slope),th=0.07,Ls=halfS*Math.hypot(1,slope),cy=yTop+P-slope*halfS/2+(th/2)/Math.cos(al)+0.012;
  f.a('tri',lx,yTop,lz,len,P,wid,wallCol,db,o);
  for(const sg of [1,-1])f.a('slab',lx,cy,lz+sg*halfS/2,len+0.2,th,Ls,roofCol,db+0.1,o,0,sg*al,0);
  f.a('box',lx,yTop+P+0.04,lz,len+0.26,0.07,0.16,darker(roofCol,0.78),db+0.2,o);
}

/* ---------- Baths of Caracalla ---------- */
export function baths(x,z,year){
  const y=heightAt(x,z),b=B(year),ry=0.1,f=frame(x,y,z,ry,b,1.2);
  reg(rect(x,z,6.4,4.8,ry,{mon:1,late:year}));
  const wl='#e0cba0';
  for(const sg of [1,-1]){f.a('box',0,0,sg*4.5,12.4,0.9,0.35,'#d3bf94',0);f.a('box',sg*6.1,0,0,0.35,0.9,9.0,'#d3bf94',0.05)}
  for(const sx of [-1,1])for(const sz of [-1,1])f.a('cyl',sx*6.0,0,sz*4.4,0.9,1.4,0.9,'#cdb78a',0.1);
  f.a('box',0,0,0,7.2,1.7,3.4,wl,0.3);
  roofGableX(f,0,1.7,0,7.2,3.4,0.95,'#a84d33','#e8d6ae',0.5,{});
  f.a('cyl',3.9,0,0,3.0,2.0,3.0,'#d9c493',0.5);f.a('dome',3.9,2.0,0,3.0,2.6,3.0,'#b8b09c',0.7);
  f.a('cyl',3.9,2.0+1.3-0.03,0,0.5,0.05,0.5,'#1d1812',0.9);
  for(const sg of [1,-1]){f.a('box',-1.2,0,sg*2.7,2.6,1.2,1.6,wl,0.6);roofGableX(f,-1.2,1.2,sg*2.7,2.6,1.6,0.6,'#a84d33','#e8d6ae',0.8,{})}
  for(let i=0;i<7;i++)f.a('arch',-3.7+i*1.05,0.0,-1.72,0.5,0.9,0.12,DARK,0.8,{});
}
/* ---------- Palatine palace ---------- */
export function palace(x,z,year){
  const y=heightAt(x,z),b=B(year),ry=0.2,f=frame(x,y,z,ry,b,1.1);
  reg(rect(x,z,3.7,2.7,ry,{mon:1,late:year}));
  f.a('box',0,-0.5,0,7.0,0.8,5.0,'#d3c8aa',0);
  f.a('box',0,0.3,-1.9,6.6,1.4,1.3,'#ecdcbd',0.1);roofGableX(f,0,1.7,-1.9,6.6,1.3,0.55,'#b2442a','#efe2c6',0.3,{});
  f.a('box',0,0.3,1.9,6.6,1.1,1.1,'#ecdcbd',0.15);roofGableX(f,0,1.4,1.9,6.6,1.1,0.5,'#b2442a','#efe2c6',0.35,{});
  f.a('box',-3.0,0.3,0,1.1,1.3,2.6,'#ecdcbd',0.2);
  f.a('box',0.4,0.3,0.0,1.7,0.05,0.9,'#4a8fb0',0.3);
  for(let i=0;i<7;i++){K_col(f,-2.4+i*0.8,-0.95,0.3,1.0,0.08,MARBLE,0.3+i*0.02,{});K_col(f,-2.4+i*0.8,0.95,0.3,1.0,0.08,MARBLE,0.34+i*0.02,{})}
  f.a('box',2.9,0.3,0,0.9,1.5,2.6,'#e6d6b4',0.3);roofGableX(f,2.9,1.8,0,0.9,2.6,0.5,'#b2442a','#efe2c6',0.4,{});
}
/* ---------- Theatre of Marcellus, Hadrian's tomb, Trajan's column ---------- */
export function theatre(x,z,year){
  const b0=B(year),ry0=0.0;reg(circ(x,z,4.6,{mon:1,late:year}));
  for(let t=0;t<2;t++)ringSegs(x,z,3.6,3.6,ry0,22,s=>{
    const y=heightAt(x,z)+t*1.0,bs=b0+t*0.4+s.frac*0.5;
    add('box',s.x,y,s.z,s.ry,s.len*1.03,1.0,0.6,'#e0d1a6',bs,{dur:0.7});
    add('arch',s.x,y+0.14,s.z,s.ry,s.len*0.5,0.66,0.66,'#30241a',bs+0.05,{dur:0.7});
    add('box',s.x,y+0.92,s.z,s.ry,s.len*1.03,0.08,0.74,'#efe5c6',bs+0.08,{dur:0.7});
  },0,Math.PI*1.0);
  add('box',x,heightAt(x,z)-0.1,z,0,1.0,0.4,6.6,'#d8c9a0',b0,{dur:0.9});
}
export function mausoleum(x,z,year){
  const y=heightAt(x,z),b=B(year),f=frame(x,y,z,0,b,1.2);reg(circ(x,z,3.4,{mon:1,late:year}));
  f.a('box',0,-0.2,0,4.4,0.9,4.4,'#d9cdb0',0);f.a('cyl',0,0.7,0,3.6,1.2,3.6,'#d6c9aa',0.2);
  f.a('cyl',0,1.9,0,3.0,0.12,3.0,'#a79b82',0.4);f.a('cone',0,2.0,0,2.7,0.7,2.7,'#8f8a70',0.5);f.a('cyl',0,2.7,0,0.5,0.4,0.5,'#cdb06a',0.6);
  const [hx]=[0];
}
export function trajanColumn(x,z,year){
  const y=heightAt(x,z),b=B(year),f=frame(x,y,z,0,b,1.2);reg(circ(x,z,1.6,{mon:1,late:year}));
  f.a('box',0,-0.1,0,1.2,0.5,1.2,'#e6dcc2',0);f.a('cyl',0,0.4,0,0.5,3.1,0.5,'#efe8d6',0.2);
  for(let k=0;k<9;k++)f.a('cyl',0,0.6+k*0.32,0,0.56,0.05,0.56,'#cfc6ac',0.3+k*0.02);
  f.a('box',0,3.5,0,0.62,0.14,0.62,'#d9ceb0',0.5);f.a('cyl8',0,3.64,0,0.22,0.35,0.22,'#c9a15a',0.6);
}
/* ---------- aqueducts (arcaded, see-through look) ---------- */
export function aqueduct(p0,p1,year,t0,t1,die){
  const b0=B(year),L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]),n=Math.round(L/2.0),tx=(p1[0]-p0[0])/L,tz=(p1[1]-p0[1])/L,ry=rotTo(tx,tz),o=die?{d:B(die)}:{};
  for(let i=0;i<n;i++){
    const s=(i+0.5)/n,x=lerp(p0[0],p1[0],s),z=lerp(p0[1],p1[1],s),g=heightAt(x,z),top=lerp(t0,t1,s),bt=b0+(1-s)*0.8,len=L/n;
    reg(rect(x,z,len/2,0.8,ry,{mon:1,wallSeg:1}));
    const H=Math.max(0.7,top-g+0.3);
    add('box',x,g-0.3,z,ry,len,H,0.8,'#d9c9a2',bt,{dur:0.5,...o});
    add('arch',x,g-0.3,z,ry,len*0.62,Math.max(0.5,H-0.45),0.86,'#2c2219',bt+0.04,{dur:0.5,...o});
    add('box',x,top-0.15,z,ry,len*1.0,0.3,1.0,'#cdbd96',bt+0.08,{dur:0.5,...o});
    add('box',x,top+0.14,z,ry,len,0.1,0.34,'#7a9db0',bt+0.1,{dur:0.5,...o});
  }
}
/* ---------- bridges ---------- */
export function bridge(z,year,stone,die){
  const xx=xr(z),b=B(year),o=die?{d:B(die)}:{},f=frame(xx,0,z,0,b,1.0);
  f.a('box',0,0.78,0,15.0,0.3,1.35,stone?'#d6c9a8':'#8d6a43',0,o);
  for(const sg of [1,-1])f.a('box',0,1.08,sg*0.6,15.0,0.22,0.12,stone?'#cfc2a0':'#7a5b38',0.1,o);
  if(stone)for(const dx of [-3.8,0,3.8]){f.a('box',dx,-0.1,0,1.0,0.9,1.3,'#c3b595',0.1,o);}
  else for(const dx of [-3.8,0,3.8])f.a('box',dx,-0.1,0,0.28,0.9,1.0,'#6a4b2a',0.1,o);
}
/* ---------- walls with towers, merlons and gates ---------- */
export function wallRing(R,year,spread,h,thick,col,towerCol,gateAngles,opt={}){
  const N=Math.round(R*2.8),b0=B(year),o={dur:0.7},odf=th=>{const y=opt.dieFn?opt.dieFn(th):opt.die;return y?{d:B(y)}:{}};
  const near=(th)=>gateAngles.some(g=>{let d=Math.abs(th-g);d=Math.min(d,Math.PI*2-d);return d<2.0/R});
  for(let i=0;i<N;i++){
    const th=i/N*Math.PI*2,x=C[0]+R*Math.cos(th),z=C[1]+R*Math.sin(th),od=odf(th);
    if(riverDist(x,z)<5.2||heightAt(x,z)<0.45||near(th))continue;
    const tx=-Math.sin(th),tz=Math.cos(th),len=R*Math.PI*2/N*1.06,ry=rotTo(tx,tz),gy=heightAt(x,z);
    const b=b0+((th/(Math.PI*2)+0.25)%1)*spread;
    add('box',x,gy-0.5,z,ry,len,h+0.5,thick,col,b,{...o,...od});
    reg(rect(x,z,len/2,thick/2+0.2,ry,{mon:1,wallSeg:1}));
    for(const k of [-0.28,0.28]){const [ox,oz]=rotXZ(k*len,0,ry);add('box',x+ox,gy+h,z+oz,ry,len*0.3,0.28,thick*0.7,darker(col,0.92),b+0.1,{...o,...od})}
    add('box',x,gy+h-0.05,z,ry,len,0.08,thick+0.1,darker(col,1.08),b+0.05,{...o,...od});
    if(i%5===0){add('box',x,gy-0.5,z,ry,thick*1.9,h+1.3,thick*1.9,towerCol,b+0.05,{...o,...od});
      add('box',x,gy+h+0.8,z,ry,thick*2.15,0.2,thick*2.15,darker(towerCol,1.1),b+0.12,{...o,...od});
      for(const [dx,dz] of [[1,1],[-1,1],[1,-1],[-1,-1]]){const [ox,oz]=rotXZ(dx*thick*0.8,dz*thick*0.8,ry);add('box',x+ox,gy+h+1.0,z+oz,ry,0.3,0.28,0.3,towerCol,b+0.15,{...o,...od})}}
  }
  for(const th of gateAngles){
    const od=odf(th),x=C[0]+R*Math.cos(th),z=C[1]+R*Math.sin(th),gy=heightAt(x,z),tx=-Math.sin(th),tz=Math.cos(th),ry=rotTo(tx,tz),b=b0+0.3;
    if(riverDist(x,z)<5.5)continue;
    for(const sg of [1,-1]){const [ox,oz]=rotXZ(sg*1.45,0,ry);
      add('cyl',x+ox,gy-0.5,z+oz,0,thick*2.1,h+1.6,thick*2.1,towerCol,b,{...o,...od});add('cyl',x+ox,gy+h+1.1,z+oz,0,thick*2.4,0.25,thick*2.4,darker(towerCol,1.1),b+0.1,{...o,...od})}
    add('box',x,gy+h-0.6,z,ry,2.4,0.9,thick*1.3,col,b+0.1,{...o,...od});
    add('arch',x,gy,z,ry,1.3,1.35,thick*1.5,'#241a12',b+0.2,{...o,...od});
  }
}
export function gatesFor(R,roads){
  const out=[];
  for(const r of roads){if(r.kind!=='main')continue;
    for(let i=0;i<r.p.length;i++){const [x,z]=r.p[i];if(Math.hypot(x-C[0],z-C[1])>=R){out.push(Math.atan2(z-C[1],x-C[0])+(Math.PI*2)%(Math.PI*2));break}}}
  return out.map(a=>((a%(Math.PI*2))+Math.PI*2)%(Math.PI*2));
}

/* =========================================================
   the Roman city itself
   ========================================================= */
export const FIRES_DEF=[
  {year:-390,x:-2,z:5,r:13,dur:1.8,rebuild:true},
  {year:64,x:-2,z:14,r:17,dur:2.0,rebuild:true},
  {year:410,x:12,z:-12,r:15,dur:1.6,rebuild:false,shift:-6},
];
const BUILT=[[-753,0],[-700,0.02],[-600,0.06],[-509,0.11],[-390,0.17],[-312,0.23],[-146,0.42],[-27,0.64],[64,0.84],[126,0.96],[200,1.0]];
const yearOfFrac=f=>{for(let i=0;i<BUILT.length-1;i++){const [y0,f0]=BUILT[i],[y1,f1]=BUILT[i+1];if(f<=f1)return lerp(y0,y1,(f-f0)/(f1-f0+1e-9))}return 200};
const rr=mulberry(4242);

export function buildRome(opt={}){
  const mon=opt.mon||{};                                   // optional death years per monument group
  /* --- monuments --- */
  const forum={x:-3,z:3.2,hw:5.0,hd:3.2};
  reg(rect(forum.x,forum.z,forum.hw+0.5,forum.hd+0.5,0,{mon:1}));
  add('box',forum.x,heightAt(forum.x,forum.z)+0.02,forum.z,0,forum.hw*2,0.16,forum.hd*2,'#d8cdb0',B(-580),{dur:1.2});
  add('box',forum.x,heightAt(forum.x,forum.z)+0.02+0.16,forum.z+0.0,0,forum.hw*1.2,0.02,0.5,'#c7b98f',B(-570),{dur:1.0});
  temple(-12,-4,rotTo(0.8,0.6),3.4,3.4,6,-509,{h:1.9,die:mon.jupiter});
  temple(-9.3,2.0,rotTo(1,0),2.2,2.1,4,-497);
  temple(3.5,3.4,rotTo(-1,0),2.3,2.1,4,-484);
  basilica(-3,-1.3,0,5.6,1.9,-179,{die:mon.basilica});
  basilica(-3,8.0,0,5.6,2.0,-46,{die:mon.basilica?mon.basilica+120:undefined});
  temple(1,-6,rotTo(-0.2,1),2.8,2.2,4,-141);
  temple(-7.5,-9,rotTo(0.3,1),2.6,2.1,4,-100);
  temple(-18,7,rotTo(1,0),2.4,2.1,4,-200);
  temple(-5,-13.5,rotTo(0,1),3.0,2.2,4,112,{h:1.7});
  temple(9.5,-7.5,rotTo(-1,0.3),2.4,2.0,4,81);
  temple(10.5,9.6,rotTo(-1,0),2.2,2.0,4,121);
  triumphalArch(6.2,3.2,rotTo(1,0),81);
  triumphalArch(-8.0,5.3,rotTo(1,0),203);
  triumphalArch(12.5,13.5,rotTo(0,1),315,1.1);
  palace(6,12,-20);
  circus(-3,15.5,-329,{year2:-46,die:mon.circus});
  colosseum(14,3,70,{dieFn:mon.colosseumDie});
  pantheon(-12,-16,118);
  baths(14,29.5,212);
  theatre(-22,3,-13);
  mausoleum(-37,-17,139);
  trajanColumn(-1.5,-9.5,113);
  for(const [p0,p1,y,t0,t1] of [[[86,34],[24,22],-312,2.8,3.2],[[90,-4],[26,-3],-272,3.3,3.6],[[92,12],[26,9],-144,3.8,4.2],[[94,-30],[26,-7],52,4.6,4.9]])
    aqueduct(p0,p1,y,t0,t1,mon.aqueduct?mon.aqueduct(y):undefined);
  bridge(9,-621,false,-150);bridge(-12,-179,true);bridge(-1,-62,true);bridge(-20,134,true);
  /* --- roads --- */
  const Fc=[-1,5];
  const angles=[0,36,72,108,146,178,214,252,292,328];
  const mains=[];
  angles.forEach((a,k)=>{
    const th=a*Math.PI/180,pts=[];
    for(let r=2;r<=190;r+=(r<50?3:10)){const th2=th+0.14*Math.sin(r*0.17+k*1.3)+0.0007*(r>50?(r-50):0)*Math.sin(k*2.1);pts.push([Fc[0]+r*Math.cos(th2),Fc[1]+r*Math.sin(th2)])}
    const mr=K.makeRoad(pts,1.5,-640+k*5,11,'main',1.8);mr.growth2=0.9;mains.push(mr);
  });
  const minors=[];
  for(const m of mains){
    let flip=1;
    for(let s=8;s<Math.min(m.arc[m.arc.length-1]-6,46);s+=9+rr()*4){
      let i=0;while(i<m.arc.length-2&&m.arc[i+1]<s)i++;
      const [x0,z0]=m.p[i],[x1,z1]=m.p[i+1],tl=Math.hypot(x1-x0,z1-z0),tx=(x1-x0)/tl,tz=(z1-z0)/tl;
      for(const side of [flip,-flip]){
        if(rr()<0.15)continue;
        const sx=x0+(-tz)*side*(m.w/2+0.25),sz=z0+tx*side*(m.w/2+0.25),pts=[[sx,sz]];
        const len=7+rr()*7,ang=Math.atan2(tx,-tz)*0+Math.atan2(tx*side,-tz*side)+0;
        let dx=-tz*side,dz=tx*side;
        for(let k=1;k<=Math.round(len/3);k++){const w2=0.12*Math.sin(k*1.3+s);const cx=Math.cos(w2),sn=Math.sin(w2);const ndx=dx*cx-dz*sn,ndz=dx*sn+dz*cx;dx=ndx;dz=ndz;
          const [px,pz]=pts[pts.length-1];pts.push([px+dx*3,pz+dz*3])}
        if(pts.length>1)minors.push(K.makeRoad(pts,0.85,99999,0.0,'minor'));
      }
      flip=-flip;
    }
  }
  /* --- walls' footprints (houses keep clear; gates stay open) --- */
  const gates26=gatesFor(26,mains),gates38=gatesFor(38,mains);
  for(const [R,gates] of [[26,gates26],[38,gates38]]){const N=Math.round(R*2.8);
    for(let i=0;i<N;i++){const th=i/N*Math.PI*2;
      if(gates.some(g=>{let d=Math.abs(th-g);d=Math.min(d,Math.PI*2-d);return d<2.4/R}))continue;
      reg(rect(C[0]+R*Math.cos(th),C[1]+R*Math.sin(th),R*Math.PI*2/N*0.55,0.75,rotTo(-Math.sin(th),Math.cos(th))))}}
  /* --- house slots --- */
  const slots=[];
  for(const r of mains){const s=K.houseSlots(r,{skip:0.05,...(opt.slot||{})});s.forEach(h=>r.houses.push(h));slots.push(...s)}
  for(const r of minors){const s=K.houseSlots(r,{skip:0.1,wmin:1.4,wvar:0.7,dvar:0.45,...(opt.slot||{})});s.forEach(h=>r.houses.push(h));slots.push(...s)}
  const inCity=h=>Math.hypot(h.x-C[0],h.z-C[1])<=35.5;
  let houses=slots.filter(inCity);
  for(let row=0;row<3;row++){const more=[];for(const h of houses.filter(q=>(q.back||0)===row)){const n=K.backRow(h);if(n&&inCity(n))more.push(n)}houses.push(...more)}
  houses.push(...K.infill(26000,inCity,{wmin:1.15,wvar:0.7,dmin:1.0,dvar:0.4}));
  /* the first villages: huts on the Palatine, then on the other hills */
  const P=[2,9],huts=[];
  for(const [hx,hz,y0,n,R0] of [[2,9,-753,14,4.6],[-12,-4,-738,8,3.6],[3,-21,-724,12,4.6],[23,2,-708,9,4.2],[12,-11,-696,8,3.8],[19,18,-684,8,4],[-10,21,-672,7,3.8]]){
    let made=0;
    for(let k=0;k<n*6&&made<n;k++){
      const a=rr()*Math.PI*2,r=0.8+rr()*R0,x=hx+Math.cos(a)*r,z=hz+Math.sin(a)*r,ry=rr()*Math.PI*2,w=1.15,d=1.05;
      const sl=K.slopeOK(x,z,w,d,ry,1.3);if(!sl)continue;
      const rc=rect(x,z,w/2,d/2,ry),hits=K.collide(rc,0.3);if(hits.some(o=>(o.road===undefined&&!o.house)||(o.house&&o.house.hut)))continue;
      const h={x,z,ry,w,d,...sl,road:-1,s:0,soft:[],hut:true,onRoad:hits.some(o=>o.road!==undefined),overHouses:hits.filter(o=>o.house).map(o=>o.house),hutYear:y0+made*(3+rr()*4)};reg(Object.assign(rc,{house:h}));huts.push(h);made++;
    }
  }
  houses.push(...huts);
  /* build order → year */
  for(const h of houses){const mf=marshAt(h.x,h.z);h.score=h.hut?-6+rr()*2:Math.hypot(h.x-P[0],h.z-P[1])*1.0+(rr()-0.5)*5+(mf>0.12?8:0)}
  houses.sort((a,b)=>a.score-b.score);
  const N=houses.length;
  houses.forEach((h,i)=>{h.b=yearOfFrac((i+0.5)/N);h.frac=(i+0.5)/N;if(h.hut)h.b=h.hutYear});
  for(const h of huts)for(const hh of h.overHouses)if(!hh.hut&&hh.b!==undefined)h.capY=Math.min(h.capY??Infinity,hh.b-0.5);
  houses=houses.filter(h=>!(h.clear!==undefined&&h.b>=h.clear-1));
  houses.forEach(h=>{
    K.dress(h);
    for(let fi=0;fi<FIRES_DEF.length;fi++){const f=FIRES_DEF[fi],dd=Math.hypot(h.x-f.x,h.z-f.z);
      if(dd<f.r*(0.55+0.45*rr())&&rr()<0.8&&h.b<f.year){h.fire={i:fi,frac:dd/f.r,rebuild:f.rebuild,rd:rr()};break}}
    if(h.clear!==undefined){h.fire=null;h.dieY=h.clear-0.6}
    else if(!h.fire&&h.frac>0.35&&rr()<0.75)h.dieY=405+rr()*71;
  });
  const clones=[];
  for(const h of houses)if(K.styleOf(h.b)==='hut'&&!h.fire&&h.clear===undefined){h.dieY=-330+rr()*220;if(h.capY!==undefined){h.dieY=Math.min(h.dieY,h.capY);continue}if(h.onRoad)continue;const c={...h,b:h.dieY+1.5,dieY:null,fire:null};K.dress(c);if(c.b<476&&!c.dieY&&rr()<0.5)c.dieY=null;clones.push(c)}
  houses.push(...clones);
  K.emitRoads();
  wallRing(26,-378,0.9,1.5,0.7,'#c9bb97','#b8a982',gates26,{die:mon.servian});
  wallRing(38,271,0.7,2.2,0.9,'#b9744e','#a4623f',gates38,{dieFn:mon.aurelianDie});
  return {houses,gates26,gates38,mains,minors,yearOfFrac};
}

/* ---------- trees (appear where the land is free, vanish when built over) ---------- */
export function scatterTrees(houses,opt={}){
  const rt=mulberry(21),res=[],greens=['#2f6d2b','#3a7b2c','#2a5f2a','#4a8a30','#5a9a34'];let tries=0;
  while(res.length<(opt.n??1300)&&tries<(opt.n??1300)*10){tries++;
    const sp=opt.span??250,x=C[0]+(rt()-0.5)*sp,z=C[1]+(rt()-0.5)*sp,dc=Math.hypot(x-C[0],z-C[1]);
    if(opt.clusters&&fbm(x*0.03+3,z*0.03+9)<0.5&&rt()<0.6)continue;
    if(dc<38&&rt()<0.12)continue;
    const h=heightAt(x,z);if(h<0.55||riverDist(x,z)<4.2||(opt.marsh&&marshAt(x,z)>0.25))continue;
    if(K.collide(rect(x,z,0.45,0.45,0),0.5).some(o=>!o.house))continue;
    res.push([x,z,h,rt(),rt()]);
  }
  for(const [x,z,h,r1,r2] of res){
    const near=houses.filter(hh=>Math.abs(hh.x-x)<7&&Math.abs(hh.z-z)<7&&K.inFoot(hh,x,z,0.9));
    let b=-10,skip=false;
    for(const hh of near)if(hh.tb<=0.01){if(hh.td===NO){skip=true;break}b=Math.max(b,hh.td+0.3)}
    if(skip)continue;
    let d=NO;for(const hh of near)if(hh.tb>b)d=Math.min(d,hh.tb-0.2);
    if(d<=b+0.3)continue;
    const s=0.8+r1*0.9,gc=new THREE.Color(greens[Math.floor(r2*greens.length)]);gc.offsetHSL((r1-0.5)*0.04,0,(r2-0.5)*0.05);
    const o={d,dur:0.9};
    add('cyl8',x,h-0.1,z,0,0.2*s,0.7*s,0.2*s,'#6d4a2a',b,o);
    if(r2>0.35){add('cone',x,h+0.4*s,z,0,1.1*s,2.1*s,1.1*s,gc,b,o);add('cone',x,h+1.3*s,z,0,0.8*s,1.6*s,0.8*s,gc,b,o)}
    else add('ico',x,h+0.5*s,z,0,1.6*s,1.5*s,1.6*s,gc,b,o);
  }
}
