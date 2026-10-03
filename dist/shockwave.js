// Authoritative player control. All distances use the existing straight lane's Y axis.
export const SHOCKWAVE=Object.freeze({cooldown:18,charge:.18,travel:.65,origin:535,range:250,push:80,resistance:Object.freeze([1,1.15,.4,.08])});
export function activateShockwave(game){
 if(game.state!=='playing'||(game.shockwave?.cooldown||0)>0)return false;
 game.shockwave={age:0,cooldown:SHOCKWAVE.cooldown,front:SHOCKWAVE.origin,hitIds:new Set()};
 game.emit('shockwaveCharge');return true;
}
export function stepShockwave(game,dt){
 const s=game.shockwave;if(!s)return;s.cooldown=Math.max(0,s.cooldown-dt);const previous=s.age;s.age+=dt;
 if(previous<SHOCKWAVE.charge&&s.age>=SHOCKWAVE.charge){game.emit('shockwaveRelease');game.shake=Math.max(game.shake,.22);}
 if(s.age<SHOCKWAVE.charge||previous>=SHOCKWAVE.charge+SHOCKWAVE.travel)return;
 s.front=SHOCKWAVE.origin-SHOCKWAVE.range*Math.min(1,(s.age-SHOCKWAVE.charge)/SHOCKWAVE.travel);
 for(const e of game.enemies){if(e.hp<=0||e.y<s.front||e.y>SHOCKWAVE.origin||s.hitIds.has(e.id))continue;
  s.hitIds.add(e.id);e.y=Math.max(0,e.y-SHOCKWAVE.push*(SHOCKWAVE.resistance[e.isBoss?3:e.type]??1) );
  e.flash=Math.max(e.flash||0,.16);game.fx('impact',e.x,e.y,'#a9eee8',{hero:'gunner',presentation:{heroId:'shockwave',special:1},life:.3,maxLife:.3});
 }
 if(s.age>=SHOCKWAVE.charge+SHOCKWAVE.travel)s.hitIds.clear();
}
