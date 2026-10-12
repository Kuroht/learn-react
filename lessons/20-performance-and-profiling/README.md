# Lesson 20: Performance and Profiling

**Goal:** find real performance problems and fix them with evidence. You'll learn what "fast" means for users, how to measure with the browser and React tools, and the techniques that actually matter: fewer renders, less work, less data, and less JavaScript.

**Time:** about 3 hours

**Prerequisite:** [Lesson 19](../19-testing/README.md)

> **Last verified:** October 2026, with React 19. Check [web.dev/vitals](https://web.dev/vitals/), [react.dev/learn/react-compiler](https://react.dev/learn/react-compiler), and [tanstack.com/virtual](https://tanstack.com/virtual) if anything here doesn't match what you see.

---

## What you will learn

- What users perceive as fast: Core Web Vitals
- The performance workflow: measure, find the bottleneck, fix, measure again
- Browser DevTools: Performance panel and Lighthouse
- React DevTools Profiler
- Common causes of slow React apps
- Reducing renders and expensive work
- `useTransition` and `useDeferredValue`
- Virtualizing long lists
- Code splitting and bundle size
- Images, fonts, and network
- Memory leaks
- The React Compiler

---

## 1. What does "fast" mean?

Users don't care about your render count. They care about three things, which Google measures as **Core Web Vitals**:

| Metric | Question | Good |
|--------|----------|------|
| **LCP** (Largest Contentful Paint) | How fast does the main content appear? | ≤ 2.5 s |
| **INP** (Interaction to Next Paint) | How quickly does the page respond to clicks and typing? | ≤ 200 ms |
| **CLS** (Cumulative Layout Shift) | Does the page jump around while loading? | ≤ 0.1 |

React apps typically struggle with:

- **Load:** too much JavaScript downloaded and executed (LCP)
- **Interaction:** slow event handlers and big re-renders block the main thread (INP)
- **Stability:** content without reserved space (CLS)

---

## 2. The workflow

> **Measure → find the bottleneck → fix one thing → measure again.**

Never optimize on a hunch. Performance work without measurement adds complexity (and bugs) for no benefit. Also:

- Test on a **slow device**: DevTools "CPU: 4x or 6x slowdown" and "Network: Slow 4G"
- Use a **production build** (`npm run build && npm run preview`). Development mode is much slower (Strict Mode double-renders, extra checks)
- Measure the same scenario each time and write the numbers down
- Prioritize by what users do most

---

## 3. Measuring with the browser

### Lighthouse

DevTools → Lighthouse → Performance (use an incognito window without extensions). It gives scores and specific audits (unused JavaScript, image sizes, render-blocking resources). Good for load performance.

### The Performance panel

Record an interaction (click "Record", do the thing, stop):

- The **flame chart** shows what ran on the main thread and for how long
- **Long tasks** (over 50 ms) have red corners. They block input
- Look for big yellow blocks (JavaScript), purple (layout/style recalculation), green (paint)
- Zoom into the interaction and read the call tree: **which of your functions** takes the time?

### The Network panel

- How many requests, how big, how slow?
- Is something blocking (render-blocking CSS/JS, a slow API)?
- Are responses compressed (gzip/brotli) and cached?

### Web Vitals in code

```bash
npm install web-vitals
```

```ts
import { onLCP, onINP, onCLS } from 'web-vitals';
onLCP(console.log); onINP(console.log); onCLS(console.log);
```

Send these to analytics to see **real users'** numbers, not just yours.

---

## 4. Measuring React

Install the **React Developer Tools** extension.

### Highlight updates

Components tab → ⚙ → "Highlight updates when components render". Interact with the page: components flash when they render. If half the page flashes when you type in one input, you've found a problem.

### The Profiler

Profiler tab → Record → interact → Stop.

- **Flamegraph:** every component rendered in a commit and how long it took. Gray means it didn't render
- **Ranked:** the slowest components first
- Settings → "Record why each component rendered" shows **why** (props changed, state changed, hooks changed, parent rendered)

Look for:

1. Components that render often and don't need to
2. Components that render slowly (hundreds of ms)
3. The same expensive component rendering in every commit

Use a **production profiling build** when you can; in dev, timings are inflated, but relative differences still help.

### `<Profiler>` in code

```tsx
import { Profiler } from 'react';

<Profiler id="ProductList" onRender={(id, phase, actualDuration) => console.log(id, phase, actualDuration)}>
  <ProductList />
</Profiler>
```

---

## 5. Common causes (and their fixes)

### 5.1 Too much rendered at once

A list of 10,000 rows renders 10,000 DOM nodes. No amount of memoization fixes that. See **virtualization** in section 7.

### 5.2 Re-rendering too much because state is too high

State in a parent re-renders the whole subtree. **Move state down** to where it's used:

```tsx
// Typing in the input re-renders the slow list too
function Page() {
  const [text, setText] = useState('');
  return (<><input value={text} onChange={...} /><SlowList /></>);
}

// Fix: extract the input with its own state
function Page() { return (<><SearchInput /><SlowList /></>); }
```

Or pass the slow part as `children`/props. Because it's created by the parent that doesn't re-render, React reuses it:

```tsx
function Wrapper({ children }: { children: ReactNode }) {
  const [text, setText] = useState('');
  return (<><input value={text} onChange={...} />{children}</>);
}
<Wrapper><SlowList /></Wrapper>
```

This "move state down / lift content up" trick often beats `memo`.

### 5.3 Expensive calculations in render

Sorting or filtering large arrays on every render: `useMemo` (Lesson 11) if profiling shows it matters, or move the work out of render (a worker, the server, an index).

### 5.4 Unstable props defeating `memo`

New objects/functions each render. Lesson 11 covers `memo`, `useCallback`, and `useMemo`. Remember: only where the Profiler shows a benefit.

### 5.5 Context with fast-changing values

Every consumer re-renders. Split contexts, move to Zustand with selectors (Lesson 17), or colocate state.

### 5.6 Using index as key, or random keys

Index keys on reorderable lists make React re-create DOM nodes. Random keys remount everything on each render.

### 5.7 Layout thrashing

Reading layout (`offsetHeight`) after writing styles in a loop forces repeated reflow. Batch reads, then writes.

### 5.8 Heavy work in event handlers

A 300 ms handler means 300 ms of frozen UI. Break the work up, defer it, or move it to a Web Worker.

---

## 6. Keeping the UI responsive: transitions and deferral

React can interrupt rendering **if the work is marked non-urgent**.

### `useTransition`

```tsx
const [isPending, startTransition] = useTransition();
const [query, setQuery] = useState('');
const [filter, setFilter] = useState('');

function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  setQuery(e.target.value);                         // urgent: keep the input responsive
  startTransition(() => setFilter(e.target.value)); // non-urgent: heavy list can wait
}

<input value={query} onChange={handleChange} />
<div style={{ opacity: isPending ? 0.6 : 1 }}><HeavyList filter={filter} /></div>
```

Typing stays instant. React renders the heavy list in the background and abandons stale renders if you type again.

### `useDeferredValue`

When you receive the value (as a prop) rather than owning the setter:

```tsx
const deferredQuery = useDeferredValue(query);
const isStale = query !== deferredQuery;
<HeavyList filter={deferredQuery} />   // memoize HeavyList so it only re-renders when the deferred value changes
```

These are alternatives to debouncing for **rendering** cost. Debouncing is still right for reducing **network** requests.

---

## 7. Virtualizing long lists

Render only the rows visible in the viewport (plus a small buffer):

```bash
npm install @tanstack/react-virtual
```

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,   // estimated row height in px
    overscan: 8,
  });

  return (
    <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((row) => (
          <div
            key={items[row.index].id}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: row.size, transform: `translateY(${row.start}px)` }}
          >
            {items[row.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

10,000 items, about 20 DOM nodes. Trade-offs: the browser's find-in-page won't see off-screen rows, accessibility needs care (keyboard navigation, `aria-rowcount`/`aria-setsize`), and variable row heights need measurement (`measureElement`). For a few hundred rows, don't bother. Pagination and "load more" are simpler alternatives.

---

## 8. Shipping less JavaScript

The cheapest code is the code you don't send.

### Measure the bundle

```bash
npm install -D rollup-plugin-visualizer
```

```ts
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';
plugins: [react(), visualizer({ open: true, gzipSize: true })]
```

`npm run build` opens a treemap. Look for big or surprising chunks.

### Code splitting

```tsx
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
<Suspense fallback={<PageSkeleton />}><ReportsPage /></Suspense>
```

Split by **route** first (biggest win), then by heavy components that aren't needed immediately (charts, editors, modals). You can also trigger a preload on hover:

```tsx
onMouseEnter={() => import('./pages/ReportsPage')}
```

### Smaller dependencies

- Check size before installing (bundlephobia.com): replacing `moment` with `date-fns` or `Intl`, or `lodash` with native methods or per-function imports
- Import only what you use (`import { debounce } from 'lodash-es'`), so tree-shaking works
- Remove unused dependencies (`npx depcheck`)
- Avoid shipping polyfills you don't need

---

## 9. Images, fonts, and network

- **Images** are usually the largest bytes. Use modern formats (WebP/AVIF), correct dimensions (don't ship 4000px for a 400px slot), `loading="lazy"` for below-the-fold images, and `width`/`height` (or `aspect-ratio`) to prevent layout shift
- Responsive images: `srcset` and `sizes`
- Mark the LCP image as high priority: `fetchpriority="high"` and **don't** lazy-load it
- **Fonts:** self-host, subset, use `font-display: swap`, and preload the critical one. Limit weights
- **Caching:** hashed filenames from Vite can be cached forever. Set long `Cache-Control` for assets (your host usually does)
- **API:** cache with TanStack Query, avoid waterfalls (parallelize with `Promise.all`), paginate, and request only the fields you need
- **Compression:** gzip/brotli on the server (most hosts do it automatically)
- Preconnect to critical third-party origins: `<link rel="preconnect" href="https://api.example.com">`

---

## 10. Memory leaks

Symptoms: the app gets slower the longer it's open; the tab's memory keeps growing.

Usual causes:

- Event listeners, timers, or subscriptions without cleanup (Lesson 10)
- Closures keeping big objects alive
- Caches that grow without limit
- Detached DOM nodes kept in refs or global arrays

Find them in DevTools → Memory: take a heap snapshot, interact (open and close a page 10 times), take another, and compare. Growth that never shrinks after garbage collection indicates a leak.

---

## 11. The React Compiler

The React Compiler automatically memoizes components and hooks at build time. With it:

- You write plain code, with no manual `useMemo`, `useCallback`, or `memo` in most cases
- It works only on code that follows the **Rules of React** (pure render, no mutation of props/state, hooks at the top level)
- It's opt-in. Install `babel-plugin-react-compiler` and add it to your Vite React plugin's Babel config (see [react.dev/learn/react-compiler](https://react.dev/learn/react-compiler))
- `eslint-plugin-react-hooks` includes compiler-powered lint rules that flag code the compiler can't optimize

It reduces **unnecessary re-renders**, not the cost of rendering 10,000 rows or shipping megabytes of JavaScript. Everything else in this lesson still applies.

---

## 12. A performance checklist

- [ ] Measured on a production build with CPU and network throttling
- [ ] Lighthouse: LCP, INP, and CLS are in the green
- [ ] Bundle analyzed. Routes are lazy-loaded. No giant unused dependency
- [ ] Images are sized, compressed, and lazy where appropriate. The LCP image is prioritized
- [ ] Long lists are virtualized or paginated
- [ ] No unnecessary re-renders in hot paths (checked with the Profiler)
- [ ] Heavy updates use transitions or deferral
- [ ] API data is cached, parallelized, and paginated
- [ ] No leaks: effects clean up
- [ ] Real-user metrics are collected

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| Optimizing without measuring | Added complexity, no gain |
| Profiling the dev build | Misleading numbers. Use a production build |
| Testing only on your fast laptop | Users on mid-range phones suffer |
| `memo`/`useMemo`/`useCallback` everywhere | Noise and bugs. Apply where profiled |
| Rendering thousands of DOM nodes | Slow regardless of memoization. Virtualize or paginate |
| Keeping state too high in the tree | Large subtrees re-render on every keystroke |
| One giant bundle | Slow first load. Split by route |
| Huge unoptimized images | Slow LCP and wasted data |
| Lazy-loading the hero image | Slower LCP |
| Images without dimensions | Layout shift (CLS) |
| Ignoring cleanup in effects | Leaks and slowdown over time |
| Debouncing to fix a rendering problem | Wrong tool. Use transitions/deferral for rendering, debounce for network |

---

## Key takeaways

- Performance is what users feel: LCP, INP, CLS. Measure on production builds with throttling.
- Use Lighthouse and the Performance panel for load and long tasks, and the React Profiler for renders.
- Try the structural fixes first: move state down, pass content as `children`, render less.
- Use transitions and deferred values to keep inputs responsive. Virtualize long lists.
- Ship less JavaScript: split routes, analyze the bundle, choose small dependencies. Optimize images.
- The React Compiler removes much manual memoization, but not the need to measure.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to [Lesson 21: Architecture and project structure](../21-architecture-and-project-structure/README.md).
