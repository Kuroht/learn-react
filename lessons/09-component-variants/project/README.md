# Lesson 09 Project: Mini Design System

Build a small, typed, themeable component library: Button, Badge, Card, and Input, plus a showcase page that documents them.

> **Last verified:** October 2026. Check [cva.style/docs](https://cva.style/docs) for the current API.

---

## Brief

A design system is a set of reusable, consistent UI pieces. You'll build four components with `cva`, `clsx`, and `tailwind-merge`, and a **showcase page** that displays every variant in light and dark mode, with a theme toggle.

This is the end of Module 2. You'll reuse these components in the rest of the course.

Every stage ends with a **checkpoint**: something you should see in the browser.

---

## Getting started

```bash
cd lessons/09-component-variants/project
npm create vite@latest starter -- --template react-ts
cd starter
npm install
npm install tailwindcss @tailwindcss/vite clsx tailwind-merge class-variance-authority
npm run dev
```

Set up Tailwind, semantic tokens, and dark mode as in Lessons 07 and 08. You can copy the theme and `useTheme` hook from your Lesson 08 project.

Work in your own branch: `git checkout -b yourname/lesson-09`

---

## Stage 1: Foundation

- [ ] `src/lib/cn.ts` with `cn()` (clsx + twMerge)
- [ ] Semantic tokens in `index.css`: `background`, `foreground`, `muted`, `card`, `border`, `brand-500/600`, plus `danger` and `success` colors
- [ ] Dark mode with a class and a `ThemeToggle`
- [ ] Folder: `src/components/ui/`

**Checkpoint:** a quick test with `cn('px-4', 'px-8')` shows only `px-8` in the DOM.

---

## Stage 2: Button

In `src/components/ui/Button.tsx`:

- [ ] `variant`: `primary | secondary | danger | ghost`
- [ ] `size`: `sm | md | lg`
- [ ] Defaults: `primary` and `md`
- [ ] Props: `ComponentProps<'button'> & VariantProps<typeof buttonStyles>`
- [ ] Hover, `focus-visible`, and `disabled` states
- [ ] The caller's `className` wins over defaults
- [ ] Also export `buttonStyles` for use on links
- [ ] A `loading` boolean that disables the button and shows a small spinner (stretch: use a CSS-only spinner)

**Checkpoint:** all 12 combinations of variant and size look right in both themes.

---

## Stage 3: Badge

- [ ] `tone`: `neutral | success | warning | danger | brand`
- [ ] `size`: `sm | md`
- [ ] Looks good in light and dark (check contrast)
- [ ] Spreads native `<span>` props

**Checkpoint:** every tone is readable in dark mode.

---

## Stage 4: Input and Field

- [ ] `Input`: native input props plus `invalid?: boolean` (also sets `aria-invalid`)
- [ ] States: default, focus, disabled, invalid
- [ ] `Field` component with a label, input slot, hint text, and error message, linked with `useId()` and `aria-describedby`
- [ ] A `required` marker (visual and accessible)

**Checkpoint:** clicking the label focuses the input. A screen reader would read the error (inspect the attributes in DevTools).

---

## Stage 5: Card family

- [ ] `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- [ ] Each accepts its native element's props and `className`
- [ ] A `variant`: `default | outline | elevated`
- [ ] Compose at least two different example cards with the same parts

**Checkpoint:** two cards with different layouts built from the same components.

---

## Stage 6: The showcase page

Create `src/Showcase.tsx` and render it from `App.tsx`.

- [ ] A header with the theme toggle
- [ ] A section per component (Buttons, Badges, Inputs, Cards) with a heading
- [ ] Each section shows **all** variants and sizes, plus disabled/loading/invalid states
- [ ] Generate the variant grids from typed arrays with `.map()`, for example:

  ```tsx
  const variants = ['primary', 'secondary', 'danger', 'ghost'] as const;
  ```

- [ ] A small "usage" snippet shown under each component (in a `<pre><code>` block)
- [ ] A real-world demo at the bottom: a sign-up form built only from your components

**Checkpoint:** one page where a teammate could see everything your system offers.

---

## Stage 7: Quality pass

- [ ] Tab through the whole page: every interactive element has a visible focus ring in both themes
- [ ] Buttons and inputs are at least ~40px tall
- [ ] Check text contrast in both themes
- [ ] The page is responsive down to 360px
- [ ] Try `<Button variant="huge">`: TypeScript must refuse
- [ ] Remove `...props` from one component to see what breaks, then put it back

---

## Stage 8: Check your work

```bash
npm run build
npm run lint
```

Both should pass. No `any`, no string-built class names.

---

## Requirements checklist

**Must have**

- [ ] `cn()` helper using `clsx` and `tailwind-merge`
- [ ] `Button`, `Badge`, `Input` (with `Field`), and `Card` (with parts), all using `cva` where there are variants
- [ ] Props derived with `VariantProps` where applicable
- [ ] Every component merges the caller's `className` last and spreads native props
- [ ] Semantic tokens, with light and dark themes
- [ ] A showcase page showing every variant and state
- [ ] Accessible labels, focus styles, and `aria-*`
- [ ] No `any`
- [ ] `npm run build` and `npm run lint` pass

**Nice to have**

- [ ] A `Select`, `Checkbox`, or `Switch` component
- [ ] A `Spinner` and a `Skeleton` component
- [ ] An `Alert` component with `info | success | warning | error` tones and an icon
- [ ] A `Modal` using the native `<dialog>` element
- [ ] Publish the components as a local package, or document them in a `README` table

---

## Hints

<details>
<summary>The caller's <code>className</code> doesn't override my styles</summary>

Check the order in `cn(buttonStyles({ variant, size }), className)`. The caller's classes go **last**. Also make sure `tailwind-merge` is involved. Plain `clsx` doesn't resolve conflicts.
</details>

<details>
<summary>TypeScript says <code>variant</code> can be <code>null</code></summary>

That's how `VariantProps` types it. Passing `undefined` or `null` falls back to the default. You don't have to do anything. Just pass the value through to the `cva` function.
</details>

<details>
<summary>My variant classes aren't applied</summary>

Tailwind needs complete class names in the source. Write `'bg-red-600'` in the `cva` object, not `` `bg-${color}-600` ``.
</details>

<details>
<summary>How do I map a union to a showcase grid?</summary>

Define the list with `as const` so the types stay literal:

```tsx
const sizes = ['sm', 'md', 'lg'] as const;
sizes.map((size) => <Button key={size} size={size}>{size}</Button>);
```
</details>

<details>
<summary>The spinner doesn't spin</summary>

Use Tailwind's `animate-spin` on an element with a border (for example `size-4 rounded-full border-2 border-current border-t-transparent`). Add `motion-reduce:animate-none` for people who prefer less motion.
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per component.
3. Push and open a pull request titled `Lesson 09: yourname`, with screenshots of the showcase in both themes.
4. Ask a friend to review it. A good review asks: could I misuse a component in a way TypeScript doesn't catch, and can I use all of them with only the keyboard?

---

## Done when

- Your showcase page demonstrates every component and state in both themes
- Variants are typed and impossible to misuse
- `npm run build` and `npm run lint` pass
- Your PR is open and a friend has reviewed it

You've finished Module 2! Next up: **Module 3, Lesson 10: `useEffect` and side effects**.
