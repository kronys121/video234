wipes.push([290.91,GRN,PUR,1],[234.78,PINK,PUR,-1],[271.5,CY,GRN,1],[302.11,PUR,YEL,-1],[372.49,YEL,PINK,1]);
flashes.push([187.09,.15,'#fff'],[191.45,.15,'#fff'],[197.89,.15,'#fff'],[203.25,.15,'#fff'],[211.26,.3,'#fff'],[213.1,.15,'#fff'],[217.02,.15,'#fff'],[226.94,.15,'#fff'],[244.3,.15,'#fff'],[248.94,.15,'#fff'],[253.74,.15,'#fff'],[262.54,.15,'#fff'],[268.94,.15,'#fff']);
// ===== C1 187.09-191.45 Cell =====
scene(187.09,191.45,CY,'#7adbf7',sc=>{
 const R=[row(sc,110,150,100,[['ВМЕСТО',187.3,PUR],['ОБЫЧНОГО',187.7,PUR]],0),row(sc,110,300,130,[['ПРОЦЕССОРА',188.2,WHT]],0),row(sc,110,450,100,[['В',188.9,PUR],['НЕЙ',189.0,PUR],['СТОИТ',189.3,PUR]],0),
  row(sc,110,650,240,[['CELL',189.7,PUR]],0),row(sc,110,830,100,[['BROADBAND',190.0,PUR]],0),row(sc,110,940,100,[['ENGINE',190.7,PINKd]],0)];
 const cpu=tile(sc,300,300,'#9aa0b8','#6c7290','<div style="font-size:80px;color:#fff">CPU</div>',40);const xm=xmark(sc,130);
 const chip=chipEl(sc);
 return t=>{R.forEach(r=>rowUpd(r,t));
  pop(cpu,t,187.7,1560,500,{dur:.45,t1:189.3,fade:.15,r:-4});pop(xm,t,188.9,1640,380,{dur:.3,t1:189.5,fade:.15});
  const kc=E.outElastic(P(t,189.7,.8));tf(chip,{x:1560,y:520,s:t>=189.7?.2+.9*kc*.9:0,r:(1-kc)*-25,o:t>=189.7?1:0})}});

// ===== C2 191.45-197.89 team =====
scene(191.45,197.89,PUR,PUR2,sc=>{
 const R=[row(sc,110,130,100,[['ПРЕДСТАВЬТЕ',191.5]],0),row(sc,110,250,80,[['НЕБОЛЬШУЮ',192.1,GRY],['КОМАНДУ',192.6,GRY]],0),row(sc,110,420,100,[['ОДИН',193.5],['НАЧАЛЬНИК',193.8,YEL]],0),row(sc,110,580,150,[['(PPE)',194.4,PINK]],0),
  row(sc,110,740,90,[['РАЗДАЁТ',195.3],['ЗАДАНИЯ',195.8]],0),row(sc,110,880,100,[['РАБОЧИМ',196.2,GRN],['(SPU)',196.9,GRN]],0)];
 const boss=person(sc,170,YEL);const bt=tile(sc,170,70,PINK,PINKd,'<div style="font-size:46px;color:#fff">PPE</div>',24);
 const ws=[0,1,2,3].map(i=>worker(sc,95,GRN));const wt=[0,1,2,3].map(()=>tile(sc,100,44,CY,CYd,'<div style="font-size:28px;color:#0b3c52">SPU</div>',16));
 const cards=Array.from({length:4},()=>tile(sc,60,76,'#fff','#c8c2ee','',10));
 return t=>{R.forEach(r=>rowUpd(r,t));
  pop(boss,t,193.8,1560,300,{dur:.5,r:-3});pop(bt,t,194.4,1560,120,{dur:.35});
  ws.forEach((w,i)=>{pop(w,t,196.2+i*.1,1300+i*160,780,{dur:.45,dy:200});pop(wt[i],t,196.9+i*.08,1300+i*160,930,{dur:.3,dy:60})});
  cards.forEach((c,i)=>{const st=195.3+i*.35;const p=E.inOut(P(t,st,.8));tf(c,{x:lerp(1560,1300+i*160,p),y:lerp(300,700,p),r:p*20-10,s:1-.3*p,o:(t>=st&&p<1)?1:0})})}});

