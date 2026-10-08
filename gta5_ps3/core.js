
// ---------- palette ----------
const PUR='#1b1340',PUR2='#2a1d68',YEL='#ffcb3d',YELd='#c79a1d',PINK='#ff5d73',PINKd='#c23a52',GRN='#3ddc97',GRNd='#1fa06b',CY='#4cc9f0',CYd='#2a8fb3',WHT='#ffffff';
const DUR=584.5;
// ---------- math ----------
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const P=(t,a,d)=>clamp((t-a)/d);
const lerp=(a,b,k)=>a+(b-a)*k;
const E={outCubic:x=>1-Math.pow(1-x,3),inCubic:x=>x*x*x,inOut:x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,
 outBack:x=>{const c1=1.9,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)},
 outElastic:x=>x<=0?0:x>=1?1:Math.pow(2,-10*x)*Math.sin((x*10-.75)*(2*Math.PI)/3)+1};
const fr=x=>x-Math.floor(x);
const rnd=(i,k)=>fr(Math.sin(i*127.1+k*311.7)*43758.5453);
// ---------- dom helpers ----------
const cam=document.getElementById('cam');
function div(parent,css,html=''){const d=document.createElement('div');d.style.cssText=css;d.innerHTML=html;parent.appendChild(d);return d}
function ab(parent,css,html=''){const d=div(parent,css,html);d.classList.add('abs');return d}
function tf(el,o){const{x=0,y=0,s=1,sx=null,sy=null,r=0,o:op=1,ax=.5,ay=.5}=o;
 el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(${-ax*100}%,${-ay*100}%) rotate(${r.toFixed(2)}deg) scale(${(sx??s).toFixed(3)},${(sy??s).toFixed(3)})`;el.style.opacity=op}
function row(parent,x,y,size,items,ax=0,col=WHT){
 const el=document.createElement('div');el.className='row';el.style.fontSize=size+'px';el.style.color=col;
 const spans=items.map(it=>{const s=document.createElement('span');s.textContent=it[0];if(it[2])s.style.color=it[2];if(it[3])s.style.fontSize=it[3]+'px';el.appendChild(s);return{el:s,a:it[1]}});
 parent.appendChild(el);return{el,spans,x,y,ax}}
function rowUpd(R,t,o={}){tf(R.el,{x:R.x,y:R.y,ax:R.ax,o:o.o??1,s:o.s??1,sx:o.sx,r:o.r??0});
 R.spans.forEach(sp=>{const k=E.outBack(P(t,sp.a,.34)),p=E.outCubic(P(t,sp.a,.38));
  sp.el.style.opacity=t>=sp.a?1:0;
  sp.el.style.transform=`translateY(${((1-p)*70).toFixed(1)}px) rotate(${((1-p)*-6).toFixed(2)}deg) scale(${(.3+.7*k).toFixed(3)})`})}
const imgPS3=()=>{const i=new Image();i.src='assets/ps3.png';i.style.cssText='height:100%;display:block';return i};
const imgCover=()=>{const i=new Image();i.src='assets/cover.jpg';i.style.cssText='height:100%;display:block';return i};
function psBox(parent,h){const w=h*523/832;const d=ab(parent,`width:${w}px;height:${h}px`);
 const sh=div(d,`position:absolute;left:8%;right:-6%;bottom:-3%;height:5%;background:rgba(0,0,0,.28);border-radius:50%`);d.appendChild(imgPS3());return d}
function coverBox(parent,h,rad=22){const w=h*634/795;const d=ab(parent,`width:${w}px;height:${h}px;border-radius:${rad}px;overflow:hidden;box-shadow:0 16px 0 rgba(0,0,0,.30)`);d.appendChild(imgCover());return d}
// decorative circles
function bgCircles(sc,color,seed=0){const cs=[[300,-260,-240],[820,1700,1180],[420,1500,-120]].map(([r,x,y],i)=>div(sc,`position:absolute;width:${r*2}px;height:${r*2}px;border-radius:50%;background:${color};left:${x-r}px;top:${y-r}px`));
 return t=>cs.forEach((c,i)=>{c.style.transform=`translate(${Math.sin(t*.6+i+seed)*40}px,${Math.cos(t*.5+i*2+seed)*30}px)`})}
function star(n,r1,r2){const p=[];for(let i=0;i<n*2;i++){const a=i*Math.PI/n-Math.PI/2,r=i%2?r2:r1;p.push((50+Math.cos(a)*r).toFixed(1)+'% '+(50+Math.sin(a)*r).toFixed(1)+'%')}return`polygon(${p.join(',')})`}
const BOLT='polygon(40% 0,100% 0,60% 42%,100% 42%,18% 100%,42% 55%,0 55%)';
function chipEl(parent,label='CELL',inner=YEL){
 const root=ab(parent,'width:500px;height:500px');
 const pins=(css)=>div(root,`position:absolute;${css};background:${YEL}`);
 const mk=(css,grad)=>div(root,`position:absolute;${css};background:${grad}`);
 mk('left:100px;top:2px;width:300px;height:50px',`repeating-linear-gradient(90deg,${YEL} 0 22px,transparent 22px 50px)`);
 mk('left:100px;bottom:2px;width:300px;height:50px',`repeating-linear-gradient(90deg,${YEL} 0 22px,transparent 22px 50px)`);
 mk('left:2px;top:100px;width:50px;height:300px',`repeating-linear-gradient(0deg,${YEL} 0 22px,transparent 22px 50px)`);
 mk('right:2px;top:100px;width:50px;height:300px',`repeating-linear-gradient(0deg,${YEL} 0 22px,transparent 22px 50px)`);
 div(root,`position:absolute;left:60px;top:60px;width:380px;height:380px;border-radius:46px;background:${PUR};box-shadow:0 16px 0 #0d0830`);
 div(root,`position:absolute;left:125px;top:125px;width:250px;height:250px;border-radius:28px;background:${inner};display:flex;align-items:center;justify-content:center;font-size:84px;color:${PUR};letter-spacing:-.03em`,label);
 return root}
