// Read-only presentation envelopes. Cooldown anticipates readiness; damage never waits.
const PROFILES={gunner:[.14,.13,.11],umbra:[.16,.15,.12],sol:[.09,.08,.07],fire:[.18,.085,.12],electric:[.12,.035,.055],frost:[.17,.05,.085],aurora:[.2,.055,.09],briar:[.21,.04,.06],prism:[.14,.035,.06],cinder:[.18,.12,.12]};
export function attackPose(h,hasTarget=true,out={}){
 const p=PROFILES[h.id]||PROFILES.fire;
 out.prepare=hasTarget&&!h.reloading&&h.cd>0&&h.cd<p[0]&&!h.attackAnim?1-h.cd/p[0]:0;
 out.recoil=Math.pow(Math.min(1,Math.max(0,(h.attackAnim||0)/.22)),1.6);
 out.lean=p[1];out.arm=p[2];return out;
}
export function applyAttackMotion(actor,h,time,hasTarget,reduced=false){
 const d=actor.userData,p=attackPose(h,hasTarget,d.attackPose||(d.attackPose={}));if(reduced)return;
 const heavy=h.archetype==='gunner',q=p.prepare*p.prepare;
 d.body.rotation.x+=q*(heavy?-.055:.07)+p.recoil*p.lean;
 d.head.rotation.x+=q*.04-p.recoil*.025;
 for(const i of [1,3])if(d.limbs[i])d.limbs[i].rotation.x+=q*(heavy?-.12:-.42)+p.recoil*p.arm;
 if(d.weapon&&d.authored){d.weapon.position.z+=p.recoil*.09-q*.025;d.weapon.rotation.x+=p.recoil*.055;}
 if(h.id==='electric')d.body.rotation.z+=Math.sin(time*42)*q*.018;
}
