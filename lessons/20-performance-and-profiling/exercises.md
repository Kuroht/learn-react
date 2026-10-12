# Lesson 20: Exercises

Do these in a scratch Vite project or on a practice branch. Try each one **before** reading the answer. Use a production build (`npm run build && npm run preview`) for timings unless an exercise says otherwise, and keep the React DevTools Profiler open.

---

## Exercise 1: What would you measure?

For each complaint, name the **metric** and the **tool** you would use first.

1. "The page takes forever to show the main image."
2. "When I type in the search box the letters appear late."
3. "The layout jumps when the ads load."
4. "The app gets slower the longer I leave it open."
5. "The first load downloads 3 MB of JavaScript."

<details>
<summary>Suggested answers</summary>

1) LCP, Lighthouse and the Network panel · 2) INP, Performance panel and React Profiler · 3) CLS, Lighthouse/Performance "Layout shifts" · 4) Memory, DevTools Memory heap snapshots · 5) Bundle size, `rollup-plugin-visualizer` and the Network panel
</details>

---

## Exercise 2: Create a slow app

Build a page with a text input and a list of 5,000 items where each row does a deliberately slow calculation (a loop of 50,000 iterations).

1. Type in the input. How does it feel?
2. Record it in the Profiler. Which component is slow, and how many ms per commit?
3. Write the numbers down. This is your baseline for the next exercises.

---

## Exercise 3: Move state down

Using the app from Exercise 2, where the input state lives in the same component as the list:

1. Extract the input into `SearchInput` with its own state
2. Does typing still re-render the list? (Highlight updates)
3. Now do it a second way: keep the state in a wrapper and pass the list as `children`
4. Compare the Profiler numbers with the baseline

---

## Exercise 4: When `memo` helps

On the original version, wrap the `Row` in `memo`.

1. Does it help when typing in the input?
2. Why or why not? (Check the props you pass.)
3. Fix whichever prop defeats it, and measure again

<details>
<summary>Hint</summary>

Check for inline objects/functions created in the parent each render. Use "Record why each component rendered" in the Profiler settings.
</details>

---

## Exercise 5: Transitions

The list *needs* to be filtered by the input text, so you can't skip the work.

1. Implement filtering synchronously. Measure the typing lag on a 4x CPU slowdown
2. Implement it with `useTransition` (keep the input value urgent, and the filter value in the transition)
3. Implement it with `useDeferredValue`
4. Show a pending indicator (dimmed list). Compare the three versions by feel and by the Performance panel

---

## Exercise 6: Virtualize

Render 20,000 rows in a plain list.

1. Measure the initial render and the scroll smoothness. Count DOM nodes (`document.querySelectorAll('*').length`)
2. Virtualize with `@tanstack/react-virtual`
3. Compare DOM node counts, render time, and memory
4. What did you lose? (Try Ctrl+F, keyboard navigation, and a screen reader if you can)
5. At what size would you stop bothering?

---

## Exercise 7: Analyze the bundle

In an earlier project:

1. Add `rollup-plugin-visualizer` and build
2. Find the three biggest modules. Are they all necessary?
3. Lazy-load one route or heavy component and rebuild. What changed in the chunk list?
4. Find one dependency you could replace with something smaller or with native APIs. Estimate the saving

---

## Exercise 8: Images

Create a page with six large images (use any photos).

1. Run Lighthouse and record LCP and CLS
2. Resize and compress the images (WebP/AVIF), add `width`/`height`, and lazy-load those below the fold
3. Mark the first (hero) image `fetchpriority="high"` and do **not** lazy-load it
4. Run Lighthouse again. What improved?

---

## Exercise 9: Find the leak

```tsx
function Ticker() {
  const [n, setN] = useState(0);
  useEffect(() => {
    setInterval(() => setN((x) => x + 1), 1000);
    window.addEventListener('resize', () => console.log('resized'));
  }, []);
  return <p>{n}</p>;
}
```

1. Mount and unmount `Ticker` several times with a toggle button. What happens in the console?
2. Take heap snapshots before and after. What grew?
3. Fix it. Prove with another snapshot or the console that the leak is gone

---

## Exercise 10: Real-user metrics

Install `web-vitals` and log LCP, INP, and CLS from your app. Interact with it and compare the values with Lighthouse. Why can they differ?

---

## Exercise 11: Try the React Compiler

Enable `babel-plugin-react-compiler` in a project where you wrote manual `memo`/`useCallback`.

1. Check that the app still works
2. Open React DevTools: components optimized by the compiler show a "Memo ✨" badge
3. Remove one manual memoization. Does behavior or render count change?
4. Which of your code did the compiler skip, and why? (See the lint output.)

---

## Check yourself

You're ready for the project if you can answer these without looking:

- What do LCP, INP, and CLS measure?
- Why profile a production build with CPU throttling?
- What does "move state down" do, and why can it beat `memo`?
- What's the difference between debouncing and `useTransition`?
- What does virtualization do, and what does it cost you?
- How do you find what's inflating your bundle?
- How do you find a memory leak?
- What does the React Compiler fix, and what does it not fix?
