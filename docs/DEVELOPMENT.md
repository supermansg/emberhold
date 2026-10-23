# Permanent release workflow — effective Stage 2.6

Owner approval in the Stage 2.6 request authorizes Stage 2.5 candidate d8556d6fea02d7f42de2fcddad44d6094cf4f293 for production after verification. It does not authorize future milestones or the complete Stage 3 implementation. Earlier Preview-only restrictions remain historical.

1. Define acceptance criteria and scope in product-backlog.md and qa-checklist.md before work. Create an isolated codex/* branch from verified current main. Preserve uncommitted work; never reset shared history or write a build into authored dist.
2. Inspect source/docs, make focused changes and maintain README/context/changelog. Run npm test with full Git history; add meaningful migration/authority tests for changes. Never weaken failing checks to permit release.
3. Push a candidate to the existing Vercel emberhold project. Record exact SHA, Preview deployment ID and runtime evidence. Test actual Preview assets, errors and gameplay at portrait/short landscape/narrow sizes; verify saves both upgrade and rollback. Physical device results are separate from emulation.
4. Obtain explicit owner acceptance of this candidate and known limitations. Acceptance is not inferred from a green build, prior milestone approval or elapsed time. Every accepted completed milestone must then be released, or reported blocked with a concrete reason.
5. Re-fetch origin/main, inspect ancestry/diff and concurrent work. Prefer a non-forced fast-forward of the exact tested candidate. If conflicts or runtime changes are necessary, create a new candidate and repeat tests/Preview/acceptance. Review branch protections; never bypass a protection error or force-push. Existing stacked PRs can stay historical; do not blindly merge all of them again.
6. Before push, record previous production deployment ID/SHA/URL and schema compatibility. Verify existing project/team/domain and effective build/output. Current static contract: vercel.json buildCommand npm test, outputDirectory dist; Node 24. Vercel build logs must confirm it. No environment credentials are required by the game.
7. Push the accepted exact SHA to main to invoke existing Git production deployment. READY alone is insufficient. Confirm target production, SHA/main, canonical alias, real anonymous HTTPS entry, exact JS source, CSS/GLB/WebP/addons, rendered gameplay, abilities, speeds, pause/resume, settlement/restart, saved fixture reload and zero page/asset errors. If a blocker occurs, stop further releases and use rollback as necessary.
8. Record release version, runtime SHA, deployment ID, canonical URL, evidence, limitations and rollback in stage25/QA.md (current release ledger). Update project snapshot and launch docs. Documentation-only follow-ups still use an isolated branch and Preview, preserve exact runtime bytes, and receive post-deploy verification if pushed to main under the current documentation authorization.

This is an adopted operational policy, not a claim that GitHub required reviewers/branch protection or Vercel Deployment Checks were configured. Existing CI checks and Vercel test-gated builds exist; platform-enforced approvals can be a separately approved hardening task.

## Rollback runbook

Known pre-release deployment: dpl_FoxG6714A2BrDZK2P3MRDrpyegts, SHA 88ba79af3a59253090565b950e9cdcf3b19d6370, URL https://emberhold-omjuxbs2k-dudi1710-gmailcoms-projects.vercel.app . Canonical domain stays https://emberhold-five.vercel.app/ . Old/new progression, collection and content files are identical; a representative same-origin old -> new -> old persistence test passes. This does not migrate player saves to another origin or restore an active run (not persisted).

On a release-blocking incident: stop new main pushes; inspect current alias/deployment. In the existing team/project use Vercel request_rollback to the recorded deployment ID, or authenticated CLI `vercel rollback <recorded-deployment-url> --scope <existing-team>`. Do not delete deployments or force-reset main. Verify alias -> old deployment/SHA, public assets/gameplay and existing save fixture again. Rollback can stop automatic domain assignment; restore it only after a corrected candidate is tested and explicitly accepted, using the platform promotion workflow. Reconcile Git with a reviewed revert/new commit on an isolated branch. Do not run rollback as a harmless test on a healthy live site.

Rollback procedure and target are confirmed by retained deployment metadata and backward-compatible save test; a destructive live rollback drill has NOT been executed. Hardware smoke/listening are still separate acceptance records.

## Local commands

Use Node 24, npm ci for setup, npm run dev at http://localhost:4173, npm test for 23 suites. Browser harnesses require an existing Playwright module and Chrome executable via PLAYWRIGHT_MODULE / CHROMIUM_PATH; no package installation is implied. scripts/verify-stage25-smoke.cjs uses QA_BASE_URL, QA_STATIC=1 and QA_ARTIFACTS for deployed static real-entry QA. scripts/verify-stage26-save.cjs must run before release while old production is live; it uses a fresh context and serves candidate files only in the middle same-origin phase. Do not treat rerunning it after release as an old/new compatibility proof. Preserve qa-artifacts evidence without browser credentials/share tokens.

---
## Historical development notes

# Development and baseline recovery

The authored application lives in dist. Do not delete or ignore that directory. There is no install or build step in this baseline. Use Node 24 for checks:

```sh
node verify.mjs
node verify-v3.mjs
python3 -m http.server 8080 --directory dist
```

Serve over HTTP, not file URLs. Stop the local server when finished.

main is intended for accepted releases; use feature/* for changes. Future Vercel Preview will be configured separately. Do not assume a push is safe once automatic production deployment is configured.

The baseline-sites-v3 tag identifies the unchanged pre-migration source. docs/baseline-dist-sha256.json contains SHA-256 checksums of every baseline game file. Recover by creating a new branch from the tag and comparing it to the current release, not by resetting shared history.

Keep .openai/hosting.json intact for the existing Sites identity. Never commit credentials or local player saves. Preserve the vendored Three.js license. Do not add an open-source license for the game without the owner's decision.

Future account UI, persistence and economy must be separated from combat/rendering. No database calls per frame. Currency and permanent purchases require server authorization, transactions and replay protection. Browser-side validation is not anti-cheat.

The delivery archive includes emberhold-history.bundle, preserving local commits and refs. To restore the original Git history, extract the archive and run:

```sh
git clone emberhold-history.bundle emberhold-restored
```

Before pushing restored history, inspect the target repository and confirm its ownership and contents. The bundle is a backup, not a deployment artifact.
# Browser inspection

The optional development setup uses `npm ci` and `npm run dev` with Vite 8.0.13. It serves the authored `dist` directory directly; no framework migration or production build step is introduced. The supervised preview can now start in this checkout. Do not run Vite build over authored `dist` files. Use `npm test` for the three existing simulation/scene suites. The cloud browser currently has WebGL disabled, so it exercises the Canvas fallback only. See `BULLET-HEROES-REVIEW.md` for verified UI coverage and limitations.
