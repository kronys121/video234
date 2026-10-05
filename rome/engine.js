import * as THREE from 'three';
export {THREE};
export const W = 1280, H = 720;

/* ---------- utils ---------- */
export function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
export function hash2(ix,iz){let h=Math.imul(ix,374761393)+Math.imul(iz,668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295}
export function vnoise(x,z){const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);
  return lerp(lerp(hash2(ix,iz),hash2(ix+1,iz),u),lerp(hash2(ix,iz+1),hash2(ix+1,iz+1),u),v)}
export function fbm(x,z){let s=0,a=.5,f=1;for(let i=0;i<4;i++){s+=a*vnoise(x*f,z*f);f*=2;a*=.5}return s}
export const rotTo=(tx,tz)=>Math.atan2(-tz,tx);                 // yaw mapping local +x onto (tx,tz)
export const rotXZ=(x,z,ry)=>[x*Math.cos(ry)+z*Math.sin(ry),-x*Math.sin(ry)+z*Math.cos(ry)];
export function kf(keys,t){
  let i=0;while(i<keys.length-2&&t>keys[i+1][0])i++;
  const [t0,v0]=keys[i],[t1,v1]=keys[i+1];
  const m0=i>0?(keys[i+1][1]-keys[i-1][1])/(keys[i+1][0]-keys[i-1][0]):(v1-v0)/(t1-t0);
  const m1=i+2<keys.length?(keys[i+2][1]-keys[i][1])/(keys[i+2][0]-keys[i][0]):(v1-v0)/(t1-t0);
  const h=t1-t0,s=clamp((t-t0)/h);
  return (2*s**3-3*s**2+1)*v0+(s**3-2*s**2+s)*h*m0+(-2*s**3+3*s**2)*v1+(s**3-s**2)*h*m1;
}

/* ---------- timeline (set by each episode) ---------- */
export let CFG=null,CARDS=[],DUR=30,Y0=0;
export function setup(cfg){CFG=cfg;CARDS=cfg.cards;DUR=CARDS[CARDS.length-1].t1;Y0=CARDS[0].y0}
export function yearAt(t){
  if(t<=0)return CARDS[0].y0;if(t>=DUR)return CARDS[CARDS.length-1].y1;
  for(const c of CARDS)if(t<=c.t1)return lerp(c.y0,c.y1,(t-c.t0)/(c.t1-c.t0));
}
export function B(y){                        // time (s) at which the clock reaches year y
  if(y<Y0)return -10;
  for(const c of CARDS)if(y<=c.y1)return lerp(c.t0,c.t1,(y-c.y0)/(c.y1-c.y0));
  return DUR+50;
}

/* ---------- world layout (shared by both episodes) ---------- */
export const C=[2,6];
export const xr=z=>-44+8*Math.sin(0.05*z+0.6)+0.0012*z*z;       // Tiber centre line
export const HILLS=[[-12,-4,4.6,5],[4,10,4.2,5.2],[-10,21,4.4,5],[19,18,3.8,5],[23,2,3.6,5.5],[12,-11,3.4,5],[3,-21,3.6,5],[-62,-24,3.2,6],[-60,16,5,7]];
export const MARSH=[[-4,4,3.4],[-2,16,2.9],[-24,-14,5.4]];
export const FLAT=[[-3,15.5,7,13,0.95],[14,3,10,15,1.15],[-12,-16,5,8,1.1],[14,29,7,11,1.1],[-62,-24,9,14,1.2]];
export function marshAt(x,z){let m=0;for(const [mx,mz,s] of MARSH){const d2=(x-mx)**2+(z-mz)**2;m=Math.max(m,Math.exp(-d2/(2*s*s)))}return m}
export function heightAt(x,z){
  let h=1.1+0.8*fbm(x*0.03+10,z*0.03);
  const d=Math.hypot(x-C[0],z-C[1]);
  h+=smooth(60,150,d)*(9*fbm(x*0.018+50,z*0.018+7));
  for(const [hx,hz,hh,s] of HILLS)h+=hh*Math.exp(-((x-hx)**2+(z-hz)**2)/(2*s*s));
  for(const [fx,fz,r0,r1,fh] of FLAT){const m=1-smooth(r0,r1,Math.hypot(x-fx,z-fz));h=lerp(h,fh,m)}
  const dr=Math.abs(x-xr(z));
  h-=3.4*Math.exp(-((dr/4.4)**2));
  h=lerp(h,0.3,smooth(0.15,0.6,marshAt(x,z)));
  return h;
}
export const riverDist=(x,z)=>Math.abs(x-xr(z));

