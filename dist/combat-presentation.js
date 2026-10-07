// Cosmetic body motion from observed engine damage. Logical coordinates stay untouched.
import * as T from './vendor/three.module.js';
const RESPONSE=[[.19,.25,.24],[.24,.32,.20],[.045,.12,.28],[.012,.05,.28]];
export function observeHit(actor,e,effects,time,origin,wave=null){
 const d=actor.userData;d.hitDirection??=new T.Vector3();d.observedHits??=new WeakMap();
 let value=0;
 if(wave?.hitIds.has(e.id)&&d.observedWave!==wave){d.observedWave=wave;d.waveAt=time;value=e.maxHp*.1;}
 for(const f of effects)if(f.type==='text'&&f.targetId===e.id&&f.value){const old=d.observedHits.get(f)||0;value+=Math.max(0,f.value-old);d.observedHits.set(f,f.value);}
 for(const f of effects)if(f.presentation?.heroId==='shockwave'&&f.type==='impact'&&(f.targetId!==undefined?f.targetId===e.id:Math.hypot(e.x-f.x,e.y-f.y)<2)&&!d.observedHits.has(f)){d.observedHits.set(f,1);value=Math.max(value,e.maxHp*.1);d.waveAt=time;}
 if(value>0){d.hitAt=time;d.hitStrength=Math.min(1,(e.presentation?.special?.65:.3)+value/e.maxHp*3);d.hitDirection.set((e.x-250)/35-origin.x,0,(e.y-300)/35-origin.z).normalize();}
}
export function poseEnemy(actor,e,time,reduced){
 const d=actor.userData,b=d.body,[distance,tilt,duration]=RESPONSE[e.type]||RESPONSE[0];
 const reaction=reduced?0:Math.max(0,1-(time-(d.hitAt??-10))/duration),strength=d.hitStrength||.4,dir=d.hitDirection;
 b.position.x=dir?dir.x*distance*reaction*strength:0;b.position.z=dir?dir.z*distance*reaction*strength:0;
 const wave=reduced?0:Math.max(0,1-(time-(d.waveAt??-10))/.48);b.position.y+=wave*Math.sin((1-wave)*Math.PI)*(e.type===1?.22:e.type===0?.09:.015);b.rotation.x+=wave*(e.type===1?.24:e.type===0?.17:e.type===2?.07:.04);
 b.rotation.x+=reaction*tilt*strength;b.rotation.z=dir?-dir.x*tilt*reaction*strength:0;
 if(reaction>.35&&strength>.75&&e.type!==3)for(let i=0;i<d.limbs.length;i++)if(i%2)d.limbs[i].rotation.x=-reaction*.35;
 if(!reduced&&reaction>0&&e.presentation?.heroId==='electric')b.rotation.z+=Math.sin(time*65)*reaction*.035;
 if(d.impactMaterial?.emissive){d.impactMaterial.emissive.set(e.burn>0?'#8d3214':e.slow>0?(e.slowPresentation?.heroId==='briar'?'#285b26':'#1b5c7a'):'#fff0bb');d.impactMaterial.emissiveIntensity=reaction*.55+(e.burn>0?.1:e.slow>0?.12:0);}
}
