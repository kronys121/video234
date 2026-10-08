// ===== A1 (59.27-63.27): lens + vaseline =====
scene(59.27,63.27,YEL,'#ffd86b',sc=>{
 const R=[row(sc,110,190,120,[['ИГРОКИ',59.3,PUR]],0),row(sc,110,340,120,[['СРАВНИВАЛИ',60.0,PINKd]],0),
  row(sc,110,500,100,[['С',60.8,PUR],['ОБЪЕКТИВОМ',60.9,PUR]],0),row(sc,110,690,120,[['НАТЁРТЫМ',61.6,PUR]],0),row(sc,110,850,130,[['ВАЗЕЛИНОМ',62.1,PINKd]],0)];
 const lens=ab(sc,'width:620px;height:620px');
 div(lens,`position:absolute;inset:0;border-radius:50%;background:${PUR};box-shadow:0 16px 0 #0d0830`);
 div(lens,`position:absolute;inset:34px;border-radius:50%;background:#3a2d86`);
 const gl=div(lens,'position:absolute;inset:70px;border-radius:50%;overflow:hidden;background:#000');
 const a=new Image();a.src='assets/cover4.jpg';a.style.cssText='position:absolute;left:-12%;top:-4%;width:124%;height:108%;object-fit:cover';gl.appendChild(a);
 const b=new Image();b.src='assets/cover4_blur.jpg';b.style.cssText='position:absolute;left:-12%;top:-4%;width:124%;height:108%;object-fit:cover;opacity:0;filter:blur(10px)';gl.appendChild(b);
 div(gl,'position:absolute;left:10%;top:8%;width:30%;height:14%;border-radius:50%;background:rgba(255,255,255,.35);transform:rotate(-35deg)');
 const jar=ab(sc,'width:300px;height:300px');
 div(jar,`position:absolute;left:10px;top:60px;width:280px;height:230px;border-radius:40px;background:#fff7e8;box-shadow:0 12px 0 #d9c9a8`);
 div(jar,`position:absolute;left:0;top:0;width:300px;height:80px;border-radius:26px;background:${PINK};box-shadow:0 8px 0 ${PINKd}`);
 div(jar,`position:absolute;left:44px;top:120px;width:212px;height:110px;border-radius:24px;background:${CY};display:flex;align-items:center;justify-content:center;font-size:36px;color:${PUR}`,'ВАЗЕЛИН');
 const smear=ab(sc,'width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.55),rgba(255,255,255,0) 70%)');
 return t=>{R.forEach(r=>rowUpd(r,t));
  const kl=E.outBack(P(t,60.9,.5));tf(lens,{x:1450,y:470+Math.sin(t*2)*8,s:t>=60.9?.5+.5*kl:0,r:lerp(-14,-3,kl),o:t>=60.9?1:0});
  b.style.opacity=P(t,62.1,.5);a.style.opacity=1-.6*P(t,62.1,.5);
  pop(jar,t,61.6,1620,860,{r:-8,r0:16,dur:.5,dy:300});
  const sm=E.outCubic(P(t,62.1,.6));tf(smear,{x:1450,y:470,s:sm*1.1,o:t>=62.1?.9:0})}});