// ===== C3 197.89-203.25 ride + animation/sound =====
scene(197.89,203.25,'#14335c','#1d4a85',sc=>{
 const R=[row(sc,110,130,100,[['КОГДА',197.9],['ВЫ',198.2],['ЕДЕТЕ',198.3]],0),row(sc,110,290,130,[['НА',198.7],['МАШИНЕ',198.8,YEL]],0),row(sc,110,520,80,[['PPE',199.5,PINK],['ПОРУЧАЕТ',200.0],['SPU',200.6,GRN]],0),row(sc,110,690,80,[['ПОДГОТОВИТЬ',201.1,GRY]],0),row(sc,110,850,90,[['АНИМАЦИЮ',201.8,YEL],['И',202.4],['ЗВУК',202.6,CY]],0)];
 const card=framed(sc,760,428);const vc=clip(card,'ride',630,'left:0;top:0;width:100%;height:100%');
 const anim=tile(sc,250,220,PINK,PINKd,'',36);div(anim,`width:170px;height:120px;border-radius:14px;background:${PUR};display:flex;align-items:center;justify-content:center`,`<div style="width:0;height:0;border-left:52px solid ${YEL};border-top:32px solid transparent;border-bottom:32px solid transparent"></div>`);
 const snd=tile(sc,250,220,CY,CYd,'',36);
 div(snd,`width:120px;height:90px;background:${PUR};clip-path:polygon(0 30%,35% 30%,100% 0,100% 100%,35% 70%,0 70%)`);
 return t=>{clipT(vc,t-197.89+2);R.forEach(r=>rowUpd(r,t));
  pop(card,t,198.3,1520,330,{dur:.55,dy:400,r:-3,r0:10});
  pop(anim,t,201.8,1380,790,{dur:.4,r:-4});pop(snd,t,202.6,1680,790,{dur:.4,r:4})}});

// ===== C4 203.25-211.26 RSX =====
scene(203.25,211.26,PUR,PUR2,sc=>{
 const R=[row(sc,110,130,100,[['ГОТОВЫЕ',203.8]],0),row(sc,110,260,110,[['РЕЗУЛЬТАТЫ',204.2,YEL]],0),row(sc,110,380,70,[['ОТПРАВЛЯЮТСЯ',204.8,GRY]],0),row(sc,110,500,90,[['ГРАФИЧЕСКОМУ',205.5]],0),row(sc,110,610,90,[['ПРОЦЕССОРУ',206.2]],0),
  row(sc,110,800,260,[['RSX',206.9,CY]],0),row(sc,110,990,70,[['В',209.7],['КАРТИНКУ',209.9,YEL]],0)];
 const sp=[0,1,2].map(i=>worker(sc,70,GRN));const bl=Array.from({length:6},(_,i)=>memBlock(sc,44,[PINK,YEL,GRN][i%3]));
 const chip=chipEl(sc,'RSX',CY);const mon=ab(sc,`width:560px;height:340px;border-radius:30px;background:${PUR};border:14px solid #fff;box-shadow:0 16px 0 rgba(0,0,0,.28);overflow:hidden`);
 const vc=clip(mon,'ride',630,'left:0;top:0;width:100%;height:100%');
 return t=>{clipT(vc,t-209.9+6);R.forEach(r=>rowUpd(r,t));
  sp.forEach((w,i)=>pop(w,t,203.8+i*.15,1350+i*150,190,{dur:.4,dy:100}));
  bl.forEach((b,i)=>{const st=204.8+i*.28;const p=P(t,st,.9);tf(b,{x:lerp(1350+(i%3)*150,1500,E.inOut(p)),y:lerp(300,470,E.inCubic(p)),s:1-.5*p,r:p*180,o:(t>=st&&p<1)?1:0})});
  const kc=E.outElastic(P(t,206.9,.7));tf(chip,{x:1500,y:520,s:t>=206.9?.55*kc:0,o:t>=206.9?1:0});
  pop(mon,t,209.9,1500,880,{dur:.45,dy:250,r:-2})}});

