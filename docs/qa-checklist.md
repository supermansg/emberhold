# QA checklist

## Stage 2.5 integration

- [x] M5.2 exact parent and full history verified; local Stage 2 preserved separately.
- [x] Offer bug reproduced then fixed; authority/save/art/presentation preservation checks pass.
- [x] Combined 23 Node suites pass; CI configured for full history/all suites.
- [x] Complete local browser harness and portrait/narrow/landscape touch smoke; controlled 36-enemy rain/×3 stress.
- [ ] Preview exact-commit/runtime checks; see stage25/QA.md.
- [ ] Physical Android/iPhone/audio/thermal acceptance.
- [ ] Explicit Stage 3 approval. No production merge/promotion authorized.

- [x] Latest saved Sites version is 10; remote main matches the supplied commit.
- [x] All 48 imported files match source SHA-256 hashes before documentation additions.
- [x] All nine supplied Node test scripts pass.
- [x] No build, remote push or deployment performed.
- [ ] Browser gameplay and mobile touch QA.
- [ ] GPU performance and device audio QA.
