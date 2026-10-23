# Stage 2.5 QA and Stage 2.6 production release ledger

## Stage 2.6 release — 2026-10-23

RELEASED: Stage 2.5 runtime candidate d8556d6fea02d7f42de2fcddad44d6094cf4f293 was revalidated and fast-forwarded from 88ba79a into main without force. Owner release authorization is the Stage 2.6 request. M5 63b8516, M5.1 cce0fee and M5.2 c2a39a1 are ancestors; PR #5/#6 remain historical drafts, not blindly merged. No feature work discarded.

Production: https://emberhold-five.vercel.app/ ; deployment dpl_DaBzBPfprDLzgomvXMzNmBfAJW9j, target production, READY, exact candidate SHA on main, canonical alias verified. Existing project prj_MxLtZbCGcGvJEclnIdWMbwR7tG1M / team_qgfmM9DIp4b18J6MNq44StTi retained. Domain verified with no redirect. Node 24; effective production logs run npm test/all 23 suites; vercel.json outputs authored dist. No project setting or dependency changes.

PASS: fresh local 23-suite run; exact candidate Preview at three viewports; same-origin old live -> candidate -> old live synthetic save persisted by real collection equip actions; production public entry, assets, exact app.js, rendered gameplay, touch Shockwave, speeds, pause/resume, retirement/restart and all three viewports; real new-production save/reload; home/heroes/detail/collection/fort document overflow and nav bounds with reduced motion. Zero page errors/failed asset responses in smoke. Production is not claimed successful solely from READY. See ../evidence/stage26/release.json and adjacent evidence reports/screenshots.

Save safety: progression.js, collection.js and content.js are identical to old production (EOL-only normalization); emberhold-v1 key and origin retained. Synthetic coins 12345, careerXp 4567, keys 17 and all hero/card fields survived old/new/old and deployed reload. This is representative compatibility, not access to real player saves. No save reset or schema migration. Active-run recovery/cloud sync remain absent. Bad JSON/storage-denial and concurrent stale tabs retain existing limitations; no new guarantee for unsupported or malformed data.

Rollback: retained old production dpl_FoxG6714A2BrDZK2P3MRDrpyegts at 88ba79a. Procedure and auto-assignment caveat in ../DEVELOPMENT.md. Backward save persistence was tested; live rollback was deliberately not performed on the healthy site.

Stage 2.6 follow-up changes are docs and QA harnesses only, with dist unchanged from the accepted candidate. Preview/production verification is repeated for the follow-up SHA; the runtime release version above remains valid. Physical phones, hardware FPS, prolonged thermal behavior, complete accessibility/contrast and creative listening approval remain NOT VERIFIED. No Stage 3 production assets/UI redesign have begun.

---
## Historical Stage 2.5 candidate verification

Local runtime: Windows / Node 24.14.0. Separate browser contexts/fixture storage; real user saves are not reset. Production is outside test mutation scope.

## Executed verification

- PASS: 23 Node suites, including existing combat/boss/save/reward/GLB/mixer lifecycle/VFX/audio/Special/Shockwave tests plus offers, diagnostics, static release contract and integration preservation.
- FAIL before fix: seed 7 at level 2 drops guaranteed defense. PASS after minimal slot protection, 1,000 seeded early/late sets, uniqueness/eligibility.
- FAIL baseline portability: M5 authority byte comparisons reject Windows CRLF; corrected with EOL-only normalization plus one explicit engine exception and tests preventing broader masking.
- Browser first attempt: sandbox network denied; rerun with local-network permission. Extended run reached 36-enemy/all-quality stress and all four Specials, then screenshot timed out at upgrade capture. This was incomplete, not a passing full run. Artifacts retained under ignored qa-artifacts/stage25-first-run.
- PASS browser rerun: explicit DPR1, software Chromium, fresh touch context and 90s action timeout. Complete M5.2 harness includes real GLB activation, emulated touchscreen hero/enemy picking, four heroes, bosses, Specials/spells, native Shockwave/recharge/resistance, death/loot, audio gains/visibility, pause/speeds/quality, narrow/short portrait, restart/settlement, XP overflow, queued choices and hidden-tab selection. No page errors. Results: evidence/local-browser.json.
- PASS separate real-entry smoke (no app-response interception): 390×844, 844×390 and 320×740; control dimensions/bounds, touch starter/ability, speed cycles, pause/resume, retirement/restart and local asset requests. Vite serves CSS imports as JavaScript; static Preview must separately return text/css for the stylesheet. Results: evidence/local-smoke.json; portrait/landscape images beside it.
- PASS dense actual-engine fixture: four heroes, 36 enemies, rain, ×3, 18 samples across Low/Standard/High; calls 1,069–1,106, triangles 290,480–294,594, geometries stable at 398, textures stable at 20, peak audio voices 20 (cap 28). Quality particle caps respected. Software timings/quality EMA are not phone FPS. Results: evidence/local-stress.json. This is a controlled late-wave-style stress workload, not a natural end-to-end retention/balance trial.

## Preview acceptance gate

PASS: Preview deployment dpl_DhSDA6HmD4zRP5UAvnW4cCzmLWua is READY, target null (Preview), branch codex/stage25-integration, exact runtime commit 8d7029c30eb86a6486a2ab22088ee274bde139b5. URL: https://emberhold-7p0utfuoc-dudi1710-gmailcoms-projects.vercel.app . Vercel build logs show all 23 suites passing and successful static output deployment.

PASS: deployed real-entry smoke, no interception: authored app.js matches local source, JS/CSS/WebP/GLB/addons all HTTP 200 with correct MIME/payload; GLB 567,340 bytes. Hero selection, rendered gameplay, Shockwave, speeds, pause/resume, retirement/restart and 390x844 / 844x390 / 320x740 layouts pass, errors=[] and failed=[]. See evidence/preview-smoke.json and preview-landscape.png.

Preview authentication remains enabled. A temporary share link was created for desktop/mobile review, expiring 2026-10-24; it is supplied privately in the delivery response rather than committed. Production identity is checked separately at handoff. Documentation-only commits after the runtime commit do not alter game source.

Physical Android Chrome/iPhone Safari, thermal behavior, hardware GPU FPS and listening/creative acceptance: NOT VERIFIED. Emulated touch does not establish physical-device acceptance. Stage 3 remains awaiting explicit approval.
