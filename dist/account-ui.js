import {getPlayerScope,setPlayerScope,loadGameSave,readStored,writeStored,gameSaveKey,recordKey,applyStoredSnapshot,blockPlayerScope} from './player-storage.js';
import {normalizeRecord} from './player-record.js';
import {fetchCloud,writeCloud,validateSnapshot} from './cloud-save.js';
import {getAvatar,uploadAvatar} from './player-avatar.js';
import {AUTH_STORAGE_KEY,createSessionStore} from './account-session.js';
import {reconcileAccount,sameProgress,createSaveQueue} from './account-sync.js';

// Public configuration; every server operation uses owner RLS.
const URL='https://agwdfotqgurlknuhnnup.supabase.co';
const KEY='sb_publishable__vxl-C1IndqJ_bdaCjDarg_nSv_PagY';
let sdkPromise;
function loadSDK(){
 if(!sdkPromise)sdkPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src='./vendor/supabase/supabase.js';
  script.onload=()=>resolve(globalThis.supabase);script.onerror=()=>{script.remove();sdkPromise=null;reject(Error('טעינת החשבון נכשלה. אפשר לנסות שוב או לשחק כאורח.'));};document.head.append(script);
 });return sdkPromise;
}
export function createAccountUI(api){
 const hosts=new Set();let client,sessionStore,user=null,busy=false,saving=false,verified=false,initializing=true,active=false;
 let message='בודקים את החיבור שלכם…',email='',code='',otpSent=false,remember=true,resendAt=0;
 let recovery=null,remote=null,subscription,disposed=false,avatarUrl=null,epoch=0,restoreRequested=false,deferred=false,blocked=false,loadFailed=false;
 const metaKey=id=>`emberhold-sync-${id}`;
 const metadata=id=>readStored(metaKey(id))||{revision:0,dirty:false,pending:null};
 const storeMeta=(id,value)=>{if(!writeStored(metaKey(id),value))throw Object.assign(Error('אין מקום לשמירה בטוחה במכשיר. לא הוחלפו נתונים.'),{fatal:true});};
 const snapshot=(id=getPlayerScope())=>({version:1,save:loadGameSave(id),record:normalizeRecord(readStored(recordKey(id)))});
 const cache=id=>readStored(gameSaveKey(id))===null?null:snapshot(id);
 const idle=()=>!api.isPlaying();
 function assertIdle(){if(!idle())throw Error('סיימו את הריצה לפני שינוי החשבון או ההתקדמות.');}
 function current(id,version,scope=false){return !disposed&&!blocked&&epoch===version&&user?.id===id&&(!scope||getPlayerScope()===id);}
 function assertCurrent(id,version,scope=false){if(!current(id,version,scope))throw Object.assign(Error('החשבון השתנה. הפעולה נעצרה בבטחה.'),{stale:true});}
 function notify(){render();api.onState?.({initializing,user,ready:active&&!!user&&getPlayerScope()===user.id&&!recovery&&!blocked,blocked,remember});}
 function errorMessage(error){return error?.message||'לא הצלחנו להתחבר כרגע. ההתקדמות נשמרת במכשיר.';}
 function metadataSafe(){try{return user?metadata(user.id):{};}catch{return {};}}
 const queue=createSaveQueue({canRun:()=>!disposed&&!busy&&!blocked&&verified&&!!user&&!recovery&&idle()&&navigator.onLine!==false,run:sync,onError:error=>{if(error.stale)return;if(error.fatal||error instanceof SyntaxError){recovery='error';message=errorMessage(error);}else if(!error.conflict)message='נשמר במכשיר. לא התקבל אישור מהחשבון. ננסה שוב בהמשך.';notify();}});
 async function action(fn){
  if(busy||disposed)return;busy=true;notify();
  try{await fn();}catch(error){if(!error.stale){initializing=false;if(fn===restore)loadFailed=true;message=errorMessage(error);}}
  finally{busy=false;notify();if(restoreRequested&&idle()){restoreRequested=false;setTimeout(()=>action(restore),0);}else if(user&&!recovery&&!blocked&&metadataSafe().dirty)queue.schedule();}
 }
 async function ready(){
  if(client)return client;sessionStore=createSessionStore();remember=sessionStore.remember;
  const sdk=await loadSDK();
  client=sdk.createClient(URL,KEY,{auth:{storage:sessionStore,storageKey:AUTH_STORAGE_KEY,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});
  subscription=client.auth.onAuthStateChange(event=>{
   if(!['SIGNED_IN','SIGNED_OUT','USER_UPDATED'].includes(event))return;
   epoch++;verified=false;queue.cancel();restoreRequested=true;
   if(event==='SIGNED_OUT'){avatarUrl=null;window.dispatchEvent(new Event('emberhold-avatar-change'));}
   setTimeout(()=>{if(!busy&&!saving&&idle()&&!disposed){restoreRequested=false;action(restore);}else if(!idle())deferred=true;},0);
  }).data.subscription;return client;
 }
 async function activate(selected,id,meta,text){
  assertIdle();if(blocked)throw Object.assign(Error('יש לטעון מחדש לאחר שינוי בלשונית אחרת.'),{stale:true});applyStoredSnapshot(selected,id);storeMeta(id,meta);setPlayerScope(id);recovery=null;
  api.applySave(selected.save);active=true;message=text;initializing=false;api.onAuthenticated?.();if(meta.dirty)queue.schedule();
 }
 async function refreshAvatar(id,version){
  try{const image=await getAvatar(client,id);if(!current(id,version,true))return;avatarUrl=image;window.dispatchEvent(new Event('emberhold-avatar-change'));}
  catch{if(current(id,version))message+=' הדיוקן ייטען בחיבור הבא.';}
 }
 async function restore(){
  if(blocked)return;
  await ready();const version=epoch;const {data,error}=await client.auth.getUser();
  if(epoch!==version||disposed){restoreRequested=true;return;}
  if(error&&error.name!=='AuthSessionMissingError'){
   // Cached identity enables only local offline play, never server writes.
   const serverDenied=error.status===401||error.status===403;
   const transportFailure=!serverDenied&&(error.name==='AuthRetryableFetchError'||error.name==='TypeError'||error.status===0||navigator.onLine===false);
   const {data:cached}=transportFailure?await client.auth.getSession():{data:null};if(epoch!==version)return;
   const session=cached?.session,id=session?.user?.id;
   if(id&&session.expires_at>Date.now()/1000&&cache(id)){
    if(!idle()){deferred=true;return;}user=session.user;verified=false;avatarUrl=null;
    await activate(snapshot(id),id,metadata(id),'מצב לא מקוון · ההתקדמות נשמרת במכשיר ותיבדק כשיחזור החיבור.');return;
   }
   if(!idle()){deferred=true;return;}
   const previous=getPlayerScope();user=null;active=false;verified=false;avatarUrl=null;recovery=null;queue.cancel();setPlayerScope('guest');
   if(previous!=='guest')api.applySave(loadGameSave());initializing=false;throw error;
  }
  if(!idle()){deferred=true;message='החשבון יתעדכן לאחר סיום הריצה.';return;}
  loadFailed=false;if(!data?.user){
   const previous=getPlayerScope();user=null;active=false;verified=false;recovery=null;avatarUrl=null;queue.cancel();setPlayerScope('guest');
   if(previous!=='guest')api.applySave(loadGameSave());initializing=false;message='שחקו עם החשבון שלכם ושמרו את הסיפור מכל מכשיר.';return;
  }
  const id=data.user.id;if(user?.id!==id)active=false;user=data.user;verified=true;avatarUrl=null;
  const loaded=await fetchCloud(client,id);assertCurrent(id,version);
  if(!idle()){deferred=true;initializing=false;message='החשבון יתעדכן לאחר סיום הריצה.';return;}remote=loaded;
  const local=cache(id),meta=metadata(id),decision=reconcileAccount({remote,local,meta});
  if(decision.kind==='conflict'){recovery='conflict';initializing=false;message='נמצאו שני עותקים שונים של ההתקדמות. שניהם נשמרו. בחרו עם איזה להמשיך.';return;}
  if(decision.kind==='cloud'){
   if(active&&getPlayerScope()===id&&sameProgress(local,remote.snapshot)){storeMeta(id,{revision:remote.revision,dirty:false,pending:null});recovery=null;initializing=false;message='ההתקדמות שלכם מעודכנת.';}
   else await activate(validateSnapshot(remote.snapshot),id,{revision:remote.revision,dirty:false,pending:null},'ההתקדמות שלכם מעודכנת.');
  }
  else if(decision.kind==='local')await activate(local,id,{...meta,revision:decision.revision,pending:decision.pending,dirty:true},'ההתקדמות נשמרה במכשיר וממתינה לאישור החשבון.');
  else{
   const guest=snapshot('guest'),empty=validateSnapshot({version:1,save:{},record:null}).save;
   const meaningful=!sameProgress({...guest,record:null},{version:1,save:empty,record:null})||guest.record.stats.runs>0;
   if(meaningful){recovery='claim';initializing=false;message='ברוכים הבאים. להמשיך עם ההתקדמות ששמורה במכשיר הזה?';return;}
   await activate(snapshot(id),id,{revision:0,dirty:true,pending:null},'החשבון מוכן. ההתקדמות תישמר אוטומטית.');
  }
  await refreshAvatar(id,version);
 }
 async function selectSource(source){
  assertIdle();if(!user)throw Error('יש להתחבר מחדש.');
  const id=user.id,version=epoch,expectedRevision=remote?.revision??0;
  const loaded=await fetchCloud(client,id);assertCurrent(id,version);assertIdle();
  if(source!=='cloud'&&(loaded?.revision??0)!==expectedRevision){remote=loaded;recovery='conflict';throw Error('ההתקדמות עודכנה בינתיים. בדקו שוב לפני הבחירה.');}
  remote=loaded;
  if(source!=='cloud'&&remote&&!writeStored(`emberhold-cloud-backup-${id}`,remote))throw Error('אין מקום לגיבוי. לא הוחלפו נתונים.');
  if(source==='cloud'&&!remote)throw Error('אין כרגע התקדמות בחשבון. אפשר לשחזר מהעותק שבמכשיר.');
  const selected=source==='cloud'?validateSnapshot(remote.snapshot):source==='guest'?snapshot('guest'):snapshot(id);
  await activate(selected,id,{revision:remote?.revision??0,dirty:source!=='cloud',pending:null},source==='cloud'?'ההתקדמות שלכם מעודכנת.':'נשמר במכשיר. שומרים כעת בחשבון…');
  await refreshAvatar(id,version);
 }
 async function sync(){
  if(!user||recovery||blocked||!verified||!idle())return;
  const id=user.id,version=epoch;assertCurrent(id,version,true);const meta=metadata(id);
  if(!meta.dirty&&!meta.pending)return;
  if(!meta.pending){meta.pending={id:crypto.randomUUID(),revision:meta.revision,snapshot:snapshot(id)};storeMeta(id,meta);}
  saving=true;message='נשמר במכשיר · שומרים בחשבון…';notify();
  try{
   const sent=meta.pending,result=await writeCloud(client,id,sent);assertCurrent(id,version,true);
   const dirty=!sameProgress(snapshot(id),sent.snapshot);storeMeta(id,{revision:result.revision,pending:null,dirty});remote=result;
   message=dirty?'נשמר במכשיר · משלימים את השמירה בחשבון…':'ההתקדמות שלכם מעודכנת.';if(dirty)queue.schedule();
  }catch(error){if(current(id,version)&&error.conflict){recovery='conflict';message='ההתקדמות השתנתה במכשיר אחר. שני העותקים נשמרו.';}throw error;}
  finally{saving=false;notify();if(restoreRequested&&idle()&&!busy){restoreRequested=false;setTimeout(()=>action(restore),0);}}
 }
 function changed(){
  if(deferred&&idle()){deferred=false;restoreRequested=true;if(!busy&&!saving){restoreRequested=false;void action(restore);}return;}
  if(!user||recovery||blocked||getPlayerScope()!==user.id)return;
  try{const meta=metadata(user.id);meta.dirty=true;storeMeta(user.id,meta);message='נשמר במכשיר · ממתין לשמירה בחשבון.';queue.schedule();}catch(error){message=errorMessage(error);}notify();
 }
 function button(host,label,fn,primary=false){const b=document.createElement('button');b.type='button';b.className=primary?'primary':'secondary';b.textContent=label;b.disabled=busy||saving;b.onclick=()=>action(fn);host.append(b);return b;}
 function paragraph(host,text){const p=document.createElement('p');p.textContent=text;host.append(p);return p;}
 async function sendCode(){
  assertIdle();if(Date.now()<resendAt)throw Error('המתינו רגע לפני שליחת קוד נוסף.');await ready();sessionStore.setRemember(remember);
  const {error}=await client.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:location.origin+location.pathname}});if(error)throw error;
  otpSent=true;code='';resendAt=Date.now()+60000;message='שלחנו קוד לאימייל. הזינו אותו כאן כדי להיכנס.';
 }
 async function verifyCode(){
  assertIdle();if(!/^\d{6,10}$/.test(code.trim()))throw Error('הזינו את הקוד שקיבלתם באימייל.');await ready();
  const {error}=await client.auth.verifyOtp({email:email.trim(),token:code.trim(),type:'email'});if(error)throw error;
  code='';otpSent=false;restoreRequested=false;await restore();
 }
 async function signout(){
  assertIdle();if(!confirm('לצאת מהחשבון במכשיר הזה? ההתקדמות שלא נשלחה תישמר כאן ותמשיך להסתנכרן בכניסה הבאה.'))return;
  queue.cancel();epoch++;const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;
  user=null;active=false;verified=false;avatarUrl=null;recovery=null;setPlayerScope('guest');api.applySave(loadGameSave());message='יצאתם מהחשבון. שמירת האורח נשארה במכשיר.';
 }
 function renderLogin(host){
  const form=document.createElement('form');form.className='account-login';
  const input=document.createElement('input');input.type='email';input.required=true;input.autocomplete='email';input.dir='ltr';input.className='profile-input';input.placeholder='you@example.com';input.setAttribute('aria-label','כתובת אימייל להתחברות');input.value=email;input.disabled=busy;input.oninput=()=>{email=input.value;};form.append(input);
  if(!otpSent){const label=document.createElement('label');label.className='account-remember';const check=document.createElement('input');check.type='checkbox';check.checked=remember;check.disabled=busy;check.onchange=()=>{remember=check.checked;};label.append(check,document.createTextNode('להישאר מחובר במכשיר הזה'));form.append(label);}
  else{input.readOnly=true;const token=document.createElement('input');token.type='text';token.inputMode='numeric';token.autocomplete='one-time-code';token.pattern='[0-9]{6,10}';token.maxLength=10;token.required=true;token.dir='ltr';token.className='profile-input account-code';token.setAttribute('aria-label','קוד הכניסה מהאימייל');token.value=code;token.oninput=()=>{code=token.value;};token.disabled=busy;form.append(token);}
  const submit=document.createElement('button');submit.className='primary';submit.textContent=otpSent?'כניסה למשחק':'שליחת קוד כניסה';submit.disabled=busy;form.append(submit);form.onsubmit=e=>{e.preventDefault();void action(otpSent?verifyCode:sendCode);};host.append(form);
  if(otpSent){button(host,'שליחת קוד נוסף',sendCode);button(host,'שינוי כתובת האימייל',()=>{otpSent=false;code='';});}
 }
 function renderSettings(host){
  const settings=document.createElement('details');settings.className='account-settings';const title=document.createElement('summary');title.textContent='הגדרות החשבון';settings.append(title);host.append(settings);
  const saveNow=button(settings,'בדיקה ושמירה עכשיו',()=>{});saveNow.onclick=()=>{if(!busy&&!saving)void queue.flush();};
  button(settings,'שחזור התקדמות מהמכשיר',async()=>{assertIdle();remote=await fetchCloud(client,user.id);recovery='advanced';message='החלפה תשמור גיבוי של ההתקדמות הקודמת. אין חיבור מטבעות בין שמירות.';});
  if(getPlayerScope()===user.id&&!recovery){
   const label=document.createElement('label');label.className='avatar-upload';label.textContent='דיוקן אישי · PNG / JPG / WebP עד 2MB';const file=document.createElement('input');file.type='file';file.accept='image/png,image/jpeg,image/webp';file.disabled=busy||saving;
   file.onchange=()=>{const image=file.files[0];if(image)void action(async()=>{assertIdle();const id=user.id,version=epoch;const url=await uploadAvatar(client,id,image,snapshot(id).record.identity);assertCurrent(id,version,true);avatarUrl=url;window.dispatchEvent(new Event('emberhold-avatar-change'));message='הדיוקן נשמר בחשבון שלכם.';});};label.append(file);settings.append(label);
   if(avatarUrl){const img=document.createElement('img');img.src=avatarUrl;img.alt='הדיוקן האישי שלכם';img.width=img.height=72;settings.append(img);button(settings,'שימוש בדיוקן הגיבור שנבחר',async()=>{const id=user.id,version=epoch;const {error}=await client.from('player_profiles').update({avatar_kind:'hero',avatar_path:null}).eq('user_id',id);if(error)throw error;assertCurrent(id,version,true);avatarUrl=null;window.dispatchEvent(new Event('emberhold-avatar-change'));message='דיוקן הגיבור פעיל.';});}
  }
  button(settings,'יציאה מהחשבון',signout);
 }
 function render(){
  for(const host of hosts){
   if(!host.isConnected){hosts.delete(host);continue;}const settingsOpen=!!host.querySelector('.account-settings')?.open;host.replaceChildren();const title=document.createElement('h2');title.textContent=user?'החשבון שלכם':'הסיפור שלכם מתחיל כאן';host.append(title);
   if(user){const identity=paragraph(host,user.email||'חשבון מחובר');identity.dir='ltr';}
   const status=paragraph(host,busy?'רגע, מתחברים…':message);status.setAttribute('role','status');status.setAttribute('aria-live','polite');
   if(initializing)continue;
   if(!user){renderLogin(host);if(loadFailed)button(host,'ניסיון חיבור נוסף',restore);continue;}
   if(blocked){button(host,'טעינה מחדש בטוחה',()=>location.reload(),true);continue;}
   if(recovery){
    if(recovery==='error')button(host,'בדיקה מחדש ללא החלפת נתונים',restore,true);
    else if(recovery==='claim'){button(host,'המשך עם ההתקדמות שבמכשיר',()=>selectSource('guest'),true);button(host,'התחלה חדשה בחשבון',()=>selectSource('local'));}
    else{if(remote)button(host,'שימוש בהתקדמות החשבון',()=>selectSource('cloud'),true);button(host,'המשך עם ההתקדמות שבמכשיר',async()=>{if(confirm('להמשיך עם העותק שבמכשיר ולהחליף את ההתקדמות בחשבון? העותק הקודם יישמר בגיבוי.'))await selectSource('local');});if(recovery==='advanced')button(host,'העברת התקדמות האורח לחשבון',async()=>{if(confirm('להחליף את התקדמות החשבון בהתקדמות האורח? יישמר גיבוי, ולא יחוברו מטבעות.'))await selectSource('guest');});}
   }
   if(!active&&!recovery)button(host,'ניסיון חיבור נוסף',restore,true);
   renderSettings(host);host.querySelector('.account-settings').open=settingsOpen;
  }
 }
 function online(){if(!busy&&!saving)void action(restore);else restoreRequested=true;}
 function blockStaleAccount(){if(!user||blocked)return;blocked=true;initializing=false;active=false;epoch++;blockPlayerScope(user.id);queue.cancel();message='החשבון פתוח גם בלשונית אחרת. טענו מחדש כאן לפני המשך כדי לשמור על ההתקדמות.';api.onBlocked?.();notify();}
 function externalStorage(event){if(!user||![gameSaveKey(user.id),recordKey(user.id)].includes(event.key)||event.oldValue===event.newValue)return;blockStaleAccount();}
 const visibility=()=>{if(document.visibilityState==='hidden'&&!busy)void queue.flush();};
 window.addEventListener('emberhold-save-change',changed);window.addEventListener('emberhold-record-change',changed);window.addEventListener('online',online);window.addEventListener('storage',externalStorage);window.addEventListener('emberhold-account-stale',blockStaleAccount);document.addEventListener('visibilitychange',visibility);
 setTimeout(()=>{if(!disposed)void action(restore);},0);
 return {mount(host){if(host){hosts.add(host);render();}},refresh:()=>action(restore),get user(){return user;},get avatarUrl(){return avatarUrl;},get initializing(){return initializing;},dispose(){disposed=true;epoch++;queue.dispose();subscription?.unsubscribe();window.removeEventListener('emberhold-save-change',changed);window.removeEventListener('emberhold-record-change',changed);window.removeEventListener('online',online);window.removeEventListener('storage',externalStorage);window.removeEventListener('emberhold-account-stale',blockStaleAccount);document.removeEventListener('visibilitychange',visibility);hosts.clear();}};
}
