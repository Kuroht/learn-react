# Bonus 01: Web Security for React (OWASP) — Optional

**Goal:** understand the most common web security problems, how they show up in React apps, how to prevent them, and how to test your own apps for them.

**Time:** about 3 to 4 hours

**Prerequisites:** Lessons 01 to 16 (components, hooks, data fetching, forms). Lesson 17 and the routing lesson help but are not required.

> **Last verified:** October 2026, against the **OWASP Top 10:2025**. Security guidance changes often. Check [owasp.org/Top10](https://owasp.org/Top10/) for the current list and tell the group if it has changed.

---

## Ground rules (read first)

Security testing is only legal and ethical when you have **permission**.

- Only test apps that **you own**, apps **you run locally** for practice, or targets that **explicitly authorize** testing (a signed scope or a public bug bounty with rules).
- **Never** point scanners or exploit attempts at a friend's deployed site, a company site, or any site you don't own without written permission.
- Practice on deliberately vulnerable apps running on your own computer (see Section 5).
- If you ever find a real vulnerability in someone else's app, report it privately and responsibly. Don't exploit it or share it publicly.

---

## What you will learn

- The OWASP Top 10:2025 and what each item means for a React app
- Why the browser is untrusted, and what that means for frontend code
- How XSS happens in React, and how to prevent it
- How to handle tokens, secrets, and environment variables safely
- How to keep your npm dependencies safe
- A beginner-friendly pentest method, and the tools to use
- A security checklist for your own projects

---

## 1. The big idea: the browser is untrusted

Everything that runs in the browser can be inspected and changed by the person using it. Your React code, your state, your `localStorage`, and your network requests are all visible in DevTools, and anyone can send requests to your API without using your app at all.

So:

> **Frontend checks are for user experience. Real security happens on the server.**

Hiding an "Admin" button, blocking a route in React Router, or validating a form in the browser makes the app *nicer*. None of it stops an attacker. The server must check **who you are** and **what you're allowed to do** on every request.

React gives you some protection for free, mostly against XSS. The rest is up to you and your backend.

---

## 2. The OWASP Top 10:2025, applied to React

OWASP (the Open Worldwide Application Security Project) publishes a list of the most critical web application security risks. Here is each item and what it means for you.

### A01: Broken Access Control

Users can do things they shouldn't, such as read someone else's data or reach admin features.

- **React angle:** route guards and hidden buttons are **UX only**. The API must enforce permissions.
- **Classic bug:** changing `/api/orders/123` to `/api/orders/124` and seeing another user's order (called IDOR).
- **Fix:** the server checks that the logged-in user owns or may access each resource. Never trust IDs, roles, or `isAdmin` flags sent from the client.

### A02: Security Misconfiguration

Insecure defaults, debug features left on, missing headers, or secrets exposed.

- **React angle:** **everything in your bundle is public.** In Vite, any env var starting with `VITE_` is embedded in the JavaScript that every visitor downloads.
- **Fix:**
  - Never put API secrets, private keys, or database URLs in frontend env vars.
  - Don't ship source maps to production unless you intend to.
  - Set security headers on your host (see Section 4).
  - Turn off debug features and verbose errors in production.

### A03: Software Supply Chain Failures

Problems in the code you depend on: vulnerable packages, malicious packages, or a compromised build pipeline.

- **React angle:** a typical React app pulls in hundreds or thousands of npm packages.
- **Fix:** see Section 4. Commit your lockfile, run `npm audit`, review new dependencies, and use Dependabot or a similar tool.

### A04: Cryptographic Failures

Sensitive data isn't protected in transit or at rest.

- **React angle:** use HTTPS everywhere, never store passwords or sensitive data in the browser, and never invent your own encryption.
- **Fix:** let the server handle hashing and encryption with well-tested libraries.

### A05: Injection

Untrusted data gets treated as code. This includes **XSS** (running attacker JavaScript in your page) and SQL injection (on the server).

- **React angle:** React escapes text for you, but there are escape hatches (Section 3).
- **Fix:** don't bypass React's escaping, sanitize HTML when you must render it, validate URLs, and use a Content Security Policy.

### A06: Insecure Design

The app is built without thinking about abuse. No amount of clean code fixes a design that allows it.

- **Example:** a password reset that reveals whether an email exists, or an endpoint with no rate limit.
- **Fix:** do a quick **threat model** before building a feature. Ask "how could someone misuse this?" (Section 6).

### A07: Authentication Failures

Weak login, session handling, or credential storage.

- **React angle:** where you store the login token matters (Section 4).
- **Fix:** use a proven auth provider or framework instead of writing your own, enforce strong sessions, and log out properly.

### A08: Software or Data Integrity Failures

Trusting code or data without checking that it's what you expect.

- **React angle:** scripts loaded from a CDN, and API data you assume has the right shape.
- **Fix:** use Subresource Integrity (SRI) for third-party scripts and **validate API responses with Zod** instead of trusting them.

### A09: Security Logging and Alerting Failures

Nobody notices attacks because nothing is recorded.

- **React angle:** mostly a backend concern, but the frontend can report errors safely. **Don't log secrets, tokens, or personal data** to the console or to an error tracker.

### A10: Mishandling of Exceptional Conditions

The app behaves unsafely when something goes wrong.

- **React angle:** unhandled promise rejections, crashes that expose stack traces, and failing "open" (allowing access when an error occurs).
- **Fix:** use error boundaries, handle every failed request, show safe user-facing messages, and **fail closed**: if a permission check errors, deny access.

---

## 3. XSS in React

Cross-site scripting (XSS) means an attacker gets their JavaScript to run inside your page, where it can steal data and act as the user.

### What React protects you from

React **escapes** values you put in JSX:

```tsx
const comment = '<img src=x onerror="alert(1)">';

return <p>{comment}</p>;
// Shows the literal text. The script does NOT run.
```

### Where React does NOT protect you

**1. `dangerouslySetInnerHTML`**

The name is a warning. It inserts raw HTML:

```tsx
// vulnerable if `html` comes from a user or an API you don't control
<div dangerouslySetInnerHTML={{ __html: html }} />
```

Fix: sanitize first, with a well-maintained library such as DOMPurify:

```tsx
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
```

Best of all, avoid it. Rendering Markdown? Use a library that outputs React elements rather than raw HTML strings.

**2. User-controlled URLs**

```tsx
// vulnerable: a link like javascript:alert(1) may run code when clicked
<a href={user.website}>Website</a>
```

Fix: only allow safe protocols.

```tsx
function safeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? url : '#';
  } catch {
    return '#';
  }
}

<a href={safeUrl(user.website)} rel="noopener noreferrer">Website</a>
```

**3. Direct DOM access**

Setting `element.innerHTML = userInput` through a `ref` or `document.querySelector` skips React's escaping entirely. Avoid it.

**4. `eval`, `new Function`, and similar**

Never run strings as code.

**5. Server-rendered data inside scripts**

If you ever render JSON into a `<script>` tag (common with SSR frameworks), make sure it's properly escaped. Frameworks like Next.js handle this, so prefer their built-in data passing.

### A second line of defense: Content Security Policy

A Content Security Policy (CSP) is a response header that tells the browser which scripts it may run. A good CSP can stop an injected script even if one slips through.

```
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'
```

You set this on the server or hosting platform (not in React code), and you'll usually need to adjust it for the services your app uses. Start strict and loosen only what's needed.

### Catch it early with a linter

`eslint-plugin-react` includes rules that flag risky patterns, such as `react/no-danger` (warns on `dangerouslySetInnerHTML`) and `react/jsx-no-script-url` (warns on `javascript:` URLs). Turn them on.

---

## 4. Practical hardening for React apps

### Secrets and environment variables

| Where | Visible to users? |
|-------|-------------------|
| Vite `VITE_*` env vars | **Yes**, they end up in the bundle |
| Code in `src/` | **Yes** |
| Backend env vars | No |

Rule: if a value must stay secret, **it must never be in the frontend.** Call your own backend, which holds the secret and talks to the third-party service.

Also add `.env` files to `.gitignore`, and if you ever commit a secret, **rotate it** (get a new one). Removing it from the latest commit isn't enough, because Git history keeps it.

### Where to keep login tokens

| Option | Risk |
|--------|------|
| `localStorage` / `sessionStorage` | Any XSS can read the token |
| In-memory variable | Lost on refresh, but harder to steal |
| `HttpOnly`, `Secure`, `SameSite` cookie set by the server | JavaScript can't read it, so XSS can't steal it. You must handle CSRF (SameSite helps) |

A common recommendation is an `HttpOnly` cookie issued by your backend. For learning projects, `localStorage` is fine **as long as you know the trade-off**. Don't use it for anything real.

### Dependencies

```bash
npm audit                  # list known vulnerabilities in your dependencies
npm ci                     # install exactly what's in the lockfile (use in CI)
```

Habits that help:

- Commit `package-lock.json`.
- Before adding a package, check its popularity, maintenance, and name (typosquatting is real: `react-domm` is not `react-dom`).
- Turn on Dependabot (or similar) in your GitHub repo for update pull requests.
- Prefer fewer dependencies.
- Be wary of packages that run install scripts you don't understand.

### Validate data you receive

Don't assume an API returns what your types say. TypeScript types disappear at runtime. Use Zod to check:

```tsx
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  website: z.string().url().optional(),
});

const user = UserSchema.parse(await response.json()); // throws if the shape is wrong
```

Remember: validating on the client improves UX, and the **server must validate too**.

### Security headers (set on your host or server)

| Header | Purpose |
|--------|---------|
| `Content-Security-Policy` | Limits which scripts and resources can load |
| `X-Content-Type-Options: nosniff` | Stops the browser guessing file types |
| `Strict-Transport-Security` | Forces HTTPS |
| `frame-ancestors` (in CSP) or `X-Frame-Options` | Prevents clickjacking by blocking your site from being framed |
| `Referrer-Policy` | Limits what URL info is shared with other sites |

Your hosting platform (Vercel, Netlify, nginx) has a way to set these. Check its docs.

### Safe error handling

```tsx
// bad: leaks internals
<p>{error.stack}</p>

// good: safe message for the user, details to your logger
<p>Something went wrong. Please try again.</p>
```

---

## 5. Pentesting a React app (for beginners, on your own targets)

A **penetration test** is an authorized, structured attempt to find security problems before real attackers do. Start with the method, then the tools.

### The method

1. **Scope:** write down what you're allowed to test. For a lab app, that's "this app on my machine".
2. **Recon:** learn how the app works. Browse it, open DevTools, read the Network tab, find the API endpoints and what each request sends.
3. **Map the attack surface:** every input (forms, URL params, headers, uploads) and every feature that depends on identity or permissions.
4. **Test:** try each risk from Section 2 against each part of the surface.
5. **Record findings:** what you did, what happened, how serious it is, and how to fix it.
6. **Fix and retest:** confirm the fix actually works.

### What to test in a React app

- **XSS:** put test text like `<img src=x onerror=alert(1)>` into every input, then see where it shows up. Does anything render it as HTML?
- **Links and URLs:** can a user-supplied URL be `javascript:...`?
- **Access control:** log in as user A, then change IDs in requests to see user B's data. Try admin API calls as a normal user.
- **Secrets in the bundle:** open DevTools → Sources (or search the built JS in `dist/`) for `key`, `secret`, `token`, and `password`.
- **Storage:** look in Application → Local Storage and Cookies. What's stored, and is it sensitive?
- **Error handling:** send bad input and watch for stack traces or internal messages.
- **Dependencies:** run `npm audit`.
- **Headers:** check the response headers in the Network tab.

### Tools

| Tool | Use |
|------|-----|
| Browser DevTools | Inspect the DOM, network, storage, and bundle. Your main tool. |
| `npm audit` | Known vulnerabilities in dependencies |
| ESLint security rules | Catch risky React patterns while coding |
| Lighthouse (in Chrome DevTools) | Quick best-practices check |
| [OWASP ZAP](https://www.zaproxy.org/) | Free proxy and scanner for web apps |
| [Burp Suite Community](https://portswigger.net/burp/communitydownload) | Intercept and modify requests |

Use ZAP or Burp **only** against your own local apps or authorized labs. Automated scanners can send a lot of traffic.

### Safe places to practice

- **OWASP Juice Shop:** a deliberately insecure web app made for learning, with built-in challenges. Run it locally and bind it to your own machine only. Check its README for the current instructions: [github.com/juice-shop/juice-shop](https://github.com/juice-shop/juice-shop).
- **Your own "Vulnerable Notes" app** from this lesson's project. You'll build it with planted bugs, attack it, and fix it.
- **PortSwigger Web Security Academy:** free, guided labs in your browser, with no need to attack anything real.

### Writing a finding

Use this template so reports are clear:

```
Title:        Stored XSS in the comment list
Severity:     High
Where:        /notes page, "text" field
Steps:        1. Add a note containing <img src=x onerror=alert(1)>
              2. Reload the page
Result:       The script runs for every visitor
Cause:        Notes are rendered with dangerouslySetInnerHTML
Fix:          Render as text, or sanitize with DOMPurify
Retested:     Yes, no longer reproducible
```

---

## 6. Threat modeling in 10 minutes

Before building a feature, answer these:

1. **What are we protecting?** (user data, accounts, money)
2. **Who might attack, and what do they want?**
3. **Where does untrusted data enter?** (forms, URLs, APIs)
4. **What's the worst thing that could happen if each of those is abused?**
5. **How do we prevent it, and how will we notice if it happens?**

It sounds formal, but a few lines in your pull request description is enough.

---

## A security checklist for your React projects

- [ ] No secrets in `VITE_*` variables or anywhere in `src/`
- [ ] `.env` is in `.gitignore`
- [ ] No `dangerouslySetInnerHTML`, or its input is sanitized
- [ ] User-supplied URLs are checked before going into `href` or `src`
- [ ] API responses are validated (Zod)
- [ ] Authorization is enforced by the **server**, not only by hidden UI
- [ ] Tokens are stored with a known trade-off (prefer `HttpOnly` cookies)
- [ ] `npm audit` is clean, or each remaining issue is understood
- [ ] Lockfile is committed
- [ ] Error boundaries exist, and error messages shown to users are generic
- [ ] No secrets or personal data in `console.log`
- [ ] Security headers are set in production
- [ ] ESLint security-related rules are enabled

---

## Key takeaways

- The browser is untrusted. Real security checks belong on the server.
- React escapes text by default. The risks are `dangerouslySetInnerHTML`, unsafe URLs, and direct DOM access.
- Anything in your frontend bundle is public, so never put secrets there.
- Your dependencies are part of your attack surface.
- Pentest only what you own or are authorized to test, using a clear method and written findings.
- Fix, then retest.

---

## Further reading

- [OWASP Top 10](https://owasp.org/Top10/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [OWASP Juice Shop](https://github.com/juice-shop/juice-shop)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [React docs: `dangerouslySetInnerHTML`](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html)

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
