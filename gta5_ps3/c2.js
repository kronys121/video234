flashes.push([271.5,.2,'#fff'],[285.71,.15,'#fff'],[308.03,.15,'#fff'],[315.95,.15,'#fff'],[326.91,.15,'#fff'],[335.07,.15,'#fff'],[341.55,.15,'#fff'],[352.33,.15,'#fff'],[356.73,.15,'#fff'],[361.61,.15,'#fff']);
// ===== C14 268.94-271.5 =====
scene(268.94,271.5,PUR,PUR2,sc=>{
 const R=[row(sc,110,250,140,[['ОСТАВАЛАСЬ',268.9]],0),row(sc,110,420,130,[['И',269.5],['ПРОБЛЕМА',269.7,PINK]],0),row(sc,110,570,100,[['САМОЙ',270.2,GRY]],0),row(sc,110,740,190,[['ПАМЯТИ',270.6,CY]],0)];
 const ram=ab(sc,'width:620px;height:190px');
 div(ram,`position:absolute;left:0;top:0;width:620px;height:170px;border-radius:20px;background:${GRN};box-shadow:0 12px 0 ${GRNd}`);
 for(let i=0;i<6;i++)div(ram,`position:absolute;left:${40+i*88}px;top:36px;width:68px;height:68px;border-radius:10px;background:${PUR}`);
 div(ram,`position:absolute;left:12px;top:150px;width:596px;height:30px;background:repeating-linear-gradient(90deg,${YEL} 0 14px,transparent 14px 22px)`);
 const tr=ab(sc,`width:380px;height:330px;background:${YEL};clip-path:polygon(50% 0,100% 100%,0 100%);display:flex;align-items:flex-end;justify-content:center;font-size:230px;color:${PUR};padding-bottom:10px`,'!');
 return t=>{R.forEach(r=>rowUpd(r,t));pop(ram,t,269.7,1530,420,{dur:.5,dy:300,r:-4});pop(tr,t,270.6,1560,760,{dur:.5,r:-6,r0:20})}});

// ===== C15 271.5-285.71 zones =====
scene(271.5,285.71,GRN,'#6ee9b6',sc=>{
 const P1=[row(sc,110,130,100,[['РАЗРАБОТЧИКИ',272.8,PUR]],0),row(sc,110,260,110,[['ПРИМЕНИЛИ',273.5,PUR]],0),row(sc,110,390,110,[['ОЧЕНЬ',274.1,PUR],['СТРОГУЮ',274.4,WHT]],0),row(sc,110,540,140,[['СИСТЕМУ',274.9,PUR]],0),row(sc,110,700,130,[['ВСЮ',276.0,PUR],['ПАМЯТЬ',276.3,WHT]],0),row(sc,110,830,90,[['РАЗДЕЛИЛИ',276.8,PUR],['НА',277.4,PUR]],0),row(sc,110,950,90,[['ОТДЕЛЬНЫЕ',277.6,PUR],['ЗОНЫ',278.2,PINKd]],0)];
 const P2=[row(sc,110,130,100,[['ЭТО',278.9,PUR],['КАК',279.2,PUR]],0),row(sc,110,270,130,[['НЕСКОЛЬКО',279.4,WHT]],0),row(sc,110,420,150,[['ЯЩИКОВ',279.9,PINKd]],0)];
 const mem=ab(sc,`width:360px;height:760px;border-radius:40px;background:${PUR};box-shadow:0 14px 0 #0d0830;overflow:hidden`);
 const zs=[PINK,YEL,CY].map((c,i)=>div(mem,`position:absolute;left:0;top:${i*33.3}%;width:100%;height:33.4%;background:${c};transform-origin:left;transform:scaleX(0)`));
 const crs=[['МАШИНЫ',PINK],['ЛЮДИ',YEL],['ЗДАНИЯ',CY]].map(([l,c])=>crate(sc,440,280,c,l));
 const car=carEl(crs[0].ic,200,PUR);car.style.left='120px';car.style.top='60px';
 const pp=person(crs[1].ic,110,PUR);pp.style.left='165px';pp.style.top='30px';
 const sk=skyline(crs[2].ic,300,150,5,[PUR,'#2a1d68','#4a3aa0']);sk.style.left='70px';sk.style.top='40px';
 return t=>{P1.forEach(r=>rowUpd(r,t,{o:1-P(t,278.8,.2)}));P2.forEach(r=>rowUpd(r,t));
  const m=t<278.8?1:0;pop(mem,t,275.4,1560,540,{dur:.5,dy:300,t1:278.9,fade:.2});
  zs.forEach((z,i)=>z.style.transform=`scaleX(${E.outCubic(P(t,276.8+i*.5,.5))})`);
  [281.1,282.7,284.3].forEach((st,i)=>pop(crs[i],t,st,[420,960,1500][i],840,{dur:.5,dy:300,r:(i-1)*3,r0:10}))}});

