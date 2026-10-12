# Lesson 08: Exercises

Do these in a scratch Vite project with Tailwind installed, or on a practice branch. Try each one **before** reading the answer. Test every exercise in DevTools device mode.

---

## Exercise 1: Read the breakpoints

At a screen width of 800px (which is above `md` = 768px and below `lg` = 1024px), what font size and color does this element have?

```tsx
<p className="text-sm text-gray-600 md:text-base lg:text-lg lg:text-black">
```

And at 500px? And at 1200px?

<details>
<summary>Answers</summary>

- 800px: `text-base` and `text-gray-600` (the `md:` size applies, `lg:` doesn't yet).
- 500px: `text-sm` and `text-gray-600` (only the unprefixed classes).
- 1200px: `text-lg` and `text-black`.
</details>

---

## Exercise 2: Stack to row

Build a card with an image and text. On phones the image is on top of the text; from `md` up they sit side by side, with the image taking one third of the width.

Check at 360px, 768px, and 1280px.

---

## Exercise 3: Responsive grid

Show 12 cards:

- 1 column on phones
- 2 columns from `sm`
- 3 columns from `lg`
- 4 columns from `xl`

Then replace all of the breakpoints with a single `grid-cols-[repeat(auto-fill,minmax(14rem,1fr))]`. Which approach do you prefer, and when would you pick each?

<details>
<summary>Discussion</summary>

`auto-fill` is shorter and adapts to any width. Explicit breakpoints give you exact control, for example when a design requires exactly 3 columns at a certain size.
</details>

---

## Exercise 4: A mobile menu

Build a `Navbar` with a logo and three links.

- On `md` and up: links are shown in a row
- Below `md`: a "Menu" button toggles a vertical list
- The button has `aria-expanded` and `aria-controls`
- Clicking a link closes the menu

Hint: state with `useState<boolean>`.

---

## Exercise 5: Fix the overflow

This causes a horizontal scrollbar on phones. Find the cause and fix it in two ways.

```tsx
<div className="w-[600px] bg-gray-100 p-4">
  <img src="/photo.jpg" width="800" alt="A photo" />
</div>
```

<details>
<summary>Answer</summary>

The fixed widths are bigger than the screen. Use `w-full max-w-[600px]` on the container and `w-full h-auto` on the image (and remove the `width` attribute, or keep it along with `h-auto`).
</details>

---

## Exercise 6: Dark mode, the manual way

1. Add `@custom-variant dark (&:where(.dark, .dark *));` to your CSS.
2. Style a card with `bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100` and a `dark:border-gray-700` border.
3. Open DevTools and add the class `dark` to `<html>` by hand. Remove it.
4. Now build a button that toggles the class with `document.documentElement.classList.toggle('dark')`.

---

## Exercise 7: A proper theme hook

Write `useTheme()` returning `{ theme, setTheme }` with `Theme = 'light' | 'dark' | 'system'`:

- Reads the saved value from `localStorage` and validates it
- Applies the `dark` class to `<html>`
- Saves changes
- Add the inline script to `index.html` to prevent the flash

Build a `ThemeToggle` with three buttons (or a `select`) using it. Test by reloading the page in each mode with the cache disabled.

Stretch: when the theme is `system`, update live when the operating system changes.

---

## Exercise 8: Semantic tokens

Convert a small page from `bg-white dark:bg-gray-900` style to semantic tokens:

1. Define `--background`, `--foreground`, `--muted`, `--card`, and `--border` for `:root` and `.dark`.
2. Register them in `@theme inline`.
3. Replace the color classes with `bg-background`, `text-foreground`, `text-muted`, `bg-card`, `border-border`.
4. Count how many `dark:` classes you no longer need.

Add a new token, `--accent`, and use it for a button.

---

## Check yourself

You're ready for the project if you can answer these without looking:

- What does mobile-first mean, and what does `md:flex` do on a phone?
- How do you show a menu button only on small screens?
- Why is `w-[600px]` a risky choice?
- What do you need in v4 to make `dark:` follow a class instead of the OS setting?
- Why validate what you read from `localStorage`?
- How do you prevent a white flash on load?
- What are semantic color tokens, and why use them?
- Name three things to check when testing a responsive layout.
