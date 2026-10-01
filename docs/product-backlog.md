# Emberhold product backlog

Updated 2026-09-08. Version 5 was successfully deployed earlier in this conversation (commit d076cdaacbadc1512189ed52741b526e21680359). Includes compact portrait battle, three destinations, charge indicators and combat polish. Prior browser coverage was Canvas; physical-device WebGL/performance remains unverified. Public policy was confirmed; anonymous reachability was not independently verified.

Current request: living environment and progression beyond a single ten-wave run. Analysis complete. User approved the living-forest slice with “יאללה”; it is now implemented and validated for release. Encounters and expedition progression remain subsequent stages. Following slices record the staged scope. Existing publication approval remains valid for verified, accepted upgrades. This planning commit does not alter production.

| Priority | Slice | Concrete scope | Acceptance / tradeoffs |
| --- | --- | --- | --- |
| 1 | Living forest | Extend continuous ground and layered distant hills/forest; reframe camera and lodge to show defenders; subtle independent canopy motion driven by shared gusts; leaves/smoke/clouds; solar light direction/time palette based on date and a fixed central-Israel reference, Asia/Jerusalem labels; slowly transitioning simulated weather; varied fading scorch/crack decals and nearby environmental responses to impacts | At 360x800 and 390x844 no abrupt map edge or large undetailed background; all defenders visible/tappable; legible noon/night/rain; reduced-motion setting respected; unchanged seeded combat outcome. Keep static geometry batched, instance foliage/particles, bound effects. Real WebGL device review necessary. Effort medium-large. |
| 2 | Varied, fair encounters | Per-run combat seed separate from cosmetic weather/wind seed; bounded wave budgets for swarm/fast/armored packs; short readable intermissions; an elite variant; one boss attack with visible wind-up and a manual-focus counter | Same seed reproduces encounter schedule irrespective of FPS, quality or real time. No unannounced scaling based on purchases; no overlap of unavoidable boss attacks. Simulate multiple seeds and hero choices, then test comprehension. Effort large; requires balance tuning. |
| 3 | Goals across runs | Preserve ten-wave sessions; first victory unlocks selectable Expedition tier 2, then subsequent tiers. Each tier states enemy modifiers and reward before launch; repeat unlocked lower tiers. Introduce two mutually exclusive run specializations per hero, a few visible mastery goals and a next-goal run recap. Three environment themes can follow the forest slice | Versioned save migration preserves coins/training; unlock only after verified terminal victory, once per settlement; no retroactive win inferred from best=10 (means reached). Losses retain earned progress. Tune tier numbers from simulation/playtests; cap enemy count/effects independently from difficulty. No leaderboard/cloud authority claims while saves are local. Effort large, staged after environment. |

Suggested goals for first iteration: win first expedition; win with two different starting heroes; defeat a boss without wall damage. Rewards should open alternatives or visuals rather than only inflate damage. No timed streak penalty, new monetization or new currency proposed.

Evaluation: environmental screenshots at day/dusk/night and 1x/3x; pause/resume/reload and legacy-save checks; repeat-seed simulations for low/medium/high training; small friend playtest asking whether threats, chosen upgrade and next goal are understandable. Do not treat simulation outcomes as proof of enjoyment or retention. Sources and observed video timestamps are in product-research.md.

## Close combat and content extension, 2026-09-08

User subsequently requested and authorized lower/closer rear camera, bigger actors/damage/effects, and a reusable hero/map/enemy identity system. Implemented and validated; release details in CLOSE-COMBAT.md and authoring contract in CONTENT-AUTHORING.md. This is a presentation/content-foundation slice; expedition unlocks and ice/alien world content remain future stages.

## Hero mastery and tactical release
Implemented hero grid/identity, reusable 3D turntable, per-hero progression, level-based gadget choices, two upgradable defense stations and gunner/frost synergy. See HERO-MASTERY.md for exact rules, validation and remaining campaign scope.

## Fidelity and tactical power
Implemented in candidate: shared model-derived portraits, reference-sheet identity details, border plants and manually charged archetype powers. Hypothesis: timing a saved power gives the player more agency. No retention/fun measurement claimed. See FIDELITY-TACTICS.md and ASSET-PIPELINE.md. Dedicated imported art and real-device visual QA remain pending.

## Collection and combat deck
Implemented candidate: three camera modes, dedicated non-overlapping power row, two equipped collectible spell slots, four collectible spells, Rare/Epic/Legendary key chests, card ranks, and six locked heroes with distinct authored rigs/traits. Acceptance rules and remaining device checks: COLLECTION-COMBAT.md.