// ===== A2 (63.27-68.4): a whole city does not fit =====
scene(63.27,68.4,PUR,PUR2,sc=>{
 const R=[row(sc,110,140,90,[['ГЛАВНЫЙ',63.3,GRY],['УРОК',63.8,GRY]],0),row(sc,110,330,150,[['ЦЕЛЫЙ',65.4],['ГОРОД',65.8,YEL]],0),
  row(sc,110,520,140,[['В',66.2],['ПАМЯТЬ',66.3,CY]],0),row(sc,110,720,108,[['НЕ',66.8,PINK],['ЗАТОЛКАТЬ',67.0,PINK]],0)];
 const box=ab(sc,`width:400px;height:300px;border-radius:40px;border:12px dashed ${CY};background:rgba(76,201,240,.12)`);
 const bl=row(sc,1580,880,46,[['ПАМЯТЬ',66.3,CY]],.5);
 const city=skyline(sc,720,360,4,[PINK,YEL,GRN,CY,'#b9aef5']);
 const xm=xmark(sc,170);
 return t=>{R.forEach(r=>rowUpd(r,t));rowUpd(bl,t);
  pop(box,t,66.3,1580,720,{dur:.4,dy:200});
  const drop=E.inCubic(P(t,65.4,.9));const hit=t>=66.95;
  const cy=hit?lerp(500,380,E.outCubic(P(t,66.95,.4))):lerp(-300,500,drop);
  tf(city,{x:1600,y:cy,s:1,r:hit?Math.sin((t-66.95)*30)*1.5*Math.exp(-(t-66.95)*6):0,o:t>=65.4?1:0});
  pop(xm,t,67.0,1580,560,{dur:.35,r0:30})}});

// ===== A3 (68.4-74.29): only what the player sees =====
scene(68.4,74.29,'#14335c','#1d4a85',sc=>{
 const R=[row(sc,110,150,100,[['ПОКАЗЫВАЛА',68.7,GRY]],0),row(sc,110,290,100,[['ТО,',69.5],['ЧТО',69.7],['ВИДИТ',70.0,YEL]],0),
  row(sc,110,500,230,[['ИГРОК',70.3,CY]],0),row(sc,110,720,140,[['СТИРАЛА',71.9,PINK]],0),row(sc,110,880,110,[['ВСЁ',72.3],['ЗА',73.3],['СПИНОЙ',73.4,YEL]],0)];
 const cols=[PINK,YEL,GRN,CY,'#b9aef5'];const bs=[];
 for(let r=0;r<3;r++)for(let c=0;c<7;c++){const b=ab(sc,`width:90px;height:${90+((r*7+c)%3)*26}px;border-radius:10px;background:${cols[(r+c)%5]}`);bs.push({b,x:1020+c*114,y:330+r*190})}
 const cone=ab(sc,`width:620px;height:360px;background:linear-gradient(90deg,rgba(255,203,61,.45),rgba(255,203,61,.05));clip-path:polygon(0 50%,100% 0,100% 100%)`);
 const pl=ab(sc,`width:90px;height:90px;border-radius:50%;background:${YEL};box-shadow:0 8px 0 ${YELd}`);
 div(pl,`position:absolute;left:44px;top:30px;width:30px;height:30px;border-radius:50%;background:#fff`);div(pl,`position:absolute;left:56px;top:40px;width:14px;height:14px;border-radius:50%;background:${PUR}`);
 const bar=ab(sc,`width:16px;height:620px;border-radius:8px;background:${PINK}`);
 return t=>{R.forEach(r=>rowUpd(r,t));
  const px=lerp(1000,1560,E.inOut(P(t,69.0,4.8)));
  bs.forEach(o=>{const d=o.x-px;let op=d>330?.18:(d<-110?0:1);const k=d<-110?0:1;tf(o.b,{x:o.x,y:o.y,s:d<-110?.3:1,o:t>=68.6?op:0});o.b.style.filter=d>330?'grayscale(1)':'none'});
  tf(cone,{x:px+310,y:540,o:t>=69.5?1:0});tf(pl,{x:px,y:540,o:t>=68.6?1:0});
  tf(bar,{x:px-120,y:540,o:t>=71.9?1:0})}});