// ===== C5 211.26-213.1 =====
scene(211.26,213.1,PINKd,'#d9566b',sc=>{
 const R=[row(sc,110,330,120,[['ОДНАКО',211.3]],0),row(sc,110,500,120,[['ЕСТЬ',211.8]],0),row(sc,110,720,230,[['ПОДВОХ',212.1,YEL]],0)];
 const tri=ab(sc,`width:440px;height:390px;background:${YEL};clip-path:polygon(50% 0,100% 100%,0 100%);display:flex;align-items:flex-end;justify-content:center;font-size:280px;color:${PUR};padding-bottom:10px`,'!');
 return t=>{R.forEach(r=>rowUpd(r,t));const k=E.outElastic(P(t,211.8,.7));tf(tri,{x:1560,y:480,s:t>=211.8?k:0,r:Math.sin(t*9)*4,o:t>=211.8?1:0})}});

// ===== C6 213.1-217.02 =====
scene(213.1,217.02,CY,'#7adbf7',sc=>{
 const R=[row(sc,110,150,110,[['ЭТИ',213.1,PUR],['РАБОЧИЕ',213.4,PUR]],0),row(sc,110,330,110,[['ОЧЕНЬ',214.0,PUR],['БЫСТРЫЕ',214.4,WHT]],0),row(sc,110,520,100,[['НО',215.2,PUR],['И',215.4,PUR],['ОЧЕНЬ',215.6,PUR]],0),row(sc,110,720,160,[['КАПРИЗНЫЕ',215.9,PINKd]],0)];
 const w=worker(sc,230,GRN);const streaks=[0,1,2].map(i=>ab(sc,`width:260px;height:14px;border-radius:7px;background:rgba(255,255,255,.8)`));
 const ex=[0,1,2].map(i=>bigWord(sc,'!',120,PINK,PUR));
 return t=>{R.forEach(r=>rowUpd(r,t));
  const fast=t>=214.0&&t<215.9;const wx=fast?1560+Math.sin((t-214.0)*14)*220:1560;
  pop(w,t,213.4,1560,560,{dur:.45,dy:300,t1:99999});
  if(t>=214.0){const jump=t>=215.9?Math.abs(Math.sin((t-215.9)*9))*80:0;tf(w,{x:wx,y:560-jump,s:1+(t>=215.9?.08:0),r:t>=215.9?Math.sin(t*30)*4:0,o:1})}
  streaks.forEach((s,i)=>tf(s,{x:wx+(Math.cos((t-214.0)*14)>0?-250:250),y:480+i*70,s:1,o:fast?.8:0}));
  ex.forEach((e,i)=>pop(e,t,215.9+i*.08,1380+i*200,300,{dur:.3,r:-10+i*10}));
  w.style.filter=t>=215.9?'hue-rotate(150deg) saturate(2)':'none'}});

