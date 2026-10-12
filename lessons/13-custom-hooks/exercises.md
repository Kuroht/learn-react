# Lesson 13: Exercises

Do these in a scratch Vite project or on a practice branch. Try each one **before** reading the answer.

---

## Exercise 1: Spot the custom hooks

Which of these are valid custom hooks, and which break a rule?

```ts
function useCounter() { const [n, setN] = useState(0); return { n, setN }; }
function getCounter() { const [n, setN] = useState(0); return { n, setN }; }
function useThing(flag: boolean) { if (flag) { useEffect(() => {}); } }
function useDouble(n: number) { return n * 2; }
```

<details>
<summary>Answers</summary>

1. Valid.
2. Breaks a rule: it calls a hook but isn't named `use...`, so ESLint can't protect it, and it could be called from anywhere.
3. Breaks a rule: a conditional hook.
4. Technically valid (a hook doesn't have to call other hooks), but it's pointless. It's a plain function, so call it `double`.
</details>

---

## Exercise 2: `useToggle`

Write `useToggle(initial = false)` that returns `[value, toggle, setValue]`.

1. Type the return as a tuple.
2. Make `toggle` stable with `useCallback`.
3. Use it for a dropdown, a modal, and a "show password" button.

---

## Exercise 3: `useWindowSize`

Return `{ width, height }`, updating on resize.

1. Clean up the listener.
2. Use it to display "Mobile" below 768px and "Desktop" above.
3. Compare with `useMediaQuery('(min-width: 768px)')`. Which causes fewer re-renders while resizing? Why?

<details>
<summary>Answer</summary>

`useMediaQuery` only changes state when the match flips (a boolean), while `useWindowSize` updates on every pixel of resizing.
</details>

---

## Exercise 4: `useDebounce`

Implement `useDebounce<T>(value, delay)` yourself without looking at the lesson.

1. Test it with strings and numbers. Hover over the return value in your editor. Is the type correct?
2. Use it in a search box that logs the debounced query.
3. Change the delay while typing. What happens to the pending timer?

---

## Exercise 5: `useLocalStorage`

Implement `useLocalStorage<T>(key, initial)` and use it for:

1. a dark mode flag (`boolean`)
2. a list of notes (`string[]`)
3. a user profile object

Then test the edge cases:

- the stored value is invalid JSON (set it by hand in DevTools)
- `localStorage` throws (simulate with `Storage.prototype.getItem = () => { throw new Error() }` in the console)
- two tabs open: change it in one, observe the other (add the `storage` event listener)

---

## Exercise 6: Validated storage

Extend `useLocalStorage` with an optional third parameter, a type guard:

```ts
function useLocalStorage<T>(key: string, initial: T, isValid?: (v: unknown) => v is T)
```

If the stored value fails the check, fall back to `initial`. Write a guard for `Todo[]` and test it with `[{ "id": "oops" }]` in storage.

---

## Exercise 7: `useFetch`

Implement `useFetch<T>(url: string | null)`.

1. Return `{ data, error, isLoading, refetch }`.
2. Abort in-flight requests when the URL changes.
3. Pass `null` to skip fetching, and use that to fetch a user's posts only after the user is loaded.
4. Check `res.ok`.
5. List three things TanStack Query does that your hook doesn't.

<details>
<summary>Suggested answer to 5</summary>

Caching (reusing data across components), request deduplication, background refetching, retries with backoff, pagination helpers, optimistic updates, and devtools. Any three.
</details>

---

## Exercise 8: `useEventListener` and `useOnClickOutside`

1. Write `useEventListener` with the generic `K extends keyof WindowEventMap` signature. Check that `useEventListener('keydown', (e) => e.key)` knows `e` is a `KeyboardEvent`.
2. Write `useOnClickOutside(ref, handler)`.
3. Build a dropdown that closes when clicking outside or pressing Escape, using both hooks.

---

## Exercise 9: Design review

You have this component:

```tsx
function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') ?? 'light');
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => { /* fetch user */ }, []);
  useEffect(() => { localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => { /* resize listener */ }, []);
  ...
}
```

Rewrite it with custom hooks. How many lines does `Page` save? Does it read better?

---

## Check yourself

You're ready for the project if you can answer these without looking:

- What makes a function a custom hook?
- Do two components using the same hook share state?
- When should you extract a hook, and when not?
- Why use a generic `<T>` in `useDebounce` and `useLocalStorage`?
- Why wrap `localStorage` access in `try/catch`?
- Why return `as const` for a tuple?
- Why is `useFetch` not a replacement for TanStack Query?
- Where do shared hooks live in a project?
