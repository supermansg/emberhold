# Current operations — Stage 2.6

Public game: https://emberhold-five.vercel.app/ . Current release/rollback evidence: docs/stage25/QA.md. Mandatory release process and exact rollback commands: docs/DEVELOPMENT.md. Use isolated codex/* branches; every accepted milestone needs Preview/tests, explicit owner acceptance and verified production release. Stage 2.6 authorizes this release; future milestones need separate acceptance.

Local launch: npm run dev -> http://localhost:4173. npm test runs 23 suites. Do not build/clean authored dist. Existing browser harness environment and old/new save QA commands are documented in DEVELOPMENT.md. QA_DEPLOYED=1 with scripts/verify-stage26-save.cjs verifies live save reload without interception. scripts/verify-stage26-mobile.cjs audits non-combat nav/overflow; it is not full accessibility or physical-device approval. Keep generated artifacts under ignored qa-artifacts, copy sanitized evidence only into docs/evidence.

---
## Historical Stage 2.5 operation notes (release restrictions superseded by Stage 2.6 request)

# Local operation

Use Node 24. Install dependencies with `npm ci`; start with `npm run dev`.
Open http://localhost:4173. Run `npm test` for all 23 integration scripts. Git history is required for authority tests; CI uses fetch-depth 0.
Never run a build that deletes or overwrites dist: it contains authored source.
No environment variables are needed for the local static game.
The root Git index predates this import and was left intact. Do not reset it blindly.

## Stage 2.5 integration / Preview

Work on codex/stage25-integration, based on M5.2 c2a39a1, never main. Earlier Stage 2 remains in stash `Preserve local Stage 2 before Stage 2.5 integration` and a verified external snapshot; do not pop it over M5.2 wholesale. See docs/stage25/INTEGRATION.md.

Development diagnostics: append ?perf=1 to the Vite URL. It measures raw RAF intervals plus renderer/heap/quality/audio counters, writes no saves/telemetry and is disabled on raw static Preview. Hidden intervals are excluded; speed/state/wave/viewport/quality changes reset the sample window. The existing quality controller is retained.

Vercel configuration runs npm test and outputs authored dist; no build writes into source. Tests need historical commits 990b3f9, ae55318, 56eab30, cce0fee and c2a39a1. A missing shallow-history object must fail the build, not silently skip preservation tests. Fetch full history before reproducing locally. Never deploy by copying an older main-based tree.

Browser regression: use installed Playwright and a compatible Chromium with scripts/verify-m52-browser.cjs. PLAYWRIGHT_MODULE and CHROMIUM_PATH accept explicit installed paths; M2_BASE_URL selects the local test server; M2_ARTIFACTS selects output (prefer qa-artifacts/stage25-local); QA_DPR selects explicit emulated DPR (default 2). It uses a fresh context, seeded fixture save and test-response interception; no debug API ships. DPR1 software-browser results are not real-phone performance.

Before an authorized branch push: npm test, syntax/diff checks, browser regression status and exact git diff. Verify Preview target, integration SHA, assets/runtime and production deployment identity separately. User authorization covers this integration branch/Preview only. Never promote or merge without explicit approval. Keep PR #6 draft and unmerged.