// ===== C7 217.02-226.94 =====
scene(217.02,226.94,PUR,PUR2,sc=>{
 const P1=[row(sc,110,130,90,[['У',217.0],['КАЖДОГО',217.2],['ИЗ',217.5],['НИХ',217.7]],0),row(sc,110,270,110,[['ВСЕГО',217.9,GRY]],0),row(sc,110,470,220,[['256',218.2,CY],['КБ',218.6,CY]],0),row(sc,110,660,80,[['СОБСТВЕННОЙ',219.1,GRY]],0),row(sc,110,770,90,[['РАБОЧЕЙ',220.5],['ПАМЯТИ',220.9]],0)];
 const P2=[row(sc,110,250,150,[['НАЧАЛЬНИК',222.3,YEL]],0),row(sc,110,410,120,[['ОБЯЗАН',222.8]],0),row(sc,110,560,90,[['ЗАРАНЕЕ',223.3],['ПЕРЕДАТЬ',223.8]],0),row(sc,110,690,100,[['ИМ',224.2],['СТРОГО',224.4,PINK]],0),row(sc,110,830,130,[['ТЕ',224.8],['ДАННЫЕ',225.1,GRN]],0),row(sc,110,960,90,[['КОТОРЫЕ',225.6],['НУЖНЫ',226.0]],0)];
 const w=worker(sc,210,GRN);const mt=tile(sc,380,130,CY,CYd,'<div style="font-size:28px;color:#0b3c52;font-weight:800">ПАМЯТЬ SPU</div><div style="font-size:56px;color:#0b3c52">256 КБ</div>',34,'overflow:hidden');
 const bar=ab(sc,`width:380px;height:34px;border-radius:17px;background:#0d0830;overflow:hidden`);const fill=div(bar,`position:absolute;left:0;top:0;height:100%;width:0;background:linear-gradient(90deg,${GRN},${YEL})`);
 const bl=Array.from({length:4},(_,i)=>memBlock(sc,56,[PINK,YEL,GRN,WHT][i]));const ck=checkmark(sc,100);
 return t=>{P1.forEach(r=>rowUpd(r,t,{o:1-P(t,221.6,.2)}));P2.forEach(r=>rowUpd(r,t));
  pop(w,t,217.2,1560,740,{dur:.45,dy:300});pop(mt,t,217.9,1560,330,{dur:.45,dy:120});
  pop(bar,t,222.8,1560,470,{dur:.3});fill.style.width=(P(t,223.3,2.8)*100)+'%';
  bl.forEach((b,i)=>{const st=223.3+i*.65;const p=P(t,st,.8);tf(b,{x:lerp(1850,1560,E.outCubic(p)),y:lerp(150,420+0*i,E.inOut(p)),r:p*200,s:1-.4*p,o:(t>=st&&p<1)?1:0})});
  pop(ck,t,226.0,1760,470,{dur:.35,r0:20})}});

// ===== C8 226.94-234.78 =====
scene(226.94,234.78,'#7a1f3d','#9a2e52',sc=>{
 const P1=[row(sc,110,140,100,[['СТОИТ',226.9],['ОШИБИТЬСЯ',227.3]],0),row(sc,110,290,110,[['ХОТЬ',227.8],['НЕМНОГО',228.1,YEL]],0),row(sc,110,470,130,[['РАБОЧИЕ',228.9]],0),row(sc,110,630,115,[['ПРОСТАИВАЮТ',229.6,PINK]],0),row(sc,110,770,100,[['В',230.2],['ОЖИДАНИИ',230.3]],0)];
 const P2=[row(sc,110,330,150,[['ЗАМЕДЛЯЮТ',231.5,YEL]],0),row(sc,110,500,120,[['ВСЮ',231.9],['СИСТЕМУ',232.1]],0),row(sc,110,650,90,[['ВМЕСТО',232.7,GRY],['ТОГО,',233.1,GRY]],0),row(sc,110,800,110,[['ЧТОБЫ',233.3],['ПОМОГАТЬ',233.6,GRN]],0)];
 const ws=[0,1,2,3].map(()=>worker(sc,110,GRN));const zz=[0,1,2,3].map(()=>bigWord(sc,'Zz',70,'#fff',PUR));
 const gear=gearEl(sc,220,YEL,'#7a1f3d');const meter=tile(sc,520,150,PUR,'#0d0830','<div style="font-size:28px;color:#fff;font-weight:800">ПРОИЗВОДИТЕЛЬНОСТЬ</div>',34);
 const mb=div(meter,`width:440px;height:34px;border-radius:17px;background:#0d0830;margin-top:12px;position:relative;overflow:hidden`);const mf=div(mb,`position:absolute;left:0;top:0;height:100%;width:100%;background:linear-gradient(90deg,${PINK},${YEL})`);
 return t=>{P1.forEach(r=>rowUpd(r,t,{o:1-P(t,231.3,.2)}));P2.forEach(r=>rowUpd(r,t));
  ws.forEach((w,i)=>{pop(w,t,228.9+i*.1,1300+i*150,640,{dur:.4,dy:160});w.style.filter=t>=229.6?'grayscale(.7) brightness(.8)':'none'});
  zz.forEach((z,i)=>{const on=t>=229.6;tf(z,{x:1340+i*150,y:500-((t*30+i*20)%60),s:1,o:on?.9:0})});
  tf(gear,{x:1560,y:300,r:t<231.5?0:Math.sin(t*10)*10,s:t>=231.5?E.outBack(P(t,231.5,.4)):0,o:t>=231.5?1:0});
  pop(meter,t,231.9,1560,860,{dur:.4,dy:100});mf.style.width=(100-80*E.inOut(P(t,231.9,1.8)))+'%'}});

