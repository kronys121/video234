wipes.push([458.21,YEL,PUR,1],[481.0,CY,PINK,-1],[508.82,PUR,YEL,1],[526.34,GRN,PUR,-1],[563.99,PINK,CY,1],[572.63,YEL,PUR,-1],[579.91,PUR,CY,1]);
[463.1,467.5,474.58,484.8,488.34,491.78,499.14,503.94,510.98,515.54,523.22,533.0,537.83,543.35,552.55,556.07,560.3,576.71,578.47].forEach(t=>flashes.push([t,.15,'#fff']));
// ===== E1 458.21-463.1 =====
scene(458.21,463.1,PUR,PUR2,sc=>{
 const R=[row(sc,110,130,80,[['НО',458.2,GRY],['ПО-НАСТОЯЩЕМУ',458.4,GRY]],0),row(sc,110,270,110,[['ВЫВЕЛО',459.4,YEL],['ЕЁ',459.7,YEL]],0),row(sc,110,420,90,[['ДАЛЕКО',460.0],['ЗА',460.4],['ПРЕДЕЛЫ',460.7,PINK]],0),row(sc,110,560,70,[['БОЛЬШИНСТВА',461.0],['ДРУГИХ',461.5]],0),row(sc,110,680,100,[['ПРОЕКТОВ',462.0,CY]],0)];
 const rings=[0,1,2].map(i=>ab(sc,`width:300px;height:300px;border-radius:50%;border:12px solid ${[PINK,YEL,CY][i]}`));
 const c5=cvr(sc,420,'assets/cover5.jpg',AR5);const dots=Array.from({length:10},(_,i)=>ab(sc,`width:70px;height:70px;border-radius:14px;background:#4a3aa0`));
 return t=>{R.forEach(r=>rowUpd(r,t));
  const k=E.outBack(P(t,459.4,.55));tf(c5,{x:1530,y:lerp(1400,500,E.outCubic(P(t,459.4,.55))),r:lerp(10,-3,k),s:.7+.3*k,o:t>=459.4?1:0});
  rings.forEach((r,i)=>{const tau=t-460.0-i*.35;const p=tau<0?0:(tau/1.6)%1;tf(r,{x:1530,y:500,s:.8+p*3.5,o:tau<0?0:(1-p)*.8})});
  dots.forEach((d,i)=>{const a=i*36;const p=E.outCubic(P(t,461.0+i*.05,.9));tf(d,{x:1530+Math.cos(a*Math.PI/180)*(300+p*500),y:500+Math.sin(a*Math.PI/180)*(300+p*400),s:.8,r:p*180,o:t>=461.0?(1-p)*.9+.1*(1-p):0})})}});

// ===== E2 463.1-467.5 =====
scene(463.1,467.5,PUR,PUR2,sc=>{
 const R=[row(sc,110,140,90,[['НАСКОЛЬКО',463.2,GRY],['ОНА',463.7,GRY]],0),row(sc,110,270,100,[['ОКАЗАЛАСЬ',464.0,GRY]],0),row(sc,110,430,140,[['ДОСТУПНОЙ',464.4,YEL]],0),row(sc,110,610,120,[['НА',465.1],['РАЗНЫХ',465.3]],0),row(sc,110,770,150,[['КОНСОЛЯХ',465.5,CY]],0),row(sc,110,930,130,[['СНАЧАЛА',465.7,PINK]],0)];
 const cs=[['ps4',200,1460,260],['xone',250,1750,270],['x360',280,1300,680],['ps5',280,1530,700],['xs',260,1770,690]].map(([k,h,x,y])=>({c:conCard(sc,k,h),x,y}));
 return t=>{R.forEach(r=>rowUpd(r,t));cs.forEach((o,i)=>pop(o.c,t,[464.4,464.8,465.1,465.5,465.9][i],o.x,o.y,{dur:.45,dy:260,r:(i%2?3:-3),r0:10}))}});

// ===== E3 467.5-474.58 =====
scene(467.5,474.58,'#14335c','#1d4a85',sc=>{
 const R=[row(sc,110,130,90,[['ВЫШЛА',467.5],['НА',467.8]],0),row(sc,110,290,100,[['PLAYSTATION',467.9,CY],['3',468.6,CY]],0),row(sc,110,460,120,[['И',468.9],['XBOX',469.1,GRN],['360',469.6,GRN]],0),row(sc,110,620,90,[['В',471.0],['ТОТ',471.1],['ПЕРИОД',471.3]],0),row(sc,110,740,90,[['У',471.7],['ИГРЫ',471.8],['БЫЛИ',472.0]],0),row(sc,110,880,130,[['МИЛЛИОНЫ',472.3,YEL]],0),row(sc,110,1000,70,[['ЕЖЕДНЕВНЫХ',473.0],['ИГРОКОВ',473.6,PINK]],0)];
 const ps=psBox(sc,380);const xb=conCard(sc,'x360',400);const crowd=Array.from({length:18},(_,i)=>person(sc,56,[PINK,YEL,GRN,CY,WHT,'#b9aef5'][i%6]));
 return t=>{R.forEach(r=>rowUpd(r,t));
  const k=E.outBack(P(t,467.9,.5));tf(ps,{x:1380,y:lerp(1300,330,E.outCubic(P(t,467.9,.5))),s:.6+.4*k,r:lerp(8,-2,k),o:t>=467.9?1:0});pop(xb,t,469.1,1700,350,{dur:.5,dy:300,r:3});
  crowd.forEach((c,i)=>{const st=472.3+i*.07;pop(c,t,st,1230+(i%6)*110,700+Math.floor(i/6)*110,{dur:.3,dy:80,s:1})})}});

