import {execFileSync} from 'node:child_process';

// Preservation tests compare real historical source. Vercel clones can omit it;
// fetch missing history rather than weakening or skipping those assertions.
const shallow=execFileSync('git',['rev-parse','--is-shallow-repository'],{encoding:'utf8'}).trim();
if(shallow==='true'){
 console.log('Fetching complete Git history required by preservation tests.');
 execFileSync('git',['fetch','--unshallow','--no-tags','origin'],{stdio:'inherit',timeout:120000});
}
