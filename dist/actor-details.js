// Small, shared geometric details. Art identity follows the original hero sheet.
// All rigid pieces are merged by material by BattleView; moving parts stay on rigs.
export const ART_VERSION=2;
export function dressActor(T,piece,root,body,limbs,type,hero){
 const skin=hero?'#dfbb94':['#83a952','#c35e4e','#89719e','#555d68'][type];
 const hair=['#934c28','#b83c2e','#d0c9e5','#b1a5d9'][type];
 const trim=hero?(type<2?'#cba15d':'#829aaa'):'#535e59';
 const dark=hero?'#253e45':'#37403c';
 // Face: separate nose, eye whites, pupils and brow line instead of glowing slots.
 piece(body,'sphere',skin,0,1.61,.285,.065,.075,.08);
 for(const sign of [-1,1]){
  piece(body,'sphere',skin,sign*.335,1.65,0,.075,.105,.06);
  piece(body,'sphere',hero?'#fff0da':'#ffd08c',sign*.13,1.68,.279,.105,.069,.036);
  piece(body,'sphere',hero?'#263d46':'#482d21',sign*.13,1.679,.313,.041,.045,.02);
  piece(body,'sphere','#ffffff',sign*.13-.012,1.698,.331,.011,.013,.008);
  const brow=piece(body,'box',hero?hair:dark,sign*.14,1.772,.276,.15,.035,.04);brow.rotation.z=sign*(hero?.12:-.3);
 }
 piece(body,'box',hero?'#965c47':'#26352b',0,1.51,.282,.13,.021,.025);
 if(!hero){
  for(const sign of [-1,1]){const tooth=piece(body,'cone','#e9d7b1',sign*.095,1.48,.29,.035,.12,.035);tooth.rotation.z=sign*-.15;piece(body,'sphere',trim,sign*.45,1.24,.07,.24,.15,.27);}
  const strap=piece(body,'box',dark,0,1.06,.265,.08,.6,.055);strap.rotation.z=.7;
  if(type>=2){for(const sign of [-1,1])for(let j=0;j<2;j++){const spike=piece(body,'cone','#c6b38b',sign*(.42+j*.1),1.42,0,.065,.32,.065);spike.rotation.z=-sign*.6;}piece(body,'box',trim,0,1.74,-.02,.77,.09,.64);}
  return;
 }
 // Shared small armour details: belt buckle, boot caps and wrist guards.
 piece(body,'box',trim,0,.78,.278,.2,.15,.055);piece(body,'box',dark,0,.78,.315,.1,.08,.025);
 for(const sign of [-1,1]){piece(body,'box',trim,sign*.3,1.02,.225,.05,.47,.055);for(let j=0;j<3;j++)piece(body,'sphere',trim,sign*.43,1.34,.1+j*.07,.027,.027,.02);}
 for(let i=0;i<limbs.length;i++){const limb=limbs[i];if(i%2===0){piece(limb,'sphere',trim,0,-.25,.14,.15,.15,.07);piece(limb,'box',trim,0,-.49,.26,.28,.07,.025);}else{piece(limb,'cylinder',trim,0,-.28,.045,.13,.09,.13);}}
 const cloth=new T.Group();cloth.position.set(0,1.37,-.19);body.add(cloth);root.userData.cloth=cloth;
 if(type===0){
  // Brass: copper beard, goggles, steam canisters and ammunition pouches.
  for(let i=0;i<7;i++){const lock=piece(body,'sphere',hair,(i-3)*.072,1.43-Math.abs(i-3)*.008,.265,.085,.15-Math.abs(i-3)*.015,.085);lock.rotation.z=(i-3)*-.07;}
  for(const sign of [-1,1]){piece(body,'sphere',hair,sign*.095,1.54,.305,.125,.048,.042);piece(body,'sphere',trim,sign*.16,1.96,.2,.135,.105,.065);piece(body,'sphere','#3e7782',sign*.16,1.96,.254,.095,.069,.019);piece(body,'cylinder',trim,sign*.28,1.4,-.41,.15,.68,.15);piece(body,'cylinder','#ffc667',sign*.28,1.42,-.42,.112,.42,.112,true);piece(body,'box','#76573b',sign*.27,.67,.22,.19,.25,.14);}
  for(let j=0;j<5;j++){const lock=piece(body,'cone',hair,(j-2)*.12,2.05,-.01,.1,.27,.1);lock.rotation.z=(j-2)*-.22;}
  for(let j=0;j<4;j++)piece(body,'cylinder',trim,.24+j*.11,.85,-.36,.04,.25,.04);
 }else if(type===1){
  // Ember: swept red hair, flowing red coat and faceted flame jewel.
  for(let j=0;j<6;j++){const lock=piece(body,'sphere',hair,(j-2.5)*.11,1.97+Math.sin(j)*.07,-.12,.15,.17,.18);lock.rotation.z=(j-2.5)*.17;}
  for(const sign of [-1,1]){piece(cloth,'sphere',hair,sign*.29,.21,-.08,.18,.4,.16);const tail=piece(cloth,'cone','#953438',sign*.25,-.55,0,.38,1.14,.11);tail.rotation.z=sign*.17;piece(body,'sphere',trim,sign*.32,1.35,.02,.28,.08,.31);}
  piece(body,'cone','#ffc274',0,1.19,.29,.095,.23,.06,true);
 }else if(type===2){
  // Volt: silver hair, forehead goggles and a split wrench head.
  for(let j=0;j<7;j++){const lock=piece(body,'cone',hair,(j-3)*.095,2.04+Math.cos(j)*.06,-.03,.11,.35,.13);lock.rotation.z=(j-3)*-.2;}
  for(const sign of [-1,1]){piece(body,'sphere',trim,sign*.16,1.91,.235,.13,.12,.068);piece(body,'sphere','#9bebf1',sign*.16,1.91,.29,.085,.077,.025,true);const prong=piece(body,'box','#738991',.55+sign*.19,2.1,.18,.12,.45,.14);prong.rotation.z=sign*-.28;}
  piece(body,'sphere',trim,0,1.1,.26,.18,.18,.055);piece(body,'sphere','#80f0eb',0,1.1,.31,.12,.12,.033,true);
 }else{
  // Nova: lavender braids, fur collar and a crystalline hammer.
  for(let j=0;j<5;j++)piece(body,'sphere',hair,(j-2)*.13,1.98+Math.cos(j)*.04,-.06,.16,.13,.24);
  for(const sign of [-1,1])for(let j=0;j<4;j++)piece(cloth,'sphere',hair,sign*(.31+j*.015),.27-j*.13,.15,.095,.11,.1);
  for(let j=0;j<9;j++){const a=j*Math.PI/4.5;piece(body,'sphere','#d9dcec',Math.cos(a)*.38,1.37,Math.sin(a)*.23,.11,.1,.1);}
  piece(cloth,'cone','#7382b6',0,-.54,-.07,.68,1.18,.18);
  piece(body,'box','#7487ab',.55,1.98,.18,.78,.35,.32);for(const sign of [-1,1]){piece(body,'sphere','#b0e1f5',.55+sign*.34,1.98,.18,.24,.27,.24);piece(body,'cone','#c7f4ff',.55+sign*.34,2.26,.18,.12,.3,.12,true);}
 }
 // Every actor exposes its authored art revision for cache/fixture validation.
 root.userData.artVersion=ART_VERSION;
}
export function animateActorDetails(actor,t,kick=0,reduced=false){const cloth=actor.userData.cloth;if(cloth){cloth.rotation.x=reduced?0:Math.sin(t*1.7)*.04+kick*.09;cloth.rotation.z=reduced?0:Math.sin(t*.83+.7)*.025;}}