function discEl(parent,color,size=220){return ab(parent,`width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle,${PUR} 0 13%,#e9e4ff 14% 20%,${color} 21% 100%);box-shadow:0 12px 0 rgba(0,0,0,.28)`)}
function gearEl(parent,size,color,bg){return ab(parent,`width:${size}px;height:${size}px;border-radius:50%;border:${size*.17}px dashed ${color};background:radial-gradient(circle,${bg} 0 26%,${color} 27% 60%,transparent 61%)`)}
function confetti(parent,n,cols,seed){return Array.from({length:n},(_,i)=>{const w=18+rnd(i,seed+1)*22,h=w*(.5+rnd(i,seed+2)*.8);
 return{el:ab(parent,`width:${w}px;height:${h}px;background:${cols[i%cols.length]};border-radius:${rnd(i,seed+3)>.6?'50%':'4px'}`),i,seed}})}
function confUpd(C,t,t0,ox,oy,spd=1){C.forEach(c=>{const tau=t-t0;if(tau<0||tau>1.7){c.el.style.opacity=0;return}
 const a=rnd(c.i,c.seed+4)*Math.PI*2,v=(420+rnd(c.i,c.seed+5)*1000)*spd;
 const x=ox+Math.cos(a)*v*tau,y=oy+Math.sin(a)*v*tau+.5*1800*tau*tau;
 tf(c.el,{x,y,r:rnd(c.i,c.seed+6)*360+tau*(300+rnd(c.i,c.seed+7)*500),o:1-P(tau,1.1,.6)})})}


const pend=[];window.__p=pend;
function clip(parent,dir,n,css){const im=new Image();im.style.cssText='position:absolute;'+css;parent.appendChild(im);return{im,dir,n,cur:-1}}
function clipSet(c,t,t0,fps=30){let k=Math.round((t-t0)*fps)+1;k=Math.max(1,Math.min(c.n,k));if(k!==c.cur){c.cur=k;c.im.src=`clips/${c.dir}/${String(k).padStart(4,'0')}.jpg`;pend.push(c.im.decode().catch(()=>{}))}}
function cvr(parent,h,src,ar,rad=22){const w=h*ar;const d=ab(parent,`width:${w}px;height:${h}px;border-radius:${rad}px;overflow:hidden;box-shadow:0 16px 0 rgba(0,0,0,.30)`);const i=new Image();i.src=src;i.style.cssText='height:100%;width:100%;display:block';d.appendChild(i);return d}
const AR4=576/665,AR5=634/795;
function lerpC(c1,c2,k){const a=c1.match(/\w\w/g).map(h=>parseInt(h,16)),b=c2.match(/\w\w/g).map(h=>parseInt(h,16));return`rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*k)).join(',')})`}

// ---------- scenes ----------
const scenes=[];
function scene(t0,t1,bg,circ,build){const el=div(cam,`position:absolute;inset:0;background:${bg}`);el.classList.add('sc');
 const cu=bgCircles(el,circ,scenes.length*1.3);const up=build(el);scenes.push({t0,t1,el,update:t=>{cu(t);up(t)}})}

// ===== S1a : hook words + cover + PS3 over gameplay =====
scene(0,3.24,PUR,PUR2,sc=>{
 const vc=clip(sc,'driveA',99,'left:0;top:0;width:1920px;height:1080px');
 div(sc,'position:absolute;inset:0;background:rgba(27,19,64,.80)');
 const R=[row(sc,110,150,130,[['САМАЯ',0]],0),row(sc,110,290,130,[['ПОПУЛЯРНАЯ',.48,YEL]],0),
  row(sc,110,430,130,[['ИГРА',1.16],['В',1.32]],0),row(sc,110,590,160,[['ИСТОРИИ',1.48,PINK]],0),
  row(sc,110,740,84,[['РАБОТАЕТ',2.0,'#b9aef5'],['НА',2.52,'#b9aef5']],0),row(sc,110,860,130,[['КОНСОЛИ',2.64,CY]],0)];
 const disc=ab(sc,`width:760px;height:760px;border-radius:50%;background:${YEL}`);
 const cover=cvr(sc,580,'assets/cover5.jpg',AR5);const ps=psBox(sc,560);
 return t=>{clipSet(vc,t,0);R.forEach(r=>rowUpd(r,t));
  const kd=E.outBack(P(t,1.0,.5));tf(disc,{x:1480,y:540,s:kd,o:t>=1.0?1:0});
  const kc=E.outCubic(P(t,1.16,.55));tf(cover,{x:lerp(2350,1400,kc),y:390+Math.sin(t*3)*8,r:lerp(16,-5,E.outBack(P(t,1.16,.7))),o:t>=1.16?1:0});
  const kp=E.outBack(P(t,2.64,.5));tf(ps,{x:1660,y:lerp(1200,700,E.outCubic(P(t,2.64,.5))),s:.6+.4*kp,r:lerp(10,3,kp),o:t>=2.64?1:0})}});

