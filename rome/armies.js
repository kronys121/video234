import * as E from './engine.js';
const {THREE,scene,heightAt,B,hooks,clamp,lerp,smooth,hash2,addLabel}=E;

const armies=[],fleets=[];
function pathInfo(path){
  const cum=[0];for(let i=1;i<path.length;i++)cum.push(cum[i-1]+Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]));
  return {path,cum,L:cum[cum.length-1]};
}
function at(P,s){
  s=clamp(s,0,P.L);let i=0;while(i<P.cum.length-2&&P.cum[i+1]<s)i++;
  const [x0,z0]=P.path[i],[x1,z1]=P.path[i+1],l=P.cum[i+1]-P.cum[i]||1,u=(s-P.cum[i])/l;
  return [lerp(x0,x1,u),lerp(z0,z1,u),(x1-x0)/l,(z1-z0)/l];
}
/**
 * army: soldiers march along a path (years -> times), camp around the destination, then retreat or vanish.
 * y0 = year of departure, y1 = year of arrival, holdYears = how long they stay, retYears = retreat time (0 = vanish)
 */
export function army(s){
  const a={cols:s.cols??8,sp:0.8,rk:0.9,R:s.R??4,after:s.after??'vanish',size:2.3,...s,P:pathInfo(s.path)};
  a.tD=s.tD??B(s.y0);a.tA=s.tA??B(s.y1);a.tH=a.tA+(s.hold??1.5);a.tR=a.tH+(s.ret??0);
  a.speed=a.P.L/Math.max(0.5,a.tA-a.tD);
  armies.push(a);
  addLabel(s.name,t=>{
    if(t<a.tD||t>a.tR)return null;
    const S=t<a.tA?a.P.L*clamp((t-a.tD)/(a.tA-a.tD)):t<a.tH?a.P.L:a.P.L*(1-clamp((t-a.tH)/(a.tR-a.tH+1e-6)));
    const [x,z]=at(a.P,S);return [x,heightAt(x,z)+2.6,z];
  },a.tD,a.tR+0.3,'army',s.color);
  return a;
}
export function fleet(s){
  const f={...s,P:pathInfo(s.path)};f.tD=s.tD??B(s.y0);f.tA=s.tA??B(s.y1);f.tH=f.tA+(s.hold??2);f.tR=f.tH+(s.ret??0);
  f.ships=[];
  for(let i=0;i<(s.n??5);i++){
    const g=new THREE.Group(),hull=new THREE.Mesh(new THREE.BoxGeometry(2.6,0.5,0.9),new THREE.MeshStandardMaterial({color:s.hull??'#3a2a1c',flatShading:true}));
    hull.position.y=0.3;hull.castShadow=true;g.add(hull);
    const sail=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.8),new THREE.MeshStandardMaterial({color:s.color,side:THREE.DoubleSide,flatShading:true}));
    sail.position.set(0,1.3,0);sail.rotation.y=Math.PI/2;sail.castShadow=true;g.add(sail);
    const mast=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,2.3),new THREE.MeshStandardMaterial({color:'#4a3320'}));mast.position.y=1.2;g.add(mast);
    g.visible=false;scene.add(g);f.ships.push({g,off:i*1.9+hash2(i,3),side:(hash2(i,9)-0.5)*5});
  }
  fleets.push(f);
  addLabel(s.name,t=>{if(t<f.tD||t>f.tR)return null;const S=t<f.tA?f.P.L*clamp((t-f.tD)/(f.tA-f.tD)):t<f.tH?f.P.L:f.P.L*(1-clamp((t-f.tH)/(f.tR-f.tH+1e-6)));const [x,z]=at(f.P,S);return [x,3.2,z]},f.tD,f.tR+0.3,'army',s.color);
  return f;
}

