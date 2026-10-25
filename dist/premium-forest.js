import * as T from './vendor/three.module.js';
// Deterministic art-only banks and ancient gate. Four instanced surface families;
// never occupies the combat lane or consumes the game's random stream.
export function buildPremiumForest(root){
 const stone=new T.MeshStandardMaterial({color:'#6f8580',roughness:.88});
 const moss=new T.MeshStandardMaterial({color:'#456d52',roughness:1});
 const gold=new T.MeshStandardMaterial({color:'#dbaf61',roughness:.36,metalness:.68});
 const glow=new T.MeshBasicMaterial({color:'#ffc779'});
 const dummy=new T.Object3D(),families=[
  new T.InstancedMesh(new T.BoxGeometry(1,1,1),stone,50),
  new T.InstancedMesh(new T.IcosahedronGeometry(1,1),moss,40),
  new T.InstancedMesh(new T.BoxGeometry(1,1,1),gold,24),
  new T.InstancedMesh(new T.BoxGeometry(1,1,1),glow,24)
 ];const counts=[0,0,0,0];
 const add=(kind,x,y,z,sx,sy,sz,angle=0)=>{dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(0,angle,0);dummy.updateMatrix();families[kind].setMatrixAt(counts[kind]++,dummy.matrix);};
 for(const side of [-1,1]){
  // Tapered terraced shoulders keep a clean, light-valued central lane.
  for(let i=0;i<12;i++){const z=-25+i*2.7,x=side*(7.7+Math.sin(i*1.7)*.5);add(1,x,.1,z,1.9,.38,1.8,i);}
  for(let i=0;i<4;i++){
   const x=side*(7.2+(i%2)*.6),z=-18+i*6.3,height=2.3+(i%2)*1.3;
   add(0,x,height*.5,z,.95,height,1.05,.08*side);add(0,x,height,z,1.35,.28,1.4);
   add(1,x+.1,height+.12,z,.65,.18,.72);
   add(2,x,height*.63,z+.55,.58,.09,.04);add(3,x,height*.63+.22,z+.57,.08,.3,.025);
  }
  // Far gate frames the enemy entrance, safely behind the logical arena.
  for(let i=0;i<6;i++)add(0,side*5.8,.5+i*1.05,-25,1.5,1,1.8,side*.02*i);
  add(0,side*4.5,6.4,-25,3.4,.8,1.8,-side*.12);
  add(2,side*5.8,5.5,-24.05,1.55,.18,.05);add(3,side*5.8,3.7,-24.07,.15,1.8,.04);
 }
 families.forEach((m,i)=>{m.count=counts[i];m.instanceMatrix.needsUpdate=true;m.castShadow=i===0;m.receiveShadow=i<3;root.add(m);});
 return families;
}
