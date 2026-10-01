import assert from 'node:assert/strict';
import * as T from './dist/vendor/three.module.js';
import {solarPosition,weatherAt,LivingWorld} from './dist/environment.js';
import {BattleView} from './dist/render3d.js';
const noon=solarPosition(new Date('2026-06-21T09:40:00Z')),night=solarPosition(new Date('2026-06-21T21:00:00Z'));
assert(noon.altitude>75*Math.PI/180&&noon.altitude<85*Math.PI/180);assert(night.up<0);
assert(solarPosition(new Date('2026-03-20T05:00:00Z')).east>0);assert(solarPosition(new Date('2026-03-20T15:00:00Z')).east<0);
for(let i=0;i<100;i++){const ms=Date.UTC(2026,0,1)+i*420000,w=weatherAt(ms);assert(w.cloud>=0&&w.cloud<=1);assert(w.rain>=0&&w.rain<=1);assert(Math.abs(weatherAt(ms-1).cloud-weatherAt(ms+1).cloud)<1e-6);}
const view=Object.create(BattleView.prototype);Object.assign(view,{scene:new T.Scene(),camera:new T.PerspectiveCamera(45,1,.1,240),host:{getBoundingClientRect:()=>({width:390,height:760,left:0,top:0})}});view.buildWorld();
const env=view.environment,date=new Date('2026-09-08T10:00:00Z');env.update(1,null,date);const matrix=env.canopy.instanceMatrix.array.slice();env.update(2,null,date);assert.notDeepEqual(env.canopy.instanceMatrix.array,matrix);const paused=env.canopy.instanceMatrix.array.slice();env.update(2,null,date);assert.deepEqual(env.canopy.instanceMatrix.array,paused);
env.update(3,null,date,true);const reduced=env.canopy.instanceMatrix.array.slice();env.update(8,null,date,true);assert.deepEqual(env.canopy.instanceMatrix.array,reduced);assert(!env.rain.visible&&!env.leaves.visible&&!env.dust.visible);
const f={type:'blast',x:90,y:420};env.update(10,{effects:[f]},date);env.update(10,{effects:[f]},date);assert.equal(env.impulses.length,1);env.update(13,{effects:[]},date);assert.equal(env.impulses.length,0);assert.equal(env.dust.count,0);
for(const aspect of [360/714,390/758,680/810]){view.camera.aspect=aspect;view.configureCamera(true,0);view.scene.updateMatrixWorld(true);const result=[];for(let i=0;i<4;i++){const target=new T.Vector3((90+i*105-250)/35,2.3,(555-300)/35);const vector=target.clone().project(view.camera);assert(Math.abs(vector.x)<.95&&Math.abs(vector.y)<.95);const ray=new T.Raycaster(view.camera.position,target.clone().sub(view.camera.position).normalize(),0,view.camera.position.distanceTo(target)-.1);const hits=ray.intersectObjects(view.scene.children,true).filter(h=>h.object.visible&&h.object.material&&!h.object.material.transparent);result.push(hits.length);}console.log('Hero center occlusions at aspect',aspect,result);assert(result.every(n=>n===0),'opaque scenery must not obscure hero centers');}
for(const n of env.root.children)assert(n.position.toArray().every(Number.isFinite));
console.log('PASS: solar direction, weather continuity, motion/pause/reduced motion, bounded impact responses and hero visibility rays. GPU pixels/performance not tested.');
