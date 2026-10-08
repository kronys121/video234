// ---------- extra helpers ----------
const wipes=[[3.24,YEL,PUR,1],[7.94,PUR,PINK,-1],[13.1,PUR,YEL,1],[17.56,PINK,CY,-1],[25.06,YEL,CY,1],[32.6,PUR,YEL,-1],[48.9,CY,PINK,1]];
const flashes=[[9.24,.18,'#fff'],[10.1,.25,'#fff'],[21.92,.25,PINK],[22.58,.25,'#fff'],[23.86,.12,'#fff'],[24.28,.2,'#fff'],[36.2,.2,'#fff'],[40.9,.2,'#fff'],[43.7,.2,'#fff'],[55.0,.22,'#fff'],[58.23,.2,'#fff']];
const GRY='#b9aef5';
function G(stem,after=0,occ=0){stem=stem.toLowerCase();let n=0;
 for(const w of WORDS){if(w[1]<after-.001)continue;const x=w[0].toLowerCase().replace(/^[^a-zа-яё0-9]+/,'');if(x.startsWith(stem)){if(n++===occ)return w[1]}}
 throw new Error('no word '+stem+' after '+after)}
const ARc={ps4:726/422,xone:735/752,ps5:461/500,xs:1,x360:381/524};
function conCard(parent,key,h,rad=34){const pad=16;const w=(h-2*pad)*ARc[key]+2*pad;
 const d=ab(parent,`width:${w}px;height:${h}px;border-radius:${rad}px;background:#fff;box-shadow:0 14px 0 rgba(0,0,0,.28);overflow:hidden`);
 const i=new Image();i.src=`assets/${key}.jpg`;i.style.cssText=`position:absolute;left:${pad}px;top:${pad}px;width:calc(100% - ${2*pad}px);height:calc(100% - ${2*pad}px);object-fit:contain`;d.appendChild(i);d.dataset.w=w;return d}
function tile(parent,w,h,bg,sh,html,rad=40,extra=''){return ab(parent,`width:${w}px;height:${h}px;border-radius:${rad}px;background:${bg};box-shadow:0 14px 0 ${sh};display:flex;flex-direction:column;align-items:center;justify-content:center;${extra}`,html)}
// pop-in: scale+rise with overshoot, hidden before t0
function pop(el,t,t0,x,y,o={}){const{r=0,s=1,dur=.5,dy=140,r0=10,off=0,t1=1e9,fade=0}=o;
 const k=E.outBack(P(t,t0,dur)),p=E.outCubic(P(t,t0,dur));
 const op=(t>=t0&&t<t1)?(fade?1-P(t,t1-fade,fade):1):0;
 tf(el,{x:x,y:y+(1-p)*dy+off,s:s*(.35+.65*k),r:r+(1-k)*r0,o:op})}
function slide(el,t,t0,fx,fy,x,y,o={}){const{r=0,r0=0,s=1,dur=.55,t1=1e9}=o;const p=E.outCubic(P(t,t0,dur)),k=E.outBack(P(t,t0,dur));
 tf(el,{x:lerp(fx,x,p),y:lerp(fy,y,p),r:lerp(r0,r,k),s:s*(.7+.3*k),o:(t>=t0&&t<t1)?1:0})}
const fl_=(t,a,b)=>t>=a&&t<b?1:0;
// buildings with windows
function bld(parent,w,h,col){const d=ab(parent,`width:${w}px;height:${h}px;background:${col};border-radius:10px 10px 0 0;box-shadow:0 10px 0 rgba(0,0,0,.25)`);
 div(d,`position:absolute;left:14px;top:16px;right:14px;bottom:16px;background:repeating-linear-gradient(0deg,rgba(255,255,255,.55) 0 14px,transparent 14px 34px);-webkit-mask-image:repeating-linear-gradient(90deg,#000 0 16px,transparent 16px 36px);mask-image:repeating-linear-gradient(90deg,#000 0 16px,transparent 16px 36px)`);return d}
function skyline(parent,W,H,seed,cols){const d=ab(parent,`width:${W}px;height:${H}px`);let x=0,i=0;
 while(x<W-40){const w=60+rnd(i,seed)*70,h=H*(.35+rnd(i,seed+1)*.65);const b=bld(d,w,h,cols[i%cols.length]);b.style.left='0';b.style.top='0';b.style.transform=`translate(${x}px,${H-h}px)`;x+=w+8;i++}return d}
