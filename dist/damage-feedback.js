// Truthful presentation of existing coalesced engine numbers and callouts.
import * as T from './vendor/three.module.js';
import {HEROES} from './content.js';
const ELEMENTS=new Set(HEROES.filter(h=>h.archetype!=='gunner').map(h=>h.color));
const STYLE={normal:'#fff4d6',elemental:null,special:'#ffe18b',synergy:'#e3c3ff',shield:'#a9eaff',healing:'#a8f0b6'};
export function feedbackState(f,effects=[]){
 const text=f.text||'';if(/^\+\d+ HP$/.test(text))return 'healing';if(/SHIELD/.test(text))return 'shield';
 if(/COMBO|SHATTER|PIERCE/.test(text))return 'synergy';
 if(f.presentation?.special||/ULTIMATE|POWER/.test(text))return 'special';

 return ELEMENTS.has(f.color)?'elemental':'normal';
}
export class DamageFeedback {
 constructor(scene){this.scene=scene;this.slots=[];this.free=[];this.quality='standard';this.empty=new T.Group();this.empty.visible=false;this.empty.userData.damageFeedback=true;this.disposed=false;}
 warm(){if(this.slots.length||this.disposed)return;for(let i=0;i<28;i++){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=96;
  const o=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(canvas),transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));
  o.renderOrder=10;o.userData={damageFeedback:true,damageCanvas:canvas,busy:false,key:'',direction:new T.Vector3()};this.slots.push(o);this.free.push(o);
 }}
 setQuality(q){this.quality=q;}
 acquire(f,state=feedbackState(f)){
  if(this.disposed)return this.empty;this.warm();const normalLimit={low:10,standard:16,high:24}[this.quality]||16;
  const normals=this.slots.reduce((n,o)=>n+(o.userData.busy&&!o.userData.label),0);
  if(!f.label&&normals>=normalLimit)return this.empty;
  const o=this.free.pop();if(!o)return this.empty;o.userData.busy=true;o.userData.label=!!f.label;o.userData.state=state;o.material.opacity=1;o.visible=true;this.scene.add(o);this.paint(o,f,state);return o;
 }
 paint(o,f,state){if(o===this.empty)return;const key=[f.text,f.color,state,!!f.label].join(':');if(o.userData.key===key)return;o.userData.key=key;
  const c=o.userData.damageCanvas.getContext('2d');c.clearRect(0,0,256,96);c.font=f.label?'bold 28px Arial':'900 60px Arial';c.textAlign='center';c.lineWidth=f.label?7:10;c.strokeStyle='#0c202b';c.strokeText(f.text,128,66);c.fillStyle=STYLE[state]||f.color||STYLE.normal;c.fillText(f.text,128,66);o.material.map.needsUpdate=true;
 }
 update(o,f,camera,direction,height=640){
  if(o===this.empty)return;this.paint(o,f,o.userData.state);
  const age=Math.max(0,1-f.life/f.maxLife),pop=1+Math.sin(Math.min(1,age*4)*Math.PI)*.12;
  o.userData.direction.copy(direction);o.position.set((f.x-250)/35+direction.x*age*.18,(f.label?3.2:2.35)+age*.5,(f.y-300)/35+direction.z*age*.18);
  const unit=2*o.position.distanceTo(camera.position)*Math.tan(camera.fov*Math.PI/360)/Math.max(240,height),h=Math.max(f.label?.9:.8,unit*(f.label?28:25));
  o.scale.set(h*256/96*pop,h*pop,1);o.material.opacity=Math.pow(Math.max(0,1-age),1.7);
 }
 release(o){if(o===this.empty||!o.userData.busy)return;o.userData.busy=false;o.visible=false;o.removeFromParent();this.free.push(o);}
 reset(){for(const o of this.slots)this.release(o);}
 get active(){return this.slots.length-this.free.length;}
 get allocated(){return this.slots.length;}
 dispose(){if(this.disposed)return;this.reset();for(const o of this.slots){o.material.map.dispose();o.material.dispose();}this.disposed=true;}
}
