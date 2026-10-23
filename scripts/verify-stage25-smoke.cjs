// Isolated real-entry smoke: no game-state interception, no production mutations.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4173/';
const artifacts=process.env.QA_ARTIFACTS||'qa-artifacts/stage25-smoke';
fs.mkdirSync(artifacts,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,hasTouch:true});
  context.setDefaultTimeout(90000);const page=await context.newPage(),errors=[],failed=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&new URL(r.url()).origin===new URL(base).origin)failed.push({path:new URL(r.url()).pathname,status:r.status()});});
  const response=await page.goto(base);assert.equal(response.status(),200,'entry HTTP status');
  await page.locator('#start').waitFor({state:'visible'});await page.waitForFunction(()=>document.body.classList.contains('has-3d')&&!document.getElementById('start').disabled);
  if(process.env.QA_STATIC==='1')assert.equal(await page.locator('.dev-performance').count(),0,'static Preview must not activate developer diagnostics');
  const assets=[];
  for(const file of ['app.js','style.css','engine.js','assets/heroes.webp','assets/models/brass.glb','vendor/addons/loaders/GLTFLoader.js','vendor/addons/utils/BufferGeometryUtils.js']){
   const r=await context.request.get(new URL(file,base).href);assert.equal(r.status(),200,file);
   const mime=r.headers()['content-type']||'';assert(!mime.includes('text/html'),file+' must not return HTML');
   if(process.env.QA_STATIC==='1'&&file.endsWith('.css'))assert(mime.includes('text/css'),'static CSS MIME');
   if(file.endsWith('.webp'))assert(mime.includes('image/webp'),'WebP MIME');
   const body=await r.body();assert(body.length>0);if(file.endsWith('.glb'))assert.equal(body.readUInt32LE(0),0x46546c67,'real GLB payload');
   if(file==='app.js'&&process.env.QA_STATIC==='1')assert.equal(body.toString().replace(/\r\n/g,'\n'),fs.readFileSync('dist/app.js','utf8').replace(/\r\n/g,'\n'),'served app matches integration source');
   assets.push({file,status:r.status(),mime,bytes:body.length});
  }
  await page.locator('#start').tap();await page.locator('[data-starter]').first().tap();
  await page.waitForFunction(()=>document.body.classList.contains('in-battle'));
  const layouts=[];
  for(const viewport of [{width:390,height:844},{width:844,height:390},{width:320,height:740}]){
   await page.setViewportSize(viewport);await page.waitForTimeout(150);
   const layout=await page.evaluate(()=>{const field=document.getElementById('battleScene').getBoundingClientRect(),deck=document.querySelector('.combat-deck').getBoundingClientRect();return {width:innerWidth,height:innerHeight,field:{x:field.x,y:field.y,w:field.width,h:field.height},deck:{x:deck.x,y:deck.y,w:deck.width,h:deck.height},controls:[...document.querySelectorAll('.battle-controls button,#cameraMode,#shockwavePower,#tacticalPower')].map(e=>{const r=e.getBoundingClientRect();return {id:e.id,w:r.width,h:r.height,x:r.x,y:r.y}})};});
   assert(layout.field.w>100&&layout.field.h>100);assert(layout.deck.y+layout.deck.h<=viewport.height+1);
   for(const b of layout.controls){assert(b.w>=44&&b.h>=44,b.id+' touch size');assert(b.x>=-1&&b.x+b.w<=viewport.width+1,b.id+' horizontal bounds');}
   layouts.push(layout);await page.screenshot({path:path.join(artifacts,`layout-${viewport.width}x${viewport.height}.png`)});
  }
  await page.locator('#shockwavePower').tap();await page.waitForFunction(()=>document.getElementById('shockwavePower').dataset.state!=='ready');
  for(const speed of [2,3,1]){await page.locator('#speed').tap();assert.equal(await page.locator('#speed').innerText(),'×'+speed);}
  await page.locator('#pause').tap();await page.locator('#resume').waitFor();
  const time=await page.locator('#time').textContent();await page.waitForTimeout(250);assert.equal(await page.locator('#time').textContent(),time);
  await page.locator('#resume').tap();await page.locator('#pause').tap();await page.locator('#leave').tap();await page.locator('#again').waitFor();
  await page.locator('#again').tap();await page.locator('[data-starter]').first().tap();await page.waitForFunction(()=>document.body.classList.contains('in-battle'));
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  const report={status:'PASS',origin:new URL(base).origin,mode:process.env.QA_STATIC==='1'?'static deployment':'local Vite',assets,layouts,errors,failed,limitations:'Desktop Chromium touch emulation / software rendering; not physical Android/iPhone acceptance.'};
  fs.writeFileSync(path.join(artifacts,'smoke-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
