import * as E from './engine.js';
import * as K from './city.js';
import {ringSegs} from './rome.js';
const {THREE,add,frame,B,heightAt,riverDist,rotTo,rotXZ,clamp,lerp,hash2,mulberry,NO,C,hooks,scene}=E;
const {reg,rect,circ}=K;
const darker=(c,k=0.8)=>new THREE.Color(c).multiplyScalar(k);
const MARB='#f1ede2',TRAV='#e0d3b0';

/* ---------- Vittoriano (Altare della Patria), 1911 ---------- */
export function vittoriano(x,z,face,year){
  const y=heightAt(x,z),b=B(year),f=frame(x,y,z,face,b,1.2);
  reg(rect(x,z,4.4,4.6,face,{mon:1,late:year}));
  for(let k=0;k<6;k++)f.a('box',1.6-k*0.5,-0.4,0,0.5,0.4+k*0.28,4.6-k*0.3,MARB,0.05*k);                 // stairs up toward -x
  f.a('box',-1.6,-0.4,0,1.3,2.4,6.4,MARB,0.4);                                                           // terrace
  f.a('box',-1.0,2.0,0,0.5,0.9,1.0,'#c9b27a',0.6);f.a('cyl8',-1.0,2.9,0,0.3,0.5,0.3,'#c9a24a',0.65);      // statue
  for(let i=0;i<16;i++)f.a('cyl8',-2.45,2.0,-3.0+6.0*i/15,0.2,1.35,0.2,MARB,0.7+i*0.02);                   // colonnade
  f.a('box',-2.45,3.3,0,0.6,0.22,6.6,MARB,0.9);
  for(const sg of [1,-1]){f.a('box',-2.4,2.0,sg*3.5,1.0,1.7,0.9,MARB,0.8);f.a('box',-2.4,3.7,sg*3.5,0.8,0.5,0.7,'#c9a24a',1.0)}
  f.a('box',-1.0,0.0,2.9,0.3,0.6,0.9,MARB,0.5);f.a('box',-1.0,0.0,-2.9,0.3,0.6,0.9,MARB,0.5);
}
/* ---------- Termini station ---------- */
export function termini(x,z,ry,year){
  const y=heightAt(x,z),b=B(year),f=frame(x,y,z,ry,b,1.0);
  reg(rect(x,z,4.2,2.2,ry,{mon:1,late:year}));
  f.a('box',0,-0.3,0,8.0,0.5,3.6,'#cfc7b4',0);f.a('box',0,0.1,0,7.6,1.0,1.8,TRAV,0.1);
  for(let i=0;i<9;i++)f.a('slab',-3.4+i*0.85,1.22+0.16*Math.sin(i/8*Math.PI),0,0.9,0.1,2.2,i%2?'#9ab3bd':'#aac4cd',0.3+i*0.04,{},0,0,0);
  f.a('box',3.6,0.1,0,0.5,1.8,2.0,TRAV,0.2);
  for(let i=0;i<5;i++)f.a('box',-3.0+i*1.5,-0.1,1.7,0.9,0.12,0.8,'#8f8f94',0.1);
}
/* ---------- Stadio Olimpico ---------- */
export function stadium(x,z,ry,year){
  const y=heightAt(x,z),b=B(year);reg(rect(x,z,5.4,4.4,ry,{mon:1,late:year}));
  add('cyl',x,y,z,ry,2*3.5,0.12,2*2.6,'#4f9a43',b,{dur:1});
  ringSegs(x,z,4.1,3.2,ry,38,s=>{
    add('box',s.x,y-0.1,s.z,s.ry,s.len*1.05,0.8,0.8,'#d9d3c3',b+0.2+s.frac*0.6,{dur:0.7});
    add('box',s.x+s.ox*-0.25,y+0.7,s.z+s.oz*-0.25,s.ry,s.len*1.05,0.5,0.9,'#c9c2b0',b+0.5+s.frac*0.6,{dur:0.7});
    if(s.i%6===0)add('box',s.x,y,s.z,0,0.1,2.3,0.1,'#8a8a8e',b+0.8,{dur:0.6});
  });
}
/* ---------- EUR: Palazzo della Civiltà ---------- */
export function eur(x,z,year){
  const y=heightAt(x,z),b=B(year),f=frame(x,y,z,0,b,1.2);reg(rect(x,z,3.4,3.4,0,{mon:1,late:year}));
  f.a('box',0,-0.3,0,3.8,0.5,3.8,'#cfc7b4',0);f.a('box',0,0.2,0,3.0,3.4,3.0,'#efe6cf',0.2);
  for(const [ang,ox,oz] of [[0,1.52,0],[Math.PI,-1.52,0],[Math.PI/2,0,1.52],[-Math.PI/2,0,-1.52]])
    for(let r=0;r<6;r++)for(let c=0;c<9;c++){
      const lat=-1.2+2.4*c/8,[wx,wz]=ang===0||ang===Math.PI?[ox,lat]:[lat,oz];
      f.a('arch',wx,0.3+r*0.52,wz,0.2,0.36,0.16,'#4a3f30',0.4+r*0.05,{},ang+Math.PI/2*0);
    }
  f.a('box',0,3.6,0,3.2,0.12,3.2,'#d9cfb0',0.8);
}
/* ---------- Fiumicino airport ---------- */
export function airport(x,z,ry,year){
  const y=heightAt(x,z)+0.02,b=B(year),f=frame(x,y,z,ry,b,1.5);
  reg(rect(x,z,10,6,ry,{mon:1,late:year}));
  for(const [lz,len] of [[-3.2,16],[0,18],[3.6,14]]){
    f.a('box',0,0,lz,len,0.05,0.7,'#3c3c42',0);
    for(let i=0;i<Math.floor(len/1.3);i++)f.a('box',-len/2+0.6+i*1.3,0.05,lz,0.45,0.02,0.07,'#e8e4d4',0.2);
  }
  f.a('box',0,0,-1.6,16,0.05,0.25,'#46464c',0.1);
  f.a('box',-1.0,0.0,-5.4,3.4,0.7,1.4,'#d8d4c8',0.4);f.a('box',-1.0,0.7,-5.4,3.6,0.08,1.5,'#9aa7ad',0.5);
  f.a('cyl8',1.5,0.0,-5.4,0.28,1.8,0.28,'#e8e4d4',0.5);f.a('box',1.5,1.8,-5.4,0.5,0.28,0.5,'#6a7a88',0.6);
  const planes=[0,1].map(i=>{
    const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:'#f4f2ec',flatShading:true});
    const fus=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.14,0.14),m),wing=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.03,0.9),m),tail=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.2,0.03),m);
    wing.position.x=0.05;tail.position.set(-0.4,0.12,0);g.add(fus,wing,tail);g.visible=false;scene.add(g);return {g,i}});
  hooks.update.push(t=>planes.forEach(p=>{
    const ph=((t/5.5)+p.i*0.5)%1,len=17;
    p.g.visible=t>b+1.0;if(!p.g.visible)return;
    const lz=p.i?3.6:0,[wx,wz]=rotXZ(-len/2+ph*len*1.9,lz,ry);
    p.g.position.set(x+wx,y+0.15+Math.max(0,ph-0.5)*Math.max(0,ph-0.5)*30,z+wz);p.g.rotation.y=ry;p.g.rotation.z=Math.max(0,ph-0.5)*0.5;
  }));
}
/* ---------- parks ---------- */
export function park(x,z,r,n,year,die){
  const b=B(year);reg(circ(x,z,r,{mon:1,late:year}));
  const rp=mulberry(Math.round(x*7+z*3)),o=die?{d:B(die)}:{};
  add('cyl',x,heightAt(x,z)-0.02,z,0,2*r,0.06,2*r,'#6b9a45',b,{dur:1.2,...o});
  for(let i=0;i<n;i++){const a=rp()*Math.PI*2,rr=Math.sqrt(rp())*(r-0.6),tx=x+Math.cos(a)*rr,tz=z+Math.sin(a)*rr,h=heightAt(tx,tz),s=0.9+rp()*0.8;
    add('cyl8',tx,h-0.05,tz,0,0.2*s,0.8*s,0.2*s,'#6d4a2a',b+rp()*0.8,{dur:0.7,...o});
    add('ico',tx,h+0.6*s,tz,0,1.9*s,1.5*s,1.9*s,rp()<0.5?'#3f7a30':'#4d8a34',b+rp()*0.8,{dur:0.7,...o});}
}
/* ---------- roads: ring, avenues ---------- */
export function ringRoad(R,year,w,col,kind='main'){
  const pts=[],N=Math.round(R*1.2);
  for(let i=0;i<=N;i++){const th=i/N*Math.PI*2;pts.push([C[0]+R*Math.cos(th),C[1]+R*Math.sin(th)])}
  const r=K.makeRoad(pts,w,year,0,kind,2.4);r.fixed=year;r.col=col;return r;
}
export function avenue(p0,p1,year,w=1.9,col){
  const L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]),n=Math.max(2,Math.round(L/3)),pts=[];
  for(let i=0;i<=n;i++)pts.push([lerp(p0[0],p1[0],i/n),lerp(p0[1],p1[1],i/n)]);
  const r=K.makeRoad(pts,w,year,0,'main');r.fixed=year;if(col)r.col=col;return r;
}