// ===== E4 474.58-481.0 =====
scene(474.58,481.0,PINK,'#ff7a8c',sc=>{
 const R=[row(sc,110,130,90,[['В',474.7,PUR],['ОТЛИЧИЕ',474.9,PUR],['ОТ',475.2,PUR]],0),row(sc,110,250,80,[['БОЛЬШИНСТВА',475.3,PUR],['ИГР,',475.9,PUR]],0),row(sc,110,380,110,[['ПРИВЯЗАННЫХ',476.3,WHT]],0),row(sc,110,510,80,[['К',476.8,PUR],['СВОЕЙ',476.9,PUR],['ПЛАТФОРМЕ,',477.1,PUR]],0),row(sc,110,700,200,[['ГТА',478.0,WHT],['5',478.5,YEL]],0),row(sc,110,870,90,[['ПРОДОЛЖАЛА',478.7,PUR],['РАСТИ',479.4,WHT]],0),row(sc,110,980,80,[['И',480.0,PUR],['ПОЗЖЕ',480.3,PUR],['ВЫШЛА',480.7,PUR]],0)];
 const ps=psBox(sc,330);const lk=ab(sc,'width:150px;height:190px');
 const sh=div(lk,`position:absolute;left:30px;top:0;width:90px;height:100px;border:22px solid ${PUR};border-bottom:none;border-radius:60px 60px 0 0;transform-origin:20px 100px`);div(lk,`position:absolute;left:0;top:80px;width:150px;height:110px;border-radius:24px;background:${YEL};box-shadow:0 10px 0 ${YELd}`);
 const c5=cvr(sc,380,'assets/cover5.jpg',AR5);const bars=Array.from({length:6},(_,i)=>ab(sc,`width:70px;height:${60+i*38}px;border-radius:12px 12px 0 0;background:${[PUR,CY,GRN,YEL,PINKd,WHT][i]};transform-origin:50% 100%`));
 return t=>{R.forEach(r=>rowUpd(r,t));
  pop(ps,t,476.3,1330,380,{dur:.5,dy:300,r:-3});pop(lk,t,476.8,1400,420,{dur:.35,t1:478.7,fade:.2});sh.style.transform=`rotate(${t>=478.0?-50*E.outBack(P(t,478.0,.25)):0}deg) translateY(${t>=478.0?-14:0}px)`;
  pop(c5,t,478.0,1700,360,{dur:.5,dy:300,r:3,r0:15});
  bars.forEach((b,i)=>{const st=479.4+i*.18;tf(b,{x:1250+i*100,y:990,ay:1,sy:E.outBack(P(t,st,.45)),sx:1,o:t>=st?1:0})})}});

// ===== E5a 481.0-484.8 =====
scene(481.0,484.8,PINK,'#ff7a8c',sc=>{
 const R=[row(sc,110,160,100,[['НОВЫХ',481.2,PUR]],0),row(sc,110,300,100,[['КОНСОЛЯХ:',481.5,WHT]],0),row(sc,110,540,100,[['PLAYSTATION',482.4,PUR],['4',483.0,WHT]],0),row(sc,110,740,150,[['XBOX',483.7,PUR],['ONE',484.2,WHT]],0)];
 const a=conCard(sc,'ps4',400),b=conCard(sc,'xone',380);
 return t=>{R.forEach(r=>rowUpd(r,t));pop(a,t,482.4,1560,300,{dur:.5,dy:300,r:-3,r0:10});pop(b,t,483.7,1560,760,{dur:.5,dy:300,r:3,r0:-10})}});
// ===== E5b 484.8-488.34 =====
scene(484.8,488.34,CY,'#7adbf7',sc=>{
 const R=[row(sc,110,130,80,[['А',484.8,PUR],['ЗАТЕМ',484.9,PUR],['И',485.2,PUR],['НА',485.3,PUR]],0),row(sc,110,330,100,[['PLAYSTATION',485.5,PUR],['5',486.1,WHT]],0),row(sc,110,520,120,[['И',486.5,PUR],['XBOX',486.7,WHT]],0),row(sc,110,700,150,[['SERIES',487.1,PUR],['X',487.6,WHT]],0)];
 const a=conCard(sc,'ps5',400),b=conCard(sc,'xs',360);
 return t=>{R.forEach(r=>rowUpd(r,t));pop(a,t,485.5,1560,300,{dur:.5,dy:300,r:3,r0:10});pop(b,t,486.7,1560,760,{dur:.5,dy:300,r:-3,r0:-10})}});

// ===== E6 488.34-491.78 =====
scene(488.34,491.78,YEL,'#ffd86b',sc=>{
 const R=[row(sc,110,170,100,[['К',488.3,PUR],['ТОМУ',488.4,PUR],['МОМЕНТУ',488.7,PUR]],0),row(sc,110,330,110,[['САМОЙ',489.1,PUR],['ИГРЕ',489.5,PUR]],0),row(sc,110,500,100,[['БЫЛО',489.8,PUR],['УЖЕ',490.1,PUR],['ОКОЛО',490.3,PUR]],0),row(sc,110,740,150,[['СЕМИ',490.7,PINKd],['ЛЕТ',491.1,PINKd]],0)];
 const cake=ab(sc,'width:520px;height:420px');
 div(cake,`position:absolute;left:0;top:200px;width:520px;height:220px;border-radius:30px;background:${PINK};box-shadow:0 14px 0 ${PINKd}`);div(cake,`position:absolute;left:60px;top:110px;width:400px;height:110px;border-radius:26px;background:#fff;box-shadow:0 10px 0 #d8d3f5`);
 div(cake,`position:absolute;left:0;top:190px;width:520px;height:40px;border-radius:20px;background:#fff`);div(cake,`position:absolute;left:0;top:300px;width:520px;height:80px;display:flex;align-items:center;justify-content:center;font-size:70px;color:#fff`,'ГТА 5');
 const cd=Array.from({length:7},(_,i)=>{const c=ab(sc,'width:22px;height:90px');div(c,`position:absolute;left:0;bottom:0;width:22px;height:70px;border-radius:6px;background:${[CY,GRN,PUR][i%3]}`);const f=div(c,`position:absolute;left:1px;top:0;width:20px;height:30px;background:${YEL};border-radius:50% 50% 50% 50%/60% 60% 40% 40%`);c.f=f;return c});
 return t=>{R.forEach(r=>rowUpd(r,t));pop(cake,t,489.5,1560,640,{dur:.5,dy:300,r:-2});
  cd.forEach((c,i)=>{const st=489.9+i*.2;pop(c,t,st,1360+i*66,480,{dur:.3,dy:-120});c.f.style.transform=`scaleY(${1+Math.sin(t*14+i)*.2})`})}});

