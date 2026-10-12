# Lesson 12 Project: Shopping Cart

Build a shop with a cart managed by a reducer and shared through context, with a drawer, quantity controls, a promo code, and persistence.

> **Last verified:** October 2026. Check [react.dev/learn/scaling-up-with-reducer-and-context](https://react.dev/learn/scaling-up-with-reducer-and-context) for the current patterns.

---

## Brief

A product page with a grid of products, a cart button in the header showing the number of items, and a cart drawer where you can change quantities, remove items, apply a promo code, and see the totals. The cart survives a page reload.

You'll reuse your Lesson 03 product cards and Lesson 09 components if you like.

Every stage ends with a **checkpoint**: something you should see in the browser.

---

## Getting started

```bash
cd lessons/12-usereducer-and-context/project
npm create vite@latest starter -- --template react-ts
cd starter
npm install
npm run dev
```

Tailwind is optional but recommended (see Lesson 07).

Work in your own branch: `git checkout -b yourname/lesson-12`

---

## Stage 1: Types and the reducer

Create `src/features/cart/cartReducer.ts` (no React in this file):

```ts
export type CartItem = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
  promoCode: string | null;
};

export type CartAction =
  | { type: 'itemAdded'; product: Omit<CartItem, 'quantity'> }
  | { type: 'itemRemoved'; id: number }
  | { type: 'quantityChanged'; id: number; quantity: number }
  | { type: 'promoApplied'; code: string }
  | { type: 'promoRemoved' }
  | { type: 'cartCleared' };
```

- [ ] Implement `cartReducer(state, action): CartState`
- [ ] Adding the same product twice increases its quantity (no duplicate rows)
- [ ] Setting a quantity of 0 or less removes the item. Cap the quantity at 10
- [ ] The reducer is **pure** (no mutation, no `Date.now()`, no fetch)
- [ ] Add an exhaustive `never` check in the switch

**Checkpoint:** call the reducer with a few actions in a scratch file or test and print the results.

---

## Stage 2: Pure helpers (selectors)

In `src/features/cart/selectors.ts`:

- [ ] `getItemCount(state)`: the total quantity
- [ ] `getSubtotal(state)`
- [ ] `getDiscount(state)`: a promo of `SAVE10` gives 10% off, and `FREESHIP` removes shipping. Unknown codes do nothing
- [ ] `getShipping(state)`: €4.90, free over €50 or with `FREESHIP`, and €0 for an empty cart
- [ ] `getTotal(state)`

Totals are **derived**, never stored. Watch out for floating-point (round to cents, or work in cents as integers).

**Checkpoint:** the functions return the right numbers for a cart you write by hand.

---

## Stage 3: Context and hooks

- [ ] `CartContext.tsx` exports `CartProvider`, using `useReducer` and two contexts (state and dispatch)
- [ ] `useCart.ts` exports `useCart()` and `useCartDispatch()`, each throwing a clear error outside the provider
- [ ] `index.ts` is the public API of the feature
- [ ] Wrap `<App />` in `<CartProvider>` in `main.tsx`
- [ ] ESLint's `react-refresh` rule has no warnings

**Checkpoint:** calling `useCart()` outside the provider shows your error message.

---

## Stage 4: The shop

- [ ] A typed list of at least eight products
- [ ] `ProductCard` with an "Add to cart" button that calls `dispatch`. The card itself takes **no** callback props
- [ ] The header has a cart button with a badge showing the item count (`getItemCount`)
- [ ] Clicking "Add" repeatedly keeps increasing the badge
- [ ] The "Add" button briefly shows "Added ✓" (a local `useState` with a timeout and cleanup)

**Checkpoint:** adding products updates the badge.

---

## Stage 5: The cart drawer

- [ ] A drawer or modal, opened from the header button (use the `<dialog>` element, or a fixed panel with `aria-modal`)
- [ ] `isCartOpen` is **UI state**: keep it in `App` or in its own small context (not in the cart reducer). Why?
- [ ] Lists each item with an image, name, unit price, a quantity stepper (-/+), a line total, and a remove button
- [ ] An empty-cart message with a "Continue shopping" button
- [ ] Closes with Escape and a close button. Focus returns to the cart button

**Checkpoint:** you can add, change, and remove items in the drawer, and the badge always matches.

---

## Stage 6: Totals and promo code

- [ ] A summary: subtotal, discount (when active), shipping, and total
- [ ] A promo input with an "Apply" button. Valid codes show a success message. Invalid ones show an error (the error is local UI state)
- [ ] Applied code shown as a removable tag
- [ ] A "Free shipping on orders over €50" progress hint ("Add €12.40 more for free shipping")
- [ ] A "Clear cart" button with a confirmation step

**Checkpoint:** try `SAVE10`, `FREESHIP`, and a wrong code. All totals match your calculations.

---

## Stage 7: Persistence

- [ ] Use the reducer's initializer (the third argument) to load the cart from `localStorage`
- [ ] **Validate** the stored data's shape. Corrupt or old data falls back to an empty cart
- [ ] Save changes in an effect that depends on `state`
- [ ] Verify: reload the page. Edit the stored value in DevTools to something invalid and reload again

**Checkpoint:** the cart survives reloads, and bad data doesn't crash the app.

---

## Stage 8: Re-render review

- [ ] Use React DevTools "Highlight updates". Clicking "Add" should not re-render the whole product grid
- [ ] Confirm that product cards (which only use dispatch) don't re-render when the cart changes (if they do, find out why. Hint: parent re-render or a non-stable value)
- [ ] Write 3 sentences in `NOTES.md`: what re-renders and why

---

## Stage 9: Check your work

```bash
npm run build
npm run lint
```

Both should pass. No `any`.

---

## Requirements checklist

**Must have**

- [ ] A pure, typed `cartReducer` with a discriminated union of event-style actions
- [ ] Selectors for count, subtotal, discount, shipping, and total (derived, not stored)
- [ ] `CartProvider` with state and dispatch contexts, plus custom hooks that throw outside the provider
- [ ] Product grid, header badge, and cart drawer using the hooks
- [ ] Promo codes and the free-shipping rule
- [ ] Persistence with validation
- [ ] Feature folder with a public `index.ts`
- [ ] No `any`
- [ ] `npm run build` and `npm run lint` pass

**Nice to have**

- [ ] Unit tests for the reducer and selectors (they're pure, so it's easy. Lesson 19 covers testing)
- [ ] An "Undo" for the last removal (extend the state with a `lastRemoved` field)
- [ ] A wish-list feature with its own reducer
- [ ] A checkout page (a form from Lesson 05) that shows an order summary
- [ ] Sync the cart between browser tabs with the `storage` event

---

## Hints

<details>
<summary>My reducer returns <code>undefined</code> for some action</summary>

A `case` is missing a `return`, or you added a new action type without handling it. Add the `never` exhaustiveness check so TypeScript catches it.
</details>

<details>
<summary>Items appear twice in Strict Mode (or quantity jumps by 2)</summary>

React calls reducers twice in development to expose impurity. Your reducer is probably mutating `state` (for example with `push`, or `item.quantity++`). Return new objects instead.
</details>

<details>
<summary>How do I work with money safely?</summary>

Store prices in **cents** as integers (`1290` for €12.90) and format only when displaying. Percentages: `Math.round(subtotal * 0.1)`.
</details>

<details>
<summary>The drawer's open state: should it be in the cart reducer?</summary>

Probably not. "Is the drawer open?" is UI state, while the cart contents are domain state. Mixing them means opening the drawer re-renders consumers of cart data. Keep UI state separate and as local as possible.
</details>

<details>
<summary>Every component re-renders when the cart changes</summary>

Check that components which only need `dispatch` use `useCartDispatch()`, not `useCart()`. Also check that the provider's `value` isn't a new object each render.
</details>

<details>
<summary>How do I validate data from <code>localStorage</code>?</summary>

Write a type-guard function:

```ts
function isCartState(value: unknown): value is CartState {
  return (
    typeof value === 'object' && value !== null &&
    Array.isArray((value as CartState).items) &&
    (value as CartState).items.every(
      (i) => typeof i.id === 'number' && typeof i.quantity === 'number',
    )
  );
}
```

Wrap `JSON.parse` in `try/catch`. (Lesson 16 shows how Zod does this better.)
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per stage.
3. Push and open a pull request titled `Lesson 12: yourname`, with a short screen recording or screenshots.
4. Ask a friend to review it. A good review asks: could I put the cart into an invalid state, and is any total stored that could be derived?

---

## Done when

- The cart behaves correctly in every scenario, and survives reloads and bad data
- The reducer and selectors are pure, and the UI only dispatches events
- `npm run build` and `npm run lint` pass
- Your PR is open and a friend has reviewed it

Next up: **Lesson 13: Custom hooks**.
