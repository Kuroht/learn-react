# Lesson 03: Exercises

Do these in a scratch Vite project or on a practice branch. Try each one **before** reading the answer.

---

## Exercise 1: Read the type

For each type, write two valid values and one invalid value:

```ts
type A = string[];
type B = { title: string; done: boolean };
type C = 'on' | 'off';
type D = number | null;
```

<details>
<summary>Example answers</summary>

- `A`: valid `['a', 'b']`, `[]`. Invalid `[1, 2]`.
- `B`: valid `{ title: 'Buy milk', done: false }`. Invalid `{ title: 'Buy milk' }` (missing `done`).
- `C`: valid `'on'`, `'off'`. Invalid `'ON'` (case matters) or `'maybe'`.
- `D`: valid `5`, `null`. Invalid `'5'`, or `undefined` (not part of the union).
</details>

---

## Exercise 2: Fix the errors

Each snippet has a TypeScript error. Say what's wrong, then fix it.

```tsx
// a
type TagProps = { label: string };
<Tag label={42} />

// b
type ProductProps = { name: string; price: number };
<Product name="Mug" />

// c
type Size = 'small' | 'large';
const size: Size = 'Large';

// d
type CardProps = { title: string };
<Card title="Hi" subtitle="There" />
```

<details>
<summary>Answers</summary>

- a) `42` is a number, but `label` needs a string. Use `label="42"` or `label={String(42)}`.
- b) `price` is required and missing. Add `price={9.9}`.
- c) Case matters: it must be `'large'`.
- d) `subtitle` isn't in `CardProps`. Add `subtitle?: string` to the type, or remove it.
</details>

---

## Exercise 3: Variants with a union

Create a `Alert` component with:

- `message` (string, required)
- `type` (`'info' | 'success' | 'warning' | 'error'`, default `'info'`)

It should render the message in a `<div>` with a class based on the type (`alert alert-info`, and so on). Use it four times, once per type.

Then try `type="danger"` and read the error. What does your editor suggest?

---

## Exercise 4: An object prop

1. Define a `type Movie = { id: number; title: string; year: number; rating: number }`.
2. Create `MovieCard` that takes a `movie: Movie` prop and shows the title, the year, and the rating.
3. Render three movies.
4. Now change `rating` in your type to be optional (`rating?: number`). What breaks? Fix the component so it shows "Not rated" when there's no rating.

---

## Exercise 5: A list with `.map()`

Given:

```tsx
const movies: Movie[] = [
  { id: 1, title: 'Spirited Away', year: 2001, rating: 8.6 },
  { id: 2, title: 'Your Name', year: 2016, rating: 8.4 },
  { id: 3, title: 'Akira', year: 1988, rating: 8.0 },
];
```

1. Render all three with `.map()` and `MovieCard`.
2. Remove the `key` and read the warning in the browser console.
3. Add a `key` using `movie.id`.
4. **Question:** Why is `movie.id` a better key than the array index?

---

## Exercise 6: A callback prop

Create a `LikeButton` component with:

- `label` (string)
- `onLike` (a function that takes no arguments and returns nothing)

Clicking the button should call `onLike`. In the parent, pass `onLike={() => console.log('liked!')}` and check the browser console.

Then change `onLike` so it receives the label: `(label: string) => void`. Update the component to call `onLike(label)` and the parent to log the label.

---

## Exercise 7: Extend a native element

Create a `TextInput` component that:

- accepts every normal `<input>` prop (`placeholder`, `value`, `onChange`, `disabled`, ...)
- adds one extra required prop: `label: string`
- renders a `<label>` and the `<input>` together

Hint: `React.ComponentProps<'input'> & { label: string }`, and use `...rest`.

Use it with `placeholder="Your name"` and `disabled`, and confirm both reach the real input (inspect it in DevTools).

---

## Exercise 8: Think about the design

You're building a `ProductCard` for an online shop. Decide for each piece of data whether it should be a **required prop**, an **optional prop**, or a **union type**, and write the `ProductCardProps` type:

- name
- price
- image URL
- badge (nothing, "New", "Sale", or "Sold out")
- whether it's in stock
- a function called when "Add to cart" is clicked

Compare your answer with the `Product` type you'll use in the project.

---

## Check yourself

You're ready for the project if you can answer these without looking:

- When do you need to write a type yourself, and when can TypeScript infer it?
- What does `'a' | 'b'` mean, and why is it better than `string` for a variant prop?
- What does the `?` in `size?: number` do?
- How do you type a function prop that takes a number and returns nothing?
- Why does each item in a `.map()` need a `key`?
- What does `&` do in `React.ComponentProps<'button'> & { variant: string }`?
- Why shouldn't you use `any`?
