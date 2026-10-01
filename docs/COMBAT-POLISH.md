# Combat and graphics polish - approved stage 1

Prepared 2026-09-08 on `feature/combat-polish-v4`.
Baseline: `96da3c2` (game assets identical to saved Sites version 3, `def5de459bb405ac320ea4fd2cf977f56abba2c9`).

## Scope and behavior

- Gunner, fire and frost projectiles now apply captured damage at arrival, after 45-240 ms of simulation time. Their 3D and Canvas representations follow that lifetime. Lightning remains immediate.
- Projectiles track their chosen target. Gunner/frost shots expire without retargeting if it dies. Fire lands at the last known destination and damages living enemies currently in the blast radius. Projectile launch snapshots prevent mid-flight upgrades changing existing shots.
- Attack/impact/destruction sound cues are separate. Fire, frost, electric and ballistic last hits produce different debris geometry and motion. Burn kills are attributed to fire. Kills occurring on the losing frame still grant their existing loot.
- Heroes have distinctive rigid equipment and silhouettes, plus cosmetic shoulder accents at run rank 3. Rigid body pieces are batched by material; limbs remain articulated.
- Cooler environmental fill and rim lighting, adjusted exposure and emissive lane beacons. No extra dynamic lights or external asset downloads.
- Damage numbers coalesce hits on the same enemy within 90 ms, with a cap of 28 visible numbers. Damage itself is never capped. Canvas textures are reused, and particles in one burst share geometry and material.

## Verification

Passed locally: `node verify.mjs`, `node verify-v3.mjs`, `node verify-v4.mjs`; changed JavaScript syntax checks and `git diff --check`.

The new regression suite checks arrival timing, all pause states, moving/dead targets, splash after target death, damage snapshots, boosted magazines, kill attribution, loot on a fatal frame, text caps/reuse, equivalent simulation steps at 1x/2x/3x, unchanged save values, and actual Three.js geometry construction/render-update/reset methods using a text-canvas shim and a renderer stub.

Hero mesh counts with batching: Brass 23, Ember 22, Volt 23, Nova 21. A sequential 50-number scene test reused two canvas objects. These are structural measurements, not GPU or FPS measurements.

The four seeded starter simulations now finish at: Brass lost wave 10; Ember won wave 10; Volt lost wave 10; Nova lost wave 9. The upgraded-team win remains reachable. Earlier seeded runs all lost at wave 10. Timing changes affect combat and subsequent upgrade choices; these few simulations do not establish balance or general win rates.

## Compatibility and remaining review

`progression.js`, local save key/schema, purchases, currency and XP reward amounts are unchanged. Existing permanent progress requires no migration. In-flight shots are transient and pause with the simulation. Active-run recovery remains outside this stage.

Browser visuals, real-device frame times and audible mix are unverified: this static Sites checkout has no compatible supervised browser-preview server. Before release review one run on a phone, 1x/2x/3x readability, hero selection, audio levels and late-wave effects. No claim of measured graphics or performance improvement is made.

This stage prepares source and a saved Sites version only; it does not authorize deployment, public access changes, deeper gameplay systems or continuation of the infrastructure migration. Rollback candidate: saved Sites version 3. Use the saved version returned by Sites for a later authorized deployment.
