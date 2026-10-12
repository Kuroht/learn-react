# Lesson 09: Component Variants (`cva`, `clsx`)

**Goal:** build a small, reusable design system. You'll manage conditional classes with `clsx`, resolve class conflicts with `tailwind-merge`, and define typed variants with `class-variance-authority` (`cva`).

**Time:** about 2 to 3 hours

**Prerequisite:** [Lesson 08](../08-responsive-and-dark-mode/README.md)

> **Last verified:** October 2026. These libraries are small and stable, but check [cva.style](https://cva.style/docs), [github.com/lukeed/clsx](https://github.com/lukeed/clsx), and [github.com/dcastil/tailwind-merge](https://github.com/dcastil/tailwind-merge) if anything here doesn't match what you see.

---

## What you will learn

- Why template-literal class names get messy
- `clsx` for conditional classes
- `tailwind-merge` for resolving conflicting utilities
- A `cn()` helper that combines both
- `cva` for components with variants (`variant`, `size`, ...)
- Deriving prop types with `VariantProps`
- Letting callers add their own `className` safely
- Building `Button`, `Badge`, `Card`, and `Input` components
- Accessibility basics for design-system components
- Composition: components made of smaller parts

---

## 1. The problem

By now you've written things like this:

```tsx
<button
  className={`rounded px-4 py-2 font-medium ${
    variant === 'primary'
      ? 'bg-blue-600 text-white'
      : variant === 'danger'
        ? 'bg-red-600 text-white'
        : 'border border-gray-300'
  } ${size === 'sm' ? 'text-sm' : 'text-base'} ${disabled ? 'opacity-50' : ''}`}
>
```

It works, but it's hard to read, easy to get wrong (a missing space, a stray `undefined` in the string), and every new variant makes it worse.

---

## 2. `clsx`: conditional classes

```bash
npm install clsx
```

```tsx
import clsx from 'clsx';

clsx('px-4 py-2', isActive && 'bg-blue-600', isDisabled && 'opacity-50');
// 'px-4 py-2 bg-blue-600'   (if isActive is true and isDisabled is false)
```

`clsx` accepts strings, conditionals (`false`, `null`, and `undefined` are ignored), objects, and arrays:

```tsx
clsx('base', { 'font-bold': isBold, 'italic': isItalic });
clsx(['a', ['b', cond && 'c']]);
```

It just builds a clean string. No more worrying about spaces.

---

## 3. `tailwind-merge`: conflicting classes

Remember: with `p-2 p-4`, the winner depends on the **CSS order in the stylesheet**, not the order you wrote them. That's a problem when a component has default classes and the caller wants to override them:

```tsx
<Button className="px-8" />   // the Button already has px-4. Which wins?
```

`tailwind-merge` knows Tailwind and keeps the **last** conflicting class:

```bash
npm install tailwind-merge
```

```tsx
import { twMerge } from 'tailwind-merge';

twMerge('px-4 py-2', 'px-8');           // 'py-2 px-8'
twMerge('bg-red-500', 'bg-blue-500');   // 'bg-blue-500'
twMerge('text-sm', 'text-red-500');     // 'text-sm text-red-500'  (not a conflict)
```

---

## 4. The `cn()` helper

Almost every Tailwind + React project defines this tiny helper. Put it in `src/lib/cn.ts`:

```ts
import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

`clsx` builds the string from conditions, then `twMerge` removes the losers of any conflict. You'll use `cn()` everywhere:

```tsx
<div className={cn('rounded-lg p-4', isError && 'border-red-500', className)} />
```

---

## 5. `cva`: variants as data

```bash
npm install class-variance-authority
```

`cva` lets you describe a component's styles as a **base** plus **variants**:

```tsx
import { cva } from 'class-variance-authority';

const buttonStyles = cva(
  // base classes, always applied
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand-600 text-white hover:bg-brand-500 focus-visible:outline-brand-600',
        secondary: 'border border-border bg-transparent hover:bg-card',
        danger: 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600',
        ghost: 'hover:bg-card',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

buttonStyles({ variant: 'danger', size: 'lg' }); // returns the class string
buttonStyles();                                  // primary + md
```

Benefits:

- Every variant is listed in one place, so it's easy to review and to extend
- Defaults are explicit
- No nested ternaries
- It's fully typed

### Compound variants

When a combination needs extra styles:

```tsx
compoundVariants: [
  { variant: 'primary', size: 'lg', class: 'shadow-lg' },
],
```

---

## 6. Typing with `VariantProps`

`cva` can generate the TypeScript types for you:

```tsx
import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '../lib/cn';

type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonStyles>;

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(buttonStyles({ variant, size }), className)} {...props} />;
}
```

What you get for free:

- `variant` is typed `'primary' | 'secondary' | 'danger' | 'ghost' | null | undefined`
- Autocomplete in the editor
- A compile error if you pass `variant="huge"`
- Add a new variant in `cva`, and the prop type updates itself

Using it:

```tsx
<Button>Save</Button>
<Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
<Button className="w-full">Full width (overrides safely)</Button>
```

Passing `className` **last** into `cn()` lets callers override default classes, thanks to `twMerge`.

> In React 19, `ref` is a normal prop for function components, so with `ComponentProps<'button'>` you get `ref` support without `forwardRef`.

---

## 7. More components

### Badge

```tsx
const badgeStyles = cva('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', {
  variants: {
    tone: {
      neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      success: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      danger: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeStyles>;

export function Badge({ tone, className, ...props }: BadgeProps) {
  return <span className={cn(badgeStyles({ tone }), className)} {...props} />;
}
```

### Input

An input has state-based styling, like an error. Use a boolean variant or a plain prop:

```tsx
type InputProps = ComponentProps<'input'> & { invalid?: boolean };

export function Input({ invalid, className, ...props }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        'h-10 w-full rounded-lg border bg-background px-3 text-sm placeholder:text-muted',
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600',
        'disabled:cursor-not-allowed disabled:opacity-50',
        invalid ? 'border-red-500' : 'border-border',
        className,
      )}
      {...props}
    />
  );
}
```

Wiring `aria-invalid` to the same prop as the styling keeps the visuals and accessibility in sync.

---

## 8. Composition: Card and its parts

Instead of one giant `Card` with 12 props, make small pieces that fit together:

```tsx
export function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('rounded-xl border border-border bg-card p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  return <h3 className={cn('text-lg font-semibold', className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('mt-1 text-sm text-muted', className)} {...props} />;
}
```

Usage:

```tsx
<Card>
  <CardTitle>Pro plan</CardTitle>
  <CardDescription>Everything you need to grow.</CardDescription>
  <Button className="mt-4">Upgrade</Button>
</Card>
```

The caller decides the structure. This is the "compound component" idea used by libraries like shadcn/ui.

---

## 9. Design-system habits

- **Use the HTML element that fits.** A `Button` renders a `<button>`. If you need a link that looks like a button, apply `buttonStyles()` to an `<a>`:

  ```tsx
  <a className={buttonStyles({ variant: 'secondary' })} href="/docs">Docs</a>
  ```

  That's one reason to export the `cva` function itself.

- **Limit variants.** If a component has 15 variants, it's two components. Aim for a few meaningful ones.
- **Use tokens, not raw colors.** Use `bg-brand-600`, `border-border`. That way dark mode and rebranding work automatically (Lesson 08).
- **Keep states accessible:** focus rings, disabled styles, `aria-*` attributes, and a minimum click size.
- **Document with a showcase page.** Make a route or section that renders every variant of every component. It's your visual test and your documentation (a mini Storybook).
- **File layout:** put them in `src/components/ui/` (one file per component), each exporting the component and its `cva` styles. Features import from `ui/`.

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| Skipping `twMerge` | A caller's `className` sometimes doesn't override defaults |
| Putting `className` **before** the variant classes in `cn()` | The defaults win over the caller's classes |
| Not spreading `...props` | `onClick`, `disabled`, `aria-*` are silently lost |
| Building class names from pieces | Tailwind can't see them (`bg-${tone}-100`). Use full strings in `cva` |
| Hard-coding colors in components | Dark mode and rebranding become painful |
| Too many boolean props (`isPrimary`, `isDanger`, ...) | Contradictory combinations. Use one `variant` union |
| Forgetting the `defaultVariants` | Components look unstyled when a prop is omitted |
| Importing `cva` styles but not `VariantProps` | You hand-write types that drift from the real variants |
| Using a `div` with `onClick` instead of a `button` | No keyboard support, no accessibility |

---

## Key takeaways

- `clsx` builds class strings from conditions. `tailwind-merge` resolves conflicts. `cn()` combines both.
- `cva` describes a component's base and variants as data, with defaults.
- `VariantProps<typeof styles>` derives your prop types, so they can't go out of sync.
- Always accept and merge a `className` prop, with the caller's last.
- Spread the remaining native props so the component behaves like the element it wraps.
- Compose small parts (`Card`, `CardTitle`) instead of one component with endless props.
- Build a showcase page to see and test every variant.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to Module 3 with Lesson 10: `useEffect` and side effects.
