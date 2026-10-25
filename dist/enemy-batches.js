import * as T from './vendor/three.module.js';
// Color-bake rigid joint surfaces, never joint transforms. Shared cached geometry
// retains authored silhouettes and separate torso hit feedback with fewer draws.
const cache=new Map();
const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.82,metalness:.08});
export function compactEnemy(actor){
 const visit=group=>{
  for(const child of [...group.children])if(!child.isMesh)visit(child);
  const parts=group.children.filter(m=>m.isMesh&&m!==actor.userData.torso&&!Array.isArray(m.material)&&!m.material.map&&!m.material.transparent&&!m.material.emissive?.getHex());
  if(parts.length<2)return;
  for(const m of parts)m.updateMatrix();
  const key=parts.map(m=>m.geometry.uuid+':'+m.material.color.getHex()+':'+m.matrix.elements.join(',')).join('|');
  let geometry=cache.get(key);
  if(!geometry){
   const sources=parts.map(m=>{const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(m.matrix);return g;});
   geometry=new T.BufferGeometry();let count=sources.reduce((n,g)=>n+g.attributes.position.count,0);
   for(const name of ['position','normal']){const out=new Float32Array(count*3);let offset=0;for(const g of sources){out.set(g.attributes[name].array,offset);offset+=g.attributes[name].array.length;}geometry.setAttribute(name,new T.BufferAttribute(out,3));}
   const colors=new Float32Array(count*3);let offset=0;for(let i=0;i<sources.length;i++){const c=parts[i].material.color;for(let j=0;j<sources[i].attributes.position.count;j++){colors[offset++]=c.r;colors[offset++]=c.g;colors[offset++]=c.b;}}
   geometry.setAttribute('color',new T.BufferAttribute(colors,3));geometry.computeBoundingSphere();sources.forEach(g=>g.dispose());cache.set(key,geometry);
  }
  const merged=new T.Mesh(geometry,material);merged.castShadow=parts.some(m=>m.castShadow);merged.receiveShadow=true;
  parts.forEach(m=>m.removeFromParent());group.add(merged);
 };visit(actor);return actor;
}
