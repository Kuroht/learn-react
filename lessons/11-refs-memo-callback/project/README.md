# Lesson 11 Project: Searchable, Filterable List with Debounce

Build a fast product explorer with a debounced search, filters, sorting, keyboard shortcuts, and measured optimizations.

> **Last verified:** October 2026. Check [react.dev/learn/react-developer-tools](https://react.dev/learn/react-developer-tools) for installing the React DevTools browser extension.

---

## Brief

Generate a catalog of **5,000 products** (name, category, price, rating) and show them in a list. Users can search by name (debounced), filter by category and price, sort, and select an item to see its details. The input must stay snappy while typing.

You'll first build it **plainly**, then measure it, then optimize only what's worth it.

Every stage ends with a **checkpoint**: something you should see in the browser.

---

## Getting started

```bash
cd lessons/11-refs-memo-callback/project
npm create vite@latest starter -- --template react-ts
cd starter
npm install
npm run dev
```

Install the **React Developer Tools** extension for your browser (Components and Profiler tabs).

Work in your own branch: `git checkout -b yourname/lesson-11`

---

## Stage 1: Types and data

```ts
export type Category = 'books' | 'electronics' | 'home' | 'sports' | 'toys';

export type Product = {
  id: number;
  name: string;
  category: Category;
  price: number;
  rating: number; // 1 to 5
};
```

- [ ] `src/data/generateProducts.ts` creates 5,000 products with predictable pseudo-random values (a simple seeded function, or `Array.from` with `i % n`)
- [ ] The array is created **once**, outside the component (or in a lazy initializer)
- [ ] Names look realistic enough to search ("Blue Lamp 123")

**Checkpoint:** `console.log(products.length)` prints `5000`.

---

## Stage 2: The plain version

- [ ] `ProductList` renders **all** matching products with `.map()` and stable keys
- [ ] A search input filters by name (case-insensitive) on every keystroke
- [ ] A category `select` with "All"
- [ ] A price range (min and max number inputs)
- [ ] A sort select (name, price, rating)
- [ ] Show "N results"
- [ ] Filtering and sorting are **derived** during render (no copies in state)

**Checkpoint:** it works. You might already notice some lag while typing.

---

## Stage 3: Measure first

Do not optimize yet.

- [ ] Wrap the filter and sort in `console.time` / `console.timeEnd`. Write down the times
- [ ] Open the React DevTools **Profiler**, record while typing a few letters, and write down how long each commit takes
- [ ] Turn on "Highlight updates when components render". What re-renders?
- [ ] Add a counter button that is unrelated to the list. Does clicking it re-render the whole list?

Write your findings in a `NOTES.md` file in the project (a few lines, with numbers). You'll compare them in Stage 8.

---

## Stage 4: Debounce

Reuse the idea from Lesson 10.

- [ ] Keep `query` (what the input shows) and `debouncedQuery` (used for filtering) in state
- [ ] Update `debouncedQuery` after 300ms of no typing (effect with cleanup)
- [ ] The input stays responsive on every keystroke
- [ ] Show a subtle "Searching…" indicator while `query !== debouncedQuery`

**Checkpoint:** typing fast filters only once, after you pause.

---

## Stage 5: `useMemo` where it counts

- [ ] Wrap the filter and sort in `useMemo` with correct dependencies
- [ ] Confirm that clicking the unrelated counter no longer recomputes (log a message inside the memo)
- [ ] Compare the times with `NOTES.md`

Think: is `useMemo` needed for computing "N results"? (No: it's `visible.length`.)

**Checkpoint:** the unrelated counter is instant.

---

## Stage 6: `memo` and `useCallback` for rows

- [ ] Extract a `ProductRow` component and wrap it in `memo`
- [ ] Add a selection feature: clicking a row sets `selectedId`
- [ ] Pass `onSelect` as a function prop wrapped in `useCallback`
- [ ] Pass `isSelected` (a boolean) instead of passing `selectedId` to each row, so only two rows re-render when the selection changes
- [ ] Verify with "Highlight updates" and the Profiler that selecting a row re-renders only the old and new selection

**Checkpoint:** selecting a row doesn't re-render the other 4,999.

---

## Stage 7: Refs for usability

- [ ] Focus the search input on page load, and when pressing `/` anywhere (unless already typing in an input). Clean up the listener
- [ ] Press Escape in the search box to clear it
- [ ] A "Back to top" button that appears after scrolling, using a ref to the list container (or `window.scrollTo`)
- [ ] When the filters change, scroll the results back to the top
- [ ] A details panel for the selected product that has a "Close" button that returns focus to the row

All refs are typed.

---

## Stage 8: Limit the DOM

Rendering 5,000 DOM rows is the real cost here, and memoization can't fix that.

- [ ] Add simple pagination (50 per page) or a "Show more" button that adds 100 at a time
- [ ] Compare the Profiler results with the full list
- [ ] Add your measurements to `NOTES.md`: before, after debounce, after memo, after pagination
- [ ] Write 3 sentences: which change helped the most, and which were not worth the code?

(Lesson 20 covers virtualization, which renders only the visible rows.)

---

## Stage 9: Check your work

```bash
npm run build
npm run lint
```

Both should pass. No `any`, no lint warnings, and no `useMemo`/`useCallback` without a reason you can explain.

---

## Requirements checklist

**Must have**

- [ ] 5,000 typed products
- [ ] Search, category, price, and sort, all derived
- [ ] Debounced search with cleanup
- [ ] `useMemo` for the filtering and sorting
- [ ] A `memo`'d `ProductRow` with a `useCallback`'d handler
- [ ] Typed refs for focus and scrolling
- [ ] A `NOTES.md` with before and after measurements
- [ ] No `any`
- [ ] `npm run build` and `npm run lint` pass

**Nice to have**

- [ ] Highlight the matching text in names
- [ ] Remember filters in the URL query string
- [ ] Keyboard navigation (arrow keys) through the results
- [ ] Try the React Compiler and compare the Profiler output with your manual memoization
- [ ] A `usePrevious` hook to flash rows whose price changed

---

## Hints

<details>
<summary><code>memo</code> doesn't prevent re-renders</summary>

Check every prop. A new object, array, or function created in the parent each render defeats `memo`. Pass primitives (`isSelected`) and stable callbacks (`useCallback`), and don't create `style={{...}}` objects inline in the memoized child's props from the parent.
</details>

<details>
<summary>My <code>useCallback</code> has a stale value</summary>

The callback reads state that isn't in its dependency list. Either add it, or use the updater form (`setX(prev => ...)`) so you don't need to read it.
</details>

<details>
<summary>The <code>/</code> shortcut types a slash into the input</summary>

Call `event.preventDefault()` when you handle the key, and skip the shortcut if `document.activeElement` is already an input or textarea.
</details>

<details>
<summary>TypeScript says <code>ref.current</code> is possibly null</summary>

That's accurate. Use `ref.current?.focus()`, or an explicit `if (ref.current)` check.
</details>

<details>
<summary>How do I generate fake products without a library?</summary>

```ts
const adjectives = ['Blue', 'Smart', 'Classic', 'Mini', 'Pro'];
const nouns = ['Lamp', 'Book', 'Ball', 'Speaker', 'Chair'];
const categories: Category[] = ['books', 'electronics', 'home', 'sports', 'toys'];

export const products: Product[] = Array.from({ length: 5000 }, (_, i) => ({
  id: i + 1,
  name: `${adjectives[i % 5]} ${nouns[(i * 7) % 5]} ${i + 1}`,
  category: categories[i % 5],
  price: 5 + ((i * 37) % 495),
  rating: 1 + (i % 5),
}));
```
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per stage.
3. Push and open a pull request titled `Lesson 11: yourname`, including `NOTES.md` with your numbers.
4. Ask a friend to review it. A good review asks: which optimization is unnecessary, and is there evidence for each one?

---

## Done when

- Typing stays smooth on a 5,000-item catalog
- You can show measurements for each optimization
- `npm run build` and `npm run lint` pass
- Your PR is open and a friend has reviewed it

Next up: **Lesson 12: `useReducer` and context**.
