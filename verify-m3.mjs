import assert from 'node:assert/strict';
import * as T from './dist/vendor/three.module.js';
import {premiumActor,animatePremium} from './dist/premium-actors.js';
import {ActorPresentation} from './dist/actor-presentation.js';
for(const hero of [true,false]){
 const a=premiumActor(hero),b=premiumActor(hero);assert.equal(a.userData.artVersion,3);assert.equal(a.userData.limbs.length,4);
 let meshes=0;a.traverse(n=>{if(n.isMesh){meshes++;assert.ok(n.geometry.attributes.position.array.every(Number.isFinite));}});assert.ok(meshes<55);
 const state={attackAnim:.18,cd:.03,reloading:false};const before=JSON.stringify(state);animatePremium(a,state,3);a.updateMatrixWorld(true);const pose=JSON.stringify(a.userData.head.rotation.toArray());animatePremium(a,state,3);assert.equal(JSON.stringify(a.userData.head.rotation.toArray()),pose);assert.equal(JSON.stringify(state),before);
 if(hero){assert.equal(a.userData.muzzle.parent,a.userData.weapon);animatePremium(a,{reloading:true,cd:.5,reload:1},4);assert.equal(a.userData.animationState,'reload');assert.notEqual(a.userData.weapon.rotation.z,0);animatePremium(a,state,5,true);assert.equal(a.userData.head.rotation.x,0);}
 a.userData.dispose();a.userData.dispose();assert.equal(a.userData.presentation.disposed,true);assert.ok(b.userData.torso.geometry.attributes.position.count>0);
}
let released=0;const root=new T.Group(),socket=new T.Group();root.add(socket);const clip=new T.AnimationClip('idle',1,[new T.NumberKeyframeTrack('.position[x]',[0,1],[0,1])]);const h=new ActorPresentation(root,{sockets:{weapon:socket},clips:[clip],release:()=>released++});
const attachment=new T.Object3D(),detach=h.attach('weapon',attachment);assert.equal(attachment.parent,socket);detach();assert.equal(attachment.parent,null);assert.equal(h.play('missing'),false);assert.equal(h.play('idle'),true);h.update(0);h.update(.05);const pos=root.position.x;h.update(.05);assert.equal(root.position.x,pos,'paused time freezes clips');h.dispose();h.dispose();assert.equal(released,1);
const fallback=await ActorPresentation.load(async()=>{throw new Error('missing GLB');},()=>premiumActor(true));assert.match(fallback.fallbackReason,/missing GLB/);assert.equal(fallback.root.userData.premium,true);fallback.dispose();assert.equal(fallback.root.userData.presentation.disposed,true);
const abort=new AbortController();abort.abort();await assert.rejects(ActorPresentation.load(async()=>({root:new T.Group(),release:()=>released++}),()=>premiumActor(true),{signal:abort.signal}));assert.equal(released,2);


for(const speed of [1,2,3]){const root=new T.Group(),h=new ActorPresentation(root,{clips:[clip]});h.play('idle');h.update(0);for(let i=1;i<=6/speed;i++)h.update(i*.05*speed);assert.ok(Math.abs(root.position.x-.3)<1e-6,'clip follows simulation time at every speed');h.dispose();}

const frozen=premiumActor(false);animatePremium(frozen,{slow:2,slowAmount:.95,y:300},2);assert(frozen.userData.limbs.every(l=>l.rotation.x===0));
console.log('PASS: M3 actor geometry, sockets, reload, freeze, reduced-motion/pause/speeds, clips, fallback/cancellation, disposal.');
