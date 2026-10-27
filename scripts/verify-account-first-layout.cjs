// Responsive real game shell/SDK, with email-send POST intercepted. No real mail.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const out='qa-artifacts/checkpoint-a-login';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const results=[];
 try{for(const [width,height] of [[320,740],[390,844],[844,390],[1365,900]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',hasTouch:true});const page=await context.newPage(),errors=[];let mails=0;
  page.on('pageerror',e=>errors.push(e.message));await page.route('**/auth/v1/otp*',route=>{mails++;return route.fulfill({contentType:'application/json',body:'{}'});});
  await page.goto('http://127.0.0.1:4174/');const host=page.locator('#welcomeAuth');await host.getByRole('button',{name:'שליחת קוד כניסה',exact:true}).waitFor();
  assert.equal(await host.getByRole('checkbox',{name:'להישאר מחובר במכשיר הזה',exact:true}).count(),1);
  await page.screenshot({path:`${out}/email-${width}.png`,fullPage:true});
  await host.getByRole('textbox',{name:'כתובת אימייל להתחברות'}).fill('fixture@example.invalid');await host.getByRole('button',{name:'שליחת קוד כניסה',exact:true}).click();
  await host.getByRole('textbox',{name:'קוד הכניסה מהאימייל'}).waitFor();await host.getByRole('textbox',{name:'קוד הכניסה מהאימייל'}).fill('123456');
  await page.screenshot({path:`${out}/otp-${width}.png`,fullPage:true});
  assert.equal(mails,1);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow');
  const sizes=await host.locator('input,button').evaluateAll(elements=>elements.filter(e=>e.offsetParent&&!e.disabled).map(e=>{const r=e.getBoundingClientRect();return{label:e.getAttribute('aria-label')||e.textContent,w:r.width,h:r.height};}));
  for(const s of sizes)assert(s.h>=44,`${width}: ${s.label} touch target`);
  for(const control of await host.locator('input,button').all()){
   if(!await control.isVisible()||!await control.isEnabled())continue;
   await control.scrollIntoViewIfNeeded();assert(await control.evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return e===hit||e.contains(hit);}),`${width}: account control must not be covered by skip/navigation`);
  }
  await page.locator('#guestEntry').click();await page.locator('#welcome').waitFor({state:'hidden'});assert.deepEqual(errors,[]);results.push({width,height,errors,requestsIntercepted:mails,controls:sizes});await context.close();
 }fs.writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));console.log('PASS account-first email/OTP layout at 320/390/844/1365; real SDK with intercepted mail request, no real delivery.');}
 finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
