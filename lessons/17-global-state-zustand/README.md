# Lesson 17: Global State with Zustand

**Goal:** manage shared client state with a small, fast store. You'll learn how to create a typed store, select exactly what a component needs, update state immutably, persist it, and decide what belongs in a store at all.

**Time:** about 2 to 3 hours

**Prerequisite:** [Lesson 16](../16-forms-react-hook-form-zod/README.md)

> **Last verified:** October 2026, with Zustand v5. Zustand 5 requires React 18+, uses the `create<State>()(...)` curried form for TypeScript, and changed how selectors that return new objects behave. Check [zustand.docs.pmnd.rs](https://zustand.docs.pmnd.rs) if anything here doesn't match what you see.

---

## What you will learn

- When context is not enough
- Creating a typed store with `create`
- Reading state with selectors
- Actions inside the store
- Selecting multiple values without extra renders
- Derived state and computed values
- Middleware: `persist`, `devtools`
- Using the store outside React
- Slices for bigger stores
- Deciding what belongs in a store

---

## 1. Why another state tool?

You've seen a progression:

| Tool | Best for |
|------|----------|
| `useState` | Local state in one component |
| Lifting state up | Sharing between close relatives |
| `useReducer` + context | Moderately shared state with complex transitions |
| **Zustand** | Shared client state that many distant components read and write |
| TanStack Query | Server data |

Context has a weakness: **every consumer re-renders** when the context value changes, even if it only uses one field. Zustand lets components subscribe to **just the slice they need**, so only they re-render. It also needs no provider, and has very little boilerplate.

---

## 2. Your first store

```bash
npm install zustand
```

```ts
// src/stores/useCounterStore.ts
import { create } from 'zustand';

type CounterState = {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
};

export const useCounterStore = create<CounterState>()((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

Notes:

- `create<CounterState>()(...)` has **two** pairs of parentheses. This curried form is how TypeScript infers the middleware types correctly. Always write it this way.
- The store holds **state and actions** together.
- `set` merges the returned object into the state (a shallow merge, like `setState` in old class components). You don't spread the rest of the state.
- `set((state) => ...)` gives you the current state, like the updater form in `useState`.
- The result, `useCounterStore`, is a **hook**.

Use it in components, with no provider:

```tsx
function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return <button onClick={increment}>Count: {count}</button>;
}
```

The function passed to the hook is a **selector**. It picks what the component cares about.

---

## 3. Selectors: the key to performance

```tsx
// Re-renders on ANY change in the store (avoid)
const { count, increment } = useCounterStore();

// Re-renders only when `count` changes
const count = useCounterStore((s) => s.count);
```

A component re-renders only if the **selected value** changes (compared with `Object.is`). Select the smallest piece you need.

### Selecting several values

Returning a new object or array from a selector creates a new reference every time. In Zustand v5 that leads to an infinite loop warning/error. Use `useShallow`:

```tsx
import { useShallow } from 'zustand/react/shallow';

const { count, increment } = useCounterStore(
  useShallow((s) => ({ count: s.count, increment: s.increment })),
);
```

`useShallow` compares the selected object's fields instead of its identity. Or just call the hook twice with simple selectors, which is often clearer.

### Derived values

Compute them in the selector, or in the component:

```tsx
const total = useCartStore((s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0));
const itemCount = useCartStore((s) => s.items.length);
```

These return primitives, so they're cheap and stable. Don't store derived values in the store (same rule as always).

### Custom selector hooks

Export small hooks so components don't depend on the store's shape:

```ts
export const useCartCount = () => useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
export const useCartActions = () => useCartStore((s) => s.actions);
```

A common pattern is putting all actions under an `actions` key. That object is created once, so selecting it is stable and never causes re-renders.

---

## 4. Updating state immutably

Same rules as `useState`: never mutate.

```ts
type Todo = { id: string; title: string; done: boolean };

type TodoState = {
  todos: Todo[];
  actions: {
    add: (title: string) => void;
    toggle: (id: string) => void;
    remove: (id: string) => void;
    clearDone: () => void;
  };
};

