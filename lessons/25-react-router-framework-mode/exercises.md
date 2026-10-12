# Lesson 25: Exercises

Do these in a scratch framework-mode app (`npx create-react-router@latest scratch`). Try each one **before** reading the answer.

---

## Exercise 1: Which mode?

Pick **declarative**, **data**, or **framework** mode for each app, and say why.

1. A small widget embedded in an existing page that only needs two tabs with URLs
2. An internal admin SPA, served as static files, that calls an existing REST API
3. A public recipe site that must be fast on first load and rank well in search engines
4. A dashboard behind a login, with server-side sessions and a database
5. A documentation site with 200 pages that rarely change

<details>
<summary>Suggested answers</summary>

1) declarative · 2) data mode (or framework mode with `ssr: false`) · 3) framework mode with SSR · 4) framework mode with SSR · 5) framework mode with `prerender`
</details>

---

## Exercise 2: Read the routes

```ts
export default [
  index('routes/home.tsx'),
  route('blog', 'routes/blog-layout.tsx', [
    index('routes/blog-index.tsx'),
    route(':slug', 'routes/blog-post.tsx'),
  ]),
  layout('routes/account-layout.tsx', [
    route('settings', 'routes/settings.tsx'),
  ]),
  ...prefix('docs', [route('*', 'routes/docs.tsx')]),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
```

Which modules render (outermost first) for: `/`, `/blog`, `/blog/hello`, `/settings`, `/docs/a/b`, `/nope`?

<details>
<summary>Answers</summary>

- `/`: root → home
- `/blog`: root → blog-layout → blog-index
- `/blog/hello`: root → blog-layout → blog-post (`slug = 'hello'`)
- `/settings`: root → account-layout → settings (the layout adds no URL segment)
- `/docs/a/b`: root → docs (`params['*'] = 'a/b'`)
- `/nope`: root → not-found
</details>

---

## Exercise 3: Your first loader

1. Add `route('users/:userId', 'routes/user.tsx')`
2. Write a `loader` that fetches `https://jsonplaceholder.typicode.com/users/{userId}`
3. Render the name and email with `loaderData` from `Route.ComponentProps`
4. Hover over `params` and `loaderData` in your editor. Where do the types come from?
5. View the page source. Is the user's name in the HTML? Compare with Lesson 14's data mode

---

## Exercise 4: 404s done right

1. When the user doesn't exist, `throw data('User not found', { status: 404 })`
2. Add an `ErrorBoundary` to the route that shows a friendly message for 404 and a generic one otherwise
3. Open DevTools → Network and check the **HTTP status** of the document. Why does it matter for search engines?
4. Add a catch-all `*` route that returns a real 404 status too

---

## Exercise 5: A form that works without JavaScript

Build a "guestbook" route:

1. A `loader` that returns entries from an in-memory array (a module-level variable in a `.server.ts` file)
2. An `action` that validates name and message with Zod, adds an entry, and returns field errors on failure
3. A `<Form method="post">` with the errors shown next to fields
4. Disable JavaScript in DevTools and submit. Does it still work?
5. Enable JavaScript again. Do you see a page reload? Why does the list update without any code to refresh it?

<details>
<summary>Answer to 5</summary>

With JavaScript, React Router submits with `fetch`, runs the action, and then **re-runs the loaders** of the page automatically, so the new entry appears without a full reload.
</details>

---

## Exercise 6: `useFetcher`

Add a "👍" button to each guestbook entry that increments its likes:

1. Use `useFetcher()` and `<fetcher.Form method="post">` posting to a separate `action` (an `intent` field, or a resource route with only an `action`)
2. Show the optimistic count from `fetcher.formData` while it's pending
3. Make the server fail randomly. What happens to the optimistic value?
4. Why is `useFetcher` better than `<Form>` here?

---

## Exercise 7: Search in the URL

1. Add a `<Form method="get">` with a search input named `q`
2. In the loader, read `new URL(request.url).searchParams.get('q')` and filter entries
3. Keep the input's value in sync with the URL (`defaultValue` from the loader data)
4. Show a pending style with `useNavigation()` while the search loads
5. Bonus: submit on typing with `useSubmit` and a debounce, using `{ replace: true }` so history doesn't fill up

---

## Exercise 8: Server-only code

1. Create `app/lib/secrets.server.ts` that exports `process.env.API_KEY`
2. Import it in a loader and use it. Does it work?
3. Now import it in the component and use it there. What does the build say?
4. Return the secret from the loader by mistake, and look at the page source and the network tab. What does this teach you?

---

## Exercise 9: Sessions

1. Create a cookie session storage with `httpOnly`, `sameSite: 'lax'`, and a secret from `.env`
2. Build a tiny login action that stores a username in the session (no password, it's practice)
3. Show "Hello, {name}" in the root layout from a root `loader`
4. Add a logout action that destroys the session
5. Inspect the cookie in DevTools. Which flags does it have? Can JavaScript read it (`document.cookie`)?

---

## Exercise 10: Rendering strategies

1. In `react-router.config.ts`, pre-render `/` and `/about`, and build. Find the generated HTML files in `build/client`
2. Switch to `ssr: false` and build again. What happens to routes that use `loader`? What must you use instead?
3. Which strategy would you choose for each route of a real blog with comments?

---

## Exercise 11: Compare with Next.js

Implement the same page (a list of posts with a "new post" form) in Lesson 22's Next.js app and in framework mode. Compare:

1. Where the data loading code lives
2. How the list refreshes after creating a post
3. How you'd cache the list for 5 minutes
4. Which one felt simpler to you, and why?

---

## Check yourself

You're ready for the project if you can answer these without looking:

- What do framework mode's loaders and actions do differently from data mode's?
- What do `routes.ts`, `root.tsx`, and a route module each do?
- Where do the `Route.*` types come from, and what do they type?
- What happens on the page after an action finishes?
- When do you use `<Form>`, and when `useFetcher`?
- How do you return a 404 so search engines see the right status?
- How do you keep code and secrets out of the browser bundle?
- What's the difference between SSR, pre-rendering, and SPA mode?
