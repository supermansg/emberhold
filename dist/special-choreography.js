import * as T from './vendor/three.module.js';
// Four reserved emitter rigs. No target selection, damage, or gameplay timers.
const COLORS={gunner:'#ffd38a',fire:'#ff8b3d',electric:'#83fff2',frost:'#bceaff',sol:'#ffe7a1',umbra:'#af98f2',briar:'#99efa6',cinder:'#ff7837',prism:'#e9a0ff',aurora:'#d9c9ff'};
export class SpecialChoreography {
 constructor(scene){this.scene=scene;this.geo=new T.TorusGeometry(.32,.018,4,24);this.crystal=new T.OctahedronGeometry(.09);this.round=new T.IcosahedronGeometry(.09,1);this.rigs=[];this.seen=new WeakSet();this.dummy=new T.Object3D();for(let i=0;i<4;i++){const root=new T.Group(),material=new T.MeshBasicMaterial({color:'#fff',transparent:true,depthWrite:false,toneMapped:false}),ring=new T.Mesh(this.geo,material),shards=new T.InstancedMesh(this.crystal,material,8);shards.frustumCulled=false;root.add(ring,shards);root.visible=false;scene.add(root);this.rigs.push({root,material,ring,shards,start:-100,arm:-100,id:'gunner'});}}
 arm(index,time){if(this.rigs[index])this.rigs[index].arm=time;}
 update(game,actors,reduced=false,quality='standard',loaded=false){if(this.game!==game){this.reset();this.game=game;}if(!game)return;const time=game.time;
 for(const f of game.effects)if(f.type==='special'&&f.presentation?.special>=2&&!this.seen.has(f)){this.seen.add(f);const index=game.team.findIndex(h=>h.id===f.presentation.heroId);if(index>=0)this.rigs[index].start=time-(f.maxLife-f.life);}
 for(let i=0;i<4;i++){const r=this.rigs[i],actor=actors.get(i),h=game.team[i];if(!actor||!h){r.root.visible=false;continue;}const age=time-r.start,press=time-r.arm,release=age>=0&&age<.8,charging=press>=0&&press<.3,ready=i===0&&game.powerCharge>=game.powerNeeded;const active=release||charging||ready;r.root.visible=active;if(!active)continue;
 const id=h.id,cold=['frost','aurora','prism'].includes(id),electric=id==='electric',heavy=['gunner','umbra','sol'].includes(id);r.material.color.set(COLORS[id]||h.color);
 const envelope=release?Math.max(0,1-age/.8):charging?.65+press: .2;const force=release&&!reduced?Math.sin(Math.min(1,age/.18)*Math.PI)*.08:0;
 actor.userData.body.rotation.x+=heavy?-force:force*.6;actor.userData.body.position.z+=heavy?force*.5:0;
 actor.updateMatrixWorld(true);(actor.userData.muzzle||actor).getWorldPosition(r.root.position);r.root.position.y+=.03;
 r.ring.rotation.set(Math.PI/2,0,reduced?0:time*(electric?5:cold?-.8:1));r.ring.scale.setScalar(release?1.2+age*6:charging?1+press: .65);r.material.opacity=envelope*(release?.8:.65);
 r.shards.geometry=cold||id==='briar'?this.crystal:this.round;r.shards.count=reduced||loaded?0:quality==='low'?3:quality==='high'?8:5;
 for(let j=0;j<r.shards.count;j++){const angle=j*Math.PI*2/r.shards.count+(reduced?0:time*(electric?9:1.5)),radius=release?.15+age*(heavy?1.5:1):.22;this.dummy.position.set(Math.cos(angle)*radius,Math.sin(angle)*radius,release?-age*.5:0);this.dummy.rotation.set(angle,angle*.7,0);this.dummy.scale.setScalar((cold?1.4:1)*envelope);this.dummy.updateMatrix();r.shards.setMatrixAt(j,this.dummy.matrix);}r.shards.instanceMatrix.needsUpdate=true;
 }}
 reset(){this.seen=new WeakSet();for(const r of this.rigs){r.start=r.arm=-100;r.root.visible=false;}}
 get particles(){return this.rigs.reduce((n,r)=>n+(r.root.visible?r.shards.count:0),0);}
 get active(){return this.rigs.reduce((n,r)=>n+Number(r.root.visible),0);}
 dispose(){if(this.disposed)return;this.disposed=true;for(const r of this.rigs){r.root.removeFromParent();r.material.dispose();r.shards.dispose();}this.geo.dispose();this.crystal.dispose();this.round.dispose();}
}
