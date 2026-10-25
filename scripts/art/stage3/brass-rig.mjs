/** Reproducible authored Brass successor. Uses original project geometry, no external art.
 * Run node scripts/art/stage3/brass-rig.mjs. Original brass.glb is never written.
 * Four PBR material classes, independent rigid-armor skin weights, actual skeletal clips.
 */
import fs from 'node:fs';
import * as T from '../../../dist/vendor/three.module.js';
import {GLTFLoader} from '../../../dist/vendor/addons/loaders/GLTFLoader.js';
const source=fs.readFileSync(new URL('../../../dist/assets/models/brass.glb',import.meta.url));
const asset=await new GLTFLoader().parseAsync(source.buffer.slice(source.byteOffset,source.byteOffset+source.byteLength),'');
asset.scene.updateMatrixWorld(true);
const names=['Body','Head','Weapon','LegL','ArmL','LegR','ArmR'];
const objects=names.map(n=>asset.scene.getObjectByName(n));
const boneNodes=objects.map((o,i)=>{const parent=i===0?null:objects[0];const m=parent?parent.matrixWorld.clone().invert().multiply(o.matrixWorld):o.matrixWorld;const p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();m.decompose(p,q,s);return {name:o.name,translation:p.toArray(),rotation:q.toArray(),scale:s.toArray(),children:[]};});
boneNodes[0].children=[1,2,3,4,5,6];
const groups=Array.from({length:4},()=>({p:[],n:[],c:[],uv:[],j:[],w:[]}));
function addGeometry(geo,world,bone,color,kind){const g=geo.index?geo.toNonIndexed():geo;const normal=new T.Matrix3().getNormalMatrix(world),v=new T.Vector3(),n=new T.Vector3(),out=groups[kind];for(let i=0;i<g.attributes.position.count;i++){v.fromBufferAttribute(g.attributes.position,i).applyMatrix4(world);n.fromBufferAttribute(g.attributes.normal,i).applyMatrix3(normal).normalize();out.p.push(...v);out.n.push(...n);out.c.push(color.r,color.g,color.b);out.uv.push(v.x*.35,v.y*.35);out.j.push(bone,0,0,0);out.w.push(1,0,0,0);}if(g!==geo)g.dispose();}
asset.scene.traverse(o=>{if(!o.isMesh)return;let parent=o.parent;while(parent&&!names.includes(parent.name))parent=parent.parent;const b=names.indexOf(parent?.name);if(b<0)return;const m=o.material;const kind=m.name.includes('glass')?3:m.name.includes('hair')?2:m.metalness>.4?0:1;addGeometry(o.geometry,o.matrixWorld,b,m.color,kind);});
// A deep teal shoulder cape introduces a clean contrasting silhouette, kept behind the guns.
function part(geometry,pos,scale,color,kind,bone=0){const matrix=new T.Matrix4().compose(new T.Vector3(...pos),new T.Quaternion(),new T.Vector3(...scale));addGeometry(geometry,matrix,bone,new T.Color(color),kind);geometry.dispose();}
// Existing exported game coordinates have forward +Z, up +Y.
part(new T.CylinderGeometry(.48,.65,.80,12,1,true,0,Math.PI),[0,1.22,-.34],[1,1,.48],'#164f55',1);
// Engraved shoulder/cannon detail, glowing pressure gauge, belt cartridge rack.
for(const s of [-1,1]){part(new T.TorusGeometry(.18,.025,6,16),[s*.58,1.53,.17],[1,1,1],'#edba57',0);for(let k=0;k<3;k++)part(new T.CylinderGeometry(.045,.045,.20,8),[s*(.27+k*.085),.84,.30],[1,1,1],'#c78d42',0);}
part(new T.SphereGeometry(.10,12,8),[0,1.42,.37],[1,1,.27],'#48d4c4',3);
// glTF writer: all meshes share a skeleton and consolidated PBR classes.
const gltf={asset:{version:'2.0',generator:'EMBERHOLD authored Stage 3 Brass rig pipeline'},scene:0,scenes:[{nodes:[0,7]}],nodes:boneNodes,meshes:[],materials:[{name:'Brass and blued steel',pbrMetallicRoughness:{metallicFactor:.72,roughnessFactor:.36}},{name:'Leather skin and woven cape',pbrMetallicRoughness:{metallicFactor:0,roughnessFactor:.78},doubleSided:true},{name:'Copper hair',pbrMetallicRoughness:{metallicFactor:0,roughnessFactor:.64}},{name:'Teal lens enamel',pbrMetallicRoughness:{metallicFactor:.4,roughnessFactor:.19}}],skins:[],animations:[],accessors:[],bufferViews:[],buffers:[]};
const chunks=[];let size=0;
function accessor(array,type,componentType=5126,bounds=false){const align=(4-size%4)%4;if(align){chunks.push(Buffer.alloc(align));size+=align;}const typed=componentType===5123?new Uint16Array(array):new Float32Array(array);const data=Buffer.from(typed.buffer);const view=gltf.bufferViews.push({buffer:0,byteOffset:size,byteLength:data.length})-1;chunks.push(data);size+=data.length;const width={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16}[type];const a={bufferView:view,componentType,count:array.length/width,type};if(bounds){a.min=Array.from({length:width},(_,j)=>Math.min(...array.filter((_,i)=>i%width===j)));a.max=Array.from({length:width},(_,j)=>Math.max(...array.filter((_,i)=>i%width===j)));}return gltf.accessors.push(a)-1;}
const inverse=objects.flatMap(o=>o.matrixWorld.clone().invert().toArray());gltf.skins.push({name:'Brass seven-bone independent rig',joints:[0,1,2,3,4,5,6],skeleton:0,inverseBindMatrices:accessor(inverse,'MAT4')});
// Index complete vertex tuples; seam normals/colors remain distinct.
for(const g of groups){const unique={p:[],n:[],c:[],uv:[],j:[],w:[],indices:[]},seen=new Map();for(let i=0;i<g.p.length/3;i++){const values=[...g.p.slice(i*3,i*3+3),...g.n.slice(i*3,i*3+3),...g.c.slice(i*3,i*3+3),...g.uv.slice(i*2,i*2+2),...g.j.slice(i*4,i*4+4),...g.w.slice(i*4,i*4+4)];const key=values.map(v=>v.toFixed(6)).join(',');let index=seen.get(key);if(index===undefined){index=seen.size;seen.set(key,index);for(const [name,width] of [['p',3],['n',3],['c',3],['uv',2],['j',4],['w',4]])unique[name].push(...g[name].slice(i*width,i*width+width));}unique.indices.push(index);}Object.assign(g,unique);}
const primitives=groups.map((g,material)=>({indices:accessor(g.indices,'SCALAR',5123),attributes:{POSITION:accessor(g.p,'VEC3',5126,true),NORMAL:accessor(g.n,'VEC3'),COLOR_0:accessor(g.c,'VEC3'),TEXCOORD_0:accessor(g.uv,'VEC2'),JOINTS_0:accessor(g.j,'VEC4',5123),WEIGHTS_0:accessor(g.w,'VEC4')},material}));
gltf.meshes.push({name:'Brass premium consolidated skin',primitives});gltf.nodes.push({name:'BrassSkin',mesh:0,skin:0});
for(const [name,parent,pos] of [['Muzzle',2,[0,0,1.16]],['HeadSocket',1,[0,.65,0]],['HandL',4,[0,-.31,.42]],['HandR',6,[0,-.31,.42]]]){const original=asset.scene.getObjectByName(name);const p=original?original.position.toArray():pos;const idx=gltf.nodes.push({name,translation:p})-1;gltf.nodes[parent].children.push(idx);}
function clip(name,duration,poses){const a={name,samplers:[],channels:[]};const times=[0,duration*.2,duration*.5,duration*.8,duration];for(const bone of [0,1,2,3,4,5,6]){for(const path of ['rotation','translation']){const data=[];for(let i=0;i<times.length;i++){const pose=poses(i/4,bone);const rest=boneNodes[bone];if(path==='rotation'){const q=new T.Quaternion(...rest.rotation).multiply(new T.Quaternion().setFromEuler(new T.Euler(...(pose.r||[0,0,0]))));data.push(...q.toArray());}else data.push(...rest.translation.map((v,j)=>v+(pose.p?.[j]||0)));}const sampler=a.samplers.push({input:accessor(times,'SCALAR',5126,true),output:accessor(data,path==='rotation'?'VEC4':'VEC3'),interpolation:'LINEAR'})-1;a.channels.push({sampler,target:{node:bone,path}});}}gltf.animations.push(a);}
clip('idle',2.4,(t,b)=>({r:b===1?[0,Math.sin(t*Math.PI*2)*.025,0]:[0,0,0],p:b===0?[0,Math.sin(t*Math.PI*2)*.012,0]:[0,0,0]}));
clip('anticipation',.10,(t,b)=>({r:[b===2?-.055*t:b===0?-.025*t:0,0,0]}));
clip('release',.08,(t,b)=>{const f=Math.sin(t*Math.PI*.5);return {r:[b===2?.12*f:b===0?.07*f:b===4||b===6?.10*f:b===1?-.05*f:0,0,0],p:b===2?[0,0,-.15*f]:b===0?[0,-.015*f,-.055*f]:[0,0,0]};});
clip('recovery',.18,(t,b)=>{const f=(1-t)**2;return {r:[b===2?.12*f:b===0?.07*f:b===4||b===6?.10*f:b===1?-.05*f:0,0,0],p:b===2?[0,0,-.15*f]:b===0?[0,-.015*f,-.055*f]:[0,0,0]};});
clip('reload',1.2,(t,b)=>{const f=Math.sin(t*Math.PI);return {r:[b===2?-.20*f:b===1?.10*f:b===4?-.30*f:b===6?-.17*f:0,0,b===2?.12*f:0]};});
clip('impact',.32,(t,b)=>({r:[b===0?-.16*Math.sin(t*Math.PI):0,0,b===1?.1*Math.sin(t*Math.PI):0]}));
clip('death',.85,(t,b)=>({r:[b===0?-1.35*t:0,0,b===1?.2*t:0],p:b===0?[0,-.65*t,-.15*t]:[0,0,0]}));
gltf.buffers=[{byteLength:size}];let json=Buffer.from(JSON.stringify(gltf));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);let bin=Buffer.concat(chunks);bin=Buffer.concat([bin,Buffer.alloc((4-bin.length%4)%4)]);const header=Buffer.alloc(12);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+bin.length,8);const chunk=(length,type)=>{const b=Buffer.alloc(8);b.writeUInt32LE(length);b.writeUInt32LE(type,4);return b;};const output=Buffer.concat([header,chunk(json.length,0x4e4f534a),json,chunk(bin.length,0x004e4942),bin]);
fs.writeFileSync(new URL('../../../dist/assets/models/brass-stage3.glb',import.meta.url),output);
console.log(JSON.stringify({bytes:output.length,triangles:groups.reduce((n,g)=>n+g.indices.length/3,0),draws:4,bones:7,clips:gltf.animations.map(a=>a.name)}));
