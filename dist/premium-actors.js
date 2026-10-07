// M3 proof pair. Shared sculpted surfaces, articulated groups, no simulation access.
import {ActorPresentation} from './actor-presentation.js';
import * as T from './vendor/three.module.js';
import {surfaceMaterial} from './m1-presentation.js';
const shapes=new Map(),batches=new Map();
function shape(kind){
 if(shapes.has(kind))return shapes.get(kind);
 let g;
 if(kind==='round'){
  // Rounded box vertices: broad planes with a soft manufactured edge.
  g=new T.BoxGeometry(1,1,1,3,3,3);const p=g.attributes.position,v=new T.Vector3(),core=new T.Vector3();
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);core.copy(v).clampScalar(-.37,.37);v.sub(core).normalize().multiplyScalar(.13).add(core);p.setXYZ(i,v.x,v.y,v.z);}g.computeVertexNormals();
 }else if(kind==='sphere')g=new T.SphereGeometry(1,12,8);
 else if(kind==='capsule')g=new T.CapsuleGeometry(.5,1,3,8);
 else if(kind==='ring')g=new T.TorusGeometry(.78,.22,4,12);
 else if(kind==='cone')g=new T.ConeGeometry(1,1,8);
 else g=new T.CylinderGeometry(1,1,1,12);
 shapes.set(kind,g);return g;
}
export function add(parent,kind,color,x,y,z,sx,sy,sz){const m=new T.Mesh(shape(kind),surfaceMaterial(color,false,color==='#76573b'?'leather':undefined));m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;}
// Merge in joint-local space; cache immutable geometry per designed body part.
export function bake(group,key){
 if(!batches.has(key)){group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert(),byMaterial=new Map();group.traverse(m=>{if(!m.isMesh)return;const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,m.matrixWorld));const list=byMaterial.get(m.material)||[];list.push(g);byMaterial.set(m.material,list);});
  const result=[];for(const [material,parts]of byMaterial){const g=new T.BufferGeometry();for(const k of ['position','normal']){const data=new Float32Array(parts.reduce((n,p)=>n+p.attributes[k].array.length,0));let at=0;for(const p of parts){data.set(p.attributes[k].array,at);at+=p.attributes[k].array.length;}g.setAttribute(k,new T.BufferAttribute(data,3));}g.computeBoundingSphere();parts.forEach(p=>p.dispose());result.push({geometry:g,material});}batches.set(key,result);
 }
 group.clear();for(const entry of batches.get(key)){const m=new T.Mesh(entry.geometry,entry.material);m.receiveShadow=true;group.add(m);}
}
export function premiumActor(hero){
 const root=new T.Group(),body=new T.Group();root.add(body);
 const brass='#d5b677',steel='#38474c',leather='#76573b',cloth='#253e45',skin=hero?'#dfbb94':'#83a952',hair='#b65329';
 const torso=add(body,'round',hero?brass:skin,0,1,0,hero?.79:.61,.66,.5);torso.castShadow=true;
 const shell=new T.Group();body.add(shell);
 add(shell,'round',cloth,0,.73,0,.66,.19,.5);add(shell,'round',brass,0,.75,.27,.17,.13,.07);
 if(hero){
  add(shell,'round',steel,0,1.08,-.32,.76,.72,.34);add(shell,'round',brass,0,1.1,-.52,.66,.57,.13);
  for(const s of [-1,1]){add(shell,'round',leather,s*.24,1.05,-.6,.08,.66,.055);add(shell,'round',steel,s*.24,1.28,-.635,.12,.1,.035);add(shell,'cylinder',brass,s*.4,1.08,-.38,.095,.57,.095);for(const y of [.87,1.31])add(shell,'sphere',brass,s*.26,y,-.6,.025,.025,.025);}
  add(shell,'round',steel,0,1.28,.24,.48,.12,.11);
 }else{const strap=add(shell,'round',leather,0,1.04,.27,.11,.69,.07);strap.rotation.z=.65;add(shell,'round',steel,-.32,1.3,0,.4,.17,.48);add(shell,'round',leather,.28,.79,.14,.17,.24,.22);}
 bake(shell,hero?'brass-shell':'grunt-shell');
 const head=new T.Group();head.position.y=1.68;body.add(head);
 add(head,'sphere',skin,0,0,0,.38,.34,.31);add(head,'sphere',skin,0,-.04,.31,.083,.09,.1);
 for(const s of [-1,1]){
  const ear=add(head,hero?'sphere':'cone',skin,s*.37,.015,0,hero?.085:.16,hero?.12:.37,.1);if(!hero)ear.rotation.z=-s*1.1;
  add(head,'sphere','#fff0da',s*.13,.025,.281,.105,.089,.046);add(head,'sphere',steel,s*.13,.018,.322,.048,.061,.021);add(head,'sphere','#fff0da',s*.13-.014,.04,.343,.014,.019,.008);
  const brow=add(head,'round',hero?hair:steel,s*.14,.13,.292,.2,.053,.055);brow.rotation.z=s*(hero?.12:-.2);
 }
 if(hero){
  add(head,'sphere',hair,0,.21,-.03,.4,.23,.32);add(head,'round',cloth,0,.18,.27,.64,.12,.095);
  for(let i=0;i<7;i++){const s=i-3;const lock=add(head,'capsule',hair,s*.082,-.23+Math.abs(s)*.015,.268,.16,.14-Math.abs(s)*.014,.17);lock.rotation.z=-s*.05;}
  for(const s of [-1,1]){add(head,'capsule',hair,s*.105,-.115,.34,.115,.11,.1).rotation.z=s*1.25;const rim=add(head,'ring',brass,s*.17,.3,.24,.145,.125,.08);rim.rotation.x=-.22;add(head,'sphere','#3e7782',s*.17,.3,.25,.112,.09,.035);}
  for(let i=0;i<5;i++){const s=i-2;add(head,'cone',hair,s*.13,.43-Math.abs(s)*.025,-.02,.11,.29,.13).rotation.z=-s*.21;}
 }else{
  add(head,'sphere',steel,0,.22,-.04,.4,.16,.33);add(head,'round',leather,0,.15,.29,.69,.095,.08);add(head,'round',steel,0,-.14,.29,.23,.07,.045);
  for(const s of [-1,1])add(head,'cone','#fff0da',s*.085,-.17,.33,.035,.12,.045).rotation.z=s*.12;
 }
 bake(head,hero?'brass-head':'grunt-head');head.children[0].castShadow=true;
 const limbs=[];
 for(const s of [-1,1]){
  const leg=new T.Group();leg.position.set(s*.22,.67,0);body.add(leg);add(leg,'capsule',cloth,0,-.23,0,.28,.21,.29);add(leg,'round',hero?brass:leather,0,-.47,.075,.33,.23,.46);add(leg,'sphere',hero?steel:skin,0,-.23,.13,.13,.14,.06);bake(leg,`${hero}-leg-${s}`);limbs.push(leg);
  const arm=new T.Group();arm.position.set(s*.48,1.27,0);body.add(arm);add(arm,'capsule',leather,0,-.24,0,.25,.22,.25);add(arm,'round',hero?brass:steel,0,0,0,.39,.31,.46);add(arm,'sphere',steel,0,-.32,.02,.13,.13,.13);add(arm,'round',hero?leather:skin,0,-.47,.085,.26,.25,.27);add(arm,'sphere',skin,-s*.13,-.47,.16,.065,.1,.075);
  if(hero)for(const z of [-.13,.13])add(arm,'sphere',brass,s*.2,.02,z,.027,.027,.027);
  if(!hero&&s===1){add(arm,'capsule',leather,0,-.4,.33,.1,.36,.1).rotation.x=Math.PI/2;add(arm,'round',steel,0,-.4,.64,.24,.24,.32);}
  bake(arm,`${hero}-arm-${s}`);limbs.push(arm);
 }
 const clothRig=new T.Group();clothRig.position.set(0,1.37,-.24);body.add(clothRig);if(hero)add(clothRig,'round',leather,-.3,-.58,-.12,.15,.36,.045);
 const mastery=new T.Group(),powerRig=new T.Group();body.add(mastery,powerRig);mastery.visible=false;
 let weapon,muzzle;
 if(hero){
  weapon=new T.Group();weapon.position.set(.38,.97,.48);body.add(weapon);
  add(weapon,'round',steel,0,0,.07,.61,.43,.85);add(weapon,'round',brass,0,.19,.06,.57,.11,.65);
  for(const x of [-.17,.17]){add(weapon,'cylinder',steel,x,0,.72,.13,1.06,.13).rotation.x=Math.PI/2;add(weapon,'ring',brass,x,0,1.24,.165,.165,.14);add(weapon,'cylinder',cloth,x,0,1.215,.12,.04,.12).rotation.x=Math.PI/2;for(const z of [.38,.7])add(weapon,'ring',brass,x,0,z,.145,.145,.065);}
  add(weapon,'cylinder',brass,-.37,-.03,0,.24,.35,.24).rotation.z=Math.PI/2;
  bake(weapon,'brass-weapon');muzzle=new T.Object3D();muzzle.position.set(0,0,1.33);weapon.add(muzzle);
  for(const s of [-1,1])add(mastery,'sphere',brass,s*.52,1.34,.02,.08,.1,.08);
  for(let i=0;i<9;i++)add(powerRig,'cylinder',brass,(i-4)*.075,.8,-.58,.028,.17,.028);
 }
 root.userData={body,torso,head,limbs,weapon,muzzle,cloth:clothRig,mastery,powerRig,premium:true,artVersion:3,sockets:{muzzle,head},animationState:'idle'};
 const presentation=new ActorPresentation(root,{sockets:root.userData.sockets});root.userData.presentation=presentation;root.userData.dispose=()=>presentation.dispose();
 return root;
}
export function animatePremium(actor,state,time,reduced=false){
 const d=actor.userData;if(!d.premium)return;
 d.presentation.update(time);
 const kick=Math.min(1,Math.max(0,(state.attackAnim||0)/.22)),reload=!!state.reloading;
 d.animationState=reload?'reload':kick>0?'fire':state.cd>0&&state.cd<.07?'anticipation':'idle';
 d.head.rotation.y=reduced?0:Math.sin(time*.71)*.035;d.head.rotation.x=reduced?0:kick*.045;
 if(!d.weapon){
  const frozen=state.slow>0&&state.slowAmount>=.85;
  if(reduced||frozen){d.head.rotation.set(0,0,0);for(const limb of d.limbs)limb.rotation.x=0;d.body.position.y=0;}
  else if(state.y>=523){const recovery=Math.max(0,((state.attack||0)-.85)/.2),prepare=Math.max(0,1-(state.attack||0)/.2);d.animationState=recovery>0?'contact':'anticipation';if(d.limbs[3])d.limbs[3].rotation.x=-prepare*.75+recovery*.3;d.head.rotation.x=-prepare*.06+recovery*.07;}
 }
 if(d.weapon){
  const cycle=reload?Math.sin(Math.PI*(1-Math.min(1,Math.max(0,state.cd)/(state.reload||1)))):0;
  d.weapon.rotation.z=reduced?0:-cycle*.13;
  d.body.rotation.z=reduced?0:Math.sin(time*1.3)*.015+cycle*.035;
  for(const j of [0,2])if(d.limbs[j])d.limbs[j].rotation.x=reduced?0:kick*.06;
  if(reload&&!reduced&&d.limbs[1])d.limbs[1].rotation.x=-.45-cycle*.6;
 }
}
