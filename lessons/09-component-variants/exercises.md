# Lesson 09: Exercises

Do these in a scratch Vite project with Tailwind installed (see Lesson 07), plus `clsx`, `tailwind-merge`, and `class-variance-authority`. Try each one **before** reading the answer.

---

## Exercise 1: Predict the output

What does each call return?

```ts
clsx('a', false && 'b', null, undefined, 'c');
clsx({ x: true, y: false, z: 1 });
clsx(['a', ['b', 0 && 'c']]);
twMerge('p-2 p-4');
twMerge('text-sm text-lg font-bold');
twMerge('bg-red-500 hover:bg-red-600', 'bg-blue-500');
```

<details>
<summary>Answers</summary>

- `'a c'`
- `'x z'`
- `'a b'` (the `0` is falsy and ignored)
- `'p-4'`
- `'text-lg font-bold'`
- `'hover:bg-red-600 bg-blue-500'` (only the same-variant conflict is resolved, so `hover:` stays)
</details>

---

## Exercise 2: Build `cn()`

Create `src/lib/cn.ts` from scratch (without copying it from the lesson). Then write a tiny test component that proves two things:

1. falsy values are skipped
2. a later `px-8` beats an earlier `px-4`

---

## Exercise 3: Refactor a messy button

Rewrite this with `cva` and `VariantProps`. Keep the behavior identical.

```tsx
function Button({ kind, big, children }: { kind: 'solid' | 'outline'; big?: boolean; children: React.ReactNode }) {
  return (
    <button
      className={`rounded-lg font-medium ${kind === 'solid' ? 'bg-indigo-600 text-white' : 'border border-indigo-600 text-indigo-600'} ${big ? 'px-6 py-3 text-lg' : 'px-4 py-2 text-sm'}`}
    >
      {children}
    </button>
  );
}
```

Then answer: what did you gain? What happens now if you write `<Button kind="solid" big="yes">`?

---

## Exercise 4: Safe overrides

Create a `Button` using `cn()`. Then test:

```tsx
<Button className="w-full">Wide</Button>
<Button className="px-10">Extra padding</Button>
<Button className="bg-green-600 hover:bg-green-500">Custom colors</Button>
```

1. Confirm all three work.
2. Now temporarily replace `cn` with plain string concatenation. Which of them break?
3. Switch `className` to the **start** of the `cn()` call instead of the end. What changes?

<details>
<summary>Answer</summary>

Without `twMerge`, conflicting classes (like `px-4` and `px-10`) both stay in the string, and the one declared later in the generated CSS wins, which may not be yours. With `className` first, the component's own classes override the caller's. The caller's should always come last.
</details>

---

## Exercise 5: A Badge with tones

Create a `Badge` with `tone: 'neutral' | 'success' | 'warning' | 'danger'` and `size: 'sm' | 'md'`.

1. Add `defaultVariants`.
2. Add a compound variant: `danger` + `md` gets a bold font.
3. Render all 8 combinations in a grid.
4. Make it work in dark mode.

---

## Exercise 6: Input and field

Build `Input` (with the `invalid` prop and `aria-invalid`) and a `Field` component that groups a `Label`, an `Input`, and an optional error message. Use `useId()` to link them.

Test with: a normal input, a disabled input, an invalid input with an error, and an input with a `className="max-w-xs"` override.

---

## Exercise 7: Card family

Create `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter` (all accepting their native element's props and a `className`).

Compose a pricing card and a profile card using the **same** parts with different layouts.

---

## Exercise 8: Link that looks like a button

Export `buttonStyles` from your Button file and use it on:

1. an `<a href="...">`
2. a React Router `Link` (just think about how, since routing comes in Lesson 14)

Why is this better than wrapping an `<a>` inside a `<button>`?

<details>
<summary>Answer</summary>

Nesting interactive elements is invalid HTML and breaks keyboard and screen reader behavior. Sharing the *styles* gives you the same look while keeping the correct element.
</details>

---

## Exercise 9: Showcase page

Create a `/showcase` section (a simple component for now) that displays every variant of `Button`, `Badge`, `Input`, and `Card` in a labeled grid. Add a theme toggle (from Lesson 08) and check every component in light and dark.

---

## Check yourself

You're ready for the project if you can answer these without looking:

- What problem does `clsx` solve? And `tailwind-merge`?
- What does `cn()` do, and why is `className` passed last?
- What are `variants`, `defaultVariants`, and `compoundVariants` in `cva`?
- What does `VariantProps<typeof buttonStyles>` give you?
- Why spread `...props` onto the native element?
- Why prefer one `variant` prop over several booleans?
- Why shouldn't you build Tailwind classes from string pieces?
- Why export the `cva` function as well as the component?
