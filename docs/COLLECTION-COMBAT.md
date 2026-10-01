# Collection and combat deck release

Baseline: publicly deployed version 8, source e45147d17c753f6e6dfc7132f6bd335ff67f8a6c. This release implements the user's five requested areas without changing the Site identity or adding a paid economy/service.

## Interface and camera

The leader power and two equipped spell slots are in a dedicated layout row after the battlefield. The automatic shield information and a three-mode camera button occupy a small header in that row. They are no longer positioned over characters/health. Modes are tactical, close rear, and overhead; preference is device-local. The 2D fallback retains its fixed view and disables camera switching. Camera projection fixtures cover all four line positions; actual mobile screenshots and occlusion at every terrain edge are not GPU-verified.

## Keys, chests and cards

Every 12th kill drops one key, bosses drop three additional keys. Keys use the same delayed loot lifecycle, appear as world loot and a HUD flight, and are banked only in terminal settlement alongside existing rewards. The per-run settlement flag prevents repeated credit in memory. Reloading an unfinished run still loses that run, as before. There is no server-authoritative economy or cross-device persistence.

Rare costs 5 keys: 4 hero cards (free starters or rare heroes), 3 spell cards. Epic costs 12: 10 hero cards (starters/rare/epic), 5 spell cards. Legendary costs 24: guaranteed new hero while an eligible locked hero exists, plus 8 spell cards. For this guarantee, it grants the remaining unlock cost plus 24 cards. If all are owned it grants 24 cards to a random eligible hero. Within each eligible hero pool selection is uniform. Spell identity is uniformly selected from four spells. Pools/selection explanation are available in the interface.

The four original hero IDs stay free. Six new heroes and every future registered ID begin locked. Rare/epic/legendary hero unlocks consume 8/16/24 cards respectively. Default future rarity is rare. Extra hero cards upgrade a permanent card rank (0 through 5), consuming 4*(next rank) cards. Each rank adds 6% starting damage and 30 mastery XP. Existing training and XP remain intact.

Spell unlock consumes 3 cards. Extra cards upgrade rank 0 through 5 (UI levels 1 through 6), with the same escalating 4/8/12/16/20 costs. Equip at most two spells before the run. A run snapshots equipped spell levels; they charge independently from kills and reset charge only on a successful use. Hero leader powers remain separate and available through the leader's identity.

Chest cost and rewards are saved in one localStorage write before the reveal animation. On write failure the in-memory opening is rolled back and no success reveal is shown. This is device-local UX consistency, not anti-cheat or multi-tab transaction safety. Opening a chest is never a purchase with real money.

## New content

Sol: rare solar marksman; piercing projectile applies half damage to a nearby enemy behind the first target. Briar: rare grove guardian; direct thorn hit restores one fence HP if damaged. Cinder: epic magma smith; wide blasts with five-second burn. Prism: epic light caster; three starting chain targets. Umbra: legendary void hunter; direct projectile adds 35% damage against a target below half HP. Aurora: legendary polar guardian; 55% starting slow and eleven-second automatic freeze. Six authored model decorations and projectile palettes use the same model factory in combat and portraits. These are procedural models, not imported high-detail art.

New collectible spells: Meteor (three delayed area impacts), Blizzard (global visible-enemy hit/slow), Thunder (six-target chain), Renewal (bounded fence repair). All expose charge needs, upgrade scaling and ownership in the collection grid. Core powers/collection spell details are separate from automatic hero attacks.

## Visual changes and evidence

Muzzle flashes, directional projectile tails, colored specialty shots, sky-origin meteor trajectories, varied prism bolts, stronger hit squash and key loot. Existing effect caps remain. Chest lid/reward-card animations respect reduced motion.

Eight executable suites pass. New coverage includes migration, starter/future locks, legal recruits, all six new heroes, delayed key drops, exact-once settlement, chest consumption and unlocks, duplicate card upgrade, equip limits, all four spells, three camera projections and distinctive actor geometry. Existing auto-combat baseline outcomes remain unchanged without new unlocks/equipped spells.

No current browser/GPU screenshot, touch-device or mobile FPS verification. The current step does not claim all visual overlap/asset capture cases are proven on a phone. Ice/alien campaigns and imported GLB art remain separate backlog items.

## Audio and screen feedback added before publication
The user's follow-up requested better shooting/reload/impact sound in this same release. Added layered transients, low-frequency body and metallic/magic tails, slight shot pitch variation, stereo source placement, separate magazine-out/ready events, bounded 28 audio voices with cleanup, muted-state and per-sound rate gates. New cues for keys, ready powers and chest reveal. A compact status line lives inside the deck; reload highlights remain on hero information buttons. Nine suites now pass including verify-audio. Audio node/event tests do not constitute listening or mobile-speaker verification. The intermediate saved version 9 was not deployed; publish the combined revision.
