# Lesson 24: Exercises

Use a practice repository on GitHub (a fork of this repo, or a throwaway repo with one of your projects). Try each one **before** reading the answer. Never put real secrets in a practice repo.

---

## Exercise 1: Read the workflow

```yaml
name: CI
on:
  pull_request:
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm install
      - run: npm run build
      - run: npm test
```

1. When does it run?
2. List four improvements you would make
3. If `npm test` fails, does the pull request show green or red?

<details>
<summary>Answers</summary>

1) On every pull request update (not on direct pushes to `main`). 2) Use `npm ci`, enable `cache: npm`, add `npm run lint` and a type-check, add `concurrency` and `permissions: contents: read`, add `timeout-minutes`, and run tests before the (slower) build. 3) Red: a failing step fails the job.
</details>

---

## Exercise 2: Your first workflow

1. Create `.github/workflows/ci.yml` for one of your projects
2. Open a pull request. Watch the **Actions** tab and the PR checks
3. Break something on purpose (a lint error, a type error, a failing test). Does CI catch it? Read the log
4. Fix it and see the check turn green

---

## Exercise 3: Make it fast

1. Note the total run time of your workflow
2. Add dependency caching (`cache: npm`). Compare the second run with the first
3. Split lint, type-check, test, and build into parallel jobs. How long does the PR take now?
4. Add `concurrency` with `cancel-in-progress` and push twice in a row. What happens to the first run?

---

## Exercise 4: Matrix and paths

For this repo's layout (many independent projects under `lessons/`):

1. Write a workflow that runs `lint` and `build` only for the lesson folder(s) changed in a PR (use `paths:` filters on separate workflows, or a matrix)
2. Run it for two folders using `strategy.matrix`
3. What are the trade-offs of one workflow per project vs one matrix workflow?

---

## Exercise 5: Branch protection

1. Add a rule on `main` that requires a pull request and a passing `check` job
2. Try to push directly to `main`. What happens?
3. Open a PR with a failing check. Can you merge it? Is the button disabled?
4. Why does requiring "up to date with main" matter when two PRs are open at once?

---

## Exercise 6: Deploy a static app

1. Deploy a Vite project to Vercel, Netlify, or Cloudflare Pages by importing the GitHub repo (set the **root directory** correctly)
2. Add a client-side route (Lesson 14), deploy, then refresh on a deep link. Does it 404?
3. Add the SPA fallback for your host and redeploy
4. Open a pull request. Where does the preview URL appear?

---

## Exercise 7: Environment variables

1. Add `VITE_API_URL` in the host dashboard for Production and a different value for Preview
2. Read it with `import.meta.env.VITE_API_URL` and display it on a page
3. Deploy and check that both environments show their own value
4. Search the built `dist/` files for the value. What does this tell you about what belongs in a `VITE_` variable?
5. Validate env vars with Zod at startup so a missing variable fails the build

---

## Exercise 8: Secrets in CI

1. Add a fake secret `DEMO_SECRET` under Settings → Secrets and variables → Actions
2. Use it in a step (`env: DEMO_SECRET: ${{ secrets.DEMO_SECRET }}`) and print its **length** (not the value)
3. Try to `echo` the value. What does the log show?
4. Open a PR **from a fork** (or reason about it). Is the secret available? Why is that a good thing?

---

## Exercise 9: Rollback drill

1. Deploy a version that works, then deploy one with an obvious bug
2. Roll back using your host's "promote previous deployment" feature (or `git revert` and redeploy)
3. Time how long it took. How would you make it faster?
4. Write a three-line rollback runbook for your project

---

## Exercise 10: Dependabot and audit

1. Add `.github/dependabot.yml` for npm and GitHub Actions
2. Look at the first pull request Dependabot opens. Does CI run on it? Would you merge it?
3. Run `npm audit`. Pick one finding and decide: real risk for your app or not? Why?
4. Pin one third-party action to a commit SHA. Why does this reduce supply-chain risk?

---

## Exercise 11: Monitoring

1. Create a free Sentry (or similar) project and add its SDK to a small app
2. Throw a test error in a button handler and in a render path (with your Lesson 18 boundary)
3. Find both in the dashboard. Is the stack trace readable? What would make it better (source maps)?
4. Set up an uptime monitor for your deployed URL and make it alert you by email

---

## Exercise 12: Release

1. Tag your project `v0.1.0` and create a GitHub Release with notes
2. Make a fix with a `fix:` commit message and bump to `v0.1.1`
3. Explain what a breaking change would do to the version number under SemVer

---

## Check yourself

You're ready for the project if you can answer these without looking:

- What's the difference between CI and CD?
- Why `npm ci` instead of `npm install` in CI?
- What do `on:`, `jobs`, `steps`, and `runs-on` mean?
- Why require status checks on `main`?
- What does a preview deployment give your reviewers?
- Why do SPAs need a fallback to `index.html`?
- Which environment variables end up in the browser, and what does that imply for secrets?
- How would you roll back a bad release?
- Name three things you'd monitor in production.
