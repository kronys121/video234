import * as THREE from 'three';

const W = 1280, H = 720;
const DUR = 30;

/* ---------- utils ---------- */
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const rnd = mulberry(753);
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
function hash2(ix,iz){let h=Math.imul(ix,374761393)+Math.imul(iz,668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295}
function vnoise(x,z){const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);
  return lerp(lerp(hash2(ix,iz),hash2(ix+1,iz),u),lerp(hash2(ix,iz+1),hash2(ix+1,iz+1),u),v)}
function fbm(x,z){let s=0,a=.5,f=1;for(let i=0;i<4;i++){s+=a*vnoise(x*f,z*f);f*=2;a*=.5}return s}
const rotTo=(tx,tz)=>Math.atan2(-tz,tx);          // yaw that maps local +x onto (tx,tz)
const rotXZ=(x,z,ry)=>[x*Math.cos(ry)+z*Math.sin(ry),-x*Math.sin(ry)+z*Math.cos(ry)];
function kf(keys,t){
  let i=0;while(i<keys.length-2&&t>keys[i+1][0])i++;
  const [t0,v0]=keys[i],[t1,v1]=keys[i+1];
  const m0=i>0?(keys[i+1][1]-keys[i-1][1])/(keys[i+1][0]-keys[i-1][0]):(v1-v0)/(t1-t0);
  const m1=i+2<keys.length?(keys[i+2][1]-keys[i][1])/(keys[i+2][0]-keys[i][0]):(v1-v0)/(t1-t0);
  const h=t1-t0,s=clamp((t-t0)/h);
  return (2*s**3-3*s**2+1)*v0+(s**3-2*s**2+s)*h*m0+(-2*s**3+3*s**2)*v1+(s**3-s**2)*h*m1;
}

/* ---------- timeline ---------- */
const CARDS=[
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
];
function yearAt(t){
  if(t<=0)return CARDS[0].y0; if(t>=DUR)return CARDS[CARDS.length-1].y1;
  for(const c of CARDS) if(t<=c.t1) return lerp(c.y0,c.y1,(t-c.t0)/(c.t1-c.t0));
}
function B(y){ // time (s) at which the clock reaches year y
  if(y<=CARDS[0].y0)return 0;
  for(const c of CARDS) if(y<=c.y1) return lerp(c.t0,c.t1,(y-c.y0)/(c.y1-c.y0));
  return DUR;
}
const POP=[[-753,1000],[-700,2000],[-600,8000],[-509,25000],[-390,40000],[-312,80000],[-200,200000],[-146,300000],[-27,700000],[1,900000],[64,1000000],[126,1100000],[200,1000000],[275,800000],[330,700000],[395,500000],[410,400000],[455,150000],[476,80000]];
function popAt(y){
  for(let i=0;i<POP.length-1;i++){const [a,pa]=POP[i],[b,pb]=POP[i+1];
    if(y<=b){const s=clamp((y-a)/(b-a));return Math.exp(lerp(Math.log(pa),Math.log(pb),s))}}
  return POP[POP.length-1][1];
}
function polityAt(y){
  if(y<-509)return 0; if(y<-27)return 1; if(y<395)return 2; return 3;
}
const POLITY=[
 {name:"Kingdom of Rome",svg:`<svg viewBox="0 0 24 28"><path d="M2 2h20v14c0 6-5 9-10 11C7 25 2 22 2 16z" fill="#6a2c8f" stroke="#e9d6a1" stroke-width="1.4"/><polygon points="6,18 7,9 10,13 12,7 14,13 17,9 18,18" fill="#f0cf6a"/></svg>`},
 {name:"Roman Republic",svg:`<svg viewBox="0 0 24 28"><path d="M2 2h20v14c0 6-5 9-10 11C7 25 2 22 2 16z" fill="#a3221f" stroke="#e9d6a1" stroke-width="1.4"/><text x="12" y="17" text-anchor="middle" font-size="6.2" font-family="Cinzel,serif" font-weight="700" fill="#f0cf6a">SPQR</text></svg>`},
 {name:"Roman Empire",svg:`<svg viewBox="0 0 24 28"><path d="M2 2h20v14c0 6-5 9-10 11C7 25 2 22 2 16z" fill="#7a1d3e" stroke="#e9d6a1" stroke-width="1.4"/><path d="M12 6l-1.6 3L3.5 8l3.5 4-2 4 5-2 2.5 5 2.5-5 5 2-2-4 3.5-4-6.900 1z" fill="#f0cf6a"/></svg>`},
 {name:"Western Roman Empire",svg:`<svg viewBox="0 0 24 28"><path d="M2 2h20v14c0 6-5 9-10 11C7 25 2 22 2 16z" fill="#3d2a7a" stroke="#e9d6a1" stroke-width="1.4"/><path d="M12 6l-1.6 3L3.5 8l3.5 4-2 4 5-2 2.5 5 2.5-5 5 2-2-4 3.5-4-6.900 1z" fill="#f0cf6a"/></svg>`},
];