// ===== A4 (74.29-81.08): memory full -> trash twice as much =====
scene(74.29,81.08,'#ff7a8c','#ff9aa8',sc=>{
 const R=[row(sc,110,130,130,[['ПАМЯТИ',74.7,PUR],['НЕ',75.0,PUR]],0),row(sc,110,290,170,[['ХВАТАЛО',75.2,WHT]],0),row(sc,110,440,120,[['СОВСЕМ',75.6,PUR]],0),
  row(sc,110,610,130,[['УДАЛЯЛА',77.2,PUR]],0),row(sc,110,760,110,[['ВДВОЕ',77.6,WHT],['БОЛЬШЕ',78.1,WHT]],0),row(sc,110,910,80,[['КАДРЫ',79.5,PUR],['НЕ',79.8,PUR],['ПРОСЕДАЛИ',80.0,PUR]],0)];
 const mem=ab(sc,`width:720px;height:90px;border-radius:45px;background:${PUR};box-shadow:0 12px 0 #0d0830;overflow:hidden`);
 const fill=div(mem,`position:absolute;left:0;top:0;height:100%;width:0;background:linear-gradient(90deg,${GRN},${YEL},${PINKd})`);
 div(mem,`position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 70px,${PUR} 70px 80px)`);
 const ml=row(sc,1480,200,46,[['ПАМЯТЬ',74.7,PUR]],.5);
 const bin=ab(sc,'width:300px;height:340px');
 const lid=div(bin,`position:absolute;left:-20px;top:0;width:340px;height:50px;border-radius:20px;background:${PUR};transform-origin:left bottom`);
 div(bin,`position:absolute;left:0;top:50px;width:300px;height:290px;background:${PUR};clip-path:polygon(0 0,100% 0,88% 100%,12% 100%);box-shadow:0 12px 0 #0d0830`);
 div(bin,`position:absolute;left:60px;top:90px;width:180px;height:200px;background:repeating-linear-gradient(90deg,${PINK} 0 22px,transparent 22px 56px);clip-path:polygon(0 0,100% 0,90% 100%,10% 100%)`);
 const blocks=Array.from({length:14},(_,i)=>memBlock(sc,46,[PUR,YEL,CY,GRN,WHT][i%5]));
 const x2=tile(sc,200,200,YEL,YELd,'<div style="font-size:120px;color:#2a1d68;letter-spacing:-.04em">×2</div>',100);
 const fps=tile(sc,360,150,GRN,GRNd,'<div style="font-size:30px;color:#073b2a;font-weight:800">КАДРЫ</div><div style="font-size:66px;color:#073b2a">30 FPS</div>',40);
 const ck=checkmark(sc,110,PUR);
 return t=>{R.forEach(r=>rowUpd(r,t));rowUpd(ml,t);
  pop(mem,t,74.7,1480,280,{dur:.4,dy:100});fill.style.width=(E.outCubic(P(t,75.2,.9))*100)+'%';
  pop(bin,t,76.4,1620,720,{dur:.5,dy:250,r:-2});lid.style.transform=`rotate(${-38*Math.min(1,E.outBack(P(t,76.9,.3)))*(t<80.4?1:0)}deg)`;
  blocks.forEach((b,i)=>{const st=77.2+i*.19;const p=P(t,st,.62);const e=E.inCubic(p);
   tf(b,{x:lerp(1300+i*30,1620,E.outCubic(P(t,st,.62))*.9+.1*e),y:lerp(300,640,E.inCubic(p))-Math.sin(p*Math.PI)*150,r:p*360,s:1-.5*p,o:(t>=st&&p<1)?1:0})});
  pop(x2,t,77.6,1310,720,{dur:.45,r:-8,r0:20});
  pop(fps,t,79.5,1470,935,{dur:.45,dy:150});pop(ck,t,80.0,1740,935,{dur:.35,r0:20})}});