function xmark(parent,size,bg=PINK){const d=ab(parent,`width:${size}px;height:${size}px;border-radius:50%;background:${bg};box-shadow:0 10px 0 rgba(0,0,0,.28)`);
 [45,-45].forEach(a=>div(d,`position:absolute;left:${size*.15}px;top:${size*.43}px;width:${size*.7}px;height:${size*.14}px;border-radius:${size*.07}px;background:#fff;transform:rotate(${a}deg)`));return d}
function checkmark(parent,size,bg=GRN){const d=ab(parent,`width:${size}px;height:${size}px;border-radius:50%;background:${bg};box-shadow:0 10px 0 rgba(0,0,0,.28)`);
 div(d,`position:absolute;left:${size*.24}px;top:${size*.5}px;width:${size*.26}px;height:${size*.12}px;border-radius:${size*.06}px;background:#fff;transform:rotate(45deg);transform-origin:left center`);
 div(d,`position:absolute;left:${size*.42}px;top:${size*.62}px;width:${size*.5}px;height:${size*.12}px;border-radius:${size*.06}px;background:#fff;transform:rotate(-50deg);transform-origin:left center`);return d}
function bigWord(parent,txt,size,col,stroke=PUR){return ab(parent,`font-size:${size}px;color:${col};letter-spacing:-.02em;white-space:nowrap;-webkit-text-stroke:${size*.07}px ${stroke};paint-order:stroke fill;text-shadow:0 ${size*.04}px 0 rgba(0,0,0,.3)`,txt)}
function arrowR(parent,w,h,col){return ab(parent,`width:${w}px;height:${h}px;background:${col};clip-path:polygon(0 30%,60% 30%,60% 0,100% 50%,60% 100%,60% 70%,0 70%)`)}
function memBlock(parent,sz,col){return ab(parent,`width:${sz}px;height:${sz}px;border-radius:${sz*.22}px;background:${col};box-shadow:0 6px 0 rgba(0,0,0,.25)`)}
function person(parent,sz,col,head='#ffe0b3'){const d=ab(parent,`width:${sz}px;height:${sz*1.5}px`);
 div(d,`position:absolute;left:${sz*.25}px;top:0;width:${sz*.5}px;height:${sz*.5}px;border-radius:50%;background:${head}`);
 div(d,`position:absolute;left:${sz*.1}px;top:${sz*.55}px;width:${sz*.8}px;height:${sz*.95}px;border-radius:${sz*.4}px ${sz*.4}px ${sz*.12}px ${sz*.12}px;background:${col}`);return d}
function carEl(parent,w,col){const h=w*.42;const d=ab(parent,`width:${w}px;height:${h}px`);
 div(d,`position:absolute;left:0;top:${h*.35}px;width:${w}px;height:${h*.45}px;border-radius:${h*.2}px;background:${col};box-shadow:0 ${h*.06}px 0 rgba(0,0,0,.25)`);
 div(d,`position:absolute;left:${w*.2}px;top:0;width:${w*.55}px;height:${h*.5}px;border-radius:${h*.3}px ${h*.3}px 0 0;background:${col}`);
 div(d,`position:absolute;left:${w*.27}px;top:${h*.08}px;width:${w*.19}px;height:${h*.32}px;border-radius:${h*.1}px;background:rgba(255,255,255,.75)`);
 div(d,`position:absolute;left:${w*.5}px;top:${h*.08}px;width:${w*.19}px;height:${h*.32}px;border-radius:${h*.1}px;background:rgba(255,255,255,.75)`);
 [.2,.72].forEach(x=>div(d,`position:absolute;left:${w*x-h*.17}px;top:${h*.62}px;width:${h*.34}px;height:${h*.34}px;border-radius:50%;background:${PUR};border:${h*.05}px solid #ddd`));return d}
function clipT(c,sec,loopLen=0){let f=sec*30;if(loopLen>0)f=((f%(loopLen*30))+loopLen*30)%(loopLen*30);let k=Math.max(1,Math.min(c.n,Math.round(f)+1));
 if(k!==c.cur){c.cur=k;c.im.src=`clips/${c.dir}/${String(k).padStart(4,'0')}.jpg`;pend.push(c.im.decode().catch(()=>{}))}}
