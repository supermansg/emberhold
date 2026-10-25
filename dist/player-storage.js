import {migrateSave} from './progression.js';

let scope='guest';
const validId=id=>typeof id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
export const getPlayerScope=()=>scope;
export function setPlayerScope(id){if(id!=='guest'&&!validId(id))throw Error('Invalid account scope');scope=id;}
export const gameSaveKey=(id=scope)=>id==='guest'?'emberhold-v1':`emberhold-account-${id}-save-v1`;
export const recordKey=(id=scope)=>id==='guest'?'emberhold-profile-v1':`emberhold-account-${id}-record-v1`;
export function readStored(key){const value=globalThis.localStorage?.getItem(key);return value?JSON.parse(value):null;}
export function writeStored(key,value){try{globalThis.localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
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
 backupScope(id);
 const oldSave=globalThis.localStorage.getItem(gameSaveKey(id)),oldRecord=globalThis.localStorage.getItem(recordKey(id));
 try{
  globalThis.localStorage.setItem(gameSaveKey(id),JSON.stringify(migrateSave(snapshot.save)));
  if(snapshot.record)globalThis.localStorage.setItem(recordKey(id),JSON.stringify(snapshot.record));
 }catch(error){
  try{if(oldSave===null)globalThis.localStorage.removeItem(gameSaveKey(id));else globalThis.localStorage.setItem(gameSaveKey(id),oldSave);if(oldRecord===null)globalThis.localStorage.removeItem(recordKey(id));else globalThis.localStorage.setItem(recordKey(id),oldRecord);}catch{}
  throw error;
 }
}
