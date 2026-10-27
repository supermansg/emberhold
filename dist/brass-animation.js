import * as T from './vendor/three.module.js';
// Shared immutable geometry/materials, independent pose and bone palettes per actor.
export function cloneSkinnedActor(source){
 const root=source.clone(true),map=new Map();
 function pair(a,b){map.set(a,b);for(let i=0;i<a.children.length;i++)pair(a.children[i],b.children[i]);}pair(source,root);
 source.traverse(o=>{if(!o.isSkinnedMesh)return;const copy=map.get(o);copy.skeleton=new T.Skeleton(o.skeleton.bones.map(b=>map.get(b)),o.skeleton.boneInverses.map(m=>m.clone()));copy.bindMatrix.copy(o.bindMatrix);copy.bindMatrixInverse.copy(o.bindMatrixInverse);copy.bindMode=o.bindMode;copy.frustumCulled=false;});
 return root;
}
export function brassPose(state,time,reduced=false){
 if(reduced)return {name:'idle',phase:0};
 // The simulation countdown is authoritative; animation never triggers a shot.
 if(state.dead)return {name:'death',phase:Math.min(.85,Math.max(0,state.deathTime||0))};
 if(state.impactTime>0)return {name:'impact',phase:.32-Math.min(.32,state.impactTime)};
 const attack=Math.max(0,state.attackAnim||0);
 if(attack>0){const elapsed=Math.max(0,.22-Math.min(.22,attack));return elapsed<.06?{name:'release',phase:elapsed/.06*.08}:{name:'recovery',phase:(elapsed-.06)/.16*.18};}
 if(state.reloading)return {name:'reload',phase:(1-Math.min(1,Math.max(0,state.cd)/(state.reload||1)))*1.2};
 if(state.cd>0&&state.cd<.1)return {name:'anticipation',phase:.1-state.cd};
 return {name:'idle',phase:time%2.4};
}
