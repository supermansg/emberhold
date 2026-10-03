# Three.js addon provenance

GLTFLoader.js and BufferGeometryUtils.js are from official Three.js npm release 0.180.0, matching the existing runtime. Retrieved through jsDelivr HTTPS:

- https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js
- https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/utils/BufferGeometryUtils.js

Only bare `three` imports were rewritten to `../../three.module.js` for local static hosting. MIT license: `../THREE-LICENSE.txt`. Runtime requests no CDN scripts. The authored GLB uses no Draco, KTX2, external textures, or additional decoder.
