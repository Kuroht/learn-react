# Lesson 22: Next.js Basics

**Goal:** move from a client-only single-page app to a full-stack React framework. You'll learn the App Router, server and client components, data fetching on the server, Suspense and streaming, caching with `'use cache'`, metadata, and Server Actions.

**Time:** about 3 to 4 hours

**Prerequisite:** [Lesson 21](../21-architecture-and-project-structure/README.md)

> **Last verified:** October 2026, with **Next.js 16.4** and React 19.3. Next.js changes fast. In particular, 16.4 made **Cache Components** the default for new apps, which changes how caching and rendering work compared with older tutorials. Everything here uses the **App Router**. Always check [nextjs.org/docs](https://nextjs.org/docs) for your installed version (`npx next --version`), and treat any tutorial older than a year with suspicion.
>
> **What changed recently** (so you can recognize outdated material):
> - **Next.js 15:** `params`, `searchParams`, `cookies()`, and `headers()` became async (you `await` them). In 16 the old sync access was removed.
> - **Next.js 16:** Turbopack is the default bundler, `middleware.ts` was renamed to **`proxy.ts`**, the `next lint` command was removed (run ESLint or Biome directly), `revalidateTag()` needs a second argument, and Node 20.9+ is required.
> - **Next.js 16.4:** new apps from `create-next-app` have **Cache Components** turned on: everything is dynamic by default, and you opt into caching with `'use cache'`. Next.js 17 is expected to make it the only model.

---

## What you will learn

- What a framework adds on top of Vite + React
- Creating a Next.js project
- File-based routing in the `app/` directory
- Layouts, pages, and nested routes
- Server Components vs Client Components
- Fetching data in server components
- Suspense, streaming, and the static shell
- Caching with `'use cache'`, `cacheLife`, and `cacheTag`
- Dynamic routes, search params, and `not-found`
- Loading and error UI
- Metadata and SEO
- Images, fonts, and links
- Server Actions and refreshing data after a mutation
- Environment variables
- Route handlers and `proxy.ts`

---

## 1. Why a framework?

Your Vite apps are **client-side rendered (CSR)**: the browser downloads a nearly empty HTML file, then JavaScript, then runs React to build the page. Consequences:

- A blank screen until JS loads (slower first paint)
- Weaker SEO and link previews (crawlers see little HTML)
- Data fetching starts only after JS runs (a waterfall: HTML → JS → fetch → render)
- You need a separate backend for anything private (databases, secrets)

**Next.js** adds:

| Feature | What it gives you |
|---------|-------------------|
| Server rendering | HTML generated on the server: faster first content, better SEO |
| File-based routing | The folder structure is the route structure |
| Server Components | Components that run only on the server, with direct access to data and secrets |
| Server Actions | Call server functions from forms and components, without hand-written API routes |
| Partial prerendering | A static "shell" of each page served instantly, with dynamic parts streamed in |
| Built-in optimizations | Images, fonts, code splitting, prefetching |
| Backend routes | `route.ts` handlers for APIs and webhooks |
| Deployment | First-class hosting on Vercel, and runs on Node anywhere |

Trade-off: more concepts, a server to run, and the "which side is this code on?" question. For dashboards behind a login with no SEO needs, a Vite SPA can still be the better choice. [Lesson 25](../25-react-router-framework-mode/README.md) shows another full-stack option, React Router's framework mode.

---

## 2. Create a project

```bash
npx create-next-app@latest my-app
```

Choose the **recommended defaults**: TypeScript, Tailwind CSS, a linter, the App Router, and (since 16.4) Cache Components. Then:

```bash
cd my-app
npm run dev        # http://localhost:3000
```

Project layout (with `src/`):

```
src/
└── app/
    ├── layout.tsx       # the root layout (required): <html> and <body>
    ├── page.tsx         # the page for "/"
    ├── globals.css
    └── favicon.ico
public/                  # static files, served from "/"
next.config.ts           # framework configuration
```

Look at `next.config.ts`. A new app has Cache Components turned on:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
```

Commands: `dev`, `build` (a production build, which prints what is prerendered for each route), `start` (serve the build). `npm run lint` now runs ESLint (or Biome) directly. There is no `next lint` any more.

---

## 3. File-based routing

A folder inside `app/` is a route **segment**. A `page.tsx` inside it makes that URL public:

```
app/
├── page.tsx                  → /
├── about/page.tsx            → /about
├── blog/
│   ├── page.tsx              → /blog
│   └── [slug]/page.tsx       → /blog/hello-world   (dynamic)
└── (marketing)/pricing/page.tsx → /pricing         (route group: no URL segment)
```

Special files, each with a purpose:

| File | Purpose |
|------|---------|
| `page.tsx` | The UI for a route (makes it publicly accessible) |
| `layout.tsx` | Shared UI that wraps child routes and **persists** across navigation |
| `loading.tsx` | Instant loading UI (a Suspense boundary) while the segment loads |
| `error.tsx` | Error boundary UI for the segment (must be a client component) |
| `not-found.tsx` | Shown when `notFound()` is called or a URL doesn't match |
| `route.ts` | An API endpoint (GET, POST, ...) |
| `template.tsx` | Like a layout but remounts on navigation |

Special folder names: `[id]` dynamic segment, `[...slug]` catch-all, `(group)` organizational group with no URL impact, `_private` folders ignored by routing.

### Layouts

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = { title: { default: 'My Blog', template: '%s | My Blog' } };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>
        <nav><Link href="/">Home</Link> <Link href="/blog">Blog</Link></nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

Layouts nest: `app/blog/layout.tsx` wraps all `/blog/...` pages inside the root layout. A layout doesn't re-render or lose state when you navigate between its children.

`LayoutProps<'/'>` and `PageProps<'/blog/[slug]'>` are **global helper types** that Next.js generates from your routes (during `next dev`, `next build`, or `next typegen`). They type `params`, `searchParams`, and `children` for that route, so you don't have to write them by hand.

### Navigation

Use `Link` from `next/link` (client-side navigation with automatic prefetching):

```tsx
<Link href="/blog/hello-world">Read</Link>
```

In client components: `useRouter()`, `usePathname()`, `useSearchParams()` from `next/navigation`. On the server: `redirect('/login')` and `notFound()`.

---

## 4. Server Components and Client Components

The most important idea in modern Next.js.

**By default every component in `app/` is a Server Component.** It runs only on the server: it can be `async`, read a database, use secrets, and ships **no JavaScript** to the browser for itself.

```tsx
// app/blog/posts.tsx: a Server Component
import Link from 'next/link';

type Post = { id: number; title: string };

export async function PostList() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10');
  if (!res.ok) throw new Error('Failed to load posts');
  const posts = (await res.json()) as Post[];

  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}><Link href={`/blog/${p.id}`}>{p.title}</Link></li>
      ))}
    </ul>
  );
}
```

No `useEffect`, no loading state, no client-side fetch. (Section 5 shows where to render it.)

To use interactivity, state, effects, event handlers, or browser APIs, add **`'use client'`** at the top of the file:

```tsx
// components/LikeButton.tsx
'use client';

