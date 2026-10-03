import * as T from './vendor/three.module.js';
// One shared branch-whorl silhouette, instanced across the forest; no extra draws.
export function forestCrown(){
 const vertices=[],indices=[],sides=8,profile=[[.48,-.5],[.72,-.4],[.33,-.16],[.42,-.08],[0,.5]];
 for(let ring=0;ring<profile.length;ring++)for(let j=0;j<sides;j++){const a=j*Math.PI*2/sides,r=profile[ring][0]*(j%2?.82:1);vertices.push(Math.cos(a)*r,profile[ring][1]+(j%2&&ring<7?.04:0),Math.sin(a)*r);}
 for(let ring=0;ring<profile.length-1;ring++)for(let j=0;j<sides;j++){const a=ring*sides+j,b=ring*sides+(j+1)%sides;indices.push(a,a+sides,b,b,a+sides,b+sides);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
