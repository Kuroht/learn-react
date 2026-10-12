# Lesson 10: `useEffect` and Side Effects

**Goal:** connect your components to the world outside React: the network, the browser, timers. You'll learn what effects are, when you need them (and when you don't), how to clean up, and how to fetch data safely.

**Time:** about 3 hours

**Prerequisite:** [Lesson 09](../09-component-variants/README.md)

> **Last verified:** October 2026, with React 19 and TypeScript. `useEffect` is one of the most misused hooks, so read [react.dev/learn/you-might-not-need-an-effect](https://react.dev/learn/you-might-not-need-an-effect) and [react.dev/reference/react/useEffect](https://react.dev/reference/react/useEffect) alongside this lesson.

---

## What you will learn

- What a *side effect* is, and why rendering must stay pure
- The `useEffect` syntax and the dependency array
- Cleanup functions
- Strict Mode running effects twice, and why that's useful
- Fetching data with `fetch`, loading and error states
- Race conditions and `AbortController`
- When you do **not** need an effect
- Typing API responses, and why types alone aren't enough

---

## 1. Side effects

Rendering must be **pure**: given the same props and state, a component returns the same JSX and changes nothing outside itself. But real apps need to do things that aren't rendering:

- Fetch data from a server
- Set a timer or subscribe to events
- Change `document.title`
- Read or write `localStorage`
- Connect to a WebSocket

These are **side effects**. In React, most of them go in `useEffect`.

---

## 2. `useEffect` basics

```tsx
import { useEffect, useState } from 'react';

function Title() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Clicked ${count} times`;
  }, [count]);

  return <button onClick={() => setCount((c) => c + 1)}>Click</button>;
}
```

`useEffect(setup, dependencies)`:

1. React renders the component and updates the screen.
2. **After** that, it runs `setup`.
3. On later renders, it runs `setup` again only if a dependency **changed**.

### The dependency array

| Form | When it runs |
|------|--------------|
| `useEffect(fn, [a, b])` | After the first render, and when `a` or `b` change |
| `useEffect(fn, [])` | Only after the first render (when the component mounts) |
| `useEffect(fn)` | After **every** render (rarely what you want) |

**Rule:** list every reactive value (props, state, values computed from them) that the effect *reads*. The `react-hooks/exhaustive-deps` ESLint rule checks this for you. Never silence it. Fix the code instead.

---

## 3. Cleanup

If an effect starts something, it should be able to stop it. Return a cleanup function:

```tsx
useEffect(() => {
  const id = setInterval(() => setSeconds((s) => s + 1), 1000);

  return () => clearInterval(id); // cleanup
}, []);
```

React runs cleanup:

- before running the effect again (because a dependency changed)
- when the component unmounts (disappears)

Events too:

```tsx
useEffect(() => {
  function onResize() {
    setWidth(window.innerWidth);
  }
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}, []);
```

Think of an effect as **start** and **stop**, kept in sync with the values it depends on.

---

## 4. Strict Mode runs effects twice

In development, `<StrictMode>` mounts, unmounts, and re-mounts your component once. So your effect runs `setup → cleanup → setup`. This is deliberate. It reveals effects with missing cleanup:

- A timer without `clearInterval` would run twice as fast.
- A subscription without unsubscribing would leak.

If seeing "two requests" in the network tab upsets you, the real fix isn't removing Strict Mode, it's making the effect **correct** (cleanup, abort). In production it runs once.

---

## 5. Fetching data

```tsx
type User = { id: number; name: string; email: string };

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; user: User };

