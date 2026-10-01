import assert from 'node:assert/strict';
import * as T from './dist/vendor/three.module.js';
import {BattleView} from './dist/render3d.js';
import {Game} from './dist/engine.js';

const view=Object.create(BattleView.prototype);
Object.assign(view,{scene:new T.Scene(),camera:new T.PerspectiveCamera(45,390/640,.1,240),host:{getBoundingClientRect:()=>({width:390,height:640,left:0,top:0})},renderer:{render(s){s.updateMatrixWorld(true);}},actors:new Map(),heroes:new Map(),fx:new Map(),lootObjects:new Map(),scarObjects:new Map()});
view.buildWorld();
const brass=view.actor(0,true);
assert(brass.userData.muzzle?.isObject3D,'Brass must have a physical muzzle socket');
assert(brass.userData.weapon?.isObject3D,'Brass weapon must recover independently from his body');
const families=new Set();brass.traverse(n=>{if(n.material?.userData.family)families.add(n.material.userData.family)});
for(const family of ['skin','cloth','brass','paintedMetal'])assert(families.has(family),`Brass surface missing: ${family}`);
for(const aspect of [320/568,360/640,390/640,680/810])for(let mode=0;mode<3;mode++){
 view.camera.aspect=aspect;view.cameraMode=mode;view.configureCamera(true,0);view.scene.updateMatrixWorld(true);
 for(let i=0;i<4;i++)for(const height of [.75,4.0]){
  const target=new T.Vector3((90+i*105-250)/35,height,(555-300)/35),p=target.clone().project(view.camera);
  assert(Math.abs(p.x)<.96&&Math.abs(p.y)<.96,`Formation outside camera ${mode} aspect ${aspect}`);
 }
}
console.log('PASS: M1 surfaces, weapon socket and mobile formation framing.');

globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({clearRect(){},strokeText(){},fillText(){}})})};
const g=new Game();for(let i=1;i<4;i++)g.addHero(i);g.time=10;g.intermission=100;g.nextXp=1e6;
const enemy={id:99,type:0,definitionId:'forest-grunt',x:220,y:380,hp:100,maxHp:100,speed:0,damage:0,attack:1,burn:0,slow:0,flash:0};g.enemies=[enemy];g.target=99;
view.cameraMode=0;view.render(g,0);
assert(view.brassEffects,'M1 effects must have a bounded reusable owner');
const before=JSON.stringify(g);view.render(g,100);assert.equal(JSON.stringify(g),before,'rendering must not mutate combat state');
const socket=view.heroes.get(0).userData.muzzle.getWorldPosition(new T.Vector3());
g.attack(g.team[0],enemy);const launched=JSON.stringify(g);view.render(g,200);assert.equal(JSON.stringify(g),launched);
const shot=g.effects.find(f=>f.type==='shot'),visual=view.fx.get(shot);
assert(visual.position.distanceTo(view.heroes.get(0).userData.muzzle.getWorldPosition(new T.Vector3()))<1e-6,'bullet release must originate at Brass cannon, not the logical center');
g.effects=[];view.render(g,250);
let muzzleObject;
for(let i=0;i<40;i++){
 const f={type:'muzzle',hero:'gunner',x:90,y:555,color:'#ffc36d',life:.1,maxLife:.1};g.effects=[f];view.render(g,300+i);
 const o=view.fx.get(f);if(muzzleObject)assert.equal(o,muzzleObject,'successive flashes must reuse the same object');muzzleObject=o;
 g.effects=[];view.render(g,400+i);
}
assert(view.brassEffects.allocated<=48,'effect capacity must be bounded');
// A diagonal bullet produces a cosmetic response along that approach, without moving Game coordinates.
g.effects=[{type:'impact',hero:'gunner',x:enemy.x,y:enemy.y,color:'#ffc36d',life:.2,maxLife:.2}];enemy.flash=.12;
const coords=[enemy.x,enemy.y];view.render(g,600);assert.deepEqual([enemy.x,enemy.y],coords);
assert(view.actors.get(99).userData.hitDirection?.isVector3,'grunt impact must retain a direction');
enemy.hp=0;g.resolveDeaths();const rewardState=JSON.stringify([g.kills,g.loot,g.gold]);view.render(g,700);
assert(!view.actors.has(99),'dead grunt must immediately leave active actor/picking state');
assert.equal(view.fallenActors.length,1,'death pose should survive briefly as presentation');
view.render(g,800);assert.equal(view.fallenActors.length,1,'paused simulation must freeze the death pose');
assert.equal(JSON.stringify([g.kills,g.loot,g.gold]),rewardState,'death presentation cannot create rewards');
g.time+=.6;view.render(g,900);assert.equal(view.fallenActors.length,0,'corpse expires in simulation time');
view.reset();assert.equal(view.fx.size,0);assert.equal(view.fallenActors.length,0);assert.equal(view.brassEffects.active,0);
console.log('PASS: M1 pooled effects, cosmetic directional response, paused death lifecycle and unchanged Game/rewards.');

// Terrain must not bury the selection marker anywhere across the combat lane.
g.enemies=[{...enemy,id:100,hp:100,x:425}];g.target=100;g.effects=[];view.render(g,1000);
assert(view.targetRing.position.y>.065,'target marker must clear the presentation terrain');
// A target can die between simulation ticks and the first render of a shot.
for(let i=0;i<40;i++){
 const e={...enemy,id:200+i,hp:100};g.enemies=[e];g.effects=[];view.render(g,1100+i);
 g.attack(g.team[0],e);e.hp=0;g.resolveDeaths();view.render(g,1200+i);
 g.effects=[];g.time+=.6;view.render(g,1300+i);
}
assert.equal(view.m1ShotOrigins.size,0,'dead targets must not retain shot-origin records');
// Actor adapters may expose a weapon without the procedural four-limb layout.
const actor=view.heroes.get(0),limbs=actor.userData.limbs;actor.userData.limbs=[];
assert.doesNotThrow(()=>view.render(g,1400));actor.userData.limbs=limbs;
console.log('PASS: visible target marker, dead-target origin cleanup and optional adapter limbs.');
