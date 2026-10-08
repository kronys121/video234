wipes.push([98.68,PINK,YEL,1],[153.38,CY,PUR,-1],[184.01,YEL,PUR,1]);
flashes.push([105.24,.15,'#fff'],[110.76,.15,'#fff'],[118.68,.15,'#fff'],[123.64,.15,'#fff'],[131.0,.15,'#fff'],[142.0,.15,'#fff'],[157.62,.15,'#fff'],[162.82,.15,'#fff'],[166.58,.15,'#fff'],[176.58,.15,'#fff'],[180.57,.15,'#fff']);
// world map builder
function worldMap(parent,w,h){const d=ab(parent,`width:${w}px;height:${h}px;border-radius:50px;background:#3f9a63;box-shadow:0 16px 0 #256b41;overflow:hidden`);
 div(d,`position:absolute;left:0;top:${h*.62}px;width:100%;height:${h*.38}px;background:${CY}`);
 div(d,`position:absolute;left:${w*.05}px;top:${h*.58}px;width:${w*.9}px;height:${h*.1}px;border-radius:50%;background:#e9d9a4`);
 [[.08,.1,.2],[.3,.18,.16]].forEach(([x,y,s])=>div(d,`position:absolute;left:${w*x}px;top:${h*y}px;width:${w*s}px;height:${w*s*.8}px;background:#8c8c9e;clip-path:polygon(50% 0,100% 100%,0 100%)`));
 const cb=div(d,`position:absolute;left:${w*.58}px;top:${h*.12}px;width:${w*.34}px;height:${h*.4}px`);
 [[0,.5,.2,.5],[.22,.2,.2,.8],[.44,.4,.2,.6],[.66,.1,.22,.9]].forEach(([x,y,ww,hh],i)=>div(cb,`position:absolute;left:${x*100}%;top:${y*100}%;width:${ww*100}%;height:${hh*50}%;background:${[PINK,YEL,'#b9aef5',WHT][i]};border-radius:6px`));
 div(d,`position:absolute;left:${w*.05}px;top:${h*.46}px;width:${w*.9}px;height:12px;border-radius:6px;background:#fff;transform:rotate(-6deg)`);
 div(d,`position:absolute;left:${w*.35}px;top:0;width:12px;height:${h*.6}px;border-radius:6px;background:#fff;transform:rotate(14deg)`);
 return d}
// ===== B1 98.68-105.24 =====
scene(98.68,105.24,PUR,PUR2,sc=>{
 const R=[row(sc,110,150,120,[['КАК',98.7],['УМЕСТИТЬ',99.0,YEL]],0),row(sc,110,290,100,[['ЕЩЁ',99.5],['БОЛЕЕ',100.0]],0),row(sc,110,440,120,[['ОГРОМНЫЙ',100.4,PINK],['МИР',100.9,PINK]],0),
  row(sc,110,590,100,[['В',101.2],['ТЕ',101.3],['ЖЕ',101.5]],0),row(sc,110,760,140,[['256',101.6,CY],['И',102.0],['256',103.0,CY]],0),row(sc,110,920,140,[['МЕГАБАЙТ',103.4,GRN]],0)];
 const map=worldMap(sc,660,420);
 const t1=tile(sc,300,150,GRN,GRNd,'<div style="font-size:26px;color:#073b2a;font-weight:800">ОЗУ</div><div style="font-size:60px;color:#073b2a">256 МБ</div>',34);
 const t2=tile(sc,300,150,CY,CYd,'<div style="font-size:26px;color:#0b3c52;font-weight:800">ВИДЕО</div><div style="font-size:60px;color:#0b3c52">256 МБ</div>',34);
 const ar=arrowR(sc,120,90,YEL);
 return t=>{R.forEach(r=>rowUpd(r,t));
  const sh=E.inOut(P(t,103.4,.6));
  const k=E.outBack(P(t,100.4,.6));tf(map,{x:1560,y:lerp(lerp(1400,360,E.outCubic(P(t,100.4,.6))),600,sh),s:(.5+.5*k)*(1-.5*sh),r:lerp(8,-2,k),o:t>=100.4?1:0});
  pop(t1,t,101.6,1350,880,{dur:.4,r:-3});pop(t2,t,103.0,1670,880,{dur:.4,r:3});
  tf(ar,{x:1560,y:760+Math.sin(t*9)*8,r:90,o:(t>=103.4)?1:0})}});

