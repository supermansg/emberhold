import assert from 'node:assert/strict';
import {runXpRequirement,RUN_XP_CURVE} from './dist/run-xp.js';
import {Game,HEROES} from './dist/engine.js';
import {animateCaster} from './dist/roster-actors.js';
import * as T from './dist/vendor/three.module.js';
import {BattleView} from './dist/render3d.js';
for(let l=1;l<10000;l++)assert(runXpRequirement(l+1)>runXpRequirement(l));
assert.deepEqual([1,2,3,4,5].map(l=>runXpRequirement(l)),[18,27,38,51,66]);assert.throws(()=>runXpRequirement(0));assert.throws(()=>runXpRequirement(1,{...RUN_XP_CURVE,linear:0}));
const g=new Game({random:()=>.4});const earned=runXpRequirement(1)+runXpRequirement(2)+6;g.collect({xp:earned,coins:0});g.checkLevel();assert.equal(g.state,'upgrade');assert.equal(g.xp,earned-18);const snapshot=g.xp;g.step(.1);assert.equal(g.xp,snapshot);g.choose(0);assert.equal(g.level,3);assert.equal(g.xp,6);assert.equal(g.state,'upgrade');g.choose(0);assert.equal(g.state,'playing');assert.equal(g.nextXp,38);assert.equal(g.totalXp,earned);
const view=Object.create(BattleView.prototype);for(const def of HEROES){const a=view.heroModel(def);assert(a.userData.muzzle?.isObject3D);assert(a.userData.body);if(def.look)assert(a.userData.identity?.children.length>0);if(a.userData.caster){a.updateMatrixWorld(true);const before=a.userData.muzzle.getWorldPosition(new T.Vector3());animateCaster(a,{attackAnim:.22},1,false);a.updateMatrixWorld(true);assert(before.distanceTo(a.userData.muzzle.getWorldPosition(new T.Vector3()))>.01,'held socket moves with cast');}let n=0;a.traverse(o=>{if(o.isMesh)n++;});assert(n<65,`${def.id} mesh budget ${n}`);a.userData.dispose?.();}
console.log('PASS: M4 monotone/configurable long-run XP, overflow/queued choices, pause, total XP and complete roster adapters.');

const variant=view.heroModel(HEROES.find(h=>h.id==='umbra'));let releases=0;variant.userData.head.traverse(m=>{if(m.material?.color?.getHexString()==='626c84')m.material.addEventListener('dispose',()=>releases++);});variant.userData.presentation.dispose();variant.userData.dispose();assert.equal(releases,1,'owned variant material disposed once through adapter handle');
