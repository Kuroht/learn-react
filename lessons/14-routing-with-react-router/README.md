# Lesson 14: Routing with React Router

**Goal:** turn a single-page app into a multi-page experience with real URLs. You'll learn routes, links, nested layouts, dynamic parameters, search params, navigation, and loaders.

**Time:** about 3 hours

**Prerequisite:** [Lesson 13](../13-custom-hooks/README.md)

> **Last verified:** October 2026, with React Router 8 (8.4). The API has changed a lot between versions and many tutorials are outdated. Check [reactrouter.com](https://reactrouter.com) if anything here doesn't match what you see.
>
> React Router has three **modes**: *declarative* (`<BrowserRouter>` and `<Routes>`), *data* (`createBrowserRouter` with loaders and actions), and *framework* (a full-stack framework with file routes and server rendering). This lesson uses **data mode**. Framework mode is covered in the optional [Lesson 25](../25-react-router-framework-mode/README.md).

---

## What you will learn

- Why routing matters (URLs, back button, sharing links)
- Installing React Router and defining routes
- `Link` and `NavLink`
- Nested routes and layouts with `Outlet`
- Dynamic segments with `useParams`
- Search params for filters with `useSearchParams`
- Programmatic navigation and redirects
- A "not found" page
- Loaders and actions (data mode)
- Error handling per route
- Lazy loading routes

---

## 1. Why routing?

Without a router, your app has one URL. With one:

- Each screen has its own address you can bookmark and share
- The browser's back and forward buttons work
- Refreshing keeps you where you are
- Search engines and analytics can tell pages apart

A client-side router changes the URL and swaps components **without reloading the page**.

---

## 2. Setup

```bash
npm install react-router
```

React Router 8 needs Node 22+ and React 19.2+. Everything comes from the `react-router` package, and DOM-specific pieces like `RouterProvider` come from `react-router/dom`. The old `react-router-dom` package was **removed in v8**. If a tutorial tells you to install it, it's out of date.

```tsx
// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/about', element: <AboutPage /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
```

A route is an object: when the URL matches `path`, React Router renders `element`.

---

## 3. Links

Never use `<a href>` for internal navigation, because it reloads the whole page. Use `Link`:

```tsx
import { Link, NavLink } from 'react-router';

<Link to="/about">About</Link>

<NavLink
  to="/products"
  className={({ isActive }) => (isActive ? 'font-bold text-brand-600' : 'text-gray-600')}
>
  Products
</NavLink>
```

`NavLink` knows whether it matches the current URL, which is perfect for menus. `end` makes `/` match only exactly `/`:

```tsx
<NavLink to="/" end>Home</NavLink>
```

Both render a real `<a>`, so they're accessible and work with "open in new tab".

Use plain `<a>` only for external links (`https://...`), with `rel="noreferrer"` if you use `target="_blank"`.

---

## 4. Nested routes and layouts

Most apps have a shared shell (header, footer) around changing content. Nest routes under a **layout** route and render `Outlet` where the child should appear:

```tsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
```

```tsx
import { NavLink, Outlet } from 'react-router';

export function RootLayout() {
  return (
    <>
      <header>
        <nav>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/products">Products</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>© 2026</footer>
    </>
  );
}
```

- `index: true` is the default child, shown at the parent's exact path.
- Child paths are **relative** (no leading slash).
- `path: '*'` matches anything else: your 404 page.
- A route without `path` (just `element` and `children`) is a **pathless layout**, good for grouping pages that share a wrapper.

---

## 5. Dynamic segments

A segment starting with `:` is a parameter:

```tsx
{ path: 'products/:productId', element: <ProductPage /> }
```

```tsx
import { useParams } from 'react-router';

function ProductPage() {
  const { productId } = useParams();   // string | undefined
  const id = Number(productId);
  ...
}
```

`useParams` values are always **strings** (and typed as possibly `undefined`). Convert and validate them. If `Number(productId)` is `NaN`, show your not-found state.

Link to it with a template string: `<Link to={`/products/${product.id}`}>`.

---

## 6. Search params

Filters, sorting, and pagination belong in the URL's query string (`/products?category=books&sort=price`) so they survive reloads and can be shared:

```tsx
import { useSearchParams } from 'react-router';

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') ?? 'all';

  function handleCategory(next: string) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (next === 'all') params.delete('category');
      else params.set('category', next);
      return params;
    });
  }
  ...
}
```

- `get` returns `string | null`.
- The URL is now your **state**. Don't copy it into `useState`, just read from it (derived!).
- Validate: `category` could be anything the user typed in the address bar.

---

## 7. Navigating from code

```tsx
import { useNavigate, Navigate } from 'react-router';

const navigate = useNavigate();
navigate('/products');
navigate(-1);                       // back
navigate('/login', { replace: true }); // replace the current history entry

// In JSX, to redirect during render
if (!user) return <Navigate to="/login" replace />;
```

- Use `Link` for things the user clicks. Use `navigate` after an action finishes (a form submit, a login).
- `replace` avoids leaving the page in the back-button history, which is right for redirects after login.

Passing data to the next page: prefer URL params or shared state. `navigate(path, { state })` exists, but is invisible, lost when sharing a link, and untyped.

---

## 8. Loaders: data before rendering

In data mode, a route can declare how to load its data. The router calls the loader when navigating, in parallel for nested routes, and renders the component with the result:

```tsx
import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';

type Post = { id: number; title: string; body: string };

async function postLoader({ params, request }: LoaderFunctionArgs): Promise<Post> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${params.postId}`, {
    signal: request.signal,
  });
  if (!res.ok) throw new Response('Post not found', { status: 404 });
  return res.json() as Promise<Post>;
}

