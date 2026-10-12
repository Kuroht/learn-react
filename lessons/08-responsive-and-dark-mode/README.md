# Lesson 08: Responsive Design and Dark Mode

**Goal:** make interfaces that work on any screen and respect the user's color scheme. You'll learn Tailwind's breakpoints, mobile-first thinking, and a theme toggle that remembers the choice.

**Time:** about 2 to 3 hours

**Prerequisite:** [Lesson 07](../07-tailwind-fundamentals/README.md)

> **Last verified:** October 2026, with Tailwind CSS v4. Check [tailwindcss.com/docs/responsive-design](https://tailwindcss.com/docs/responsive-design) and [tailwindcss.com/docs/dark-mode](https://tailwindcss.com/docs/dark-mode) if anything here doesn't match what you see.

---

## What you will learn

- Mobile-first design
- Breakpoint prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Responsive layouts with flex and grid
- Showing and hiding things by screen size
- Responsive typography and spacing
- Dark mode with the `dark:` variant
- A theme toggle (light, dark, system) saved in `localStorage`
- Semantic color tokens for easy theming
- Testing responsive layouts

---

## 1. Mobile-first

Tailwind is **mobile-first**: classes without a prefix apply to **all** screens, and prefixed classes apply from that breakpoint **upward**.

```tsx
<div className="text-base md:text-lg lg:text-xl">
```

- Phones: `text-base`
- Width ≥ `md`: `text-lg`
- Width ≥ `lg`: `text-xl`

The beginner mistake is thinking `sm:` means "on small screens". It means "**at the `sm` width and larger**". Write the phone layout first, then add changes as the screen grows.

### The default breakpoints

| Prefix | Minimum width |
|--------|---------------|
| (none) | 0 |
| `sm:` | 40rem (640px) |
| `md:` | 48rem (768px) |
| `lg:` | 64rem (1024px) |
| `xl:` | 80rem (1280px) |
| `2xl:` | 96rem (1536px) |

You can also target ranges (`max-md:` applies *below* `md`), but start with mobile-first and you rarely need it.

---

## 2. Responsive layouts

### Stack, then split

```tsx
<div className="flex flex-col gap-6 md:flex-row md:items-center">
  <div className="md:w-1/2">Text</div>
  <div className="md:w-1/2">Image</div>
</div>
```

A column on phones, a row from `md` up.

### Grid columns that grow

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
```

Or let the browser decide with no breakpoints at all:

```tsx
<div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-4">
```

### Container and padding

```tsx
<main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-16 lg:px-8">
```

Padding gets bigger with the screen.

### Responsive type

```tsx
<h1 className="text-3xl font-bold sm:text-4xl lg:text-6xl">
```

---

## 3. Showing and hiding

```tsx
<nav className="hidden md:flex gap-6">...desktop links...</nav>
<button className="md:hidden" aria-label="Open menu">☰</button>
```

- `hidden` = `display: none`
- `md:flex` = show as flex from `md` up
- `md:hidden` = hide from `md` up

Use this for things like a hamburger menu on phones. In React, you can also **render** differently with state (menu open or closed), but CSS-based hiding avoids needing JavaScript to detect the screen size.

If content must not exist in the DOM or be read by screen readers on some sizes, CSS `hidden` also hides it from assistive technology, which is what you want here.

### A mobile menu

```tsx
function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <span className="font-bold">Brand</span>

        <ul className="hidden gap-6 md:flex">
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
        </ul>

        <button
          className="md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {open && (
        <ul id="mobile-menu" className="space-y-2 px-4 pb-4 md:hidden">
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
        </ul>
      )}
    </header>
  );
}
```

The state from Lesson 04 and the classes from Lesson 07 working together.

---

## 4. Responsive images and media

```tsx
<img className="h-auto w-full rounded-lg object-cover" src="..." alt="..." />
<div className="aspect-video w-full"> ... </div>
```

- `w-full h-auto` scales with the container
- `aspect-video`, `aspect-square` keep the proportions
- `object-cover` crops without distortion

Add `<meta name="viewport" content="width=device-width, initial-scale=1" />` in `index.html`. Vite's template already includes it. Without it, phones pretend to be wider than they are.

---

## 5. Dark mode

Add `dark:` to any utility to override it in dark mode:

```tsx
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
```

By default, `dark:` follows the operating system setting (`prefers-color-scheme`). For a **toggle button**, you control it with a class. In Tailwind v4, add this to your CSS:

```css
@import 'tailwindcss';

