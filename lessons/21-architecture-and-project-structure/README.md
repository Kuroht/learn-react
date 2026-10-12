# Lesson 21: Architecture and Project Structure

**Goal:** organize a growing React codebase so that anyone can find things quickly and change one feature without breaking another. You'll feel why a flat structure stops working, learn the feature-based layout, enforce boundaries with tooling, and practice refactoring safely.

**Time:** about 3 hours

**Prerequisite:** [Lesson 20](../20-performance-and-profiling/README.md). Also read [`docs/architecture.md`](../../docs/architecture.md), which this lesson puts into practice.

> **Last verified:** October 2026. Architecture advice is opinionated and changes slowly. The tools mentioned (`eslint-plugin-boundaries`, `dependency-cruiser`, `knip`) update often, so check their docs for current configuration.

---

## What you will learn

- Signs that a codebase needs structure
- Organizing by type vs by feature
- The feature-based layout and its rules
- Public APIs and barrel files (and their traps)
- Layers and the direction of dependencies
- Path aliases
- Separating logic from UI, and API from components
- Naming and file conventions
- Enforcing boundaries with ESLint and other tools
- Refactoring safely, in small steps
- When *not* to add structure

---

## 1. Why structure matters

Code is read far more than it's written. The goal of architecture is not elegance, it is **speed of change**:

- A new teammate finds the right file in under a minute
- A change to one feature touches one folder
- You can delete a feature by deleting its folder
- Tests, types, and styles are where you expect them

The danger is the opposite as well: building a cathedral for a shed. **Start simple and let the structure grow when it hurts.** That's why lessons 01 to 20 used a flat `src/`. Now you've lived through the problems:

- 40 files in `components/`, where nobody knows which belong together
- A `utils.ts` with 60 unrelated functions
- Changing the cart means editing files in five folders
- Everything imports everything, so a small change breaks distant screens

---

## 2. Organize by feature, not by file type