/* ---------- renderer / scene ---------- */
export const BG=new THREE.Color('#e9dcb9');
export const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setSize(W,H);renderer.setPixelRatio(1);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
document.getElementById('gl').appendChild(renderer.domElement);
export const scene=new THREE.Scene();scene.background=BG;scene.fog=new THREE.Fog(BG,190,470);
export const camera=new THREE.PerspectiveCamera(32,W/H,1,900);
scene.add(new THREE.HemisphereLight(0xdfeeff,0x7a8a46,1.15));
export const sun=new THREE.DirectionalLight(0xffe0ae,3.0);
sun.position.set(-70,62,45);sun.castShadow=true;sun.shadow.mapSize.set(3072,3072);
Object.assign(sun.shadow.camera,{left:-75,right:75,top:75,bottom:-75,near:10,far:280});
sun.shadow.bias=-0.0005;sun.shadow.normalBias=0.04;
scene.add(sun,sun.target);
export const fireLight=new THREE.PointLight(0xff7a22,0,90,1.6);scene.add(fireLight);

/* ---------- textures (procedural, tiny) ---------- */
function canvasTex(w,h,draw,rx=1,ry=1){
  const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);
  t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
const rr=mulberry(99);
const plasterTex=canvasTex(128,128,(g,w,h)=>{
  g.fillStyle='#ececec';g.fillRect(0,0,w,h);
  for(let i=0;i<900;i++){const v=200+Math.floor(rr()*55);g.fillStyle=`rgba(${v},${v},${v},0.55)`;g.fillRect(rr()*w,rr()*h,1+rr()*3,1+rr()*3)}
});
const tileTex=canvasTex(64,64,(g,w,h)=>{
  g.fillStyle='#f2f2f2';g.fillRect(0,0,w,h);
  for(let r=0;r<8;r++){
    const y=r*8;g.fillStyle='rgba(60,40,30,0.38)';g.fillRect(0,y,w,1.5);
    for(let c=0;c<8;c++){const x=((c*8)+(r%2)*4)%w;g.fillStyle='rgba(60,40,30,0.18)';g.fillRect(x,y,1,8)}
  }
  for(let i=0;i<260;i++){const v=205+Math.floor(rr()*50);g.fillStyle=`rgba(${v},${v},${v},0.35)`;g.fillRect(rr()*w,rr()*h,2,2)}
},1,1);

