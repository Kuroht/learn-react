# Lesson 18: Exercises

Do these in a scratch Vite project or on a practice branch. Try each one **before** reading the answer. For the accessibility exercises, install the axe DevTools browser extension and enable `eslint-plugin-jsx-a11y`.

---

## Exercise 1: Which mechanism?

For each failure, choose: **error boundary**, **try/catch**, **component state/UI**, or **query error state**.

1. A component does `user.profile.name` and `profile` is undefined during render
2. A click handler calls `JSON.parse` on bad text
3. A `useQuery` request returns 500
4. A form field is empty on submit
5. A `setTimeout` callback throws

<details>
<summary>Answers</summary>

1) error boundary · 2) try/catch · 3) the query's `isError` state (or a boundary with `throwOnError`) · 4) component state / validation UI · 5) try/catch (boundaries don't see timers)
</details>

---

## Exercise 2: Add boundaries

1. Install `react-error-boundary`
2. Create a `Bomb` component that throws during render when you click "Trigger" (set state, then throw if the state is set)
3. Without a boundary, what do you see? Wrap the app in a root boundary
4. Add a second, local boundary around only the `Bomb`. Which fallback shows now, and why is that better?
5. Add "Try again" with `resetErrorBoundary` and make sure the bomb is defused after a reset

---

## Exercise 3: Not caught!

1. Make a button whose `onClick` throws. Is it caught by your boundary?
2. Make an `async` function that throws after a `setTimeout`. Caught?
3. Handle both properly: show an inline error message using state
4. Then make one of them reach the boundary on purpose with the "throw in setState" trick

---

## Exercise 4: Error copy

Rewrite these messages for real users:

1. `TypeError: Cannot read properties of undefined (reading 'map')`
2. `Request failed with status code 401`
3. `Network Error`
4. `Validation failed: email`

For each one, say what happened, what the user can do, and whether to show a retry button.

---

## Exercise 5: Suspense and skeleton

1. Lazy-load a heavy `Chart` component with `lazy` and `Suspense`
2. Build a `ChartSkeleton` with the same dimensions as the chart. Does the page jump when it loads?
3. Throttle the network. Is the skeleton visible long enough to be useful, or does it flash?
4. Pair it with an error boundary and block the chunk in DevTools (Network request blocking) to see the failure UI

---

## Exercise 6: Keyboard audit

Open any earlier project and **do not touch the mouse**.

1. Reach every interactive element with Tab and Shift+Tab. Where does focus disappear or get stuck?
2. Can you see where the focus is at all times?
3. Operate every control (open menus, submit forms, close dialogs) with the keyboard
4. Write down a list of the five worst problems and fix them

---

## Exercise 7: Fix the markup

This component is inaccessible in at least eight ways. List and fix them.

```tsx
function Card() {
  return (
    <div className="card" onClick={() => open('/product/1')}>
      <img src="/lamp.png" />
      <div className="title" style={{ color: '#aaa' }}>Desk lamp</div>
      <div className="icon" onClick={() => addToCart(1)}>🛒</div>
      <input placeholder="Quantity" />
      <span style={{ color: 'red' }}>Out of stock</span>
    </div>
  );
}
```

<details>
<summary>Some issues to find</summary>

A clickable `div` instead of a link; no `alt`; low-contrast gray title; a title that isn't a heading; a cart "icon" that's a clickable `div` (not a `button`) with no accessible name; the placeholder as the only label; "Out of stock" signaled by color only and not announced; a card with two separate actions inside one clickable container (nested interactive elements).
</details>

---

## Exercise 8: A real modal

Build a confirmation dialog with the native `<dialog>`:

1. Open it with `ref.current?.showModal()`, close with `close()`
2. Focus lands inside it when it opens, and returns to the trigger button when it closes
3. Escape closes it. The background is not reachable by Tab
4. It has an accessible name (`aria-labelledby`) and the destructive button isn't the default focus
5. Test with a screen reader if you can

---

## Exercise 9: Live regions

Create a search box that filters a list.

1. Add a `role="status"` region that announces "5 results" after the user stops typing
2. Add a toast for "Saved" that is announced but doesn't steal focus
3. Add `role="alert"` for a failed save
4. Why must the live region already exist in the DOM before its text changes?

---

## Exercise 10: Route focus

In your routing project (Lesson 14):

1. Add a skip link as the first focusable element
2. Move focus to the `<h1>` on every route change
3. Set a unique `document.title` per route
4. Test with a screen reader or just the keyboard: does the new page get announced?

---

## Check yourself

You're ready for the project if you can answer these without looking:

- What do error boundaries catch, and what don't they catch?
- Why use several boundaries?
- What's the Suspense + error boundary pairing?
- Why are skeletons often better than spinners?
- Why is `<button>` better than `<div onClick>`?
- What is an accessible name, and how do you give one to an icon button?
- When should you use ARIA, and when should you not?
- What does `role="status"` do versus `role="alert"`?
- Why must you manage focus after client-side navigation?
- What fraction of problems do automated tools find?
