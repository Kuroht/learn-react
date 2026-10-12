# Lesson 19 Project: Add Tests to the Shopping Cart

Take your Lesson 12 shopping cart (or the Zustand version from Exercise 5 in Lesson 17) and give it a real test suite: unit tests for the logic, component tests for the UI, mocked network tests, and one end-to-end test.

> **Last verified:** October 2026, with Vitest 5, React Testing Library 16, MSW 3, and Playwright. Vitest 5 and MSW 3 need Node 22+. Check [vitest.dev](https://vitest.dev), [mswjs.io](https://mswjs.io), and [playwright.dev](https://playwright.dev) for the current setup.

---

## Brief

You'll **not** add features. You'll prove the cart works, find bugs along the way, and leave a test setup that the next contributor can use.

If your cart has no network calls, add one: a `GET /api/products` that loads the catalog and a `POST /api/checkout` for the order (a fake local endpoint is enough, because MSW will mock it in tests anyway).

Every stage ends with a **checkpoint**: something you should see in the terminal.

---

## Getting started

```bash
cd lessons/19-testing/project
# copy your Lesson 12 project here, or:
git switch -c yourname/lesson-19
cd starter
npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom msw vitest-axe @vitest/coverage-v8
```

Set up Vitest as in the lesson: the `test` block in `vite.config.ts`, `src/test/setup.ts`, the `test` script, and TypeScript types.

Suggested structure:

```
src/
├── features/cart/
│   ├── cartReducer.ts
│   ├── cartReducer.test.ts
│   ├── selectors.test.ts
│   └── components/ (CartDrawer.tsx, CartDrawer.test.tsx, ...)
└── test/
    ├── setup.ts
    ├── server.ts        # MSW handlers
    └── utils.tsx        # renderWithProviders
```

Keep each test file **next to** the code it tests.

Work in your own branch: `git checkout -b yourname/lesson-19`

---

## Stage 1: Setup works

- [ ] `npm test` starts Vitest in watch mode and `npx vitest run` runs once
- [ ] A trivial test (`expect(1 + 1).toBe(2)`) passes
- [ ] A trivial component test using `render` and `toBeInTheDocument()` passes (this proves jsdom and jest-dom are wired)
- [ ] `tsc -b` still passes (the test types are configured)

**Checkpoint:** all green, with no TypeScript errors in test files.

---

## Stage 2: Unit tests for the reducer

In `cartReducer.test.ts`:

- [ ] `itemAdded`: new product starts at quantity 1; the same product again increments the quantity (no duplicates)
- [ ] The quantity is capped at 10
- [ ] `itemRemoved`: removes the item, and an unknown id leaves the state unchanged
- [ ] `quantityChanged`: updates, and a value of 0 or less removes the item
- [ ] `promoApplied` / `promoRemoved` / `cartCleared`
- [ ] The reducer never mutates its input (freeze the state)
- [ ] One test that runs a **sequence** of actions
- [ ] Use `it.each` at least once

**Checkpoint:** at least 12 passing reducer tests. Did you find a bug? Write down what and where (in `NOTES.md`).

---

## Stage 3: Unit tests for selectors

- [ ] `getItemCount`, `getSubtotal`, `getDiscount`, `getShipping`, `getTotal`
- [ ] Edge cases: an empty cart, free shipping at exactly the threshold, an unknown promo, `FREESHIP`, `SAVE10`
- [ ] Rounding: prices that produce fractions of a cent
- [ ] Table tests (`it.each`) for the shipping thresholds

**Checkpoint:** every selector has a happy path and at least one edge case tested.

---

## Stage 4: Component tests

Create `renderWithProviders` in `src/test/utils.tsx` (providers: cart, router if used, and a fresh `QueryClient` with `retry: false` if used).

Test (using only `getByRole`, `getByLabelText`, `findBy…`, and `userEvent`):

- [ ] `ProductCard`: shows name and price, and "Add to cart" updates the cart count in the header
- [ ] `CartDrawer`: lists items, increases and decreases quantity, removes an item, shows the empty state
- [ ] Totals update when quantities change (assert on text the user sees)
- [ ] Promo code form: a valid code shows a success message and the discount; an invalid code shows an error
- [ ] The drawer closes with Escape and returns focus to the cart button

**Checkpoint:** tests don't import the reducer or know the component's internal state.

---

## Stage 5: Mock the network with MSW

- [ ] `src/test/server.ts` with handlers for `GET /api/products` and `POST /api/checkout`
- [ ] Server lifecycle in `setup.ts` (`listen` with `onUnhandledFrame: 'error'`, `resetHandlers`, `close`). Import `http` and `HttpResponse` from `msw/http` (MSW 3)
- [ ] Test the product list's loading state, success, empty, and server error (`server.use(...)` overrides)
- [ ] Test checkout: success clears the cart and shows a confirmation; a 500 keeps the cart and shows an error
- [ ] Assert that the request body sent to `POST /api/checkout` is correct (capture it in the handler)

**Checkpoint:** no test touches the real network. Remove a handler and watch the test fail loudly.

---

## Stage 6: Persistence and hooks

- [ ] Test that the cart is saved to `localStorage` and restored on the next render
- [ ] Test that **corrupt** stored data falls back to an empty cart (set an invalid JSON string first)
- [ ] Clear `localStorage` in `beforeEach` so tests are independent
- [ ] `renderHook` tests for your `useCart` hooks, including the error when used outside the provider

**Checkpoint:** run the whole suite in random order (`vitest --sequence.shuffle`). It still passes.

---

## Stage 7: Accessibility tests

- [ ] An axe test for the product grid and for the open cart drawer
- [ ] Fix whatever it finds (write the failing test first!)
- [ ] Use role-based queries throughout, so tests fail when accessibility regresses

---

## Stage 8: One end-to-end test

```bash
npm init playwright@latest
```

- [ ] One Playwright test: open the shop, add two products, open the cart, change a quantity, apply `SAVE10`, and check the total
- [ ] Locate by role and label only
- [ ] Playwright starts your dev server automatically (`webServer` in `playwright.config.ts`)
- [ ] The test passes headless and with `--ui`

**Checkpoint:** `npx playwright test` is green.

---

## Stage 9: Coverage and reflection

```bash
npx vitest run --coverage
```

- [ ] Look at the report. What isn't covered, and does it matter?
- [ ] Do **not** add tests only to raise the number
- [ ] In `NOTES.md` answer: which test would have caught your hardest past bug? Which test is the most likely to be flaky? Which one would you delete, and why?

---

## Stage 10: Check your work

```bash
npm run build
npm run lint
npx vitest run
```

All three should pass. No `any` in tests either (type your mocks).

---

## Requirements checklist

**Must have**

- [ ] Vitest + Testing Library + jest-dom configured
- [ ] At least 12 reducer tests and tests for every selector
- [ ] Component tests using accessible queries and `userEvent`
- [ ] MSW handlers, with success and failure cases tested
- [ ] A `renderWithProviders` helper and a fresh `QueryClient` per test
- [ ] Persistence tests, including corrupt data
- [ ] At least two axe checks
- [ ] One Playwright E2E test
- [ ] `NOTES.md` with the bugs found and your reflections
- [ ] `npm run build`, `npm run lint`, and `npx vitest run` pass

**Nice to have**

- [ ] A GitHub Actions job that runs the tests (prepares you for Lesson 24)
- [ ] A bug you found and fixed test-first, with the commit history to show it
- [ ] Mutation testing with Stryker on the reducer (does it detect deliberate mistakes?)
- [ ] Visual regression test with Playwright screenshots
- [ ] Test for a keyboard-only flow

---

## Hints

<details>
<summary><code>describe</code>/<code>it</code>/<code>expect</code> aren't found by TypeScript</summary>

Add `"vitest/globals"` and `"@testing-library/jest-dom"` to the `types` array in the tsconfig that includes your `src` files, next to the existing `"vite/client"` (don't replace it). Or import them explicitly: `import { describe, it, expect } from 'vitest'`.
</details>

<details>
<summary><code>toBeInTheDocument</code> is not a function</summary>

Import `@testing-library/jest-dom/vitest` (not just `@testing-library/jest-dom`) in your setup file, and make sure the setup file is listed in `setupFiles`.
</details>

<details>
<summary>My test passes alone but fails with the others</summary>

State is leaking. Common culprits: `localStorage`, a shared `QueryClient`, module-level state, MSW handlers overridden with `server.use` and never reset, or fake timers not restored.
</details>

<details>
<summary>"Not wrapped in act(...)" warnings</summary>

Something updated state after your test finished waiting. `await` the final UI change with `findBy…`, and make sure you `await` every `user.*` call.
</details>

<details>
<summary>MSW says the request was unhandled</summary>

The URL must match exactly, including the origin. For relative URLs in jsdom, use the full `http://localhost:3000/api/...` form, or set the `fetch` base URL in tests. Check the method (`http.get` vs `http.post`).
</details>

<details>
<summary>The Playwright test is flaky</summary>

Don't use fixed waits. Rely on auto-waiting locators and web-first assertions (`await expect(locator).toBeVisible()`). Make the app state deterministic, and start from a clean `localStorage` each test (Playwright contexts are fresh by default).
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per stage.
3. Push and open a pull request titled `Lesson 19: yourname`, with a screenshot of the test output and the coverage summary.
4. Ask a friend to review it. A good review asks: if I refactor the internals, would these tests still pass? If I break the feature, would they fail?

---

## Done when

- The cart has a fast, reliable test suite at every level
- You found and documented at least one real bug (or deliberately introduced one and caught it)
- Build, lint, unit/component tests, and the E2E test all pass
- Your PR is open and a friend has reviewed it

Next up: **Lesson 20: Performance and profiling**.
