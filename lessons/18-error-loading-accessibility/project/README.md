# Lesson 18 Project: Harden a Previous Project

Take one of your earlier projects and make it resilient and accessible: error boundaries, good loading and empty states, keyboard support, screen reader support, and an audit report. This is the end of Module 4.

> **Last verified:** October 2026. Check [w3.org/WAI/WCAG22/quickref](https://www.w3.org/WAI/WCAG22/quickref/) for the current accessibility guidelines.

---

## Brief

Choose **one** project from Lessons 10 to 17 that fetches data or has several screens. Good candidates: the weather app (10), the shopping cart (12), the blog (14), the GitHub explorer (15), the signup wizard (16), or the Kanban board (17).

You will not add features. You will make what exists **robust, communicative, and usable by everyone**, and prove it with a before-and-after audit.

Work in a new branch on top of that project: `git checkout -b yourname/lesson-18`. Copy the project into `lessons/18-error-loading-accessibility/project/starter` if you prefer to keep the original untouched.

Every stage ends with a **checkpoint**: something you should see in the browser.

---

## Stage 0: Baseline audit

Before changing anything, record the starting point in `AUDIT.md`:

- [ ] Run the **Lighthouse** accessibility audit on each main screen. Note the scores
- [ ] Run the **axe DevTools** scan on each main screen. List the issues by severity
- [ ] Do a **keyboard-only** run of every main flow. List where you got stuck
- [ ] Try a **screen reader** on one flow (NVDA, VoiceOver, or TalkBack). Note what was confusing
- [ ] Simulate failures: go **offline**, throttle to **Slow 3G**, **block** an API request, and return a **500**. Note what the app does
- [ ] Zoom to **200%** and set the window to **360px**. Note what breaks
- [ ] Turn on `eslint-plugin-jsx-a11y` and note the warnings

Add screenshots for the worst problems.

**Checkpoint:** `AUDIT.md` has a numbered list of at least 15 concrete problems.

---

## Stage 1: Error boundaries

- [ ] Install `react-error-boundary`
- [ ] A root boundary around the app with a full-page fallback ("Something went wrong", a "Reload" button, a link home)
- [ ] Section-level boundaries around independent parts (for example each widget, panel, or route outlet) with a compact fallback and "Try again"
- [ ] `resetKeys` set where it makes sense (for example the route or the selected id)
- [ ] An `onError` that logs to a single `reportError` function (a `console.error` placeholder for now, ready for Sentry in Lesson 24)
- [ ] Add a hidden "crash test" route or button (development only) to trigger a render error and verify the fallbacks
- [ ] If you use React Router, add `errorElement`s. If you use TanStack Query, decide per query between inline errors and `throwOnError`

**Checkpoint:** a crash in one section leaves the rest of the page working.

---

## Stage 2: Errors you can recover from

- [ ] Every request shows an error state with a human message (no raw `error.message` or status codes)
- [ ] Different copy for: offline, 401/403, 404, 5xx, and unknown errors (write a `getErrorMessage(error)` helper)
- [ ] Every error state has a way forward: Retry, Go back, or Contact support
- [ ] Form submits keep the user's input when they fail
- [ ] No empty `catch {}` blocks anywhere. Search the code
- [ ] A global "You're offline" banner (`navigator.onLine` + events, a `useOnlineStatus` hook) that is announced politely

**Checkpoint:** block the API in DevTools and click through the app. Every failure is explained and recoverable.

---

## Stage 3: Loading and empty states

- [ ] Skeleton placeholders that match the final layout, with no layout shift (check CLS in Lighthouse)
- [ ] Use `Suspense` where it fits (lazy routes, or `useSuspenseQuery`), with a boundary pairing
- [ ] Use `useTransition` or keep-previous-data so existing content isn't replaced by spinners during updates
- [ ] Buttons that trigger work show a pending state and are disabled while pending
- [ ] Loading is announced: a `role="status"` region ("Loading results…", "12 results loaded")
- [ ] Every list has a designed **empty state** with a next action
- [ ] Skeletons and spinners respect `prefers-reduced-motion`

**Checkpoint:** on Slow 3G the app never shows a blank screen or a jumping layout.

---

## Stage 4: Semantics and structure

- [ ] One `<h1>` per page, a logical heading order, and landmark regions (`header`, `nav`, `main`, `footer`)
- [ ] Every clickable `div` or `span` is now a `button` or a link
- [ ] Lists use `ul`/`ol`, and tabular data uses a `table` with `th scope`
- [ ] Each page has a unique `document.title`
- [ ] A **skip link** is the first focusable element
- [ ] Language is set (`<html lang="en">`)

**Checkpoint:** the axe scan reports no structural issues.

---

## Stage 5: Keyboard and focus

- [ ] Every flow works with the keyboard only
- [ ] A visible, high-contrast focus style on every interactive element (use `focus-visible`)
- [ ] Tab order matches the visual order, with no positive `tabIndex`
- [ ] Dialogs use the native `<dialog>` (or a proven library), with focus moved in, trapped, and **returned** on close, and Escape to close
- [ ] On route change, focus moves to the page heading
- [ ] After deleting an item, focus moves somewhere sensible
- [ ] Custom widgets (tabs, menus, comboboxes) follow the [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/patterns/) keys, or you replace them with native elements

**Checkpoint:** you can use the entire app blindfolded to the mouse.

---

## Stage 6: Names, labels, and announcements

- [ ] Every form control has a visible `<label>`. Errors use `aria-describedby`/`aria-invalid` and `role="alert"`
- [ ] Icon-only buttons have an `aria-label`. Decorative icons have `aria-hidden="true"`
- [ ] Images have meaningful `alt`, or `alt=""` if decorative
- [ ] Link text makes sense out of context
- [ ] Toasts and status changes ("Added to cart", "Saved") use live regions
- [ ] Toggle buttons use `aria-pressed`, disclosure buttons use `aria-expanded`, and the current page uses `aria-current`
- [ ] Remove any ARIA that duplicates or contradicts the native semantics

**Checkpoint:** a screen reader can complete the main flow, and hears what changes.

---

## Stage 7: Visual accessibility

- [ ] Text and UI component contrast passes WCAG AA (4.5:1 for text, 3:1 for large text and component borders) in light **and** dark themes
- [ ] No information is conveyed by color alone
- [ ] The layout works at 200% zoom and at 360px width, without horizontal scrolling or clipped content
- [ ] Touch targets are at least 24×24 CSS px (aim for 44px)
- [ ] `prefers-reduced-motion` is respected for every animation
- [ ] Text can be resized: use `rem`, not fixed `px`, for font sizes

**Checkpoint:** the Lighthouse accessibility score is 95 or higher on every main screen.

---

## Stage 8: Lock it in

- [ ] Add `eslint-plugin-jsx-a11y` rules to the ESLint config and fix everything they report
- [ ] (Optional, ahead of Lesson 19) add one `vitest-axe` or `jest-axe` test per main screen
- [ ] Write `ACCESSIBILITY.md`: the conventions the project follows (focus styles, error pattern, dialog pattern, announcements) so the next contributor keeps them
- [ ] Add a **PR checklist item** for accessibility to `.github/PULL_REQUEST_TEMPLATE.md` if you are contributing it back

---

## Stage 9: Final audit

Repeat every check from Stage 0 and complete `AUDIT.md`:

- [ ] A before/after table: Lighthouse scores and axe issue counts per screen
- [ ] For each of the 15+ problems: the fix, and the commit that made it
- [ ] What you couldn't fix, and why
- [ ] What surprised you most

```bash
npm run build
npm run lint
```

Both should pass with the new a11y lint rules. No `any`.

---

## Requirements checklist

**Must have**

- [ ] `AUDIT.md` with a baseline, the fixes, and a final comparison
- [ ] A root error boundary and at least two section-level boundaries with working reset
- [ ] Human-friendly, recoverable error states for all request failures
- [ ] Skeleton/loading and empty states with no layout shift
- [ ] Semantic HTML, a skip link, and focus management on route change
- [ ] Complete keyboard support and visible focus
- [ ] Labeled controls, announced errors, and live regions for status changes
- [ ] Contrast and reduced-motion support
- [ ] `eslint-plugin-jsx-a11y` enabled and clean
- [ ] Lighthouse accessibility 95+ on main screens
- [ ] No `any`
- [ ] `npm run build` and `npm run lint` pass

**Nice to have**

- [ ] Automated axe tests in CI (Lesson 24)
- [ ] A reduced-data or offline fallback page (service worker)
- [ ] Internationalization (`lang` per content, `Intl` formatting)
- [ ] Test with two different screen readers
- [ ] Ask someone who uses assistive technology (or a friend who tries one for an hour) to review your flows

---

## Hints

<details>
<summary>My error boundary fallback never goes away after "Try again"</summary>

The thing that caused the error is still there. Reset the underlying state in `onReset` (or use `resetKeys` with the value that changes), so that the re-render doesn't throw again.
</details>

<details>
<summary>The boundary doesn't catch my fetch error</summary>

Boundaries only catch errors thrown during rendering. Use `try/catch` and show state, or with TanStack Query use `throwOnError: true` / `useSuspenseQuery` so the error is rethrown during render.
</details>

<details>
<summary>The live region isn't announced</summary>

The element must exist in the DOM before its content changes. Render an empty `<div role="status">` from the start and update its text. Don't conditionally mount it together with the message.
</details>

<details>
<summary>Focus moves to the heading but nothing is read</summary>

The heading needs `tabIndex={-1}` to receive focus. Also make sure the page changes its `<title>`. Some screen readers announce it.
</details>

<details>
<summary>The native <code>&lt;dialog&gt;</code> won't close with my state</summary>

Don't mix the `open` attribute with `showModal()`. Call `showModal()` / `close()` through a ref in an effect, and listen to the dialog's `close` event to sync your state.
</details>

<details>
<summary>Skeleton still causes layout shift</summary>

Give the skeleton the exact dimensions of the final content (fixed height, `aspect-ratio`, or the same number of lines). Check "Cumulative Layout Shift" in Lighthouse.
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per stage. Link each audit finding to its fix.
3. Push and open a pull request titled `Lesson 18: yourname`, with the before/after table in the description.
4. Ask a friend to review it. Ask them to use only the keyboard for five minutes, and to try breaking things (offline, bad URLs, blocked requests).

---

## Done when

- The app survives failures, explains what happened, and offers a way forward
- It can be used with a keyboard and a screen reader
- `AUDIT.md` shows measurable improvement
- `npm run build` and `npm run lint` pass
- Your PR is open and a friend has reviewed it

You've finished Module 4! Next up: **Module 5, Lesson 19: Unit and component testing**.
