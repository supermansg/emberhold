const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const artifacts=process.env.M2_ARTIFACTS || '/tmp/emberhold-m3-artifacts';fs.mkdirSync(artifacts,{recursive:true});
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
 await page.route(/\/app\.js(?:\?.*)?$/,async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text())+'\nwindow.__m2Test={state:()=>({game,view3d,speed,save,sfx}),formation:()=>{for(let i=1;i<4;i++)game.addHero(i);teamUI();hud();},hud};'});});
 await page.goto(baseURL);await page.waitForFunction(()=>typeof window.__m2Test==='object'&&document.body.classList.contains('has-3d')&&!document.getElementById('start').disabled);
 await page.setViewportSize({width:320,height:740});await page.waitForTimeout(100);assert(await page.evaluate(()=>Array.from(document.querySelectorAll('.top-actions button')).every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.width>=44;})),'narrow home controls remain on screen');await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:artifacts+'/m2-home.png'});
 await page.locator('#audioSettings').click();for(const [id,value]of [['music','30'],['sfx','70'],['master','80']]){await page.locator(`[data-audio="${id}"]`).fill(value);await page.locator(`[data-audio="${id}"]`).dispatchEvent('input');}assert.equal(await page.evaluate(()=>__m2Test.state().sfx.getSettings().music),.3);await page.locator('#closeAudio').click();
 for(let i=0;i<10;i++){const data=await page.evaluate(i=>__m2Test.state().view3d.capturePortrait(i),i);fs.writeFileSync(artifacts+'/hero-'+i+'.webp',Buffer.from(data.split(',')[1],'base64'));}

 for(let attempt=0;attempt<12;attempt++){await page.locator('#start').click();if(await page.locator('[data-starter="0"]').count())break;await page.locator('#cancelStart').click();}assert.equal(await page.locator('[data-starter="0"]').count(),1,'Brass must be among the actual offered starters');
 await page.locator('[data-starter="0"]').click();await page.waitForFunction(()=>__m2Test.state().game?.time>.7);
 await page.evaluate(()=>{
  const {game:g}=__m2Test.state();__m2Test.formation();g.wave=3;g.intermission=100;g.nextXp=1e6;
  g.enemies=Array.from({length:12},(_,i)=>({id:100+i,type:i===11?3:i%3,definitionId:i===11?'forest-boss':i%3===0?'forest-grunt':i%3===1?'forest-runner':'forest-armored',x:90+(i%4)*100,y:180+Math.floor(i/4)*70,hp:2000,maxHp:2000,speed:0,damage:0,attack:1,burn:0,slow:0,flash:0,isBoss:i===11,bossName:i===11?'M2 boss fixture':null}));__m2Test.hud();
 });
 await page.waitForFunction(()=>__m2Test.state().view3d.heroes.size===4&&__m2Test.state().view3d.actors.size===12);
 await page.screenshot({path:artifacts+'/m2-mobile-day.png'});
 const stats=await page.evaluate(()=>{const {view3d:v}=__m2Test.state();return {webgl:v.renderer.getContext().getParameter(v.renderer.getContext().VERSION),calls:v.renderer.info.render.calls,triangles:v.renderer.info.render.triangles,geometries:v.renderer.info.memory.geometries,textures:v.renderer.info.memory.textures}});
 // Physical (non-button) hero picking, then ordinary inspection and resume.
 const hero=await page.evaluate(()=>{const {view3d:v}=__m2Test.state(),r=v.host.getBoundingClientRect(),p=v.project(90,555,2.8);return {x:r.left+p.x,y:r.top+p.y}});
 await page.mouse.click(hero.x,hero.y);await page.waitForSelector('#closeHero');assert.equal(await page.evaluate(()=>__m2Test.state().game.state),'inspecting');await page.locator('#closeHero').click();
 const target=await page.evaluate(()=>{const {game:g,view3d:v}=__m2Test.state(),r=v.host.getBoundingClientRect(),e=g.enemies.find(e=>e.id===105),p=v.project(e.x,e.y,1);return {x:r.left+p.x,y:r.top+p.y}});
 await page.mouse.click(target.x,target.y);await page.waitForFunction(()=>__m2Test.state().game.target!==null);
 await page.locator('#pause').click();await page.waitForFunction(()=>__m2Test.state().sfx.ctx.state==='suspended');const paused=await page.evaluate(()=>__m2Test.state().game.time);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>__m2Test.state().game.time),paused);for(const level of ['low','high','standard']){const snapshot=await page.evaluate(()=>JSON.stringify(__m2Test.state().game));await page.locator('#presentationQuality').selectOption(level);assert.equal(await page.evaluate(()=>JSON.stringify(__m2Test.state().game)),snapshot);await page.waitForFunction(level=>__m2Test.state().view3d.presentationQuality.level===level,level);}await page.locator('#resume').click();await page.waitForFunction(()=>__m2Test.state().sfx.ctx.state==='running');
 for(const expected of [2,3,1]){await page.locator('#speed').click();assert.equal(await page.evaluate(()=>__m2Test.state().speed),expected);}
 await page.evaluate(()=>{const {game:g}=__m2Test.state();g.powerCharge=g.powerNeeded;for(const s of g.spells)s.charge=s.need;__m2Test.hud();});
 await page.locator('#tacticalPower').click();await page.locator('[data-cast="meteor"]').click();await page.locator('[data-cast="blizzard"]').click();assert.equal(await page.evaluate(()=>__m2Test.state().game.powerUses),1);
 await page.evaluate(()=>{const {game:g}=__m2Test.state();g.enemies.find(e=>e.id===100).hp=0;});await page.waitForFunction(()=>__m2Test.state().view3d.fallenActors.length>0);
 await page.screenshot({path:artifacts+'/m2-enemy-death.png'});
 await page.waitForFunction(()=>__m2Test.state().game.collectedCoins>0);
 // Night and simulated rain are real environment lighting states with fixed dates.
 await page.evaluate(()=>window.__m2Date='2026-06-21T21:00:00Z');await page.waitForTimeout(150);await page.screenshot({path:artifacts+'/m2-mobile-night.png'});
 await page.evaluate(async()=>{const {weatherAt}=await import('/environment.js');for(let i=0;i<1000;i++){const ms=Date.UTC(2026,5,21,9,40)+i*420000;if(weatherAt(ms).rain>.7){window.__m2Date=new Date(ms).toISOString();break;}}});await page.waitForFunction(()=>__m2Test.state().view3d.environment.rain.visible,{timeout:20000});await page.screenshot({path:artifacts+'/m2-mobile-rain.png'});
 await page.setViewportSize({width:320,height:740});await page.waitForTimeout(150);await page.screenshot({path:artifacts+'/m2-narrow.png'});
 const positions=await page.evaluate(()=>{const {view3d:v}=__m2Test.state(),r=v.host.getBoundingClientRect();return Array.from(document.querySelectorAll('[data-inspect]')).map(b=>{const a=b.getBoundingClientRect();return {inside:a.left>=r.left&&a.right<=r.right&&a.top>=r.top&&a.bottom<=r.bottom,w:a.width,h:a.height};});});assert(positions.every(p=>p.inside&&p.h>=44));
 const wall=await page.evaluate(()=>({top:document.getElementById('wallHealth').getBoundingClientRect().top,bottom:Math.max(...Array.from(document.querySelectorAll('[data-inspect]'),b=>b.getBoundingClientRect().bottom))}));assert(wall.top>=wall.bottom+5,'wall HUD overlaps hero targets');
 await page.locator('[data-inspect="3"]').click();await page.waitForSelector('#closeHero');await page.locator('#closeHero').click();
 await page.setViewportSize({width:360,height:640});await page.waitForTimeout(150);await page.screenshot({path:artifacts+'/m2-short-portrait.png'});await page.locator('#pause').click();await page.locator('#presentationQuality').selectOption('low');await page.locator('#resume').click();for(let i=0;i<2;i++)await page.locator('#speed').click();assert.equal(await page.evaluate(()=>__m2Test.state().speed),3);await page.waitForTimeout(150);await page.screenshot({path:artifacts+'/m2-short-3x-low.png'});
 const performance=await page.evaluate(()=>{const {view3d:v}=__m2Test.state();return v.presentationStats();});assert(performance.particles<=95);
 // A complete empty encounter advances via the normal engine, including bonus.
 await page.evaluate(()=>{const {game:g}=__m2Test.state();g.enemies=[];g.effects=[];g.projectiles=[];g.flushLoot();g.waveSpawn=g.spawnTotal;g.intermission=0;});
 await page.waitForFunction(()=>__m2Test.state().game.wave>=4,{timeout:20000});
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>__m2Test.state().view3d.brassEffects.steam.visible),false);

 // Sustained actual engine combat: no synthetic impact effects or damage.
 await page.emulateMedia({reducedMotion:'no-preference'});
 const portrait=await page.evaluate(()=>__m2Test.state().view3d.capturePortrait(0));fs.writeFileSync(artifacts+'/m3-brass.webp',Buffer.from(portrait.split(',')[1],'base64'));
 await page.evaluate(()=>{const {game:g}=__m2Test.state();g.enemies=Array.from({length:36},(_,i)=>({id:500+i,type:i===35?3:i%3,definitionId:i===35?'forest-boss':i%3===0?'forest-grunt':i%3===1?'forest-runner':'forest-armored',x:80+i%4*110,y:200+Math.floor(i/4)*28,hp:100000,maxHp:100000,speed:0,damage:0,attack:1,burn:0,slow:0,flash:0,isBoss:i===35}));g.intermission=1000;g.nextXp=1e9;g.powerCharge=g.powerNeeded;for(const s of g.spells)s.charge=s.need;__m2Test.hud();});
 const stress=[];
 for(const quality of ['low','standard','high']){
  await page.evaluate(q=>__m2Test.state().view3d.setPresentationQuality(q),quality);
  await page.waitForTimeout(1200);
  for(let sample=0;sample<6;sample++) {await page.waitForTimeout(1000);stress.push(await page.evaluate(()=>{const {view3d:v,game:g}=__m2Test.state();return {...v.presentationStats(),time:g.time,geometries:v.renderer.info.memory.geometries,textures:v.renderer.info.memory.textures,heroes:v.heroes.size,enemies:v.actors.size};}));}
 }
 assert(stress.every(s=>s.heroes===4&&s.enemies===36));
 assert(stress.every(s=>s.particles<=({low:95,standard:227,high:447})[s.quality]));
 assert(stress.at(-1).time>stress[0].time);assert.equal(stress.at(-1).geometries,stress[0].geometries,'no geometry growth during sustained combat');assert(stress.at(-1).textures<=stress[0].textures+28,'only preallocated damage textures may upload lazily');
 fs.writeFileSync(artifacts+'/m3-stress.json',JSON.stringify(stress,null,2));
 await page.screenshot({path:artifacts+'/m3-stress.png'});
 await page.locator('#pause').click();await page.locator('#leave').click();await page.waitForSelector('#again');
 const settled=await page.evaluate(()=>__m2Test.state().save.coins);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>__m2Test.state().save.coins),settled);
 await page.locator('#again').click();await page.locator('[data-starter]').first().click();await page.waitForFunction(()=>__m2Test.state().game.state==='playing'&&__m2Test.state().game.time>0);
 assert.equal(await page.evaluate(()=>__m2Test.state().view3d.fallenActors.length),0,'restart clears corpses');

 await page.evaluate(()=>{const {game:g}=__m2Test.state();g.intermission=1000;g.xp=g.nextXp+27+6;g.checkLevel();});await page.waitForSelector('[data-option]');await page.screenshot({path:artifacts+'/m4-upgrade.png'});await page.locator('[data-option="0"]').click();await page.waitForFunction(()=>__m2Test.state().game.level===3);await page.waitForSelector('[data-option]');await page.locator('[data-option="0"]').click();await page.waitForFunction(()=>__m2Test.state().game.state==='playing');assert.equal(await page.evaluate(()=>__m2Test.state().game.xp),6);
 const audio=await page.evaluate(()=>{const a=__m2Test.state().sfx;return {voices:a.voices,beds:a.beds.length,score:!!a.score,settings:a.getSettings()};});assert(audio.voices<=28&&audio.beds===4&&audio.score);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'PASS',functional:['launch','starter','four defenders','Brass fire','physical hero picking','enemy picking','inspection','pause/resume','1x/2x/3x','leader power','meteor','blizzard','corpse','loot','wave progression','narrow hotspots','reduced motion','quality settings','short portrait','3x low quality'],stats,performance,positions,errors},null,2));
 fs.writeFileSync(artifacts+'/browser-results.json',JSON.stringify({stats,performance,positions,errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
