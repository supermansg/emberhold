export const CUES={
 gunner:[[95,.09,.12,'sine',700],[0,.055,.13,'noise',3200],[1600,.055,.027,'triangle',2500,.035]],
 fire:[[0,.21,.1,'noise',1200],[90,.16,.065,'sine',350]],
 electric:[[0,.055,.075,'noise',4100],[1100,.15,.045,'triangle',2800]],
 frost:[[1800,.18,.05,'sine',3500],[2750,.24,.022,'triangle',4300,.025]],
 'impact-gunner':[[0,.06,.075,'noise',2600],[155,.085,.052,'sine',550]],
 'impact-fire':[[0,.27,.115,'noise',750],[62,.3,.085,'sine',250]],
 'impact-frost':[[2350,.16,.035,'triangle',4400],[0,.07,.035,'noise',3800]],
 'impact-electric':[[0,.06,.05,'noise',3800],[740,.13,.035,'triangle',2000]],
 reloadStart:[[0,.075,.065,'noise',1800],[580,.065,.04,'triangle',2100,.07]],
 reloadEnd:[[0,.045,.07,'noise',2800],[1250,.08,.032,'triangle',3100,.025]],
 ready:[[659,.15,.055,'sine',2500],[988,.26,.05,'sine',3000,.1]],
 key:[[1397,.13,.035,'sine',3000],[2093,.2,.025,'sine',4000,.06]],
 chest:[[130,.3,.075,'triangle',800],[0,.13,.085,'noise',1000],[784,.4,.065,'sine',2500,.12]],
 boom:[[58,.42,.14,'sine',350],[0,.42,.17,'noise',650]],
 wall:[[80,.16,.08,'sine',500],[0,.1,.075,'noise',1300]],
 'break-gunner':[[0,.14,.06,'noise',1900]],'break-fire':[[0,.22,.07,'noise',900]],'break-electric':[[940,.15,.035,'triangle',2400]],'break-frost':[[2600,.19,.035,'triangle',3500]],
 loot:[[1200,.11,.028,'sine',2200]],recruit:[[660,.2,.06,'triangle',2400],[990,.35,.055,'sine',2600,.1]],shield:[[380,.35,.07,'sine',1400]],level:[[880,.25,.065,'sine',2600],[1320,.35,.045,'sine',3000,.12]],win:[[523,.5,.05,'triangle',2000],[659,.5,.05,'sine',2200,.12],[784,.6,.05,'sine',2500,.24]],lose:[[165,.55,.07,'triangle',700]],ui:[[650,.07,.035,'sine',2200]]};
CUES.nature=[[392,.24,.035,"sine",1800],[587,.3,.022,"triangle",2400,.045],[0,.09,.025,"noise",800]];
CUES["impact-nature"]=[[196,.2,.04,"sine",900],[0,.12,.025,"noise",650]];
CUES["break-nature"]=[[294,.27,.025,"sine",1300]];
CUES.boss=[[98,.6,.055,"triangle",650],[146.83,.55,.035,"sine",900,.1],[196,.65,.045,"triangle",1200,.2],[0,.24,.04,"noise",450]];

// M4.1: signatures use body/tonal energy, short filtered tails, never more gain alone.
CUES['shockwave-charge']=[[130,.16,.035,'sine',300],[260,.12,.02,'triangle',600]];
CUES.shockwave=[[54,.38,.12,'sine',180],[0,.16,.075,'noise',550],[120,.22,.04,'triangle',420,.045],[0,.11,.025,'noise',1400,.12]];
const signatures={gunner:[[72,.3,.1,'sine',280],[0,.085,.085,'noise',1500],[330,.12,.035,'triangle',950,.045]],fire:[[0,.3,.065,'noise',650],[80,.3,.09,'sine',280],[190,.18,.035,'triangle',650,.06]],electric:[[0,.055,.07,'noise',2800],[140,.2,.07,'sine',600],[1500,.16,.035,'triangle',2400,.035]],frost:[[2100,.24,.045,'sine',3200],[105,.22,.06,'sine',450],[0,.12,.025,'noise',2000,.04]],sol:[[180,.12,.055,'triangle',900],[210,.13,.05,'triangle',1000,.065],[240,.15,.05,'triangle',1200,.13]],umbra:[[58,.32,.095,'sine',200],[0,.1,.07,'noise',950],[95,.24,.055,'triangle',450,.1]],briar:[[294,.35,.05,'sine',1000],[440,.3,.04,'sine',1600,.06],[0,.13,.015,'noise',450]],cinder:[[65,.32,.095,'sine',220],[0,.1,.075,'noise',1200],[390,.17,.03,'triangle',1800,.06]],prism:[[1568,.25,.035,'sine',3000],[2093,.28,.03,'sine',3800,.035],[110,.2,.055,'sine',420]],aurora:[[1760,.35,.035,'sine',3200],[2637,.32,.025,'sine',4000,.05],[82,.3,.07,'sine',280]]};
for(const [id,cue] of Object.entries(signatures)){CUES['special-'+id]=cue;CUES['heavy-'+id]=[cue[0],[0,.12,.035,'noise',id==='briar'?450:1000]];}
CUES['special-meteor']=signatures.fire;CUES['special-blizzard']=signatures.aurora;CUES['special-thunder']=signatures.electric;CUES['special-renewal']=signatures.briar;
export const soundIdentity=(id,fallback='gunner')=>id==='briar'||id==='renewal'?'nature':id==='prism'?'electric':id==='sol'||id==='umbra'?'gunner':id==='cinder'||id==='meteor'?'fire':id==='aurora'||id==='blizzard'?'frost':id==='thunder'?'electric':fallback;

CUES['heavy-meteor']=CUES['heavy-fire'];CUES['heavy-blizzard']=CUES['heavy-aurora'];CUES['heavy-thunder']=CUES['heavy-electric'];CUES['heavy-renewal']=CUES['heavy-briar'];
