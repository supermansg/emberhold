# Stage 3 premium vertical slice — proposal only

Requires explicit approval. No art production, installation or export in Stage 2.5.

## Verified starting point

M5 already introduced a Blender-authored Brass GLB, official Three 0.180.0 GLTFLoader addons, six-second optional load timeout, shared cache, sockets and procedural fallback. ActorPresentation already supports AnimationMixer/clips. Current brass-asset.js clones a rigid hierarchy and drives procedural transforms; it does not instantiate independent skinned skeletons.

Current GLB: 567,340 bytes, 15,826 rendered triangles / 29 meshes, nine materials, zero images, zero skins and zero animation clips. Structural counts are not visual-quality approval. The proposed asset is a refined, textured, skeletal successor to this existing model, not the game's first GLB.

Preserve M5.2 attack-motion.js, Special choreography, elemental contacts, full-lane zero-damage Shockwave, vector choice art, audio priorities, quality tiers and pools. Read docs/m5, docs/m51 and docs/m52 implementation reports before work. The older main-based PREMIUM-ANIMATION-SPEC.md is historical.

## First slice

Brass plus one grunt and first boss encounter in the existing forest; retain every other hero and fallback. Keep copper beard/hair, goggles, paired barrels, leather and brass identity.

1. Approved front/three-quarter/rear reference and readable phone-size battle silhouette.
2. Refined sculpt, retopology, UV/PBR atlas, skeletal rig and LOD0/1/2.
3. Idle/aim, anticipation/release/recovery, reload, hit and death clips. Named muzzle, hands, head and weapon sockets.
4. Forest lane/fort material kit, stronger landmark composition and consistent warm/cool cinematic lighting under existing day/night/weather rules. Keep the combat lane quiet.
5. Layered fire/electric/frost/mechanical VFX following actual events, retaining essential Shockwave visibility and bounded decorative budgets.
6. Readable enemy reactions and boss telegraphs. A warning must represent an actual upcoming attack; new boss mechanics need separate gameplay/balance approval.

## Architecture

Extend existing adapters/ActorPresentation; do not add another renderer/engine. Add asset ready/error/retry states and compatible skeleton cloning for independent skinned actors: template.clone(true) is not the proposed skeleton ownership strategy. Pin the existing Three version and matching addons/optional decoders. Cache immutable meshes/textures/clips, reference-count assets and stop/uncache per-instance mixers without disposing data still used by other actors.

Game remains authoritative for target, cadence, damage snapshots, projectile arrival, status, death and rewards. Events need stable actor/attack/target IDs and simulation timestamps. Facing, aim and projectile destination use the same engine-selected target. A named socket gives the visual origin at release; rendering cannot alter logical damage coordinates. Never use mixer completion as a damage trigger.

Crossfade movement/aim/idle; synchronize attack/reload states with simulation time. Limit hit overlays so attacks cannot be cancelled or duplicated accidentally. Gameplay death/rewards resolve once; keep only a bounded non-interactive visual actor until its clip ends. Bypass old procedural transform writes for new skinned adapters, retain them for fallback actors. Freeze mixers during upgrade/pause/inspection; honor ×1/×2/×3 and reduced motion. Preserve truthful anticipation: current instant Specials are not delayed for a cinematic.

First prove unchanged DPS/timing. New anticipation delays, boss mechanics and fixed-step/interpolation changes are separate simulation work with regression/balance acceptance.

## Proposed device budgets — not achieved measurements

| Area | Target for approval |
|---|---|
| Frame pacing | 60 FPS target on agreed capable desktop; sustained 30 FPS fallback target on agreed mid-range phones; raw mean/p95/max and thermal tests |
| Brass | LOD0 ≤20k triangles, LOD1 ≤10k, LOD2 ≤5k; ≤4 material submissions where feasible |
| Rig | ≤64 deform bones, ≤4 weights/vertex; independent skeletons and bounded mixers |
| Download/textures | ≤1.5MB compressed first-character payload target; primary atlas ≤2k with 1k low alternative |
| Normal scene | Target ≤450 submissions / ≤200k triangles on Standard using an identical frozen scene |
| Dense fixture | Target ≤700 submissions / ≤300k triangles at 36 enemies on Low; needs enemy batching/LOD relative to existing evidence |
| Effects | Retain low/standard/high particle caps 95/227/447, combat pool 96, damage sprites 28, reward nodes 48, four reserved Special rigs |
| Lighting | Retain low shadow disable and pixel-ratio limits; extra lights/post-processing require profiling |

Historical software-browser stress exceeded 1,000 submissions. These are improvement targets, not promises of mobile FPS. Browser geometry/texture counters do not measure GPU byte memory. KTX2/Meshopt/Draco adoption requires decoder/device testing and dependency review.

## Local Blender/toolchain findings

No Blender command found in PATH, no Blender Foundation directory at standard Program Files location, and no Blender uninstall entry in the queried HKLM/HKCU locations. Bundled Python 3.12.14 has no bpy. ArtCraft Launcher is present, but a bundled Blender runtime was not located or executed. This does not prove there is no portable installation elsewhere.

Existing scripts/art/brass.py targets Blender 4.3. Do not run it as discovery: it deletes scene objects and overwrites the runtime GLB. First select/verify Blender executable/version and glTF exporter, then use fresh versioned authoring/export paths. Preserve .blend/sculpt/reference sources separately from approved exports. Record licences, source/export hashes, settings, sockets, clips and payload budgets. No installation, asset generation or Blender export was run here.

## Reference comparison and acceptance

Locate and reconfirm the five historical reference boards mentioned by M5; old numeric IDs are not available image evidence. Approve Brass reference sheet before producing final assets. Compare reference, existing M5.2 and candidate with identical camera, daylight/weather, DPR, quality and frozen game state. Capture turntable, actual 390px battle, normal shot, reload, Special release/contact, enemy reaction and boss warning. Version the images and record concrete differences.

Technical PASS: sockets/aim, timing/damage/save/reward invariance, pause/speed, shared-resource lifecycle and measured device budgets. Separate creative approval: silhouette, face, materials, palette, animation, lighting and game feel. Expand to the remaining roster only after this slice is approved. Stage 3 is awaiting approval.
