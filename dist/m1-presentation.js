// M1 presentation only. Never consumes combat RNG or changes the logical arena.
import * as T from './vendor/three.module.js';
import {noise} from './environment.js';

const surfaces = Object.freeze({
  soil: {roughness: .96, metalness: 0},
  stone: {roughness: .86, metalness: 0},
  timber: {roughness: .8, metalness: 0},
  cloth: {roughness: .94, metalness: 0},
  leather: {roughness: .83, metalness: 0},
  skin: {roughness: .72, metalness: 0},
  paintedMetal: {roughness: .43, metalness: .48},
  brass: {roughness: .34, metalness: .7},
  elemental: {roughness: .36, metalness: .08}
});
const cache = new Map();
const families = new Map();
for (const [family, colors] of Object.entries({
  soil: ['#243d35','#718367','#9a957b','#7e876f','#b3a88a'],
  stone: ['#465a57','#7d8983','#949d8f','#b7bba2','#687d78','#889589','#72837d','#677c74','#b0b69b','#506568'],
  timber: ['#6b4c31','#574838','#544639','#554b45','#76573b'],
  skin: ['#dfbb94','#965c47','#83a952','#c35e4e','#89719e','#555d68'],
  cloth: ['#253e45','#934c28','#b83c2e','#d0c9e5','#b1a5d9','#953438','#7382b6','#675b90','#465b86','#37403c'],
  brass: ['#d9a34d','#b88847','#d5b677','#edd78d','#cba15d','#e7b75c','#ffe2a0'],
  paintedMetal: ['#38474c','#53646b','#34484b','#829aaa','#657a7d','#738991','#4b5361','#535e59','#2c5662','#315566','#385f70','#426b7a']
})) for (const color of colors) families.set(color, family);

export function surfaceMaterial(color, glow = false, family = families.get(color) || 'cloth') {
  if (glow) family = 'elemental';
  const key = `${color}:${family}:${glow}`;
  if (!cache.has(key)) {
    const m = new T.MeshStandardMaterial({color, ...surfaces[family],
      ...(glow ? {emissive: color, emissiveIntensity: 1.15} : {})});
    m.userData.family = family;
    cache.set(key, m);
  }
  return cache.get(key);
}

export function buildBattlefield(scene, piece) {
  // Vertex-painted, irregular shoulders; |x| <= 6.8 remains a flat visual plane.
  const ground = new T.PlaneGeometry(42, 160, 56, 120);
  ground.rotateX(-Math.PI / 2);
  const p = ground.attributes.position, colors = new Float32Array(p.count * 3);
  const earth = new T.Color('#73634d'), worn = new T.Color('#a18b65'), moss = new T.Color('#3b5543');
  const c = new T.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i) - 45;
    const edge = Math.max(0, Math.abs(x) - 6.8);
    const grain = noise(i + 850);
    p.setY(i, .065 + Math.min(1.5, edge * .24) * (.6 + .4 * Math.sin(z * .18 + x)));
    p.setZ(i, z);
    const path = Math.max(0, 1 - Math.abs(x - Math.sin(z * .13) * .8) / 6.2);
    c.copy(moss).lerp(earth, Math.min(1, path * 2)).lerp(worn, path * (.24 + grain * .28));
    const rut=Math.exp(-Math.pow((Math.abs(x)-2.5-Math.sin(z*.09)*.35)/.3,2));
    c.multiplyScalar(.9 + grain * .16-rut*.07);c.toArray(colors, i * 3);
  }
  ground.setAttribute('color', new T.BufferAttribute(colors, 3));ground.computeVertexNormals();
  const floor = new T.Mesh(ground, new T.MeshStandardMaterial({vertexColors: true, roughness: .97, metalness: 0}));
  floor.material.userData.family = 'soil';floor.receiveShadow = true;scene.add(floor);
  // Sparse worn stones, roots and abandoned timber sit outside the playable lane.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 13; i++) {
      const x = side * (6.9 + noise(i + 70) * 1.5), z = 4 - i * 2.9;
      const stone = piece(scene, 'sphere', i % 2 ? '#687d78' : '#465a57', x, .12, z,
        .45 + noise(i + 4) * .5, .22 + noise(i + 5) * .27, .5 + noise(i + 8) * .55);
      stone.rotation.y = i * 1.7;
    }
    for (let i = 0; i < 5; i++) {
      const root = piece(scene, 'cylinder', '#6b4c31', side * (7.0 + i * .18), .13, 3 - i * 4.3, .09, 1.5, .09);
      root.rotation.set(.2, i, side * 1.23);
    }
    for(let i=0;i<4;i++){const rubble=piece(scene,'box',i%2?'#7d8983':'#465a57',side*(7.7+i*.15),.22,-5-i*2.3,.65,.4,.48);rubble.rotation.set(.08,i*.63,side*.15);}
    const log = piece(scene, 'cylinder', '#574838', side * 8.0, .38, -.5, .28, 2.4, .28);
    log.rotation.z = side * 1.18;
    piece(scene, 'box', '#6b4c31', side * 6.8, .23, 6.2, .8, .26, 1.2).rotation.y = side * .3;
  }
  return floor;
}

