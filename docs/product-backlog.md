# Current premium product roadmap — Stage 2.6, 2026-10-23

This is the product specification source of truth. Historical backlog below is retained for provenance; its publication/status statements are not current. Production release evidence lives in stage25/QA.md; release workflow in DEVELOPMENT.md; mobile gates in qa-checklist.md; asset production detail in stage25/PREMIUM-VERTICAL-SLICE.md. Everything below is a proposal unless explicitly marked stored/implemented. No complete UI redesign, profile, authentication or sharing implementation is included in Stage 2.6.

## Priorities and acceptance

| Priority | Milestone | Player / visual impact | Complexity / regression | Dependencies and acceptance |
|---|---|---|---|---|
| P0 | Release Stage 2.5 | Makes existing gameplay improvements available to players | Low code change; high release consequence | Exact candidate, tests, Preview, save round-trip, owner authorization, public-origin post-deploy smoke and rollback |
| P1 | Stage 3A: Brass + forest premium slice and render optimization | High combat feel and visible asset improvement | High / medium-high | Approved reference, verified Blender, independent skeleton cloning, unchanged authority, frozen-scene comparisons, real-phone budgets; detailed spec linked above |
| P1 | Stage 3B: mobile shell and component pilot | High readability and navigation; medium visual | Medium / medium | Logo/header/nav + hero card + pause pilot at 3 viewports, every required action reachable; retain all gameplay surfaces; owner-approved visual comparison before wider rollout |
| P2 | Honest local profile and sharing | Medium progression clarity and discoverability | Medium / low-medium | Read-only existing-data selectors first; versioned profile sidecar and new statistics instrumentation approved separately; native sharing with safe fallback |
| P2 | Instrumented run recap and goals | High replay motivation; medium visual | Medium-high / high save risk | Stable run ID, exact-once settlement log, retention policy, no invented historic wins; seed/balance playtests |
| P3 | Accounts and multi-device saves | High continuity for returning players | High / high privacy/economy risk | Backend decision, account isolation, explicit local import, conflict handling and offline tests |
| Future | Friends, multiplayer, social features, live events | Potential social engagement | High / high | Real authenticated identity, authoritative economy, moderation and product approval; not in next slice |

Recommend Stage 3A next, starting with a small optimization/reference gate before asset production. Stage 3B can follow once the art language is approved. Physical phone QA is still an explicit outstanding gate, not inferred from emulation.

## Premium UI/UX blueprint

Identity: enchanted deep teal forest, warm amber fortress windows, brass mechanics, restrained rune accents; avoid bright decorative noise behind targets. Hebrew RTL is primary; numbers/timers and the English logo keep deliberate LTR isolates. Use the current brand image assets/emberhold-brand.jpg as the identity anchor rather than adding another logo variant.

Existing integration seams: dist/index.html supplies lobby/shop/collection/battle/mainNav/overlay; dist/app.js navigate(), lobby(), renderCollection(), pause() and openModal() own views; dist/style.css owns breakpoints. Extract small reusable DOM builders/controllers incrementally, keeping these public IDs and game/save handlers stable. A framework migration is not part of this proposal.

| Primitive | Proposed contract |
|---|---|
| Palette | Background #0D1A1C; elevated surface #173039; text #F4EBD9; muted #B8C7C1; amber #F2BC67; frost #9ADCE7. Verify contrast on actual composited backgrounds; colors alone do not communicate state. |
| Scale | Space 4/8/12/16/24/32 px; body 16px, metadata at least 12px with contrast, headings 24/32px using clamp. Controls >=44x44 CSS px, 8px separation, visible keyboard focus. |
| Cards | One shared Card shell with media, label, heading, data, primary action and optional secondary action; variants hero/upgrade/shop/result. Define loading, empty, locked, available, selected, equipped, maxed and error states. Display real cost/shortfall and before/after values. |
| Navigation | One persistent HeaderBrand and labelled IconButton family; active destination uses aria-current plus shape/text. Bottom nav on portrait with safe-area bottom padding; short landscape uses the existing side region. Never add a fifth nav item by squeezing labels: profile opens from header. Back returns to prior view and restores focus/scroll. |
| Motion | press 80ms, state 140ms, screen 200ms, reveal 280ms; standard ease cubic-bezier(.2,.8,.2,1). Animate transform/opacity; no layout shifts. Cancel stale transitions; one input action per activation. Reduced motion removes parallax, travel and scale, keeps immediate state feedback. |
| Feedback | Shared primary/secondary/danger action semantics, loading/disabled rationale, toast with aria-live, focus-trapped modal, sound cue via existing UI bus after user unlock. Never play purchase success before persistence returns success. |

