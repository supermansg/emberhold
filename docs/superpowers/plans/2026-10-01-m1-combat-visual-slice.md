# M1 Combat Visual Slice Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for inline execution. Steps use checkbox tracking.

**Goal:** A visibly stronger procedural forest-defense slice with Brass and a common forest grunt, preserving authoritative gameplay.

**Architecture:** Keep engine, content, progression, collection and save code unchanged. Add a small presentation module for reusable surface materials, battlefield geometry and bounded Brass effects; integrate it into BattleView's existing lifecycle. Use simulation time for weapon motion, impact responses and retained visual deaths.

**Tech Stack:** Existing JavaScript modules and vendored Three.js r180, Node 24, Vite; no new runtime dependency.

**Spec:** User-approved M1 implementation brief in this task and EMBERHOLD EVOLUTION BLUEPRINT. No M2 quality system or imported actor pipeline.

## Global Constraints
- Branch: feature/m1-combat-visual-slice; baseline main 88ba79af3a59253090565b950e9cdcf3b19d6370.
- dist is authored source; never clean or build over it.
- No production deployment, merge, gameplay/economy changes, save migration or content-ID changes.
- No new shadow-casting light or post-processing. Presentation elevation stays outside the logical combat lane.
- Use existing isolated cloud checkout; no additional worktree.

## Review Focus
- Narrow portrait: full formation, touch anchors and boss approach stay usable.
- Pause/reduced motion: cosmetic motion freezes or is suppressed without changing Game.
- Death/reset: retained corpses cannot be picked or duplicate rewards; owned resources expire/reset.
- Socket projection: Brass bullets and flashes use his transformed weapon socket without changing projectile authority.
- Night/rain/crowding: palette and bounded effects do not obscure enemies or grow resources without limit.

## Task 1: Presentation contracts and composition
**Files:** verify-m1.mjs; dist/m1-presentation.js; dist/render3d.js.
**Interfaces:** surfaceMaterial(color, glow, family) returns cached material; buildBattlefield(scene, piece) adds static presentation geometry; BattleView exposes Brass userData.muzzle and weapon.
- [x] Add tests for transformed socket, actual material families, narrow camera projection and Game immutability; run and observe missing socket failure.
- [x] Implement material language, restrained terrain and defensive detailing, default camera composition and Brass cannon.
- [x] Run node verify-m1.mjs and all existing tests; inspect day/night screenshots.

## Task 2: Combat response
**Files:** dist/m1-presentation.js; dist/render3d.js; verify-m1.mjs.
**Interfaces:** BrassEffects.acquire/update/release/reset manages capped pooled muzzle/shot/impact objects; BattleView keeps a bounded fallenActors presentation list outside authoritative actors.
- [x] Add tests for pool reuse, directional response, corpse expiry/pause and reset.
- [x] Implement anticipation/recoil/recovery from current cooldown/attackAnim, socket origins and bounded steam/debris. Derive grunt reactions from existing impact effects and retain dead grunt poses for at most .55 simulation seconds.
- [x] Compare complete seeded run outcomes and Game state with baseline; run the full suite.

## Task 3: Browser validation and delivery
**Files:** docs/M1-COMBAT-SLICE.md; package.json (append new verification only).
- [x] Test actual WebGL launch, starter, targeting, physical hero picking, inspection, power, loot, wave progression, pause and 1x/2x/3x.
- [x] Capture portrait/narrow/day/night/rain/crowded/firing/death/four-defender cases; report software GPU limits, structural counts and render counters accurately.
- [x] Review complete diff independently, resolve important defects and verify the complete slice. Commit after final browser checks.
- [ ] Push only the feature branch; inspect GitHub deployment/status evidence for Preview URL; verify main remains baseline. No production CLI commands.

## Baseline evidence / ledger
- main fetched and fast-forward pulled; clean tree at 88ba79a; feature branch created.
- Initial npm test failed in verify-mastery's random defense-offer assertion. Unchanged rerun passed all nine. Seeded reproduction fails at seeds 7,9,15,25,32,65,69,88,91,93,97 in 1..100. Recruitment can overwrite a shuffled defense option at slot 2. Engine/test behavior is left unchanged; this is a pre-existing limitation.
- Baseline logs and browser captures are retained outside the checkout under /tmp/emberhold-m1-artifacts and /tmp/emberhold-m1-baseline-*.log.

- Independent review: three presentation defects (marker terrain occlusion, stale shot origins, optional adapter limbs) fixed and covered by regressions; re-review found no remaining blocker. Final nine-suite plus M1 run passed.
