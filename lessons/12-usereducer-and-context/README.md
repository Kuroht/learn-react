# Lesson 12: `useReducer` and Context

**Goal:** manage complex state with reducers and share it across the app without passing props through every level. You'll build a typed reducer, a context provider, and the hooks that make them pleasant to use.

**Time:** about 3 hours

**Prerequisite:** [Lesson 11](../11-refs-memo-callback/README.md)

> **Last verified:** October 2026, with React 19 and TypeScript. Check [react.dev/learn/scaling-up-with-reducer-and-context](https://react.dev/learn/scaling-up-with-reducer-and-context) and [react.dev/reference/react/useReducer](https://react.dev/reference/react/useReducer) if anything here doesn't match what you see.

---

## What you will learn

- When `useState` starts to hurt
- Reducers: pure functions from `(state, action)` to a new state
- Typing actions with a discriminated union
- `useReducer` in a component
- Prop drilling, and what context solves
- Creating, providing, and consuming context
- Combining reducer and context
- Custom hooks that make context safe to use
- Context performance, and its limits

---

## 1. When `useState` hurts

A shopping cart with `useState` needs many handlers that all do similar updates in different places:

```tsx
const [items, setItems] = useState<CartItem[]>([]);

function add(product: Product) { setItems(...); }
function remove(id: number) { setItems(...); }
function setQuantity(id: number, qty: number) { setItems(...); }
function clear() { setItems([]); }
```

As the logic grows (limits, discounts, validation), it scatters across handlers. A **reducer** moves all state transitions into **one function** that you can read, test, and reason about.

---

## 2. What is a reducer?

A reducer is a pure function:

```ts
(state, action) => newState
```

Given the current state and a description of what happened (an *action*), return the next state. No side effects, no mutation.

```ts
type State = { count: number };

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' }
  | { type: 'add'; amount: number };

function counterReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    case 'add':
      return { count: state.count + action.amount };
  }
}
```

### Actions are a discriminated union

You met this pattern in Lesson 06. The `type` field tells TypeScript which other fields exist:

- In `case 'add'`, `action.amount` exists.
- In `case 'increment'`, it doesn't.
- If you add a new action type to `Action` and forget to handle it, TypeScript complains (with a function that must return `State`, a missing case is an error). 

Exhaustiveness helper, for a stronger guarantee:

```ts
default: {
  const _exhaustive: never = action;
  return state;
}
```

### Reducers must be pure

- Don't mutate `state` (spread and `map`/`filter`, as in Lesson 04)
- Don't call APIs, set timers, or use `Math.random()` / `Date.now()` inside (pass them in the action)

---

## 3. `useReducer`

```tsx
import { useReducer } from 'react';

function Counter() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <>
      <p>{state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'add', amount: 10 })}>+10</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </>
  );
}
```

- `dispatch(action)` sends an action. React calls the reducer and re-renders.
- Components say **what happened**, and the reducer decides **how the state changes**.
- TypeScript infers the types from the reducer, so you rarely annotate `useReducer` yourself.
- `dispatch` has a stable identity, so it's safe in dependency arrays.

### A cart reducer

```ts
type CartItem = { id: number; name: string; price: number; quantity: number };
type CartState = { items: CartItem[] };

type CartAction =
  | { type: 'added'; product: Omit<CartItem, 'quantity'> }
  | { type: 'removed'; id: number }
  | { type: 'quantityChanged'; id: number; quantity: number }
  | { type: 'cleared' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'added': {
      const existing = state.items.find((i) => i.id === action.product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }
      return { items: [...state.items, { ...action.product, quantity: 1 }] };
    }
    case 'removed':
      return { items: state.items.filter((i) => i.id !== action.id) };
    case 'quantityChanged':
      return {
        items:
          action.quantity <= 0
            ? state.items.filter((i) => i.id !== action.id)
            : state.items.map((i) =>
                i.id === action.id ? { ...i, quantity: action.quantity } : i,
              ),
      };
    case 'cleared':
      return { items: [] };
  }
}
```

Tip: name actions after **what happened** (`added`, `removed`), not what to do (`SET_ITEMS`). It keeps components free of state logic.

Reducers are easy to test: no React, no DOM, just input and output:

```ts
expect(cartReducer({ items: [] }, { type: 'added', product })).toEqual({ items: [{ ...product, quantity: 1 }] });
```

### `useState` or `useReducer`?

| `useState` | `useReducer` |
|------------|--------------|
| One or two independent values | Several related values that change together |
| Simple updates (`set(x)`) | Many kinds of updates, or complex logic |
| Quick and small | Want logic in one testable place |

Both are fine. Start with `useState`, and move to `useReducer` when it gets tangled.

---

## 4. Prop drilling

```tsx
<App>
  <Layout>            // doesn't use cart
    <Header>          // doesn't use cart
      <CartButton cart={cart} />   // needs it
```

Passing data through components that don't care about it is **prop drilling**. A little is fine (it's explicit and easy to follow). A lot is painful. Context lets deep components read shared data directly.

Try composition first: sometimes you can pass `children` or a ready-made element (`<Layout header={<CartButton />}>`) instead of drilling.

---

## 5. Context

Three steps: **create**, **provide**, **consume**.