// ===== C16 285.71-290.91 =====
scene(285.71,290.91,GRN,'#6ee9b6',sc=>{
 const R=[row(sc,110,130,80,[['ЕСЛИ',285.7,PUR],['ВЫ',286.0,PUR],['ПРИХОДИТЕ',286.2,PUR]],0),row(sc,110,250,100,[['В',286.6,PUR],['МЕСТО,',286.8,PUR]],0),row(sc,110,400,110,[['ГДЕ',287.1,PUR],['ЗДАНИЙ',287.3,PINKd],['НЕТ',287.7,PINKd]],0),row(sc,110,540,110,[['ЯЩИК',288.3,PUR],['ДЛЯ',288.7,PUR],['НИХ',288.9,PUR]],0),row(sc,110,660,100,[['ОСВОБОЖДАЕТСЯ',289.5,WHT]],0)];
 const crs=[['МАШИНЫ',PINK],['ЛЮДИ',YEL],['ЗДАНИЯ',CY]].map(([l,c])=>crate(sc,440,260,c,l));
 const car=carEl(crs[0].ic,200,PUR);car.style.left='120px';car.style.top='50px';
 const pp=person(crs[1].ic,100,PUR);pp.style.left='170px';pp.style.top='25px';
 const sk=skyline(crs[2].ic,300,140,5,[PUR,'#2a1d68','#4a3aa0']);sk.style.left='70px';sk.style.top='40px';
 const xm=xmark(sc,110);const car2=carEl(sc,150,WHT);
 return t=>{R.forEach(r=>rowUpd(r,t));
  tf(crs[0],{x:420,y:860,o:1});tf(crs[1],{x:960,y:860,o:1});
  const em=E.inOut(P(t,288.3,.9));sk.style.opacity=1-em;crs[2].style.opacity=1;
  tf(crs[2],{x:1500,y:860,o:1,r:0});crs[2].style.background=lerpC('4cc9f0','ffffff',em);crs[2].style.border=em>.5?`10px dashed ${PUR}`:'none';
  pop(xm,t,287.7,1660,720,{dur:.3,t1:288.9,fade:.2});
  const fr=E.outBack(P(t,289.5,.4));tf(car2,{x:1500,y:830,s:t>=289.5?fr:0,o:t>=289.5?1:0});
  crs[2].children[2].textContent=t>=289.5?'МАШИНЫ':'ЗДАНИЯ'}});