// Only Brass's ballistic presentation is pooled here; other archetypes retain
// their existing effects. Each slot owns its opacity material, all share geometry.
export class BrassEffects {
  constructor(scene) {
    this.scene = scene;this.slots = [];this.lastShot = -10;
    this.geometry = {
      flash: new T.PlaneGeometry(.8, .18),
      core: new T.CylinderGeometry(.055, .055, .45, 6),
      trail: new T.ConeGeometry(.07, .9, 5),
      ring: new T.RingGeometry(.09, .15, 12),
      debris: new T.BoxGeometry(.055, .055, .16),
      steam: new T.IcosahedronGeometry(.09, 0),
      contact: new T.CircleGeometry(.2,8),
      casing: new T.CylinderGeometry(.035,.035,.14,5)
    };
    this.steam = new T.InstancedMesh(this.geometry.steam,
      new T.MeshBasicMaterial({color: '#b7d0c7', transparent: true, opacity: .18, depthWrite: false}), 3);
    this.steam.visible = false;this.steam.frustumCulled = false;scene.add(this.steam);
    this.dummy = new T.Object3D();this.direction = new T.Vector3();
    for(const [kind,count]of [['shot',24],['muzzle',8],['impact',16]]){const warm=[];for(let i=0;i<count;i++)warm.push(this.acquire(kind));for(const o of warm)this.release(o);}
  }
  get allocated() {return this.slots.length;}
  get particles(){let n=this.steam.visible?3:0;for(const o of this.slots)if(o.userData.busy){if(o.userData.kind==='muzzle'&&o.children[2]?.visible)n++;if(o.userData.kind==='impact'&&o.children[1]?.visible)n+=o.children[1].count;}return n;}
  get active() {return this.slots.filter(o => o.userData.busy).length;}
  acquire(kind) {
    let o = this.slots.find(o => o.userData.kind === kind && !o.userData.busy);
    if (!o) {
      const cap = kind === 'shot' ? 24 : kind === 'impact' ? 16 : 8;
      if (this.slots.filter(o => o.userData.kind === kind).length >= cap) {
        // Invisible overflow has no GPU resources and cannot suppress damage.
        o = new T.Group();o.userData.sliceFx = true;return o;
      }
      o = new T.Group();
      const mat = new T.MeshBasicMaterial({color: '#fff1bc', transparent: true,
        depthWrite: false, toneMapped: false});
      if (kind === 'muzzle') {
        for (const angle of [0, Math.PI / 2]) {const m = new T.Mesh(this.geometry.flash, mat);m.rotation.z = angle;o.add(m);}
      } else if (kind === 'shot') {
        o.add(new T.Mesh(this.geometry.core, mat));
        const tail = new T.Mesh(this.geometry.trail, mat);tail.position.y = -.55;o.add(tail);
      } else {
        const ring = new T.Mesh(this.geometry.ring, mat);o.add(ring);
        const sparks = new T.InstancedMesh(this.geometry.debris, mat, 6);
        sparks.instanceMatrix.setUsage(T.DynamicDrawUsage);sparks.frustumCulled = false;o.add(sparks);const contact=new T.Mesh(this.geometry.contact,mat);o.add(contact);
      }
      if(kind==='muzzle'){const shell=new T.Mesh(this.geometry.casing,mat);o.add(shell);}
      o.userData = {sliceFx: true, kind, material: mat, origin: new T.Vector3(), target: new T.Vector3()};
      this.slots.push(o);
    }
    o.userData.busy = true;o.visible = true;o.scale.setScalar(1);this.scene.add(o);return o;
  }
  release(o) {o.removeFromParent();o.visible = false;o.userData.busy = false;}
  update(o, f, source, target, camera, reduced) {
    const kind = o.userData.kind;if (!kind) return;
    const k = Math.max(0, Math.min(1, 1 - f.life / f.maxLife));
    o.userData.material.opacity = kind === 'shot' ? 1 : 1 - k;
    if (kind === 'muzzle') {
      o.position.copy(source);o.quaternion.copy(camera.quaternion);
      o.scale.setScalar((reduced ? .65 : 1.5) * (1 - k * .8));
    const shell=o.children[2];shell.visible=!reduced&&(this.particleAllowance??6)>0;shell.position.set(.25+k*.6,-k*k*.5,-.15+k*.2);shell.rotation.set(k*8,k*4,0);
    } else if (kind === 'shot') {
      o.position.copy(o.userData.origin).lerp(target, k);
      this.direction.copy(target).sub(o.userData.origin).normalize();
      o.quaternion.setFromUnitVectors(UP, this.direction);
      o.children[1].scale.y = reduced ? .4 : 1;
    } else {
      o.position.copy(target);o.children[0].quaternion.copy(camera.quaternion);
      o.children[0].scale.setScalar(1 + k * 2);
      const contact=o.children[2];contact.visible=k<.3;contact.quaternion.copy(camera.quaternion);contact.scale.set(1.2*(1-k*2),.7*(1-k*2),1);
      const sparks = o.children[1];sparks.count=Math.min(6,this.particleAllowance??6);sparks.visible = !reduced&&sparks.count>0;
      this.direction.copy(target).sub(o.userData.origin).normalize();
      for (let i = 0; i < 6; i++) {
        const spread = (i - 2.5) * .13, travel = k * (.45 + i * .07);
        this.dummy.position.set(this.direction.x * travel + spread * k,
          Math.sin(k * Math.PI) * (.15 + i * .035), this.direction.z * travel);
        this.dummy.rotation.set(k * 4, i, k * i);this.dummy.scale.setScalar(1 - k * .8);
        this.dummy.updateMatrix();sparks.setMatrixAt(i, this.dummy.matrix);
      }
      sparks.instanceMatrix.needsUpdate = true;
    }
  }
  updateSteam(time, source, reduced) {
    const age = time - this.lastShot;this.steam.visible = !reduced && age >= 0 && age < .3 && !!source;
    if (!this.steam.visible) return;
    for (let i = 0; i < 3; i++) {
      this.dummy.position.copy(source);this.dummy.position.y += age * 1.4 + i * .06;
      this.dummy.position.x += (i - 1) * age * .25;
      this.dummy.scale.setScalar(.4 + age * 2 + i * .15);this.dummy.rotation.set(age, i, 0);
      this.dummy.updateMatrix();this.steam.setMatrixAt(i, this.dummy.matrix);
    }
    this.steam.instanceMatrix.needsUpdate = true;
  }
  dispose(){if(this.disposed)return;this.disposed=true;this.reset();for(const o of this.slots){o.traverse(n=>{if(n.isInstancedMesh)n.dispose();});o.userData.material.dispose();}this.steam.dispose();this.steam.material.dispose();for(const g of Object.values(this.geometry))g.dispose();}
  reset() {for (const o of this.slots) this.release(o);this.steam.visible = false;this.lastShot = -10;}
}
const UP = new T.Vector3(0, 1, 0);
