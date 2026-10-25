import assert from 'node:assert/strict';
import {setPlayerScope,getPlayerScope,gameSaveKey,recordKey,loadGameSave,writeGameSave,applyStoredSnapshot,writeStored} from './dist/player-storage.js';
import {readRecord,normalizeRecord,beginRun,recordRun,updateIdentity} from './dist/player-record.js';
import {fetchCloud,writeCloud,validateSnapshot} from './dist/cloud-save.js';

class MemoryStorage{
 constructor(){this.data=new Map();this.failKey=null;this.failOnce=false;}
 getItem(k){return this.data.get(k)??null;}
 setItem(k,v){if(k===this.failKey){if(this.failOnce)this.failKey=null;throw Error('QuotaExceededError');}this.data.set(k,String(v));}
 removeItem(k){this.data.delete(k);}
 clear(){this.data.clear();this.failKey=null;}
}
const storage=new MemoryStorage();Object.defineProperty(globalThis,'localStorage',{value:storage,configurable:true});
const A='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',B='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const fresh=()=>{storage.clear();setPlayerScope('guest');};
const snapshot=coins=>({version:1,save:{coins},record:normalizeRecord(null)});
const run=(state='won')=>({state,wave:10,kills:120,bossKills:3,time:300,team:[{id:'gunner'},{id:'fire'},{id:'electric'},{id:'frost'}],intermission:0,waveSpawn:37,spawnTotal:37,enemies:[],loot:[],projectiles:[]});
let assertions=0;
function test(name,fn){fn();assertions++;console.log('PASS',name);}

test('Guest save retained with isolated account A/B records',()=>{
 fresh();writeGameSave({coins:77});const original=storage.getItem('emberhold-v1');
 setPlayerScope(A);assert.equal(loadGameSave().coins,0);writeGameSave({coins:100});updateIdentity({displayName:'Alice',avatar:'gunner'},loadGameSave());
 setPlayerScope(B);writeGameSave({coins:200});assert.notEqual(readRecord().identity.displayName,'Alice');
 setPlayerScope(A);assert.equal(loadGameSave().coins,100);assert.equal(readRecord().identity.displayName,'Alice');
 setPlayerScope('guest');assert.equal(storage.getItem('emberhold-v1'),original);assert.equal(loadGameSave().coins,77);
 assert.throws(()=>setPlayerScope('../other'));assert.equal(getPlayerScope(),'guest');
});
test('Malformed source is never replaced with default progress',()=>{
 fresh();storage.setItem(gameSaveKey(),'{broken');assert.throws(()=>loadGameSave());assert.equal(writeGameSave({coins:0}),false);assert.equal(storage.getItem(gameSaveKey()),'{broken');
});
test('Snapshot backup failure prevents all writes',()=>{
 fresh();writeGameSave({coins:90});storage.failKey='emberhold-backup-guest';assert.throws(()=>applyStoredSnapshot(snapshot(5)));assert.equal(loadGameSave().coins,90);
});
test('Second write failure rolls back both previous save and profile',()=>{
 fresh();writeGameSave({coins:90});writeStored(recordKey(),normalizeRecord({version:1,identity:{displayName:'Before'}}));const before=[storage.getItem(gameSaveKey()),storage.getItem(recordKey())];
 storage.failKey=recordKey();storage.failOnce=true;assert.throws(()=>applyStoredSnapshot(snapshot(5)));assert.deepEqual([storage.getItem(gameSaveKey()),storage.getItem(recordKey())],before);
});
test('Explicit account import backs up account while retaining guest',()=>{
 fresh();writeGameSave({coins:75});setPlayerScope(A);writeGameSave({coins:13});applyStoredSnapshot(snapshot(75));assert.equal(loadGameSave().coins,75);assert.equal(loadGameSave('guest').coins,75);assert.equal(JSON.parse(storage.getItem('emberhold-backup-'+A)).save.coins,13);
});
test('New tracking does not fabricate historical statistics',()=>{
 fresh();writeGameSave({coins:900,best:10,careerXp:9000});const r=readRecord();assert.equal(r.stats.runs,0);assert.equal(r.stats.wins,0);assert.deepEqual(r.history,[]);assert.deepEqual(r.achievements,[]);
});
test('Settlement is exactly once and achievements follow actual results',()=>{
 fresh();const g=run();beginRun(g);assert.equal(readRecord().stats.started,1);assert.equal(recordRun(g).ok,true);assert.equal(recordRun(g).duplicate,true);const r=readRecord();assert.equal(r.stats.runs,1);assert.equal(r.stats.wins,1);assert.equal(r.stats.kills,120);assert.equal(r.history.length,1);assert.equal(r.achievements.length,5);
});
test('Run bound to account cannot settle into a different account',()=>{
 fresh();setPlayerScope(A);const g=run();beginRun(g);setPlayerScope(B);assert.equal(recordRun(g).ok,false);assert.equal(readRecord().stats.runs,0);setPlayerScope(A);assert.equal(recordRun(g).ok,true);
});
test('Failed record write can retry without duplicate increments',()=>{
 fresh();const g=run('lost');beginRun(g);storage.failKey=recordKey();assert.equal(recordRun(g).ok,false);storage.failKey=null;assert.equal(recordRun(g).ok,true);assert.equal(readRecord().stats.losses,1);
});
test('Retirement only credits completely finished waves',()=>{
 fresh();const g=run('retired');g.wave=3;g.enemies=[{}];beginRun(g);recordRun(g);assert.equal(readRecord().stats.highestCompletedWave,2);assert.equal(readRecord().stats.retired,1);
});
test('Failed run-start storage is reported and recovered exactly once at settlement',()=>{
 fresh();const g=run('lost');storage.failKey=recordKey();assert.throws(()=>beginRun(g));storage.failKey=null;assert.equal(recordRun(g).ok,true);assert.equal(recordRun(g).duplicate,true);assert.equal(readRecord().stats.started,1);assert.equal(readRecord().stats.runs,1);
});
test('Future profile versions and invalid cloud envelopes rejected',()=>{
 assert.throws(()=>normalizeRecord({version:2}));assert.throws(()=>validateSnapshot({version:2,save:{}}));assert.throws(()=>validateSnapshot({version:1,save:[]}));assert.throws(()=>validateSnapshot({version:1,save:{},record:{version:2}}));
});
test('Profile identity rejects locked avatars and bounds input',()=>{
 fresh();assert.equal(updateIdentity({displayName:'A',avatar:'gunner'},loadGameSave()).ok,false);assert.equal(updateIdentity({displayName:'Test',avatar:'sol'},loadGameSave()).ok,false);assert.equal(updateIdentity({displayName:'Test',avatar:'gunner'},loadGameSave()).ok,true);
});

