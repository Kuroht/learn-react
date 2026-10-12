# Lesson 18: Error Handling, Loading States, Accessibility

**Goal:** make apps that behave well when things go wrong, when things are slow, and when users don't use a mouse or a screen the way you do. This lesson is about the difference between a demo and a product.

**Time:** about 3 hours

**Prerequisite:** [Lesson 17](../17-global-state-zustand/README.md)

> **Last verified:** October 2026, with React 19. Check [react.dev/reference/react/Suspense](https://react.dev/reference/react/Suspense), [github.com/bvaughn/react-error-boundary](https://github.com/bvaughn/react-error-boundary), and the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) if anything here doesn't match what you see.

---

## What you will learn

- The kinds of errors in a React app
- Error boundaries and `react-error-boundary`
- Handling async and event errors (boundaries don't catch them)
- Friendly error UI with a way to recover
- Suspense for loading, and skeletons
- Designing good loading, empty, and error states
- Accessibility fundamentals: semantics, keyboard, focus, names, contrast
- ARIA: when to use it and when not to
- Live regions for announcements
- Focus management for routes and dialogs
- Testing accessibility with tools and by hand
- Motion and user preferences

---

## 1. Kinds of errors

| Kind | Example | How to handle |
|------|---------|---------------|
| **Render errors** | `undefined.map()` while rendering | Error boundary |
| **Event handler errors** | A throw inside `onClick` | `try/catch` in the handler |
| **Async errors** | A failed `fetch` | `try/catch`, or the data library's error state |
| **Expected failures** | Validation errors, 404, offline | Part of the normal UI design |

Distinguish **expected** failures (design a UI for them) from **bugs** (catch them gracefully and report them).

---

## 2. Error boundaries

Without one, an error during rendering unmounts the **whole app**, leaving a blank page. An error boundary catches errors in the components below it and shows a fallback.

React only supports boundaries as **class components**, so use the small `react-error-boundary` library:

```bash
npm install react-error-boundary
```

```tsx
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';

function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" className="rounded border border-red-300 bg-red-50 p-4">
      <h2 className="font-semibold">Something went wrong</h2>
      <p className="text-sm text-gray-700">We couldn't show this section.</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

<ErrorBoundary FallbackComponent={ErrorFallback} onError={(error, info) => reportError(error, info)}>
  <Dashboard />
</ErrorBoundary>
```

`FallbackProps` also includes `error`. In `react-error-boundary` v6 its type is **`unknown`**, not `Error`, because JavaScript lets you `throw` anything. Narrow it before you read it (`error instanceof Error ? error.message : ...`), or use the library's `getErrorMessage(error)` helper. The library also exports a `useErrorBoundary()` hook, whose `showBoundary(error)` sends an error from an event handler or async code to the nearest boundary.

Guidelines:

- Put **several** boundaries: one at the root (last resort), and others around independent sections (a widget failing shouldn't take the page down)
- Reset when the problem might be gone: `resetErrorBoundary`, or `resetKeys={[userId]}` to reset automatically when a value changes
- Log errors with `onError` to a service such as Sentry (Lesson 24)
- Don't show raw `error.message` or stack traces to users: it's confusing and can leak internals. Log it, show a human message
- In development, React shows its own overlay in addition to your fallback

### What boundaries do **not** catch

- Errors in **event handlers**
- Errors in **async code** (`setTimeout`, promises)
- Errors in the boundary itself, and during server rendering

For those, use `try/catch`. If you want a boundary to show an async or event-handler error, use `react-error-boundary`'s hook:

```tsx
import { useErrorBoundary } from 'react-error-boundary';

const { showBoundary } = useErrorBoundary();
fetchThing().catch(showBoundary);   // the nearest ErrorBoundary displays it
```

(Data libraries do this for you: TanStack Query's `throwOnError: true` or `useSuspenseQuery` rethrow into the nearest boundary.)

React 19 also adds root options `onCaughtError`, `onUncaughtError`, and `onRecoverableError` on `createRoot`, a central place to log errors.

---

## 3. Handling errors in handlers and async code

```tsx
async function handleSave() {
  setStatus('saving');
  try {
    await save(values);
    setStatus('saved');
  } catch (err) {
    setStatus('error');
    setMessage(err instanceof Error ? err.message : 'Could not save');
  }
}
```

- `catch (err)` is `unknown`. Narrow before using it.
- Always put users in a state they can recover from: a "Try again" button, their data kept, a clear next step.
- Distinguish error types: network down, not authorized (401/403), not found (404), validation (400/422), server (5xx). Each deserves different copy.
- Don't swallow errors silently (`catch {}`).

### Writing good error messages

| Bad | Better |
|-----|--------|
| "Error" | "We couldn't load your orders." |
| "Request failed with status code 500" | "Something went wrong on our side. Please try again in a minute." |
| "Invalid input" | "Enter your email like name@example.com." |

Say what happened, what the user can do, and never blame them.

---

## 4. Loading states

### Suspense

`<Suspense>` shows a fallback while children are "waiting" for something (lazy-loaded code, or data from a Suspense-aware library):

```tsx
import { lazy, Suspense } from 'react';

const Reports = lazy(() => import('./Reports'));

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <Suspense fallback={<ReportsSkeleton />}>
    <Reports />
  </Suspense>
</ErrorBoundary>
```

The pairing is the standard recipe: **Suspense handles "not ready yet", the error boundary handles "failed"**. With TanStack Query:

```tsx
function Todos() {
  const { data } = useSuspenseQuery(todosQueryOptions);   // no isPending / isError checks
  return <ul>{data.map(...)}</ul>;
}
```

Place several Suspense boundaries so parts of the page appear as they're ready, instead of one big spinner.

### Transitions: don't hide what's already there

When state change triggers a suspend, React would replace the visible content with the fallback. `useTransition` or `startTransition` marks the update as non-urgent, so React keeps the old UI until the new one is ready:

```tsx
const [isPending, startTransition] = useTransition();

function selectTab(next: Tab) {
  startTransition(() => setTab(next));
}
```

Use `isPending` to dim the old content.

### Designing loading states

- **Skeletons** that match the final layout beat spinners for content areas (less layout shift)
- **Spinners** are fine for short actions (a button)
- Avoid flashes: if loading takes 100ms, a skeleton that appears and vanishes feels glitchy. Delay it slightly, or keep it visible for a minimum time
- Keep layout stable: reserve space (fixed heights, `aspect-ratio`) to avoid jumps
- Announce progress to assistive tech (see live regions below)
- Provide **optimistic** feedback for fast actions (Lesson 15)

### Empty states

An empty list isn't an error. Explain why it's empty and offer the next action: "No projects yet. Create your first project."

---

## 5. Accessibility (a11y) fundamentals

About one in five people has a disability, and everyone benefits from accessible design (keyboard users, bright sunlight, a broken trackpad, a screen reader on a long commute). In many places it's also a **legal requirement**. The standard is [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/), organized around four principles: Perceivable, Operable, Understandable, Robust.

### 5.1 Use semantic HTML first

The best accessibility feature is the right element. Browsers give you keyboard support, roles, and screen reader behavior for free.

| Need | Use | Not |
|------|-----|-----|
| Action | `<button>` | `<div onClick>` |
| Navigation | `<a href>` / `<Link>` | `<span onClick={navigate}>` |
| Page regions | `<header> <nav> <main> <footer> <aside>` | `<div>`s everywhere |
| Headings | `<h1>` to `<h6>` in order, one `<h1>` | Styled `<div>`s or skipped levels |
| Lists | `<ul>/<ol>` | Lines of `<div>` |
| Forms | `<label>`, `<fieldset>`, `<legend>` | Placeholder as the only label |
| Data | `<table>` with `<th scope>` | Grids of `<div>`s |

### 5.2 Keyboard

Everything you can do with a mouse must be possible with a keyboard:

- Unplug your mouse and try your app. Can you reach and use everything?
- Tab order follows the visual order (don't fight it with positive `tabIndex`)
- **Visible focus indicator** on everything focusable. Never `outline: none` without replacing it
- Custom widgets follow the expected keys (Enter/Space for buttons, arrows for menus and tabs, Escape to close)
- No keyboard traps (except intentional ones in a modal, which must have an exit)
- `tabIndex={0}` makes an element focusable. `tabIndex={-1}` makes it focusable by script only

### 5.3 Names and text alternatives

Every control needs an **accessible name**:

```tsx
<button aria-label="Close dialog"><XIcon aria-hidden="true" /></button>   // icon-only button
<img src="chart.png" alt="Sales rose 20% in Q3" />                        // informative image
<img src="divider.png" alt="" />                                          // decorative image
<input id="email" /> <label htmlFor="email">Email</label>                 // linked label
```

- `alt` describes the **purpose**, not "image of...". Decorative images get `alt=""`
- Links need meaningful text ("Read the pricing guide", not "click here")
- Icons next to text should be hidden from assistive tech with `aria-hidden="true"`

### 5.4 Color and contrast

- Text contrast of at least **4.5:1** (3:1 for large text and UI components such as input borders)
- Don't use color as the only signal: add text, icons, or patterns to errors and statuses
- Respect dark mode and `prefers-contrast` where possible
- Zoom to 200% and check nothing breaks

### 5.5 Motion

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

In Tailwind: `motion-safe:animate-spin`, `motion-reduce:transition-none`. Avoid autoplaying, flashing content.

---

## 6. ARIA: use sparingly

ARIA attributes add meaning when HTML can't. The first rule of ARIA: **don't use ARIA if a native element does the job**. A `<button>` beats `<div role="button" tabIndex={0} onKeyDown=...>`.

Common, valuable attributes:

| Attribute | Use |
|-----------|-----|
| `aria-label` / `aria-labelledby` | Give a control a name |
| `aria-describedby` | Link help or error text to an input |
| `aria-invalid` | Mark an invalid field |
| `aria-expanded` + `aria-controls` | A button that opens/closes something |
| `aria-current="page" / "step"` | The current item in a nav or a wizard |
| `aria-pressed` | A toggle button |
| `aria-hidden="true"` | Hide decorative content from assistive tech |
| `role="alert"` / `aria-live` | Announce dynamic changes |

Wrong ARIA is worse than none. A `role="button"` on a div promises behavior (keyboard, focus) that you must then implement yourself.

---

## 7. Live regions: announcing changes

Screen reader users don't see a toast appear. A **live region** is announced when its content changes:

```tsx
<div role="status" aria-live="polite">{message}</div>      // waits for a pause (saved, 3 results)
<div role="alert">{error}</div>                              // interrupts immediately (errors only)
```

- The region must exist in the DOM **before** its content changes
- Use `polite` for most things and `assertive`/`alert` only for urgent errors
- Typical uses: form submit result, "Added to cart", search result count, route changes, loading complete

---

## 8. Focus management

When the interface changes without a page load, you must move focus yourself:

### After navigation (SPAs)

A normal page load resets focus to the top. Client-side routing doesn't, so keyboard and screen reader users stay where they were. On route changes, move focus to the page heading:

```tsx
function PageTitle({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const { pathname } = useLocation();
  useEffect(() => { ref.current?.focus(); }, [pathname]);
  return <h1 ref={ref} tabIndex={-1} className="outline-none">{children}</h1>;
}
```

Also give each page a unique `<title>`.

### Skip link

First focusable element, so keyboard users can jump past the navigation:

```tsx
<a href="#main" className="sr-only focus:not-sr-only focus:absolute ...">Skip to content</a>
...
<main id="main" tabIndex={-1}>
```

(`sr-only` hides visually but keeps the element for screen readers.)

### Dialogs

- Use the native `<dialog>` element with `showModal()`: it traps focus, closes on Escape, and makes the rest of the page inert
- Move focus into the dialog when it opens, and **return it to the trigger** when it closes
- Give it an accessible name (`aria-labelledby` pointing to its heading)

### Deleted content

When an item is removed, move focus somewhere sensible (the next item, or the list heading), or keyboard users lose their place.

---

## 9. Testing accessibility

Automated tools catch about a third of issues. Use both:

**Automated**
- `eslint-plugin-jsx-a11y`: flags problems as you type (missing `alt`, bad roles, clickable divs). Oxlint has the same rules built in: add `"jsx-a11y"` to `plugins` in `.oxlintrc.json`
- Browser DevTools Accessibility pane and **Lighthouse**
- **axe DevTools** browser extension: scan pages and see exactly what to fix
- In tests: `jest-axe` / `vitest-axe` (Lesson 19), and Testing Library queries by role (`getByRole('button', { name: 'Save' })`) which double as a11y checks

**Manual**
- Keyboard-only run through every flow
- Zoom to 200% and 400%
- A screen reader pass: NVDA (Windows, free), VoiceOver (macOS/iOS, built in), TalkBack (Android)
- Turn on high contrast and reduced motion
- Disable CSS: does the page order still make sense?

---

## 10. A checklist for every feature

- [ ] Works with the keyboard only, with visible focus
- [ ] Uses semantic elements, with a sensible heading outline
- [ ] Every control has an accessible name. Images have proper `alt`
- [ ] Errors are text, linked to fields, and announced
- [ ] Loading, empty, and error states exist
- [ ] Contrast is enough, and color isn't the only signal
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Focus is managed on route changes and dialogs
- [ ] An error boundary wraps risky sections

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| One error boundary at the root only | Any widget failure blanks the whole app |
| Expecting boundaries to catch event/async errors | They don't. Use `try/catch` |
| Showing `error.message` or stack traces to users | Confusing and may leak details |
| Silent `catch {}` | Failures nobody can see |
| `<div onClick>` instead of `<button>` | No keyboard or screen reader support |
| `outline: none` without a replacement | Keyboard users can't see focus |
| Placeholder as the only label | Disappears on typing, poor contrast |
| Color as the only error signal | Invisible to color-blind users |
| Icon button without `aria-label` | Announced as just "button" |
| ARIA used to fix bad HTML | Mismatches between role and behavior |
| Spinners that shift the layout | Jumpy UI. Reserve space or use skeletons |
| Not moving focus after route change or deletion | Users lose their place |
| Relying on automated tests alone | They find roughly a third of issues |

---

## Key takeaways

- Error boundaries catch render errors only. Wrap independent sections, offer recovery, and log errors.
- Use `try/catch` for handlers and async code, and design UI for expected failures.
- Suspense + boundary is the standard loading/failed pairing. Prefer skeletons and stable layouts.
- Semantic HTML gives you most accessibility for free. Keyboard, focus, names, and contrast do the rest.
- ARIA supplements HTML, never replaces it. Live regions announce changes.
- Manage focus on route changes, dialogs, and deletions.
- Test with tools **and** by hand.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to Module 5 with Lesson 19: Unit and component testing.