/* ---------- geometry classes (all base-origin unless "c") ---------- */
const bo=g=>{g.translate(0,0.5,0);return g};
function triGeom(){ // gable end prism: ridge along x, cross-section in z-y
  const P=[],q=(a,b,c)=>P.push(...a,...b,...c);
  const A=[-.5,0,-.5],Bq=[-.5,0,.5],Cq=[-.5,1,0],D=[.5,0,-.5],E=[.5,0,.5],F=[.5,1,0];
  q(A,Cq,Bq);q(D,E,F);q(A,D,F);q(A,F,Cq);q(Bq,Cq,F);q(Bq,F,E);q(A,Bq,E);q(A,E,D);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.computeVertexNormals();return g;
}
function archGeom(){
  const s=new THREE.Shape();s.moveTo(-0.5,0);s.lineTo(0.5,0);s.lineTo(0.5,0.5);s.absarc(0,0.5,0.5,0,Math.PI,false);s.lineTo(-0.5,0);
  const g=new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false,curveSegments:8});g.translate(0,0,-0.5);return g;
}
const matPlain=new THREE.MeshStandardMaterial({flatShading:true,roughness:0.9});
const matPlaster=new THREE.MeshStandardMaterial({flatShading:true,roughness:0.9,map:plasterTex});
const matTile=new THREE.MeshStandardMaterial({flatShading:true,roughness:0.8,map:tileTex});
const matDouble=new THREE.MeshStandardMaterial({flatShading:true,roughness:0.85,map:plasterTex,side:THREE.DoubleSide});
const KINDS={
  box:{g:bo(new THREE.BoxGeometry(1,1,1)),m:matPlaster},
  slab:{g:new THREE.BoxGeometry(1,1,1),m:matTile},                                  // centred, tiled
  roofP:{g:(()=>{const g=new THREE.ConeGeometry(0.72,1,4);g.rotateY(Math.PI/4);g.translate(0,0.5,0);return g})(),m:matTile},
  cyl:{g:bo(new THREE.CylinderGeometry(0.5,0.5,1,16)),m:matPlaster},
  cyl8:{g:bo(new THREE.CylinderGeometry(0.5,0.5,1,8)),m:matPlaster},
  cone:{g:bo(new THREE.ConeGeometry(0.5,1,7)),m:matPlain},
  ico:{g:bo(new THREE.IcosahedronGeometry(0.5,0)),m:matPlain},
  dome:{g:new THREE.SphereGeometry(0.5,20,10,0,Math.PI*2,0,Math.PI/2),m:matDouble},
  tri:{g:triGeom(),m:matDouble},
  arch:{g:archGeom(),m:matPlain},
};
export const items={};for(const k of Object.keys(KINDS))items[k]=[];
const growth=u=>{if(u<=0)return 0;if(u>=1)return 1;const c1=1.15,c3=c1+1;return 1+c3*Math.pow(u-1,3)+c1*Math.pow(u-1,2)};
export function scaleAt(it,t){
  if(t<it.d)return growth((t-it.b)/it.dur);
  if(it.r!=null&&t>=it.r)return growth((t-it.r)/it.dur);
  return 1-clamp((t-it.d)/0.35);
}
export const NO=Infinity;
export function add(k,x,y,z,ry,sx,sy,sz,col,b,o={}){
  if(b>=DUR+40||(o.d!==undefined&&o.d<=-5&&o.r==null))return null;       // never visible in this episode
  const it={x,y,z,ry,rx:o.rx||0,rz:o.rz||0,sx,sy,sz,col:new THREE.Color(col),b,d:o.d??NO,r:o.r??null,dur:o.dur??0.7,done:false};
  items[k].push(it);return it;
}
/* local frame helper: place pieces relative to an origin + yaw */
export function frame(ox,oy,oz,ry,b0=0,dur0=0.8){
  const f={
    a(k,lx,ly,lz,sx,sy,sz,col,db=0,o={},lry=0,lrx=0,lrz=0){
      const [wx,wz]=rotXZ(lx,lz,ry);
      return add(k,ox+wx,oy+ly,oz+wz,ry+lry,sx,sy,sz,col,b0+db,{dur:dur0,...o,rx:lrx,rz:lrz});
    },
  };return f;
}
const dummy=new THREE.Object3D();
export const meshes={};
export function buildInst(){
  for(const k of Object.keys(KINDS)){
    const arr=items[k],m=new THREE.InstancedMesh(KINDS[k].g,KINDS[k].m,Math.max(1,arr.length));
    arr.forEach((it,i)=>m.setColorAt(i,it.col));
    if(arr.length===0)m.count=0;
    m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;scene.add(m);meshes[k]=m;
  }
}
export function updateInst(t){
  dummy.rotation.order='YXZ';
  for(const k of Object.keys(KINDS)){
    const arr=items[k],m=meshes[k];let touched=false;
    for(let i=0;i<arr.length;i++){
      const it=arr[i];if(it.done)continue;touched=true;
      const s=scaleAt(it,t);
      dummy.position.set(it.x,it.y,it.z);dummy.rotation.set(it.rx,it.ry,it.rz);
      const e=s<0.002?0:s;dummy.scale.set(it.sx*e,it.sy*e,it.sz*e);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);
      if(it.d===NO&&t>=it.b+it.dur)it.done=true;
      else if(it.d!==NO&&it.r!=null&&t>=it.r+it.dur)it.done=true;
      else if(it.d!==NO&&it.r==null&&t>=it.d+0.4)it.done=true;
    }
    if(touched)m.instanceMatrix.needsUpdate=true;
  }
}

