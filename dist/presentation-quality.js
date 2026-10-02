// Presentation budgets only: no access to simulation, saves or combat RNG.
export const QUALITY=Object.freeze({
 low:Object.freeze({pixelRatio:1,shadows:false,combatParticles:24,rain:40,leaves:8,dust:16,ripples:0,smoke:4,particleCap:95,corpses:3}),
 standard:Object.freeze({pixelRatio:1.35,shadows:true,combatParticles:72,rain:80,leaves:24,dust:32,ripples:8,smoke:8,particleCap:227,corpses:6}),
 high:Object.freeze({pixelRatio:1.6,shadows:true,combatParticles:144,rain:160,leaves:48,dust:64,ripples:16,smoke:12,particleCap:447,corpses:6})
});
export class PresentationQuality {
 constructor(){this.level='standard';this.frameMs=16.7;this.lastNow=null;this.renderMs=0;this.loaded=false;this.stats={};this.rendererLevel=null;}
 get settings(){return QUALITY[this.level];}
 set(level){if(!QUALITY[level])throw new Error('Unknown presentation quality');this.level=level;this.rendererLevel=null;}
 get decorativeBudget(){return this.loaded?Math.min(12,this.settings.combatParticles):this.settings.combatParticles;}
 observe(now,renderMs,counts){
  if(this.lastNow!==null){const delta=now-this.lastNow;if(delta>0&&delta<250)this.frameMs=this.frameMs*.93+delta*.07;}
  this.lastNow=now;this.renderMs=this.renderMs*.9+renderMs*.1;
  if(this.frameMs>38)this.loaded=true;else if(this.frameMs<27)this.loaded=false;
  Object.assign(this.stats,counts,{quality:this.level,frameMs:this.frameMs,renderMs:this.renderMs,decorationReduced:this.loaded});
 }
 apply(renderer,world){
  if(this.rendererLevel!==this.level){
   renderer.setPixelRatio?.(Math.min(globalThis.devicePixelRatio||1,this.settings.pixelRatio));if(renderer.shadowMap)renderer.shadowMap.enabled=this.settings.shadows;
   this.rendererLevel=this.level;
  }
  world?.setQuality?.(this.settings,this.loaded);
 }
 resetTiming(){this.lastNow=null;this.frameMs=16.7;this.loaded=false;}
}