// ===== S1b : memory vs video =====
scene(3.24,7.94,PINK,'#ff7a8c',sc=>{
 const ps=psBox(sc,480);
 const mem=ab(sc,`width:580px;height:230px;border-radius:44px;background:${GRN};box-shadow:0 14px 0 ${GRNd};display:flex;flex-direction:column;align-items:center;justify-content:center;color:#073b2a`,
  `<div style="font-size:36px;font-weight:800;letter-spacing:.06em">ПАМЯТЬ PS3</div><div style="font-size:78px;letter-spacing:-.02em;margin-top:6px">256 + 256 МБ</div>`);
 const phone=ab(sc,`width:330px;height:640px;border-radius:58px;background:${PUR};box-shadow:0 16px 0 #0d0830;padding:18px`);
 const scr=div(phone,`position:relative;width:100%;height:100%;border-radius:42px;overflow:hidden;background:${CY}`);
 div(scr,`position:absolute;left:150px;top:90px;width:110px;height:110px;border-radius:50%;background:${YEL}`);
 div(scr,`position:absolute;left:-60px;top:330px;width:300px;height:300px;border-radius:50%;background:${GRN}`);
 div(scr,`position:absolute;left:120px;top:380px;width:340px;height:340px;border-radius:50%;background:${GRNd}`);
 div(scr,`position:absolute;left:96px;top:236px;width:108px;height:108px;border-radius:50%;background:rgba(255,255,255,.92);display:flex;align-items:center;justify-content:center`,`<div style="width:0;height:0;border-left:38px solid ${PUR};border-top:24px solid transparent;border-bottom:24px solid transparent;margin-left:10px"></div>`);
 div(scr,`position:absolute;right:16px;top:16px;background:${YEL};color:${PUR};border-radius:14px;padding:4px 14px;font-size:30px`,'4K');
 const vid=ab(sc,`width:900px;height:300px;border-radius:50px;background:${YEL};box-shadow:0 16px 0 ${YELd};display:flex;align-items:center;justify-content:center;gap:34px;color:${PUR}`,
  `<div style="width:130px;height:130px;border-radius:50%;background:${PUR};display:flex;align-items:center;justify-content:center"><div style="width:0;height:0;border-left:46px solid ${YEL};border-top:30px solid transparent;border-bottom:30px solid transparent;margin-left:12px"></div></div><div style="font-size:150px;letter-spacing:-.04em">10 СЕК</div><div style="background:${PUR};color:${YEL};border-radius:22px;padding:6px 26px;font-size:76px">4K</div>`);
 const stamp=ab(sc,`border:14px solid ${YEL};background:${PUR};color:${YEL};border-radius:30px;padding:10px 44px;font-size:124px;letter-spacing:-.02em;white-space:nowrap`,'НЕ ВЛЕЗАЕТ');
 return t=>{
  tf(ps,{x:lerp(-400,270,E.outCubic(P(t,3.4,.5))),y:640,r:-6,o:t>=3.4?1:0});
  const k=E.outElastic(P(t,3.68,.7));const wob=t>4.16&&t<6.3?Math.sin(t*46)*(.6+(t-4.16)*1.2):0;
  const sq=P(t,6.2,.25);
  tf(mem,{x:lerp(930,760,E.outCubic(sq)),y:lerp(320,300,sq),s:t>=3.68?k:0,sy:undefined,r:wob+(t>6.2?-3*sq:0),o:t>=3.68?1:0,sx:(t>=3.68?k:0)*(1-.12*sq)});
  const kph=E.outBack(P(t,5.28,.55));tf(phone,{x:1560,y:lerp(1500,600,E.outCubic(P(t,5.28,.55))),r:lerp(12,-4,kph),o:t>=5.28?1:0});
  const kv=E.outBack(P(t,6.16,.5));const vp=E.outCubic(P(t,6.16,.45));
  tf(vid,{x:lerp(1560,930,vp),y:lerp(600,760,vp),s:.15+.85*kv,r:lerp(-14,0,vp),o:t>=6.16?1:0});
  const ks=E.outBack(P(t,6.96,.3));tf(stamp,{x:930,y:520,s:t>=6.96?.4+.6*ks:0,r:-8+ (1-ks)*14,o:t>=6.96?1:0})}});

// ===== S1c : "Как такое вообще возможно?" =====
scene(7.94,10.1,YEL,'#ffd86b',sc=>{
 const q=ab(sc,`font-size:760px;line-height:1;color:${PINK}`,'?');
 const card=ab(sc,`width:560px;height:315px;border-radius:30px;overflow:hidden;border:10px solid ${WHT};box-shadow:0 18px 0 rgba(0,0,0,.28);background:#000`);
 const vc=clip(card,'sw',70,'left:0;top:0;width:100%;height:100%;object-fit:cover');
 const R=[row(sc,110,290,205,[['КАК',8.08,PUR],['ТАКОЕ',8.32,PUR]],0),row(sc,110,530,205,[['ВООБЩЕ',8.72,PUR]],0),row(sc,110,770,205,[['ВОЗМОЖНО?',9.24,PINKd]],0)];
 return t=>{clipSet(vc,t,7.94);
  const kq=E.outElastic(P(t,8.08,.9));const pulse=t>=9.24?1+.14*Math.exp(-(t-9.24)*7):1;
  tf(q,{x:1690,y:290,s:(t>=8.08?.2+.8*kq:0)*pulse,r:-10+Math.sin(t*2.4)*5,o:t>=8.08?1:0});
  const kc=E.outBack(P(t,8.5,.55));tf(card,{x:1630,y:lerp(1400,740,E.outCubic(P(t,8.5,.55))),r:lerp(10,-4,kc),s:.6+.4*kc,o:t>=8.5?1:0});
  R.forEach(r=>rowUpd(r,t))}});

// ===== S2a : PlayStation 3 =====
scene(10.1,13.1,PUR,PUR2,sc=>{
 const rays=ab(sc,`width:2600px;height:2600px;border-radius:50%;background:repeating-conic-gradient(rgba(255,203,61,.17) 0 7deg,transparent 7deg 14deg)`);
 const ps=psBox(sc,780);
 const R=[row(sc,110,300,140,[['PLAYSTATION',10.24]],0),row(sc,110,520,330,[['3',10.88,YEL]],0),
  row(sc,110,720,92,[['ПОТРЯСАЮЩАЯ',11.36,GRN]],0),row(sc,110,830,92,[['КОНСОЛЬ',12.28]],0)];
 return t=>{tf(rays,{x:1560,y:560,r:t*14,o:t>=10.1?P(t,10.1,.3):0});
  const k=E.outBack(P(t,10.24,.5));tf(ps,{x:1560,y:lerp(900,560,E.outCubic(P(t,10.24,.5)))+Math.sin(t*2.6)*10,s:.5+.5*k,r:lerp(-12,2,k),o:t>=10.24?1:0});
  R.forEach(r=>rowUpd(r,t))}});

