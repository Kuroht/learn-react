# Lesson 07: Tailwind Fundamentals

**Goal:** style React components with Tailwind CSS. You'll set it up with Vite, learn the utility-class way of thinking, and build a clean landing page.

**Time:** about 2 to 3 hours

**Prerequisite:** [Lesson 06](../06-lists-keys-conditional-rendering/README.md)

> **Last verified:** October 2026, with Tailwind CSS v4. Tailwind changes between major versions, so always check [tailwindcss.com/docs/installation/using-vite](https://tailwindcss.com/docs/installation/using-vite) if a step here doesn't match what you see.

---

## What you will learn

- What utility-first CSS is and why teams use it
- Installing Tailwind in a Vite + React project
- Spacing, sizing, colors, and typography utilities
- Flexbox and grid with utilities
- State variants: `hover:`, `focus:`, `disabled:`
- Customizing the theme with CSS variables
- Extracting repeated styles into components
- Arbitrary values, and when to use them
- Keeping class names readable

---

## 1. Utility-first CSS

Traditional CSS: you invent a class name, then write rules for it elsewhere.

```css
.card { padding: 1rem; border-radius: 0.5rem; background: white; }
```

Tailwind gives you tiny classes that each do **one thing**, and you combine them right in the markup:

```tsx
<div className="rounded-lg bg-white p-4 shadow">...</div>
```

Why it works well with React:

- Styles live next to the component. No hunting between files.
- No naming things (`.card-inner-wrapper-2`).
- Deleting a component deletes its styles.
- A consistent scale (spacing, colors, sizes) keeps designs tidy.
- Unused styles are never shipped. Tailwind only generates the classes you use.

It looks noisy at first. The trick is that you extract **components**, not CSS classes, when something repeats (section 8).

---

## 2. Installing Tailwind with Vite

In a fresh Vite React + TypeScript project:

```bash
npm install tailwindcss @tailwindcss/vite
```

Add the plugin in `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

Replace the contents of `src/index.css` with one line:

```css
@import 'tailwindcss';
```

Make sure `main.tsx` imports `./index.css`. Then try it:

```tsx
<h1 className="text-3xl font-bold text-blue-600">Hello Tailwind</h1>
```

Also install the **Tailwind CSS IntelliSense** extension in VS Code for autocomplete and hover previews.

> Version 4 needs no `tailwind.config.js` and no `content` list. It finds your files automatically. If you see a tutorial using `@tailwind base;` or a config file, it's for v3.

---

## 3. The spacing scale

Most size utilities use a scale where **1 unit = 0.25rem (4px)**:

| Class | Value |
|-------|-------|
| `p-1` | 0.25rem (4px) |
| `p-2` | 0.5rem (8px) |
| `p-4` | 1rem (16px) |
| `p-8` | 2rem (32px) |

Prefixes pick the side:

| Prefix | Meaning |
|--------|---------|
| `p-4` | padding, all sides |
| `px-4` / `py-4` | horizontal / vertical |
| `pt-4` `pr-4` `pb-4` `pl-4` | one side |
| `m-4`, `mx-auto`, `mt-8` | margin, same pattern |
| `gap-4` | gap in flex and grid |
| `space-y-4` | vertical space between children |

Sizes use the same scale: `w-64`, `h-10`, `size-12` (width and height), plus fractions (`w-1/2`) and `w-full`, `max-w-3xl`, `min-h-screen`.

---

## 4. Typography and color

```tsx
<p className="text-sm font-medium text-gray-600">Small, medium weight</p>
<h2 className="text-2xl font-bold tracking-tight text-gray-900">Heading</h2>
<p className="leading-relaxed text-gray-700">Comfortable line height</p>
<p className="truncate">Long text gets cut with an ellipsis…</p>
```

| Group | Examples |
|-------|----------|
| Size | `text-xs` `text-sm` `text-base` `text-lg` `text-xl` `text-2xl` ... |
| Weight | `font-normal` `font-medium` `font-semibold` `font-bold` |
| Align | `text-left` `text-center` `text-right` |
| Color | `text-gray-700` `text-blue-600` `text-white` |

Colors use `name-shade`, where the shade goes from `50` (lightest) to `950` (darkest). The same pattern works for `bg-`, `border-`, `ring-`, and `text-`:

```tsx
<div className="border border-gray-200 bg-gray-50 text-gray-900">...</div>
```

Opacity uses a slash: `bg-black/50`, `text-white/80`.

---

## 5. Borders, shadows, and shape

```tsx
<div className="rounded-xl border border-gray-200 shadow-sm">...</div>
<img className="size-12 rounded-full object-cover" />
<button className="ring-2 ring-blue-500 ring-offset-2">...</button>
```

- `rounded`, `rounded-lg`, `rounded-full`
- `border`, `border-2`, `border-t`, `divide-y` (lines between children)
- `shadow-sm`, `shadow`, `shadow-lg`
- `ring-*` draws an outline-like ring (often used for focus)
- `overflow-hidden`, `aspect-video`, `object-cover`

---

## 6. Layout: flex and grid

### Flexbox

```tsx
<nav className="flex items-center justify-between gap-4">
  <Logo />
  <ul className="flex gap-6">...</ul>
</nav>
```

| Class | CSS |
|-------|-----|
| `flex` | `display: flex` |
| `flex-col` | column direction |
| `items-center` | `align-items: center` |
| `justify-between` | `justify-content: space-between` |
| `flex-1` | grow to fill the space |
| `flex-wrap` | wrap onto new lines |

### Grid

```tsx
<div className="grid grid-cols-3 gap-6">...</div>
<div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">...</div>
```

### Centering a page

```tsx
<main className="mx-auto max-w-5xl px-4 py-12">...</main>
```

`mx-auto` plus `max-w-*` is the standard container. (Responsive layouts come in Lesson 08.)

---

## 7. State variants

Prefix a utility to apply it only in a state:

```tsx
<button
  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white
             hover:bg-blue-700
             focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600
             active:scale-95
             disabled:cursor-not-allowed disabled:opacity-50"
>
  Save
</button>
```

| Variant | When |
|---------|------|
| `hover:` | pointer over |
| `focus:` / `focus-visible:` | focused (the second only for keyboard focus) |
| `active:` | being pressed |
| `disabled:` | `disabled` attribute |
| `group-hover:` | when a parent marked `group` is hovered |
| `first:` `last:` `odd:` `even:` | position among siblings |
| `peer-checked:` | based on a sibling marked `peer` |

Never remove focus outlines without replacing them. Keyboard users need to see where they are.

Add transitions to make changes smooth: `transition`, `duration-200`.

---

## 8. Repeating yourself: make a component

Long class lists are fine **once**. When you copy them three times, extract a React component:

```tsx
type CardProps = { title: string; children: React.ReactNode };

export function Card({ title, children }: CardProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <div className="text-gray-600">{children}</div>
    </section>
  );
}
```

Now the styles live in one place and the usage is clean: `<Card title="Fast">...</Card>`.

Rule: **extract a component, not a CSS class**. Avoid `@apply` for this. It brings back the problems of naming and indirection that Tailwind removes.

### Conditional classes

Combine strings with a template literal or a small helper:

```tsx
<span className={`rounded px-2 py-1 ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
```

This gets messy quickly. Lesson 09 introduces `clsx` and `cva` for variants.

**Never build class names dynamically from pieces.** Tailwind scans for complete strings:

```tsx
className={`bg-${color}-500`}       // broken, Tailwind can't see 'bg-red-500'
className={color === 'red' ? 'bg-red-500' : 'bg-blue-500'}   // works
```

---

## 9. Customizing the theme

Tailwind v4 is configured in CSS with `@theme`:

```css
@import 'tailwindcss';

@theme {
  --color-brand-50: #eef2ff;
  --color-brand-500: #6366f1;
  --color-brand-600: #4f46e5;
  --font-display: 'Poppins', sans-serif;
  --radius-card: 1rem;
}
```

Every variable becomes utilities: `bg-brand-500`, `text-brand-600`, `font-display`, `rounded-card`. Centralizing your colors means a rebrand is a one-file change.

### Arbitrary values

When you need a one-off, use square brackets:

```tsx
<div className="w-[22rem] bg-[#1da1f2] top-[117px]">...</div>
```

Use them sparingly. If you use the same value twice, add it to the theme.

---

## 10. Keeping it readable

- Group classes by purpose (layout, spacing, typography, color, state) and break long lists over several lines.
- Install the official **Prettier plugin** `prettier-plugin-tailwindcss`. It sorts classes in a consistent order automatically.
- Prefer the scale (`p-4`) over arbitrary values (`p-[17px]`).
- Use semantic HTML (`<nav>`, `<main>`, `<button>`) and let Tailwind only style it.
- When in doubt, open the docs and search for the CSS property you know. The Tailwind docs list every class.

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| Following a v3 tutorial (`@tailwind base`, `tailwind.config.js`) | Nothing works or behaves oddly in v4 |
| Forgetting to import `index.css` | No styles at all |
| Building classes dynamically (`bg-${color}-500`) | Class is never generated |
| Using `className` as `class` | React error. It's `className` |
| Conflicting classes (`p-2 p-4`) | The result depends on CSS order, not the order you wrote them |
| Removing outlines with `outline-none` only | Keyboard users get lost |
| Pasting the same 15 classes everywhere | Extract a component |
| Using `@apply` for everything | You lose the benefits of utility-first |

---

## Key takeaways

- Utility classes do one thing each, and you compose them in `className`.
- Install with `tailwindcss` and `@tailwindcss/vite`, then `@import 'tailwindcss';`.
- The spacing scale is `1 = 0.25rem`. Colors are `name-shade`.
- Variants like `hover:` and `disabled:` handle states.
- Extract React components when styles repeat. Don't extract CSS classes.
- Never build class names from fragments. Write complete strings.
- Customize the design system in `@theme`.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to [Lesson 08: Responsive design and dark mode](../08-responsive-and-dark-mode/README.md).
