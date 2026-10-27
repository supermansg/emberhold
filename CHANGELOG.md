# Changelog

## 2026-10-27 — Free-only continuation
- Exact runtime d136ca5 Preview READY; all 27 build-time suites, 20 deployed hashes, four-view UI and combat passed. Final isolated live OTP/account matrix passed exit 0, including logout cancellation/confirmation, relogin and both persistence modes. Restored final save/record exactly to baseline, sync revision 6 to 22. Cleaned both email templates and verified real sign-in mail has no old English header. Owner approved one 23-hour share link for this deployment; token excluded from Git. Main/production remain ee0e835. New-user/public-delivery, physical devices/two-device and owner acceptance remain; no Checkpoint B.
- First Checkpoint A Preview failed because Vercel's shallow clone omitted historical commit 990b3f9 required by existing preservation tests. Added a pretest history check/fetch; no assertions skipped and no authored output build.
- Vercel also strips the origin remote in this build. The history loader now falls back to the canonical public repository read URL, without credentials or changes to remote configuration.
- Owner explicitly excludes paid services and domain purchase. Resend Free SMTP is now saved; both OTP templates retain code and link compatibility. Real owner email OTP, automatic cloud loading, reload/new-tab restore, reversible autosave and private avatar upload/reload/reset passed locally. Final save/record match the pre-test snapshot, revision 6 to 8. No general-public delivery claim; signout dialog transport interrupted, further acceptance pending.
- Added a revoked-session regression and fixed offline fallback so explicit server denial cannot restore an authenticated account from cache. Network-only failures retain the safe offline path. No player cloud data or production changed.
- Independent review exposed the offline navigator plus 401 edge case; reproduced failing then fixed and passed. Remember-device isolation now also prevents another tab's opt-in from promoting a private session or replacing an unrelated remembered account. All 27 suites and real-SDK storage fixtures passed.

## 2026-10-26 — Checkpoint A automatic accounts, development only
- Added real SDK remembered/tab-session routing and legacy migration; automatic loading, durable autosave queue and concise conflict recovery. Recovery/avatar/logout moved into settings; email/code form replaces routine cloud choices.
- Protected dirty intent before data mutations, stale local-tab writes, late account responses and active-run boundaries. Preserved gameplay/economy/assets/guest data. Added 14 foundation cases and isolated controller/actual-SDK storage/layout tests; npm test now runs 27 suites.
- Fixed short-landscape OTP/skip overlap. Local combat/controller/responsive checks pass within documented fixture limits; live OTP and exact new Preview remain pending.
- Owner approved Resend Free only and has no domain. Default Supabase templates are locked without SMTP/Pro/Hook. Prepared sourced costs/setup and owner login handoff; no subscription, DNS, SMTP or production change. Checkpoint B not started.

## 2026-10-25 — Stage 3 development candidate, production unchanged
- Completed real authenticated Preview QA: cloud load/reload, repeat sync, stale-write rejection after controlled remote revision update, SVG rejection, private raster upload/reload/reset, logout guest isolation and fresh-email relogin. Compared final save/record to pre-QA backup: unchanged; revision 5. Public avatar URL returned 404. One unreferenced private 4362-byte QA image retained. Re-ran all 26 suites successfully. No runtime/production change; physical-device/creative acceptance remains pending.
- Verified first real mobile cloud write against the database: revision 1/save version 1, one profile/stat row, four starter unlocks and matching projected statistics. Empty run history remains truthful. Authenticated reload/conflict/logout/avatar checks remain pending; no runtime or production change.
- Pushed runtime cb51ad6 and created draft PR #7. Exact Vercel Preview READY; verified 18 deployed hashes, four viewports and live save/reload. Owner explicitly approved a 23-hour review link and one exact Supabase redirect URL; configured both without local/wildcard allowlist additions. Fresh Preview login email sent; real session/cloud/avatar acceptance remains pending.
- Added versioned authored Brass GLB with actual skin/skeleton/clips, simulation-timed mixer, independent skeletons and animated sockets. Original GLB remains intact; no Blender installation was found.
- Added forest ruins/moss/gateway/material depth, interruptible first-boss windup/recovery and joint-surface batching. Same fixed crowd comparison measured ~49.6% fewer draw calls in software Chrome, not mobile FPS.
- Added premium menus/cards/profile, real run/achievement tracking, responsive entry/skip/repeat/reduced motion and canonical native/clipboard/manual sharing. Fixed landscape menu controls obscured by navigation.
- Added dedicated Supabase browser SDK, email auth, owner-local save namespaces, explicit guest import/cloud choice, backups, durable request retries/revision conflicts and private raster avatar upload. Added security-invoker snapshot projection migration; verified rolled-back owner isolation and projection. Real login/cloud/avatar end-to-end remains pending.
- Patched Vite/source-map dependency advisories; fresh npm audit returned zero vulnerabilities. Added focused Node/browser/data-boundary tests and exact approved authority-patch verification.
- Corrected Supabase Site URL from localhost:3000 to canonical game URL. Automatic approval review blocked expanding the redirect allowlist; no local redirect additions were saved. Exact Preview approval is required before real magic-link acceptance.

