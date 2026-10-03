// Authored composition around, never on, the logical combat lane.
import * as T from './vendor/three.module.js';
export function buildOutpost(scene,piece){
 const root=new T.Group();scene.add(root);
 const box=(c,x,y,z,w,h,d)=>piece(root,'box',c,x,y,z,w,h,d);
 for(const side of [-1,1]){
  // Broken approach wall, supply alcoves and watch stations frame a quiet lane.
  for(let j=0;j<6;j++){const z=3-j*4.6,x=side*7.5;
   for(let row=0;row<2;row++)for(let k=0;k<3;k++)box(row?'#7d8983':'#465a57',x,.35+row*.52,z+k*.67,.9,.49,.62);
   box('#b7bba2',x,1.12,z+.66,1.03,.14,2.2);
   if(j%2===0){box('#574838',side*7.1,2.05,z,.18,2.5,.2);box('#6b4c31',side*7.1,3.17,z+.55,.2,.16,1.3);const banner=box('#315566',side*7.1,2.54,z+.65,.035,1.05,.74);banner.rotation.x=.06;const sigil=box('#cba15d',side*7.075,2.57,z+.65,.045,.24,.24);sigil.rotation.x=Math.PI/4;
    piece(root,'cylinder','#53646b',side*6.75,1.28,z-.45,.15,.55,.15);piece(root,'cone','#f29535',side*6.75,1.74,z-.45,.17,.48,.17,true);piece(root,'sphere','#ffe2a0',side*6.75,1.64,z-.45,.09,.13,.09,true);
   }
  }
  const x=side*9.1,z=-3;
  for(let i=0;i<4;i++){box('#6b4c31',x+side*(i%2)*1.1,.36+Math.floor(i/2)*.75,z,.95,.69,.85);for(const off of [-.32,.32])box('#38474c',x+side*(i%2)*1.1+off,.36+Math.floor(i/2)*.75,z+.44,.07,.68,.03);}
  for(let j=0;j<2;j++){piece(root,'cylinder','#76573b',x+side*.5,.52,z+1.5+j*1.2,.45,1.02,.45);for(const y of [.17,.83])piece(root,'cylinder','#38474c',x+side*.5,y,z+1.5+j*1.2,.46,.065,.46);}
  // Low supply tent set back from the fight.
  piece(root,'cone','#315566',side*10.5,1.55,-10,2.1,2.2,2.1);box('#253e45',side*10.5,.57,-8.75,1.1,1.1,.07);box('#6b4c31',side*10.5,1.25,-8.68,.13,2.5,.13);
  // Watchtower silhouette outside the picking corridor.
  for(const dx of [-.55,.55])for(const dz of [-.55,.55])box('#574838',side*9+dx,1.7,-17+dz,.23,3.4,.23);
  box('#6b4c31',side*9,3.25,-17,1.75,.25,1.75);piece(root,'cone','#315566',side*9,4.2,-17,1.4,1.1,1.4);
  for(let j=0;j<14;j++){const z=4-j*2.15,x=side*(6.15+(j%3)*.17);const rootwood=piece(root,'cylinder','#574838',x,.16,z,.1,.9,.1);rootwood.rotation.z=1.2;rootwood.rotation.y=j*.9;
   if(j%3===0){piece(root,'cylinder','#b7bba2',x+.22,.18,z,.055,.3,.055);piece(root,'sphere','#b88847',x+.22,.36,z,.17,.075,.17);}
  }
 }
 return root;
}
export class OutpostWeather {
 constructor(scene){this.geometry=new T.CircleGeometry(1,16);this.material=new T.MeshStandardMaterial({color:'#668492',metalness:.28,roughness:.18,transparent:true,opacity:0,depthWrite:false});this.mesh=new T.InstancedMesh(this.geometry,this.material,10);const d=new T.Object3D();for(let i=0;i<10;i++){d.position.set((i%2?1:-1)*(4.9+(i%3)*.24),.08,3-Math.floor(i/2)*5.1);d.rotation.x=-Math.PI/2;d.rotation.z=i;d.scale.set(.42+(i%3)*.14,1.05,1);d.updateMatrix();this.mesh.setMatrixAt(i,d.matrix);}scene.add(this.mesh);this.glowMaterial=new T.MeshBasicMaterial({color:'#ffad52',transparent:true,opacity:.12,depthWrite:false});this.glow=new T.InstancedMesh(this.geometry,this.glowMaterial,6);for(let i=0;i<6;i++){d.position.set((i%2?1:-1)*6.65,.087,2.55-Math.floor(i/2)*9.2);d.rotation.set(-Math.PI/2,0,0);d.scale.set(1.15,1.7,1);d.updateMatrix();this.glow.setMatrixAt(i,d.matrix);}scene.add(this.glow);}
 update(rain,quality,daylight=1){this.glow.visible=quality!=='low';this.glowMaterial.opacity=.045+(1-daylight)*.095;this.mesh.visible=rain>.12;this.mesh.count=quality==='low'?4:quality==='high'?10:7;this.material.opacity=Math.min(.55,rain*.6);}
 dispose(){this.glow.removeFromParent();this.glow.dispose();this.glowMaterial.dispose();this.mesh.removeFromParent();this.mesh.dispose();this.geometry.dispose();this.material.dispose();}
}