// ===== B2 105.24-110.76 =====
scene(105.24,110.76,YEL,'#ffd86b',sc=>{
 const R=[row(sc,110,300,250,[['ГТА',106.0,PUR],['5',106.4,PINKd]],0),row(sc,110,520,110,[['ЗАПУСКАЕТСЯ',107.1,PUR]],0),row(sc,110,690,150,[['НА',107.7,PUR],['PS3',107.8,PINKd]],0),row(sc,110,880,130,[['ПОРАЖАЕТ',109.8,PUR]],0)];
 const rays=ab(sc,`width:2400px;height:2400px;border-radius:50%;background:repeating-conic-gradient(rgba(255,255,255,.28) 0 7deg,transparent 7deg 14deg)`);
 const ps=psBox(sc,720);const cv=cvr(sc,420,'assets/cover5.jpg',AR5);
 const sb=ab(sc,`width:260px;height:260px;background:${PINK};clip-path:${star(12,50,40)};display:flex;align-items:center;justify-content:center;font-size:150px;color:#fff`,'!');
 return t=>{R.forEach(r=>rowUpd(r,t));tf(rays,{x:1540,y:540,r:t*12,o:1});
  const k=E.outBack(P(t,106.4,.5));tf(ps,{x:1540,y:lerp(1300,560,E.outCubic(P(t,106.4,.5)))+Math.sin(t*2.4)*8,s:.6+.4*k,r:lerp(-10,2,k),o:t>=106.4?1:0});
  pop(cv,t,107.8,1280,700,{r:-8,r0:20,dur:.5,dy:300});
  pop(sb,t,109.8,1750,200,{r:12,r0:30,dur:.4})}});

