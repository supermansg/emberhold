# M3 premium character/combat slice

Baseline: M2 e16ed25. User-authorized staged scope: prioritize P0 without spreading quality thinly. This delivery proves the Brass/grunt procedural actor pair and layered projectiles; the broader environment/audio production pass is deferred. No engine, content, progression or save changes.

## Reference interpretation

- Combat board (67611): purposeful release/contact/recovery, a heavy cannon and clear directed feedback. Preserve the successful mobile framing rather than reproduce the single-hero composition.
- Ecosystem board (67618): distinct elemental signatures within one palette and compact HUD hierarchy. Preserve four defenders and RTL; do not invent the board's mechanics/maps/upgrades.
- Character/world board (67604): red copper hair/beard, teal goggles, broad brass shoulders, steel weapon, articulated leather joints, readable goblin face, warm defended foreground and cool forest. Model shared rounded surfaces and coherent equipment around articulated joints rather than adding detail to the old block rig.

## Plan / validation

1. Verify M2 clean and run all eleven baseline suites (passed).
2. Replace only the Brass/grunt procedural proof pair; cache meshes by joint/material; maintain existing muzzle/torso/limb contract and numerical framing/picking checks.
3. Add a rendering-only actor lifecycle adapter supporting clips, named sockets, attachments, injected asynchronous assets, fallback and cancellation. Shared procedural geometry is process-lifetime cache; actor disposal never invalidates surviving instances.
4. Refine pooled elemental release/contact silhouettes without increasing effect capacities or changing engine effect times. Preserve exact chain endpoints and no invented bonus damage.
5. Run all regression suites, focused actor lifecycle/animation tests, M2 browser interactions and sustained stress, inspect actual rendered mobile captures, review complete diff.
6. Commit/push feature branch, open PR, verify GitHub Vercel Preview SHA. Do not merge/promote.

## Integration boundaries

`premium-actors.js` owns art and cosmetic poses; `actor-presentation.js` owns actor instance/clip lifecycle. Future trusted GLB adapters may inject a loader returning a root, clips, named sockets and explicit release callback. No remote manifest execution, account system, save migration, new ownership ID or asset URL dependency is introduced. Device saves and future versioned content remain independent of these presentation modules.

External models, skeletal art assets, authored audio/music, broad environmental upgrades and live-game systems are deliberately outside this coherent first M3 slice. No production-ready GLB or sampled audio is claimed. Real phone GPU/speaker validation remains required on Preview.

## Measured comparison and review

Identical paused 390x844 four-defender/12-enemy/boss fixture at pixel ratio 1.35: M2 475 main-pass calls / 126,632 triangles; M3 478 / 135,080 (+3 calls, +6.7% triangles). No new lights, textures, post-processing or effect slots. Brass is 41 meshes including an animated rear leather tab, within the pre-existing <55 guard. New geometry is cached per part/material; impacts allocate no new geometry/materials.

Chromium SwiftShader tests cover actual WebGL, mobile/narrow/short portrait, physical picking, inspection, abilities, corpses, loot, wave progress, pause, all speeds, quality switches, reduced motion, day/night/rain. A 36-enemy, four-hero, rainy 3x fixture samples all three tiers over sustained combat and checks effect caps/resource counts. Software GPU timings are not a mobile FPS claim; actual device frame time and thermal stability require Preview playtesting.

Independent review found and fixed gallery reduced-motion handling, fallback actor lifecycle and the optional-limb adapter contract. Shared art revision advances to 3; the original fidelity test remains intact, including animated accessory behavior. One full-suite run hit the already-known randomized mastery defense-offer assertion; engine and test were not modified to hide it.

## Explicit remaining M3 scope

- Authored GLB/skeletal assets, production textures/edge wear, full movement/arrival/reaction/death clip library and artist-authored animation. The adapter supports clips but this proof uses procedural joints and existing arrival/death transitions. Heroes still have no invented HP/death mechanic.
- Further Volt branching/afterglow and Nova freeze buildup; their existing M2 real chain/frost feedback remains. No false chain targets or extra gameplay status.
- New damage icons/aggregation: existing M2 truthful pooled numbers and labels remain.
- Broad environment/fort storytelling, integrated puddle/wetness art, lighting and cinematic-camera expansion. Existing M2 terrain/weather/lighting/camera are preserved.
- Independent audio buses/controls, sampled weapon/enemy layers, ambient soundscape and state-based music. Existing audio is unchanged and its regression suite still applies; no new audio lifecycle is claimed.
- A shipped GLB decoder/asset manifest and actual per-actor LOD assets. Adapter sockets, clips, attachment and optional LOD hooks are ready; runtime assets remain local procedural source.

No authentication, cloud save, live scheduling or content rollout is implemented. Existing local saves/content IDs and future manifest integration remain separate from actor presentation.

## Reproduce validation

```sh
npm test
python3 -m http.server 4180 --bind 127.0.0.1 --directory dist
# Separate terminal, external Playwright and Chromium as in the M2 harness:
M2_BASE_URL=http://127.0.0.1:4180 M2_ARTIFACTS=/tmp/emberhold-m3-artifacts node scripts/verify-m3-browser.cjs
```

M2-prefixed environment variables and common screenshot names are retained because the M3 harness repeats the M2 acceptance flows before its extra stress/portrait/settlement/restart checks. No debugging API ships in the app; the harness intercepts its own app response.

The final Node run passed all twelve suites (nine original, M1, M2, M3). Seeded full runs remain identical to M2: Brass loss wave9/192 kills/time301; Ember win wave10/235/time385/134HP; Volt loss wave10/220/time390; Nova loss wave10/219/time387. Engine, content, progression, collection, audio and package lock are byte unchanged from e16ed25.

Final browser run passed, including terminal retirement/exact-once settled wallet and restart cleanup. In the sustained fixture GPU resource counters stayed at 273 geometries / 20 textures throughout every sampled tier. Peak decorative particles were 69 Low / 120 Standard / 212 High, below 95 / 227 / 447 caps. Dense main-pass calls reached 1,185 and triangles 238,720; the software renderer's frame EMA was roughly 115–130ms, which is a test-host limitation and explicitly not a mobile performance pass. Crowded real-device playtesting is required before approval.
