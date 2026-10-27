// Actual vendored Supabase SDK + real browser storage. Auth endpoint is a fixture.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const A='11111111-1111-4111-8111-111111111111';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true});
 try{
  for(const remember of [true,false]){
   const context=await browser.newContext();let issued=0;
   await context.route('**/__sessionqa',r=>r.fulfill({contentType:'text/html',body:'<main>Isolated SDK session fixture</main>'}));
   await context.route('https://auth-fixture.invalid/auth/v1/**',r=>{
    const user={id:A,aud:'authenticated',email:'fixture@example.invalid',app_metadata:{},user_metadata:{},created_at:'2026-01-01T00:00:00Z'};
    if(r.request().url().endsWith('/logout?scope=local'))return r.fulfill({contentType:'application/json',body:'{}'});
    if(r.request().url().endsWith('/user'))return r.fulfill({contentType:'application/json',body:JSON.stringify(user)});
    issued++;const exp=Math.floor(Date.now()/1000)+3600;
    const token=[{alg:'HS256',typ:'JWT'},{sub:A,exp,iat:exp-3600,role:'authenticated'}].map(x=>Buffer.from(JSON.stringify(x)).toString('base64url')).join('.')+'.fixture-signature';
    return r.fulfill({contentType:'application/json',body:JSON.stringify({access_token:token,refresh_token:'fixture-refresh-'+issued,token_type:'bearer',expires_in:3600,expires_at:exp,user})});
   });
   async function setup(page){
    await page.goto('http://127.0.0.1:4174/__sessionqa');await page.addScriptTag({url:'http://127.0.0.1:4174/vendor/supabase/supabase.js'});
    await page.evaluate(async remember=>{const {createSessionStore,AUTH_STORAGE_KEY}=await import('./account-session.js');window.fixtureStore=createSessionStore();fixtureStore.setRemember(remember);window.fixtureClient=supabase.createClient('https://auth-fixture.invalid','fixture-publishable-key',{auth:{storage:fixtureStore,storageKey:AUTH_STORAGE_KEY,persistSession:true,autoRefreshToken:false,detectSessionInUrl:false}});},remember);
   }
   const page=await context.newPage();await setup(page);
   const initial=await page.evaluate(async()=>{const result=await fixtureClient.auth.verifyOtp({email:'fixture@example.invalid',token:'123456',type:'email'});return{error:result.error?.message,hasUser:!!result.data.user,local:localStorage.getItem('emberhold-auth-v2')!==null,session:sessionStorage.getItem('emberhold-auth-v2')!==null};});
   assert.equal(initial.error,undefined);assert(initial.hasUser);assert.equal(initial.local,remember);assert.equal(initial.session,!remember);
   await page.reload();await page.addScriptTag({url:'http://127.0.0.1:4174/vendor/supabase/supabase.js'});
   await page.evaluate(async()=>{const {createSessionStore}=await import('./account-session.js');window.fixtureStore=createSessionStore();window.fixtureClient=supabase.createClient('https://auth-fixture.invalid','fixture-publishable-key',{auth:{storage:fixtureStore,storageKey:'emberhold-auth-v2',persistSession:true,autoRefreshToken:false,detectSessionInUrl:false}});});
   assert(await page.evaluate(async()=>!!(await fixtureClient.auth.getSession()).data.session),'same-tab reload retains session');
   const second=await context.newPage();await setup(second);
   assert.equal(await second.evaluate(async()=>!!(await fixtureClient.auth.getSession()).data.session),remember,'new empty tab only restores remembered session');
   assert.equal(await page.evaluate(async()=>{const r=await fixtureClient.auth.refreshSession();return!r.error;}),true,'refresh writes through selected storage');
   assert.equal(await page.evaluate(()=>localStorage.getItem('emberhold-auth-v2')!==null),remember);
   await page.evaluate(async()=>{const r=await fixtureClient.auth.signOut({scope:'local'});if(r.error)throw r.error;});
   assert.equal(await page.evaluate(()=>localStorage.getItem('emberhold-auth-v2')===null&&sessionStorage.getItem('emberhold-auth-v2')===null),true);
   await context.close();console.log('PASS actual SDK storage mode',remember?'remembered':'tab-session','reload/new-tab/refresh/signout. Fixture transport only.');
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
