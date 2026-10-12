# Lesson 15: Data Fetching with TanStack Query

**Goal:** manage server data the way professional teams do. You'll learn queries, caching, mutations, invalidation, pagination, and optimistic updates, and see why this replaces most hand-written fetching code.

**Time:** about 3 hours

**Prerequisite:** [Lesson 14](../14-routing-with-react-router/README.md)

> **Last verified:** October 2026, with TanStack Query v5. The API changed notably from v4 (a single options object, `isPending` instead of `isLoading` for the first load, `gcTime` instead of `cacheTime`). Check [tanstack.com/query/latest](https://tanstack.com/query/latest) if anything here doesn't match what you see.

---

## What you will learn

- Client state vs server state
- Setting up `QueryClient` and the provider
- `useQuery`: keys, functions, status flags
- Caching, `staleTime`, and refetching
- Query keys with parameters
- `useMutation` and cache invalidation
- Optimistic updates
- Pagination and `keepPreviousData`
- Infinite scrolling with `useInfiniteQuery`
- Typing and organizing query code
- DevTools

---

## 1. Server state is different

In Lessons 10 and 13 you wrote `useFetch` and noticed what's missing. Server data isn't like UI state:

| Client state | Server state |
|--------------|--------------|
| Lives in the browser | Lives on a server, you only have a copy |
| You own it | Others can change it at any time |
| Synchronous | Asynchronous: loading, error, empty |
| Never "stale" | Can become outdated |

Managing a copy of remote data means handling: caching, deduplicating identical requests, refetching when stale, retries, loading and error states, pagination, and keeping the UI in sync after changes. **TanStack Query** does all of that.

Rule of thumb: `useState`/`useReducer`/Zustand for client state; TanStack Query for server state.

---

## 2. Setup

```bash
npm install @tanstack/react-query
npm install -D @tanstack/react-query-devtools
```

```tsx
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
```

Create the `QueryClient` **outside** components (or once with `useState`), so it isn't recreated on every render. The devtools panel appears in development only.

---

## 3. `useQuery`

```tsx
import { useQuery } from '@tanstack/react-query';

type Todo = { id: number; title: string; completed: boolean };

async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=10');
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

function Todos() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  if (isPending) return <p>Loading…</p>;
  if (isError) return <p role="alert">{error.message}</p>;

  return <ul>{data.map((t) => <li key={t.id}>{t.title}</li>)}</ul>;
}
```

Compare this with Lesson 10's `useEffect` version: no `useState`, no cleanup, no race conditions.

- **`queryKey`**: a unique array identifying the data. It's the cache key.
- **`queryFn`**: an async function that returns the data (or throws).
- TypeScript infers `data` from `queryFn`'s return type, so annotate the function. After the `isPending` and `isError` checks, `data` is narrowed to `Todo[]`.
- The function must **throw** on errors. `fetch` doesn't throw on 404 and 500, so check `res.ok`.

### Status flags

| Flag | Meaning |
|------|---------|
| `isPending` | No data yet (first load) |
| `isError` | The last attempt failed |
| `isSuccess` | Data is available |
| `isFetching` | A request is in flight (also during background refetches) |
| `isRefetching` | A background refetch with existing data |

`isPending` is "I have nothing to show". `isFetching` is "something is loading, maybe in the background". Use `isFetching` for a subtle spinner and `isPending` for a skeleton.

---

## 4. The cache, stale time, and refetching

Mount `<Todos />` in two places: only **one** request goes out, and both share the result. Navigate away and back: data shows **instantly** from the cache, then refreshes quietly in the background.

Key settings:

| Option | Default | Meaning |
|--------|---------|---------|
| `staleTime` | `0` | How long data counts as fresh. Fresh data isn't refetched |
| `gcTime` | 5 min | How long **unused** data stays in memory before being deleted |
| `refetchOnWindowFocus` | `true` | Refetch stale data when the user returns to the tab |
| `retry` | 3 | Retries on failure, with backoff |

```tsx
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  staleTime: 60_000, // consider it fresh for a minute
});
```

With the default `staleTime: 0`, data is stale immediately, so it refetches on mount and on focus. That's a safe default (always current), but set a `staleTime` for data that rarely changes to save requests. Defaults for the whole app go on the `QueryClient`:

```tsx
new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } });
```

---

## 5. Query keys with parameters

The key must include **everything the query function depends on**, like a `useEffect` dependency array:

```tsx
function useTodo(id: number) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => fetchTodo(id),
  });
}

useQuery({ queryKey: ['todos', { status, page }], queryFn: () => fetchTodos({ status, page }) });
```

Change the key and Query fetches (or reads from cache) the new data automatically. Keys are compared **deeply**, so object property order doesn't matter.

### A key factory keeps keys consistent

```ts
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: TodoFilters) => [...todoKeys.lists(), filters] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: number) => [...todoKeys.details(), id] as const,
};
```

Because keys are hierarchical, `invalidateQueries({ queryKey: todoKeys.all })` refreshes everything about todos.

### Disabling a query

```tsx
useQuery({ queryKey: ['user', id], queryFn: ..., enabled: id !== null });
```

`enabled: false` waits (a dependent query), like passing `null` to `useFetch`.

---

## 6. Organizing query code

Make custom hooks, one per query, so components don't know about keys and fetch details:

```tsx
// features/todos/api.ts
export async function fetchTodos(): Promise<Todo[]> { ... }

// features/todos/queries.ts
export function useTodos() {
  return useQuery({ queryKey: todoKeys.lists(), queryFn: fetchTodos });
}
```

Use `queryOptions` to share a definition between `useQuery`, `prefetchQuery`, and route loaders with full type safety:

```tsx
import { queryOptions } from '@tanstack/react-query';

export const todoQueryOptions = (id: number) =>
  queryOptions({ queryKey: todoKeys.detail(id), queryFn: () => fetchTodo(id) });

useQuery(todoQueryOptions(5));
queryClient.prefetchQuery(todoQueryOptions(5));
```

---

## 7. Mutations

Queries **read**. Mutations **write** (create, update, delete):

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function AddTodo() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (title: string) => createTodo({ title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate('Learn Query');
      }}
    >
      <button disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving…' : 'Add'}
      </button>
      {mutation.isError && <p role="alert">{mutation.error.message}</p>}
    </form>
  );
}
```

- `mutate(variables)` triggers it (`mutateAsync` returns a promise you can `await`).
- `invalidateQueries` marks matching queries stale, so any mounted ones **refetch** and the UI updates. This is the standard "keep the screen in sync" step.
- Status flags: `isPending`, `isError`, `isSuccess`, and `error`.
- Per-call callbacks: `mutate(vars, { onSuccess: () => navigate('/') })`.

### Update the cache directly

If the server returns the updated item, skip the refetch:

```tsx
onSuccess: (updated) => {
  queryClient.setQueryData(todoKeys.detail(updated.id), updated);
  queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
}
```

---

## 8. Optimistic updates

Make the UI respond instantly, then fix it if the server fails:

```tsx
const toggle = useMutation({
  mutationFn: (todo: Todo) => updateTodo({ ...todo, completed: !todo.completed }),

  onMutate: async (todo) => {
    await queryClient.cancelQueries({ queryKey: todoKeys.lists() });   // avoid overwrites
    const previous = queryClient.getQueryData<Todo[]>(todoKeys.lists());

    queryClient.setQueryData<Todo[]>(todoKeys.lists(), (old) =>
      old?.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t)),
    );

    return { previous };                                   // context for rollback
  },

  onError: (_err, _todo, context) => {
    queryClient.setQueryData(todoKeys.lists(), context?.previous);   // roll back
  },

  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: todoKeys.lists() });   // sync with the truth
  },
});
```

The pattern: **snapshot, update the cache, roll back on error, refetch when done**. 

A simpler alternative (v5): while the mutation is pending, render using `mutation.variables`, with no cache surgery. Use optimistic updates for actions users expect to feel instant (likes, toggles), not for critical operations like payments.

---

## 9. Pagination

```tsx
import { keepPreviousData, useQuery } from '@tanstack/react-query';