/* ---------- world layout ---------- */
const C=[2,6];                                 // city centre (rings, camera)
const xr=z=>-44+8*Math.sin(0.05*z+0.6)+0.004*z*z*0.3;   // Tiber centre line
const HILLS=[[-12,-4,4.6,5],[4,10,4.2,5.2],[-10,21,4.4,5],[19,18,3.8,5],[23,2,3.6,5.5],[12,-11,3.4,5],[3,-21,3.6,5]];
const MARSH=[[-4,4,3.4],[-2,16,2.9],[-24,-14,5.4]];     // x,z,sigma
const FLAT=[[14,3,10,15,1.15],[-12,-16,5,8,1.1],[14,29,7,11,1.1],[6,12,3.5,6,0]];  // x,z,r0,r1,height(0 = keep)
function marshAt(x,z){let m=0;for(const [mx,mz,s] of MARSH){const d2=(x-mx)**2+(z-mz)**2;m=Math.max(m,Math.exp(-d2/(2*s*s)))}return m}
function heightAt(x,z){
  let h=1.1+0.8*fbm(x*0.03+10,z*0.03);
  const d=Math.hypot(x-C[0],z-C[1]);
  h+=smooth(50,140,d)*(9*fbm(x*0.018+50,z*0.018+7));
  for(const [hx,hz,hh,s] of HILLS) h+=hh*Math.exp(-((x-hx)**2+(z-hz)**2)/(2*s*s));
  for(const [fx,fz,r0,r1,fh] of FLAT){ if(!fh)continue; const m=1-smooth(r0,r1,Math.hypot(x-fx,z-fz)); h=lerp(h,fh,m);}
  const dr=Math.abs(x-xr(z));
  h-=3.4*Math.exp(-((dr/4.4)**2));
  h=lerp(h,0.3,smooth(0.15,0.6,marshAt(x,z)));
  return h;
}
const riverDist=(x,z)=>Math.abs(x-xr(z));

/* ---------- renderer / scene ---------- */
const BG=new THREE.Color('#e9dcb9');
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setSize(W,H);renderer.setPixelRatio(1);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
document.getElementById('gl').appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=BG;scene.fog=new THREE.Fog(BG,170,430);
const camera=new THREE.PerspectiveCamera(32,W/H,1,900);

scene.add(new THREE.HemisphereLight(0xdfeeff,0x7a8a46,1.15));
const sun=new THREE.DirectionalLight(0xffe0ae,3.0);
sun.position.set(-70,62,45);sun.castShadow=true;
sun.shadow.mapSize.set(3072,3072);
Object.assign(sun.shadow.camera,{left:-70,right:70,top:70,bottom:-70,near:10,far:260});
sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.05;
scene.add(sun);scene.add(sun.target);
const fireLight=new THREE.PointLight(0xff7a22,0,90,1.6);scene.add(fireLight);

/* terrain */
{
  const g=new THREE.PlaneGeometry(340,340,212,212);g.rotateX(-Math.PI/2);
  const p=g.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color();
  const grassLow=new THREE.Color('#7fa83c'),grassHi=new THREE.Color('#5d9a35'),dry=new THREE.Color('#a3a554'),mud=new THREE.Color('#6d7a3c'),sand=new THREE.Color('#c9b878'),rock=new THREE.Color('#8a9460');
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),z=p.getZ(i),h=heightAt(x,z);p.setY(i,h);
    const n=fbm(x*0.12,z*0.12);
    c.copy(grassLow).lerp(grassHi,clamp((h-1)/3)).lerp(dry,clamp(n*1.3-0.35)*0.6);
    c.lerp(rock,smooth(6,10,h)*0.6);
    c.lerp(mud,smooth(0.25,0.7,marshAt(x,z)));
    c.lerp(sand,(1-smooth(0.5,1.4,h))*0.55*(riverDist(x,z)<8?1:0));
    c.offsetHSL((hash2(i,7)-0.5)*0.015,0,(hash2(i,3)-0.5)*0.05);
    col.set([c.r,c.g,c.b],i*3);
  }
  g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1}));
  m.receiveShadow=true;scene.add(m);
}
/* water */
const water=new THREE.Mesh(new THREE.PlaneGeometry(340,340).rotateX(-Math.PI/2),
  new THREE.MeshStandardMaterial({color:'#1d6aa5',roughness:0.28,metalness:0.0,flatShading:true}));
water.position.y=0.15;water.receiveShadow=true;scene.add(water);
const marshMat=new THREE.MeshStandardMaterial({color:'#4f8a86',roughness:0.4,flatShading:true});
const marshPatches=MARSH.map(([x,z,s])=>{const m=new THREE.Mesh(new THREE.CircleGeometry(s*1.35,20).rotateX(-Math.PI/2),marshMat);m.position.set(x,0.45,z);m.receiveShadow=true;scene.add(m);return m});
const marshDry0=B(-640),marshDry1=B(-585);

