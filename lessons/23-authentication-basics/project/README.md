# Lesson 23 Project: Protected Dashboard

Build a Next.js dashboard with login, sessions, role-based access, and ownership checks. Then attack it yourself and write up what you found.

> **Last verified:** October 2026. This project builds the core pieces by hand **for learning**. For a real product use a maintained auth library or service. Check the docs of Next.js ([`cookies`](https://nextjs.org/docs/app/api-reference/functions/cookies), middleware/proxy conventions) and of any library you choose.

---

## Brief

A small "team notes" app:

- Visitors can see a landing page and sign up / log in
- Logged-in users have a **dashboard** listing **their own notes** (create, edit, delete)
- **Admins** also have an admin page that lists all users and can change roles or disable accounts
- Optional: "Sign in with GitHub" via OAuth

The point is not the notes, it's building the authentication and authorization correctly, understanding every moving part, and verifying it.

> Use a throwaway local database (SQLite with Prisma or Drizzle is simplest), or a JSON file for the data layer if you prefer. Never use real passwords or real personal data.

Every stage ends with a **checkpoint**: something you can demonstrate.

---

## Getting started

```bash
cd lessons/23-authentication-basics/project
npx create-next-app@latest starter     # TypeScript, Tailwind, src/, App Router
cd starter
npm install zod argon2                 # or bcrypt
npm install @prisma/client && npm install -D prisma   # or another data layer
npm run dev
```

Suggested structure:

```
src/
├── app/
│   ├── (public)/ page.tsx, login/page.tsx, signup/page.tsx
│   ├── dashboard/ layout.tsx, page.tsx, notes/...
│   └── admin/ page.tsx
├── features/
│   ├── auth/ (session.ts, password.ts, actions.ts, schemas.ts, components/)
│   └── notes/ (queries.ts, actions.ts, components/)
└── lib/ (db.ts, env.ts)
```

Create `.env.example` (committed) and `.env.local` (ignored): `SESSION_SECRET`, `DATABASE_URL`.

Work in your own branch: `git checkout -b yourname/lesson-23`

---

## Stage 1: Data model and passwords

- [ ] Models: `User` (`id`, `email` unique, `passwordHash`, `role` as `'user' | 'admin'`, `disabled`, `createdAt`), `Session` (`id`, `userId`, `expiresAt`), `Note` (`id`, `ownerId`, `title`, `body`)
- [ ] `password.ts` with `hashPassword` and `verifyPassword` (Argon2id or bcrypt)
- [ ] Zod schemas for signup and login inputs (email format, password minimum 10 characters, max 128)
- [ ] A seed script creating one admin and one normal user (passwords from env, not hard-coded in the repo)
- [ ] Validate env variables at startup with Zod (`lib/env.ts`), so the app fails fast if a secret is missing
- [ ] **Never** log passwords or hashes

**Checkpoint:** a script hashes and verifies a password; a wrong password fails.

---

## Stage 2: Sessions

In `features/auth/session.ts` (mark it `server-only`):

- [ ] `createSession(userId)`: generate a random id with `crypto.randomBytes(32)` (store only a **hash** of it in the DB, so a DB leak doesn't leak live sessions), set `expiresAt` (e.g., 7 days)
- [ ] Set the cookie: `HttpOnly`, `Secure` (in production), `SameSite=Lax`, `Path=/`, a `Max-Age`
- [ ] `getCurrentUser()`: read the cookie, look up the session, check expiry and `disabled`, and return the user or `null` (wrap with `cache` from React so one request does one lookup)
- [ ] `requireUser()` and `requireRole('admin')`: redirect to `/login` or return a 403 page
- [ ] `destroySession()`: delete the DB record **and** clear the cookie
- [ ] Rotate to a **new** session id on login (never reuse a pre-login one)

**Checkpoint:** inspect the cookie in DevTools. It has `HttpOnly`, `SameSite`, and an unguessable value.

---

## Stage 3: Signup, login, logout

- [ ] `/signup` and `/login` forms (client components with `useActionState`) calling Server Actions
- [ ] Actions validate with Zod, then:
  - Signup: reject duplicate emails **without revealing** existence in the login flow, hash the password, create the user, create a session, and redirect
  - Login: verify the password with a **generic** error ("Invalid email or password"), and do the hash comparison even when the user doesn't exist (a dummy hash), to keep timing similar
- [ ] A simple **rate limit** on login (e.g., 5 attempts per 15 minutes per email + IP, in memory or a DB table), returning a friendly message
- [ ] Logout is a Server Action that destroys the session, and redirects to `/`
- [ ] Forms use correct `autocomplete` values and a show/hide password toggle
- [ ] **Redirect back:** `?next=/dashboard/notes` is honored after login, but only if it's a safe relative path (`isSafeRedirect`)
- [ ] Accessible errors (Lesson 18)

**Checkpoint:** you can sign up, log out, log in, and be returned to the page you wanted. Wrong credentials give one generic message.

---

## Stage 4: Protect pages and data

- [ ] `/dashboard` and everything under it call `requireUser()` **in the page and in the data functions**, not only in the layout
- [ ] `notes/queries.ts`: every query takes the current user and filters by `ownerId` in the database query itself
- [ ] Logged-out visitors are redirected to `/login?next=...`
- [ ] An optional `middleware`/proxy file redirects logged-out users away from `/dashboard` and `/admin` as a **convenience only**. Add a comment stating that the real checks are in the data layer
- [ ] Header shows the user's email and a logout button when logged in, "Log in" otherwise
- [ ] Disabled users can't use existing sessions

**Checkpoint:** while logged out, request `/dashboard` and each data endpoint directly. All are denied.

---

## Stage 5: Notes with ownership

- [ ] Create, edit, and delete notes via Server Actions
- [ ] **Every** action: `requireUser()` → Zod-validate input → check the note belongs to the user (use `where: { id, ownerId: user.id }`) → mutate → `revalidatePath`
- [ ] Never accept `ownerId` from the form
- [ ] "Not found" is returned both when the note doesn't exist and when it belongs to someone else
- [ ] Pending, error, and empty states
- [ ] Escape output: render note bodies as plain text (no `dangerouslySetInnerHTML`)

**Checkpoint:** log in as user A, copy a note id, log in as B in another browser, and try to read or edit A's note by its id. Both fail.

---

## Stage 6: Roles and the admin area

- [ ] `Role` as a union type, kept only on the server-side user record
- [ ] `/admin` calls `requireRole('admin')`. Non-admins get a 403 page (or 404)
- [ ] Admin can list users, change a role, and disable/enable an account
- [ ] The admin actions re-check the role themselves (not just the page)
- [ ] An admin cannot demote or disable **themselves** (avoid locking everyone out), and there's always at least one admin
- [ ] Changing a role or disabling a user **invalidates that user's existing sessions**
- [ ] UI hides the admin link for non-admins (cosmetic only, and you know it)

**Checkpoint:** as a normal user, call the admin Server Action directly (from the browser's network tab or a script). It's rejected.

---

## Stage 7: Security hardening

- [ ] Security headers in `next.config.ts` (`Content-Security-Policy` as strict as you can manage, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`/`X-Frame-Options`)
- [ ] Confirm the cookie is `Secure` in production and uses the `__Host-` prefix if possible
- [ ] Check CSRF: Server Actions check the Origin by default, and your cookie is `SameSite=Lax`. Verify a cross-site form post is rejected
- [ ] Session expiry is enforced on the server, and an expired session redirects to login with a message
- [ ] A "log out everywhere" button that deletes all of the user's sessions
- [ ] `.env.local` is gitignored. Run a secrets scan (`gitleaks detect`), and confirm no secret is in `NEXT_PUBLIC_*` or the client bundle

---

## Stage 8: Attack your own app

Create `SECURITY-REVIEW.md` and try each of these. Record: what you tried, what happened, and the fix if it worked:

- [ ] Visit protected URLs while logged out
- [ ] Call every Server Action/route handler without a session (use `curl` or the DevTools network tab → "Copy as fetch")
- [ ] Change ids in URLs and request bodies (IDOR)
- [ ] Send `role: 'admin'` or `ownerId` in a form body
- [ ] Reuse an old session id after logout
- [ ] Use a session after the user is disabled
- [ ] Brute-force the login (does rate limiting kick in?)
- [ ] Compare login error messages and response times for existing vs missing emails
- [ ] Try `?next=https://evil.example` and `//evil.example`
- [ ] Inject `<img src=x onerror=alert(1)>` into a note
- [ ] Inspect cookies and `localStorage` for anything sensitive
- [ ] Check the page source and the JS bundle for secrets

**Checkpoint:** every attempt is either blocked, or documented and fixed.

---

## Stage 9: (Optional) OAuth with GitHub

- [ ] Register a GitHub OAuth app (callback `http://localhost:3000/api/auth/github/callback`)
- [ ] `/api/auth/github` route generates `state` (stored in a short-lived `HttpOnly` cookie) and redirects to GitHub
- [ ] The callback route verifies `state`, exchanges the `code` **on the server**, fetches the user's profile/email, and finds or creates a user
- [ ] Only link to an existing account if GitHub reports the email as **verified**
- [ ] Create your normal session, and redirect
- [ ] The client secret lives only in server env vars

---

## Stage 10: Check your work

```bash
npm run build
npm run lint
```

Both should pass. No `any`.

Finally, reflect in `SECURITY-REVIEW.md`: what would you still need before putting this in production (MFA, email verification, password reset, audit logs, monitoring, a maintained auth library)?

---

## Requirements checklist

**Must have**

- [ ] Passwords hashed with Argon2id or bcrypt; generic login errors; a login rate limit
- [ ] Server-side sessions in an `HttpOnly`, `SameSite` (and `Secure` in production) cookie; new session on login; full invalidation on logout
- [ ] `requireUser` and `requireRole` used in pages **and** in every Server Action/data function
- [ ] Ownership enforced in the database query (`ownerId`)
- [ ] Roles stored on the server, never accepted from the client
- [ ] Safe redirect-back
- [ ] Zod validation on every action input
- [ ] Security headers configured; no secrets in the client
- [ ] `SECURITY-REVIEW.md` documenting your attack attempts and fixes
- [ ] No `any`
- [ ] `npm run build` and `npm run lint` pass

**Nice to have**

- [ ] GitHub OAuth (Stage 9)
- [ ] Email verification and password reset flows (with a console "email" in development)
- [ ] TOTP-based two-factor authentication
- [ ] Passkeys (WebAuthn) with a library such as SimpleWebAuthn
- [ ] An audit log of sensitive actions (login, role change)
- [ ] Automated tests for authorization (Lesson 19): A cannot read B's note, user cannot call the admin action
- [ ] Redo the project using a maintained auth library and compare what it handled for you

---

## Hints

<details>
<summary><code>cookies()</code> says it must be awaited</summary>

In newer Next.js versions `cookies()` and `headers()` are async: `const store = await cookies();`. Setting cookies is only allowed in Server Actions and Route Handlers, not while rendering a page.
</details>

<details>
<summary>I get "Cookies can only be modified in a Server Action or Route Handler"</summary>

Move `createSession` / `destroySession` calls into a Server Action (or route handler) and not in a server component's render path. Reading cookies in components is fine.
</details>

<details>
<summary><code>redirect()</code> inside <code>try/catch</code> doesn't work</summary>

`redirect` works by throwing a special error. Call it **outside** the `try/catch` (or rethrow it).
</details>

<details>
<summary>How do I store only a hash of the session id?</summary>

Generate a random token, give the **token** to the cookie, and store `sha256(token)` in the DB. On each request hash the cookie value and look up by the hash. SHA-256 is fine here because the token is already high-entropy random, which is different from passwords.
</details>

<details>
<summary>How do I keep timing similar for unknown emails?</summary>

When the user isn't found, still run `verifyPassword(password, DUMMY_HASH)` (a pre-computed hash) and then return the same generic error.
</details>

<details>
<summary>How do I write <code>isSafeRedirect</code>?</summary>

Require the value to start with a single `/`, not `//` or `/\`, contain no scheme, and (best) resolve it with `new URL(next, origin)` and check that `url.origin === origin`. Test with tricky inputs.
</details>

<details>
<summary>My middleware blocks static files or loops</summary>

Use a `matcher` config that excludes `_next/static`, `_next/image`, and public assets, and make sure `/login` itself isn't protected.
</details>

---

## How to submit

1. Work in your own branch, and commit **without** secrets or `.env.local`.
2. Push and open a pull request titled `Lesson 23: yourname`, with `SECURITY-REVIEW.md` highlights in the description.
3. Ask a friend to review it, and ask them to actively try to break it using two accounts and `curl`. A good review asks: where is each check enforced, and what if the client lies?

---

## Done when

- Users can sign up, log in, and manage only their own notes; admins can manage users
- Every protected read and write is checked on the server
- Your own attack attempts are documented, with fixes
- `npm run build` and `npm run lint` pass
- Your PR is open and a friend has reviewed it (and tried to break it)

Next up: **Lesson 24: CI/CD and deployment**, the last lesson.
