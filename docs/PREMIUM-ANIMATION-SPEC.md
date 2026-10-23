# Premium animation architecture — proposed Stage 3

Historical Stage 2 proposal, based on older main. Its statements about missing loaders/adapters are superseded by the verified M5.2 baseline. Current Stage 3 proposal and local Blender findings: [Stage 2.5 vertical slice](stage25/PREMIUM-VERTICAL-SLICE.md). Preserve this document as provenance; do not implement its old baseline assumptions.

Status: specification only, awaiting explicit approval. No animation replacement in Stage 2.

## Verified integration points

- `dist/engine.js:39-63`: launch snapshots gameplay damage/status and owns arrival timing. `attack` at line 88 resolves targets; electric chains apply immediate hits.
- `dist/render3d.js:149-155`: hero adapters currently return procedural rigs. `render` directly writes body/limb transforms at lines 168-170. Facing currently independently resolves a target and can disagree with the engine's in-range target.
- `dist/content-renderers.js:11`: existing adapter requires Object3D/body/torso/limbs; optional actor disposal already runs on death/reset.
- Vendored Three supports animation classes; no GLTFLoader addon, GLB files or asynchronous asset-ready pipeline is shipped. Do not import another Three instance/version alongside the vendored runtime.

## Recommended ownership

Keep Game authoritative for target selection, attack cadence, damage, status, pause and death. Add stable actor/attack IDs and simulation timestamps to presentation events. Renderer consumes an immutable presentation snapshot: target ID, aim position, phase start, release time and projectile ID. Do not determine damage from AnimationMixer callbacks or GPU frames.

An asset manager loads approved same-origin GLB/GLTF and matching-version loader addons asynchronously before registering factories. Track loading/ready/failed; retain the existing procedural fallback and present retry UI. Cache immutable geometry/materials, clone skeletons per animated actor using a compatible skeleton cloning utility, and define ownership/ref-counting for shared textures. Pin addon compatibility and retain provenance/licences. Reject missing required clips/sockets rather than silently corrupting actor state.

Extend adapters with `updatePresentation(snapshot, simulationDelta)`, `getSocket(name)`, `reset()` and `dispose()`. Preserve existing procedural adapter compatibility. Stop the old direct limb/body writes for adapters owning their own animation. Use one AnimationMixer per independently animated actor, not one renderer/context per model.

## States and clocks

Hero: idle → aim → anticipate → release → recover; reload enters only on authoritative reloadStart/reloadEnd. Enemy: spawn → move → anticipate → strike → recover, plus hit/death. Boss: telegraph → committed attack → recovery, with explicit cancel rules.

Crossfade ordinary transitions; give death highest priority and hit reactions limited additive/upper-body influence so they cannot cancel or duplicate damage. Set clip speed to match the current gameplay interval. Update mixers on simulation time, freeze on pause/upgrade/inspection, and honor ×1/×2/×3. Cosmetic idle motion must never consume combat RNG. Reduced-motion mode reduces secondary motion and camera shake without hiding gameplay telegraphs.

First prove presentation synchronization with unchanged DPS. Introducing real anticipation delays changes balance and needs a separately approved simulation change and new baselines. Fixed-step accumulator/interpolation is recommended as a separately tested follow-up; Stage 2 leaves the existing delta/clamp behavior unchanged.

## Attachment and target contract

Require named weapon muzzle, left/right hand and cast sockets. At release, derive the rendered projectile origin from the socket's world transform; keep logical gameplay coordinates independent. Store the engine-selected target and its last known aim point. Facing, weapon aim and projectile destination consume the same target. Never retarget presentation independently to a different enemy. Retain existing dead-target fire splash semantics and damage snapshots.

Hit/death events identify actor ID, element, strength and simulation time. On death remove gameplay collision/rewards once, retain a non-interactive visual corpse only for a bounded animation lifetime, then recycle/dispose it. Boss telegraphs must represent a real upcoming attack and expose its footprint/timing; no purely decorative warnings.

## First slice and acceptance

Brass, one normal enemy, runner and first boss; forest and two-hero team. Approved idle/attack/reload/move/hit/death clips and one readable boss telegraph. Preserve all hero IDs, save fields, rewards, collection and fallback.

Require socket alignment, aim/target agreement, pause/speed transitions, no double damage/rewards, death interruption safety, repeated-run memory checks and real Android Chrome/iPhone Safari review. Profile the slice before expanding across ten heroes. Do not add post-processing or more dynamic lights without a measured device budget.
