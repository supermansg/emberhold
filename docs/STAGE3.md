# Stage 3 candidate — 2026-10-25

Branch: `codex/stage3-premium-world`, based on production `ee0e8359c32544cae5bfa06782d51a728180bebb`. Commit/Preview evidence will be appended after push. Production remains Stage 2.6 at https://emberhold-five.vercel.app/ . This is a review candidate, not production readiness or owner creative acceptance.

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
| Full M5.2 browser combat | PASS | Four defenders, targeting, powers/spells, loot/death, pause/resume/speeds, mute, Shockwave, weather, stress and upgrades; errors empty |
| Live SQL ownership/projection | PASS | Transaction rolled back synthetic users and test rows; owner A could not read/update B or insert foreign achievements; stats/unlocks projected |
| Email delivery | HTTP 200 and owner confirmed receipt | No successful real session/cloud/avatar acceptance yet |
| Auth redirect configuration | Site URL corrected; additions blocked | localhost:3000 was default. Automatic approval rejected adding three local origins; no additions saved. Need exact Preview URL permission |
| Physical Android/iPhone | UNVERIFIED | No actual device/hardware FPS/thermal/audio acceptance |

Stable software Chrome fixed-crowd comparison (same 36 enemies, four heroes, geometry and camera): low calls 1056→532; standard/high 1057→533 (~49.6% reduction); triangles unchanged 286452/286900/287268; geometry resources 249→232 or 251→234. This isolates batching in the current renderer, not a claim of whole-production before/after FPS. Current full VFX stress additionally measured ~534+ calls; consult raw m3-stress.json, not a single-frame FPS estimate.

Evidence under ignored `qa-artifacts/stage3-{ui,world,brass,combat,auth}` and stage3-test.log. Sanitized representative captures/results are copied to docs/evidence/stage3. Screenshots were inspected for lane, boss telegraph, idle/recoil and menu layout. No owner aesthetic acceptance is inferred.

Automated pixel comparison is reproducible with `python scripts/compare-screenshots.py BEFORE AFTER OUTPUT_PREFIX` (existing Pillow runtime). Fixed-crowd before/after batching captures: 7.8074% pixels changed by more than 6/255; mean absolute channel error approximately 1.38/1.58/1.53. Pair/diff/JSON are retained in evidence. This records presentation differences and does not declare artistic equivalence or replace visual review.

## Remaining acceptance and risks

1. Exact Preview redirect allowlist approval, real link/code completion, session reload, cloud sync across devices, conflict choices and logout. First email was sent before redirect correction, so do not treat that link as valid game acceptance.
2. Real authenticated private avatar upload/signing/reload; browser raster preparation and SQL policies alone are insufficient.
3. Physical phones, owner listening/play/visual comparison, long sessions and multi-tab writes. Same-browser simultaneous active play remains unsupported/unverified.
4. Blender/artist material/texturing/LOD refinement and larger world art direction. Current asset is a playable skeletal slice, not a claimed final AAA character.
5. Supabase advisor reports leaked-password protection disabled. The game offers passwordless login, but any future password flow must address https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . No table/RLS/function advisory was reported after migration.
6. Production promotion requires explicit approval after these results and owner review. Keep production baseline/rollback from docs/stage25/QA.md.