// ===== B3 110.76-118.68 =====
scene(110.76,118.68,GRN,'#6ee9b6',sc=>{
 const R=[row(sc,110,140,130,[['ОГРОМНЫЙ',110.8,PUR]],0),row(sc,110,300,120,[['ОТКРЫТЫЙ',111.5,PUR],['МИР',112.0,WHT]],0)];
 const names=['ГОРОД','СЕЛО','ГОРЫ','ОКЕАН','ЖИВОТНЫЕ'],ts=[113.5,114.0,115.4,116.0,117.2],cols=[PINK,YEL,'#b9aef5',CY,'#ffb86b'];
 const cards=names.map((n,i)=>{const c=ab(sc,`width:320px;height:380px;border-radius:44px;background:${cols[i]};box-shadow:0 16px 0 rgba(0,0,0,.28);overflow:hidden`);
  const art=div(c,'position:absolute;left:0;top:0;width:100%;height:290px;overflow:hidden');
  if(i===0){const s=skyline(art,260,200,7,[PUR,'#2a1d68','#4a3aa0','#fff']);s.style.left='30px';s.style.top='60px'}
  if(i===1){div(art,`position:absolute;left:-40px;top:170px;width:400px;height:260px;border-radius:50%;background:${GRN}`);div(art,`position:absolute;left:80px;top:100px;width:120px;height:90px;background:${PINKd};`);div(art,`position:absolute;left:70px;top:60px;width:140px;height:60px;background:${PUR};clip-path:polygon(50% 0,100% 100%,0 100%)`);div(art,`position:absolute;left:230px;top:40px;width:60px;height:60px;border-radius:50%;background:#fff3b0`)}
  if(i===2){div(art,`position:absolute;left:10px;top:70px;width:200px;height:200px;background:#6b5fc7;clip-path:polygon(50% 0,100% 100%,0 100%)`);div(art,`position:absolute;left:90px;top:120px;width:230px;height:160px;background:#4a3aa0;clip-path:polygon(50% 0,100% 100%,0 100%)`);div(art,`position:absolute;left:80px;top:70px;width:60px;height:50px;background:#fff;clip-path:polygon(50% 0,100% 100%,0 100%)`)}
  if(i===3){div(art,`position:absolute;left:230px;top:30px;width:60px;height:60px;border-radius:50%;background:${YEL}`);div(art,`position:absolute;left:0;top:130px;width:100%;height:170px;background:#1f9ac0`);div(art,`position:absolute;left:0;top:120px;width:100%;height:60px;background:radial-gradient(circle at 50% 100%,#fff 0 22%,transparent 23%) 0 0/70px 40px`)}
  if(i===4){div(art,`position:absolute;left:70px;top:130px;width:170px;height:80px;border-radius:40px;background:#8a4b1f`);div(art,`position:absolute;left:200px;top:90px;width:70px;height:70px;border-radius:50%;background:#8a4b1f`);
   div(art,`position:absolute;left:205px;top:52px;width:22px;height:50px;background:#8a4b1f;clip-path:polygon(50% 0,100% 100%,0 100%)`);div(art,`position:absolute;left:245px;top:52px;width:22px;height:50px;background:#8a4b1f;clip-path:polygon(50% 0,100% 100%,0 100%)`);
   [80,110,190,215].forEach(x=>div(art,`position:absolute;left:${x}px;top:190px;width:20px;height:70px;border-radius:8px;background:#6a3912`));div(art,`position:absolute;left:230px;top:112px;width:12px;height:12px;border-radius:50%;background:#fff`);div(art,`position:absolute;left:40px;top:130px;width:50px;height:20px;border-radius:10px;background:#8a4b1f;transform:rotate(-25deg)`)}
  div(c,`position:absolute;left:0;bottom:22px;width:100%;text-align:center;font-size:${n.length>7?42:50}px;color:${PUR}`,n);return c});
 const sun=ab(sc,`width:170px;height:170px;border-radius:50%;background:${YEL};box-shadow:0 0 0 26px rgba(255,203,61,.35)`);
 return t=>{R.forEach(r=>rowUpd(r,t));tf(sun,{x:1700,y:200,s:E.outBack(P(t,111.5,.5)),o:t>=111.5?1:0});
  cards.forEach((c,i)=>pop(c,t,ts[i],260+i*350,700,{dur:.5,dy:400,r:(i%2?3:-3),r0:12}))}});

// ===== B4 118.68-123.64 =====
scene(118.68,123.64,'#14335c','#1d4a85',sc=>{
 const R=[row(sc,110,130,110,[['ВСЁ',118.8],['ЭТО',119.1]],0,GRY),row(sc,110,290,130,[['РАБОТАЕТ',119.3,WHT]],0),row(sc,110,440,130,[['НА',119.8,WHT],['ЖЕЛЕЗЕ',119.9,CY]],0),
  row(sc,110,600,80,[['КОТОРОЕ',120.4,GRY],['К',120.8,GRY],['ВЫХОДУ',120.9,GRY],['ИГРЫ',121.3,GRY]],0),row(sc,110,730,100,[['УЖЕ',121.6],['СЧИТАЛОСЬ',122.0]],0),row(sc,110,900,120,[['УСТАРЕВШИМ',122.5,PINK]],0)];
 const ps=psBox(sc,700);ps.firstChild.nextSibling&&0;
 const stamp=ab(sc,`border:14px solid ${PINK};color:${PINK};border-radius:26px;padding:6px 36px;font-size:110px;letter-spacing:-.02em;white-space:nowrap;background:rgba(20,51,92,.85)`,'УСТАРЕЛО');
 const zz=bigWord(sc,'Z z z',120,'#b9aef5','#14335c');
 return t=>{R.forEach(r=>rowUpd(r,t));
  const k=E.outBack(P(t,119.3,.5));tf(ps,{x:1500,y:lerp(1300,540,E.outCubic(P(t,119.3,.5))),s:.6+.4*k,r:lerp(8,-2,k),o:t>=119.3?1:0});
  ps.style.filter=`grayscale(${P(t,121.6,.8)}) sepia(${.5*P(t,121.6,.8)})`;
  pop(zz,t,121.8,1760,260,{dur:.4,r:-10});tf(zz,{x:1700,y:240+Math.sin(t*3)*12,r:-10,o:t>=121.8?1:0});
  pop(stamp,t,122.5,1500,780,{r:-12,r0:20,dur:.35})}});

