// Designed caster silhouettes using shared surfaces and joint-local batches.
import * as T from './vendor/three.module.js';
import {premiumActor,add,bake} from './premium-actors.js';
import {ActorPresentation} from './actor-presentation.js';
import {surfaceMaterial} from './m1-presentation.js';
const robes=new Map();
export function casterActor(def){
 const type=def.rig,key=def.id,root=new T.Group(),body=new T.Group();root.add(body);
 const fire=type===1,nature=key==='briar',prism=key==='prism',ice=type===3&&!nature;
 const accent=def.color,cloth=fire?'#953438':nature?'#315647':prism?'#675b90':ice?'#675b90':'#244e53',skin='#dfbb94',hair=fire?'#b83c2e':nature?'#718367':'#d0c9e5';
 const torso=add(body,'round',accent,0,1,0,.62,.62,.46);torso.castShadow=true;
 const coat=new T.Group();body.add(coat);
 if(!robes.has(cloth)){const points=[[.36,0],[.48,.08],[.44,.26],[.33,.57],[.29,.82]].map(([r,y])=>new T.Vector2(r,y));robes.set(cloth,new T.LatheGeometry(points,12));}
 const robe=new T.Mesh(robes.get(cloth),surfaceMaterial(cloth));robe.position.set(0,.35,-.05);coat.add(robe);add(coat,'round','#cba15d',0,.77,.27,.17,.13,.065);
 bake(coat,key+'-coat');
 const head=new T.Group();head.position.y=1.68;body.add(head);add(head,'sphere',skin,0,0,0,.35,.33,.3);add(head,'sphere',skin,0,-.035,.3,.055,.065,.075);
 for(const sign of [-1,1]){add(head,'sphere',skin,sign*.34,0,0,.075,.11,.07);add(head,'sphere','#fff0da',sign*.12,.03,.282,.085,.07,.035);add(head,'sphere','#253e45',sign*.12,.022,.311,.035,.047,.016);add(head,'round',hair,sign*.12,.12,.278,.15,.027,.035);}
 add(head,'sphere',hair,0,.2,-.08,.37,.22,.3);
 if(fire){for(let i=0;i<5;i++){const s=i-2;add(head,'cone',key==='cinder'?'#cba15d':hair,s*.13,.35+(.15-Math.abs(s)*.06),-.07,.1,.36,.14).rotation.z=-s*.19;}if(key==='cinder')add(head,'round','#38474c',0,-.18,.27,.46,.15,.08);}
 else{for(const sign of [-1,1]){for(let j=0;j<3;j++)add(head,'sphere',hair,sign*.29,-.04-j*.14,-.05,.105,.13,.1);add(head,'cone',accent,sign*.18,.39,-.04,.12,.32,.12);}}
 if(type===2){for(const sign of [-1,1]){add(head,'ring','#829aaa',sign*.14,.24,.25,.105,.09,.05);add(head,'sphere',accent,sign*.14,.24,.265,.08,.065,.024);}}
 if(nature){for(const sign of [-1,1]){const leaf=add(head,'sphere',accent,sign*.24,.37,0,.08,.22,.025);leaf.rotation.z=-sign*.6;}}
 bake(head,key+'-head');head.children[0].castShadow=true;
 const limbs=[];
 for(const sign of [-1,1]){const leg=new T.Group();leg.position.set(sign*.18,.57,0);body.add(leg);add(leg,'capsule','#253e45',0,-.2,0,.23,.18,.23);add(leg,'round',cloth,0,-.43,.07,.29,.2,.38);bake(leg,key+'-leg'+sign);limbs.push(leg);
 const arm=new T.Group();arm.position.set(sign*.4,1.25,0);body.add(arm);add(arm,'sphere',accent,0,-.04,0,.21,.23,.23);add(arm,'capsule',cloth,0,-.25,.02,.19,.19,.2);add(arm,'sphere',skin,0,-.44,.1,.12,.14,.12);if(fire)add(arm,'round',key==='cinder'?'#38474c':'#cba15d',0,-.37,.11,.3,.29,.3);bake(arm,key+'-arm'+sign);limbs.push(arm);}
 const equipment=new T.Group();body.add(equipment);
 if(type===2&&!prism){add(equipment,'round',cloth,0,1.13,-.37,.62,.65,.26);for(const sign of [-1,1]){add(equipment,'cylinder','#829aaa',sign*.27,1.64,-.39,.055,.91,.055);for(let j=0;j<4;j++)add(equipment,'cylinder',accent,sign*.27,1.42+j*.17,-.39,.14,.045,.14);add(equipment,'sphere',accent,sign*.27,2.16,-.39,.1,.1,.1);}}
 const held=new T.Group();
 if(!fire){add(held,'capsule','#76573b',.5,1.12,.2,.08,.82,.08);
 if(nature){for(const sign of [-1,1])add(held,'sphere',accent,.5+sign*.12,1.98,.2,.1,.26,.035).rotation.z=sign*.65;}
 else if(prism){add(held,'cone',accent,.5,2.09,.2,.26,.65,.2);add(held,'ring','#829aaa',.5,2.04,.2,.38,.38,.08);}
 else{for(const sign of [-1,0,1])add(held,'cone',accent,.5+sign*.2,2.1-Math.abs(sign)*.1,.2,.13,.48,.13);}}
 if(key==='cinder'){add(held,'round','#38474c',.6,1.78,.2,.5,.37,.36);add(held,'capsule','#76573b',.6,1.15,.2,.09,.6,.09);}
 if(key==='aurora')for(const sign of [-1,1])add(equipment,'cone',accent,sign*.46,1.48,-.06,.1,.55,.12).rotation.z=-sign*.5;
 bake(equipment,key+'-equipment');bake(held,key+'-held');held.position.set(-.4,-1.25,0);limbs[3].add(held);
 const clothRig=new T.Group();clothRig.position.set(0,1.3,-.23);body.add(clothRig);add(clothRig,'round',cloth,0,-.48,-.05,.49,.74,.04);
 const muzzle=new T.Object3D();if(!fire){muzzle.position.set(.5,2.08,.2);held.add(muzzle);}else if(key==='cinder'){muzzle.position.set(.6,1.8,.42);held.add(muzzle);}else{muzzle.position.set(0,-.44,.23);limbs[3].add(muzzle);}
 const mastery=new T.Group(),powerRig=new T.Group();body.add(mastery,powerRig);for(let i=0;i<3;i++)add(powerRig,'sphere',accent,(i-1)*.18,1.25,-.43,.05,.07,.04);add(mastery,'ring','#cba15d',0,1.12,.31,.14,.14,.04);mastery.visible=false;
 root.userData={body,torso,head,limbs,cloth:clothRig,muzzle,mastery,powerRig,artVersion:3,identity:held,designedLook:true,caster:type+1,sockets:{muzzle,head}};const handle=new ActorPresentation(root,{sockets:root.userData.sockets});root.userData.presentation=handle;root.userData.dispose=()=>handle.dispose();return root;
}
export function animateCaster(a,h,t,reduced){const d=a.userData;if(!d.caster)return;d.presentation.update(t);const kick=Math.min(1,(h.attackAnim||0)/.22),cast=(h.attackAnim||0)>.22,fire=d.caster===2,electric=d.caster===3;
 d.head.rotation.y=reduced?0:Math.sin(t*.9)*.035;d.body.rotation.z=reduced?0:(electric?Math.sin(kick*5)*.025:Math.sin(t*1.3)*.018);d.head.rotation.x=reduced?0:kick*(fire?-.07:.035);
 for(const i of [1,3])if(d.limbs[i])d.limbs[i].rotation.x=reduced?0:-kick*(cast?1.3:fire?.7:electric?.5:.9);d.cloth.rotation.x=reduced?0:Math.sin(t*1.4)*.04+kick*.08;}

