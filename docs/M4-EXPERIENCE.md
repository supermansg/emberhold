# M4: visual, combat, audio and run progression

Baseline M3 `990b3f9`, feature branch `feature/m4-visual-combat-audio-progression`. No production merge/promotion. The five supplied boards are design references; all numbers, costs, ownership, text and gameplay remain sourced from code.

## Reference mapping and actual work

67621 is integrated intact as `assets/emberhold-brand.jpg` (114 KiB, supplied by the user); no redrawn imitation logo. 67622 informs the four-defender fort, navy banners, supply structures, warm torches and cool forest framing. 67654 supplies the dark/gold card hierarchy and elemental language; its generated values are not copied. 67643 maps exactly to existing gunner/fire/electric/frost/sol/briar/cinder/prism/umbra/aurora IDs. 67648 informs shared workshop/card surfaces, selected gold states and readable RTL comparisons.

Brass retains the M3 rounded cannon/face/beard rig. Sol adds solar mantle/scope/copper hair; Umbra a dark cowl, cloak, scope and grey beard. New shared caster construction replaces the older primitive rigs: shaped lathed coats, rounded faces, segmented hair, gloves/boots and distinct equipment. Ember has swept flame hair/gauntlets; Volt paired back coils; Nova controlled ice staff/braids; Briar leaf crown and organic staff; Cinder forge gauntlets/hammer; Prisma a framed refraction crystal; Aurora crystal shoulder silhouette. Each uses the existing actor adapter and physical muzzle socket. Animation reads existing attackAnim/cooldown; no damage wait or fake hero health/death. Runners are lean dual-weapon scouts; armored grunts have a braced shield. Boss silhouette remains the established M3 guardian.

Prisma beams follow real engine chain segments, with a straight refractive form; electric bolts retain jagged connected discharge. Briar uses a flattened faceted leaf projectile. Magma is a heavier pulsing core; cold debris uses sharp crystal geometry. Existing pooled fire envelope, mechanical muzzle/casing/steam and impact hierarchy remain bounded. Positive HP callouts have an explicit healing palette, never a damage inference.

Outpost composition adds supply crates/barrels, low tents, towers, masonry, banners, torches, roots and fungi outside the lane. Static props merge with existing material batches. A deterministic 256px repeating soil albedo provides surface variation. Ten fixed instanced wet patches and six low-opacity warm ground pools add depth without reflection buffers or lights. Low removes warm pools and reduces wet patches; existing quality budgets continue limiting rain, debris and secondary VFX. Camera framing and ACES/sRGB remain intact.

## Run XP: deliberate gameplay change

M3 already increased thresholds recursively (`round(previous*1.28+5)`). M4 centralizes a milder, directly addressable curve in `run-xp.js`:

`required(level) = round(18 + 7*(level-1) + 2*(level-1)^1.65)`

Constants are frozen in `RUN_XP_CURVE`; the pure function accepts a validated alternate configuration for tuning/tests. Levels 1–10: 18, 27, 38, 51, 66, 81, 98, 117, 136, 156. Values are clamped only at MAX_SAFE_INTEGER for numerical safety. Early pacing stays near the baseline; later requirements grow less steeply than the old exponential recurrence.

`checkLevel` subtracts exactly the threshold and queues one manual choice at a time. `choose` rechecks retained XP, supporting multiple queued upgrades from one grant without bypassing player choice. Total/career XP and terminal settlement are unchanged. No active-run saves exist; no save migration is required. Full seeded runs can change due to earlier upgrade choices; isolated seeded combat against the actual M3 engine must remain byte-identical at 1x/2x/3x.

## Audio and controls

See M4-AUDIO.md for buses, voice priority, procedural score/ambience and lifecycle. Master/music/SFX sliders live in the existing pause modal and a shared home audio dialog. Preferences are outside the gameplay save. Explicit pause/hidden tabs suspend audio; upgrade/inspection use the quiet mix so the level cue remains audible. Audio variation has its own PRNG.

## Authored asset boundary

These are designed procedural runtime characters, not production sculpted/skinned GLBs. Final reference fidelity still needs approved topology/UVs, texture atlases, rigs and animation clips for each hero; final recorded weapon/enemy layers and authored music stems are also outstanding. The M3 adapter provides loading/fallback/sockets/clip integration; M4 does not ship fake GLB assets or claim synthesized music is final production music. No accounts/cloud saves/live scheduling introduced, and stable content IDs remain compatible with future manifests.

## Verification and measured cost

All 15 `npm test` suites pass, including actual M3/M4 seeded combat comparison with XP timing isolated, queued XP choices, complete roster fallback/disposal and audio priority/pause/visibility/disposal. Independent review found an async audio suspend/resume race and variant-owned material release gap; both were fixed with focused regressions and re-reviewed. Held caster equipment now follows its animated arm and actual socket.

Controlled identical 390×844, four-hero/12-enemy/boss scene at pixel ratio 1.35: M3 478 draw submissions / 135,080 triangles / 203 geometries / 1 texture; M4 455 / 145,348 / 289 / 2. That is 4.8% fewer submissions, 7.6% more triangles, and additional reusable geometry. The soil texture costs approximately 0.33 MiB including mipmaps; the supplied branding JPG is 114 KiB. Temporary 24-second mono music is about 4.4 MiB at 48 kHz, plus noise buffers. These are resource estimates, not process-memory measurements.

The browser fixture covers 320×740 and 360×640 portrait, day/night/rain, physical hero/enemy picking, four heroes, abilities, speed controls, pause/resume, terminal settlement/restart, real audio settings/context state and all ten portraits. Its 36-enemy rain/3x stress samples test all quality modes, effect caps and stable warmed geometry counts. Software Chromium/SwiftShader is not a mobile GPU benchmark; sustained phone frame rate and speaker mix remain playtest acceptance items. Dense enemy draw submissions remain the primary performance limitation.

XP tuning is intentionally consequential: a fixed-seed full-run fixture produced 11 choices and wins with all four starters (Brass ended with 2 fort HP), versus 8–9 choices under the steeper M3 curve. Full-run outcomes are not claimed identical after changing upgrade timing. Mobile playtesting should assess this gentler later-run pacing before merge.