// ===== S2b : Cell processor =====
scene(13.1,17.56,CY,'#7adbf7',sc=>{
 const H=row(sc,960,100,66,[['БЛАГОДАРЯ',13.2],['ПРОЦЕССОРУ',13.64]],.5,PUR);
 const rings=[0,1,2,3].map(i=>ab(sc,`width:420px;height:420px;border-radius:50%;border:12px solid ${YEL}`));
 const bolts=[0,1,2,3].map(i=>ab(sc,`width:130px;height:200px;background:${YEL};clip-path:${BOLT}`));
 const chip=chipEl(sc);
 const L=row(sc,960,725,70,[['CELL',14.24],['BROADBAND',14.56],['ENGINE',15.12]],.5,PUR);
 const mbar=ab(sc,`width:1200px;height:58px;border-radius:29px;background:${PUR};box-shadow:0 10px 0 #0d0830;overflow:hidden`);
 const fill=div(mbar,`position:absolute;left:0;top:0;height:100%;width:0;background:linear-gradient(90deg,${GRN},${YEL},${PINK})`);
 div(mbar,`position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 58px,${PUR} 58px 66px)`);
 const ml=row(sc,960,800,40,[['МОЩНОСТЬ',15.6]],.5,PUR);
 return t=>{rowUpd(H,t,{o:1-P(t,14.1,.15)});rowUpd(L,t);
  const kc=E.outElastic(P(t,14.24,.8));const pw=P(t,15.7,1.6);const pulse=1+(t>15.6?Math.sin(t*22)*.025*(.3+pw):0);
  tf(chip,{x:960,y:430,s:(t>=14.24?.15+.85*kc:0)*pulse,r:(1-kc)*-25,o:t>=14.24?1:0});
  rings.forEach((r,i)=>{const tau=(t-15.6-i*.32);const ok=t>15.6&&t<17.5&&tau>=0;const p=fr(tau/1.1);tf(r,{x:960,y:430,s:.7+p*1.5,o:ok?(1-p)*.8:0})});
  bolts.forEach((b,i)=>{const on=t>16.72&&t<17.45&&Math.floor(t*16+i)%2===0;const a=i*90+45,rr=330;
   tf(b,{x:960+Math.cos(a*Math.PI/180)*rr,y:430+Math.sin(a*Math.PI/180)*rr*.9,r:a+90,s:E.outBack(P(t,16.72,.25)),o:on?1:0})});
  tf(mbar,{x:960,y:836,o:t>=15.6?1:0,s:E.outBack(P(t,15.6,.3))});
  fill.style.width=(E.outCubic(pw)*100).toFixed(1)+'%';
  rowUpd(ml,t,{o:t>=15.6?1:0});tf(ml.el,{x:960,y:798,ax:.5,o:0})}});

// ===== S2c : squeeze the hardware =====
scene(17.56,22.58,PUR,PUR2,sc=>{
 const chip=chipEl(sc);
 const dc=[PINK,GRN,CY].map(c=>discEl(sc,c,230));
 const pl=ab(sc,`width:300px;height:430px;border-radius:40px;background:${PINK};box-shadow:0 14px 0 ${PINKd}`);
 const pr=ab(sc,`width:300px;height:430px;border-radius:40px;background:${PINK};box-shadow:0 14px 0 ${PINKd}`);
 const T1=row(sc,960,110,84,[['ВСТРЕЧАЮТСЯ',18.2],['ИГРЫ',18.96]],.5);
 const T2=row(sc,960,95,140,[['ВЫЖИМАЮТ',19.76,YEL]],.5);
 const T3=row(sc,960,208,66,[['ИЗ',20.24],['ЭТОГО',20.40],['ЖЕЛЕЗА',20.64]],.5,'#d9d2ff');
 const T4=row(sc,960,805,100,[['АБСОЛЮТНО',21.2,PINK],['ВСЁ',21.92,YEL]],.5);
 const mbar=ab(sc,`width:1300px;height:60px;border-radius:30px;background:#0d0830;overflow:hidden;border:5px solid ${YEL}`);
 const fill=div(mbar,`position:absolute;left:0;top:0;height:100%;width:0;background:linear-gradient(90deg,${GRN},${YEL},${PINK})`);
 const big=ab(sc,`font-size:400px;color:${YEL};letter-spacing:.01em;text-shadow:0 14px 0 ${PINKd};-webkit-text-stroke:12px ${PUR};paint-order:stroke fill`,'100%');
 const C=confetti(sc,34,[PINK,YEL,GRN,CY,WHT],9);
 const orb=[[-420,-110],[420,-110],[0,-320]];const starts=[[-300,120],[2250,860],[1100,-300]];const ta=[18.3,18.7,19.1];
 return t=>{tf(chip,{x:960,y:510,o:1,...(()=>{const sq=E.inOut(P(t,19.9,.55));const jit=t>19.9?Math.sin(t*70)*.012:0;return{sx:(1-.2*sq+jit)*.85,sy:(1+.13*sq-jit)*.85,r:t>19.9?Math.sin(t*55)*.8:0}})()});
  dc.forEach((d,i)=>{const arr=E.outBack(P(t,ta[i],.55));const x0=lerp(starts[i][0],960+orb[i][0],E.outCubic(P(t,ta[i],.55)));const y0=lerp(starts[i][1],510+orb[i][1],E.outCubic(P(t,ta[i],.55)));
   const ab2=E.inCubic(P(t,19.76+i*.08,.45));tf(d,{x:lerp(x0,960,ab2),y:lerp(y0,510,ab2),s:(.4+.6*arr)*(1-ab2),r:t*260*(i%2?1:-1),o:t>=ta[i]&&ab2<1?1:0})});
  const close=E.inCubic(P(t,19.5,.45)),sq=E.inOut(P(t,19.95,.5));
  const lx=lerp(-330,960-190-150+30,close)+sq*0,rx=lerp(2250,960+190+150-30,close);
  const sh=t>19.95?Math.sin(t*80)*3:0;
  tf(pl,{x:lerp(lx,lx+55,sq)+sh,y:510,o:t>=19.5?1:0});tf(pr,{x:lerp(rx,rx-55,sq)-sh,y:510,o:t>=19.5?1:0});
  rowUpd(T1,t,{o:1-P(t,19.55,.15)});
  rowUpd(T2,t,{sx:t>19.76?1+Math.sin(t*34)*.045*Math.exp(-(t-19.76)*.5):1});rowUpd(T3,t);rowUpd(T4,t);
  const fp=P(t,21.2,.7);tf(mbar,{x:960,y:900,o:t>=21.1?1:0,s:E.outBack(P(t,21.1,.25))});fill.style.width=(fp*100).toFixed(1)+'%';
  const kb=E.outBack(P(t,21.92,.35));tf(big,{x:960,y:520,s:t>=21.92?.3+.7*kb:0,r:-5+(1-kb)*10,o:t>=21.92?1:0});
  confUpd(C,t,21.92,960,520)}});

