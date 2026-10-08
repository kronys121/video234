flashes.push([372.49,.2,'#fff'],[375.13,.15,'#fff'],[381.13,.15,'#fff'],[385.69,.15,'#fff'],[393.76,.15,'#fff'],[397.2,.15,'#fff'],[411.89,.15,'#fff'],[415.81,.15,'#fff'],[423.01,.15,'#fff'],[428.37,.15,'#fff'],[436.37,.15,'#fff'],[442.13,.15,'#fff'],[452.29,.15,'#fff']);
wipes.push([397.2,PINK,PUR,1],[428.37,CY,PINK,-1]);
// ===== D1 372.49-375.13 =====
scene(372.49,375.13,YEL,'#ffd86b',sc=>{
 const R=[row(sc,110,200,100,[['ТЕПЕРЬ',372.5,PUR],['О',373.0,PUR]],0),row(sc,110,380,120,[['ДЕТАЛИЗАЦИИ',373.0,PINKd]],0),row(sc,110,560,130,[['САМОГО',373.8,PUR],['МИРА',374.3,PUR]],0)];
 const card=framed(sc,760,428);const vc=clip(card,'on',1946,'left:0;top:0;width:100%;height:100%');
 const mg=ab(sc,'width:300px;height:380px');div(mg,`position:absolute;left:0;top:0;width:300px;height:300px;border-radius:50%;border:24px solid ${PUR};background:rgba(255,255,255,.2)`);div(mg,`position:absolute;left:200px;top:260px;width:30px;height:150px;border-radius:15px;background:${PUR};transform:rotate(-40deg);transform-origin:top center`);
 return t=>{clipT(vc,12+(t-372.49));R.forEach(r=>rowUpd(r,t));pop(card,t,373.0,1500,430,{dur:.55,dy:400,r:-3,r0:10});
  const m=E.inOut(P(t,373.8,.8));tf(mg,{x:lerp(1900,1620,m),y:lerp(900,560,m),o:t>=373.8?1:0,r:0})}});

// ===== D2 375.13-381.13 =====
scene(375.13,381.13,PUR,PUR2,sc=>{
 const R=[row(sc,110,130,100,[['В',375.1],['ЛОС-САНТОСЕ',375.2,YEL]],0),row(sc,110,270,120,[['ПОВСЮДУ',376.0]],0),row(sc,110,430,150,[['ТРАФИК,',376.5,CY]],0),row(sc,110,590,130,[['ПРОХОЖИЕ,',377.1,PINK]],0),row(sc,110,740,120,[['РАЗГОВОРЫ',377.9,GRN]],0),row(sc,110,880,90,[['И',379.0],['ДАЖЕ',379.0],['В',379.3],['ОКЕАНЕ',379.4,CY]],0),row(sc,110,990,100,[['КИПИТ',379.9],['ЖИЗНЬ',380.2,YEL]],0)];
 const card=framed(sc,640,360);const vc=clip(card,'on',1946,'left:0;top:0;width:100%;height:100%');
 const tl=[0,1,2,3].map(i=>tile(sc,160,160,[PINK,YEL,GRN,CY][i],'rgba(0,0,0,.28)','',34));
 carEl(tl[0],110,PUR).style.position='relative';
 const pp=person(tl[1],60,PUR);pp.style.position='relative';
 div(tl[2],`position:relative;width:100px;height:70px;border-radius:24px;background:${PUR};display:flex;align-items:center;justify-content:center;font-size:48px;color:#fff;letter-spacing:4px`,'···');
 const fish=div(tl[3],'position:relative;width:110px;height:60px');div(fish,`position:absolute;left:0;top:5px;width:80px;height:50px;border-radius:50%;background:${PUR}`);div(fish,`position:absolute;left:70px;top:5px;width:40px;height:50px;background:${PUR};clip-path:polygon(0 50%,100% 0,100% 100%)`);
 return t=>{clipT(vc,22+(t-375.13));R.forEach(r=>rowUpd(r,t));pop(card,t,375.5,1540,320,{dur:.55,dy:400,r:2,r0:-8});
  [376.5,377.1,377.9,379.4].forEach((st,i)=>pop(tl[i],t,st,1280+i*180,770,{dur:.4,r:(i%2?3:-3)}))}});

