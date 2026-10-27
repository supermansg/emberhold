# Checkpoint A account-first implementation plan

> Execute sequentially with tests; independent read-only review requested. Production remains gated by exact owner approval.

**Goal:** Email OTP sign-in once, automatic account restore and safe acknowledged cloud saves.
**Architecture:** Retain version-1 snapshots, owner namespaces, backups, CAS and pending write IDs. Separate persistence adapter, reconciliation decisions and bounded save scheduling from DOM/account actions. No gameplay/economy rewrite.
**Tech stack:** Existing JavaScript modules, official pinned Supabase SDK, Three.js/Vite and Node/Playwright.
**Spec:** User-provided attachment `188ecd02-12b0-489e-bc56-4f8b5dbd1f09/pasted-text-1.txt`.

## Design decisions

- Routine retained-session restore automatically loads cloud. A clean cache never overwrites cloud. Dirty cache on the same revision may upload automatically. Identical contents can acknowledge safely. Unknown/newer divergent revisions require one concise decision; both copies retained.
- New accounts may claim guest progress only when cloud is absent; meaningful guest progress gets an explicit claim decision. Existing cloud wins routine entry while guest remains separately recoverable in account settings. Never sum rewards.
- PersistSession stays true with an explicit SDK storage adapter: localStorage when remembered, sessionStorage otherwise. Migrate old official SDK key only when remembered; remove duplicate token copies after a successful destination write. Do not log tokens. SessionStorage survives reload but browser restore/duplicate-tab behavior is browser-dependent.
- Local snapshots are immediate; dirty/pending metadata survives reload. Debounce after safe non-playing transitions; persist request before network, acknowledge only after server response, bounded backoff and reconnect recovery. Conflict is not a retryable failure. Scope/identity guard every async apply/ack.
- Auth loading must not replace an active run. Defer account switching until settlement; external logout stops account writes and restores guest only at a safe transition.
- OTP UI has email, one remember checkbox, then code/verify/resend; no routine cloud terminology. Recovery and avatar controls are in profile settings. Retained sessions hide login. Server email template must actually include Token before real OTP acceptance can pass.

## Tasks and evidence

- [x] Write failing behavioral tests for persistence migration/session boundaries, reconciliation and bounded queue (including edits during in-flight writes, unknown remote revisions and quota failures).
- [x] Implement focused account-session.js and account-sync.js; keep unknown/corrupt data fail-closed.
- [x] Integrate automatic restore/OTP/autosave into account-ui.js; preserve avatar and confirmation semantics, add structured concise recovery and advanced settings.
- [x] Update welcome/profile CSS and integration; verify narrow/portrait/landscape/desktop hit targets and retained-session entry.
- [ ] Test controller with explicit fake network/Auth, then full regression. Configure/test real OTP against dedicated project without touching other users.
- [ ] Independent review, fix findings, create exact Preview and verify payload/runtime, real OTP/persistence/load/save/conflict/avatar and production identity.
- [ ] Present exact candidate for owner approval. Only after approval release existing canonical alias; Checkpoint B waits for A approval/release.

## Review focus

Storage denial must not discard an existing session or progress. A lost response must retry the same request ID. Out-of-order Auth callbacks must never apply to another account. A gameplay run cannot change scope before settlement. Remote schema changes fail closed. Tests distinguish fake transport, actual cloud, emulation and physical-device evidence.