Screen composition:
- Main menu: brand once in the top safe region, one obvious Play action above secondary destinations, career/next-goal panel based on real data. Keep the background quiet behind text. No blocking cinematic on repeat entry.
- Animated background: reuse the existing Three home scene if available; otherwise a layered still. One canvas/context, suspend offscreen/hidden, no pointer interception. Prefer 15–30Hz decorative updates, low tier still image and reduced-motion still. No second continuously rendered scene behind battle.
- Collection: shared hero card with consistent portrait framing, real rarity label + icon + color, locked requirements and collected-card counts. Locked hero preview remains available without implying ownership. Reuse existing turntable lifecycle; release detail resources on exit.
- Shop/progression: preserve actual currency and max ranks, show cost/result together, keep purchase action visible after scroll, and distinguish training, card rank, hero mastery and run level. Persist failures must be visible.
- Combat: preserve health, wave, XP and four power slots. Give enemy/boss telegraphs highest visual priority; damage numbers and scenery cannot mask them. Pause owns resume, audio, quality and end-run; confirm destructive end-run only without changing settlement semantics.
- Transitions: preserve scroll where appropriate, focus new view heading, block duplicate activation only for the short transition; do not delay gameplay-critical input for animation. Loading/asset failure must retain procedural/static fallback and a usable Back action.

Proposed UI budgets: <=2 animated decorative layers, no unbounded backdrop blur, no idle particle system in every card, reuse images/models and event delegation. Measure UI-only transition work against a 4ms main-thread target on an agreed phone; targets are not measured achievements. Keep asset/render budgets in the single art specification. Component pilot acceptance: home + hero card + pause before applying to every screen.

## Player Profile: data inventory and architecture

Verified schema: dist/progression.js DEFAULT_SAVE/migrateSave/settleRun/heroProgress; dist/collection.js migrateCollection/ownsHero; dist/app.js reads/writes emberhold-v1 in localStorage. Sound, bus gains, camera and quality use separate emberhold-* keys. No auth SDK, email, account ID, profile image or cloud backend is implemented.

| Category | Available data / honest presentation |
|---|---|
| Stored now | coins; careerXp; best (highest wave reached, NOT proof of victory); permanent training keys; per-hero xp, seconds, score, runs; collection keys/opened, hero/spell cards/rank/unlocked, two-slot loadout |
| Reliably derived | career level via careerProgress; hero mastery via heroProgress (includes training/card contributions); owned/locked heroes via ownsHero plus free IDs; current balances, unlock requirements and card ranks; accumulated per-hero combat minutes and score |
| Must not derive as totals | Sum of hero runs is not number of player runs (multiple heroes per run, runs increment only if score>0); summed hero seconds is not wall-clock play time (concurrent heroes); best=10 is reached wave, not wins; score is not kill count |
| New local instrumentation | Player run/win/loss/retirement counts, total kills/bosses, exact duration, per-run records, damage, chronology/activity, achievement completions, first/last played. Existing game fields are transient; settleRun does not persist a run ledger or totals. No fabricated backfill. Show 'Tracked since version …' and no-history empty state. |
| New profile data | Display name and selected unlocked hero avatar ID; optional custom image. Not currently stored. Default label can be 'מגן הגחלת' without pretending it is an existing player identity. Validate length, escape text; do not interpolate user input into innerHTML. |
| Auth/cloud required | Verified email, real login/logout, cross-device identity, cloud avatar URL and synced history. Guest mode displays 'Saved on this device' and account actions only when genuine auth exists. |

