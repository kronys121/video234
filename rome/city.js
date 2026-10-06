import * as E from './engine.js';
const {THREE,add,frame,B,heightAt,riverDist,xr,marshAt,rotTo,rotXZ,clamp,lerp,smooth,hash2,mulberry,NO,C,hooks,scene}=E;

export const STONE='#ddd2b6',MARBLE='#f1ece0',TRAV='#e0d0a4',BRICK='#b8714c',DARK='#2c2219',TERRA='#c0502f';
const darker=(c,k=0.8)=>new THREE.Color(c).multiplyScalar(k);
const rnd=mulberry(753);                                   // deterministic city, identical in both episodes

/* =========================================================
   collision world: roads, monuments and houses are rectangles/circles in a hash grid
   ========================================================= */
const CELL=6,grid=new Map();let qid=0;const OBS=[];
function gridCells(o,fn){const r=o.rad+0.3,x0=Math.floor((o.x-r)/CELL),x1=Math.floor((o.x+r)/CELL),z0=Math.floor((o.z-r)/CELL),z1=Math.floor((o.z+r)/CELL);
  for(let i=x0;i<=x1;i++)for(let j=z0;j<=z1;j++)fn(i+','+j)}
export function rect(x,z,hw,hd,ry,extra={}){const c=Math.cos(ry),s=Math.sin(ry);return{t:'o',x,z,hw,hd,ry,c,s,rad:Math.hypot(hw,hd),...extra}}
export function circ(x,z,r,extra={}){return{t:'c',x,z,r,rad:r,...extra}}
export function reg(o){o.id=OBS.length;OBS.push(o);gridCells(o,k=>{let a=grid.get(k);if(!a)grid.set(k,a=[]);a.push(o)});return o}
function sat(a,b,m){
  const dx=b.x-a.x,dz=b.z-a.z;
  for(const [ux,uz] of [[a.c,-a.s],[a.s,a.c],[b.c,-b.s],[b.s,b.c]]){
    const ra=a.hw*Math.abs(ux*a.c-uz*a.s)+a.hd*Math.abs(ux*a.s+uz*a.c);
    const rb=b.hw*Math.abs(ux*b.c-uz*b.s)+b.hd*Math.abs(ux*b.s+uz*b.c);
    if(Math.abs(ux*dx+uz*dz)>ra+rb+m)return false;
  }return true;
}
function rectCirc(a,cx,cz,r,m){
  const dx=cx-a.x,dz=cz-a.z,lx=dx*a.c-dz*a.s,lz=dx*a.s+dz*a.c;
  return Math.hypot(lx-clamp(lx,-a.hw,a.hw),lz-clamp(lz,-a.hd,a.hd))<r+m;
}
export function collide(c,m=0.15){            // c is a rect; returns list of obstacles it touches
  const out=[],seen=++qid;
  gridCells(c,k=>{const a=grid.get(k);if(!a)return;for(const o of a){if(o.q===seen)continue;o.q=seen;
    if(Math.hypot(o.x-c.x,o.z-c.z)>o.rad+c.rad+m)continue;
    if(o.t==='o'?sat(c,o,m):rectCirc(c,o.x,o.z,o.r,m))out.push(o)}});
  return out;
}
export const inMonument=(x,z,m=0.4)=>collide(rect(x,z,0.05,0.05,0),m).some(o=>o.mon&&!o.late);

/* =========================================================
   small building kit
   ========================================================= */
