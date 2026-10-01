# EMBERHOLD / שומרי הגחלת

## Open Latest App

Local source: Sites version 10, commit `c3092d3653e02ceb5719816979bfbf9c3523e0cf`, verified on 2026-09-10 as the latest saved version and remote main.
Use Node 24, run `npm ci` once, then `npm run dev` and open http://localhost:4173.
Alternatively double-click `scripts/open-app.cmd`. Run `npm test` for all nine supplied checks (passed during import).
The root `Open Emberhold.lnk` shortcut launches the same app; its custom ember icon lives at `scripts/emberhold.ico`.
`dist` contains handwritten source and must never be erased or overwritten by a build.
The pristine 48-file source checkout and Git history are retained in `.sites-source-import`; the pre-existing root Git index is untouched.
Local project documentation was added after source verification. No game code or publication was changed.

Playable mobile-first browser prototype of automatic hero base defense. Native mobile packaging is not part of this version.

## Source architecture
- `dist/engine.js`: rendering-independent combat, waves, XP, weighted-by-eligibility shuffle, hero recruitment, upgrade effects, targeting, house abilities, terminal run states.
- `dist/app.js`: Canvas rendering, generated raster sprite atlases, Hebrew UI, manual upgrades, speed controls, audio cues, local progression, modal focus handling.
- `dist/style.css`: responsive game-native lobby, battlefield, upgrade cards and workshop.
- `dist/assets`: original generated environment and hero/enemy art, WebP encoded for mobile transfer.
- `verify.mjs`: deterministic combat and state-transition checks. Run with Node 24: `node verify.mjs`.

## Rules implemented
Choose 1 of 3 randomly offered distinct heroes out of 4, with one permanent home; recruit up to 4 distinct heroes. Automatic nearest-to-fence targeting with touch override. Only the fence/house has health. Enemy contact drains protection. Shared XP triggers 3 valid unique options and completely freezes simulation until a manual choice. Personal, team, house, recruitment and fire/lightning synergy choices. Default speed 1x; 2x advances the same simulation in repeated equal steps. Ten waves, bosses at waves 3, 6 and 10, victory/loss/retirement reward settlement once only. Persistent workshop upgrades use localStorage; no cloud sync. Hidden tabs pause. Leaving/reloading an active run does not save that run.

## Content and timing
Starter hero: Brass gunner, Ember fire, Volt lightning, Nova frost. Gunner burst boost on every third reload; fire splash and burn; electrical chains; frost slow and periodic freeze. Fort has a rechargeable shield. Strength increases across waves and damage types. Base run aims at 5-7 active minutes; pauses are unlimited. Balance is provisional and needs player feedback; passing simulations are not evidence of retention or fun.

## Validation
Node syntax and asset references validated. Deterministic complete runs cover all starting heroes; checks cover manual pause, recruitment, full-team eligibility, target override/default, shield health precedence, no hero health, upgrades and a reachable victory. No browser or device performance QA performed in this environment. Native app packaging, background/offline earnings, active-run recovery and cloud saves are not implemented.

## Hosting
Static Sites project; source identity is `.openai/hosting.json`. Retain that project ID for future edits. No backend, external APIs or credentials in the client. Generated images are delivered locally; optional Google font has system fallback.

## Second edition
- Local Three.js 0.180.0 WebGL renderer with procedural low-poly 3D environment, home, animated character rigs, lighting, shadows and live targeting. Shared geometry and batched static meshes; Canvas 2D fallback when WebGL is unavailable.
- Game home has New Game and Permanent Upgrade Shop only. Three random unique starters are offered on each new run. Existing emberhold-v1 local progression is preserved.
- Upgrade cards include portrait(s), effect scope and before/after values, and float over a lightly dimmed frozen battle.
- Kill-based wave progress excludes unspawned-enemy ambiguity; XP and boss health are separate.
- Three.js LICENSE is retained in dist/vendor. Scene construction and rig validity verified in Node. Browser/device rendering and performance remain unmeasured.

## Third edition
- Low behind-the-heroes perspective camera. Cottage moved back so all four defense positions are unoccluded; numerical raycast/frustum checks passed at mobile and desktop aspect ratios.
- Procedural Web Audio layer with unique attack tones/noise, ambient bed, bounded voices, mute persistence, and first-gesture unlock. No external sound downloads.
- Unique attack and casting poses; screen shake respects reduced-motion preferences. Fire/cold/hit states, destruction particles, bounded persistent visual craters/cracks. Terrain scars are cosmetic, not collision changes.
- Hero roster bar removed. World-space labels and clicking physical heroes open a paused information bubble showing stats and acquired personal/team upgrades.
- Dropped loot waits on the ground, flies to the run XP/bag, and is credited exactly once. Pause freezes pending collection. Terminal settlement flushes pending loot; currency is credited to the permanent chest only once per run. Wave rewards and victory bonus are separately identified.
- New career XP is persisted separately from temporary run XP. Existing local currencies and upgrades migrate without resets; historical XP from older versions is not invented.
- Permanent shop separates general upgrades from hero-specific damage/specialty training. Existing reload purchases remain attached to Brass.
- Shield behavior is explicit: absorbs before fence HP, recharge begins after depletion, carries across waves. Info button explains it. Speed cycles 1x/2x/3x using equal simulation steps.
- Results include wave, kills, boss kills, coins split by source and earned career XP.
- Validation: `node verify.mjs`, `node verify-v3.mjs`, syntax and DOM/asset checks, scene update/resource disposal checks and camera visibility raycasts. Device audio/graphics/performance have not been browser-tested.

## Combat polish candidate

The approved first product-polish stage adds projectile arrival damage, elemental destruction and impact audio, distinct batched hero equipment, revised lighting and reusable bounded damage numbers. See `docs/COMBAT-POLISH.md` for behavior, balance implications, verification and release limits. Run `node verify-v4.mjs` alongside the existing two checks. A saved candidate is not evidence of deployment; infrastructure migration status remains in `docs/MIGRATION-STATUS.md`.