// ===== D3 381.13-385.69 =====
scene(381.13,385.69,CY,'#7adbf7',sc=>{
 const R=[row(sc,110,160,140,[['ROCKSTAR',381.1,PUR]],0),row(sc,110,320,115,[['СНОВА',381.7,PUR],['И',382.1,PUR],['СНОВА',382.2,WHT]],0),row(sc,110,480,120,[['ПОВТОРНО',382.7,PUR]],0),row(sc,110,620,120,[['ИСПОЛЬЗУЕТ',383.4,PUR]],0),row(sc,110,770,90,[['ОДНИ',383.9,PUR],['И',384.3,PUR],['ТЕ',384.4,PUR],['ЖЕ',384.6,PUR]],0),row(sc,110,910,150,[['МОДЕЛИ',384.7,PINKd]],0)];
 const lg=ab(sc,'width:200px;height:184px');const li=new Image();li.src='assets/rockstar.png';li.style.cssText='width:100%;height:100%';lg.appendChild(li);
 const orig=person(sc,120,YEL);const cl=Array.from({length:11},(_,i)=>person(sc,100,PUR));
 return t=>{R.forEach(r=>rowUpd(r,t));pop(lg,t,381.3,1560,170,{dur:.45,r:-6});
  pop(orig,t,381.7,1300,420,{dur:.45});
  cl.forEach((c,i)=>{const gx=(i+1)%4,gy=Math.floor((i+1)/4);const st=382.7+i*.18;const p=E.outCubic(P(t,st,.5));tf(c,{x:lerp(1300,1300+gx*170,p),y:lerp(420,420+gy*230,p),s:.4+.6*E.outBack(P(t,st,.5)),o:t>=st?1:0})})}});

// ===== D4 385.69-393.76 =====
scene(385.69,393.76,PUR,PUR2,sc=>{
 const R=[row(sc,110,130,90,[['КРОМЕ',385.7,GRY],['ТОГО,',386.0,GRY]],0),row(sc,110,240,90,[['ОГРОМНУЮ',386.4],['РОЛЬ',387.0]],0),row(sc,110,340,80,[['ИГРАЮТ',387.2],['ВИЗУАЛЬНЫЕ',387.5]],0),row(sc,110,490,150,[['УЛОВКИ',388.2,YEL]],0),row(sc,110,650,100,[['ДЫМКА',389.1,CY],['ВДАЛИ',389.5,CY]],0),row(sc,110,770,110,[['ОСВЕЩЕНИЕ',390.1,YEL]],0),row(sc,110,890,80,[['МИР',391.7],['РАСТВОРЯЕТСЯ',391.9,PINK]],0),row(sc,110,990,80,[['У',392.5],['ГОРИЗОНТА',392.6,CY]],0)];
 const card=framed(sc,780,440);const vc=clip(card,'ride',630,'left:0;top:0;width:100%;height:100%');
 const haze=div(card,'position:absolute;inset:0;background:linear-gradient(to bottom,rgba(200,215,240,0) 20%,rgba(200,215,240,.92) 46%,rgba(200,215,240,0) 70%);opacity:0');
 const glare=div(card,'position:absolute;inset:0;background:radial-gradient(circle at 82% 14%,rgba(255,244,200,.98),rgba(255,230,150,.5) 22%,transparent 55%);opacity:0');
 const dis=div(card,'position:absolute;inset:0;background:linear-gradient(to bottom,rgba(200,215,240,1) 0,rgba(200,215,240,.95) 40%,rgba(200,215,240,0) 62%);opacity:0');
 const chs=[['ДЫМКА',CY],['СВЕТ',YEL],['ГОРИЗОНТ',PINK]].map(([l,c])=>tile(sc,220,100,c,'rgba(0,0,0,.28)',`<div style="font-size:38px;color:${PUR}">${l}</div>`,28));
 return t=>{clipT(vc,2+(t-385.69)*.8);R.forEach(r=>rowUpd(r,t));pop(card,t,387.2,1530,400,{dur:.55,dy:400,r:-2,r0:8});
  haze.style.opacity=P(t,389.1,.8);glare.style.opacity=P(t,390.1,.6);dis.style.opacity=P(t,391.7,1.2)*.8;
  [389.1,390.1,392.6].forEach((st,i)=>pop(chs[i],t,st,1330+i*230,760,{dur:.35,dy:100,r:(i%2?3:-3)}))}});

