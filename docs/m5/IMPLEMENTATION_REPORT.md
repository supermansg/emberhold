# M5 implementation report — asset/presentation proof

Branch: `feature/m5-premium-vertical-slice`, based on validated M4.1 `56eab30`.

**Visual acceptance: not complete.** This is a reviewable implementation and pipeline proof, not a claim that the five reference boards have been reproduced at production quality. Keep the PR draft. Main/Production must remain `88ba79a`.

## Reference interpretation

1. Brass: swept copper hair/beard, goggles, layered brass/steel/leather, backpack, paired hollow barrels. Implemented as a locally authored Blender export, not a serialization of the old runtime actor. Surface wear, sculpt and texture quality remain below the target.
2. Normal combat: lowered camera, quiet center lane, articulated foreground Brass, irregular path stones, branch silhouettes and distant defended crossing. Environment remains primarily procedural.
3. Special: stronger projectile trail and second expanding impact ring; body recoil and temporary audio mix priority. This does not yet match the reference's layered explosion choreography.
4. Shockwave: cyan/gold bowed pressure sheets follow the real front. Low retains the essential wave; physics unchanged.
5. Upgrade: dark elemental panels, framed symbols, deliberate appearance, RTL comparison data. Cards still use symbols rather than bespoke illustrated artwork.

## Architecture and character pipeline

Actual local GLB decoder (official Three.js 0.180.0 addons) and shared asset cache. Six-second network timeout with procedural fallback. Named muzzle/head/weapon sockets use the existing ActorPresentation adapter. Cache refuses disposal while in use; instance disposal is idempotent. No combat engine rewrite. Model authoring source is `scripts/art/brass.py`; contract/provenance is beside the asset.

Brass: 15,826 triangles, 29 mesh submissions, roughly 556 KiB, differentiated PBR materials. Rigid articulated anticipation, recoil, recovery, reload, head motion and breathing follow simulation state/time. No new skeletal clips or cosmetic gameplay delays. Ember, Volt and Nova remain the other three established active actors, with no claim of new production models.

## Presentation changes

- Camera default height 17.8 / depth 24.8 before existing portrait aspect compensation. Other camera modes retained.
- Irregular low-contrast ground albedo; stones concentrated along lane edges; instanced branch-whorl crowns; distant crossing/towers use existing batching/materials.
- Existing warm/cool lighting, ACES/sRGB, weather, shadows and impulse limits retained. No new lights, bloom or fullscreen effects.
- Specials get longer/broader travel trails and a delayed secondary contact ring. Existing attack-specific identities and valid chain endpoints retained. Pool reuse now resets child position/scale.
- Enemy cosmetic recoil lasts slightly longer and reads more clearly, with heavy/boss resistance preserved. No authoritative displacement changes.
- Shockwave remains zero-damage with the same real knockback/cooldown/resistance. Two bowed pressure layers replace flat strips; capped debris remains 3/7/12.
- Level-up still pauses through engine state, keeps actual choices/comparisons/descriptions and overflow queue. Symbol-led visual frames, gold/element accents and reduced-motion-aware entrance were added. No fake rarity or generated gameplay values.
- Specials and Shockwave duck ordinary weapon/impact buses for half a second using the audio clock; ambient bus reduced. Music, current layered cues, settings and voice ceilings retained. No new recorded combat assets; perceptual audio quality requires phone listening.

## Gameplay/progression and future boundaries

Engine, Shockwave authority, content, progression and collection source are byte-identical to M4.1. XP remains `round(18 + 7*(level-1) + 2*(level-1)^1.65)`, with overflow and queued upgrades unchanged. Existing hero locks/card ownership/save format/content IDs remain intact. Existing chest result data/presentation boundary is retained; no chest animation or live-service implementation was added.

## Performance and quality

Controlled comparison: same frozen four-hero/12-enemy scene, 390×660, Standard, DPR 1, fixed daylight time, software Chromium WebGL. Rendering metrics are not real-phone FPS.

| Metric | M4.1 | M5 |
|---|---:|---:|
| Draw submissions | 455 | 443 |
| Triangles | 145,280 | 165,510 |
| Uploaded geometries | 199 | 199 |
| Uploaded textures | 2 | 2 |
| Brass meshes | 41 | 29 |

The original higher-detail forest proposal was reduced after measurement. Final triangle growth is about 14%; draw submissions decrease about 3%. The terrain texture grows from 256² to 512² (~1.33 MiB RGBA with mipmaps versus ~0.33 MiB); GPU byte totals are not exposed by these counters. Cached GLB CPU/GPU memory is additional and bounded, not claimed free.

Low/Standard/High particle/weather/shadow/pixel-ratio budgets are preserved. Essential Shockwave remains visible when decorative budgets are exhausted. No per-impact geometry/material creation. Brass currently uses the same mesh across tiers; production LODs remain outstanding.

## Validation and independent review

**PASS:** 17 Node suites: existing 16 plus `verify-m5.mjs`. New coverage: actual GLB decoding, size/mesh budgets, shared geometry, live-resource protection, repeated disposal, rejected/stalled load fallback, paused muzzle/pose, outward forest normals, pooled special/pressure-wave lifecycle, unchanged authority sources. Audio test additionally checks duck/recovery.

**PASS:** Browser harness `scripts/verify-m5-browser.cjs` exercises actual authored Brass selection, all portraits, four defenders, targeting/inspection, all speeds, abilities, loot/waves/death, day/night/rain, 320px narrow and short portrait, reduced motion, Shockwave resistance/recharge/pause, audio controls, Low/Standard/High, 36 enemies at 3×, restart/settlement and queued upgrade selection. It asserts bounded particles and stable geometry counts. No debug API is shipped; test access uses response interception.

Independent reviewer found inward forest faces and unbounded optional model loading. Both fixed, regression-tested and re-reviewed. No further confirmed authority, save, audio-priority or pool-lifecycle defects reported.

## Remaining acceptance gaps / production assets

- Brass needs sculpted refinement, authored UV/PBR atlases, calibrated wear, LODs and rigged clips to approach the supplied hero render.
- Other heroes/enemies and environment still use established procedural art; final authored scenery, masonry/vegetation atlases and landmark assets are not delivered.
- Full distinct special charge/release/contact/recovery choreography remains below target; existing damage feedback and most normal combat VFX are retained.
- Bespoke upgrade illustrations are missing; current frames are a UI proof.
- Weapon/impact/elemental audio remains synthesized; final recorded/designed samples and real-device listening acceptance remain outstanding.
- Mobile hardware sustained frame time and thermal behavior were not measured in this cloud environment.

M5 is therefore blocked on visual/audio acceptance, despite technical regression success. The Preview is for reviewing this intermediate slice, not a declaration of completed M5 quality.

## Final stress evidence

18 samples across Low/Standard/High: 4 heroes, 36 enemies, rain and 3×. Draw calls 1068–1103, triangles 290408–293776. Uploaded geometries stayed 393 and textures 22. Decorative reduction engaged. Software-rendered frame times are not a phone performance estimate.

Reproduce controlled comparison with M4.1 dist served at localhost:4196 and working dist at localhost:4195, then `node scripts/compare-m5-browser.cjs`. The script uses fixed daylight, DPR1 and a frozen scene. No application debug interface is added.