// ===== E7 491.78-499.14 =====
scene(491.78,499.14,GRN,'#6ee9b6',sc=>{
 const P1=[row(sc,110,140,110,[['ОНА',491.8,PUR],['ПЕРЕЖИЛА',492.1,PUR]],0),row(sc,110,290,100,[['НЕСКОЛЬКО',492.6,PUR],['ЭПОХ',493.1,WHT]],0),row(sc,110,430,100,[['В',493.5,PUR],['ИГРАХ',493.5,PUR]],0),row(sc,110,580,80,[['ПРИВЛЕКАЛА',494.7,PUR],['НОВЫХ',495.2,PUR]],0),row(sc,110,690,80,[['ИГРОКОВ',495.5,PUR],['С',496.0,PUR],['КАЖДЫМ',496.1,PUR]],0),row(sc,110,830,130,[['ПОКОЛЕНИЕМ',496.4,WHT]],0)];
 const P2=[row(sc,110,300,110,[['НО',497.4,PUR],['И',497.5,PUR],['СОХРАНЯЛА',497.6,PUR]],0),row(sc,110,540,250,[['СТАРЫХ',498.2,PINKd]],0)];
 const cs=[['x360',200,1250],['ps4',200,1480],['ps5',200,1750]].map(([k,h,x])=>({c:conCard(sc,k,h),x}));
 const ps=Array.from({length:8},(_,i)=>person(sc,60,i<5?GRN:PUR));const hr=heart(sc,160);
 return t=>{P1.forEach(r=>rowUpd(r,t,{o:1-P(t,497.1,.2)}));P2.forEach(r=>rowUpd(r,t));
  cs.forEach((o,i)=>pop(o.c,t,[493.1,493.5,494.0][i],o.x,300,{dur:.4,dy:200}));
  ps.forEach((p,i)=>pop(p,t,494.7+i*.28,1230+i*88,700,{dur:.35,dy:100}));pop(hr,t,498.2,1560,860,{dur:.4,r0:20})}});

// ===== E8 499.14-503.94 =====
scene(499.14,503.94,PUR,PUR2,sc=>{
 const R=[row(sc,110,150,110,[['КАЗАЛОСЬ',499.1],['БЫ,',499.6]],0),row(sc,110,320,130,[['ПОСЛЕ',500.0],['ПИКА',500.3,YEL]],0),row(sc,110,480,110,[['ПОПУЛЯРНОСТИ',500.6,YEL]],0),row(sc,110,650,100,[['ИГРОКИ',501.5],['ДОЛЖНЫ',501.9]],0),row(sc,110,800,130,[['ПОСТЕПЕННО',502.3,PINK]],0),row(sc,110,960,160,[['УХОДИТЬ',502.9,CY]],0)];
 const box=ab(sc,`width:640px;height:460px;border-radius:30px;background:#0d0830;box-shadow:0 14px 0 #070420;overflow:hidden`);
 const ch=svgPath(box,640,460,'M 40 400 C 120 380, 170 90, 280 70 S 440 280, 600 390',GRN,16);
 const pk=ab(sc,`width:90px;height:90px;background:${YEL};clip-path:${star(5,50,22)}`);
 return t=>{R.forEach(r=>rowUpd(r,t));pop(box,t,499.6,1520,460,{dur:.5,dy:300,r:-2});
  ch.p.style.strokeDashoffset=ch.len*(1-P(t,500.0,3.0));pop(pk,t,500.3,1420,330,{dur:.4,r0:40})}});

// ===== E9 503.94-508.82 =====
scene(503.94,508.82,YEL,'#ffd86b',sc=>{
 const R=[row(sc,110,150,100,[['С',503.9,PUR],['ГТА',504.1,PUR],['ВЫШЛО',504.6,PUR]],0),row(sc,110,310,100,[['РОВНО',505.1,PUR],['НАОБОРОТ:',505.5,PINKd]],0),row(sc,110,520,110,[['ЛЮДИ',506.5,PUR],['ОСТАЮТСЯ',506.9,PUR]],0),row(sc,110,700,140,[['ВЕРНЫ',507.5,PUR],['ИГРЕ',507.9,PINKd]],0)];
 const c5=cvr(sc,460,'assets/cover5.jpg',AR5);const ps=Array.from({length:6},(_,i)=>person(sc,70,[PINK,PUR,GRN,CY,PINKd,PUR][i]));const hs=[0,1,2].map(()=>heart(sc,90));
 const box=ab(sc,`width:520px;height:300px;border-radius:26px;background:#0d0830`);const ch=svgPath(box,520,300,'M 30 260 C 140 250, 250 150, 490 30',GRN,14);
 return t=>{R.forEach(r=>rowUpd(r,t));
  const k=E.outBack(P(t,505.1,.55));tf(c5,{x:1280,y:lerp(1400,360,E.outCubic(P(t,505.1,.55))),r:lerp(10,-3,k),s:.7+.3*k,o:t>=505.1?1:0});
  pop(box,t,505.5,1690,330,{dur:.5,dy:300,r:3,s:.85});ch.p.style.strokeDashoffset=ch.len*(1-P(t,505.7,2.2));
  ps.forEach((p,i)=>pop(p,t,506.5+i*.2,1280+i*100,800,{dur:.35,dy:100}));
  hs.forEach((h,i)=>{const st=507.9+i*.15;const ph=((t-st)*.7)%1;tf(h,{x:1280+i*150,y:700-ph*140,s:.8,o:t>=st?1-ph:0})})}});