/* ---------- terrain / water ---------- */
export let marshPatches=[],marshDry0=0,marshDry1=0,waterMesh;
export function buildTerrain(){
  const g=new THREE.PlaneGeometry(360,360,224,224);g.rotateX(-Math.PI/2);
  const p=g.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color();
  const grassLow=new THREE.Color('#7fa83c'),grassHi=new THREE.Color('#5d9a35'),dry=new THREE.Color('#a3a554'),mud=new THREE.Color('#6d7a3c'),sand=new THREE.Color('#c9b878'),rock=new THREE.Color('#8a9460');
  const marsh=CFG.marsh;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),z=p.getZ(i),h=heightAt(x,z);p.setY(i,h);
    const n=fbm(x*0.12,z*0.12);
    c.copy(grassLow).lerp(grassHi,clamp((h-1)/3)).lerp(dry,clamp(n*1.3-0.35)*(CFG.dryness??0.6));
    c.lerp(rock,smooth(6,10,h)*0.6);
    if(marsh)c.lerp(mud,smooth(0.25,0.7,marshAt(x,z)));
    c.lerp(sand,(1-smooth(0.5,1.4,h))*0.55*(riverDist(x,z)<8?1:0));
    c.offsetHSL((hash2(i,7)-0.5)*0.015,0,(hash2(i,3)-0.5)*0.05);
    col.set([c.r,c.g,c.b],i*3);
  }
  g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1}));
  m.receiveShadow=true;scene.add(m);
  waterMesh=new THREE.Mesh(new THREE.PlaneGeometry(360,360).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:'#1d6aa5',roughness:0.28,flatShading:true}));
  waterMesh.position.y=0.15;waterMesh.receiveShadow=true;scene.add(waterMesh);
  if(marsh){
    const mm=new THREE.MeshStandardMaterial({color:'#4f8a86',roughness:0.4,flatShading:true});
    marshPatches=MARSH.map(([x,z,s])=>{const q=new THREE.Mesh(new THREE.CircleGeometry(s*1.35,20).rotateX(-Math.PI/2),mm);q.position.set(x,0.45,z);q.receiveShadow=true;scene.add(q);return q});
    marshDry0=B(-640);marshDry1=B(-585);
  }
}