function gableRoof(f,lx,yTop,lz,len,wid,P,roofCol,wallCol,db=0,o={},opt={}){
  const half0=wid/2,ovh=opt.ovh??0.14,halfS=half0+ovh,slope=P/half0,al=Math.atan(slope),th=opt.th??0.07;
  const Ls=halfS*Math.hypot(1,slope),cy=yTop+P-slope*halfS/2+(th/2)/Math.cos(al)+0.012;
  if(opt.tri!==false)f.a('tri',lx,yTop,lz,len,P,wid,wallCol,db,o);
  for(const sg of [1,-1])f.a('slab',lx,cy,lz+sg*halfS/2,len+(opt.ext??0.24),th,Ls,roofCol,db+0.1,o,0,sg*al,0);
  f.a('box',lx,yTop+P+0.04,lz,len+(opt.ext??0.24)+0.06,0.07,0.16,darker(roofCol,0.78),db+0.2,o);
}
function column(f,lx,lz,y,h,r,col,db,o,cap=true){
  f.a('box',lx,y,lz,r*2.9,0.1,r*2.9,col,db,o);
  f.a('cyl8',lx,y+0.1,lz,r*2,h-0.2,r*2,col,db+0.05,o);
  if(cap)f.a('box',lx,y+h-0.1,lz,r*3.1,0.1,r*3.1,col,db+0.1,o);
}
/* peripteral temple: local +x is the front, local z the width */
export function temple(x,z,face,len,wid,cols,year,opt={}){
  const y=heightAt(x,z),b=B(year),f=frame(x,y,z,face,b),o=opt.die?{d:B(opt.die)}:{};
  const marble=opt.col??MARBLE,H=opt.h??1.5,ph=0.5;
  reg(rect(x,z,len/2+0.7,wid/2+0.7,face,{mon:1,late:year}));
  f.a('box',0,-1.7,0,len+0.9,1.7+ph,wid+0.9,'#cfc5a8',0,o);                    // podium
  for(let k=0;k<3;k++)f.a('box',len/2+0.45+0.2*k+0.1,-1.7,0,0.2,0.5+1.7-0.14*(k+1),wid*0.55,'#d6ccae',0.05,o); // steps
  f.a('box',-0.15,ph-0.8+0.8-0.3,0,len*0.74,H+0.3,wid*0.62,opt.cella??'#e6cfae',0.1,o);  // cella
  const top=ph-0.8+0.8;                                                           // y of podium top
  const side=Math.max(2,Math.round(len/0.85));
  for(let i=0;i<cols;i++){const zz=-wid/2+0.2+(wid-0.4)*i/(cols-1);column(f,len/2-0.18,zz,top,H,0.1,marble,0.2+i*0.02,o)}
  for(let k=0;k<side;k++){const xx=len/2-0.18-(len-0.5)*k/(side-1);if(k===0)continue;
    for(const sg of [1,-1])column(f,xx,sg*(wid/2-0.2),top,H,0.1,marble,0.3+k*0.02,o)}
  f.a('box',0,top+H,0,len+0.2,0.22,wid+0.2,'#ece3ce',0.5,o);                      // entablature
  gableRoof(f,0,top+H+0.22,0,len+0.1,wid+0.2,Math.min(0.75,wid*0.25),opt.roof??TERRA,'#efe7d2',0.6,o,{ovh:0.1});
  for(const sg of [1,-1])f.a('box',len/2+0.02,top+H+0.22+Math.min(0.75,wid*0.25),sg*0.0,0.1,0.18,0.1,'#c9a15a',0.8,o);
  return {x,z,y};
}
export function basilica(x,z,ry,len,wid,year,opt={}){
  const y=heightAt(x,z),b=B(year),f=frame(x,y,z,ry,b),o=opt.die?{d:B(opt.die)}:{};
  reg(rect(x,z,len/2+0.3,wid/2+0.3,ry,{mon:1,late:year}));
  const hh=1.5;
  f.a('box',0,-0.6,0,len+0.2,0.7,wid+0.2,'#cfc5a8',0,o);
  f.a('box',0,0.1,0,len,hh,wid,'#e9ddc0',0.1,o);
  const n=Math.floor(len/0.8);
  for(let i=0;i<n;i++){const xx=-len/2+0.4+(len-0.8)*i/(n-1);
    f.a('arch',xx,0.1,0,0.5,0.9,wid+0.06,DARK,0.2,o);
    f.a('box',xx,hh+0.12,0,0.2,0.4,wid+0.04,DARK,0.25,o);}
  f.a('box',0,hh+0.1,0,len+0.1,0.12,wid+0.1,'#f1e8d0',0.3,o);
  gableRoof(f,0,hh+0.22,0,len+0.1,wid+0.1,wid*0.28,TERRA,'#efe3c4',0.4,o,{ovh:0.12});
}
export function triumphalArch(x,z,face,year,s=1,opt={}){
  const y=heightAt(x,z),b=B(year),f=frame(x,y,z,face,b),o=opt.die?{d:B(opt.die)}:{};
  reg(rect(x,z,0.8*s,1.5*s,face,{mon:1,late:year}));
  const col=opt.col??'#ece4d0';
  f.a('box',0,0,0,0.9*s,0.2*s,1.7*s,'#cfc5a8',0,o);
  f.a('box',0,0.2*s,0,0.8*s,1.55*s,1.6*s,col,0.1,o);
  f.a('arch',0,0.2*s,0,0.95*s,1.0*s,0.7*s,DARK,0.2,o,Math.PI/2);
  for(const sg of [1,-1]){f.a('arch',0,0.2*s,sg*0.58*s,0.95*s,0.62*s,0.3*s,DARK,0.25,o,Math.PI/2);
    for(const e of [0.85,-0.85])f.a('cyl8',e*0.5*s*0+0.41*s,0.2*s,sg*(0.4*s),0.16*s,1.2*s,0.16*s,col,0.3,o)}
  f.a('box',0,1.75*s,0,0.88*s,0.5*s,1.62*s,col,0.3,o);
  f.a('box',0,2.25*s,0,0.7*s,0.1*s,1.2*s,'#d8c48a',0.4,o);
}

