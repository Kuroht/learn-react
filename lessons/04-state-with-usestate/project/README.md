# Lesson 04 Project: Counter, then a To-do List

Build two small apps in one project. First a counter to get comfortable with `useState`, then a to-do list that uses object and array state, derived values, and lifted state.

> **Last verified:** October 2026. Check [react.dev/learn/installation](https://react.dev/learn/installation) for the current way to start a project.

---

## Brief

**Part A:** a counter with plus, minus, reset, and a configurable step.

**Part B:** a to-do list where you can add, complete, and delete tasks, see how many are left, and filter by All / Active / Done.

The point is to practice **state that is updated immutably** and **values that are derived, not stored**.

Every stage ends with a **checkpoint**: something you should see in the browser.

---

## Getting started

```bash
cd lessons/04-state-with-usestate/project
npm create vite@latest starter -- --template react-ts
cd starter
npm install
npm run dev
```

Clear the template code as in earlier lessons.

Work in your own branch: `git checkout -b yourname/lesson-04`

---

## Stage 1: A basic counter

Goal: your first `useState`.

Create `src/components/Counter.tsx`.

- [ ] Shows the current count (starts at `0`)
- [ ] "+" and "-" buttons change it by 1
- [ ] "Reset" sets it back to `0`
- [ ] The count is shown in red when negative (use a conditional class)

**Checkpoint:** you can click your way to `-3` and back to `0`.

---

## Stage 2: A step

Goal: two pieces of state and the updater form.

- [ ] Add a `step` state (a number, starting at `1`) with three buttons: `1`, `5`, `10`
- [ ] The highlighted step button shows which one is active
- [ ] "+" and "-" now change the count by `step`
- [ ] Use `setCount((c) => c + step)` (the updater form)
- [ ] Add a "+3" button that calls the updater **three times** in one handler and adds `3 * step`

**Checkpoint:** the "+3" button really adds three steps in one click.

---

## Stage 3: Typed to-do data

Goal: model the to-do list with types.

Create `src/types.ts`:

```ts
export type Todo = {
  id: number;
  title: string;
  done: boolean;
};

export type Filter = 'all' | 'active' | 'done';
```

- [ ] In `src/components/TodoApp.tsx`, create `const [todos, setTodos] = useState<Todo[]>([...])` with three sample items
- [ ] Render them as a plain `<ul>` with `.map()` and `key={todo.id}`

**Checkpoint:** the three sample tasks appear.

---

## Stage 4: Toggle and delete

Goal: update an array immutably.

- [ ] Create a `TodoItem` component with the props `todo`, `onToggle(id)`, and `onDelete(id)`
- [ ] Clicking the checkbox toggles `done` (use `map` and spread)
- [ ] A "Delete" button removes the item (use `filter`)
- [ ] Done items are shown with a line-through

**Checkpoint:** you can tick and delete tasks, and the state of the others is unchanged.

---

## Stage 5: Adding tasks

Goal: a form-like flow with a simple controlled input. (Lesson 05 covers forms in depth, so keep this simple.)

- [ ] Create `AddTodo` with the prop `onAdd(title: string)`
- [ ] It keeps its **own** `text` state for the input (`value` and `onChange`)
- [ ] Clicking "Add" calls `onAdd` with the trimmed text, then clears the input
- [ ] Do nothing if the text is empty after trimming
- [ ] New tasks are added with a unique `id` (for example `Date.now()`)

**Checkpoint:** you can add several tasks, and empty ones are rejected.

---

## Stage 6: Derived values and filters

Goal: calculate instead of store.

- [ ] Show "X tasks left" calculated from `todos` (**not** another state)
- [ ] Add `filter` state typed as `Filter` with three buttons
- [ ] Calculate `visibleTodos` from `todos` and `filter` during render
- [ ] Show a friendly message when the visible list is empty
- [ ] A "Clear completed" button removes all done tasks

**Checkpoint:** switching filters doesn't lose any task, and the "left" count is always right.

---

## Stage 7: Check your work

```bash
npm run build
npm run lint
```

Both should pass. Search your code: you should find **no** `push`, `splice`, or direct assignment on state, and no `any`.

---

## Requirements checklist

**Must have**

- [ ] A `Counter` with step and reset, using the updater form
- [ ] Typed `Todo` and `Filter` in `src/types.ts`
- [ ] Add, toggle, delete, and clear completed
- [ ] The remaining count and the filtered list are **derived**, not stored
- [ ] State is updated immutably everywhere
- [ ] `TodoItem` and `AddTodo` have typed props and callbacks
- [ ] No `any`
- [ ] `npm run build` and `npm run lint` pass

**Nice to have**

- [ ] An "Edit" mode for a task title
- [ ] Keep the todos after a reload with `localStorage` (a taste of Lesson 13)
- [ ] A "Mark all as done" toggle
- [ ] Keyboard support: press Enter to add

---

## Hints

<details>
<summary>My count only goes up by 1 in the "+3" button</summary>

You used `setCount(count + step)` three times. Each call sees the same `count`. Use `setCount((c) => c + step)` three times, or just call it once with `c + 3 * step`.
</details>

<details>
<summary>How do I toggle one item?</summary>

```tsx
setTodos((current) =>
  current.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
);
```
</details>

<details>
<summary>My list doesn't update after I add an item</summary>

You probably used `todos.push(...)`. That changes the existing array, so React sees the same reference. Use `setTodos((current) => [...current, newTodo])`.
</details>

<details>
<summary>TypeScript complains about `useState([])`</summary>

An empty array has no known item type. Write `useState<Todo[]>([])`.
</details>

<details>
<summary>Where should the filter state live?</summary>

In `TodoApp`, because it decides which items to render. The filter buttons receive the current filter and a callback as props.
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per stage.
3. Push and open a pull request titled `Lesson 04: yourname`.
4. Ask a friend to review it. A good review asks: is any state stored that could be calculated instead?

---

## Done when

- The counter and the to-do list both work
- The remaining count and filters are always correct
- `npm run build` and `npm run lint` pass
- Your PR is open and a friend has reviewed it

Next up: **Lesson 05: Events and forms**.