// ===== C9 234.78-244.3 Blu-ray speed =====
scene(234.78,244.3,PUR,PUR2,sc=>{
 const R=[row(sc,110,130,100,[['ДАЛЬШЕ',234.8],['ЕЩЁ',235.2]],0),row(sc,110,270,110,[['ОДНА',235.6],['ПРОБЛЕМА',235.8,PINK]],0),row(sc,110,440,110,[['ПРИВОД',236.7],['BLU-RAY',237.1,CY]],0),row(sc,110,580,90,[['ЧИТАЛ',237.6],['ДАННЫЕ',237.9]],0),row(sc,110,700,90,[['ВСЕГО',239.0,GRY],['ОКОЛО',239.4,GRY]],0),row(sc,110,880,220,[['9',239.8,YEL],['МБ/С',240.3,YEL]],0)];
 const disc=discEl(sc,'#4c8cf0',360);const gz=gauge(sc,520);const sl=bigWord(sc,'МЕДЛЕННО',90,PINK);
 return t=>{R.forEach(r=>rowUpd(r,t));
  const k=E.outBack(P(t,236.7,.5));tf(disc,{x:1560,y:330,r:t*(t<239.8?200:60),s:t>=236.7?.5+.5*k:0,o:t>=236.7?1:0});
  pop(gz,t,238.0,1560,710,{dur:.45,dy:200});
  const ang=-90+(t<239.8?E.outCubic(P(t,238.3,1.0))*70:(-82+Math.sin(t*5)*3+90)*0+0);const angle=t<239.8?lerp(-90,40,E.outCubic(P(t,238.3,1.1))):lerp(40,-80,E.inOut(P(t,239.8,.5)));
  gz.nd.style.transform=`rotate(${angle}deg)`;
  pop(sl,t,242.3,1560,900,{dur:.4,r:-6,r0:14})}});

// ===== C10 244.3-248.94 =====
scene(244.3,248.94,PINK,'#ff7a8c',sc=>{
 const R=[row(sc,110,140,100,[['ДЛЯ',244.3,PUR],['ОГРОМНОГО',244.5,PUR]],0),row(sc,110,280,100,[['ОТКРЫТОГО',245.0,PUR],['МИРА',245.5,PUR]],0),row(sc,110,450,130,[['ВРОДЕ',245.8,WHT],['ГТА',246.1,WHT],['5',246.5,YEL]],0),row(sc,110,640,120,[['ЭТО',247.1,PUR],['СЕРЬЁЗНАЯ',247.3,PUR]],0),row(sc,110,840,140,[['ТРУДНОСТЬ',248.0,PUR]],0)];
 const map=worldMap(sc,520,330);
 const fun=ab(sc,`width:460px;height:380px;background:${PUR};clip-path:polygon(0 0,100% 0,60% 55%,60% 100%,40% 100%,40% 55%)`);
 const bl=Array.from({length:8},(_,i)=>memBlock(sc,40,[YEL,CY,GRN,WHT][i%4]));const xm=xmark(sc,130);
 return t=>{R.forEach(r=>rowUpd(r,t));
  pop(map,t,245.0,1560,250,{dur:.5,dy:300,r:-2});pop(fun,t,246.1,1560,670,{dur:.4,dy:200});
  bl.forEach((b,i)=>{const st=246.2+i*.2;const p=P(t,st,.8);const x0=1470+(i%4)*40;
   tf(b,{x:lerp(x0,x0*.25+1560*.75,E.inCubic(p)),y:lerp(420,i<4?700:650,E.inCubic(p)),r:p*90,o:(t>=st&&t<248.9)?1:0})});
  pop(xm,t,247.3,1760,480,{dur:.35,r0:30})}});

