# Product references

Checked 2026-09-08 against official Steam store descriptions. These are mechanism references and design inspiration, not causal research evidence or hands-on comparator playtests.

- [Thronefall](https://store.steampowered.com/app/2239150/Thronefall/), released 2024-10-11: compact kingdom defense, fortification, unlockable perks and optional difficulty modifiers. Relevant to Emberhold's fort identity and bounded controls. Its direct-action and building systems are not proposed for wholesale transfer.
- [20 Minutes Till Dawn](https://store.steampowered.com/app/1966900/20_Minutes_Till_Dawn/), released 2023-06-08: survival roguelite emphasizing powerful builds. Relevant to more differentiated run choices; its movement/aiming control demands differ from Emberhold.
- [Rogue Tower](https://store.steampowered.com/app/1843760/Rogue_Tower/), released 2022-01-28: tower defense with roguelike upgrades, card draws and path expansion. Relevant to upgrade decisions; path building is outside Emberhold's approved scope.

Observed source opportunities: v3 damage applied before decorative projectile arrival; largely shared character geometry; one fire/lightning synergy; bosses used the same contact-attack behavior; permanent commander XP had no content-unlock effect.

Hypotheses: synchronized impact timing and distinct silhouettes improve perceived clarity and weight; specialization/synergy choices increase meaningful variety; visible fort changes give achievements a lasting place. Confidence in source findings is high; player-experience benefits remain unvalidated. No retention, revenue or FPS uplift is inferred from store ratings or simulation results.

## Living world and replayability audit, 2026-09-08

Evidence: current source at d076cdaacbadc1512189ed52741b526e21680359; user-rendered phone screenshot; sampled both new user videos (1000241924.mp4, 16.16s, every 2s; 1000241925.mp4, 7.98s, every 1s). This is screenshot/video inspection and source inspection, not a new device playtest. No new runtime changes or deployment in this audit.

The screenshot shows a large flat blue region above a sharply ending road, the lodge obscuring defenders, and repeated circular scars. Source confirms finite ground meshes (length 30/40), uniform fog/background, all conifer meshes merged by batchStatic, fixed lights, identical radial crater geometry, and a ten-wave terminal condition. Existing HP scaling is 1 + .17*(wave-1) + .025*(wave-1)^2; enemy composition/volume also increases. Permanent shop caps are eight; commander levels do not currently unlock a new challenge path.

Observed Bullet Heroes mechanisms: first video ~2-8s has terrain and cliff boundaries continuing into distance, bright attack arcs against subdued ground, physical ammo indicators and small white drifting particles. ~10-14s shows three skill options and DAMAGE BOOST +15% confirmation near the hero. Second video ~0-3s shows active fire along the defense line and green recovery indicators; ~4-6s settings separate music/sound/haptic. These clips do not establish the game's long-term retention or hidden progression systems. Adapt spatial feedback and depth, not artwork or advertisement options.

Primary references checked 2026-09-08:
- https://www.redblobgames.com/maps/terrain-from-noise/ (practitioner implementation guidance, page dates 2015-2022): combine noise scales and independent offsets to produce varied but coherent terrain. Adapt as coherent wind/placement, not independent random jitter each frame.
- https://github.com/mourner/suncalc (official implementation): solar position uses timestamp and latitude/longitude. Israel timezone alone is insufficient for geographically exact solar position. Proposed fixed central-Israel reference location, explicitly illustrative, with Asia/Jerusalem clock labels; no personal geolocation. Weather can be simulated separately, not presented as live weather.
- https://store.steampowered.com/app/1108370/Ratropolis/ (developer listing): tower-defense/deck-building with cards unlocked across attempts, random decision events and distinct leaders. Relevant mechanism: more viable choices between runs. Different platform/input complexity; no causal retention inference.
- https://store.steampowered.com/app/1944570/Boneraiser_Minions/ (developer listing): minion auto-combat, relics/spells and meta upgrades alongside stronger enemy forces. Relevant mechanism: explicit player-selected escalation and build variety. Movement-based survival differs from Emberhold's static defense.

Design hypothesis: visible near-term goals plus alternative builds and explicitly unlocked challenges will support repeat play. This has not been measured. Do not promise that players cannot exhaust the content or attach a numeric retention uplift.
