# Stage 2 — stability, mobile and release evidence

Historical main-based Stage 2 report. Current integrated code and QA are documented in stage25/INTEGRATION.md and stage25/QA.md; its older source/loader assumptions are not the M5.2 baseline.

Date: 2026-10-23. Local candidate; no commit, push, deployment or cloud configuration update.

## Baseline and preservation

Working branch at start: main; clean working tree, HEAD 88ba79af3a59253090565b950e9cdcf3b19d6370. Remote origin is https://github.com/supermansg/emberhold.git. Authored production source is dist, not generated output. Source import identity c3092d3 is distinct from the root Git import commit. Preserve `.sites-source-import`, the root index, local saves and original art.

Stage 2 changes no hero IDs, progression/save schemas, rewards, damage values, timing or dependencies. Offer correction can change the choice set for previously buggy random sequences. Do not interpret seeded sample results as balance statistics.

## Changed files

- dist/engine.js: minimal protected-offer-slot correction.
- dist/app.js and new dist/dev-performance.js: opt-in development sampling, no production diagnostic activation.
- dist/style.css: primary touch sizes, battlefield gestures, safe-area/modal rules and short-landscape layout.
- package.json and .github/workflows/verify.yml: all 12 checks through npm test, locally and in future CI runs.
- New verify-offers.mjs, verify-performance.mjs and verify-release.mjs: deterministic guarantee regression, bounded statistics/static guard, deployment/source contract.
- New vercel.json: reviewed local test-only build and authored dist output; no cloud application yet.
- README.md, PROJECT_CONTEXT.md, RUNBOOK.md, SKILLS.md, CHANGELOG.md, docs/decisions.md and docs/qa-checklist.md: current state, launch/release instructions and explicit QA limits.
- New docs/PREMIUM-ANIMATION-SPEC.md and this report: Stage 3 architecture and Stage 2 evidence. docs/evidence/stage2-landscape.png records the local viewport result.

Final local verification: npm test PASS (12 scripts), node --check on changed runtime modules PASS, git diff --check PASS. Git diff confirms progression.js, collection.js, content.js, render3d.js, environment.js, package-lock.json and vite.config.mjs unchanged. Local static-server smoke attempt timed out and was stopped; raw-static developer activation has a passing Node guard check, but the final candidate still needs preview browser validation. Browser QA did not establish enemy-target tap correctness, real touch dispatch or final-wave device behavior.

## Confirmed defect and correction

Seeded LCG `s=(1664525*s+1013904223)>>>0`, seed 7, Game level 2 returned damage-gunner / house / recruit-electric, omitting defense. makeOptions preserved a tactical offer in slot 2, then overwrote it with the recruitment guarantee. Recruitment now replaces slot 1 when slot 2 is the protected tactical offer; otherwise the previous slot-2 replacement is retained.

`verify-offers.mjs` failed before correction. It covers seed 7, 1,000 seeds at levels 2/3, late gadget plus recruit guarantees, unique IDs, full-team and exhausted defense eligibility. Existing nine suites plus three new suites pass locally. GitHub workflow now calls npm test instead of only the first three scripts; no remote workflow run is claimed.

## Development diagnostics

Run npm run dev and visit http://127.0.0.1:4173/?perf=1. Activation requires Vite's DEV flag and explicit query opt-in. Raw static hosting and production builds do not activate it. No telemetry, persistent writes or forced enemies/FX. Collapse the panel for visual review; only its summary intercepts taps.

Displays RAF FPS, mean/p95/max frame intervals, renderer calls/triangles, geometry/texture counts and optional Chromium heap usage, with actual speed/state/wave/enemies/effects. Counters are last fresh rendered-frame values, not summed over a second or GPU timings. Frame samples cap at 600; history caps at 120 one-second reports. State/speed/wave/viewport changes reset the frame window; hidden time is excluded. Paused reports describe rendering, not active combat.

Developer console: `window.emberholdDiagnostics.snapshot()` or `.history()` returns cloned data; `.reset()` clears diagnostic samples only. Copy results manually; there is no upload/download automation. Compare the same scene/device/viewport at ×1 and ×3 with normal and particle-heavy combat. Keep a record of sample counts, browser, GPU/device, viewport, thermal state and diagnostic overhead.

Measured local snapshots before the final viewport-reset refinement, from the visible in-app browser:

| Context | RAF FPS | Mean / p95 / max ms | Calls / triangles | Geometry / textures | Heap |
|---|---:|---|---|---|---|
| Playing ×3, wave 3, 5 enemies, 10 FX | 134.9 | 7.4 / 13.8 / 13.8 | 296 / 69,718 | 214 / 8 | 38.0 MiB |
| Playing ×1, wave 5, 1 enemy, 0 FX; 390×844 viewport | 144.0 | 6.9 / 7.1 / 7.5 | 169 / 51,496 | 211 / 9 | 29.3 MiB |

