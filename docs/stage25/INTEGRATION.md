# Stage 2.5 integration record

Repository: supermansg/emberhold. Branch: codex/stage25-integration. Base: c2a39a14e22b3e716a84bc8fa35e83e3585cd14b, verified by git fetch and PR #6 metadata. Main remains 88ba79af3a59253090565b950e9cdcf3b19d6370. Existing PR #6 targets feature/m5-premium-vertical-slice and remains draft/unmerged. No production promotion.

## History and comparison

Full fetched line: 88ba79a → 0019ff0 M1 → e16ed25 M2 → 990b3f9 M3 → ae55318 M4 → 56eab30 M4.1 → 63b8516 M5 → cce0fee M5.1 → c2a39a1 M5.2. M5.2 changes 95 files relative to main; Stage 2 being more recent is not a feature precedence rule.

| Area | Main-based Stage 2 | M5.2 | Integration choice |
|---|---|---|---|
| Offers | Protected tactical slot + seeded regression | Original overwrite bug; mastery fixture pins a passing seed | Reproduce seed 7, port the single-clause correction and full deterministic coverage |
| Combat | Original timing/XP | Presentation metadata, M4 XP curve, full-lane zero-damage Shockwave | Preserve all M5.2 authority except offer fix |
| Characters | Procedural only | Authored rigid Brass GLB, real loader/cache/socket adapters, attack envelopes | Preserve M5.2 code and asset bytes |
| VFX | Original effects | Shared pools, distinct contacts, Special rigs, Shockwave origin/front, quality tiers | Preserve unchanged |
| Audio | Original procedural mix | Persisted separate buses, score, priority ducking, crowd attenuation | Preserve unchanged |
| Upgrade UI | Original cards | Vector category illustrations, guarded selection/overflow, pooled reward motion | Preserve M5.2 |
| Mobile | 44px, gesture/safe-area and landscape rules | Many touch controls already 44px, narrow/short portrait coverage | Only additive gesture/safe-area/landscape; adapt four-power layout, not old three-slot assumptions |
| Performance | Opt-in raw RAF mean/p95/max, heap/renderer history | Quality controller stats smooth intervals and ignore ≥250ms stalls | Keep controller; port diagnostics reading its quality/particles/audio without influencing it |
| Tests | 12 Node suites | 19 Node suites and extended browser/stress harness | 23 Node suites, portable authority guards, touch/landscape QA |
| Deployment | Draft npm test / dist config | No vercel.json, CI runs only first three suites | Static test-gated Preview config; CI full history and all tests |
| Stage 3 spec | Assumes no GLB/loader yet | Real asset/adapter proof already shipped on branch | Mark old spec historical; propose skeletal/textured successor |

## Conflict resolutions

No blanket stash application or older file replacement. Stage 2 was snapshotted with verified SHA256 for 20 files outside the repository and kept in a named Git stash before branch switch. Unique regression/diagnostic/config/doc files were selectively copied; engine/app/CSS/package/CI changes were manually integrated into M5.2.

M5/M5.2 source-preservation tests initially failed on Windows CRLF versus Git LF. The helper normalizes line endings only, and permits exactly `out[2]=recruit;` → `out[out[2]===tactical?1:2]=recruit;` in engine.js. Duplicate exceptions throw. New integration checks verify unrelated changes remain detectable, preserve all other authority and key presentation sources, and compare art assets as exact bytes. Do not call the engine byte-identical after the approved bug fix.

All shaders/rendering/character/animation/VFX/audio source files remain M5.2; only app-level diagnostic sampling and additive CSS are introduced to presentation. No dependency, reward/save schema, hero ID or XP curve change. CI needs full history because historical authority tests use git show.

## Release boundary

vercel.json runs npm test and publishes authored dist; it creates no generated dist/dist. This preserves live static asset/module paths, GLB and matching loader addons. Current production deployment at start: dpl_FoxG6714A2BrDZK2P3MRDrpyegts, target production, SHA 88ba79a. Only a dedicated branch push/Preview is authorized. Exact final commit and Preview identity must be read from Git/Vercel, not inferred from push success. See QA.md for results and outstanding device acceptance.