```tsx
import { createContext, use, useState } from 'react';

type Theme = 'light' | 'dark';

// 1. Create (the default value is used when there's no provider)
const ThemeContext = createContext<Theme>('light');

// 2. Provide
function App() {
  const [theme, setTheme] = useState<Theme>('dark');
  return (
    <ThemeContext value={theme}>
      <Page />
    </ThemeContext>
  );
}

// 3. Consume, anywhere below
function Badge() {
  const theme = use(ThemeContext);
  return <span className={theme === 'dark' ? 'bg-black text-white' : 'bg-white'}>Hi</span>;
}
```

React 19 notes:

- You render `<ThemeContext value={...}>` directly (older code uses `<ThemeContext.Provider>`; both work).
- `use(Context)` reads context. `useContext(Context)` still works too, and you'll see it in lots of code. `use` can also be called conditionally.

When the provider's `value` changes, every component that reads that context re-renders.

---

## 6. Reducer + context: the standard pattern

Put the state and the actions in one file with a provider and a hook:

```tsx
// src/features/cart/CartContext.tsx
import { createContext, use, useReducer, type Dispatch, type ReactNode } from 'react';

const CartStateContext = createContext<CartState | null>(null);
const CartDispatchContext = createContext<Dispatch<CartAction> | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  return (
    <CartStateContext value={state}>
      <CartDispatchContext value={dispatch}>{children}</CartDispatchContext>
    </CartStateContext>
  );
}

export function useCart() {
  const state = use(CartStateContext);
  if (!state) throw new Error('useCart must be used inside <CartProvider>');
  return state;
}

export function useCartDispatch() {
  const dispatch = use(CartDispatchContext);
  if (!dispatch) throw new Error('useCartDispatch must be used inside <CartProvider>');
  return dispatch;
}
```

Why this shape?

- **Custom hooks** (`useCart`) hide the context details, and give a clear error if you forget the provider. They also fix the type: no `| null` for the consumer.
- **Two contexts** (state and dispatch): `dispatch` never changes, so components that only dispatch (like an "Add to cart" button) don't re-render when the cart changes.

Usage:

```tsx
// main.tsx
<CartProvider><App /></CartProvider>

// AddToCartButton.tsx
const dispatch = useCartDispatch();
<button onClick={() => dispatch({ type: 'added', product })}>Add</button>

// CartSummary.tsx
const { items } = useCart();
const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0); // derived
```

Remember: **derive** totals and counts in the consumer (or a selector function), don't store them.

### A simpler version

For small contexts, one context holding `{ state, dispatch }` or `{ items, add, remove }` is fine. Don't over-engineer. Pick the simplest thing that works.

---

## 7. React Fast Refresh and file layout

The ESLint rule `react-refresh/only-export-components` warns if a file exports both components and non-component values (like hooks). Common layouts:

```
features/cart/
├── cartReducer.ts       # types + reducer (pure, easy to test)
├── CartContext.tsx      # contexts + CartProvider
├── useCart.ts           # custom hooks that call use(context)
└── index.ts             # public API
```

Split the hooks into their own file to keep the rule happy (and it matches the architecture in `docs/architecture.md`).

---

## 8. When to use context (and when not)

Good for data that many components at different depths need and that changes **rarely or in a contained way**:

- Theme, locale
- Current user
- A cart or a small app-wide store

Not great for:

- State that changes **very often** (every keystroke, mouse position) and is read by many components. Every consumer re-renders.
- Server data like lists of posts. TanStack Query (Lesson 15) is better.
- Large, complex global state. Zustand (Lesson 17) offers selectors, so components re-render only for the slice they use.

Also: keep state **as local as possible**. Don't make something global just because it's convenient. Context is for state that is truly shared.

---

## 9. Persisting and initializing

`useReducer` accepts a third argument, an initializer function that runs once (like `useState`'s lazy initializer):

```tsx
const [state, dispatch] = useReducer(cartReducer, undefined, loadCartFromStorage);
```

Then sync to `localStorage` in an effect:

```tsx
useEffect(() => {
  localStorage.setItem('cart', JSON.stringify(state));
}, [state]);
```

Remember to validate what you read back (it's untrusted outside data).

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| Mutating state inside the reducer | No re-render, or double updates in Strict Mode |
| Side effects in a reducer (fetch, random ids, `Date.now()`) | Impure. Strict Mode calls reducers twice and exposes it |
| Action names like `SET_STATE` | You've rebuilt `useState` with extra steps. Describe events |
| Forgetting a `case` | State becomes `undefined`. Use an exhaustive check |
| Using `useContext` outside a provider with a `null` default | Crashes later. Throw a clear error in the hook |
| Putting everything in one giant context | Everything re-renders on every change |
| Creating the provider's `value` inline (`value={{ a, b }}`) | New object each render, so all consumers re-render. Memoize or split |
| Storing derived values (totals) in state | Goes out of sync |
| Using context for fast-changing state | Performance problems. Use a store (Lesson 17) |
| Using context when passing `children` would do | Needless indirection |

---

## Key takeaways

- A reducer is a pure function `(state, action) => newState`. It centralizes how state changes.
- Type actions as a discriminated union and name them after events.
- `useReducer` gives you `[state, dispatch]`. `dispatch` is stable.
- Context shares values without prop drilling: create, provide, consume with `use`.
- Wrap context in a provider component and custom hooks that throw a clear error.
- Split state and dispatch contexts to limit re-renders.
- Derive totals instead of storing them. Keep state local when you can.
- Context isn't a replacement for a data-fetching library or a full state store.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to [Lesson 13: Custom hooks](../13-custom-hooks/README.md).