// ===== C17 290.91-302.11 =====
scene(290.91,302.11,PUR,PUR2,sc=>{
 const P1=[row(sc,110,140,90,[['ВСЕ',290.9],['ЭТИ',291.1],['ХИТРЫЕ',291.4]],0),row(sc,110,280,110,[['СИСТЕМЫ',291.9,YEL]],0),row(sc,110,420,80,[['РАБОТАЛИ',292.3],['ОТЛИЧНО,',292.9,GRN]],0)];
 const P2=[row(sc,110,140,70,[['САМОЕ',294.0,GRY],['ВПЕЧАТЛЯЮЩЕЕ',294.4,YEL]],0),row(sc,110,290,100,[['ИГРА',296.1],['МГНОВЕННО',296.3,PINK]],0),row(sc,110,440,90,[['ПЕРЕКЛЮЧАЕТ',297.0],['ВАС',297.6]],0),row(sc,110,580,70,[['МЕЖДУ',297.9],['ПЕРСОНАЖАМИ',298.1,CY]],0),row(sc,110,710,80,[['ДАЖЕ',299.1,GRY],['ЕСЛИ',299.5,GRY],['ОНИ',299.7,GRY]],0),row(sc,110,850,70,[['ДАЛЕКО',300.4,YEL],['ДРУГ',300.9],['ОТ',301.1],['ДРУГА',301.3]],0)];
 const gear=gearEl(sc,200,YEL,PUR),chip=chipEl(sc),disc=discEl(sc,CY,200);const cks=[0,1,2].map(()=>checkmark(sc,90));
 const wheel=ab(sc,'width:560px;height:560px');div(wheel,`position:absolute;inset:0;border-radius:50%;background:${'#0d0830'};box-shadow:0 14px 0 #070420`);
 const hl=div(wheel,`position:absolute;inset:0;border-radius:50%;border:16px solid ${YEL};opacity:0`);
 const ps=[[PINK,0],[GRN,120],[CY,240]].map(([c,a])=>{const p=person(wheel,120,c);return{p,a}});
 const pins=[0,1].map(i=>ab(sc,`width:70px;height:70px;border-radius:50% 50% 50% 0;background:${i?PINK:GRN};transform-origin:center`));const dots=ab(sc,`width:420px;height:10px;background:repeating-linear-gradient(90deg,${YEL} 0 18px,transparent 18px 40px)`);
 return t=>{P1.forEach(r=>rowUpd(r,t,{o:1-P(t,293.7,.2)}));P2.forEach(r=>rowUpd(r,t));
  [gear,chip,disc].forEach((e,i)=>{const st=291.4+i*.9;const k=E.outBack(P(t,st,.45));tf(e,{x:1300+i*270,y:480,s:(e===chip?.35:1)*(t>=st?k:0)*(t<293.7?1:0),r:e===gear?t*60:0,o:(t>=st&&t<293.9)?1:0})});
  cks.forEach((c,i)=>pop(c,t,292.3+i*.9,1300+i*270,640,{dur:.3,t1:293.9,fade:.2}));
  const ks=E.outBack(P(t,294.4,.5));tf(wheel,{x:1560,y:400,s:t>=294.4?.55*ks:0,o:t>=294.4?1:0});
  ps.forEach((o,i)=>{const a=o.a*Math.PI/180-Math.PI/2;o.p.style.left=(280+Math.cos(a)*170-60)+'px';o.p.style.top=(280+Math.sin(a)*170-90)+'px'});
  const sel=t<296.3?-1:(t<297.6?0:(t<298.1?1:(t<299.9?2:0)));hl.style.opacity=sel<0?0:1;hl.style.borderColor=sel<0?YEL:[PINK,GRN,CY][sel];
  pop(dots,t,299.9,1560,860,{dur:.3,dy:0});pop(pins[0],t,299.9,1350,860,{dur:.4,r:-45,r0:0});pop(pins[1],t,300.4,1770,860,{dur:.4,r:-45,r0:0})}});

// ===== C18 302.11-308.03 camera flight (clip) =====
scene(302.11,308.03,'#0e0a28','#14103a',sc=>{
 const vc=clip(sc,'sw2',1001,'left:0;top:0;width:1920px;height:1080px');div(sc,'position:absolute;inset:0;background:rgba(14,10,40,.42)');
 const R=[row(sc,110,130,90,[['СО',302.1],['СТОРОНЫ',302.3]],0),row(sc,110,260,90,[['ВСЁ',302.7],['ВЫГЛЯДИТ',302.9],['ПРОСТО',303.4,YEL]],0),row(sc,110,420,150,[['КАМЕРА',304.2],['ВЗЛЕТАЕТ',304.5,CY]],0),row(sc,110,590,150,[['В',305.0],['НЕБО',305.1,YEL]],0),row(sc,110,760,110,[['А',305.5],['ПОТОМ',305.6],['ОПУСКАЕТСЯ',305.9,PINK]],0),row(sc,110,910,110,[['В',306.5],['ДРУГОМ',306.6],['МЕСТЕ',307.0,GRN]],0)];shadowRows(R);
 return t=>{const sec=t<304.2?7+(t-302.11):9.1+(t-304.2)*(16.9/3.83);clipT(vc,sec);R.forEach(r=>rowUpd(r,t))}});

