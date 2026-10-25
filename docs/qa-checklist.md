# Current mobile-first acceptance contract — Stage 2.6

Apply to every milestone; use PASS / FAIL / NOT VERIFIED and record commit, browser/device, viewport, DPR, quality and scenario. Current scope evidence is in stage25/QA.md; a measured software run is not a physical-device benchmark.

| Gate | Acceptance and verification |
|---|---|
| Required viewport matrix | 390x844 portrait, 844x390 short landscape, 320x740 narrow; home, navigation, heroes/detail, shop, collection, starter/upgrade/result, battle and pause. Record screenshots; scroll through all content. |
| Layout | No horizontal overflow, overlapping/clipped navigation or controls, hidden required actions; reserve header/nav/safe-area inset space. Check keyboard/rotation and long Hebrew labels. Content scrolls without trapping Back. |
| Controls/text | >=44x44 CSS px touch target, clear label/focus/disabled rationale, readable real-device text, consistent logo/back placement. Color is not the only rarity/status cue. Confirm keyboard focus order and dialog escape/return. |
| Motion | Reduced-motion mode removes ornamental travel/parallax, transitions do not block actions or flash; hidden/pause stops simulation and decorative updates as specified. |
| Combat | Four power slots reachable; target picking works; boss warning visible; pause/upgrade freeze actual simulation; speeds retain authority; no ornament masks enemies or damage. |
| Quality/performance | Low/Standard/High same gameplay; bounded pools/resources; comparable frozen normal + dense fixtures with raw mean/p95/max, draw/triangle counts. Physical GPU/thermal evidence on agreed phones before claiming device FPS. Proposed budgets live in the art spec. |
| Persistence | Legacy/malformed/default and representative full save, exact-once settlement, old/new/old compatibility, reload, storage failure and origin isolation. Never clear actual player storage for QA. |
| Deployment | Exact Preview SHA + test logs + public production domain and assets/gameplay after release; retain rollback ID. No temporary access tokens in public invitations or committed evidence. |
| Physical Android | Chrome on named physical phone/OS, portrait/rotation, speaker/audio unlock, tap/scroll, safe areas and sustained play. NOT VERIFIED until available. |
| Physical iPhone | Safari on named physical iPhone/iOS, browser bars/notch, rotation, audio interruption/resume, memory and sustained play. NOT VERIFIED until available. |

A release may explicitly accept known unverified hardware/creative limits, as Stage 2.6 does for Stage 2.5; record them visibly. It may not silently label them PASS. New overlap/clipping/runtime/save corruption failures block release. This checklist is broader than the current automated smoke; selectors/dimension checks alone are not complete aesthetic/accessibility acceptance.

---
## Historical checklist

# QA checklist

## Stage 2.5 integration

- [x] M5.2 exact parent and full history verified; local Stage 2 preserved separately.
- [x] Offer bug reproduced then fixed; authority/save/art/presentation preservation checks pass.
- [x] Combined 23 Node suites pass; CI configured for full history/all suites.
- [x] Complete local browser harness and portrait/narrow/landscape touch smoke; controlled 36-enemy rain/×3 stress.
- [x] Preview exact-commit/runtime checks; see stage25/QA.md.
- [ ] Physical Android/iPhone/audio/thermal acceptance.
- [ ] Explicit Stage 3 approval. Stage 2.6 subsequently authorized release of the accepted Stage 2.5 candidate.

- [x] Latest saved Sites version is 10; remote main matches the supplied commit.
- [x] All 48 imported files match source SHA-256 hashes before documentation additions.
- [x] All nine supplied Node test scripts pass.
- [x] No build, remote push or deployment performed.
- [ ] Browser gameplay and mobile touch QA.
- [ ] GPU performance and device audio QA.
# Stage 3 acceptance (2026-10-25)

- [x] 26 Node suites, approved boss change and exact preserved authority/art/economy checks.
- [x] Four viewport guest/profile/share/entry/pause/retire browser checks; full M5.2 browser combat regression.
- [x] Player storage failure/account isolation/retry/conflict tests; live rolled-back SQL owner isolation/projection.
- [x] Same-crowd draw-call comparison; screenshots inspected; no physical FPS claim.
- [x] Real login email transport accepted and owner confirmed receipt.
- [x] Exact Preview Auth redirect and 23-hour review-link permission/configuration.
- [ ] Real session restoration/cloud conflict/logout acceptance.
- [ ] Real authenticated private avatar upload/reload; signed URL/privacy acceptance.
- [x] Preview exact commit, 18 asset hashes, guest runtime/save/reload, four viewports; screenshot comparison evidence.
- [ ] Physical Android/iPhone, listening and owner visual/play acceptance.
- [ ] Explicit production promotion approval; main remains ee0e835.
