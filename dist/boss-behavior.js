// First forest boss: a readable, interruptible wall ram. Simulation time only.
export const BOSS_RAM=Object.freeze({windup:1.6,recovery:2.5,multiplier:2.4});
export function stepBossRam(game,e,dt){
 if(!e.isBoss||e.definitionId!=='forest-boss'||game.wave!==3)return false;
 if(e.hp<=0)return true;
 if(e.y<523){
  if(e.ramPhase==='windup'){game.emit('bossInterrupt',{id:e.id});game.callout('נבלם!',e.x,e.y,'#b4f4e4','boss-interrupt');e.ramPhase='recovery';e.ramTimer=BOSS_RAM.recovery;}
  if(e.ramPhase==='recovery')e.ramTimer=Math.max(0,e.ramTimer-dt);
  return true;
 }
 if(e.ramPhase==='recovery'){
  e.ramTimer-=dt;if(e.ramTimer>0)return true;e.ramPhase=null;
 }
 if(e.ramPhase!=='windup'){
  e.ramPhase='windup';e.ramTimer=BOSS_RAM.windup;
  game.emit('bossWindup',{id:e.id,duration:BOSS_RAM.windup});
  game.callout('מכת מצור — גל הדף עוצר אותה',e.x,470,'#ffd096','boss-windup');return true;
 }
 e.ramTimer=Math.max(0,e.ramTimer-dt);if(e.ramTimer>1e-8)return true;
 const dmg=e.damage*BOSS_RAM.multiplier,blocked=Math.min(dmg,game.shield);
 game.shield-=blocked;game.hp=Math.max(0,game.hp-(dmg-blocked));game.shake=Math.max(game.shake,.28);
 game.emit('wallHit',{blocked,dmg,bossRam:true});game.fx('blast',e.x,535,'#ff926a',{radius:65,life:.5,maxLife:.5});
 e.ramPhase='recovery';e.ramTimer=BOSS_RAM.recovery;return true;
}
