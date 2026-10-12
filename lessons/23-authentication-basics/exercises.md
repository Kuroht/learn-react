# Lesson 23: Exercises

Most of these are reasoning and "attack your own app" exercises. Use a practice branch or a scratch Next.js project, and **only test applications you own**. Try each one **before** reading the answer.

---

## Exercise 1: AuthN or AuthZ?

Label each situation **authentication** or **authorization**, and name the HTTP status the server should return.

1. No session cookie was sent to `/api/orders`
2. A logged-in customer requests `/admin/users`
3. A logged-in user requests invoice #42, which belongs to someone else
4. The login password is wrong
5. A session expired an hour ago

<details>
<summary>Answers</summary>

1) authentication, 401 · 2) authorization, 403 · 3) authorization, 403 (or 404, to avoid confirming it exists) · 4) authentication, 401 · 5) authentication, 401
</details>

---

## Exercise 2: Can the client enforce it?

For each, say whether it is **real security** or **only UX**.

1. Hiding the "Delete user" button from non-admins
2. A React Router `<Navigate>` redirect for logged-out users
3. A Server Action that calls `requireUser()` and checks ownership
4. `if (user.role === 'admin')` in client code before calling `fetch('/api/admin')`
5. A database query filtered by `ownerId = session.userId`

<details>
<summary>Answers</summary>

1) UX · 2) UX · 3) real · 4) UX (the endpoint must check) · 5) real
</details>

---

## Exercise 3: Cookie flags

Explain what attack each flag helps prevent, and what breaks if it's missing:

1. `HttpOnly`
2. `Secure`
3. `SameSite=Lax`
4. A short `Max-Age`

Then open DevTools → Application → Cookies on a site you use. Which flags do its session cookies have?

---

## Exercise 4: Why not `localStorage`?

1. Write a tiny page with a "vulnerable" component that renders `dangerouslySetInnerHTML` from a URL parameter
2. Store a fake token in `localStorage` and a fake cookie with `HttpOnly` (set it from a small Next.js route handler)
3. Exploit the XSS in your own page with `<img src=x onerror="alert(localStorage.token + ' / ' + document.cookie)">`
4. What can the script read, and what can it not?
5. Fix the XSS. Does moving to cookies make XSS harmless? (No: explain what an attacker can still do while the script runs.)

---

## Exercise 5: Read a JWT

1. Create a JWT with any online/offline tool or a small script (`header.payload.signature`)
2. Base64-decode the payload by hand (`atob`). Can you read it without the secret?
3. Change the payload and keep the old signature. What should the server do?
4. Write three claims that must be validated on the server
5. List two reasons a stateless JWT is hard to revoke

---

## Exercise 6: Hash a password

1. Install `argon2` or `bcrypt` and hash the same password twice. Why are the outputs different?
2. Verify a correct and an incorrect password
3. Time the hashing. Why is slowness a feature here?
4. Explain why SHA-256 is the wrong tool even though it is "secure"

---

## Exercise 7: Break an IDOR

Build (or sketch) an API `GET /api/invoices/[id]` that does:

```ts
const user = await requireUser();
const invoice = await db.invoice.findUnique({ where: { id } });
return Response.json(invoice);
```

1. Log in as user A, and request an invoice that belongs to user B. What happens?
2. Fix it by filtering in the query (`where: { id, ownerId: user.id }`)
3. Which response status is better when the record isn't yours: 403 or 404? Discuss the trade-off.
4. Write a test (Lesson 19) that logs in as A and asserts that B's invoice is not returned

---

## Exercise 8: Protect an action

This Server Action has three security problems. Find and fix them.

```ts
'use server';
export async function updateProfile(formData: FormData) {
  const id = formData.get('userId') as string;
  const role = formData.get('role') as string;
  await db.user.update({ where: { id }, data: { name: formData.get('name') as string, role } });
}
```

<details>
<summary>Answers</summary>

1. No authentication (`requireUser()`), so anyone can call it. 2. It trusts the `userId` from the client instead of using the session user (IDOR). 3. It accepts `role` from the client (privilege escalation: a user can make themselves admin). Also: no input validation (use Zod) and unchecked casts.
</details>

---

## Exercise 9: Roles

1. Define `Role = 'user' | 'editor' | 'admin'` and a permission map
2. Write `can(user, action)` and use it in a page, in a Server Action, and in the UI (to hide a button)
3. Which two of those three uses are security, and which is cosmetic?
4. Add a test that a `user` cannot perform an `admin` action even by calling the action directly

---

## Exercise 10: Redirect safety

A login page accepts `/login?next=/dashboard` and redirects there after login.

1. Try `?next=https://evil.example` and `?next=//evil.example`. What happens in a naive implementation?
2. Write `isSafeRedirect(next: string): boolean` that allows only same-origin relative paths
3. Test it with at least eight tricky inputs (`/\evil`, `javascript:alert(1)`, encoded slashes, empty string)

---

## Exercise 11: OAuth walkthrough

Draw (or write) the authorization code flow for "Sign in with GitHub":

1. Who talks to whom at each step?
2. Where do `client_secret`, `code`, `state`, and the access token travel?
3. What happens if you skip the `state` check?
4. Why must the code exchange happen on the server?

---

## Exercise 12: Logout properly

List everything that must happen on logout in a Next.js app using server sessions, TanStack Query, and Zustand. Then implement it and verify with two accounts on the same browser that account B never sees account A's cached data.

---

## Check yourself

You're ready for the project if you can answer these without looking:

- What's the difference between authentication and authorization?
- Why can't the frontend enforce security?
- How does a server-side session work?
- What do `HttpOnly`, `Secure`, and `SameSite` do?
- Why is `localStorage` a poor place for session tokens?
- How should passwords be stored?
- What is IDOR and how do you prevent it?
- Why must Server Actions check auth themselves?
- Why use a maintained auth library or service for real apps?