// ===== C19 308.03-315.95 =====
scene(308.03,315.95,PUR,PUR2,sc=>{
 const R=[row(sc,110,140,100,[['НА',308.0],['PS3',308.2,CY]],0),row(sc,110,290,100,[['ЭТО',309.0],['НЕВЕРОЯТНО',309.2]],0),row(sc,110,440,110,[['СЛОЖНАЯ',310.0,PINK],['ЗАДАЧА',310.5,PINK]],0),row(sc,110,590,70,[['ЗА',311.6],['СЧИТАНЫЕ',311.7],['СЕКУНДЫ',312.2,YEL]],0),row(sc,110,720,80,[['ИГРЕ',312.7],['ПРИХОДИТСЯ',313.1]],0),row(sc,110,850,80,[['СДЕЛАТЬ',313.6],['ОГРОМНЫЙ',314.1]],0),row(sc,110,980,90,[['ОБЪЁМ',314.7,GRN],['РАБОТЫ',315.2,GRN]],0)];
 const sw=ab(sc,'width:360px;height:360px');div(sw,`position:absolute;inset:0;border-radius:50%;background:#fff;border:20px solid ${YEL};box-shadow:0 14px 0 ${YELd}`);
 const hand=div(sw,`position:absolute;left:170px;top:50px;width:20px;height:140px;border-radius:10px;background:${PINK};transform-origin:50% 130px`);div(sw,`position:absolute;left:158px;top:158px;width:44px;height:44px;border-radius:50%;background:${PUR}`);
 const stack=Array.from({length:9},(_,i)=>ab(sc,`width:${300-(i%2)*30}px;height:60px;border-radius:14px;background:${[PINK,YEL,GRN,CY,WHT][i%5]};box-shadow:0 6px 0 rgba(0,0,0,.25)`));
 return t=>{R.forEach(r=>rowUpd(r,t));
  pop(sw,t,311.6,1560,330,{dur:.5,dy:200});hand.style.transform=`rotate(${(t-311.6)*540}deg)`;
  stack.forEach((s,i)=>{const st=313.1+i*.24;pop(s,t,st,1560+(i%2?20:-20),980-i*64,{dur:.3,dy:-300,r:(i%3-1)*3,r0:0})})}});

// ===== C20 315.95-326.91 =====
scene(315.95,326.91,'#14335c','#1d4a85',sc=>{
 const R=[row(sc,110,130,100,[['СНАЧАЛА',315.9]],0),row(sc,110,290,140,[['УПАКОВАТЬ',317.2,YEL]],0),row(sc,110,430,80,[['ВСЁ',317.8],['ВОКРУГ',318.5]],0),row(sc,110,540,80,[['ТЕКУЩЕГО',318.9,GRY],['ПЕРСОНАЖА',319.5,CY]],0),row(sc,110,720,80,[['ВЫГРУЗИТЬ',324.0],['ИХ',324.6],['ИЗ',324.7],['ПАМЯТИ',324.9]],0),row(sc,110,880,110,[['ОСВОБОДИТЬ',325.5],['МЕСТО',326.1,GRN]],0)];
 const labs=['МАШИНЫ','ПЕШЕХОДЫ','ЗВУКИ','ЗДАНИЯ'],cols=[PINK,YEL,CY,GRN];
 const cs=labs.map((l,i)=>{const d=tile(sc,270,270,cols[i],'rgba(0,0,0,.28)','',44);
  if(i===0)carEl(d,170,PUR).style.cssText+=';position:relative;left:0;top:0';
  if(i===1){const p=person(d,90,PUR);p.style.position='relative'}
  if(i===2)div(d,`width:110px;height:84px;background:${PUR};clip-path:polygon(0 30%,35% 30%,100% 0,100% 100%,35% 70%,0 70%)`);
  if(i===3){const s=skyline(d,170,110,9,[PUR,'#2a1d68']);s.style.position='relative'}
  div(d,`font-size:34px;color:${PUR};margin-top:10px`,l);return d});
 const box=ab(sc,'width:440px;height:280px');div(box,`position:absolute;left:0;top:30px;width:440px;height:250px;background:#d9a560;border-radius:12px;box-shadow:0 12px 0 #a87a3a`);div(box,`position:absolute;left:0;top:0;width:440px;height:60px;background:#c4914b;border-radius:12px`);div(box,`position:absolute;left:190px;top:0;width:60px;height:150px;background:rgba(255,255,255,.55)`);
 const ck=checkmark(sc,130);
 const pos=[[1330,250],[1660,250],[1330,560],[1660,560]];
 return t=>{R.forEach(r=>rowUpd(r,t));
  cs.forEach((c,i)=>{const st=[320.5,321.2,322.0,322.7][i];const p=E.inOut(P(t,323.7+i*.2,.7));
   const x=lerp(pos[i][0],1500,p),y=lerp(pos[i][1],850,p);
   tf(c,{x,y,s:(t>=st?E.outBack(P(t,st,.4)):0)*(1-.55*p),r:p*40,o:(t>=st&&p<.98)?1:0})});
  const bx=t<326.0?1500:lerp(1500,2500,E.inCubic(P(t,326.0,.6)));pop(box,t,323.5,bx,850,{dur:.4,dy:200});
  pop(ck,t,326.3,1560,540,{dur:.4,r0:20})}});

