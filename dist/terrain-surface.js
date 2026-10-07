import * as T from './vendor/three.module.js';
// Shared small albedo atlas. Seed is local to art, never Game's random stream.
export function terrainSurface(){
 const canvas=globalThis.document?.createElement('canvas'),c=canvas?.getContext?.('2d');if(!c?.fillRect)return null;
 canvas.width=canvas.height=512;let seed=7349;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
 c.fillStyle='#9f9684';c.fillRect(0,0,512,512);
 for(let i=0;i<2800;i++){const shade=Math.floor(120+random()*90);c.fillStyle=`rgba(${shade},${shade-8},${shade-20},.2)`;c.fillRect(random()*512,random()*512,1+random()*6,1+random()*4);}
 // Uneven embedded stones, broad worn centers, thin earthy joints; no white polka dots.
 for(let i=0;i<44;i++){
  const x=random()*512,y=random()*512,w=14+random()*30,h=9+random()*19;
  const points=Array.from({length:7},(_,j)=>{const a=j*Math.PI*2/7,r=.72+random()*.28;return [x+Math.cos(a)*w*r,y+Math.sin(a)*h*r];});
  const v=Math.floor(143+random()*20);c.fillStyle=`rgb(${v},${v-3},${v-12})`;c.beginPath();points.forEach(([px,py],j)=>j?c.lineTo(px,py):c.moveTo(px,py));c.closePath();c.fill();
 }
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(7,26);return texture;
}
