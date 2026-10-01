// Procedural game audio. One context, bounded voices, no downloaded audio assets.
export class Soundscape {
 constructor(){this.enabled=true;this.voices=0;this.last=new Map();try{this.enabled=localStorage.getItem('emberhold-sound')!=='off'}catch{}}
 unlock(){if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=this.enabled?.55:0;const comp=this.ctx.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=5;this.master.connect(comp);comp.connect(this.ctx.destination);this.noise=this.ctx.createBuffer(1,this.ctx.sampleRate*2,this.ctx.sampleRate);const data=this.noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1);this.ambient=this.ctx.createGain();this.ambient.gain.value=0;this.ambient.connect(this.master);for(const f of [130.81,196,261.63]){const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type='sine';o.frequency.value=f;g.gain.value=.012;o.connect(g);g.connect(this.ambient);o.start();}const wind=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter();wind.buffer=this.noise;wind.loop=true;filter.type='lowpass';filter.frequency.value=380;const wg=this.ctx.createGain();wg.gain.value=.024;wind.connect(filter);filter.connect(wg);wg.connect(this.ambient);wind.start();}this.ctx.resume().catch(()=>{});}
 toggle(){this.unlock();this.enabled=!this.enabled;this.master?.gain.setTargetAtTime(this.enabled?.55:0,this.ctx.currentTime,.04);try{localStorage.setItem('emberhold-sound',this.enabled?'on':'off')}catch{}return this.enabled;}
 active(playing){if(this.isActive===playing)return;this.isActive=playing;if(this.ctx)this.ambient.gain.setTargetAtTime(playing?1:0,this.ctx.currentTime,.3);}
 voice(freq,dur,volume,type,cut,delay=0,pan=0){if(this.voices>=28)return;const ctx=this.ctx,now=ctx.currentTime+delay,source=type==='noise'?ctx.createBufferSource():ctx.createOscillator();if(type==='noise')source.buffer=this.noise;else{source.type=type;source.frequency.setValueAtTime(freq,now);source.frequency.exponentialRampToValueAtTime(Math.max(30,freq*.48),now+dur);}const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.setValueAtTime(cut,now);filter.frequency.exponentialRampToValueAtTime(Math.max(100,cut*.35),now+dur);const gain=ctx.createGain();gain.gain.setValueAtTime(.0001,now);gain.gain.linearRampToValueAtTime(volume,now+.004);gain.gain.exponentialRampToValueAtTime(.0001,now+dur);source.connect(filter);filter.connect(gain);const stereo=ctx.createStereoPanner?.();if(stereo){stereo.pan.value=Math.max(-.75,Math.min(.75,pan));gain.connect(stereo);stereo.connect(this.master);}else gain.connect(this.master);this.voices++;source.onended=()=>{this.voices--;source.disconnect();filter.disconnect();gain.disconnect();stereo?.disconnect();};if(type==='noise')source.start(now,Math.random());else source.start(now);source.stop(now+dur+.025);}
 play(kind,pan=0){if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;const now=this.ctx.currentTime,gate=kind==='gunner'?.07:kind==='loot'?.13:kind==='ready'?.55:.1;if(now-(this.last.get(kind)??-10)<gate||this.voices>=26)return;this.last.set(kind,now);
 // Layered transients, body and metallic/magical tails. Peak voice count is bounded.
 const layers={
 gunner:[[95,.09,.12,'sine',700],[0,.055,.13,'noise',3200],[1600,.055,.027,'triangle',2500,.035]],
 fire:[[0,.21,.1,'noise',1200],[90,.16,.065,'sine',350]],
 electric:[[0,.055,.075,'noise',4100],[1100,.15,.045,'triangle',2800]],
 frost:[[1800,.18,.05,'sine',3500],[2750,.24,.022,'triangle',4300,.025]],
 'impact-gunner':[[0,.06,.075,'noise',2600],[155,.085,.052,'sine',550]],
 'impact-fire':[[0,.27,.115,'noise',750],[62,.3,.085,'sine',250]],
 'impact-frost':[[2350,.16,.035,'triangle',4400],[0,.07,.035,'noise',3800]],
 'impact-electric':[[0,.06,.05,'noise',3800],[740,.13,.035,'triangle',2000]],
 reloadStart:[[0,.075,.065,'noise',1800],[580,.065,.04,'triangle',2100,.07]],
 reloadEnd:[[0,.045,.07,'noise',2800],[1250,.08,.032,'triangle',3100,.025]],
 ready:[[659,.15,.055,'sine',2500],[988,.26,.05,'sine',3000,.1]],
 key:[[1397,.13,.035,'sine',3000],[2093,.2,.025,'sine',4000,.06]],
 chest:[[130,.3,.075,'triangle',800],[0,.13,.085,'noise',1000],[784,.4,.065,'sine',2500,.12]],
 boom:[[58,.42,.14,'sine',350],[0,.42,.17,'noise',650]],
 wall:[[80,.16,.08,'sine',500],[0,.1,.075,'noise',1300]],
 'break-gunner':[[0,.14,.06,'noise',1900]],'break-fire':[[0,.22,.07,'noise',900]],'break-electric':[[940,.15,.035,'triangle',2400]],'break-frost':[[2600,.19,.035,'triangle',3500]],
 loot:[[1200,.11,.028,'sine',2200]],recruit:[[660,.2,.06,'triangle',2400],[990,.35,.055,'sine',2600,.1]],shield:[[380,.35,.07,'sine',1400]],level:[[880,.25,.065,'sine',2600],[1320,.35,.045,'sine',3000,.12]],win:[[523,.5,.05,'triangle',2000],[659,.5,.05,'sine',2200,.12],[784,.6,.05,'sine',2500,.24]],lose:[[165,.55,.07,'triangle',700]],ui:[[650,.07,.035,'sine',2200]]};
 const variation=['gunner','fire','electric','frost'].includes(kind)?.94+Math.random()*.12:1;for(const [freq,dur,volume,type,cut,delay=0]of layers[kind]||layers.ui)this.voice(freq*variation,dur,volume,type,cut,delay,pan);
 }
}