/* ---------- instanced "pop-in" meshes ---------- */
const matStd=new THREE.MeshStandardMaterial({flatShading:true,roughness:0.85});
const baseGeom=(g)=>{g.translate(0,0.5,0);return g};
const GEOM={
  box:baseGeom(new THREE.BoxGeometry(1,1,1)),
  roof:(()=>{const g=new THREE.ConeGeometry(0.72,1,4);g.rotateY(Math.PI/4);g.translate(0,0.5,0);return g})(),
  cyl:baseGeom(new THREE.CylinderGeometry(0.5,0.5,1,14)),
  cone:baseGeom(new THREE.ConeGeometry(0.5,1,6)),
  dome:(()=>{const g=new THREE.SphereGeometry(0.5,18,9,0,Math.PI*2,0,Math.PI/2);return g})(),
};
const growth=u=>{if(u<=0)return 0;if(u>=1)return 1;const c1=1.3,c3=c1+1;return 1+c3*Math.pow(u-1,3)+c1*Math.pow(u-1,2)};
function scaleAt(it,t){
  if(t<it.d)return growth((t-it.b)/it.dur);
  if(it.r!=null&&t>=it.r)return growth((t-it.r)/it.dur);
  return 1-clamp((t-it.d)/0.35);
}
const INST={};
for(const k of Object.keys(GEOM)) INST[k]=[];
const NO=Infinity;
function add(k,x,y,z,ry,sx,sy,sz,col,b,o={}){
  const it={x,y,z,ry,sx,sy,sz,col:new THREE.Color(col),b,d:o.d??NO,r:o.r??null,dur:o.dur??0.7};
  INST[k].push(it);return it;
}
const dummy=new THREE.Object3D();
const meshes={};
function buildInst(){
  for(const k of Object.keys(GEOM)){
    const items=INST[k];
    const m=new THREE.InstancedMesh(GEOM[k],matStd,Math.max(1,items.length));
    items.forEach((it,i)=>m.setColorAt(i,it.col));
    m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;
    scene.add(m);meshes[k]=m;
  }
}
function updateInst(t){
  for(const k of Object.keys(GEOM)){
    const items=INST[k],m=meshes[k];
    for(let i=0;i<items.length;i++){
      const it=items[i],s=scaleAt(it,t);
      dummy.position.set(it.x,it.y,it.z);dummy.rotation.set(0,it.ry,0);
      const e=s<0.002?0:s;
      dummy.scale.set(it.sx*e,it.sy*e,it.sz*e);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);
    }
    m.instanceMatrix.needsUpdate=true;
  }
}

/* ---------- palette ---------- */
const jit=(hex,a=0.03)=>{const c=new THREE.Color(hex);c.offsetHSL((rnd()-0.5)*a,(rnd()-0.5)*0.1,(rnd()-0.5)*0.08);return c};
const WALLS=['#efe3c6','#e3c9a0','#ead2a8','#d9b58a','#f0dfbd'];
const ROOFS=['#c8502f','#b9452b','#d0613a','#a8412a'];
const STONE='#e7dcc1',MARBLE='#f2ecde',TRAV='#e3d2a5';

