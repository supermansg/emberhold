export const AUTH_STORAGE_KEY='emberhold-auth-v2';
const LEGACY='sb-agwdfotqgurlknuhnnup-auth-token',MODE='emberhold-remember-session',REV='emberhold-session-optout-revision';
const suffixes=['','-code-verifier','-user'];

// The SDK persists through this adapter. A global opt-out may downgrade other
// clients; another tab's opt-in must never promote a private session to disk.
export function createSessionStore({local=globalThis.localStorage,session=globalThis.sessionStorage}={}){
 const revision=()=>Number(local.getItem(REV)||0);
 let allowedRevision=Number(session.getItem(REV)??revision());
 let remember=session.getItem(MODE)===null?local.getItem(MODE)!=='false':session.getItem(MODE)==='true';
 function remembered(){
  if(remember&&(local.getItem(MODE)==='false'||revision()>allowedRevision)){
   session.setItem(MODE,'false');remember=false;
  }
  return remember;
 }
 const target=()=>remembered()?local:session;
 if(remembered())for(const suffix of suffixes){
  const legacy=local.getItem(LEGACY+suffix),key=AUTH_STORAGE_KEY+suffix;
  if(legacy!==null){if(local.getItem(key)===null)local.setItem(key,legacy);local.removeItem(LEGACY+suffix);}
 }
 return {
  get remember(){return remembered();},
  getItem:key=>target().getItem(key),
  setItem(key,value){
   const active=target(),other=active===local?session:local,previous=active.getItem(key);active.setItem(key,value);
   const alternate=other.getItem(key);if(alternate!==null&&(alternate===previous||alternate===value))other.removeItem(key);
  },
  removeItem(key){
   const active=target(),other=active===local?session:local,previous=active.getItem(key);active.removeItem(key);
   if(previous!==null&&other.getItem(key)===previous)other.removeItem(key);
  },
  setRemember(value){
   const next=!!value;if(next===remembered())return;
   const from=target(),to=next?local:session,copies=[];
   // Destination first: a quota failure cannot discard the original session.
   for(const suffix of suffixes){const key=AUTH_STORAGE_KEY+suffix,token=from.getItem(key);if(token!==null){to.setItem(key,token);copies.push([key,token]);}}
   const nextRevision=revision()+(next?0:1);
   session.setItem(MODE,String(next));session.setItem(REV,String(nextRevision));
   local.setItem(REV,String(nextRevision));local.setItem(MODE,String(next));
   for(const [key,token] of copies)if(from.getItem(key)===token)from.removeItem(key);
   allowedRevision=nextRevision;remember=next;
  }
 };
}
