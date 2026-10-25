import {migrateSave} from './progression.js';
import {normalizeRecord} from './player-record.js';

export function validateSnapshot(value){
 if(!value||value.version!==1||!value.save||typeof value.save!=='object'||Array.isArray(value.save))throw Error('גרסת שמירה בענן אינה נתמכת. לא הוחלפו נתונים.');
 return {...value,save:migrateSave(value.save),record:normalizeRecord(value.record)};
}
export async function fetchCloud(client,userId){
 const {data,error}=await client.from('player_progress').select('revision,snapshot,save_version').eq('user_id',userId).maybeSingle();
 if(error)throw error;if(data){if(data.save_version!==1)throw Error('גרסת ענן חדשה יותר');validateSnapshot(data.snapshot);}return data;
}
// A persisted request ID makes a retry after a lost response safe. A different
// revision is always a conflict, never an additive currency merge.
export async function writeCloud(client,userId,pending){
 const remote=await fetchCloud(client,userId);
 if(remote?.snapshot.writeId===pending.id)return remote;
 if((remote?.revision??0)!==pending.revision)throw Object.assign(Error('נמצאה שמירה חדשה ממכשיר אחר.'),{conflict:true});
 const snapshot={...validateSnapshot(pending.snapshot),writeId:pending.id};
 const row={snapshot,save_version:1,revision:pending.revision+1,updated_at:new Date().toISOString()};
 const query=remote?client.from('player_progress').update(row).eq('user_id',userId).eq('revision',pending.revision):client.from('player_progress').insert({...row,user_id:userId});
 const {data,error}=await query.select('revision,snapshot,save_version');
 if(error){if(error.code==='23505')throw Object.assign(Error('שמירה אחרת נוצרה. יש לבחור איזו לשמור.'),{conflict:true});throw error;}
 if(data?.length!==1)throw Object.assign(Error('השמירה השתנתה במכשיר אחר.'),{conflict:true});return data[0];
}