// ===== C21 326.91-335.07 =====
scene(326.91,335.07,PUR,PUR2,sc=>{
 const R=[row(sc,110,130,100,[['ОДНОВРЕМЕННО',326.9]],0),row(sc,110,290,160,[['ЗАГРУЗИТЬ',328.4,YEL]],0),row(sc,110,450,110,[['НОВУЮ',329.0],['ОБЛАСТЬ',329.5,CY]],0),row(sc,110,590,90,[['ГДЕ',329.9],['ВТОРОЙ',330.7],['ГЕРОЙ',331.1,PINK]],0),row(sc,110,720,90,[['ДРУГИЕ',331.8],['УЛИЦЫ',332.3,GRY]],0),row(sc,110,830,90,[['МАШИНЫ',332.9],['ЛЮДЕЙ',333.5,GRY]],0),row(sc,110,940,90,[['И',334.1],['ЗВУКИ',334.2,GRY]],0)];
 const card=framed(sc,700,394);const vc=clip(card,'sw2',1001,'left:0;top:0;width:100%;height:100%');
 const chs=['УЛИЦЫ','МАШИНЫ','ЛЮДИ','ЗВУКИ'].map((l,i)=>tile(sc,160,130,[GRY,PINK,YEL,CY][i],'rgba(0,0,0,.28)',`<div style="font-size:24px;color:${PUR}">${l}</div>`,28));
 return t=>{clipT(vc,26+(t-328.4)*.9);R.forEach(r=>rowUpd(r,t));
  pop(card,t,329.0,1500,330,{dur:.55,dy:400,r:-2,r0:8});
  [331.8,332.9,333.5,334.2].forEach((st,i)=>pop(chs[i],t,st,1260+i*170,740,{dur:.35,dy:200,r:(i%2?3:-3)}))}});

