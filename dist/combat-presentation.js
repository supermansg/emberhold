// Cosmetic body motion from observed engine damage. Logical coordinates stay untouched.
import * as T from './vendor/three.module.js';
const RESPONSE=[[.13,.18,.19],[.18,.26,.16],[.035,.09,.25],[.012,.04,.24]];
export function observeHit(actor,e,effects,time,origin){
 const d=actor.userData;d.hitDirection??=new T.Vector3();d.observedHits??=new WeakMap();
 let value=0;
 for(const f of effects)if(f.type==='text'&&f.targetId===e.id&&f.value){const old=d.observedHits.get(f)||0;value+=Math.max(0,f.value-old);d.observedHits.set(f,f.value);}
 for(const f of effects)if(f.presentation?.heroId==='shockwave'&&f.type==='impact'&&Math.hypot(e.x-f.x,e.y-f.y)<2&&!d.observedHits.has(f)){d.observedHits.set(f,1);value=Math.max(value,e.maxHp*.1);}
 if(value>0){d.hitAt=time;d.hitStrength=Math.min(1,(e.presentation?.special?.65:.3)+value/e.maxHp*3);d.hitDirection.set((e.x-250)/35-origin.x,0,(e.y-300)/35-origin.z).normalize();}
}
export function poseEnemy(actor,e,time,reduced){
 const d=actor.userData,b=d.body,[distance,tilt,duration]=RESPONSE[e.type]||RESPONSE[0];
 const reaction=reduced?0:Math.max(0,1-(time-(d.hitAt??-10))/duration),strength=d.hitStrength||.4,dir=d.hitDirection;
 b.position.x=dir?dir.x*distance*reaction*strength:0;b.position.z=dir?dir.z*distance*reaction*strength:0;
 b.rotation.x+=reaction*tilt*strength;b.rotation.z=dir?-dir.x*tilt*reaction*strength:0;
 if(reaction>.35&&strength>.75&&e.type!==3)for(let i=0;i<d.limbs.length;i++)if(i%2)d.limbs[i].rotation.x=-reaction*.35;
 if(d.impactMaterial?.emissive){d.impactMaterial.emissive.set(e.burn>0?'#8d3214':e.slow>0?(e.slowPresentation?.heroId==='briar'?'#285b26':'#1b5c7a'):'#fff0bb');d.impactMaterial.emissiveIntensity=reaction*.55+(e.burn>0?.1:e.slow>0?.12:0);}
}
