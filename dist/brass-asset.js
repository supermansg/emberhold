import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/addons/loaders/GLTFLoader.js';
import {ActorPresentation} from './actor-presentation.js';
import {cloneSkinnedActor,brassPose} from './brass-animation.js';
// A single bounded asset cache shares immutable geometry/materials across portraits and runs.
let template=null,pending=null,instances=0,clips=[],assetVersion=5;
const required=['Body','Head','Weapon','Muzzle','LegL','ArmL','LegR','ArmR'];
function releaseTree(root){const geometry=new Set(),materials=new Set();root.traverse(o=>{if(o.geometry)geometry.add(o.geometry);if(o.material)for(const m of [].concat(o.material))materials.add(m);});for(const g of geometry)g.dispose();for(const m of materials)m.dispose();}
async function decodeAsset(file){
 const url=new URL('./assets/models/'+file,import.meta.url),controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),6000);
 try{const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw new Error('Brass asset HTTP '+response.status);const bytes=await response.arrayBuffer();return await new GLTFLoader().parseAsync(bytes,new URL('./',url).href);}
 finally{clearTimeout(timeout);}
}
export function loadBrassAsset(){
 if(template)return Promise.resolve(true);
 if(!pending)pending=decodeAsset('brass-stage3.glb').catch(()=>decodeAsset('brass.glb')).then(asset=>{
  if(required.some(n=>!asset.scene.getObjectByName(n))){releaseTree(asset.scene);throw new Error('Brass asset socket contract failed');}
  asset.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});template=asset.scene;clips=asset.animations;assetVersion=clips.length?3:5;return true;
 }).catch(error=>{pending=null;throw error;});
 return pending;
}
export function disposeBrassAsset(){if(instances||(pending&&!template))return false;if(template)releaseTree(template);template=null;pending=null;clips=[];return true;}
export function brassAssetStats(){return {loaded:!!template,instances,skeletal:clips.length>0,clips:clips.map(c=>c.name)};}
export function createBrassActor(){
 if(!template)return null;
 const root=clips.length?cloneSkinnedActor(template):template.clone(true);const get=n=>root.getObjectByName(n),body=get('Body'),head=get('Head'),weapon=get('Weapon'),muzzle=get('Muzzle');
 let torso;root.traverse(o=>{if(o.isMesh&&!torso)torso=o;});const limbs=['LegL','ArmL','LegR','ArmR'].map(get);
 const weaponBase=weapon.position.clone();instances++;
 const handle=new ActorPresentation(root,{clips,sockets:{muzzle,head:get('HeadSocket'),weapon,handL:get('HandL'),handR:get('HandR')},release:()=>{root.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose();});instances--;}});
 root.userData={body,head,weapon,muzzle,torso,limbs,weaponBase,sockets:handle.sockets,presentation:handle,authored:true,designedLook:true,artVersion:assetVersion,skeletal:clips.length>0,dispose:()=>handle.dispose()};
 return root;
}
export function animateBrassAsset(actor,state,time,reduced=false){
 const d=actor.userData;if(!d.authored)return;if(d.skeletal){const pose=brassPose(state,time,reduced);d.presentation.sample(pose.name,pose.phase);d.animationState=pose.name;return;}d.presentation.update(time);
 const kick=Math.min(1.7,Math.max(0,(state.attackAnim||0)/.22)),prepare=!state.reloading&&state.cd>0&&state.cd<.09?1-state.cd/.09:0;
 const reload=state.reloading?Math.sin(Math.PI*(1-Math.min(1,Math.max(0,state.cd)/(state.reload||1)))):0;
 d.animationState=state.reloading?'reload':kick>1?'special-release':kick>.3?'recoil':kick>0?'recovery':prepare?'anticipation':'combat-idle';
 d.body.position.set(0,reduced?0:Math.sin(time*2)*.013,reduced?0:kick*.07);
 d.body.rotation.set(reduced?0:kick*.06-prepare*.025,0,reduced?0:Math.sin(time*1.3)*.014);
 d.head.rotation.set(reduced?0:-kick*.055,reduced?0:Math.sin(time*.71)*.03,0);
 d.weapon.position.copy(d.weaponBase);d.weapon.position.z+=reduced?0:kick*kick*.13;
 d.weapon.rotation.set(reduced?0:kick*.08-prepare*.03,0,reduced?0:reload*.16);
 for(let i=0;i<4;i++)d.limbs[i].rotation.set(reduced?0:(i%2?kick*.12-reload*.22:kick*.025),0,0);
}
