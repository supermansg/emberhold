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

Confirm Vercel target Preview and exact integration SHA, build test log, authored root entry and JS/CSS/WebP/GLB/addon MIME/status. Smoke-test real entry with no response interception: hero selection, gameplay, pause/resume, mobile layouts, console and asset failures. Production deployment identity must remain the initial one. Any protected access/share-link limit must be reported explicitly.

Physical Android Chrome/iPhone Safari, thermal behavior, hardware GPU FPS and listening/creative acceptance: NOT VERIFIED. Emulated touch does not establish physical-device acceptance. Stage 3 remains awaiting explicit approval.
