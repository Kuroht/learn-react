# Lesson 03: Props and TypeScript Basics

**Goal:** get comfortable describing data with TypeScript types, and use them to build components that are flexible, reusable, and hard to misuse.

**Time:** about 2 to 3 hours

**Prerequisite:** [Lesson 02](../02-jsx-and-components/README.md)

> **Last verified:** October 2026, with React 19 and TypeScript. Check the [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/intro.html) and [react.dev/learn](https://react.dev/learn) if anything here doesn't match what you see.

---

## What you will learn

- What TypeScript does for you and what it doesn't
- Basic types: `string`, `number`, `boolean`, arrays, and objects
- Type aliases (`type`) and when to use `interface`
- Union types and literal types for "one of these values"
- Optional props and default values
- Typing function props (callbacks)
- Typing `children`
- Passing objects and arrays as props
- Rendering a list with `.map()` (a first look)
- Props that extend native HTML props

---

## 1. Why TypeScript?

JavaScript doesn't tell you when you pass the wrong thing to a component. You find out when the page breaks. TypeScript checks your code **while you write it** and underlines mistakes in your editor.

```tsx
type PriceProps = { amount: number };

function Price({ amount }: PriceProps) {
  return <p>{amount.toFixed(2)}</p>;
}

<Price amount="12" />  // red squiggle: string is not assignable to number
```

Two things to remember:

- Types exist **only while you write and build**. They disappear in the final JavaScript. So TypeScript can't protect you from bad data that arrives *at runtime* (like a response from an API). That's why Zod exists, which we meet in Lesson 16.
- You don't have to type everything. TypeScript **infers** types when it can:

```tsx
const name = 'Nathan';      // TypeScript knows this is a string
const age = 30;             // number
const isOnline = true;      // boolean
```

You mainly write types in two places: **props** and **data that comes from outside** your component.

---

## 2. Basic types

```ts
let name: string = 'Nathan';
let age: number = 30;
let isOnline: boolean = true;
```

### Arrays

```ts
let tags: string[] = ['react', 'typescript'];
let scores: number[] = [10, 20, 30];
```

### Objects

```ts
let user: { name: string; age: number } = { name: 'Nathan', age: 30 };
```

Writing object types inline gets long quickly, so we give them names.

---

## 3. `type` aliases

```ts
type User = {
  name: string;
  age: number;
};

const user: User = { name: 'Nathan', age: 30 };
```

A `type` alias is just a name for a shape. Use it for props and for data.

### `type` or `interface`?

Both describe object shapes and they're almost interchangeable:

```ts
interface User {
  name: string;
  age: number;
}
```

In this repo we use **`type`** for everything, because it also works for unions (next section) and keeps things consistent. You'll see `interface` in other people's code, and it's fine.

---

## 4. Union and literal types

A **union** says "one of these":

```ts
type Id = string | number;
```

A **literal type** is an exact value. Combine them to list the allowed options:

```ts
type Size = 'small' | 'medium' | 'large';

let size: Size = 'medium';  // ok
size = 'huge';              // error: not one of the options
```

This is perfect for props like variants, because typos become errors and your editor autocompletes the options:

```tsx
type ButtonProps = {
  label: string;
  variant: 'primary' | 'secondary' | 'danger';
};

<Button label="Delete" variant="danger" />   // ok
<Button label="Delete" variant="dangerous" /> // error
```

Prefer this over a plain `string` whenever the choices are limited.

---

## 5. Optional props and defaults

A `?` makes a prop optional. Its value is then `T | undefined`.

```tsx
type AvatarProps = {
  src: string;
  size?: number;
};

function Avatar({ src, size = 48 }: AvatarProps) {
  return <img src={src} width={size} height={size} alt="" />;
}

<Avatar src="/me.png" />            // size is 48
<Avatar src="/me.png" size={96} />  // size is 96
```

Use a default value in the destructuring (`size = 48`) so the rest of your component can treat it as always present.

---

## 6. Objects and arrays as props

You can pass a whole object:

```tsx
type Product = {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
};

type ProductCardProps = {
  product: Product;
};

function ProductCard({ product }: ProductCardProps) {
  return (
    <article>
      <h2>{product.name}</h2>
      <p>{product.price}</p>
    </article>
  );
}

<ProductCard product={{ id: 1, name: 'Mug', price: 9.9, inStock: true }} />;
```

**When to pass an object vs separate props?** If the component is *about* that thing (a product card shows a product), pass the object. If it only needs one or two values (an avatar needs a URL), pass those values. It keeps components easy to reuse.

### Rendering a list (first look)

To show many products, loop over the array with `.map()` and give every item a unique `key`:

```tsx
const products: Product[] = [
  { id: 1, name: 'Mug', price: 9.9, inStock: true },
  { id: 2, name: 'Poster', price: 14.5, inStock: false },
];

function ProductGrid() {
  return (
    <section>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  );
}
```

Notes:

- `.map()` turns each item in an array into JSX.
- The `key` lets React tell items apart. Use a stable unique value, like an `id`. Don't use the array index if the list can change order.
- `key` is used by React itself and isn't passed to your component as a prop.

We'll go deeper in Lesson 06.

---

## 7. Function props (callbacks)

Props can be functions. This is how a child **tells its parent** that something happened:

```tsx
type ProductCardProps = {
  product: Product;
  onAddToCart: (id: number) => void;
};

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <article>
      <h2>{product.name}</h2>
      <button onClick={() => onAddToCart(product.id)}>Add to cart</button>
    </article>
  );
}

<ProductCard
  product={product}
  onAddToCart={(id) => console.log('Added', id)}
/>;
```

Read the type `(id: number) => void` as: "a function that takes a number called `id` and returns nothing".

Convention: props that receive functions start with `on` (`onAddToCart`, `onClose`), and the functions you write to handle events start with `handle`.

The flow is: data goes **down** through props, and events go **up** through callbacks. In Lesson 04 you'll connect this to state.

---

## 8. Typing `children`

```tsx
import type { ReactNode } from 'react';

type PanelProps = {
  title: string;
  children: ReactNode;
};

function Panel({ title, children }: PanelProps) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
```

`ReactNode` means "anything React can render" (text, elements, arrays, `null`).

---

## 9. Extending native HTML props

When you wrap a native element like `<button>`, you usually want to accept all of its normal props (`disabled`, `onClick`, `type`, `aria-label`...) without typing each one:

```tsx
type ButtonProps = React.ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
};

function Button({ variant = 'primary', children, ...rest }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} {...rest}>
      {children}
    </button>
  );
}

<Button variant="secondary" disabled onClick={() => console.log('hi')}>
  Save
</Button>;
```

What's happening:

- `React.ComponentProps<'button'>` is every prop a `<button>` accepts.
- `&` **combines** two types: the native props *and* your own `variant`.
- `...rest` collects everything that's left over, and `{...rest}` hands it down to the real `<button>`.

You'll use this pattern a lot when you build your own design system (Lesson 09).

---

## 10. Reading TypeScript errors

Errors look scary but follow a pattern. Read them from the **bottom** up, because the last line is usually the most specific:

```
Type 'string' is not assignable to type 'number'.
```

means: "you gave me text, I wanted a number". And:

```
Property 'price' is missing in type '{ id: number; name: string }' but required in type 'Product'.
```

means: "you forgot a required field".

Habits that help:

- Hover over a red squiggle in VS Code to read the message.
- Hover over a variable to see the type TypeScript inferred.
- Run `npm run build` to see **all** type errors at once.

### Please avoid `any`

`any` turns type checking off for that value. It "fixes" an error by hiding it. If you don't know the type, use `unknown` and narrow it, or ask the group. This repo's lint rules flag `any`.

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| `price="9.9"` for a `number` prop | Error: string is not assignable to number. Use `price={9.9}` |
| Forgetting `key` in a `.map()` | Console warning from React |
| `key={index}` on a list that can reorder | Subtle bugs when items change |
| Using `string` for a limited set of options | Typos aren't caught, no autocomplete |
| Typing `onClick` as `Function` | Too vague. Write the real signature, like `() => void` |
| Using `any` to silence an error | Hides the bug instead of fixing it |
| Mutating a prop (`product.price = 5`) | Props are read-only. Never change them |

---

## Key takeaways

- TypeScript checks your code as you write, and the types are removed at build time.
- Let TypeScript infer when it can. Write types for props and for outside data.
- Use `type` to name shapes, and unions of literals for "one of these".
- `?` makes a prop optional, and a default in the destructuring gives it a value.
- Pass objects when the component is about that object, otherwise pass individual values.
- Function props (`onSomething`) let children notify their parents.
- `React.ComponentProps<'button'>` plus `&` extends native element props.
- Don't use `any`.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to Lesson 04: State with `useState`.