// ===== C22 335.07-341.55 =====
scene(335.07,341.55,PINK,'#ff7a8c',sc=>{
 const R=[row(sc,110,130,80,[['К',335.1,PUR],['ТОМУ',335.1,PUR],['ЖЕ',335.5,PUR]],0),row(sc,110,260,120,[['НЕОБХОДИМО',335.6,WHT]],0),row(sc,110,410,150,[['ПОДМЕНИТЬ',336.3,PUR]],0),row(sc,110,560,80,[['ДАННЫЕ',336.7,PUR],['ПЕРСОНАЖА',337.5,PUR]],0),row(sc,110,700,90,[['ВО',338.5,PUR],['ЧТО',338.7,PUR],['ОН',338.8,PUR],['ОДЕТ',339.0,WHT]],0),row(sc,110,820,90,[['ГДЕ',339.5,PUR],['СТОИТ',339.8,WHT]],0),row(sc,110,940,90,[['И',340.3,PUR],['ЧЕМ',340.5,PUR],['ЗАНЯТ',340.7,WHT]],0)];
 const ch=person(sc,230,PUR);
 const shirt=ab(sc,`width:200px;height:200px;background:${YEL};clip-path:polygon(0 20%,25% 0,40% 10%,60% 10%,75% 0,100% 20%,85% 45%,75% 38%,75% 100%,25% 100%,25% 38%,15% 45%)`);
 const pin=ab(sc,`width:120px;height:120px;border-radius:50% 50% 50% 0;background:${GRN};box-shadow:0 8px 0 ${GRNd}`);const gr=gearEl(sc,190,CY,PINK);
 return t=>{R.forEach(r=>rowUpd(r,t));
  pop(ch,t,336.3,1560,500,{dur:.5,dy:300});
  const cs=[PUR,GRN,YEL,CY];const ci=t<336.3?0:Math.min(3,Math.floor((t-336.3)/.7));ch.children[1].style.background=cs[ci];
  pop(shirt,t,339.0,1300,330,{dur:.4,r:-8});pop(pin,t,339.8,1830,640,{dur:.4,r:-45,r0:0});tf(gr,{x:1820,y:330,r:t*70,s:t>=340.7?E.outBack(P(t,340.7,.4)):0,o:t>=340.7?1:0})}});

// ===== C23 341.55-352.33 consistency =====
scene(341.55,352.33,'#3a1650','#52206e',sc=>{
 const P1=[row(sc,110,130,100,[['И',341.5],['ВДОБАВОК',341.7]],0),row(sc,110,280,120,[['МИР',342.5],['ДОЛЖЕН',342.7]],0),row(sc,110,440,140,[['ОСТАВАТЬСЯ',343.1,YEL]],0),row(sc,110,600,80,[['ПОСЛЕДОВАТЕЛЬНЫМ',343.7,CY]],0)];
 const P2=[row(sc,110,130,100,[['ОДИН',345.4],['ГЕРОЙ',345.7]],0),row(sc,110,280,110,[['УСТРОИЛ',346.0],['ХАОС',346.8,PINK]],0),row(sc,110,440,100,[['ИГРА',347.6],['ОБЯЗАНА',347.9]],0),row(sc,110,590,140,[['ЗАПОМНИТЬ',348.7,YEL]],0),row(sc,110,750,100,[['СОХРАНИТЬ',349.4],['ВСЁ',350.0]],0),row(sc,110,890,120,[['КАК',350.3],['ЕСТЬ',350.6,GRN]],0),row(sc,110,1010,70,[['КОГДА',350.9,GRY],['ВЫ',351.2,GRY],['ВЕРНЁТЕСЬ',351.3,GRY]],0)];
 const m1=worldMap(sc,300,190),m2=worldMap(sc,300,190);const link=ab(sc,`width:200px;height:50px;border-radius:25px;border:14px solid ${YEL}`);
 const sc2=ab(sc,`width:680px;height:420px;border-radius:44px;background:#8fd3f0;box-shadow:0 16px 0 rgba(0,0,0,.3);overflow:hidden`);
 div(sc2,`position:absolute;left:0;top:270px;width:100%;height:150px;background:#59596b`);div(sc2,`position:absolute;left:0;top:330px;width:100%;height:12px;background:repeating-linear-gradient(90deg,#fff 0 40px,transparent 40px 80px)`);
 const car=carEl(sc,260,PINK);const smoke=[0,1,2,3].map(i=>ab(sc,`width:90px;height:90px;border-radius:50%;background:rgba(40,40,60,.7)`));
 const sb=ab(sc,`width:260px;height:260px;background:${YEL};clip-path:${star(12,50,40)};display:flex;align-items:center;justify-content:center;font-size:60px;color:${PUR};text-align:center;line-height:1`,'ХАОС');
 const sv=tile(sc,360,120,GRN,GRNd,'<div style="font-size:46px;color:#073b2a">СОХРАНЕНО</div>',30);const pp=person(sc,110,CY);
 return t=>{P1.forEach(r=>rowUpd(r,t,{o:1-P(t,345.2,.2)}));P2.forEach(r=>rowUpd(r,t));
  pop(m1,t,343.1,1330,420,{dur:.4,t1:345.3,fade:.15,r:-4});pop(m2,t,343.4,1700,420,{dur:.4,t1:345.3,fade:.15,r:4});pop(link,t,343.7,1515,430,{dur:.4,t1:345.3,fade:.15});
  pop(sc2,t,345.7,1500,420,{dur:.5,dy:300,r:-2});
  const cr=t<346.8?0:E.outCubic(P(t,346.8,.5));tf(car,{x:1380+cr*60,y:440-cr*20,r:cr*-55,o:t>=345.9?1:0,s:1});
  smoke.forEach((s,i)=>{const on=t>=346.9;const ph=((t-346.9)*.6+i*.25)%1;tf(s,{x:1450+i*30,y:420-ph*220,s:.5+ph,o:on?(1-ph)*.8:0})});
  pop(sb,t,346.8,1780,200,{dur:.4,r:12,r0:30,t1:348.4,fade:.2});
  pop(sv,t,349.4,1500,720,{dur:.4,dy:100});pop(pp,t,351.3,1750,470,{dur:.4,dy:100})}});