function usePosts(page: number) {
  return useQuery({
    queryKey: ['posts', { page }],
    queryFn: () => fetchPosts(page),
    placeholderData: keepPreviousData,   // keep showing the old page while loading the new one
  });
}
```

Without `placeholderData: keepPreviousData`, each page change flashes the loading state. With it, `data` stays until the new page arrives, and `isPlaceholderData` is `true` meanwhile (use it to dim the list or disable "Next").

---

## 10. Infinite queries

For "Load more" and infinite scroll:

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['posts', 'infinite'],
  queryFn: ({ pageParam }) => fetchPosts(pageParam),
  initialPageParam: 1,
  getNextPageParam: (lastPage, allPages) =>
    lastPage.length === 0 ? undefined : allPages.length + 1,
});

const posts = data?.pages.flat() ?? [];

<button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
  {isFetchingNextPage ? 'Loading…' : hasNextPage ? 'Load more' : 'No more posts'}
</button>
```

`initialPageParam` is required in v5. `getNextPageParam` returns the next param, or `undefined` when there are no more pages.

---

## 11. Suspense and error boundaries (a preview)

`useSuspenseQuery` never returns a pending state: it suspends, and you show loading UI with `<Suspense>` and handle errors with an error boundary. It removes `isPending` checks from components, and we meet both in Lesson 18.

---

## 12. Types and validation

`queryFn` returns whatever the server sends, and `res.json()` is `any` under the hood. The generic return type is a promise you are making, not something checked. For data you don't control, validate in the `queryFn` with Zod (Lesson 16):

```ts
const todos = z.array(todoSchema).parse(await res.json());
```

---

## 13. Debugging with DevTools

The devtools panel shows every query, its key, state (fresh, stale, fetching, inactive), data, and lets you force refetch or error states. Open it whenever caching surprises you.

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| A `queryKey` missing a variable the function uses | Wrong data, or the same data for different inputs |
| Not throwing on `!res.ok` | 404s are treated as success |
| Using `isLoading` expecting v4 behavior | In v5 prefer `isPending`. `isLoading` means `isFetching && isPending` |
| Copying `data` into `useState` | Stale copies that never update. Use `data` directly |
| Forgetting `invalidateQueries` after a mutation | The UI shows old data |
| Creating `new QueryClient()` inside a component | The cache is wiped on every render |
| Setting `staleTime: Infinity` without a plan | Data never refreshes |
| Using Query for UI state (modal open, form text) | Wrong tool. That's client state |
| Not handling `isError` | Silent failures |
| Fetching in `useEffect` while also using Query | Two systems fighting each other |

---

## Key takeaways

- Server state has different needs than UI state: caching, staleness, and sync.
- `useQuery({ queryKey, queryFn })` replaces hand-written fetch effects. The key is the cache identity and must include every input.
- `staleTime` controls how fresh data is. `gcTime` controls how long unused data is kept.
- `useMutation` writes data, and `invalidateQueries` brings the UI back in sync.
- Optimistic updates snapshot, update, roll back on error, and refetch at the end.
- `keepPreviousData` smooths pagination. `useInfiniteQuery` handles load more.
- Wrap queries in custom hooks and use key factories.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to [Lesson 16: Forms with React Hook Form + Zod](../16-forms-react-hook-form-zod/README.md).
