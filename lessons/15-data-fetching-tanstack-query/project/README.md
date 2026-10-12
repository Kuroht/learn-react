# Lesson 15 Project: GitHub Profile Explorer

Build an app that searches GitHub users, shows their profile and repositories, and uses TanStack Query for everything it fetches.

> **Last verified:** October 2026, with TanStack Query v5. The [GitHub REST API](https://docs.github.com/en/rest) allows about 60 unauthenticated requests per hour per IP, which is a good reason to cache well. Check the docs if a response shape has changed.

---

## Brief

An app with:

- A search box for a GitHub username (and a list of matching users from the search API)
- A profile page with avatar, name, bio, follower counts, and links
- A repositories list with sorting, language filtering, and "load more"
- A "favorites" feature to save users (a mutation against a local fake API, or `localStorage`)
- Loading, error, rate-limit, and not-found states

You'll combine the **router (Lesson 14)** with **TanStack Query**.

Every stage ends with a **checkpoint**: something you should see in the browser.

---

## The API

```
GET https://api.github.com/users/{username}
GET https://api.github.com/users/{username}/repos?per_page=10&page=1&sort=updated
GET https://api.github.com/search/users?q={query}&per_page=5
```

Open them in the browser first and read the JSON. Responses include `x-ratelimit-remaining` headers. A rate-limited call returns `403` (or `429`).

---

## Getting started

```bash
cd lessons/15-data-fetching-tanstack-query/project
npm create vite@latest starter -- --template react-ts
cd starter
npm install
npm install react-router @tanstack/react-query tailwindcss @tailwindcss/vite
npm install -D @tanstack/react-query-devtools
npm run dev
```

Suggested structure (feature-based, as in `docs/architecture.md`):

```
src/
├── app/ (router.tsx, providers.tsx)
├── features/
│   ├── users/ (api.ts, queries.ts, types.ts, components/)
│   ├── repos/ (api.ts, queries.ts, types.ts, components/)
│   └── favorites/
├── components/ (shared UI)
└── lib/ (githubClient.ts)
```

Work in your own branch: `git checkout -b yourname/lesson-15`

---

## Stage 1: The API client

In `src/lib/githubClient.ts`:

- [ ] A `githubFetch<T>(path, signal)` helper that sends the `Accept: application/vnd.github+json` header
- [ ] Throws a typed `ApiError` (a class with `status` and `message`) when `!res.ok`
- [ ] Converts `404` to "User not found" and rate-limit errors (`403`/`429` with `x-ratelimit-remaining: 0`) to a clear message
- [ ] No `any`

**Checkpoint:** a scratch call to `githubFetch('/users/octocat')` returns data, and `/users/this-user-does-not-exist-123` throws an `ApiError` with status 404.

---

## Stage 2: Types and query hooks

- [ ] `GithubUser` and `Repo` types (only the fields you use)
- [ ] A key factory for `users` and `repos`
- [ ] `useUser(username)` and `useUserSearch(query)` hooks built with `queryOptions`
- [ ] `useUserSearch` is `enabled` only when the debounced query has at least 2 characters (reuse `useDebounce` from Lesson 13)
- [ ] Set sensible defaults on the `QueryClient`: `staleTime: 60_000`, and `retry` that **doesn't retry 404s**

**Checkpoint:** DevTools shows your queries with the keys you designed.

---

## Stage 3: Search page

- [ ] `/` with a search box, debounced
- [ ] Shows up to five suggestions with avatar and username, as links to `/users/:username`
- [ ] Loading skeletons, an error message (with a retry button), and a "No users found" state
- [ ] `isFetching` shows a subtle spinner without hiding the previous results (`placeholderData: keepPreviousData`)
- [ ] The query lives in the URL (`?q=`) so a search can be shared

**Checkpoint:** typing quickly sends one request. Searching for the same text again is instant.

---

## Stage 4: Profile page

- [ ] `/users/:username` shows avatar, name, bio, location, blog, company, followers/following, and public repos
- [ ] Missing fields (`null`) are hidden gracefully
- [ ] A 404 shows a dedicated "User not found" page with a link home
- [ ] Prefetch the profile when hovering a search suggestion (`queryClient.prefetchQuery`). Clicking should feel instant

**Checkpoint:** hover then click a suggestion: no loading state.

---

## Stage 5: Repositories with pagination

- [ ] A repos list under the profile, built with `useInfiniteQuery` and a "Load more" button
- [ ] Each repo: name (link), description, language, stars, and last updated (`Intl.RelativeTimeFormat` or `Intl.DateTimeFormat`)
- [ ] A sort select (`updated`, `created`, `pushed`, `full_name`) that is part of the query key and the URL
- [ ] A language filter **derived** from loaded repos (client-side)
- [ ] `hasNextPage` hides the button when there's nothing more. Handle `isFetchingNextPage`

**Checkpoint:** changing the sort refetches from the first page. Going back to an earlier sort is instant from the cache.

---

## Stage 6: Favorites with mutations

GitHub's API is read-only, so favorites live in your own storage. Choose one:

- **Option A:** `json-server` (`npx json-server db.json`) as a tiny REST backend
- **Option B:** a fake async API over `localStorage` that waits ~400ms to simulate a network

Then:

- [ ] `useFavorites()` query, `useAddFavorite()` and `useRemoveFavorite()` mutations
- [ ] A heart button on the profile and the search results
- [ ] **Optimistic update**: the heart fills instantly, rolls back if the request fails (add a random failure to the fake API to test it)
- [ ] A `/favorites` page listing saved users
- [ ] Invalidation keeps every heart consistent across pages

**Checkpoint:** toggling a favorite updates every place it appears, instantly, and rolls back cleanly when the fake API fails.

---

## Stage 7: Resilience

- [ ] Rate-limit error: a friendly message with the reset time (from `x-ratelimit-reset`)
- [ ] Offline: go offline in DevTools and see what Query does. Show a message (`useIsFetching`, or `navigator.onLine`)
- [ ] Refetch on window focus works. Verify it in the DevTools
- [ ] Add `ReactQueryDevtools` and take a screenshot of the cache for your PR
- [ ] Count the network requests while exploring for a minute. Write the numbers in `NOTES.md`: how many did caching save?

---

## Stage 8: Check your work

```bash
npm run build
npm run lint
```

Both should pass. No `any`, and no `useEffect` used for fetching.

---

## Requirements checklist

**Must have**

- [ ] A typed API client with a meaningful `ApiError`
- [ ] Queries in custom hooks with a key factory and `queryOptions`
- [ ] Debounced search (the query is in the URL)
- [ ] A profile page with 404 handling
- [ ] Repos with `useInfiniteQuery`, sorting in the key
- [ ] Favorites using mutations, an optimistic update, and invalidation
- [ ] Loading, error, empty, and rate-limit states
- [ ] No `any`, no fetching inside `useEffect`
- [ ] `npm run build` and `npm run lint` pass

**Nice to have**

- [ ] Prefetch the next page of repos
- [ ] A GitHub token input (stored safely, **never committed**) that raises the rate limit. Read the security notes in the bonus module first
- [ ] Persist the query cache with `@tanstack/react-query-persist-client`
- [ ] Compare two users side by side with `useQueries`
- [ ] A Suspense version with `useSuspenseQuery` (Lesson 18 prepares you)

---

## Hints

<details>
<summary>My query runs on every keystroke</summary>

Pass the **debounced** value into the hook, not the raw input value. Also use `enabled` so it doesn't run for empty or too-short queries.
</details>

<details>
<summary>The same data refetches too often</summary>

Check `staleTime`. The default is 0, so everything is stale immediately. Set 30 to 60 seconds in `defaultOptions`. Also check that your keys are stable: don't put a new object with changing identity (like a function) in them.
</details>

<details>
<summary>The optimistic update flickers back</summary>

Make sure you `await queryClient.cancelQueries(...)` at the start of `onMutate`, and call `invalidateQueries` only in `onSettled`.
</details>

<details>
<summary>How do I stop retrying 404s?</summary>

```ts
retry: (failureCount, error) =>
  !(error instanceof ApiError && error.status === 404) && failureCount < 2,
```
</details>

<details>
<summary><code>data.pages</code> is typed wrong</summary>

Give `useInfiniteQuery` a typed `queryFn` that returns `Promise<Repo[]>`, and set `initialPageParam: 1`. Then `data?.pages.flat()` is `Repo[]`.
</details>

<details>
<summary>I hit the rate limit while developing</summary>

That's expected: 60 requests/hour per IP. Good caching reduces this a lot. While developing, use a long `staleTime`, or mock the API with `json-server`. Never put a personal token in the frontend code you commit.
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per stage.
3. Push and open a pull request titled `Lesson 15: yourname`, with a screenshot of the DevTools cache.
4. Ask a friend to review it. A good review asks: is every input of each query in its key, and is there any server data copied into `useState`?

---

## Done when

- The app feels instant on repeated actions, and fails gracefully
- All server data comes from queries, with no manual fetching effects
- `npm run build` and `npm run lint` pass
- Your PR is open and a friend has reviewed it

Next up: **Lesson 16: Forms with React Hook Form + Zod**.