// ===== B5 123.64-131.0 timeline =====
scene(123.64,131.0,PUR,PUR2,sc=>{
 const R=[row(sc,110,120,100,[['PS3',123.6,CY],['ВЫШЛА',124.2],['В',124.5],['2006',124.6,CY]],0),row(sc,110,250,100,[['ГТА',126.3],['5',126.7,YEL],['—',127.0],['В',127.5],['2013',127.6,YEL]],0)];
 const line=ab(sc,`width:1400px;height:20px;border-radius:10px;background:#4a3aa0;transform-origin:left center`);
 const ticks=Array.from({length:7},(_,i)=>ab(sc,`width:18px;height:60px;border-radius:9px;background:${[PINK,YEL,GRN,CY,PINK,YEL,GRN][i]}`));
 const ps=psBox(sc,300),cv=cvr(sc,300,'assets/cover5.jpg',AR5);
 const y1=bigWord(sc,'2006',130,CY),y2=bigWord(sc,'2013',130,YEL);
 const sev=bigWord(sc,'7 ЛЕТ',240,PINK);
 return t=>{R.forEach(r=>rowUpd(r,t));
  tf(line,{x:260,y:640,ax:0,sx:E.outCubic(P(t,124.2,.8)),o:t>=124.2?1:0});
  pop(ps,t,124.6,260,500,{dur:.5,dy:200,r:-4});pop(y1,t,124.8,260,810,{dur:.4});
  pop(cv,t,127.6,1660,500,{dur:.5,dy:200,r:4});pop(y2,t,127.8,1660,810,{dur:.4});
  ticks.forEach((k,i)=>pop(k,t,129.4+i*.13,260+(i+1)*(1400/8),640,{dur:.3,dy:-120,r0:0}));
  pop(sev,t,130.0,960,900,{dur:.45,r:-4,r0:12})}});

// ===== B6a 131.0-142.0 =====
scene(131.0,142.0,PUR,PUR2,sc=>{
 const R=[row(sc,110,140,150,[['ROCKSTAR',131.7,YEL]],0),row(sc,110,290,130,[['ВМЕСТИЛА',132.6,WHT]],0),row(sc,110,420,80,[['САМУЮ',133.2,GRY],['ПОПУЛЯРНУЮ',133.6,GRY]],0),row(sc,110,510,80,[['ИГРУ',134.2,GRY],['В',134.5,GRY],['ИСТОРИИ',134.6,GRY]],0),
  row(sc,110,660,120,[['В',135.2],['КОНСОЛЬ',135.4,CY]],0),row(sc,110,790,80,[['У',135.8,GRY],['КОТОРОЙ',136.0,GRY],['ВСЕГО',136.3,GRY]],0)];
 const ps=psBox(sc,600),cv=cvr(sc,420,'assets/cover5.jpg',AR5);
 const t1=tile(sc,320,170,GRN,GRNd,'<div style="font-size:26px;color:#073b2a;font-weight:800">ОПЕРАТИВНАЯ</div><div style="font-size:64px;color:#073b2a">256 МБ</div>',34);
 const t2=tile(sc,320,170,CY,CYd,'<div style="font-size:26px;color:#0b3c52;font-weight:800">ВИДЕОПАМЯТЬ</div><div style="font-size:64px;color:#0b3c52">256 МБ</div>',34);
 const pl=bigWord(sc,'+',120,YEL);
 return t=>{R.forEach(r=>rowUpd(r,t));
  const k=E.outBack(P(t,131.7,.5));tf(ps,{x:1500,y:lerp(1300,470,E.outCubic(P(t,131.7,.5))),s:.6+.4*k,r:lerp(8,-2,k),o:t>=131.7?1:0});
  const m=E.inOut(P(t,135.2,.7));const k2=E.outBack(P(t,132.6,.5));
  tf(cv,{x:lerp(lerp(1000,1500,m),1500,0),y:lerp(lerp(1200,330,E.outCubic(P(t,132.6,.5))),520,m),s:lerp(.8+.2*k2,.62,m),r:lerp(10,0,m),o:(t>=132.6&&t<141.9)?1:0});
  pop(t1,t,136.7,1330,880,{dur:.4});pop(pl,t,140.2,1515,880,{dur:.3});pop(t2,t,140.4,1700,880,{dur:.4})}});