import { useState } from 'react';

export function LikeButton() {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(!liked)}>{liked ? '♥' : '♡'}</button>;
}
```

### What can each do?

| | Server Component | Client Component |
|---|---|---|
| `async`/`await` directly | Yes | No |
| Access DB, file system, secrets | Yes | Never (it ships to the browser) |
| `useState`, `useEffect`, `useReducer` | No | Yes |
| Event handlers (`onClick`) | No | Yes |
| Browser APIs (`window`, `localStorage`) | No | Yes |
| Context providers and consumers | No (can render providers) | Yes |
| JavaScript sent to the browser | None for itself | Yes |

Client components are still **pre-rendered to HTML on the server**, then hydrated in the browser. "Client" means "also runs in the browser", not "only in the browser".

### Rules of composition

- `'use client'` marks a **boundary**: that file and everything it imports becomes client code. Keep it as **low in the tree** as possible (just the interactive leaf: the button, not the whole page)
- A server component can import and render client components
- A client component **cannot import** a server component, but it can receive one as `children` or a prop (the server renders it, the client just places it)
- Props passed from server to client must be **serializable** (strings, numbers, plain objects, arrays, Dates). Not functions (except Server Actions) or class instances
- Wrap third-party libraries that use hooks in your own `'use client'` file

```tsx
// Server component page
<ClientSidebar>
  <ServerRenderedStats />   {/* stays a server component */}
