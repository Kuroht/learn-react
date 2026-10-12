# Lesson 22: Next.js Basics

**Goal:** move from a client-only single-page app to a full-stack React framework. You'll learn the App Router, server and client components, data fetching on the server, layouts and loading UI, metadata, and server actions.

**Time:** about 3 to 4 hours

**Prerequisite:** [Lesson 21](../21-architecture-and-project-structure/README.md)

> **Last verified:** October 2026. **Next.js changes fast**, including caching defaults, file conventions, and APIs across major versions (13, 14, 15, 16). Everything here follows the **App Router**. Always check [nextjs.org/docs](https://nextjs.org/docs) for your installed version, and treat any tutorial older than a year with suspicion. Where this lesson is version-sensitive, it says so.

---

## What you will learn

- What a framework adds on top of Vite + React
- Creating a Next.js project
- File-based routing in the `app/` directory
- Layouts, pages, and nested routes
- Server Components vs Client Components
- Fetching data in server components
- Loading UI, streaming, and error handling
- Dynamic routes, search params, and `not-found`
- Metadata and SEO
- Images, fonts, and links
- Server Actions for mutations
- Environment variables
- Caching: the concepts, not the details
- Rendering strategies: static, dynamic, and streaming

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
| Built-in optimizations | Images, fonts, code splitting, prefetching |
| Backend routes | `route.ts` handlers for APIs and webhooks |
| Deployment | First-class hosting on Vercel, and runs on Node anywhere |

Trade-off: more concepts, a server to run, and the "which side is this code on?" question. For dashboards behind a login with no SEO needs, a Vite SPA can still be the better choice.

---

## 2. Create a project

```bash
npx create-next-app@latest my-app
```

Choose TypeScript, ESLint, Tailwind, the `src/` directory, and the **App Router**. Then:

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

Commands: `dev`, `build` (a production build, which prints which routes are static or dynamic), `start` (serve the build), `lint`.

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
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

### Navigation

Use `Link` from `next/link` (client-side navigation with automatic prefetching of visible links):

```tsx
<Link href="/blog/hello-world">Read</Link>
```

In client components: `useRouter()`, `usePathname()`, `useSearchParams()` from `next/navigation`. On the server: `redirect('/login')` and `notFound()`.

---

## 4. Server Components and Client Components

The most important idea in modern Next.js.

**By default every component in `app/` is a Server Component.** It runs only on the server: it can be `async`, read a database, use secrets, and ships **no JavaScript** to the browser for itself.

```tsx
// app/blog/page.tsx: a Server Component
import Link from 'next/link';

type Post = { id: number; title: string };

export default async function BlogPage() {
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

No `useEffect`, no loading state, no client-side fetch. The HTML arrives with the posts in it.

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

## 5. Data fetching

In server components, fetch where you need the data:

```tsx
async function getPost(id: string): Promise<Post | null> {
  const res = await fetch(`https://api.example.com/posts/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load post');
  return res.json();
}
```

You can also query a database directly (Prisma, Drizzle), read files, or call internal services. No API layer needed for your own pages.

### Parallel fetching

Avoid waterfalls: start independent requests together.

```tsx
const [post, comments] = await Promise.all([getPost(id), getComments(id)]);
```

### Streaming with Suspense

Don't block the whole page on the slowest request. Wrap slow parts in `Suspense`, and the rest streams to the user right away:

```tsx
export default async function Page() {
  return (
    <>
      <h1>Dashboard</h1>             {/* appears immediately */}
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />                    {/* an async server component that streams in */}
      </Suspense>
    </>
  );
}
```

`loading.tsx` is the same idea applied to a whole route segment.

### Client-side data

Interactive, frequently-updated, or user-driven data (infinite scroll, live search) is still a job for TanStack Query in a client component. Next.js doesn't replace it. It reduces how much you need it.

---

## 6. Dynamic routes, params, and search params

```tsx
// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

export default async function PostPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const post = await getPost(slug);
  if (!post) notFound();

  return <article><h1>{post.title}</h1></article>;
}
```

Version note: in Next.js 15 and later `params` and `searchParams` are **Promises** you `await` (in 13 and 14 they were plain objects). Check your version's docs. Using `searchParams` makes the page dynamic (rendered per request).

Pre-generate known pages at build time with `generateStaticParams`:

```tsx
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}
```

---

## 7. Loading and error UI

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

These use the Suspense and error boundary concepts from Lesson 18, wired automatically by file convention. `error.tsx` must be a client component. In production, server error messages are hidden from the client (only a `digest` is sent), because the details could leak internals.

---

## 8. Metadata and SEO

```tsx
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return {
    title: post?.title ?? 'Not found',
    description: post?.excerpt,
    openGraph: { title: post?.title, images: ['/og.png'] },
  };
}
```

A static `export const metadata = {...}` works for fixed pages. Add `sitemap.ts` and `robots.ts` files for crawlers, and `opengraph-image.tsx` to generate social preview images.

---

## 9. Images, fonts, and styles

```tsx
import Image from 'next/image';

<Image src="/hero.jpg" alt="Our team at work" width={1200} height={600} priority />
```

`next/image` resizes, serves modern formats, lazy-loads, and prevents layout shift. Use `priority` for the above-the-fold LCP image. For remote images, allow the domain in `next.config.ts` (`images.remotePatterns`).

```tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
<body className={inter.className}>
```

`next/font` self-hosts fonts at build time with no layout shift and no request to Google at runtime. Tailwind works as in the Vite setup. CSS Modules (`*.module.css`) are also supported.

---

## 10. Server Actions: mutations without an API

A **Server Action** is an async function marked `'use server'` that runs on the server and can be called from forms and event handlers:

```tsx
// app/posts/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const schema = z.object({ title: z.string().min(3), body: z.string().min(1) });

export async function createPost(prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = schema.safeParse({ title: formData.get('title'), body: formData.get('body') });
  if (!parsed.success) return { error: 'Please check the title and body.' };

  await db.post.create({ data: parsed.data });
  revalidatePath('/posts');            // refresh cached data for that page
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

Important:

- The client sends a request to the server; the function runs there. It's a **public HTTP endpoint** under the hood. Treat input as **untrusted**: validate with Zod and **check authentication and authorization inside every action**
- Forms using actions work even before JavaScript loads (progressive enhancement)
- `useActionState` (React 19) gives you the returned state and pending flag. `useFormStatus` gives pending state to a child button
- After mutating, call `revalidatePath` / `revalidateTag` so cached pages refresh
- Actions are for mutations. For reading, use server components

---

## 11. Environment variables

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

## 12. Caching and rendering: the mental model

Next.js decides per route whether to render at **build time** (static) or **request time** (dynamic):

| Strategy | When rendered | Good for |
|----------|---------------|----------|
| Static | At build time (or revalidated periodically) | Marketing pages, docs, blog posts |
| Dynamic | On every request | Personalized pages, anything reading cookies, headers, or `searchParams` |
| Streaming | Dynamic + `Suspense` pieces arriving progressively | Dashboards with slow widgets |

Using request-specific APIs (`cookies()`, `headers()`, `searchParams`) makes a route dynamic. `npm run build` prints a symbol next to each route telling you which it is.

**Caching is the most version-dependent part of Next.js.** Defaults for `fetch` caching, route caching, and the client router cache changed across 14, 15, and 16, and newer versions add explicit opt-in caching APIs. Learn the principle (static where possible, dynamic where needed, revalidate after mutations, tag data you want to refresh) and read the caching docs for your version before relying on specifics.

---

## 13. API routes (route handlers)

When you need a real HTTP endpoint (webhooks, mobile clients, third parties):

```ts
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ received: body }, { status: 201 });
}
```

Prefer server components for reading your own data and server actions for your own forms.

---

## 14. Middleware / proxy

Code that runs before a request is handled: redirects, rewrites, auth checks, headers. It's a single file at the project root (`middleware.ts`; newer versions rename or evolve this concept, so check your version's docs). Keep it light, and never make it your *only* authorization check (Lesson 23).

---

## 15. Next.js and what you already know

| Vite SPA | Next.js (App Router) |
|----------|----------------------|
| React Router | File-based routing, `Link`, layouts |
| `useEffect` + fetch / TanStack Query | `async` server components (plus TanStack Query for interactive data) |
| Zod + React Hook Form + API | Zod + Server Actions (plus RHF for rich forms) |
| `React.lazy` | Automatic route splitting, `next/dynamic` |
| Error boundaries + Suspense | `error.tsx`, `loading.tsx` |
| Zustand / context | Same, in **client components** only |
| `index.html` metadata | `metadata` / `generateMetadata` |

Everything from Lessons 01 to 21 still applies inside client components.

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| Putting `'use client'` at the top of every file | You lose server benefits and ship more JavaScript |
| Using hooks or `onClick` in a server component | Build error: "You're importing a component that needs useState..." |
| Importing a server-only module (DB client, secrets) in a client component | Leaks or build errors. Use `server-only` |
| Not awaiting `params`/`searchParams` in new versions | Warnings or errors |
| Passing functions or class instances from server to client props | Serialization error |
| Fetching sequentially when requests are independent | Slow waterfalls. Use `Promise.all` or Suspense |
| Trusting Server Action input and skipping auth checks | Server actions are public endpoints |
| Putting secrets in `NEXT_PUBLIC_*` | Exposed to every visitor |
| Using `window` or `localStorage` during server render | `ReferenceError`. Use effects, or a client-only component |
| Hydration mismatch (rendering `Date.now()`/random values directly) | Console errors and flicker |
| Following a Pages Router tutorial (`getServerSideProps`, `pages/`) | A different, older system |
| Assuming caching behaves the same across versions | Stale or never-cached data. Read the docs for your version |
| Forgetting `<Link>` and using `<a>` for internal links | Full page reloads |

---

## Key takeaways

- Next.js is React plus routing, server rendering, data fetching, and a build/deploy story.
- The folder structure in `app/` is the route structure. Layouts, `loading`, `error`, and `not-found` are conventions.
- Components are **server components by default**. Add `'use client'` only on interactive leaves.
- Fetch data directly in async server components, in parallel, with Suspense for streaming.
- Server Actions replace hand-written API routes for mutations, but validate and authorize every call.
- Only `NEXT_PUBLIC_` variables reach the browser, and nothing secret belongs in client code.
- Caching rules change by version. Know the concepts and read the docs.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to [Lesson 23: Authentication basics](../23-authentication-basics/README.md).