// ===== D5 393.76-397.2 =====
scene(393.76,397.2,PINK,'#ff7a8c',sc=>{
 const R=[row(sc,110,200,100,[['ВСЁ',393.8,PUR],['ЭТО',394.0,PUR]],0),row(sc,110,370,140,[['ПРИДУМАНО',394.3,WHT]],0),row(sc,110,540,120,[['ЧТОБЫ',394.8,PUR],['СКРЫТЬ',395.1,WHT]],0),row(sc,110,700,120,[['ОГРАНИЧЕНИЯ',395.5,PUR]],0),row(sc,110,880,170,[['ЖЕЛЕЗА',396.2,YEL]],0)];
 const ps=psBox(sc,640);const cl=ab(sc,`width:620px;height:760px;background:${PUR};border-radius:30px 30px 0 0;box-shadow:0 14px 0 #0d0830;overflow:hidden`);
 div(cl,`position:absolute;left:0;bottom:-40px;width:100%;height:120px;background:radial-gradient(circle at 50% 0,${PUR} 0 60px,transparent 61px) 0 0/124px 120px`);
 div(cl,`position:absolute;inset:0;background:radial-gradient(circle,rgba(255,203,61,.5) 0 8px,transparent 9px) 0 0/90px 90px`);
 const q=bigWord(sc,'?',260,YEL,PUR);
 return t=>{R.forEach(r=>rowUpd(r,t));
  const k=E.outBack(P(t,393.9,.5));tf(ps,{x:1560,y:lerp(1300,560,E.outCubic(P(t,393.9,.5))),s:.6+.4*k,r:lerp(8,-2,k),o:t>=393.9?1:0});
  const d=E.inCubic(P(t,395.1,.45));tf(cl,{x:1560,y:lerp(-500,500,d),ay:.5,o:t>=395.1?1:0});
  pop(q,t,395.7,1560,500,{dur:.4,r:-8,r0:20})}});

// ===== D6a 397.2-401.8 =====
scene(397.2,401.8,PUR,PUR2,sc=>{
 const R=[row(sc,110,130,90,[['ПОМИМО',397.2,GRY],['ЭТОГО,',397.7,GRY]],0),row(sc,110,280,110,[['ИГРА',398.2],['ПОСТОЯННО',398.5]],0),row(sc,110,430,130,[['ПЫТАЕТСЯ',399.2,PINK]],0),row(sc,110,590,120,[['ПРЕДУГАДАТЬ',399.7,YEL]],0),row(sc,110,740,90,[['ВАШИ',400.3],['СЛЕДУЮЩИЕ',400.7]],0),row(sc,110,900,140,[['ДЕЙСТВИЯ',401.3,CY]],0)];
 const cr=crystal(sc,440);const sk=skyline(cr.ball,300,200,3,[PINK,YEL,GRN,CY]);sk.style.left='70px';sk.style.top='160px';
 const ar=arrowR(sc,200,90,GRN);const pl=person(sc,70,YEL);const st=Array.from({length:6},(_,i)=>ab(sc,`width:26px;height:26px;background:${YEL};clip-path:${star(4,50,18)}`));
 return t=>{R.forEach(r=>rowUpd(r,t));
  pop(cr,t,399.2,1560,500,{dur:.5,dy:300,r:-3});pop(pl,t,399.7,1330,860,{dur:.4});
  tf(ar,{x:1500+Math.sin(t*6)*12,y:880,o:t>=400.7?1:0,s:E.outBack(P(t,400.7,.4))});
  st.forEach((s,i)=>{const a=i*60+t*50;tf(s,{x:1560+Math.cos(a*Math.PI/180)*270,y:480+Math.sin(a*Math.PI/180)*270,r:a*2,s:1,o:t>=399.7?.9:0})})}});

