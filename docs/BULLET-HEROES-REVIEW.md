# Bullet Heroes reference review

2026-09-08. Source: user-provided `1000241716.mp4` (52.733 seconds). Reviewed a contact sheet across the recording and half-second samples of the opening 30 seconds. This is observed screen content, not a full playtest or a claim about the game's unseen systems. No competitor assets were imported into Emberhold.

## Observations and proposed adaptation

| Recording | Observed mechanism | Emberhold adaptation | Effort and check |
| --- | --- | --- | --- |
| ~18-26 s and later battle | Portrait battlefield dominates the screen; wall HP is spatially attached to the defense line, top information is compact; projectiles contrast with the muted floor | A battle-specific mobile layout with compact wave/XP information, one protection indicator and clearly visible hero positions. Preserve Emberhold's forest/fort identity and low camera. Collapse secondary explanations into the existing inspection panel | Medium. At 390x844 and 360x800, all main battle controls fit without page scrolling; heroes, threats and targets remain identifiable |
| ~27.5-29.5 s; subsequent upgrade screen | Three short visual skill choices; cannon/machine and ammunition exist physically in the arena, with clearly visible projectile bursts | Concise upgrade cards: one effect icon, one benefit sentence and one before/after metric; expandable details. Later, attach a visible mechanical change to an approved upgrade (e.g. magazine rounds or a changed weapon attachment). Show existing hero recharge progress in-world | Cards medium; new mechanics large. Player can describe the selected benefit before resuming. Preserve pause semantics; test damage/balance if shot counts change |
| ~6-12 s | Hero collection grid, focused character panel, level progress and stat comparison; bottom navigation separates activities | Three focused destinations: Battle, Heroes, Fort. Reuse existing permanent hero training and before/after values in a dedicated hero page. Give each hero a larger visual presentation and clear next training step | Medium. Reach and understand one hero's training in two taps; preserve old purchases. Inventory, new currencies and hero unlocks are separate future proposals |

Art direction hypothesis: clearer silhouettes and contrast, a less busy combat floor, stronger separation between distant scenery and active enemies, larger selected-hero presentation and visible upgrades should improve readability. Their impact on enjoyment remains unvalidated. No promise to exceed another game's quality is made.

Retain prior proposed specialization/synergy and boss-counter ideas in the backlog. They remain unapproved. The user asked to review this reference before choosing more live changes; this review does not authorize silently adding all suggested systems.

## Current QA and access facts

Added a development-only Vite entry point so the existing authored `dist` files can run in the supervised browser preview; production architecture/assets are unchanged.

Actual desktop browser checks passed on the candidate: lobby, starter choice (Nova), combat and level-up, recruitment (Ember), hero information, speed 2x, pause and retirement settlement (7 coins and 21 career XP in this test). Three.js reported that WebGL is disabled in the cloud browser; Canvas fallback ran. These checks do not verify the candidate's 3D appearance, GPU performance, audio mix or real mobile layout.

Visible issue for the next UI pass: mixed Hebrew numeric counters can reverse visually (for example XP fractions). Use isolated LTR numeric groups when redesigning counters; do not treat DOM text alone as proof of visual ordering.

The user explicitly authorized public access and future deployment of upgrades after they are checked. Sites confirmed `access_mode: public`, revision 2. No new version was deployed during this review. Anonymous HTTP requests returned Cloudflare 403 / error 1010 from this environment and web lookup failed; public visitor reachability is not yet independently verified. Saved version 4 remains available for a later verified release.

## Approved implementation, release 5

The user subsequently explicitly approved implementing the reference-derived improvements and publishing publicly. Implemented three destinations (Battle, Heroes, Fort), enlarged portrait battle with compact HUD and wall-attached health, concise upgrade cards with expandable details, focused hero showcase using existing permanent training, charge/ammunition indicators, and dynamic hero equipment. This release includes the previously saved combat polish. No competitor assets, new currencies, unlock systems or numerical balance changes were added.

Validation: all three Node verification suites and app syntax check passed. Actual browser checks covered Heroes/Fort navigation and a 390x844 iframe viewport: home, starter selection, battle, changing ammunition, speed, pause and retirement. A temporary fixture reused the production upgrade-rendering functions with real Game options to check expandable explanations and choosing an upgrade; it was removed before packaging. Battle and home screenshots were inspected; upgrade screenshot capture timed out, so that check used the DOM. WebGL remains unavailable in this browser; GPU rendering/performance, audio mix, and physical mobile devices are not verified. Scene lifecycle tests passed with 32/25/26/27 hero meshes. Public access confirmed through Sites before publication; independent anonymous reachability remains unverified due the previously observed environment block.
