# Lesson 13 Project: Custom Hooks Library

Build a small, typed, documented library of custom hooks, with a demo page that shows each one working. This is the end of Module 3.

> **Last verified:** October 2026. Check [react.dev/reference/react/hooks](https://react.dev/reference/react/hooks) for the built-in hooks you'll build on.

---

## Brief

Create a `hooks` library with at least these hooks:

| Hook | What it does |
|------|--------------|
| `useToggle` | A boolean with `toggle`, `setTrue`, `setFalse` |
| `useDebounce` | A value that follows another after a delay |
| `useLocalStorage` | State persisted in `localStorage` |
| `useFetch` | Fetch JSON with loading, error, abort, and refetch |
| `useEventListener` | Typed event listener with cleanup |
| `useMediaQuery` | Whether a CSS media query matches |
| `useOnClickOutside` | Call a function when clicking outside an element |
| `usePrevious` | The value from the previous render |

A **demo app** has one card per hook where you can try it out. Hooks are in their own folder with no UI dependencies, so another project could copy them.

Every stage ends with a **checkpoint**: something you should see in the browser.

---

## Getting started

```bash
cd lessons/13-custom-hooks/project
npm create vite@latest starter -- --template react-ts
cd starter
npm install
npm install tailwindcss @tailwindcss/vite   # optional
npm run dev
```

Structure:

```
src/
├── hooks/
│   ├── useToggle.ts
│   ├── useDebounce.ts
│   ├── ... one file per hook
│   └── index.ts          # re-exports every hook
├── demos/
│   ├── ToggleDemo.tsx
│   └── ... one demo per hook
└── App.tsx
```

Work in your own branch: `git checkout -b yourname/lesson-13`

---

## Stage 1: `useToggle` and `usePrevious`

- [ ] `useToggle(initial = false)` returns `{ value, toggle, setTrue, setFalse }`, with **stable** functions (`useCallback`)
- [ ] `usePrevious<T>(value: T): T | undefined`
- [ ] A `ToggleDemo` (a collapsible panel) and a `PreviousDemo` (a counter showing "now 5, before 4")
- [ ] `hooks/index.ts` re-exports them

**Checkpoint:** both demos work, and hovering over the hooks in the editor shows the right types.

---

## Stage 2: `useDebounce` and `useLocalStorage`

- [ ] `useDebounce<T>(value: T, delay = 300): T` with cleanup
- [ ] `useLocalStorage<T>(key, initialValue)` returning `[value, setValue, remove]`
- [ ] The lazy initializer, `try/catch` around every storage access
- [ ] Supports functional updates: `setValue(prev => ...)` (the type is `Dispatch<SetStateAction<T>>`)
- [ ] An optional validator (a type guard) as the third parameter. Invalid stored data falls back to the initial value
- [ ] Sync between tabs using the `storage` event
- [ ] A debounce demo (type fast and watch the debounced value) and a storage demo (a notes textarea that survives reloads)

**Checkpoint:** open the demo in two tabs. Edit a note in one and watch the other update.

---

## Stage 3: `useEventListener`, `useMediaQuery`, `useOnClickOutside`

- [ ] `useEventListener` typed with `K extends keyof WindowEventMap`, so event types are inferred
- [ ] Store the latest handler in a ref so the listener is attached only once (Lesson 11)
- [ ] An optional `target` parameter (`window` by default; also accept an `HTMLElement` ref) — stretch
- [ ] `useMediaQuery(query: string): boolean` with cleanup, and no crash if `window` is missing
- [ ] `useOnClickOutside(ref, handler)`
- [ ] Demos: a key-press display (`useEventListener('keydown')`), a layout label using `useMediaQuery('(min-width: 768px)')` and `(prefers-color-scheme: dark)`, and a dropdown that closes on outside click

**Checkpoint:** the dropdown closes on outside click and Escape. Listeners don't pile up (verify in DevTools with `getEventListeners(window)` in Chrome).

---

## Stage 4: `useFetch`

- [ ] `useFetch<T>(url: string | null)` returns `{ data, error, isLoading, refetch }` built on a discriminated union
- [ ] Aborts on URL change and on unmount
- [ ] Checks `res.ok`
- [ ] `null` URL means "skip"
- [ ] `refetch()` forces a new request
- [ ] Demo: a user browser. Pick a user from `https://jsonplaceholder.typicode.com/users`, then fetch their posts only once a user is selected (a dependent request)
- [ ] Show loading, error, and success. Add a "Simulate error" button that requests a bad URL

**Checkpoint:** click quickly between users on a throttled network. The UI never shows stale data.

---

## Stage 5: Combine them

Build one realistic screen using several of your hooks:

- [ ] A search box that uses `useDebounce` and `useFetch` to query posts
- [ ] The last search saved with `useLocalStorage`
- [ ] A theme toggle using `useToggle` and `useLocalStorage`
- [ ] `useMediaQuery` to switch between a table and a card layout
- [ ] Press `/` to focus the search (using `useEventListener`)

Compare this component with how much code the same thing needed in Lessons 10 and 11.

**Checkpoint:** a clean component with almost no `useEffect` of its own.

---

## Stage 6: Quality of the library

- [ ] Every hook has a TSDoc comment (`/** ... */`) with a short description and an `@example`
- [ ] Return types are explicit (or `as const` for tuples)
- [ ] Every hook cleans up everything it starts
- [ ] No hook imports anything from `demos/` or touches UI
- [ ] Write a `hooks/README.md` with a table of the hooks, their signatures, and one-line descriptions
- [ ] Check each hook in Strict Mode (the default in dev): no doubled behavior

---

## Stage 7: Check your work

```bash
npm run build
npm run lint
```

Both should pass. No `any`, no silenced lint rules.

---

## Requirements checklist

**Must have**

- [ ] The eight hooks above, each in its own file and re-exported from `hooks/index.ts`
- [ ] Generics where it makes sense (`useDebounce<T>`, `useLocalStorage<T>`, `useFetch<T>`, `usePrevious<T>`)
- [ ] Cleanup everywhere, `try/catch` around storage
- [ ] A demo for every hook
- [ ] One combined screen
- [ ] TSDoc on every hook and a `hooks/README.md`
- [ ] No `any`
- [ ] `npm run build` and `npm run lint` pass

**Nice to have**

- [ ] Tests for the hooks with `renderHook` (Lesson 19 covers testing)
- [ ] `useInterval` with the ref trick for the latest callback (Dan Abramov's classic)
- [ ] `useCopyToClipboard`, `useOnlineStatus`, or `useIdle`
- [ ] Re-implement `useLocalStorage` using `useSyncExternalStore`
- [ ] Publish the hooks as a local package (a folder with its own `package.json`) and import them from the demo app

---

## Hints

<details>
<summary>TypeScript infers my tuple as an array</summary>

Add `as const` to the returned array, or annotate the return type: `): readonly [T, Dispatch<SetStateAction<T>>, () => void]`.
</details>

<details>
<summary>My <code>useEventListener</code> removes and re-adds the listener every render</summary>

The handler is a new function each render and is in the dependency array. Keep it in a ref:

```ts
const saved = useRef(handler);
useEffect(() => { saved.current = handler; }, [handler]);

useEffect(() => {
  const listener = (e: WindowEventMap[K]) => saved.current(e);
  window.addEventListener(type, listener);
  return () => window.removeEventListener(type, listener);
}, [type]);
```
</details>

<details>
<summary><code>usePrevious</code> returns the current value instead of the previous</summary>

Update the ref in an **effect**, which runs after render, and return `ref.current` from the render itself, which still holds the older value:

```ts
const ref = useRef<T>(undefined);
useEffect(() => { ref.current = value; }, [value]);
return ref.current;
```

(Reading a ref during render is normally discouraged. This is the well-known exception, and the React Compiler may flag it, so note the trade-off in a comment.)
</details>

<details>
<summary>My <code>useLocalStorage</code> setter doesn't accept a function</summary>

Return React's own setter (`Dispatch<SetStateAction<T>>`), instead of wrapping it in a function that only takes `T`.
</details>

<details>
<summary>I get an infinite request loop in <code>useFetch</code></summary>

A dependency changes every render, for example an options object created inline. Depend on primitives (the `url` string and a `reloadKey` number).
</details>

<details>
<summary>How do I type a ref parameter for <code>useOnClickOutside</code>?</summary>

`ref: React.RefObject<HTMLElement | null>`. In React 19 types, `useRef<HTMLDivElement>(null)` returns `RefObject<HTMLDivElement | null>`, which is assignable to this.
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per hook.
3. Push and open a pull request titled `Lesson 13: yourname`.
4. Ask a friend to review it. A good review asks: could I misuse any hook, does each one clean up, and are the types as precise as they can be?

---

## Done when

- Your hooks library is typed, documented, and demonstrated
- The combined screen is shorter and clearer than the same code written with raw effects
- `npm run build` and `npm run lint` pass
- Your PR is open and a friend has reviewed it

You've finished Module 3! Next up: **Module 4, Lesson 14: Routing with React Router**.
