# Lesson 14: Exercises

Do these in a scratch Vite project with `react-router` installed, or on a practice branch. Try each one **before** reading the answer.

---

## Exercise 1: Match the URL

Given these routes, which element renders for each URL?

```tsx
[
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'blog', element: <BlogList /> },
      { path: 'blog/:slug', element: <BlogPost /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]
```

1. `/`  2. `/blog`  3. `/blog/hello-world`  4. `/blog/hello/world`  5. `/contact`

<details>
<summary>Answers</summary>

1) `Layout` > `Home` · 2) `Layout` > `BlogList` · 3) `Layout` > `BlogPost` (`slug = 'hello-world'`) · 4) `Layout` > `NotFound`, because `:slug` matches one segment only · 5) `Layout` > `NotFound`
</details>

---

## Exercise 2: Three pages and a menu

Create Home, About, and Contact pages with a shared layout:

1. A header with `NavLink`s that highlight the active page
2. `end` on the Home link (what happens if you remove it?)
3. A footer
4. A 404 page for unknown URLs

Click around and watch the Network tab. Is the page ever reloaded? Compare with plain `<a>` tags.

---

## Exercise 3: Dynamic page

Build `/users` (a list of users from a local array) and `/users/:userId` (one user's details).

1. Link each user to their page
2. Read the id with `useParams`
3. Handle an unknown id (`/users/999`) and a non-number (`/users/abc`) with a friendly message
4. Add a "Back to users" link

---

## Exercise 4: URL as state

On `/users`, add:

- a search box that stores `q` in the URL (`?q=ana`)
- a role filter that stores `role` in the URL
- a "Clear filters" button

Requirements:

1. The filtered list is **derived** from the search params (no `useState` copy)
2. Reloading keeps the filters
3. A made-up role in the URL (`?role=wizard`) is ignored safely
4. Typing in the box doesn't add a history entry for every letter (use `{ replace: true }`)

<details>
<summary>Hint</summary>

`setSearchParams(next, { replace: true })`.
</details>

---

## Exercise 5: Redirects

1. Create a fake `useAuth()` hook that returns `{ user, login, logout }` (state in a context or just `localStorage`).
2. Create a `/dashboard` page that redirects to `/login` when there's no user, using `<Navigate replace />`.
3. After login, `navigate('/dashboard', { replace: true })`.
4. Test the back button after logging in. Why did we use `replace`?

Stretch: remember the page the user wanted (`/dashboard`) and go there after login.

---

## Exercise 6: A loader

Using `https://jsonplaceholder.typicode.com/posts` and `/posts/:id`:

1. Write a loader for the list and a loader for a single post
2. Read the data with `useLoaderData`
3. Throw a `Response` with status 404 when the post doesn't exist (try `/posts/9999`)
4. Add an `errorElement` that shows a different message for 404s than for other failures
5. Add a thin "Loading..." bar using `useNavigation` while navigating

Throttle the network and watch the page. When does the new page appear: before or after the data arrives?

---

## Exercise 7: Compare approaches

Implement the single-post page twice:

1. With `useEffect` + `fetch` + state (Lesson 10)
2. With a route loader

Compare: lines of code, loading states, race conditions, and what happens on a quick back and forth between posts. Which would you pick for a real app, and why?

---

## Exercise 8: Lazy route

Create a heavy-looking `ReportsPage` (import a big library or just render a lot) and load it with `lazy`. Check the Network tab: when is its JavaScript file requested?

---

## Check yourself

You're ready for the project if you can answer these without looking:

- Why use `Link` instead of `<a>` for internal links?
- What is `Outlet` for?
- What do `index: true` and `path: '*'` do?
- What type is a `useParams` value, and what should you do with it?
- Why store filters in search params instead of `useState`?
- When do you use `navigate()` and when `<Navigate>` or `Link`?
- What is a loader, and what happens when it throws a `Response`?
- Why do static hosts need a SPA fallback?
