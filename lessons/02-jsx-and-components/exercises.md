# Lesson 02: Exercises

Do these in a scratch Vite project (or in your Lesson 01 starter on a practice branch). Try each one before checking the answer.

---

## Exercise 1: Fix the JSX

Each snippet has a bug. Find it, fix it, and say why it was wrong.

```tsx
// a
return (
  <h1>Title</h1>
  <p>Text</p>
);

// b
<img src="cat.png" alt="A cat">

// c
<div class="box">Hello</div>

// d
<p style="color: red">Hello</p>
```

<details>
<summary>Answers</summary>

- a) Two roots. Wrap them in a `<div>` or a fragment `<>...</>`.
- b) Tag not closed. Use `<img ... />`.
- c) Use `className`.
- d) `style` takes an object: `style={{ color: 'red' }}`.
</details>

---

## Exercise 2: Curly braces

Given:

```tsx
const user = { name: 'Nathan', age: 30 };
const language = 'TypeScript';
```

Write JSX that shows:

1. `Hello, Nathan!`
2. `Nathan is 30 years old.`
3. `Next year Nathan will be 31.` (do the math inside the braces)
4. `I'm learning TYPESCRIPT` (use a string method)

---

## Exercise 3: Your first prop

Create a `Greeting` component that takes a `name` prop and shows `Hello, {name}!`.

1. Use it three times with three different names.
2. Make TypeScript complain: pass a number as `name`. Read the error.
3. Make the prop optional with a default of `'stranger'`, then use `<Greeting />` with no props.

---

## Exercise 4: Props with different types

Create a `Badge` component with these props:

- `label` (string, required)
- `count` (number, required)
- `highlighted` (boolean, optional, default `false`)

It should show something like `Messages (3)`, and use a different color when `highlighted` is true.

Hint: a ternary can pick a class name: `className={highlighted ? 'badge highlighted' : 'badge'}`.

---

## Exercise 5: `children`

Create a `Card` component that wraps whatever you put inside it in a box with a border and padding.

Then use it three times with different content: a paragraph, a heading plus a list, and an image with a caption.

**Question to answer:** What's the difference between passing something as a prop and passing it as `children`? When would you choose each?

---

## Exercise 6: Spot the component

Look at a website you use every day (YouTube, GitHub, an online shop). Pick one page and sketch it as a tree of components, like this:

```
Page
├── Navbar
│   ├── Logo
│   └── SearchBar
├── VideoPlayer
└── CommentList
    └── Comment
```

**Goal:** start seeing interfaces as nested components. There's no single right answer.

---

## Check yourself

You're ready for the project if you can answer these without looking:

- Why must a component name start with a capital letter?
- Why does JSX need one root element, and what is a fragment?
- What goes inside `{ }` in JSX, and what can't?
- What is `children`?
- What does a `?` mean in a props type?