// ===== C11 248.94-253.74 =====
scene(248.94,253.74,YEL,'#ffd86b',sc=>{
 const R=[row(sc,110,130,90,[['ПОЭТОМУ',248.9,PUR]],0),row(sc,110,260,120,[['ROCKSTAR',249.5,PINKd]],0),row(sc,110,400,80,[['ПОДЕЛИЛА',249.8,PUR],['НАГРУЗКУ',250.3,PUR]],0),row(sc,110,560,100,[['МЕЖДУ',250.9,PUR],['ЖЁСТКИМ',251.2,PINKd]],0),row(sc,110,700,130,[['ДИСКОМ',251.7,PINKd]],0),row(sc,110,860,90,[['И',252.1,PUR],['ДИСКОМ',252.3,PUR],['С',252.7,PUR],['ИГРОЙ',252.9,PINKd]],0)];
 const ld=tile(sc,300,110,PUR,'#0d0830','<div style="font-size:42px;color:#fff">НАГРУЗКА</div>',30);
 const a1=arrowR(sc,120,70,PUR),a2=arrowR(sc,120,70,PUR);
 const hdd=ab(sc,`width:300px;height:210px;border-radius:30px;background:#d8d3f5;box-shadow:0 14px 0 #a8a1d8`);
 div(hdd,`position:absolute;left:30px;top:30px;width:150px;height:150px;border-radius:50%;background:${PUR}`);div(hdd,`position:absolute;left:80px;top:80px;width:50px;height:50px;border-radius:50%;background:#d8d3f5`);
 div(hdd,`position:absolute;left:190px;top:40px;width:20px;height:110px;border-radius:10px;background:${PINK};transform:rotate(20deg)`);div(hdd,`position:absolute;left:240px;top:150px;width:30px;height:30px;border-radius:50%;background:${GRN}`);
 const hl=row(sc,1450,520,40,[['ЖЁСТКИЙ ДИСК',251.2,PUR]],.5);
 const disc=discEl(sc,'#4c8cf0',290);const dl=row(sc,1750,900,40,[['BLU-RAY',252.3,PUR]],.5);
 return t=>{R.forEach(r=>rowUpd(r,t));rowUpd(hl,t);rowUpd(dl,t);
  pop(ld,t,250.3,1600,180,{dur:.4,dy:80});
  tf(a1,{x:1500,y:280,r:110,o:t>=251.2?1:0,s:E.outBack(P(t,251.2,.3))});tf(a2,{x:1700,y:280,r:70,o:t>=252.3?1:0,s:E.outBack(P(t,252.3,.3))});
  pop(hdd,t,251.2,1450,400,{dur:.45,r:-3});
  const k=E.outBack(P(t,252.3,.5));tf(disc,{x:1740,y:700,r:t*180,s:t>=252.3?.5+.5*k:0,o:t>=252.3?1:0})}});

// ===== C12 253.74-262.54 =====
scene(253.74,262.54,'#14335c','#1d4a85',sc=>{
 const R=[row(sc,110,130,90,[['ТЯЖЁЛЫЕ',253.7],['ДАННЫЕ',254.3]],0),row(sc,110,270,120,[['3D-МОДЕЛИ',255.1,YEL]],0),row(sc,110,410,120,[['И',255.9],['ТЕКСТУРЫ',256.1,YEL]],0),row(sc,110,550,90,[['С',257.3],['ЖЁСТКОГО',257.4,CY],['ДИСКА',257.9,CY]],0),
  row(sc,110,700,90,[['ЛЁГКИЕ:',259.0,GRY]],0),row(sc,110,820,90,[['ЗВУКИ',260.1],['И',260.6],['АНИМАЦИИ',260.8,PINK]],0),row(sc,110,950,110,[['С',261.5],['BLU-RAY',261.6,CY]],0)];
 const hdd=ab(sc,`width:260px;height:180px;border-radius:26px;background:#d8d3f5;box-shadow:0 12px 0 #a8a1d8`);div(hdd,`position:absolute;left:26px;top:26px;width:128px;height:128px;border-radius:50%;background:${PUR}`);
 const disc=discEl(sc,'#4c8cf0',250);const ps=psBox(sc,380);
 const big=Array.from({length:4},(_,i)=>memBlock(sc,86,[PINK,YEL][i%2]));const small=Array.from({length:5},(_,i)=>memBlock(sc,36,[GRN,CY][i%2]));
 return t=>{R.forEach(r=>rowUpd(r,t));
  pop(hdd,t,254.3,1340,250,{dur:.4,r:-4});pop(disc,t,259.0,1340,830,{dur:.4});tf(disc,{x:1340,y:830,r:t*120,s:t>=259.0?E.outBack(P(t,259.0,.4)):0,o:t>=259.0?1:0});
  pop(ps,t,255.1,1700,540,{dur:.5,dy:300,r:3});
  big.forEach((b,i)=>{const st=255.1+i*.8;const p=P(t,st,1.2);tf(b,{x:lerp(1450,1650,E.inOut(p)),y:lerp(270,500,E.inOut(p)),s:1-.35*p,r:p*90,o:(t>=st&&p<1&&t<259)?1:0})});
  small.forEach((b,i)=>{const st=259.8+i*.5;const p=P(t,st,1.0);tf(b,{x:lerp(1450,1650,E.inOut(p)),y:lerp(830,580,E.inOut(p)),s:1-.3*p,r:p*90,o:(t>=st&&p<1)?1:0})})}});