/* =========================================================
   houses
   ========================================================= */
const WALLS=['#efe3c6','#e6cfa6','#ead2a8','#dcbb8f','#f0dfbd','#e9c9a0'];
const WALLS_M=['#b9a88a','#a8957a','#c2b08e','#9d8b70','#bba58a'];
const WALLS_B=['#e8c9a3','#e4b98e','#efe0bf','#d9a98a','#eed7a8','#d6c19b'];
const ROOFS=['#c8502f','#b9452b','#d0613a','#a8412a'];
const ROOFS_M=['#a8532f','#8f4a30','#9b5a3a','#7d4a38'];
const ROOFS_B=['#b84a2d','#c25a35','#a64028'];
const jit=(hex,a=0.03)=>{const c=new THREE.Color(hex);c.offsetHSL((rnd()-0.5)*a,(rnd()-0.5)*0.1,(rnd()-0.5)*0.07);return c};
const pick=a=>a[Math.floor(rnd()*a.length)];
const WALLS_U=['#e8c48c','#e0a883','#efd9a0','#d8b896','#e6cba2','#d9a07a'];
const WALLS_P=['#d9d4c7','#e8e2d0','#cfc8b8','#e6d9bd','#d2cbb8','#c9c3b4'];
export const styleOf=y=>y<-400?'hut':y<476?'roman':y<1450?'medieval':y<1850?'baroque':y<1945?'umbertino':'postwar';

