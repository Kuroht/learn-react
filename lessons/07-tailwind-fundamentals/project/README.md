# Lesson 07 Project: Landing Page

Build a polished product landing page using only Tailwind utilities and small React components.

> **Last verified:** October 2026, with Tailwind CSS v4. Check [tailwindcss.com/docs/installation/using-vite](https://tailwindcss.com/docs/installation/using-vite) for the current setup.

---

## Brief

Invent a fictional product (a note-taking app, a coffee subscription, a habit tracker, anything). Build its landing page with these sections:

1. **Navbar:** logo and links, with a call-to-action button
2. **Hero:** headline, subheading, two buttons, and an image or illustration
3. **Features:** a grid of cards
4. **Testimonials:** quotes with avatars
5. **Call to action:** a final banner
6. **Footer:** links and copyright

Responsive design and dark mode come in Lesson 08, so for now design for a desktop-width screen, but don't make anything break on narrow ones.

Every stage ends with a **checkpoint**: something you should see in the browser.

---

## Getting started

```bash
cd lessons/07-tailwind-fundamentals/project
npm create vite@latest starter -- --template react-ts
cd starter
npm install
npm install tailwindcss @tailwindcss/vite
npm run dev
```

1. Add `tailwindcss()` to the plugins in `vite.config.ts`.
2. Replace `src/index.css` with `@import 'tailwindcss';`.
3. Delete `App.css` and the template code.
4. Check it works with a `text-3xl font-bold text-blue-600` heading.

Work in your own branch: `git checkout -b yourname/lesson-07`

---

## Stage 1: Theme and page shell

- [ ] Add a brand color scale (at least `brand-500` and `brand-600`) in `@theme`
- [ ] A `font-sans` stack, or a Google font if you want
- [ ] `App.tsx` renders `<Navbar />`, `<main>` (with the sections), and `<Footer />`
- [ ] Each section is its own component in `src/components/`
- [ ] A shared `Container` component (`mx-auto max-w-6xl px-4`) used by every section

**Checkpoint:** the page shows stacked placeholder sections, all aligned to the same container.

---

## Stage 2: Navbar

- [ ] Logo (text or SVG) on the left
- [ ] Links (Features, Pricing, About) in the middle or right
- [ ] A primary "Get started" button
- [ ] Links have hover and focus styles
- [ ] A subtle bottom border

**Checkpoint:** the navbar is aligned with `flex items-center justify-between`.

---

## Stage 3: Hero

- [ ] A large headline (`text-5xl font-bold tracking-tight`) and a muted subheading
- [ ] Two buttons: primary and secondary (outline)
- [ ] A visual on the side: an image, a gradient box, or an emoji illustration
- [ ] Generous spacing (`py-20` or more)

**Checkpoint:** you can clearly tell the primary action from the secondary one.

---

## Stage 4: Reusable `Button`

Build `Button` now, because you'll use it in many places.

- [ ] Props: `variant?: 'primary' | 'secondary'` and all native `<button>` props
- [ ] Hover, `focus-visible`, `active`, and `disabled` styles
- [ ] Used in the navbar, hero, and call-to-action

(Lesson 09 will make this much nicer with `cva`. For now a simple conditional is fine.)

**Checkpoint:** one `Button` component serves every button on the page.

---

## Stage 5: Features

- [ ] A typed array of at least six features (`icon`, `title`, `description`)
- [ ] A `FeatureCard` component rendered with `.map()`
- [ ] A 3-column grid with consistent gaps
- [ ] A hover effect on cards (a lift or a shadow, with a transition)
- [ ] A section title and subtitle above the grid

**Checkpoint:** six aligned cards that react to the mouse.

---

## Stage 6: Testimonials and call to action

- [ ] Three testimonials: quote, name, role, and avatar (`rounded-full`, `object-cover`, or initials)
- [ ] A `Testimonial` component using typed props
- [ ] A full-width call-to-action band with a brand background, white text, and a button that contrasts with it
- [ ] A readable text color on every background (check the contrast)

**Checkpoint:** the CTA band stands out from the rest of the page.

---

## Stage 7: Footer and polish

- [ ] Footer with 2 or 3 columns of links and a copyright line
- [ ] A smooth transition on every interactive element
- [ ] `<nav>`, `<main>`, `<section>`, `<footer>` used semantically, and each section has a heading
- [ ] Tab through the page: every interactive element shows a focus ring
- [ ] Images have `alt` text
- [ ] Resize the window to ~400px. Nothing should be unusable (it won't be pretty yet)

---

## Stage 8: Check your work

```bash
npm run build
npm run lint
```

Both should pass. No `any`, and no class names built from fragments.

---

## Requirements checklist

**Must have**

- [ ] Tailwind v4 set up with the Vite plugin
- [ ] Brand colors defined in `@theme`
- [ ] All six sections as separate components
- [ ] A reusable `Container` and `Button`
- [ ] Features and testimonials rendered from typed data
- [ ] Hover, focus, and disabled states styled
- [ ] No `@apply`, no inline `style` for things Tailwind can do
- [ ] `npm run build` and `npm run lint` pass

**Nice to have**

- [ ] Prettier with `prettier-plugin-tailwindcss`
- [ ] A gradient hero background (`bg-linear-to-br from-brand-50 to-white`)
- [ ] An FAQ section with `<details>` and `<summary>` styled with Tailwind
- [ ] A logo strip ("Trusted by...") with grayscale logos that colorize on hover
- [ ] Smooth scrolling to sections from the navbar links

---

## Hints

<details>
<summary>Tailwind classes have no effect</summary>

Check that: (1) `@tailwindcss/vite` is in `vite.config.ts`, (2) `src/index.css` has `@import 'tailwindcss';`, (3) `main.tsx` imports `./index.css`, (4) you restarted `npm run dev` after installing.
</details>

<details>
<summary>My custom color <code>bg-brand-500</code> doesn't work</summary>

The variable must be named `--color-brand-500` inside `@theme` (not `:root`). The part after `--color-` becomes the utility name.
</details>

<details>
<summary>How do I center the content and keep it from getting too wide?</summary>

`mx-auto max-w-6xl px-4` on a wrapper. Put it in a `Container` component so every section shares it.
</details>

<details>
<summary>My conditional variant class doesn't work</summary>

Use complete class strings in an object or ternary:

```tsx
const styles = {
  primary: 'bg-brand-600 text-white hover:bg-brand-500',
  secondary: 'border border-gray-300 text-gray-900 hover:bg-gray-50',
};
```

Don't assemble pieces like `bg-${color}-600`.
</details>

<details>
<summary>The text on my colored background is hard to read</summary>

Use a darker shade of the background or a lighter text, and check the contrast ratio (aim for at least 4.5:1) with the browser DevTools color picker.
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per section.
3. Push and open a pull request titled `Lesson 07: yourname`, with a screenshot.
4. Ask a friend to review it. A good review asks: is anything repeated that should be a component, and can I use the page with only the keyboard?

---

## Done when

- The landing page looks professional on a desktop screen
- Components are small and reusable
- `npm run build` and `npm run lint` pass
- Your PR is open and a friend has reviewed it

Next up: **Lesson 08: Responsive design and dark mode**.
