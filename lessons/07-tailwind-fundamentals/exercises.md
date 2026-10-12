# Lesson 07: Exercises

Do these in a scratch Vite project with Tailwind installed, or on a practice branch. Try each one **before** reading the answer. Keep the [Tailwind docs](https://tailwindcss.com/docs) open and search for what you need.

---

## Exercise 1: Translate the CSS

Write the Tailwind classes that match this CSS:

```css
.box {
  padding: 1.5rem;
  margin-top: 1rem;
  border-radius: 0.5rem;
  background: #f3f4f6;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}
```

<details>
<summary>Answer</summary>

`p-6 mt-4 rounded-lg bg-gray-100 text-lg font-semibold text-gray-900`
</details>

---

## Exercise 2: Fix the classes

What's wrong in each, and how do you fix it?

```tsx
// a
<div class="p-4 bg-blue-500">

// b
const color = 'red';
<div className={`bg-${color}-500`}>

// c
<button className="bg-blue-500 hover-bg-blue-700">

// d
<div className="flex justify-center items-center gap-4 gap-8">
```

<details>
<summary>Answers</summary>

- a) `class` should be `className`.
- b) Tailwind can't find the dynamic class. Use a full-string lookup: `{ red: 'bg-red-500', blue: 'bg-blue-500' }`.
- c) The variant syntax is `hover:bg-blue-700` (colon, not hyphen).
- d) `gap-4` and `gap-8` conflict. Keep one.
</details>

---

## Exercise 3: A badge

Build a `Badge` component with `children` and a Tailwind style: small text, medium weight, rounded-full, padding, and a light colored background with darker text of the same color family (for example `bg-green-100 text-green-800`). Render it five times with different texts.

---

## Exercise 4: Button states

Style a `<button>` with:

- a blue background and white text
- a darker blue on hover
- a visible outline for keyboard focus (`focus-visible:`)
- a slight shrink when pressed
- a faded look and a `not-allowed` cursor when `disabled`
- a smooth transition

Test every state: hover, tab to it, click and hold, and add `disabled`.

---

## Exercise 5: A profile row

Use flexbox to build a row with:

- a round avatar (`size-12 rounded-full`) on the left
- a name (bold) and a subtitle (gray, small) stacked next to it
- a "Follow" button pushed all the way to the right

Hint: `ml-auto` or `justify-between` can do the pushing.

---

## Exercise 6: A feature grid

Build a 3-column grid of 6 `FeatureCard`s (an emoji icon, a title, and a description), with equal gaps and a hover effect that lifts the card (`hover:-translate-y-1 hover:shadow-md transition`). Define the data as a typed array and use `.map()`.

---

## Exercise 7: Make it yours

Add a brand color to your theme:

```css
@theme {
  --color-brand-500: ...;
  --color-brand-600: ...;
}
```

Use `bg-brand-500` and `hover:bg-brand-600` on your button. Change the hex values and watch everything update.

---

## Exercise 8: Extract a component

Here are three near-identical blocks:

```tsx
<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
  <h3 className="text-lg font-semibold">Fast</h3>
  <p className="mt-2 text-gray-600">Loads in a blink.</p>
</div>
<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
  <h3 className="text-lg font-semibold">Simple</h3>
  <p className="mt-2 text-gray-600">Easy to learn.</p>
</div>
<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
  <h3 className="text-lg font-semibold">Free</h3>
  <p className="mt-2 text-gray-600">Open source.</p>
</div>
```

Refactor them into one `InfoCard` component with typed props and a `.map()`. Why is this better than creating a CSS class called `.info-card`?

<details>
<summary>Answer</summary>

A component keeps the structure (heading plus paragraph) and the styles together, and it's typed, so you can't forget a prop. A CSS class would only capture the container styles, and you'd still repeat the inner markup.
</details>

---

## Check yourself

You're ready for the project if you can answer these without looking:

- What does "utility-first" mean?
- How do you add Tailwind to a Vite project (v4)?
- What does `p-4` equal in rem? What about `mt-8`?
- What does the `hover:` prefix do?
- Why is `bg-${color}-500` a bug?
- When should you extract a component instead of repeating classes?
- Where do you add custom colors in Tailwind v4?
- Why shouldn't you remove focus outlines?