/* ---------- monuments ---------- */
const forumPlaza={x:-3,z:3,hw:6.5,hd:4.3};
const BLOCK=[]; // circles x,z,r
const ellipseBlocks=[];
function temple(x,z,w,d,year,ry=0,big=1){
  const h=heightAt(x,z),b=B(year);BLOCK.push([x,z,Math.max(w,d)*0.55+1.0]);
  add('box',x,h-0.7,z,ry,w+0.7,1.3,d+0.7,STONE,b,{dur:0.9});
  add('box',x,h+0.5,z,ry,w*0.72,1.5*big,d*0.72,jit('#e8ccaa'),b+0.15,{dur:0.9});
  const n=Math.max(3,Math.round(w/0.55));
  for(let i=0;i<n;i++){
    const lx=-w/2+0.2+(w-0.4)*i/(n-1),[ox,oz]=rotXZ(lx,d/2+0.1,ry);
    add('cyl',x+ox,h+0.5,z+oz,0,0.26,1.6*big,0.26,MARBLE,b+0.25,{dur:0.8});
    const [ox2,oz2]=rotXZ(lx,-d/2-0.1,ry);
    add('cyl',x+ox2,h+0.5,z+oz2,0,0.26,1.6*big,0.26,MARBLE,b+0.3,{dur:0.8});
  }
  add('roof',x,h+0.5+1.6*big,z,ry,(w+0.9)*1.0,0.95*big,(d+0.9)*1.0,jit(ROOFS[1]),b+0.45,{dur:0.9});
  return h;
}
// Forum
{
  const h=heightAt(forumPlaza.x,forumPlaza.z);
  add('box',forumPlaza.x,h+0.02,forumPlaza.z,0,forumPlaza.hw*2,0.18,forumPlaza.hd*2,'#d8cdb0',B(-580),{dur:1.2});
}
temple(-12,-4,3.4,2.8,-509,0.5,1.3);   // Capitoline Jupiter
temple(-6.5,1.0,2.2,1.7,-497,0.15);    // Saturn
temple(-0.6,6.6,2.2,1.6,-484,0.1);     // Castor
temple(4.6,2.6,4.6,1.7,-179,0.0,0.8);  // Basilica Aemilia
temple(-3.3,-1.6,4.6,1.7,-46,0.0,0.8); // Basilica Julia
temple(6,0.2,1.9,1.5,-141,0.2);        // later temple
temple(-8,-12,2.0,1.6,-100,0.3);
temple(-6,-8,2.6,2.0,-50,0.3);temple(1,-8,3.0,2.2,2,0.1);temple(9,-6.5,2.4,1.8,81,0.2);
temple(-17,7,2.4,1.8,-200,0.4);temple(10,9,2.2,1.7,121,-0.2);temple(-2,-13,3.2,2.2,112,0.0,1.1);
// Palatine palace
{
  const x=6,z=12,h=heightAt(x,z);BLOCK.push([x,z,5.2]);
  add('box',x,h-0.5,z,0.2,6.5,1.4,4.6,'#d9c9a0',B(-20),{dur:1.2});
  add('box',x,h+0.5,z,0.2,5.2,2.0,3.4,jit('#eadabb'),B(2),{dur:1.2});
  add('roof',x,h+2.5,z,0.2,5.8,1.0,4.0,'#b2442a',B(6),{dur:1.0});
  add('box',x+2.6,h+0.4,z-2.2,0.2,2.8,2.6,2.4,jit('#ecdcbd'),B(92),{dur:1.0});
  add('roof',x+2.6,h+3.0,z-2.2,0.2,3.2,1.1,2.8,'#b2442a',B(94),{dur:1.0});
}
// Circus Maximus
{
  const cx=-3,cz=15.5,a=7.2,bb=2.5,ry0=rotTo(0.58,0.81),h=heightAt(cx,cz)+0.0;
  ellipseBlocks.push({cx,cz,a:a+2.2,b:bb+2.2,ry0});
  add('cyl',cx,h+0.0,cz,ry0,2*a-0.5,0.14,2*bb-0.3,'#d8bf7f',B(-329),{dur:1.2});
  add('box',cx,h+0.1,cz,ry0,a*1.7,0.35,0.35,'#cfc2a0',B(-300),{dur:0.9});
  const N=36;
  for(let i=0;i<N;i++){
    const th=i/N*Math.PI*2,lx=(a+0.4)*Math.cos(th),lz=(bb+0.4)*Math.sin(th);
    const tx=-(a+0.4)*Math.sin(th),tz=(bb+0.4)*Math.cos(th),[wx,wz]=rotXZ(lx,lz,ry0),[wtx,wtz]=rotXZ(tx,tz,ry0);
    const len=Math.hypot(tx,tz)*(Math.PI*2/N)*1.12,ry=rotTo(wtx,wtz);
    add('box',cx+wx,heightAt(cx+wx,cz+wz)-0.2,cz+wz,ry,len,0.8,0.7,'#d9ccaa',B(-329)+i*0.02,{dur:0.8});
    add('box',cx+wx,heightAt(cx+wx,cz+wz)+0.4,cz+wz,ry,len,0.8,0.8,'#e6d9b8',B(-46)+i*0.015,{dur:0.8});
  }
}
// Colosseum
{
  const cx=14,cz=3,a=8.4,bb=7,h=1.15;BLOCK.push([cx,cz,9.6]);
  add('cyl',cx,h,cz,0.5,2*a-2.2,0.14,2*bb-2.2,'#8a7048',B(70),{dur:1});
  const N=52,y0=B(70),ry0=0.5;
  for(let tier=0;tier<4;tier++){
    for(let i=0;i<N;i++){
      const th=i/N*Math.PI*2,lx=a*Math.cos(th),lz=bb*Math.sin(th),tx=-a*Math.sin(th),tz=bb*Math.cos(th);
      const [wx,wz]=rotXZ(lx,lz,ry0),[wtx,wtz]=rotXZ(tx,tz,ry0),len=Math.hypot(tx,tz)*(Math.PI*2/N)*1.05,ry=rotTo(wtx,wtz);
      const b=y0+tier*0.45+(i/N)*0.55,y=h+tier*1.45-(tier===3?0:0);
      const hh=tier===3?1.1:1.5;
      add('box',cx+wx,y,cz+wz,ry,len,hh,1.15,tier===3?'#cdb98c':TRAV,b,{dur:0.8});
      if(tier<3 && i%1===0){const [ox,oz]=rotXZ(lx*1.0,lz*1.0,ry0);const nx=wx/Math.hypot(wx,wz)*0.0;
        add('box',cx+wx,y+0.3,cz+wz,ry,len*0.5,0.85,1.3,'#3a2a1c',b+0.05,{dur:0.8});}
    }
  }
}
// Pantheon
{
  const x=-12,z=-16,h=heightAt(x,z);BLOCK.push([x,z,5]);const b=B(118),ry=0.3;
  add('cyl',x,h,z,0,4.4,2.3,4.4,'#e1d0ab',b,{dur:1.2});
  add('dome',x,h+2.3,z,0,4.4,4.0,4.4,'#bdb9a8',b+0.6,{dur:1.3});
  const [px,pz]=rotXZ(0,3.0,ry);
  add('box',x+px,h-0.1,z+pz,ry,3.6,0.7,2.0,STONE,b+0.3,{dur:1});
  for(let i=0;i<6;i++){const [ox,oz]=rotXZ(-1.45+i*0.58,3.6,ry);add('cyl',x+ox,h+0.5,z+oz,0,0.3,1.9,0.3,MARBLE,b+0.9,{dur:0.8});}
  add('roof',x+px,h+2.35,z+pz,ry,4.0,0.9,2.4,'#9a5a3a',b+1.1,{dur:0.9});
}
// Baths of Caracalla
{
  const x=14,z=29,h=heightAt(x,z);BLOCK.push([x,z,7.5]);const b=B(212);
  add('box',x,h,z,0.1,9,1.7,6.5,'#e3cfa3',b,{dur:1.4});
  add('box',x,h+1.7,z,0.1,5.4,1.4,4.2,'#ead9b5',b+0.3,{dur:1.3});
  add('roof',x,h+3.1,z,0.1,5.8,1.0,4.6,'#a34a30',b+0.6,{dur:1.0});
  for(const [dx,dz] of [[-4.6,-3.4],[4.6,-3.4],[-4.6,3.4],[4.6,3.4]]) add('box',x+dx,h,z+dz,0.1,1.2,2.4,1.2,'#d9c498',b+0.5,{dur:1});
}
// aqueducts
function aqueduct(p0,p1,year,Ltop0,Ltop1){
  const b0=B(year),L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]),n=Math.round(L/1.5);
  const tx=(p1[0]-p0[0])/L,tz=(p1[1]-p0[1])/L,ry=rotTo(tx,tz);
  for(let i=0;i<=n;i++){
    const s=i/n,x=lerp(p0[0],p1[0],s),z=lerp(p0[1],p1[1],s),g=heightAt(x,z),top=lerp(Ltop0,Ltop1,s);
    const bt=b0+(1-s)*0.8;
    add('box',x,g-0.3,z,ry,0.7,Math.max(0.6,top-g+0.3),0.9,'#d9c9a2',bt,{dur:0.5});
    if(i<n){const x2=lerp(p0[0],p1[0],(i+0.5)/n),z2=lerp(p0[1],p1[1],(i+0.5)/n);
      add('box',x2,top-0.1,z2,ry,L/n*1.02,0.45,0.95,'#cdbd96',bt+0.05,{dur:0.5});}
  }
}
aqueduct([86,34],[24,22],-312,2.8,3.2);
aqueduct([90,-4],[26,-3],-272,3.3,3.6);
aqueduct([92,12],[26,9],-144,3.8,4.2);
aqueduct([94,-30],[26,-7],52,4.6,4.9);
BLOCK.push([34,22,2],[34,-3,2],[34,9,2],[34,-8,2]);
// bridges
function bridge(z,year,col){const xx=xr(z);add('box',xx,0.75,z,0,16,0.3,1.3,col,B(year),{dur:1.1});for(const dx of [-3.5,0,3.5]) add('box',xx+dx,0,z,0,0.8,0.8,0.9,'#b8a98a',B(year)+0.1,{dur:0.8});}
bridge(9,-621,'#8d6a43');bridge(-12,-179,'#d6c9a8');bridge(-1,-62,'#dcd0b0');
// city walls
function wall(R,year,spread,h,thick,color,towerCol){
  const N=Math.round(R*2.6),b0=B(year);
  for(let i=0;i<N;i++){
    const th=i/N*Math.PI*2,x=C[0]+R*Math.cos(th),z=C[1]+R*Math.sin(th);
    if(riverDist(x,z)<5.2||heightAt(x,z)<0.45)continue;
    const tx=-Math.sin(th),tz=Math.cos(th),len=R*Math.PI*2/N*1.08,ry=rotTo(tx,tz);
    const gy=heightAt(x,z);
    const b=b0+((th/(Math.PI*2)+0.25)%1)*spread;
    add('box',x,gy-0.4,z,ry,len,h+0.4,thick,color,b,{dur:0.7});
    if(i%6===0)add('box',x,gy-0.4,z,ry,thick*1.7,h+1.3,thick*1.7,towerCol,b+0.05,{dur:0.7});
  }
}
wall(26,-378,0.9,1.7,0.7,'#c9bb97','#b8a982');
wall(38,271,0.7,2.4,0.9,'#b9744e','#a4623f');
// ships on the Tiber
const boats=[];
for(let i=0;i<6;i++){
  const g=new THREE.Group(),hull=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.4,0.8),new THREE.MeshStandardMaterial({color:'#6b4a2a',flatShading:true}));
  hull.position.y=0.3;hull.castShadow=true;g.add(hull);
  const sail=new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.4),new THREE.MeshStandardMaterial({color:'#f4ead2',side:THREE.DoubleSide,flatShading:true}));
  sail.position.set(0,1.1,0);sail.rotation.y=Math.PI/2;sail.castShadow=true;g.add(sail);
  const mast=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,1.8),new THREE.MeshStandardMaterial({color:'#4a3320'}));mast.position.y=1.0;g.add(mast);
  scene.add(g);boats.push({g,off:i*40+rnd()*10,speed:1.1+rnd()*0.6,dir:i%2?1:-1,born:B(-700+i*55)});
}

