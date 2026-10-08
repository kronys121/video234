// ---------- overlays / global fx (NO camera shake) ----------
const ov=document.getElementById('ov');
const wp=wipes.map(w=>[ab(ov,`width:2400px;height:1500px;top:-210px;background:${w[1]}`),ab(ov,`width:2400px;height:1500px;top:-210px;background:${w[2]}`)]);
const fl=div(ov,'position:absolute;inset:0;opacity:0');
const fade=div(ov,'position:absolute;inset:0;background:#0b0720;opacity:0');
window.render=function(t){
 pend.length=0;
 scenes.forEach(s=>{const on=t>=s.t0&&t<s.t1;s.el.style.display=on?'block':'none';if(on)s.update(t)});
 wipes.forEach((w,i)=>{const p=P(t,w[0]-.26,.52),e=E.inOut(p),on=p>0&&p<1;const x=lerp(-2500,2500,e)*w[3];
  tf(wp[i][0],{x:960+x,y:540,ax:.5,ay:.5,r:0,o:on?1:0});wp[i][0].style.transform+=' skewX(-14deg)';
  const x2=lerp(-2500,2500,E.inOut(clamp(p-.1)))*w[3];tf(wp[i][1],{x:960+x2-0,y:540,o:on&&p>.02?1:0});wp[i][1].style.transform+=' skewX(-14deg)';wp[i][1].style.zIndex=0;wp[i][0].style.zIndex=2});
 let fa=0,fc='#fff';flashes.forEach(([ft,fd,c])=>{const k=1-P(t,ft,fd);if(t>=ft&&k>fa){fa=k*.85;fc=c}});fl.style.background=fc;fl.style.opacity=fa;
 fade.style.opacity=P(t,DUR-1.2,1.0)};
window.DUR=DUR;
