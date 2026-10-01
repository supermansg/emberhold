import {ownsHero,heroCardRank,SPELLS} from './collection.js';
import {heroProgress,GADGETS} from './progression.js';
import {HEROES,ENEMIES,MAPS} from './content.js';
export {HEROES} from './content.js';
export const HOUSES=[{id:'fort',name:'מצודת הגחלת',hp:650,ability:'מגן הגחלת',desc:'מגן אוטומטי סופג נזק ומגן על הגדר.',color:'#ffc36d'}];
export function startingChoices(random=Math.random,meta={}){const ids=HEROES.map((_,i)=>i).filter(i=>ownsHero(meta,HEROES[i].id));for(let i=ids.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}return ids.slice(0,3);}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class Game {
 constructor({hero=0,house=0,meta={},random=Math.random,map='forest'}={}){
  this.map=MAPS.get(map);if(!this.map)throw new Error('Unknown map: '+map);this.random=random;this.house=HOUSES[0];this.meta=meta;this.maxHp=this.house.hp+(meta.vitality||0)*40;this.hp=this.maxHp;this.shield=0;this.keyFragments=0;this.spells=(meta.collection?.loadout||[]).filter(id=>meta.collection?.spells?.[id]?.unlocked&&SPELLS.some(s=>s.id===id)).slice(0,2).map(id=>({...SPELLS.find(s=>s.id===id),rank:Math.min(5,meta.collection.spells[id].rank||0),charge:0}));this.powerCharge=0;this.powerNeeded=8;this.powerUses=0;this.stations=[];this.shatterCombo=false;this.team=[];this.addHero(hero);this.enemies=[];this.projectiles=[];this.effects=[];this.events=[];this.state='playing';this.wave=0;this.kills=0;this.xp=0;this.level=1;this.nextXp=18;this.time=0;this.gold=0;this.teamDamage=1;this.housePower=1;this.houseTimer=0;this.houseCooldown=22;this.spawnTimer=0;this.intermission=2;this.target=null;this.options=[];this.nextId=1;this.freezeClock=0;this.chainCombo=false;this.waveSpawn=0;this.spawnTotal=0;this.progress=0;this.waveKills=0;this.bossKills=0;this.totalXp=0;this.loot=[];this.lootId=0;this.waveGold=0;this.collectedCoins=0;this.scars=[];this.shake=0;this.upgradeLog=[];
 }
 addHero(index){const d=HEROES[index];if(!d)throw new Error('Unknown hero');if(!ownsHero(this.meta,d.id))throw new Error('Hero is locked');if(this.team.some(h=>h.id===d.id)||this.team.length>=4)return;const personal=d.trainingKey?this.meta:{},mastery=heroProgress(this.meta,d.id);this.team.push({...d,index,mastery:mastery.level,runScore:0,activeSeconds:0,gadgetRank:0,damage:d.damage*(1+heroCardRank(this.meta,d.id)*.06)*(1+mastery.bonus/100)*(1+(this.meta.power||0)*.05)*(1+(this.meta[d.trainingKey]||0)*.08)*(d.archetype==='electric'?1+(personal.eskill||0)*.04:1),reload:d.reload?d.reload/(1+(personal.reload||0)*.05):0,cd:.15,ammo:d.mag||0,reloading:false,rank:1,shots:0,reloads:0,chain:(d.chain??2)+Math.floor((personal.eskill||0)/2),radius:(d.radius??58)+(personal.fskill||0)*4,burn:(d.burn??5)+(personal.fskill||0)*3,slow:(d.slow??.42)+(personal.iskill||0)*.03,specialCooldown:d.specialCooldown??14,specialTimer:0,attackAnim:0,joinedAt:this.time||0,upgrades:[]});}
 activateSpell(id){const s=this.spells.find(s=>s.id===id);if(this.state!=='playing'||!s||s.charge<s.need)return false;const alive=this.enemies.filter(e=>e.hp>0&&e.y>0),target=alive.find(e=>e.id===this.target)||alive.sort((a,b)=>b.y-a.y)[0];if(id==='renewal'){if(this.hp>=this.maxHp)return false;const old=this.hp;this.hp=Math.min(this.maxHp,this.hp+120+s.rank*35);this.callout('+'+Math.round(this.hp-old)+' HP',250,535,s.color,'renewal');this.fx('blast',250,535,s.color,{radius:150,hero:'frost'});}else{if(!target)return false;if(id==='meteor'){for(let i=0;i<3;i++)this.launch({archetype:'fire',shotStyle:'meteor',color:s.color,radius:80,burn:0,slow:0},target,100+i*150,-130,80+s.rank*20);}if(id==='blizzard'){for(const e of alive){this.hit(e,40+s.rank*15,s.color,'frost');e.slow=5;e.slowAmount=.75;}this.fx('blast',250,320,s.color,{hero:'frost',radius:230});}if(id==='thunder'){let x=250,y=555;for(const e of [target,...alive.filter(e=>e!==target)].slice(0,6)){this.hit(e,110+s.rank*25,s.color,'electric');this.fx('bolt',x,y,s.color,{tx:e.x,ty:e.y});x=e.x;y=e.y;}}}s.charge=0;this.emit('special',{hero:id==='meteor'?'fire':id==='thunder'?'electric':'frost'});this.callout(s.name,target?.x||250,target?.y||535,s.color,id);return true;}
 activatePower(){
  if(this.state!=='playing'||this.powerCharge<this.powerNeeded)return false;
  const alive=this.enemies.filter(e=>e.hp>0&&e.y>0);if(!alive.length)return false;
  const h=this.team[0],target=alive.find(e=>e.id===this.target)||alive.sort((a,b)=>b.y-a.y)[0],d=h.damage*this.teamDamage;
  this.powerCharge=0;this.powerNeeded=14;this.powerUses++;h.attackAnim=.5;
  if(h.archetype==='gunner'){const targets=[target,...alive.filter(e=>e!==target)].slice(0,3);for(let i=0;i<3;i++)this.launch({...h,reloads:0},targets[i%targets.length],90,555,d*2);}
  if(h.archetype==='fire')this.launch({...h,radius:h.radius*2,burn:h.burn*2},target,90,555,d*2);
  if(h.archetype==='electric'){let x=90,y=555;const targets=[target,...alive.filter(e=>e!==target&&Math.hypot(e.x-target.x,e.y-target.y)<230)].slice(0,5);for(const e of targets){this.hit(e,d*2,h.color,h.archetype);this.fx('bolt',x,y,h.color,{tx:e.x,ty:e.y});x=e.x;y=e.y;}if(targets.length>1)this.callout('BOUNCE ×'+(targets.length-1),x,y,h.color,'power-bounce');}
  if(h.archetype==='frost'){for(const e of alive){this.hit(e,d,h.color,h.archetype);e.slow=5;e.slowAmount=.85;}this.fx('blast',250,300,h.color,{radius:230,hero:'frost'});}
  this.callout('ULTIMATE',target.x,target.y,h.color,'ultimate');this.shake=Math.max(this.shake,.2);this.emit('special',{hero:h.archetype});this.emit('powerUsed',{hero:h.id});return true;
 }
 emit(type,data={}){this.events.push({type,...data});if(this.events.length>120)this.events.shift();}
 fx(type,x,y,color,other={}){let life=type==='text'?.85:type==='death'?.8:type==='blast'?.6:.25;this.effects.push({type,x,y,color,life,maxLife:life,...other});if(this.effects.length>200)this.effects.shift();}
 callout(text,x,y,color='#ffe3a0',key=text){
  this.calloutTimes??=new Map();if(this.time-(this.calloutTimes.get(key)??-100)<1.2)return;this.calloutTimes.set(key,this.time);
  const labels=this.effects.filter(f=>f.type==='text'&&f.label);if(labels.length>=4)this.effects.splice(this.effects.indexOf(labels[0]),1);
  const texts=this.effects.filter(f=>f.type==='text');if(texts.length>=28)this.effects.splice(this.effects.indexOf(texts.find(f=>!f.label)||texts[0]),1);this.fx('text',x,y,color,{text,label:true,life:1,maxLife:1});
 }
 hit(e,n,color,hero=null){
  if(e.hp<=0)return;e.hp-=n;e.flash=.12;e.damageHero=hero;
  // Coalesce rapid hits on one target. Visual limits never limit actual damage.
  const existing=this.effects.find(f=>f.type==='text'&&f.targetId===e.id&&this.time-f.at<.09);
  if(existing){existing.value+=n;existing.text=Math.round(existing.value).toString();}
  else{const texts=this.effects.filter(f=>f.type==='text');if(texts.length>=28)this.effects.splice(this.effects.indexOf(texts[0]),1);this.fx('text',e.x,e.y-24,color,{targetId:e.id,value:n,text:Math.round(n).toString(),at:this.time});}
 }
 launch(h,e,x,y,damage){
  const duration=clamp(Math.hypot(e.x-x,e.y-y)/(h.archetype==='gunner'?4200:h.archetype==='fire'?1900:2400),.045,.24);
  const projectile={hero:h.archetype,style:h.shotStyle,targetId:e.id,x,y,tx:e.x,ty:e.y,color:h.color,damage,radius:h.radius,burn:h.burn,slow:h.slow,remaining:duration,duration,empowered:h.archetype==='gunner'&&h.reloads>0&&h.reloads%3===0};
  this.projectiles??=[];this.projectiles.push(projectile);
  if(h.shotStyle!=='meteor')this.fx('muzzle',x,y,h.color,{hero:h.archetype,life:.1,maxLife:.1});this.fx('shot',x,y,h.color,{tx:e.x,ty:e.y,hero:h.archetype,life:duration,maxLife:duration,projectile});
 }
 updateProjectiles(dt){
  const pending=[];
  for(const p of this.projectiles||[]){
   const target=this.enemies.find(e=>e.id===p.targetId&&e.hp>0);
   if(target){p.tx=target.x;p.ty=target.y;}p.remaining-=dt;
   if(p.remaining>1e-8){pending.push(p);continue;}
   // Fire still lands at its last destination when another attack kills its target.
   if(p.hero==='fire'){
    for(const e of this.enemies)if(e.hp>0&&Math.hypot(e.x-p.tx,e.y-p.ty)<p.radius){this.hit(e,p.damage,p.color,p.hero);e.burn=p.style==='magma'?5:3;e.burnDmg=p.burn;}
    this.fx('blast',p.tx,p.ty,p.color,{radius:p.radius,hero:p.hero});this.shake=Math.max(this.shake,.13);
    this.scars.push({x:p.tx,y:p.ty,radius:p.radius/2,at:this.time});if(this.scars.length>25)this.scars.shift();
   }else if(target){
    const shatter=this.shatterCombo&&p.hero==='gunner'&&target.slow>0;this.hit(target,p.damage*(p.empowered?1.5:1)*(shatter?1.3:1)*(p.style==='void'&&target.hp<target.maxHp*.5?1.35:1),p.color,p.hero);if(shatter)this.callout('SHATTER +30%',p.tx,p.ty,'#bbddff','shatter');if(p.empowered)this.callout('POWER ×1.5',p.tx,p.ty,'#ffe592','empowered');
    if(p.style==='pierce'){const next=this.enemies.find(e=>e!==target&&e.hp>0&&e.y<target.y&&Math.abs(e.x-target.x)<40);if(next){this.hit(next,p.damage*.5,p.color,p.hero);this.fx('bolt',target.x,target.y,p.color,{tx:next.x,ty:next.y});this.callout('PIERCE',next.x,next.y,p.color,'pierce');}}if(p.style==='thorn'&&this.hp<this.maxHp){this.hp=Math.min(this.maxHp,this.hp+1);this.callout('+1 HP',90,555,p.color,'thorn-heal');}if(p.hero==='frost'){target.slow=2;target.slowAmount=p.slow;}
    this.fx('impact',p.tx,p.ty,p.color,{hero:p.hero,life:.2,maxLife:.2});
   }
   if(target||p.hero==='fire')this.emit('impact',{hero:p.hero});
  }
  this.projectiles=pending;
 }
 choose(index){if(this.state!=='upgrade'||!this.options[index])return false;const opt=this.options[index];opt.apply();if(opt.id==='team'||opt.id.startsWith('damage')){const h=this.team.find(h=>opt.who.includes(h.name));this.callout(opt.id==='team'?'+15% TEAM':'+25% POWER',h?90+this.team.indexOf(h)*105:250,555,opt.color,'power');}const log={title:opt.title,who:opt.who,kind:opt.kind,after:opt.after,desc:opt.desc};this.upgradeLog.push(log);for(const h of this.team)if(opt.who.includes(h.name)||opt.kind==='צוות')h.upgrades.push(log);this.emit('upgrade',{...log,recruit:opt.id.startsWith('recruit')});this.options=[];this.state='playing';this.checkLevel();return true;}
 checkLevel(){if(this.state!=='playing'||this.xp<this.nextXp)return;if(this.wave===10&&this.waveSpawn===this.spawnTotal&&this.enemies.length===0&&this.loot.length===0&&this.projectiles.length===0)return;this.xp-=this.nextXp;this.level++;this.nextXp=Math.round(this.nextXp*1.28+5);this.options=this.makeOptions();this.state='upgrade';this.emit('level');}
 makeOptions(){
  const list=[];const add=(id,title,who,kind,icon,before,after,desc,apply,color='#ffc36d')=>list.push({id,title,who,kind,icon,before,after,desc,apply,color});
  HEROES.forEach((h,i)=>{if(ownsHero(this.meta,h.id)&&!this.team.some(t=>t.id===h.id)&&this.team.length<4)add('recruit-'+h.id,'מצטרף כוח חדש',h.name+' · '+h.role,'גיוס',h.symbol,this.team.length+' גיבורים',(this.team.length+1)+' גיבורים',h.desc+' הגיבור יצטרף מיד לעמדה פנויה ויתקוף אוטומטית.',()=>this.addHero(i),h.color)});
  this.team.forEach(h=>{const suffix=h.id===h.archetype?'':'-'+h.id;
   add('damage-'+h.id,'עוצמת אש',h.name,'אישי',h.symbol,Math.round(h.damage)+' נזק',Math.round(h.damage*1.25)+' נזק','כל פגיעה של '+h.name+' תגרום ל־25% יותר נזק. יעיל במיוחד מול אויבים משוריינים והבוס.',()=>{h.damage*=1.25;h.rank++},h.color);
   add('speed-'+h.id,h.archetype==='gunner'?'טעינה זריזה':'קצב מוגבר',h.name,'אישי',h.symbol,(h.archetype==='gunner'?h.reload:h.interval).toFixed(2)+' שנ׳',((h.archetype==='gunner'?h.reload:h.interval)*.85).toFixed(2)+' שנ׳',h.archetype==='gunner'?'החלפת המחסנית תהיה קצרה ב־15%. פחות זמן ללא ירי ויותר לחץ על האויבים.':'הזמן בין המתקפות מתקצר ב־15%. היכולת המיוחדת שומרת על מחזור הטעינה שלה.',()=>{if(h.archetype==='gunner')h.reload=Math.max(.35,h.reload*.85);else h.interval=Math.max(.25,h.interval*.85);h.rank++},h.color);
   if(h.archetype==='fire')add('burn'+suffix,'להבה מתמשכת',h.name,'יכולת',h.symbol,h.burn+' נזק לשנייה',(h.burn+5)+' נזק לשנייה','השריפה נמשכת שלוש שניות אחרי פגיעה. השדרוג מגביר את נזק השריפה לכל אויב שנמצא בפיצוץ.',()=>{h.burn+=5;h.radius+=6;h.rank++},h.color);
   if(h.archetype==='electric'&&h.chain<6)add('chain'+suffix,'שרשרת מתח',h.name,'יכולת',h.symbol,h.chain+' מטרות',(h.chain+1)+' מטרות','הברק יקפוץ לאויב נוסף שנמצא בקרבת המטרה. כך פגיעה אחת מנקה קבוצה גדולה יותר.',()=>{h.chain++;h.rank++},h.color);
   if(h.archetype==='frost'&&h.slow<.72)add('slow'+suffix,'כפור עמוק',h.name,'יכולת',h.symbol,Math.round(h.slow*100)+'% האטה',Math.round((h.slow+.1)*100)+'% האטה','פגיעות קרח מאטות למשך שתי שניות. האטה חזקה יותר משאירה את האויבים חשופים לאש הצוות זמן רב יותר.',()=>{h.slow+=.1;h.rank++},h.color);
  });
  for(const kind of ['turret','frost']){const station=this.stations.find(s=>s.kind===kind),rank=station?.rank||0;if(rank<3)add('station-'+kind,rank?'שדרוג עמדה':'הקמת עמדת הגנה',kind==='turret'?'צריח גחלת':'עמוד כפור','הגנה',kind==='turret'?'✹':'❄','דרגה '+rank,'דרגה '+(rank+1),kind==='turret'?'צריח אוטומטי: 16 נזק בכל דרגה, ירי כל 1.4 שניות.':'עמוד תומך: 6 נזק בכל דרגה והאטה של 35% לשתי שניות, כל 1.8 שניות.',()=>{if(station)station.rank++;else this.stations.push({kind,rank:1,x:kind==='turret'?35:465,y:510,cd:0,color:kind==='turret'?'#ffba75':'#b9d9ff'});},kind==='turret'?'#ffba75':'#b9d9ff');}
  for(const h of this.team){const gadget=GADGETS[h.archetype],cap=h.mastery>=4?3:1;if(gadget&&h.mastery>=2&&h.gadgetRank<cap)add('gadget-'+h.id,gadget.name,h.name,'גאדג׳ט',h.symbol,'דרגה '+h.gadgetRank,'דרגה '+(h.gadgetRank+1),gadget.desc+' · שדרוג לריצה הזאת.',()=>{gadget.apply(h);h.gadgetRank++;h.rank++},h.color);}
  if(this.team.some(h=>h.archetype==='gunner')&&this.team.some(h=>h.archetype==='frost')&&!this.shatterCombo)add('shatter','שבירת קרח','קליעים + כפור','שילוב','❄','מתקפות נפרדות','30% נזק נוסף','קליעים שפוגעים באויב מואט גורמים ל־30% יותר נזק.',()=>this.shatterCombo=true,'#bbddff');
  add('team','חזית מאוחדת','כל הצוות','צוות','✦',Math.round(this.teamDamage*100)+'% עוצמה',Math.round(this.teamDamage*115)+'% עוצמה','כל הגיבורים יגרמו ל־15% יותר נזק בפגיעה ישירה. הבונוס חל גם על גיבורים שיגויסו בהמשך.',()=>this.teamDamage*=1.15,'#7ce6dc');
  add('wall','ביצור הגדר','הבית והגדר','בית','◇',Math.round(this.hp)+' / '+this.maxHp,Math.round(Math.min(this.maxHp+100,this.hp+180))+' / '+(this.maxHp+100),'ההגנה המרבית גדלה ב־100 ומתקבלים עד 180 חיים לתיקון. נותן מרווח נשימה כשהאויבים מגיעים לגדר.',()=>{const old=this.hp;this.maxHp+=100;this.hp=Math.min(this.maxHp,this.hp+180);this.callout('+'+Math.round(this.hp-old)+' HP',250,530,'#afffae','heal')},'#a5dba0');
  add('house','לב המצודה',this.house.name,'בית','⌂',Math.round(this.housePower*100)+'% יכולת',Math.round(this.housePower*130)+'% יכולת','מגן הגחלת סופג 30% יותר נזק בכל טעינה. המגן מופעל אוטומטית ומגן על חיי הגדר.',()=>this.housePower*=1.3,'#a5dba0');
  if(this.team.some(h=>h.archetype==='fire')&&this.team.some(h=>h.archetype==='electric')&&!this.chainCombo)add('combo','סערת גחלים',this.team.filter(h=>['fire','electric'].includes(h.archetype)).map(h=>h.name).join(' + '),'שילוב','✺','אש וברק נפרדים','פיצוץ משולב','ברק שפוגע באויב בוער יוצר פיצוץ נוסף סביבו. השילוב הופך קבוצות צפופות לתגובת שרשרת.',()=>this.chainCombo=true,'#ffacdf');
  for(let i=list.length-1;i>0;i--){let j=Math.floor(this.random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}
  let out=list.slice(0,3);const tactical=list.find(o=>this.level<=3?o.id.startsWith('station-'):o.kind==='שילוב'||o.kind==='גאדג׳ט');if(tactical&&!out.includes(tactical))out[0]=tactical;if(this.team.length===1){let recruit=list.find(o=>o.id.startsWith('recruit'));if(recruit&&!out.some(o=>o.id.startsWith('recruit')))out[2]=recruit;}return out;
 }
 spawn(){const boss=[3,6,10].includes(this.wave)&&this.waveSpawn===0;let r=this.random();let type=boss?3:this.wave>=4&&r<.24?2:this.wave>=2&&r<.45?1:0;const def=ENEMIES.get(this.map.enemyPool[type]);const hp=(type===3?def.hp*(this.wave===10?1100/210:this.wave===6?440/210:1):def.hp)*(1+(this.wave-1)*.17+Math.pow(this.wave-1,2)*.025);this.enemies.push({id:this.nextId++,type,definitionId:def.id,rig:def.rig,color:def.color,isBoss:boss,bossName:boss?(def.id==='forest-boss'?(this.wave===10?'שומר האבן':this.wave===6?'מנפץ החומות':def.name):def.name):null,x:boss?250:65+this.random()*370,y:-40-this.random()*40,hp,maxHp:hp,speed:def.speed,damage:type===3?(this.wave===10?28:def.damage):def.damage,attack:0,burn:0,burnDmg:0,slow:0,slowAmount:0,flash:0});this.waveSpawn++;if(boss)this.emit('boss',{name:this.enemies.at(-1).bossName});}
 attack(h,e){h.shots++;h.attackAnim=.22;this.emit('attack',{hero:h.archetype,pan:-.65+this.team.indexOf(h)*.43});const idx=this.team.indexOf(h),x=90+idx*105,y=555;let d=h.damage*this.teamDamage;
  if(h.archetype==='gunner'){this.shake=Math.max(this.shake,.015);this.launch(h,e,x,y,d);}
  if(h.archetype==='fire')this.launch(h,e,x,y,d);
  if(h.archetype==='electric'){let nearby=[e,...this.enemies.filter(t=>t!==e&&t.hp>0&&Math.hypot(t.x-e.x,t.y-e.y)<155).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))].slice(0,h.chain);if(nearby.length>1)this.callout('BOUNCE ×'+(nearby.length-1),nearby.at(-1).x,nearby.at(-1).y,h.color,'bounce');let px=x,py=y;for(const t of nearby){this.hit(t,d,h.color,h.archetype);this.fx('bolt',px,py,h.color,{tx:t.x,ty:t.y,hero:h.archetype,style:h.shotStyle});this.fx('impact',t.x,t.y,h.color,{hero:h.archetype,life:.18,maxLife:.18});px=t.x;py=t.y;if(t.burn>0&&this.chainCombo){this.callout('COMBO',t.x,t.y,'#ffacdf','combo');this.fx('blast',t.x,t.y,'#ffacdf',{radius:50,hero:'electric'});for(const q of this.enemies)if(Math.hypot(q.x-t.x,q.y-t.y)<50)this.hit(q,d*.35,'#ffacdf',h.archetype);}}}
  if(h.archetype==='frost')this.launch(h,e,x,y,d);
  if(h.mag){h.ammo--;if(h.ammo<=0){h.cd=h.reload;h.reloading=true;h.ammo=h.mag;h.reloads++;this.emit('reloadStart',{hero:h.id,pan:-.65+this.team.indexOf(h)*.43});}else h.cd=h.interval;}else h.cd=h.interval;
 }
 step(dt){if(this.state!=='playing')return;dt=clamp(dt,0,.1);this.time+=dt;this.shake=Math.max(0,this.shake-dt*.6);this.updateLoot(dt);this.effects=this.effects.filter(f=>(f.life-=dt)>0);
  if(this.intermission>0){this.intermission-=dt;if(this.intermission<=0){if(this.wave>=10){this.flushLoot();this.state='won';this.emit('end');return;}this.wave++;this.waveKills=0;this.waveSpawn=0;this.spawnTotal=7+this.wave*3;this.spawnTimer=0;this.emit('wave',{wave:this.wave});}}
  else {this.spawnTimer-=dt;if(this.waveSpawn<this.spawnTotal&&this.spawnTimer<=0){this.spawn();this.spawnTimer=this.wave===10?1.1:Math.max(.42,1.1-this.wave*.065);}if(this.waveSpawn===this.spawnTotal&&this.enemies.length===0&&this.loot.length===0&&this.projectiles.length===0){this.intermission=2.5;const bonus=10+this.wave*2;this.gold+=bonus;this.waveGold+=bonus;this.emit('waveReward',{coins:bonus});}}
  if(this.shield<=0)this.houseTimer+=dt;if(this.houseTimer>=this.houseCooldown){this.houseTimer=0;if(this.house.id==='fort'){this.shield=100*this.housePower;this.callout('+'+Math.round(this.shield)+' SHIELD',250,535,'#ffde93','shield');this.fx('shield',250,590,'#ffcc7b',{radius:230});}else{for(const e of this.enemies)this.hit(e,75*this.housePower,'#7ce6dc');this.fx('blast',250,330,'#7ce6dc',{radius:230});}this.emit('ability');}
  for(const e of this.enemies){e.flash=Math.max(0,e.flash-dt);if(e.hp>0&&e.burn>0){e.burn-=dt;e.hp-=e.burnDmg*dt;e.damageHero='fire';}if(e.slow>0)e.slow-=dt;e.y=Math.min(523,e.y+e.speed*(e.slow>0?1-e.slowAmount:1)*dt);}
  for(const h of this.team)if(this.enemies.some(e=>e.hp>0))h.activeSeconds+=dt;
  for(const s of this.stations){s.cd-=dt;const e=this.enemies.filter(e=>e.hp>0&&e.y>80).sort((a,b)=>b.y-a.y)[0];if(s.cd<=0&&e){s.cd=s.kind==='turret'?1.4:1.8;this.hit(e,(s.kind==='turret'?16:6)*s.rank,s.color);if(s.kind==='frost'){e.slow=2;e.slowAmount=Math.max(e.slowAmount||0,.35);}this.fx('bolt',s.x,s.y,s.color,{tx:e.x,ty:e.y});s.firedAt=this.time;}}
  this.updateProjectiles(dt);
  for(const e of this.enemies){if(e.y>=523&&e.hp>0){e.attack-=dt;if(e.attack<=0){let dmg=e.damage;let blocked=Math.min(dmg,this.shield);this.shield-=blocked;this.hp=Math.max(0,this.hp-(dmg-blocked));this.shake=Math.max(this.shake,.12);this.emit('wallHit',{blocked,dmg});e.attack=1.05;this.fx('blast',e.x,535,'#ff766e',{radius:18});}}}
  if(this.hp<=0){this.resolveDeaths();this.projectiles=[];this.flushLoot();this.state='lost';this.emit('end');return;}
  for(const h of this.team){h.attackAnim=Math.max(0,h.attackAnim-dt);h.cd-=dt;h.specialTimer+=dt;if(h.archetype==='frost'&&h.specialTimer>=h.specialCooldown){h.specialTimer=0;for(const e of this.enemies){e.slow=3;e.slowAmount=.95;}this.fx('blast',250,340,h.color,{radius:250,hero:'frost'});this.emit('special',{hero:'frost'});}if(h.cd<=0){if(h.reloading)this.emit('reloadEnd',{hero:h.id,pan:-.65+this.team.indexOf(h)*.43});h.reloading=false;let alive=this.enemies.filter(e=>e.hp>0&&e.y>0&&555-e.y<h.range);let t=alive.find(e=>e.id===this.target)||alive.sort((a,b)=>b.y-a.y)[0];if(t)this.attack(h,t);}}
  this.resolveDeaths();this.checkLevel();
 }
 resolveDeaths(){
  let dead=this.enemies.filter(e=>e.hp<=0);for(const e of dead){this.kills++;if(this.powerCharge===this.powerNeeded-1)this.emit('powerReady',{leader:true});this.powerCharge=Math.min(this.powerNeeded,this.powerCharge+1);for(const s of this.spells){if(s.charge===s.need-1)this.emit('powerReady',{name:s.name});s.charge=Math.min(s.need,s.charge+1);}this.waveKills++;if(e.isBoss)this.bossKills++;const xp=e.type===3?70:e.type===2?6:3,coins=e.type===3?(this.wave===10?50:25):1;this.loot.push({id:++this.lootId,x:e.x,y:e.y,xp,coins,keys:(this.kills%12===0?1:0)+(e.isBoss?3:0),age:0,flying:false});for(const h of this.team)h.runScore+=xp;const hero=e.damageHero||'gunner',color=HEROES.find(h=>h.id===hero)?.color||'#b1ca8a';this.fx('death',e.x,e.y,color,{radius:e.type===3?65:26,hero,life:.7,maxLife:.7});this.emit('death',{boss:!!e.isBoss,hero});if(e.isBoss){this.shake=.32;this.scars.push({x:e.x,y:e.y,radius:70,at:this.time});if(this.scars.length>25)this.scars.shift();}}this.enemies=this.enemies.filter(e=>e.hp>0);this.progress=this.spawnTotal?Math.min(1,this.waveKills/this.spawnTotal):0;if(!this.enemies.some(e=>e.id===this.target))this.target=null;
 }
 updateLoot(dt){for(const item of this.loot){item.age+=dt;if(item.age>=.35&&!item.flying){item.flying=true;this.emit('lootFlight',{...item});}if(item.age>=.85)this.collect(item);}this.loot=this.loot.filter(l=>!l.collected);}
 collect(item){if(item.collected)return;item.collected=true;this.xp+=item.xp;this.totalXp+=item.xp;this.gold+=item.coins;this.collectedCoins+=item.coins;this.keyFragments+=item.keys||0;if(item.keys)this.callout('+'+item.keys+' ⚿',item.x,item.y,'#ffe19a','key-drop');this.emit('lootCollected',{xp:item.xp,coins:item.coins,keys:item.keys||0});}
 flushLoot(){for(const item of this.loot)this.collect(item);this.loot=[];}

}
