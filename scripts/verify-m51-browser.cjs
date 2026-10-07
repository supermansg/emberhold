const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const artifacts=process.env.M2_ARTIFACTS || '/tmp/emberhold-m51-artifacts';fs.mkdirSync(artifacts,{recursive:true});
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
 for(let i=0;i<10;i++){const data=await page.evaluate(i=>__m2Test.state().view3d.capturePortrait(i),i);fs.writeFileSync(artifacts+'/hero-'+i+'.webp',Buffer.from(data.split(',')[1],'base64'));}

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
 // M4.1 mobile emergency power, gameplay cooldown and actual rendered front.
 const powerBounds=await page.locator('#shockwavePower').boundingBox();assert(powerBounds.width>=44&&powerBounds.height>=44&&powerBounds.x>=0&&powerBounds.x+powerBounds.width<=360);
 await page.locator('#shockwavePower').click();assert(await page.evaluate(()=>__m2Test.state().game.shockwave.cooldown>0));
 await page.locator('#pause').click();const cooldown=await page.evaluate(()=>__m2Test.state().game.shockwave.cooldown);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>__m2Test.state().game.shockwave.cooldown),cooldown);
 for(const bus of ['music','sfx','master']){await page.locator(`[data-audio="${bus}"]`).fill('0');await page.locator(`[data-audio="${bus}"]`).dispatchEvent('input');assert.equal(await page.evaluate(bus=>__m2Test.state().sfx.getSettings()[bus],bus),0);await page.locator(`[data-audio="${bus}"]`).fill('50');await page.locator(`[data-audio="${bus}"]`).dispatchEvent('input');}
 await page.locator('#resume').click();
 await page.evaluate(()=>{const {game:g}=__m2Test.state();g.intermission=1000;g.enemies=[];g.projectiles=[];g.effects=[];g.nextXp=1e9;for(let i=0;i<190;i++)g.step(.1);__m2Test.hud();});await page.waitForFunction(()=>!document.getElementById('shockwavePower').disabled);assert.equal(await page.locator('#shockwavePower').getAttribute('data-state'),'ready');
 const shock=await page.evaluate(()=>{const {game:g,view3d:v}=__m2Test.state();g.enemies=[0,1,2,3].map(type=>({id:900+type,type,definitionId:type===3?'forest-boss':type===0?'forest-grunt':type===1?'forest-runner':'forest-armored',x:90+type*105,y:510,hp:10000,maxHp:10000,speed:0,damage:0,attack:1,burn:0,slow:0,flash:0,isBoss:type===3}));for(const h of g.team)h.cd=100;document.getElementById('shockwavePower').click();g.step(.1);g.step(.1);const beforeContact=g.enemies.every(e=>e.y===510);g.step(.1);g.step(.1);g.step(.1);g.state='paused';v.render(g,performance.now());__m2Test.hud();return {beforeContact,y:g.enemies.map(e=>e.y),visible:v.shockwaveView.root.visible,age:g.shockwave.age};});assert(shock.visible);assert(shock.beforeContact,'enemies wait for front contact');assert(shock.y[1]<shock.y[0]&&shock.y[0]<shock.y[2]&&shock.y[2]<shock.y[3]);assert.equal(await page.locator('#shockwavePower').getAttribute('data-state'),'active');
 await page.screenshot({path:artifacts+'/m41-shockwave.png'});
 const fullLane=await page.evaluate(()=>{const {game:g,view3d:v}=__m2Test.state();g.state='playing';g.shockwave.cooldown=0;g.effects=[];g.enemies=[510,270,100,20].map((y,type)=>({id:980+type,type,x:100+type*100,y,hp:10000,maxHp:10000,speed:0,damage:0,attack:1,burn:0,slow:0,flash:0,isBoss:type===3}));g.activateShockwave();for(let i=0;i<12;i++)g.step(.1);g.step(.04);g.state='paused';v.render(g,performance.now());return {front:g.shockwave.front,y:g.enemies.map(e=>e.y),visible:v.shockwaveView.root.visible};});assert.equal(fullLane.front,0);assert.deepEqual(fullLane.y,[430,178,68,13.6]);assert(fullLane.visible,'front survives to far end before fading');await page.screenshot({path:artifacts+'/m51-full-lane.png'});

 await page.evaluate(()=>{__m2Test.state().game.state='playing';for(const h of __m2Test.state().game.team)h.cd=0;});
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
  await page.evaluate(()=>{const {game:g}=__m2Test.state();g.powerCharge=g.powerNeeded;g.activatePower();if(!g.shockwave?.cooldown)g.activateShockwave();});await page.waitForTimeout(1200);
  for(let sample=0;sample<6;sample++) {await page.waitForTimeout(1000);stress.push(await page.evaluate(()=>{const {view3d:v,game:g}=__m2Test.state();return {...v.presentationStats(),time:g.time,geometries:v.renderer.info.memory.geometries,textures:v.renderer.info.memory.textures,heroes:v.heroes.size,enemies:v.actors.size};}));}
 }
 assert(stress.every(s=>s.heroes===4&&s.enemies===36));
 assert(stress.every(s=>s.particles<=({low:95,standard:227,high:447})[s.quality]));
 assert(stress.at(-1).time>stress[0].time);assert.equal(stress.at(-1).geometries,stress[0].geometries,'no geometry growth during sustained combat');assert(stress.at(-1).textures<=stress[0].textures+28,'only preallocated damage textures may upload lazily');
 fs.writeFileSync(artifacts+'/m3-stress.json',JSON.stringify(stress,null,2));
 await page.screenshot({path:artifacts+'/m3-stress.png'});
 
 // Actual leader activation for both mechanical and electrical identities.
 for(const id of ['electric','gunner']){
  await page.evaluate(id=>{const {game:g,view3d:v}=__m2Test.state();g.team.sort((a,b)=>(a.id===id?-1:b.id===id?1:0));g.effects=[];g.projectiles=[];g.powerCharge=g.powerNeeded;g.state='playing';for(const h of g.team)h.cd=100;v.reset();__m2Test.teamUI();__m2Test.hud();},id);
  await page.locator('#tacticalPower').dispatchEvent('pointerdown');await page.waitForTimeout(100);await page.screenshot({path:artifacts+'/m51-'+id+'-charge.png'});
  const uses=await page.evaluate(()=>__m2Test.state().game.powerUses);await page.evaluate(()=>{const {game:g,view3d:v}=__m2Test.state();document.getElementById('tacticalPower').click();g.step(.035);g.state='paused';v.render(g,performance.now());});assert.equal(await page.evaluate(()=>__m2Test.state().game.powerUses),uses+1);await page.screenshot({path:artifacts+'/m51-'+id+'-release.png'});await page.evaluate(()=>__m2Test.state().game.state='playing');
 }
 assert.equal(await page.locator('.motion-fly').count(),48,'fixed reward node pool');assert(await page.evaluate(()=>__m2Test.state().sfx.voices<=28));
 await page.locator('#pause').click();await page.locator('#leave').click();await page.waitForSelector('#again');
 const settled=await page.evaluate(()=>__m2Test.state().save.coins);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>__m2Test.state().save.coins),settled);
 await page.locator('#again').click();await page.locator('[data-starter]').first().click();await page.waitForFunction(()=>__m2Test.state().game.state==='playing'&&__m2Test.state().game.time>0);
 assert.equal(await page.evaluate(()=>__m2Test.state().view3d.fallenActors.length),0,'restart clears corpses');

 await page.evaluate(()=>{const {game:g}=__m2Test.state();g.intermission=1000;g.xp=g.nextXp+27+6;g.checkLevel();});await page.waitForSelector('[data-option]');await page.screenshot({path:artifacts+'/m4-upgrade.png'});await page.locator('[data-option="0"]').click();await page.waitForFunction(()=>__m2Test.state().game.level===3);await page.waitForSelector('[data-option]');await page.locator('[data-option="0"]').click();await page.waitForFunction(()=>__m2Test.state().game.state==='playing');assert.equal(await page.evaluate(()=>__m2Test.state().game.xp),6);
 // Backgrounding during the 180ms card-selection motion must not resume combat.
 await page.evaluate(()=>{const {game:g}=__m2Test.state();g.xp=g.nextXp;g.checkLevel();});await page.waitForSelector('[data-option]');await page.evaluate(()=>{document.querySelector('[data-option]').click();Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});await page.waitForFunction(()=>__m2Test.state().game.state==='paused');const hiddenTime=await page.evaluate(()=>__m2Test.state().game.time);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>__m2Test.state().game.time),hiddenTime);await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});await page.locator('#resume').click();
 const audio=await page.evaluate(()=>{const a=__m2Test.state().sfx;return {voices:a.voices,beds:a.beds.length,score:!!a.score,settings:a.getSettings()};});assert(audio.voices<=28&&audio.beds===4&&audio.score);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'PASS',functional:['launch','starter','four defenders','Brass fire','physical hero picking','enemy picking','inspection','pause/resume','1x/2x/3x','leader power','meteor','blizzard','corpse','loot','wave progression','narrow hotspots','reduced motion','quality settings','short portrait','3x low quality','Shockwave native activation/recharge','Shockwave heavy/boss resistance','paused Shockwave','master/music/SFX mute'],stats,performance,positions,errors},null,2));
 fs.writeFileSync(artifacts+'/browser-results.json',JSON.stringify({stats,performance,positions,errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
