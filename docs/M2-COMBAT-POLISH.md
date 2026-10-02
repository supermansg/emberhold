# M2 Combat Polish

Base: M1 `0019ff0`. Delivery branch: `feature/m2-combat-polish`. Production/main stays `88ba79a`; review on Preview before merging.

## What changed

- Brass retains its physical twin-cannon socket and cosmetic recoil, with stronger crossed muzzle flash, three short steam puffs, an ejected casing, ballistic trail and directional debris. His pool now warms before combat.
- Ember has a bright fire core and expanding orange trail, pooled fiery bursts and briefly glowing cracks only where observed burning enemies support residue.
- Volt has continuous jagged source-to-target arcs built from shared instanced segments, including the engine's actual chain endpoints and brief fading discharge.
- Nova has a sharp elongated crystalline core, thin cold trail, restrained ice fragments and clear slow/freeze colors. All base rigs expose a physical attack socket; meteors retain their sky origin. Existing authored variant colors/styles are preserved.
- Damage sprites reuse 28 canvases/textures with phone-sized glyphs, directional drift, small pop and faster fade. Existing engine coalescing stays authoritative. Ordinary number admissions cap at 10/16/24 for Low/Standard/High, leaving capacity for actual callouts. Normal/elemental numbers and actual POWER/ULTIMATE/SHATTER/COMBO/shield labels differ. Nearby labels never imply a numeric bonus; the engine does not expose per-number bonus attribution, so M2 does not invent it.
- Grunts recoil lightly, runners react quickly, armored actors have much smaller displacement and bosses barely recoil. Reactions use actual numeric damage records, never healing/decorative blasts. Actor material clones are created once per spawn, flash briefly, and dispose with their actor. Removed enemies immediately leave active actors/picking; only bounded cosmetic corpses remain for .55 simulation seconds.
- Quiet path ruts, sparse ruined border masonry, cooler distant fog, inexpensive rain ripples and wet soil roughness add depth. Existing warm fort light remains. World-space boss presence, brighter target confirmation, burn/freeze states, contact-threat health colors and a low-HP fort warning improve readability.
- Camera impulses are capped at .22 and reserved for engine shakes of at least .18 (major powers/boss events). No routine fire-shot shake, global hit-stop, gameplay knockback, physics engine or new lights/post-processing.

## Performance foundations

Every elemental projectile/muzzle/bolt/impact/blast/death/ring uses fixed, prewarmed slots (88 total), sharing geometry and slot-owned reusable opacity materials. Brass retains 48 fixed slots. Ground scars now use 25 fixed slots and shared circle/crack geometry instead of per-impact geometry/material creation. GPU resources remain bounded; overflow suppresses presentation, never engine damage/rewards.

Quality is available in the pause menu and persists under the separate `emberhold-presentation-quality` preference, outside the existing save format:

| Setting | Pixel ratio ceiling | Shadows | Combat decoration | Rain / leaves / dust / ripples / smoke | Cosmetic corpses |
| --- | --- | --- | --- | --- | --- |
| Low | 1.0 | Off | 24 | 40 / 8 / 16 / 0 / 4 | 3 |
| Standard | 1.35 | Existing | 72 | 80 / 24 / 32 / 8 / 8 | 6 |
| High | 1.6 | Existing | 144 | 160 / 48 / 64 / 16 / 12 | 6 |

Including Brass's three steam puffs, decorative particle ceilings are 95/227/447. Essential arc segments, projectiles and status/target geometry are separate fixed-cap feedback. Frame-time hysteresis reduces combat decoration to at most 12 and suppresses steam/ripples under sustained slow rendering; it never changes simulation steps, quality-selected pixel ratio, targeting or damage. Older admitted numbers/corpses expire naturally across quality transitions.

`BattleView.presentationStats()` reports smoothed frame interval and CPU render-call time, active pooled effects, decorative particles, active numbers and main-pass renderer calls/triangles. CPU timings do not represent GPU completion. Three's auto-reset counters do not include a combined shadow-pass submission total.

An identical paused 390x844, four-defender/12-enemy/boss fixture measured M1 at 473 calls / 126,808 triangles and M2 Standard at 475 calls / 126,632 triangles. Pixel ratio was 1.6 versus 1.35 respectively (about 29% fewer framebuffer pixels). Active combat counts vary with effects/corpses; these are structural comparisons, not real-phone FPS claims.

## Validation and limits

All nine original scripts, M1 and focused M2 checks pass. Complete seeded runs match M1 exactly for all four starting heroes. Engine, content, progression, collection, audio and lockfile remain byte unchanged. No balance, waves, rewards, ownership, save migration or stable-ID changes.

M2 checks cover pooled reuse/caps, chain endpoints, disposal/reset, truthful feedback, differentiated responses, quality/speed Game-state parity, pause, class deaths, meteor sky origins, authored variants, non-damaging effects, major-only camera impulses, dense particle budgets and fixed scar lifecycle. Independent review identified variant-color loss, false bonus attribution and healing-triggered reactions; all were corrected and regression checked.

Browser tests exercise actual WebGL2, launch/new run, four heroes, physical hero/enemy picking, inspection, pause/resume, 1x/2x/3x, leader power, meteor/blizzard, loot and wave progression, quality switching while paused and reduced motion. Captures cover 390x844, 320x740 and short 360x640, crowded/boss, day/night/rain, death and simultaneous abilities. The harness intercepts only its own app response for controlled fixtures; no shipped test/debug API is added.

```sh
python3 -m http.server 4175 --bind 127.0.0.1 --directory dist
# Separate terminal; Playwright/Chromium supplied externally, no project dependency added:
M2_BASE_URL=http://127.0.0.1:4175 node scripts/verify-m2-browser.cjs
```

Override `PLAYWRIGHT_MODULE`, `CHROMIUM_PATH`, `M2_ARTIFACTS` as needed. Software SwiftShader renders validate appearance/interactions, not phone GPU FPS, battery/thermal behavior or touch comfort. The original randomized mastery-option assertion can intermittently fail on baseline; it has not been altered. Procedural art and existing progression remain intentionally intact. Physical-device Preview playtesting is the remaining validation step.