// ===== A5 (81.08-93.16): shadows get cheap =====
scene(81.08,93.16,PUR,PUR2,sc=>{
 const R1=[row(sc,110,140,100,[['ДОСТАЛОСЬ',81.1],['И',81.6]],0),row(sc,110,320,240,[['ТЕНЯМ',81.8,YEL]],0),row(sc,110,520,90,[['ВИДЕОПАМЯТЬ',82.7,GRY],['PS3',83.3,GRY]],0),row(sc,110,690,190,[['256',84.8,CY],['МБ',85.4,CY]],0)];
 const R2=[row(sc,110,160,100,[['КАЧЕСТВО',88.0],['ТЕНЕЙ',88.6]],0),row(sc,110,360,200,[['УРЕЗАЛИ',89.7,PINK]],0),row(sc,110,610,130,[['ЗЕРНИСТЫЕ',91.1,YEL]],0),row(sc,110,780,130,[['МЕРЦАЛИ',92.2,CY]],0)];
 const ground=ab(sc,`width:760px;height:20px;border-radius:10px;background:#0d0830`);
 const hs=bld(sc,260,430,CY);
 const sh1=ab(sc,`width:360px;height:90px;background:rgba(10,6,34,.7);clip-path:polygon(0 0,100% 40%,86% 100%,0 100%)`);
 const sh2=ab(sc,`width:360px;height:90px;background:repeating-conic-gradient(#0d0830 0 25%,transparent 0 50%) 0 0/14px 14px;clip-path:polygon(0 0,100% 40%,86% 100%,0 100%)`);
 const sun=ab(sc,`width:150px;height:150px;border-radius:50%;background:${YEL};box-shadow:0 0 0 24px rgba(255,203,61,.25)`);
 const vm=tile(sc,300,130,GRN,GRNd,'<div style="font-size:26px;color:#073b2a;font-weight:800">ВИДЕОПАМЯТЬ</div><div style="font-size:58px;color:#073b2a">256 МБ</div>',34);
 return t=>{R1.forEach(r=>rowUpd(r,t,{o:1-P(t,87.3,.2)}));R2.forEach(r=>rowUpd(r,t));
  tf(ground,{x:1480,y:850,o:1});pop(hs,t,81.8,1380,850,{ax:0,dur:.5,dy:0});hs.style.transformOrigin='50% 100%';tf(hs,{x:1380,y:850,ay:1,s:E.outBack(P(t,81.8,.5)),o:t>=81.8?1:0});
  tf(sun,{x:1780,y:260,s:E.outBack(P(t,81.8,.5)),o:t>=81.8?1:0});
  const smooth=t<89.7;tf(sh1,{x:1510,y:850,ax:0,ay:1,o:t>=82.2&&smooth?1:0});
  const fl2=t>=90.0?(Math.floor(t*14)%3===0?.25:1):1;tf(sh2,{x:1510,y:850,ax:0,ay:1,o:t>=89.7?fl2:0});
  pop(vm,t,83.8,1440,330,{dur:.45,t1:87.4,fade:.2})}});

// ===== A6 (93.16-98.68): same task, bigger scale =====
scene(93.16,98.68,CY,'#7adbf7',sc=>{
 const R=[row(sc,110,160,110,[['ТА',93.7,PUR],['ЖЕ',93.9,PUR],['ЗАДАЧА',94.0,PUR]],0),row(sc,110,360,230,[['СНОВА',95.6,WHT]],0),
  row(sc,110,590,130,[['МАСШТАБ',96.7,PUR]],0),row(sc,110,740,130,[['ВЫРОС',97.3,PUR]],0)];
 const c4=cvr(sc,300,'assets/cover4.jpg',AR4);const c5=cvr(sc,760,'assets/cover5.jpg',AR5);
 const lg=ab(sc,'width:210px;height:193px');const li=new Image();li.src='assets/rockstar.png';li.style.cssText='width:100%;height:100%';lg.appendChild(li);
 const st=bigWord(sc,'В РАЗЫ',150,YEL,PUR);const C=confetti(sc,34,[PINK,YEL,GRN,WHT],61);
 return t=>{R.forEach(r=>rowUpd(r,t));
  pop(lg,t,93.3,1060,500,{dur:.45,r:-6});
  pop(c4,t,94.0,1220,760,{r:-4,dur:.5,dy:300,t1:96.7,fade:.1});
  const k=E.outBack(P(t,96.7,.6));tf(c5,{x:1520,y:lerp(1500,500,E.outCubic(P(t,96.7,.6))),r:lerp(10,-3,k),s:.7+.3*k,o:t>=96.7?1:0});
  pop(st,t,97.9,520,930,{dur:.4,r:-5,r0:15});confUpd(C,t,97.9,520,930,.8)}});
