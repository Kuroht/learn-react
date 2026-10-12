# Lesson 25: React Router Framework Mode

**Goal:** use React Router as a full-stack framework. You'll build server-rendered pages whose data loads on the server, handle forms with actions, get route types generated for you, and choose between server rendering, pre-rendering, and a plain SPA, all with the routing concepts you already know from Lesson 14.

**Time:** about 3 to 4 hours

**Prerequisite:** [Lesson 24](../24-cicd-and-deployment/README.md). This is part of the **optional Module 7**. You should have done [Lesson 14](../14-routing-with-react-router/README.md) (React Router data mode) and [Lesson 22](../22-nextjs-basics/README.md) (Next.js), because this lesson compares against both.

> **Last verified:** October 2026, with **React Router 8** (8.4), Vite 8, and Node 24. Framework mode is the successor to **Remix**: Remix v2 merged into React Router v7 in late 2024, and v8 (June 2026) made the v7 "future flags" the defaults (middleware on, ESM only, `react-router-dom` removed, Vite 7+ required). Many Remix tutorials still apply with renamed imports, but check [reactrouter.com](https://reactrouter.com) for anything that doesn't match.

---

## What you will learn

- The three React Router modes, and when framework mode makes sense
- Creating a framework-mode app
- `root.tsx`, `routes.ts`, and route modules
- Server `loader`s and `action`s, and how they differ from data mode
- Generated route types (`Route.LoaderArgs`, `Route.ComponentProps`)
- Forms that work without JavaScript: `<Form>`, `useFetcher`, pending UI
- Errors and 404s with `ErrorBoundary` and `data()`
- `meta`, `links`, and headers
- Sessions with cookies
- Middleware
- Rendering strategies: SSR, pre-rendering, and SPA mode
- Building and deploying

---

## 1. Three modes, one router

| Mode | What you use | You get |
|------|--------------|---------|
| **Declarative** | `<BrowserRouter>`, `<Routes>`, `<Route>` | URL matching and navigation. Nothing else |
| **Data** (Lesson 14) | `createBrowserRouter` with `loader` and `action` | Data loading, actions, pending UI, all in the browser |
| **Framework** (this lesson) | A Vite plugin, `routes.ts`, route modules | Everything above, plus server rendering, server-only code, type generation, code splitting, pre-rendering, and deployment adapters |

The big change from data mode: **loaders and actions run on the server.** They can read a database, use secrets, and set cookies, like Next.js Server Components and Server Actions. The components are ordinary React components (they all run on the server first and hydrate in the browser). There's no `'use client'` split to think about.

### Framework mode or Next.js?

Both are full-stack React frameworks. Rough differences:

| | React Router framework mode | Next.js App Router |
|---|---|---|
| Data loading | One `loader` per route, results passed as props | `async` Server Components anywhere in the tree |
| Mutations | `action` per route, `<Form>` posts to it | Server Actions (`'use server'`) |
| Mental model | Request → loaders → render. Close to the web platform (`Request`, `Response`, `FormData`) | Server and client component boundaries, caching directives |
| Caching | Standard HTTP caching (`Cache-Control` headers) | `'use cache'`, `cacheLife`, `cacheTag` |
| Bundler | Vite (your existing knowledge applies) | Turbopack |
| Hosting | Any Node server, plus adapters for Cloudflare, Netlify, Vercel, and more | Best on Vercel, runs on Node anywhere |

Neither is "better". Framework mode often feels easier if you liked Lesson 14 and want to stay close to plain web APIs.

---

## 2. Create an app

```bash
npx create-react-router@latest my-recipes
cd my-recipes
npm install
npm run dev        # http://localhost:5173
```

The default template includes TypeScript and Tailwind. Its layout:

```
app/
├── root.tsx              # the HTML document and the root route
├── routes.ts             # the route configuration
├── routes/
│   └── home.tsx          # a route module
└── app.css
public/
react-router.config.ts    # framework options (SSR, pre-rendering, ...)
vite.config.ts            # Vite with the reactRouter() plugin
```

`vite.config.ts` is a normal Vite config with React Router's plugin instead of `@vitejs/plugin-react`:

```ts
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
});
```

---

## 3. `routes.ts`: the route configuration

Routes are defined in one file, with helper functions:

```ts
// app/routes.ts
import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),                         // /
  route('about', 'routes/about.tsx'),               // /about

  layout('routes/auth-layout.tsx', [                // shared UI, no URL segment
    route('login', 'routes/login.tsx'),
  ]),

  ...prefix('recipes', [
    index('routes/recipes.tsx'),                    // /recipes
    route('new', 'routes/recipe-new.tsx'),          // /recipes/new
    route(':recipeId', 'routes/recipe.tsx'),        // /recipes/42
  ]),

  route('*', 'routes/not-found.tsx'),               // everything else
] satisfies RouteConfig;
```

- `route(path, file, children?)`: a URL and the module that handles it
- `index(file)`: the default child at the parent's URL
- `layout(file, children)`: wraps children in a layout (with `<Outlet />`) without adding a URL segment
- `prefix(path, children)`: adds a path prefix to a group of routes
- `:param` dynamic segments, `:param?` optional segments, `*` splats: the same patterns as Lesson 14

Prefer folder-based routing like Next.js? `@react-router/fs-routes` generates the config from file names with `flatRoutes()`. Explicit `routes.ts` is the default, and it's easy to read.

---

## 4. `root.tsx`: the document

The root route renders the whole HTML document:

```tsx
// app/root.tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse } from 'react-router';
import type { Route } from './+types/root';
import './app.css';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return <h1>{error.status} {error.statusText}</h1>;
  }
  return <h1>Something went wrong</h1>;
}
```

- `Layout` wraps both the normal app and the error boundary, so errors still get a full HTML page
- `<Meta />` and `<Links />` render each route's `meta` and `links` exports
- `<Scripts />` loads the JavaScript that hydrates the page. Without it, the page is plain server HTML
- `<ScrollRestoration />` restores scroll positions on back/forward

---

## 5. Route modules

Each file in `routes.ts` is a **route module**. It exports a component and, optionally, functions that React Router calls:

```tsx
// app/routes/recipe.tsx
import { data, Link } from 'react-router';
import type { Route } from './+types/recipe';
import { getRecipe } from '~/features/recipes/data.server';

export async function loader({ params }: Route.LoaderArgs) {
  const recipe = await getRecipe(params.recipeId);   // params.recipeId: string
  if (!recipe) throw data('Recipe not found', { status: 404 });
  return { recipe };
}

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: `${loaderData.recipe.title} | Recipes` }];
}

export default function RecipePage({ loaderData }: Route.ComponentProps) {
  const { recipe } = loaderData;   // fully typed from the loader's return value
  return (
    <article>
      <h1>{recipe.title}</h1>
      <p>{recipe.description}</p>
      <Link to="/recipes">All recipes</Link>
    </article>
  );
}
```

### Generated types

`import type { Route } from './+types/recipe'` imports **types that React Router generates** from `routes.ts` and your modules (into a `.react-router/` folder, which should be gitignored). You get:

- `Route.LoaderArgs`: `params` typed from the URL pattern (`recipeId: string`)
- `Route.ComponentProps`: `loaderData` and `actionData` typed from what your loader and action return
- `Route.ActionArgs`, `Route.MetaArgs`, `Route.ErrorBoundaryProps`, and more

No more `useLoaderData() as Recipe`. The dev server regenerates types automatically. In CI, run `react-router typegen` before `tsc` (the template's `typecheck` script does this).

### The available exports

| Export | Runs | Purpose |
|--------|------|---------|
| `default` | Server + browser | The route's component |
| `loader` | **Server only** | Load data for the page |
| `action` | **Server only** | Handle form submissions (POST, PUT, DELETE...) |
| `clientLoader` / `clientAction` | Browser only | Load or mutate in the browser (caches, browser APIs) |
| `ErrorBoundary` | Server + browser | UI when the loader, action, or component throws |
| `HydrateFallback` | Server | Shown while a `clientLoader` runs on first load |
| `meta` | Server + browser | `<title>` and `<meta>` tags |
| `links` | Server + browser | `<link>` tags (stylesheets, fonts, preloads) |
| `headers` | Server | HTTP headers for the response (for example `Cache-Control`) |
| `middleware` | Server | Code that runs before loaders and actions (section 10) |

### Server-only code

Loaders and actions are removed from the browser bundle, so anything they import that the component doesn't use never reaches the browser. To make sure a module can **never** be imported by browser code, name it `*.server.ts` (or put it in a `.server/` folder). The build fails if it leaks into the client. Database clients and secrets belong there.

---

## 6. Actions and forms

An action handles non-GET requests to the route's URL. A `<Form>` posts to it:

```tsx
// app/routes/recipe-new.tsx
import { Form, redirect, useNavigation } from 'react-router';
import { z } from 'zod';
import type { Route } from './+types/recipe-new';
import { createRecipe } from '~/features/recipes/data.server';

const schema = z.object({
  title: z.string().trim().min(3, 'Title needs at least 3 characters'),
  description: z.string().trim().min(10, 'Describe it in at least 10 characters'),
});

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }
  const recipe = await createRecipe(parsed.data);
  return redirect(`/recipes/${recipe.id}`);
}

export default function NewRecipe({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSaving = navigation.state === 'submitting';

  return (
    <Form method="post">
      <label htmlFor="title">Title</label>
      <input id="title" name="title" />
      {actionData?.errors.title && <p role="alert">{actionData.errors.title[0]}</p>}

      <label htmlFor="description">Description</label>
      <textarea id="description" name="description" />
      {actionData?.errors.description && <p role="alert">{actionData.errors.description[0]}</p>}

      <button disabled={isSaving}>{isSaving ? 'Saving…' : 'Create recipe'}</button>
    </Form>
  );
}
```

What happens on submit:

1. With JavaScript: React Router sends the form with `fetch`, runs the action on the server, then **automatically re-runs the loaders** on the page so everything shows fresh data. No cache to invalidate by hand.
2. Without JavaScript (or before it loads): it's a normal HTML form post, and the server responds with the new page. **Progressive enhancement for free.**

`actionData` is typed from the action's return value. Validate everything on the server, because the action is a public endpoint (Lesson 23).

### `useFetcher`: mutations without navigation

For small interactions that shouldn't change the URL (a favorite button, a like, inline edits):

```tsx
const fetcher = useFetcher();
const isFavorite = fetcher.formData
  ? fetcher.formData.get('favorite') === 'true'   // optimistic: show the pending value
  : recipe.favorite;

<fetcher.Form method="post" action={`/recipes/${recipe.id}/favorite`}>
  <button name="favorite" value={String(!isFavorite)} aria-pressed={isFavorite}>
    {isFavorite ? '★ Saved' : '☆ Save'}
  </button>
</fetcher.Form>
```

Each fetcher has its own pending state, and the optimistic value comes straight from the submitted form data.

### Pending and search UI

- `useNavigation()`: `'idle' | 'loading' | 'submitting'` for page navigations and forms
- `<Form method="get">` updates the URL's search params, which re-runs the loader: a server-rendered search box with no extra code
- `<Link prefetch="intent">` loads a page's data and code when the user hovers or focuses the link

---

## 7. Errors and not-found

Throw a response from a loader or action to show the nearest `ErrorBoundary`:

```ts
import { data } from 'react-router';

if (!recipe) throw data('Recipe not found', { status: 404 });
```

`data(value, { status, headers })` is the helper for returning or throwing a value with an HTTP status. Each route can export its own `ErrorBoundary`. If it doesn't, the error bubbles up to the parent's, and finally to `root.tsx`'s. Thrown `Response`/`data()` errors are "expected" (404, 403); anything else is a bug. In production, unexpected error messages are hidden from users.

A catch-all `route('*', 'routes/not-found.tsx')` whose loader throws a 404 gives unknown URLs a proper 404 **status code**, which matters for SEO.

---

## 8. `meta`, `links`, and `headers`

```ts
export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: loaderData.recipe.title },
    { name: 'description', content: loaderData.recipe.description },
  ];
}

export function headers() {
  return { 'Cache-Control': 'public, max-age=60, s-maxage=300' };
}
```

Since React 19, you can also render `<title>` and `<meta>` directly inside your component, and React moves them into `<head>`. Either approach works.

Caching in framework mode is **plain HTTP**: set `Cache-Control` headers and let the browser or CDN cache responses. There's no framework cache to learn.

---

## 9. Sessions and cookies

Loaders and actions receive the real `Request`, so they can read and set cookies. React Router includes session helpers:

```ts
// app/features/auth/session.server.ts
import { createCookieSessionStorage } from 'react-router';

type SessionData = { userId: string };

export const sessionStorage = createCookieSessionStorage<SessionData>({
  cookie: {
    name: '__session',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    secrets: [process.env.SESSION_SECRET!],   // signs the cookie; keep it secret
  },
});
```

```ts
// in an action, after checking the password
const session = await sessionStorage.getSession(request.headers.get('Cookie'));
session.set('userId', user.id);
return redirect('/recipes', {
  headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
});
```

Cookie sessions store the data **in** the (signed) cookie. For server-side sessions you can revoke, use `createSessionStorage` with your own database. Everything from Lesson 23 applies: `HttpOnly`, `Secure`, `SameSite`, and authorization checks in **every** loader and action.

---

## 10. Middleware

Middleware runs before a route's loaders and actions (and wraps the response). It's enabled by default since v8. A typical use is loading the current user once and sharing it:

```ts
// app/features/auth/context.ts
import { createContext } from 'react-router';
export const userContext = createContext<User | null>(null);
```

```ts
// app/routes/dashboard-layout.tsx
import { redirect } from 'react-router';
import type { Route } from './+types/dashboard-layout';

const requireUserMiddleware: Route.MiddlewareFunction = async ({ request, context }) => {
  const user = await getUserFromRequest(request);
  if (!user) throw redirect('/login');
  context.set(userContext, user);
};

export const middleware: Route.MiddlewareFunction[] = [requireUserMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const user = context.get(userContext);   // already checked
  return { user };
}
```

Middleware on a parent route runs for all its children, which is a convenient place for "must be logged in". Still check **ownership** in each loader and action (user A must not read user B's recipe). The exact middleware type names have changed between versions, so check the [middleware docs](https://reactrouter.com/how-to/middleware) for yours.

---

## 11. Rendering strategies

Configured in `react-router.config.ts`:

```ts
import type { Config } from '@react-router/dev/config';

export default {
  ssr: true,                                 // render pages on the server per request
  prerender: ['/', '/about'],                // also render these to static HTML at build time
} satisfies Config;
```

| Strategy | Config | Good for |
|----------|--------|----------|
| **Server rendering (SSR)** | `ssr: true` (the default) | Dynamic, personalized, or frequently changing pages |
| **Pre-rendering** | `prerender: [...]` (or `prerender: true` for all static paths, or an async function) | Marketing pages, docs, blogs. Static HTML you can serve from a CDN |
| **SPA mode** | `ssr: false` | Apps behind a login with no SEO needs. Builds static files like a Vite SPA; use `clientLoader` instead of `loader` |

You can mix them: pre-render the public pages and server-render the rest.

---

## 12. Build and deploy

```bash
npm run build      # outputs build/client (static assets) and build/server (the server bundle)
npm start          # runs the production server (react-router-serve)
```

- Any host that runs Node works: a VPS, Docker (the template includes a `Dockerfile`), Railway, Fly.io, Render
- Adapters and templates exist for Cloudflare, Netlify, Vercel, and others. Check the [deployment docs](https://reactrouter.com/start/framework/deploying)
- Environment variables are read on the server with `process.env`. Only pass to the browser what you return from a loader (and never secrets)
- Use your Lesson 24 pipeline: `react-router typegen && tsc`, lint, tests, build

---

## 13. From data mode (Lesson 14) to framework mode

| Lesson 14 (data mode) | Framework mode |
|-----------------------|----------------|
| `createBrowserRouter([...])` in `main.tsx` | `app/routes.ts` |
| `element: <PostPage />` | The route module's default export |
| `loader` runs in the browser and fetches your API | `loader` runs on the server and can read the database directly |
| `useLoaderData<typeof loader>()` | `loaderData` prop, typed by generated `Route.ComponentProps` |
| `errorElement` | `export function ErrorBoundary` |
| `lazy: () => import(...)` | Automatic code splitting per route |
| `index.html` | `root.tsx` with `Layout` |
| Static hosting with an SPA fallback | A Node server, a static pre-render, or both |

React Router also has an incremental path: you can adopt framework features step by step from an existing data-mode app. See [reactrouter.com/upgrading/component-routes](https://reactrouter.com/upgrading/component-routes).

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| Installing `react-router-dom` or `@remix-run/*` from old tutorials | Removed or renamed. Use `react-router` and `@react-router/*` |
| Forgetting `<Scripts />` in `root.tsx` | The page renders but nothing is interactive |
| Importing a database client in a component | Bundling errors or leaked code. Keep it in `loader`/`action` and `*.server.ts` files |
| Using `useEffect` + `fetch` for page data | Waterfalls and loading spinners. Use the `loader` |
| Not validating `formData` in actions | Public endpoint with untrusted input |
| Checking auth only in a layout's middleware | Still need ownership checks in each loader and action |
| Returning secrets or whole DB rows from a loader | Everything a loader returns is sent to the browser. Return only what the page needs |
| Typing loader data by hand | Drifts from reality. Use the generated `Route` types |
| `.react-router/` committed to Git | Noise and conflicts. Gitignore it and run `react-router typegen` in CI |
| `useFetcher` for navigations, or `<Form>` for small inline actions | Wrong UX: use `<Form>` when the URL should change, `useFetcher` when it shouldn't |
| Expecting framework caching like Next.js | Framework mode caches with HTTP headers. Set `Cache-Control` |

---

## Key takeaways

- React Router has three modes. Framework mode adds server rendering, server-only loaders and actions, type generation, and deployment.
- `routes.ts` lists routes, `root.tsx` renders the document, and each route module exports a component plus `loader`, `action`, `meta`, and `ErrorBoundary` as needed.
- Loaders and actions run on the server, use web-standard `Request`/`Response`/`FormData`, and are public endpoints you must validate and authorize.
- After an action, loaders re-run automatically, so the UI stays in sync without cache management.
- Generated `Route` types connect URL params, loader data, and components with no manual typing.
- Choose SSR, pre-rendering, or SPA mode per app, and cache with plain HTTP headers.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Continue Module 7 with [Lesson 26: Mobile apps with Expo](../26-mobile-apps-with-expo/README.md), or go to the final project.