// ===== E10 508.82-510.98 =====
scene(508.82,510.98,PINKd,'#d9566b',sc=>{
 const R=[row(sc,110,330,160,[['ПРИЧИНА',508.8,WHT]],0),row(sc,110,570,115,[['ОНЛАЙН-РЕЖИМ',509.8,YEL]],0)];
 const card=framed(sc,760,428);const vc=clip(card,'on',1946,'left:0;top:0;width:100%;height:100%');
 return t=>{clipT(vc,5+(t-508.82));R.forEach(r=>rowUpd(r,t));pop(card,t,509.6,1500,540,{dur:.55,dy:400,r:-3,r0:10})}});

// ===== E11 510.98-515.54 =====
scene(510.98,515.54,PUR,PUR2,sc=>{
 const R=[row(sc,110,140,100,[['ПОДУМАЙТЕ',511.0],['САМИ:',511.5,GRY]],0),row(sc,110,300,110,[['ЗАЧЕМ',512.1],['ПРОХОДИТЬ',512.5]],0),row(sc,110,470,130,[['СЮЖЕТ',512.9,YEL],['ЗАНОВО,',513.3,YEL]],0),row(sc,110,650,90,[['ЕСЛИ',513.9],['ВЫ',514.1],['ЕГО',514.3]],0),row(sc,110,830,150,[['УЖЕ',514.4],['ПРОШЛИ?',514.7,PINK]],0)];
 const tl=tile(sc,520,300,'#fff','rgba(0,0,0,.3)',`<div style="font-size:48px;color:${PUR}">СЮЖЕТ</div>`,36);const bar=div(tl,`width:420px;height:40px;border-radius:20px;background:#e7e3fb;margin-top:20px;position:relative;overflow:hidden`);const f=div(bar,`position:absolute;left:0;top:0;height:100%;width:0;background:${GRN}`);
 const rp=ab(sc,`width:200px;height:200px;border-radius:50%;border:30px solid ${CY};border-top-color:transparent`);const xm=xmark(sc,150);const ck=checkmark(sc,110);
 return t=>{R.forEach(r=>rowUpd(r,t));pop(tl,t,512.1,1540,330,{dur:.5,dy:300,r:-2});f.style.width=(P(t,512.3,2.0)*100)+'%';pop(ck,t,514.4,1800,330,{dur:.35,r0:20});
  tf(rp,{x:1540,y:740,r:t*200,o:t>=512.9?1:0,s:E.outBack(P(t,512.9,.4))});pop(xm,t,513.9,1540,740,{dur:.35,r0:30})}});

// ===== E12 515.54-523.22 =====
scene(515.54,523.22,'#14335c','#1d4a85',sc=>{
 const P1=[row(sc,110,140,90,[['КОНЕЧНО,',515.5],['МНОГИЕ',516.0]],0),row(sc,110,270,100,[['ЭТО',516.3],['ДЕЛАЮТ',516.5]],0),row(sc,110,380,80,[['РАДИ',516.9,GRY]],0),row(sc,110,530,120,[['НОСТАЛЬГИИ',517.1,YEL]],0),row(sc,110,690,80,[['ИЛИ',517.9],['ЛЮБВИ',518.2,PINK],['К',518.5],['ИГРЕ,',518.7]],0)];
 const P2=[row(sc,110,200,80,[['НО',519.3],['БОЛЬШИНСТВО',519.5]],0),row(sc,110,360,130,[['НЕ',520.1,PINK],['СТАНЕТ',520.3,PINK]],0),row(sc,110,520,100,[['ПЕРЕПРОХОДИТЬ',520.7]],0),row(sc,110,690,100,[['ТО,',521.4],['ЧТО',521.6],['УЖЕ',521.9]],0),row(sc,110,860,130,[['ЗАКОНЧИЛО',522.0,GRN]],0)];
 const ps=psBox(sc,420);const hr=heart(sc,170);
 const cr=Array.from({length:10},(_,i)=>person(sc,70,[PINK,YEL,GRN,CY,WHT][i%5]));const hs=[0,1].map(()=>heart(sc,70));
 return t=>{P1.forEach(r=>rowUpd(r,t,{o:1-P(t,519.1,.2)}));P2.forEach(r=>rowUpd(r,t));
  const k=E.outBack(P(t,517.1,.5));tf(ps,{x:1560,y:lerp(1300,520,E.outCubic(P(t,517.1,.5))),s:(.6+.4*k)*(t<519.2?1:0),r:lerp(8,-2,k),o:(t>=517.1&&t<519.3)?1:0});ps.style.filter='sepia(.6)';
  pop(hr,t,518.2,1760,300,{dur:.4,r0:20,t1:519.3,fade:.2});
  cr.forEach((c,i)=>{const gx=i%5,gy=Math.floor(i/5);const stay=i<2;const leave=t>=520.1&&!stay?E.inCubic(P(t,520.1+i*.12,1.0)):0;pop(c,t,519.4+i*.06,1270+gx*130+leave*700,560+gy*200,{dur:.3,dy:60,t1:stay?1e9:520.1+i*.12+1.0})});
  hs.forEach((h,i)=>pop(h,t,521.9,1270+i*130,450,{dur:.4,r0:20}))}});

