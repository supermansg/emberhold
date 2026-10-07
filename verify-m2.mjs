import assert from 'node:assert/strict';
import * as T from './dist/vendor/three.module.js';
import {CombatVFX} from './dist/combat-vfx.js';
const scene=new T.Scene(),pool=new CombatVFX(scene);
for(const hero of ['fire','electric','frost']){
 const a=pool.acquire('shot',hero);assert(a.userData.pooledVfx);assert.equal(a.userData.hero,hero);pool.release(a);
 assert.equal(pool.acquire('shot',hero),a,'slot reused across attacks');pool.release(a);
}
const objects=Array.from({length:100},()=>pool.acquire('impact','fire'));
assert(pool.stats.active<=pool.caps.impact);assert(pool.stats.allocated<=pool.capacity);
objects.forEach(o=>pool.release(o));assert.equal(pool.stats.active,0);
const bolt=pool.acquire('bolt','electric'),source=new T.Vector3(1,2,3),target=new T.Vector3(4,1,-2),camera=new T.PerspectiveCamera();
pool.update(bolt,{life:.2,maxLife:.25},source,target,camera,false,true);
assert(bolt.userData.source.distanceTo(source)<1e-6);assert(bolt.userData.target.distanceTo(target)<1e-6);
pool.reset();assert.equal(pool.stats.active,0);
const count=pool.stats.allocated;for(let i=0;i<100;i++){const o=pool.acquire('blast','frost');pool.release(o);}assert.equal(pool.stats.allocated,count,'no new resources after warmup');
let disposed=0;pool.geometries.forEach(g=>g.addEventListener('dispose',()=>disposed++));pool.dispose();assert.equal(disposed,pool.geometries.size);assert.equal(pool.stats.active,0);
console.log('PASS: M2 bounded, reused archetype VFX and disposal.');

const {DamageFeedback,feedbackState}=await import('./dist/damage-feedback.js');
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({clearRect(){},strokeText(){},fillText(){}})})};
assert.equal(feedbackState({text:'17',color:'#fff',x:1,y:1},[]),'normal');
assert.equal(feedbackState({label:true,text:'POWER ×1.5'},[]),'special');
assert.equal(feedbackState({label:true,text:'SHATTER +30%'},[]),'synergy');
assert.equal(feedbackState({label:true,text:'+100 SHIELD'},[]),'shield');
const feedback=new DamageFeedback(scene),damage={text:'24',color:'#beeaff',life:.3,maxLife:.85,x:200,y:350};
const number=feedback.acquire(damage,'elemental');assert(number.isSprite);feedback.update(number,damage,camera,new T.Vector3(1,0,-1));assert(number.material.opacity>0);feedback.release(number);
assert.equal(feedback.acquire(damage,'normal'),number);feedback.reset();
for(let i=0;i<80;i++)feedback.acquire({...damage,text:String(i)},'normal');assert(feedback.active<=28);assert(feedback.allocated<=28);
feedback.setQuality('low');feedback.reset();for(let i=0;i<30;i++)feedback.acquire(damage,'normal');assert(feedback.active<=10);assert(feedback.acquire({...damage,label:true,text:'COMBO'},'synergy').isSprite,'important labels have reserved capacity');
feedback.dispose();assert.equal(feedback.active,0);
console.log('PASS: M2 truthful pooled damage priorities, caps and cleanup.');

