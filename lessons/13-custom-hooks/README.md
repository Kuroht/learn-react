# Lesson 13: Custom Hooks

**Goal:** extract reusable logic from components into your own hooks. You'll learn the rules, build `useLocalStorage`, `useDebounce`, and `useFetch`, and design hooks that are typed, generic, and easy to use.

**Time:** about 3 hours

**Prerequisite:** [Lesson 12](../12-usereducer-and-context/README.md)

> **Last verified:** October 2026, with React 19 and TypeScript. Check [react.dev/learn/reusing-logic-with-custom-hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) if anything here doesn't match what you see.

---

## What you will learn

- What a custom hook is, and why it's just a function
- When to extract a hook
- Naming and rules
- Returning values: tuple vs object
- Generic hooks with TypeScript
- Building `useDebounce`, `useLocalStorage`, `useToggle`, and `useFetch`
- Event listeners and cleanup in hooks
- Sharing logic, not state
- Testing hooks (a preview)

---

## 1. What is a custom hook?

A custom hook is a **function whose name starts with `use`** and that calls other hooks. That's all. It lets you share *stateful logic* between components.

Without a hook, two components duplicate the same code:

```tsx
function Header() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  ...
}
```

Extract it:

```tsx
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return width;
}

function Header() {
  const width = useWindowWidth();
  return width < 768 ? <MobileNav /> : <DesktopNav />;
}
```

The component now says *what* it wants (the width), not *how* to get it.

### Sharing logic, not state

Every component that calls `useWindowWidth()` gets **its own** state. Hooks share the code, not the data. To share data, use context (Lesson 12) or a store (Lesson 17).

---

## 2. Rules

1. **The name must start with `use`** (`useDebounce`). This lets ESLint apply the rules of hooks to it.
2. Call hooks at the **top level** of your hook (no conditions or loops), like in components.
3. Only call hooks from components or other hooks.
4. Don't extract a hook for every two lines. Extract when:
   - the logic is reused, **or**
   - it makes a component much easier to read, **or**
   - it's a self-contained concern (a timer, a subscription, a storage sync).

A good hook has one job and a clear name that describes what it gives you, not how it works.

---

## 3. Return values: tuple or object?

```tsx
// Tuple: great for two values that callers rename (like useState)
const [value, setValue] = useLocalStorage('name', '');

// Object: better with three or more values, or when order is unclear
const { data, error, isLoading, refetch } = useFetch<User>(url);
```

For tuples in TypeScript, annotate the return type so you don't get `(string | Function)[]`:

```ts
function useToggle(initial = false): [boolean, () => void] {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn((o) => !o), []);
  return [on, toggle];
}
```

Or use `as const`: `return [on, toggle] as const;`.

---

## 4. `useDebounce`

Returns a value that follows the input after a delay. A **generic** hook, since it works with any type:

```ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
```

Usage:

```tsx
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 400);
```

`<T>` is a type parameter: `useDebounce('hi')` returns a `string`, and `useDebounce(5)` returns a `number`, with no casting.

This is the logic you wrote by hand in Lessons 10 and 11. Now it's one line.

---

## 5. `useLocalStorage`

State that persists. It should look like `useState`:

```ts
import { useCallback, useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue; // storage blocked, or invalid JSON
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable: ignore
    }
  }, [key, value]);

  const remove = useCallback(() => {
    localStorage.removeItem(key);
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, setValue, remove] as const;
}
```

Usage:

```tsx
const [name, setName] = useLocalStorage('name', '');
const [todos, setTodos] = useLocalStorage<Todo[]>('todos', []);
```

Design points:

- A lazy initializer reads storage only once.
- Every access is in `try/catch`, since storage can be blocked (private mode) or full.
- `setValue` is React's own setter, so `setTodos((t) => [...t, x])` works.
- `as T` is a leap of faith, as the stored data could be anything. A stricter version takes a validator: `useLocalStorage(key, initial, isTodoList)`.

### Syncing between tabs

Tabs fire a `storage` event when another tab writes. Subscribe in an effect (with cleanup) and update state:

```ts
useEffect(() => {
  function onStorage(e: StorageEvent) {
    if (e.key === key && e.newValue !== null) setValue(JSON.parse(e.newValue) as T);
  }
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}, [key]);
```

(The most robust solution uses `useSyncExternalStore`, which is made for subscribing to external data. Know that it exists.)

---

## 6. `useFetch`

Pulling together Lesson 10. A generic hook returning a state object:

