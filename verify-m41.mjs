import assert from 'node:assert/strict';
import {Game} from './dist/engine.js';
import {SHOCKWAVE} from './dist/shockwave.js';
const fixture=()=>{const g=new Game({random:()=>.5});g.intermission=100;g.team[0].cd=100;g.nextXp=1e9;g.enemies=[0,1,2,3].map(type=>({id:type+1,type,isBoss:type===3,x:100+type*100,y:510,hp:10000,maxHp:10000,speed:0,damage:0,attack:1,burn:0,slow:0,flash:0}));return g;};
const g=fixture();assert(g.activateShockwave());assert(!g.activateShockwave());for(let i=0;i<15;i++)g.step(.1);const positions=g.enemies.map(e=>e.y);assert.deepEqual(positions,[430,418,478,503.6]);assert(g.enemies.every(e=>e.hp===10000&&e.y>=0));assert.equal(g.kills,0);assert.equal(g.loot.length,0);assert.equal(g.projectiles.length,0);const remaining=g.shockwave.cooldown;g.state='paused';for(let i=0;i<30;i++)g.step(.1);assert.equal(g.shockwave.cooldown,remaining);assert(!g.activateShockwave());g.state='playing';for(let i=0;i<SHOCKWAVE.cooldown*10;i++)g.step(.1);assert(g.activateShockwave());
const reference=fixture();reference.activateShockwave();for(let i=0;i<60;i++)reference.step(.05);for(const speed of [1,2,3]){const a=fixture();a.activateShockwave();for(let frame=0;frame<60/speed;frame++)for(let n=0;n<speed;n++)a.step(.05);assert.deepEqual(a.enemies,reference.enemies);assert.deepEqual(a.shockwave,reference.shockwave);assert.equal(a.time,reference.time);}
const edge=fixture();edge.enemies[0].y=270;edge.enemies[1].hp=0;edge.activateShockwave();for(let i=0;i<10;i++)edge.step(.1);assert.equal(edge.enemies.find(e=>e.id===1).y,270,'outside range untouched');assert.equal(edge.shockwave.hitIds.size,0,'hit set released after wave');
console.log('PASS M4.1: travelling zero-damage Shockwave, resistance, bounds, exact-once contact, pause, cooldown and repeat activation.');

// Actual M4 engine comparison, including every leader power and every collection spell.
import {execFileSync} from 'node:child_process';
import {HEROES} from './dist/content.js';
import {migrateSave} from './dist/progression.js';
import {grantCards,unlockCost} from './dist/collection.js';
const source=execFileSync('git',['show','ae55318:dist/engine.js'],{encoding:'utf8'}).replace(/from '\.\/([^']+)'/g,(_,p)=>`from '${new URL('./dist/'+p,import.meta.url).href}'`);
const {Game:Baseline}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const save=migrateSave(null);for(const h of HEROES)grantCards(save,'heroes',h.id,unlockCost(h));
const snapshot=g=>JSON.stringify(g,(k,v)=>['presentation','burnPresentation','slowPresentation','effects','events','shake'].includes(k)?undefined:v);
for(let hero=0;hero<10;hero++)for(const speed of [1,2,3]){const old=new Baseline({hero,meta:save,random:()=>.5}),now=new Game({hero,meta:save,random:()=>.5});for(const g of [old,now]){g.enemies=fixture().enemies;g.intermission=100;g.nextXp=1e9;g.powerCharge=g.powerNeeded;assert(g.activatePower());}assert(now.effects.some(f=>f.type==='special'&&f.presentation.heroId===HEROES[hero].id));for(let i=0;i<100;i++){for(let n=0;n<speed;n++){old.step(.03);now.step(.03);}assert.equal(snapshot(now),snapshot(old),`M4 special authority: ${HEROES[hero].id} speed ${speed}`);}}
for(const id of ['meteor','blizzard','thunder','renewal']){const old=new Baseline(),now=new Game();for(const g of [old,now]){g.enemies=fixture().enemies;g.hp=100;g.intermission=100;g.nextXp=1e9;g.spells=[{id,color:'#aaffee',name:id,rank:1,need:10,charge:10}];assert(g.activateSpell(id));}for(let i=0;i<50;i++){old.step(.03);now.step(.03);assert.equal(snapshot(now),snapshot(old),id);}}
console.log('PASS M4.1: all ten leader powers/all four spells preserve exact M4 authoritative state at all speeds.');

import * as T from './dist/vendor/three.module.js';
import {ShockwaveView} from './dist/shockwave-view.js';
import {CombatVFX} from './dist/combat-vfx.js';
const scene=new T.Scene(),wave=new ShockwaveView(scene),sim=fixture();sim.activateShockwave();sim.step(.1);sim.step(.1);let z;for(const quality of ['low','standard','high']){wave.update(sim,quality,false);assert(wave.root.visible);assert(wave.debris.count<=12);if(z!==undefined)assert.equal(z,wave.core.position.z);z=wave.core.position.z;}wave.update(sim,'low',true,true);assert(wave.root.visible);assert.equal(wave.debris.count,0);const wavePosition=wave.core.position.clone();sim.state='paused';sim.step(.1);wave.update(sim);assert.deepEqual(wave.core.position,wavePosition);wave.update(null);assert(!wave.root.visible);wave.dispose();wave.dispose();assert.equal(scene.children.length,0);
const pool=new CombatVFX(scene);for(let i=0;i<100;i++)pool.acquire('blast');const essential=pool.acquire('special','fire');assert.notEqual(essential,pool.empty);pool.update(essential,{life:.3,maxLife:.65,radius:115,presentation:{heroId:'cinder',special:2}},new T.Vector3(),new T.Vector3(),new T.PerspectiveCamera(),false,0);assert(essential.children[0].visible);assert.equal(essential.children[1].count,0);assert(pool.stats.active<=pool.capacity);pool.reset();assert.equal(pool.stats.active,0);pool.dispose();pool.dispose();
console.log('PASS M4.1: reserved essential wave/special feedback, quality invariance, pool ceilings, paused visuals and disposal.');

const attribution=fixture(),victim=attribution.enemies[0];attribution.hit(victim,1,'#ffffff','frost',{heroId:'briar',special:2});attribution.hit(victim,1,'#ffffff');assert.equal(victim.presentation,null,'station damage clears stale special');victim.burn=2;victim.burnDmg=1;victim.burnPresentation={heroId:'cinder',special:0};attribution.step(.05);assert.equal(victim.presentation.heroId,'cinder','burn restores source identity');
import {CUES} from './dist/audio-cues.js';
for(const id of [...HEROES.map(h=>h.id),'meteor','blizzard','thunder','renewal']){assert(CUES['special-'+id]?.length>=3);assert(CUES['heavy-'+id]?.length>=2);}
