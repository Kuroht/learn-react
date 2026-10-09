# Bonus 01 Project: Break It, Then Fix It

You will build a small React app that is **intentionally vulnerable**, attack it the way a pentester would, write up your findings, and then fix every one. Finally you'll audit one of your earlier projects with the security checklist.

> **Last verified:** October 2026, against the OWASP Top 10:2025.

---

## Ground rules

- This app is for **your own computer only**. Don't deploy it anywhere public, and don't put it on a hosting service.
- Only attack apps that you own or run locally for practice.
- Never reuse real passwords or real personal data in the lab app.

---

## Brief

Build **Vulnerable Notes**, a tiny app with a note list and a profile link. Plant specific bugs on purpose, find them from the attacker's side, document them, then fix them and prove the fixes work.

Every stage ends with a **checkpoint**.

---

## Getting started

```bash
cd lessons/bonus-01-security/project
npm create vite@latest vulnerable-notes -- --template react-ts
cd vulnerable-notes
npm install
npm run dev
```

(Check [react.dev/learn/installation](https://react.dev/learn/installation) for the current way to start a project.)

Work in your own branch: `git checkout -b yourname/bonus-security`

---

## Stage 1: Build the vulnerable app

Build a page with:

- A form to add a note (title and text), kept in `useState`
- A list that shows the notes
- A "My website" field on a profile section that renders a link

**Plant these bugs on purpose** (add a code comment `// VULN 1` and so on at each place so you can find them later):

| # | Bug | How to plant it |
|---|-----|-----------------|
| 1 | Stored XSS | Render each note's text with `dangerouslySetInnerHTML={{ __html: note.text }}` |
| 2 | Unsafe URL | Render the profile website as `<a href={website}>` with no checks |
| 3 | Secret in the bundle | Add `VITE_FAKE_API_KEY=lab-only-not-real` to `.env` and print it with `console.log` |
| 4 | Fake access control | Show a "Delete all notes" button only when `isAdmin` is `true`, where `isAdmin` is a variable at the top of `App.tsx` |
| 5 | Leaky errors | Wrap the note save in a `try/catch` that renders `error.stack` on screen when something fails |

**Checkpoint:** the app runs, notes can be added, and each of the five bugs exists.

---

## Stage 2: Attack it

Act as the tester. For each bug, write down what you did and what happened.

- [ ] **Bug 1:** add a note containing `<img src=x onerror="alert('xss')">`. Reload. Does the script run?
- [ ] **Bug 2:** set the website to `javascript:alert('link')` and click the link.
- [ ] **Bug 3:** run `npm run build`, then search `dist/assets/` for `lab-only-not-real`. Also find it in DevTools.
- [ ] **Bug 4:** without editing the source file, find a way to make the admin-only action run (hint: think about what the browser lets you do to the page and its state).
- [ ] **Bug 5:** make saving fail (for example, throw an error on purpose when the title is empty) and read what's shown.

**Checkpoint:** you have a findings list of five items, each with the steps you used.

---

## Stage 3: Write the findings

For each bug, write a short report using this template, in a file called `FINDINGS.md`:

```
Title:
Severity:        Low / Medium / High
OWASP category:  (for example A05: Injection)
Where:
Steps to reproduce:
Result:
Cause:
Fix:
```

Match each bug to its OWASP Top 10:2025 category from the lesson.

**Checkpoint:** `FINDINGS.md` has five complete entries.

---

## Stage 4: Fix everything

Fix each bug the right way, and **retest** after each one.

- [ ] **Bug 1:** render notes as text (`{note.text}`). Then, to practice, also try `DOMPurify.sanitize` on a version that really needs HTML.
- [ ] **Bug 2:** add a `safeUrl` function that allows only `http:` and `https:`.
- [ ] **Bug 3:** remove the key from the frontend. Write a short comment explaining what you'd do in a real app (a backend that holds the secret).
- [ ] **Bug 4:** write down, in `FINDINGS.md`, why the button is only a UX feature and what a real server would check. You can't truly fix this in a frontend-only app, and that's the lesson.
- [ ] **Bug 5:** show a generic message to the user and send the details only to `console.error` (or leave a `// TODO: send to logging service`).

Then add ESLint rules `react/no-danger` and `react/jsx-no-script-url` and make sure the project passes lint.

Update each finding in `FINDINGS.md` with **Retested: yes** once it's fixed.

**Checkpoint:** all five attacks from Stage 2 no longer work, and `npm run lint` passes.

---

## Stage 5: Audit an earlier project

Pick one of your own lesson projects (for example the profile card, the weather app, or the shopping cart) and go through the security checklist from the lesson. For each item, mark pass, fail, or not applicable, and fix anything that fails.

Also run:

```bash
npm audit
```

**Checkpoint:** a short `SECURITY-AUDIT.md` in that project listing the checklist results and what you changed.

---

## Stage 6 (optional): Practice on a real vulnerable lab

Run **OWASP Juice Shop** locally and solve two or three of its challenges using only your browser's DevTools. Follow the instructions in its README for the current way to run it, and make sure it's reachable **only from your own machine**.

Rules: only attack your local copy, and write a finding for each challenge you solve, using the same template.

**Checkpoint:** two or three findings written up.

---

## Requirements checklist

**Must have**

- [ ] Vulnerable Notes with all five planted bugs
- [ ] `FINDINGS.md` with five complete reports, each matched to an OWASP category
- [ ] All five fixed and retested
- [ ] ESLint `react/no-danger` and `react/jsx-no-script-url` enabled
- [ ] `SECURITY-AUDIT.md` for one earlier project
- [ ] `npm run build` and `npm run lint` pass

**Nice to have**

- [ ] A Content Security Policy tried on a local preview server
- [ ] Zod validation for data coming into the app
- [ ] Juice Shop challenges (Stage 6)
- [ ] Swap findings with a friend: attack **their local lab app on their screen share**, never over the internet, and fix each other's reports

---

## Hints

<details>
<summary>The XSS alert doesn't run</summary>

Modern browsers don't run `<script>` tags inserted through `innerHTML`, which is why payloads use event handlers like `onerror` on an image. If nothing runs, check the browser console for errors, and make sure you're using `dangerouslySetInnerHTML` and not `{note.text}`.
</details>

<details>
<summary>How do I find a string in the built files?</summary>

Run the build, then use your editor's "Find in Files" on the `dist/` folder, or in a terminal use `grep -r "lab-only-not-real" dist/` (on Windows PowerShell: `Select-String -Path dist\* -Pattern "lab-only-not-real" -Recurse`).
</details>

<details>
<summary>Bug 4: how can an attacker become admin?</summary>

Anything in the browser is under the user's control: they can edit scripts in DevTools, change local state with React DevTools, or skip the UI and call the API directly. That's why the server must make the decision.
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages (one per fixed bug is a nice habit).
3. Open a pull request titled `Bonus security: yourname`.
4. Ask a friend to review `FINDINGS.md` and the fixes. A good review asks: could I still reproduce any of these?

---

## Done when

- All five attacks work in the vulnerable version, and none work after your fixes
- `FINDINGS.md` and `SECURITY-AUDIT.md` are complete
- `npm run build` and `npm run lint` pass
- Your PR is open and a friend has reviewed it
