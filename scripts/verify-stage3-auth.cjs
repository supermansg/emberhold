// Explicit opt-in only: this sends one real login email. Never part of npm test.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4173/';
const email=process.env.QA_AUTH_EMAIL;
if(!email)throw Error('Set QA_AUTH_EMAIL to an explicitly authorized test address.');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await context.newPage();page.setDefaultTimeout(60000);
  await page.goto(base);await page.locator('.welcome-account summary').click();
  const host=page.locator('#welcomeAuth');
  await host.getByRole('button',{name:'שליחת קישור להתחברות / הרשמה'}).waitFor();
  await page.waitForFunction(()=>!document.querySelector('#welcomeAuth form button')?.disabled);
  await host.getByRole('textbox',{name:'כתובת אימייל להתחברות'}).fill(email);
  const response=page.waitForResponse(r=>r.url().includes('/auth/v1/otp'));
  await host.getByRole('button',{name:'שליחת קישור להתחברות / הרשמה'}).click();
  const reply=await response;const status=reply.status();
  await page.waitForFunction(()=>!document.querySelector('#welcomeAuth form button')?.disabled);
  const message=await host.locator('[role="status"]').textContent();
  fs.mkdirSync('qa-artifacts/stage3-auth',{recursive:true});
  fs.writeFileSync('qa-artifacts/stage3-auth/mail-result.json',JSON.stringify({status,message,base,at:new Date().toISOString(),authenticated:false},null,2));
  console.log(JSON.stringify({status,message,authenticated:false}));
  if(status!==200)process.exitCode=1;
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
