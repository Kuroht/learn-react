# Lesson 24 Project: Deploy Your Favorite Project with a GitHub Actions Pipeline

Pick one of your best projects and give it a complete delivery pipeline: automated checks on every pull request, a protected `main`, preview and production deployments, safe configuration, monitoring, and a documented rollback. This is the end of the curriculum before the final project.

> **Last verified:** October 2026. Hosting platforms and GitHub Actions change often. Check [docs.github.com/actions](https://docs.github.com/actions) and your host's docs for the current syntax, and use the latest major versions of the actions you use.

---

## Brief

Choose a project you're proud of. Good candidates: the Kanban board (17, refactored in 21), the shopping cart with tests (12 and 19), the GitHub explorer (15), the blog on Next.js (22), or the protected dashboard (23).

Your goal is a pipeline where:

1. Opening a pull request automatically runs lint, type-check, tests, and build
2. A broken change **cannot** be merged into `main`
3. Each pull request gets a live **preview URL**
4. Merging to `main` deploys to **production**
5. Secrets and configuration are handled safely
6. You'd know if production broke, and you can roll back in minutes

Everything is documented so a friend could take over the project.

Every stage ends with a **checkpoint**: something you can demonstrate.

---

## Getting started

Use a repository you control. The simplest approach: copy the project into its **own** GitHub repository, so the pipeline is at the repo root (this learning monorepo has many nested projects, which makes platform setup more complex). If you prefer to stay in this repo, set the working directory and `paths:` filters as shown in the lesson.

```bash
git switch -c yourname/lesson-24
mkdir -p .github/workflows
```

Make sure `npm run lint`, `npm run build`, and tests work locally with a clean install:

```bash
rm -rf node_modules && npm ci && npm run lint && npx tsc -b && npm test -- --run && npm run build
```

---

## Stage 1: One command to check everything

- [ ] Add a `check` script to `package.json` that runs lint, type-check, tests (single run), and build
- [ ] Add a `.nvmrc` (or `engines` in `package.json`) with the Node version, and use the same one everywhere
- [ ] Commit the lockfile
- [ ] Add `README` badges later (Stage 8)

**Checkpoint:** `npm run check` passes locally on a clean clone.

---

## Stage 2: The CI workflow

Create `.github/workflows/ci.yml`:

- [ ] Triggers on `pull_request` and on `push` to `main`
- [ ] `permissions: contents: read`, `concurrency` with `cancel-in-progress`, and `timeout-minutes`
- [ ] Steps: checkout → setup-node (with `cache: npm`) → `npm ci` → lint → type-check → tests → build
- [ ] Separate the work into jobs (`lint`, `typecheck`, `test`, `build`) so failures are easy to read, with `build` depending on the others (or keep one job if your project is tiny, and say why)
- [ ] Upload the test report/coverage as an artifact
- [ ] Open a PR and watch it run

**Checkpoint:** a green check on a PR. Then break something on purpose (a lint error, then a type error, then a failing test) and confirm each one turns the check red with a readable log.

---

## Stage 3: End-to-end tests (if you have them)

- [ ] Add a Playwright job (or reuse your Lesson 19 E2E test): `npx playwright install --with-deps chromium` then `npx playwright test`
- [ ] Use `webServer` in the Playwright config to start the built app (`npm run preview`) so tests run against the **production build**
- [ ] On failure upload the HTML report/trace as an artifact
- [ ] Keep it to a small number of critical journeys so the job stays under ~5 minutes

If your project has no E2E, write one test for the most important flow. This is the perfect time.

**Checkpoint:** you can download the Playwright report from a failed run and see what happened.

---

## Stage 4: Quality gates

Add at least **three** extra automated checks, from:

- [ ] `npm audit --audit-level=high` (and decide how to treat findings)
- [ ] A dependency check: `knip` for unused code, `madge --circular` for cycles (Lesson 21)
- [ ] Bundle size budget with `size-limit`, or a step that fails if `dist/` grows beyond a limit
- [ ] Lighthouse CI against the preview or the built app (thresholds for performance, accessibility ≥ 95, SEO)
- [ ] An axe accessibility test (Lesson 19)
- [ ] `gitleaks` secret scanning
- [ ] CodeQL code scanning
- [ ] A PR-title check that enforces Conventional Commits

**Checkpoint:** each gate has been seen **failing** at least once (on purpose) and **passing**.

---

## Stage 5: Protect `main`

On GitHub: Settings → Rules (or Branches):

- [ ] Require a pull request before merging, with at least one approval (ask a friend to be your reviewer)
- [ ] Require your CI jobs to pass (select them by name) and branches to be up to date
- [ ] Block force pushes and branch deletion
- [ ] Add `CODEOWNERS` and a PR template (this repo's template is a good model)
- [ ] Prove it: try to push to `main` directly and try to merge a PR with a red check

**Checkpoint:** a screenshot of the failed direct push and of the disabled merge button.

---

## Stage 6: Deploy with previews

Choose Vercel, Netlify, or Cloudflare Pages (or another host you prefer):

- [ ] Import the repo, and set the install/build/output settings and Node version
- [ ] Production deploys on merges to `main`; every PR gets a preview URL
- [ ] **SPA fallback** configured (if it's a single-page app), and verified by refreshing on a deep link
- [ ] Custom `base` path handled (if you use GitHub Pages)
- [ ] For Next.js, check that server features (actions, auth, image optimization) work on your host
- [ ] Add the preview URL check to your PR routine: review the live preview, not just the diff

**Checkpoint:** you have a production URL and a preview URL for an open PR.

---

## Stage 7: Configuration and secrets

- [ ] `.env.example` lists every variable, with comments and dummy values
- [ ] Env validation with Zod at build/startup (Lesson 23's `lib/env.ts` pattern)
- [ ] Production and Preview have **different** values set in the host dashboard
- [ ] Only public values are in `VITE_*` / `NEXT_PUBLIC_*`. Verify by grepping the built output
- [ ] Any real secret (a Sentry auth token, an API key) is a **repository secret** and used only in the steps that need it
- [ ] Confirm `.env.local` is gitignored, and run a secrets scan over the repo history
- [ ] Document every variable in the README (name, purpose, public or secret, who can change it)

**Checkpoint:** a missing variable fails the build with a clear message, instead of failing at runtime for users.

---

## Stage 8: Monitoring

- [ ] Add error tracking (Sentry or an alternative) with your Lesson 18 error boundaries reporting to it, plus `window` unhandled errors
- [ ] Upload source maps in CI (the auth token as a repository secret), and tag events with the release (commit SHA)
- [ ] Trigger a deliberate error in a **preview** deployment and find it in the dashboard with a readable stack trace
- [ ] An uptime monitor on the production URL that alerts you
- [ ] Core Web Vitals reporting (the `web-vitals` library, or your host's analytics)
- [ ] Add badges (CI status, deploy status, license) to the project README

**Checkpoint:** you received an alert (or dashboard entry) for an error you caused on purpose.

---

## Stage 9: Releases and rollback

- [ ] Adopt Conventional Commits, and choose a release approach: manual tags with GitHub Releases, or automation with `release-please` / `changesets`
- [ ] Create a `v1.0.0` release with notes
- [ ] **Rollback drill:** deploy a deliberately broken change to production (in a safe project!), then restore the last good deployment using your host's feature or a `git revert`. Time it
- [ ] Write `RUNBOOK.md`: how to deploy, how to roll back, where the logs and errors are, who to contact, and how to rotate each secret
- [ ] Add a post-deploy smoke test (a workflow triggered after a deployment, or a scheduled job) that checks the production URL returns 200 and contains expected text

**Checkpoint:** the rollback took under 10 minutes, and the runbook has the exact clicks or commands.

---

## Stage 10: Automate the boring parts

- [ ] `dependabot.yml` for npm and GitHub Actions (grouped weekly updates)
- [ ] Review and merge at least one Dependabot PR, with CI as the safety net
- [ ] Pin third-party actions to commit SHAs (let Dependabot keep them updated)
- [ ] Restrict workflow `permissions` to the minimum on every workflow
- [ ] Review each workflow for `pull_request_target` or other risky triggers (you probably have none, and that's good)
- [ ] Add a scheduled weekly workflow (`schedule:` cron) that runs the full check and `npm audit`, so you hear about problems even when nobody pushes

---

## Stage 11: Document and present

Write a `DELIVERY.md` (or a README section) with:

- [ ] A diagram of the pipeline (PR → CI → preview → review → merge → production → monitoring)
- [ ] The list of required checks and why each exists
- [ ] How to run everything locally
- [ ] How secrets and environments are organized
- [ ] The rollback procedure
- [ ] What you would add next (visual regression tests, canary releases, feature flags, staging environment)

Then do a 5-minute walkthrough with a friend: open a PR with a deliberate bug, show CI catching it, fix it, show the preview, merge, and show the production deploy and the error dashboard.

---

## Requirements checklist

**Must have**

- [ ] A CI workflow running lint, type-check, tests, and build with `npm ci` and caching
- [ ] `permissions`, `concurrency`, and `timeout-minutes` set
- [ ] At least three extra quality gates
- [ ] Branch protection on `main`, with required checks and a review
- [ ] Production deployment from `main` and preview deployments for PRs
- [ ] SPA fallback (or equivalent server config) verified on a deep link
- [ ] `.env.example`, validated env vars, and no secrets in the client bundle or repo
- [ ] Error monitoring with readable stack traces, and an uptime monitor
- [ ] A rollback drill and a `RUNBOOK.md`
- [ ] Dependabot configured
- [ ] `DELIVERY.md` documentation
- [ ] `npm run check` passes locally and in CI

**Nice to have**

- [ ] E2E tests running in CI against the preview URL
- [ ] A staging environment between preview and production
- [ ] Lighthouse CI budgets enforced on PRs
- [ ] Automated releases and changelog generation
- [ ] A Docker image deployed to a container host, with a health check
- [ ] Infrastructure notes: a custom domain, HTTPS, and cache headers explained
- [ ] A reusable workflow (`workflow_call`) other projects can share

---

## Hints

<details>
<summary>The workflow doesn't run</summary>

Check that the file is in `.github/workflows/`, ends in `.yml` or `.yaml`, is valid YAML (indentation!), and that the `on:` event matches what you did. Workflows on a PR run from the PR's merge commit, and a workflow file that exists only on a branch applies to that branch. Look at the Actions tab for syntax errors.
</details>

<details>
<summary><code>npm ci</code> fails with "package-lock.json is out of sync"</summary>

Run `npm install` locally, commit the updated lockfile. Make sure you use the same npm major version as CI (Node 22 ships a recent npm).
</details>

<details>
<summary>Build works locally but fails in CI</summary>

Usual causes: a case-sensitive import (`Button.tsx` vs `button.tsx`: Windows/macOS ignore case, Linux doesn't), a missing env var, a different Node version, an uncommitted file, or a test that depends on your timezone/locale.
</details>

<details>
<summary>The refresh on a route gives a 404 in production</summary>

You need the SPA fallback. Netlify: `_redirects` with `/* /index.html 200`. Vercel: a rewrite in `vercel.json`. Check the platform docs for your framework preset.
</details>

<details>
<summary>My secret appears in the bundle</summary>

It was exposed through a `VITE_` / `NEXT_PUBLIC_` variable, or imported in client code. Rotate the secret immediately (assume it leaked), then move the call to a server-side function.
</details>

<details>
<summary>The required check never appears in the branch rule</summary>

GitHub lists only checks that have run recently. Open a PR so each job runs once, then select them. Job names in the rule must match the workflow's job names.
</details>

<details>
<summary>Playwright tests are flaky in CI</summary>

Use web-first assertions and auto-waiting locators (no fixed sleeps), run against the production build, seed deterministic data, and upload traces (`trace: 'on-first-retry'`). Allow one retry in CI, but investigate every flake.
</details>

---

## How to submit

1. Work in your own branch (or your own repository), with a clear commit history.
2. Open a pull request titled `Lesson 24: yourname`, with links to a successful workflow run, the preview URL, the production URL, and your `RUNBOOK.md`.
3. Ask a friend to review it. A good review asks: could I merge something broken? Could I leak a secret? If production breaks at 2 a.m., do I know exactly what to do?

---

## Done when

- A pull request goes from idea to production through automated checks, review, and preview, with no manual steps
- A bad change is blocked, a bad deploy can be undone in minutes, and errors reach you
- Everything is written down in `RUNBOOK.md` and `DELIVERY.md`
- Your PR is open and a friend has reviewed it

**You've finished all 24 lessons!** Next up: the **final project**. Pick an idea (or choose from your team's list), plan it together, and build it as a team using pull requests, code review, tests, and the delivery pipeline you just built. See the main [README](../../../README.md).
