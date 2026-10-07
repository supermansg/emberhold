import assert from 'node:assert/strict';
import {Game} from './dist/engine.js';
import {migrateSave,heroProgress,settleRun,buyUpgrade} from './dist/progression.js';
import {BattleView} from './dist/render3d.js';
import * as T from './dist/vendor/three.module.js';
const save=migrateSave({coins:300,power:2,heroes:{gunner:{xp:80,seconds:125,score:60,runs:1},fire:{xp:-4}}});
assert.equal(heroProgress(save,'gunner').level,2);assert.equal(save.heroes.fire.xp,0);assert.equal(save.power,2);
// Pin the option shuffle: recruitment can replace a randomly selected defense slot.
let optionSeed=123456;const optionRandom=()=>((optionSeed=(1664525*optionSeed+1013904223)>>>0)/4294967296);
const g=new Game({meta:save,random:optionRandom});assert(g.team[0].damage>new Game({meta:{power:2}}).team[0].damage);
function option(game,id){for(let i=0;i<3000;i++){const o=game.makeOptions().find(o=>o.id===id);if(o)return o;}throw Error('Missing '+id)}
g.level=2;assert(g.makeOptions().some(o=>o.kind==='הגנה'));option(g,'station-turret').apply();g.level=4;option(g,'gadget-gunner').apply();assert.equal(g.team[0].gadgetRank,1);assert.equal(g.team[0].mag,12);
assert(!new Game().makeOptions().some(o=>o.kind==='גאדג׳ט'));
g.enemies=[{id:99,x:200,y:400,hp:1000,maxHp:1000,speed:0,flash:0,burn:0,slow:0,damage:0,type:0}];g.intermission=100;g.team[0].cd=100;g.step(.1);assert.equal(g.enemies[0].hp,984);assert(g.team[0].activeSeconds>0);const sec=g.team[0].activeSeconds;g.state='paused';g.step(.1);assert.equal(g.team[0].activeSeconds,sec);
g.enemies[0].hp=0;g.resolveDeaths();g.state='retired';const result=settleRun(save,g);assert.equal(result.heroes[0].xp,3);const after=JSON.stringify(save);settleRun(save,g);assert.equal(JSON.stringify(save),after);assert.equal(migrateSave(JSON.parse(after)).heroes.gunner.xp,83);
const idle=new Game();idle.team[0].activeSeconds=1000;idle.state='retired';assert.equal(settleRun(migrateSave(null),idle).heroes[0].xp,0);
const trained=migrateSave({coins:200});buyUpgrade(trained,'gpower');assert.equal(heroProgress(trained,'gunner').xp,30);assert.equal(heroProgress(trained,'fire').xp,0);
const combo=new Game();combo.addHero(3);combo.level=4;option(combo,'shatter').apply();combo.enemies=[{id:1,x:200,y:300,hp:1000,slow:2}];combo.attack(combo.team[0],combo.enemies[0]);combo.updateProjectiles(1);assert.equal(combo.enemies[0].hp,1000-combo.team[0].damage*1.3);assert(combo.effects.some(f=>f.text==='SHATTER +30%'));
const view=Object.create(BattleView.prototype);view.camera=new T.PerspectiveCamera(45,.7,.1,100);let frames=0;view.renderer={render(scene,camera){scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);scene.traverse(o=>assert(o.matrixWorld.elements.every(Number.isFinite)));frames++;}};for(let i=0;i<4;i++){view.renderHero(i,0,0);view.renderHero(i,Math.PI,1000);assert.equal(view.galleryActor.rotation.y,Math.PI);}view.scene=new T.Scene();view.updateStations(g,2);assert.equal(view.stationObjects.size,1);assert.equal(frames,8);
console.log('PASS: migration, training/mastery, pause-safe participation, no idle XP, exact-once rewards, gadget gates, station damage, frost combo, four 3D turntables and station geometry. GPU/touch-device QA not performed.');