// ===== E13 523.22-526.34 =====
scene(523.22,526.34,CY,'#7adbf7',sc=>{
 const R=[row(sc,110,250,150,[['ROCKSTAR',523.2,PUR]],0),row(sc,110,420,110,[['ЭТО',523.8,PUR],['ПОНИМАЛА',524.0,PUR]],0),row(sc,110,590,130,[['И',524.7,PUR],['ДОБАВИЛА',525.0,WHT]],0),row(sc,110,800,220,[['ОНЛАЙН',525.5,PINKd]],0)];
 const lg=ab(sc,'width:360px;height:331px');const li=new Image();li.src='assets/rockstar.png';li.style.cssText='width:100%;height:100%';lg.appendChild(li);
 const gl=ab(sc,'width:380px;height:380px');div(gl,`position:absolute;inset:0;border-radius:50%;background:${PUR};box-shadow:0 14px 0 #0d0830`);
 [.35,.7].forEach(x=>div(gl,`position:absolute;left:${x*380-190*(x)}px;top:0;width:${380*(1-Math.abs(x-.5)*1.4)}px;height:380px;left:${(380-380*(1-Math.abs(x-.5)*1.4))/2}px;border-radius:50%;border:5px solid #4a3aa0`));
 div(gl,`position:absolute;left:0;top:188px;width:380px;height:5px;background:#4a3aa0`);
 const nd=[[80,120],[250,90],[160,230],[270,260],[110,300]].map(([x,y],i)=>div(gl,`position:absolute;left:${x}px;top:${y}px;width:34px;height:34px;border-radius:50%;background:${[PINK,YEL,GRN,CY,PINK][i]}`));
 return t=>{R.forEach(r=>rowUpd(r,t));pop(lg,t,523.4,1560,300,{dur:.5,r:-6,r0:15});pop(gl,t,525.5,1560,740,{dur:.5,dy:300,r:-3});nd.forEach((n,i)=>n.style.transform=`scale(${1+Math.sin(t*6+i)*.2})`)}});

// ===== E14a 526.34-533.0 =====
scene(526.34,533.0,PUR,PUR2,sc=>{
 const R=[row(sc,110,130,80,[['ЭТО',526.3],['БЫЛ',526.5],['НЕ',526.7],['ПРОСТО',526.9]],0),row(sc,110,250,110,[['ОБЫЧНЫЙ',527.2,GRY]],0),row(sc,110,400,110,[['МУЛЬТИПЛЕЕР',527.7,GRY]],0),row(sc,110,570,100,[['А',528.5],['ЦИФРОВОЙ',528.6,CY],['МИР,',529.2,CY]],0),row(sc,110,720,90,[['ГДЕ',529.7],['ИГРОКИ',529.9],['САМИ',530.3]],0),row(sc,110,840,90,[['МОГЛИ',530.7],['СОЗДАВАТЬ',531.1,YEL]],0),row(sc,110,960,80,[['СВОЙ',531.6],['ОТКРЫТЫЙ',532.0],['МИР',532.5,PINK]],0)];
 const strike=ab(sc,`width:640px;height:14px;border-radius:7px;background:${PINK};transform-origin:left center`);
 const card=framed(sc,760,428);const vc=clip(card,'on',1946,'left:0;top:0;width:100%;height:100%');
 const ms=[0,1,2].map(()=>worldMap(sc,200,126));
 return t=>{clipT(vc,(t-526.34)*1.0);R.forEach(r=>rowUpd(r,t));
  tf(strike,{x:110,y:400,ax:0,sx:E.outCubic(P(t,528.2,.4)),o:t>=528.2?1:0});
  pop(card,t,527.2,1530,330,{dur:.55,dy:400,r:2,r0:-8});
  ms.forEach((m,i)=>pop(m,t,531.1+i*.45,1300+i*230,760,{dur:.4,dy:150,r:(i-1)*4}))}});

// ===== E14b 533.0-537.83 =====
scene(533.0,537.83,GRN,'#6ee9b6',sc=>{
 const R=[row(sc,110,140,90,[['В',533.0,PUR],['ЭТОМ',533.2,PUR],['РЕЖИМЕ',533.4,PUR]],0),row(sc,110,290,120,[['НЕ',533.8,PINKd],['НУЖНО',534.0,PINKd]],0),row(sc,110,430,130,[['ВЫПОЛНЯТЬ',534.4,PUR]],0),row(sc,110,580,120,[['НАДОЕВШИЕ',534.8,PUR]],0),row(sc,110,740,160,[['МИССИИ',535.4,WHT]],0),row(sc,110,880,80,[['МОЖНО',536.3,PUR],['ПРИДУМЫВАТЬ',536.6,PUR]],0),row(sc,110,990,110,[['СВОИ',537.0,PINKd]],0)];
 const a=ab(sc,`width:480px;height:300px;border-radius:36px;background:#fff;box-shadow:0 14px 0 rgba(0,0,0,.28);overflow:hidden`);[0,1,2].forEach(i=>div(a,`position:absolute;left:40px;top:${50+i*80}px;width:${[360,300,330][i]}px;height:34px;border-radius:17px;background:#cfcbe8`));
 const xm=xmark(sc,150);const b=tile(sc,520,300,PINK,PINKd,`<div style="font-size:120px;color:#fff;line-height:1">+</div><div style="font-size:44px;color:#fff">СВОЯ МИССИЯ</div>`,40);
 const sp=Array.from({length:6},()=>ab(sc,`width:30px;height:30px;background:${YEL};clip-path:${star(4,50,18)}`));
 return t=>{R.forEach(r=>rowUpd(r,t));pop(a,t,534.4,1560,300,{dur:.45,dy:300,r:-2});pop(xm,t,535.4,1560,300,{dur:.35,r0:30});
  pop(b,t,536.6,1560,730,{dur:.5,dy:300,r:2});sp.forEach((s,i)=>{const a2=i*60+t*80;tf(s,{x:1560+Math.cos(a2*Math.PI/180)*320,y:730+Math.sin(a2*Math.PI/180)*220,r:a2,o:t>=536.9?1:0})})}});

