# Lesson 11: `useRef`, `useMemo`, `useCallback`

**Goal:** learn three hooks that don't hold visible state: one for values that survive renders without causing them, and two for avoiding unnecessary work. You'll also learn when *not* to use them.

**Time:** about 2 to 3 hours

**Prerequisite:** [Lesson 10](../10-useeffect-and-side-effects/README.md)

> **Last verified:** October 2026, with React 19 and TypeScript. The [React Compiler](https://react.dev/learn/react-compiler) can add memoization automatically, which changes how often you write `useMemo` and `useCallback` by hand. Check [react.dev/reference/react/useRef](https://react.dev/reference/react/useRef), [useMemo](https://react.dev/reference/react/useMemo), and [useCallback](https://react.dev/reference/react/useCallback) if anything here doesn't match what you see.

---

## What you will learn

- `useRef` for DOM access (focus, scroll, measure)
- `useRef` as a mutable box that doesn't trigger renders
- Ref vs state: how to choose
- How rendering and re-rendering work
- `useMemo` to cache an expensive calculation
- `React.memo` and `useCallback` to skip child re-renders
- Why you should measure before optimizing
- What the React Compiler changes

---

## 1. `useRef` for the DOM

A ref gives you a handle to a real DOM element:

```tsx
import { useRef } from 'react';

function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>Focus</button>
    </>
  );
}
```

- `useRef<HTMLInputElement>(null)` creates `{ current: null }`.
- React sets `inputRef.current` to the element after it's rendered.
- `current` can be `null` (before mount, or after unmount), so use `?.`.

Common uses: `focus()`, `scrollIntoView()`, measuring size (`getBoundingClientRect()`), playing a `<video>`, and integrating non-React libraries.

Don't read or write `ref.current` **during render**. Use it in event handlers and effects.

React 19 note: `ref` is a regular prop on function components, so you can pass it to your own components:

```tsx
function TextInput({ ref, ...props }: React.ComponentProps<'input'>) {
  return <input ref={ref} {...props} />;
}
```

### Focus on mount

```tsx
useEffect(() => {
  inputRef.current?.focus();
}, []);
```

---

## 2. `useRef` as a value that survives renders

A ref is also a **mutable box**. Changing `ref.current` does **not** re-render the component, and the value is kept between renders:

```tsx
function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<number | null>(null);

  function start() {
    if (intervalRef.current !== null) return;
    intervalRef.current = window.setInterval(() => setElapsed((e) => e + 1), 1000);
  }

  function stop() {
    if (intervalRef.current === null) return;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  useEffect(() => stop, []); // stop on unmount

  return (
    <>
      <p>{elapsed}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </>
  );
}
```

The interval id is not something to display, so it doesn't belong in state.

Other uses: the previous value of a prop, a flag like "is this the first render", or the latest callback.

### State or ref?

| | `useState` | `useRef` |
|---|-----------|----------|
| Change triggers a render | Yes | No |
| Value shown on screen | Yes | No |
| Read during render | Yes | Avoid |
| Good for | UI data | Timer ids, DOM nodes, instance values |

**Rule:** if it affects what's on screen, it's state. Otherwise, a ref may be enough.

---

## 3. How rendering works (the mental model)

Before memoization makes sense, remember:

1. A component **re-renders** when its state changes, when its parent re-renders, or when context it reads changes.
2. Re-rendering means calling the function again. Children re-render by default, even if their props didn't change.
3. React then compares the result to the previous one and updates only the real DOM differences.

Re-rendering is usually **cheap**. Most apps never need to optimize it. Optimize when you can *see* a problem (the input lags, the list janks), and measure first with React DevTools Profiler.

---

## 4. `useMemo`: cache a calculation

```tsx
const visible = useMemo(
  () => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
  [products, query],
);
```

`useMemo(calculate, dependencies)` re-runs `calculate` only when a dependency changes, and otherwise returns the previous result.

Use it when:

- The calculation is **really** expensive (sorting or filtering thousands of items, heavy math), **and**
- The component re-renders for other reasons often

Don't use it for cheap things like `a + b`. The memoization itself has a cost.

A second use: keeping a **stable reference** for an object or array that's passed to a memoized child or used as an effect dependency:

```tsx
const options = useMemo(() => ({ page, pageSize }), [page, pageSize]);
```

### Check if it's slow first

```tsx
console.time('filter');
const visible = products.filter(...);
console.timeEnd('filter');
```

If it takes under 1ms, forget `useMemo`. The Lesson 20 project has you profile a genuinely slow list.

---

## 5. `React.memo` and `useCallback`

By default a child re-renders whenever its parent does. `React.memo` skips re-rendering if the props are **shallowly equal**:

```tsx
const ProductRow = memo(function ProductRow({ product, onSelect }: ProductRowProps) {
  console.log('render', product.name);
  return <li onClick={() => onSelect(product.id)}>{product.name}</li>;
});
```

But there's a catch. Every render, the parent creates a **new function**:

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  function handleSelect(id: number) { ... }   // a new function every render

  return <ProductRow product={p} onSelect={handleSelect} />; // memo is defeated
}
```

`onSelect` is a different function each time, so `memo` sees changed props. `useCallback` keeps the same function between renders:

```tsx
const handleSelect = useCallback((id: number) => {
  setSelectedId(id);
}, []);
```

Use the **updater form** of `setState` inside callbacks, so you don't need the state value in the dependencies:

```tsx
const handleToggle = useCallback((id: number) => {
  setTodos((current) => current.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
}, []);
```

### The rule

`useCallback` and `memo` are only useful **together**, and only when:

- The child is expensive to render or rendered many times (a long list), **and**
- The parent re-renders often for unrelated reasons

`useCallback` alone does nothing helpful. Don't scatter it over every function.

---

## 6. Typing

```tsx
const ref = useRef<HTMLDivElement>(null);           // DOM ref (current: HTMLDivElement | null)
const timerId = useRef<number | null>(null);        // mutable value
const renderCount = useRef(0);                      // inferred as number

const memoizedValue = useMemo<Product[]>(() => compute(), [deps]);
const handler = useCallback((id: number): void => { ... }, []);
```

TypeScript infers most of these. The one you must write yourself is the element type for DOM refs.

---

## 7. The React Compiler

The React Compiler is a build-time tool that adds memoization **automatically** to your components when it can prove it's safe. It has been stable since version 1.0 (October 2025). With it enabled, you rarely write `useMemo`, `useCallback`, or `memo` by hand. Today:

- It's opt-in. The Vite template doesn't enable it, because it slows down dev and build. Next.js has a `reactCompiler: true` option.
- It requires following the Rules of React (pure render, no mutation of props or state). Good habits already.
- Existing manual memoization keeps working.
- In React DevTools, components the compiler optimized show a "Memo ✨" badge.

Lesson 20 shows how to turn it on in a Vite project.

So: learn what these hooks do (you'll meet them in lots of code), but reach for them **only when measurements show a problem**.

---

## 8. Quick decision guide

| Situation | Use |
|-----------|-----|
| Need to focus, scroll to, or measure an element | `useRef` with the element type |
| Need a value that persists but isn't shown | `useRef` |
| Value affects the UI | `useState` |
| Derived value is cheap | Just calculate it |
| Derived value is expensive and the component re-renders a lot | `useMemo` |
| A memoized child gets a function prop | `useCallback` (plus `memo` on the child) |
| Something feels slow | Profile first, then optimize |

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| Reading `ref.current` during render | Unpredictable values, since refs aren't tracked |
| Using a ref for something that should update the screen | The UI doesn't update |
| Forgetting `?.` or a null check on `ref.current` | "Cannot read properties of null" |
| `useMemo` on cheap code | More code, no gain |
| `useCallback` with no `memo` on the child | No benefit |
| Missing dependencies in `useMemo` and `useCallback` | Stale values |
| Passing a new object or array literal as a prop to a `memo` child | `memo` is defeated |
| Mutating the memoized result | Breaks the assumption that it's unchanged |
| Optimizing before measuring | Complexity without proof of benefit |

---

## Key takeaways

- `useRef` holds a DOM node or a mutable value without triggering renders.
- If it's shown on screen, use state. If not, a ref may be enough.
- Components re-render with their parents. That's usually fine.
- `useMemo` caches a costly calculation. `memo` + `useCallback` skip child re-renders. Both need dependencies kept correct.
- Measure with the Profiler before optimizing.
- The React Compiler may do this automatically, but understanding it still matters.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to [Lesson 12: `useReducer` and context](../12-usereducer-and-context/README.md).