// ===== D6b 401.8-405.5 =====
scene(401.8,405.5,CY,'#7adbf7',sc=>{
 const R=[row(sc,110,150,80,[['ЧТОБЫ',401.8,PUR],['ПОДГОТОВИТЬ',402.2,PUR]],0),row(sc,110,350,250,[['МИР',402.8,WHT]],0),row(sc,110,550,100,[['ДО',403.0,PUR],['ТОГО,',403.2,PUR]],0),row(sc,110,700,100,[['КАК',403.7,PUR],['ВЫ',403.8,PUR],['ДО',404.0,PUR],['НЕГО',404.1,WHT]],0),row(sc,110,870,130,[['ДОБЕРЁТЕСЬ',404.3,PINKd]],0)];
 const map=worldMap(sc,620,390);const pl=person(sc,80,YEL);
 return t=>{R.forEach(r=>rowUpd(r,t));
  const k=E.outBack(P(t,402.8,.55));tf(map,{x:1540,y:lerp(1300,460,E.outCubic(P(t,402.8,.55))),s:.6+.4*k,r:lerp(8,-2,k),o:t>=402.8?1:0});
  const w=E.inOut(P(t,403.3,1.8));tf(pl,{x:lerp(1330,1700,w),y:lerp(740,420,w),o:t>=403.3?1:0})}});

// ===== D6c 405.5-411.89 =====
scene(405.5,411.89,'#14335c','#1d4a85',sc=>{
 const R=[row(sc,110,160,130,[['НЕ',405.6,PINK],['ЖДЁТ',405.7,PINK]],0),row(sc,110,310,90,[['ВАШЕГО',406.0],['ПРИБЫТИЯ',406.5]],0),row(sc,110,460,110,[['А',407.2],['ЗАРАНЕЕ',407.3,YEL]],0),row(sc,110,610,120,[['ПРИКИДЫВАЕТ',407.8,CY]],0),row(sc,110,760,60,[['КУДА',408.5],['ВЫ',408.7],['НАПРАВЛЯЕТЕСЬ',408.9,CY]],0),row(sc,110,880,80,[['И',409.8],['НАЧИНАЕТ',409.9],['ЗАГРУЗКУ',410.4,GRN]],0),row(sc,110,1000,110,[['ЗАРАНЕЕ',410.9,PINK]],0)];
 const road=ab(sc,`width:700px;height:130px;border-radius:65px;background:#0d0830`);const dash=ab(sc,`width:640px;height:8px;background:repeating-linear-gradient(90deg,#fff 0 30px,transparent 30px 60px)`);
 const tl=Array.from({length:14},(_,i)=>memBlock(sc,70,[GRN,CY,YEL][i%3]));const car=carEl(sc,150,PINK);
 const bar=ab(sc,`width:520px;height:30px;border-radius:15px;background:#0d0830`);const fill=div(bar,`position:absolute;left:0;top:0;height:100%;width:0;background:${GRN};border-radius:15px`);
 return t=>{R.forEach(r=>rowUpd(r,t));
  tf(road,{x:1540,y:540,o:t>=405.6?1:0});tf(dash,{x:1540,y:540,o:t>=405.6?1:0});
  const cx=lerp(1260,1760,E.inOut(P(t,405.7,6.0)));tf(car,{x:cx,y:530,o:t>=405.7?1:0});
  tl.forEach((b,i)=>{const bx=1230+(i%7)*90,by=i<7?400:680;const lit=bx<cx+330&&t>=407.8;tf(b,{x:bx,y:by,s:lit?1:.6,o:t>=407.8?(lit?1:.35):0});b.style.filter=lit?'none':'grayscale(1)'});
  pop(bar,t,410.4,1540,850,{dur:.3});fill.style.width=(P(t,410.4,1.5)*100)+'%'}});