// ===== E15 537.83-543.35 =====
scene(537.83,543.35,YEL,'#ffd86b',sc=>{
 const P1=[row(sc,110,140,100,[['ОДНИ',537.8,PUR]],0),row(sc,110,260,80,[['КОЛЛЕКЦИОНИРУЮТ',538.2,PINKd]],0),row(sc,110,400,110,[['РОСКОШНЫЕ',539.0,PUR]],0),row(sc,110,540,150,[['МАШИНЫ',539.5,PINKd]],0)];
 const P2=[row(sc,110,150,100,[['ДРУГИЕ',540.2,PUR]],0),row(sc,110,280,80,[['ПРОСТО',540.6,PUR],['УСТРАИВАЮТ',541.0,PUR]],0),row(sc,110,470,220,[['ХАОС',541.6,PINKd]],0),row(sc,110,700,80,[['ВМЕСТЕ',542.0,PUR],['С',542.3,PUR],['ДРУЗЬЯМИ',542.4,PUR]],0)];
 const c1=framed(sc,700,394);const v1=clip(c1,'on',1946,'left:0;top:0;width:100%;height:100%');const c2=framed(sc,700,394);const v2=clip(c2,'on',1946,'left:0;top:0;width:100%;height:100%');
 const fr=[PINK,GRN,CY].map(c=>person(sc,80,c));const sb=ab(sc,`width:220px;height:220px;background:${PINK};clip-path:${star(12,50,40)};display:flex;align-items:center;justify-content:center;font-size:56px;color:#fff`,'ХАОС');
 return t=>{clipT(v1,1+(t-538.2)*.8);clipT(v2,34+(t-540.2)*1.0);P1.forEach(r=>rowUpd(r,t,{o:1-P(t,540.0,.2)}));P2.forEach(r=>rowUpd(r,t));
  pop(c1,t,538.4,1530,420,{dur:.5,dy:400,r:-2,t1:540.1,fade:.15});pop(c2,t,540.3,1530,420,{dur:.5,dy:400,r:2});
  fr.forEach((f,i)=>pop(f,t,542.0+i*.2,1330+i*130,800,{dur:.35,dy:100}));pop(sb,t,541.6,1800,200,{dur:.4,r:12,r0:30})}});

// ===== E16 543.35-552.55 =====
scene(543.35,552.55,PUR,PUR2,sc=>{
 const P1=[row(sc,110,140,90,[['БЛАГОДАРЯ',543.4],['ЭТОМУ',543.8]],0),row(sc,110,270,110,[['РЕЖИМУ',544.2,YEL]],0),row(sc,110,420,110,[['ИГРА',544.6],['НИКОГДА',545.1]],0),row(sc,110,560,90,[['НЕ',545.6],['ОЩУЩАЕТСЯ',545.8]],0),row(sc,110,720,115,[['ЗАКОНЧЕННОЙ',546.3,PINK]],0)];
 const P2=[row(sc,110,150,100,[['ВСЕГДА',547.3],['ЕСТЬ',547.8]],0),row(sc,110,290,120,[['К',548.0],['ЧЕМУ',548.2]],0),row(sc,110,440,120,[['СТРЕМИТЬСЯ',548.4,YEL]],0),row(sc,110,620,120,[['БОГАТСТВО',549.6,GRN]],0),row(sc,110,750,100,[['НЕДВИЖИМОСТЬ',550.4,CY]],0),row(sc,110,900,120,[['АВТОМОБИЛИ',551.4,PINK]],0)];
 const r1=ab(sc,`width:260px;height:260px;border-radius:50%;border:36px solid ${YEL}`),r2=ab(sc,`width:260px;height:260px;border-radius:50%;border:36px solid ${PINK}`);const dot=ab(sc,`width:40px;height:40px;border-radius:50%;background:#fff`);
 const it=[0,1,2].map(i=>tile(sc,260,200,[YEL,CY,PINK][i],'rgba(0,0,0,.28)','',40));
 [0,1,2].forEach(k=>div(it[0],`position:absolute;left:${70+k*30}px;top:${110-k*24}px;width:80px;height:80px;border-radius:50%;background:#fff3b0;border:6px solid ${YELd}`));
 div(it[1],`position:absolute;left:60px;top:60px;width:140px;height:110px;background:${PUR}`);div(it[1],`position:absolute;left:40px;top:20px;width:180px;height:60px;background:${PINK};clip-path:polygon(50% 0,100% 100%,0 100%)`);
 carEl(it[2],180,PUR).style.cssText+=';left:40px;top:60px';
 return t=>{P1.forEach(r=>rowUpd(r,t,{o:1-P(t,547.1,.2)}));P2.forEach(r=>rowUpd(r,t));
  pop(r1,t,545.1,1440,540,{dur:.4,t1:547.2,fade:.15});pop(r2,t,545.1,1640,540,{dur:.4,t1:547.2,fade:.15});
  const a=t*3;tf(dot,{x:1540+Math.cos(a)*200,y:540+Math.sin(a*2)*100,o:(t>=545.1&&t<547.2)?1:0});
  [549.6,550.4,551.4].forEach((st,i)=>pop(it[i],t,st,1600,300+i*270,{dur:.45,dy:100,r:(i-1)*3}))}});

// ===== E17 552.55-556.07 =====
scene(552.55,556.07,GRN,'#6ee9b6',sc=>{
 const R=[row(sc,110,170,130,[['НОВЫЙ',552.6,PUR]],0),row(sc,110,320,90,[['ОНЛАЙН-КОНТЕНТ',553.0,WHT]],0),row(sc,110,490,110,[['ПОМОГАЛ',553.8,PUR],['ИГРЕ',554.3,PUR]],0),row(sc,110,650,130,[['ОСТАВАТЬСЯ',554.6,PUR]],0),row(sc,110,830,120,[['АКТУАЛЬНОЙ',555.1,WHT]],0)];
 const cds=[0,1,2].map(i=>{const d=tile(sc,420,230,[PUR,'#2a1d68','#4a3aa0'][i],'#0d0830',`<div style="font-size:50px;color:#fff">ОБНОВЛЕНИЕ ${i+1}</div>`,36);const nb=ab(d,`width:110px;height:110px;background:${YEL};clip-path:${star(10,50,40)};display:flex;align-items:center;justify-content:center;font-size:30px;color:${PUR};left:300px;top:-30px`,'NEW');return d});
 return t=>{R.forEach(r=>rowUpd(r,t));[553.0,553.8,554.6].forEach((st,i)=>pop(cds[i],t,st,1560+(i-1)*20,250+i*250,{dur:.45,dy:200,r:(i-1)*4}))}});