{ path: 'posts/:postId', loader: postLoader, element: <PostPage />, errorElement: <PostError /> }

function PostPage() {
  const post = useLoaderData<typeof postLoader>();
  return <article><h1>{post.title}</h1><p>{post.body}</p></article>;
}
```

Benefits:

- No `useEffect` fetching, no loading flicker inside the page, and no waterfall: loaders for the parent and child routes run together
- `request.signal` aborts when the user navigates away
- Throwing a `Response` triggers the route's `errorElement`

Types: pass the loader's type, `useLoaderData<typeof postLoader>()`, and React Router infers the return type from the loader. Without it you get `unknown`. Framework mode generates these types for you automatically (Lesson 25).

### Showing pending UI

```tsx
import { useNavigation } from 'react-router';

const navigation = useNavigation();
const isNavigating = navigation.state !== 'idle';   // 'idle' | 'loading' | 'submitting'
```

Show a top progress bar when `isNavigating` is true.

### Loaders or TanStack Query?

In Lesson 15 you'll learn TanStack Query for caching and background updates. Many teams use **both**: loaders pre-fetch into the query cache, and components read from the cache. For now, loaders are a simple, built-in way to fetch.

---

## 9. Actions: handling submissions

An action handles form submissions to a route:

```tsx
import { Form, redirect, type ActionFunctionArgs } from 'react-router';

async function createPostAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return { error: 'Title is required' };

  await savePost({ title });
  return redirect('/posts');
}

{ path: 'posts/new', action: createPostAction, element: <NewPost /> }

<Form method="post">
  <input name="title" />
  <button>Create</button>
</Form>
```

After an action, React Router automatically **revalidates** the loaders on the page, so lists update. `useActionData()` returns what the action returned (for errors).

We cover rich forms in Lesson 16. Know that this option exists.

---

## 10. Errors and 404s

```tsx
import { isRouteErrorResponse, useRouteError, Link } from 'react-router';

function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <section>
        <h1>{error.status === 404 ? 'Not found' : `Error ${error.status}`}</h1>
        <p>{error.statusText}</p>
        <Link to="/">Go home</Link>
      </section>
    );
  }

  return <p>Something went wrong.</p>;
}

{ path: '/', element: <RootLayout />, errorElement: <RouteError />, children: [...] }
```

An `errorElement` catches errors from rendering, loaders, and actions in that route and its children. Put one at the root and more specific ones where the UI can still partly work.

---

## 11. Lazy loading routes

Load a page's code only when someone visits it:

```tsx
{
  path: 'admin',
  lazy: async () => {
    const { AdminPage } = await import('./pages/AdminPage');
    return { Component: AdminPage };
  },
}
```

Vite splits the page into its own JavaScript file. Good for rarely visited or heavy pages.

---

## 12. Deployment note

With a client-side router, `/products/5` only exists inside your JavaScript. If a server receives a direct request for that URL, it needs to serve `index.html` for all paths (a "SPA fallback"). Vite's dev server does this. On Netlify add a `_redirects` file (`/* /index.html 200`), on Vercel add a rewrite. Lesson 24 covers this.

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| `<a href="/about">` for internal links | Full page reload, state lost |
| Forgetting `<Outlet />` in a layout | Child routes never appear |
| Leading slash in child paths (`/products`) | Treated as absolute. Use relative paths |
| Treating `useParams` values as numbers | They're strings. Convert and validate |
| Copying search params into `useState` | Two sources of truth that drift apart |
| Trusting query string values | Users can type anything. Validate against allowed values |
| No `*` route | Unknown URLs render a blank page |
| Passing important data via `navigate` state | Lost on refresh or when sharing |
| Using `navigate()` inside render | Side effect during render. Use `<Navigate>` or an effect |
| Following a v5 or v6 tutorial (`Switch`, `component=`) | The API changed. Use the current docs |
| Installing `react-router-dom` | Removed in v8. Install `react-router` and import `RouterProvider` from `react-router/dom` |
| Refreshing a deep link on a static host and getting a 404 | Needs the SPA fallback |

---

## Key takeaways

- Routes map URLs to components. Use `createBrowserRouter` with `RouterProvider`.
- Use `Link` and `NavLink` for internal navigation.
- Nested routes share layouts through `Outlet`. `index` is the default child and `*` the 404.
- `useParams` returns strings. `useSearchParams` makes the URL your state for filters.
- Loaders fetch data before rendering and actions handle form posts, with automatic revalidation.
- `errorElement` handles failures per route. `lazy` splits code by page.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to [Lesson 15: Data fetching with TanStack Query](../15-data-fetching-tanstack-query/README.md).