// ===== D7 411.89-415.81 =====
scene(411.89,415.81,'#0e0a28','#14103a',sc=>{
 const vc=clip(sc,'on',1946,'left:0;top:0;width:1920px;height:1080px');div(sc,'position:absolute;inset:0;background:rgba(14,10,40,.5)');
 const R=[row(sc,110,140,100,[['КОГДА',411.9],['ВЫ',412.2],['ЕДЕТЕ',412.4]],0),row(sc,110,310,150,[['ПО',412.7],['ДОРОГЕ',412.8,YEL]],0),row(sc,110,520,110,[['ИГРА',413.5],['УЖЕ',413.8],['ГОТОВИТ',414.1,GRN]],0),row(sc,110,720,150,[['УЛИЦЫ',414.5],['ВПЕРЕДИ',414.9,CY]],0)];shadowRows(R);
 const ch=[0,1,2].map(i=>ab(sc,`width:160px;height:200px;background:${GRN};clip-path:polygon(0 0,50% 0,100% 50%,50% 100%,0 100%,50% 50%)`));
 return t=>{clipT(vc,20+(t-411.89));R.forEach(r=>rowUpd(r,t));
  ch.forEach((c,i)=>tf(c,{x:1450+i*120+Math.sin(t*6-i)*10,y:540,o:t>=414.5?.9-.2*i:0,s:E.outBack(P(t,414.5+i*.1,.3))}))}});

// ===== D8 415.81-423.01 =====
scene(415.81,423.01,'#14335c','#1d4a85',sc=>{
 const P1=[row(sc,110,130,90,[['НО',415.8],['ЕСЛИ',416.0],['ВЫ',416.3]],0),row(sc,110,270,130,[['ВНЕЗАПНО',416.3,YEL]],0),row(sc,110,440,150,[['СВЕРНЁТЕ',416.9,PINK]],0),row(sc,110,610,100,[['СИСТЕМА',417.9],['БЫСТРО',418.3]],0),row(sc,110,750,110,[['ПЕРЕКЛЮЧИТСЯ',418.7,CY]],0)];
 const P2=[row(sc,110,200,110,[['НА',419.3],['НОВУЮ',419.4]],0),row(sc,110,380,180,[['ОБЛАСТЬ',419.8,GRN]],0),row(sc,110,560,110,[['И',420.4],['ТИХО',420.5]],0),row(sc,110,720,150,[['БРОСИТ',420.9,PINK]],0),row(sc,110,880,80,[['РАБОТУ',421.3],['НАД',421.7],['ПРЕЖНЕЙ',421.9,GRY]],0)];
 const mk=(w,rot)=>ab(sc,`width:${w}px;height:100px;border-radius:50px;background:#0d0830;transform-origin:left center`);
 const r1=mk(420),r2=mk(340),r3=mk(380);
 const car=carEl(sc,120,PINK);
 const old=Array.from({length:4},(_,i)=>memBlock(sc,56,PINK)),nw=Array.from({length:4},(_,i)=>memBlock(sc,56,GRN));const xm=xmark(sc,100);
 return t=>{P1.forEach(r=>rowUpd(r,t,{o:1-P(t,419.1,.2)}));P2.forEach(r=>rowUpd(r,t));
  tf(r1,{x:1180,y:620,ax:0,o:1});tf(r2,{x:1560,y:620,ax:0,o:1});tf(r3,{x:1560,y:620,ax:0,r:-48,o:1});
  const p=t<416.9?E.inOut(P(t,416.0,.9)):1;let cx,cy,cr=0;
  if(t<416.9){cx=lerp(1230,1540,p);cy=620}else{const q=E.inOut(P(t,416.9,2.2));cx=lerp(1540,1830,q);cy=lerp(620,300,q);cr=-48*Math.min(1,q*3)}
  tf(car,{x:cx,y:cy-4,r:cr,o:t>=416.0?1:0});
  old.forEach((b,i)=>{const gone=t>=420.9;tf(b,{x:1620+i*70,y:760,s:gone?E.inCubic(1-P(t,420.9,.4)):1,o:(t>=416.9&&t<421.4)?(t>=418.7?.4:1):0})});
  nw.forEach((b,i)=>{const st=418.7+i*.3;tf(b,{x:1620+i*70,y:480-i*60,s:t>=st?E.outBack(P(t,st,.3)):0,o:t>=st?1:0})});
  pop(xm,t,420.9,1760,760,{dur:.3,t1:421.8,fade:.2})}});