const {PresentationQuality}=await import('./dist/presentation-quality.js');
const quality=new PresentationQuality();assert.equal(quality.level,'standard');
for(const level of ['low','standard','high']){quality.set(level);quality.observe(100,4,{active:3,particles:6,calls:12,triangles:90});assert(quality.stats.particles<=quality.settings.particleCap);}
assert.throws(()=>quality.set('ultra'));
const {observeHit,poseEnemy}=await import('./dist/combat-presentation.js');
const enemyFixture={id:1,type:0,x:200,y:300,maxHp:100,hp:75,flash:.12,burn:0,slow:0};
let light,heavy;
for(const type of [0,1,2,3]){const actor=new T.Group();actor.userData={body:new T.Group(),limbs:[],hitDirection:new T.Vector3()};actor.add(actor.userData.body);
 observeHit(actor,{...enemyFixture,type},[{type:'text',targetId:1,value:25,life:.8,maxLife:.85}],1,new T.Vector3(0,2,7));poseEnemy(actor,{...enemyFixture,type},1,false);
 const d=actor.userData.body.position.length();if(type===0)light=d;if(type===2)heavy=d;
 assert(d>0);poseEnemy(actor,{...enemyFixture,type},1.5,false);assert(Math.abs(actor.userData.body.position.x)<1e-9);
}assert(light>heavy,'armored displacement must be restrained');
console.log('PASS: M2 presentation quality and differentiated cosmetic responses.');