// ===== B6b 142.0-153.38 balance =====
scene(142.0,153.38,CY,'#7adbf7',sc=>{
 const R=[row(sc,110,130,100,[['ДЛЯ',143.0,PUR],['СРАВНЕНИЯ',143.4,WHT]],0),row(sc,110,300,150,[['РОЛИК',145.3,PUR],['В',145.6,PUR],['4K',145.7,PINKd]],0),row(sc,110,450,90,[['СНЯТЫЙ',146.4,PUR],['НА',146.8,PUR],['IPHONE',146.9,WHT]],0),
  row(sc,110,620,110,[['ВЕСИТ',148.3,PUR],['БОЛЬШЕ',148.6,PINKd]],0),row(sc,110,770,80,[['ЧЕМ',149.1,PUR],['ВСЯ',149.3,PUR],['ПАМЯТЬ',149.7,PUR],['PS3',150.1,WHT]],0),row(sc,110,900,80,[['ЗАПУСКАЛАСЬ',151.4,PUR],['ГТА',152.1,PUR],['5',152.5,PINKd]],0)];
 const fu=ab(sc,`width:0;height:0;border-left:90px solid transparent;border-right:90px solid transparent;border-bottom:200px solid ${PUR}`);
 const beam=ab(sc,`width:600px;height:26px;border-radius:13px;background:${PUR}`);
 const vid=tile(sc,260,160,YEL,YELd,'<div style="font-size:30px;color:#2a1d68;font-weight:800">10 СЕК</div><div style="font-size:72px;color:#2a1d68">4K</div>',34);
 const mem=tile(sc,200,120,GRN,GRNd,'<div style="font-size:22px;color:#073b2a;font-weight:800">PS3</div><div style="font-size:40px;color:#073b2a">512 МБ</div>',30);
 return t=>{R.forEach(r=>rowUpd(r,t));
  tf(fu,{x:1540,y:830,ay:.5,o:t>=143.4?1:0});
  const k=t<148.3?0:E.outElastic(P(t,148.3,.9));const ang=(t<148.3?Math.sin(t*3)*1.5:13*k)*(t>=143.4?1:0);
  const a=ang*Math.PI/180,L=290;tf(beam,{x:1540,y:700,r:-ang,o:t>=143.4?1:0});
  const lx=1540-L*Math.cos(a),ly=700+L*Math.sin(a),rx=1540+L*Math.cos(a),ry=700-L*Math.sin(a);
  tf(vid,{x:lx,y:ly-95,s:t>=144.3?(E.outBack(P(t,144.3,.4))):0,r:-ang*.3,o:t>=144.3?1:0});
  tf(mem,{x:rx,y:ry-70,s:t>=149.1?(E.outBack(P(t,149.1,.4))):0,o:t>=149.1?1:0})}});