// ===== D9 423.01-428.37 =====
scene(423.01,428.37,PINK,'#ff7a8c',sc=>{
 const R=[row(sc,110,150,120,[['НА',423.0,PUR],['PS3',423.2,WHT]],0),row(sc,110,310,130,[['ЭТО',423.7,PUR],['КРАЙНЕ',424.0,PUR]],0),row(sc,110,520,200,[['ВАЖНО',424.5,WHT]],0),row(sc,110,700,90,[['ПОТОМУ',425.0,PUR],['ЧТО',425.3,PUR]],0),row(sc,110,820,110,[['ЖЁСТКИЙ',425.5,PUR],['ДИСК',425.9,PUR]],0),row(sc,110,950,110,[['И',426.2,PUR],['BLU-RAY',426.3,WHT]],0)];
 const hdd=ab(sc,`width:300px;height:210px;border-radius:30px;background:#d8d3f5;box-shadow:0 14px 0 #a8a1d8`);div(hdd,`position:absolute;left:30px;top:30px;width:150px;height:150px;border-radius:50%;background:${PUR}`);div(hdd,`position:absolute;left:80px;top:80px;width:50px;height:50px;border-radius:50%;background:#d8d3f5`);
 const disc=discEl(sc,'#4c8cf0',280);const st=bigWord(sc,'МЕДЛЕННЫЕ',100,YEL,PUR);const sb=ab(sc,`width:240px;height:240px;background:${YEL};clip-path:${star(12,50,40)};display:flex;align-items:center;justify-content:center;font-size:140px;color:${PUR}`,'!');
 return t=>{R.forEach(r=>rowUpd(r,t));pop(hdd,t,425.5,1400,330,{dur:.45,r:-4});
  const k=E.outBack(P(t,426.3,.5));tf(disc,{x:1720,y:330,r:t*40,s:t>=426.3?.5+.5*k:0,o:t>=426.3?1:0});
  pop(st,t,427.3,1560,720,{dur:.4,r:-6,r0:14});pop(sb,t,424.5,1760,880,{dur:.4,r:12,r0:30})}});

// ===== D10 428.37-436.37 =====
scene(428.37,436.37,CY,'#7adbf7',sc=>{
 const P1=[row(sc,110,130,100,[['ИГРА',428.4,PUR],['НЕ',428.7,PUR],['МОЖЕТ',428.8,PUR]],0),row(sc,110,260,100,[['ПОЗВОЛИТЬ',429.1,PUR],['СЕБЕ',429.5,PUR]],0),row(sc,110,390,70,[['СНАЧАЛА',429.7,PUR],['ПОСМОТРЕТЬ,',430.2,PUR]],0),row(sc,110,520,100,[['ЧТО',430.9,PUR],['БУДЕТ,',431.1,WHT]],0),row(sc,110,660,75,[['А',431.6,PUR],['ПОТОМ',431.7,PUR],['РЕАГИРОВАТЬ:',432.1,PINKd]],0)];
 const P2=[row(sc,110,200,110,[['ОНА',433.2,PUR],['ВСЁ',433.4,PUR],['ВРЕМЯ',433.7,PUR]],0),row(sc,110,380,120,[['ОБЯЗАНА',434.1,PUR],['БЫТЬ',434.7,PUR]],0),row(sc,110,600,180,[['НА',434.9,WHT],['ШАГ',435.0,WHT]],0),row(sc,110,820,200,[['ВПЕРЕДИ',435.3,PINKd]],0)];
 const a=tile(sc,300,130,WHT,'rgba(0,0,0,.28)',`<div style="font-size:44px;color:${PUR}">СМОТРЕТЬ</div>`,32);const b=tile(sc,330,130,PINK,PINKd,`<div style="font-size:44px;color:#fff">РЕАГИРОВАТЬ</div>`,32);const ar=arrowR(sc,100,60,PUR);const xm=xmark(sc,180);
 const pl=person(sc,100,PUR);const gm=ab(sc,`width:150px;height:150px`);gm.appendChild(gearEl(gm,150,YEL,CY));const lb=bigWord(sc,'ИГРА',60,PUR,WHT);
 return t=>{P1.forEach(r=>rowUpd(r,t,{o:1-P(t,432.9,.2)}));P2.forEach(r=>rowUpd(r,t));
  const o1=t<433.0?1:0;pop(a,t,430.2,1330,360,{dur:.4,t1:433.0,fade:.2});pop(ar,t,430.9,1500,360,{dur:.3,t1:433.0,fade:.2});pop(b,t,431.7,1710,360,{dur:.4,t1:433.0,fade:.2});pop(xm,t,432.1,1560,520,{dur:.35,t1:433.0,fade:.2});
  const run=t>=433.4?(t-433.4)*35:0;pop(pl,t,433.3,1300+Math.min(run,400)*0,720,{dur:.4});
  const gx=1560+Math.min(300,(t-433.4)*40);tf(gm,{x:Math.min(gx,1760),y:720,r:t*200,o:t>=433.4?1:0,s:1});
  tf(lb,{x:Math.min(gx,1760),y:840,o:t>=433.4?1:0})}});