/* ---------- houses ---------- */
const BUILT=[[-753,0],[-700,0.012],[-600,0.03],[-509,0.06],[-390,0.1],[-312,0.16],[-146,0.38],[-27,0.62],[64,0.84],[126,0.96],[200,1.0]];
function yearOfFrac(f){for(let i=0;i<BUILT.length-1;i++){const [y0,f0]=BUILT[i],[y1,f1]=BUILT[i+1];if(f<=f1)return lerp(y0,y1,(f-f0)/(f1-f0+1e-9))}return 200}
const FIRES=[
  {year:-390,x:-2,z:5,r:13,dur:1.8,rebuild:true},
  {year:64,x:-2,z:14,r:17,dur:2.0,rebuild:true},
  {year:398,x:12,z:-12,r:15,dur:1.6,rebuild:false,tstart:B(404)},
];
FIRES.forEach(f=>{f.t0=f.tstart??B(f.year)});
function blocked(x,z){
  if(Math.abs(x-forumPlaza.x)<forumPlaza.hw+0.6&&Math.abs(z-forumPlaza.z)<forumPlaza.hd+0.6)return true;
  for(const [bx,bz,r] of BLOCK) if((x-bx)**2+(z-bz)**2<r*r)return true;
  for(const e of ellipseBlocks){const [lx,lz]=rotXZ(x-e.cx,z-e.cz,-e.ry0);if((lx/e.a)**2+(lz/e.b)**2<1)return true;}
  return false;
}
const houses=[];
{
  const cand=[],step=1.95,P=[2,9];
  for(let x=-44;x<=50;x+=step)for(let z=-38;z<=52;z+=step){
    const px=x+(rnd()-0.5)*1.1,pz=z+(rnd()-0.5)*1.1;
    if(rnd()<0.12)continue;
    const dc=Math.hypot(px-C[0],pz-C[1]);
    if(dc>35.5)continue;
    if(riverDist(px,pz)<4.6)continue;
    if(Math.abs(dc-26)<1.4||Math.abs(dc-38)<1.4)continue;
    if(blocked(px,pz))continue;
    const h=heightAt(px,pz);if(h<0.5)continue;
    const mf=marshAt(px,pz);
    let score=Math.hypot(px-P[0],pz-P[1])+(rnd()-0.5)*5+(mf>0.12?8:0);
    // aqueduct corridor clearance is approximate: nothing inside the city touches them
    cand.push({px,pz,h,score,mf});
  }
  cand.sort((a,b)=>a.score-b.score);
  const N=cand.length;
  cand.forEach((c,i)=>{
    const frac=(i+0.5)/N,year=yearOfFrac(frac),b=B(year);
    const early=year<-400,imperial=year>-60&&Math.hypot(c.px-(-1),c.pz-4)<20;
    const w=early?1.35+rnd()*0.4:1.2+rnd()*0.45,d=early?1.35+rnd()*0.3:1.2+rnd()*0.4;
    const hh=early?0.75+rnd()*0.25:(imperial?1.5+rnd()*1.8:0.95+rnd()*0.7);
    const ry=Math.floor(rnd()*4)*Math.PI/2*0+Math.atan2(c.pz-C[1],c.px-C[0])+(rnd()-0.5)*0.5;
    const wallCol=early?jit('#a98c60'):jit(WALLS[Math.floor(rnd()*WALLS.length)]);
    const roofCol=early?jit('#a8863e',0.05):jit(ROOFS[Math.floor(rnd()*ROOFS.length)]);
    const o={dur:0.55+rnd()*0.3};
    // fire / sack
    for(const f of FIRES){
      const dd=Math.hypot(c.px-f.x,c.pz-f.z);
      if(dd<f.r*(0.55+0.45*rnd())&&rnd()<0.8&&b<f.t0){
        o.d=f.t0+(dd/f.r)*f.dur*0.7;o.r=f.rebuild?f.t0+f.dur+0.6+rnd()*2.4:null;break;
      }
    }
    // decline: outer houses are abandoned in the last century
    if(o.d===undefined&&frac>0.35&&rnd()<0.75){o.d=B(405)+rnd()*(B(476)-B(405));o.r=null;}
    const hs=add('box',c.px,c.h-0.2,c.pz,ry,w,hh+0.2,d,wallCol,b,o);
    const roofH=early?0.95:0.6+rnd()*0.2;
    add('roof',c.px,c.h-0.2+hh+0.2,c.pz,ry,w*(early?1.0:1.2),roofH,d*(early?1.0:1.2),roofCol,b+0.1,o);
    houses.push({x:c.px,z:c.pz,b});
  });
}
/* trees */
{
  const trunk='#6d4a2a',greens=['#2f6d2b','#3a7b2c','#2a5f2a','#4a8a30'];
  const res=[];let tries=0;
  while(res.length<1100&&tries<9000){tries++;
    const x=C[0]+(rnd()-0.5)*220,z=C[1]+(rnd()-0.5)*220;
    const dc=Math.hypot(x-C[0],z-C[1]);
    if(dc<35&&rnd()<0.25)continue;
    const h=heightAt(x,z);if(h<0.55||riverDist(x,z)<4.2||marshAt(x,z)>0.25)continue;
    if(blocked(x,z))continue;
    if(Math.abs(dc-26)<1||Math.abs(dc-38)<1)continue;
    res.push([x,z,h]);
  }
  for(const [x,z,h] of res){
    let d=NO;
    for(const hs of houses){if((hs.x-x)**2+(hs.z-z)**2<2.6){d=Math.min(d,hs.b-0.2);}}
    if(d<0.3)continue;
    const s=0.8+rnd()*0.9,gc=jit(greens[Math.floor(rnd()*greens.length)],0.04);
    const it1=add('cyl',x,h-0.1,z,0,0.2*s,0.7*s,0.2*s,trunk,-10,{d});
    add('cone',x,h+0.4*s,z,0,1.1*s,2.1*s,1.1*s,gc,-10,{d});
    add('cone',x,h+1.3*s,z,0,0.8*s,1.6*s,0.8*s,gc,-10,{d});
  }
}
/* clouds */
const clouds=[];
{
  const mat=new THREE.MeshStandardMaterial({color:'#ffffff',flatShading:true,roughness:1,emissive:'#6a6a6a'});
  for(let i=0;i<9;i++){
    const g=new THREE.Group();
    for(let j=0;j<5;j++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(4+rnd()*3,1),mat);m.position.set((j-2)*4.5,rnd()*2,(rnd()-0.5)*3);m.scale.y=0.55;g.add(m)}
    g.position.set((rnd()-0.5)*260,95+rnd()*20,(rnd()-0.5)*200);scene.add(g);clouds.push({g,sp:0.5+rnd()*0.8});
  }
}
buildInst();