// ===== E18a 556.07-560.3 =====
scene(556.07,560.3,PINKd,'#d9566b',sc=>{
 const R=[row(sc,110,130,90,[['МЫ',556.1],['ВСЕ',556.2],['ВИДЕЛИ',556.5]],0),row(sc,110,290,130,[['НА',556.8],['YOUTUBE',557.0,WHT]],0),row(sc,110,450,105,[['ПАРКУР-КАРТЫ',557.4,YEL]],0),row(sc,110,610,110,[['С',558.2],['ТРЮКАМИ',558.3]],0),row(sc,110,770,100,[['И',558.9],['КАСТОМНЫЕ',559.0,CY]],0),row(sc,110,930,150,[['ТРАССЫ',559.6]],0)];
 const card=framed(sc,760,428);const vc=clip(card,'on',1946,'left:0;top:0;width:100%;height:100%');
 const pl=ab(card,`width:140px;height:100px;border-radius:30px;background:#f33;display:flex;align-items:center;justify-content:center;left:310px;top:164px`,`<div style="width:0;height:0;border-left:44px solid #fff;border-top:28px solid transparent;border-bottom:28px solid transparent"></div>`);pl.style.position='absolute';
 const ch=['ПАРКУР','ТРЮКИ','ТРАССЫ'].map((l,i)=>tile(sc,220,100,[YEL,CY,GRN][i],'rgba(0,0,0,.28)',`<div style="font-size:40px;color:${PUR}">${l}</div>`,28));
 return t=>{clipT(vc,30+(t-556.5)*1.0);R.forEach(r=>rowUpd(r,t));pop(card,t,556.8,1530,360,{dur:.55,dy:400,r:2,r0:-8});tf(pl,{x:380,y:214,s:1-.9*P(t,557.6,.3),o:1});pl.style.left='0';pl.style.top='0';
  [557.4,558.3,559.6].forEach((st,i)=>pop(ch[i],t,st,1330+i*230,760,{dur:.35,dy:100,r:(i-1)*3}))}});
// ===== E18b 560.3-563.99 =====
scene(560.3,563.99,'#14335c','#1d4a85',sc=>{
 const R=[row(sc,110,150,100,[['И',560.4],['ТАКИЕ',560.5],['РОЛИКИ',560.8]],0),row(sc,110,310,115,[['ВДОХНОВЛЯЛИ',561.2,YEL]],0),row(sc,110,480,110,[['НОВЫХ',561.9],['ИГРОКОВ',562.2]],0),row(sc,110,660,150,[['ПОКУПАТЬ',562.7,GRN]],0),row(sc,110,880,220,[['ИГРУ',563.2,PINK]],0)];
 const card=framed(sc,480,270);const vc=clip(card,'on',1946,'left:0;top:0;width:100%;height:100%');
 const ps=[0,1,2].map(i=>person(sc,90,[PINK,GRN,CY][i]));const c5=cvr(sc,380,'assets/cover5.jpg',AR5);const bt=tile(sc,300,100,GRN,GRNd,`<div style="font-size:50px;color:#073b2a">КУПИТЬ</div>`,30);
 return t=>{clipT(vc,40+(t-560.3));R.forEach(r=>rowUpd(r,t));pop(card,t,560.5,1560,250,{dur:.5,dy:300,r:-2});
  ps.forEach((p,i)=>pop(p,t,561.9+i*.2,1400+i*160,520,{dur:.35,dy:100}));
  const k=E.outBack(P(t,562.7,.5));tf(c5,{x:1380,y:lerp(1300,800,E.outCubic(P(t,562.7,.5))),s:.7+.3*k,r:-4,o:t>=562.7?1:0});pop(bt,t,563.0,1680,820,{dur:.4,dy:100})}});

// ===== E19 563.99-572.63 =====
scene(563.99,572.63,PUR,PUR2,sc=>{
 const P1=[row(sc,110,150,110,[['ЕСЛИ',564.0],['ЗНАТЬ,',564.3]],0),row(sc,110,300,100,[['С',564.6],['КАКИМИ',564.7]],0),row(sc,110,450,100,[['ОГРАНИЧЕНИЯМИ',565.1,YEL]],0),row(sc,110,600,110,[['СТОЛКНУЛИСЬ',565.9]],0),row(sc,110,760,110,[['РАЗРАБОТЧИКИ',566.5,CY]],0)];
 const P2=[row(sc,110,150,90,[['ОСТАЁТСЯ',567.6],['ТОЛЬКО',568.1]],0),row(sc,110,310,115,[['ВОСХИЩАТЬСЯ',568.3,PINK]],0),row(sc,110,490,100,[['И',569.1],['САМОЙ',569.3],['ИГРОЙ,',569.7]],0),row(sc,110,640,110,[['И',570.4],['ЛЮДЬМИ,',570.5]],0),row(sc,110,790,75,[['КОТОРЫЕ',570.9],['ЕЁ',571.4],['СДЕЛАЛИ',571.7,YEL]],0)];
 const ps=psBox(sc,380);const t1=tile(sc,230,110,GRN,GRNd,'<div style="font-size:52px;color:#073b2a">256 МБ</div>',28),t2=tile(sc,230,110,CY,CYd,'<div style="font-size:52px;color:#0b3c52">256 МБ</div>',28);
 const c5=cvr(sc,420,'assets/cover5.jpg',AR5);const ws=Array.from({length:5},(_,i)=>worker(sc,90,[GRN,PINK,CY,YEL,'#b9aef5'][i]));const hs=Array.from({length:4},()=>heart(sc,60));
 return t=>{P1.forEach(r=>rowUpd(r,t,{o:1-P(t,567.4,.2)}));P2.forEach(r=>rowUpd(r,t));
  pop(ps,t,564.7,1500,430,{dur:.5,dy:300,r:-2,t1:567.5,fade:.2});pop(t1,t,565.9,1280,860,{dur:.4,t1:567.5,fade:.2});pop(t2,t,566.5,1560,860,{dur:.4,t1:567.5,fade:.2});
  const k=E.outBack(P(t,567.7,.5));tf(c5,{x:1560,y:lerp(1400,360,E.outCubic(P(t,567.7,.5))),r:lerp(10,-3,k),s:.7+.3*k,o:t>=567.7?1:0});
  ws.forEach((w,i)=>pop(w,t,570.5+i*.2,1280+i*140,790,{dur:.35,dy:100}));
  hs.forEach((h,i)=>{const st=571.7+i*.2;const ph=((t-st)*.6)%1;tf(h,{x:1330+i*150,y:700-ph*120,o:t>=st?1-ph:0})})}});