// ===== D11 436.37-442.13 =====
scene(436.37,442.13,PUR,PUR2,sc=>{
 const R=[row(sc,110,130,90,[['ПОМОГАЕТ',436.4],['ЕЙ',436.9]],0),row(sc,110,290,120,[['В',437.1],['ЭТОМ',437.1],['CELL',437.5,YEL]],0),row(sc,110,430,90,[['КОТОРЫЙ',437.9,GRY]],0),row(sc,110,560,130,[['НЕПРЕРЫВНО',438.3,CY]],0),row(sc,110,700,90,[['ОБНОВЛЯЕТ',438.9],['СПИСОК',439.4]],0),row(sc,110,820,80,[['ТОГО,',439.8],['ЧТО',440.3],['ДОЛЖНО',440.5]],0),row(sc,110,950,110,[['БЫТЬ',440.9],['ГОТОВО',441.0,GRN]],0)];
 const chip=chipEl(sc);const card=ab(sc,`width:520px;height:440px;border-radius:40px;background:#fff;box-shadow:0 16px 0 rgba(0,0,0,.3)`);
 const rows=[0,1,2,3].map(i=>{const r=div(card,`position:absolute;left:40px;top:${40+i*100}px;width:440px;height:70px`);div(r,`position:absolute;left:0;top:0;width:70px;height:70px;border-radius:18px;background:#e7e3fb`);div(r,`position:absolute;left:96px;top:20px;width:${[300,240,330,200][i]}px;height:30px;border-radius:15px;background:${[PINK,YEL,GRN,CY][i]}`);const c=checkmark(r,70,PUR);c.style.left='0';c.style.top='0';c.style.opacity=0;r.ck=c;return r});
 const ring=ab(sc,`width:130px;height:130px;border-radius:50%;border:16px solid ${YEL};border-top-color:transparent`);
 return t=>{R.forEach(r=>rowUpd(r,t));const kc=E.outElastic(P(t,437.5,.7));tf(chip,{x:1560,y:250,s:t>=437.5?.5*kc:0,o:t>=437.5?1:0});
  pop(card,t,438.3,1560,700,{dur:.5,dy:300,r:-2});rows.forEach((r,i)=>{r.ck.style.opacity=t>=438.9+i*.7?1:0});
  tf(ring,{x:1810,y:520,r:t*300,o:t>=438.9?1:0})}});