## 2026-10-23 — Stage 2.6 production release and premium roadmap
- Revalidated exact accepted d8556d6, M5/M5.1/M5.2 ancestry, 23 suites, Preview and same-origin old/new/old progression. Fast-forwarded main without force; existing production domain/project now serves the accepted game.
- Verified production SHA/alias, assets and actual gameplay at portrait/landscape/narrow sizes; synthetic save reload and non-combat navigation/overflow checks pass. Documented retained rollback deployment and unverified hardware limits.
- Established permanent owner-acceptance/Preview/release/post-deploy policy; expanded mobile contract, premium UI component/motion blueprint, truthful Player Profile inventory/cloud migration design, canonical share feature specification and prioritized roadmap.
- Added reusable isolated save/mobile QA scripts and sanitized evidence. No gameplay/assets/dependencies/authentication changed; no full Stage 3 implementation.

## 2026-10-23 — Stage 2.5 Preview acceptance
- Pushed integration runtime 8d7029c on codex/stage25-integration; Vercel Preview READY with exact SHA and all 23 build-time suites passing.
- Deployed real-entry touch smoke passed at three viewport sizes with correct static assets, no page errors or failed requests. Preserved evidence and updated current launch/status docs.
- Removed duplicated current-status paragraphs in README. Physical mobile and creative approval remain unverified; Stage 3 awaits approval.

## 2026-10-23 — Stage 2.5 M5.2 integration candidate
- Based a dedicated branch on verified M5.2 c2a39a1; preserved local main-based Stage 2 in a hash-verified external snapshot and Git stash.
- Preserved M5.2 authored Brass, combat motion, quality/VFX pools, audio, Specials, Shockwave and upgrade UI; retained its run-XP progression.
- Reproduced seed-7 missing-defense failure and integrated only the protected offer-slot correction; deterministic early/late offer regressions added.
- Added opt-in development raw-frame/counter diagnostics alongside existing quality statistics; added missing short-landscape/touch/safe-area rules without replacing four power controls.
- Combined all 23 Node suites; authority tests normalize only CRLF and allow exactly the reviewed offer-clause change. Preserve art bytes and all other protected runtime sources.
- CI fetches complete history and runs npm test. Preview config runs tests then serves authored dist without generating nested output. No dependencies or cloud settings changed.
- Added integration/QA records and an M5.2-aware Stage 3 proposal. No Stage 3 asset generation, main merge or production promotion.

## 2026-09-10 — Local import of Sites version 10
- Verified that version 10 is the newest saved version and its commit matches the supplied SHA and remote main.
- Imported all 48 tracked source files, including assets, tests and documentation; SHA-256 comparison passed for every file before local documentation additions.
- Preserved the existing root Git index and retained a pristine source checkout with history in .sites-source-import.
- All nine supplied test scripts passed. No build or publication performed.
- Added local project guidance and launch instructions.
- Added a custom ember icon and Windows launch shortcut. Locked dependencies installed; Vite starts successfully.
- npm reported one high-severity dependency advisory; versions were preserved for source fidelity.