/* ---------- clouds / fire ---------- */
const clouds=[];
export function buildClouds(){
  const rc=mulberry(5),mat=new THREE.MeshStandardMaterial({color:'#ffffff',flatShading:true,roughness:1,emissive:'#6a6a6a'});
  for(let i=0;i<9;i++){
    const g=new THREE.Group();
    for(let j=0;j<5;j++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(4+rc()*3,1),mat);m.position.set((j-2)*4.5,rc()*2,(rc()-0.5)*3);m.scale.y=0.55;g.add(m)}
    g.position.set(0,100+rc()*20,(rc()-0.5)*200);scene.add(g);clouds.push({g,sp:0.5+rc()*0.8});
  }
}
const NS=64,NF=34;
let smoke,flames,FIRES=[];
const smokeGeom=new THREE.IcosahedronGeometry(0.5,1);
export function buildFire(fires){
  FIRES=fires;
  smoke=new THREE.InstancedMesh(smokeGeom,new THREE.MeshStandardMaterial({flatShading:true,roughness:1}),NS*Math.max(1,FIRES.length));
  flames=new THREE.InstancedMesh(KINDS.cone.g,new THREE.MeshBasicMaterial({color:'#ffffff'}),NF*Math.max(1,FIRES.length));
  smoke.frustumCulled=flames.frustumCulled=false;scene.add(smoke,flames);
  if(!FIRES.length){smoke.count=0;flames.count=0}
}
const cOr=new THREE.Color('#ff7a1c'),cYe=new THREE.Color('#ffc43a'),cGr=new THREE.Color('#6b635b'),cG2=new THREE.Color('#b0a79d'),tmpC=new THREE.Color();
function updateFire(t){
  let light=0,lx=0,lz=0;
  FIRES.forEach((f,fi)=>{
    const I=smooth(f.t0,f.t0+0.4,t)*(1-smooth(f.t0+f.dur,f.t0+f.dur+1.6,t));
    const sm=smooth(f.t0,f.t0+0.4,t)*(1-smooth(f.t0+f.dur+0.2,f.t0+f.dur+1.7,t));
    if(I>light){light=I;lx=f.x;lz=f.z}
    for(let j=0;j<NS;j++){
      const i=fi*NS+j,ph=((t*0.5+j*0.618)%1),a=hash2(j,11+fi)*Math.PI*2,r0=hash2(j,5+fi)*f.r*0.6;
      const x=f.x+Math.cos(a)*r0+ph*3*Math.sin(j),z=f.z+Math.sin(a)*r0+ph*2,g=heightAt(f.x+Math.cos(a)*r0,f.z+Math.sin(a)*r0);
      const s=(0.4+ph*1.3)*sm*(1-smooth(0.7,1,ph))*(0.7+0.5*hash2(j,2));
      dummy.position.set(x,g+1.2+ph*17,z);dummy.rotation.set(0,0,0);dummy.scale.setScalar(Math.max(0.0001,s));dummy.updateMatrix();
      smoke.setMatrixAt(i,dummy.matrix);
      tmpC.copy(cGr).lerp(cG2,smooth(0.1,0.9,ph));if(ph<0.12)tmpC.lerp(cOr,1-ph/0.12);smoke.setColorAt(i,tmpC);
    }
    for(let j=0;j<NF;j++){
      const i=fi*NF+j,a=hash2(j,31+fi)*Math.PI*2,r0=Math.sqrt(hash2(j,17+fi))*f.r*0.55;
      const x=f.x+Math.cos(a)*r0,z=f.z+Math.sin(a)*r0,g=heightAt(x,z);
      const fl=(0.65+0.45*Math.sin(t*15+j*1.9))*I*(1.2+hash2(j,9)*1.4);
      dummy.position.set(x,g+0.6,z);dummy.rotation.set(0,0,0);dummy.scale.set(0.9*fl+0.0001,2.4*fl+0.0001,0.9*fl+0.0001);dummy.updateMatrix();
      flames.setMatrixAt(i,dummy.matrix);tmpC.copy(cOr).lerp(cYe,0.5+0.5*Math.sin(t*9+j));flames.setColorAt(i,tmpC);
    }
  });
  if(FIRES.length){smoke.instanceMatrix.needsUpdate=flames.instanceMatrix.needsUpdate=true;
    if(smoke.instanceColor)smoke.instanceColor.needsUpdate=true;if(flames.instanceColor)flames.instanceColor.needsUpdate=true}
  fireLight.intensity=light*900;fireLight.position.set(lx,5,lz);
}