// Behavioral PostgREST double: evaluates predicates at commit time, supports a
// concurrent writer between fetch and update, and never emulates Supabase Auth.
class FakeClient{
 constructor(){this.rows=new Map();this.beforeCommit=null;this.writes=0;this.loseResponse=false;}
 from(table){assert.equal(table,'player_progress');const self=this;let filters=[],operation='read',body;
  const q={select(){if(operation!=='read')return commit();return q;},eq(k,v){filters.push([k,v]);return q;},maybeSingle(){const id=filters.find(([k])=>k==='user_id')?.[1];return Promise.resolve({data:structuredClone(self.rows.get(id)??null),error:null});},update(row){operation='update';body=row;return q;},insert(row){operation='insert';body=row;return q;}};
  async function commit(){self.beforeCommit?.();self.beforeCommit=null;const id=operation==='insert'?body.user_id:filters.find(([k])=>k==='user_id')?.[1],old=self.rows.get(id);
   if(operation==='insert'&&old)return {data:null,error:{code:'23505'}};
   if(operation==='update'&&(!old||filters.some(([k,v])=>k!=='user_id'&&old[k]!==v)))return {data:[],error:null};
   const row={...(old||{}),...structuredClone(body)};self.rows.set(id,row);self.writes++;if(self.loseResponse){self.loseResponse=false;throw Error('Response lost after commit');}return {data:[structuredClone(row)],error:null};
  }return q;
 }
}
async function asyncTest(name,fn){await fn();assertions++;console.log('PASS',name);}
await asyncTest('CAS inserts account-specific snapshot and retries idempotently',async()=>{
 const c=new FakeClient(),pending={id:'request-1',revision:0,snapshot:snapshot(80)};const first=await writeCloud(c,A,pending);assert.equal(first.revision,1);assert.equal(c.writes,1);await writeCloud(c,A,pending);assert.equal(c.writes,1);assert.equal(await fetchCloud(c,B),null);
});
await asyncTest('Lost response retry does not duplicate committed cloud writes',async()=>{
 const c=new FakeClient(),pending={id:'lost-response',revision:0,snapshot:snapshot(44)};c.loseResponse=true;await assert.rejects(writeCloud(c,A,pending));const result=await writeCloud(c,A,pending);assert.equal(result.revision,1);assert.equal(c.writes,1);
});
await asyncTest('Stale revision rejected before overwriting newer cloud data',async()=>{
 const c=new FakeClient();await writeCloud(c,A,{id:'first',revision:0,snapshot:snapshot(100)});await assert.rejects(writeCloud(c,A,{id:'stale',revision:0,snapshot:snapshot(3)}),e=>e.conflict===true);assert.equal(c.rows.get(A).snapshot.save.coins,100);
});
await asyncTest('Competing update between read and write rejected by CAS predicate',async()=>{
 const c=new FakeClient();await writeCloud(c,A,{id:'initial',revision:0,snapshot:snapshot(80)});c.beforeCommit=()=>{c.rows.set(A,{revision:2,save_version:1,snapshot:snapshot(200)})};await assert.rejects(writeCloud(c,A,{id:'race',revision:1,snapshot:snapshot(4)}),e=>e.conflict===true);assert.equal(c.rows.get(A).snapshot.save.coins,200);
});
await asyncTest('Concurrent first insert becomes explicit conflict',async()=>{
 const c=new FakeClient();c.beforeCommit=()=>c.rows.set(A,{revision:1,save_version:1,snapshot:snapshot(99)});await assert.rejects(writeCloud(c,A,{id:'racing-insert',revision:0,snapshot:snapshot(1)}),e=>e.conflict===true);assert.equal(c.rows.get(A).snapshot.save.coins,99);
});
await asyncTest('Unknown remote schema fails closed',async()=>{
 const c=new FakeClient();c.rows.set(A,{revision:1,save_version:2,snapshot:snapshot(100)});await assert.rejects(fetchCloud(c,A));assert.equal(c.writes,0);
});
fresh();console.log(`PASS ${assertions} player-storage/profile/cloud CAS checks. In-memory doubles only; live Auth/RLS are separate integration checks.`);
