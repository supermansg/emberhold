import {getPlayerScope,setPlayerScope,loadGameSave,readStored,writeStored,recordKey,applyStoredSnapshot} from './player-storage.js';
import {readRecord,normalizeRecord} from './player-record.js';
import {fetchCloud,writeCloud,validateSnapshot} from './cloud-save.js';
import {getAvatar,uploadAvatar} from './player-avatar.js';

// Public browser configuration; authorization is enforced by owner RLS.
const URL='https://agwdfotqgurlknuhnnup.supabase.co';
const KEY='sb_publishable__vxl-C1IndqJ_bdaCjDarg_nSv_PagY';
let sdkPromise;
function loadSDK(){
 if(!sdkPromise)sdkPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src='./vendor/supabase/supabase.js';script.onload=()=>resolve(globalThis.supabase);script.onerror=()=>{script.remove();sdkPromise=null;reject(Error('טעינת שירות החשבון נכשלה. אפשר להמשיך כאורח.'));};document.head.append(script);
 });return sdkPromise;
}
export function createAccountUI(api){
 const hosts=new Set();let client,user=null,busy=false,message='משחק כאורח · ההתקדמות נשמרת במכשיר הזה.',email='',choice=false,remote=null,subscription,disposed=false,avatarUrl=null;
 const metaKey=id=>`emberhold-sync-${id}`;
 const metadata=id=>readStored(metaKey(id))||{revision:0,dirty:false,pending:null};
 const storeMeta=(id,value)=>{if(!writeStored(metaKey(id),value))throw Error('אין מקום לשמירה בטוחה במכשיר.');};
 const snapshot=()=>({version:1,save:loadGameSave(),record:readRecord()});
 const assertIdle=()=>{if(api.isPlaying())throw Error('סיימו את הריצה לפני החלפת שמירה או חשבון.');};
 function status(text){message=text;render();}
 async function action(fn){if(busy)return;busy=true;render();try{await fn();}catch(e){message=e.message||'הפעולה נכשלה. נסו שוב.';}finally{busy=false;render();}}
 async function ready(){if(client)return client;const sdk=await loadSDK();client=sdk.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});subscription=client.auth.onAuthStateChange((event)=>{if(event==='SIGNED_IN'||event==='SIGNED_OUT')setTimeout(()=>{if(!busy&&!disposed)action(restore);},0);}).data.subscription;return client;}
 async function restore(){
  await ready();const {data,error}=await client.auth.getUser();
  if(error&&error.name!=='AuthSessionMissingError')throw error;
  if(!data?.user){if(user){assertIdle();setPlayerScope('guest');user=null;choice=false;api.applySave(loadGameSave());message='החיבור הסתיים. שמירת האורח פעילה.';}return;}
  assertIdle();if(user?.id===data.user.id&&getPlayerScope()===user.id)return;
  const loaded=await fetchCloud(client,data.user.id);assertIdle();
  user=data.user;remote=loaded;choice=true;message='החשבון אומת. בחרו את ההתקדמות שאיתה תרצו להמשיך. שמירת האורח תישאר במכשיר.';
 }
 async function selectSource(source){
  assertIdle();if(!user)throw Error('יש להתחבר מחדש.');
  // Re-read before any choice, so an old screen cannot silently replace a newer save.
  const id=user.id,loaded=await fetchCloud(client,id);assertIdle();if(user?.id!==id)throw Error('החשבון השתנה. נסו שוב.');remote=loaded;
  const meta=metadata(id);
  if(source!=='cloud'&&source!=='local'&&remote&&!writeStored(`emberhold-cloud-backup-${id}`,remote))throw Error('אין מקום לגיבוי הענן. הייבוא בוטל.');
  let selected;
  if(source==='cloud'){if(!remote)throw Error('אין עדיין שמירה בענן.');selected=validateSnapshot(remote.snapshot);}
  else if(source==='guest')selected={version:1,save:loadGameSave('guest'),record:normalizeRecord(readStored(recordKey('guest')))};
  else selected={version:1,save:loadGameSave(id),record:normalizeRecord(readStored(recordKey(id)))};
  // A local cache keeps its original base revision: retry/conflict handling must
  // never silently approve replacing a newer remote save.
  const nextMeta=source==='local'?meta:{revision:remote?.revision??0,dirty:source!=='cloud',pending:null};
  applyStoredSnapshot(selected,id);storeMeta(id,nextMeta);setPlayerScope(id);choice=false;
  api.applySave(selected.save);message=source==='cloud'?'שמירת הענן נטענה.':'ההתקדמות נבחרה ונשמרה במכשיר. לחצו סנכרון כדי לשמור בענן.';api.onAuthenticated?.();
  try{avatarUrl=await getAvatar(client,id);window.dispatchEvent(new Event('emberhold-avatar-change'));}catch{message+=' טעינת הדיוקן נכשלה. אפשר לנסות שוב.';}
 }
 async function sync(){
  if(!user||choice||getPlayerScope()!==user.id)throw Error('בחרו שמירה לפני סנכרון.');
  const id=user.id,meta=metadata(id);
  if(!meta.pending){meta.pending={id:crypto.randomUUID(),revision:meta.revision,snapshot:snapshot()};storeMeta(id,meta);}
  try{
   const sent=meta.pending,result=await writeCloud(client,id,sent);
   const current=snapshot();storeMeta(id,{revision:result.revision,pending:null,dirty:JSON.stringify(current)!==JSON.stringify(sent.snapshot)});
   message='ההתקדמות נשמרה בענן.';
  }catch(error){if(error.conflict){choice=true;message='התנגשות שמירות: בחרו ענן, או ייבוא מפורש. ההתקדמות המקומית מגובה ונשמרה.';}throw error;}
 }
 function changed(){if(!user||choice||getPlayerScope()!==user.id)return;try{const meta=metadata(user.id);meta.dirty=true;storeMeta(user.id,meta);message='יש התקדמות מקומית שטרם סונכרנה.';}catch(e){message=e.message;}render();}
 function button(host,label,fn){const b=document.createElement('button');b.type='button';b.className='secondary';b.textContent=label;b.disabled=busy;b.onclick=()=>action(fn);host.append(b);return b;}
 function render(){
  for(const host of hosts){if(!host.isConnected){hosts.delete(host);continue;}host.replaceChildren();
   const title=document.createElement('h2');title.textContent='החשבון שלכם';host.append(title);
   if(user){const identity=document.createElement('p');identity.textContent=user.email||'חשבון מחובר';identity.dir='ltr';host.append(identity);}
   const info=document.createElement('p');info.setAttribute('role','status');info.textContent=busy?'רגע, מתחברים…':message;host.append(info);
   if(user&&choice){
    if(remote)button(host,'טעינת הענן — החלפת השמירה הפעילה',()=>selectSource('cloud'));
    button(host,'המשך מהעותק המקומי של החשבון',()=>selectSource('local'));
    button(host,'החלפת הענן בעותק החשבון המקומי',async()=>{if(confirm('להחליף את כל שמירת הענן בעותק המקומי של החשבון? השמירה הקודמת תישמר בגיבוי מקומי.'))await selectSource('replace-local');});
    button(host,'ייבוא שמירת האורח לחשבון',async()=>{if(confirm('לייבא את שמירת האורח כולה לחשבון? אין חיבור או הכפלת מטבעות. הסנכרון הבא יחליף את הענן.'))await selectSource('guest');});
   }else if(user){button(host,'סנכרון עכשיו',sync);button(host,'בדיקת שמירה ממכשיר אחר',async()=>{assertIdle();remote=await fetchCloud(client,user.id);choice=true;message='בחרו שמירה. העותק המקומי נשמר עד לבחירה.';});}
   if(user&&!choice&&getPlayerScope()===user.id){
    const label=document.createElement('label');label.textContent='העלאת דיוקן אישי (PNG / JPG / WebP עד 2MB)';
    const file=document.createElement('input');file.type='file';file.accept='image/png,image/jpeg,image/webp';file.disabled=busy;
    file.onchange=()=>{const image=file.files[0];if(image)action(async()=>{assertIdle();const id=user.id;avatarUrl=await uploadAvatar(client,id,image,readRecord().identity);window.dispatchEvent(new Event('emberhold-avatar-change'));message='הדיוקן נשמר באחסון הפרטי שלכם.';});};label.append(file);host.append(label);
    if(avatarUrl){const img=document.createElement('img');img.src=avatarUrl;img.alt='הדיוקן האישי שלכם';img.width=img.height=72;img.style.borderRadius='50%';host.append(img);button(host,'שימוש בדיוקן הגיבור שנבחר',async()=>{const {error}=await client.from('player_profiles').update({avatar_kind:'hero',avatar_path:null}).eq('user_id',user.id);if(error)throw error;avatarUrl=null;window.dispatchEvent(new Event('emberhold-avatar-change'));message='דיוקן הגיבור פעיל.';});}
   }
   if(user)button(host,'יציאה מהחשבון',async()=>{assertIdle();if(!confirm('לצאת? התקדמות שלא סונכרנה תישאר בעותק המקומי של החשבון במכשיר הזה.'))return;const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;assertIdle();user=null;avatarUrl=null;choice=false;setPlayerScope('guest');api.applySave(loadGameSave());message='יצאתם מהחשבון. שמירת האורח פעילה.';});
   else{
    const form=document.createElement('form'),input=document.createElement('input');input.type='email';input.autocomplete='email';input.required=true;input.dir='ltr';input.className='profile-input';input.placeholder='you@example.com';input.setAttribute('aria-label','כתובת אימייל להתחברות');input.value=email;input.oninput=()=>{email=input.value;};
    const submit=document.createElement('button');submit.className='secondary';submit.textContent='שליחת קישור להתחברות / הרשמה';submit.disabled=busy;form.append(input,submit);
    form.onsubmit=e=>{e.preventDefault();action(async()=>{assertIdle();await ready();const {error}=await client.auth.signInWithOtp({email:input.value.trim(),options:{emailRedirectTo:location.origin+location.pathname}});if(error)throw error;message='הבקשה נשלחה. בדקו את האימייל ולחצו על הקישור. אם נשלח קוד, אפשר להזין אותו כאן.';});};host.append(form);
    const otp=document.createElement('input');otp.type='text';otp.inputMode='numeric';otp.autocomplete='one-time-code';otp.maxLength=10;otp.className='profile-input';otp.setAttribute('aria-label','קוד חד פעמי מהאימייל');otp.placeholder='קוד מהאימייל (אם התקבל)';host.append(otp);
    button(host,'אימות קוד',async()=>{assertIdle();await ready();const {error}=await client.auth.verifyOtp({email:email.trim(),token:otp.value.trim(),type:'email'});if(error)throw error;await restore();});
    button(host,'בדיקת חיבור מחדש',restore);
   }
  }
 }
 const online=()=>{if(user&&!choice)action(sync);};
 window.addEventListener('emberhold-save-change',changed);window.addEventListener('emberhold-record-change',changed);window.addEventListener('online',online);
 // Account loading is independent of guest entry and never blocks play.
 setTimeout(()=>{if(!disposed)action(restore);},0);
 return {mount(host){if(host){hosts.add(host);render();}},refresh:()=>action(restore),get user(){return user;},get avatarUrl(){return avatarUrl;},dispose(){disposed=true;subscription?.unsubscribe();window.removeEventListener('emberhold-save-change',changed);window.removeEventListener('emberhold-record-change',changed);window.removeEventListener('online',online);hosts.clear();}};
}
