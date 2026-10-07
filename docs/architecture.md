# Architecture

How we structure React apps in this repo, and why. You do not need this on day one. Early lessons use a flat `src/` folder on purpose. From **Lesson 21** onward, projects follow the structure below, and you will refactor an earlier project to match it.

The goal is simple: **a new person should be able to find any piece of code in under a minute, and change one feature without breaking another.**

---

## Principles

1. **One job per piece.** A component renders UI. A hook holds logic. A function transforms data. Do not mix them.
2. **Organize by feature, not by file type.** Code that changes together lives together.
3. **Keep state as local as possible.** Lift it up only when two components need it.
4. **Make impossible states impossible.** Use TypeScript types to model what can actually happen.
5. **Start simple, refactor when it hurts.** Do not build a big structure for a small app.

---

## Folder structure

```
src/
├── app/                # app setup: providers, router, global styles
│   ├── App.tsx
│   ├── providers.tsx
│   ├── router.tsx
│   └── index.css
├── features/           # one folder per feature
│   └── cart/
│       ├── components/ # UI used only by this feature
│       ├── hooks/      # logic used only by this feature
│       ├── api/        # server calls for this feature
│       ├── types.ts
│       └── index.ts    # the feature's public API
├── components/         # shared, generic UI (Button, Modal, Input)
├── hooks/              # shared hooks (useDebounce, useLocalStorage)
├── lib/                # helpers and configs (apiClient, formatters, constants)
├── types/              # types shared across features
└── main.tsx
```

### What goes where

| Question | Answer |
|----------|--------|
| Is it used by only one feature? | Put it inside that feature |
| Is it used by two or more features? | Move it to `components/`, `hooks/`, or `lib/` |
| Is it a generic UI piece with no business knowledge? | `components/` |
| Does it know about carts, users, or boards? | A feature folder |
| Is it setup that runs once (router, providers)? | `app/` |

**Rule of thumb:** start inside the feature. Move code to the shared folders only when a second feature needs it, not before.

---

## Feature boundaries

Each feature exposes a small public API through its `index.ts`:

```ts
// features/cart/index.ts
export { CartButton } from './components/CartButton';
export { CartPage } from './components/CartPage';
export { useCart } from './hooks/useCart';
export type { CartItem } from './types';
```

Other parts of the app import from the feature, never from its internals:

```ts
// good
import { CartButton } from '@/features/cart';

// bad: reaching into the feature's internals
import { CartButton } from '@/features/cart/components/CartButton';
```

Why: the feature can reorganize its insides freely without breaking the rest of the app.

**Features should not import from each other's internals.** If two features need to talk, either go through the public `index.ts` or lift the shared piece up to `components/`, `hooks/`, or `lib/`.

### Import alias

Set up `@/` to point to `src/` so imports stay readable.

`tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

`vite.config.ts`:

```ts
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
```

---

## Component design

### Keep components small

If a component is longer than about 100 lines, or you struggle to name it, split it.

### Separate logic from presentation

Put the logic in a hook and keep the component focused on rendering:

```tsx
// features/cart/hooks/useCart.ts
export function useCart() {
  const items = useCartStore((s) => s.items);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return { items, total };
}
```

```tsx
// features/cart/components/CartSummary.tsx
export function CartSummary() {
  const { items, total } = useCart();
  return (
    <section>
      <h2>{items.length} items</h2>
      <p>Total: {formatPrice(total)}</p>
    </section>
  );
}
```

### Prefer composition over configuration

Instead of a component with ten props, pass children:

```tsx
// harder to extend
<Card title="Hi" footer="Bye" showBorder hasShadow />

// easier to extend
<Card>
  <Card.Header>Hi</Card.Header>
  <Card.Footer>Bye</Card.Footer>
</Card>
```

### Typing props

- Use `type` for props and name them `ComponentNameProps`.
- Never use `any`. Use `unknown` if you truly do not know and narrow it.
- Extend native element props for reusable UI:

```tsx
type ButtonProps = React.ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
};
```

---

## Where state lives

Pick the simplest option that works:

| Kind of state | Tool |
|---------------|------|
| Used by one component | `useState` |
| Complex local logic with many transitions | `useReducer` |
| Shared by a few nearby components | Lift state up to the closest parent |
| Needed deep in the tree, changes rarely (theme, user) | Context |
| Needed across many features, changes often (cart, board) | Zustand |
| Data from a server | TanStack Query, not Zustand |
| Form state | React Hook Form |
| State that should survive a refresh or be shareable | URL (search params) |

Common mistake: copying server data into global state. Let TanStack Query own it, since it already handles caching, loading, and errors.

---

## Data fetching

- Put server calls in the feature's `api/` folder as plain typed functions.
- Wrap them in TanStack Query hooks in the feature's `hooks/` folder.
- Components never call `fetch` directly.

```ts
// features/github/api/getUser.ts
import { apiClient } from '@/lib/apiClient';
import type { GithubUser } from '../types';

