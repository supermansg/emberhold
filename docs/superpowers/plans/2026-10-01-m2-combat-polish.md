# M2 Combat Polish Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline. Steps use checkbox tracking.

**Goal:** Distinct, tactile, readable mobile combat with bounded presentation resources.
**Architecture:** Consume existing engine effects without editing simulation. Retain M1 Brass socket/pool and add fixed elemental pools, a damage admission/pool module, class-specific actor feedback and a presentation-quality controller. Render/cosmetic time follows Game.time; instrumentation uses wall time only.
**Tech Stack:** Existing authored JavaScript, vendored Three.js, Node 24, optional external Playwright/Chromium. No new runtime dependencies or assets.
**Spec:** User's M2 COMBAT VISUAL POLISH & PERFORMANCE brief in this task; M1 visual direction approved on a real mobile Preview.

## Global Constraints
- Base feature/m1-combat-visual-slice at 0019ff0; delivery feature/m2-combat-polish.
- main/Production stays 88ba79a. No merge/promote/production deploy.
- engine, progression, collection, content, save format, balance, economy/rewards and IDs unchanged.
- dist is authored source. No cleaning/build output over it.
- No gameplay knockback, hit-stop, physics authority, invented crits or full model replacement.

## Review Focus
- Effects missed between renderer frames must never invent damage, retarget shots or delay rewards.
- Optional/custom adapters and fifth/future hero styles retain valid fallback behavior.
- Boss/selected target and hero controls stay clear in narrow and short portrait.
- Quality changes and dense effects cannot mutate Game, drop essential target/status indicators or leak pools.
- Pause/restart and 3x frame skipping reset/expire presentation safely.

## Task 1: Pooled attacks and damage feedback
**Files:** dist/combat-vfx.js, dist/damage-feedback.js, dist/render3d.js, dist/m1-presentation.js, verify-m2.mjs.
**Interfaces:** CombatVFX.acquire(kind,hero), update(object,effect,source,target,camera,reduced,decorative), release/reset/dispose/stats; DamageFeedback.acquire(effect,state), update(object,effect,camera,direction), release/reset/dispose.
- [x] Add failing checks for bounded pools, reuse, distinct archetypes, chain endpoints, truthful feedback states and disposal.
- [x] Implement fixed reusable projectile/muzzle/bolt/impact/blast/death/ring resources and pooled numeric sprites with priority caps. Preserve engine projectile duration/destination and observed labels.
- [x] Integrate physical elemental sockets and M1 Brass improvements without changing Game.
- [x] Run focused checks and all existing suites.

## Task 2: Reactions, atmosphere and quality
**Files:** dist/combat-presentation.js, dist/presentation-quality.js, dist/render3d.js, dist/m1-presentation.js, dist/environment.js, dist/app.js, dist/style.css, verify-m2.mjs.
**Interfaces:** observeHit(actor,enemy,effects,time,origin), poseEnemy(actor,enemy,time,reduced), feedbackState(effect,effects); PresentationQuality.set(level), observe(now,renderMs,counts), apply(renderer,world), stats.
- [x] Add failing checks for differentiated cosmetic reactions, corpse caps, quality-state immutability, pause/speed parity and reset.
- [x] Add quiet shoulders/ruined masonry, cheap wet sheen/rain ripples and distant fog separation. Retain existing lights and camera.
- [x] Add selected-target confirmation, truthful burn/freeze, boss presence and fort danger; optional quality selector in pause menu. No permanent extra panel.
- [x] Apply Low/Standard/High pixel/particle/shadow budgets and suppress decoration first under load; essential projectiles/status remain.
- [x] Run focused and full suite, compare complete seeded outcomes against baseline.

## Task 3: Validation and delivery
**Files:** scripts/verify-m2-browser.cjs, docs/M2-COMBAT-POLISH.md, package.json.
- [x] Browser-check narrow/short portrait, 1x/3x, crowded/boss/rain/night/four defenders/multiple abilities, picking and quality transitions; save screenshots outside checkout.
- [x] Review full diff independently; fix important findings with regressions. Verify protected authoritative files byte unchanged.
- [ ] Commit complete M2; push feature only; create PR into main without merging; inspect Preview deployment and verify main baseline.

## Ledger
- Clean M1 checkout at 0019ff0 verified; new branch created.
- Ruling: execute user-supplied implementation brief directly, inline, without repeated design approval — their explicit implementation/delivery instructions govern workflow.

- Tasks 1/2 complete: fixed elemental/Brass/damage/scar pools, physical sockets and meteor compatibility, class responses, quiet atmosphere, tier selector and counters. Focused checks observed missing-owner/module failures before implementation and pass afterward.
- Task 3 browser complete: actual WebGL2 software rendering, portrait/narrow/short, day/night/rain, crowded/boss/abilities, physical picking, pause/speeds/quality and rewards/waves; no page errors. Artifacts under /tmp/emberhold-m2-artifacts.
- Final independent review: three Important presentation findings (variant colors/styles, false cross-target bonus attribution, healing reactions) reproduced, corrected and regression checked. No minors deferred. Fixed scars also avoid existing per-impact geometry allocation; all resources prewarm/reuse.
- Ruling: only actual engine callouts identify special/synergy/shield feedback; coalesced numeric damage retains normal/elemental classification because the engine does not expose authoritative per-number bonus attribution — prevents invented bonuses — cost: special damage uses its callout rather than recoloring the total number.
- All four complete seeded authoritative run outcomes match M1; engine/content/progression/collection/audio/lockfile byte unchanged. Structural browser fixture: M1 473 calls/126808 triangles versus M2 Standard 475/126632; software GPU is not phone FPS evidence.