function UserProfile({ userId }: { userId: number }) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });

    async function load() {
      try {
        const res = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const user = (await res.json()) as User;
        setState({ status: 'success', user });
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return; // ignore
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Something went wrong',
        });
      }
    }

    load();
    return () => controller.abort();
  }, [userId]);

  switch (state.status) {
    case 'loading': return <p>Loading…</p>;
    case 'error': return <p role="alert">{state.message}</p>;
    case 'success': return <h2>{state.user.name}</h2>;
  }
}
```

Several important details here:

1. **A state union** (Lesson 06) instead of separate `loading`/`error` booleans.
2. **`fetch` doesn't throw on 404 or 500.** Check `res.ok` yourself.
3. **`useEffect` can't be `async`.** Define an `async` function inside it and call it.
4. **`AbortController`** cancels the request on cleanup.
5. **Errors are `unknown`** in `catch`. Narrow with `instanceof`.

### Why the abort matters: race conditions

Without it: the user switches from user 1 to user 2 quickly. Request 2 returns first and shows user 2, then the slow request 1 returns and overwrites the screen with user 1. The UI now shows stale data. Aborting (or ignoring) the outdated request fixes it.

A simpler alternative is an `ignore` flag:

```tsx
let ignore = false;
fetch(...).then((data) => { if (!ignore) setState(...) });
return () => { ignore = true; };
```

### The `as User` trap

`(await res.json()) as User` tells TypeScript to trust you. If the API returns something else, nothing warns you. Types disappear at runtime (Lesson 03). In Lesson 16 you'll validate with Zod. For now: keep the types minimal and be careful.

---

## 6. You might not need an effect

Effects are an escape hatch for talking to **external systems**. Beginners overuse them. Don't use an effect to:

### Derive data from props or state

```tsx
// Avoid
const [fullName, setFullName] = useState('');
useEffect(() => setFullName(first + ' ' + last), [first, last]);

// Do this
const fullName = first + ' ' + last;
```

### Respond to a user event

```tsx
// Avoid: effect that reacts to a "submitted" flag
// Do this: do the work in the event handler
function handleSubmit() {
  post('/api/order', order);
}
```

If something happens *because the user clicked*, put it in the click handler.

### Reset state when a prop changes

```tsx
// Avoid
useEffect(() => setComment(''), [userId]);

// Do this: give the component a key so React resets it
<Profile key={userId} userId={userId} />
```

### Fetch (in real apps)

Fetching in effects is fine for learning and small apps, but it needs loading, errors, races, caching, retries, and deduplication. Lesson 15 introduces TanStack Query, which handles all of this. Learn the mechanics now so you understand what it replaces.

**Test yourself:** "Am I synchronizing with something outside React?" If not, you probably don't need an effect.

---

## 7. Other common effects

### Document title and subscriptions

```tsx
useEffect(() => {
  document.title = `${unread} unread`;
}, [unread]);
```

### Debounced search (preview)

```tsx
useEffect(() => {
  const id = setTimeout(() => setDebounced(query), 300);
  return () => clearTimeout(id);
}, [query]);
```

Each keystroke cancels the previous timer, so the value updates only after the user pauses. You'll turn this into a hook in Lesson 13.

### Effects with functions as dependencies

If an effect uses a function defined in the component, that function is a dependency, and it changes every render. Fix it by:

1. Moving the function **inside** the effect (best, if only the effect uses it)
2. Moving it outside the component (if it doesn't use props or state)
3. Wrapping it in `useCallback` (Lesson 11)

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| Missing dependency | Stale values: the effect uses old props/state |
| Object or array created in render as a dependency | The effect runs every render. Depend on primitives |
| No cleanup for timers or listeners | Leaks, doubled behavior, bugs in Strict Mode |
| `useEffect(async () => ...)` | Returns a promise instead of a cleanup function. Define an inner async function |
| Setting state in an effect that depends on that state | Infinite loop |
| Not checking `res.ok` | 404s and 500s treated as success |
| Ignoring race conditions | Old responses overwrite new ones |
| Using an effect to derive values or handle clicks | Extra renders, bugs. Calculate in render or use the handler |
| Silencing the `exhaustive-deps` rule | Hidden stale-closure bugs |
| Fetching without loading or error UI | Blank or broken screens |

---

## Key takeaways

- Render is pure. Side effects go in `useEffect` (or in event handlers if triggered by the user).
- The dependency array lists everything the effect reads. Let ESLint enforce it.
- An effect that starts something must return a cleanup that stops it.
- Strict Mode runs effects twice in development to expose missing cleanup.
- Fetching needs: a state union, `res.ok`, error handling, and abort or ignore for races.
- If you're not synchronizing with an external system, you probably don't need an effect.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to [Lesson 11: `useRef`, `useMemo`, `useCallback`](../11-refs-memo-callback/README.md).