// ===== S2d : ГТА 5 over gameplay =====
scene(22.58,25.06,'#0e0a28','#14103a',sc=>{
 const vc=clip(sc,'driveB',78,'left:0;top:0;width:1920px;height:1080px');
 div(sc,'position:absolute;inset:0;background:rgba(14,10,40,.42)');
 const R0=row(sc,110,170,92,[['ОДНА',22.72],['ИЗ',23.12],['НИХ',23.32],['—',23.76]],0,WHT);
 const R1=row(sc,110,500,420,[['ГТА',23.86,WHT],['5',24.28,YEL]],0,WHT);
 const cover=cvr(sc,560,'assets/cover5.jpg',AR5);
 const C=confetti(sc,46,[PINK,YEL,GRN,CY,WHT],21);
 return t=>{clipSet(vc,t,22.58);rowUpd(R0,t);rowUpd(R1,t);
  const k=E.outBack(P(t,23.86,.5));tf(cover,{x:1650,y:lerp(1300,540,E.outCubic(P(t,23.86,.5)))+Math.sin(t*3)*8,r:lerp(18,-6,k),s:.55+.45*k,o:t>=23.86?1:0});
  confUpd(C,t,24.28,1000,500,1)}});

// ===== S3 : ГТА 4 -> Rockstar -> новая часть -> PS3 =====
scene(25.06,32.6,'#14335c','#1d4a85',sc=>{
 const g4=cvr(sc,540,'assets/cover4.jpg',AR4);
 const gears=[gearEl(sc,170,YEL,'#14335c'),gearEl(sc,120,PINK,'#14335c')];
 const logo=ab(sc,'width:210px;height:193px');const li=new Image();li.src='assets/rockstar.png';li.style.cssText='width:100%;height:100%';logo.appendChild(li);
 const dots=ab(sc,`width:360px;height:10px;background:repeating-linear-gradient(90deg,${YEL} 0 18px,transparent 18px 42px)`);
 const ps=psBox(sc,800);
 const cv3=cvr(sc,640,'assets/cover5.jpg',AR5),cv2=cvr(sc,640,'assets/cover5.jpg',AR5),cv1=cvr(sc,640,'assets/cover5.jpg',AR5);
 const badge=ab(sc,`width:300px;height:300px;background:${PINK};clip-path:${star(14,50,40)};display:flex;align-items:center;justify-content:center;text-align:center;color:${WHT};font-size:52px;line-height:1`,'НОВАЯ<br>ЧАСТЬ');
 const plus=ab(sc,`width:230px;height:230px;border-radius:50%;background:${YEL};box-shadow:0 12px 0 ${YELd};display:flex;align-items:center;justify-content:center;color:${PUR};font-size:130px;letter-spacing:-.04em`,'+1');
 const C=confetti(sc,30,[PINK,YEL,GRN,CY,WHT],33);
 return t=>{
  const a4=E.outBack(P(t,25.84,.55)),out=E.inCubic(P(t,29.1,.4));
  tf(g4,{x:lerp(-300,470,E.outCubic(P(t,25.84,.55)))-out*900,y:520+Math.sin(t*2.5)*6,r:lerp(-14,-3,a4),o:t>=25.84&&out<1?1:0});
  const gv=t>=26.88&&out<1?1:0;
  tf(gears[0],{x:960,y:610,r:t*90,s:E.outBack(P(t,26.88,.4)),o:gv});tf(gears[1],{x:1060,y:710,r:-t*130+20,s:E.outBack(P(t,26.96,.4)),o:gv});
  tf(logo,{x:930,y:360,s:E.outBack(P(t,26.88,.4)),r:-5,o:gv});tf(dots,{x:960,y:810,o:gv*(1-P(t,28.9,.2))});
  const ca=E.outCubic(P(t,27.92,.5)),cb=E.outBack(P(t,27.92,.6));const mv=E.inOut(P(t,29.2,.6));
  tf(cv1,{x:lerp(lerp(2300,1500,ca),700,mv),y:540+Math.sin(t*3)*7,r:lerp(lerp(14,-4,cb),-3,mv),o:t>=27.92?1:0});
  tf(badge,{x:1760,y:200,s:E.outBack(P(t,28.32,.45))*(1-P(t,29.1,.25)),r:12+Math.sin(t*5)*4,o:t>=28.32&&t<29.4?1:0});
  const kp=E.outBack(P(t,30.32,.5));tf(ps,{x:1400,y:lerp(1300,560,E.outCubic(P(t,30.32,.5))),s:.6+.4*kp,r:lerp(10,2,kp),o:t>=30.32?1:0});
  const k2=E.outBack(P(t,31.52,.45));tf(cv2,{x:700+k2*95,y:540-k2*30,r:-3+k2*9,s:1,o:t>=31.52?1:0});
  const k3=E.outBack(P(t,31.76,.45));tf(cv3,{x:700+k3*190,y:540-k3*60,r:-3+k3*17,s:1,o:t>=31.76?1:0});
  tf(plus,{x:1080,y:215,s:E.outBack(P(t,31.12,.4)),r:-8,o:t>=31.12?1:0});
  confUpd(C,t,31.76,1000,600,.8)}});


