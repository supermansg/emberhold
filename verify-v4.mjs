import assert from 'node:assert/strict';
import {Game,HEROES} from './dist/engine.js';
import {migrateSave,settleRun} from './dist/progression.js';
import * as T from './dist/vendor/three.module.js';
import {BattleView} from './dist/render3d.js';

const enemy=(id,x=150,y=220,hp=100)=>({id,type:0,x,y,hp,maxHp:hp,speed:0,damage:7,attack:1,burn:0,burnDmg:0,slow:0,slowAmount:0,flash:0});
const fixture=(hero=0)=>{const g=new Game({hero});g.wave=1;g.intermission=100;g.spawnTotal=100;g.nextXp=1e6;g.team[0].cd=100;return g;};
const advance=(g,n=30)=>{for(let i=0;i<n;i++)g.step(.01);};
for(const hero of [0,1,3]){
 const g=fixture(hero),e=enemy(1);g.enemies=[e];const h=g.team[0];g.attack(h,e);h.cd=100;
 assert.equal(e.hp,100,'launch must not deal projectile damage');
 const p=g.projectiles[0];assert.equal(g.effects.find(f=>f.type==='shot').maxLife,p.duration);
 for(const state of ['paused','upgrade','inspecting']){g.state=state;const before=JSON.stringify([g.time,p,g.effects]);g.step(.1);assert.equal(JSON.stringify([g.time,p,g.effects]),before);}
 g.state='playing';e.x+=30;advance(g,1);assert.equal(p.tx,e.x,'projectile follows its selected moving target');
 assert.equal(e.hp,100,'no damage before arrival');advance(g);
 assert.equal(g.projectiles.length,0);assert.ok(e.hp<100);const hp=e.hp;
 if(hero!==1){advance(g);assert.equal(e.hp,hp,'one impact only');}
 const effect=g.effects.find(f=>f.type===(hero===1?'blast':'impact'));
 // Short impact effects may have expired; the event still records the contact.
 assert.ok(effect||g.events.some(e=>e.type==='impact'));
}

// Fired damage is a snapshot: choosing an upgrade cannot strengthen shots already in flight.
const snapshot=fixture(),victim=enemy(1);snapshot.enemies=[victim];snapshot.attack(snapshot.team[0],victim);snapshot.team[0].damage=999;snapshot.team[0].cd=100;advance(snapshot);assert.equal(victim.hp,83);
const boosted=fixture(),boostVictim=enemy(1);boosted.enemies=[boostVictim];boosted.team[0].reloads=3;boosted.attack(boosted.team[0],boostVictim);boosted.team[0].cd=100;advance(boosted);assert.equal(boostVictim.hp,74.5);

// A shot must never silently retarget to a different enemy after its target dies.
for(const hero of [0,3]){const g=fixture(hero),dead=enemy(1),alive=enemy(2,155);g.enemies=[dead,alive];g.attack(g.team[0],dead);g.team[0].cd=100;dead.hp=0;advance(g);assert.equal(alive.hp,100);assert.equal(g.kills,1);}
const splash=fixture(1),dead=enemy(1),near=enemy(2,160);splash.enemies=[dead,near];splash.attack(splash.team[0],dead);splash.team[0].cd=100;dead.hp=0;advance(splash);assert.ok(near.hp<100,'fire lands and splashes even if its target was killed');

// Last-hit attribution, including burn, drives presentation without changing rewards.
for(let hero=0;hero<4;hero++){const g=fixture(hero),e=enemy(1,150,220,1);g.enemies=[e];g.attack(g.team[0],e);g.team[0].cd=100;advance(g);assert.equal(g.kills,1);assert.equal(g.effects.find(f=>f.type==='death').hero,HEROES[hero].id);advance(g,100);assert.equal(g.gold,1);assert.equal(g.totalXp,3);}
const burn=fixture(),burning=enemy(1,150,220,1);burn.enemies=[burning];burning.damageHero='frost';burning.burn=1;burning.burnDmg=100;burn.step(.02);assert.equal(burn.effects.find(f=>f.type==='death').hero,'fire');

