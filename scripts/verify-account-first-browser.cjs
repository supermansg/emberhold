// Isolated browser controller tests with explicit fake Auth/network, not live OTP.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const A='11111111-1111-4111-8111-111111111111';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true});
 try{
  const page=await browser.newPage();
  await page.route('**/__accountfirst',r=>r.fulfill({contentType:'text/html',body:'<div id="account"></div>'}));
  await page.route('**/vendor/supabase/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:`
   window.fixture=window.fixture||{user:{id:'${A}',email:'test@example.invalid'},remote:null,playing:false,apply:[],writes:0,callback:null,opts:null,fail:false,hold:false,release:null};
   window.supabase=window.supabase||{createClient:(url,key,opts)=>{fixture.opts=opts;return {auth:{getUser:async()=>({data:{user:fixture.user}}),getSession:async()=>({data:{session:null}}),onAuthStateChange:cb=>{fixture.callback=cb;return{data:{subscription:{unsubscribe(){}}}}},signOut:async()=>{fixture.user=null;fixture.callback('SIGNED_OUT',null);return{};},signInWithOtp:async arg=>{fixture.email=arg;return{};},verifyOtp:async arg=>{fixture.code=arg;fixture.user={id:'${A}',email:'test@example.invalid'};fixture.callback('SIGNED_IN',{user:fixture.user});return{data:{user:fixture.user}};}},from:table=>{const q={write:null,filters:[],select:()=>q,eq:(k,v)=>{q.filters.push([k,v]);return q;},maybeSingle:async()=>({data:table==='player_progress'?fixture.remote:null}),update:row=>{q.write={...row,user_id:'${A}'};return q;},insert:row=>{q.write=row;return q;},then:async resolve=>{if(fixture.hold){fixture.hold=false;await new Promise(r=>fixture.release=r);}if(fixture.fail)return resolve({error:{message:'network unavailable'}});if(q.write){const rev=q.filters.find(([k])=>k==='revision');if(rev&&fixture.remote?.revision!==rev[1])return resolve({data:[]});fixture.remote=q.write;fixture.writes++;}resolve({data:q.write?[fixture.remote]:[]});}};return q;}}}};
  `}));
  async function setup({remoteCoins=null,dirty=false,guest=777,readError=false,offline=false,holdRead=false,denied=false}={}){
   await page.goto('http://127.0.0.1:4174/__accountfirst');
   await page.addScriptTag({url:'http://127.0.0.1:4174/vendor/supabase/supabase.js'});
   await page.evaluate(async({remoteCoins,dirty,guest,readError,offline,holdRead,denied,A})=>{
    const [{createAccountUI},s,{normalizeRecord}]=await Promise.all([import('./account-ui.js'),import('./player-storage.js'),import('./player-record.js')]);window.storage=s;
    localStorage.clear();sessionStorage.clear();s.setPlayerScope('guest');localStorage.setItem('emberhold-v1',JSON.stringify({coins:guest}));
    if(readError){const original=supabase.createClient;supabase.createClient=(...args)=>{const c=original(...args),from=c.from;c.from=t=>{const q=from(t);if(t==='player_progress')q.maybeSingle=async()=>({error:{message:'fixture cloud denied'}});return q;};return c;};}
    if(offline||holdRead){const original=supabase.createClient;supabase.createClient=(...args)=>{const c=original(...args);if(offline){c.auth.getUser=async()=>fixture.offline?{data:{user:null},error:{name:denied?'AuthApiError':'AuthRetryableFetchError',status:denied?401:0,message:'fixture offline'}}:{data:{user:fixture.user}};c.auth.getSession=async()=>({data:{session:{user:fixture.user,expires_at:Date.now()/1000+3600}}});fixture.offline=true;}if(holdRead){const from=c.from;c.from=t=>{const q=from(t),read=q.maybeSingle;q.maybeSingle=async()=>{const result=await read();if(t==='player_progress'&&!fixture.heldRead){fixture.heldRead=true;await new Promise(r=>fixture.releaseRead=r);}return result;};return q;};}return c;};}
    const record=normalizeRecord(null);if(remoteCoins!==null){fixture.remote={revision:2,save_version:1,snapshot:{version:1,save:s.loadGameSave(),record}};fixture.remote.snapshot.save.coins=remoteCoins;}
    if(dirty){localStorage.setItem(s.gameSaveKey(A),JSON.stringify({...s.loadGameSave(),coins:33}));localStorage.setItem(s.recordKey(A),JSON.stringify(record));localStorage.setItem('emberhold-sync-'+A,JSON.stringify({revision:2,dirty:true,pending:null}));}
    if(denied)Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>false});
    window.controller=createAccountUI({applySave:s=>fixture.apply.push(s.coins),isPlaying:()=>fixture.playing,onState:state=>fixture.state=state,onAuthenticated:()=>{}});controller.mount(document.getElementById('account'));
   },{remoteCoins,dirty,guest,readError,offline,holdRead,denied,A});
  }
  await setup({remoteCoins:42});
  await page.waitForFunction(A=>storage.getPlayerScope()===A,A);
  assert.equal(await page.evaluate(()=>storage.loadGameSave().coins),42,'retained session loads cloud automatically');
  assert.equal(await page.getByRole('button',{name:'טעינת הענן — החלפת השמירה הפעילה'}).count(),0,'no routine source chooser');
  assert.equal(await page.getByRole('textbox',{name:'כתובת אימייל להתחברות'}).count(),0,'no login while authenticated');
  await page.evaluate(()=>storage.writeGameSave({...storage.loadGameSave(),coins:43}));
  await page.waitForFunction(()=>fixture.remote.snapshot.save.coins===43);
  assert.equal(await page.evaluate(()=>storage.loadGameSave('guest').coins),777);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('emberhold-sync-'+fixture.user.id)).dirty),false);
  await setup({remoteCoins:42,dirty:true});await page.waitForFunction(()=>fixture.remote.snapshot.save.coins===33);
  assert.equal(await page.evaluate(()=>fixture.writes),1,'dirty same-revision cache autosaves');
  await page.evaluate(()=>{fixture.remote={...fixture.remote,revision:fixture.remote.revision+1,snapshot:{...fixture.remote.snapshot,save:{...fixture.remote.snapshot.save,coins:88}}};storage.writeGameSave({...storage.loadGameSave(),coins:34});});
  await page.getByRole('button',{name:'שימוש בהתקדמות החשבון',exact:true}).waitFor();
  assert.equal(await page.evaluate(()=>fixture.remote.snapshot.save.coins),88,'newer cloud not overwritten');
  await page.getByRole('button',{name:'שימוש בהתקדמות החשבון',exact:true}).click();
  await page.waitForFunction(()=>storage.loadGameSave().coins===88);
  await setup({remoteCoins:42});await page.waitForFunction(A=>storage.getPlayerScope()===A,A);
  await page.evaluate(()=>{fixture.hold=true;storage.writeGameSave({...storage.loadGameSave(),coins:43});});
  await page.waitForFunction(()=>fixture.release);
  await page.evaluate(()=>storage.writeGameSave({...storage.loadGameSave(),coins:44}));
  await page.evaluate(()=>fixture.release());await page.waitForFunction(()=>fixture.remote.snapshot.save.coins===44);
  assert.equal(await page.evaluate(()=>fixture.writes),2,'new edits follow acknowledged pending request');
  await page.evaluate(()=>{fixture.user=null;fixture.callback('SIGNED_OUT',null);});
  await page.getByRole('textbox',{name:'כתובת אימייל להתחברות'}).waitFor();
  assert.equal(await page.evaluate(()=>storage.getPlayerScope()),'guest');
  await setup({remoteCoins:42,dirty:true,offline:true});await page.waitForFunction(A=>storage.getPlayerScope()===A,A);
  assert.equal(await page.evaluate(()=>storage.loadGameSave().coins),33);assert.equal(await page.evaluate(()=>fixture.writes),0,'offline never sends account writes');
  await page.evaluate(()=>{fixture.offline=false;dispatchEvent(new Event('online'));});await page.waitForFunction(()=>fixture.remote.snapshot.save.coins===33);
  await setup({remoteCoins:42,holdRead:true});await page.waitForFunction(()=>fixture.releaseRead);
  await page.evaluate(()=>{fixture.playing=true;fixture.releaseRead();});await page.waitForTimeout(60);
  assert.equal(await page.evaluate(()=>storage.getPlayerScope()),'guest','late account read cannot replace active run');
  await page.evaluate(()=>{fixture.playing=false;dispatchEvent(new Event('emberhold-save-change'));});
  await page.waitForFunction(A=>storage.getPlayerScope()===A,A,{timeout:1500});
  await page.evaluate(()=>{fixture.user=null;fixture.callback('SIGNED_OUT',null);});await page.getByRole('textbox',{name:'כתובת אימייל להתחברות'}).waitFor();
  await page.getByRole('textbox',{name:'כתובת אימייל להתחברות'}).fill('test@example.invalid');
  await page.getByRole('checkbox',{name:'להישאר מחובר במכשיר הזה',exact:true}).uncheck();
  await page.getByRole('button',{name:'שליחת קוד כניסה',exact:true}).click();
  await page.getByRole('textbox',{name:'קוד הכניסה מהאימייל',exact:true}).fill('123456');
  await page.getByRole('button',{name:'כניסה למשחק',exact:true}).click();
  await page.waitForFunction(A=>storage.getPlayerScope()===A,A);
  assert.equal(await page.evaluate(()=>fixture.opts.auth.storage.remember),false,'checkbox controls real SDK adapter');
  assert.equal(await page.evaluate(()=>fixture.code.token),'123456');
  await setup({remoteCoins:42,readError:true});
  await page.waitForFunction(()=>!controller.initializing,{},{timeout:1500});
  assert.equal(await page.evaluate(()=>fixture.state.ready),false,'failed cloud load cannot mark guest data as ready account');
  assert.equal(await page.evaluate(()=>storage.getPlayerScope()),'guest');
  await setup({remoteCoins:42,dirty:true,holdRead:true});await page.waitForFunction(()=>fixture.releaseRead);
  await page.evaluate(A=>{const key=storage.gameSaveKey(A);localStorage.setItem(key,JSON.stringify({...storage.loadGameSave(A),coins:55}));localStorage.setItem('emberhold-sync-'+A,JSON.stringify({revision:2,dirty:false,pending:null}));dispatchEvent(new StorageEvent('storage',{key,oldValue:'old',newValue:'new'}));fixture.releaseRead();},A);
  await page.getByRole('button',{name:'טעינה מחדש בטוחה',exact:true}).waitFor();await page.waitForTimeout(60);
  assert.equal(await page.evaluate(A=>storage.loadGameSave(A).coins,A),55,'late cloud response cannot overwrite another tab');
  assert.deepEqual(await page.evaluate(()=>fixture.apply),[],'stale response must not reactivate blocked account');
  await setup({remoteCoins:42,holdRead:true});await page.waitForFunction(()=>fixture.releaseRead);
  await page.evaluate(()=>{fixture.user={id:'22222222-2222-4222-8222-222222222222',email:'other@example.invalid'};fixture.remote={...fixture.remote,snapshot:{...fixture.remote.snapshot,save:{...fixture.remote.snapshot.save,coins:88}}};fixture.callback('SIGNED_IN',{user:fixture.user});fixture.releaseRead();});
  await page.waitForFunction(()=>storage.getPlayerScope()==='22222222-2222-4222-8222-222222222222');
  assert.deepEqual(await page.evaluate(()=>fixture.apply),[88],'old account response never applies after identity switch');
  await setup({remoteCoins:42,dirty:true,offline:true,denied:true});await page.waitForFunction(()=>!controller.initializing);
  assert.equal(await page.evaluate(()=>storage.getPlayerScope()),'guest','server-revoked session must not become offline authenticated account');
  assert.equal(await page.evaluate(()=>controller.user),null);await page.getByRole('textbox',{name:'כתובת אימייל להתחברות'}).waitFor();
  console.log('PASS account-first browser: returning restore, autosave, guest isolation, dirty restore, conflict, in-flight edits, external signout and OTP adapter. Fake Auth/network only.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