// ===== S4 : "горький опыт" =====
scene(32.6,36.2,PINKd,'#d9566b',sc=>{
 const R=[row(sc,110,190,76,[['НО',32.72],['К',32.96],['ТОМУ',33.04],['МОМЕНТУ',33.28]],0,'#ffd3da'),
  row(sc,110,330,112,[['У',33.84],['ROCKSTAR',34.04,YEL]],0),row(sc,110,470,100,[['УЖЕ',34.48],['БЫЛ',34.80]],0),
  row(sc,110,690,230,[['ГОРЬКИЙ',35.12,YEL]],0),row(sc,110,900,230,[['ОПЫТ',35.52,WHT]],0)];
 const logo=ab(sc,'width:250px;height:230px');const li=new Image();li.src='assets/rockstar.png';li.style.cssText='width:100%;height:100%';logo.appendChild(li);
 const face=ab(sc,`width:380px;height:380px;border-radius:50%;background:${YEL};box-shadow:0 14px 0 ${YELd}`);
 div(face,`position:absolute;left:96px;top:150px;width:54px;height:70px;border-radius:50%;background:${PUR}`);
 div(face,`position:absolute;left:230px;top:150px;width:54px;height:70px;border-radius:50%;background:${PUR}`);
 div(face,`position:absolute;left:78px;top:98px;width:96px;height:18px;border-radius:9px;background:${PUR};transform:rotate(-18deg)`);
 div(face,`position:absolute;left:206px;top:98px;width:96px;height:18px;border-radius:9px;background:${PUR};transform:rotate(18deg)`);
 div(face,`position:absolute;left:115px;top:250px;width:150px;height:74px;border:18px solid ${PUR};border-bottom:none;border-radius:150px 150px 0 0`);
 const tear=div(face,`position:absolute;left:258px;top:228px;width:40px;height:58px;background:${CY};border-radius:50% 50% 50% 50%/62% 62% 38% 38%`);
 return t=>{R.forEach(r=>rowUpd(r,t));
  tf(logo,{x:1640,y:290,s:E.outBack(P(t,34.04,.45)),r:-8+Math.sin(t*3)*3,o:t>=34.04?1:0});
  const k=E.outElastic(P(t,35.12,.9));tf(face,{x:1620,y:760,s:t>=35.12?k:0,r:Math.sin(t*5)*4*(t>35.12?1:0),o:t>=35.12?1:0});
  tear.style.transform=`translateY(${((t*1.4)%1*60).toFixed(1)}px)`;tear.style.opacity=t>35.6?(1-((t*1.4)%1)):0}});

// ===== S5a : memory is the enemy =====
scene(36.2,40.9,PUR,PUR2,sc=>{
 const R=[row(sc,110,120,64,[['ВО',36.32],['ВРЕМЯ',36.48],['РАБОТЫ',36.72],['НАД',37.08]],0,'#b9aef5'),
  row(sc,110,270,190,[['ГТА',37.24,WHT],['4',37.60,YEL]],0),
  row(sc,110,460,118,[['ПАМЯТЬ',38.24,WHT],['PS3',38.64,CY]],0),
  row(sc,110,600,84,[['СТАЛА',39.20,'#b9aef5'],['ГЛАВНЫМ',39.60,'#b9aef5']],0),
  row(sc,110,760,200,[['ВРАГОМ',40.12,PINK]],0)];
 const cov=cvr(sc,500,'assets/cover4.jpg',AR4);
 const tile=ab(sc,`width:560px;height:210px;border-radius:44px;box-shadow:0 14px 0 rgba(0,0,0,.28);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#073b2a`,
  `<div style="font-size:34px;font-weight:800;letter-spacing:.06em">ПАМЯТЬ PS3</div><div style="font-size:72px;letter-spacing:-.02em;margin-top:4px">256 + 256 МБ</div>`);
 const eyes=[0,1].map(i=>{const e=ab(sc,`width:62px;height:62px;border-radius:50%;background:#fff;border:6px solid ${PUR}`);div(e,`position:absolute;left:${i?10:22}px;top:20px;width:20px;height:20px;border-radius:50%;background:${PUR}`);return e});
 const brows=[0,1].map(i=>ab(sc,`width:92px;height:16px;border-radius:8px;background:${PUR}`));
 return t=>{R.forEach(r=>rowUpd(r,t));
  const kc=E.outBack(P(t,36.32,.55));tf(cov,{x:lerp(2300,1560,E.outCubic(P(t,36.32,.55))),y:360+Math.sin(t*2.6)*8,r:lerp(14,3,kc),o:t>=36.32?1:0});
  const kt=E.outElastic(P(t,38.24,.8));const ang=P(t,40.12,.25);const wob=t>40.12?Math.sin(t*50)*1.2*Math.exp(-(t-40.12)*2):0;
  tile.style.background=lerpC('3ddc97','ff5d73',ang);tile.style.color=ang>.5?'#fff':'#073b2a';
  tf(tile,{x:1560,y:830+ (1-ang)*0,s:t>=38.24?kt*(1+.06*ang):0,r:wob,o:t>=38.24?1:0});
  const ek=E.outBack(P(t,40.12,.3));const ex=[1560-100,1560+100];
  eyes.forEach((e,i)=>tf(e,{x:ex[i]+wob,y:690,s:t>=40.12?ek:0,o:t>=40.12?1:0}));
  brows.forEach((b,i)=>tf(b,{x:ex[i]+wob,y:645,r:i?-22:22,s:t>=40.12?ek:0,o:t>=40.12?1:0}))}});

