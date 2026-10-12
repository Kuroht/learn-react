# Lesson 20 Project: Optimize a Slow List of 10,000 Items

You'll be given a deliberately slow app, measure it, and make it fast in small, evidence-backed steps, ending with a report.

> **Last verified:** October 2026, with React 19. Check [react.dev/learn/react-compiler](https://react.dev/learn/react-compiler) and [tanstack.com/virtual](https://tanstack.com/virtual) for the current APIs.

---

## Brief

You'll first **build the slow version** (Stage 1), then optimize it. The app is an employee directory with 10,000 people. Users can search, filter by department, sort, select rows, and open a detail panel. Everything is intentionally naive to begin with.

Your deliverable is the optimized app **and** `PERFORMANCE.md`: a before/after report with numbers, screenshots of the Profiler, and one paragraph per optimization explaining what was wrong and why the fix worked.

Every stage ends with a **checkpoint**: a number you should record.

---

## Getting started

```bash
cd lessons/20-performance-and-profiling/project
npm create vite@latest starter -- --template react-ts
cd starter
npm install
npm install @tanstack/react-virtual web-vitals
npm install -D rollup-plugin-visualizer
npm run dev
```

Install React DevTools in your browser.

Work in your own branch: `git checkout -b yourname/lesson-20`

Commit after **every** stage, so the history tells the story.

---

## Stage 1: Build the slow baseline

Build it the naive way, on purpose:

- [ ] A generated dataset of 10,000 `Person` objects (`id`, `name`, `email`, `department`, `salary`, `startDate`, `avatarUrl`), created once
- [ ] `App` holds all state: `query`, `department`, `sortKey`, `selectedId`
- [ ] A search input, a department select, and a sort select
- [ ] The full filtered and sorted list renders as 10,000 `PersonRow` components
- [ ] Each row renders an avatar `<img>`, formats the salary with a **new** `Intl.NumberFormat` on every render, and formats the date
- [ ] Clicking a row selects it and shows a detail panel
- [ ] Use `key={index}` in the list (yes, really, you'll fix it later)
- [ ] Filtering and sorting happen in the render body, with no memoization
- [ ] A `Header` with a clock that updates every second (`setInterval` in `App`)

**Checkpoint:** it works, and it's noticeably sluggish. Don't fix anything yet.

---

## Stage 2: Measure the baseline

Using a **production build** (`npm run build && npm run preview`) with CPU 4x slowdown:

- [ ] Lighthouse performance score, LCP, and total blocking time
- [ ] Number of DOM nodes after load (`document.querySelectorAll('*').length`)
- [ ] Time to type 5 characters in the search box (Performance panel, or look at INP with `web-vitals`)
- [ ] Profiler: commit duration when typing one character, and when selecting a row
- [ ] Profiler: how many components re-render when the clock ticks?
- [ ] Bundle size (`dist/` and the visualizer treemap)
- [ ] Heap size after 1 minute

Record everything in a table in `PERFORMANCE.md` (the "Before" column).

---

## Stage 3: Quick wins in render logic

Make one change at a time, **measure after each**, and commit each:

- [ ] Replace `key={index}` with `key={person.id}`
- [ ] Create the `Intl.NumberFormat` / `DateTimeFormat` once, outside the component
- [ ] Move the clock into its own `Clock` component with its own state, so `App` stops re-rendering every second
- [ ] Move the search input state down so typing doesn't re-render unrelated parts (or pass heavy parts as `children`)
- [ ] Memoize the filtered and sorted list with `useMemo` (is it worth it? Check the Profiler)
- [ ] Wrap `PersonRow` in `memo`, and stabilize its props (`useCallback` for `onSelect`, pass `isSelected` instead of `selectedId`)

For each change, note in `PERFORMANCE.md`: the hypothesis, the result, and whether you kept it.

**Checkpoint:** the clock no longer causes list renders, and selecting a row re-renders 2 rows instead of 10,000.

---

## Stage 4: Responsive typing

- [ ] Keep the input urgent and the list filtering non-urgent with `useTransition` or `useDeferredValue`
- [ ] Show a subtle pending state (dim the list)
- [ ] Decide on the network question: if search were remote, you would also debounce. Write a sentence about why that is different from this rendering problem
- [ ] Compare typing smoothness against the baseline with 6x CPU slowdown

**Checkpoint:** typing never stalls, even when the list takes a while to catch up.

---

## Stage 5: Virtualization

- [ ] Replace the 10,000-row render with `@tanstack/react-virtual`
- [ ] Use a fixed row height (`estimateSize`) and `overscan` of about 8
- [ ] Keep keyboard accessibility: rows are focusable (roving `tabIndex`), Up/Down arrows move focus, Enter selects, and `aria-rowcount`, `aria-rowindex` (or use `role="listbox"` with `aria-setsize`/`aria-posinset`) are set
- [ ] Scroll to top when the filter or sort changes
- [ ] Announce the result count in a `role="status"` region ("1,243 people")
- [ ] Verify the DOM node count dropped by orders of magnitude

**Checkpoint:** DOM nodes below 500, and scrolling stays smooth at 60fps.

---

## Stage 6: Load performance

- [ ] Run the bundle visualizer. List the three largest chunks
- [ ] Lazy-load the detail panel (and anything heavy) with `lazy`/`Suspense`
- [ ] Avatar images: `loading="lazy"`, `width`/`height`, `decoding="async"`. Use small thumbnails (generate initials with CSS if you don't want images)
- [ ] Self-host or limit fonts; preload the critical one
- [ ] Set `<link rel="preconnect">` for any external origin
- [ ] Rebuild and compare bundle size, LCP, and CLS

**Checkpoint:** LCP under 2.5s on "Slow 4G + 4x CPU", and CLS under 0.1.

---

## Stage 7: Compare with the React Compiler

- [ ] On a separate commit, enable `babel-plugin-react-compiler`
- [ ] Revert your manual `memo`, `useCallback`, and `useMemo` (in a temporary branch) and measure. How close does the compiler get to your hand-tuned version?
- [ ] Which optimizations did the compiler **not** replace (virtualization, transitions, bundle splitting, structure)?
- [ ] Decide what you'd keep for the real app, and justify it in `PERFORMANCE.md`

---

## Stage 8: Guard against regressions

- [ ] Add `web-vitals` reporting that logs LCP, INP, and CLS in development
- [ ] Add a simple performance test: render the list with Testing Library and assert that fewer than N rows are in the DOM (virtualization is still on)
- [ ] Add a "budget" note to `PERFORMANCE.md`: max bundle size (gzipped), Lighthouse score, and INP, so the next person knows when they've regressed
- [ ] (Optional) Add Lighthouse CI to GitHub Actions (preview for Lesson 24)

---

## Stage 9: The report

Complete `PERFORMANCE.md`:

- [ ] A before/after table of every metric from Stage 2
- [ ] One section per optimization: problem, evidence (a Profiler or Performance screenshot), fix, result in ms or KB
- [ ] A list of ideas you **tried and rejected** because they didn't help
- [ ] "What I would do next" (for example moving filtering to a Web Worker, or server-side filtering with pagination)
- [ ] The three most important lessons you learned

```bash
npm run build
npm run lint
```

Both should pass. No `any`.

---

## Requirements checklist

**Must have**

- [ ] A deliberately slow baseline with the 10,000-person dataset, committed first
- [ ] A baseline measurement table (production build, throttled)
- [ ] State moved down and `key`s fixed, with measured effects
- [ ] `memo`/`useCallback`/`useMemo` applied only where measurements justify it
- [ ] `useTransition` or `useDeferredValue` for the search
- [ ] A virtualized list that stays accessible with the keyboard
- [ ] Bundle analysis, and at least one lazy-loaded chunk
- [ ] `PERFORMANCE.md` with a before/after table and evidence
- [ ] No `any`
- [ ] `npm run build` and `npm run lint` pass

**Nice to have**

- [ ] Move the filtering and sorting into a Web Worker (with Comlink or a plain `postMessage`)
- [ ] Variable-height rows with `measureElement`
- [ ] Server-side pagination and search against a mock API, with TanStack Query
- [ ] Compare against a library such as TanStack Table with virtualization
- [ ] Lighthouse CI budget enforced in GitHub Actions

---

## Hints

<details>
<summary>How do I generate 10,000 realistic people quickly?</summary>

Use `Array.from({ length: 10_000 }, (_, i) => ...)` with arrays of first names, last names, and departments, picking by index math (`i % names.length`). Seed any randomness so the data is identical every run (a tiny linear congruential generator), otherwise your measurements won't be comparable.
</details>

<details>
<summary>The Profiler says "Did not render" but the list is still slow</summary>

You may be measuring the dev build, or the cost is in the DOM (layout and paint), not React. Check the Performance panel: large purple (layout) blocks mean too many nodes. That's what virtualization fixes.
</details>

<details>
<summary><code>memo</code> doesn't help my row</summary>

Check what the Profiler reports under "Why did this render?". Usually it's a new function or object prop. Pass primitives, stabilize callbacks, and avoid inline `style={{...}}` objects built in the parent.
</details>

<details>
<summary>Virtualized rows flicker or jump</summary>

`estimateSize` must match the real row height for fixed-height rows. For dynamic heights use `measureElement` with `ref`. Keep the key stable (`person.id`, not the virtual index).
</details>

<details>
<summary>Keyboard focus is lost when scrolling a virtualized list</summary>

The focused row can be unmounted when scrolled out of the range. Track the active index in state, and call `virtualizer.scrollToIndex(active)` when it changes, then focus the row after it mounts (use an effect, or `aria-activedescendant` on the container).
</details>

<details>
<summary>My numbers vary a lot between runs</summary>

Close other tabs, disable extensions (use an incognito window), run each measurement three times, and record the median. Use the same throttling every time.
</details>

---

## How to submit

1. Work in your own branch, with one commit per optimization.
2. Push and open a pull request titled `Lesson 20: yourname`, with the before/after table in the description.
3. Ask a friend to review it. A good review asks: is each optimization backed by a measurement, and is anything more complex than the gain justifies?

---

## Done when

- The app handles 10,000 items smoothly on a throttled CPU
- Every optimization has evidence in `PERFORMANCE.md`
- Accessibility didn't regress when you virtualized
- `npm run build` and `npm run lint` pass
- Your PR is open and a friend has reviewed it

Next up: **Lesson 21: Architecture and project structure**.