function framed(parent,w,h,rad=30){const d=ab(parent,`width:${w}px;height:${h}px;border-radius:${rad}px;overflow:hidden;border:10px solid #fff;box-shadow:0 18px 0 rgba(0,0,0,.28);background:#000`);return d}
function worker(parent,sz,col,hat=YEL){const d=person(parent,sz,col);
 div(d,`position:absolute;left:${sz*.15}px;top:${-sz*.1}px;width:${sz*.7}px;height:${sz*.34}px;border-radius:${sz*.35}px ${sz*.35}px 0 0;background:${hat}`);
 div(d,`position:absolute;left:${sz*.08}px;top:${sz*.2}px;width:${sz*.84}px;height:${sz*.07}px;border-radius:${sz*.04}px;background:${hat}`);
 div(d,`position:absolute;left:${sz*.34}px;top:${sz*.2}px;width:${sz*.06}px;height:${sz*.06}px;border-radius:50%;background:#1b1340`);
 div(d,`position:absolute;left:${sz*.58}px;top:${sz*.2}px;width:${sz*.06}px;height:${sz*.06}px;border-radius:50%;background:#1b1340`);return d}
function shadowRows(arr){arr.forEach(r=>r.el.style.textShadow='0 6px 0 rgba(0,0,0,.4)')}
function gauge(parent,size){const d=ab(parent,`width:${size}px;height:${size/2+30}px`);
 const o=div(d,`position:absolute;left:0;top:0;width:${size}px;height:${size/2}px;overflow:hidden`);
 div(o,`position:absolute;left:0;top:0;width:${size}px;height:${size}px;border-radius:50%;background:conic-gradient(from -90deg,${PINK} 0deg 60deg,${YEL} 60deg 120deg,${GRN} 120deg 180deg,transparent 180deg)`);
 div(o,`position:absolute;left:${size*.2}px;top:${size*.2}px;width:${size*.6}px;height:${size*.6}px;border-radius:50%;background:${PUR}`);
 const nd=div(d,`position:absolute;left:${size/2-7}px;top:${size*.06}px;width:14px;height:${size*.44}px;border-radius:7px;background:#fff;transform-origin:50% 100%`);
 div(d,`position:absolute;left:${size/2-22}px;top:${size/2-22}px;width:44px;height:44px;border-radius:50%;background:#fff`);d.nd=nd;return d}
function crate(parent,w,h,col,label){const d=ab(parent,`width:${w}px;height:${h}px;border-radius:26px;background:${col};box-shadow:0 14px 0 rgba(0,0,0,.28);overflow:hidden`);
 [.33,.66].forEach(x=>div(d,`position:absolute;left:${x*100}%;top:0;width:8px;height:100%;background:rgba(0,0,0,.12)`));
 div(d,`position:absolute;left:0;bottom:0;width:100%;height:${h*.24}px;background:rgba(27,19,64,.82);color:#fff;display:flex;align-items:center;justify-content:center;font-size:${h*.13}px`,label);
 const ic=div(d,`position:absolute;left:0;top:0;width:100%;height:${h*.76}px`);d.ic=ic;return d}
function crystal(parent,size){const d=ab(parent,`width:${size}px;height:${size*1.15}px`);
 div(d,`position:absolute;left:${size*.15}px;top:${size*.82}px;width:${size*.7}px;height:${size*.3}px;border-radius:${size*.12}px;background:${PUR};box-shadow:0 8px 0 #0d0830`);
 const b=div(d,`position:absolute;left:0;top:0;width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff 0 6%,#b9aef5 10%,#6b5fc7 55%,#3a2d86 100%);box-shadow:0 10px 0 #2a1d68;overflow:hidden`);d.ball=b;return d}
function svgPath(parent,w,h,d,col,sw=14){const el=div(parent,`position:absolute;left:0;top:0;width:${w}px;height:${h}px`,`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
 const p=el.querySelector('path');const len=p.getTotalLength();p.style.strokeDasharray=len;p.style.strokeDashoffset=len;return{el,p,len}}
function heart(parent,sz,col=PINK){const d=ab(parent,`width:${sz}px;height:${sz}px`);
 div(d,`position:absolute;left:${sz*.1}px;top:${sz*.1}px;width:${sz*.5}px;height:${sz*.5}px;border-radius:50%;background:${col}`);div(d,`position:absolute;left:${sz*.4}px;top:${sz*.1}px;width:${sz*.5}px;height:${sz*.5}px;border-radius:50%;background:${col}`);
 div(d,`position:absolute;left:${sz*.2}px;top:${sz*.22}px;width:${sz*.6}px;height:${sz*.6}px;background:${col};transform:rotate(45deg);border-radius:0 0 ${sz*.1}px 0`);return d}