// ===== E20 572.63-576.71 =====
scene(572.63,576.71,YEL,'#ffd86b',sc=>{
 const R=[row(sc,110,150,100,[['ВОТ',572.6,PUR],['ТАКИЕ',572.9,PUR],['ИГРЫ',573.4,PUR]],0),row(sc,110,310,130,[['РАСКРЫВАЮТ',573.8,PUR]],0),row(sc,110,470,130,[['ПОТЕНЦИАЛ',574.5,PINKd]],0),row(sc,110,690,260,[['PS3',574.9,PUR]],0),row(sc,110,920,130,[['ДО',575.5,PUR],['ПРЕДЕЛА',575.9,PINKd]],0)];
 const ps=psBox(sc,640);const bar=ab(sc,`width:620px;height:60px;border-radius:30px;background:#0d0830;overflow:hidden;border:5px solid ${PUR}`);const fill=div(bar,`position:absolute;left:0;top:0;height:100%;width:0;background:linear-gradient(90deg,${GRN},${YEL},${PINK})`);
 const C=confetti(sc,40,[PINK,PUR,GRN,CY,WHT],81);
 return t=>{R.forEach(r=>rowUpd(r,t));const k=E.outBack(P(t,574.5,.5));tf(ps,{x:1560,y:lerp(1300,470,E.outCubic(P(t,574.5,.5))),s:.6+.4*k,r:lerp(8,-2,k),o:t>=574.5?1:0});
  pop(bar,t,574.5,1560,900,{dur:.3});fill.style.width=(P(t,574.6,1.3)*100)+'%';confUpd(C,t,575.9,1560,480,.9)}});

// ===== E21 576.71-578.47 =====
scene(576.71,578.47,PINK,'#ff7a8c',sc=>{
 const R=[row(sc,110,260,120,[['А',576.7,PUR],['КАКИЕ',576.8,PUR],['ИГРЫ',577.2,PUR]],0),row(sc,110,500,170,[['Я',577.5,WHT],['УПУСТИЛ?',577.7,YEL]],0)];
 const q=ab(sc,`font-size:700px;color:${PUR};line-height:1`,'?');const c=[conCard(sc,'ps4',160),conCard(sc,'xone',200),conCard(sc,'x360',200)];
 return t=>{R.forEach(r=>rowUpd(r,t));tf(q,{x:1620,y:420,s:E.outElastic(P(t,577.5,.9)),r:-8+Math.sin(t*3)*4,o:t>=577.5?1:0});
  c.forEach((e,i)=>pop(e,t,577.2+i*.2,[330,640,900][i],820,{dur:.4,dy:150,r:(i-1)*4}))}});

// ===== E22 578.47-579.91 =====
scene(578.47,579.91,CY,'#7adbf7',sc=>{
 const R=[row(sc,110,300,200,[['ПИШИТЕ',578.5,PUR]],0),row(sc,110,560,100,[['В',578.8,PUR],['КОММЕНТАРИЯХ',578.9,WHT]],0)];
 const bs=[0,1,2].map(i=>{const b=ab(sc,`width:${[420,380,340][i]}px;height:150px;border-radius:40px;background:${[WHT,YEL,PINK][i]};box-shadow:0 12px 0 rgba(0,0,0,.25)`);div(b,`position:absolute;left:40px;top:40px;width:${[300,260,220][i]}px;height:22px;border-radius:11px;background:${PUR};opacity:.35`);div(b,`position:absolute;left:40px;top:84px;width:${[200,180,140][i]}px;height:22px;border-radius:11px;background:${PUR};opacity:.35`);div(b,`position:absolute;left:${i%2?240:60}px;top:130px;width:50px;height:50px;background:inherit;transform:rotate(45deg)`);return b});
 return t=>{R.forEach(r=>rowUpd(r,t));bs.forEach((b,i)=>pop(b,t,578.9+i*.2,[1500,1640,1520][i],[250,500,760][i],{dur:.35,dy:100,r:(i-1)*3}))}});

// ===== E23 579.91-584.5 =====
scene(579.91,DUR+.5,PUR,PUR2,sc=>{
 const R=[row(sc,110,190,120,[['НА',579.9],['СЕГОДНЯ',580.0]],0),row(sc,110,380,200,[['ВСЁ,',580.4,YEL]],0),row(sc,110,590,110,[['СПАСИБО',581.0],['ЗА',581.4],['ПРОСМОТР,',581.5,CY]],0),row(sc,110,770,110,[['УВИДИМСЯ',582.3],['В',582.8]],0),row(sc,110,920,110,[['СЛЕДУЮЩЕМ',583.0],['ВИДЕО',583.5,PINK]],0)];
 const ps=psBox(sc,360),c5=cvr(sc,300,'assets/cover5.jpg',AR5);const hs=[0,1,2].map(()=>heart(sc,80));
 return t=>{R.forEach(r=>rowUpd(r,t));const k=E.outBack(P(t,580.4,.5));tf(ps,{x:1700,y:lerp(1300,330,E.outCubic(P(t,580.4,.5)))+Math.sin(t*2.4)*8,s:.6+.4*k,r:lerp(8,-2,k),o:t>=580.4?1:0});
  pop(c5,t,581.5,1700,760,{dur:.5,dy:300,r:-6});hs.forEach((h,i)=>{const st=582.3+i*.3;const ph=((t-st)*.5)%1;tf(h,{x:1500+i*90,y:620-ph*200,o:t>=st?1-ph:0,s:.8})})}});