/* ---------- camera ---------- */
const DBGCAM=(new URLSearchParams(location.search).get('cam')||'').split(',').map(Number).filter(n=>!isNaN(n));
function setCamera(t){
  const K=CFG.camera;
  if(DBGCAM.length===5){const [d,el,az,tx,tz]=DBGCAM,e2=el*Math.PI/180,a2=az*Math.PI/180;camera.position.set(tx+d*Math.cos(e2)*Math.sin(a2),1.6+d*Math.sin(e2),tz+d*Math.cos(e2)*Math.cos(a2));camera.lookAt(tx,1.6,tz);sun.target.position.set(tx,0,tz);sun.position.set(tx-70,62,tz+45);return}
  const d=kf(K.dist,t),el=kf(K.elev,t)*Math.PI/180,az=kf(K.az,t)*Math.PI/180,tx=kf(K.tx,t),tz=kf(K.tz,t),ty=1.6;
  camera.position.set(tx+d*Math.cos(el)*Math.sin(az),ty+d*Math.sin(el),tz+d*Math.cos(el)*Math.cos(az));
  camera.lookAt(tx,ty,tz);
  sun.target.position.set(tx,0,tz);sun.position.set(tx-70,62,tz+45);
}

/* ---------- UI ---------- */
const $=id=>document.getElementById(id);
let lastPol=-1,lastCard=-1;
export function popAt(y){
  const P=CFG.pop;
  if(y<=P[0][0])return P[0][1];
  for(let i=0;i<P.length-1;i++){const [a,pa]=P[i],[b,pb]=P[i+1];
    if(y<=b){const s=clamp((y-a)/(b-a));return Math.exp(lerp(Math.log(pa),Math.log(pb),s))}}
  return P[P.length-1][1];
}
function updateUI(t){
  const y=yearAt(t),yr=Math.max(1,Math.round(Math.abs(y)));
  $('yn').textContent=yr;$('ye').textContent=y<0?'BC':'AD';
  const pv=popAt(y),q=pv>10000?100:10;
  $('popn').textContent=(Math.round(pv/q)*q).toLocaleString('en-US');
  let p=0;CFG.polities.forEach((pp,i)=>{if(y>=pp.from)p=i});
  if(p!==lastPol){$('crest').innerHTML=CFG.polities[p].svg;$('polname').textContent=CFG.polities[p].name;lastPol=p}
  const since=Math.abs(t-B(CFG.polities[p].from));
  $('polity').style.opacity=p===0?1:(0.25+0.75*clamp(since/0.5));
  let ci=CARDS.findIndex(c=>t<=c.t1);if(ci<0)ci=CARDS.length-1;
  const c=CARDS[ci];
  if(ci!==lastCard){$('title').textContent=c.title;$('sub').textContent=c.sub;lastCard=ci}
  const fin=clamp((t-c.t0)/0.45),fout=ci===CARDS.length-1?1:clamp((c.t1-t)/0.3);
  $('card').style.opacity=(ci===0?clamp((t-0.1)/0.5):fin)*fout;
  $('card').style.transform=`translateY(${(1-fin)*8}px)`;
}

/* ---------- frame ---------- */
export const hooks={update:[]};
export function start(fires){
  buildTerrain();buildClouds();buildInst();buildFire(fires||[]);
  window.renderFrame=function(t){
    t=clamp(t,0,DUR);
    if(CFG.marsh){const dr=smooth(marshDry0,marshDry1,t);marshPatches.forEach(m=>{m.position.y=lerp(0.45,-1.4,dr);m.visible=dr<0.995})}
    updateInst(t);updateFire(t);
    clouds.forEach((c,i)=>{c.g.position.x=((i*61-130+t*c.sp*3)%280+280)%280-140});
    for(const f of hooks.update)f(t);
    setCamera(t);updateUI(t);renderer.render(scene,camera);
  };
  document.fonts.ready.then(()=>{window.renderFrame(0);window.__ready=true});
}
