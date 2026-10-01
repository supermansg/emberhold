# Emberhold migration status

Updated: 2026-09-07. Stage 2 authorized: GitHub foundation only.

## Verified baseline

- Clean source at start: def5de459bb405ac320ea4fd2cf977f56abba2c9.
- Sites saved version 3 references that exact commit. This is not browser verification of the live deployment.
- Sites project: appgprj_6a9e7e0f19b8819183427994b3c5e0cd.
- Existing URL: https://emberhold.dudi-sgulam.chatgpt.site/
- Sites access checked today: custom, owner only.
- Local Node: 24.19.0. Both verify.mjs and verify-v3.mjs passed again today.
- No gameplay or dist asset changes in this foundation stage.

## GitHub foundation

- Authenticated GitHub account: supermansg.
- Scoped repository search for user:supermansg emberhold returned no results.
- This session's GitHub connector supports editing repositories, but exposes no repository-creation operation. GitHub CLI is not installed.
- Intended repository: private emberhold under supermansg; not created or pushed yet.
- Prepared: ignore rules, minimal CI running both existing checks, source checksum manifest, baseline tag, development guidance, source archive and Git history bundle.
- CI has been prepared only; no GitHub Actions run or branch protection has been configured.
- Stage 2 is incomplete until remote creation, upload and remote verification succeed.

## Next action

Create the private emberhold repository and grant the connected GitHub app access. A README initialization is acceptable for connector-based upload. Inspect any remote contents before importing; never overwrite unrelated history. Prefer pushing full local history when authenticated Git transport is available. Otherwise import the source through the connector, retain the bundled original history, and record the new GitHub baseline SHA.

## Following stages (not executed)

3 unchanged Vercel baseline; 4 dedicated Supabase/model; 5 guest/account auth;
6 cloud progress; 7 meta/run separation; 8 safe snapshots; 9 server economy;
10 RLS; 11 configuration versions; 12 analytics; 13 environment isolation;
14 environment variables; 15 loading/errors; 16 retry/connectivity;
17 performance; 18 QA; 19 legacy transfer; 20 docs; 21 production review.

Plan legacy transfer, environment isolation and safe economy before implementation. Existing local saves cannot be read directly from another domain. No cloud saves, login, active-run recovery or Vercel release exists in this prepared change.

## Validation limits

Simulation tests cover core combat and progression but do not establish device performance, gameplay balance, browser rendering, cloud authorization or production readiness. Recheck runtime and mobile before public release.
