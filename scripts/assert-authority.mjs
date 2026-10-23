import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

// Normalize checkout line endings only. Permit exactly the reviewed offer-slot fix.
export const normalizeLines=text=>text.replace(/\r\n/g,'\n');
export const OFFER_BEFORE='out[2]=recruit;';
export const OFFER_AFTER='out[out[2]===tactical?1:2]=recruit;';
export function authoritySource(text,file){
  text=normalizeLines(text);
  if(file==='engine.js'&&text.includes(OFFER_AFTER)){
    assert.equal(text.split(OFFER_AFTER).length,2,'offer correction occurs exactly once');
    text=text.replace(OFFER_AFTER,OFFER_BEFORE);
  }
  return text;
}
export function assertAuthority(file,ref){
  const actual=readFileSync(new URL('../dist/'+file,import.meta.url),'utf8');
  const expected=execFileSync('git',['show',`${ref}:dist/${file}`],{encoding:'utf8'});
  assert.equal(authoritySource(actual,file),normalizeLines(expected),file+' preserves authority except approved offer-slot fix');
}
