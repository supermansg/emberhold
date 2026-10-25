// Fresh browser profile only. Same production origin, old live -> candidate -> old live.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.QA_PRODUCTION_URL||'https://emberhold-five.vercel.app/';
const artifact=process.env.QA_ARTIFACTS||'qa-artifacts/stage26-save';
(async()=>{
 const {migrateSave}=await import('../dist/progression.js');
 const fixture=migrateSave({coins:12345,careerXp:4567,best:8,power:3,vitality:2,reload:1,heroes:{gunner:{xp:567,seconds:321,score:444,runs:7}},collection:{version:1,keys:17,opened:4,heroes:{gunner:{cards:13,rank:2,unlocked:true}},spells:{meteor:{cards:8,rank:1,unlocked:true},blizzard:{cards:5,rank:0,unlocked:true}},loadout:['meteor','blizzard']}});
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,hasTouch:true});
  await context.addInitScript(({fixture,origin})=>{if(location.origin===origin&&!localStorage.getItem('emberhold-v1'))localStorage.setItem('emberhold-v1',JSON.stringify(fixture));},{fixture,origin:new URL(base).origin});
  const page=await context.newPage(),errors=[],phases=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(90000);
  let expected=structuredClone(fixture);
  for(const phase of process.env.QA_DEPLOYED==='1'?['new-live','new-live-reload']:['old-live','candidate-same-origin','rollback-old-live']){
   if(phase==='candidate-same-origin')await context.route(new URL(base).origin+'/**',async route=>{
    const url=new URL(route.request().url()),relative=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1));
    const root=path.resolve('dist'),file=path.resolve(root,relative);assert(file.startsWith(root+path.sep));
    const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.jpg':'image/jpeg','.glb':'model/gltf-binary'};
    if(fs.existsSync(file)&&fs.statSync(file).isFile())await route.fulfill({status:200,contentType:types[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});else await route.continue();
   });
   if(phase==='rollback-old-live')await context.unrouteAll({behavior:'wait'});
   await page.goto(base);if(await page.locator('#guestEntry').isVisible()){await page.locator('#guestEntry').click();await page.locator('#welcome').waitFor({state:'hidden'});}await page.locator('#start').waitFor({state:'visible'});
   assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('emberhold-v1'))),expected,phase+' initial save');
   await page.locator('[data-page="collection"]').tap();await page.locator('[data-equip="meteor"]').tap();
   expected.collection.loadout=expected.collection.loadout.includes('meteor')?expected.collection.loadout.filter(x=>x!=='meteor'):[...expected.collection.loadout,'meteor'];
   assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('emberhold-v1'))),expected,phase+' persist preserves all unrelated fields');
   phases.push({phase,origin:new URL(page.url()).origin,status:'PASS',coins:expected.coins,careerXp:expected.careerXp,keys:expected.collection.keys});
  }
  assert.deepEqual(errors,[]);fs.mkdirSync(artifact,{recursive:true});const report={status:'PASS',phases,errors,limitations:'Representative synthetic save in a fresh browser context, not inspection of real player profiles. In compatibility mode only the middle phase is intercepted; QA_DEPLOYED=1 tests real deployed persistence/reload without interception.'};fs.writeFileSync(path.join(artifact,'save-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