// ===== C24 352.33-356.73 flight =====
scene(352.33,356.73,'#0e0a28','#14103a',sc=>{
 const vc=clip(sc,'sw2',1001,'left:0;top:0;width:1920px;height:1080px');div(sc,'position:absolute;inset:0;background:rgba(14,10,40,.40)');
 const R=[row(sc,110,140,90,[['ВСЁ',352.5],['ЭТО',352.7],['ПРОИСХОДИТ',353.0]],0),row(sc,110,330,120,[['ЗА',353.5],['НЕСКОЛЬКО',353.7],['СЕКУНД',354.2,YEL]],0),row(sc,110,520,110,[['ПОКА',354.7],['КАМЕРА',354.9],['ЛЕТИТ',355.3,CY]],0),row(sc,110,710,160,[['СКВОЗЬ',355.6],['НЕБО',355.8,WHT]],0)];shadowRows(R);
 const ring=ab(sc,`width:220px;height:220px;border-radius:50%;background:conic-gradient(${YEL} 0deg,${YEL} 0deg,rgba(255,255,255,.2) 0deg);display:flex;align-items:center;justify-content:center`);const inner=div(ring,`width:170px;height:170px;border-radius:50%;background:${PUR};display:flex;align-items:center;justify-content:center;font-size:90px;color:#fff`,'3');
 return t=>{clipT(vc,16+(t-352.33)*1.4);R.forEach(r=>rowUpd(r,t));
  const p=P(t,353.5,3.0);ring.style.background=`conic-gradient(${YEL} ${(1-p)*360}deg,rgba(255,255,255,.2) 0deg)`;inner.textContent=String(Math.max(0,Math.ceil(3*(1-p))));
  pop(ring,t,353.5,1700,260,{dur:.4})}});

