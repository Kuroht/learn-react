# Lesson 04: Exercises

Do these in a scratch Vite project or on a practice branch. Try each one **before** reading the answer.

---

## Exercise 1: Predict the number

```tsx
function Mystery() {
  const [n, setN] = useState(5);

  function handleClick() {
    setN(n + 1);
    setN(n + 1);
    setN((x) => x + 10);
  }

  return <button onClick={handleClick}>{n}</button>;
}
```

What does the button show after **one** click? Write down your guess, then run it.

<details>
<summary>Answer</summary>

`16`. In this render `n` is `5`. The first two calls both say "set to 6". The third is an updater that receives the latest queued value (`6`) and adds 10, giving `16`.
</details>

---

## Exercise 2: Toggle

Build a `Disclosure` component with a button "Show details" / "Hide details" that toggles a paragraph of text. Use a `boolean` state.

Then render **two** `Disclosure`s and confirm they work independently.

---

## Exercise 3: Fix the bug

This counter never updates. Find all the problems and fix them.

```tsx
function Score() {
  let score = 0;

  function add() {
    score = score + 1;
    console.log(score);
  }

  return (
    <div>
      <p>Score: {score}</p>
      <button onClick={add}>+1</button>
    </div>
  );
}
```

<details>
<summary>Answer</summary>

`score` is a plain variable. Replace it with `const [score, setScore] = useState(0)` and call `setScore((s) => s + 1)` in `add`. The `console.log` would still show the old value if you read `score` right after setting it.
</details>

---

## Exercise 4: Typed state

Write the correct `useState` line (with its type) for each:

1. A selected tab that is one of `'home'`, `'about'`, `'contact'`, starting at `'home'`
2. A list of tag strings, starting empty
3. A logged-in user (`User`) that doesn't exist at first
4. A rating from 1 to 5 that starts at `3`

<details>
<summary>Answers</summary>

```tsx
const [tab, setTab] = useState<'home' | 'about' | 'contact'>('home');
const [tags, setTags] = useState<string[]>([]);
const [user, setUser] = useState<User | null>(null);
const [rating, setRating] = useState(3); // number is fine, or a union 1|2|3|4|5
```
</details>

---

## Exercise 5: Object state

Create a `ProfileEditor` with state `{ name: string; city: string }` and two inputs (just display them with `value` and `readOnly` for now, you'll make them editable in Lesson 05). Add two buttons:

- "Move to Lisbon": sets `city` to `'Lisbon'` without losing `name`
- "Reset": sets both back to the starting values

Make sure you never mutate the state object.

---

## Exercise 6: Array state

Build a `NumberList`:

- Shows the numbers in an array state (start with `[3, 1, 2]`)
- "Add random" button: adds a random number from 1 to 100 at the **end**
- "Sort" button: sorts the list ascending **without mutating** the existing array
- "Remove" button next to each number

Hint: the sort bug to avoid is calling `.sort()` directly on state.

---

## Exercise 7: Derive, don't store

This component keeps `total` in state and forgets to update it sometimes.

```tsx
const [items, setItems] = useState<CartItem[]>([]);
const [total, setTotal] = useState(0);
```

Rewrite it so `total` is calculated from `items` during render. How many `setX` calls do you save?

---

## Exercise 8: Lift it up

You have two components that both need a `selectedColor`:

- `ColorPicker` shows buttons for red, green, blue
- `Preview` shows a box filled with the chosen color

1. Put the state in `App`.
2. Type the props of both components (`ColorPicker` needs a callback).
3. Check: where would the state live if only `ColorPicker` needed it?

---

## Check yourself

You're ready for the project if you can answer these without looking:

- Why doesn't `let count = 0; count++` update the screen?
- What does `useState(0)` return, and when is `0` used?
- When do you need the updater form `setX(prev => ...)`?
- Why is `items.push(x); setItems(items)` a bug?
- How do you add, remove, and change one item in an array state?
- What is "derived state" and why is it better than storing it?
- What does "lifting state up" mean?
- Why can't you call `useState` inside an `if`?