// ===== B7 153.38-157.62 =====
scene(153.38,157.62,PUR,PUR2,sc=>{
 const R=[row(sc,110,250,150,[['КАК',153.4],['ЖЕ',153.6],['ЭТО',153.7]],0),row(sc,110,430,180,[['ВОЗМОЖНО?',153.9,YEL]],0),row(sc,110,650,120,[['РЕШЕНИЕ',154.9]],0),row(sc,110,790,150,[['ROCKSTAR',155.4,PINK]],0),row(sc,110,930,100,[['ВПЕЧАТЛЯЕТ',156.6,CY]],0)];
 const rays=ab(sc,`width:2200px;height:2200px;border-radius:50%;background:repeating-conic-gradient(rgba(255,203,61,.2) 0 7deg,transparent 7deg 14deg)`);
 const bulb=ab(sc,'width:360px;height:520px');
 div(bulb,`position:absolute;left:20px;top:0;width:320px;height:320px;border-radius:50%;background:${YEL};box-shadow:0 14px 0 ${YELd}`);
 div(bulb,`position:absolute;left:100px;top:290px;width:160px;height:120px;background:#d8d3f5;border-radius:0 0 28px 28px`);
 div(bulb,`position:absolute;left:120px;top:410px;width:120px;height:70px;background:#9d95d6;border-radius:0 0 40px 40px`);
 div(bulb,`position:absolute;left:100px;top:80px;width:50px;height:80px;border-radius:30px;background:rgba(255,255,255,.55);transform:rotate(25deg)`);
 const q=ab(sc,`font-size:520px;color:${PINK};line-height:1`,'?');
 return t=>{R.forEach(r=>rowUpd(r,t));
  tf(q,{x:1680,y:480,s:E.outElastic(P(t,153.9,.9)),r:-8+Math.sin(t*2.4)*4,o:(t>=153.9&&t<154.9)?1:0});
  tf(rays,{x:1680,y:430,r:t*16,o:t>=154.9?P(t,154.9,.3):0});
  const k=E.outBack(P(t,154.9,.5));tf(bulb,{x:1680,y:lerp(1300,460,E.outCubic(P(t,154.9,.5)))+Math.sin(t*3)*8,s:t>=154.9?.5+.5*k:0,r:lerp(-14,0,k),o:t>=154.9?1:0})}});

// ===== B8 157.62-162.82 =====
scene(157.62,162.82,'#ff7a8c','#ff9aa8',sc=>{
 const R=[row(sc,110,130,90,[['ПОКА',157.6,PUR],['ВЫ',157.9,PUR],['ИГРАЕТЕ',158.0,PUR]],0),row(sc,110,290,150,[['ВСЯ',158.7,WHT],['КАРТА',159.1,WHT]],0),row(sc,110,460,150,[['В',159.4,PUR],['ПАМЯТИ',159.5,PUR]],0),
  row(sc,110,630,140,[['НЕ',159.9,PUR],['ХРАНИТСЯ',160.0,WHT]],0),row(sc,110,830,200,[['НЕТ',161.7,PUR],['МЕСТА',162.0,YEL]],0)];
 const map=worldMap(sc,700,440);
 const box=ab(sc,`width:340px;height:170px;border-radius:36px;border:12px dashed ${PUR};background:rgba(27,19,64,.12)`);
 const bl=row(sc,1540,900,46,[['ПАМЯТЬ',159.5,PUR]],.5);const xm=xmark(sc,200);
 return t=>{R.forEach(r=>rowUpd(r,t));rowUpd(bl,t);
  const k=E.outBack(P(t,158.7,.6));tf(map,{x:1540,y:lerp(1300,370,E.outCubic(P(t,158.7,.6))),s:.7+.3*k,r:lerp(8,-2,k),o:t>=158.7?1:0});
  pop(box,t,159.5,1540,780,{dur:.4,dy:200});pop(xm,t,160.9,1540,560,{dur:.35,r0:30})}});

