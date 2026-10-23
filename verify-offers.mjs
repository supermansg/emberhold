import assert from 'node:assert/strict';
import {Game} from './dist/engine.js';

const rng=seed=>()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
for(const seed of [7,...Array.from({length:1000},(_,i)=>i+1)]){
  for(const level of [2,3]){
    const game=new Game({random:rng(seed)});game.level=level;
    const offers=game.makeOptions();
    assert(offers.some(o=>o.kind==='הגנה'),`defense guarantee: seed ${seed}, level ${level}`);
    assert(offers.some(o=>o.id.startsWith('recruit-')),`recruit guarantee: seed ${seed}`);
    assert.equal(offers.length,3);assert.equal(new Set(offers.map(o=>o.id)).size,3);
  }
}
const full=new Game({random:rng(7)});[1,2,3].forEach(i=>full.addHero(i));full.level=2;
assert(!full.makeOptions().some(o=>o.id.startsWith('recruit-')));
for(let seed=1;seed<=1000;seed++){
  const game=new Game({random:rng(seed)});game.level=4;game.team[0].mastery=2;
  const offers=game.makeOptions();
  assert(offers.some(o=>o.kind==='גאדג׳ט'),`late tactical guarantee: seed ${seed}`);
  assert(offers.some(o=>o.id.startsWith('recruit-')));
  assert.equal(new Set(offers.map(o=>o.id)).size,3);
}
const exhausted=new Game({random:rng(7)});exhausted.level=2;
exhausted.stations=[{kind:'turret',rank:3},{kind:'frost',rank:3}];
assert.equal(exhausted.makeOptions().length,3);
console.log('PASS: seed 7 and 1,000 seeded early offer sets preserve defense, recruitment, uniqueness and eligibility.');
