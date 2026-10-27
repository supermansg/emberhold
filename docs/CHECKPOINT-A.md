# Checkpoint A — automatic accounts, 2026-10-26

Status: local candidate on `codex/stage35-account-first`; not released. Full Stage 3.5/4 objective remains active. Checkpoint B has NOT started and waits for A review, owner approval and release.

## Implementation

- `dist/account-session.js`: actual SDK storage adapter routes remembered tokens to localStorage and session-only tokens to sessionStorage. Migrates the original SDK key. Refreshed tokens follow the current device preference, including another tab opting out. Browser session restoration/duplicate-tab behavior is a browser privacy limitation. No tokens are logged.
- `dist/account-sync.js`: automatic reconciliation, idempotent pending IDs, same-revision dirty resume, divergent-save recovery and a debounce queue with three bounded retry delays (1/4/12 seconds). No currency/reward summation.
- `dist/account-ui.js`: email/code/remember form, retained-session automatic cloud load, safe-transition autosave, subsequent edits queued after acknowledgement, offline/reconnect, explicit meaningful guest claim only for an empty account, and concise conflict decisions. Advanced restore/manual check/avatar/logout live under account settings. Identity-generation guards reject stale async results. Active runs cannot switch account.
- `dist/player-storage.js`: durable dirty intent BEFORE account mutations; raw-cache comparison prevents stale-tab writes before storage events arrive. Stale tabs pause and require reload; snapshot application also respects blocking. Guest keys/save versions remain intact.
- `dist/premium-ui.js`, `index.html`, `premium-ui.css`: initial account gate, secondary guest entry, automatic retained-account entry, responsive code form and normal-flow skip control to avoid short-landscape overlap.
- `dist/app.js`: account-block callback uses existing pause/modal controls. Combat, progression, Specials, Shockwave and original assets are retained; preservation tests pass.

## Local, pending and confirmed

Local successful game/record writes are immediate and owner-scoped; dirty intent is committed first. Quota failure prevents an unmarked mutation. Pending requests persist their ID, base revision and immutable snapshot before transmission. Both settlement events debounce into the complete final save and run history. UI says local/pending until a server acknowledgement updates revision and clears the request; newer edits remain dirty and send afterward.

Newer divergent cloud revisions never receive automatic overwrite. Recovery re-reads cloud, compares the version shown at the decision, retains backups and uses CAS. Guest progress remains separate; existing cloud wins ordinary return, while claiming guest progress into an empty account is explicit. No merging of balances.

Offline cached identity enables local cache use only, never server-write authorization. Reconnect revalidates the account and reconciles before sending. No generic last-user cache chooses another account.

## Verification

| Check | Result | Evidence boundary |
| --- | --- | --- |
| npm test | PASS 27 suites | Includes 14 new foundation cases and previous 19 data/CAS cases; no live Auth claim |
| New controller browser | PASS | Fake Auth/PostgREST: auto load/save, dirty restore, in-flight edits, offline/reconnect, active-run deferral, cloud-read failure, stale-tab and account-switch races |
| Original controller regression | PASS | Delayed claim blocked during run, guest retention, external logout, raster/SVG handling; fake transport |
| Actual vendored SDK storage matrix | PASS | Real browser storage, reload/new tab/token refresh/logout; intercepted Auth endpoint |
| Email/code layout | PASS four sizes | 320x740, 390x844, 844x390, 1365x900; intercepted mail, screenshots inspected, control hit tests pass after spacing fix |
| Existing four-viewport UI | PASS | Guest/profile/heroes/share/entry/pause/retire, no page errors; final spacing/focus rerun passed |
| Full M5.2 combat browser | PASS | Four defenders, picking, pause/speeds, Specials, meteor/blizzard, loot, waves, Shockwave/boss resistance, quality/reduced motion/audio controls |
| Live OTP/current-candidate account | PASS on local candidate, owner address only | Saved Resend SMTP; real email code verified, automatic cloud load, reload/new-tab restore and reversible autosave verified against owner-scoped server data (revision 6 to 8, identical final save/record). Avatar upload/reload/reset passed. Signout dialog transport interrupted, cancellation/relogin still pending. |
| Exact new Preview | PENDING | Existing cb51ad6 Preview proves Stage 3 only |
| Physical devices/creative acceptance | UNVERIFIED | No hardware FPS/audio/thermal or true two-device result claimed |
| Production release | NOT AUTHORIZED | Exact candidate owner approval required; main/canonical retain previous release |

Raw evidence: ignored `qa-artifacts/checkpoint-a-{ui,login,combat}`. Captures use fixture email/code only. No player data or credentials committed. [Delivery choices/approvals](CHECKPOINT-A-EMAIL-OPTIONS.md).

## Remaining acceptance

Resend Free SMTP is saved. Sign-in and signup templates retain Token and ConfirmationURL; both persisted after reload. General public delivery is unavailable through the provider's domain without a verified sender domain; no purchase is planned. Finish live session-only/signout/relogin and exact Preview acceptance. New-user delivery remains unverified because only the authorized existing owner mailbox is available. Complete final review and exact Preview/payload verification, obtain owner release acceptance, release only the existing canonical alias and verify it. Do not substitute mocks for live acceptance or begin Checkpoint B before its gate.

Independent review found a revoked-session/offline-hint edge case. A controller regression reproduced it before the fix; explicit 401/403 now takes precedence over navigator connectivity hints. Controller regression passed after the correction. The session adapter also preserves a private tab's choice when another tab opts in and cannot overwrite an unrelated remembered account.
