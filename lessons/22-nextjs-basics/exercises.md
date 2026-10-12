# Lesson 22: Exercises

Do these in a scratch Next.js project (`npx create-next-app@latest`, TypeScript, App Router) or on a practice branch. Try each one **before** reading the answer. Check the docs for your installed Next.js version when something differs.

---

## Exercise 1: Server or client?

For each component, say whether it can be a server component or needs `'use client'`.

1. A page that lists products fetched from a database
2. A "Like" button with local state
3. A layout with a header, nav links (`Link`), and a footer
4. A search box that filters a list as you type
5. A component that reads `window.innerWidth`
6. A card that shows a title and description from props
7. A theme toggle that saves to `localStorage`

<details>
<summary>Answers</summary>

1) server · 2) client · 3) server · 4) client (state + events) · 5) client · 6) server (and it works inside client trees, too) · 7) client
</details>

---

## Exercise 2: Routes from folders

Given this `app/` tree, list the URLs:

```
app/
├── page.tsx
├── about/page.tsx
├── (shop)/
│   ├── products/page.tsx
│   └── products/[id]/page.tsx
├── blog/
│   ├── layout.tsx
│   └── [...slug]/page.tsx
└── _components/Header.tsx
```

<details>
<summary>Answers</summary>

`/`, `/about`, `/products`, `/products/42`, `/blog/anything`, `/blog/a/b/c`. `(shop)` adds no URL segment, and `_components` is private, so it creates no route.
</details>

---

## Exercise 3: First pages

Create a small site with:

1. A root layout with a header, nav links, and footer
2. Pages: Home, About, and a Blog list at `/blog`
3. A `blog/[slug]` page that shows the slug
4. A custom `not-found.tsx`

Navigate with `Link` and watch the Network tab. Is the layout re-fetched when you move between pages?

---

## Exercise 4: Fetch on the server

Use `https://jsonplaceholder.typicode.com/posts`.

1. Fetch the list in an `async` server component. No hooks, no effects
2. Render it from the page **without** a `Suspense` boundary. Read the blocking-route error in the dev overlay. What two fixes does it suggest?
3. Fix it first with `<Suspense>`, then (in a second version) with `'use cache'` and `cacheLife('hours')` on the fetch function. What's the difference in what users see?
4. Fetch a single post on `/blog/[slug]` (`await params`). Call `notFound()` for unknown ids
5. Disable JavaScript in DevTools and reload. Does the content still appear? Compare with a Vite SPA
6. View the page source. Is the data in the HTML?

---

## Exercise 5: Loading and errors

1. Add an artificial delay (`await new Promise(r => setTimeout(r, 2000))`) to the blog list
2. Add `loading.tsx`. What is shown during the delay?
3. Throw an error on purpose and add `error.tsx` with a "Try again" button
4. Move the delay into a child component wrapped in `Suspense`, so the page title shows immediately. How does the experience change?

---

## Exercise 6: A client island

On the blog post page, add a `LikeButton` (with state) as a client component.

1. Keep the page itself a server component
2. Check what is in the JavaScript bundle for that page (Network tab, or the build output)
3. Move `'use client'` up to the page. What happens to the amount of client JavaScript and to your ability to fetch with `async`?
4. Pass server-fetched data into the client component as props. What can't you pass?

---

## Exercise 7: Composition

1. Create a client `Collapsible` component with a `children` prop
2. Put a **server** component inside it as a child (one that fetches data)
3. Verify that the child still runs on the server (log something, and check the terminal vs the browser console)
4. Try importing that server component directly **inside** the client file. What error do you get, and why?

---

## Exercise 8: Parallel and streaming

A page needs `user` (200ms), `orders` (1s), and `recommendations` (2s).

1. Fetch them one after another and time it
2. Fetch with `Promise.all` and time it
3. Wrap `recommendations` in its own `Suspense` boundary so the rest renders at once
4. Which is the best user experience, and why?

---

## Exercise 9: Metadata

1. Add a static `metadata` export to the layout with a title template
2. Add `generateMetadata` to the blog post page using the post title
3. Look at the `<head>` in the page source
4. Add an Open Graph image, and test the preview with a link-preview tool or the browser's "view source"

---

## Exercise 10: Server Action

Build a "guestbook":

1. A form with a name and a message
2. A Server Action that validates with Zod, stores the entry in an in-memory array (or a JSON file), and refreshes the list. Cache the list with `'use cache'` + `cacheTag('guestbook')` and call `updateTag('guestbook')` in the action. What happens if you forget the `updateTag`?
3. Use `useActionState` to show validation errors and a pending state
4. Disable JavaScript and submit. Does it still work? Why?
5. Call your action from `curl` or the browser's network tab. What does this tell you about how it must be secured?

---

## Exercise 11: Secrets

1. Put `SECRET_KEY=abc` and `NEXT_PUBLIC_SITE=demo` in `.env.local`
2. Read both in a server component and in a client component. What does the client see for each?
3. Add `import 'server-only'` to a module that reads the secret, and try to import it from a client component. What happens?
4. Create `.env.example` and confirm `.env.local` is in `.gitignore`

---

## Exercise 12: Build and inspect

Run `npm run build`.

1. What does the build output say about each route's static shell?
2. Read `cookies()` inside a small component on one page, wrapped in `Suspense`. Rebuild. Is the rest of the page still prerendered?
3. Remove the `Suspense` around it. What does the build say?
4. Add `generateStaticParams` to the blog post page and rebuild. What changed?

---

## Exercise 13: Spot the outdated tutorial

Each snippet comes from an older Next.js tutorial. Say what's outdated in Next.js 16 with Cache Components, and rewrite it.

```ts
// a: middleware.ts
export function middleware(req: NextRequest) { ... }

// b
export const dynamic = 'force-dynamic';

// c
const res = await fetch(url, { next: { revalidate: 60 } });

// d
revalidateTag('posts');

// e
export default function Page({ params }: { params: { id: string } }) {
  return <h1>{params.id}</h1>;
}
```

<details>
<summary>Answers</summary>

a) Rename the file to `proxy.ts` and the function to `proxy`. b) Not needed: everything is dynamic by default. Use `Suspense` for dynamic parts. c) Use a function with `'use cache'` and `cacheLife('minutes')` (or a custom profile). d) Use `updateTag('posts')` in a Server Action, or `revalidateTag('posts', 'max')`. e) `params` is a Promise: make the component async (or pass it to a child inside `Suspense`) and `await params`. Type it with `PageProps<'/route/[id]'>`.
</details>

---

## Check yourself

You're ready for the project if you can answer these without looking:

- What problems of a client-only SPA does Next.js address?
- What makes a folder a route, and what do `layout`, `loading`, `error`, and `not-found` do?
- What's the difference between a server and a client component, and which is the default?
- Where should `'use client'` go?
- Can a client component import a server component? Can it receive one?
- Why use `Promise.all` or Suspense for fetching?
- What is the static shell, and why must uncached data or `cookies()` be inside `<Suspense>`?
- What do `'use cache'`, `cacheLife`, and `cacheTag` do, and how do you refresh cached data after a mutation?
- Why must Server Actions validate input and check authorization?
- Which environment variables reach the browser?
