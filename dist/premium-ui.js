import {createAccountUI} from './account-ui.js';
import {HEROES} from './content.js';
import {ownsHero,unlockCost} from './collection.js';
import {careerProgress,heroProgress} from './progression.js';
import {readRecord,updateIdentity,ACHIEVEMENTS} from './player-record.js';
export const SHARE_URL='https://emberhold-five.vercel.app/';
export async function shareGame({navigator:nav=globalThis.navigator,manual=()=>{},notify=()=>{}}={}){
 const data={title:'EMBERHOLD · שומרי הגחלת',text:'בית אחד. צוות משלכם. בואו להגן על המצודה איתי ב־EMBERHOLD!',url:SHARE_URL};
 if(nav.share&&(!nav.canShare||nav.canShare(data))){try{await nav.share(data);return 'shared';}catch(e){if(e.name==='AbortError')return 'cancelled';}}
 try{if(!nav.clipboard?.writeText)throw Error('unavailable');await nav.clipboard.writeText(data.text+' '+SHARE_URL);notify('הקישור הועתק. נתראה במצודה!');return 'copied';}catch{manual(SHARE_URL);return 'manual';}
}
const $=id=>document.getElementById(id),num=v=>Math.floor(Number(v)||0).toLocaleString('he-IL');

export function createPremiumUI(api){
 const account=createAccountUI({getSave:api.getSave,applySave:api.applySave,isPlaying:api.isInRun,toast:api.toast,onBlocked:api.onAccountBlocked,onState:state=>{
  const guest=$('guestEntry');guest.textContent=state.ready?'כניסה לעולם שלכם':'המשך כאורח';guest.classList.toggle('primary',state.ready);guest.classList.toggle('secondary',!state.ready);
  if(state.initializing){$('app').inert=true;return;}
  if(visited&&!state.user&&!entering)finishEntry();
  if(state.user&&!state.ready&&!state.blocked&&!api.isInRun()&&$('welcome').classList.contains('hidden'))welcome();
  $('app').inert=!$('welcome').classList.contains('hidden');
 },onAuthenticated:()=>{if(!$('welcome').classList.contains('hidden'))enter();}});
 account.mount($('welcomeAuth'));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let entering=false,timer,sharing=false;
 function finishEntry(){clearTimeout(timer);entering=false;api.getRenderer()?.skipWorldEntry?.();$('welcome').classList.add('hidden');document.body.classList.remove('at-gate','entering-world');$('app').inert=false;try{localStorage.setItem('emberhold-world-entered','1');}catch{}$('start').focus();}
 function enter(){if(entering)return;entering=true;api.unlockAudio();document.body.classList.add('entering-world');if(!reduced.matches)api.getRenderer()?.beginWorldEntry?.(1800);timer=setTimeout(finishEntry,reduced.matches?0:1800);}
 function welcome(){api.showHome();account.mount($('welcomeAuth'));$('welcome').classList.remove('hidden');document.body.classList.add('at-gate');$('app').inert=true;const heading=$('welcome').querySelector('h1');heading.tabIndex=-1;heading.focus({preventScroll:true});}
 $('guestEntry').onclick=enter;$('skipEntry').onclick=finishEntry;$('replayEntry').onclick=welcome;
 $('welcome').addEventListener('keydown',e=>{if(e.key==='Escape')finishEntry();if(e.key==='Tab'){const items=[...$('welcome').querySelectorAll('button,input,a')].filter(el=>!el.disabled&&el.offsetParent);if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0].focus();}}});
 let visited=false;try{visited=localStorage.getItem('emberhold-world-entered')==='1';}catch{}welcome();
 async function share(){if(sharing)return;sharing=true;try{await shareGame({notify:api.toast,manual:url=>{api.openModal('<section class="modal simple-modal"><h2>הזמינו חברים למצודה</h2><p>אפשר להעתיק את הקישור ולשלוח בכל דרך שנוחה לכם.</p><input id="shareLink" class="profile-input" aria-label="קישור למשחק" dir="ltr" readonly><button id="shareClose" class="primary">סיום</button></section>');$('shareLink').value=url;$('shareLink').select();$('shareClose').onclick=api.closeModal;}});}finally{sharing=false;}}
 $('shareGame').onclick=share;
 function profile(){if(api.isInRun())return;let record;try{record=readRecord();}catch{api.toast('לא ניתן לקרוא את הפרופיל. הנתונים הקיימים נשמרו ללא שינוי.');return;}api.showHome();$('lobby').classList.add('hidden');$('profile').classList.remove('hidden');document.querySelectorAll('[data-page]').forEach(b=>b.setAttribute('aria-current','false'));
 const save=api.getSave(),r=record,s=r.stats,owned=HEROES.filter(h=>ownsHero(save,h.id)),rank=careerProgress(save.careerXp),avatar=Math.max(0,HEROES.findIndex(h=>h.id===r.identity.avatar));
 const stats=[['ריצות',s.runs],['ניצחונות',s.wins],['הפסדים',s.losses],['חזרה יזומה',s.retired],['גל שהושלם',s.highestCompletedWave],['שיא חיסולים',s.bestKills]];
 $('profile').innerHTML=`<div class="profile-heading"><button id="profileBack" class="iconbtn" aria-label="חזרה לבית">→</button><div><span class="eyebrow">הסיפור שלכם במצודה</span><h1>תעודת שומר</h1></div><button id="profileShare" class="secondary">↗ שיתוף</button></div><section class="profile-identity premium-panel"><div class="profile-avatar">${api.portrait(avatar)}</div><div><span class="eyebrow">רמת מפקד ${rank.level}</span><h2 id="profileName"></h2><p>הגחלת מתחזקת עם כל חזרה הביתה.</p></div><form id="identityForm"><label for="displayName">שם השומר</label><div class="identity-fields"><input class="profile-input" id="displayName" maxlength="32" required autocomplete="nickname"><button class="primary" type="submit">שמירה</button></div><p id="identityStatus" role="status"></p></form><details class="avatar-picker"><summary>בחירת דיוקן · ${owned.length} גיבורים זמינים</summary><div class="avatar-grid">${owned.map(h=>`<button data-avatar="${h.id}" aria-pressed="${h.id===r.identity.avatar}" aria-label="דיוקן ${h.name}">${api.portrait(HEROES.indexOf(h))}<span>${h.name}</span></button>`).join('')}</div></details></section><div class="profile-stats">${stats.map(([label,value])=>`<article class="premium-panel"><b>${num(value)}</b><span>${label}</span></article>`).join('')}</div><p class="tracking-note">הנתונים נספרים מאז תחילת המעקב בגרסה זו. ריצות קודמות אינן משוחזרות. שיא הגל הוותיק שהגעתם אליו: ${save.best}/10.</p><section class="premium-panel"><h2>הצוות שלכם <small>${owned.length} / ${HEROES.length}</small></h2><div class="profile-roster">${HEROES.map((h,i)=>{const own=ownsHero(save,h.id),p=heroProgress(save,h.id);return `<button class="profile-hero ${own?'':'locked'}" data-profilehero="${i}" style="--accent:${h.color}">${api.portrait(i)}<b>${h.name}</b><small>${own?'רמה '+p.level:'נעול · '+(save.collection?.heroes?.[h.id]?.cards||0)+'/'+unlockCost(h)+' קלפים'}</small></button>`;}).join('')}</div></section><div class="profile-columns"><section class="premium-panel"><h2>הסיפורים האחרונים</h2><div class="run-history">${r.history.length?r.history.slice(0,10).map(run=>`<article><span class="run-outcome">${run.outcome==='won'?'✦ ניצחון':run.outcome==='retired'?'◇ חזרה הביתה':'הגנה אחרונה'}</span><b>גל ${num(run.wave)} · ${num(run.kills)} חיסולים</b><small>${new Date(run.at).toLocaleDateString('he-IL')} · ${Math.floor(run.seconds/60)}:${String(Math.floor(run.seconds%60)).padStart(2,'0')} דקות</small></article>`).join(''):'<p class="empty-message">הסיפור הראשון עוד לפניכם.<br>סיימו ריצה והיא תופיע כאן.</p>'}</div></section><section class="premium-panel"><h2>אותות הגבורה</h2><div class="achievement-list">${ACHIEVEMENTS.map(({id,name,description})=>`<article class="${r.achievements.some(a=>a.id===id)?'earned':'pending'}"><span aria-hidden="true">${r.achievements.some(a=>a.id===id)?'✦':'◇'}</span><div><b>${name}</b><small>${r.achievements.some(a=>a.id===id)?'הושג':description}</small></div></article>`).join('')}</div></section></div><section class="premium-panel" id="profileAccount"><h2>החשבון שלכם</h2><p>משחק כאורח · ההתקדמות נשמרת במכשיר הזה.</p></section>`;
 $('profileName').textContent=r.identity.displayName;$('displayName').value=r.identity.displayName;
 $('profileBack').onclick=()=>{api.showHome();$('openProfile').focus();};$('profileShare').onclick=share;
 $('identityForm').onsubmit=e=>{e.preventDefault();const result=updateIdentity({displayName:$('displayName').value,avatar:r.identity.avatar},save);$('identityStatus').textContent=result.ok?'השם נשמר.':result.error||'השמירה נכשלה. נסו שוב.';if(result.ok)$('profileName').textContent=result.record.identity.displayName;};
 document.querySelectorAll('[data-avatar]').forEach(b=>b.onclick=()=>{const result=updateIdentity({displayName:readRecord().identity.displayName,avatar:b.dataset.avatar},save);if(result.ok){profile();$('profile').querySelector('details').open=true;}else api.toast(result.error||'לא ניתן לשמור את הדיוקן');});
 document.querySelectorAll('[data-profilehero]').forEach(b=>b.onclick=()=>api.navigate('heroes'));
 account.mount($('profileAccount'));refreshAvatar();window.scrollTo(0,0);$('profileBack').focus();
 }
 function refreshAvatar(){const host=document.querySelector('.profile-avatar');if(!host)return;if(account.avatarUrl){const img=document.createElement('img');img.src=account.avatarUrl;img.alt='הדיוקן שלכם';img.width=img.height=104;host.replaceChildren(img);}else{const index=Math.max(0,HEROES.findIndex(h=>h.id===readRecord().identity.avatar));host.innerHTML=api.portrait(index);}}
 window.addEventListener('emberhold-avatar-change',refreshAvatar);
 $('openProfile').onclick=profile;
 window.addEventListener('emberhold:authenticated',()=>{api.toast('ברוכים הבאים. החשבון מחובר.');if(!$('welcome').classList.contains('hidden'))enter();});
 return {profile,enter,welcome,finishEntry};
}
