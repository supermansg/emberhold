# Stage 3 candidate — 2026-10-25

Branch: `codex/stage3-premium-world`, based on production `ee0e8359c32544cae5bfa06782d51a728180bebb`. Runtime candidate: `cb51ad631692f380fee1b460e88252336061c75e`. Draft PR: https://github.com/supermansg/emberhold/pull/7 . READY Preview: https://emberhold-jlab6dy2s-dudi1710-gmailcoms-projects.vercel.app/ ; deployment `dpl_EAB6N2yrhpEV5pE5XD2ZtBQYXBmt`, target Preview, exact Git SHA verified. A 23-hour review link was explicitly approved/created; its token is not stored in Git. The clean URL requires Vercel access without that link. Production remains Stage 2.6 at https://emberhold-five.vercel.app/ . This is a review candidate, not production readiness or owner creative acceptance.

## Implemented

- Brass: original identity/source retained; 1,018,512-byte successor, 16,594 triangles, four skinned primitives, seven bones and seven actual clips. Independent skeletons, shared immutable geometry/materials, simulation-driven AnimationMixer and muzzle/hand sockets. Rigid armor weights; no sculpted texture/LOD pass. Impact/death clips are previews/future hooks because heroes have no gameplay health/death. See scripts/art/stage3/README.md.
- Forest: instanced moss/ruins/gateway, surface/material contrast and lighting depth. First boss has 1.6s windup and 2.5s recovery; actual Shockwave displacement can interrupt it. Shield/normal later-boss behavior retained. See boss-behavior.js and verify-stage3-world.mjs.
- UI: consistent brass/forest panels/cards, responsive home/profile, truthful runs/records/achievements, account settings, skippable/repeatable real-time camera entry, reduced motion and stable production URL sharing. Fixed detected landscape overlap. Name content is text-rendered, locked avatars rejected, unknown future profile versions preserved.
- Accounts: official pinned browser SDK, email link/optional OTP, validated user lookup/session restoration, errors/retry, guest access and confirmed signout. Explicit cloud/local/guest choices retain guest key and scoped account caches/backups. Pending request IDs survive retries; CAS rejects newer-device revisions. No currency summation. Offline remains locally playable; sync retries on reconnect or button.
- Dedicated Supabase foundation has six owner-RLS tables and private owner-folder avatar storage. Migration `20261025180138 stage3_snapshot_projection` atomically projects snapshots using SECURITY INVOKER. Uploaded raster avatars are cropped/encoded to 256x256 WebP; SVG and oversize sources rejected. Real authenticated upload remains unverified.
- Vite 8.3.5 and patched source-map-js; npm audit returned zero vulnerabilities on this date. Supabase 2.118.0 vendored UMD with MIT license; no secret/service-role key in client.

## Verification ledger

| Check | Observed result | Limit |
| --- | --- | --- |
| Full Node regression | 26 suites PASS | Includes original unchanged economy/save/art bytes and exact approved source patches |
| Player data tests | 19 PASS | In-memory storage/PostgREST doubles; not real Auth |
| Account controller browser | PASS delayed switch blocked during run, explicit import, external signout, 256x256 raster/SVG rejection | Explicit fake Auth; not authenticated storage upload |
| UI browser | PASS 320x740, 390x844, 844x390, 1365x900 | Guest entry, home/profile/heroes, 44px targets/hit tests, share branches, repeat/skip/reduced motion, pause/retire/history; no page errors |
| Full M5.2 browser combat | PASS local AND exact cb51ad6 Preview | Four defenders, targeting, powers/spells, loot/death, pause/resume/speeds, mute, Shockwave, weather, stress and upgrades; errors empty |
| Live SQL ownership/projection | PASS | Transaction rolled back synthetic users and test rows; owner A could not read/update B or insert foreign achievements; stats/unlocks projected |
| Email and real login | HTTP 200; owner confirmed successful login/save-choice; live Auth has one signed-in user | First write verified below; authenticated reload/logout/avatar acceptance still pending |
| First real mobile cloud write | PASS screenshot plus direct database verification | Revision 1, save/envelope version 1; one profile/stat row, four starter unlocks, projected statistics match. No runs were invented. Reload/conflict/logout/avatar still pending |
| Auth redirect configuration | Site URL canonical; one exact Preview redirect approved/saved | Initial broad local additions were rejected and never saved; owner then explicitly approved this single deployment URL. Total allowed redirects: 1 |
| Preview payload/UI/save | PASS 18 SHA-256 payloads; all four viewports; actual save/reload | Approved temporary Vercel share cookie. No auth/access token appears in evidence or canonical sharing |
| Private Chrome Preview | PASS actual guest Brass combat/speed/pause/retire/reload/profile | Confirmed 5 earned coins, 15 career XP, one retired run, highest completed wave 0; representative runtime check |
| Physical Android/iPhone | UNVERIFIED | No actual device/hardware FPS/thermal/audio acceptance |

Stable software Chrome fixed-crowd comparison (same 36 enemies, four heroes, geometry and camera): low calls 1056→532; standard/high 1057→533 (~49.6% reduction); triangles unchanged 286452/286900/287268; geometry resources 249→232 or 251→234. This isolates batching in the current renderer, not a claim of whole-production before/after FPS. Current full VFX stress additionally measured ~534+ calls; consult raw m3-stress.json, not a single-frame FPS estimate.

Evidence under ignored `qa-artifacts/stage3-{ui,world,brass,combat,auth}` and stage3-test.log. Sanitized representative captures/results are copied to docs/evidence/stage3. Screenshots were inspected for lane, boss telegraph, idle/recoil and menu layout. No owner aesthetic acceptance is inferred.

Automated pixel comparison is reproducible with `python scripts/compare-screenshots.py BEFORE AFTER OUTPUT_PREFIX` (existing Pillow runtime). Fixed-crowd before/after batching captures: 7.8074% pixels changed by more than 6/255; mean absolute channel error approximately 1.38/1.58/1.53. Pair/diff/JSON are retained in evidence. This records presentation differences and does not declare artistic equivalence or replace visual review.

Local-vs-deployed home UI at 390x844: 0.3667% pixels changed above 6/255, with mean absolute channel error approximately 0.253/0.242/0.218. Real-time world/weather capture timing can differ; controls/hit areas passed on both. The deployed profile screenshot was inspected after correcting its narrow heading. Evidence-only follow-up commits do not change the tested cb51ad6 game payload or its approved immutable Preview URL.

## Remaining acceptance and risks

1. Real login and first cloud write are verified. Session reload, cross-device cloud loading, conflict choices and logout remain pending. Exact Preview redirect and temporary sharing were approved/configured; the verified login used the fresh Preview flow. First email was sent before redirect correction, so do not treat the old link as valid game acceptance.
2. Real authenticated private avatar upload/signing/reload; browser raster preparation and SQL policies alone are insufficient.
3. Physical phones, owner listening/play/visual comparison, long sessions and multi-tab writes. Same-browser simultaneous active play remains unsupported/unverified.
4. Blender/artist material/texturing/LOD refinement and larger world art direction. Current asset is a playable skeletal slice, not a claimed final AAA character.
5. Supabase advisor reports leaked-password protection disabled. The game offers passwordless login, but any future password flow must address https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . No table/RLS/function advisory was reported after migration.
6. Production promotion requires explicit approval after these results and owner review. Keep production baseline/rollback from docs/stage25/QA.md.
