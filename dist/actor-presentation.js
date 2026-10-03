// Rendering-only adapter. Loaders own asset decoding; handles own instance lifecycle.
import * as T from './vendor/three.module.js';
export class ActorPresentation {
 constructor(root,{sockets={},clips=[],release=()=>{},lod=[]}={}){
  if(!root?.isObject3D)throw new TypeError('Actor requires an Object3D');
  this.root=root;this.sockets=sockets;this.clips=new Map(clips.map(c=>[c.name,c]));this.release=release;this.lod=lod;this.disposed=false;this.lastTime=null;
  this.mixer=clips.length?new T.AnimationMixer(root):null;
 }
 socket(name){return this.sockets[name]||this.root;}
 attach(name,object){if(this.disposed)throw new Error('Actor disposed');this.socket(name).add(object);return ()=>object.removeFromParent();}
 play(name){if(this.disposed||!this.mixer||!this.clips.has(name)||this.current===name)return false;const next=this.mixer.clipAction(this.clips.get(name));this.action?.fadeOut(.1);next.reset().fadeIn(.1).play();this.action=next;this.current=name;return true;}
 update(time){if(this.disposed||!Number.isFinite(time))return;const dt=this.lastTime===null?0:Math.max(0,time-this.lastTime);this.lastTime=time;this.mixer?.update(dt);}
 setQuality(quality){if(this.disposed)return;for(const item of this.lod)item.object.visible=quality!=='low'||item.essential;}
 dispose(){if(this.disposed)return;this.disposed=true;this.mixer?.stopAllAction();this.mixer?.uncacheRoot(this.root);this.root.removeFromParent();this.release();}
 // An injected trusted GLB loader can return {root, clips, sockets, release}.
 // Failure returns a real procedural actor, never a dummy/unready model.
 static async load(load,fallback,{signal}={}){
  let asset;
  try{asset=await load();if(signal?.aborted){asset?.release?.();throw new Error('Actor load cancelled');}return new ActorPresentation(asset.root,asset);}
  catch(error){if(signal?.aborted)throw error;asset?.release?.();const root=fallback();const handle=root.userData.presentation||new ActorPresentation(root,{sockets:root.userData.sockets,release:()=>root.userData.dispose?.()});handle.fallbackReason=String(error.message||error);return handle;}
 }
}