/* ---------- fire & smoke ---------- */
const smokeGeom=new THREE.IcosahedronGeometry(0.5,1);
const NS=46,NF=34;
const smoke=new THREE.InstancedMesh(smokeGeom,new THREE.MeshStandardMaterial({flatShading:true,roughness:1}),NS*FIRES.length);
const flames=new THREE.InstancedMesh(GEOM.cone,new THREE.MeshBasicMaterial({color:'#ffffff'}),NF*FIRES.length);
smoke.frustumCulled=flames.frustumCulled=false;smoke.castShadow=false;
scene.add(smoke,flames);
const cOr=new THREE.Color('#ff7a1c'),cYe=new THREE.Color('#ffc43a'),cGr=new THREE.Color('#5a534d'),cG2=new THREE.Color('#9a928a'),tmpC=new THREE.Color();
function updateFire(t){
  let light=0,lx=0,lz=0;
  FIRES.forEach((f,fi)=>{
    const I=smooth(f.t0,f.t0+0.4,t)*(1-smooth(f.t0+f.dur,f.t0+f.dur+1.6,t));
    const sm=smooth(f.t0,f.t0+0.4,t)*(1-smooth(f.t0+f.dur+0.4,f.t0+f.dur+3.0,t));
    if(I>light){light=I;lx=f.x;lz=f.z}
    for(let j=0;j<NS;j++){
      const i=fi*NS+j,ph=((t*0.5+j*0.618)%1),a=hash2(j,11+fi)*Math.PI*2,rr=hash2(j,5+fi)*f.r*0.6;
      const x=f.x+Math.cos(a)*rr+ph*3*Math.sin(j),z=f.z+Math.sin(a)*rr+ph*2,g=heightAt(f.x+Math.cos(a)*rr,f.z+Math.sin(a)*rr);
      const s=(0.9+ph*2.8)*sm*(1-smooth(0.7,1,ph))*(0.7+0.5*hash2(j,2));
      dummy.position.set(x,g+1.2+ph*17,z);dummy.rotation.set(0,0,0);dummy.scale.setScalar(Math.max(0.0001,s));dummy.updateMatrix();
      smoke.setMatrixAt(i,dummy.matrix);
      tmpC.copy(cGr).lerp(cG2,smooth(0.1,0.9,ph));if(ph<0.12)tmpC.lerp(cOr,1-ph/0.12);smoke.setColorAt(i,tmpC);
    }
    for(let j=0;j<NF;j++){
      const i=fi*NF+j,a=hash2(j,31+fi)*Math.PI*2,rr=Math.sqrt(hash2(j,17+fi))*f.r*0.55;
      const x=f.x+Math.cos(a)*rr,z=f.z+Math.sin(a)*rr,g=heightAt(x,z);
      const fl=(0.65+0.45*Math.sin(t*15+j*1.9))*I*(1.2+hash2(j,9)*1.4);
      dummy.position.set(x,g+0.6,z);dummy.rotation.set(0,0,0);dummy.scale.set(0.9*fl+0.0001,2.4*fl+0.0001,0.9*fl+0.0001);dummy.updateMatrix();
      flames.setMatrixAt(i,dummy.matrix);tmpC.copy(cOr).lerp(cYe,0.5+0.5*Math.sin(t*9+j));flames.setColorAt(i,tmpC);
    }
  });
  smoke.instanceMatrix.needsUpdate=flames.instanceMatrix.needsUpdate=true;
  if(smoke.instanceColor)smoke.instanceColor.needsUpdate=true;if(flames.instanceColor)flames.instanceColor.needsUpdate=true;
  fireLight.intensity=light*900;fireLight.position.set(lx,5,lz);
}