/** h: {x,z,ry,w,d,ymin,ymax,b,fl,dieY,fire,rebuild...}; writes h.tb / h.td */
export function emitHouse(h,fires){
  const st=h.style??styleOf(h.b),f=frame(h.x,0,h.z,h.ry,B(h.b),0.8);
  let dT=NO,rT=null;
  if(h.fire){const fr=fires[h.fire.i];dT=fr.t0+h.fire.frac*fr.dur*0.7;rT=h.fire.rebuild?fr.t0+fr.dur+0.6+h.fire.rd*2.4:null}
  else if(h.dieY!=null)dT=B(h.dieY);
  const o={d:dT,r:rT,dur:0.9+hash2(Math.round(h.x*7),Math.round(h.z*7))*0.6};
  h.tb=B(h.b);h.td=(dT!==NO&&rT==null)?dT:NO;
  if(dT<=-5&&rT==null)return;
  const base=h.ymax+0.12,{w,d}=h;
  const fh=st==='hut'?0.55:st==='roman'?0.62:st==='medieval'?0.7:st==='baroque'?0.8:0.78;
  const fl=h.fl,wh=fl*fh+(st==='hut'?0.1:0.05);
  const wall=h.wall,roof=h.roof,rseed=h.seed;
  const lod0=h.lod===0;
  if(!lod0)f.a('box',0,h.ymin-0.25,0,w+0.12,base-(h.ymin-0.25),d+0.12,st==='baroque'?'#b6a88e':'#9a9183',-0.05,o);
  else f.a('box',0,h.ymin-0.25,0,w,base-(h.ymin-0.25),d,'#9a9183',-0.05,o);
  f.a('box',0,base,0,w,wh,d,wall,0,o);
  if(st==='postwar'){
    f.a('box',0,base+wh,0,w+0.08,0.1,d+0.08,'#8a8780',0.5,o);
    if(!lod0){f.a('box',0,base+wh+0.1,0,w*0.5,0.28,d*0.5,'#9b9890',0.15,o);
      for(let k=0;k<fl;k++)f.a('box',0,base+k*fh+fh*0.35,0,w*0.86,0.17,d+0.05,'#34383f',0.12+k*0.01,o);}
    return;
  }
  if(!lod0&&(fl>=2||st==='baroque')){f.a('box',0,base+wh-0.09,0,w+0.1,0.09,d+0.1,darker(wall,1.08),0.05,o);
    for(let k=1;k<fl;k++)f.a('box',0,base+k*fh-0.03,0,w+0.05,0.06,d+0.05,darker(wall,0.9),0.04,o)}
  const P=st==='hut'?d*0.62:st==='medieval'?d*0.62:st==='baroque'?d*0.26:st==='umbertino'?d*0.2:d*0.34+(fl>2?0:0.05);
  gableRoof(f,0,base+wh,0,w,d,P,st==='hut'?'#a8863e':roof,wall,0.45,o,{ovh:st==='hut'?0.2:0.13});
  if(lod0)return;
  const dx=w>1.55?-w*0.2:0;
  f.a('box',dx,base,0,st==='hut'?0.26:0.3,st==='hut'?0.46:0.52,d+0.07,st==='hut'?'#4a3320':'#4a331f',0.15,o);
  if(st!=='hut'){
    for(let k=0;k<fl;k++){
      const n=k===0?(w>1.55?1:0):clamp(Math.floor(w/0.62),1,3);
      for(let i=0;i<n;i++){
        const xx=k===0?w*0.22:(n===1?(dx!==0?w*0.2:0):-w/2+(w)*(i+0.5)/n);
        const wy=base+k*fh+fh*0.34;
        f.a('box',xx,wy,0,0.17,0.24,d+0.06,'#2b2219',0.5+k*0.04,o);
        f.a('box',xx,wy-0.035,0,0.27,0.04,d+0.075,darker(wall,0.85),0.52+k*0.04,o);
      }
    }
    if(st==='medieval'&&rseed>0.45)f.a('box',w/2-0.25,base+wh+P*0.35,-0.15,0.2,P*0.9,0.2,'#8a7a66',0.3,o);
    if(st==='roman'&&fl===1&&rseed>0.75)f.a('slab',w*0.0,base+0.52,d/2+0.2,w*0.8,0.04,0.45,pick(['#b3382b','#d6a83a','#3f6e8a']),0.3,o,0,0.35,0);
  }
}
/** pick footprint-aware appearance once the built year is known */
export function dress(h){
  const y=h.b,st=h.style??styleOf(y),cdist=Math.hypot(h.x+1,h.z-5);
  h.seed=rnd();
  if(st==='hut'){h.wall=jit('#a98c60');h.roof=jit('#a8863e',0.05);h.fl=1;h.w*=0.78;h.d*=0.78}
  else if(st==='roman'){h.wall=jit(pick(WALLS));h.roof=jit(pick(ROOFS));
    h.fl=(y>-60&&cdist<17)?(h.seed>0.55?3+(h.seed>0.85?1:0):2):(h.seed>0.72?2:1)}
  else if(st==='medieval'){h.wall=jit(pick(WALLS_M));h.roof=jit(pick(ROOFS_M));h.fl=h.seed>0.6?3:2}
  else if(st==='baroque'){h.wall=jit(pick(WALLS_B));h.roof=jit(pick(ROOFS_B));h.fl=h.seed>0.5?3:2;if(h.seed>0.93)h.fl=4}
  else if(st==='umbertino'){h.wall=jit(pick(WALLS_U));h.roof=jit(pick(ROOFS_B));h.fl=4+(h.seed>0.6?1:0)+(h.seed>0.9?1:0)}
  else{h.wall=jit(pick(WALLS_P));h.roof=jit('#7c7a74');h.fl=4+Math.floor(h.seed*5)}
  if(h.lod===undefined)h.lod=Math.hypot(h.x-2,h.z-6)>(h.lodR??60)?0:1;
}
function slotRect(x,z,w,d,ry){return rect(x,z,w/2,d/2,ry)}
export function slopeOK(x,z,w,d,ry,maxSlope=1.35){
  let lo=9e9,hi=-9e9;
  for(const [cx,cz] of [[-1,-1],[1,-1],[1,1],[-1,1],[0,0]]){const [wx,wz]=rotXZ(cx*w/2,cz*d/2,ry),h=heightAt(x+wx,z+wz);lo=Math.min(lo,h);hi=Math.max(hi,h)}
  return hi-lo<=maxSlope?{ymin:lo,ymax:hi}:null;
}

