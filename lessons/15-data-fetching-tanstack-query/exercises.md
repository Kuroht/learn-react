# Lesson 15: Exercises

Do these in a scratch Vite project with `@tanstack/react-query` and its devtools installed, or on a practice branch. Try each one **before** reading the answer. Keep the devtools open.

---

## Exercise 1: Read the flags

A component renders with an empty cache. Then the user goes to another page and comes back after 10 seconds, with the default settings. What are `isPending`, `isFetching`, and `data` at each step?

1. First render
2. The request succeeds
3. Coming back after 10 seconds

<details>
<summary>Answers</summary>

1. `isPending: true`, `isFetching: true`, `data: undefined`
2. `isPending: false`, `isFetching: false`, `data` is set
3. `isPending: false` (cached data exists), `isFetching: true` (stale, so refreshing in the background), `data` is the cached value, shown instantly
</details>

---

## Exercise 2: Your first query

Using `https://jsonplaceholder.typicode.com/users`:

1. Write a typed `fetchUsers()` that throws when `!res.ok`
2. Render the users with loading and error states
3. Render the same component twice on the page. How many requests do you see?
4. Switch to another tab and back. What happens? Change `refetchOnWindowFocus` to `false`

---

## Exercise 3: Keys matter

Write `useUser(id: number)` with the key `['user', id]`.

1. Add "Previous" and "Next" buttons for ids 1 to 10
2. Click back and forth. When is the loading state shown, and when does data appear instantly?
3. Temporarily change the key to `['user']` (forgetting the id). What breaks?
4. Fix it, then add `staleTime: 60_000`. What changes in the network tab?

---

## Exercise 4: Break and fix

What's wrong?

```tsx
function Posts({ userId }: { userId: number }) {
  const { data } = useQuery({
    queryKey: ['posts'],
    queryFn: () => fetchPosts(userId),
  });
  const [posts, setPosts] = useState(data);
  return <List posts={posts} />;
}
```

<details>
<summary>Answers</summary>

1. The key is missing `userId`, so changing the user shows the previous user's cached posts. Use `['posts', userId]`.
2. `useState(data)` copies the data once (it's `undefined` at first) and never updates. Use `data` directly.
3. There's no handling for loading or error.
</details>

---

## Exercise 5: A mutation

Build a "To-do" list from `https://jsonplaceholder.typicode.com/todos?_limit=5`.

1. Add a form that creates a todo with `useMutation` (JSONPlaceholder pretends to save it and returns `{ id: 201, ... }`)
2. After success, call `invalidateQueries`. Notice the new item does **not** appear (the fake API doesn't persist). Why?
3. Instead, update the cache with `setQueryData` so it shows up
4. Show "Saving…" while pending and the error message on failure (try a bad URL)

<details>
<summary>Answer to 2</summary>

Invalidation refetches from the server, which returns the original data because nothing was really saved. With a real backend this is the right approach. `setQueryData` lets you demo it with a fake one.
</details>

---

## Exercise 6: Optimistic toggle

Add a checkbox to each todo that toggles `completed` with a `PATCH`.

1. Implement it **with** an optimistic update (`onMutate`, `onError`, `onSettled`)
2. Make the request fail on purpose (a wrong URL or a `throw`). Does the checkbox roll back?
3. Throttle the network. Compare the experience with and without the optimistic update

---

## Exercise 7: Pagination

Fetch posts with `?_page=N&_limit=10`.

1. Add Previous and Next buttons
2. Without `placeholderData`, watch what happens between pages
3. Add `placeholderData: keepPreviousData` and dim the list when `isPlaceholderData` is true
4. Prefetch the next page on hover or when the current page loads (`queryClient.prefetchQuery`). Does Next feel instant now?

---

## Exercise 8: Infinite list

Convert the posts list to "Load more" with `useInfiniteQuery`.

1. Use `initialPageParam: 1`
2. Return `undefined` from `getNextPageParam` when a page has fewer than 10 posts
3. Flatten `data.pages`
4. Disable the button while `isFetchingNextPage`

---

## Exercise 9: Compare

Take your Lesson 10 weather app (or the Lesson 13 `useFetch` demo) and rewrite one data call with `useQuery`. Count the lines you deleted. List what you gained for free.

---

## Check yourself

You're ready for the project if you can answer these without looking:

- What's the difference between client state and server state?
- What goes in a `queryKey` and why?
- What's the difference between `staleTime` and `gcTime`?
- What's the difference between `isPending` and `isFetching`?
- Why must the `queryFn` throw on a bad response?
- What does `invalidateQueries` do, and when do you call it?
- Describe the four steps of an optimistic update.
- What does `keepPreviousData` fix?
