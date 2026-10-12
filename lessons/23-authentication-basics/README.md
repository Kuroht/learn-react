# Lesson 23: Authentication Basics

**Goal:** understand how logging in actually works, and build a protected area without making the classic mistakes. You'll learn authentication vs authorization, sessions vs tokens, cookies, passwords, OAuth, and where to enforce access in a Next.js app.

**Time:** about 3 to 4 hours

**Prerequisite:** [Lesson 22](../22-nextjs-basics/README.md). The optional [security bonus module](../bonus-01-security/README.md) goes deeper on attacks and defenses.

> **Last verified:** October 2026. Authentication libraries and framework conventions change quickly (Auth.js/NextAuth, Better Auth, Clerk, Lucia-style patterns, Next.js middleware/proxy). The **concepts** in this lesson are stable. Check the docs of whatever library and Next.js version you use before copying code. When in doubt, follow [OWASP's Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) and [Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) cheat sheets.

---

## What you will learn

- Authentication vs authorization
- The golden rule: the frontend can't enforce security
- How sessions work (cookie + server-side store)
- Tokens and JWTs: what they are and the trade-offs
- Cookie flags: `HttpOnly`, `Secure`, `SameSite`
- Storing passwords properly
- OAuth / OpenID Connect ("Sign in with GitHub")
- Should you build your own auth? (Usually no.)
- Protecting routes, pages, and data in Next.js
- Role-based access control
- CSRF, XSS, and brute force
- UX: login, logout, redirect-back, and session expiry
- A security checklist

---

## 1. Two different questions

| | Authentication (AuthN) | Authorization (AuthZ) |
|---|---|---|
| Question | **Who are you?** | **What are you allowed to do?** |
| Examples | Log in with password, passkey, Google | Can this user delete *this* post? Is this user an admin? |
| Failure | `401 Unauthorized` (really "unauthenticated") | `403 Forbidden` |

You need both. A user being logged in doesn't mean they can read **someone else's** invoice. Missing authorization checks is the #1 web vulnerability (OWASP "Broken Access Control").

---

## 2. The golden rule

> **Everything in the browser can be read, changed, and replayed by the user.**

Therefore:

- Hiding a button or redirecting in React is **UX, not security**
- A client-side `if (user.isAdmin)` protects nothing, because anyone can call your API directly (curl, DevTools)
- **Every request** that reads or changes protected data must be authenticated and authorized **on the server**
- Never trust data from the client about who the user is or what they may do (`isAdmin: true` in a request body, a user id in a hidden field)

Client-side checks exist only to give a good experience (don't show a page the user can't use). The server is the guard.

---

## 3. How a session works

HTTP is stateless, so after login the server gives the browser something to prove "it's me" on later requests.

**Server-side sessions**:

1. User submits email and password
2. Server verifies them, creates a **session record** (in a DB or Redis) with a random, unguessable id
3. Server sends the id in a cookie: `Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax`
4. The browser automatically attaches the cookie to every request to your site
5. Server looks the id up, finds the user, and handles the request
6. Logout deletes the session record (immediately invalidates it), and the cookie is cleared

Pros: simple to reason about, instant revocation ("log out everywhere", ban a user). Cons: a lookup on each request (usually fast).

### Cookie flags (memorize these)

| Flag | Effect |
|------|--------|
| `HttpOnly` | JavaScript can't read the cookie. **Blocks theft via XSS.** Always on for session cookies |
| `Secure` | Sent only over HTTPS |
| `SameSite=Lax` (or `Strict`) | Not sent on cross-site POSTs. A major CSRF defense. `Lax` is a good default |
| `Path=/`, `Domain` | Scope. Keep as narrow as possible |
| `Max-Age` / `Expires` | Lifetime. Short sessions are safer. Offer "remember me" explicitly |
| `__Host-` prefix | Forces `Secure`, `Path=/`, no `Domain`: strongest scoping |

---

## 4. Tokens and JWTs

A **JWT** (JSON Web Token) is a signed string containing claims (`sub: user-id`, `exp`, `role`). The server can verify the signature **without** a database lookup.

```
header.payload.signature      (payload is only base64-encoded, NOT encrypted: anyone can read it)
```

Common use: short-lived **access token** (minutes) plus a longer-lived **refresh token** (stored server-side so it can be revoked).

| | Server sessions | Stateless JWTs |
|---|---|---|
| State | Stored on the server | In the token |
| Revocation | Immediate | Hard (wait for expiry, or keep a deny-list, which brings state back) |
| Scaling | Needs a shared store | No lookup needed |
| Pitfalls | Store availability | Size, leakage, long lifetimes, wrong storage location |

Guidance for most web apps: **use server-side sessions in an `HttpOnly` cookie.** JWTs make sense for service-to-service calls and some distributed systems. They are not "more secure" or "more modern" by default.

### Where NOT to store a token

**`localStorage` and `sessionStorage`**: any XSS bug (or a malicious npm package) can read them and steal the account. `HttpOnly` cookies can't be read by scripts. Many tutorials store JWTs in `localStorage`, and that's a known anti-pattern for session credentials.

### JWT pitfalls to know

- Never put secrets in the payload (it's readable)
- Always verify the signature **and** `exp`, `iss`, `aud`; use a vetted library; pin the algorithm (reject `alg: none`)
- Keep lifetimes short and plan for revocation

---

## 5. Passwords

If you handle passwords, the rules are strict:

- **Never store plain text, never encrypt, never use fast hashes (MD5, SHA-256)**
- Use a slow, salted, purpose-built **password hash**: **Argon2id** (preferred), scrypt, or bcrypt. Libraries handle the salt: `argon2`, `bcrypt`
- Enforce a sensible minimum length (8+; 12+ better), allow long passphrases and all characters, check against breached-password lists, and **don't** force silly composition rules
- Compare in constant time (the library does)
- Give **generic** login errors ("Invalid email or password"), so attackers can't discover which emails exist
- Rate-limit login attempts (per account and per IP) and consider lockouts or captchas to blunt brute force
- Never log passwords or tokens
- Password reset: single-use, short-lived, random tokens sent by email, stored **hashed**, and invalidating existing sessions after reset
- Offer **MFA** and **passkeys (WebAuthn)**, which remove passwords and phishing risk

```ts
import argon2 from 'argon2';

const hash = await argon2.hash(password);              // store this
const ok = await argon2.verify(storedHash, password);  // on login
```

---

## 6. Don't build your own (usually)

Authentication has many subtle failure modes: session fixation, timing attacks, reset flows, rate limits, account enumeration, MFA, email verification, device management. For real products prefer a maintained solution:

| Option | Notes |
|--------|-------|
| **Auth libraries** (Better Auth, and similar) | Live in your app, you own your data. Note: since September 2025 the Better Auth team also maintains **Auth.js** (formerly NextAuth.js) and recommends Better Auth for new projects. Auth.js gets security fixes but no big new features |
| **Hosted auth** (Clerk, Auth0, Supabase Auth, Firebase Auth, WorkOS...) | Fastest and most featureful, with vendor dependence and cost |
| **Your own** | Fine for learning (this lesson's project) and sometimes for simple needs, but treat it as a security-critical component |

Even when you use a library, you must still understand sessions, cookies, and authorization, because **the library authenticates; you must authorize**.

---

## 7. OAuth 2.0 and OpenID Connect ("Sign in with…")

OAuth lets a user grant your app limited access to their account at another provider without sharing the password. **OpenID Connect (OIDC)** adds *identity* on top (who the user is). "Sign in with Google/GitHub" is OIDC/OAuth.

The Authorization Code flow (with PKCE):

1. Your app redirects to the provider's authorize URL (with `client_id`, `redirect_uri`, `scope`, a random `state`, and a PKCE challenge)
2. The user logs in at the provider and approves
3. The provider redirects back to your `redirect_uri` with a one-time `code` (and your `state`)
4. Your **server** exchanges the `code` (plus the PKCE verifier and your client secret) for tokens
5. Your server reads the user's identity and creates **your own session**

Important points:

- Verify the `state` value to stop CSRF on the login flow
- Exchange the code on the **server**. A client secret must never be in frontend code
- Register exact redirect URIs. Request only the scopes you need
- The provider's access token is not your session. Create your own
- The email from a provider is only trustworthy if the provider says it's verified. Be careful when linking accounts by email

---

## 8. Authentication in Next.js (the shape of a safe app)

Where do checks go? **As close to the data as possible, and in more than one place.**

### 1. A data access layer

Centralize "who is the current user?" and "can they see this?" in server-only functions:

```ts
// lib/auth/session.ts
import 'server-only';
import { cookies } from 'next/headers';
import { cache } from 'react';

export const getCurrentUser = cache(async () => {
  const sessionId = (await cookies()).get('session')?.value;
  if (!sessionId) return null;
  return await findUserBySession(sessionId);      // DB lookup; null if expired or invalid
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}
```

`cookies()` is async (you must `await` it) since Next.js 15. Never put `getCurrentUser` inside a `'use cache'` function: cached functions can't read cookies, and caching per-user auth results is a classic way to show one user's data to another.

### 2. Check in every protected page, layout *and* data function

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <>
      <h1>Your invoices</h1>
      <Suspense fallback={<InvoiceListSkeleton />}>
        <Invoices />
      </Suspense>
    </>
  );
}

async function Invoices() {
  const user = await requireUser();                   // reads cookies: request-time, inside Suspense
  const invoices = await getInvoicesFor(user.id);     // filtered by the user, in the query
  return <InvoiceList invoices={invoices} />;
}
```

With Cache Components (Lesson 22), anything that reads `cookies()` must sit inside `<Suspense>`. The heading and skeleton are in the static shell, which contains **no private data**, and the user's invoices stream in only after the check passes.

Layouts don't re-run on every navigation between their children, so **don't rely on a layout alone** to protect pages. Check where data is read.

### 3. Check in every Server Action and route handler

```ts
'use server';

export async function deleteInvoice(id: string) {
  const user = await requireUser();                               // authentication
  const invoice = await db.invoice.findUnique({ where: { id } });
  if (!invoice || invoice.ownerId !== user.id) {                  // authorization (ownership)
    throw new Error('Not found');                                 // don't reveal existence
  }
  await db.invoice.delete({ where: { id } });
}
```

A Server Action is a public endpoint: **never** assume that only your UI can call it.

### 4. `proxy.ts` as a *convenience*

`proxy.ts` (called `middleware.ts` before Next.js 16) can redirect visitors without a session cookie early, for a better UX, and block obvious cases cheaply. But it usually only checks that a cookie *exists*, not that the session is valid. It can be bypassed by misconfigured matchers, and real framework vulnerabilities have existed in this area (for example a 2025 middleware-bypass CVE). **Never make it your only protection.** The server-side data checks above are the real guard.

### 5. Hide, don't protect, in the UI

Conditionally render admin links with a client check, but remember they are purely cosmetic.

---

## 9. Authorization models

**Ownership**: "users can edit their own posts." Filter queries by the owner (`where: { id, ownerId: user.id }`) instead of loading then checking, so it's hard to forget.

**RBAC (role-based access control)**: roles such as `user`, `editor`, `admin` with permissions:

```ts
const permissions = {
  user: ['post:create', 'post:edit:own'],
  editor: ['post:create', 'post:edit:any'],
  admin: ['post:create', 'post:edit:any', 'user:manage'],
} as const;

export function can(user: { role: keyof typeof permissions }, action: string) {
  return (permissions[user.role] as readonly string[]).includes(action);
}
```

Type roles as a union (`'user' | 'editor' | 'admin'`), keep the role on the **server-side user record** (not from client input), and re-check on every action. Beware of **IDOR** (Insecure Direct Object Reference): `/api/invoices/123`, where changing the number shows someone else's data because the server only checked "logged in", not "yours".

Principle of least privilege: default deny, grant the minimum.

---

## 10. Other attacks that matter here

| Attack | What | Defense |
|--------|------|---------|
| **CSRF** | A malicious site makes the browser send an authenticated request to your site | `SameSite` cookies, CSRF tokens or Origin checks for state-changing requests; use POST not GET for changes. Next.js Server Actions include origin checks |
| **XSS** | Injected script runs on your page and acts as the user | React escapes by default; avoid `dangerouslySetInnerHTML`; sanitize any HTML; a Content-Security-Policy; `HttpOnly` cookies limit the damage |
| **Session fixation** | Attacker sets a victim's session id | Issue a **new** session id on login |
| **Brute force / credential stuffing** | Guessing or reusing leaked passwords | Rate limits, breached-password checks, MFA |
| **Account enumeration** | "That email doesn't exist" reveals users | Generic messages and consistent timing |
| **Open redirect** | `?next=https://evil.com` after login | Allow only relative, same-origin paths for redirect-back |
| **Timing attacks** | Early-exit string compares leak info | Use constant-time compare from vetted libraries |

The security bonus module has hands-on exercises for XSS and more.

---

## 11. UX details that matter

- **Redirect back** after login to the page the user wanted (validate that it's an internal path)
- Clear, accessible forms with `autocomplete="username"`, `current-password`, and `new-password` so password managers work. Never block paste into password fields
- **Show/hide password** toggle
- Loading and error states (Lesson 18) for login and logout
- Handle **session expiry**: a 401 from the API should lead to the login screen with a friendly message, not a broken page
- Logout must clear the server session **and** the cookie, and then clear client caches (TanStack Query cache, stores) so the next user on that device doesn't see old data
- Don't expose whether the email exists
- Offer "forgot password", and email verification for new accounts

---

## 12. Secrets and environments

- Session secrets, OAuth client secrets, and DB URLs live in server environment variables, never in the repo or `NEXT_PUBLIC_*`
- Use different secrets for development and production, and rotate them if leaked
- Commit `.env.example`, never `.env.local`
- Run a secret scanner (GitHub secret scanning, `gitleaks`) in CI (Lesson 24)

---

## 13. A security checklist

- [ ] Server-side authentication on every protected page, action, and API route
- [ ] Authorization (ownership/role) checked against server data, not client input
- [ ] Session in an `HttpOnly`, `Secure`, `SameSite` cookie. No tokens in `localStorage`
- [ ] Passwords hashed with Argon2id/bcrypt (or no passwords: OAuth/passkeys)
- [ ] Generic login errors, rate limiting, and MFA offered
- [ ] New session id on login; full invalidation on logout
- [ ] CSRF protection and no state changes via GET
- [ ] Redirect targets validated
- [ ] Secrets only on the server
- [ ] Inputs validated with Zod on the server
- [ ] You tested it by trying to break it (calling APIs directly, changing ids, using another account)

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| Protecting only with a client-side redirect or hidden button | Anyone can call the API or open the URL |
| Checking auth only in a layout or `proxy.ts` | Bypassed via a direct data call or a matcher gap |
| Caching per-user data with `'use cache'` without the user in the key | One user sees another user's data |
| Server Actions without auth checks | Public endpoints that anyone can invoke |
| Loading a record by id without checking the owner (IDOR) | Users read or edit others' data |
| Storing the JWT in `localStorage` | Stolen by any XSS |
| Trusting `role` or `userId` sent by the client | Privilege escalation |
| Plain-text or SHA-256 passwords | A breach exposes all passwords |
| Different errors for "no such user" and "wrong password" | Account enumeration |
| Open redirects after login | Phishing helper |
| Putting secrets in `NEXT_PUBLIC_*` or the repo | Public to everyone |
| Not clearing client caches on logout | The next user sees the previous user's data |
| Rolling your own crypto or auth for production | Subtle holes that libraries already fixed |
| Long-lived tokens with no revocation plan | Stolen tokens work for weeks |

---

## Key takeaways

- Authentication is *who*; authorization is *what they may do*. Both are enforced on the server.
- The browser is untrusted: client-side checks are UX only.
- Prefer server-side sessions in `HttpOnly`, `Secure`, `SameSite` cookies. Don't put credentials in `localStorage`.
- Hash passwords with Argon2id or bcrypt, or avoid passwords with OAuth and passkeys.
- Use a maintained auth library or service for real products, and still write the authorization checks yourself.
- Check access at the data layer, in every action and route handler. Middleware is only a convenience.
- Test by attacking your own app: change ids, call APIs directly, use two accounts.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to [Lesson 24: CI/CD and deployment](../24-cicd-and-deployment/README.md).