// ===== S5b : too heavy for the console =====
scene(40.9,43.7,CY,'#7adbf7',sc=>{
 const ps=psBox(sc,560);
 const wt=ab(sc,'width:560px;height:430px');
 div(wt,`position:absolute;left:170px;top:0;width:220px;height:150px;border:34px solid ${PUR};border-bottom:none;border-radius:110px 110px 0 0`);
 div(wt,`position:absolute;left:0;top:110px;width:560px;height:320px;background:${PUR};clip-path:polygon(10% 0,90% 0,100% 100%,0 100%);box-shadow:0 14px 0 #0d0830;display:flex;align-items:center;justify-content:center;color:${YEL};font-size:130px;letter-spacing:-.02em;padding-top:30px`,'ИГРА');
 const R=[row(sc,1000,250,120,[['ИГРА',41.12,WHT]],0),row(sc,1000,380,100,[['ОКАЗАЛАСЬ',41.40,PUR]],0),
  row(sc,1000,520,118,[['СЛИШКОМ',41.96,PUR]],0),row(sc,1000,690,160,[['ТЯЖЁЛОЙ',42.40,PINKd]],0),row(sc,1000,850,96,[['ДЛЯ',42.84,PUR],['КОНСОЛИ',43.08,PUR]],0)];
 const dust=confetti(sc,18,[WHT,PUR,YEL],55);
 return t=>{R.forEach(r=>rowUpd(r,t));
  const kp=E.outBack(P(t,40.95,.45));
  const d=E.inCubic(P(t,42.1,.3));const hit=t>=42.4;const sq=hit?Math.exp(-(t-42.4)*9)*Math.cos((t-42.4)*18):0;
  tf(ps,{x:560,y:lerp(1300,730,E.outCubic(P(t,40.95,.45))),sx:(.7+.3*kp)*(1+.1*(hit?1-Math.max(0,1-sq*2)*0:0))*(hit?(1+.12*Math.max(0,1-(t-42.4)*3)):1),sy:(.7+.3*kp)*(hit?(1-.16*Math.max(0,1-(t-42.4)*2.2)):1),r:-3,o:t>=40.95?1:0});
  const wy=t<42.1?lerp(-400,-400,0):lerp(-300,300,d);
  tf(wt,{x:560,y:t<42.1?-400:(t<42.4?lerp(-300,258,d):258+Math.sin((t-42.4)*30)*6*Math.exp(-(t-42.4)*7)),r:t<42.4?0:Math.sin((t-42.4)*22)*1.5*Math.exp(-(t-42.4)*5),o:t>=42.1?1:0});
  confUpd(dust,t,42.4,560,470,.45)}});

// ===== S5c : 24 months, taken apart =====
scene(43.7,48.9,GRN,'#6ee9b6',sc=>{
 const R1=row(sc,110,90,70,[['И',43.80,PUR],['РАЗРАБОТЧИКАМ',43.92,PUR],['ПРИШЛОСЬ',44.64,PUR]],0);
 const R2a=row(sc,110,60,64,[['БУКВАЛЬНО',46.64,PUR],['РАЗБИРАТЬ',47.24,PUR]],0);
 const R2b=row(sc,110,140,64,[['ЕЁ',47.80,PUR],['ПО',48.00,PUR],['ЧАСТЯМ',48.24,PINKd]],0);
 const big=row(sc,110,430,540,[['24',45.12,PUR]],0);
 const mon=row(sc,110,730,150,[['МЕСЯЦА',46.08,WHT]],0);
 const cells=Array.from({length:24},(_,i)=>ab(sc,`width:66px;height:66px;border-radius:14px;background:rgba(27,19,64,.18)`));
 const cw=cvr(sc,640,'assets/cover4.jpg',AR4);
 // 12 tiles for the dismantled cover
 const TW=640*AR4/3,TH=640/4;
 const tiles=Array.from({length:12},(_,i)=>{const cx=i%3,cy=Math.floor(i/3);
  const d=ab(sc,`width:${TW}px;height:${TH}px;background:url(assets/cover4.jpg);background-size:${TW*3}px ${TH*4}px;background-position:${-cx*TW}px ${-cy*TH}px;border-radius:8px`);return{d,cx,cy,i}});
 return t=>{rowUpd(R1,t,{o:1-P(t,45.0,.15)});rowUpd(R2a,t);rowUpd(R2b,t);rowUpd(big,t);rowUpd(mon,t);
  cells.forEach((c,i)=>{const on=P(t,45.12+i*.058,.12);tf(c,{x:140+(i%12)*76,y:870+Math.floor(i/12)*76,s:1,o:1});c.style.background=on>.5?PUR:'rgba(27,19,64,.18)'});
  const kc=E.outBack(P(t,43.92,.5));const split=E.outBack(P(t,47.24,.6));
  tf(cw,{x:1480,y:lerp(1400,520,E.outCubic(P(t,43.92,.5))),r:lerp(12,-2,kc),o:t>=43.92&&t<47.24?1:0});
  tiles.forEach(tl=>{const base=[1560-TW+tl.cx*TW,520-2*TH+TH/2+tl.cy*TH-TH*0+0];
   const rx=(rnd(tl.i,3)-.5)*70,ry=(rnd(tl.i,4)-.5)*50;const gx=(tl.cx-1)*40+rx*split,gy=(tl.cy-1.5)*34+ry*split;
   tf(tl.d,{x:1480+(tl.cx-1)*TW+gx*.8,y:520+(tl.cy-1.5)*TH+gy*1,r:(rnd(tl.i,5)-.5)*22*split,s:1,o:t>=47.24?1:0})})}});

