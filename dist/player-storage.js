import {migrateSave} from './progression.js';

let scope='guest';
const blockedScopes=new Set();
const cacheGuard=new Map();
// A second tab changed this account's cache. Fail closed until reload rather
// than replacing its newer bytes with this tab's stale in-memory game state.
export function blockPlayerScope(id){if(id!=='guest')blockedScopes.add(id);}
const validId=id=>typeof id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
export const getPlayerScope=()=>scope;
export function setPlayerScope(id){if(id!=='guest'&&!validId(id))throw Error('Invalid account scope');scope=id;refreshGuard(id);}
export const gameSaveKey=(id=scope)=>id==='guest'?'emberhold-v1':`emberhold-account-${id}-save-v1`;
export const recordKey=(id=scope)=>id==='guest'?'emberhold-profile-v1':`emberhold-account-${id}-record-v1`;
export function readStored(key){const value=globalThis.localStorage?.getItem(key);return value?JSON.parse(value):null;}
function refreshGuard(id){cacheGuard.clear();if(id!=='guest')for(const key of [gameSaveKey(id),recordKey(id)])cacheGuard.set(key,globalThis.localStorage.getItem(key));}
export function writeStored(key,value){
 try{
  for(const id of blockedScopes)if(key===gameSaveKey(id)||key===recordKey(id))return false;
  if(cacheGuard.has(key)&&globalThis.localStorage.getItem(key)!==cacheGuard.get(key)){
   blockPlayerScope(scope);globalThis.dispatchEvent?.(new Event('emberhold-account-stale'));return false;
  }
  const accountKey=key.match(/^emberhold-account-([0-9a-f-]{36})-(?:save|record)-v1$/i);
  if(accountKey){
   // Commit intent first. A crash/quota error after the data write must never
   // leave a newer local cache marked clean and eligible for cloud replacement.
   const syncKey='emberhold-sync-'+accountKey[1],meta=readStored(syncKey)||{revision:0,pending:null};
   globalThis.localStorage.setItem(syncKey,JSON.stringify({...meta,dirty:true}));
  }
  const encoded=JSON.stringify(value);globalThis.localStorage.setItem(key,encoded);if(cacheGuard.has(key))cacheGuard.set(key,encoded);return true;
 }catch{return false;}
}
export function loadGameSave(id=scope){return migrateSave(readStored(gameSaveKey(id)));}
export function writeGameSave(save){
 try{
  // Preserve malformed source rather than replacing it with a new-game default.
  const previous=globalThis.localStorage.getItem(gameSaveKey());if(previous)JSON.parse(previous);
  if(!writeStored(gameSaveKey(),migrateSave(save)))return false;
  globalThis.dispatchEvent?.(new Event('emberhold-save-change'));return true;
 }catch{return false;}
}
export function backupScope(id=scope){
 const snapshot={save:readStored(gameSaveKey(id)),record:readStored(recordKey(id)),at:new Date().toISOString()};
 if(!writeStored(`emberhold-backup-${id}`,snapshot))throw Error('אין מקום לגיבוי. השמירה הקיימת נשארה ללא שינוי.');return snapshot;
}
export function applyStoredSnapshot(snapshot,id=scope){
 if(!snapshot||snapshot.version!==1||!snapshot.save||typeof snapshot.save!=='object')throw Error('גרסת שמירה לא נתמכת');
 if(blockedScopes.has(id))throw Error('החשבון השתנה בלשונית אחרת. יש לטעון מחדש.');
 if(id===scope&&id!=='guest')for(const key of [gameSaveKey(id),recordKey(id)])if(cacheGuard.has(key)&&globalThis.localStorage.getItem(key)!==cacheGuard.get(key)){
  blockPlayerScope(id);globalThis.dispatchEvent?.(new Event('emberhold-account-stale'));throw Error('ההתקדמות עודכנה בלשונית אחרת. לא הוחלפו נתונים.');
 }
 backupScope(id);
 const oldSave=globalThis.localStorage.getItem(gameSaveKey(id)),oldRecord=globalThis.localStorage.getItem(recordKey(id));
 try{
  globalThis.localStorage.setItem(gameSaveKey(id),JSON.stringify(migrateSave(snapshot.save)));
  if(snapshot.record)globalThis.localStorage.setItem(recordKey(id),JSON.stringify(snapshot.record));
  if(id===scope)refreshGuard(id);
 }catch(error){
  try{if(oldSave===null)globalThis.localStorage.removeItem(gameSaveKey(id));else globalThis.localStorage.setItem(gameSaveKey(id),oldSave);if(oldRecord===null)globalThis.localStorage.removeItem(recordKey(id));else globalThis.localStorage.setItem(recordKey(id),oldRecord);}catch{}
  throw error;
 }
}
