import * as T from './vendor/three.module.js';
import {SHOCKWAVE} from './shockwave.js';
// Reserved singleton: essential wave front cannot be evicted by decorative pools.
export class ShockwaveView {
 constructor(scene){this.root=new T.Group();scene.add(this.root);this.geometry=new T.PlaneGeometry(1,1);this.material=new T.MeshBasicMaterial({color:'#bbfff1',transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide,toneMapped:false});this.core=new T.Mesh(this.geometry,this.material);this.core.rotation.x=-Math.PI/2;this.root.add(this.core);this.tailMaterial=this.material.clone();this.tail=new T.Mesh(this.geometry,this.tailMaterial);this.tail.rotation.x=-Math.PI/2;this.root.add(this.tail);this.debrisGeometry=new T.OctahedronGeometry(.06);this.debrisMaterial=new T.MeshBasicMaterial({color:'#c8bb90',transparent:true,depthWrite:false});this.debris=new T.InstancedMesh(this.debrisGeometry,this.debrisMaterial,12);this.debris.frustumCulled=false;this.root.add(this.debris);this.dummy=new T.Object3D();this.root.visible=false;}
 update(game,quality='standard',reduced=false,loaded=false){const s=game?.shockwave,total=SHOCKWAVE.charge+SHOCKWAVE.travel;this.root.visible=!!s&&s.age<total;if(!this.root.visible)return;const charge=s.age<SHOCKWAVE.charge,k=Math.min(1,Math.max(0,(s.age-SHOCKWAVE.charge)/SHOCKWAVE.travel)),z=(s.front-300)/35;
 this.core.rotation.x=charge?-Math.PI/5:-Math.PI/2;this.core.position.set(0,charge?1.5:.22,z);this.core.scale.set(12,charge?.25+s.age:.38,1);this.material.opacity=charge?.3+s.age*2:.9*(1-k*.65);
 this.tail.position.set(0,.115,z+.3);this.tail.scale.set(12,charge?.3:1.25,1);this.tailMaterial.opacity=charge?.12:.28*(1-k);
 this.debris.count=charge||reduced||loaded?0:quality==='low'?3:quality==='high'?12:7;this.debrisMaterial.opacity=(1-k)*.65;
 for(let i=0;i<this.debris.count;i++){this.dummy.position.set(-5.6+i*11.2/Math.max(1,this.debris.count-1),.12+Math.sin(k*Math.PI)*(.2+(i%3)*.09),z+.12+(i%3)*.16);this.dummy.rotation.set(k*4,i,k*2);this.dummy.scale.setScalar(1-k*.6);this.dummy.updateMatrix();this.debris.setMatrixAt(i,this.dummy.matrix);}this.debris.instanceMatrix.needsUpdate=true;
 }
 dispose(){if(this.disposed)return;this.disposed=true;this.root.removeFromParent();this.geometry.dispose();this.material.dispose();this.tailMaterial.dispose();this.debrisGeometry.dispose();this.debrisMaterial.dispose();this.debris.dispose();}
}