```ts
import { useCallback, useEffect, useState } from 'react';

type FetchState<T> =
  | { status: 'loading'; data: undefined; error: undefined }
  | { status: 'error'; data: undefined; error: Error }
  | { status: 'success'; data: T; error: undefined };

export function useFetch<T>(url: string | null) {
  const [state, setState] = useState<FetchState<T>>({
    status: 'loading', data: undefined, error: undefined,
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (url === null) return;
    const controller = new AbortController();
    setState({ status: 'loading', data: undefined, error: undefined });

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json() as Promise<T>;
      })
      .then((data) => setState({ status: 'success', data, error: undefined }))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setState({
          status: 'error', data: undefined,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      });

    return () => controller.abort();
  }, [url, reloadKey]);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return { ...state, isLoading: state.status === 'loading', refetch };
}
```

Usage:

```tsx
const { data, error, isLoading, refetch } = useFetch<User[]>('/api/users');
```

Notes:

- Passing `null` as the URL means "don't fetch yet" (useful for dependent requests).
- The `T` is trusted, not verified. Validate with Zod in Lesson 16.
- This hook has **no cache, no deduplication, no retries**. That's why Lesson 15 introduces TanStack Query. You're building `useFetch` to understand what it does, not to replace it in real apps.

---

## 7. More small hooks

```ts
// useToggle
export function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn((o) => !o), []);
  return [on, toggle, setOn] as const;
}

// useEventListener: attach a listener with automatic cleanup
export function useEventListener<K extends keyof WindowEventMap>(
  type: K,
  handler: (event: WindowEventMap[K]) => void,
) {
  useEffect(() => {
    window.addEventListener(type, handler);
    return () => window.removeEventListener(type, handler);
  }, [type, handler]);
}

// useMediaQuery
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

// useOnClickOutside
export function useOnClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    function listener(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    }
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}
```

The `useEventListener` signature uses a **generic constrained by keys of `WindowEventMap`**, so TypeScript knows that `'keydown'` gives a `KeyboardEvent`. This is the same trick used throughout the DOM typings.

If the handler is a new function every render, the listener is removed and added every render. It works, but a common refinement stores the latest handler in a ref (Lesson 11) and subscribes once.

---

## 8. Designing good hooks

- **Name by what it gives, not how**: `useOnlineStatus`, not `useWindowEventListeners`.
- **Keep the API small and predictable.** Fewer arguments, sensible defaults.
- **Make them generic where it makes sense** (`useDebounce<T>`, `useLocalStorage<T>`).
- **Always clean up** what you start.
- **Don't hide too much.** If a hook does five unrelated things, split it.
- **Stable return values**: wrap returned functions in `useCallback` so consumers can put them in dependency arrays.
- **Document with TSDoc comments** (`/** ... */`) so the editor shows help on hover.
- **Don't make hooks that only wrap one built-in call** with no added meaning.
- **Test them.** A hook can be tested with `renderHook` from React Testing Library (Lesson 19).

### Organizing

```
src/hooks/
├── useDebounce.ts
├── useLocalStorage.ts
├── useFetch.ts
├── useToggle.ts
└── index.ts
```

Shared hooks live in `src/hooks/`. Hooks used by only one feature live inside that feature (see `docs/architecture.md`).

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| Not starting with `use` | ESLint can't check the rules of hooks, and bugs hide |
| Expecting two components to share state through a hook | Each call gets separate state. Use context or a store |
| Forgetting cleanup | Leaks and doubled listeners |
| Untyped tuples | Return type becomes an array union. Use `as const` or annotate |
| Reading `localStorage` without `try/catch` | Crashes in private mode or with bad JSON |
| Trusting `JSON.parse(...) as T` | Wrong data at runtime. Validate when it matters |
| Hook returns a new function or object each render | Dependents (effects, `memo`) re-run unnecessarily |
| Putting unrelated logic into one big hook | Hard to reuse and test |
| Extracting too early | Abstractions that don't fit. Wait for the second use |
| Using `useFetch` for everything in a large app | Missing caching, retries, dedup. Use TanStack Query |

---

## Key takeaways

- A custom hook is a function named `use...` that calls other hooks to package reusable logic.
- Hooks share logic, not state. Each caller has its own.
- Use generics (`<T>`) to make hooks work with any type, and keep return types explicit.
- `useDebounce`, `useLocalStorage`, `useFetch`, and `useToggle` cover a huge share of daily needs.
- Always clean up, guard browser APIs with `try/catch`, and validate outside data.
- Extract when there is reuse or clarity to gain, not before.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to Module 4 with Lesson 14: Routing with React Router.
