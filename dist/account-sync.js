function canonical(value){
 if(Array.isArray(value))return value.map(canonical);
 if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]));
 return value;
}
export function sameProgress(a,b){return !!a&&!!b&&JSON.stringify(canonical({version:a.version,save:a.save,record:a.record}))===JSON.stringify(canonical({version:b.version,save:b.save,record:b.record}));}

// This only decides ownership/revision reconciliation. It never adds rewards,
// chooses the richest save, or overwrites either copy itself.
export function reconcileAccount({remote,local,meta}){
 const revision=meta?.revision??0,pending=meta?.pending??null,dirty=!!(meta?.dirty||pending);
 if(!remote){
  if(revision>0)return {kind:'conflict'};
  return local?{kind:'local',revision:0,pending}:{kind:'new'};
 }
 if(!dirty||!local||sameProgress(remote.snapshot,local))return {kind:'cloud',revision:remote.revision};
 if(pending&&pending.id===remote.snapshot.writeId)return {kind:'local',revision:remote.revision,pending:null};
 if(revision===remote.revision)return {kind:'local',revision,pending};
 return {kind:'conflict'};
}

export function createSaveQueue({run,canRun=()=>true,onError=()=>{},delay=700,retries=[1000,4000,12000]}){
 let timer=null,running=false,wanted=false,disposed=false,attempt=0;
 const clear=()=>{if(timer!==null)clearTimeout(timer);timer=null;};
 const arm=ms=>{clear();timer=setTimeout(()=>{timer=null;void pump();},ms);};
 async function pump(){
  if(disposed||running||!wanted||!canRun())return;
  running=true;wanted=false;let failed=false;
  try{await run();attempt=0;}
  catch(error){
   failed=true;onError(error);
   if(!disposed&&!error.conflict&&!error.fatal&&attempt<retries.length){wanted=true;arm(retries[attempt++]);}
   else wanted=false;
  }finally{running=false;if(!disposed&&!failed&&wanted)arm(delay);}
 }
 return {
  schedule(){if(disposed)return;wanted=true;attempt=0;if(!running)arm(delay);},
  flush(){if(disposed)return Promise.resolve();wanted=true;clear();return pump();},
  cancel(){clear();wanted=false;attempt=0;},
  dispose(){disposed=true;clear();wanted=false;}
 };
}
