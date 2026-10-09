# M5.2 — combat motion and mobile UX

Baseline: M5.1 `cce0fee4fe74ca138eb4a2a6980bb7555c9d4669`, Draft PR #5. Work is isolated on `feature/m52-combat-motion-ux`. No merge or Production promotion.

## Scope and reference interpretation

The approved references guide the sequence of preparation, discharge, contact and reward; warm/cool separation; and elemental choice-card illustrations. Generated numbers and text are not gameplay data. No current mobile recording file was available in this environment; this pass addresses the written playtest observations and fresh M5.1 browser captures. It does not claim comparison by watching/listening to the missing recording.

This is an evolution of existing adapters and pools, not a replacement character pipeline or M6 asset overhaul. The visual gap to production character/environment renders remains substantial.

## Implementation

- `attack-motion.js`: distinct read-only cooldown preparation and recoil envelopes for all ten existing identities. Brass propagates recoil through weapon/body/arms; fire winds back before release; electricity has short tense movement; ice uses controlled preparation. Existing actor animations reset transforms before this additive layer. The adapter and sockets remain unchanged.
- `special-choreography.js`: existing four reserved rigs now follow actor weapon orientation. Manual release uses a fast expansion/recovery envelope and stronger body response. Eligible automatic attacks receive a short ring-only cooldown cue, with no shards. This is readiness anticipation, not a promise that an attack must follow: an already-ready hero acquiring a target still fires immediately. All attacks retain authoritative timing.
- `combat-vfx.js`: shared flame, lightning and fractured-crystal contact silhouettes replace the same contact star recolored for every element. Strong contacts have a larger readable silhouette and remain visible through the full existing effect lifetime; their expanding contact ring is larger. Screenshot review caught the earlier flash disappearing too soon and being buried at the actor center. It now sits .72 world units toward the camera on the visible body surface; both corrections are presentation-only and regression-covered. No emitter cap increases. Essential contact remains when decorative particles are suppressed. Existing real target connections and projectile arrival authority are retained.
- `shockwave-view.js`: reserved defensive-line flash makes the origin visible while the existing bowed cyan/gold front traverses the entire lane. Resistance reactions, dust and bounded camera response remain. Zero damage, 18-second cooldown, range535, charge.18, travel1.05, legal displacement and one-contact-per-enemy are unchanged.
- `upgrade-presentation.js`: nine inline vector illustration families map actual option IDs to fire, electrical connections, ice, refracted crystal, nature, physical ammunition, defense, tempo and team. Icons and before/after values remain from real options. No invented rarity or numerical effects.
- `style.css`: short overshooting card entrance, settled elemental art, selected effect emphasis; Special icon/ready border and Shockwave ready treatment improve thumb-control discovery. Existing stacked portrait layout and touch targets remain. No extra permanent panels. Reduced-motion rules retained.
- `outpost.js`: the existing crossing moves from world z=-26 to -14, still behind the playable far edge z=-8.57. This reduces the empty approach without adding geometry or changing enemy paths.
- `environment.js`: slightly stronger existing hemisphere/fill lights lift actor silhouettes at night/rain. No lights, shadows or post-processing added; camera framing unchanged.
- `audio.js` / `audio-cues.js`: routine weapon/impact gains ease down with crowd density, and enemy bus joins the existing special ducking. Shorter fire/ice/electric transients leave more space; Brass and all special signatures remain differentiated. Added peak voice instrumentation. Music unchanged; already-muted forest bed and restrained wind/fire/rain remain. Voice limits22 routine/28 total unchanged.

## Preserved systems and explicit limitations

Engine, Shockwave authority, content, collection, progression and run-XP sources are byte-identical to M5.1. New tests enforce that boundary. No damage/target/cooldown/save/ID/unlock changes, no gameplay RNG in presentation.

The 48-node XP/coin/key feedback pool, 28 damage sprites, exact-once reward collection, 180ms card selection guard, queued choices and XP overflow are retained and revalidated. These are M5.1 features, not new M5.2 systems. No critical mechanic or fake labels were added. Existing enemy weight reactions and bounded camera impulses are retained, not newly invented physics.

