import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {attackPose} from './dist/attack-motion.js';
import {upgradeTheme,upgradeIllustration} from './dist/upgrade-presentation.js';
for(const id of ['gunner','fire','electric','frost','briar','aurora']){
 const h={id,archetype:id,cd:.04,attackAnim:0,reloading:false};const before=JSON.stringify(h);
 assert(attackPose(h,true).prepare>0);assert.equal(attackPose(h,false).prepare,0);assert.deepEqual(attackPose(h,true),attackPose(h,true));assert.equal(JSON.stringify(h),before);
 assert.equal(attackPose({...h,reloading:true},true).prepare,0);assert.equal(attackPose({...h,attackAnim:.22},true).recoil,1);
}
assert.notDeepEqual(attackPose({id:'gunner',attackAnim:.12}),attackPose({id:'electric',attackAnim:.12}));
for(const [id,theme]of [['burn','fire'],['chain','electric'],['slow','ice'],['shatter','ice'],['damage-briar','nature'],['damage-prism','crystal'],['speed-gunner','tempo'],['wall','defense'],['damage-gunner','mechanical'],['team','team']])assert.equal(upgradeTheme({id}),theme);
assert.notEqual(upgradeIllustration({id:'burn'}),upgradeIllustration({id:'chain'}));assert(!upgradeIllustration({icon:'<script>'}).includes('<script>'));
for(const file of ['engine.js','shockwave.js','content.js','collection.js','progression.js','run-xp.js'])assert.deepEqual(readFileSync(`dist/${file}`),execFileSync('git',['show',`cce0fee:dist/${file}`]),file+' authority unchanged');
console.log('PASS M5.2: distinct deterministic attack envelopes, no mutation, truthful upgrade art mapping and byte-identical gameplay authority.');
import * as T from './dist/vendor/three.module.js';
import {CombatVFX} from './dist/combat-vfx.js';
import {ShockwaveView} from './dist/shockwave-view.js';
import {SHOCKWAVE} from './dist/shockwave.js';
const scene=new T.Scene(),fx=new CombatVFX(scene),camera=new T.PerspectiveCamera(),from=new T.Vector3(0,1,5),to=new T.Vector3(0,1,0),shapes=new Set();
for(const hero of ['gunner','fire','electric','frost']){const slot=fx.acquire('impact',hero);fx.update(slot,{life:.15,maxLife:.2,hero,presentation:{heroId:hero,special:2}},from,to,camera,false,0);assert(slot.children[2].visible,'essential contact remains under decorative pressure');assert.equal(slot.children[1].count,0);shapes.add(slot.children[2].geometry);fx.release(slot);}const strong=fx.acquire('impact','gunner');fx.update(strong,{life:.07,maxLife:.2,presentation:{heroId:'gunner',special:2}},from,to,camera,false,0);assert(Math.abs(strong.children[2].position.length()-.72)<1e-9,'contact lies on visible body surface instead of buried at actor center');assert(strong.children[2].visible,'special contact remains visible after the normal flash has faded');fx.release(strong);assert.equal(shapes.size,4,'element silhouettes differ without new emitters');
const allocation=fx.geometries.size;for(let i=0;i<1000;i++){const slot=fx.acquire('impact','fire');fx.update(slot,{life:.15,maxLife:.2,hero:'fire'},from,to,camera,false,0);fx.release(slot);}assert.equal(fx.geometries.size,allocation);let disposed=0;for(const g of fx.geometries)g.addEventListener('dispose',()=>disposed++);fx.dispose();fx.dispose();assert.equal(disposed,allocation);
const wave=new ShockwaveView(scene);for(const quality of ['low','standard','high']){wave.update({shockwave:{age:.1,front:535}},quality,false,true);assert(wave.origin.visible);assert.equal(wave.origin.position.z,(SHOCKWAVE.origin-300)/35);wave.update({shockwave:{age:SHOCKWAVE.charge+SHOCKWAVE.travel,front:0}},quality,false,true);assert(wave.core.visible&&wave.root.visible);assert.equal(wave.core.position.z,-300/35);assert(!wave.origin.visible);}wave.dispose();assert.equal(scene.children.length,0);
console.log('PASS M5.2: distinct essential contacts, 1000 pooled reuses, exact geometry disposal, visible origin/full-lane Low front.');
import {SpecialChoreography} from './dist/special-choreography.js';
import {Soundscape} from './dist/audio.js';
const choreography=new SpecialChoreography(scene),actor=new T.Group(),body=new T.Group(),muzzle=new T.Object3D();actor.add(body);body.add(muzzle);actor.userData={body,muzzle,authored:true};const state={time:1,team:[{id:'gunner',color:'#ffd080',cd:1}],enemies:[],effects:[{type:'special',presentation:{special:2,heroId:'gunner'},maxLife:.65,life:.56}]};choreography.update(state,new Map([[0,actor]]));assert(body.rotation.x>0,'authored Brass special reinforces its positive recoil instead of cancelling it');choreography.reset();state.effects=[];state.team[0].cd=.05;state.team[0].range=600;state.enemies=[{hp:1,y:300}];choreography.update(state,new Map([[0,actor]]));assert.equal(choreography.active,1);assert.equal(choreography.particles,0,'automatic preparation uses ring only');state.enemies=[];choreography.update(state,new Map([[0,actor]]));assert.equal(choreography.active,0);choreography.dispose();
const audio=new Soundscape();audio.enabled=true;audio.ctx={state:'running',currentTime:1};audio.sync=()=>{};const voices=[];audio.voice=(...args)=>voices.push(args);audio.play('fire');const quiet=voices[0][2];audio.last.clear();voices.length=0;audio.scene.intensity=1;audio.play('fire');assert(Math.abs(voices[0][2]/quiet-.72)<1e-9);audio.last.clear();voices.length=0;audio.play('special-fire');assert(voices.every(v=>v[8]===2));assert(audio.focusUntil>audio.ctx.currentTime);audio.ctx=null;audio.dispose();
console.log('PASS M5.2: special reinforces authored recoil, eligible zero-shard anticipation, crowd mix attenuation and reserved special priority.');
