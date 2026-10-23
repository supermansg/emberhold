// Layout observations for existing non-combat screens; not physical device approval.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const base=process.env.QA_BASE_URL||'https://emberhold-five.vercel.app/',out=process.env.QA_ARTIFACTS||'qa-artifacts/stage26-mobile';fs.mkdirSync(out,{recursive:true});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage(),errors=[],screens=[];page.setDefaultTimeout(90000);page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.locator('#start').waitFor({state:'visible'});
  for(const viewport of [{width:390,height:844},{width:844,height:390},{width:320,height:740}]){
   await page.setViewportSize(viewport);
   for(const destination of ['battle','heroes','hero-detail','collection','fort']){
    if(destination==='hero-detail')await page.locator('[data-shophero="0"]').tap();else await page.locator(`[data-page="${destination}"]`).tap();
    await page.waitForTimeout(100);
    const result=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,nav:[...document.querySelectorAll('#mainNav button')].map(e=>{const r=e.getBoundingClientRect();return {name:e.dataset.page,x:r.x,y:r.y,w:r.width,h:r.height}})}));
    assert(result.scrollWidth<=viewport.width+1,'horizontal overflow '+destination);
    for(const b of result.nav){assert(b.x>=-1&&b.x+b.w<=viewport.width+1,'nav horizontal bounds');assert(b.y>=-1&&b.y+b.h<=viewport.height+1,'nav vertical bounds');assert(b.w>=44&&b.h>=44,'nav touch size');}
    screens.push({destination,...result});await page.screenshot({path:path.join(out,`${viewport.width}-${destination}.png`)});
   }
  }
  assert.deepEqual(errors,[]);const report={status:'PASS',screens,errors,limitations:'Checks document overflow and nav target bounds on home/heroes/detail/collection/fort with reduced-motion emulation. Does not prove every text contrast, overlap, safe-area inset or physical scrolling behavior.'};fs.writeFileSync(path.join(out,'mobile-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