</ClientSidebar>
```

### Keep secrets safe

Code in server components can read `process.env.DATABASE_URL`. Code in client components cannot (and should never contain secrets). Only variables prefixed `NEXT_PUBLIC_` reach the browser, and by definition they are public. Add `import 'server-only'` to modules that must never be imported by client code, and the build fails if they are.

---

## 5. Rendering: the static shell, Suspense, and streaming

With Cache Components (the default since 16.4), every route is rendered in two parts:

1. **The static shell**, prerendered at build time and served instantly (even from a CDN): everything that doesn't depend on the request or on fresh data
2. **Dynamic parts**, rendered at request time and **streamed** into `<Suspense>` boundaries

This is called **Partial Prerendering (PPR)**. What decides which part a component belongs to?

| The component... | It becomes |
|------------------|------------|
| Only uses props, imports, and pure computation | Part of the static shell, automatically |
| Fetches data or awaits anything async **without** `'use cache'` | Dynamic: must be inside `<Suspense>` |
| Reads `cookies()`, `headers()`, `searchParams`, or a non-prerendered `params` | Dynamic: must be inside `<Suspense>` |
| Uses `'use cache'` | Cached, and included in the static shell |

**Dynamic data must be behind a `<Suspense>` boundary** (or cached). If it isn't, the dev overlay shows a **blocking-route** error, and the build fails, telling you which component to fix. That's on purpose: it keeps every page able to show its shell instantly.

```tsx
// app/blog/page.tsx
import { Suspense } from 'react';
import { PostList } from './posts';

export default function BlogPage() {
  return (
    <>
      <h1>Blog</h1>                                    {/* static shell */}
      <Suspense fallback={<p>Loading posts…</p>}>      {/* fallback is in the shell */}
        <PostList />                                   {/* streams in at request time */}
      </Suspense>
    </>
  );
}
```

`loading.tsx` is the same idea applied to a whole route segment: a Suspense boundary around the page.

### Push dynamic work down the tree

The deeper the async work sits, the more of the page can be prerendered. Instead of awaiting at the top of a page, await inside a small child wrapped in `Suspense`. That keeps the heading, navigation, and layout in the instant shell.

### Parallel fetching

Avoid waterfalls: start independent requests together.

```tsx
const [post, comments] = await Promise.all([getPost(id), getComments(id)]);
```

Or give each slow part its own `Suspense` boundary so they stream in independently.

### Random values and time

`Math.random()`, `Date.now()`, and `crypto.randomUUID()` give a different answer every time, so Next.js asks you to decide: call `await connection()` (from `next/server`) first and wrap the component in `Suspense` to get a value **per request**, or use `'use cache'` to share one value.

### Client-side data

Interactive, frequently-updated, or user-driven data (infinite scroll, live search) is still a job for TanStack Query in a client component. Next.js doesn't replace it. It reduces how much you need it.

---

## 6. Caching with `'use cache'`

Caching is **opt-in**. Add the `'use cache'` directive to an async function or component to store its result and reuse it:

```ts
// features/posts/data.ts
import { cacheLife, cacheTag } from 'next/cache';

export async function getPosts() {
  'use cache';
  cacheLife('hours');      // how long the result stays fresh
  cacheTag('posts');       // a label you can invalidate later

  const res = await fetch('https://jsonplaceholder.typicode.com/posts');
  if (!res.ok) throw new Error('Failed to load posts');
  return (await res.json()) as Post[];
}
```

- **Arguments become part of the cache key**, so `getPost('1')` and `getPost('2')` are cached separately
- Pair every `'use cache'` with a `cacheLife` profile (`'seconds'`, `'minutes'`, `'hours'`, `'days'`, `'weeks'`, `'max'`, or your own). Without one, a default applies
- Cached results become part of the **static shell**, so a page that only uses cached data is instant
- You can cache a whole component or page by putting `'use cache'` at the top of its body
- A cached function **can't read** `cookies()` or `headers()` directly. Read them outside, and pass the value in as an argument (it then becomes part of the key)
- Cached values must be serializable

Use it for data that's the same for many users and changes occasionally: blog posts, product catalogs, settings. Don't cache per-user or rapidly changing data unless you understand the key.

> **Older tutorials** describe the *previous* caching model: `fetch(url, { next: { revalidate: 60 } })`, `export const dynamic = 'force-dynamic'`, `export const revalidate = 60`, and `unstable_cache`. Those belong to apps without Cache Components. If your `next.config.ts` has `cacheComponents: true`, use `'use cache'`, `cacheLife`, and `cacheTag` instead.

---

## 7. Dynamic routes, params, and search params

```tsx
// app/blog/[slug]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';

export default function PostPage({ params }: PageProps<'/blog/[slug]'>) {
  return (
    <Suspense fallback={<PostSkeleton />}>
      <Post params={params} />
    </Suspense>
  );
}

