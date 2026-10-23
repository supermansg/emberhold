# Stage 2.5 QA ledger

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
