import {execFileSync} from 'node:child_process';

// Preservation tests compare real historical source. Vercel clones can omit it;
// fetch missing history rather than weakening or skipping those assertions.
const shallow=execFileSync('git',['rev-parse','--is-shallow-repository'],{encoding:'utf8'}).trim();
if(shallow==='true'){
 console.log('Fetching complete Git history required by preservation tests.');
 const remotes=execFileSync('git',['remote'],{encoding:'utf8'}).trim().split(/\s+/);
 // Vercel can strip remote configuration from its checkout. This repository's
 // canonical public read URL needs no credentials and changes no remote setting.
 const source=remotes.includes('origin')?'origin':'https://github.com/supermansg/emberhold.git';
 execFileSync('git',['fetch','--unshallow','--no-tags',source,'+refs/heads/*:refs/remotes/qa-history/*'],{stdio:'inherit',timeout:120000});
}