Instant authoritative Specials are not delayed for a staged charge cinematic. Press/readiness gives preparation; release and contact follow actual events. The existing blast rings show event footprints, not a newly promised geometric damage boundary for global/target-list powers. No off-target chain arcs were added.

Sounds are filtered procedural synthesis, not final recorded Foley. Physical-speaker sound quality and mobile GPU/thermal behavior require the user's device playtest. Illustrations are authored vector silhouettes rather than reference-quality painted cards. Brass still needs final textured/rigged production art; other actors and environment remain procedural.

## Review

Independent reviewer inspected pose reset ordering, weapon sockets, pooled VFX allocation/disposal, wave origin cleanup, audio priority, option mappings and mobile CSS. No concrete blocking findings. Follow-up review verified automatic charge eligibility against engine range/alive filters and zero-shard behavior. Reporting caveat retained: readiness anticipation cannot be guaranteed for an immediate newly acquired target.

## Reproducible QA

- `npm test`: existing18 suites plus `verify-m52.mjs`.
- M5.2 checks: read-only deterministic archetype envelopes, category mapping, byte-identical authority, distinct essential impact silhouettes,1000 pooled contact reuses, exact shared-geometry disposal, origin and full-lane front on every quality.
- `scripts/verify-m52-browser.cjs`: extended M5.1 mobile suite, four leader Specials, audio peak counters and36-enemy/rain/3× stress.
- `scripts/capture-m52-browser.cjs`: real engine attack/power API fixtures, four archetype pose/normal/special captures, near/mid/far wave, actual upgrade definitions/selection, actual loot drop/flyout. Test-only module access uses Playwright response interception, never a shipped debug API.
- `scripts/compare-m52-browser.cjs`: same frozen4-hero/12-enemy fixture at390×660/DPR1/Standard for M5.1 and M5.2.

Screenshots use controlled fixtures for reproducibility; they are not a claim of natural-run balance or real-device performance. Browser timing is software Chromium/SwiftShader.

## M6 recommendation

Proceed only after M5.2 device feedback. Commission one rigged/textured Brass plus one grunt, a coherent lane/fort material kit, three illustrated upgrade cards and recorded mechanical/elemental one-shots. Integrate through the existing actor adapter and cue tables with measured mobile LOD/texture budgets. Avoid extending procedural detail to impersonate final production art.


## Acceptance evidence

| Item | Implementation / verification | Remaining limitation |
|---|---|---|
| Brass normal + Special | Distinct preparation, cannon/body recoil and release; engine attack and power captures; signed authored recoil test | Final rigged reload/hand clips and recorded cannon Foley deferred |
| Volt charge/discharge/chain | Cooldown/press cue, electrical contact silhouette; actual bolt effects captured; exact-once audio articulation regression | Instant engine discharge is not delayed for a cinematic |
| Ember / Nova | Flame and fractured-ice impact silhouettes; both leader power activations pass in browser | Existing procedural weapons/actors retained |
| Full-lane Shockwave | Origin535 → middle270.05 → end0; capture and unchangedHP assertions | Decorative route beyond y0 is not combat space |
| Weight responses | Runner/normal/armored/boss displacement confirmed with unchangedHP; existing reaction regressions pass | No ragdoll or new authoritative physics |
| XP / coin animations | Actual enemy death → pooled flyout → coin collection; fixed48-node assertion | Existing M5.1 reward timing retained |
| Level-Up / choice | Real option definitions, new vector art; selection, overflow, queued choices and hidden-tab pause pass | Paint-quality card art deferred |
| Dense combat |36 enemies/rain/3×,18 samples/all quality tiers; stable geometry/texture counts | Software browser cannot predict mobile thermal throttling |
| Audio priority/pause | Voice ceiling, priority, crowd attenuation, mute/visibility/disposal checks pass; peak voice counter captured | No physical speaker or subjective listening certification |
| Portrait ×1/×3 |390×844,320×740,360×640; physical picking, overlays and controls validated; no page errors | Real mobile browser playtest remains the acceptance gate |

