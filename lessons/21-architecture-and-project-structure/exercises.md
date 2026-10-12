# Lesson 21: Exercises

Most of these are design and refactoring exercises. Do them on paper first, then in a practice branch of an earlier project. Try each one **before** reading the answer.

---

## Exercise 1: Where does it go?

Given the structure with `app/`, `features/<name>/`, `components/`, `hooks/`, `lib/`, `types/`, place each file:

1. `Button.tsx` (a generic styled button)
2. `CartItem.tsx` (shows a product row with a quantity stepper)
3. `useDebounce.ts`
4. `formatPrice.ts` (used by cart, products, and orders)
5. `moveCard.ts` (pure function for the Kanban board)
6. `QueryProvider.tsx` (creates the `QueryClient`)
7. `apiClient.ts`
8. `GithubUser` (a type only used by the GitHub explorer)
9. `useWindowSize.ts` (used in one feature only, for now)

<details>
<summary>Suggested answers</summary>

1) `components/` · 2) `features/cart/components/` · 3) `hooks/` · 4) `lib/` (shared by several features) · 5) `features/board/lib/` · 6) `app/` · 7) `lib/` · 8) `features/github/types.ts` · 9) inside that feature's `hooks/`, and promote it when a second feature needs it
</details>

---

## Exercise 2: Dependency rules

Which of these imports are allowed? Explain each.

```ts
// a: in features/cart/components/CartButton.tsx
import { Button } from '@/components/Button';

// b: in features/cart/components/CartButton.tsx
import { useUser } from '@/features/auth';

// c: in features/cart/components/CartButton.tsx
import { LoginForm } from '@/features/auth/components/LoginForm';

// d: in components/Button.tsx
import { useCartCount } from '@/features/cart';

// e: in features/auth/index.ts
import { CartButton } from '@/features/cart';

// f: in app/router.tsx
import { CartPage } from '@/features/cart';
```

<details>
<summary>Answers</summary>

a) Allowed: a feature using shared UI. b) Allowed but a coupling to watch: it goes through `auth`'s public API. c) Not allowed: reaching into another feature's internals. d) Not allowed: shared code must not depend on features. e) Suspicious: if `cart` also imports `auth`, you've created a cycle. Lift the shared piece out or compose them in `app/`. f) Allowed.
</details>

---

## Exercise 3: Draw your project

Take your largest project so far (the Kanban board, the GitHub explorer, or the blog).

1. List every file under `src/`
2. Group them into candidate features. How many features are there?
3. Mark the files that are really shared
4. Draw the target tree, and write one sentence for each folder saying what belongs there
5. Predict the three trickiest moves

---

## Exercise 4: A public API

For a `board` feature with `BoardPage`, `Column`, `Card`, `useBoardStore`, `moveCard`, `BoardData` type, and `assertConsistent`:

1. Decide what goes in `index.ts` and what stays private
2. Write the `index.ts`
3. Which other features, if any, would need `Card`?
4. What would you do if the answer to 3 is "the search feature"?

<details>
<summary>Discussion</summary>

Probably export `BoardPage` and a few selector hooks or types. Keep `Column`, `Card`, `moveCard`, and `assertConsistent` private. If search needs to render a card, either the search feature gets what it needs through a small, intentional export (for example a `CardPreview` component), or the generic part moves to shared `components/`.
</details>

---

## Exercise 5: Set up the alias

In a Vite project:

1. Add the `@/` alias in `tsconfig.app.json` and `vite.config.ts`
2. Convert three deep relative imports (`../../../`) to the alias
3. Check that `npm run build`, the dev server, and the editor's go-to-definition all work
4. If you use Vitest, run the tests, because they should resolve the alias too

---

## Exercise 6: Enforce a boundary

1. Add an ESLint rule that forbids importing `@/features/*/*` (a feature's internals)
2. Trigger it on purpose, and read the message
3. Add a second rule that forbids `components/` and `hooks/` from importing `features/`
4. Break that one on purpose too
5. Run `npx madge --circular src` (or `dependency-cruiser`) and see if you have any cycles

---

## Exercise 7: Split the junk drawer

You have `utils.ts`:

```ts
export const formatPrice = ...
export const debounce = ...
export const isEmail = ...
export const getDiscount = ...
export const groupBy = ...
export const cn = ...
export const parseJwt = ...
```

Decide where each function belongs, and why a single `utils.ts` is a smell. Which are generic (`lib/`), and which have domain knowledge (a feature)?

---

## Exercise 8: Logic out of the component

This component has data fetching, derived values, and rendering in one place. Split it into: an `api` function, a query hook, a pure helper, and a presentational component.

```tsx
function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/orders').then((r) => r.json()).then((d) => { setOrders(d); setLoading(false); });
  }, []);
  const total = orders.reduce((s, o) => s + o.amount, 0);
  const late = orders.filter((o) => new Date(o.dueDate) < new Date() && o.status !== 'paid');
  if (loading) return <p>Loading</p>;
  return (<div><h1>Total {total / 100}</h1>{late.length > 0 && <p>{late.length} late</p>}{orders.map(...)}</div>);
}
```

Where does each piece go in the feature folder? Which piece is the easiest to test now?

---

## Exercise 9: A safe refactor

Pick a small project and refactor it to the feature layout using the safe process:

1. Make sure `build`, `lint`, and (ideally) tests pass first
2. Move **one** feature per commit, with no behavior change
3. Run the checks after each commit
4. Use `git diff -M --stat` to confirm Git sees renames, not delete+add
5. Count the commits and how often you had to fix something. What would have made it safer?

---

## Exercise 10: Too much structure?

For each case say whether to add structure now or wait:

1. A 6-file counter app with a `features/counter/` folder
2. A function copied once into a second file
3. A component that grew to 400 lines with three clear sections
4. Two features that both need the same date formatting
5. A new `index.ts` re-exporting every file in `components/`

<details>
<summary>Suggested answers</summary>

1) Wait; keep it flat. 2) Wait for the third use. 3) Split now, since it hurts to read. 4) Extract to `lib/` now (the second consumer has appeared). 5) Don't: you only want barrels at feature boundaries.
</details>

---

## Check yourself

You're ready for the project if you can answer these without looking:

- Why organize by feature instead of by file type?
- What is the rule for moving a file into shared folders?
- In which direction do imports flow between `app`, `features`, and shared code?
- What is a feature's public API, and why does it matter?
- What's the downside of barrel files used everywhere?
- Why separate logic (hooks, pure functions) from components?
- How can you make the architecture rules automatic?
- Why must a refactor not change behavior in the same commit?