/* ---------- camera ---------- */
const K={
  dist:[[0,132],[4,104],[9,78],[14,68],[19,74],[25,88],[30,100]],
  elev:[[0,26],[6,32],[16,37],[30,44]],
  az:[[0,-34],[15,-8],[30,22]],
  tx:[[0,2],[10,2],[30,3]],
  tz:[[0,9],[10,7],[30,7]],
};
function setCamera(t){
  const d=kf(K.dist,t),el=kf(K.elev,t)*Math.PI/180,az=kf(K.az,t)*Math.PI/180,tx=kf(K.tx,t),tz=kf(K.tz,t),ty=1.6;
  camera.position.set(tx+d*Math.cos(el)*Math.sin(az),ty+d*Math.sin(el),tz+d*Math.cos(el)*Math.cos(az));
  camera.lookAt(tx,ty,tz);
  sun.target.position.set(tx,0,tz);sun.position.set(tx-70,62,tz+45);
}

/* ---------- UI ---------- */
const $=id=>document.getElementById(id);
const ui={crest:$('crest'),pol:$('polname'),pop:$('popn'),yn:$('yn'),ye:$('ye'),title:$('title'),sub:$('sub'),card:$('card'),polity:$('polity')};
let lastPol=-1,lastCard=-1;
function updateUI(t){
  const y=yearAt(t);
  const yr=Math.max(1,Math.round(Math.abs(y)));
  ui.yn.textContent=yr;ui.ye.textContent=y<0?'BC':'AD';
  ui.pop.textContent=(Math.round(popAt(y)/(popAt(y)>10000?100:10))*(popAt(y)>10000?100:10)).toLocaleString('en-US');
  const p=polityAt(y);
  if(p!==lastPol){ui.crest.innerHTML=POLITY[p].svg;ui.pol.textContent=POLITY[p].name;lastPol=p}
  const pf=Math.min(1,Math.abs(t-B(p===1?-509:p===2?-27:p===3?395:-753))/0.5);
  ui.polity.style.opacity=p===0?1:(0.25+0.75*clamp(pf));
  let ci=CARDS.findIndex(c=>t<=c.t1);if(ci<0)ci=CARDS.length-1;
  const c=CARDS[ci];
  if(ci!==lastCard){ui.title.textContent=c.title;ui.sub.textContent=c.sub;lastCard=ci}
  const a=clamp((t-c.t0)/0.45)*clamp((c.t1-t)/0.3+ (ci===CARDS.length-1?9:0));
  ui.card.style.opacity=ci===0?Math.min(1,clamp((t-0.1)/0.5)):a;
  ui.card.style.transform=`translateY(${(1-clamp((t-c.t0)/0.45))*8}px)`;
}

