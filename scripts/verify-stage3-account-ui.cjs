// Controller integration with explicit fake Auth/PostgREST; never a live-login claim.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true});try{
 const page=await browser.newPage();await page.route('**/__accountqa',r=>r.fulfill({contentType:'text/html',body:'<div id="account"></div>'}));
 await page.route('**/vendor/supabase/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:`
 window.fixture={user:{id:'11111111-1111-4111-8111-111111111111',email:'test@example.invalid'},remote:null,playing:false,delay:false,release:null,apply:[],callback:null};
 window.supabase={createClient:()=>({auth:{getUser:async()=>fixture.user?{data:{user:fixture.user}}:{data:{user:null},error:{name:'AuthSessionMissingError'}},onAuthStateChange:cb=>{fixture.callback=cb;return{data:{subscription:{unsubscribe(){}}}}},signOut:async()=>{fixture.user=null;return{};}},from:table=>{const q={select:()=>q,eq:()=>q,maybeSingle:async()=>{if(fixture.delay){fixture.delay=false;await new Promise(r=>fixture.release=r);}return{data:table==='player_progress'?fixture.remote:null}}};return q;}})};
 `}));
 await page.goto('http://127.0.0.1:4174/__accountqa');
 await page.evaluate(async()=>{const [{createAccountUI},storage]=await Promise.all([import('./account-ui.js'),import('./player-storage.js')]);window.storage=storage;localStorage.setItem('emberhold-v1',JSON.stringify({coins:777}));window.controller=createAccountUI({getSave:()=>storage.loadGameSave(),applySave:s=>fixture.apply.push(s.coins),isPlaying:()=>fixture.playing,onAuthenticated:()=>{}});controller.mount(document.getElementById('account'));});
 await page.getByRole('button',{name:'ייבוא שמירת האורח לחשבון'}).waitFor();
 page.on('dialog',d=>d.accept());
 await page.evaluate(()=>{fixture.delay=true;});await page.getByRole('button',{name:'ייבוא שמירת האורח לחשבון'}).click();
 await page.waitForFunction(()=>fixture.release);await page.evaluate(()=>{fixture.playing=true;fixture.release();});
 await page.waitForFunction(()=>document.querySelector('[role=status]').textContent.includes('סיימו את הריצה'));
 assert.equal(await page.evaluate(()=>storage.getPlayerScope()),'guest','network response must not switch a running game');
 assert.deepEqual(await page.evaluate(()=>fixture.apply),[]);
 await page.evaluate(()=>{fixture.playing=false;});await page.getByRole('button',{name:'ייבוא שמירת האורח לחשבון'}).click();
 await page.getByRole('button',{name:'סנכרון עכשיו',exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>storage.getPlayerScope()),'11111111-1111-4111-8111-111111111111');
 assert.equal(await page.evaluate(()=>storage.loadGameSave().coins),777);
 const avatar=await page.evaluate(async()=>{const {prepareAvatar}=await import('./player-avatar.js');const source=await(await fetch('./assets/heroes.webp')).blob();const image=await prepareAvatar(new File([source],'hero.webp',{type:'image/webp'}));const bitmap=await createImageBitmap(image);const dimensions=[bitmap.width,bitmap.height];bitmap.close();let rejected=false;try{await prepareAvatar(new File(['<svg/>'],'avatar.svg',{type:'image/svg+xml'}));}catch{rejected=true;}return{dimensions,type:image.type,rejected};});
 assert.deepEqual(avatar,{dimensions:[256,256],type:'image/webp',rejected:true});
 assert.equal(await page.evaluate(()=>storage.loadGameSave('guest').coins),777,'guest retained');
 await page.evaluate(()=>{fixture.user=null;fixture.callback('SIGNED_OUT',null);});
 await page.waitForFunction(()=>storage.getPlayerScope()==='guest');
 assert.equal(await page.evaluate(()=>controller.user),null,'missing Auth session clears controller');
 assert.equal(await page.evaluate(()=>storage.loadGameSave().coins),777);
 console.log('PASS controller: delayed account switch blocked during run, explicit guest import preserved, external signout restores guest. Fake Auth only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
