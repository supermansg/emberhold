import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {Game} from './dist/engine.js';
// Compare actual M3 engine with XP choices disabled, isolating combat authority.
const source=execFileSync('git',['show','990b3f9:dist/engine.js'],{encoding:'utf8'}).replace(/from '\.\/([^']+)'/g,(_,p)=>`from '${new URL('./dist/'+p,import.meta.url).href}'`);
const {Game:Baseline}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const rng=()=>{let n=123456;return()=>((n=(1664525*n+1013904223)>>>0)/4294967296)};
for(let hero=0;hero<4;hero++)for(const speed of [1,2,3]){
 const old=new Baseline({hero,random:rng()}),current=new Game({hero,random:rng()});old.nextXp=current.nextXp=1e12;
 for(let frame=0;frame<1400;frame++){for(let n=0;n<speed;n++){old.step(.05);current.step(.05);}if(frame%100===0)assert.equal(JSON.stringify(current,(k,v)=>['presentation','burnPresentation','slowPresentation'].includes(k)?undefined:v),JSON.stringify(old,(k,v)=>['presentation','burnPresentation','slowPresentation'].includes(k)?undefined:v),`combat divergence hero${hero} speed${speed} frame${frame}`);}
}
console.log('PASS: M4/M3 seeded combat authority identical at every speed when intentional XP pacing is isolated.');
