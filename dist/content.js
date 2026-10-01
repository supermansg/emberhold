// Authored content definitions. No remote code, eval or automatic photo-to-3D conversion.
export const CONTENT_VERSION=1;
export const HEROES=[],ENEMIES=new Map(),MAPS=new Map();
const styles=['gunner','fire','electric','frost'];
const id=v=>typeof v==='string'&&/^[a-z][a-z0-9-]{0,47}$/.test(v);
const text=v=>typeof v==='string'&&v.length>0&&v.length<500&&!/[<>"&]/.test(v);
const positive=v=>Number.isFinite(v)&&v>0;
const color=v=>/^#[0-9a-f]{6}$/i.test(v);
const asset=v=>v===null||(typeof v==='string'&&/^assets\/[a-zA-Z0-9_/-]+\.(webp|png|jpg)$/.test(v)&&!v.includes('..'));
export function registerHero(def){
 if(!id(def.id)||HEROES.some(h=>h.id===def.id)||!styles.includes(def.archetype)||![def.name,def.role,def.desc,def.weapon,def.special].every(text)||!color(def.color)||!positive(def.damage)||!positive(def.interval)||!positive(def.range)||!asset(def.portrait??null)||!Number.isInteger(def.rig)||def.rig<0||def.rig>3||!text(def.symbol))throw new Error('Invalid hero definition: '+def.id);
 if(def.archetype==='gunner'&&(!Number.isInteger(def.mag)||def.mag<1||!positive(def.reload)))throw new Error('Gunner requires magazine/reload');
 for(const key of ['radius','burn','chain','specialCooldown'])if(def[key]!==undefined&&!positive(def[key]))throw new Error('Invalid ability value');
 if(def.slow!==undefined&&(!positive(def.slow)||def.slow>.9))throw new Error('Invalid slow value');
 if(def.chain!==undefined&&(!Number.isInteger(def.chain)||def.chain>6))throw new Error('Invalid chain count');
 if(def.trainingKey&&!['gpower','fpower','epower','ipower'].includes(def.trainingKey))throw new Error('Training key requires a save migration');
 if(def.visual&&!id(def.visual))throw new Error('Invalid visual id');
 if(def.rarity&&!['rare','epic','legendary'].includes(def.rarity))throw new Error('Invalid hero rarity');
 const entry=Object.freeze({...def,portrait:def.portrait??null});HEROES.push(entry);return entry;
}
export function registerEnemy(def){
 if(!id(def.id)||ENEMIES.has(def.id)||!text(def.name)||!positive(def.hp)||!positive(def.speed)||!positive(def.damage)||!color(def.color)||!Number.isInteger(def.rig)||def.rig<0||def.rig>3)throw new Error('Invalid enemy definition: '+def.id);
 if(def.visual&&!id(def.visual))throw new Error('Invalid visual id');
 ENEMIES.set(def.id,Object.freeze({...def}));return ENEMIES.get(def.id);
}
export function registerMap(def){
 if(!id(def.id)||MAPS.has(def.id)||!text(def.name)||!id(def.renderer)||!Array.isArray(def.enemyPool)||def.enemyPool.length!==4||!def.enemyPool.every(v=>ENEMIES.has(v)))throw new Error('Invalid map definition: '+def.id);
 MAPS.set(def.id,Object.freeze({...def,enemyPool:Object.freeze([...def.enemyPool])}));return MAPS.get(def.id);
}
const initialHeroes = [
 {id:'gunner',name:'בראס',role:'התותחן',color:'#ffc36d',symbol:'✦',damage:17,interval:.24,mag:9,reload:1.7,range:590,desc:'ירי מהיר וממוקד. מטח מוגבר בכל טעינה שלישית.'},
 {id:'fire',name:'אמבר',role:'הפירומנית',color:'#ff806c',symbol:'✹',damage:32,interval:1.25,range:590,desc:'כדורי אש מתפוצצים. שריפה ממשיכה לפגוע גם אחרי הפגיעה.'},
 {id:'electric',name:'וולט',role:'מהנדס החשמל',color:'#7ce6dc',symbol:'ϟ',damage:22,interval:.9,range:590,desc:'ברק קופץ בין אויבים. מצוין לפירוק קבוצות צפופות.'},
 {id:'frost',name:'נובה',role:'שומרת הכפור',color:'#c2b4ff',symbol:'❄',damage:24,interval:1.05,range:590,desc:'קליעי קרח מאטים אויבים. גל הקפאה אוטומטי בכל 14 שניות.'}
];

const weapons=['תותח מחסנית כפול','כפפות אש','מטה סלילים','מטה גבישי קרח'];
const specials=['מטח מוגבר בכל טעינה שלישית','פיצוץ ושריפה מתמשכת','ברק שקופץ בין אויבים','גל הקפאה בכל 14 שניות'];
initialHeroes.forEach((h,i)=>registerHero({...h,archetype:h.id,rig:i,weapon:weapons[i],special:specials[i],trainingKey:['gpower','fpower','epower','ipower'][i]}));
[
 {id:'forest-grunt',name:'שדון היער',hp:55,speed:31,damage:7,color:'#83a952',rig:0},
 {id:'forest-runner',name:'רץ הגחלת',hp:40,speed:49,damage:7,color:'#c35e4e',rig:1},
 {id:'forest-armored',name:'שומר משוריין',hp:155,speed:23,damage:13,color:'#89719e',rig:2},
 {id:'forest-boss',name:'שומר היער',hp:210,speed:19,damage:15,color:'#555d68',rig:3}
].forEach(registerEnemy);
registerMap({id:'forest',name:'יער הגחלת',renderer:'forest',enemyPool:['forest-grunt','forest-runner','forest-armored','forest-boss']});

export const TACTICAL_POWERS=Object.freeze({
 gunner:{name:'מטח פלדה',desc:'שלושה מטחים של 200% נזק לעד שלוש מטרות. מיקוד ידני מקבל עדיפות.'},
 fire:{name:'לב התופת',desc:'כדור אש של 200% נזק עם רדיוס פיצוץ כפול ושריפה כפולה.'},
 electric:{name:'פריקת סערה',desc:'ברק של 200% נזק קופץ לעד חמש מטרות סביב האויב המסומן.'},
 frost:{name:'חורף פתאומי',desc:'כל האויבים הגלויים סופגים נזק ומואטים ב־85% לחמש שניות.'}
});

// Additional heroes start locked. Existing four are the only free starter IDs.
[
 {id:'sol',name:'סול',role:'צלף השמש',archetype:'gunner',rig:0,color:'#f6d17c',symbol:'☀',damage:42,interval:.7,mag:4,reload:2.1,range:650,weapon:'רובה שמש חודר',special:'פגיעה נוספת מאחורי המטרה',desc:'קליעים חודרים פוגעים באויב נוסף בקו הירי בחצי נזק.',rarity:'rare',shotStyle:'pierce',look:'solar'},
 {id:'briar',name:'ברייר',role:'שומרת השורשים',archetype:'frost',rig:3,color:'#97d6a0',symbol:'✿',damage:20,interval:1.1,range:590,slow:.32,weapon:'מטה קוצים חיים',special:'כל פגיעה מתקנת נקודת הגנה',desc:'קוצים מאטים אויבים ומתקנים נקודת הגנת בית בפגיעה ישירה.',rarity:'rare',shotStyle:'thorn',look:'grove'},
 {id:'cinder',name:'סינדר',role:'נפח המגמה',archetype:'fire',rig:1,color:'#fa9d50',symbol:'◆',damage:40,interval:1.65,range:590,radius:72,burn:8,weapon:'כדורי מגמה',special:'שריפה שנמשכת חמש שניות',desc:'כדורי מגמה כבדים מתפוצצים ומשאירים שריפה ממושכת.',rarity:'epic',shotStyle:'magma',look:'forge'},
 {id:'prism',name:'פריזמה',role:'קוסמת המראות',archetype:'electric',rig:2,color:'#ed9ede',symbol:'✧',damage:19,interval:1,range:590,chain:3,weapon:'מטה אור מפוצל',special:'שלוש מטרות בכל שרשרת בסיסית',desc:'קרני אור ורודות מתפצלות לשרשרת של שלוש מטרות.',rarity:'epic',shotStyle:'prism',look:'prism'},
 {id:'umbra',name:'אומברה',role:'צייד הצללים',archetype:'gunner',rig:0,color:'#b4a3f2',symbol:'◈',damage:26,interval:.4,mag:6,reload:1.8,range:620,weapon:'תותח חלל',special:'35% נזק נוסף לאויב מתחת לחצי חיים',desc:'קליעי חלל מסיימים אויבים פצועים עם תוספת נזק אמיתית.',rarity:'legendary',shotStyle:'void',look:'void'},
 {id:'aurora',name:'אורורה',role:'מלכת הקוטב',archetype:'frost',rig:3,color:'#a2e9f2',symbol:'❆',damage:33,interval:1.2,range:610,slow:.55,specialCooldown:11,weapon:'חנית זוהר צפוני',special:'הקפאה אוטומטית בכל 11 שניות',desc:'חניתות קרח עוצמתיות והקפאה קבוצתית בתדירות גבוהה.',rarity:'legendary',shotStyle:'aurora',look:'aurora'}
].forEach(registerHero);
