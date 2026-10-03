import {terrainSurface} from './terrain-surface.js';
import {enemyVariant} from './enemy-variants.js';
import {buildOutpost,OutpostWeather} from './outpost.js';
import {casterActor,gunnerActor,animateCaster} from './roster-actors.js';
import {premiumActor,animatePremium} from './premium-actors.js';
import {CombatVFX,GroundScars} from './combat-vfx.js';
import {DamageFeedback,feedbackState} from './damage-feedback.js';
import {PresentationQuality} from './presentation-quality.js';
import {observeHit,poseEnemy} from './combat-presentation.js';
import {surfaceMaterial,buildBattlefield,BrassEffects} from './m1-presentation.js';
import {dressActor,animateActorDetails} from './actor-details.js';
import * as T from './vendor/three.module.js';
import {noise} from './environment.js';
import {HEROES,ENEMIES} from './content.js';
import {createWorldVisual,createActorVisual} from './content-renderers.js';
const geos=new Map(),heroBodies=new Map();
const material=surfaceMaterial;
function geo(type){if(!geos.has(type))geos.set(type,type==='sphere'?new T.IcosahedronGeometry(1,2):type==='cone'?new T.ConeGeometry(1,1,6):type==='cylinder'?new T.CylinderGeometry(1,1,1,8):new T.BoxGeometry(1,1,1));return geos.get(type)}
function piece(parent,type,color,x,y,z,sx,sy,sz,glow=false){let m=new T.Mesh(geo(type),material(color,glow));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
const world=(x,y,height=.2)=>new T.Vector3((x-250)/35,height,(y-300)/35);
export class BattleView {
 constructor(host){
  this.host=host;this.renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.16;host.prepend(this.renderer.domElement);this.renderer.domElement.className='scene3d';
  this.scene=new T.Scene();this.scene.background=new T.Color('#1b3440');this.scene.fog=new T.Fog('#1b3440',24,65);this.camera=new T.PerspectiveCamera(45,1,.1,240);this.camera.position.set(0,25,22);this.camera.lookAt(0,0,0);
  this.lootObjects=new Map();this.scarObjects=new Map();this.actors=new Map();this.heroes=new Map();this.fx=new Map();this.ray=new T.Raycaster();this.pointer=new T.Vector2();this.lastGame=null;this.buildWorld();this.damageFeedback.warm();this.resize();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);
 }
 attach(host){this.observer.disconnect();this.host=host;host.prepend(this.renderer.domElement);this.observer.observe(host);this.resize();}
 resize(){const {width:w,height:h}=this.host.getBoundingClientRect();if(w<1||h<1)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
 configureCamera(battle,t,shake=0){const f=Math.max(1,(battle&&(this.cameraMode||0)===0?.60:.64)/this.camera.aspect);if(battle){const preset=[{y:19.5,z:25.5,ty:1.1,tz:-2},{y:15,z:27,ty:1,tz:0},{y:32,z:16,ty:0,tz:-1}][this.cameraMode||0];this.camera.position.set(0,preset.y*f,preset.z*f);this.camera.lookAt(0,preset.ty,preset.tz);this.camera.zoom=1;}else{this.camera.position.set(8*f,15*f,25*f);this.camera.lookAt(0,1,8);this.camera.zoom=this.camera.aspect>1?1.3:1;}if(shake&&!(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)){this.camera.position.x+=Math.sin(t*87)*shake;this.camera.position.y+=Math.cos(t*71)*shake*.6;}this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld(true);}
 buildWorld(){
  const s=this.scene;piece(s,'box','#243d35',0,-.6,-45,150,1.2,180);this.battlefield=buildBattlefield(s,piece);this.battlefield.material.map=terrainSurface();
  // Deterministic low-poly game environment: sculpted rock banks, conifers and masonry.
  const rand=(n)=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
  for(let i=0;i<100;i++){let x=(rand(i)-.5)*12,z=rand(i+100)*29-16;let p=piece(s,'sphere',i%3?'#7e876f':'#b3a88a',x,.03,z,.12+rand(i+4)*.23,.06,.11+rand(i+7)*.15);p.rotation.y=i;}
  for(let side of [-1,1])for(let i=0;i<15;i++){let x=side*(8+rand(i+side*100)*3),z=i*2.4-18,sc=.8+rand(i+30)*.7;piece(s,'sphere','#465a57',x,.4,z,sc*1.1,.8,sc);}

  const fort=new T.Group();s.add(fort);this.fort=fort;
  for(let i=0;i<15;i++){const x=-7+i;piece(fort,'box',i%2?'#7d8983':'#949d8f',x,.6,6.65,.96,1.2,.7);piece(fort,'box','#b7bba2',x,1.26,6.65,1,.17,.9);if(i%2===0)piece(fort,'box','#7d8983',x,1.6,6.65,.48,.6,.75);}
  for(let x of [-6.4,6.4]){piece(fort,'cylinder','#687d78',x,1.2,7.3,1.05,2.4,1.05);piece(fort,'cone','#2c5662',x,3,7.3,1.35,1.6,1.35);piece(fort,'sphere','#ffd786',x,2.5,6.5,.18,.25,.18,true)}
  const lodge=new T.Group();lodge.position.z=8.5;lodge.scale.set(.8,.65,.8);fort.add(lodge);
  piece(lodge,'box','#889589',0,.2,10.5,7,.4,5);piece(lodge,'box','#c6b99b',0,1.3,10.5,4.2,2.6,3.3);piece(lodge,'box','#6b4c31',0,1.15,12.2,1,2.2,.15);for(let x of [-1.4,1.4]){piece(lodge,'box','#574838',x,1.6,12.2,.8,1.1,.2);piece(lodge,'box','#ffd387',x,1.6,12.32,.57,.8,.08,true);piece(lodge,'box','#544639',x,1.6,12.39,.06,.8,.06);}
  const roof=new T.Group();roof.position.set(0,2.8,10.5);lodge.add(roof);for(let sign of [-1,1]){let p=piece(roof,'box','#315566',sign*1.23,.38,0,2.85,.3,4.2);p.rotation.z=sign*-.48;for(let k=0;k<5;k++){let tile=piece(roof,'box',k%2?'#385f70':'#426b7a',sign*1.23,.55,(k-2)*.78,2.85,.08,.7);tile.rotation.z=sign*-.48;}}
  piece(lodge,'box','#72837d',1.3,3.6,10,.6,1.7,.65);piece(lodge,'cylinder','#e7b75c',0,3.9,10.5,.18,.8,.18);this.crystal=piece(lodge,'sphere','#ffc875',0,4.45,10.5,.45,.65,.45,true);let warm=new T.PointLight('#ffc56d',12,12,2);warm.position.set(0,4.5,8.5);s.add(warm);
  for(let i=0;i<15;i++){const x=-7+i;piece(fort,'box','#465a57',x,.15,6.7,1.05,.35,1.3);if(i%3===0)piece(fort,'box','#6b4c31',x,.5,6.13,.16,1,.18);}
  piece(fort,'box','#574838',0,.42,7.1,14,.15,.18);
  for(let i=0;i<4;i++){let x=(90+i*105-250)/35;piece(fort,'cylinder','#677c74',x,.35,7.28,.8,.7,.8);piece(fort,'cylinder','#b0b69b',x,.73,7.28,.85,.12,.85);piece(fort,'cylinder','#d5b677',x,.74,7.28,.87,.035,.87);}
  this.shield=new T.Mesh(new T.PlaneGeometry(14,2),new T.MeshBasicMaterial({color:'#ffd589',transparent:true,opacity:.17,side:T.DoubleSide,depthWrite:false}));this.shield.position.set(0,1.1,6.4);s.add(this.shield);this.shield.visible=false;
  for(const side of [-1,1])for(let i=0;i<3;i++){
   const z=4-i*7,x=side*6.7;piece(s,'cylinder','#506568',x,.35,z,.28,.7,.28);
   piece(s,'cone',i===0?'#ffb970':'#82b8cb',x,.85,z,.17,.43,.17,true);
  }
  this.targetRing=new T.Mesh(new T.RingGeometry(.65,.75,32),new T.MeshBasicMaterial({color:'#ffdf93',side:T.DoubleSide,depthWrite:false}));this.targetRing.rotation.x=-Math.PI/2;this.targetRing.visible=false;s.add(this.targetRing);buildOutpost(s,piece);this.batchStatic();this.outpostWeather=new OutpostWeather(s);this.environment=createWorldVisual('forest',this.scene);this.worldVisual='forest';this.brassEffects=new BrassEffects(s);this.fallenActors=[];this.m1Seen=new WeakSet();this.m1Source=new T.Vector3();this.m1Target=new T.Vector3();this.m1ShotOrigins=new Map();this.combatVfx=new CombatVFX(s);this.scarPool=new GroundScars(s);this.damageFeedback=new DamageFeedback(s);this.textPool=this.damageFeedback.free;this.presentationQuality=new PresentationQuality();this.m2Selected=null;this.m2TargetAt=-10;
  this.bossAura=new T.Mesh(new T.RingGeometry(1.0,1.06,24),new T.MeshBasicMaterial({color:'#ec9b67',transparent:true,opacity:.45,side:T.DoubleSide,depthWrite:false}));this.bossAura.rotation.x=-Math.PI/2;this.bossAura.visible=false;s.add(this.bossAura);
  this.dangerLine=new T.Mesh(new T.PlaneGeometry(13,.24),new T.MeshBasicMaterial({color:'#f78565',transparent:true,opacity:.25,depthWrite:false,side:T.DoubleSide}));this.dangerLine.position.set(0,.1,6.1);this.dangerLine.rotation.x=-Math.PI/2;this.dangerLine.visible=false;s.add(this.dangerLine);
 }
 batchStatic(){
  this.scene.updateMatrixWorld(true);const groups=new Map(),remove=[];
  this.scene.traverse(m=>{if(!m.isMesh||[this.crystal,this.shield,this.targetRing,this.battlefield].includes(m))return;const geometry=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();geometry.applyMatrix4(m.matrixWorld);if(!groups.has(m.material))groups.set(m.material,[]);groups.get(m.material).push(geometry);remove.push(m);});
  for(const m of remove)m.removeFromParent();for(const[mat,parts]of groups){const g=new T.BufferGeometry();for(const key of ['position','normal']){const length=parts.reduce((sum,p)=>sum+p.attributes[key].array.length,0);const data=new Float32Array(length);let at=0;for(const part of parts){data.set(part.attributes[key].array,at);at+=part.attributes[key].array.length;}g.setAttribute(key,new T.BufferAttribute(data,3));}g.computeBoundingSphere();const mesh=new T.Mesh(g,mat);mesh.castShadow=mat!==material('#243d35')&&mat!==material('#718367')&&mat!==material('#9a957b');mesh.receiveShadow=true;this.scene.add(mesh);parts.forEach(p=>p.dispose());}
 }
 actor(type,hero=false){if(!hero&&(type===1||type===2))return enemyVariant(type);if(hero&&type>0)return casterActor(HEROES[type]);if(type===0)return premiumActor(hero);const root=new T.Group(),body=new T.Group();root.add(body);const colors=hero?['#d9a34d','#ce6048','#4eaaa3','#9387c6']:['#83a952','#c35e4e','#89719e','#555d68'];const c=colors[type],dark=hero?'#253e45':'#37403c';
  let torso=piece(body,'sphere',hero&&type===0?'#38474c':c,0,1,0,hero&&type===0?.48:.4,.48,.28);piece(body,'box',dark,0,.78,0,.6,.16,.5);const head=piece(body,'sphere',hero?'#dfbb94':c,0,1.65,0,.35,.35,.3);piece(body,'sphere',hero?['#934c28','#b83c2e','#d0c9e5','#b1a5d9'][type]:c,0,1.85,-.03,.39,.23,.32);
  const limbs=[];for(let sign of [-1,1]){const leg=new T.Group();leg.position.set(sign*.2,.65,0);body.add(leg);piece(leg,'box',dark,0,-.26,0,.24,.52,.26);piece(leg,'box',c,0,-.51,.07,.3,.18,.43);limbs.push(leg);piece(body,'sphere',c,sign*.47,1.23,0,.22,.25,.25);const arm=new T.Group();arm.position.set(sign*.47,1.1,0);body.add(arm);piece(arm,'box',dark,0,-.2,.02,.18,.4,.19);piece(arm,'sphere',hero?'#dfbb94':c,0,-.39,.09,.14,.14,.14);limbs.push(arm);}
  if(hero){if(type===0){piece(body,'box','#edd78d',-.2,1.1,-.29,.2,.35,.12);}else{piece(body,'cylinder','#554b45',.55,.9,.18,.05,1.9,.05);piece(body,type===1?'sphere':'cone',['','#ffb46b','#a1ffeb','#dacbff'][type],.55,1.97,.18,.24,.4,.24,true);if(type===2){piece(body,'box','#2e6260',0,1.15,-.35,.5,.6,.27);for(let x of [-.2,.2])piece(body,'cylinder','#95fbe4',x,1.5,-.37,.05,.65,.05,true);}if(type===3){let cape=piece(body,'cone','#675b90',0,.9,-.12,.58,1.15,.4);cape.rotation.x=-.12;}}
  }else{for(let sign of [-1,1]){const horn=piece(body,'cone',type===3?'#edb768':'#ddcc9b',sign*.28,1.98,0,.11,.47,.11);horn.rotation.z=sign*-.45;}if(type===2||type===3){piece(body,'sphere','#4b5361',0,1.08,.15,.48,.42,.27);piece(body,'sphere','#f0a96d',0,1.12,.4,.15,.23,.07,true);}if(type===1)for(let sign of [-1,1]){const wing=piece(body,'cone','#80473f',sign*.55,1.23,-.15,.45,.8,.1);wing.rotation.z=sign*1;}}
  if(hero){
   const accent=['#ffe2a0','#ffbe72','#95fff0','#d8eaff'][type];
   const mastery=new T.Group();body.add(mastery);
   for(let sign of [-1,1]){const mark=piece(mastery,'sphere',accent,sign*.51,1.3,0,.09,.12,.09,true);mark.rotation.z=sign*.3;}
   mastery.visible=false;
   if(type===0){
    // Brass: broad shoulder armour, drum magazine and a long mechanical cannon.
    piece(body,'box','#b88847',-.5,1.3,0,.38,.32,.48);
    piece(body,'box','#d5b677',.48,1.28,0,.35,.26,.45);
    const weapon=new T.Group();
    piece(weapon,'box','#38474c',0,0,0,.56,.38,.88);
    piece(weapon,'box','#d5b677',0,.16,.18,.64,.11,.45);
    const drum=piece(weapon,'cylinder','#d5b677',-.35,-.04,-.1,.25,.4,.25);drum.rotation.z=Math.PI/2;
    for(const x of [-.16,.16]){const barrel=piece(weapon,'cylinder','#53646b',x,0,.77,.11,1.1,.11);barrel.rotation.x=Math.PI/2;const collar=piece(weapon,'cylinder','#d5b677',x,0,1.2,.145,.12,.145);collar.rotation.x=Math.PI/2;}
    this.batchHero(weapon,'m1-brass-cannon',[]);
    weapon.position.set(.38,.97,.48);body.add(weapon);root.userData.weapon=weapon;
    const muzzle=new T.Object3D();muzzle.position.set(0,0,1.33);weapon.add(muzzle);root.userData.muzzle=muzzle;
    piece(body,'box','#34484b',0,1.75,.29,.6,.1,.08);
   }else if(type===1){
    // Ember: an asymmetric flame crown and visibly charged gauntlets.
    for(let sign of [-1,1]){piece(body,'sphere','#813d30',sign*.49,.77,.1,.22,.24,.22);const flame=piece(body,'cone','#ffb26b',sign*.51,.96,.13,.13,.47,.13,true);flame.rotation.z=sign*-.3;}
    for(let i=0;i<3;i++){const flame=piece(body,'cone',i===1?'#ffe0a3':'#e76c41',(i-1)*.19,2.32+(i%2)*.13,0,.12,.5,.12);flame.rotation.z=(i-1)*-.2;}
   }else if(type===2){
    // Volt: tall paired coils and a broad backpack visible from the battle camera.
    piece(body,'box','#244e53',0,1.15,-.42,.68,.72,.25);
    for(let sign of [-1,1]){piece(body,'cylinder','#657a7d',sign*.34,1.85,-.42,.075,.88,.075);for(let j=0;j<3;j++)piece(body,'cylinder','#82b9b0',sign*.34,1.65+j*.18,-.42,.17,.05,.17);piece(body,'sphere',accent,sign*.34,2.3,-.42,.14,.14,.14,true);}
   }else{
    // Nova: wide blue cloak, crystalline shoulders and a split staff crown.
    piece(body,'cone','#465b86',0,1,-.3,.67,1.34,.32);
    for(let sign of [-1,1]){const shard=piece(body,'cone','#b8e5f0',sign*.48,1.48,0,.14,.5,.14);shard.rotation.z=sign*-.5;const tip=piece(body,'cone',accent,.55+sign*.14,2.12,.18,.07,.4,.07,true);tip.rotation.z=sign*-.35;}
   }
   const powerRig=new T.Group();body.add(powerRig);
   const count=type===0?9:type===3?6:3;
   for(let j=0;j<count;j++){
    let m;if(type===0){m=piece(powerRig,'cylinder','#ffe2a0',(j-4)*.1,.8,-.36,.035,.19,.035);}
    else if(type===1){m=piece(powerRig,'cone','#ffb66d',(j-1)*.22,1.35,-.36,.07,.3,.07,true);}
    else if(type===2){m=piece(powerRig,'sphere','#a5ffed',(j-1)*.2,1.35,-.58,.08,.08,.06,true);}
    else{const a=j*Math.PI/3;m=piece(powerRig,'cone','#c0eaff',Math.cos(a)*.6,.3,Math.sin(a)*.6,.07,.25,.07,true);}
   }
   root.userData.powerRig=powerRig;
   root.userData.mastery=mastery;
  }
  dressActor(T,piece,root,body,limbs,type,hero);
  root.traverse(m=>{if(m.isMesh)m.castShadow=false;});torso.castShadow=true;head.castShadow=true;
  this.batchHero(body,(hero?'hero-':'enemy-')+type,[torso,head,...limbs,root.userData.mastery,root.userData.powerRig,root.userData.cloth,root.userData.weapon]);
  if(hero&&type!==0){const muzzle=new T.Object3D();muzzle.position.set(.55,1.97,.25);body.add(muzzle);root.userData.muzzle=muzzle;}
  root.userData={...root.userData,body,limbs,torso};return root;
 }
 batchHero(body,type,keep){
  // Merge rigid accessories by material; leave arms, legs and mastery markers animated.
  body.updateMatrixWorld(true);const parts=[];
  body.traverse(m=>{if(!m.isMesh)return;for(let n=m;n&&n!==body;n=n.parent)if(keep.includes(n))return;parts.push(m);});
  if(!heroBodies.has(type)){
   const groups=new Map();for(const m of parts){const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(m.matrixWorld);if(!groups.has(m.material))groups.set(m.material,[]);groups.get(m.material).push(g);}
   const merged=[];for(const[material,items]of groups){const geometry=new T.BufferGeometry();for(const key of ['position','normal']){const data=new Float32Array(items.reduce((n,g)=>n+g.attributes[key].array.length,0));let at=0;for(const g of items){data.set(g.attributes[key].array,at);at+=g.attributes[key].array.length;}geometry.setAttribute(key,new T.BufferAttribute(data,3));}geometry.computeBoundingSphere();items.forEach(g=>g.dispose());merged.push({geometry,material});}heroBodies.set(type,merged);
  }
  parts.forEach(m=>m.removeFromParent());for(const {geometry,material}of heroBodies.get(type)){const mesh=new T.Mesh(geometry,material);mesh.receiveShadow=true;body.add(mesh);}
 }
 project(x,y,h=1){let v=world(x,y,h).project(this.camera);const r=this.host.getBoundingClientRect();return {x:(v.x+1)*.5*r.width,y:(1-v.y)*.5*r.height};}
 pick(clientX,clientY,game){const rect=this.host.getBoundingClientRect();let best=null,dist=Infinity;for(const e of game.enemies){if(e.y<0)continue;const p=this.project(e.x,e.y,e.type===3?2:1);const d=Math.hypot(clientX-rect.left-p.x,clientY-rect.top-p.y);if(d<dist&&d<(e.type===3?70:44)){dist=d;best=e.id}}return best;}
 setPresentationQuality(level){this.presentationQuality.set(level);this.damageFeedback.setQuality(level);this.presentationQuality.apply(this.renderer,this.environment);}
 presentationStats(){return {...this.presentationQuality.stats};}
 reset(){this.combatVfx?.reset();this.damageFeedback?.reset();this.presentationQuality?.resetTiming();this.m2Selected=null;this.m2TargetAt=-10;for(const f of this.fallenActors||[])this.removeActor(f.actor);this.fallenActors=[];this.brassEffects?.reset();this.m1Seen=new WeakSet();this.m1ShotOrigins?.clear();for(const a of this.stationObjects?.values()||[])this.scene.remove(a);this.stationObjects?.clear();this.environment?.reset();for(const o of this.lootObjects.values())this.disposeFx(o);this.lootObjects.clear();for(const o of this.scarObjects.values())this.disposeFx(o);this.scarObjects.clear();for(const a of this.actors.values())this.removeActor(a);for(const a of this.heroes.values()){a.userData.dispose?.();this.scene.remove(a);}for(const f of this.fx.values())this.disposeFx(f);this.actors.clear();this.heroes.clear();this.fx.clear();}
 removeActor(a){a.userData.impactMaterial?.dispose();a.userData.dispose?.();a.removeFromParent();for(const n of [a.userData.bar,a.userData.bg])if(n){n.geometry.dispose();n.material.dispose();}}
 disposeFx(o){
  if(o.userData.groundScar){this.scarPool.release(o);return;}
  if(o.userData.pooledVfx){this.combatVfx.release(o);return;}if(o.userData.damageFeedback){this.damageFeedback.release(o);return;}
  if(o.userData.sliceFx){this.brassEffects.release(o);return;}
  this.scene.remove(o);
  if(o.userData.damageCanvas){this.textPool??=[];if(this.textPool.length<28){this.textPool.push(o);return;}}
  const geometries=new Set(),materials=new Set();o.traverse(n=>{if(n.geometry)geometries.add(n.geometry);if(n.material)materials.add(n.material);});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>{m.map?.dispose();m.dispose();});
 }
 damageSprite(f){return this.damageFeedback.acquire(f,feedbackState(f,this.lastGame?.effects||[]));}
 effect(f){let o;if(f.hero==='gunner'&&['shot','muzzle','impact'].includes(f.type)&&(!f.projectile?.style)){o=this.brassEffects.acquire(f.type);return o;}if(f.type==='text')return this.damageSprite(f);
  if(['shot','muzzle','bolt','impact','blast','death'].includes(f.type))return this.combatVfx.acquire(f.type,f.hero);
  return this.combatVfx.acquire('ring',f.hero);
 }
 pickHero(clientX,clientY,game){const r=this.host.getBoundingClientRect();let out=null,best=48;for(let i=0;i<game.team.length;i++){let p=this.project(90+i*105,555,1.8);const d=Math.hypot(p.x+r.left-clientX,p.y+r.top-clientY);if(d<best){best=d;out=i;}}return out;}
 updateWorldDetails(game,t){
  const loots=new Set(game?.loot||[]);for(const l of loots){let o=this.lootObjects.get(l);if(!o){o=new T.Group();let coin=new T.Mesh(new T.CylinderGeometry(.13,.13,.045,10),new T.MeshStandardMaterial({color:'#ffd574',metalness:.65,roughness:.25,emissive:'#8c4f0e',emissiveIntensity:.4}));coin.rotation.x=Math.PI/2;coin.position.x=-.19;o.add(coin);let xp=new T.Mesh(new T.OctahedronGeometry(.14),new T.MeshBasicMaterial({color:'#8ffff0'}));xp.position.x=.19;o.add(xp);if(l.keys){const key=new T.Group(),gold=new T.MeshBasicMaterial({color:'#ffe39b'});const ring=new T.Mesh(new T.TorusGeometry(.12,.035,5,12),gold);key.add(ring);const stem=new T.Mesh(new T.BoxGeometry(.05,.28,.05),gold);stem.position.y=-.2;key.add(stem);const tooth=new T.Mesh(new T.BoxGeometry(.11,.045,.05),gold);tooth.position.set(.045,-.3,0);key.add(tooth);key.position.set(.46,.15,0);o.add(key);}this.scene.add(o);this.lootObjects.set(l,o);}o.visible=l.age<.38;o.position.copy(world(l.x,l.y,.2+Math.abs(Math.sin(l.age*9))*.7));o.rotation.y=t*4;}
  for(const [l,o]of this.lootObjects)if(!loots.has(l)){this.disposeFx(o);this.lootObjects.delete(l)}
  const scars=new Set(game?.scars||[]);for(const[c,o]of this.scarObjects)if(!scars.has(c)){this.scarPool.release(o);this.scarObjects.delete(c);}
  for(const c of scars){let o=this.scarObjects.get(c);if(!o){o=this.scarPool.acquire();this.scarObjects.set(c,o);if(o===this.scarPool.empty)continue;o.position.copy(world(c.x,c.y,.1));o.rotation.y=noise(c.x+c.y)*6.28;o.scale.set(c.radius/35*(.7+noise(c.x)*.6),1,c.radius/35*(.7+noise(c.y)*.6));o.userData.embers=!!game?.enemies.some(e=>e.burn>0&&Math.hypot(e.x-c.x,e.y-c.y)<c.radius*2);}
   if(o===this.scarPool.empty)continue;const fade=Math.max(0,1-(t-c.at)/22);o.visible=fade>0;o.children[0].material.opacity=.6*fade;o.children[1].material.opacity=.8*fade;o.children[1].material.color.set(o.userData.embers&&t-c.at<.6?'#e99a4f':'#272b26');
  }
 }
 renderHero(index,angle,time){
  if(!this.gallery){this.gallery=new T.Scene();this.gallery.background=new T.Color('#152b32');this.gallery.add(new T.HemisphereLight('#e4faff','#6d4932',2.7));const light=new T.DirectionalLight('#ffe0b0',3);light.position.set(3,5,4);this.gallery.add(light);this.galleryCamera=new T.PerspectiveCamera(38,1,.1,30);this.galleryCamera.position.set(0,1.7,5.7);this.galleryCamera.lookAt(0,1.15,0);piece(this.gallery,'cylinder','#304b50',0,-.12,0,1.2,.2,1.2);}
  if(this.galleryIndex!==index){if(this.galleryActor){this.galleryActor.userData.dispose?.();this.gallery.remove(this.galleryActor);}const def=HEROES[index];this.galleryActor=this.heroModel(def);this.galleryActor.userData.torso.material=material(def.color);this.gallery.add(this.galleryActor);this.galleryIndex=index;}
  this.galleryActor.rotation.y=angle;animateCaster(this.galleryActor,{},time*.001,!!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);animatePremium(this.galleryActor,{},time*.001,!!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);animateActorDetails(this.galleryActor,time*.001,0,!!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);this.galleryCamera.aspect=this.camera.aspect;this.galleryCamera.updateProjectionMatrix();this.renderer.render(this.gallery,this.galleryCamera);
 }
 heroModel(def){const a=createActorVisual('hero',def,()=>def.rig>0?casterActor(def):gunnerActor(def));if(def.look&&!a.userData.designedLook){const b=a.userData.body,c=def.color;const crest=new T.Group();b.add(crest);a.userData.identity=crest;
  if(['solar','void'].includes(def.look)){for(const side of [-1,1]){const fin=piece(crest,'cone',c,side*.56,1.43,-.12,.13,.7,.18);fin.rotation.z=-side*.4;}piece(crest,'box',c,.4,1,1.3,.18,.15,.6);}
  if(def.look==='grove'){for(const side of [-1,1]){const antler=piece(crest,'cylinder','#9b9565',side*.26,2.14,0,.045,.7,.045);antler.rotation.z=-side*.5;piece(crest,'sphere',c,side*.45,2.37,0,.16,.12,.13);}piece(crest,'sphere',c,0,1.2,.34,.17,.12,.07,true);}
  if(def.look==='forge'){piece(crest,'box','#43454d',.55,1.95,.18,.9,.5,.45);piece(crest,'box',c,.55,1.95,.42,.55,.12,.035,true);for(const side of [-1,1])piece(crest,'box','#665651',side*.45,1.32,.03,.45,.22,.5);}
  if(def.look==='prism'||def.look==='aurora'){for(let i=0;i<5;i++){const shard=piece(crest,'cone',c,(i-2)*.16,2.12+(.2-Math.abs(i-2)*.06),0,.08,.45,.12,true);shard.rotation.z=(i-2)*-.15;}piece(crest,'sphere',c,0,1.1,.35,.13,.18,.07,true);}
  a.userData.cloth?.traverse(m=>{if(m.isMesh)m.material=material(c)});
 }a.userData.torso.material=material(def.color);return a;}
 capturePortrait(index){
  // Capture the real shared model once; never create a second WebGL context.
  const aspect=this.camera.aspect,size=this.renderer.getSize(new T.Vector2()),ratio=this.renderer.getPixelRatio();
  try{this.renderer.setPixelRatio(1);this.renderer.setSize(320,400,false);this.camera.aspect=.8;this.renderHero(index,-.24,0);return this.renderer.domElement.toDataURL('image/webp',.9);}
  finally{this.camera.aspect=aspect;this.renderer.setPixelRatio(ratio);this.renderer.setSize(size.x,size.y,false);this.camera.updateProjectionMatrix();}
 }
 updateStations(game,t){this.stationObjects??=new Map();for(const s of game?.stations||[]){let a=this.stationObjects.get(s.kind);if(!a){a=new T.Group();piece(a,'cylinder','#425760',0,.25,0,.55,.5,.55);piece(a,'cylinder','#b29566',0,.85,0,.22,.8,.22);const head=new T.Group();a.add(head);head.position.y=1.5;piece(head,s.kind==='frost'?'cone':'box',s.color,0,0,0,.4,.65,.4,true);if(s.kind==='turret'){const barrel=piece(head,'cylinder','#687880',0,0,-.45,.14,.7,.14);barrel.rotation.x=Math.PI/2;}a.userData.head=head;this.stationObjects.set(s.kind,a);this.scene.add(a);}a.position.copy(world(s.x,s.y));a.scale.setScalar(1+(s.rank-1)*.12);const target=game.enemies.find(e=>e.hp>0);a.userData.head.rotation.y=target?Math.atan2(s.x-target.x,s.y-target.y):Math.sin(t)*.15;a.userData.head.position.y=1.5+Math.max(0,.18-(t-(s.firedAt??-10)))*.5;}}
 render(game,time){const renderStart=globalThis.performance?.now()||0;this.presentationQuality.apply(this.renderer,this.environment);const visual=game?.map?.renderer||'forest';if(this.worldVisual!==visual){this.environment.dispose();this.environment=createWorldVisual(visual,this.scene);this.worldVisual=visual;}if(this.lastGame!==game){this.reset();this.lastGame=game;}const t=game?game.time:time*.001;
  this.updateStations(game,t);const battle=!!game;this.crystal.rotation.y=t*.55;this.crystal.position.y=4.45+Math.sin(t*2)*.08;this.shield.visible=!!game?.shield;this.shield.material.opacity=.12+Math.sin(t*3)*.04;
  this.configureCamera(battle,t,(game?.shake||0)>=.18?Math.min(.22,game.shake):0);this.environment?.update(t,game,new Date(),!!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);this.updateWorldDetails(game,t);this.outpostWeather?.update(this.environment?.atmosphere?.rain||0,this.presentationQuality.level,this.environment?.atmosphere?.daylight??1);this.battlefield.material.roughness=.97-(this.environment?.atmosphere?.rain||0)*.28;const boss=game?.enemies.find(e=>e.isBoss);this.bossAura.visible=!!boss;if(boss){this.bossAura.position.copy(world(boss.x,boss.y,.095));this.bossAura.scale.setScalar(1.7);}
  this.dangerLine.visible=!!game&&game.hp/game.maxHp<.3;this.dangerLine.material.opacity=.2+(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches?0:(Math.sin(t*4)+1)*.08);
  const team=game?.team||[{index:0},{index:1},{index:2},{index:3}];for(let i=0;i<team.length;i++){const h=team[i];let a=this.heroes.get(i);if(!a){a=this.heroModel(HEROES[h.index]||h);if(h.color)a.userData.torso.material=material(h.color);this.heroes.set(i,a);this.scene.add(a);}if(a.userData.mastery)a.userData.mastery.visible=(h.rank||1)>=3;
   if(a.userData.powerRig){const rig=a.userData.powerRig;for(let j=0;j<rig.children.length;j++){const m=rig.children[j];if((h.rig??h.index)===0){m.visible=!h.reloading?j<(h.ammo??9):j<Math.floor((1-Math.max(0,h.cd)/h.reload)*9);}else{const charge=(h.rig??h.index)===3?(h.specialTimer||0)/(h.specialCooldown||14):1-Math.max(0,h.cd||0)/(h.interval||1);m.scale.y=((h.rig??h.index)===1?.3+Math.min(1.5,(h.burn||5)/15):.15+Math.max(0,charge))*((h.rig??h.index)===1?.3:.25);m.visible=(h.rig??h.index)===1||charge>j/rig.children.length;}}}
a.position.copy(world(90+i*105,555,.75));let target=game?.enemies.find(e=>e.id===game.target)||game?.enemies.reduce((a,b)=>b.y>(a?.y??-999)?b:a,null);a.rotation.y=target?Math.atan2((target.x-(90+i*105))/35,(target.y-555)/35):Math.PI;a.userData.body.position.y=Math.sin(t*2+i)*.03;const kick=Math.max(0,(h.attackAnim||0)/.22);animateActorDetails(a,t+i,kick,!!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);const entering=game?Math.min(1,(t-(h.joinedAt||0))/.65):1;a.scale.setScalar(1.4*(.85+.15*entering));a.position.y+=(1-entering)*1.3;a.userData.body.position.z=-kick*((h.rig??h.index)===0?.18:.05);a.userData.body.rotation.x=kick*((h.rig??h.index)===0?-.13:.08);a.userData.body.rotation.z=(h.rig??h.index)===2?Math.sin(t*10)*kick*.06:0;for(let j=0;j<a.userData.limbs.length;j++)if(j%2===1)a.userData.limbs[j].rotation.x=-kick*((h.rig??h.index)===0?.4:(h.rig??h.index)===1?1.05:.8);
   if(h.id==='gunner'&&a.userData.weapon){const reduced=!!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const prepare=!reduced&&!h.reloading&&h.cd>0&&h.cd<.07&&target?(1-h.cd/.07):0;
    const recoil=reduced?0:Math.pow(Math.min(1,kick),2);
    a.userData.weapon.position.z=.48-recoil*.23;a.userData.weapon.rotation.x=reduced?0:-prepare*.025-recoil*.08;
    a.userData.body.position.z=reduced?0:-recoil*.09;a.userData.body.rotation.x=reduced?0:-prepare*.025-recoil*.06;
    for(const j of [1,3])if(a.userData.limbs[j])a.userData.limbs[j].rotation.x=-.45-prepare*.05-recoil*.12;
   }
   animateCaster(a,h,t+i,!!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
   animatePremium(a,h,t+i,!!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  }
  this.scene.updateMatrixWorld(true);
  for(const f of game?.effects||[])if(f.type==='impact'&&f.hero==='gunner'&&!this.m1Seen.has(f)){
   this.m1Seen.add(f);const e=game.enemies.find(e=>e.type===0&&Math.hypot(e.x-f.x,e.y-f.y)<2);const a=e&&this.actors.get(e.id);
   if(a){const origin=this.m1ShotOrigins.get(e.id)||{x:0,z:7.3};a.userData.hitDirection??=new T.Vector3();a.userData.hitDirection.set((e.x-250)/35-origin.x,0,(e.y-300)/35-origin.z).normalize();a.userData.hitAt=t;}
  }
  const alive=new Set();for(const e of game?.enemies||[]){alive.add(e.id);let a=this.actors.get(e.id);if(!a){a=createActorVisual('enemy',ENEMIES.get(e.definitionId)||e,()=>this.actor(e.rig??e.type));a.userData.isGrunt=e.type===0;a.userData.enemyType=e.type;a.userData.impactMaterial=a.userData.torso.material.clone();this.actors.set(e.id,a);this.scene.add(a);const bg=new T.Mesh(new T.PlaneGeometry(.8,.09),new T.MeshBasicMaterial({color:'#253839',side:T.DoubleSide}));bg.position.y=2.35;a.add(bg);const bar=new T.Mesh(new T.PlaneGeometry(.76,.055),new T.MeshBasicMaterial({color:e.type===3?'#ffbe71':'#b3d479',side:T.DoubleSide}));bar.position.set(0,2.35,.01);a.add(bar);a.userData.bar=bar;a.userData.bg=bg;const status=new T.Group();for(let j=0;j<3;j++)piece(status,'cone','#ffad55',(j-1)*.23,.8+j*.2,0,.1,.32,.1,true);a.add(status);a.userData.status=status;}
   const scale=e.type===3?(e.isBoss?2.1:1.8):e.type===2?1.5:e.type===1?1.05:1.2;a.scale.set(scale*(1+(e.flash||0)*(e.type===3?.08:e.type===2?.2:.45)),scale*(1-(e.flash||0)*(e.type===3?.06:e.type===2?.15:.4)),scale);a.position.copy(world(e.x,e.y,0));a.userData.body.position.y=e.y<523?Math.abs(Math.sin(t*7+e.id))*.06:0;a.userData.body.rotation.x=(e.flash||0)*1.1;a.userData.body.rotation.z=e.burn>0?Math.sin(t*15+e.id)*.045:0;for(let i=0;i<a.userData.limbs.length;i++){a.userData.limbs[i].rotation.x=e.y<523?Math.sin(t*7+e.id+i)*.35:Math.sin(t*9+i)*.22;}a.userData.torso.material=a.userData.impactMaterial;a.userData.impactMaterial.color.set(e.flash>0?'#fff1be':e.burn>0?'#cc7c48':e.slow>0?'#91ccdf':(e.color||['#83a952','#c35e4e','#89719e','#555d68'][e.type]));a.userData.status.visible=e.burn>0||e.slow>0;for(let j=0;j<3;j++){const m=a.userData.status.children[j];m.material=material(e.burn>0?'#ffad55':e.slowAmount>=.85?'#ecfaff':'#75cce8',true);m.position.y=.7+j*.3+Math.sin(t*9+j)*.15;}if(e.type===0){const body=a.userData.body,phase=t*6+e.id;
    body.rotation.x=e.y<523?.07:Math.sin(t*7)*.06;body.position.y=e.y<523?Math.abs(Math.sin(phase))*.045:0;
    for(let j=0;j<a.userData.limbs.length;j++)a.userData.limbs[j].rotation.x=e.y<523?Math.sin(phase+(j<2?0:Math.PI))*(j%2===0?.34:.18):Math.sin(t*8+j)*.18;

   }
   animatePremium(a,e,t+e.id,!!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
   this.m1Source.copy(this.m1ShotOrigins.get(e.id)||world(250,555,2));observeHit(a,e,game.effects,t,this.m1Source);poseEnemy(a,e,t,!!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
   a.userData.bar.scale.x=Math.max(0,e.hp/e.maxHp)*(e.isBoss?1.7:1);a.userData.bg.scale.x=e.isBoss?1.7:1;a.userData.bar.material.color.set(e.y>=480?'#ff9379':e.isBoss?'#ffd193':'#b3d479');a.userData.bar.quaternion.copy(this.camera.quaternion);a.userData.bg.quaternion.copy(this.camera.quaternion);
  }
  for(const [id,a]of this.actors)if(!alive.has(id)){
   this.actors.delete(id);this.m1ShotOrigins.delete(id);
   const death=game?.effects.find(f=>f.type==='death'&&Math.hypot((f.x-250)/35-a.position.x,(f.y-300)/35-a.position.z)<.15);
   if(death&&this.fallenActors.length<this.presentationQuality.settings.corpses){
    a.userData.bar.visible=false;a.userData.bg.visible=false;a.userData.status.visible=false;
    this.fallenActors.push({actor:a,at:t,baseY:a.position.y,scale:a.scale.x,type:a.userData.enemyType,dir:a.userData.hitDirection?.clone()||new T.Vector3(0,0,-1)});
   }else this.removeActor(a);
  }
  const reduced=!!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  for(let i=this.fallenActors.length-1;i>=0;i--){const f=this.fallenActors[i],age=t-f.at;
   if(age>=.55){this.removeActor(f.actor);this.fallenActors.splice(i,1);continue;}
   const k=age/.55,body=f.actor.userData.body;
   body.rotation.x=reduced?0:Math.min(1,k*2)*(f.type===3?.2:f.type===2?.65:1.2);body.rotation.z=reduced?0:-f.dir.x*k*.3;
   f.actor.position.y=f.baseY-Math.max(0,k-.45)*1.1;
   f.actor.scale.setScalar(f.scale*(1-Math.max(0,k-.65)*2));
  }

  const tar=game?.enemies.find(e=>e.id===game.target);if((tar?.id??null)!==this.m2Selected){this.m2Selected=tar?.id??null;this.m2TargetAt=t;}this.targetRing.visible=!!tar;this.targetRing.material.color.set(tar?.isBoss?'#ffb46b':'#fff1ab');this.targetRing.material.transparent=true;this.targetRing.material.opacity=.85;
  if(tar){this.targetRing.position.copy(world(tar.x,tar.y,.09));this.targetRing.scale.setScalar((tar.type===3?1.8:1)*(1+Math.max(0,1-(t-this.m2TargetAt)/.22)*.3));this.targetRing.rotation.z=t;}
  const liveFx=new Set(game?.effects||[]);for(const[f,o]of this.fx)if(!liveFx.has(f)){this.disposeFx(o);this.fx.delete(f)}let particleBudget=this.presentationQuality.decorativeBudget;const viewportHeight=this.host.getBoundingClientRect().height;
  for(const f of liveFx){let o=this.fx.get(f);if(!o){o=this.effect(f);this.fx.set(f,o);
    if((o.userData.sliceFx||o.userData.pooledVfx)&&o.userData.kind){const idx=Math.max(0,Math.min((game?.team.length||1)-1,Math.round((f.x-90)/105))),actor=this.heroes.get(idx);
     if(f.type==='shot'||f.type==='muzzle'||f.type==='bolt'){
      if(f.projectile?.style==='meteor')o.userData.origin.copy(world(f.x,f.y,12));else if(f.y===555&&actor?.userData.muzzle)actor.userData.muzzle.getWorldPosition(o.userData.origin);else o.userData.origin.copy(world(f.x,f.y,f.type==='bolt'?1.2:2));
      if(f.type==='shot'&&f.projectile?.targetId&&alive.has(f.projectile.targetId)){let origin=this.m1ShotOrigins.get(f.projectile.targetId);if(!origin){origin=new T.Vector3();this.m1ShotOrigins.set(f.projectile.targetId,origin);}origin.copy(o.userData.origin);}
      if(f.type==='muzzle'&&game?.team[idx]?.id==='gunner')this.brassEffects.lastShot=t;
     }else{const e=game?.enemies.find(e=>Math.hypot(e.x-f.x,e.y-f.y)<2);const origin=e&&this.m1ShotOrigins.get(e.id);o.userData.origin.copy(origin||world(250,555,2));}
    }
   }
   if(o.userData.damageFeedback){this.m1Source.set(0,0,-1);if(this.actors.get(f.targetId)?.userData.hitDirection)this.m1Source.copy(this.actors.get(f.targetId).userData.hitDirection);this.damageFeedback.update(o,f,this.camera,this.m1Source,viewportHeight);continue;}
   if(o.userData.sliceFx||o.userData.pooledVfx){
    this.m1Source.copy(o.userData.origin||world(f.x,f.y,2));
    if(f.type==='muzzle'){const idx=Math.max(0,Math.round((f.x-90)/105));this.heroes.get(idx)?.userData.muzzle?.getWorldPosition(this.m1Source);}
    this.m1Target.copy(world(f.projectile?.tx??f.tx??f.x,f.projectile?.ty??f.ty??f.y,1.2));
    if(o.userData.pooledVfx){this.combatVfx.update(o,f,this.m1Source,this.m1Target,this.camera,reduced,particleBudget);if(o.children[1]?.isInstancedMesh&&o.children[1].visible)particleBudget-=o.children[1].count;}else{this.brassEffects.particleAllowance=particleBudget;this.brassEffects.update(o,f,this.m1Source,this.m1Target,this.camera,reduced);if(o.children[1]?.isInstancedMesh&&o.children[1].visible)particleBudget-=o.children[1].count;if(o.userData.kind==='muzzle'&&o.children[2]?.visible)particleBudget--;}continue;
   }
   const p=f.life/f.maxLife;o.material.opacity=p;o.position.copy(world(f.x,f.y,.1));o.scale.setScalar(((f.radius||25)/35)*(1-p*.75));}

  for(const[f,o]of this.fx)if(!liveFx.has(f)){this.disposeFx(o);this.fx.delete(f)}const brass=this.heroes.get(game?.team.findIndex(h=>h.id==='gunner')??0);this.m1Source.set(0,0,0);brass?.userData.muzzle?.getWorldPosition(this.m1Source);
  this.brassEffects.updateSteam(t,brass?this.m1Source:null,reduced||this.presentationQuality.loaded);this.renderer.render(this.scene,this.camera);
  const counts=this.combatVfx.stats;this.presentationQuality.observe(time,(globalThis.performance?.now()||renderStart)-renderStart,{activeEffects:counts.active+this.brassEffects.active,particles:counts.particles+this.brassEffects.particles+(this.environment?.particleCount||0),damageNumbers:this.damageFeedback.active,calls:this.renderer.info?.render.calls||0,triangles:this.renderer.info?.render.triangles||0});
 }
}
