import assert from 'node:assert/strict';
import {Game} from './dist/engine.js';
import {BattleView} from './dist/render3d.js';
import {animateActorDetails,ART_VERSION} from './dist/actor-details.js';
import * as T from './dist/vendor/three.module.js';
for(let i=0;i<4;i++){
 const g=new Game({hero:i});const e=(id,x,y)=>({id,x,y,hp:1000,maxHp:1000,type:0,burn:0,slow:0});g.enemies=[e(1,230,300),e(2,245,320),e(3,260,340)];g.target=1;
 assert.equal(g.activatePower(),false);g.powerCharge=8;g.state='upgrade';assert.equal(g.activatePower(),false);g.state='playing';assert(g.activatePower());assert.equal(g.powerCharge,0);assert.equal(g.powerNeeded,14);assert.equal(g.powerUses,1);assert.equal(g.activatePower(),false);
 if(i===0||i===1){assert.equal(g.enemies[0].hp,1000);assert.equal(g.projectiles[0].targetId,1);g.updateProjectiles(1);assert(g.enemies[0].hp<1000);}
 if(i===0)assert.equal(g.projectiles.length,0);
 if(i===1){assert(g.enemies.every(e=>e.burnDmg===g.team[0].burn*2));assert(g.enemies.every(e=>e.hp===1000-g.team[0].damage*2));}
 if(i===2)assert(g.enemies.every(e=>e.hp===1000-g.team[0].damage*2));
 if(i===3)assert(g.enemies.every(e=>e.slow===5&&e.slowAmount===.85&&e.hp===976));
 g.powerCharge=14;g.enemies=[];assert.equal(g.activatePower(),false);assert.equal(g.powerCharge,14);
}
const charge=new Game();charge.enemies=Array.from({length:12},(_,i)=>({id:i,hp:0,type:0,x:100,y:200}));charge.resolveDeaths();assert.equal(charge.powerCharge,8);charge.resolveDeaths();assert.equal(charge.powerCharge,8);
const view=Object.create(BattleView.prototype);for(let i=0;i<4;i++){const a=view.actor(i,true);assert.equal(a.userData.artVersion,ART_VERSION);assert(a.userData.cloth);animateActorDetails(a,1,.5);assert.notEqual(a.userData.cloth.rotation.x,0);animateActorDetails(a,2,.5,true);assert.equal(a.userData.cloth.rotation.x,0);a.updateMatrixWorld(true);a.traverse(o=>assert(o.matrixWorld.elements.every(Number.isFinite)));}
let dims=new T.Vector2(600,900),ratio=1.6,seen=[];view.camera=new T.PerspectiveCamera(45,2/3,.1,100);view.renderer={getSize:v=>v.copy(dims),getPixelRatio:()=>ratio,setPixelRatio:v=>ratio=v,setSize:(x,y)=>dims.set(x,y),domElement:{toDataURL:()=>{assert.equal(dims.x,320);assert.equal(dims.y,400);assert.equal(ratio,1);return 'data:image/webp;base64,fixture';}}};view.renderHero=(id,angle)=>seen.push({id,angle,aspect:view.camera.aspect});assert(view.capturePortrait(2).startsWith('data:image/webp'));assert.equal(seen[0].id,2);assert.equal(seen[0].aspect,.8);assert.equal(dims.x,600);assert.equal(dims.y,900);assert.equal(ratio,1.6);assert.equal(view.camera.aspect,2/3);
view.renderer.domElement.toDataURL=()=>{throw Error('capture unavailable')};assert.throws(()=>view.capturePortrait(0));assert.equal(dims.x,600);assert.equal(ratio,1.6);
console.log('PASS: four distinct manual powers, charge/pause/empty-field gates, projectile arrival, AoE/slow damage, capped charge, shared detailed actor rigs, reduced motion and portrait capture restoration. No GPU pixel validation.');