**PASS:**19 regression suites. **PASS:** complete extended browser harness and acceptance capture harness. Independent final review reports no concrete blockers. Visual self-review additionally corrected the special-contact early fade; focused regression covers visibility after the normal flash has faded. Review also checked the final crossing/recoil changes.

### Before / after captures

- [M5.1 combat](evidence/before-combat.png) / [M5.2 Brass Special](evidence/brass-special.png)
- [M5.1 choice screen](evidence/before-level.png) / [M5.2 elemental choice screen](evidence/after-level.png)
- [Volt Special](evidence/volt-special.png), [Shockwave at far edge](evidence/shockwave-far.png), [reward flight](evidence/reward-flight.png)

The combat shots show different event moments and the choice shots show different valid options; they illustrate presentation, not an equal-pixel benchmark. The frozen rendering comparison separately holds scene/state constant.

## Performance evidence (M5.1 → M5.2)

Frozen scene: **443→443 submissions;165,510→165,510 triangles;199→199 uploaded geometries;2→2 textures**. No increase in static mesh count.

Serial36-enemy/rain/3× fixture,360×640,DPR1,software Chromium/SwiftShader. Values below are sampled medians, not frame-rate claims. Dynamic events differ by sampling time. Host scheduling and shader-cache warmup also affect the timing delta; it is not attributed solely to the code change.

| Quality | submissions | triangles | raw frame interval ms | renderer wall-time ms |
|---|---:|---:|---:|---:|
| low | 1061.0 → 1065.5 | 290550.0 → 290874.0 | 1256.6 → 666.0 | 60.9 → 37.8 |
| standard | 1067.0 → 1063.5 | 292361.0 → 291985.0 | 925.2 → 596.9 | 220.2 → 124.5 |
| high | 1065.0 → 1070.5 | 293451.0 → 293642.0 | 824.5 → 556.4 | 99.1 → 72.7 |

The production frame-time smoother discards intervals ≥250ms, so it is unsuitable for slow software rendering. This fixture also records raw RAF intervals including stalls; neither counter is physical-phone FPS. Initial geometry/texture uploads can rise during warmup; the final geometry samples settle. Shared-pool lifecycle tests separately assert no resource creation across1000 contact reuses.

Serial peak active effects: 6 → 8; sampled peak particles: 226 → 235. Combat pool96, damage sprites28, reward nodes48 and special rigs4 are unchanged. Additional contact silhouettes add three shared geometries; automatic charge adds at most four visible ring submissions.

Full mobile harness recorded peak audio voices18, below the hard28 ceiling. Baseline stress did not separately instrument audio peaks, so no numeric voice delta is claimed. Full mobile stress settled at399 geometries/21 textures versus395/22 in its baseline run; differing damage-texture uploads are not a memory optimization. GPU byte memory is not exposed.

The earlier simultaneous-browser stress timings in mobile-stress.json include host contention and should not be used for speed comparisons. The serial table above is the timing comparison. There is no evidence here of guaranteed60FPS or thermal stability on a real phone.


## Changed files summary

Presentation: `attack-motion.js`, `render3d.js`, `special-choreography.js`, `combat-vfx.js`, `shockwave-view.js`, `environment.js`, `outpost.js`. Audio: `audio.js`, `audio-cues.js`. UI: `upgrade-presentation.js`, `style.css`. Validation: `verify-m52.mjs`, package test command, four M5.2 browser/comparison/capture/stress scripts. Evidence and report: `docs/m52/`.

## Delivery safety

The child PR targets `feature/m5-premium-vertical-slice`, not `main`, and remains Draft. PR #5 remains Draft/unmerged at `cce0fee`. No production deployment or merge is requested by this change. Deployment SHA and direct Preview are verified separately after push; local browser evidence above is not a claim of testing through Vercel SSO.
