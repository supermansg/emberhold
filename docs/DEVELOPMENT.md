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