Proposed first local profile: header name/avatar, career and highest-wave cards, owned-hero gallery, per-hero mastery, clear local-save note, and honest empty states for new history/achievements. Hide unimplemented statistics rather than zeros labelled as lifetime truth. Achievements require versioned definitions, event evidence and unique unlock IDs; existing level/unlock gates are not an achievement system.

Keep optional profile in a new versioned sidecar (e.g. emberhold-profile-v1), not unrecognized fields inside emberhold-v1: current migrateSave intentionally drops unknown fields. Keep aggregate/event schema separate and bounded (e.g. newest 50 run summaries, stable run ID and exact-once settlement key). Do not store active-run events every frame. Unknown future versions remain backed up/read-only rather than normalized destructively. Implement migration backup/validation and quota/write failure handling before new persistence; no such migration is introduced in this release.

Avatar choices are existing unlocked hero assets, with a default silhouette on unavailable art. Optional upload is a separate approved feature: local raster decode/re-encode, strip metadata, 512px max, <=256KB output, reject SVG/HTML and invalid images, preview/remove controls. Store binary in IndexedDB rather than base64 localStorage. Cloud upload later needs MIME/content checks, private per-user storage and deletion; never expose a local filesystem path.

Future architecture evaluation: retain guest/offline play; use an auth adapter plus profile/progress repository outside Game/render loop. Managed Auth + Postgres + object storage (for example Supabase) is a candidate, not configured. RLS must restrict each row/object to its owner; service secrets never go to the browser. Email comes only from a validated auth identity. Anonymous hosted auth alone does not make a guest recoverable on another device; an explicit verified identity/link is needed. See [official user model](https://supabase.com/docs/guides/auth/users) and [row isolation guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).

Suggested entities: profiles(user_id, display_name, avatar_ref); progress(user_id, schema_version, revision, snapshot); run_summaries(user_id, run_id, outcome, tracked_fields); import_receipts(user_id, source_install_id, hash); achievements(user_id, definition_id, version). Treat local snapshots as untrusted imports. Currency/purchases eventually need server transactions and idempotent commands, not client-authoritative JSON uploads. Existing local currency is not anti-cheat protected.

Migration: back up normalized guest save; explicit 'Import this device into account X' preview; server validates version/IDs/ranges, idempotent receipt prevents repeated grants; if cloud has progress, present a documented conflict/selection flow, never blindly sum currency or overwrite the newer revision. Persist import receipt only after transaction success. Keep recovery backup. Serialize offline commands with revision/conflict detection. Namespace caches by account ID; logout confirms pending sync, clears credentials and account cache, retains the separate guest slot without copying account data into it. Test account A -> logout -> B, failed sync, expired auth and two-device conflicts. Define export/delete/retention and avoid collecting email in gameplay analytics. No fake logout is added now.

## Reusable share-game specification

Canonical public URL: https://emberhold-five.vercel.app/ . Never derive invitation URL from location.href: that can contain a Preview token or internal route. Shared title: 'EMBERHOLD · שומרי הגחלת'. Suggested text: 'בית אחד. צוות משלכם. בואו להגן על המצודה איתי ב־EMBERHOLD!'.

Proposed shareGame() adapter, called directly from a labelled button click: use navigator.share({title,text,url}) when supported/canShare permits; treat AbortError as cancellation with no success toast and no forced clipboard copy. If unavailable or denied, offer navigator.clipboard.writeText(text + canonicalURL); announce 'הקישור הועתק' only after resolution. If clipboard fails, show selectable text and a manual copy action. Prevent concurrent share calls, keep focus, no automatic share on load, no message sending or contact access by the application. Web Share needs HTTPS/user activation and is not universally available; clipboard writes need HTTPS and may be denied. See [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) and [clipboard writeText](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText).

Acceptance: native success/cancel, unsupported API, permissions denied, clipboard failure/manual fallback, Hebrew text/RTL, no tokens/query string, keyboard/touch and no gameplay timer advancement while an in-game share modal owns pause. Tests may mock APIs; physical native sheets need real-device acceptance. No referral tracking or personal scores in invitation by default.

---
## Historical backlog (superseded status)

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