/* =========================================================
   roads
   ========================================================= */
export const roads=[];
function smoothPts(pts,step=1.2){
  const out=[pts[0]];let s=0;
  for(let i=1;i<pts.length;i++){const [x0,z0]=pts[i-1],[x1,z1]=pts[i],L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(L/step));
    for(let k=1;k<=n;k++)out.push([lerp(x0,x1,k/n),lerp(z0,z1,k/n)])}
  return out;
}
export function makeRoad(pts,w,year,growth,kind,step=1.2){
  const p=smoothPts(pts,step),arc=[0];
  for(let i=1;i<p.length;i++)arc.push(arc[i-1]+Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]));
  const r={p,arc,w,year,growth,kind,houses:[],id:roads.length,segs:[]};
  // keep only usable segments (dry, not through monuments)
  for(let i=0;i<p.length-1;i++){
    const [x0,z0]=p[i],[x1,z1]=p[i+1],mx=(x0+x1)/2,mz=(z0+z1)/2,len=Math.hypot(x1-x0,z1-z0);
    const bridge=(Math.abs(mz-9)<2.2||Math.abs(mz+12)<2.2||Math.abs(mz+1)<2.2)&&riverDist(mx,mz)<9;
    if(!bridge&&(riverDist(mx,mz)<4.6||heightAt(mx,mz)<0.4))continue;
    if(inMonument(mx,mz,0.1))continue;
    const seg={i,x0,z0,x1,z1,mx,mz,len,s:arc[i]};
    const rc=rect(mx,mz,len/2,w/2,rotTo(x1-x0,z1-z0),{road:r.id});
    if(kind==='minor'&&collide(rc,0.35).some(o=>o.road!==r.id&&(i>0||o.road===undefined))){p.length=i+1;arc.length=i+1;break}   // minor streets stop at whatever they meet
    r.segs.push(seg);reg(rc);
  }
  roads.push(r);return r;
}
export function emitRoads(){
  for(const r of roads){
    if(r.emitted)continue;r.emitted=true;
    for(const sg of r.segs){
      let base=r.year;for(const h of r.houses)base=Math.min(base,h.b-4);
      if(base>9000)continue;                       // a street nobody built on never appears
      let yr=base+(r.growth2!==undefined?Math.min(sg.s,50)*r.growth+Math.max(0,sg.s-50)*r.growth2:sg.s*r.growth);
      if(r.fixed!==undefined)yr=r.fixed;
      const segHits=collide(rect(sg.mx,sg.mz,sg.len/2,r.w/2,rotTo(sg.x1-sg.x0,sg.z1-sg.z0)),0),lt=segHits.filter(q=>q.late);
      for(const q of segHits)if(q.house&&q.house.hut&&q.house.dieY!=null)yr=Math.max(yr,q.house.dieY+1);
      const b=B(yr),st=styleOf(yr);
      const h0=heightAt(sg.x0,sg.z0),h1=heightAt(sg.x1,sg.z1),hm=heightAt(sg.mx,sg.mz);
      const yb=Math.max(hm,(h0+h1)/2)+0.03+(r.kind==='main'?0.02:0);
      const ry=rotTo(sg.x1-sg.x0,sg.z1-sg.z0),rz=Math.atan2(h1-h0,sg.len);
      const dirt=yr<-420,col=r.col??(dirt?'#a89268':st==='roman'?(r.kind==='main'?'#a8a298':'#9b9078'):st==='medieval'?'#8f8574':st==='baroque'?'#8f8b83':st==='umbertino'?'#7d7a74':'#4f4f55');
      const o={dur:0.5,rz};if(lt.length)o.d=B(Math.min(...lt.map(q=>q.late))-0.5);
      add('box',sg.mx,yb,sg.mz,ry,sg.len,0.07,r.w,col,b,o);
      if(r.kind==='main'&&!dirt)add('box',sg.mx,yb+0.035,sg.mz,ry,sg.len,0.05,r.w*(st==='postwar'?0.06:0.55),st==='postwar'?'#cfc9b4':'#bcb6aa',b+0.05,o);
      else if(r.kind==='minor'&&!dirt)add('box',sg.mx,yb+0.035,sg.mz,ry,sg.len,0.03,r.w*0.4,'#a69c88',b+0.05,o);
    }
  }
}

