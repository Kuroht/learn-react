# Lesson 14 Project: Multi-page Blog

Build a blog with a post list, search and pagination in the URL, post pages with comments, a category filter, and a custom 404.

> **Last verified:** October 2026, with React Router 8. Check [reactrouter.com](https://reactrouter.com) for the current API. Install `react-router` only (`react-router-dom` no longer exists in v8).

---

## Brief

A blog site with these pages:

| URL | Page |
|-----|------|
| `/` | Home with the latest 3 posts |
| `/posts` | All posts, with search, pagination, and filters in the URL |
| `/posts/:postId` | A single post with its comments |
| `/about` | About page |
| `/login`, `/admin` | A fake login and a protected page |
| anything else | A friendly 404 |

Use the [JSONPlaceholder](https://jsonplaceholder.typicode.com) API: `/posts`, `/posts/:id`, `/posts/:id/comments`, `/users/:id`. (`?_page=2&_limit=10` for pagination, and `?q=text` for search.)

Every stage ends with a **checkpoint**: something you should see in the browser.

---

## Getting started

```bash
cd lessons/14-routing-with-react-router/project
npm create vite@latest starter -- --template react-ts
cd starter
npm install
npm install react-router tailwindcss @tailwindcss/vite   # Tailwind is optional
npm run dev
```

Suggested structure:

```
src/
├── main.tsx
├── router.tsx
├── layouts/RootLayout.tsx
├── pages/ (HomePage, PostsPage, PostPage, AboutPage, LoginPage, AdminPage, NotFoundPage)
├── api/posts.ts
├── hooks/useAuth.tsx
└── types.ts
```

Work in your own branch: `git checkout -b yourname/lesson-14`

---

## Stage 1: Router and layout

- [ ] Routes defined in `router.tsx` with `createBrowserRouter`
- [ ] `RootLayout` with a header (logo, `NavLink`s with an active style), `<Outlet />`, and a footer
- [ ] Pages for Home, Posts (a placeholder), About, and a `*` route
- [ ] `RootLayout` has an `errorElement`

**Checkpoint:** navigating between pages never reloads (Network tab shows no document requests).

---

## Stage 2: API and types

In `src/api/posts.ts`:

- [ ] `Post`, `Comment`, and `User` types
- [ ] `fetchPosts({ page, limit, q, userId }, signal)` that returns the posts **and** the total count (read the `x-total-count` response header)
- [ ] `fetchPost(id, signal)`: throws a `Response` with status 404 if it's missing
- [ ] `fetchComments(postId, signal)`
- [ ] All check `res.ok`, none use `any`

**Checkpoint:** call each function in a scratch loader and print results.

---

## Stage 3: Posts list with URL state

- [ ] A `loader` for `/posts` that reads `page`, `q`, and `userId` from `request.url`
- [ ] Validate params: `page` must be a positive integer, otherwise default to 1
- [ ] `PostsPage` reads data with `useLoaderData`
- [ ] A search form (`<Form method="get">`, or `setSearchParams`) that updates `q` and resets `page` to 1
- [ ] A filter by author (`userId`) with a `select`
- [ ] Pagination: Previous, Next, and "Page X of Y". Buttons are disabled at the ends
- [ ] The URL is the only source of truth: reload keeps everything, and Back goes to the previous page of results
- [ ] A "No posts match your search" empty state

**Checkpoint:** `/posts?q=sunt&page=2` can be shared and opens the same view.

---

## Stage 4: Post page

- [ ] `/posts/:postId` with a loader that fetches the post, its author, and its comments **in parallel** (`Promise.all`)
- [ ] Validate `postId`. Non-numeric values and missing posts show a 404 message
- [ ] A route `errorElement` that distinguishes 404 from other errors, with a "Back to posts" link
- [ ] Shows the title, body, author name (linking to `/posts?userId=...`), and the comments
- [ ] "Previous post" and "Next post" links
- [ ] The document title changes per post (an effect, or React 19's `<title>` element in your component)

**Checkpoint:** `/posts/9999` and `/posts/abc` both show a clear message.

---

## Stage 5: Pending UI

- [ ] Use `useNavigation` to show a top progress bar during navigation
- [ ] While navigating within the posts list, dim the list (`opacity-60`) instead of replacing it with a spinner
- [ ] Disable pagination buttons while loading

**Checkpoint:** throttle the network to Slow 3G. The UI always tells you something is loading.

---

## Stage 6: Auth redirect

- [ ] A fake `AuthProvider` and `useAuth()` (context from Lesson 12), with the user saved in `localStorage`
- [ ] `/login` with a simple form. Any non-empty username works
- [ ] `/admin` redirects to `/login` when logged out (a layout route that checks auth and renders `<Outlet />`)
- [ ] After login, return the user to the page they originally wanted
- [ ] Header shows "Login" or the username and a "Logout" button

**Checkpoint:** visiting `/admin` while logged out lands on `/login`, then returns to `/admin`.

---

## Stage 7: Create a post (action)

- [ ] `/admin/new` with a `<Form method="post">` for title and body
- [ ] An `action` that validates (title at least 3 characters) and returns errors, shown with `useActionData`
- [ ] On success, `POST` to JSONPlaceholder (it fakes it) and `redirect('/posts')`
- [ ] The submit button shows "Saving…" while `navigation.state === 'submitting'`

**Checkpoint:** invalid input shows errors without leaving the page.

---

## Stage 8: Polish

- [ ] Lazy-load the admin pages with `lazy`
- [ ] Home page shows the latest three posts (a loader)
- [ ] Keyboard focus moves to the page heading (or the top) after navigation, so screen readers notice. Lesson 18 covers this, but try it: add `tabIndex={-1}` to the `<h1>` and focus it in an effect on `location.pathname` change
- [ ] Mobile-friendly navigation

---

## Stage 9: Check your work

```bash
npm run build
npm run lint
```

Both should pass. No `any`.

---

## Requirements checklist

**Must have**

- [ ] A root layout with `NavLink`s and an `Outlet`
- [ ] Routes for Home, Posts, a single Post, About, Login, and Admin, plus a `*` fallback
- [ ] A posts list with search, filter, and pagination in the URL, validated
- [ ] Loaders for list and detail, with 404 and error handling
- [ ] A protected route with a redirect and return
- [ ] At least one `action`
- [ ] A pending UI during navigation
- [ ] No `any`
- [ ] `npm run build` and `npm run lint` pass

**Nice to have**

- [ ] Breadcrumbs from `useMatches`
- [ ] Comments with an "Add comment" form (an action on the post route)
- [ ] Scroll to top on navigation (`<ScrollRestoration />`)
- [ ] Prefetch on link hover (`<Link prefetch>` exists in framework mode. Try a hover-triggered `fetch` in data mode)
- [ ] A categories page with nested routes

---

## Hints

<details>
<summary>My child page doesn't show up</summary>

The parent layout needs `<Outlet />`. Also check that child `path`s have no leading slash.
</details>

<details>
<summary>How do I read search params in a loader?</summary>

```ts
export async function postsLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const q = url.searchParams.get('q') ?? '';
  ...
}
```
</details>

<details>
<summary>How do I get the total number of posts?</summary>

JSONPlaceholder sends it in a header: `Number(res.headers.get('x-total-count'))`. Pages = `Math.ceil(total / limit)`.
</details>

<details>
<summary>How do I run the loaders in parallel?</summary>

```ts
const [post, comments] = await Promise.all([fetchPost(id, signal), fetchComments(id, signal)]);
```
(The user depends on the post, so fetch it after the post resolves, or fetch the post then `Promise.all` the rest.)
</details>

<details>
<summary>How do I return to the originally requested page after login?</summary>

When redirecting, include the original location: `<Navigate to="/login" state={{ from: location }} replace />`. In the login page read it with `useLocation().state`, validate that it's an internal path, and navigate there.
</details>

<details>
<summary>Search typing adds a history entry per letter</summary>

Use `setSearchParams(params, { replace: true })`, or submit the search with a form so it only changes on submit.
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per stage.
3. Push and open a pull request titled `Lesson 14: yourname`, with screenshots.
4. Ask a friend to review it. A good review asks: do all the weird URLs behave well, and is anything in `useState` that belongs in the URL?

---

## Done when

- Every page has a real URL that works on reload
- Bad input in the URL never breaks the app
- `npm run build` and `npm run lint` pass
- Your PR is open and a friend has reviewed it

Next up: **Lesson 15: Data fetching with TanStack Query**.
