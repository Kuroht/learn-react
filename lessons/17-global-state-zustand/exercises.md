# Lesson 17: Exercises

Do these in a scratch Vite project with `zustand` installed, or on a practice branch. Try each one **before** reading the answer. Keep React DevTools' "Highlight updates" on.

---

## Exercise 1: Where does it go?

For each piece of state, choose: **local `useState`**, **URL**, **TanStack Query**, or **Zustand**.

1. The text currently typed in a search box
2. The list of products from an API
3. Whether the mobile sidebar is open (used by the header button and the sidebar)
4. The selected category filter on a shop page you want to share as a link
5. The user's chosen theme, saved between visits
6. A modal's open/closed state, used only inside one component
7. Cards and columns of a kanban board

<details>
<summary>Suggested answers</summary>

1) local · 2) TanStack Query · 3) Zustand (two distant components share it) · 4) URL · 5) Zustand with `persist` · 6) local · 7) Zustand
</details>

---

## Exercise 2: A counter store

Build the counter store from the lesson with `count`, `step`, and the actions `increment`, `decrement`, `setStep`, `reset`.

1. Create two components: `CountDisplay` (reads `count`) and `Controls` (reads only the actions)
2. Turn on "Highlight updates". When you click "+", which component re-renders?
3. Now change `Controls` to `const store = useCounterStore()` (no selector). What changes?
4. Fix it again with selectors

---

## Exercise 3: Selector pitfalls

```tsx
const { count, step } = useCounterStore((s) => ({ count: s.count, step: s.step }));
```

1. What goes wrong in Zustand v5 (check the console)?
2. Fix it with `useShallow`
3. Fix it again with two separate selector calls. Which do you prefer?

<details>
<summary>Answer</summary>

The selector returns a new object each time, so React thinks the selected value changed on every render, which leads to extra renders or an infinite loop warning. `useShallow` compares the fields shallowly, and separate calls return primitives that compare by value.
</details>

---

## Exercise 4: A theme store with persistence

Create `useThemeStore` with `theme: 'light' | 'dark' | 'system'` and `setTheme`.

1. Persist it with the `persist` middleware (`partialize` to only save `theme`)
2. Apply the `dark` class to `<html>` using `subscribe` (outside React) so it works before any component mounts
3. Reload and check `localStorage`
4. Put garbage in the stored value and reload. What happens? Add validation in `merge`

---

## Exercise 5: A cart store

Rebuild your Lesson 12 cart with Zustand:

- State: `items`
- Actions (under `actions`): `add`, `remove`, `setQuantity`, `clear`
- Derived selectors: `useCartCount`, `useCartTotal`
- `persist` for `items`

Compare with the reducer + context version: lines of code, re-render behavior, and ease of use. Which would you choose for this app, and why?

---

## Exercise 6: Outside React

1. Call `useCartStore.getState().actions.add(...)` from the browser console (expose the store on `window` temporarily). Does the UI update?
2. Use `useCartStore.subscribe` to log the total to the console whenever the items change
3. Use it to update `document.title` with the cart count, without any component

---

## Exercise 7: Devtools and middleware order

1. Add `devtools` and install the Redux DevTools extension
2. Give your actions names so the log reads `cart/add`, `cart/remove`
3. Time-travel to a previous state in the extension. What happens to the UI?
4. Nest `devtools(persist(...))` and then try the other order. Does TypeScript or runtime behavior change?

---

## Exercise 8: A multi-store layout

Design (on paper or in code) the stores for a small app with a cart, a theme, and a notifications toast list.

1. How many stores would you create, and where would each file live?
2. What are the public exports of each feature?
3. Which one(s) should be persisted?

---

## Exercise 9: Test a store

Write tests (or console checks, if you haven't set up Vitest yet) that:

1. Add an item, then add the same one again, and expect quantity 2
2. Remove an item that doesn't exist and expect no change
3. Reset the store between tests with `setState`

---

## Check yourself

You're ready for the project if you can answer these without looking:

- Why does `create<State>()(...)` have two pairs of parentheses?
- What is a selector, and how does it prevent extra re-renders?
- Why does a selector returning a new object cause problems in v5, and how do you fix it?
- Does `set` replace or merge state?
- What do `persist`, `partialize`, and `version` do?
- How do you use a store outside React?
- Why shouldn't you put API data in Zustand?
- When would you choose context + reducer over Zustand?