// ===== C25 356.73-361.61 =====
scene(356.73,361.61,YEL,'#ffd86b',sc=>{
 const R=[row(sc,110,130,100,[['МЕЖДУ',356.7,PUR],['ПРОЧИМ',357.0,PUR]],0),row(sc,110,270,100,[['СДЕЛАНО',357.5,PUR],['ЭТО',358.0,PUR]],0),row(sc,110,420,95,[['НЕ',358.2,PUR],['РАДИ',358.4,PUR],['КРАСОТЫ',358.6,PINKd]],0),row(sc,110,600,100,[['А',359.4,PUR],['ЧТОБЫ',359.5,PUR],['СПРЯТАТЬ',359.8,PINKd]],0),row(sc,110,780,100,[['ЭКРАН',360.3,PUR],['ЗАГРУЗКИ',360.6,PINKd]],0)];
 const ld=ab(sc,`width:640px;height:380px;border-radius:36px;background:${PUR};box-shadow:0 16px 0 #0d0830;overflow:hidden`);
 const sp=div(ld,`position:absolute;left:250px;top:90px;width:140px;height:140px;border-radius:50%;border:18px solid #4a3aa0;border-top-color:${YEL}`);
 const bar=div(ld,`position:absolute;left:80px;top:290px;width:480px;height:26px;border-radius:13px;background:#2a1d68;overflow:hidden`);const fi=div(bar,`position:absolute;left:0;top:0;height:100%;width:0;background:${GRN}`);
 const cover=framed(sc,640,380);const vc=clip(cover,'sw2',1001,'left:0;top:0;width:100%;height:100%');
 return t=>{clipT(vc,12+(t-359.8)*3);R.forEach(r=>rowUpd(r,t));
  pop(ld,t,358.2,1520,460,{dur:.5,dy:300,r:-2});sp.style.transform=`rotate(${t*400}deg)`;fi.style.width=(P(t,358.6,1.6)*70)+'%';
  const k=E.outBack(P(t,359.8,.5));tf(cover,{x:1560,y:lerp(360,470,k),s:t>=359.8?.4+.6*k:0,r:lerp(8,2,k),o:t>=359.8?1:0})}});

// ===== C26 361.61-372.49 =====
scene(361.61,372.49,PUR,PUR2,sc=>{
 const R=[row(sc,110,130,100,[['ПОКА',361.6],['ИГРОК',361.9]],0),row(sc,110,270,130,[['ОТВЛЕЧЁН',362.2,YEL]],0),row(sc,110,410,100,[['ПОЛЁТОМ',362.7],['КАМЕРЫ',363.1,CY]],0),row(sc,110,550,90,[['СИСТЕМА',363.9,GRY]],0),row(sc,110,670,100,[['УДАЛЯЕТ',364.9,PINK],['СТАРЫЕ',365.4,PINK]],0),row(sc,110,790,90,[['И',366.2],['ПОДГРУЖАЕТ',366.4,GRN],['НОВЫЕ',367.0,GRN]],0),row(sc,110,900,60,[['К',369.3,GRY],['МОМЕНТУ',369.4,GRY],['ПРИЗЕМЛЕНИЯ',369.8,CY]],0),row(sc,110,990,100,[['ВСЁ',371.0],['БЫЛО',371.2],['ГОТОВО',371.4,YEL]],0)];
 const belt=ab(sc,`width:720px;height:130px;border-radius:65px;background:#0d0830;box-shadow:0 12px 0 #070420`);
 const old=Array.from({length:4},(_,i)=>memBlock(sc,80,PINK)),nw=Array.from({length:4},(_,i)=>memBlock(sc,80,GRN));
 const bar=ab(sc,`width:640px;height:34px;border-radius:17px;background:#0d0830`);const fill=div(bar,`position:absolute;left:0;top:0;height:100%;width:0;background:linear-gradient(90deg,${CY},${GRN});border-radius:17px`);
 const cam=ab(sc,`width:70px;height:70px;border-radius:50%;background:${YEL};box-shadow:0 8px 0 ${YELd}`);const ck=checkmark(sc,110);
 return t=>{R.forEach(r=>rowUpd(r,t));
  pop(belt,t,363.9,1540,430,{dur:.4,dy:100});
  old.forEach((b,i)=>{const st=364.9+i*.5;const p=P(t,st,2.4);tf(b,{x:lerp(1540-200+i*130,1100,p),y:430,o:(t>=st&&p<1)?1-.6*p:0,s:1-.3*p,r:p*30})});
  nw.forEach((b,i)=>{const st=366.4+i*.5;const p=P(t,st,1.6);tf(b,{x:lerp(2000,1540-200+i*130,E.outCubic(p)),y:430,s:1,o:t>=st?1:0})});
  pop(bar,t,367.8,1540,700,{dur:.3});const pr=P(t,367.8,3.6);fill.style.width=(pr*100)+'%';tf(cam,{x:1220+pr*640,y:700,o:t>=367.8?1:0,s:1});
  pop(ck,t,371.4,1540,860,{dur:.35,r0:20})}});