/* ---------- frame ---------- */
window.renderFrame=function(t){
  t=clamp(t,0,DUR);
  const y=yearAt(t);
  // marsh drains under the Cloaca Maxima
  const dr=smooth(marshDry0,marshDry1,t);
  marshPatches.forEach(m=>{m.position.y=lerp(0.45,-1.4,dr);m.visible=dr<0.995});
  updateInst(t);updateFire(t);
  for(const b of boats){
    const gz=((b.off+t*b.speed*b.dir*3)%240+240)%240-120,gx=xr(gz);
    const gz2=gz+b.dir,dx=xr(gz2)-gx;
    b.g.position.set(gx+Math.sin(t*1.3+b.off)*0.4,0.15,gz);b.g.rotation.y=Math.atan2(dx,b.dir)+Math.PI/2*0+Math.PI/2;
    b.g.visible=t>b.born;
    b.g.scale.setScalar(clamp((t-b.born)/0.5));
  }
  clouds.forEach(c=>{c.g.position.x=((c.g.position.x+130+0.0)%260)-130+c.sp*0.0;c.g.position.x+=0});
  clouds.forEach((c,i)=>{c.g.position.x=((i*61-130+t*c.sp*3)%280+280)%280-140});
  setCamera(t);updateUI(t);
  renderer.render(scene,camera);
};
document.fonts.ready.then(()=>{window.renderFrame(0);window.__ready=true});
window.__dbg=()=>({n:houses.length,inner:houses.filter(h=>Math.hypot(h.x+1,h.z-5)<12).length,pts:houses.filter(h=>h.b<17).map(h=>[Math.round(h.x),Math.round(h.z)]).slice(0,400).length,
 minmax:[Math.min(...houses.map(h=>h.x)),Math.max(...houses.map(h=>h.x)),Math.min(...houses.map(h=>h.z)),Math.max(...houses.map(h=>h.z))]});
