# M5.1 combat motion and audio pass

Baseline: M5 `63b8516`, same `feature/m5-premium-vertical-slice` branch and Draft PR #5. No merge/promotion. Production stays `88ba79a`.

## Evidence and target interpretation

Five reference images were available. No mobile video attachment was present, so no claim is made of listening to or inspecting the reported recording. Work addresses the user's written observations and local M5 browser evidence. References guide directional shock pressure, impact hierarchy, elemental identity and a fast paused upgrade moment; their generated values/text are not gameplay data. M5's production-art gaps remain.

## Full-lane Shockwave — intentional gameplay change

The playable target lane is y=0…535. Range increases **250→535**, reaching y=0 instead of y=285. Charge remains .18s; travel becomes **1.05s**, followed by .18s cosmetic fade. The wave continues through an empty lane. Cooldown stays 18s; push stays 80 units with runner/normal/armored/boss resistance 1.15/1/.4/.08. Zero damage, exact-once contact, legal nonnegative displacement and deterministic stepping are retained. Negative-Y pre-entry spawns are outside this target lane.

Gold/cyan bowed pressure sheets remain on Low. Larger readable curvature/width/opacity communicate direction without an opaque particle wall. Existing 3/7/12 debris caps and camera bounds remain. Cosmetic impact records now carry target ID; reaction does not depend on stale position matching. Runners lift/stumble, grunts stagger, heavy enemies resist, bosses react with minimal motion. Shockwave is the only intentional authority change.

## Floating feedback, XP and resources

A fixed **48-node DOM pool** replaces per-loot DOM/animation creation. Source values come directly from loot events; XP, coins and keys scatter briefly and accelerate toward their actual HUD targets over .5 simulation seconds. Pause freezes flights; 1×/2×/3× follows game time; restart/settlement/level transition clears them. The pool never awards currency or XP. HUD totals still change at authoritative collection. Counter punches and smooth XP fill reinforce arrivals.

Existing 28-slot damage pool gains a 580ms normal pop/drift/fade and 700ms stronger treatment for real special/synergy/heal events. Density suppression remains. A critical style requires explicit `critical:true`; the current engine does not emit critical hits, and none were invented. Existing wave/milestone banners and healing callouts remain authoritative.

## Level-up motion

Existing immediate engine pause is preserved. XP completion flashes, title appears, and three cards enter with a short stagger. Touch gives an immediate response; selected card punches over 180ms while the others dim, then the actual option applies once and combat resumes. Options/run identity guards prevent stale selection. Hiding the tab during selection preserves pause; queued upgrades remain queued. Reduced motion bypasses selection animation. No new XP formulas, rarity, upgrade effects, delays to damage or save fields.

## Special choreography and hero identity

Four reserved emitter rigs attach to real weapon sockets. Ready/press cues precede manual release; actual engine special effects trigger the release envelope and body response. Secondary shards reduce first under load while the identity ring remains. No new target paths, damage or delayed release authority. Instant electrical damage remains instant; chains use existing actual target connections.

| Identity | Motion / audio |
|---|---|
| Brass | Mechanical low charge, cannon body/transient/metal tail, heavier body recoil and expanding release |
| Volt | Rising electrical tension, fast orbital motion, sharp crack/body, individually articulated actual chain effects |
| Ember | Warm charge/release, existing fire envelope and combustion impact |
| Nova / Aurora | Crystalline charge and sharp release; cold versus lavender higher-tier identity retained |
| Briar | Green leaf/crystal emitter, organic tonal charge; normal attacks use nature routing |
| Prisma | Harmonic charge/release and crystal normal/impact sounds rather than Volt routing |
| Sol / Umbra / Cinder | Distinct radiant, low mechanical and forge charge pitches plus retained respective layered special signatures |

Normal attacks retain existing authoritative projectiles, trails, contact and recoil. Stronger pooled number motion improves impact confirmation. Camera hierarchy remains bounded: routine attacks do not add shake; existing special, Shockwave and boss impulses remain capped. No global hit-stop, physics engine or cosmetic knockback authority.

## Audio and noise

Forest broadband bed is muted; wind/fire now have quiet intervals and lower gains; rain bed maximum falls .006→.0025. Approved music is unchanged. Special/Shockwave mix ducking is retained. Rising charge cues use per-hero pitch envelopes; normal attacks route by real hero identity. Actual electrical/crystal connections add at most five short articulations, each effect once. Voice limits remain 22 routine / 28 total, with player events priority 2. Pause/visibility/disposal and independent cosmetic RNG remain intact. Sounds remain synthesized; physical-phone listening acceptance is outstanding.

## Performance and quality

Frozen M5→M5.1 comparison (same fixed daylight, Standard, DPR1, 390×660, four heroes/12 enemies): **443→443 draw calls; 165,510→165,510 triangles; 199→199 uploaded geometries; 2→2 textures**. Inactive rigs do not submit draws. Active release rigs add at most two submissions each. CPU-side additions are four fixed rigs, three shared geometries/four materials and 48 reusable DOM slots. Existing combat pool96 and damage pool28 unchanged. New shards are charged against the existing decorative particle budget. Full GPU byte memory is not exposed.

Low/Standard/High emitter shard counts are 3/5/8; load or reduced motion suppresses secondary shards. Essential wave/ring, projectiles, cooldown and HUD remain. Browser stress measures software Chromium resource stability, not physical-device FPS or thermal performance.

## Tests and review

**PASS:** 18 Node suites, including full-lane/mass/speed/pause/empty-lane Shockwave, moving runner at 3×, bounded feedback pool reuse/disposal, emitter lifecycle, explicit-only crit classification, rising audio charge and exact-once arc cues. Non-Shockwave authority/config/save sources remain byte-identical to the baseline.

**PASS:** Mobile harness covers four heroes, all portraits, normal attacks, deaths/loot, upgrades/overflow, physical picking, Brass/Volt activation, full-lane near/mid/far/boss contact, 36-enemy stress across all tiers, rain/night, short/narrow portrait, pause, 1×/2×/3×, restart, settlement, audio controls and hidden-tab upgrade selection.

Independent review found two issues: hidden-tab async selection could resume combat, and moving runners could miss a cosmetic wave reaction at 3×. Both were fixed, regression-covered and closed by focused re-review.

## Remaining visual gaps

This is a game-feel pass, not completion of M5 production art. Environment/other actors still look procedural; Brass lacks final textures/rigged clips; upgrade cards still have symbol-led graphics rather than bespoke illustrations. No new critical system, universal hero health, new rewards or invented healing was added. Special anticipation uses readiness/press because damage timing cannot be delayed. No claim of matching the absent recording or reference render fidelity is made. PR #5 remains Draft even when this focused pass is ready for mobile playtest.

## Captured stress results

18 samples: 1071–1096 submissions, 290408–294440 triangles. Peak sampled active VFX 8, decorative particles 204. Geometry count stayed 394 and textures 22 (M5 stress 393/22). Dynamic combat snapshots differ with timing and extended Shockwave; the frozen comparison above is the controlled rendering delta. Voice ceiling28 is asserted; stress voice peak was not separately sampled. Headless frame times are in stress-results.json and must not be interpreted as phone FPS.

Sampled peak VFX M5→M5.1: 9→8; peak particles204→204 (dynamic observations, not equal-event benchmarks). The updated normal/Prisma audio routing also passed a fresh targeted Brass/Volt browser activation run after the full suite.
