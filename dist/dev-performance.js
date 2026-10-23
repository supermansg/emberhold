// Opt-in Vite development diagnostics. No telemetry, storage or gameplay writes.
export class FrameStats {
  constructor(limit=600){this.limit=limit;this.values=[];this.cursor=0;}
  add(ms){if(!Number.isFinite(ms)||ms<=0)return;if(this.values.length<this.limit)this.values.push(ms);else{this.values[this.cursor]=ms;this.cursor=(this.cursor+1)%this.limit;}}
  clear(){this.values=[];this.cursor=0;}
  summary(){if(!this.values.length)return null;const sorted=[...this.values].sort((a,b)=>a-b),meanMs=sorted.reduce((a,b)=>a+b,0)/sorted.length;return {samples:sorted.length,fps:1000/meanMs,meanMs,p95Ms:sorted[Math.ceil(sorted.length*.95)-1],maxMs:sorted.at(-1)};}
}

export function createDiagnostics(){
  if(!import.meta.env?.DEV)return null;
  const panel=document.createElement('details');panel.className='dev-performance';panel.dir='ltr';
  const title=document.createElement('summary');title.textContent='DEV performance';
  const output=document.createElement('pre');panel.append(title,output);document.body.append(panel);
  const stats=new FrameStats(),history=[];let last=null,lastReport=0,lastRenderFrame=-1,group='',snapshot=null;
  const reset=()=>{stats.clear();last=null;lastReport=0;group='';snapshot=null;history.length=0;};
  const api=Object.freeze({snapshot:()=>snapshot?structuredClone(snapshot):null,history:()=>structuredClone(history),reset});
  window.emberholdDiagnostics=api;
  return {frame(now,{game,speed,renderer,hidden,presentation=null,audioVoices=null}){
    if(hidden){last=null;return;}
    const nextGroup=[game?.state||'home',speed,game?.wave||0,innerWidth,innerHeight,presentation?.quality||'none'].join(':');
    if(nextGroup!==group){stats.clear();last=null;group=nextGroup;}
    if(last!==null)stats.add(now-last);last=now;
    if(now-lastReport<1000)return;lastReport=now;
    const fresh=!!renderer&&renderer.info.render.frame!==lastRenderFrame;
    if(renderer)lastRenderFrame=renderer.info.render.frame;
    snapshot={at:new Date().toISOString(),state:game?.state||'home',speed,wave:game?.wave||0,enemies:game?.enemies.length||0,effects:game?.effects.length||0,projectiles:game?.projectiles.length||0,frame:stats.summary(),renderer:fresh?{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures}:null,heapBytes:performance.memory?.usedJSHeapSize??null,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},rendererMode:renderer?'WebGL':'Canvas',visibility:document.visibilityState};
    snapshot.presentation=presentation;snapshot.audioVoices=audioVoices;
    history.push(snapshot);if(history.length>120)history.shift();
    const f=snapshot.frame,r=snapshot.renderer;
    output.textContent=`${snapshot.state} · ×${speed} · wave ${snapshot.wave}\nenemies ${snapshot.enemies} · FX ${snapshot.effects}\n${f?`RAF FPS ${f.fps.toFixed(1)} · mean ${f.meanMs.toFixed(1)} ms\np95 ${f.p95Ms.toFixed(1)} · max ${f.maxMs.toFixed(1)} ms`:'Collecting frame intervals…'}\n${r?`calls ${r.calls} · triangles ${r.triangles}\ngeometry ${r.geometries} · textures ${r.textures}`:'Renderer counters unavailable / no fresh render'}\nheap ${snapshot.heapBytes===null?'unsupported':(snapshot.heapBytes/1048576).toFixed(1)+' MiB'}\nquality ${presentation?.quality??'n/a'} · particles ${presentation?.particles??'n/a'} · voices ${audioVoices??'n/a'}\nDiagnostic overhead included; not GPU timing.`;
  }};
}