/* =========================================================
   placement of houses along roads (no overlaps, no road crossings)
   ========================================================= */
export const stats={slots:0,skip:0,river:0,slope:0,low:0,hit:0,hitRoad:0,hitMon:0,hitHouse:0,ok:0};
export function houseSlots(road,opts={}){
  const out=[],{p,arc}=road,sideGap=opts.gap??0.3;
  let s=opts.start??1.5;const total=arc[arc.length-1];
  const find=s=>{let i=0;while(i<arc.length-2&&arc[i+1]<s)i++;return i};
  for(const side of [1,-1]){
    s=opts.start??1.5+rnd()*1.2;
    while(s<total-1){
      const w=(opts.wmin??1.5)+rnd()*(opts.wvar??0.8),d=(opts.dmin??1.2)+rnd()*(opts.dvar??0.5);
      const i=find(s+w/2),[x0,z0]=p[i],[x1,z1]=p[i+1],tt=(s+w/2-arc[i])/(arc[i+1]-arc[i]||1);
      const px=lerp(x0,x1,tt),pz=lerp(z0,z1,tt),tl=Math.hypot(x1-x0,z1-z0),tx=(x1-x0)/tl,tz=(z1-z0)/tl;
      const off=road.w/2+0.28+d/2,cx=px+(-tz)*side*off,cz=pz+tx*side*off;
      const ry=rotTo(tx,tz);
      s+=w+sideGap+(rnd()<0.12?rnd()*1.6:0);stats.slots++;
      if(rnd()<(opts.skip??0.08)){stats.skip++;continue}
      if(riverDist(cx,cz)<4.8){stats.river++;continue}
      const sl=slopeOK(cx,cz,w,d,ry);if(!sl){stats.slope++;continue}
      if(heightAt(cx,cz)<(opts.minH??0.5)||marshAt(cx,cz)>(opts.marsh??0.3)){stats.low++;continue}
      const rc=rect(cx,cz,w/2,d/2,ry);
      const hit0=collide(rc,0.12),late=hit0.filter(o=>o.late),hit=hit0.filter(o=>!o.late);
      const clear=late.length?Math.min(...late.map(o=>o.late)):undefined,gen=opts.gen??0;
      if(opts.soft){const hard=hit.filter(o=>!o.house||(o.gen??0)>=gen);if(hard.length)continue;
        const hh={x:cx,z:cz,ry,w,d,...sl,road:road.id,s:s-w,soft:hit.filter(o=>o.house).map(o=>o.house),nx:-tz*side,nz:tx*side,clear,gen};
        if(opts.accept&&!opts.accept(hh))continue;
        out.push(hh);reg(Object.assign(rc,{house:hh,gen}));continue}
      if(hit.length){stats.hit++;if(hit.some(o=>o.road!==undefined))stats.hitRoad++;if(hit.some(o=>o.mon))stats.hitMon++;if(hit.some(o=>o.house))stats.hitHouse++;continue}
      stats.ok++;const h={x:cx,z:cz,ry,w,d,...sl,road:road.id,s:s-w,soft:[],nx:-tz*side,nz:tx*side,clear};
      reg(Object.assign(rc,{house:h}));out.push(h);
    }
  }
  return out;
}

