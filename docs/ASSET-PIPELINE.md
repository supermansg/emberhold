# Emberhold asset ownership and fidelity

## Current source of truth

The existing Sites source repository contains authored dist assets and procedural model code. It is not evidence of an external GitHub project or Drive connection. No new storage service was created for this release.

- content.js owns stable character IDs, gameplay archetypes, weapon and ability descriptions.
- actor-details.js (art revision 2) owns facial features, hair, armour, clothing and reference-sheet identity cues.
- BattleView.actor creates the same base rig for combat, turntable and runtime portrait capture. Rigid accessories merge by material; clothing stays separately animated. Runtime-generated portraits are 320x400 WebP data URLs, cached in memory per hero ID and generated once after WebGL initializes, using the existing renderer.
- Original assets/heroes.webp remains the authored reference and the fallback portrait if WebGL/capture is unavailable. Therefore fallback mode does not claim model/portrait equivalence. The original asset was not modified.
- Renderer size, pixel ratio and camera aspect restore even after a failed thumbnail capture. No second WebGL context or per-frame thumbnail generation.
- Battle images show the base hero; temporary run mastery indicators and combat poses can differ intentionally.

## Extending with production art

Keep source art and approved references separate from shipped assets. A shared Drive folder can be useful for handing over Blender files, references and art review, but it is not currently used by the runtime. Keep approved compressed runtime assets versioned with the source or on a deliberately configured asset host. An external GitHub migration is a separate stage and has not been performed here.

Suggested future structure for a newly authored character: assets/heroes/<stable-id>/ with model.glb, texture files and an approved reference. Do not create dummy model files. Each imported model needs real topology, UVs, materials, matching animation/rig conventions and measured mobile validation. A reference photo does not automatically create a production-ready animated model.

Use CONTENT-AUTHORING.md's registerHeroVisual / registerEnemyVisual / registerWorldVisual adapters to add authored rigs. An asynchronous GLB loader and asset readiness state still need implementation when real GLB files are supplied. Future runtime portraits should use those same adapters. Preserve existing IDs, gameplay archetypes and progression records.

Quality gate: compare identity in reference, front/back/side turntable and battle at actual mobile size. Check silhouette, face, weapon, palette, texture clarity, occlusion, first-load time and frame stability. Preserve licences and provenance of third-party assets. Current procedural detail is not equivalent to the high-detail original illustration.
