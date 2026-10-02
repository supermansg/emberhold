// Fixed GPU resources for elemental attacks, chains and impacts. Never touches Game.
import * as T from './vendor/three.module.js';
const UP=new T.Vector3(0,1,0);
const COLORS={gunner:'#ffe4a0',fire:'#ff9a44',electric:'#82ffed',frost:'#beeaff'};
export class CombatVFX {
 constructor(scene){
  this.scene=scene;this.caps={shot:24,muzzle:8,bolt:20,impact:16,blast:8,death:8,ring:4};
  this.capacity=Object.values(this.caps).reduce((a,b)=>a+b,0);this.slots=[];this.geometries=new Set();this.materials=new Set();
  const geometry=g=>{this.geometries.add(g);return g;};
  this.geo={bullet:geometry(new T.CylinderGeometry(.065,.065,.5,6)),thorn:geometry(new T.ConeGeometry(.09,.55,5)),fire:geometry(new T.IcosahedronGeometry(.18,1)),ice:geometry(new T.OctahedronGeometry(.2,0)),trail:geometry(new T.ConeGeometry(.13,.85,6)),flash:geometry(new T.PlaneGeometry(.55,.12)),ring:geometry(new T.RingGeometry(.86,1,24)),debris:geometry(new T.BoxGeometry(.05,.1,.05)),arc:geometry(new T.CylinderGeometry(.025,.025,1,5))};
  const star=new T.Shape();for(let i=0;i<16;i++){const a=i*Math.PI/8,r=i%2?.16:.58;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?star.lineTo(x,y):star.moveTo(x,y);}star.closePath();this.geo.contact=geometry(new T.ShapeGeometry(star));
  this.dummy=new T.Object3D();this.direction=new T.Vector3();this.segment=new T.Vector3();this.a=new T.Vector3();this.b=new T.Vector3();
  this.empty=new T.Group();this.empty.visible=false;this.empty.userData.pooledVfx=true;
  for(const [kind,cap]of Object.entries(this.caps))for(let i=0;i<cap;i++)this.slots.push(this.create(kind));
 }
 create(kind){
  const o=new T.Group(),mat=new T.MeshBasicMaterial({color:'#ffffff',transparent:true,depthWrite:false,toneMapped:false,side:T.DoubleSide}),accent=mat.clone();this.materials.add(mat);this.materials.add(accent);
  o.userData={pooledVfx:true,kind,busy:false,material:mat,accent,source:new T.Vector3(),target:new T.Vector3(),origin:new T.Vector3()};
  if(kind==='shot'){o.add(new T.Mesh(this.geo.fire,mat));const tail=new T.Mesh(this.geo.trail,accent);tail.position.y=-.5;o.add(tail);const envelope=new T.Mesh(this.geo.fire,accent);o.add(envelope);}
  else if(kind==='muzzle'){for(const angle of [0,Math.PI/2]){const m=new T.Mesh(this.geo.flash,mat);m.rotation.z=angle;o.add(m);}}
  else if(kind==='bolt'){const arc=new T.InstancedMesh(this.geo.arc,mat,10);arc.instanceMatrix.setUsage(T.DynamicDrawUsage);arc.frustumCulled=false;o.add(arc);}
  else{const ring=new T.Mesh(this.geo.ring,accent);ring.rotation.x=-Math.PI/2;o.add(ring);const sparks=new T.InstancedMesh(this.geo.debris,mat,6);sparks.instanceMatrix.setUsage(T.DynamicDrawUsage);sparks.frustumCulled=false;o.add(sparks);const contact=new T.Mesh(this.geo.contact,mat);o.add(contact);}
  o.visible=false;return o;
 }
 acquire(kind,hero='gunner'){
  if(this.disposed)return this.empty;const o=this.slots.find(s=>s.userData.kind===kind&&!s.userData.busy);if(!o)return this.empty;
  const d=o.userData;d.busy=true;d.hero=hero;d.material.color.set(hero==='fire'?'#ffe7a9':COLORS[hero]||'#ffe4a0');d.accent.color.set(COLORS[hero]||'#ffe4a0');d.material.opacity=1;d.accent.opacity=.5;
  o.position.set(0,0,0);o.quaternion.identity();o.scale.setScalar(1);o.visible=true;
  if(kind==='shot')o.children[0].geometry=hero==='frost'?this.geo.ice:this.geo.fire;
  this.scene.add(o);return o;
 }
 release(o){if(o===this.empty)return;o.userData.busy=false;o.visible=false;o.removeFromParent();}
 update(o,f,source,target,camera,reduced=false,decorative=true){
  if(o===this.empty)return;const d=o.userData,k=Math.max(0,Math.min(1,1-f.life/f.maxLife));d.source.copy(source);d.target.copy(target);
  const kind=d.kind;const color=f.color||COLORS[d.hero]||'#ffe4a0';d.material.color.set(d.hero==='fire'&&kind==='shot'?'#ffe7a9':color);d.accent.color.set(color);
  if(kind==='shot')o.children[0].geometry=f.projectile?.style==='thorn'?this.geo.thorn:d.hero==='gunner'?this.geo.bullet:d.hero==='frost'?this.geo.ice:this.geo.fire;
  d.material.opacity=kind==='shot'?1:Math.pow(1-k,.7);d.accent.opacity=(1-k)*.55;
  if(kind==='shot'){
   o.position.copy(d.origin).lerp(target,k);if(d.hero==='fire')o.position.y+=Math.sin(k*Math.PI)*.45;
   this.direction.copy(target).sub(d.origin).normalize();o.quaternion.setFromUnitVectors(UP,this.direction);
   o.children[0].rotation.y=k*5;o.children[0].scale.setScalar(f.projectile?.style==='meteor'?1.8:d.hero==='fire'?1+k*.28:1);if(d.hero==='frost')o.children[0].scale.set(.65,1.5,.65);if(f.projectile?.style==='pierce')o.children[0].scale.y=1.5;
   const envelope=o.children[2];envelope.visible=d.hero==='fire'&&!reduced&&!!decorative;envelope.scale.set(1.45+Math.sin(k*24)*.12,1.8+k*.7,1.45);envelope.rotation.y=k*7;
   const tail=o.children[1];tail.visible=!reduced;tail.scale.set(d.hero==='fire'?1+k*.4:.4,decorative?1.3:.65,d.hero==='fire'?1+k*.4:.4);
  }else if(kind==='muzzle'){
   o.position.copy(source);o.quaternion.copy(camera.quaternion);o.scale.setScalar((reduced?.5:1)*(1-k*.7));
  }else if(kind==='bolt'){
   const arc=o.children[0];this.a.copy(source);
   for(let i=0;i<10;i++){
    const u=(i+1)/10;this.b.copy(source).lerp(target,u);
    if(i<9&&!reduced){const bend=Math.sin((i+1)*2.7+source.x*3+target.z)*.13;this.b.x+=bend;this.b.y+=Math.cos(i*2.3)*.1;}
    this.segment.copy(this.b).sub(this.a);this.dummy.position.copy(this.a).lerp(this.b,.5);this.dummy.quaternion.setFromUnitVectors(UP,this.direction.copy(this.segment).normalize());
    this.dummy.scale.set(1-k*.6,this.segment.length(),1-k*.6);this.dummy.updateMatrix();arc.setMatrixAt(i,this.dummy.matrix);this.a.copy(this.b);
   }
   arc.instanceMatrix.needsUpdate=true;
  }else{
   const isImpact=kind==='impact',radius=isImpact?.28:Math.min(3.3,(f.radius||26)/35);
   o.position.copy(target);o.position.y=isImpact?target.y:.095;
   const ring=o.children[0];if(isImpact){ring.quaternion.copy(camera.quaternion);ring.scale.setScalar(.16+k*.32);}else{ring.rotation.set(-Math.PI/2,0,0);ring.scale.setScalar(radius*(.4+k*.6));}
   const contact=o.children[2];contact.visible=kind!=='ring'&&k<.38;contact.quaternion.copy(camera.quaternion);contact.scale.setScalar((isImpact?.65:Math.min(1.6,radius))*(.65+Math.sin(Math.min(1,k/.38)*Math.PI)*.55));if(d.hero==='frost')contact.scale.x*=.6;contact.rotation.z+=d.hero==='frost'?Math.PI/4:0;
   const sparks=o.children[1];if(kind==='ring')decorative=0;sparks.count=typeof decorative==='number'?Math.min(6,Math.max(0,decorative)):decorative?6:0;sparks.visible=!reduced&&sparks.count>0;
   this.direction.copy(target).sub(source).normalize();
   for(let i=0;i<6;i++){
    const angle=i*2.399,travel=k*(isImpact?.45:Math.min(1.5,radius));
    this.dummy.position.set(Math.cos(angle)*travel+this.direction.x*travel*.7,Math.sin(k*Math.PI)*(d.hero==='fire'?.4:.25)+.05,Math.sin(angle)*travel+this.direction.z*travel*.7);
    this.dummy.rotation.set(k*6,i,k*i);this.dummy.scale.set(d.hero==='frost'?.7:1,d.hero==='frost'?2:1,1);this.dummy.scale.multiplyScalar(1-k*.85);this.dummy.updateMatrix();sparks.setMatrixAt(i,this.dummy.matrix);
   }
   sparks.instanceMatrix.needsUpdate=true;
  }
 }
 get stats(){let active=0,particles=0;for(const o of this.slots)if(o.userData.busy){active++;const n=o.children[1];if(n?.isInstancedMesh&&n.visible)particles+=n.count;}return {allocated:this.slots.length,active,particles};}
 reset(){for(const o of this.slots)this.release(o);}
 dispose(){if(this.disposed)return;this.disposed=true;this.reset();for(const o of this.slots)o.traverse(n=>{if(n.isInstancedMesh)n.dispose();});for(const g of this.geometries)g.dispose();for(const m of this.materials)m.dispose();}
}

