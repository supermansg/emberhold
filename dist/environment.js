import * as T from './vendor/three.module.js';
const TAU=Math.PI*2,rad=Math.PI/180;
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
export const noise=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const smooth=n=>n*n*(3-2*n);
// NOAA fractional-year approximation, fixed reference 32.0N, 34.8E.
// https://gml.noaa.gov/grad/solcalc/solareqns.PDF . No device location needed.
export function solarPosition(date=new Date()){
 const year=date.getUTCFullYear(),days=(Date.UTC(year+1,0,1)-Date.UTC(year,0,1))/86400000;
 const day=(date-Date.UTC(year,0,1))/86400000;
 const gamma=TAU/days*(day-.5),s=Math.sin,c=Math.cos;
 const eq=229.18*(.000075+.001868*c(gamma)-.032077*s(gamma)-.014615*c(2*gamma)-.040849*s(2*gamma));
 const dec=.006918-.399912*c(gamma)+.070257*s(gamma)-.006758*c(2*gamma)+.000907*s(2*gamma)-.002697*c(3*gamma)+.00148*s(3*gamma);
 const minutes=date.getUTCHours()*60+date.getUTCMinutes()+date.getUTCSeconds()/60;
 const hour=(((minutes+eq+4*34.8)%1440)/4-180)*rad,lat=32*rad;
 const east=-c(dec)*s(hour),up=s(lat)*s(dec)+c(lat)*c(dec)*c(hour),north=c(lat)*s(dec)-s(lat)*c(dec)*c(hour);
 return {east,up,north,altitude:Math.asin(clamp(up,-1,1)),daylight:smooth(clamp((up+.09)/.3))};
}
export function weatherAt(ms){const block=ms/420000,i=Math.floor(block),f=smooth(block-i);const cloud=noise(i)* (1-f)+noise(i+1)*f;return {cloud,rain:smooth(clamp((cloud-.64)/.3)),wind:.3+cloud*.65};}
export function atmosphereAt(date=new Date()){const sun=solarPosition(date),weather=weatherAt(+date);return {...sun,...weather,label:(sun.up<-.09?'לילה':sun.up<.18?'דמדומים':'יום')+' · '+(weather.rain>.2?'גשם קל':weather.cloud>.45?'מעונן':'בהיר')};}
export class LivingWorld{
 setQuality(settings,loaded=false){this.quality=settings;this.decorationsReduced=loaded;}
 get particleCount(){let n=0;for(const m of [this.leaves,this.rain,this.dust,this.smoke,this.ripples])if(m?.visible)n+=m.count;return n;}
 constructor(scene){
  this.scene=scene;this.root=new T.Group();scene.add(this.root);this.dummy=new T.Object3D();this.clockMinute=-1;this.seen=new WeakSet();this.impulses=[];
  const mat=color=>new T.MeshStandardMaterial({color,roughness:1});
  const mesh=(geometry,material,x,y,z,sx=1,sy=1,sz=1)=>{const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);this.root.add(m);return m;};
  const box=new T.BoxGeometry(1,1,1),rock=new T.IcosahedronGeometry(1,1),cone=new T.ConeGeometry(1,1,6);
  mesh(box,mat('#294d3c'),0,-.8,-50,150,1.2,180).receiveShadow=true;
  // The continuous shared path is authored by BattleView; no overlapping road slab.
  const mountainMat=mat('#45675e');
  this.hills=[];for(let i=0;i<18;i++){const x=(i-8.5)*9,z=-68-noise(i+3)*35;this.hills.push(mesh(rock,mountainMat,x,2,z,10+noise(i)*13,7+noise(i+2)*14,15));}
  this.treeData=[];
  for(let side of [-1,1])for(let i=0;i<45;i++){
   const near=i<15;this.treeData.push({x:side*(near?8+noise(i+side*100)*3:8+noise(i+side*140)*42),z:near?i*2.4-18:-20-noise(i+side*80)*80,scale:near?.8+noise(i+30)*.7:1+noise(i+19)*1.8,phase:noise(i+side*50)*TAU});
  }
  this.trunks=new T.InstancedMesh(new T.CylinderGeometry(.18,.27,2.8,5),mat('#65523c'),90);this.root.add(this.trunks);
  this.canopy=new T.InstancedMesh(cone,mat('#35775e'),270);this.canopy.instanceMatrix.setUsage(T.DynamicDrawUsage);this.canopy.castShadow=true;this.canopy.receiveShadow=true;this.canopy.frustumCulled=false;this.root.add(this.canopy);
  this.treeData.forEach((v,i)=>{this.dummy.position.set(v.x,1.4*v.scale,v.z);this.dummy.scale.set(v.scale,v.scale,v.scale);this.dummy.rotation.set(0,v.phase,0);this.dummy.updateMatrix();this.trunks.setMatrixAt(i,this.dummy.matrix);for(let j=0;j<3;j++)this.canopy.setColorAt(i*3+j,new T.Color(j%2?'#2d6555':'#488569').multiplyScalar(.85+noise(i+17)*.25));});this.trunks.instanceMatrix.needsUpdate=true;
  // Low border plants add scale without filling the combat lane or adding per-blade draws.
  this.groundPlants=new T.InstancedMesh(new T.ConeGeometry(.12,.55,3),mat('#608564'),192);this.groundPlants.instanceMatrix.setUsage(T.DynamicDrawUsage);this.groundPlants.frustumCulled=false;this.root.add(this.groundPlants);
  this.flowers=new T.InstancedMesh(new T.IcosahedronGeometry(.07,0),mat('#b6be88'),48);this.root.add(this.flowers);
  for(let i=0;i<48;i++){const side=i%2?1:-1;this.dummy.position.set(side*(7.3+noise(i+410)*5),.25,-22+noise(i+418)*33);this.dummy.rotation.set(0,i,0);this.dummy.scale.setScalar(.7+noise(i+422));this.dummy.updateMatrix();this.flowers.setMatrixAt(i,this.dummy.matrix);this.flowers.setColorAt(i,new T.Color(i%3?'#d2bb80':'#9bbdce'));}this.flowers.instanceMatrix.needsUpdate=true;
  this.sun=new T.DirectionalLight('#ffe0ad',2.7);this.sun.castShadow=true;this.sun.shadow.mapSize.set(1024,1024);Object.assign(this.sun.shadow.camera,{left:-18,right:18,top:23,bottom:-23,near:.5,far:90});this.sun.shadow.bias=-.0006;scene.add(this.sun);
  this.ambient=new T.HemisphereLight('#bedbea','#263c32',1.5);scene.add(this.ambient);
  this.fill=new T.DirectionalLight('#a0d8ee',.5);this.fill.position.set(8,12,4);scene.add(this.fill);
  this.sunDisc=mesh(new T.SphereGeometry(2,12,8),new T.MeshBasicMaterial({color:'#fff2b4',fog:false}),0,30,-80);
  this.clouds=[];const cloudMat=new T.MeshBasicMaterial({color:'#cbdbe2',transparent:true,opacity:.22,depthWrite:false});for(let i=0;i<12;i++){const m=mesh(rock,cloudMat,(noise(i+9)-.5)*100,24+noise(i)*14,-35-noise(i+15)*60,9+noise(i)*9,1.4,4);this.clouds.push({m,x:m.position.x,phase:noise(i+23)*TAU});}
  this.leaves=new T.InstancedMesh(new T.PlaneGeometry(.16,.28),new T.MeshBasicMaterial({color:'#bdcb77',side:T.DoubleSide}),48);this.leaves.instanceMatrix.setUsage(T.DynamicDrawUsage);this.leaves.frustumCulled=false;this.root.add(this.leaves);
  this.rain=new T.InstancedMesh(new T.BoxGeometry(.018,.45,.018),new T.MeshBasicMaterial({color:'#bddde7',transparent:true,opacity:.35}),160);this.rain.instanceMatrix.setUsage(T.DynamicDrawUsage);this.rain.frustumCulled=false;this.root.add(this.rain);
  this.smoke=new T.InstancedMesh(rock,new T.MeshBasicMaterial({color:'#a9bbbd',transparent:true,opacity:.1,depthWrite:false}),12);this.smoke.instanceMatrix.setUsage(T.DynamicDrawUsage);this.smoke.frustumCulled=false;this.root.add(this.smoke);
  this.ripples=new T.InstancedMesh(new T.RingGeometry(.08,.11,8),new T.MeshBasicMaterial({color:'#b8d2cc',transparent:true,opacity:.2,depthWrite:false,side:T.DoubleSide}),16);this.ripples.instanceMatrix.setUsage(T.DynamicDrawUsage);this.ripples.frustumCulled=false;this.root.add(this.ripples);
  this.dust=new T.InstancedMesh(rock,new T.MeshBasicMaterial({color:'#b3a482',transparent:true,opacity:.45,depthWrite:false}),64);this.dust.instanceMatrix.setUsage(T.DynamicDrawUsage);this.dust.frustumCulled=false;this.root.add(this.dust);
 }
 dispose(){const geometries=new Set(),materials=new Set();this.root.traverse(n=>{if(n.geometry)geometries.add(n.geometry);if(n.material)materials.add(n.material);if(n.isInstancedMesh)n.dispose();});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.root.removeFromParent();this.sun.shadow.dispose();this.sun.removeFromParent();this.ambient.removeFromParent();this.fill.removeFromParent();}
 reset(){this.seen=new WeakSet();this.impulses=[];}
 update(t,game,date=new Date(),reduced=false){
  const minute=Math.floor(+date/10000);if(this.clockMinute!==minute){this.clockMinute=minute;this.atmosphere=atmosphereAt(date);const a=this.atmosphere,d=a.daylight;
   this.sun.position.set(a.east*35,Math.max(2,a.up*35),-a.north*35);this.sun.intensity=clamp(a.up*3.5,0,2.7)*(1-a.cloud*.55);this.sun.color.set(a.up<.25?'#ffb575':'#ffe7c6');
   this.ambient.intensity=1.15+d*.5;this.ambient.color.set(d>.5?'#bcdde4':'#779cce');this.fill.intensity=.55+(1-d)*.5;
   const sky=new T.Color('#102338').lerp(new T.Color('#89b9c7'),d).lerp(new T.Color('#657d8a'),a.cloud*.35);this.scene.background=sky;this.scene.fog=new T.Fog(sky,36-a.rain*4,115-a.rain*25);
   this.sunDisc.position.set(a.east*95,a.up*95,-a.north*95);this.sunDisc.visible=a.up>0;this.sunDisc.material.color.set(a.up<.2?'#ffb077':'#fff3c4');this.sunDisc.material.transparent=true;this.sunDisc.material.opacity=1-a.cloud*.7;
   this.clouds[0].m.material.opacity=.12+a.cloud*.28;this.rain.visible=a.rain>.01&&!reduced;
  }
  const a=this.atmosphere,time=reduced?0:t,wind=a.wind*(.6+.25*Math.sin(time*.31)+.15*Math.sin(time*.73));
  for(const f of game?.effects||[])if(['blast','death'].includes(f.type)&&!this.seen.has(f)){this.seen.add(f);this.impulses.push({x:(f.x-250)/35,z:(f.y-300)/35,at:t,power:f.type==='death'?.45:.75,seed:noise(f.x+f.y+t)});if(this.impulses.length>8)this.impulses.shift();}
  this.impulses=this.impulses.filter(v=>t-v.at<2);
  this.treeData.forEach((v,i)=>{let kick=0;if(!reduced)for(const p of this.impulses){const dist=Math.hypot(v.x-p.x,v.z-p.z);kick+=Math.exp(-dist*.32)*Math.sin((t-p.at)*13)*Math.exp(-(t-p.at)*2)*p.power;}
   const sway=reduced?0:(Math.sin(time*.8+v.phase)*.018+Math.sin(time*.33+v.z*.1)*.025)*wind+kick*.09;
   for(let j=0;j<3;j++){this.dummy.position.set(v.x+sway*(j+1)*2,(2+j*.95)*v.scale,v.z+Math.cos(time*.6+v.phase)*Math.abs(sway));this.dummy.rotation.set(sway*.4,v.phase,sway);this.dummy.scale.set(v.scale*(1.45-j*.24),2.5*v.scale,v.scale*(1.45-j*.24));this.dummy.updateMatrix();this.canopy.setMatrixAt(i*3+j,this.dummy.matrix);}
  });this.canopy.instanceMatrix.needsUpdate=true;
  for(let i=0;i<192;i++){const side=i%2?1:-1,x=side*(7.1+noise(i+201)*13),z=-33+noise(i+212)*48,h=.5+noise(i+215);this.dummy.position.set(x,.2*h,z);this.dummy.rotation.set(reduced?0:Math.sin(time*1.4+i)*wind*.12,noise(i+207)*TAU,reduced?0:Math.sin(time*.8+i)*.14);this.dummy.scale.set(1,h,1);this.dummy.updateMatrix();this.groundPlants.setMatrixAt(i,this.dummy.matrix);}this.groundPlants.instanceMatrix.needsUpdate=true;
  for(const {m,x,phase}of this.clouds)m.position.x=x+Math.sin(time*.014+phase)*12;
  this.leaves.visible=!reduced;this.leaves.count=this.quality?.leaves??48;for(let i=0;i<this.leaves.count;i++){const phase=noise(i+31),cycle=(time*(.035+phase*.02)+phase)%1;this.dummy.position.set((noise(i+80)-.5)*26+Math.sin(time*.4+phase*TAU)*wind*2,1+(1-cycle)*9,noise(i+92)*55-32);this.dummy.rotation.set(time*(.4+phase),phase*7,time*.8+phase);this.dummy.scale.setScalar(.7+phase);this.dummy.updateMatrix();this.leaves.setMatrixAt(i,this.dummy.matrix);}this.leaves.instanceMatrix.needsUpdate=true;
  this.rain.visible=a.rain>.01&&!reduced;this.rain.count=Math.floor((this.quality?.rain??160)*a.rain);for(let i=0;i<this.rain.count;i++){this.dummy.position.set((noise(i+4)-.5)*27,((noise(i+5)*17-time*12)%17+17)%17,noise(i+10)*45-25);this.dummy.rotation.set(0,0,-wind*.12);this.dummy.scale.setScalar(1);this.dummy.updateMatrix();this.rain.setMatrixAt(i,this.dummy.matrix);}this.rain.instanceMatrix.needsUpdate=true;
  this.smoke.count=this.quality?.smoke??12;for(let i=0;i<this.smoke.count;i++){const age=(time*.13+i/12)%1;this.dummy.position.set(1.04+age*wind,2.5+age*3,16+Math.sin(age*3+i)*.18);this.dummy.scale.setScalar(.13+age*.45);this.dummy.rotation.set(0,i,age);this.dummy.updateMatrix();this.smoke.setMatrixAt(i,this.dummy.matrix);}this.smoke.instanceMatrix.needsUpdate=true;
  this.dust.visible=!reduced;let n=0;for(const p of this.impulses)for(let j=0;j<8&&n<(this.quality?.dust??64);j++){const age=t-p.at,angle=j*TAU/8+p.seed*TAU;this.dummy.position.set(p.x+Math.cos(angle)*age*(1+p.seed),Math.sin(clamp(age/2)*Math.PI)*.6+.1,p.z+Math.sin(angle)*age*(1+p.seed));this.dummy.rotation.set(age,j,0);this.dummy.scale.setScalar((1-age/2)*(.07+p.seed*.08));this.dummy.updateMatrix();this.dust.setMatrixAt(n++,this.dummy.matrix);}this.dust.count=n;this.dust.instanceMatrix.needsUpdate=true;
  this.ripples.visible=!reduced&&a.rain>.1&&!this.decorationsReduced;this.ripples.count=this.quality?.ripples??16;
  for(let i=0;i<this.ripples.count;i++){const age=(time*1.4+noise(i+610))%1;this.dummy.position.set((i%2?1:-1)*(6.5+noise(i+601)*3),.08,-14+noise(i+602)*19);this.dummy.rotation.set(-Math.PI/2,0,0);this.dummy.scale.setScalar(.5+age*2);this.dummy.updateMatrix();this.ripples.setMatrixAt(i,this.dummy.matrix);}this.ripples.instanceMatrix.needsUpdate=true;
 }
}