These are short, unequal workloads, not comparative benchmarks or phone performance. Hardware identity was not established. Desktop Chrome also showed ~1,006ms RAF intervals in this automation session; cause was not established and those readings are not a device baseline. Sustained late-wave, thermal, physical-device and heavy-particle benchmarks remain NOT VERIFIED.

## Mobile interaction model

Tap a starter/card to choose; tap an enemy to focus and again to clear; tap a hero/name to inspect and freeze; tap charged leader/spell slots to cast; tap pause then resume; tap speed to cycle; tap camera to change view. Horizontal drag or rotate buttons operate the hero viewer while vertical page scrolling remains allowed. No hover is required for these actions. Enemy picking is already projected screen-space distance, not mouse-only raycasting.

Stage 2 adds at least 44px dimensions to small primary controls, disables pan/zoom only over the battlefield, retains scrolling in menus, contains modal overscroll and accounts for safe-area insets. Short landscape uses the battlefield on the left and a 230px control column on the right; portrait retains the existing stacked layout. These are CSS viewport adaptations, not native packaging or fullscreen guarantees. OS-edge navigation is controlled by the browser.

Observed CSS viewports: 390×844 portrait had a ~566px battlefield and controls inside the viewport; 844×390 landscape had a ~614×390 battlefield and 230px side deck. Primary sampled buttons measured at least 44×44 CSS px. Actual touch dispatch, Safari toolbar/safe-area changes, Android suspension, audio interruptions and physical-device legibility remain NOT VERIFIED. Existing health-bar/hero-label visual overlap is still a Stage 3 composition issue.

## Verified GitHub/Vercel evidence

- GitHub connector confirms public repository supermansg/emberhold, repository ID 1361795803, default branch main. Local origin matches. No push performed.
- Vercel team team_qgfmM9DIp4b18J6MNq44StTi; project emberhold, ID prj_MxLtZbCGcGvJEclnIdWMbwR7tG1M, preset vite, Node 24.x.
- Production deployment dpl_FoxG6714A2BrDZK2P3MRDrpyegts is READY, target production, source import; metadata/build logs identify main at 88ba79af3a59253090565b950e9cdcf3b19d6370.
- Production alias https://emberhold-five.vercel.app/ returns HTTP 200. app.js, style.css, vendor/three.module.js and assets/heroes.webp also return 200 with appropriate JavaScript/CSS/WebP MIME types through the Vercel connector. This is an asset smoke check, not a complete production playthrough.
- Newer READY preview dpl_8HwQ7sxgteLAte4gNzTiiNyqnJEr comes from feature/m52-combat-motion-ux at c2a39a14e22b3e716a84bc8fa35e83e3585cd14b. Do not overwrite or silently merge that work.
- Baseline had no local/remote-main vercel.json. Read-only dashboard inspection subsequently confirmed Vite preset; root directory empty (repository root); build/output/install overrides disabled; default build placeholder npm run build or vite build; output placeholder dist; Node 24.x; ignored build step Automatic; Deployment Checks: No checks configured. Git settings confirm supermansg/emberhold connected. Historical main production is verified; current production-branch policy remains NOT VERIFIED because browser access ended before environment inspection.

## Deployment hazard and safest correction plan

Production build logs show Vite producing `dist/dist/index.html` and hashed chunks. The live alias serves the original authored HTML referencing app.js/style.css. This indicates redundant nested output and unresolved output-setting alignment; do not call the pipeline release-ready merely because READY is reported. Never run the default Vite build locally into dist.

Based on the verified dashboard defaults and live authored entry, Stage 2 drafts local `vercel.json` with buildCommand `npm test` and outputDirectory `dist`. It preserves the existing project/domain and makes all checks a synchronous deployment prerequisite while avoiding Vite's nested source output. There are no route, domain, preset, account or secret changes. `verify-release.mjs` validates this contract and required source assets. This local configuration is NOT applied to Vercel until a future approved release workflow; no upload/push is performed. A generated bundle pipeline outside dist remains a separate future option requiring runtime asset rewriting/copying and preview verification.

GitHub CI passing alone does not gate the currently configured Vercel Git deployment: no Deployment Checks are configured. The drafted build command closes that test gate on its first deployment, but still needs preview verification and current production-branch confirmation. Review tested diffs and the newer feature preview; create a feature branch/preview only with the chosen release workflow, smoke-test assets and gameplay, then obtain explicit production approval for the exact commit. Do not push main during preparation. Preserve the existing origin/domain because localStorage is origin-specific; domain changes do not migrate player progress automatically.

Release status: REQUIRING ADDITIONAL VERIFICATION. Validate the drafted config on a preview, confirm current production-branch policy and complete real Android/iPhone QA before production approval. Stage 3 is specification only. Final landscape screenshot: evidence/stage2-landscape.png.
