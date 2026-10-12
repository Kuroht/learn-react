# Lesson 03 Project: Reusable Product Card Grid

Build a grid of product cards from typed data. You'll define a `Product` type, build a flexible `ProductCard`, render a list from an array, and add variants and a callback.

> **Last verified:** October 2026. Check [react.dev/learn/installation](https://react.dev/learn/installation) for the current way to start a project.

---

## Brief

A small shop front page: a title, and a responsive grid of product cards. Each card shows an image, a name, a price, and an "Add to cart" button, with an optional badge ("New", "Sale") and an out-of-stock state.

The point of this project isn't the shop. It's to practice **typing props well** so the components are hard to misuse.

Every stage ends with a **checkpoint**: something you should see in the browser.

---

## Getting started

```bash
cd lessons/03-props-and-typescript/project
npm create vite@latest starter -- --template react-ts
cd starter
npm install
npm run dev
```

Then clear the template code as you did in Lessons 01 and 02 (empty `App.tsx`, `App.css`, and `index.css`, and remove the old imports).

Work in your own branch: `git checkout -b yourname/lesson-03`

---

## Stage 1: Define the data

Goal: describe a product with a type, and create sample data.

1. Create `src/types.ts`:

   ```ts
   export type Product = {
     id: number;
     name: string;
     price: number;
     imageUrl: string;
     inStock: boolean;
     badge?: 'new' | 'sale';
   };
   ```

2. Create `src/data/products.ts` with an array of at least **six** products of type `Product[]`. Make sure at least one has `badge: 'new'`, one has `badge: 'sale'`, and one has `inStock: false`.

   Use any image URLs, or put a few small images in `public/` and use paths like `/mug.png`.

- [ ] A `Product` type exported from `src/types.ts`
- [ ] Six or more products in `src/data/products.ts`
- [ ] Try removing a required field from one product and read the error, then put it back

**Checkpoint:** no TypeScript errors in your editor.

---

## Stage 2: One card

Goal: a typed `ProductCard` that shows a single product.

Create `src/components/ProductCard.tsx`:

```tsx
import type { Product } from '../types';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  // return JSX that shows the image, name, and price
}
```

- [ ] Show the image (with a proper `alt`), the name, and the price
- [ ] Format the price as currency, for example:
  `new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' }).format(product.price)`
- [ ] Render **one** card in `App.tsx` using the first product

**Checkpoint:** one card appears on the page.

---

## Stage 3: Render the grid

Goal: show all the products with `.map()`.

1. Create `src/components/ProductGrid.tsx` that takes a `products: Product[]` prop.
2. Use `.map()` to render a `ProductCard` for each one, with `key={product.id}`.
3. Use `ProductGrid` in `App.tsx`.
4. Style it with CSS grid:

   ```css
   .grid {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
     gap: 1rem;
   }
   ```

- [ ] A grid that wraps onto new rows as the window gets narrower
- [ ] No `key` warnings in the console

**Checkpoint:** all products appear in a responsive grid.

---

## Stage 4: Badges and stock

Goal: use the optional and union fields.

- [ ] If `product.badge` exists, show a small label ("New" or "Sale") on the card. Use `&&`.
- [ ] Give the badge a different style per value. Make the class name come from the badge value.
- [ ] If `inStock` is `false`, grey the card out and show "Sold out" instead of the button.

**Checkpoint:** you can see all three states: normal, with a badge, and sold out.

---

## Stage 5: A callback prop

Goal: let the parent decide what happens when someone clicks "Add to cart".

1. Add `onAddToCart: (id: number) => void` to `ProductCardProps`.
2. Pass it down from `ProductGrid` (so `ProductGrid` needs the same prop), and from `App.tsx`.
3. In `App.tsx`, implement it with a `console.log` for now:

   ```tsx
   function handleAddToCart(id: number) {
     console.log('Added product', id);
   }
   ```

- [ ] Clicking "Add to cart" logs the product id
- [ ] TypeScript complains if you forget to pass `onAddToCart` anywhere

Notice how the callback is passed through two levels (`App` → `ProductGrid` → `ProductCard`). In Lessons 04 and 12 you'll learn better ways to share state and actions.

**Checkpoint:** the console shows the right ids.

---

## Stage 6: A reusable `Button`

Goal: extend a native element's props.

1. Create `src/components/Button.tsx`:

   ```tsx
   type ButtonProps = React.ComponentProps<'button'> & {
     variant?: 'primary' | 'secondary';
   };
   ```

2. Render a `<button>` that applies a class from `variant` and passes the rest of the props through with `...rest`.
3. Use it for the "Add to cart" button in `ProductCard`. Pass `disabled` when the product is out of stock.

- [ ] `Button` accepts `disabled`, `onClick`, and other native props with no extra typing
- [ ] `variant` autocompletes in your editor

**Checkpoint:** the same `Button` works in the card, and you could use it anywhere else.

---

## Stage 7: Check your work

```bash
npm run build
npm run lint
```

Both should pass with no errors. Search your code for `any`. There should be none.

---

## Requirements checklist

**Must have**

- [ ] `Product` type in `src/types.ts`, with an optional `badge` using a union type
- [ ] At least six products as typed data
- [ ] `ProductCard`, `ProductGrid`, and `Button` components, each with typed props
- [ ] Grid rendered with `.map()` and correct `key`s
- [ ] Badge shown only when it exists, and a sold-out state
- [ ] `onAddToCart` callback passed down from `App`
- [ ] No `any`
- [ ] `npm run build` and `npm run lint` pass

**Nice to have**

- [ ] A `variant` union on `ProductCard` itself (for example `'compact' | 'detailed'`)
- [ ] A simple text filter (you'll make this interactive in Lesson 04)
- [ ] Prices shown with a strikethrough original price for items on sale (add an optional `originalPrice?: number`)
- [ ] A responsive layout tested at phone width

---

## Hints

<details>
<summary>How do I make a class name from the badge value?</summary>

Use a template string:

```tsx
{product.badge && (
  <span className={`badge badge-${product.badge}`}>
    {product.badge === 'new' ? 'New' : 'Sale'}
  </span>
)}
```

Then style `.badge-new` and `.badge-sale` in CSS.
</details>

<details>
<summary>TypeScript says my imported type can't be found</summary>

Check the path: from `src/components/ProductCard.tsx` the types file is at `../types`. Also make sure the type is exported (`export type Product = ...`) and imported with `import type { Product } from '../types'`.
</details>

<details>
<summary>I get "Property 'children' does not exist"</summary>

If you typed your own props and use `children`, add `children: ReactNode` to the type. With `React.ComponentProps<'button'>` you get `children` automatically.
</details>

<details>
<summary>The images don't load</summary>

Files in `public/` are served from the root, so use `/mug.png`, not `./mug.png` or `public/mug.png`. For online images, make sure the URL opens in a browser tab.
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per stage.
3. Push and open a pull request titled `Lesson 03: yourname`.
4. Ask a friend to review it. A good review asks: could I misuse these components in a way TypeScript doesn't catch?

---

## Done when

- `npm run dev` shows the grid with badges and sold-out states
- `npm run build` and `npm run lint` pass
- There are no `any`s
- Your PR is open and a friend has reviewed it

Next up: **Lesson 04: State with `useState`**.