// ===== S6a : rewrite code / compress textures / lower resolution =====
scene(48.9,55.0,PUR,PUR2,sc=>{
 const cx=[380,960,1540];
 const chips=[row(sc,cx[0],150,40,[['ПЕРЕПИСЫВАЛИ',49.32,'#b9aef5']],.5),row(sc,cx[1],150,40,[['СЖИМАЛИ',50.48,'#b9aef5']],.5),row(sc,cx[2],150,40,[['ОПУСКАЛИ РАЗРЕШЕНИЕ',51.84,'#b9aef5'],['',52.40]],.5)];
 const cards=cx.map(()=>ab(sc,`width:520px;height:640px;border-radius:40px;background:#0d0830;box-shadow:0 16px 0 #070420;overflow:hidden`));
 // code card
 const bars=[];const cols=[PINK,YEL,GRN,CY,'#b9aef5'];
 for(let i=0;i<11;i++){const w=[300,220,360,160,280,340,200,300,240,320,180][i],ind=[0,40,40,80,40,0,40,80,80,40,0][i];
  const b=div(cards[0],`position:absolute;left:${44+ind}px;top:${96+i*46}px;width:${w}px;height:20px;border-radius:10px;background:${cols[i%5]};transform-origin:left;transform:scaleX(0)`);bars.push(b)}
 [0,1,2].forEach(i=>div(cards[0],`position:absolute;left:${36+i*34}px;top:30px;width:20px;height:20px;border-radius:50%;background:${[PINK,YEL,GRN][i]}`));
 // texture card
 const tex=div(cards[1],`position:absolute;left:60px;top:120px;width:400px;height:462px;overflow:hidden;border-radius:14px;transform-origin:50% 50%`);
 const ti=new Image();ti.src='assets/cover4.jpg';ti.style.cssText='width:100%;height:100%;display:block';tex.appendChild(ti);
 const pt=div(cards[1],`position:absolute;left:40px;top:92px;width:440px;height:44px;border-radius:14px;background:${PINK}`);
 const pb=div(cards[1],`position:absolute;left:40px;top:564px;width:440px;height:44px;border-radius:14px;background:${PINK}`);
 // resolution card
 const ri=[ 'assets/cover4.jpg','assets/cover4_p1.jpg','assets/cover4_p2.jpg'].map((src,i)=>{const d=div(cards[2],`position:absolute;left:60px;top:90px;width:400px;height:462px;overflow:hidden;border-radius:14px`);const im=new Image();im.src=src;im.style.cssText='width:100%;height:100%;display:block;image-rendering:pixelated';d.appendChild(im);return d});
 const res=ab(sc,`font-size:150px;color:${YEL};letter-spacing:-.03em;-webkit-text-stroke:10px ${PUR};paint-order:stroke fill;text-shadow:0 10px 0 ${PINKd}`,'720p');
 const old=ab(sc,`font-size:64px;color:#b9aef5;text-decoration:line-through;text-decoration-thickness:8px`,'1080p');
 const arrow=ab(sc,`width:90px;height:110px;background:${PINK};clip-path:polygon(35% 0,65% 0,65% 55%,100% 55%,50% 100%,0 55%,35% 55%)`);
 const lab=[row(sc,cx[0],910,100,[['КОД',50.00,YEL]],.5),row(sc,cx[1],910,100,[['ТЕКСТУРЫ',50.96,YEL]],.5)];
 lab[1].el.style.fontSize='84px';
 return t=>{chips.forEach(c=>rowUpd(c,t));lab.forEach(l=>rowUpd(l,t));
  const sl=[49.04,50.48,51.84];
  cards.forEach((c,i)=>{const k=E.outBack(P(t,sl[i],.5));tf(c,{x:cx[i],y:lerp(1500,520,E.outCubic(P(t,sl[i],.5))),r:lerp(i%2?8:-8,0,k),s:.8+.2*k,o:t>=sl[i]?1:0})});
  bars.forEach((b,i)=>{b.style.transform=`scaleX(${E.outCubic(P(t,49.2+i*.12,.22))})`});
  const sq=E.inOut(P(t,50.96,.5));tex.style.transform=`scaleY(${1-.58*sq})`;
  pt.style.top=(92+ 120*sq)+'px';pb.style.top=(564-120*sq)+'px';
  ri[0].style.display=t<53.12?'block':'none';ri[1].style.display=(t>=53.12&&t<53.44)?'block':'none';ri[2].style.display=t>=53.44?'block':'none';
  tf(old,{x:cx[2]-120,y:640,o:t>=52.40?1:0,s:E.outBack(P(t,52.40,.3))*(t>=53.44?.8:1)});
  tf(arrow,{x:cx[2]+160,y:660+Math.sin(t*10)*6,o:t>=53.12?1:0,s:E.outBack(P(t,53.12,.3))});
  const kr=E.outBack(P(t,53.44,.35));tf(res,{x:cx[2],y:830,s:t>=53.44?.4+.6*kr:0,r:-6+(1-kr)*10,o:t>=53.44?1:0})}});

// ===== S6b : blur over the picture =====
scene(55.0,59.27,'#14103a','#1c1750',sc=>{
 const wrap=ab(sc,`width:${760*AR4}px;height:760px;border-radius:26px;overflow:hidden;box-shadow:0 18px 0 rgba(0,0,0,.35)`);
 const a=new Image();a.src='assets/cover4.jpg';a.style.cssText='position:absolute;inset:0;width:100%;height:100%';wrap.appendChild(a);
 const bl=div(wrap,'position:absolute;inset:0;overflow:hidden');
 const bi=new Image();bi.src='assets/cover4_blur.jpg';bi.style.cssText='position:absolute;inset:0;width:100%;height:100%';bl.appendChild(bi);
 const edge=div(wrap,`position:absolute;left:0;width:100%;height:10px;background:${YEL}`);
 const R=[row(sc,1120,180,76,[['А',55.12,'#b9aef5'],['ЧТОБЫ',55.23,'#b9aef5']],0),row(sc,1120,290,72,[['ЗАМАСКИРОВАТЬ',55.52,WHT]],0),
  row(sc,1120,390,72,[['ЭТО',56.23,WHT]],0),row(sc,1120,520,112,[['НАКРЫЛИ',56.76,CY]],0),
  row(sc,1120,650,112,[['КАРТИНКУ',57.12,WHT]],0),row(sc,1120,780,96,[['ПЛОТНЫМ',57.76,YEL]],0),row(sc,1100,920,102,[['РАЗМЫТИЕМ',58.23,PINK]],0)];
 return t=>{R.forEach(r=>rowUpd(r,t));
  const kw=E.outBack(P(t,55.0,.5));tf(wrap,{x:600,y:lerp(1400,540,E.outCubic(P(t,55.0,.5))),r:lerp(-8,-2,kw),s:.8+.2*kw,o:1});
  const p=E.inOut(P(t,56.76,1.45));bl.style.clipPath=`inset(0 0 ${((1-p)*100).toFixed(2)}% 0)`;edge.style.top=(p*100).toFixed(2)+'%';edge.style.opacity=(p>0&&p<1)?1:0}});