let sM,fM,pM,eM,total=0,etotal=0;
const dummy=new THREE.Object3D(),tc=new THREE.Color();
export function finalize(){
  for(const a of armies){total+=a.n;etotal+=(a.big?.n??0)}
  const sg=new THREE.BoxGeometry(1,1,1);sg.translate(0,0.5,0);
  const mat=()=>new THREE.MeshStandardMaterial({flatShading:true,roughness:0.9});
  sM=new THREE.InstancedMesh(sg,mat(),Math.max(1,total));sM.setColorAt(0,new THREE.Color('#fff'));
  pM=new THREE.InstancedMesh(sg,mat(),Math.max(1,Math.ceil(total/10)));pM.setColorAt(0,new THREE.Color('#fff'));
  fM=new THREE.InstancedMesh(sg,mat(),Math.max(1,Math.ceil(total/10)));fM.setColorAt(0,new THREE.Color('#fff'));
  eM=new THREE.InstancedMesh(sg,mat(),Math.max(1,etotal*3));eM.setColorAt(0,new THREE.Color('#fff'));
  for(const m of [sM,pM,fM,eM]){m.count=0;m.frustumCulled=false;m.castShadow=true;scene.add(m)}
  hooks.update.push(update);
}
function put(m,n,x,y,z,ry,sx,sy,sz,col){
  dummy.position.set(x,y,z);dummy.rotation.set(0,ry,0);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();
  m.setMatrixAt(n,dummy.matrix);m.setColorAt(n,col);
}
function update(t){
  let ns=0,np=0,ne=0;
  for(const a of armies){
    if(t<a.tD||t>a.tR+0.7)continue;
    const fade=Math.min(clamp((t-a.tD)/0.6),a.tR>a.tH?1:clamp((a.tR+0.7-t)/0.6));
    const vanish=a.tR>a.tH?1:clamp((a.tH+0.5-t)/0.5)+0;
    const k=Math.min(fade,a.after==='retreat'?clamp((a.tR+0.7-t)/0.6):clamp((a.tR+0.7-t)/0.6));
    const L=a.P.L,col=new THREE.Color(a.color),col2=new THREE.Color(a.color2??a.color).multiplyScalar(0.85);
    const dm=a.big?a.big.n:0;
    const total=a.n+dm*3;
    for(let j=0;j<a.n;j++){
      const r=Math.floor(j/a.cols),c=j%a.cols,lat=(c-(a.cols-1)/2)*a.sp;
      let x,z,ry=0,vis=true;
      const slotA=hash2(j,a.key?.length??1)*Math.PI*2,slotR=Math.sqrt(hash2(j,7+(a.key?.length??0)))*a.R;
      const dest=a.P.path[a.P.path.length-1],sx=dest[0]+Math.cos(slotA)*slotR,sz=dest[1]+Math.sin(slotA)*slotR;
      if(t<a.tH){
        const sv=(t<a.tA?L*clamp((t-a.tD)/(a.tA-a.tD)):L+(t-a.tA)*a.speed)-r*a.rk;
        if(sv<0)vis=false;
        const [px,pz,tx,tz]=at(a.P,Math.min(sv,L));
        x=px-tz*lat;z=pz+tx*lat;ry=Math.atan2(-tz,tx);
        if(sv>L){const u=smooth(0,3,sv-L);x=lerp(x,sx,u);z=lerp(z,sz,u)}
      }else{
        const d=(t-a.tH)*a.speed-(a.after==='retreat'?r*a.rk*0.5:0);
        if(a.after!=='retreat'||d<=0){x=sx;z=sz}
        else if(d<3){x=lerp(sx,dest[0],d/3);z=lerp(sz,dest[1],d/3)}
        else{const [px,pz,tx,tz]=at(a.P,L-(d-3));x=px-tz*lat;z=pz+tx*lat;ry=Math.atan2(tz,-tx);if(L-(d-3)<=0)vis=false}
      }
      if(!vis)continue;
      const y=heightAt(x,z)+Math.abs(Math.sin(t*9+j*1.7))*0.05;
      const sc=a.size??1,kk=k*(hash2(j,3)<0.5?1:1);
      put(sM,ns++,x,y,z,ry,0.3*sc*kk,0.62*sc*kk,0.22*sc*kk,j%7===0?col2:col);
    }
    // standards: one every 16 soldiers
    for(let j=0;j<a.n;j+=16){
      const r=Math.floor(j/a.cols);const sv=(t<a.tA?L*clamp((t-a.tD)/(a.tA-a.tD)):L+(t-a.tA)*a.speed)-r*a.rk;
      if(t>=a.tH||sv<0)continue;
      const [px,pz]=at(a.P,Math.min(sv,L)),y=heightAt(px,pz);
      const z2=a.size;put(pM,np,px,y,pz,0,0.07*z2,1.5*z2*k,0.07*z2,tc.set('#5a4026'));
      put(fM,np,px+0.4*z2,y+1.15*z2*k,pz,0,0.6*z2*k,0.38*z2*k,0.05*z2,tc.set(a.flag??a.color));np++;
    }
    // elephants / big units
    if(a.big){for(let j=0;j<dm;j++){
      const sv=(t<a.tA?L*clamp((t-a.tD)/(a.tA-a.tD)):L)-(j+1)*5.0;
      if(sv<0||t>=a.tH)continue;
      const [px,pz,tx,tz]=at(a.P,sv),y=heightAt(px,pz),ry=Math.atan2(-tz,tx);
      put(eM,ne++,px,y+1.0,pz,ry,3.4,1.6,1.4,tc.set('#7a7a74'));put(eM,ne++,px,y,pz,ry,0.8,1.2,1.0,tc.set('#6c6c66'));put(eM,ne++,px+tx*1.8,y+1.0,pz+tz*1.8,ry,1.0,0.5,0.6,tc.set('#8a8a82'));
    }}
  }
  sM.count=ns;fM.count=pM.count=np;eM.count=ne;
  for(const m of [sM,fM,pM,eM]){m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true}
  for(const f of fleets){
    const on=t>=f.tD&&t<=f.tR+0.7;
    f.ships.forEach((s,i)=>{
      s.g.visible=on;if(!on)return;
      const S=(t<f.tA?f.P.L*clamp((t-f.tD)/(f.tA-f.tD)):t<f.tH?f.P.L:f.P.L*(1-clamp((t-f.tH)/(f.tR-f.tH+1e-6))))-s.off*1.4;
      const [x,z,tx,tz]=at(f.P,Math.max(0,S));
      s.g.position.set(x-tz*s.side,0.15+Math.sin(t*2+i)*0.06,z+tx*s.side);s.g.rotation.y=Math.atan2(-tz,tx);
      s.g.scale.setScalar(clamp(S/3+1)*clamp((f.tR+0.7-t)/0.6));
    });
  }
}
