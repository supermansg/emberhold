import {HEROES} from './content.js';
import {ownsHero} from './collection.js';
import {getPlayerScope,recordKey,readStored,writeStored} from './player-storage.js';

const runs=new WeakMap();
const count=n=>Number.isFinite(n)?Math.min(1e9,Math.max(0,Math.floor(n))):0;
const defaults=()=>({version:1,trackedSince:new Date().toISOString(),identity:{displayName:'מגן הגחלת',avatar:'gunner'},stats:{started:0,runs:0,wins:0,losses:0,retired:0,kills:0,bosses:0,seconds:0,highestCompletedWave:0,bestKills:0,longestRun:0},history:[],achievements:[],seen:[]});
export const ACHIEVEMENTS=Object.freeze([
 {id:'first-defense',name:'הגחלת הראשונה',description:'השלמת גל ראשון'},
 {id:'boss-breaker',name:'שובר המצור',description:'הבסת בוס בריצה'},
 {id:'full-company',name:'כתף אל כתף',description:'גיוס צוות של ארבעה גיבורים'},
 {id:'hundred-foes',name:'מאה מול אחד',description:'100 חיסולים בריצה אחת'},
 {id:'forest-guardian',name:'שומר היער',description:'ניצחון בכל עשרת הגלים'}
]);
export function normalizeRecord(raw){
 if(raw&&raw.version!==1)throw Error('גרסת פרופיל חדשה יותר. הנתונים נשמרו ולא יוחלפו.');
 const out=defaults();if(!raw)return out;
 if(typeof raw.trackedSince==='string'&&Number.isFinite(Date.parse(raw.trackedSince)))out.trackedSince=raw.trackedSince;
 const name=typeof raw.identity?.displayName==='string'?raw.identity.displayName.trim().slice(0,32):'';
 if(name)out.identity.displayName=name;
 if(HEROES.some(h=>h.id===raw.identity?.avatar))out.identity.avatar=raw.identity.avatar;
 for(const key of Object.keys(out.stats))out.stats[key]=count(raw.stats?.[key]);out.stats.highestCompletedWave=Math.min(10,out.stats.highestCompletedWave);
 out.history=(Array.isArray(raw.history)?raw.history:[]).filter(r=>r&&typeof r.id==='string'&&['won','lost','retired'].includes(r.outcome)).slice(0,50).map(r=>({id:r.id.slice(0,64),at:typeof r.at==='string'?r.at:out.trackedSince,outcome:r.outcome,wave:Math.min(10,count(r.wave)),completedWave:Math.min(10,count(r.completedWave)),kills:count(r.kills),bosses:count(r.bosses),seconds:count(r.seconds),heroes:(Array.isArray(r.heroes)?r.heroes:[]).filter(id=>HEROES.some(h=>h.id===id)).slice(0,4)}));
 out.achievements=(Array.isArray(raw.achievements)?raw.achievements:[]).filter(a=>ACHIEVEMENTS.some(d=>d.id===a?.id)).map(a=>({id:a.id,at:typeof a.at==='string'?a.at:out.trackedSince}));
 out.seen=[...new Set([...(Array.isArray(raw.seen)?raw.seen:[]),...out.history.map(r=>r.id)])].filter(id=>typeof id==='string').slice(-512);return out;
}
export function readRecord(){return normalizeRecord(readStored(recordKey()));}
function persist(record){const ok=writeStored(recordKey(),record);if(ok)globalThis.dispatchEvent?.(new Event('emberhold-record-change'));return {ok,record,...(!ok?{error:'לא ניתן לשמור את הפרופיל במכשיר כרגע.'}:{})};}
export function updateIdentity({displayName,avatar},save){
 const record=readRecord(),name=String(displayName??record.identity.displayName).trim();
 if(name.length<2||name.length>32)return {ok:false,record,error:'השם צריך להכיל 2–32 תווים.'};
 const id=avatar??record.identity.avatar;if(!HEROES.some(h=>h.id===id)||!ownsHero(save,id))return {ok:false,record,error:'אפשר לבחור גיבור שנפתח באוסף שלכם.'};
 record.identity={displayName:name,avatar:id};return persist(record);
}
export function beginRun(game){
 if(runs.has(game))return runs.get(game).id;
 const id=globalThis.crypto.randomUUID(),record=readRecord(),run={id,scope:getPlayerScope(),settled:false,counted:false};runs.set(game,run);record.stats.started++;const result=persist(record);run.counted=result.ok;if(!result.ok)throw Error(result.error);return id;
}
export function recordRun(game){
 if(!['won','lost','retired'].includes(game.state))return {ok:false,error:'Run is not settled'};
 if(!runs.has(game))beginRun(game);const run=runs.get(game);
 if(run.scope!==getPlayerScope())return {ok:false,error:'Account changed during run'};
 const record=readRecord();if(run.settled||record.seen.includes(run.id))return {ok:true,record,duplicate:true};
 const cleared=game.state==='won'||(game.wave>0&&game.intermission>0&&game.waveSpawn===game.spawnTotal&&game.enemies.length===0&&game.loot.length===0&&game.projectiles.length===0);
 const summary={id:run.id,at:new Date().toISOString(),outcome:game.state,wave:count(game.wave),completedWave:Math.max(0,Math.min(10,game.state==='won'?10:game.wave-(cleared?0:1))),kills:count(game.kills),bosses:count(game.bossKills),seconds:count(game.time),heroes:game.team.map(h=>h.id)};
 const s=record.stats;if(!run.counted)s.started++;s.runs++;s[game.state==='won'?'wins':game.state==='lost'?'losses':'retired']++;s.kills+=summary.kills;s.bosses+=summary.bosses;s.seconds+=summary.seconds;s.highestCompletedWave=Math.max(s.highestCompletedWave,summary.completedWave);s.bestKills=Math.max(s.bestKills,summary.kills);s.longestRun=Math.max(s.longestRun,summary.seconds);
 record.history.unshift(summary);record.history.length=Math.min(50,record.history.length);record.seen.push(run.id);record.seen=record.seen.slice(-512);
 const checks={'first-defense':summary.completedWave>=1,'boss-breaker':summary.bosses>0,'full-company':summary.heroes.length>=4,'hundred-foes':summary.kills>=100,'forest-guardian':summary.outcome==='won'};
 for(const [id,earned]of Object.entries(checks))if(earned&&!record.achievements.some(a=>a.id===id))record.achievements.push({id,at:summary.at});
 const result=persist(record);if(result.ok)run.settled=true;return result;
}