async function Post({ params }: Pick<PageProps<'/blog/[slug]'>, 'params'>) {
  const { slug } = await params;
  const post = await getPost(slug);   // a 'use cache' function
  if (!post) notFound();

  return <article><h1>{post.title}</h1></article>;
}
```

`params` and `searchParams` are **Promises** you must `await`. Passing the promise down and awaiting it inside the Suspense boundary keeps the rest of the page in the static shell.

Pre-render known pages at build time with `generateStaticParams`. Any other slug is served the shell immediately and filled in on first visit:

```tsx
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}
```

Search params (`/blog?page=2`) work the same way: `await searchParams` inside a component wrapped in `Suspense`.

---

## 8. Loading and error UI

```tsx
// app/blog/loading.tsx
export default function Loading() { return <PostListSkeleton />; }

// app/blog/error.tsx
'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// app/blog/[slug]/not-found.tsx
export default function NotFound() { return <h1>Post not found</h1>; }
```

These use the Suspense and error boundary concepts from Lesson 18, wired automatically by file convention. `error.tsx` must be a client component. In production, server error messages are hidden from the client (only a `digest` is sent), because the details could leak internals. Check the `error.tsx` docs for your version, since the props of this file have been evolving.

---

## 9. Metadata and SEO

```tsx
import type { Metadata } from 'next';

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return {
    title: post?.title ?? 'Not found',
    description: post?.excerpt,
    openGraph: { title: post?.title, images: ['/og.png'] },
  };
}
```

A static `export const metadata = {...}` works for fixed pages. Add `sitemap.ts` and `robots.ts` files for crawlers, and `opengraph-image.tsx` to generate social preview images. Use cached data in `generateMetadata` so the title can be part of the shell.

---

## 10. Images, fonts, and styles

```tsx
import Image from 'next/image';

<Image src="/hero.jpg" alt="Our team at work" width={1200} height={600} priority />
```

`next/image` resizes, serves modern formats, lazy-loads, and prevents layout shift. Use `priority` for the above-the-fold LCP image. For remote images, allow the domain in `next.config.ts` with `images.remotePatterns` (the old `images.domains` is deprecated).

```tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
<body className={inter.className}>
```

`next/font` self-hosts fonts at build time with no layout shift and no request to Google at runtime. Tailwind works as in the Vite setup. CSS Modules (`*.module.css`) are also supported.

---

## 11. Server Actions: mutations without an API

A **Server Action** is an async function marked `'use server'` that runs on the server and can be called from forms and event handlers:

```tsx
// app/posts/actions.ts
'use server';

import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const schema = z.object({ title: z.string().min(3), body: z.string().min(1) });

export async function createPost(prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = schema.safeParse({ title: formData.get('title'), body: formData.get('body') });
  if (!parsed.success) return { error: 'Please check the title and body.' };

  await db.post.create({ data: parsed.data });
  updateTag('posts');                 // expire everything cached with cacheTag('posts')
  redirect('/posts');
}
```

```tsx
// app/posts/new/NewPostForm.tsx
'use client';

import { useActionState } from 'react';
import { createPost } from '../actions';

export function NewPostForm() {
  const [state, action, isPending] = useActionState(createPost, undefined);
  return (
    <form action={action}>
      <input name="title" required />
      <textarea name="body" required />
      {state?.error && <p role="alert">{state.error}</p>}
      <button disabled={isPending}>{isPending ? 'Saving…' : 'Create'}</button>
    </form>
  );
}
```

### Refreshing data after a mutation

| API | Where | What it does |
|-----|-------|--------------|
| `updateTag('posts')` | Server Actions only | Expires the tag **and** shows fresh data immediately ("read your own writes"). Best for forms |
| `revalidateTag('posts', 'max')` | Actions and route handlers | Marks the tag stale. Visitors get the cached version while it refreshes in the background. **Needs the second argument** (a `cacheLife` profile) since Next.js 16 |
| `revalidatePath('/posts')` | Actions and route handlers | Refreshes everything rendered for a path |
| `refresh()` | Server Actions only | Re-renders **uncached** data on the page (like a notification count) without touching the cache |

Important:

- The client sends a request to the server; the function runs there. It's a **public HTTP endpoint** under the hood. Treat input as **untrusted**: validate with Zod and **check authentication and authorization inside every action** (Lesson 23)
- Forms using actions work even before JavaScript loads (progressive enhancement)
- `useActionState` (React 19) gives you the returned state and a pending flag. `useFormStatus` gives the pending state to a child button
- `redirect()` works by throwing, so don't call it inside a `try/catch`
- Actions are for mutations. For reading, use server components

---

## 12. Environment variables

```
# .env.local   (never commit this)
DATABASE_URL=postgres://...
NEXT_PUBLIC_SITE_NAME=My Blog
```

- `process.env.DATABASE_URL` works only on the server
- `NEXT_PUBLIC_*` values are inlined into the browser bundle, so they must not be secret
- Commit a `.env.example` with names and dummy values
- Restart the dev server after changing env files

---

## 13. Route handlers

When you need a real HTTP endpoint (webhooks, mobile clients, third parties):

```ts
// app/api/health/route.ts
export async function GET() {
  return Response.json({ ok: true });
}

