import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import * as T from './dist/vendor/three.module.js';
import {loadBrassAsset,createBrassActor,animateBrassAsset,disposeBrassAsset,brassAssetStats} from './dist/brass-asset.js';
import {CombatVFX} from './dist/combat-vfx.js';
import {ShockwaveView} from './dist/shockwave-view.js';
import {forestCrown} from './dist/forest-geometry.js';
import {upgradeIllustration} from './dist/upgrade-presentation.js';
const crown=forestCrown(),pos=crown.attributes.position,normal=crown.attributes.normal;for(let i=0;i<8;i++)assert(pos.getX(i)*normal.getX(i)+pos.getZ(i)*normal.getZ(i)>0,'forest exterior normals point outward');crown.dispose();
const bytes=readFileSync(new URL('./dist/assets/models/brass.glb',import.meta.url));assert(bytes.length<2e6);
const originalFetch=globalThis.fetch;globalThis.ProgressEvent??=class{constructor(type,data){Object.assign(this,{type},data)}};
globalThis.fetch=async request=>{assert(String(request.url||request).endsWith('/assets/models/brass.glb'));return new Response(bytes,{headers:{'Content-Length':String(bytes.length)}});};
assert.equal(createBrassActor(),null,'procedural fallback remains possible before load');
await Promise.all([loadBrassAsset(),loadBrassAsset()]);
const a=createBrassActor(),b=createBrassActor();assert(a.userData.authored);assert.equal(brassAssetStats().instances,2);assert(!disposeBrassAsset(),'live instances protect shared resources');
let tris=0,draws=0;a.traverse(o=>{if(o.isMesh){draws++;tris+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;}});assert(tris<30000);assert(draws<=32);
assert.equal(a.userData.torso.geometry,b.userData.torso.geometry,'instances reuse immutable mesh data');
for(const state of [{cd:.04},{attackAnim:.4},{attackAnim:.1},{reloading:true,cd:.8,reload:1.7}]){animateBrassAsset(a,state,4);a.updateMatrixWorld(true);const socket=a.userData.muzzle.getWorldPosition(new T.Vector3());animateBrassAsset(a,state,4);a.updateMatrixWorld(true);assert(socket.equals(a.userData.muzzle.getWorldPosition(new T.Vector3())),'paused animation/socket stable');}
let disposed=0;a.userData.torso.geometry.addEventListener('dispose',()=>disposed++);a.userData.dispose();a.userData.dispose();assert.equal(brassAssetStats().instances,1);assert.equal(disposed,0);b.userData.dispose();assert(disposeBrassAsset());assert.equal(disposed,1);assert.equal(createBrassActor(),null);
globalThis.fetch=async()=>{throw Error('missing asset');};await assert.rejects(loadBrassAsset());assert.equal(createBrassActor(),null);globalThis.fetch=(_,options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('asset load aborted')),{once:true}));await assert.rejects(loadBrassAsset(),/aborted/,'stalled optional asset is cancelled and permits fallback');assert.equal(createBrassActor(),null);globalThis.fetch=originalFetch;
const scene=new T.Scene(),pool=new CombatVFX(scene),camera=new T.PerspectiveCamera(),source=new T.Vector3(),target=new T.Vector3(0,1,-5);
for(let i=0;i<500;i++){const s=pool.acquire('special','fire');pool.update(s,{life:.3,maxLife:.65,radius:115,presentation:{special:2,heroId:'fire'}},source,target,camera,false,0);assert(s.children[3].visible);pool.release(s);}assert.equal(pool.stats.active,0);assert.equal(pool.slots.length,96);pool.dispose();
const wave=new ShockwaveView(scene),g={shockwave:{age:.4,front:440}};for(const quality of ['low','standard','high']){wave.update(g,quality,false,true);assert(wave.root.visible);assert.equal(wave.debris.count,0);assert.equal(wave.core.position.z,4);}wave.update({shockwave:{age:1,front:285}});assert(!wave.root.visible);wave.dispose();assert.equal(scene.children.length,0);
assert(upgradeIllustration({icon:'❄'}).includes('❄'));assert(!upgradeIllustration({icon:'<script>'}).includes('<script>'));
// Presentation-only milestone: every authority/config/save source is byte-identical to M4.1.
for(const file of ['engine.js','shockwave.js','content.js','progression.js','collection.js']){const baseline=execFileSync('git',['show',`56eab30:dist/${file}`]);assert.deepEqual(readFileSync(`dist/${file}`),baseline,file);}
console.log(`PASS M5: actual GLB decode (${tris} triangles/${draws} meshes), shared lifecycle/fallback, socket pause, bounded special/wave pools, unchanged M4.1 gameplay/save/content.`);
