# Brass asset proof (M5)

`brass.glb` is repository-authored offline Blender geometry, not a download or conversion of the previous runtime actor. Rebuild from the repository root:

```sh
blender -b -t 2 -P scripts/art/brass.py
```

Blender 4.3.2 exports the Y-up GLB. The model uses 15,826 triangles, 29 material/articulation mesh submissions and nine shared PBR material families, approximately 556 KiB. No runtime textures or external asset service is required. This is an intermediate art proof, not reference-fidelity production art.

Named groups: `Body`, `Head`, `Weapon`, `LegL`, `ArmL`, `LegR`, `ArmR`; sockets `Muzzle`, `HeadSocket`. Runtime semantic ID remains **gunner** (Brass). Animation follows simulation time and attack state; gameplay does not wait for it. Authored assets may replace this GLB provided the socket/adapter contract remains valid. Skeletal clips can use the existing ActorPresentation mixer; this proof uses rigid articulation, not a skeletal rig.

The cache shares geometry/materials across portraits and active actors. Instance disposal releases handles without destroying live peers. Cache disposal refuses while loading or referenced. Loading aborts after six seconds and falls back to the established procedural actor. There are no per-run downloads, allocations per hit, or changes to content ownership.

Still needed for production: sculpted facial/armor refinement, authored UV albedo/normal/roughness atlases, calibrated wear, LODs, rigged animation clips, and art review at actual mobile scale. Do not represent the presence of a GLB as proof those requirements are complete.