const {BattleView}=await import('./dist/render3d.js'),{Game}=await import('./dist/engine.js');
const makeView=()=>{const v=Object.create(BattleView.prototype);Object.assign(v,{scene:new T.Scene(),camera:new T.PerspectiveCamera(45,390/640,.1,240),host:{getBoundingClientRect:()=>({width:390,height:640,left:0,top:0})},renderer:{render(s){s.updateMatrixWorld(true);}},actors:new Map(),heroes:new Map(),fx:new Map(),lootObjects:new Map(),scarObjects:new Map()});v.buildWorld();return v;};
const v=makeView(),g=new Game();for(let i=1;i<4;i++)g.addHero(i);g.time=10;g.intermission=100;g.nextXp=1e6;
g.enemies=Array.from({length:4},(_,i)=>({...enemyFixture,id:i+1,type:i,x:120+i*70,hp:2000,maxHp:2000,speed:0,damage:1,attack:1,burnDmg:0,slowAmount:0,flash:0}));v.render(g,0);
assert(v.presentationQuality&&v.combatVfx&&v.damageFeedback,'M2 presentation owners integrated');
for(let i=0;i<4;i++)assert(v.heroes.get(i).userData.muzzle?.isObject3D,'each base archetype exposes a physical attack socket');
for(let i=0;i<4;i++)g.attack(g.team[i],g.enemies[i]);const state=JSON.stringify(g);v.render(g,16);assert.equal(JSON.stringify(g),state);
for(const f of g.effects.filter(f=>['shot','bolt'].includes(f.type)))assert(v.fx.get(f).userData.sliceFx||v.fx.get(f).userData.pooledVfx);
const posed=v.fx.get(g.effects.find(f=>f.type==='shot'&&f.hero==='fire')).position.clone();g.state='paused';v.render(g,200);assert(v.fx.get(g.effects.find(f=>f.type==='shot'&&f.hero==='fire')).position.distanceTo(posed)<1e-8);
for(const level of ['low','standard','high']){v.setPresentationQuality(level);const before=JSON.stringify(g);v.render(g,250);assert.equal(JSON.stringify(g),before);}
g.state='playing';for(let i=0;i<20;i++)g.step(.01);v.render(g,300);assert(g.enemies.every(e=>e.hp<2000));
for(const e of g.enemies)e.hp=0;g.resolveDeaths();const rewards=JSON.stringify([g.kills,g.loot,g.gold]);v.render(g,400);assert.equal(v.actors.size,0);assert.equal(v.fallenActors.length,4);assert.equal(JSON.stringify([g.kills,g.loot,g.gold]),rewards);
g.time+=.6;v.render(g,450);assert.equal(v.fallenActors.length,0);v.reset();assert.equal(v.combatVfx.stats.active,0);assert.equal(v.damageFeedback.active,0);
for(const speed of [1,2,3])for(const level of ['low','standard','high']){
 const makeGame=()=>{const a=new Game({random:()=>.5});for(let i=1;i<4;i++)a.addHero(i);a.intermission=100;a.nextXp=1e6;a.enemies=[{...enemyFixture,hp:2000,maxHp:2000,speed:12,damage:1,attack:1,burnDmg:0,slowAmount:0,flash:0}];return a;};
 const a=makeGame(),b=makeGame();v.setPresentationQuality(level);
 for(let frame=0;frame<90/speed;frame++){for(let n=0;n<speed;n++){a.step(.01);b.step(.01);}v.render(a,frame*16);assert.equal(JSON.stringify(a),JSON.stringify(b),'quality/speed presentation cannot change damage/rewards or simulation');}
 v.reset();assert.equal(v.combatVfx.stats.active,0);
}
console.log('PASS: M2 real renderer socket/lifecycle, pause, class deaths and simulation parity at every quality/speed.');
// Spell meteors retain their sky origin, rather than borrowing a defender socket.
g.effects=[];g.enemies=[{...enemyFixture,hp:2000,maxHp:2000}];g.launch({archetype:'fire',shotStyle:'meteor',color:'#ff9944',radius:80,burn:0},g.enemies[0],100,-130,80);v.render(g,2000);
assert.equal(v.fx.get(g.effects.find(f=>f.type==='shot')).userData.origin.y,12);
console.log('PASS: M2 spell sky origin preserved.');
// Independent review: authored variants, honest labels and non-damaging spells.
const stylePool=new CombatVFX(new T.Scene()),variant=stylePool.acquire('shot','frost');stylePool.update(variant,{color:'#86cc79',projectile:{style:'thorn'},life:.2,maxLife:.3},source,target,camera,false,0);
assert.equal(variant.userData.material.color.getHexString(),new T.Color('#86cc79').getHexString(),'authored variant color must survive pooling');
const unknownBolt=stylePool.acquire('bolt');stylePool.update(unknownBolt,{color:'#a0fff0',life:.2,maxLife:.3},source,target,camera,false,0);assert.equal(unknownBolt.userData.material.color.getHexString(),new T.Color('#a0fff0').getHexString());stylePool.dispose();
assert.equal(feedbackState({text:'5',color:'#fff',x:220,y:276},[{label:true,text:'POWER ×1.5',x:200,y:300}]),'normal','nearby callout is not authoritative attribution');
const healthyActor=new T.Group();healthyActor.userData={body:new T.Group(),limbs:[]};observeHit(healthyActor,enemyFixture,[{type:'blast',hero:'frost',x:200,y:300}],2,source);assert.equal(healthyActor.userData.hitAt,undefined,'healing or decorative blast alone is not damage');
console.log('PASS: authored variants and truthful damage/reaction evidence.');
const {GroundScars}=await import('./dist/combat-vfx.js');const scars=new GroundScars(new T.Scene()),scar=scars.acquire();assert(scar.userData.groundScar);scars.release(scar);assert.equal(scars.acquire(),scar);scars.reset();
const scarSlots=Array.from({length:60},()=>scars.acquire());assert(scars.active<=25);scarSlots.forEach(o=>scars.release(o));scars.dispose();assert.equal(scars.active,0);
console.log('PASS: fixed ground scar resources and lifecycle.');
g.shake=.13;v.render(g,2100);assert.equal(v.camera.position.x,0,'routine fire impacts do not shake the camera');g.shake=.32;v.render(g,2200);assert(Math.abs(v.camera.position.x)<=.22,'major-event impulse is bounded');
console.log('PASS: major-only bounded camera impulse.');
// A dense presentation-only fixture cannot exceed decorative budgets at any tier.
for(const level of ['low','standard','high']){v.reset();v.setPresentationQuality(level);g.effects=Array.from({length:200},(_,i)=>({type:i%3===0?'muzzle':i%3===1?'impact':'blast',hero:i%2?'fire':'gunner',x:i%3===0?90:200,y:i%3===0?555:300,life:.2,maxLife:.3,radius:40,color:'#ffcc99'}));const saved=JSON.stringify(g);v.render(g,3000);assert.equal(JSON.stringify(g),saved);assert(v.presentationStats().particles<=v.presentationQuality.settings.particleCap);assert(v.combatVfx.stats.active<=v.combatVfx.capacity);assert(v.brassEffects.allocated<=48);v.reset();assert.equal(v.scarPool.active,0);}
console.log('PASS: dense effects respect quality budgets and cleanup.');