/** a second/third row of houses behind an existing one (fills the blocks) */
export function backRow(h,o={}){
  const d=(o.dmin??1.2)+rnd()*(o.dvar??0.45),w=(o.wmin??1.4)+rnd()*(o.wvar??0.7),off=h.d/2+0.32+d/2;
  const cx=h.x+h.nx*off,cz=h.z+h.nz*off,ry=h.ry+(rnd()-0.5)*0.12;
  if(rnd()<0.1)return null;
  if(riverDist(cx,cz)<4.8)return null;
  const sl=slopeOK(cx,cz,w,d,ry);if(!sl)return null;
  if(heightAt(cx,cz)<(o.minH??0.5)||marshAt(cx,cz)>(o.marsh??0.3))return null;
  const rc=rect(cx,cz,w/2,d/2,ry);const hh0=collide(rc,0.12),lt=hh0.filter(o=>o.late);if(hh0.some(o=>!o.late))return null;
  const n={clear:lt.length?Math.min(...lt.map(o=>o.late)):undefined,x:cx,z:cz,ry,w,d,...sl,road:h.road,s:h.s,soft:[],nx:h.nx,nz:h.nz,back:(h.back||0)+1};
  reg(Object.assign(rc,{house:n}));return n;
}

/** fill the blocks: random spots aligned with the nearest street (soft mode lets new houses sit on old ones, born after those are gone) */
export function infill(tries,inCity,opts={}){
  const pts=[];for(const r of roads)for(const sg of r.segs)pts.push([sg.mx,sg.mz,rotTo(sg.x1-sg.x0,sg.z1-sg.z0),r.id,sg.s]);
  const out=[];
  for(let k=0;k<tries;k++){
    let x,z;
    if(opts.areas){const A=opts.areas[Math.floor(rnd()*opts.areas.length)];x=A[0]+(rnd()*2-1)*A[2];z=A[1]+(rnd()*2-1)*A[2]*(A[3]??1)}
    else{const a=rnd()*Math.PI*2,R1=opts.R??36,R0=opts.R0??0,rr=Math.sqrt(R0*R0+rnd()*(R1*R1-R0*R0));x=C[0]+Math.cos(a)*rr;z=C[1]+Math.sin(a)*rr}
    let best=null,bd=9e9;for(const q of pts){const d=(q[0]-x)**2+(q[1]-z)**2;if(d<bd){bd=d;best=q}}
    if(!best||bd>(opts.maxD??140)||bd<0.8){stats.i_near=(stats.i_near||0)+1;continue}
    const w=(opts.wmin??1.4)+rnd()*(opts.wvar??0.8),d=(opts.dmin??1.2)+rnd()*(opts.dvar??0.5),ry=best[2]+(rnd()-0.5)*0.1;
    if(riverDist(x,z)<4.8){stats.i_river=(stats.i_river||0)+1;continue}
    const sl=slopeOK(x,z,w,d,ry);if(!sl){stats.i_slope=(stats.i_slope||0)+1;continue}
    if(heightAt(x,z)<(opts.minH??0.5)||marshAt(x,z)>(opts.marsh??0.3)){stats.i_low=(stats.i_low||0)+1;continue}
    if(!inCity({x,z}))continue;
    const rc=rect(x,z,w/2,d/2,ry),hh0=collide(rc,0.14),lt=hh0.filter(o=>o.late);
    const gen=opts.gen??0,isSoft=o=>opts.soft&&o.house&&(o.gen??0)<gen;
    if(hh0.some(o=>!o.late&&!isSoft(o))){stats.i_hit=(stats.i_hit||0)+1;for(const o of hh0){if(!o.late&&!isSoft(o)){const k=o.mon?'h_mon':o.road!==undefined?'h_road':o.house?'h_house':'h_other';stats[k]=(stats[k]||0)+1}}continue}stats.i_ok=(stats.i_ok||0)+1;
    const clear=lt.length?Math.min(...lt.map(o=>o.late)):undefined;
    const h={x,z,ry,w,d,...sl,road:best[3],s:best[4],soft:hh0.filter(isSoft).map(o=>o.house),nx:0,nz:0,infill:1,clear,gen};
    if(opts.accept&&!opts.accept(h))continue;
    reg(Object.assign(rc,{house:h,gen}));out.push(h);
  }
  return out;
}
export const OBS_DEBUG=()=>[...OBS].sort((a,b)=>b.rad-a.rad);