export function gunnerActor(def){const a=premiumActor(true);if(def.id==='gunner')return a;
 const d=a.userData,kit=new T.Group(),dark=def.id==='umbra';d.body.add(kit);d.identity=kit;d.designedLook=true;
 if(dark){add(kit,'cone','#465b86',0,1.02,-.28,.65,1.24,.24);add(kit,'sphere','#465b86',0,1.83,-.18,.43,.3,.23);add(kit,'round','#253e45',0,1.75,.29,.65,.1,.07);}
 else{for(const side of [-1,1]){const fin=add(kit,'round','#cba15d',side*.46,1.38,-.22,.15,.6,.1);fin.rotation.z=-side*.5;}add(kit,'ring','#cba15d',0,1.23,-.59,.22,.22,.06);}
 bake(kit,def.id+'-mantle');const scope=new T.Group();d.weapon.add(scope);add(scope,'cylinder',dark?'#465b86':'#cba15d',0,.32,.26,.09,.64,.09).rotation.x=Math.PI/2;add(scope,'sphere',def.color,0,.32,.59,.07,.07,.02);bake(scope,def.id+'-scope');
 const owned=[];d.head.traverse(m=>{if(m.material?.color?.getHexString()==='b65329'){m.material=m.material.clone();m.material.color.set(dark?'#626c84':'#995f30');owned.push(m.material);}});const release=d.presentation.release;d.presentation.release=()=>{for(const m of owned)m.dispose();release();};return a;}