const crowded=fixture();for(let i=0;i<60;i++)crowded.hit(enemy(i),1,'#fff','gunner');assert.equal(crowded.effects.filter(f=>f.type==='text').length,28);
const summed=fixture(),sumEnemy=enemy(1);summed.hit(sumEnemy,10,'#fff','gunner');summed.hit(sumEnemy,12,'#fff','electric');assert.equal(summed.effects.length,1);assert.equal(summed.effects[0].text,'22');assert.equal(sumEnemy.hp,78);

for(const speed of [1,2,3]){const g=fixture(3),e=enemy(1);g.enemies=[e];g.attack(g.team[0],e);g.team[0].cd=100;for(let frame=0;frame<30/speed;frame++)for(let n=0;n<speed;n++)g.step(.01);assert.equal(e.hp,76);assert.equal(g.projectiles.length,0);}
const retired=fixture(1),untouched=enemy(1);retired.enemies=[untouched];retired.attack(retired.team[0],untouched);retired.state='retired';const wallet=migrateSave({coins:73,careerXp:149,power:3,reload:4});settleRun(wallet,retired);advance(retired);assert.equal(untouched.hp,100);assert.equal(wallet.coins,73);assert.equal(wallet.reload,4);assert.equal(wallet.careerXp,149);
const fatal=fixture(),falling=enemy(1,150,220,1),attacker=enemy(2,200,523);fatal.enemies=[falling,attacker];fatal.hp=1;attacker.attack=.09;fatal.attack(fatal.team[0],falling);fatal.team[0].cd=100;fatal.step(.1);assert.equal(fatal.state,'lost');assert.equal(fatal.kills,1);assert.equal(fatal.gold,1,'an arriving killing shot is credited even on the losing frame');assert.equal(fatal.projectiles.length,0);

// Exercise actual Three.js scene/geometry code with a minimal canvas text shim.
// This validates geometry and resource lifecycle, not WebGL pixels, FPS or audio output.
let canvases=0;
globalThis.document={createElement:()=>{canvases++;return {width:0,height:0,getContext:()=>({clearRect(){},strokeText(){},fillText(){}})};}};
const view=Object.create(BattleView.prototype);Object.assign(view,{scene:new T.Scene(),camera:new T.PerspectiveCamera(45,1,.1,130),host:{getBoundingClientRect:()=>({width:390,height:550,left:0,top:0})},renderer:{render(){}},actors:new Map(),heroes:new Map(),fx:new Map(),lootObjects:new Map(),scarObjects:new Map()});view.buildWorld();
const renderGame=fixture();for(let i=1;i<4;i++)renderGame.addHero(i);renderGame.team[0].rank=3;renderGame.enemies=[enemy(1)];view.render(renderGame,0);assert.equal(view.heroes.size,4);assert.equal(view.heroes.get(0).userData.mastery.visible,true);
const meshes=[];for(const h of view.heroes.values()){let count=0;h.traverse(n=>{if(n.isMesh)count++;});meshes.push(count);}assert.ok(meshes.every(n=>n<55),'rigid accessory batching bounds per-hero mesh count');
for(const type of ['shot','bolt','blast','death','impact','text'])for(const hero of HEROES){renderGame.effects=[{type,hero:hero.id,x:90,y:555,tx:150,ty:220,color:hero.color,radius:26,text:'42',life:.15,maxLife:.3}];view.render(renderGame,150);view.scene.updateMatrixWorld(true);view.scene.traverse(n=>{assert.ok(n.matrixWorld.elements.every(Number.isFinite));});}
const allocated=canvases;for(let i=0;i<50;i++){renderGame.effects=[{type:'text',x:150,y:220,color:'#fff',text:String(i),life:.3,maxLife:.65}];view.render(renderGame,200+i);renderGame.effects=[];view.render(renderGame,200+i);}assert.equal(canvases,allocated,'damage text canvases are reused');
view.reset();assert.equal(view.fx.size,0);assert.equal(view.actors.size,0);assert.equal(view.heroes.size,0);assert.ok(view.textPool.length<=28);
console.log('PASS: projectile arrival, pauses, target death, splash, damage snapshots, empowered fire, death attribution, bounded/reused text, speed parity, settlement and Three.js scene lifecycle.');
console.log(JSON.stringify({heroMeshes:meshes,textCanvases:canvases,browserTested:false}));
