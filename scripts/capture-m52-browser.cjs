const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const artifacts=process.env.M2_ARTIFACTS || '/tmp/emberhold-m52-artifacts';fs.mkdirSync(artifacts,{recursive:true});
const baseURL=process.env.M2_BASE_URL || 'http://127.0.0.1:4173';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true});
 await context.addInitScript(()=>{
  const OriginalDate=Date;window.__m2Date='2026-06-21T09:40:00Z';
  window.Date=class extends OriginalDate {constructor(...args){super(...(args.length?args:[window.__m2Date]));}static now(){return new OriginalDate(window.__m2Date).getTime();}};
  let seed=123456;Math.random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
  localStorage.setItem('emberhold-v1',JSON.stringify({collection:{spells:{meteor:{unlocked:true,rank:0,cards:0},blizzard:{unlocked:true,rank:0,cards:0}},loadout:['meteor','blizzard']}}));
 });
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Access module-local state only in this intercepted test response; no shipped debug API.
 await page.route(/\/app\.js(?:\?.*)?$/,async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__m2Test={state:()=>({game,view3d,speed,save,sfx,motionFeedback}),formation:()=>{for(let i=1;i<4;i++)game.addHero(i);teamUI();hud();},hud,teamUI};'});});
 await page.goto(baseURL);await page.waitForFunction(()=>typeof window.__m2Test==='object'&&document.body.classList.contains('has-3d')&&!document.getElementById('start').disabled);
 await page.setViewportSize({width:320,height:740});await page.waitForTimeout(100);assert(await page.evaluate(()=>Array.from(document.querySelectorAll('.top-actions button')).every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.width>=44;})),'narrow home controls remain on screen');await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:artifacts+'/m2-home.png'});
 await page.locator('#audioSettings').click();for(const [id,value]of [['music','30'],['sfx','70'],['master','80']]){await page.locator(`[data-audio="${id}"]`).fill(value);await page.locator(`[data-audio="${id}"]`).dispatchEvent('input');}assert.equal(await page.evaluate(()=>__m2Test.state().sfx.getSettings().music),.3);await page.locator('#closeAudio').click();


 for(let attempt=0;attempt<12;attempt++){await page.locator('#start').click();if(await page.locator('[data-starter="0"]').count())break;await page.locator('#cancelStart').click();}assert.equal(await page.locator('[data-starter="0"]').count(),1,'Brass must be among the actual offered starters');
 await page.locator('[data-starter="0"]').click();await page.waitForFunction(()=>__m2Test.state().game?.time>.7);
 await page.evaluate(()=>{
  const {game:g}=__m2Test.state();__m2Test.formation();g.wave=3;g.intermission=100;g.nextXp=1e6;
  g.enemies=Array.from({length:12},(_,i)=>({id:100+i,type:i===11?3:i%3,definitionId:i===11?'forest-boss':i%3===0?'forest-grunt':i%3===1?'forest-runner':'forest-armored',x:90+(i%4)*100,y:180+Math.floor(i/4)*70,hp:2000,maxHp:2000,speed:0,damage:0,attack:1,burn:0,slow:0,flash:0,isBoss:i===11,bossName:i===11?'M2 boss fixture':null}));__m2Test.hud();
 });
 await page.waitForFunction(()=>__m2Test.state().view3d.heroes.size===4&&__m2Test.state().view3d.actors.size===12);
 assert(await page.evaluate(()=>__m2Test.state().view3d.heroes.get(0).userData.authored),'Brass GLB must be active, not silently falling back');
 await page.screenshot({path:artifacts+'/m2-mobile-day.png'});
 const stats=await page.evaluate(()=>{const {view3d:v}=__m2Test.state();return {webgl:v.renderer.getContext().getParameter(v.renderer.getContext().VERSION),calls:v.renderer.info.render.calls,triangles:v.renderer.info.render.triangles,geometries:v.renderer.info.memory.geometries,textures:v.renderer.info.memory.textures}});

 const evidence={};
 for(const id of ['gunner','electric','fire','frost']){
  await page.evaluate(id=>{const {game:g,view3d:v}=__m2Test.state();g.team.sort((a,b)=>(a.id===id?-1:b.id===id?1:0));g.state='paused';g.effects=[];g.projectiles=[];g.enemies.forEach(e=>{e.hp=e.maxHp=10000;e.y=Math.min(e.y,450)});g.powerCharge=g.powerNeeded;for(const h of g.team){h.cd=.07;h.attackAnim=0;}v.reset();v.render(g,performance.now());__m2Test.teamUI();__m2Test.hud();},id);
  await page.screenshot({path:artifacts+'/'+id+'-anticipation.png'});
  await page.evaluate(()=>{const {game:g,view3d:v}=__m2Test.state();g.attack(g.team[0],g.enemies[0]);g.presentation=null;v.render(g,performance.now());});
  await page.screenshot({path:artifacts+'/'+id+'-normal.png'});
  evidence[id]=await page.evaluate(()=>{const {game:g,view3d:v}=__m2Test.state();g.state='playing';const success=g.activatePower();g.step(.12);g.state='paused';v.render(g,performance.now());return {success,effects:g.effects.filter(f=>f.presentation?.special>=2).map(f=>f.type),calls:v.renderer.info.render.calls};});
  await page.screenshot({path:artifacts+'/'+id+'-special.png'});
 }
 // Full-lane snapshots from the real authoritative wave, no cosmetic position override.
 await page.evaluate(()=>{const {game:g}=__m2Test.state();g.state='playing';g.effects=[];g.projectiles=[];g.shockwave=null;g.enemies=[510,290,100,25].map((y,type)=>({id:900+type,type,isBoss:type===3,x:90+105*type,y,hp:1e5,maxHp:1e5,speed:0,damage:0,attack:1,burn:0,slow:0,flash:0}));for(const h of g.team)h.cd=100;g.activateShockwave();g.state='paused';});
 for(const [name,age]of [['origin',.1],['middle',.7],['far',1.23]]){evidence[name]=await page.evaluate(age=>{const {game:g,view3d:v}=__m2Test.state();g.state='playing';while(g.shockwave.age<age-.00001)g.step(Math.min(.02,age-g.shockwave.age));g.state='paused';v.render(g,performance.now());return {front:g.shockwave.front,y:g.enemies.map(e=>e.y),hp:g.enemies.map(e=>e.hp)};},age);await page.screenshot({path:artifacts+'/wave-'+name+'.png'});}
 assert(Math.abs(evidence.far.front)<.001);assert(evidence.far.hp.every(h=>h===1e5));
 // Use real upgrade definitions, choosing a stable illustrative trio for before/after art comparison.
 await page.evaluate(()=>{const {game:g}=__m2Test.state();g.state='playing';g.xp=g.nextXp;g.checkLevel();const found=new Map();for(let i=0;i<200&&found.size<3;i++)for(const o of g.makeOptions())if(['burn','chain','slow'].includes(o.id))found.set(o.id,o);g.options=['burn','chain','slow'].map(id=>found.get(id));});
 await page.waitForSelector('[data-option]');await page.waitForTimeout(500);await page.screenshot({path:artifacts+'/level-choice.png'});await page.locator('[data-option="0"]').click();await page.waitForFunction(()=>__m2Test.state().game.state==='playing');
 evidence.upgrade=await page.evaluate(()=>__m2Test.state().game.upgradeLog.at(-1));
 // Real loot drop -> flight: allow a defeated enemy to be processed by the engine.
 await page.evaluate(()=>{const {game:g}=__m2Test.state();g.nextXp=1e9;g.enemies[0].hp=0;});await page.waitForFunction(()=>__m2Test.state().motionFeedback.active>0);await page.screenshot({path:artifacts+'/reward-flight.png'});await page.waitForFunction(()=>__m2Test.state().game.collectedCoins>0);
 evidence.rewards=await page.evaluate(()=>({coins:__m2Test.state().game.collectedCoins,pool:__m2Test.state().motionFeedback.slots.length}));assert.equal(evidence.rewards.pool,48);
 assert.deepEqual(errors,[]);fs.writeFileSync(artifacts+'/acceptance.json',JSON.stringify(evidence,null,2));console.log('PASS M5.2 acceptance captures');await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
