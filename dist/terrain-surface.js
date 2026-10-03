import * as T from './vendor/three.module.js';
// One repeatable 256px authored procedural albedo; no gameplay random source.
export function terrainSurface(){
 const canvas=globalThis.document?.createElement('canvas'),c=canvas?.getContext?.('2d');if(!c?.fillRect)return null;
 canvas.width=canvas.height=256;let seed=7349;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
 c.fillStyle='#c2b5a0';c.fillRect(0,0,256,256);
 for(let i=0;i<1600;i++){const shade=Math.floor(130+random()*80);c.fillStyle=`rgba(${shade},${shade-8},${shade-20},.23)`;c.fillRect(random()*256,random()*256,1+random()*5,1+random()*3);}
 for(let i=0;i<18;i++){c.fillStyle=i%3?'#6f655819':'#ede0bd24';c.beginPath();c.ellipse(random()*256,random()*256,8+random()*20,3+random()*9,random()*3,0,Math.PI*2);c.fill();}
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(12,48);return texture;
}