**By type** (what we've been doing):

```
src/
├── components/   CartItem.tsx, ProductCard.tsx, BoardColumn.tsx, LoginForm.tsx, ...
├── hooks/        useCart.ts, useBoard.ts, useAuth.ts, ...
├── api/          cart.ts, board.ts, auth.ts
└── types/        cart.ts, board.ts, auth.ts
```

To change the cart you open four folders.

**By feature** (what we'll do now):

```
src/
├── app/                  # setup that runs once: providers, router, global styles
├── features/
│   ├── cart/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── types.ts
│   │   └── index.ts      # public API
│   ├── board/
│   └── auth/
├── components/           # shared, generic UI (Button, Modal, Input)
├── hooks/                # shared hooks (useDebounce, useLocalStorage)
├── lib/                  # helpers and clients (apiClient, formatters, constants)
└── types/                # types shared across features
```

**Code that changes together lives together.** To change the cart you open one folder.

### Where does this file go?

| Question | Answer |
|----------|--------|
| Used by only one feature? | Inside that feature |
| Used by two or more features? | Move to `components/`, `hooks/`, or `lib/` |
| A generic UI piece with no business knowledge? | `components/` |
| Knows about carts, users, or boards? | A feature folder |
| Setup that runs once (router, providers)? | `app/` |

**Rule of thumb:** start inside the feature. Promote to shared only when a *second* feature needs it, and not before.

---

## 3. The layers and the direction of dependencies

Think of three layers, where imports only go **downward**:

```
        app/          ← composes everything (router, providers, pages)
         │
     features/        ← business capabilities (cart, board, auth)
         │
 components/ hooks/ lib/ types/   ← shared building blocks, knowing nothing about features
```

Rules:

1. `app` may import from `features` and shared code
2. A `feature` may import from shared code. It should **not** import from another feature's internals
3. Shared code must **never** import from `features` or `app`

Why? So that the shared Button doesn't suddenly depend on the cart. And dependencies that point one way can't form cycles (A imports B imports A), which cause confusing bugs and break tree-shaking.

When two features must work together (checkout needs the cart), the dependency goes through the **public API** (`import { useCart } from '@/features/cart'`), or the combination happens one layer up in `app/` or a page.

---

## 4. Public APIs and barrel files

Each feature exposes only what others need through `index.ts`:

```ts
// features/cart/index.ts
export { CartButton } from './components/CartButton';
export { CartPage } from './components/CartPage';
export { useCartCount } from './hooks/useCartCount';
export type { CartItem } from './types';
```

Everything else is **private**. Benefits:

- The feature can reorganize its insides without breaking anyone
- Imports tell you what's intended to be used
- It's easy to see a feature's surface area (and shrink it)

```ts
// good
import { CartButton } from '@/features/cart';
// bad: reaching into internals
import { CartButton } from '@/features/cart/components/CartButton';
```

### The barrel file trap

An `index.ts` that re-exports everything is called a *barrel*. Used at the feature boundary it's helpful, but beware:

- **Don't use barrels inside** a feature or in every folder. Cycles and slow dev tooling follow
- Large barrels can hurt tree-shaking and test startup time in some setups (importing one thing loads the whole feature)
- Export only the public surface, not "everything just in case"
- Prefer **named exports** over default exports. Renames are tracked, search works, and auto-imports behave

---

## 5. Path aliases

Replace `../../../components/Button` with `@/components/Button`. Configure it in both the compiler and the bundler (see `docs/architecture.md`):

```json
// tsconfig.app.json
{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["src/*"] } } }
```

```ts
// vite.config.ts
resolve: { alias: { '@': path.resolve(__dirname, 'src') } }
```

If you use Vitest it picks up Vite's alias automatically. Inside a feature use **relative** imports for its own files (`./components/CartItem`) and the alias only for crossing boundaries. That makes it obvious what's local and what's external.

---

## 6. Separate logic from UI and server from components

### Components render, hooks decide

```tsx
// features/cart/hooks/useCartSummary.ts
export function useCartSummary() {
  const items = useCartStore((s) => s.items);
  const subtotal = getSubtotal(items);
  const shipping = getShipping(subtotal);
  return { items, subtotal, shipping, total: subtotal + shipping };
}

// features/cart/components/CartSummary.tsx
export function CartSummary() {
  const { subtotal, shipping, total } = useCartSummary();
  return (<dl>...{formatPrice(total)}...</dl>);
}
```

The hook is easy to test and reuse. The component is easy to read.

### Pure logic in plain files

Calculations (`getSubtotal`, `isOverdue`, `moveCard`) are plain TypeScript functions with no React imports: `features/cart/lib/totals.ts`. They're the easiest code to test and to move.

### The API layer

Components never call `fetch`. Layers:

```
Component → query/mutation hook → api function → apiClient
```

```ts
// lib/apiClient.ts: one place for base URL, headers, error handling
// features/products/api/getProducts.ts: typed function (and Zod parsing)
// features/products/hooks/useProducts.ts: TanStack Query wrapper
// features/products/components/ProductList.tsx: renders
```

When the backend changes, you edit one layer.

---

## 7. Naming and file conventions

Follow the table in `docs/architecture.md`. The ones that matter most:

- Components: `PascalCase.tsx`, one main component per file, named exports
- Hooks: `useThing.ts`
- Tests and stories next to the code: `CartSummary.test.tsx`
- Folders: `kebab-case`
- Types: `types.ts` in the feature, `ComponentNameProps` for props
- Booleans start with `is`/`has`/`can`. Handlers: props are `onX`, functions are `handleX`
- Consistent file **names** that describe the thing (`getProducts.ts`, not `api.ts` x 10)

Also decide the team's conventions **once**, write them down (`CONTRIBUTING.md`), and let tools enforce them (ESLint, Prettier).

---

## 8. Enforcing the rules with tools

Conventions that only live in people's heads get broken. Make the tooling say no.

### ESLint: restrict imports

```js
// eslint.config.js
{
  files: ['src/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        { group: ['@/features/*/*'], message: 'Import from the feature root (@/features/<name>) instead of its internals.' },
      ],
    }],
  },
},
{
  files: ['src/components/**', 'src/hooks/**', 'src/lib/**'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{ group: ['@/features/*', '@/app/*'], message: 'Shared code must not depend on features or the app layer.' }],
    }],
  },
},
```

(An overriding config replaces earlier rule settings for the same rule, so combine patterns per file group carefully.)

### More powerful tools

- **`eslint-plugin-boundaries`**: declare layers and which may import which
- **`dependency-cruiser`**: validates dependency rules and finds circular imports, and can draw a graph
- **`knip`**: finds unused files, exports, and dependencies (dead code removal)
- **`madge --circular`**: quickly detects circular dependencies
- TypeScript `strict` mode, `noUncheckedIndexedAccess`, and `verbatimModuleSyntax` catch many structural mistakes

Run them in CI (Lesson 24), so a violation fails the pull request.

---

## 9. Refactoring safely

Restructuring a working app is risky. Do it in small, verifiable steps:

1. **Get a safety net first.** Tests (Lesson 19) for the behavior that must not change, or at least `npm run build` + lint + a manual checklist
2. **One move per commit.** "Move cart files into features/cart" is a commit. "Add public index" is another. No behavior changes mixed with moves
3. **Use your editor's move/rename.** VS Code updates imports when you drag a file
4. **Add the alias and the lint rules early**, so mistakes are flagged as you go
5. **Fix in this order:** shared things stabilize first, then features one by one, then `app/`
6. **Run everything after each step** (type-check, lint, tests)
7. **Delete dead code** you discover (`knip` helps)
8. **Don't improve behavior while moving.** Note ideas for later

Use `git mv` or the editor so Git tracks renames, and review the diff with `git diff -M`.

---

## 10. Pages, routes, and features

A common point of confusion: where do routes and pages go?

- **Feature components** are reusable UI of a capability (`CartSummary`)
- **Pages/routes** compose features into a screen for a URL (`CheckoutPage` uses cart, payment, and address features)
- Put route definitions in `app/router.tsx`, and page components in `app/routes/` (or `pages/`). They're thin: they fetch via loaders/hooks and arrange feature components
- A feature may export a page-level component (`CartPage`) if it's self-contained

Keep pages thin. If a page file has real logic, it belongs in a feature.

---

## 11. When not to add structure

- A 5-file app doesn't need `features/`. Don't build empty folders "for later"
- Don't create `index.ts` in every folder
- Don't abstract after seeing a pattern once. Wait for the third time ("rule of three")
- Don't split a 60-line component into six files just to hit a rule
- Don't move code to `shared` "in case". Wait for the second consumer
- Prefer **deleting** and **simplifying** over adding layers

Structure is a tool to reduce cost. If it adds more navigation than it saves, you've gone too far.

---

## 12. A feature checklist

Before calling a feature "structured":

- [ ] All of its code lives in its folder
- [ ] It exposes a small public API in `index.ts`
- [ ] It imports only from shared code and other features' public APIs
- [ ] Shared code doesn't import it
- [ ] Server calls are in `api/`, wrapped by hooks
- [ ] Logic lives in hooks and plain functions; components render
- [ ] Tests sit next to the code
- [ ] You could delete the folder and the compiler would tell you exactly what breaks

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| Organizing by file type forever | Every change touches many folders |
| A single huge `utils.ts` / `helpers.ts` | A junk drawer nobody can search |
| Importing a feature's internals | Any reorganization breaks distant code |
| Shared code importing from features | Circular dependencies and tangled layers |
| Barrel files everywhere | Cycles, slow tooling, accidental loading of everything |
| Moving to `shared/` too early | A dumping ground that couples unrelated features |
| Refactoring and changing behavior in one commit | Impossible to review or bisect |
| Refactoring without tests or checks | Silent regressions |
| Building structure "for the future" | Complexity you pay for today |
| Rules documented but not enforced | They erode in weeks |
| Very deep folder nesting | Hard to navigate. Keep it shallow |

---

## Key takeaways

- Structure exists to make change fast and safe. Start simple and grow it when it hurts.
- Organize by feature: code that changes together lives together. Shared code is promoted only when a second consumer appears.
- Dependencies point one way: `app → features → shared`. Features talk through public APIs.
- Components render, hooks decide, plain functions calculate, and `api/` talks to the server.
- Enforce boundaries with ESLint and tools like `dependency-cruiser` and `knip`, and run them in CI.
- Refactor in small steps with a safety net, and never mix moving with changing behavior.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to Module 6 with Lesson 22: Next.js basics.