export const useTodoStore = create<TodoState>()((set) => ({
  todos: [],
  actions: {
    add: (title) =>
      set((s) => ({ todos: [...s.todos, { id: crypto.randomUUID(), title, done: false }] })),
    toggle: (id) =>
      set((s) => ({ todos: s.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
    remove: (id) => set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),
    clearDone: () => set((s) => ({ todos: s.todos.filter((t) => !t.done) })),
  },
}));
```

Unlike a reducer, actions are plain functions that can do anything (including calling `get()` to read the latest state, or being `async`):

```ts
create<State>()((set, get) => ({
  loadUser: async () => {
    set({ status: 'loading' });
    const user = await fetchUser();
    set({ user, status: 'ready' });
  },
  isAdmin: () => get().user?.role === 'admin',
}));
```

(If it is server data, use TanStack Query instead of fetching inside a store.)

---

## 5. Middleware

### `persist`: save to storage

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'en',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'settings',                                   // localStorage key
      partialize: (state) => ({ theme: state.theme, language: state.language }),  // save only data
      version: 1,                                         // bump to migrate old data
    },
  ),
);
```

`partialize` keeps functions and temporary values out of storage. Increase `version` and provide `migrate` when the stored shape changes. Remember: stored data is **outside data**, so a `merge` or `migrate` step is a good place to validate it (with Zod, Lesson 16).

### `devtools`: debug with Redux DevTools

```ts
import { devtools } from 'zustand/middleware';

create<State>()(devtools(persist((set) => ({ ... }), { name: 'x' }), { name: 'TodoStore' }));
```

Install the Redux DevTools browser extension to inspect each state change. Name your `set` calls for readable logs: `set(newState, undefined, 'todos/add')`.

### `immer`: "mutating" syntax

```ts
import { immer } from 'zustand/middleware/immer';
// npm install immer

toggle: (id) => set((s) => { const t = s.todos.find((t) => t.id === id); if (t) t.done = !t.done; })
```

Handy for deeply nested state. The code looks like mutation, but immer produces a new object under the hood. Combine middleware by nesting: `create<State>()(devtools(persist(immer(...))))`.

---

## 6. Outside React

A store works anywhere, not just inside components:

```ts
useTodoStore.getState().actions.add('From outside React');
const todos = useTodoStore.getState().todos;

const unsubscribe = useTodoStore.subscribe((state) => console.log(state.todos.length));
```

Useful for event handlers triggered by non-React code (a WebSocket message, an interceptor) and for tests.

For a clean slate between tests: `useTodoStore.setState(initialState)`.

---

## 7. Slices for bigger stores

When one store grows, split it into slices and combine them:

```ts
import type { StateCreator } from 'zustand';

type BoardSlice = { columns: Column[]; addColumn: (title: string) => void };
type UiSlice = { sidebarOpen: boolean; toggleSidebar: () => void };

type AppState = BoardSlice & UiSlice;

const createBoardSlice: StateCreator<AppState, [], [], BoardSlice> = (set) => ({
  columns: [],
  addColumn: (title) => set((s) => ({ columns: [...s.columns, { id: crypto.randomUUID(), title, cards: [] }] })),
});

const createUiSlice: StateCreator<AppState, [], [], UiSlice> = (set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
});

export const useAppStore = create<AppState>()((...a) => ({
  ...createBoardSlice(...a),
  ...createUiSlice(...a),
}));
```

Or keep **several small stores** (one per concern). That's often simpler than slices, and Zustand encourages it.

Put each store inside its feature folder (`features/board/store.ts`), and export only the hooks the rest of the app needs, through the feature's `index.ts`.

---

## 8. What belongs in a store?

| State | Where |
|-------|-------|
| Form input text | Local `useState` or React Hook Form |
| Is this dropdown open? | Local `useState` |
| Data from an API | **TanStack Query** |
| Which filters are active (shareable) | URL search params |
| The current theme, sidebar state, user preferences | Zustand (persisted) |
| A kanban board's columns and cards | Zustand |
| Items in a shopping cart | Zustand or Context + reducer |
| A multi-step flow shared across routes | Zustand |

Resist the urge to put everything global. **Start local, lift when needed, and go global only for state that truly many places share.**

---

## 9. Zustand vs context + reducer

| | Context + reducer | Zustand |
|---|---|---|
| Setup | Provider needed | No provider |
| Re-renders | All consumers | Only components whose selection changed |
| Outside React | No | Yes (`getState`) |
| Built-in persistence/devtools | No | Middleware |
| Dependencies | None | Tiny library |
| Learning | React-only concepts | Its own small API |

Both are fine. Context is great for rarely-changing values (theme, current user). Zustand shines for frequently-changing shared state.

---

## 10. Testing a store

```ts
beforeEach(() => useTodoStore.setState({ todos: [] }));

it('adds a todo', () => {
  useTodoStore.getState().actions.add('Write tests');
  expect(useTodoStore.getState().todos).toHaveLength(1);
});
```

Stores are plain functions and objects: no rendering needed. Lesson 19 covers testing in depth.

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| `create<State>(...)` instead of `create<State>()(...)` | TypeScript can't infer correctly, middleware typing breaks |
| `const store = useStore()` (no selector) | The component re-renders on every change |
| A selector returning a new object or array (`s => ({a: s.a})`) | Infinite loop / extra renders in v5. Use `useShallow` |
| Mutating state (`s.items.push(x)`) without immer | No re-render, subtle bugs |
| Spreading `...state` inside `set` | Unnecessary. `set` already merges (only needed for nested objects) |
| Putting server data in the store | You lose caching and refetching. Use TanStack Query |
| Storing derived data | It goes out of sync. Derive it in selectors |
| Persisting functions or huge data | Storage errors, bloat. Use `partialize` |
| One giant global store for everything | Hard to reason about. Split by feature |
| Forgetting to reset stores between tests | Tests depend on each other |
| Reading `localStorage` data without validation | A corrupted value crashes the app. Validate in `merge`/`migrate` |

---

## Key takeaways

- Zustand is a small store with no provider. `create<State>()(...)` returns a hook.
- Components subscribe with **selectors** and re-render only when their slice changes.
- Use `useShallow` (or multiple hooks) when selecting several values.
- Actions are plain functions on the store. Update immutably, or use `immer`.
- `persist` and `devtools` middleware add persistence and debugging in a few lines.
- Stores work outside React (`getState`, `subscribe`).
- Keep server data in TanStack Query, shareable filters in the URL, and local state local.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to [Lesson 18: Error handling, loading states, accessibility](../18-error-loading-accessibility/README.md).