@custom-variant dark (&:where(.dark, .dark *));
```

Now `dark:` applies whenever an ancestor (usually `<html>`) has the `dark` class.

---

## 6. A theme toggle (light, dark, system)

```tsx
type Theme = 'light' | 'dark' | 'system';

function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', isDark);
}
```

A hook to store and apply it:

```tsx
function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme };
}
```

Notes:

- The initial value uses a function (`useState(() => ...)`), which runs only once. This is called a *lazy initializer*.
- We **validate** what we read from `localStorage`, because it's outside data (Lesson 03: types vanish at runtime).
- `useEffect` is "run code after render". We cover it properly in Lesson 10. For now: it syncs the page with the state.
- If the user chooses `system`, you should also listen to the OS changing (`matchMedia(...).addEventListener('change', ...)`). It's a good stretch goal.

### Avoiding the flash

If the theme is applied only after React loads, users with dark mode see a white flash. Fix it with a tiny inline script in `index.html` `<head>`, before your app loads:

```html
<script>
  const saved = localStorage.getItem('theme');
  const dark = saved === 'dark' ||
    (saved !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
</script>
```

---

## 7. Semantic color tokens

Writing `bg-white dark:bg-gray-900` everywhere is repetitive and easy to get wrong. Define **meaning-based** colors once, using CSS variables:

```css
@import 'tailwindcss';
@custom-variant dark (&:where(.dark, .dark *));

:root {
  --background: #ffffff;
  --foreground: #111827;
  --muted: #6b7280;
  --card: #f9fafb;
  --border: #e5e7eb;
}

.dark {
  --background: #0b0f19;
  --foreground: #f3f4f6;
  --muted: #9ca3af;
  --card: #111827;
  --border: #1f2937;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-card: var(--card);
  --color-border: var(--border);
}
```

Now you write `bg-background text-foreground border-border` and it adapts automatically, with **no `dark:` needed** for those colors. Keep `dark:` for the one-off exceptions. This is how design systems (like shadcn/ui) do theming, and it's what Lesson 09 builds on.

---

## 8. Dark mode design tips

- Don't just invert colors. Pure white text on pure black is harsh. Use off-whites and very dark grays.
- Lower the saturation of bright brand colors on dark backgrounds.
- Shadows barely show on dark backgrounds. Use borders or lighter surfaces to show depth.
- Check contrast in both themes (at least 4.5:1 for body text).
- Images with white backgrounds can glow. Consider `dark:brightness-90` or transparent PNGs.
- Set `color-scheme` so the browser styles scrollbars and form controls: `html.dark { color-scheme: dark; }`.

---

## 9. Testing responsive layouts

- Open DevTools and use **device mode** (Ctrl+Shift+M). Test 360px, 768px, and 1280px.
- Drag the window slowly and watch for places where the layout breaks *between* breakpoints.
- Look for horizontal scrollbars. They almost always mean something is too wide.
- Test with real text length. Long words and names break layouts that look fine with sample data.
- Try zooming to 200%. This is an accessibility requirement, too.
- Emulate dark mode in DevTools: Rendering panel, "Emulate CSS media feature prefers-color-scheme".
- Test touch targets: buttons should be at least about 44px tall on phones.

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| Thinking `sm:` means "only small screens" | Layout is wrong on phones |
| Designing desktop first, then patching mobile with `max-*` | Hard to maintain. Go mobile-first |
| `dark:` doing nothing when using a toggle | Missing `@custom-variant dark` (v4) or the `dark` class on `<html>` |
| Reading `localStorage` without validating | A bad value breaks the theme |
| Applying the theme only after React mounts | A white flash on load |
| Hiding the menu only visually while it's still focusable | Keyboard users tab into invisible links. Use `hidden` or don't render it |
| Fixed widths (`w-[500px]`) | Horizontal scroll on phones. Prefer `max-w-*` and `w-full` |
| Forgetting `aria-expanded` on menu buttons | Screen readers can't tell if the menu is open |
| Different content in light and dark | Users get confused. Only change presentation |

---

## Key takeaways

- Tailwind is mobile-first. Unprefixed = all sizes, `md:` = `md` and up.
- Build the phone layout first, then use `sm:` `md:` `lg:` to adapt.
- `hidden md:flex` and `md:hidden` swap between mobile and desktop UI.
- In v4, enable class-based dark mode with `@custom-variant dark`, then toggle the `dark` class on `<html>`.
- Save the user's choice in `localStorage` (validated), and apply it before React loads to avoid a flash.
- Semantic tokens (`bg-background`, `text-foreground`) make theming simple and consistent.
- Test with DevTools device mode, real content, and both color schemes.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to [Lesson 09: Component variants](../09-component-variants/README.md).
