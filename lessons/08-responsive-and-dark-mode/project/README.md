# Lesson 08 Project: Responsive Pricing Page with Theme Toggle

Build a pricing page that looks right on any screen and in both light and dark themes.

> **Last verified:** October 2026, with Tailwind CSS v4. Check [tailwindcss.com/docs/dark-mode](https://tailwindcss.com/docs/dark-mode) for the current setup.

---

## Brief

A pricing page for a fictional product with:

- A navbar that collapses into a menu on phones, and has a theme toggle
- A hero with a title and a **monthly / yearly** billing switch
- Three pricing cards (Free, Pro, Team) with a highlighted "Most popular" plan
- A feature comparison table that scrolls well on phones
- An FAQ
- A footer

Light, dark, and system themes. The choice is saved and applied without a flash.

Every stage ends with a **checkpoint**: something you should see in the browser.

---

## Getting started

```bash
cd lessons/08-responsive-and-dark-mode/project
npm create vite@latest starter -- --template react-ts
cd starter
npm install
npm install tailwindcss @tailwindcss/vite
npm run dev
```

Set up Tailwind as in Lesson 07. You can also copy the `Button`, `Container`, and theme from your Lesson 07 project.

Work in your own branch: `git checkout -b yourname/lesson-08`

---

## Stage 1: Theme tokens and dark mode

- [ ] `@custom-variant dark (&:where(.dark, .dark *));` in `index.css`
- [ ] Semantic tokens (`background`, `foreground`, `muted`, `card`, `border`, plus a `brand` color) for light and dark, registered in `@theme inline`
- [ ] `html.dark { color-scheme: dark; }`
- [ ] The page body uses `bg-background text-foreground`

**Checkpoint:** adding the `dark` class to `<html>` by hand in DevTools switches the colors.

---

## Stage 2: The theme hook and toggle

- [ ] `src/hooks/useTheme.ts` with `Theme = 'light' | 'dark' | 'system'`
- [ ] Saved choice read from `localStorage` and **validated**
- [ ] The `dark` class is applied to `<html>`
- [ ] A `ThemeToggle` component (three buttons or a select) with an accessible label and a clear "current" state
- [ ] An inline script in `index.html` applies the theme **before** React loads (no flash)
- [ ] When the theme is `system`, it follows the OS and updates live

**Checkpoint:** reload in each mode. There's no white flash in dark mode.

---

## Stage 3: Responsive navbar

- [ ] Logo, links, and the theme toggle
- [ ] From `md` up: links in a row
- [ ] Below `md`: a menu button that toggles a vertical list (`aria-expanded`, `aria-controls`)
- [ ] Clicking a link closes the menu
- [ ] Press Escape to close the menu (stretch, but nice)

**Checkpoint:** works at 360px, 768px, and 1280px.

---

## Stage 4: Billing switch and plans

Create `src/types.ts`:

```ts
export type Billing = 'monthly' | 'yearly';

export type Plan = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number; // price per month when billed yearly
  features: string[];
  popular?: boolean;
};
```

- [ ] `billing` state typed as `Billing`, with an accessible switch (two buttons with `aria-pressed`, or a radio group)
- [ ] A typed `plans` array with three plans (one `popular`)
- [ ] `PricingCard` shows the name, the price for the selected billing, and the feature list
- [ ] The price is **derived** from `billing`, not stored in state
- [ ] A "Save 20%" hint on the yearly option, computed from the data (not hard-coded)

**Checkpoint:** switching billing updates all prices at once.

---

## Stage 5: Responsive pricing grid

- [ ] 1 column on phones, 3 columns from `lg` (consider 2 on `md`)
- [ ] The popular plan has a highlighted border and a "Most popular" badge, and on large screens it's slightly raised (for example `lg:-translate-y-2`)
- [ ] On phones, the popular plan is **first** (hint: `order-first lg:order-none`)
- [ ] Cards keep equal heights with the button pinned to the bottom (`flex flex-col` and `mt-auto`)

**Checkpoint:** no horizontal scroll and no cramped text between breakpoints. Drag the window slowly to check.

---

## Stage 6: Comparison table and FAQ

- [ ] A `<table>` comparing the plans (rows of features, columns of plans, with ✓ and — marks and text alternatives for screen readers)
- [ ] The table is wrapped in `overflow-x-auto` so it scrolls inside its box on phones, instead of the page scrolling
- [ ] The first column is sticky on scroll (`sticky left-0`) with a background (stretch)
- [ ] FAQ with at least four questions using `<details>` and `<summary>` styled with Tailwind
- [ ] FAQ content is typed data rendered with `.map()`

**Checkpoint:** at 360px the table scrolls sideways within its container only.

---

## Stage 7: Polish and test

- [ ] Check at 360px, 768px, 1024px, and 1440px
- [ ] Check the contrast in **both** themes (DevTools color picker shows the ratio)
- [ ] Tab through the page: focus rings are visible in both themes
- [ ] Buttons are at least ~44px tall on phones
- [ ] Zoom to 200% and the page is still usable
- [ ] Emulate `prefers-color-scheme` in DevTools and confirm `system` follows it

---

## Stage 8: Check your work

```bash
npm run build
npm run lint
```

Both should pass. No `any`.

---

## Requirements checklist

**Must have**

- [ ] Mobile-first layout with at least three breakpoints in use
- [ ] A navbar with a working mobile menu
- [ ] Theme toggle with light, dark, and system, saved and applied without a flash
- [ ] Semantic color tokens
- [ ] A billing switch, with prices derived from data
- [ ] A comparison table that scrolls inside its own container on phones
- [ ] Plans and FAQ rendered from typed data
- [ ] No `any`
- [ ] `npm run build` and `npm run lint` pass

**Nice to have**

- [ ] A smooth transition when switching theme (`transition-colors`)
- [ ] A currency formatter with `Intl.NumberFormat`
- [ ] Plan selection that shows a confirmation toast (just state for now)
- [ ] A reduced-motion check: `motion-reduce:transition-none`
- [ ] Print styles (`print:` variants)

---

## Hints

<details>
<summary><code>dark:</code> classes don't do anything</summary>

In Tailwind v4 you must declare `@custom-variant dark (&:where(.dark, .dark *));` in your CSS, and the `dark` class must be on `<html>` (check in DevTools Elements).
</details>

<details>
<summary>I see a flash of light theme on reload</summary>

Your theme is applied inside a React effect, which runs after the first paint. Add the small inline script to the `<head>` of `index.html` so the class is set before anything renders.
</details>

<details>
<summary>The table makes the whole page scroll sideways</summary>

Wrap it: `<div className="overflow-x-auto"><table className="min-w-[40rem] w-full">...</table></div>`. The wrapper scrolls, not the page.
</details>

<details>
<summary>How do I derive the "Save X%" label?</summary>

```tsx
const savings = Math.round((1 - plan.yearlyPrice / plan.monthlyPrice) * 100);
```

Compute it from the data and only show it when `plan.monthlyPrice > 0` (avoid dividing by zero for the free plan).
</details>

<details>
<summary>Cards have different heights and the buttons don't line up</summary>

Make each card `flex flex-col`, let the feature list `grow` (or use `flex-1`), and keep the button at the bottom. In a grid, items stretch to equal height by default.
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per stage.
3. Push and open a pull request titled `Lesson 08: yourname`, with screenshots of phone and desktop in both themes.
4. Ask a friend to review it. A good review asks: what happens at 320px, at 1900px, and with the OS set to dark?

---

## Done when

- The page looks good from 320px to a wide desktop, in both themes
- The theme choice is saved and has no flash
- `npm run build` and `npm run lint` pass
- Your PR is open and a friend has reviewed it

Next up: **Lesson 09: Component variants (`cva`, `clsx`)**.
