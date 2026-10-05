import * as E from './engine.js';
import * as K from './city.js';
import {ringSegs} from './rome.js';
const {THREE,add,frame,B,heightAt,riverDist,rotTo,rotXZ,clamp,lerp,hash2,mulberry,NO,C,hooks,scene}=E;
const {reg,rect,circ}=K;
const darker=(c,k=0.8)=>new THREE.Color(c).multiplyScalar(k);
const rr=mulberry(1999);

/* generic gabled roof (ridge along local x) */
function gable(f,lx,yTop,lz,len,wid,P,roofCol,wallCol,db,o,ovh=0.12){
  const half0=wid/2,halfS=half0+ovh,slope=P/half0,al=Math.atan(slope),th=0.07,Ls=halfS*Math.hypot(1,slope),cy=yTop+P-slope*halfS/2+(th/2)/Math.cos(al)+0.012;
  f.a('tri',lx,yTop,lz,len,P,wid,wallCol,db,o);
  for(const sg of [1,-1])f.a('slab',lx,cy,lz+sg*halfS/2,len+0.2,th,Ls,roofCol,db+0.1,o,0,sg*al,0);
  f.a('box',lx,yTop+P+0.04,lz,len+0.26,0.07,0.16,darker(roofCol,0.78),db+0.2,o);
}
/* palazzo: body, bands, window grid, cornice, shallow roof */
export function palazzo(f,lx,lz,len,wid,floors,fh,wall,roofCol,db,o,y0=0,opt={}){
  const wh=floors*fh;
  f.a('box',lx,y0-0.3,lz,len+0.12,0.4,wid+0.12,'#a89c84',db-0.05,o);
  f.a('box',lx,y0+0.1,lz,len,wh,wid,wall,db,o);
  for(let k=1;k<floors;k++)f.a('box',lx,y0+0.1+k*fh-0.03,lz,len+0.05,0.06,wid+0.05,darker(wall,0.9),db+0.05,o);
  const n=Math.max(2,Math.floor(len/0.62));
  for(let k=0;k<floors;k++)for(let i=0;i<n;i++){
    if(k===0&&i===Math.floor(n/2)){f.a('arch',lx-len/2+len*(i+0.5)/n,y0+0.1,lz,0.3,0.55,wid+0.07,'#2b2118',db+0.1,o);continue}
    const wy=y0+0.1+k*fh+fh*0.32;
    f.a('box',lx-len/2+len*(i+0.5)/n,wy,lz,0.16,0.26,wid+0.06,'#2b2219',db+0.12+k*0.02,o);
    f.a('box',lx-len/2+len*(i+0.5)/n,wy+0.27,lz,0.24,0.04,wid+0.08,darker(wall,0.82),db+0.14+k*0.02,o);
  }
  f.a('box',lx,y0+0.1+wh-0.07,lz,len+0.18,0.11,wid+0.18,darker(wall,1.1),db+0.2,o);
  if(opt.flat){f.a('box',lx,y0+0.1+wh,lz,len+0.1,0.1,wid+0.1,roofCol,db+0.25,o)}
  else gable(f,lx,y0+0.1+wh+0.02,lz,len,wid,opt.P??wid*0.2,roofCol,wall,db+0.25,o,0.1);
  return y0+0.1+wh;
}
/* square medieval tower with crenellations */
export function tower(x,z,year,h=4.6,w=0.95,die){
  const y=heightAt(x,z),b=B(year),f=frame(x,y,z,rr()*3,b,1.0),o=die?{d:B(die)}:{};
  f.a('box',0,-0.3,0,w+0.15,0.5,w+0.15,'#8d8472',0,o);
  f.a('box',0,0.1,0,w,h,w,'#a79d88',0.1,o);
  for(let k=1;k<4;k++){f.a('box',0,0.1+h*k/4-0.06,0,w+0.05,0.07,w+0.05,'#8f8672',0.12,o)}
  for(const sg of [1,-1]){f.a('box',0,h*0.45,0,0.1,0.24,w+0.06,'#241c14',0.2,o);f.a('box',0,h*0.82,0,0.1,0.24,w+0.06,'#241c14',0.22,o,Math.PI/2)}
  f.a('box',0,0.1+h,0,w+0.3,0.25,w+0.3,'#b0a690',0.3,o);
  for(const [dx,dz] of [[1,1],[-1,1],[1,-1],[-1,-1],[0,1],[0,-1],[1,0],[-1,0]])f.a('box',dx*(w+0.14)/2,0.35+h,dz*(w+0.14)/2,0.24,0.28,0.24,'#a79d88',0.35,o);
  reg(rect(x,z,w/2+0.3,w/2+0.3,0,{mon:1}));
}
/* basilica-church with apse and campanile; face = direction of the façade */
export function church(x,z,face,year,opt={}){
  const len=opt.len??4.2,wid=opt.wid??2.0,y=heightAt(x,z),b=B(year),f=frame(x,y,z,face,b,1.0),o=opt.die?{d:B(opt.die)}:{};
  const wall=opt.wall??'#d8c7a3',roof=opt.roof??'#a8512f';
  reg(rect(x,z,len/2+(opt.tower===false?0.6:1.2),wid/2+0.8,face,{mon:1,late:year}));
  f.a('box',0,-0.3,0,len+0.12,0.4,wid+0.12,'#a89c84',0,o);
  f.a('box',0,0.1,0,len,1.5,wid*0.62,wall,0.1,o);                                   // nave
  for(const sg of [1,-1])f.a('box',0,0.1,sg*wid*0.4,len,0.95,wid*0.24,darker(wall,0.96),0.12,o);   // aisles
  gable(f,0,1.6,0,len,wid*0.62,0.55,roof,wall,0.3,o,0.1);
  for(const sg of [1,-1])f.a('slab',0,1.05+0.03,sg*wid*0.4,len+0.1,0.06,wid*0.26,darker(roof,0.9),0.32,o,0,sg*0.18,0);
  f.a('cyl',-len/2,0.1,0,wid*0.6,1.4,wid*0.6,wall,0.2,o);f.a('cone',-len/2,1.5,0,wid*0.68,0.5,wid*0.68,roof,0.4,o);   // apse
  f.a('box',len/2+0.02,0.1,0,0.14,1.7,wid*0.66,darker(wall,1.06),0.25,o);                                              // façade
  f.a('arch',len/2+0.04,0.1,0,0.3,0.7,0.5,'#2b2118',0.35,o,Math.PI/2*0);
  f.a('cyl',len/2+0.07,1.2,0,0.34,0.05,0.34,'#2b2118',0.4,o,0,Math.PI/2,0);
  if(opt.dome){
    f.a('cyl8',0.4,1.5,0,wid*0.8,0.9,wid*0.8,darker(wall,1.04),0.4,o);f.a('dome',0.4,2.4,0,wid*0.78,wid*0.62,wid*0.78,'#8d8f84',0.5,o);
    f.a('cyl8',0.4,2.4+wid*0.31-0.03,0,0.18,0.35,0.18,wall,0.6,o);f.a('cone',0.4,2.75+wid*0.31-0.05,0,0.2,0.2,0.2,'#c9a15a',0.65,o);
  }
  if(opt.tower!==false){
    const tx=-len/2*0.15,tz=-wid/2-0.55;
    f.a('box',tx,-0.3,tz,0.8,0.4,0.8,'#8d8472',0.1,o);
    f.a('box',tx,0.1,tz,0.62,3.1,0.62,'#c6b48f',0.15,o);
    for(let k=1;k<3;k++)f.a('box',tx,0.1+k*1.0,tz,0.68,0.06,0.68,'#a89c84',0.2,o);
    f.a('arch',tx,2.2,tz,0.3,0.55,0.68,'#2b2118',0.3,o);f.a('arch',tx,2.2,tz,0.3,0.55,0.68,'#2b2118',0.3,o,Math.PI/2);
    f.a('roofP',tx,3.2,tz,0.9,0.7,0.9,'#8a4a2c',0.4,o);
  }
}
/* obelisk */
export function obelisk(x,z,year,h=3.0,opt={}){
  const y=heightAt(x,z)+(opt.y||0),b=B(year),f=frame(x,y,z,0,b,1.0);
  reg(circ(x,z,0.9,{mon:1,late:year}));
  f.a('box',0,-0.2,0,0.7,0.35,0.7,'#d2c6a8',0);f.a('box',0,0.15,0,0.5,0.25,0.5,'#d9cdb0',0.05);
  f.a('box',0,0.4,0,0.24,h,0.24,'#c98a6a',0.1);f.a('roofP',0,0.4+h,0,0.3,0.28,0.3,'#d2a07a',0.2);f.a('cone',0,0.4+h+0.26,0,0.07,0.16,0.07,'#d9b24a',0.25);
}
/* fountain basin */
export function fountain(x,z,year,r=0.9,y0=0){
  const y=heightAt(x,z)+y0,b=B(year);
  add('cyl',x,y,z,0,r*2,0.28,r*2,'#d9cfb4',b,{dur:0.8});add('cyl',x,y+0.26,z,0,r*1.8,0.04,r*1.8,'#4f93bd',b+0.1,{dur:0.8});
  add('cyl8',x,y+0.28,z,0,r*0.35,0.65,r*0.35,'#e6dcc0',b+0.1,{dur:0.8});add('cyl',x,y+0.9,z,0,r*0.8,0.1,r*0.8,'#d9cfb4',b+0.15,{dur:0.8});
}
/* ---------- Old and New St. Peter's with the colonnaded piazza ---------- */
export function stPeters(x,z,face,oldDie,tStart){
  const y=heightAt(x,z);reg(rect(x,z,9,8,face,{mon:1}));
  // old basilica (Constantine)
  {const f=frame(x,y,z,face,B(325),1.4),o={d:B(oldDie)};
    f.a('box',0,-0.3,0,6.6,0.4,3.4,'#a89c84',0,o);f.a('box',0,0.1,0,6.2,1.5,1.9,'#d6c4a0',0.1,o);
    for(const sg of [1,-1])f.a('box',0,0.1,sg*1.2,6.2,0.9,0.8,'#cdbb98',0.12,o);
    gable(f,0,1.6,0,6.2,1.9,0.55,'#a8512f','#d6c4a0',0.3,o,0.1);
    f.a('box',-0.6,0.1,0,1.4,1.3,3.0,'#d2bf9a',0.2,o);f.a('cyl',-3.1,0.1,0,1.5,1.3,1.5,'#d2bf9a',0.25,o);f.a('cone',-3.1,1.4,0,1.6,0.5,1.6,'#8a4a2c',0.35,o);
    f.a('box',3.5,-0.1,0,1.2,0.4,2.6,'#cfc5a8',0.2,o);}
  // new basilica: rises in stages
  const f=frame(x,y,z,face,B(tStart),1.6);
  f.a('box',0,-0.4,0,8.6,0.5,5.0,'#a89c84',0);
  f.a('box',0,0.1,0,7.4,1.9,2.4,'#e1d0aa',0.15);gable(f,0,2.0,0,7.4,2.4,0.7,'#9a5a3a','#e1d0aa',0.5,{},0.12);
  for(const sg of [1,-1])f.a('box',0,0.1,sg*1.6,7.4,1.2,0.9,'#d8c79f',0.2,{});
  f.a('box',-1.4,0.1,0,2.6,1.9,5.0,'#e1d0aa',0.3,{});gable(f,-1.4,2.0,0,2.6,5.0,0.9,'#9a5a3a','#e1d0aa',0.55,{},0.12);
  f.a('cyl',-3.9,0.1,0,2.0,1.9,2.0,'#d8c79f',0.4,{});f.a('cone',-3.9,2.0,0,2.2,0.6,2.2,'#8f8f86',0.55,{});
  // dome
  const dx=-1.4;
  f.a('cyl',dx,2.0,0,3.4,1.0,3.4,'#e6d6b0',0.7,{});
  for(let k=0;k<16;k++){const a=k/16*Math.PI*2,[ox,oz]=[Math.cos(a)*1.62,Math.sin(a)*1.62];f.a('cyl8',dx+ox,2.0,oz,0,0.16,1.0,0.16,'#f2ead6',0.78);}
  f.a('cyl',dx,3.0,0,3.5,0.12,3.5,'#efe6cf',0.8,{});
  f.a('dome',dx,3.1,0,3.1,2.4,3.1,'#9c9d96',1.0,{});
  f.a('cyl8',dx,3.1+1.2-0.05,0,0.7,0.8,0.7,'#e6d6b0',1.2,{});f.a('cone',dx,3.1+2.0,0,0.8,0.5,0.8,'#8f8f86',1.3,{});f.a('box',dx,3.1+2.5,0,0.05,0.35,0.05,'#d4b04a',1.35,{});f.a('box',dx,3.1+2.7,0,0.22,0.05,0.05,'#d4b04a',1.36,{});
  // façade with columns
  const fb=B(1612)-B(tStart);
  f.a('box',3.45,0.1,0,0.5,2.3,5.0,'#e8dab8',fb,{});
  for(let i=0;i<8;i++)f.a('cyl8',3.8,0.1,-2.2+4.4*i/7,0.22,2.1,0.22,'#f2ead6',fb+0.1,{});
  f.a('box',3.8,2.2,0,0.4,0.25,5.1,'#efe6cf',fb+0.2,{});f.a('box',3.85,2.45,0,0.4,0.35,4.9,'#e8dab8',fb+0.25,{});
  // piazza: oval + colonnades + obelisk + 2 fountains
  const pb=B(1656)-B(tStart),px=7.6;
  f.a('cyl',px,-0.35,0,2*7.2,0.4,2*5.2,'#d8ccb0',pb,{dur:1.2});
  K.reg(K.rect(x+rotXZ(px,0,face)[0],z+rotXZ(px,0,face)[1],7.3,5.3,face,{mon:1}));
  const [cx0,cz0]=rotXZ(px,0,face);
  ringSegs(x+cx0,z+cz0,7.9,5.9,face,56,s=>{
    const [wx,wz]=[s.x,s.z];
    if(Math.cos(s.th)>0.78||Math.cos(s.th)<-0.8)return;               // open towards the city, closed by the basilica
    add('cyl8',wx,y,wz,0,0.2,1.45,0.2,'#e4d8bc',B(1656)+s.frac*1.2,{dur:0.7});
    add('box',wx,y+1.4,wz,s.ry,s.len*1.05,0.2,0.5,'#e8dcc0',B(1656)+s.frac*1.2+0.1,{dur:0.7});
  });
  obelisk(x+cx0,z+cz0,1586,3.2,{y:-0.1});
  for(const sg of [1,-1]){const [fx,fz]=rotXZ(px,sg*2.9,face);fountain(x+fx,z+fz,sg>0?1613:1675,0.75,-0.1)}
}
/* ---------- Leonine Wall (852) around the Vatican ---------- */
export function leonineWall(cx,cz,R,year,towerYear){
  const b0=B(year);
  ringSegs(cx,cz,R,R*0.9,0.0,46,s=>{
    if(Math.cos(s.th)>0.35)return;
    const gy=heightAt(s.x,s.z);
    add('box',s.x,gy-0.4,s.z,s.ry,s.len*1.06,1.5,0.6,'#b8a98a',b0+s.frac*0.8,{dur:0.7});
    add('box',s.x,gy+1.05,s.z,s.ry,s.len*1.06,0.12,0.75,'#c6b89a',b0+s.frac*0.8+0.1,{dur:0.7});
    for(const k of [-0.26,0.26]){const [ox,oz]=rotXZ(k*s.len,0,s.ry);add('box',s.x+ox,gy+1.1,s.z+oz,s.ry,s.len*0.28,0.26,0.4,'#b8a98a',b0+s.frac*0.8+0.15,{dur:0.7})}
    if(s.i%5===0)add('cyl',s.x,gy-0.4,s.z,0,1.2,2.5,1.2,'#ad9f80',b0+s.frac*0.8+0.05,{dur:0.7});
  });
}
/* ---------- bastions of Castel Sant'Angelo ---------- */
export function bastions(x,z,year){
  const y=heightAt(x,z),b=B(year),f=frame(x,y,z,0,b,1.0);
  f.a('box',0,-0.3,0,6.8,0.45,6.8,'#9d907a',0);
  for(const [dx,dz] of [[1,1],[-1,1],[1,-1],[-1,-1]]){f.a('cyl',dx*3.1,-0.3,dz*3.1,0,1.5,1.4,1.5,'#b2a58a',0.1);f.a('cone',dx*3.1,1.1,dz*3.1,0,1.4,0.5,1.4,'#8a4a2c',0.25)}
  f.a('box',0,-0.1,0,5.0,0.4,5.0,'#aa9d84',0.15);
  f.a('cone',0,0.0,0,0.0,0.0,0.0,'#000',0);
}
/* ---------- Capitoline hill (Michelangelo's piazza) ---------- */
export function capitoline(x,z,year){
  const y=heightAt(x,z),b=B(year),face=rotTo(0.8,0.6),f=frame(x,y,z,face,b,1.1);
  reg(rect(x,z,4.2,3.4,face,{mon:1,late:year}));
  f.a('box',0,-0.2,0,5.6,0.3,4.8,'#c9bfa4',0);
  f.a('box',0.0,-0.18,0,3.0,0.04,3.0,'#a79470',0.2);
  palazzo(f,-2.2,0,1.4,4.4,2,0.95,'#e0c9a0','#a8512f',0.3,{},0.0,{P:0.4});
  palazzo(f,0,-2.1,3.6,1.3,2,0.9,'#e0c9a0','#a8512f',0.5,{},0.0,{P:0.35});
  palazzo(f,0,2.1,3.6,1.3,2,0.9,'#e0c9a0','#a8512f',0.6,{},0.0,{P:0.35});
  f.a('box',-2.2,2.1,0,0.5,1.8,0.5,'#cfc5a8',0.9);f.a('cyl8',-2.2,3.9,0,0.28,0.25,0.28,'#a8512f',1.0);
  for(let k=0;k<5;k++)f.a('box',2.9+k*0.0+0.15*k,-0.2,0,0.28,0.12+0.09*(4-k)*0.0,1.4,'#d6ccae',0.9+k*0.05);
}
/* ---------- Piazza Navona (a Roman stadium turned square) ---------- */
export function navona(x,z,year){
  const y=heightAt(x,z),b=B(year),ry=rotTo(0.4,1);
  K.reg(K.rect(x,z,5.3,2.3,ry,{mon:1,late:year}));
  add('cyl',x,y-0.05,z,ry,2*4.7,0.1,2*1.9,'#d5c7a4',b,{dur:1.3});
  const f=frame(x,y,z,ry,b+0.3,1.0);
  for(const dx of [-2.6,0,2.6]){f.a('cyl',dx,0.0,0,1.5,0.3,1.5,'#d9cfb4',0.1);f.a('cyl',dx,0.28,0,1.35,0.04,1.35,'#4f93bd',0.15);f.a('cyl8',dx,0.3,0,0.28,0.9,0.28,'#e6dcc0',0.2)}
  f.a('obelisk'.length?'box':'box',0,0.3,0,0.2,1.8,0.2,'#c98a6a',0.3);
  church(x+rotXZ(4.9,0,ry)[0],z+rotXZ(4.9,0,ry)[1],ry+Math.PI,year+20,{len:2.6,wid:2.2,dome:true,wall:'#e3d1ab',tower:false});
}
/* ---------- Trevi Fountain ---------- */
export function trevi(x,z,year){
  const y=heightAt(x,z),b=B(year),face=rotTo(0,1),f=frame(x,y,z,face,b,1.0);
  reg(rect(x,z,2.6,2.0,face,{mon:1,late:year}));
  palazzo(f,0,-1.2,4.2,0.9,3,0.8,'#e3d6b6','#a8512f',0.0,{},0.0,{P:0.2});
  for(let i=0;i<4;i++)f.a('cyl8',-1.4+i*0.93,0.1,-0.65,0.17,1.7,0.17,'#f2ead6',0.3+i*0.04);
  f.a('box',0,0.3,-0.3,3.8,0.4,0.6,'#d9cfb4',0.4);f.a('box',0,-0.1,0.3,3.6,0.22,1.4,'#4f93bd',0.5);f.a('box',0,-0.2,0.3,3.9,0.3,1.7,'#e6dcc0',0.45);
}
/* ---------- Spanish Steps ---------- */
export function spanishSteps(x,z,year){
  const y=heightAt(x,z),b=B(year),face=rotTo(0,-1),f=frame(x,y,z,face,b,1.0);
  reg(rect(x,z,3.4,2.4,face,{mon:1,late:year}));
  for(let k=0;k<9;k++){const w=2.0+0.4*Math.sin(k*0.7);f.a('box',-1.8+k*0.4,-0.3,0,0.4,0.2+k*0.15,w,'#dcd0b2',0.05*k)}
  f.a('box',2.1,0,0,0.5,1.8,2.0,'#d9c9a2',0.6);f.a('cyl8',2.0,1.8,-0.7,0.0,0.0,0.0,'#fff',0);
  for(const sg of [1,-1]){f.a('box',2.3,0.1,sg*0.8,0.5,2.1,0.5,'#e0d0a8',0.7);f.a('roofP',2.3,2.2,sg*0.8,0.6,0.45,0.6,'#8a4a2c',0.8)}
  f.a('box',1.4,0.1,0,0.4,1.1,2.0,'#e0d0a8',0.65);
}
/* ---------- vineyards on the abandoned hills ---------- */
export function plots(houses,n,y0,y1,opt={}){
  const rp=mulberry(31),out=[];let tries=0;
  while(out.length<n&&tries<4000){tries++;
    const a=rp()*Math.PI*2,r=Math.sqrt(rp())*34,x=C[0]+Math.cos(a)*r,z=C[1]+Math.sin(a)*r,ry=rp()*Math.PI;
    if(riverDist(x,z)<5||heightAt(x,z)<0.7)continue;
    if(K.slopeOK(x,z,3.4,2.6,ry,0.9)===null)continue;
    const rc=K.rect(x,z,1.9,1.5,ry),hit=K.collide(rc,0.2);
    if(hit.some(o=>!o.house||o.newer))continue;
    let after=B(y0);for(const o of hit)if(o.house){const hh=o.house;if(hh.td===NO&&hh.tb<=0.01)after=NO;else if(hh.td!==NO)after=Math.max(after,hh.td+0.5)}
    if(after===NO)continue;
    K.reg(Object.assign(rc,{plot:1}));
    const gy=heightAt(x,z),b=after+rp()*1.5,f=frame(x,gy,z,ry,b,0.8);
    const dying=opt.die?{d:B(opt.die)}:{};
    f.a('box',0,0.02,0,3.4,0.05,2.6,rp()<0.5?'#a8a05a':'#8a9a4a',0,dying);
    for(let k=0;k<7;k++)f.a('box',-1.4+k*0.47,0.06,0,0.12,0.14,2.3,'#4f7a32',0.1+k*0.03,dying);
    out.push({x,z});
  }
}
/* ---------- grazing cows on the Forum (Campo Vaccino) ---------- */
export function cows(year,n=7){
  const b0=B(year),cs=[];
  for(let i=0;i<n;i++){
    const g=new THREE.Group(),col=i%3===0?'#efe7d6':'#6b4a2a';
    const body=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.2,0.16),new THREE.MeshStandardMaterial({color:col,flatShading:true})),head=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.12,0.11),new THREE.MeshStandardMaterial({color:col,flatShading:true}));
    body.position.y=0.22;head.position.set(0.2,0.26,0);body.castShadow=head.castShadow=true;g.add(body,head);scene.add(g);cs.push({g,ph:rr()*10,sp:0.15+rr()*0.15});
  }
  hooks.update.push(t=>cs.forEach((c,i)=>{
    const x=-3+Math.sin(t*c.sp+c.ph)*4.2,z=3.4+Math.cos(t*c.sp*0.8+c.ph*1.3)*2.4+(i%2)*0.0;
    c.g.position.set(x,heightAt(x,z)+0.1,z);c.g.rotation.y=-Math.atan2(Math.cos(t*c.sp+c.ph)*c.sp*4.2,-Math.sin(t*c.sp*0.8+c.ph*1.3)*c.sp*0.8*2.4);
    c.g.visible=t>b0&&t<B(1800);
  }));
}
