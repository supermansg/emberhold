# M1: Forest combat visual slice

Baseline: `88ba79af3a59253090565b950e9cdcf3b19d6370`. Delivery branch: `feature/m1-combat-visual-slice`. Production/main must remain unchanged until review approval.

## Player-visible changes

- Lower default battle camera behind the complete four-defender formation; existing alternate views retained. Fort health now sits below the hero touch labels.
- Vertex-colored worn earth, raised forest shoulders, sparse stones/roots/logs, stone footings and timber braces. Presentation terrain does not change the authoritative lane.
- Cached soil, stone, timber, cloth, skin, painted metal, brass and emissive surfaces, retaining existing ACES/sRGB rendering. Existing warm defensive light moved closer to the formation; no new lights/post-processing.
- Brass has a broader painted-metal torso, substantial twin cannon and physical muzzle socket. Cooldown/attack animation drives cosmetic preparation, recoil and recovery. Pooled muzzle flashes, socket-origin projectiles, directional impact debris and three small steam puffs accompany existing attacks.
- Common forest grunts have a weightier stride, directional cosmetic hit response and a short falling/sinking death pose. Removed enemies immediately leave active actors and picking; at most six visual corpses remain for .55 simulation seconds.
- Routine Brass shots no longer drive camera shake; existing significant-impact impulses remain. Reduced motion suppresses the new recoil/debris/steam and directional reaction.

## Authority and scope

No changes to engine, content, progression, collection, audio, save format, stable IDs, rewards or dependency lockfile. Shot arrival, attack damage, cooldowns, enemy movement, range and collision remain engine-owned. Rendering is checked for Game-state immutability and exact-once reward preservation. New effects expire in simulation time, including pause/speed behavior.

## Validation

`npm test` runs all nine original verification scripts plus `verify-m1.mjs`. All passed after implementation and review fixes. Seeded complete-run outcomes matched baseline (Brass: loss/wave 9/192 kills; Ember: win/wave 10/235; Volt: loss/wave 10/220; Nebe: loss/wave 10/219).

Baseline's first test run failed an existing random defense-offer assertion in `verify-mastery.mjs`; an unchanged retry passed. Seeded baseline reproduction confirmed that recruitment can overwrite the shuffled defense offer. M1 does not change that engine behavior or test.

New checks cover surfaces, physical muzzle, mobile camera framing, Game immutability, pool reuse/capacity, directional response, immediate actor removal, pause-safe corpse expiry, reset, visible target ring, dead-target shot-origin cleanup and adapters with optional limbs. Independent review identified the last three issues; all were fixed with regression checks.

Optional browser validation (Playwright and Chromium must be available separately; no new project dependencies):

```sh
python3 -m http.server 4174 --bind 127.0.0.1 --directory dist
# In another terminal:
M1_BASE_URL=http://127.0.0.1:4174 node scripts/verify-m1-browser.cjs
```

`PLAYWRIGHT_MODULE`, `CHROMIUM_PATH` and `M1_ARTIFACTS` override tool/artifact paths. The harness intercepts only its own app response to access module-local test fixtures; no debug API ships in the game. It checks launch/new run, four defenders, Brass attacks, physical hero/enemy picking, inspection, pause/resume, 1x/2x/3x, leader ability, equipped spells, loot and wave progression. Captures cover portrait/narrow, day/night/rain, crowd/boss, firing and death. Narrow hero targets remain at least 44 pixels tall and the fort badge clears them. No browser page errors were observed.

## Performance and limits

No new textures, dependencies, shadow-casting lights or fullscreen effects. Static geometry/materials are reused and batched. M1 temporary effects have fixed capacities: 24 projectiles, 8 flashes, 16 impacts (48 total), 6 instanced debris pieces per impact, 3 steam puffs, 6 corpses. Overflow omits presentation while preserving gameplay.

In an identical controlled four-hero/12-enemy fixture, renderer main-pass counters changed from 484 calls/108,784 triangles to 485 calls/127,202 triangles (about 17% more triangles). These counters exclude separately reset shadow-pass totals and are not mobile FPS measurements. A separate interactive browser fixture reports different counts as live effects change. Real-device FPS, thermal behavior, audio listening and touch comfort still require Preview playtesting.

Browser rendering used real WebGL2 through Chromium's software SwiftShader backend. Screenshots establish appearance and interactions, not physical mobile GPU performance. Procedural actors/forest and existing HUD remain recognizable; no skeletal assets, quality-tier system, combat balance expansion or progression changes are included in M1.
