# Current operations — Stage 3 development

## Checkpoint A override (2026-10-26)

Branch `codex/stage35-account-first`; `npm test` runs 27 suites. Same local launch URLs/launcher and authored-dist rule. Automatic account load/save replaces routine manual choice/sync. SDK key `emberhold-auth-v2` routes via account-session.js to localStorage (remembered) or sessionStorage (tab session); legacy SDK key migrates once. Device preference is not a security boundary against someone with access to the same browser profile. Never log session values.

Save and record writes persist dirty intent first. A pending request keeps its ID/base revision/snapshot until acknowledgement. Queue debounce 700ms, retry delays 1/4/12s, offline cache stays local and reconnect revalidates before writing. A stale tab fails closed and requires reload. Guest/account namespaces and version-1 saves remain compatible; no additive currency merge. See CHECKPOINT-A.md.

Browser checks (installed Playwright/Chrome, local QA server): scripts/verify-account-first-browser.cjs (fake Auth/transport), verify-account-session-sdk.cjs (real SDK/storage, fake Auth endpoint), verify-account-first-layout.cjs (intercepted mail), original Stage 3 UI/account/combat scripts. Real automated emails require explicit QA_AUTH_EMAIL opt-in. Owner-configured Resend Free SMTP and real owner OTP passed through the local candidate UI. Use the code form; no localhost redirect expansion is required. No domain or paid service is authorized. Details: CHECKPOINT-A-EMAIL-OPTIONS.md. Existing Stage 3 Preview is not this candidate; production approval is still required.

`npm test` first runs scripts/ensure-test-history.mjs. Full checkouts need no network; shallow checkouts fetch missing history from their existing origin so historical preservation assertions can run. Vercel may remove origin; in that case the script uses this repository's canonical public GitHub read URL without credentials or remote-setting changes. Fetch errors fail the build. Vercel continues running all suites and directly serves authored dist; never skip historical checks to deploy.

Live account matrix: scripts/verify-account-live.cjs requires explicit QA_BASE_URL and authorized QA_AUTH_EMAIL, installed Playwright/Chrome and an interactive stdin. It sends real email twice and waits for each code on stdin. Codes/session state are not written to files. It checks both session modes, reload/new tab, reversible name autosave, logout cancellation/confirmation and guest isolation. The provider cooldown is 61 seconds. Never run unattended against arbitrary mailboxes or treat this as physical-device QA.

Run `npm run dev` at http://localhost:4173. For stable automated screenshots use `npm run qa:serve` at http://127.0.0.1:4174; this serves authored dist without live reload. `npm test` runs 26 suites. Dedicated branch: codex/stage3-premium-world. Production baseline remains ee0e835; no Stage 3 production permission exists.

Browser scripts require PLAYWRIGHT_MODULE and CHROMIUM_PATH pointing at existing installations. `QA_BASE_URL=http://127.0.0.1:4174/ node scripts/verify-stage3-ui.cjs`; `node scripts/verify-stage3-account-ui.cjs` uses that static origin with explicitly fake service responses. `scripts/verify-m52-browser.cjs` accepts M2_BASE_URL and M2_ARTIFACTS. Full instructions/evidence: docs/STAGE3.md. Run browser suites sequentially for stable software-renderer measurements.

Supabase project agwdfotqgurlknuhnnup is dedicated to EMBERHOLD. Browser configuration in account-ui.js contains only a public publishable key; never add service-role credentials. SDK 2.118.0 UMD and license are vendored from the pinned npm dependency. If updating the SDK, copy both again and verify package/audit/browser behavior. Site URL is canonical; the sole redirect URL is the exact cb51ad6 Preview in docs/STAGE3.md, explicitly owner-approved. No local/wildcard additions were saved. No unrelated projects or billing were changed.

Preview is Vercel-protected. Owner approved a 23-hour link for deployment dpl_EAB6N2yrhpEV5pE5XD2ZtBQYXBmt only. Supply that link via QA_BASE_URL to scripts/verify-stage3-preview.cjs; it establishes a cookie then verifies 18 payload hashes. Never commit its token or disable project protection. QA_BASE_URL also selects the four-viewport UI suite. Live save/reload: QA_PRODUCTION_URL=the-review-link QA_DEPLOYED=1 node scripts/verify-stage26-save.cjs. Canonical game sharing never uses this link. Existing CLI credentials were invalid; use authenticated Vercel MCP rather than changing credentials implicitly.

`scripts/verify-stage3-auth.cjs` sends a real email ONLY with explicit QA_AUTH_EMAIL opt-in; never run it in CI. It records transport acceptance, not login success. Complete owner-driven login, session reload, import/sync/conflict/logout and avatar acceptance separately. Do not store OTPs, signed URLs, auth state or email screenshots in Git.

Supabase migration ledger: 20261023183750 foundation; 20261025180138 stage3_snapshot_projection. SQL reference: docs/stage3-player-projection.sql. Live rollback-only policy fixture: docs/stage3-rls-qa.sql. Projection runs with invoker permissions and owner RLS; no elevated function is used. The versioned progress snapshot is authoritative; relational history/unlocks/achievements are append-only event records. Cloud progress is casual self-owned data, unsuitable for trusted competitive rewards.

Guest progression key remains emberhold-v1. Profile is a separate emberhold-profile-v1 sidecar. Account copies use emberhold-account-UUID-{save,record}-v1. Backups and sync metadata are owner-scoped. A user explicitly chooses cloud/local/guest import; no currency summation. Sync is explicit or retried on network reconnection. A conflict requires another explicit choice. Local storage is origin-specific: Preview cannot automatically access production-origin guest data.

---
# Historical operations — Stage 2.6

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
