import assert from 'node:assert/strict';
import {Game} from './dist/engine.js';
import {BOSS_RAM,stepBossRam} from './dist/boss-behavior.js';
import {premiumActor} from './dist/premium-actors.js';
import {enemyVariant} from './dist/enemy-variants.js';
import {compactEnemy} from './dist/enemy-batches.js';
import {buildPremiumForest} from './dist/premium-forest.js';
import * as T from './dist/vendor/three.module.js';
const setup=()=>{const g=new Game({random:()=>.5});g.wave=3;g.intermission=100;g.spawn();const b=g.enemies[0];b.y=523;g.team=[];return {g,b};};
{
 const {g,b}=setup(),hp=g.hp;g.shield=10;
 g.step(.05);assert.equal(b.ramPhase,'windup');assert.equal(g.hp,hp);
 for(let i=0;i<15;i++)g.step(.1);assert.equal(g.hp,hp,'No early ram damage');
 const timer=b.ramTimer;g.state='paused';g.step(.1);assert.equal(b.ramTimer,timer);g.state='playing';
 g.step(.1);assert.equal(g.hp,hp-(b.damage*BOSS_RAM.multiplier-10));assert.equal(g.shield,0);assert.equal(b.ramPhase,'recovery');
 const after=g.hp;g.step(.1);assert.equal(g.hp,after,'Exactly one damage application');
}
{
 const {g,b}=setup();g.step(.05);g.shockwave={age:.18,cooldown:18,front:535,hitIds:new Set()};g.step(.1);
 assert.equal(b.ramPhase,'recovery','Actual Shockwave interrupts ram');assert.equal(g.hp,g.maxHp);assert.ok(g.events.some(e=>e.type==='bossInterrupt'));
}
{
 const {g,b}=setup();b.hp=0;assert.equal(stepBossRam(g,b,.1),true);assert.equal(b.ramPhase,undefined);b.hp=100;g.wave=6;assert.equal(stepBossRam(g,b,.1),false,'Later bosses preserve original attack rule');
}
const stats=a=>{let meshes=0,triangles=0;a.traverse(m=>{if(m.isMesh){meshes++;triangles+=(m.geometry.index?.count||m.geometry.attributes.position.count)/3;}});return {meshes,triangles};};
const results=[];
for(let type=0;type<3;type++){
 const a=type?enemyVariant(type):premiumActor(false),before=stats(a),limbs=[...a.userData.limbs],torso=a.userData.torso;
 compactEnemy(a);const after=stats(a);assert.ok(after.meshes<before.meshes*.6);assert.equal(after.triangles,before.triangles);assert.equal(a.userData.torso,torso);assert.deepEqual(a.userData.limbs,limbs);
 const b=type?enemyVariant(type):premiumActor(false);compactEnemy(b);const ga=[],gb=[];a.traverse(m=>{if(m.geometry?.attributes.color)ga.push(m.geometry)});b.traverse(m=>{if(m.geometry?.attributes.color)gb.push(m.geometry)});assert.deepEqual(ga,gb,'Repeated actor geometry shared');results.push({type,before,after});
}
const root=new T.Group(),families=buildPremiumForest(root);assert.equal(families.length,4);assert.ok(families.every(m=>m.count<=m.instanceMatrix.count));
console.log('PASS Stage 3 first-boss windup, shield, pause, actual Shockwave interrupt, recovery, joint-preserving shared batches, forest instance budgets',JSON.stringify(results));
