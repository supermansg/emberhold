import assert from 'node:assert/strict';
import {createSessionStore} from './dist/account-session.js';
import {reconcileAccount,sameProgress,createSaveQueue} from './dist/account-sync.js';
import {blockPlayerScope,setPlayerScope,writeStored,writeGameSave,gameSaveKey,recordKey} from './dist/player-storage.js';

class MemoryStorage {
 data=new Map(); blocked=false;
 getItem(k){return this.data.get(k)??null;}
 setItem(k,v){if(this.blocked||k===this.failKey)throw Error('quota');this.data.set(k,String(v));}
 removeItem(k){this.data.delete(k);}
}
let passed=0;
async function test(name,fn){await fn();passed++;console.log('PASS',name);}
const snap=coins=>({version:1,save:{coins},record:{identity:{displayName:'Keeper'}}});
await test('Remembered legacy session migrates once without duplicate token',()=>{
 const local=new MemoryStorage(),session=new MemoryStorage();local.setItem('sb-agwdfotqgurlknuhnnup-auth-token','fixture-token');
 const s=createSessionStore({local,session});assert.equal(s.remember,true);assert.equal(s.getItem('emberhold-auth-v2'),'fixture-token');assert.equal(local.getItem('sb-agwdfotqgurlknuhnnup-auth-token'),null);
 s.setRemember(false);assert.equal(local.getItem('emberhold-auth-v2'),null);assert.equal(session.getItem('emberhold-auth-v2'),'fixture-token');
 assert.equal(createSessionStore({local,session}).getItem('emberhold-auth-v2'),'fixture-token','reload retains tab session');
 assert.equal(createSessionStore({local,session:new MemoryStorage()}).getItem('emberhold-auth-v2'),null,'fresh browser session has no token');
});
await test('Failed persistence migration preserves original token and selection',()=>{
 const local=new MemoryStorage(),session=new MemoryStorage();local.setItem('sb-agwdfotqgurlknuhnnup-auth-token','fixture-token');local.blocked=true;
 assert.throws(()=>createSessionStore({local,session}));assert.equal(local.getItem('sb-agwdfotqgurlknuhnnup-auth-token'),'fixture-token');
 local.blocked=false;const s=createSessionStore({local,session});session.blocked=true;assert.throws(()=>s.setRemember(false));assert.equal(s.remember,true);assert.equal(s.getItem('emberhold-auth-v2'),'fixture-token');
});
await test('Session token is removed from both stores on signout',()=>{
 const local=new MemoryStorage(),session=new MemoryStorage();const s=createSessionStore({local,session});s.setRemember(false);s.setItem('emberhold-auth-v2','session-token');s.removeItem('emberhold-auth-v2');assert.equal(session.getItem('emberhold-auth-v2'),null);assert.equal(local.getItem('emberhold-auth-v2'),null);
});
await test('Another remembered tab cannot revive persistent tokens after session-only selection',()=>{
 const local=new MemoryStorage(),one=new MemoryStorage(),two=new MemoryStorage();const a=createSessionStore({local,session:one}),b=createSessionStore({local,session:two});a.setItem('emberhold-auth-v2','fixture-token');b.setRemember(false);a.setItem('emberhold-auth-v2','fixture-refreshed');assert.equal(local.getItem('emberhold-auth-v2'),null);assert.equal(one.getItem('emberhold-auth-v2'),'fixture-refreshed');
});
await test('Another tab opting in cannot upgrade a session-only account or replace its remembered account',()=>{
 const local=new MemoryStorage(),one=new MemoryStorage(),two=new MemoryStorage();const a=createSessionStore({local,session:one});a.setRemember(false);a.setItem('emberhold-auth-v2','fixture-A');
 const b=createSessionStore({local,session:two});b.setRemember(true);b.setItem('emberhold-auth-v2','fixture-B');
 a.setItem('emberhold-auth-v2','fixture-A-refreshed');assert.equal(one.getItem('emberhold-auth-v2'),'fixture-A-refreshed');assert.equal(local.getItem('emberhold-auth-v2'),'fixture-B');
 a.removeItem('emberhold-auth-v2');assert.equal(local.getItem('emberhold-auth-v2'),'fixture-B','A signout must not revoke B local session');
});
await test('Clean returning account chooses cloud automatically',()=>{
 assert.equal(reconcileAccount({remote:{revision:9,snapshot:snap(42)},local:snap(5),meta:{revision:3,dirty:false}}).kind,'cloud');
});
await test('Same-base dirty cache resumes without summing currency',()=>{
 const r=reconcileAccount({remote:{revision:9,snapshot:snap(42)},local:snap(43),meta:{revision:9,dirty:true}});assert.equal(r.kind,'local');assert.equal(r.revision,9);
 assert.equal(reconcileAccount({remote:{revision:10,snapshot:snap(42)},local:snap(43),meta:{revision:9,dirty:true}}).kind,'conflict');
});
await test('Lost acknowledgement preserves later edits and adopts committed revision',()=>{
 const pending={id:'request-1',revision:8,snapshot:snap(42)},remote={revision:9,snapshot:{...snap(42),writeId:'request-1'}};
 assert.equal(reconcileAccount({remote,local:snap(42),meta:{revision:8,dirty:true,pending}}).kind,'cloud');
 const r=reconcileAccount({remote,local:snap(43),meta:{revision:8,dirty:true,pending}});assert.equal(r.kind,'local');assert.equal(r.revision,9);assert.equal(r.pending,null);
});
await test('New account uses account cache but never assumes a guest import',()=>{
 assert.equal(reconcileAccount({remote:null,local:null,meta:null}).kind,'new');
 assert.equal(reconcileAccount({remote:null,local:snap(8),meta:{revision:0,dirty:true}}).kind,'local');
 assert.equal(reconcileAccount({remote:null,local:snap(8),meta:{revision:4,dirty:true}}).kind,'conflict','deleted server row cannot erase known cloud base');
});
await test('Progress equality ignores request ID and property order, not economy/profile',()=>{
 assert(sameProgress(snap(5),{writeId:'other',record:{identity:{displayName:'Keeper'}},save:{coins:5},version:1}));assert(!sameProgress(snap(5),snap(6)));
});
await test('Stale account tab cannot overwrite local gameplay or profile after invalidation',()=>{
 const local=new MemoryStorage();Object.defineProperty(globalThis,'localStorage',{value:local,configurable:true});
 const id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';setPlayerScope(id);assert(writeGameSave({coins:9}));const before=local.getItem(gameSaveKey());blockPlayerScope(id);
 assert.equal(writeGameSave({coins:1}),false);assert.equal(writeStored(recordKey(),{version:1}),false);assert.equal(local.getItem(gameSaveKey()),before);
 setPlayerScope('guest');assert(writeGameSave({coins:5}));
});
await test('Before storage event delivery, raw-cache CAS rejects another tab overwrite',()=>{
 const id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';setPlayerScope(id);assert(writeGameSave({coins:9}));
 localStorage.setItem(gameSaveKey(),JSON.stringify({coins:99}));assert.equal(writeGameSave({coins:10}),false);assert.equal(JSON.parse(localStorage.getItem(gameSaveKey())).coins,99);setPlayerScope('guest');
});
await test('Dirty intent must be durable before account progression changes',()=>{
 const id='cccccccc-cccc-cccc-cccc-cccccccccccc';setPlayerScope(id);assert(writeGameSave({coins:42}));
 const key='emberhold-sync-'+id;localStorage.setItem(key,JSON.stringify({revision:2,dirty:false,pending:null}));localStorage.failKey=key;
 assert.equal(writeGameSave({coins:43}),false);assert.equal(JSON.parse(localStorage.getItem(gameSaveKey())).coins,42);
 localStorage.failKey=null;assert(writeGameSave({coins:43}));assert.equal(JSON.parse(localStorage.getItem(key)).dirty,true);setPlayerScope('guest');
});
await test('Queue debounces, coalesces edits during flight and limits retry',async()=>{
 let calls=0,release;const errors=[];
 const q=createSaveQueue({delay:5,retries:[5,5],run:async()=>{calls++;if(calls===1)await new Promise(r=>release=r);},onError:e=>errors.push(e)});
 q.schedule();q.schedule();await new Promise(r=>setTimeout(r,20));assert.equal(calls,1);q.schedule();release();await new Promise(r=>setTimeout(r,25));assert.equal(calls,2);q.dispose();
 let failures=0;const failing=createSaveQueue({delay:1,retries:[2,2],run:async()=>{failures++;throw Error('offline');},onError:e=>errors.push(e)});failing.schedule();await new Promise(r=>setTimeout(r,35));assert.equal(failures,3);failing.dispose();
 let conflicts=0;const conflict=createSaveQueue({delay:1,retries:[2],run:async()=>{conflicts++;throw Object.assign(Error('conflict'),{conflict:true});}});conflict.schedule();await new Promise(r=>setTimeout(r,15));assert.equal(conflicts,1);conflict.dispose();
});
console.log(`PASS ${passed} account-first foundation checks (storage/transport fixtures, not real Auth).`);
