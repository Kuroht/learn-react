# Lesson 06: Exercises

Do these in a scratch Vite project or on a practice branch. Try each one **before** reading the answer.

---

## Exercise 1: What gets rendered?

For each snippet, say what appears on screen when `count` is `0`, and fix any problem.

```tsx
// a
{count && <p>You have {count} messages</p>}

// b
{count > 0 && <p>You have {count} messages</p>}

// c
{count ? <p>You have {count} messages</p> : null}

// d
{!!count && <p>You have {count} messages</p>}
```

<details>
<summary>Answers</summary>

- a) Renders `0`. Fix with `count > 0 &&`.
- b) Nothing. Correct.
- c) Nothing. Correct (`0` is falsy).
- d) Nothing. Correct, `!!` converts to a boolean.
</details>

---

## Exercise 2: Render a list

Given this data, render a `<ul>` of names with a subtitle showing the role. Add the correct `key`.

```tsx
type Person = { id: string; name: string; role: 'dev' | 'design' | 'pm' };

const team: Person[] = [
  { id: 'a1', name: 'Ana', role: 'dev' },
  { id: 'b2', name: 'Bruno', role: 'design' },
  { id: 'c3', name: 'Carla', role: 'pm' },
];
```

Then: create a `PersonRow` component and move the `key` to the right place.

---

## Exercise 3: Filter, search, sort

Using the team above (add a few more people):

1. Add a text input that filters by name (case-insensitive)
2. Add a `select` that filters by role, with an "All" option
3. Add a button that toggles sorting by name A to Z and Z to A

Keep only `query`, `role`, and `sortAsc` in state. The visible list should be **derived**. Verify you never mutate the original array.

---

## Exercise 4: See the index-key bug

1. Create a list of three `<li>`s, each with an `<input>` inside, rendered from state `['A', 'B', 'C']` with `key={index}`.
2. Type something different in each input.
3. Add a "Remove first" button that removes the first item from state.
4. Observe what happens to the typed text.
5. Change the key to a stable id and try again.

Write a sentence explaining what you saw.

<details>
<summary>What you should see</summary>

With index keys, React reuses the DOM nodes by position. After removing the first item the remaining labels shift up, but the inputs keep their old text, so it appears under the wrong label. With stable ids, React removes the right node and everything stays matched.
</details>

---

## Exercise 5: Four ways to be conditional

Build one `StatusBadge` component that takes `status: 'online' | 'away' | 'offline'`, written **three times**:

1. with `if` / early returns
2. with a ternary
3. with an object lookup (`const labels: Record<Status, string> = {...}`)

Which one is easiest to extend when you add `'busy'`? Does TypeScript help you with the lookup version?

<details>
<summary>Hint</summary>

With `Record<Status, string>`, TypeScript complains until you add the new key. That's a safety net the other two versions don't give you.
</details>

---

## Exercise 6: Loading, error, empty, ready

Model this screen with a discriminated union:

```tsx
type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; items: string[] };
```

1. Write `ItemsView({ state })` that switches on `state.status`.
2. Show a different message for `ready` with an empty `items` array.
3. Add three buttons in `App` that put the state in each mode so you can see them.
4. Try to read `state.items` inside the `'error'` case. What does TypeScript say?

---

## Exercise 7: A list that changes

Build a shopping list:

- Shows items from state with a checkbox and a "Remove" button
- An input and button to add an item
- Checked items are moved to the bottom of the visible list (derive it, don't reorder the state)
- When the list is empty, show "Your list is empty"

Use `crypto.randomUUID()` for ids.

---

## Exercise 8: Group by

Given a list of movies with a `genre: string`, display them in sections by genre with a heading showing the count, like "Drama (3)".

Bonus: sort the genres alphabetically, and sort the movies inside each genre by year.

---

## Check yourself

You're ready for the project if you can answer these without looking:

- Why is `.map()` used for lists, not `.forEach()`?
- What does a `key` do, and what makes a good one?
- Why is `key={index}` risky?
- Where do you put the `key`?
- Why does `{items.length && <List />}` sometimes render `0`?
- When would you choose early return, a ternary, or `&&`?
- What is a discriminated union, and how does it help with UI states?
- Why does the empty state matter?
