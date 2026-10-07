import {CUES} from './audio-cues.js';
const clamp=v=>Math.max(0,Math.min(1,Number.isFinite(+v)?+v:0));
const IMPORTANT=new Set(['ready','win','lose','level','recruit','shield','boom','boss','shockwave','shockwave-charge']);
// Temporary procedural fantasy score; independent cosmetic PRNG never consumes gameplay RNG.
export class Soundscape {
 constructor(){
  this.enabled=true;this.voices=0;this.last=new Map();this.live=new Set();this.beds=[];this.disposed=false;this.seed=0x41c6ce57;this.seenBolts=new WeakSet();
  this.targets=new WeakMap();this.settings={master:.55,music:.38,sfx:.8};this.scene={state:'lobby',boss:false,intensity:0,rain:0,paused:false};
  try{this.enabled=localStorage.getItem('emberhold-sound')!=='off';const saved=JSON.parse(localStorage.getItem('emberhold-audio-gains')||'null');if(saved)for(const k of Object.keys(this.settings))if(Number.isFinite(saved[k]))this.settings[k]=clamp(saved[k]);}catch{}
  this.hidden=()=>this.sync();globalThis.document?.addEventListener('visibilitychange',this.hidden);
 }
 random(){this.seed^=this.seed<<13;this.seed^=this.seed>>>17;this.seed^=this.seed<<5;return (this.seed>>>0)/4294967296;}
 getSettings(){return {...this.settings};}
 setGain(bus,value){if(!(bus in this.settings))return false;this.settings[bus]=clamp(value);try{localStorage.setItem('emberhold-audio-gains',JSON.stringify(this.settings));}catch{}this.sync();return true;}
 target(param,value,time=.15){if(!param||!this.ctx||this.targets.get(param)===value)return;this.targets.set(param,value);if(param.setTargetAtTime)param.setTargetAtTime(value,this.ctx.currentTime,time);else param.value=value;}
 unlock(){
  if(this.disposed)return;
  if(!this.ctx){const AC=globalThis.window?.AudioContext||globalThis.window?.webkitAudioContext;if(!AC)return;this.ctx=new AC();const c=this.ctx;
   this.master=c.createGain();this.music=c.createGain();this.sfx=c.createGain();this.ambient=c.createGain();
   const comp=c.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=5;this.master.connect(comp);comp.connect(c.destination);this.output=comp;
   this.music.connect(this.master);this.sfx.connect(this.master);this.ambient.connect(this.sfx);
   this.buses={};for(const name of ['weapons','impacts','abilities','enemies','environment','ui']){const g=c.createGain();g.gain.value=1;g.connect(name==='environment'?this.ambient:this.sfx);this.buses[name]=g;}
   this.noise=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const data=this.noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=this.random()*2-1;
   this.makeBed('wind',160,.003,-.5);this.makeBed('forest',900,.001,.6);this.makeBed('rain',950,0,.25);this.makeBed('fire',320,.002,-.3);
   this.makeMusic();this.sync();
  }
  if(!globalThis.document?.hidden&&!this.scene.paused)this.ctx.resume()?.catch(()=>{});
 }
 makeBed(name,frequency,volume,pan){const c=this.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),p=c.createStereoPanner?.();s.buffer=this.noise;s.loop=true;f.type=name==='forest'?'bandpass':'lowpass';f.frequency.value=frequency;g.gain.value=volume;s.connect(f);f.connect(g);if(p){p.pan.value=pan;g.connect(p);p.connect(this.buses.environment);}else g.connect(this.buses.environment);s.start(0,this.random());this.beds.push({name,source:s,gain:g,nodes:[s,f,g,p].filter(Boolean)});}
 makeMusic(){
  // One pre-rendered eight-bar phrase, looped by Web Audio: no scheduler or timer backlog.
  const c=this.ctx,duration=24,b=c.createBuffer(1,c.sampleRate*duration,c.sampleRate),data=b.getChannelData(0);
  const melody=[60,64,67,71,69,67,64,62,60,67,72,71,69,64,62,67];const bass=[48,45,53,55];
  for(let i=0;i<data.length;i++){const t=i/c.sampleRate,beat=Math.floor(t/1.5),phase=t%1.5,n=melody[beat%16],hz=440*2**((n-69)/12),env=Math.min(1,phase/.025)*Math.exp(-phase*3);const bhz=440*2**((bass[Math.floor(t/6)]-69)/12);data[i]=.055*env*(Math.sin(2*Math.PI*hz*t)+.2*Math.sin(4*Math.PI*hz*t))+.018*Math.sin(2*Math.PI*bhz*t)*Math.sin(Math.PI*(t%6)/6);}
  const s=c.createBufferSource(),g=c.createGain();s.buffer=b;s.loop=true;g.gain.value=1;s.connect(g);g.connect(this.music);s.start();this.score={source:s,gain:g,nodes:[s,g]};
 }
 toggle(){this.unlock();this.enabled=!this.enabled;try{localStorage.setItem('emberhold-sound',this.enabled?'on':'off');}catch{}this.sync();return this.enabled;}
 active(playing){this.isActive=!!playing;this.update({state:playing?'playing':'lobby'});}
 update(scene={}){if(this.disposed)return;Object.assign(this.scene,scene);this.sync();}
 sync(){if(!this.ctx||this.disposed)return;const hidden=!!globalThis.document?.hidden,paused=this.scene.paused||this.scene.state==='paused'||hidden;
  this.target(this.master.gain,this.enabled&&!paused?this.settings.master:0,.045);this.target(this.sfx?.gain,this.settings.sfx);const playing=this.scene.state==='playing';
  const focus=Math.max(0,Math.min(1,((this.focusUntil||0)-this.ctx.currentTime)/.35));for(const name of ['weapons','impacts'])this.target(this.buses?.[name]?.gain,1-focus*.55,.035);
  this.target(this.music?.gain,this.settings.music*(playing?(this.scene.boss?.65:.8):.55),.8);this.target(this.ambient?.gain,(playing?.45:.3)*(1-focus*.6),.1);
  const ambientTime=Math.floor(this.ctx.currentTime*2)/2;for(const bed of this.beds){const breath=Math.max(0,Math.sin(ambientTime*(bed.name==='wind'?.23:.41)+bed.name.length));const gain=bed.name==='rain'?clamp(this.scene.rain)*.0025:bed.name==='wind'?.0015*breath*breath:bed.name==='forest'?0:.0008*breath;this.target(bed.gain.gain,gain,.7);}
  if(this.score?.source.playbackRate)this.target(this.score.source.playbackRate,this.scene.boss?1.08:1,.8);
  if(paused&&!this.wasPaused)this.clearVoices();this.wasPaused=paused;this.desiredContextState=paused?'suspended':this.enabled?'running':null;this.reconcileContext();
 }
 reconcileContext(){
  if(this.disposed||!this.ctx||this.contextTransition||!this.desiredContextState||this.ctx.state===this.desiredContextState||this.ctx.state==='closed')return;
  const method=this.desiredContextState==='suspended'?'suspend':'resume';if(!this.ctx[method])return;
  this.contextTransition=true;let operation;try{operation=this.ctx[method]();}catch{this.contextTransition=false;return;}
  Promise.resolve(operation).then(()=>{this.contextTransition=false;this.reconcileContext();},()=>{this.contextTransition=false;});
 }
 busFor(kind){if(kind.startsWith('charge-')||kind.startsWith('special-')||kind.startsWith('heavy-')||kind.startsWith('shockwave'))return 'abilities';return kind.startsWith('impact')||kind.startsWith('break')?'impacts':['gunner','fire','electric','frost','nature','crystal','reloadStart','reloadEnd'].includes(kind)?'weapons':IMPORTANT.has(kind)?'abilities':['wall','chest'].includes(kind)?'enemies':'ui';}
 voice(freq,dur,volume,type,cut,delay=0,pan=0,bus='weapons',priority=0,endRatio=.48){
  if(this.disposed||!this.ctx)return false;const limit=priority?28:22;
  if(this.voices>=limit){if(!priority)return false;const victim=[...this.live].find(v=>v.priority<priority);if(!victim)return false;victim.finish(true);}
  const ctx=this.ctx,now=ctx.currentTime+delay,source=type==='noise'?ctx.createBufferSource():ctx.createOscillator();
  if(type==='noise')source.buffer=this.noise;else{source.type=type;source.frequency.setValueAtTime(Math.max(30,freq),now);source.frequency.exponentialRampToValueAtTime(Math.max(30,freq*endRatio),now+dur);}
  const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.setValueAtTime(cut,now);filter.frequency.exponentialRampToValueAtTime(Math.max(100,cut*.35),now+dur);
  const gain=ctx.createGain();gain.gain.setValueAtTime(.0001,now);gain.gain.linearRampToValueAtTime(volume,now+.004);gain.gain.exponentialRampToValueAtTime(.0001,now+dur);
  source.connect(filter);filter.connect(gain);const stereo=ctx.createStereoPanner?.();const dest=this.buses?.[bus]||this.sfx||this.master;if(stereo){stereo.pan.value=Math.max(-.75,Math.min(.75,pan));gain.connect(stereo);stereo.connect(dest);}else gain.connect(dest);
  const record={priority,finish:(stop=false)=>{if(!this.live.delete(record))return;this.voices=this.live.size;if(stop)try{source.stop();}catch{}for(const n of [source,filter,gain,stereo])n?.disconnect();}};this.live.add(record);this.voices=this.live.size;source.onended=()=>record.finish();if(type==='noise')source.start(now,this.random());else source.start(now);source.stop(now+dur+.025);return true;
 }
 play(kind,pan=0){if(!this.enabled||this.disposed||!this.ctx||this.ctx.state!=='running'||this.scene.paused||this.scene.state==='paused'||globalThis.document?.hidden)return;
  const now=this.ctx.currentTime,gate=kind==='gunner'?.07:kind==='loot'?.13:kind==='ready'?.55:.1;if(now-(this.last.get(kind)??-10)<gate)return;this.last.set(kind,now);
  if(kind.startsWith('special-')||kind==='shockwave'){this.focusUntil=now+.5;this.sync();}
  const variation=['gunner','fire','electric','frost','nature'].includes(kind)?.94+this.random()*.12:1;
  for(const [freq,dur,volume,type,cut,delay=0,endRatio=.48]of CUES[kind]||CUES.ui)this.voice(freq*variation,dur,volume,type,cut,delay,pan,this.busFor(kind),kind.startsWith('charge-')||kind.startsWith('special-')||kind.startsWith('shockwave')?2:IMPORTANT.has(kind)||kind.startsWith('heavy-')?1:0,endRatio);
 }
 combatEffects(effects=[]){if(!this.enabled||this.disposed||this.ctx?.state!=='running'||this.scene.paused||globalThis.document?.hidden)return;let index=0;for(const f of effects)if(f.type==='bolt'&&f.hero==='electric'&&f.presentation?.special>=2&&!this.seenBolts.has(f)){this.seenBolts.add(f);if(index>=5)continue;this.voice((f.presentation.heroId==='prism'?1568:1600)+index*140,f.presentation.heroId==='prism'?.14:.07,.018,f.presentation.heroId==='prism'?'sine':'triangle',2800,index*.035,0,'abilities',2);index++;}}
 clearVoices(){for(const v of [...this.live])v.finish(true);this.last.clear();}
 dispose(){if(this.disposed)return;this.disposed=true;globalThis.document?.removeEventListener('visibilitychange',this.hidden);this.clearVoices();for(const bed of [...this.beds,...(this.score?[this.score]:[])]){try{bed.source.stop();}catch{}for(const n of bed.nodes)n.disconnect();}this.beds=[];for(const n of [this.master,this.music,this.sfx,this.ambient,this.output,...Object.values(this.buses||{})])n?.disconnect();this.ctx?.close?.()?.catch(()=>{});this.noise=null;this.score=null;}
}
