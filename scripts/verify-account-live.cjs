// Explicit opt-in live owner QA. Codes arrive through stdin, never saved/logged.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),readline=require('node:readline');
const base=process.env.QA_BASE_URL,email=process.env.QA_AUTH_EMAIL;
if(!base||!email)throw Error('Explicit QA_BASE_URL and authorized QA_AUTH_EMAIL required.');
if(process.stdin.isTTY)process.stdin.setRawMode(true);
const input=readline.createInterface({input:process.stdin,terminal:false}),pending=[];
input.on('line',line=>{const entry=pending.shift();if(entry){clearTimeout(entry.timer);entry.resolve(line.trim());}});
input.on('close',()=>{for(const entry of pending.splice(0)){clearTimeout(entry.timer);entry.reject(Error('OTP input closed'));}});
const code=()=>new Promise((resolve,reject)=>{const entry={resolve,reject,timer:setTimeout(()=>reject(Error('OTP input timeout')),300000)};pending.push(entry);});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true});
 let activePage,restoreName=null;
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await context.newPage();page.setDefaultTimeout(30000);
  activePage=page;
  const profile=async()=>{await page.locator('#welcome').waitFor({state:'hidden'});await page.locator('#openProfile').click();};
  async function login(remember,round){
   await page.getByRole('textbox',{name:'כתובת אימייל להתחברות',exact:true}).fill(email);
   await page.getByRole('checkbox',{name:'להישאר מחובר במכשיר הזה',exact:true}).setChecked(remember);
   await page.getByRole('button',{name:'שליחת קוד כניסה',exact:true}).click();
   await page.getByRole('textbox',{name:'קוד הכניסה מהאימייל',exact:true}).waitFor();
   console.log('WAITING_OTP_'+round);const otp=await code();assert(/^\d{6,10}$/.test(otp));
   await page.getByRole('textbox',{name:'קוד הכניסה מהאימייל',exact:true}).fill(otp);
   await page.getByRole('button',{name:'כניסה למשחק',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#welcomeAuth [role=status]')?.textContent==='ההתקדמות שלכם מעודכנת.');await profile();
   await page.locator('#profileAccount').getByText('ההתקדמות שלכם מעודכנת.',{exact:true}).waitFor();console.log('PASS real login '+round);
  }
  await page.goto(base);await login(true,1);
  const original=await page.locator('#displayName').inputValue();
  const second=await context.newPage();await second.goto(base);await second.locator('#welcome').waitFor({state:'hidden'});await second.locator('#openProfile').click();await second.locator('#profileAccount').getByText('ההתקדמות שלכם מעודכנת.',{exact:true}).waitFor();await second.close();console.log('PASS remembered new-tab restore');
  restoreName=original;
  await page.locator('#displayName').fill('שומר בדיקת Preview');await page.locator('#identityForm button').click();await page.locator('#profileAccount').getByText('ההתקדמות שלכם מעודכנת.',{exact:true}).waitFor();await page.reload();await profile();assert.equal(await page.locator('#displayName').inputValue(),'שומר בדיקת Preview');
  await page.locator('#displayName').fill(original);await page.locator('#identityForm button').click();await page.locator('#profileAccount').getByText('ההתקדמות שלכם מעודכנת.',{exact:true}).waitFor();restoreName=null;console.log('PASS real autosave/reload and original identity restored');
  await page.locator('#profileAccount').getByText('הגדרות החשבון',{exact:true}).click();
  const cancelled=page.waitForEvent('dialog').then(async d=>{assert.equal(d.type(),'confirm');await d.dismiss();});
  await page.getByRole('button',{name:'יציאה מהחשבון',exact:true}).click();await cancelled;await page.locator('#profileAccount').getByText('ההתקדמות שלכם מעודכנת.',{exact:true}).waitFor();console.log('PASS logout cancelled, account retained');
  const confirmed=page.waitForEvent('dialog').then(async d=>{assert.equal(d.type(),'confirm');await d.accept();});
  await page.getByRole('button',{name:'יציאה מהחשבון',exact:true}).click();await confirmed;await page.locator('#profileAccount input[type=email]').waitFor({state:'attached'});await page.waitForFunction(()=>document.querySelector('#profileAccount input[type=email]')?.disabled===false);await profile();await page.getByRole('textbox',{name:'כתובת אימייל להתחברות',exact:true}).waitFor();console.log('PASS real local signout and guest isolation');
  // Provider throttles repeat emails. This bounded delay is not a test of delivery.
  console.log('WAITING resend cooldown');await new Promise(resolve=>setTimeout(resolve,61000));
  await login(false,2);await page.reload();await profile();await page.locator('#profileAccount').getByText('ההתקדמות שלכם מעודכנת.',{exact:true}).waitFor();
  const third=await context.newPage();await third.goto(base);await third.locator('#openProfile').click();await third.getByRole('textbox',{name:'כתובת אימייל להתחברות',exact:true}).waitFor();await third.close();console.log('PASS session-only reload, fresh tab has no account');
  console.log('PASS live Preview account matrix. No device-performance claim.');await context.close();
 }catch(error){
  if(activePage&&!activePage.isClosed()){
   console.error('Account status:',await activePage.locator('#profileAccount [role=status]').textContent().catch(()=>''));
   console.error('Account controls:',await activePage.locator('#profileAccount input').evaluateAll(es=>es.map(e=>({type:e.type,disabled:e.disabled,checked:e.type==='checkbox'?e.checked:undefined,rect:e.getBoundingClientRect().toJSON()}))));
  }throw error;
 }finally{
  if(restoreName!==null&&activePage&&!activePage.isClosed())try{
   await activePage.goto(base);await activePage.locator('#welcome').waitFor({state:'hidden'});await activePage.locator('#openProfile').click();
   await activePage.locator('#displayName').fill(restoreName);await activePage.locator('#identityForm button').click();await activePage.locator('#profileAccount').getByText('ההתקדמות שלכם מעודכנת.',{exact:true}).waitFor();
   console.log('RESTORED original identity after interrupted QA');
  }catch{console.error('Original identity restore NOT VERIFIED; inspect owner account before release.');}
  input.close();if(process.stdin.isTTY)process.stdin.setRawMode(false);await browser.close();
 }
})().catch(e=>{console.error(e.message);process.exitCode=1;input.close();});