export async function POST(request: Request) {
  const body = await request.json();
  return Response.json({ received: body }, { status: 201 });
}
```

Prefer server components for reading your own data and Server Actions for your own forms. With Cache Components, `GET` handlers follow the same prerendering rules as pages.

---

## 14. `proxy.ts` (formerly `middleware.ts`)

`proxy.ts` at the project root (or in `src/`) runs **before** a request is handled: redirects, rewrites, headers, quick auth checks. Since Next.js 16 it replaces `middleware.ts` and runs on the Node.js runtime:

```ts
// src/proxy.ts
import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  if (!request.cookies.has('session')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = { matcher: ['/dashboard/:path*'] };
```

Keep it light. It's a convenience for redirects, **never** your only authorization check (Lesson 23). If a tutorial shows `middleware.ts`, rename the file to `proxy.ts` and the function to `proxy`. The old name still works on the Edge runtime but is deprecated.

---

## 15. Next.js and what you already know

| Vite SPA | Next.js (App Router) |
|----------|----------------------|
| React Router | File-based routing, `Link`, layouts |
| `useEffect` + fetch / TanStack Query | `async` server components in `Suspense` (plus TanStack Query for interactive data) |
| TanStack Query cache | `'use cache'` + `cacheLife` + `cacheTag` on the server |
| Zod + React Hook Form + API | Zod + Server Actions (plus RHF for rich forms) |
| `React.lazy` | Automatic route splitting, `next/dynamic` |
| Error boundaries + Suspense | `error.tsx`, `loading.tsx`, and your own `Suspense` boundaries |
| Zustand / context | Same, in **client components** only |
| `index.html` metadata | `metadata` / `generateMetadata` |

Everything from Lessons 01 to 21 still applies inside client components.

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| Putting `'use client'` at the top of every file | You lose server benefits and ship more JavaScript |
| Using hooks or `onClick` in a server component | Build error: "You're importing a component that needs useState..." |
| Fetching or reading `cookies()` outside `<Suspense>` (and without `'use cache'`) | A blocking-route error in dev and a failed build |
| Reading `cookies()` inside a `'use cache'` function | Error. Read it outside and pass the value in |
| Not awaiting `params`/`searchParams`/`cookies()` | Type errors. They're Promises |
| Importing a server-only module (DB client, secrets) in a client component | Leaks or build errors. Use `server-only` |
| Passing functions or class instances from server to client props | Serialization error |
| Sequential fetching when requests are independent | Slow waterfalls. Use `Promise.all` or separate Suspense boundaries |
| Trusting Server Action input and skipping auth checks | Server Actions are public endpoints |
| Putting secrets in `NEXT_PUBLIC_*` | Exposed to every visitor |
| Using `window` or `localStorage` during server render | `ReferenceError`. Use effects, or a client-only component |
| `revalidateTag('posts')` with one argument | Deprecated in 16. Use `updateTag` in actions, or `revalidateTag(tag, 'max')` |
| Following "previous model" caching tutorials (`export const dynamic`, `fetch(..., { next: { revalidate } })`) | Doesn't apply with Cache Components |
| Creating `middleware.ts` or running `next lint` from an old tutorial | Renamed to `proxy.ts`; `next lint` was removed |
| Following a Pages Router tutorial (`getServerSideProps`, `pages/`) | A different, older system |
| Forgetting `<Link>` and using `<a>` for internal links | Full page reloads |

---

## Key takeaways

- Next.js is React plus routing, server rendering, data fetching, and a build/deploy story.
- The folder structure in `app/` is the route structure. Layouts, `loading`, `error`, and `not-found` are conventions.
- Components are **server components by default**. Add `'use client'` only on interactive leaves.
- Each page has an instant **static shell**. Dynamic data and request data (`cookies`, `searchParams`) go inside `<Suspense>` and stream in.
- Caching is opt-in with `'use cache'`, `cacheLife`, and `cacheTag`. After a mutation, use `updateTag`, `revalidateTag(tag, profile)`, `revalidatePath`, or `refresh()`.
- Server Actions replace hand-written API routes for mutations, but validate and authorize every call.
- `proxy.ts` replaces `middleware.ts`. Only `NEXT_PUBLIC_` variables reach the browser.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to [Lesson 23: Authentication basics](../23-authentication-basics/README.md).