// Engine scars retain their authoritative records; decals are fixed presentation slots.
export class GroundScars {
 constructor(scene){
  this.scene=scene;this.slots=[];this.empty=new T.Group();this.empty.visible=false;this.empty.userData.groundScar=true;
  this.circle=new T.CircleGeometry(1,12);const lines=[];
  for(let i=0;i<5;i++){const a=i*1.256;lines.push(new T.Vector3(0,.02,0),new T.Vector3(Math.cos(a)*.6,.025,Math.sin(a)*.6),new T.Vector3(Math.cos(a)*.6,.025,Math.sin(a)*.6),new T.Vector3(Math.cos(a+.2)*1.2,.02,Math.sin(a+.2)*1.2));}
  this.cracks=new T.BufferGeometry().setFromPoints(lines);
  for(let i=0;i<25;i++){const o=new T.Group();o.userData.groundScar=true;o.userData.busy=false;
   const floor=new T.Mesh(this.circle,new T.MeshBasicMaterial({color:'#3f3c32',transparent:true,opacity:.6,depthWrite:false}));floor.rotation.x=-Math.PI/2;o.add(floor);
   o.add(new T.LineSegments(this.cracks,new T.LineBasicMaterial({color:'#272b26',transparent:true,opacity:.8})));this.slots.push(o);
  }
 }
 acquire(){if(this.disposed)return this.empty;const o=this.slots.find(o=>!o.userData.busy);if(!o)return this.empty;o.userData.busy=true;o.visible=true;this.scene.add(o);return o;}
 release(o){if(o===this.empty)return;o.userData.busy=false;o.visible=false;o.removeFromParent();}
 get active(){return this.slots.reduce((n,o)=>n+!!o.userData.busy,0);}
 reset(){for(const o of this.slots)this.release(o);}
 dispose(){if(this.disposed)return;this.disposed=true;this.reset();this.circle.dispose();this.cracks.dispose();for(const o of this.slots)for(const child of o.children)child.material.dispose();}
}
