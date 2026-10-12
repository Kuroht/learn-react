# Lesson 24: CI/CD and Deployment

**Goal:** make shipping boring. You'll automate checks with GitHub Actions, protect your main branch, deploy your app with preview environments, manage configuration and secrets safely, and learn how to watch an app once it's live.

**Time:** about 3 hours

**Prerequisite:** [Lesson 23](../23-authentication-basics/README.md)

> **Last verified:** October 2026, with `actions/checkout@v6`, `actions/setup-node@v6`, `actions/upload-artifact@v7`, and Node 24 (the current LTS). Hosting platforms and GitHub Actions versions change often. Dependabot (section 9) will open pull requests when new majors appear. Check [docs.github.com/actions](https://docs.github.com/actions), [vercel.com/docs](https://vercel.com/docs), and [docs.netlify.com](https://docs.netlify.com) for the current syntax, and bump action versions to the latest major.

---

## What you will learn

- What CI and CD are, and why they exist
- GitHub Actions: workflows, jobs, steps, runners
- A CI workflow: install, lint, type-check, test, build
- Caching, matrices, and keeping CI fast
- Branch protection and required checks
- Deploying a Vite app (static) and a Next.js app
- Preview deployments for every pull request
- Environment variables and secrets
- SPA routing fallbacks
- Releases, rollbacks, and versioning
- Monitoring: errors, logs, and analytics
- Dependency and security automation
- A release checklist

---

## 1. CI and CD

**Continuous Integration (CI):** every change is automatically built and tested, so problems are found within minutes, on a clean machine, instead of "it works on my laptop".

**Continuous Delivery/Deployment (CD):** every change that passes CI can be (or automatically is) deployed. Small, frequent, automated releases are less risky than big, rare, manual ones.

```
push / pull request
      │
      ▼
 ┌───────────── CI ─────────────┐        ┌──── CD ────┐
 │ install → lint → types →     │  ───▶  │ preview or │
 │ test → build                 │        │ production │
 └──────────────────────────────┘        └────────────┘
```

What CI buys you:

- A shared definition of "green": the same checks for everyone
- Confidence to merge friends' pull requests
- Documentation of exactly how to build the project
- Protection against "forgot to run the tests"

---

## 2. GitHub Actions in 5 minutes

Workflows are YAML files in `.github/workflows/`. Vocabulary:

| Term | Meaning |
|------|---------|
| **Workflow** | One YAML file, triggered by events |
| **Event** (`on:`) | What starts it: `push`, `pull_request`, `schedule`, `workflow_dispatch` (manual) |
| **Job** | A set of steps that runs on one fresh virtual machine. Jobs run in parallel by default |
| **Step** | A shell command (`run:`) or a reusable **action** (`uses:`) |
| **Runner** | The machine (`ubuntu-latest` is the usual choice) |
| **Artifact / cache** | Files kept between jobs / runs |
| **Secret** | An encrypted value available to workflows |

A first workflow:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v6

      - uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: npm

      - run: npm ci
      - run: npm run lint
      - run: npx tsc -b
      - run: npx vitest run
      - run: npm run build
```

Line by line:

- `on:` runs for every pull request, and for pushes to `main`
- `concurrency:` cancels an older run when you push again to the same branch (saves minutes)
- `permissions: contents: read` gives the workflow's token only what it needs (least privilege)
- `timeout-minutes` stops a hung job
- `actions/checkout` downloads your code. `actions/setup-node` installs Node and caches npm's download cache
- **`npm ci`**, not `npm install`: installs exactly what's in `package-lock.json`, fails if it's out of sync, and is faster and deterministic
- Each `run:` that exits non-zero fails the job, and the pull request shows a red ✗

### Monorepos and this repo

This learning repo has many independent projects (`lessons/*/project/starter`). A single root workflow would have to pick which to test. Options: a **matrix** over directories, or `paths:` filters so a workflow only runs when its folder changes:

```yaml
on:
  pull_request:
    paths:
      - 'lessons/03-props-and-typescript/project/starter/**'

jobs:
  check:
    defaults:
      run:
        working-directory: lessons/03-props-and-typescript/project/starter
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: npm
          cache-dependency-path: lessons/03-props-and-typescript/project/starter/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

---

## 3. Making CI fast and reliable

- **Cache dependencies:** `setup-node` with `cache: npm` (above)
- **Run independent checks as separate parallel jobs** (lint, test, build) for faster feedback and clearer failures:

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps: [ ...checkout, setup-node, npm ci, npm run lint ]
  typecheck: ...
  test: ...
  build:
    needs: [lint, typecheck, test]     # only build when the others pass
```

- **Matrix** to test several Node versions or directories:

```yaml
strategy:
  fail-fast: false
  matrix:
    node: [22, 24]
steps:
  - uses: actions/setup-node@v6
    with: { node-version: '${{ matrix.node }}', cache: npm }
```

- **Keep checks deterministic:** no real network calls in tests (Lesson 19: MSW), no time-dependent tests, no dependence on test order
- **Treat flaky tests as bugs.** Ignoring them teaches everyone to ignore red builds
- **Store artifacts** you want to inspect (test reports, Playwright traces, coverage):

```yaml
- uses: actions/upload-artifact@v7
  if: failure()
  with:
    name: playwright-report
    path: playwright-report/
```

- Reproduce CI locally with the **same commands** and a single script: `"check": "npm run lint && tsc -b && vitest run && npm run build"`. If `npm run check` passes locally with a clean install, CI almost always passes

### End-to-end tests in CI

```yaml
- run: npx playwright install --with-deps chromium
- run: npx playwright test
```

Playwright can start your app (`webServer` in its config). E2E is slower, so run it on pull requests but only a few critical journeys.

---

## 4. Protect `main`

CI is only useful if it **blocks** bad merges. In GitHub: Settings → Branches (or Rules) → add a rule for `main`:

- [ ] Require a pull request before merging (with at least 1 approval)
- [ ] Require status checks to pass (select your CI jobs by name)
- [ ] Require branches to be up to date before merging
- [ ] Block force pushes and deletion
- [ ] (Optional) require conversation resolution, linear history, signed commits

This matches the repo's `CONTRIBUTING.md`: never commit directly to `main`. A `CODEOWNERS` file can request reviews automatically from the right people. A pull request template (like this repo's) reminds authors of the checklist.

Merge strategy: squash merges keep `main` readable (one commit per PR); regular merges preserve history. Pick one and be consistent.

---

## 5. Deploying

### Static SPA (Vite)

`npm run build` produces `dist/`, a folder of static files. Any static host serves it: Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3 + CDN.

**Settings you'll enter:**

| Setting | Value |
|---------|-------|
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Root directory | the folder with `package.json` (for this repo, e.g. `lessons/14-.../project/starter`) |
| Node version | match your local/CI version |

**The SPA fallback.** With client-side routing, `/posts/5` is not a file. The host must serve `index.html` for unknown paths, or a refresh shows a 404.

- Netlify: a file `public/_redirects` containing `/* /index.html 200`
- Vercel: `vercel.json` with `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- Cloudflare Pages: a SPA mode is the default when there is no 404 page
- GitHub Pages: copy `index.html` to `404.html`, and set Vite's `base` to `/<repo-name>/`

**Base path:** hosting under a sub-path (GitHub Pages project sites) requires `base: '/repo-name/'` in `vite.config.ts`, and router `basename`.

### Next.js

Easiest on **Vercel** (zero config). Other options: Netlify and Cloudflare adapters, or any Node host / Docker container running `next start`. Check the host's support for your Next.js version, since features like server actions and image optimization need a server runtime.

### Connect your repo

The usual flow with Vercel/Netlify/Cloudflare:

1. Import the GitHub repository in the dashboard
2. Set the root directory, build command, and env vars
3. Every push to `main` deploys to **production**
4. Every pull request gets its own **preview URL** (the bot comments it on the PR)

Review the preview before merging: reviewers can click, not just read code.

### Docker (when you need it)

For servers you manage, a multi-stage build keeps images small:

```dockerfile
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf   # include try_files $uri /index.html;
```

---

## 6. Configuration and secrets

- **Build-time variables** in Vite are exposed to the browser and must start with `VITE_`: `import.meta.env.VITE_API_URL`. They're **public**. Anyone can read them in the bundle
- In Next.js only `NEXT_PUBLIC_*` reach the browser. Server variables stay on the server
- **Secrets never go in the frontend bundle.** If a key must stay secret, call it from a server (a Next.js server action/route, a serverless function, your backend)
- Set variables in the host's dashboard (separately for Production / Preview / Development) and in GitHub **Settings → Secrets and variables → Actions** for CI
- Never commit `.env*` files with real values. Commit `.env.example`
- Validate env vars at startup with Zod so a missing value fails the build, not the user
- Use different credentials for each environment, and rotate anything that leaked
- **Workflows from forks don't get secrets**, by design, which also means a pull request can't steal them. Be careful with `pull_request_target`

Reading secrets in a workflow:

```yaml
- run: npm run build
  env:
    VITE_API_URL: ${{ vars.API_URL }}          # non-secret config
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}   # secret
```

GitHub masks secret values in logs, but never `echo` them, and don't pass them to untrusted code.

---

## 7. Releases and rollbacks

- **Every deploy should be reversible.** Vercel/Netlify keep every previous deployment, so "promote the last good one" is one click. Know where that button is *before* you need it
- **Tag releases:** `git tag v1.2.0` and create a GitHub Release with notes. [Semantic Versioning](https://semver.org): `MAJOR.MINOR.PATCH`
- **Conventional Commits** (`feat:`, `fix:`, `chore:`) let tools generate changelogs and versions automatically (release-please, changesets, semantic-release)
- **Feature flags** let you merge unfinished work safely and turn features on gradually
- **Database or API changes:** deploy backward-compatible changes first (expand), then remove the old way later (contract), so a rollback doesn't break
- A **post-deploy smoke test** (open the production URL and check a key page) catches "deployed but broken"

```yaml
# Deploy on tags, for apps you deploy yourself
on:
  push:
    tags: ['v*']
```

---

## 8. Monitoring: know when it breaks

Shipping isn't the end. In production you can't open the console on your users' devices.

| Need | Tools / approach |
|------|------------------|
| **Errors** | Sentry (or similar): captures exceptions with stack traces, browser info, and breadcrumbs. Hook it into your error boundaries (`onError`, Lesson 18) and `createRoot`'s `onUncaughtError`. Upload **source maps** so traces are readable (and don't serve them publicly if that matters) |
| **Logs** | Server logs on your host. Log structured data and never log secrets or personal data |
| **Uptime** | A free ping monitor (UptimeRobot, Better Stack) alerting you by email/chat |
| **Performance** | Real-user monitoring of Core Web Vitals (the `web-vitals` library, Vercel Analytics, etc.), plus Lighthouse CI on pull requests |
| **Product analytics** | Plausible, PostHog, etc. Respect privacy laws and consent |
| **Alerts** | Alert on symptoms users feel (error rate, downtime), not on every metric |

Release tracking: tag each Sentry event with the release (the commit SHA), so you can see "this error started with deploy X".

---

## 9. Automating the boring and the security stuff

- **Dependabot** (or Renovate): automatic pull requests to update dependencies, so you update a little often instead of a lot rarely.

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly }
    groups:
      minor-and-patch: { update-types: [minor, patch] }
  - package-ecosystem: github-actions
    directory: /
    schedule: { interval: weekly }
```

- `npm audit` in CI (`npm audit --audit-level=high`) flags known vulnerable dependencies. Judge results, since many are false alarms for your usage
- **Secret scanning** and push protection (GitHub, free for public repos), or `gitleaks` in CI
- **CodeQL** code scanning for common vulnerability patterns
- **Pin third-party actions** to a full commit SHA for supply-chain safety (the version tag can be moved by the action's owner). Dependabot can update pinned SHAs
- Use **least privilege** `permissions:` for each workflow, and review workflow changes in PRs like any security-sensitive code
- `npm ci --ignore-scripts` in untrusted contexts, plus lockfiles committed (the [security bonus module](../bonus-01-security/README.md) covers supply-chain risks)
- Run Lighthouse CI or bundle-size checks (`size-limit`) so performance regressions fail the PR

---

## 10. A complete example for a Vite app

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
  push: { branches: [main] }

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with: { node-version: 24, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc -b
      - run: npx vitest run --coverage
      - run: npm run build
      - uses: actions/upload-artifact@v7
        with:
          name: dist
          path: dist
          retention-days: 3

  e2e:
    runs-on: ubuntu-latest
    needs: check
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with: { node-version: 24, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v7
        if: failure()
        with: { name: playwright-report, path: playwright-report/ }
```

Deployment itself is usually done by the hosting platform's Git integration (so the workflow doesn't need your deploy token), with branch protection requiring your CI checks to pass before merge.

---

## 11. A release checklist

- [ ] CI is green on the pull request, and a reviewer approved
- [ ] The preview deployment was clicked through (including a hard refresh on a deep link)
- [ ] Env vars exist for production (names match `.env.example`)
- [ ] No secrets in the bundle (search `dist/` for a known key)
- [ ] SPA fallback works (`/some/deep/route` after refresh)
- [ ] Error tracking is on, with source maps
- [ ] You know how to roll back
- [ ] After deploying: smoke test production, then watch errors for a few minutes
- [ ] Release notes written / tag created

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| `npm install` in CI | Non-deterministic installs. Use `npm ci` |
| Not committing the lockfile | Different dependencies on every machine |
| CI runs but isn't required on `main` | People merge red builds |
| Ignoring flaky tests | Everyone learns to ignore failures |
| Secrets in the repo or in `VITE_*` / `NEXT_PUBLIC_*` | Public to the world |
| Forgetting the SPA fallback | Refresh on `/route` returns 404 |
| Wrong Node version between local and CI/host | "Works on my machine" builds |
| Wrong `base` path on GitHub Pages | Blank page, 404 for assets |
| Over-broad `permissions` or `pull_request_target` misuse | A malicious PR could steal secrets or write to the repo |
| Unpinned third-party actions | Supply-chain risk |
| Deploying with no way to roll back | A bad release becomes an outage |
| No monitoring | You learn about outages from users |
| Giant, rare releases | Hard to debug and risky. Ship small, often |
| Slow CI (10+ minutes) | People stop waiting for it. Cache, parallelize, trim |

---

## Key takeaways

- CI runs the same checks, in a clean environment, on every change. CD makes releasing routine.
- A good CI workflow: checkout → setup Node with cache → `npm ci` → lint → type-check → test → build.
- Branch protection with required checks makes CI meaningful.
- Connect your repo to a host for production deploys on `main` and preview URLs on pull requests.
- Single-page apps need a fallback to `index.html`. Public env vars are public, so keep secrets on the server.
- Make deploys reversible, monitor errors and uptime, and automate dependency and security updates.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Then start your **final project**: pick an idea, plan it together, and build it as a team using pull requests and code review (see the main [README](../../README.md)).
4. Optional: continue with **Module 7, Beyond the browser**: [React Router framework mode](../25-react-router-framework-mode/README.md), [mobile apps with Expo](../26-mobile-apps-with-expo/README.md), and [desktop apps with Electron](../27-desktop-apps-with-electron/README.md).