// ===== B9 162.82-166.58 =====
scene(162.82,166.58,CY,'#7adbf7',sc=>{
 const R=[row(sc,110,140,100,[['ВМЕСТО',162.8,PUR],['ЭТОГО',163.4,PUR]],0),row(sc,110,340,260,[['МИР',163.8,WHT]],0),row(sc,110,560,130,[['СОБИРАЕТСЯ',164.0,PUR]],0),row(sc,110,720,130,[['ВОКРУГ',164.6,PUR],['ВАС',165.0,YEL]],0),row(sc,110,880,100,[['ПРЯМО',165.3,PUR],['НА',165.7,PUR],['ХОДУ',165.9,PINKd]],0)];
 const cols=[PINK,YEL,GRN,'#b9aef5',WHT,PUR];
 const ts=Array.from({length:15},(_,i)=>{const gx=i%5,gy=Math.floor(i/5);const d=ab(sc,`width:110px;height:110px;border-radius:22px;background:${cols[(gx+gy*2)%6]};box-shadow:0 8px 0 rgba(0,0,0,.25)`);return{d,tx:1330+gx*130,ty:340+gy*130,i,a:rnd(i,2)*6.28}});
 const pl=ab(sc,`width:120px;height:120px;border-radius:50%;background:${YEL};box-shadow:0 10px 0 ${YELd}`);div(pl,`position:absolute;left:62px;top:40px;width:36px;height:36px;border-radius:50%;background:#fff`);div(pl,`position:absolute;left:74px;top:50px;width:16px;height:16px;border-radius:50%;background:${PUR}`);
 return t=>{R.forEach(r=>rowUpd(r,t));
  ts.forEach(o=>{const st=163.8+o.i*.14;const p=E.outBack(P(t,st,.5));const q=E.outCubic(P(t,st,.5));
   tf(o.d,{x:lerp(1330+Math.cos(o.a)*900,o.tx,q),y:lerp(340+Math.sin(o.a)*700,o.ty,q),r:(1-q)*200,s:t>=st?.4+.6*p:0,o:t>=st?1:0})});
  tf(pl,{x:1330+2*130,y:340+130,s:E.outBack(P(t,163.4,.4)),o:t>=163.4?1:0})}});

// ===== B10 166.58-176.58 =====
scene(166.58,176.58,'#0e0a28','#14103a',sc=>{
 const vc=clip(sc,'ride',630,'left:0;top:0;width:1920px;height:1080px');div(sc,'position:absolute;inset:0;background:rgba(14,10,40,.62)');
 const P1=[row(sc,110,130,90,[['КУДА',166.6],['БЫ',166.8],['ВЫ',166.9],['НИ',167.1],['ПОШЛИ',167.2,YEL]],0),row(sc,110,250,90,[['И',167.7],['НА',167.8],['ЧТО',167.9],['БЫ',168.1],['НИ',168.3],['ПОСМОТРЕЛИ',168.4,CY]],0),
  row(sc,110,430,130,[['ИГРА',169.4],['НЕЗАМЕТНО',169.6,YEL]],0),row(sc,110,620,190,[['ПОДГРУЖАЕТ',170.3,GRN]],0),row(sc,110,790,110,[['ВСЁ',170.8],['НУЖНОЕ',171.1]],0)];
 const P2=[row(sc,110,400,170,[['ИЗБАВЛЯЕТСЯ',174.0,PINK]],0),row(sc,110,580,100,[['ОТ',174.7],['ТОГО,',174.8]],0),row(sc,110,720,100,[['ЧТО',175.1],['ОСТАЛОСЬ',175.3],['ПОЗАДИ',175.8,YEL]],0)];
 const gb=Array.from({length:7},(_,i)=>memBlock(sc,70,GRN)),pb=Array.from({length:7},(_,i)=>memBlock(sc,70,PINK));
 const plus=ab(sc,`font-size:90px;color:${PUR};width:100px;height:100px;border-radius:50%;background:${GRN};display:flex;align-items:center;justify-content:center`,'+');
 const minus=ab(sc,`font-size:90px;color:${PUR};width:100px;height:100px;border-radius:50%;background:${PINK};display:flex;align-items:center;justify-content:center`,'−');
 return t=>{clipT(vc,t-166.58+3);P1.forEach(r=>rowUpd(r,t,{o:1-P(t,173.2,.2)}));P2.forEach(r=>rowUpd(r,t));
  gb.forEach((b,i)=>{const st=170.3+i*.35;const p=P(t,st,.9);tf(b,{x:lerp(1900,1500+(i%3)*90,E.outCubic(p)),y:300+Math.floor(i/3)*100+(i%2)*40,s:1,r:(1-p)*90,o:(t>=st&&t<173.4)?1:0})});
  pop(plus,t,170.3,1700,170,{dur:.35,t1:173.4,fade:.2});
  pb.forEach((b,i)=>{const st=174.0+i*.3;const p=P(t,st,.9);tf(b,{x:lerp(1500,1500+((i*53)%300)-250,E.inCubic(p)),y:lerp(300+(i%4)*110,1200,E.inCubic(p)),r:p*200,s:1-.4*p,o:(t>=st&&p<1)?1:0})});
  pop(minus,t,174.0,1700,170,{dur:.35})}});

