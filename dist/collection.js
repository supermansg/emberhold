import {HEROES} from './content.js';
export const FREE_HERO_IDS=Object.freeze(['gunner','fire','electric','frost']);
export const SPELLS=Object.freeze([
 {id:'meteor',name:'מטר מטאורים',icon:'☄',color:'#ff9c6d',need:16,desc:'שלושה מטאורים: כל אחד גורם ל־80 נזק באזור הפגיעה. עוד 20 נזק בכל דרגה.'},
 {id:'blizzard',name:'טבעת סופה',icon:'❄',color:'#a8dcff',need:14,desc:'40 נזק לכל אויב גלוי והאטה של 75% לחמש שניות. עוד 15 נזק בכל דרגה.'},
 {id:'thunder',name:'רשת ברקים',icon:'ϟ',color:'#d0b7ff',need:18,desc:'110 נזק לעד שישה אויבים גלויים, מהמטרה המסומנת. עוד 25 נזק בכל דרגה.'},
 {id:'renewal',name:'פריחת חיים',icon:'✿',color:'#9febbb',need:20,desc:'תיקון של עד 120 נקודות הגנת בית. עוד 35 נקודות בכל דרגה.'}
]);
export const CHESTS=Object.freeze([
 {id:'rare',name:'Rare',label:'תיבה נדירה',cost:5,color:'#83cbff',heroCards:4,spellCards:3,rarities:['rare'],desc:'4 קלפי גיבור נדיר או התחלתי ו־3 קלפי מתקפה.'},
 {id:'epic',name:'Epic',label:'תיבה אפית',cost:12,color:'#c69cff',heroCards:10,spellCards:5,rarities:['rare','epic'],desc:'10 קלפי גיבור נדיר, אפי או התחלתי ו־5 קלפי מתקפה.'},
 {id:'legendary',name:'Legendary',label:'תיבה אגדית',cost:24,color:'#ffd47d',heroCards:24,spellCards:8,rarities:['rare','epic','legendary'],desc:'גיבור חדש מובטח כל עוד יש גיבור נעול, ו־8 קלפי מתקפה. כשכולם פתוחים: 24 קלפי גיבור.'}
]);
const number=v=>Number.isFinite(v)?Math.min(1e9,Math.max(0,Math.floor(v))):0;
const safeId=id=>/^[a-z][a-z0-9-]{0,47}$/.test(id);
export function migrateCollection(raw){const out={version:1,keys:number(raw?.keys),opened:number(raw?.opened),heroes:{},spells:{},loadout:[]};for(const kind of ['heroes','spells'])if(raw?.[kind]&&typeof raw[kind]==='object')for(const [id,r]of Object.entries(raw[kind]))if(safeId(id)&&r&&typeof r==='object')out[kind][id]={cards:number(r.cards),rank:Math.min(5,number(r.rank)),unlocked:r.unlocked===true};out.loadout=[...new Set(Array.isArray(raw?.loadout)?raw.loadout:[])].filter(id=>SPELLS.some(s=>s.id===id)&&out.spells[id]?.unlocked).slice(0,2);return out;}
export const ensureCollection=save=>save.collection??=(migrateCollection(null));
export function ownsHero(save,id){return FREE_HERO_IDS.includes(id)||save.collection?.heroes?.[id]?.unlocked===true;}
export function heroCardRank(save,id){return Math.min(5,save.collection?.heroes?.[id]?.rank||0);}
export function unlockCost(hero){return hero.unlockCards||({rare:8,epic:16,legendary:24}[hero.rarity]||8);}
export function grantCards(save,kind,id,amount){const c=ensureCollection(save),def=kind==='heroes'?HEROES.find(h=>h.id===id):SPELLS.find(s=>s.id===id);if(!def||!['heroes','spells'].includes(kind)||!Number.isInteger(amount)||amount<=0)throw Error('Invalid card reward');const r=c[kind][id]??={cards:0,rank:0,unlocked:kind==='heroes'&&FREE_HERO_IDS.includes(id)};r.cards+=amount;const cost=kind==='heroes'?unlockCost(def):3;let unlocked=false;if(!r.unlocked&&r.cards>=cost){r.cards-=cost;r.unlocked=true;unlocked=true;}return {kind,id,name:def.name,amount,unlocked,color:def.color};}
export function upgradeCards(save,kind,id){if(!['heroes','spells'].includes(kind))return false;const r=save.collection?.[kind]?.[id];if(!r?.unlocked||r.rank>=5||r.cards<(r.rank+1)*4)return false;r.cards-=(r.rank+1)*4;r.rank++;return true;}
export function toggleSpell(save,id){const c=ensureCollection(save);if(!SPELLS.some(s=>s.id===id)||!c.spells[id]?.unlocked)return false;if(c.loadout.includes(id)){c.loadout=c.loadout.filter(x=>x!==id);return true;}if(c.loadout.length>=2)return false;c.loadout.push(id);return true;}
export function openChest(save,id,random=Math.random){const def=CHESTS.find(c=>c.id===id),c=ensureCollection(save);if(!def||c.keys<def.cost)return null;const pool=HEROES.filter(h=>FREE_HERO_IDS.includes(h.id)||def.rarities.includes(h.rarity||'rare'));const locked=pool.filter(h=>!ownsHero(save,h.id));const pick=list=>list[Math.min(list.length-1,Math.max(0,Math.floor(random()*list.length)))];const hero=pick(id==='legendary'&&locked.length?locked:pool),spell=pick(SPELLS);if(!hero||!spell)return null;c.keys-=def.cost;c.opened++;const amount=id==='legendary'&&!ownsHero(save,hero.id)?Math.max(0,unlockCost(hero)-(c.heroes[hero.id]?.cards||0))+def.heroCards: def.heroCards;return {chest:id,rewards:[grantCards(save,'heroes',hero.id,amount),grantCards(save,'spells',spell.id,def.spellCards)]};}