// ===== D12 442.13-452.29 =====
scene(442.13,452.29,GRN,'#6ee9b6',sc=>{
 const P1=[row(sc,110,130,90,[['ИМЕННО',442.1,PUR],['ЭТО',442.6,PUR]],0),row(sc,110,270,110,[['ПОСТОЯННОЕ',442.8,PUR]],0),row(sc,110,420,110,[['ПРЕДСКАЗАНИЕ',443.5,WHT]],0),row(sc,110,560,90,[['И',444.3,PUR],['ПРЕДЗАГРУЗКА',444.5,PINKd]],0),row(sc,110,700,70,[['ОДНА',445.6,PUR],['ИЗ',445.8,PUR],['ГЛАВНЫХ',446.0,PUR],['ПРИЧИН,',446.5,PUR]],0)];
 const P2=[row(sc,110,200,110,[['ПОЧЕМУ',446.9,PUR],['МИР',447.3,PUR]],0),row(sc,110,340,100,[['КАЖЕТСЯ',447.5,PUR],['ТАКИМ',447.9,PUR]],0),row(sc,110,540,170,[['ПЛАВНЫМ',448.3,WHT]],0),row(sc,110,730,100,[['ХОТЯ',449.2,PUR],['ЖЕЛЕЗО',449.4,PUR]],0),row(sc,110,850,80,[['ВСЁ',449.8,PUR],['ЭТО',450.1,PUR],['ВРЕМЯ',450.2,PUR]],0),row(sc,110,960,70,[['РАБОТАЕТ',450.6,PUR],['НА',451.1,PUR],['ПРЕДЕЛЕ',451.2,PINKd]],0)];
 const cr=crystal(sc,380);const dots=Array.from({length:30},(_,i)=>ab(sc,`width:22px;height:22px;border-radius:50%;background:${PUR}`));
 const gz=gauge(sc,460);const ps=psBox(sc,260);
 return t=>{P1.forEach(r=>rowUpd(r,t,{o:1-P(t,446.7,.2)}));P2.forEach(r=>rowUpd(r,t));
  pop(cr,t,443.5,1560,480,{dur:.5,dy:300,t1:446.8,fade:.2});
  dots.forEach((d,i)=>{const x=1220+i*21;tf(d,{x,y:330+Math.sin(x/70+t*3)*55,o:t>=447.0?1:0,s:E.outBack(P(t,447.0+i*.02,.2))})});
  pop(gz,t,449.2,1560,760,{dur:.45,dy:250});gz.nd.style.transform=`rotate(${lerp(-60,80,E.inOut(P(t,449.4,1.8)))}deg)`;
  pop(ps,t,450.2,1830,780,{dur:.4});}});

// ===== D13 452.29-458.21 =====
scene(452.29,458.21,YEL,'#ffd86b',sc=>{
 const R=[row(sc,110,130,100,[['НЕСМОТРЯ',452.3,PUR],['НА',452.8,PUR]],0),row(sc,110,260,90,[['ВСЕ',452.9,PUR],['ОГРАНИЧЕНИЯ,',453.1,PUR]],0),row(sc,110,470,280,[['ГТА',454.1,PUR],['5',454.5,PINKd]],0),row(sc,110,700,90,[['ВСЁ',454.8,PUR],['РАВНО',454.9,PUR],['СТАЛА',455.3,PUR]],0),row(sc,110,820,90,[['САМОЙ',455.8,PUR],['ПОПУЛЯРНОЙ',456.2,PINKd]],0),row(sc,110,950,100,[['ИГРОЙ',456.8,PUR],['В',457.1,PUR],['ИСТОРИИ',457.2,PUR]],0)];
 const c5=cvr(sc,500,'assets/cover5.jpg',AR5);const pod=[0,1,2].map(i=>tile(sc,200,[220,160,120][i],[PUR,'#4a3aa0','#6b5fc7'][i],'#0d0830',`<div style="font-size:90px;color:${YEL}">${[1,2,3][i]}</div>`,18));
 const C=confetti(sc,40,[PINK,PUR,GRN,CY,WHT],77);const cup=bigWord(sc,'★',200,PINK,PUR);
 return t=>{R.forEach(r=>rowUpd(r,t));
  [[1560,900],[1360,930],[1760,950]].forEach((p,i)=>pop(pod[i],t,[456.8,457.0,457.2][i]-2.4,p[0],p[1]+[0,0,0][i],{dur:.4,dy:200}));
  const k=E.outBack(P(t,454.5,.6));tf(c5,{x:1560,y:lerp(1400,480,E.outCubic(P(t,454.5,.6))),r:lerp(10,-3,k),s:.7+.3*k,o:t>=454.5?1:0});
  pop(cup,t,456.2,1780,200,{dur:.4,r:10,r0:30});confUpd(C,t,456.2,1560,500,.9)}});