// ===== B11 176.58-180.57 =====
scene(176.58,180.57,YEL,'#ffd86b',sc=>{
 const R=[row(sc,110,160,120,[['САМОЕ',176.6,PUR],['ЗАБАВНОЕ',176.9,PUR]],0),row(sc,110,360,200,[['ИГРОК',177.8,PINKd]],0),row(sc,110,570,120,[['ПОЧТИ',178.1,PUR],['НИЧЕГО',178.5,PUR]],0),row(sc,110,740,130,[['НЕ',179.3,PUR],['ЗАМЕЧАЕТ',179.5,PINKd]],0)];
 const face=ab(sc,`width:440px;height:440px;border-radius:50%;background:#ffe06a;box-shadow:0 16px 0 ${YELd}`);
 [[70,160],[250,160]].forEach(([x,y])=>div(face,`position:absolute;left:${x}px;top:${y}px;width:120px;height:80px;border-radius:14px 14px 50px 50px;background:${PUR}`));
 div(face,`position:absolute;left:180px;top:178px;width:80px;height:14px;background:${PUR}`);
 div(face,`position:absolute;left:130px;top:290px;width:180px;height:80px;border:16px solid ${PUR};border-top:none;border-radius:0 0 180px 180px`);
 const bl=Array.from({length:12},(_,i)=>memBlock(sc,60,[PINK,GRN,CY,PUR][i%4]));
 return t=>{R.forEach(r=>rowUpd(r,t));
  pop(face,t,177.8,1500,560,{dur:.5,r:-4,r0:15});
  bl.forEach((b,i)=>{const st=178.1+i*.18;const p=P(t,st,1.3);tf(b,{x:lerp(2100,900,p),y:200+(i%4)*210+Math.sin(i)*30,r:p*400,s:1,o:(t>=st&&p<1)?1:0})})}});

// ===== B12 180.57-187.09 =====
scene(180.57,187.09,PUR,PUR2,sc=>{
 const P1=[row(sc,110,130,110,[['НО',180.6],['ПОЧЕМУ',180.9]],0),row(sc,110,290,120,[['НЕЛЬЗЯ',181.3,PINK],['БЫЛО',181.6]],0),row(sc,110,450,150,[['ЗАГРУЗИТЬ',182.2,YEL]],0),row(sc,110,620,150,[['КАРТУ',182.7]],0),row(sc,110,780,150,[['ЦЕЛИКОМ?',183.0,PINK]],0)];
 const P2=[row(sc,110,330,150,[['ЗАГЛЯНУТЬ',185.4,YEL]],0),row(sc,110,540,180,[['ВНУТРЬ',185.9],['PS3',186.3,CY]],0)];
 const ps=psBox(sc,720);
 const mg=ab(sc,'width:360px;height:460px');
 div(mg,`position:absolute;left:0;top:0;width:360px;height:360px;border-radius:50%;border:26px solid ${YEL};background:rgba(255,255,255,.18);box-shadow:0 12px 0 ${YELd}`);
 div(mg,`position:absolute;left:236px;top:300px;width:34px;height:190px;border-radius:17px;background:${YELd};transform:rotate(-40deg);transform-origin:top center`);
 const chip=chipEl(sc);
 return t=>{P1.forEach(r=>rowUpd(r,t,{o:1-P(t,184.7,.2)}));P2.forEach(r=>rowUpd(r,t));
  const k=E.outBack(P(t,181.3,.5));tf(ps,{x:1500,y:lerp(1300,560,E.outCubic(P(t,181.3,.5))),s:.6+.4*k,r:lerp(8,-2,k),o:t>=181.3?1:0});
  const m=E.inOut(P(t,184.2,.9));tf(mg,{x:lerp(1900,1480,m)+Math.sin(t*2)*6*m,y:lerp(900,520,m),s:t>=184.2?1:0,r:0,o:t>=184.2?1:0});
  tf(chip,{x:1470,y:420,s:.26*E.outElastic(P(t,186.3,.7)),o:t>=186.3?1:0})}});
