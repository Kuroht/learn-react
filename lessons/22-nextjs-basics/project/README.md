# Lesson 22 Project: Migrate the Blog to Next.js

Rebuild your Lesson 14 multi-page blog with the Next.js App Router, moving data fetching to the server and replacing your hand-written API code with server components and Server Actions.

> **Last verified:** October 2026, with Next.js 16.4 and **Cache Components enabled** (the `create-next-app` default). Next.js evolves quickly. Check [nextjs.org/docs](https://nextjs.org/docs) for your installed version. If your app was created without Cache Components, read the "previous model" caching guide instead of `'use cache'`.

---

## Brief

Your Vite blog (JSONPlaceholder posts, comments, search, pagination, create-post form) becomes a Next.js app with:

| URL | Page |
|-----|------|
| `/` | Home with the latest 3 posts |
| `/posts` | Post list with search, author filter, and pagination in the URL |
| `/posts/[postId]` | A post with its comments, author, and previous/next links |
| `/posts/new` | Create a post (Server Action) |
| `/about` | Static about page |
| anything else | A custom 404 |

The point is to experience the differences: **server rendering, no loading flicker, SEO metadata, and server-side mutations**. You'll also write a short comparison between the two versions.

Every stage ends with a **checkpoint**: something you should see in the browser.

---

## Getting started

```bash
cd lessons/22-nextjs-basics/project
npx create-next-app@latest starter
# accept the recommended defaults: TypeScript, Tailwind, a linter, App Router, Cache Components
# answer yes to the src/ directory
cd starter
npm run dev
```

Suggested structure:

```
src/
├── app/
│   ├── layout.tsx, page.tsx, not-found.tsx, error.tsx
│   ├── about/page.tsx
│   └── posts/
│       ├── page.tsx, loading.tsx
│       ├── [postId]/page.tsx, not-found.tsx
│       └── new/page.tsx
├── features/posts/
│   ├── data.ts           # typed server-side fetch functions ('use cache')
│   ├── schemas.ts        # Zod schemas
│   ├── actions.ts        # Server Actions ('use server')
│   ├── types.ts
│   └── components/ (PostCard.tsx, SearchForm.tsx, Pagination.tsx, NewPostForm.tsx, ...)
└── lib/
```

Use the feature-based structure from Lesson 21.

Work in your own branch: `git checkout -b yourname/lesson-22`

---

## Stage 1: Layout and static pages

- [ ] Root layout with `<html lang>`, a header with `Link`s, a footer, and a font via `next/font`
- [ ] `metadata` with a title template (`%s | My Blog`) and a default description
- [ ] Home and About pages as server components
- [ ] A custom `not-found.tsx`
- [ ] Confirm `next.config.ts` has `cacheComponents: true`
- [ ] `npm run build` shows Home and About as fully prerendered

**Checkpoint:** navigation between pages is instant, and the build output shows the routes you expect as fully static.

---

## Stage 2: Typed server-side data

In `features/posts/data.ts`:

- [ ] Zod schemas for `Post`, `Comment`, and `User` in `schemas.ts`, with types from `z.infer`
- [ ] `getPosts({ page, q, userId })` returns `{ posts, total }` (read the `x-total-count` header), validated with Zod
- [ ] `getPost(id)` returns `null` for a 404, and throws for other errors
- [ ] `getComments(postId)` and `getUser(id)`
- [ ] Each function starts with `'use cache'`, sets a `cacheLife` (posts: `'hours'`, comments: `'minutes'`), and tags its data with `cacheTag` (`'posts'`, `` `post-${id}` ``)
- [ ] Add `import 'server-only'` so these can't be imported from client code

**Checkpoint:** a scratch server component renders data from each function.

---

## Stage 3: The post list

- [ ] `/posts` page renders the heading and the search form right away (static shell), and passes the `searchParams` **promise** to a `PostResults` component inside `<Suspense>`
- [ ] `PostResults` awaits `searchParams` and calls the cached `getPosts`
- [ ] Validate `page`, `q`, and `userId` (never trust the URL): invalid values fall back to defaults
- [ ] A search form using `<form action="/posts" method="get">` (works without JavaScript!) with the author select
- [ ] Pagination with `Link`s that preserve the other params
- [ ] A skeleton fallback that matches the layout
- [ ] An empty state: "No posts match your search"
- [ ] The result count is announced in a `role="status"` region

**Checkpoint:** disable JavaScript and the search and pagination still work. The posts are in the HTML source.

---

## Stage 4: The post page

- [ ] `/posts/[postId]` fetches the post, then the author and comments **in parallel**
- [ ] Wrap the comments in `Suspense` with a skeleton so the article shows first
- [ ] Invalid or missing ids call `notFound()` and render a route-level `not-found.tsx`
- [ ] `generateMetadata` sets the page title and description from the post
- [ ] `generateStaticParams` pre-renders the first 20 posts. Check the build output
- [ ] Previous and next post links
- [ ] An `error.tsx` boundary with a "Try again" button

**Checkpoint:** view source shows the real `<title>` and article content, and `/posts/9999` shows your 404.

---

## Stage 5: Client islands

Add interactivity **only where needed**:

- [ ] A `LikeButton` client component (state in `localStorage` is fine), used inside the server-rendered post page
- [ ] A `ThemeToggle` client component (apply the `dark` class, avoiding a flash with a tiny inline script in the layout)
- [ ] A `CopyLinkButton` that uses `navigator.clipboard`
- [ ] Verify which components are client components. Keep `'use client'` files small, with **no** data fetching in them
- [ ] Pass server-fetched data into client components only as serializable props

**Checkpoint:** in the build output, the post page's client JavaScript is small, and the page isn't marked `'use client'`.

---

## Stage 6: Create a post with a Server Action

- [ ] `/posts/new` with a form (title, body, author)
- [ ] `createPost` in `actions.ts` (`'use server'`): parse `FormData` with Zod, return field errors, and "create" the post (`POST` to JSONPlaceholder, which fakes it, or write to a local JSON file)
- [ ] The form is a client component using `useActionState`, with field-level errors and a pending state (`useFormStatus` in the submit button)
- [ ] On success, `updateTag('posts')` (so the list shows the new post immediately) and `redirect('/posts')`
- [ ] Submitting with JavaScript disabled still works
- [ ] **Security:** the action checks that the user is allowed to post. For now, add a simple placeholder `requireUser()` (Lesson 23 makes it real)

**Checkpoint:** invalid data shows messages without losing the typed values; valid data redirects to the list.

---

## Stage 7: SEO and performance

- [ ] `sitemap.ts` and `robots.ts` generated for the site
- [ ] Open Graph metadata and a default `opengraph-image`
- [ ] All images use `next/image` with `alt`, sizes, and `priority` on the hero
- [ ] Run Lighthouse on `npm run build && npm start`. Record Performance, Accessibility, SEO, and Best Practices
- [ ] Compare these numbers with your Vite blog (in `COMPARISON.md`)

---

## Stage 8: Environment and deployment readiness

- [ ] Put the API base URL in an env var. A server-only one (`API_URL`), and one public (`NEXT_PUBLIC_SITE_URL` for canonical links)
- [ ] `.env.example` committed. `.env.local` ignored
- [ ] Verify that no secret appears in the client bundle (search `.next/static` for the value)
- [ ] `npm run build` succeeds with no errors or type problems
- [ ] (Optional) deploy to Vercel (Lesson 24 covers deployment in depth)

---

## Stage 9: Compare and reflect

Write `COMPARISON.md` with the Vite blog vs the Next.js blog:

- [ ] Lines of code for data fetching on the `/posts/[id]` page
- [ ] Loading experience (flicker, blank screens, time to first content) on a throttled connection
- [ ] View-source difference
- [ ] Lighthouse scores
- [ ] Client JavaScript size
- [ ] What got easier, what got harder, and what confused you
- [ ] For this app, which would you ship, and why?

```bash
npm run build
npm run lint
```

Both should pass. No `any`.

---

## Requirements checklist

**Must have**

- [ ] App Router with layouts, `loading.tsx`, `error.tsx`, and `not-found.tsx`
- [ ] Server components fetching data (no `useEffect` fetching)
- [ ] Zod-validated data and validated search params
- [ ] Parallel fetching and a `Suspense` boundary for comments
- [ ] Cached data functions with `'use cache'`, `cacheLife`, and `cacheTag`, and no blocking-route errors in dev or build
- [ ] Dynamic metadata with `generateMetadata`
- [ ] At least one Server Action with validation, pending state, and revalidation
- [ ] Small client islands. `'use client'` only where needed
- [ ] Server-only modules marked `server-only`, and secrets never in client code
- [ ] `COMPARISON.md`
- [ ] No `any`
- [ ] `npm run build` and `npm run lint` pass

**Nice to have**

- [ ] Comments form with a Server Action and optimistic UI (`useOptimistic`)
- [ ] Route handler `/api/health`
- [ ] A `proxy.ts` that redirects `/blog/*` to `/posts/*` (old URLs)
- [ ] `export const ensureStatic = 'navigation'` on the About page, then try to add something dynamic and read the build error
- [ ] Parallel/intercepting route for a post preview modal
- [ ] Tests for the Zod schemas and the action (Lesson 19)
- [ ] Internationalization of the site

---

## Hints

<details>
<summary>"You're importing a component that needs useState"</summary>

A server component (or something it imports) uses a hook, an event handler, or a browser API. Move that part into its own file with `'use client'` at the top, and import it from the server component.
</details>

<details>
<summary><code>params</code> must be awaited</summary>

`params` and `searchParams` are Promises. Type the page with the generated helper `PageProps<'/posts/[postId]'>`, and `await params` inside an async component that sits in a `Suspense` boundary.
</details>

<details>
<summary>"Uncached data was accessed outside of &lt;Suspense&gt;" / blocking-route error</summary>

A component fetched data, awaited `params`/`searchParams`, or read `cookies()` without being inside `<Suspense>` and without `'use cache'`. Either wrap that component in `<Suspense fallback={...}>`, or cache the data function with `'use cache'`. Move the `await` as deep into the tree as you can so the rest of the page stays in the static shell.
</details>

<details>
<summary>My data doesn't refresh after the Server Action</summary>

The list is cached. Call `updateTag('posts')` in the action (matching the `cacheTag('posts')` in your data function), then `redirect`. Remember `redirect` throws internally, so call it outside a `try/catch`. `revalidateTag` now needs a second argument (`revalidateTag('posts', 'max')`) and serves stale data while refreshing, which is why `updateTag` is better right after a form.
</details>

<details>
<summary>Hydration mismatch error</summary>

Server and client rendered different HTML, for example from `Date.now()`, `Math.random()`, `window` checks, or locale-dependent formatting. Move that into an effect in a client component, or format the value on the server consistently. On the server, Next.js also asks you to call `await connection()` (inside `Suspense`) before using random values or the current time, or to cache them.
</details>

<details>
<summary>Remote images fail to load</summary>

Allow the domain in `next.config.ts` under `images.remotePatterns`, then restart the dev server.
</details>

<details>
<summary>The page is slow in dev but I don't know about production</summary>

`next dev` is much slower than a production build. Always measure with `npm run build && npm start`.
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per stage.
3. Push and open a pull request titled `Lesson 22: yourname`, with the `COMPARISON.md` summary and screenshots of the build output.
4. Ask a friend to review it. A good review asks: is anything a client component that doesn't need to be, and could any server action be called by someone who shouldn't?

---

## Done when

- The blog runs on Next.js with server-rendered pages, streaming comments, and a working Server Action
- You can explain, for each file, whether it runs on the server or in the browser
- `npm run build` and `npm run lint` pass
- Your PR is open and a friend has reviewed it

Next up: **Lesson 23: Authentication basics**.
