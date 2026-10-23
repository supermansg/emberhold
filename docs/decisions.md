# Decisions

## 2026-10-23 — Integrate onto M5.2
Use c2a39a1 as the integration parent, preserve Stage 2 via stash/hash-verified snapshot, and manually port only applicable changes. Preserve M5.2 XP/combat/presentation and permit one narrowly reviewed offer fix. Normalize CRLF in authority tests without ignoring arbitrary edits. Keep existing performance-quality control; diagnostics only observe it. Test-gate static authored dist on an isolated Vercel Preview. No main/draft-PR merge, production promotion or Stage 3 production.

## 2026-09-10 — Preserve source layout
Keep dist as authored source. Import version 10 without scaffolding or compiling.
Retain the original repository under .sites-source-import because the root already has a staged index with no commits; do not replace that index.
Keep local operational documentation separate from game code.
