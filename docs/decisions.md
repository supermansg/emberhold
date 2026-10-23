# Decisions

## 2026-10-23 — Stage 2.6 release and product boundaries
Release the accepted exact Stage 2.5 candidate via non-forced main fast-forward after regression/Preview and same-origin backward save checks. Use the existing Vercel project/domain and retained old deployment for rollback. Adopt the permanent operational acceptance/release policy in DEVELOPMENT.md; no new branch protection or cloud auth is configured. Keep product/profile/share specifications in product-backlog.md, mobile contract in qa-checklist.md and asset details in the existing premium slice spec. Unknown profile fields cannot be added to the current save without migration because migrateSave drops them. No full Stage 3 UI/art implementation is authorized.

## 2026-10-23 — Integrate onto M5.2
Use c2a39a1 as the integration parent, preserve Stage 2 via stash/hash-verified snapshot, and manually port only applicable changes. Preserve M5.2 XP/combat/presentation and permit one narrowly reviewed offer fix. Normalize CRLF in authority tests without ignoring arbitrary edits. Keep existing performance-quality control; diagnostics only observe it. Test-gate static authored dist on an isolated Vercel Preview. No main/draft-PR merge, production promotion or Stage 3 production.

## 2026-09-10 — Preserve source layout
Keep dist as authored source. Import version 10 without scaffolding or compiling.
Retain the original repository under .sites-source-import because the root already has a staged index with no commits; do not replace that index.
Keep local operational documentation separate from game code.
