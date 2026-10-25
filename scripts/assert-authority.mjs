import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

// Exact reviewed diffs only: no regex removal of arbitrary gameplay/presentation code.
const presentationPatches=JSON.parse(readFileSync(new URL('./stage3-authority-patches.json',import.meta.url),'utf8'));
export function preBossSource(text){
 text=normalizeLines(text);
 for(const addition of ["import {stepBossRam} from './boss-behavior.js';\n",'if(stepBossRam(this,e,dt))continue;']){
  if(text.includes(addition)){assert.equal(text.split(addition).length,2,'exactly one approved boss hook');text=text.replace(addition,'');}
 }
 return text;
}
export const normalizeLines=text=>text.replace(/\r\n/g,'\n');
export const OFFER_BEFORE='out[2]=recruit;';
export const OFFER_AFTER='out[out[2]===tactical?1:2]=recruit;';
export function authoritySource(text,file){
  text=normalizeLines(text);
  if(file==='engine.js')text=preBossSource(text);
  for(const patch of presentationPatches[file]||[]){assert.equal(text.split(patch.after).length,2,file+' exact approved Stage 3 hunk');text=text.replace(patch.after,patch.before);}
  if(file==='engine.js'&&text.includes(OFFER_AFTER)){
    assert.equal(text.split(OFFER_AFTER).length,2,'offer correction occurs exactly once');
    text=text.replace(OFFER_AFTER,OFFER_BEFORE);
  }
  return text;
}
export function assertAuthority(file,ref){
  const actual=readFileSync(new URL('../dist/'+file,import.meta.url),'utf8');
  const expected=execFileSync('git',['show',`${ref}:dist/${file}`],{encoding:'utf8'});
  assert.equal(authoritySource(actual,file),normalizeLines(expected),file+' preserves authority except exact approved offer/boss/presentation patches');
}