export function getUser(username: string) {
  return apiClient<GithubUser>(`/users/${username}`);
}
```

```ts
// features/github/hooks/useGithubUser.ts
import { useQuery } from '@tanstack/react-query';
import { getUser } from '../api/getUser';

export function useGithubUser(username: string) {
  return useQuery({
    queryKey: ['github', 'user', username],
    queryFn: () => getUser(username),
    enabled: username.length > 0,
  });
}
```

Always handle three states in the UI: **loading**, **error**, and **empty**. Lesson 18 is about exactly this.

---

## Modeling state with types

Use a discriminated union instead of several booleans:

```ts
// easy to get wrong: what if isLoading and isError are both true?
type State = { isLoading: boolean; isError: boolean; data?: User };

// impossible states are impossible
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: User };
```

TypeScript then forces you to handle every case.

---

## Naming conventions

| Thing | Convention | Example |
|-------|------------|---------|
| Component file | `PascalCase.tsx` | `ProductCard.tsx` |
| Hook file | `camelCase.ts`, starts with `use` | `useLocalStorage.ts` |
| Utility file | `camelCase.ts` | `formatPrice.ts` |
| Types file | `types.ts` inside a feature | `features/cart/types.ts` |
| Folders | `kebab-case` | `shopping-cart/` |
| Props type | `ComponentNameProps` | `ButtonProps` |
| Boolean variables | start with `is`, `has`, `can` | `isOpen`, `hasError` |
| Event handler props | `onSomething` | `onSubmit` |
| Event handler functions | `handleSomething` | `handleSubmit` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_ITEMS` |

Use **named exports** for components, hooks, and utilities. They are easier to search and refactor than default exports.

---

## Error handling and loading

- Wrap each major page or feature in an **error boundary** so one crash does not blank the whole app.
- Use `Suspense` with a fallback for lazy-loaded routes.
- Show something useful in every state: skeletons while loading, readable messages on errors, helpful text when a list is empty.
- Make UI accessible from the start: semantic HTML, labels on inputs, keyboard support, visible focus.

---

## Testing layout

Keep tests next to the code they test:

```
features/cart/
├── components/
│   ├── CartSummary.tsx
│   └── CartSummary.test.tsx
└── hooks/
    ├── useCart.ts
    └── useCart.test.ts
```

- Test **behavior the user sees**, not implementation details.
- Query by role and label (`getByRole`, `getByLabelText`), not by class names.
- Write tests for logic-heavy hooks and utilities first. They give the most value for the least effort.

---

## Anti-patterns to avoid

- **A giant `utils.ts`** that holds everything. Split by purpose.
- **Prop drilling through five levels.** Use composition, context, or a store.
- **Storing derived data in state.** Calculate it during render instead (`const total = ...`).
- **`useEffect` for everything.** Many effects can be event handlers or derived values. Read [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).
- **Copying server data into local state.** Let TanStack Query own it.
- **Premature abstraction.** Wait until you have seen the same pattern three times before extracting it.
- **Files named `index.tsx` everywhere** for components. They make editor tabs unreadable. Use `index.ts` only for feature public APIs.

---

## How the architecture grows with the lessons

| Stage | Structure |
|-------|-----------|
| Lessons 01 to 09 | Flat `src/` with a `components/` folder |
| Lessons 10 to 13 | Add `hooks/` for custom hooks |
| Lessons 14 to 18 | Add `lib/`, an `api/` layer, and a `pages/` or route components |
| Lesson 21 onward | Full feature-based structure from this document |

You will feel the pain of the flat structure first, and that is the point. The refactor in Lesson 21 will make sense because you have lived through the problem.

---

## Further reading

- [React docs: Thinking in React](https://react.dev/learn/thinking-in-react)
- [React docs: Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)
- [React docs: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react): a large reference project for feature-based architecture
- [TanStack Query docs](https://tanstack.com/query/latest)