// ===== C13 262.54-268.94 two taps =====
scene(262.54,268.94,CY,'#7adbf7',sc=>{
 const R=[row(sc,110,140,100,[['ЭТО',262.5,PUR],['ПОХОЖЕ',262.8,PUR]],0),row(sc,110,270,90,[['НА',263.1,PUR],['НАПОЛНЕНИЕ',263.2,PUR]],0),row(sc,110,410,120,[['ВЕДРА',263.9,PUR],['ВОДОЙ',264.2,WHT]],0),row(sc,110,580,100,[['ИЗ',264.6,PUR],['ДВУХ',264.8,PUR],['КРАНОВ',265.1,PINKd]],0),
  row(sc,110,730,70,[['ПОТОМУ',265.7,PUR],['ЧТО',266.1,PUR],['ОДНОГО',266.2,PUR]],0),row(sc,110,820,70,[['ПО',266.6,PUR],['ОТДЕЛЬНОСТИ',266.8,PUR]],0),row(sc,110,950,110,[['НЕ',267.5,PUR],['ХВАТАЕТ',267.8,PINKd]],0)];
 const bucket=ab(sc,`width:380px;height:330px;background:${PUR};clip-path:polygon(0 0,100% 0,86% 100%,14% 100%);overflow:hidden`);
 const water=div(bucket,`position:absolute;left:0;bottom:0;width:100%;height:0;background:${CY}`);
 const taps=[0,1].map(i=>{const d=ab(sc,'width:200px;height:120px');div(d,`position:absolute;left:0;top:0;width:200px;height:50px;border-radius:25px;background:#d8d3f5;box-shadow:0 8px 0 #a8a1d8`);div(d,`position:absolute;left:${i?10:140}px;top:40px;width:50px;height:70px;border-radius:10px;background:#d8d3f5`);return d});
 const drops=Array.from({length:12},(_,i)=>ab(sc,`width:26px;height:36px;border-radius:50% 50% 50% 50%/62% 62% 38% 38%;background:#fff`));
 return t=>{R.forEach(r=>rowUpd(r,t));
  pop(bucket,t,263.9,1560,780,{dur:.5,dy:300});
  pop(taps[0],t,264.8,1400,280,{dur:.35,dy:-100});pop(taps[1],t,265.1,1720,280,{dur:.35,dy:-100});
  const lvl=t<264.8?0:(t<265.1?(t-264.8)*.1:P(t,265.1,2.6)*.9);water.style.height=(lvl*100)+'%';
  drops.forEach((d,i)=>{const side=i%2;const st=(side?265.1:264.8);const on=t>=st&&t<268.8;const ph=(t*(side?2.2:1.2)+i*.37)%1;const x=side?1720-40:1400+40;
   tf(d,{x:x+(side?-(i%3)*3:0),y:lerp(330,700,ph*ph),o:(on&&(side||i<6||t>265.1))?1:0})})}});
