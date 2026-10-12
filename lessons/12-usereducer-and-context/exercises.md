# Lesson 12: Exercises

Do these in a scratch Vite project or on a practice branch. Try each one **before** reading the answer.

---

## Exercise 1: Trace the reducer

```ts
type State = { count: number };
type Action = { type: 'add'; amount: number } | { type: 'double' } | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add': return { count: state.count + action.amount };
    case 'double': return { count: state.count * 2 };
    case 'reset': return { count: 0 };
  }
}
```

Starting at `{ count: 3 }`, what is the state after each action in this order?

`add 4` → `double` → `add -5` → `reset` → `double`

<details>
<summary>Answer</summary>

`7` → `14` → `9` → `0` → `0`
</details>

---

## Exercise 2: Counter with `useReducer`

Rewrite the Lesson 04 counter (value, step, +, -, reset) using `useReducer`:

- State: `{ count: number; step: number }`
- Actions: `incremented`, `decremented`, `stepChanged` (with the new step), `reset`
- Buttons only call `dispatch`

Which one feels better with two pieces of state? Why?

---

## Exercise 3: Pure reducer tests

Without React, write a few calls to your reducer (in a plain `.ts` file or a Vitest test if you have it installed) that check:

1. an unknown id in `removed` leaves the state unchanged
2. `added` twice for the same product increases the quantity to 2, not a second row
3. `quantityChanged` to `0` removes the item
4. the original `state` object is never mutated (use `Object.freeze` on it)

<details>
<summary>Hint</summary>

`Object.freeze(state.items)` makes accidental mutation throw an error in strict mode, so a failing test tells you which line mutates.
</details>

---

## Exercise 4: Fix the reducer

Find three bugs:

```ts
function todosReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case 'added':
      state.push({ id: Date.now(), title: action.title, done: false });
      return state;
    case 'toggled':
      return state.map((t) => {
        if (t.id === action.id) t.done = !t.done;
        return t;
      });
    case 'removed':
      fetch(`/api/todos/${action.id}`, { method: 'DELETE' });
      return state.filter((t) => t.id !== action.id);
  }
}
```

<details>
<summary>Answers</summary>

1. `push` mutates `state` (and returns the same reference), so use `[...state, newTodo]`.
2. `t.done = !t.done` mutates the existing object. Return `{ ...t, done: !t.done }`.
3. `fetch` is a side effect. Do it in the event handler or an effect. Also, `Date.now()` should be created by the caller and passed in the action, to keep the reducer pure.
</details>

---

## Exercise 5: Context for a theme

Create `ThemeProvider` and `useTheme()` for `'light' | 'dark'`, with a toggle function.

1. Use `use(ThemeContext)` in the hook.
2. Throw a helpful error when used outside the provider.
3. Build `ThemeToggle` and `ThemedCard` with no props for the theme.
4. Test the error: render `ThemeToggle` outside the provider.

---

## Exercise 6: State and dispatch contexts

Take your cart (or a simple counter) from the lesson and split it into two contexts.

1. Create `AddButton` (only dispatches) and `Total` (reads state).
2. Add `console.log('render')` in both.
3. Click "Add" a few times. Which components re-render?
4. Now merge the two contexts into one `{ state, dispatch }` value. What changes?

<details>
<summary>Discussion</summary>

With two contexts, `AddButton` isn't re-rendered when state changes (unless its parent re-renders it). With one context whose value includes the state, every consumer re-renders on each change.
</details>

---

## Exercise 7: Fix the performance trap

```tsx
function Provider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  return (
    <UserContext value={{ user, setUser }}>
      {children}
    </UserContext>
  );
}
```

Whenever `Provider`'s parent re-renders, every consumer re-renders, even when `user` didn't change. Why? Fix it with `useMemo`, then think of another way (splitting the contexts).

<details>
<summary>Answer</summary>

`{ user, setUser }` is a new object on every render, so the context value "changed". Wrap it in `useMemo(() => ({ user, setUser }), [user])`. `setUser` is stable, so it's not needed in the deps (but ESLint is fine with state setters being omitted).
</details>

---

## Exercise 8: Prop drilling or context?

For each situation decide: **props**, **composition (children)**, or **context**.

1. A `Button` needs a `label` and an `onClick`
2. The current user's name is shown in the navbar, a sidebar, and a footer, at different depths
3. A `Layout` needs to put a `CartButton` in the header, but `Layout` doesn't care about the cart
4. A form field needs the form's error messages, three levels down
5. A list of posts fetched from a server, used in two pages

<details>
<summary>Suggested answers</summary>

1) props · 2) context · 3) composition: pass the element as a prop · 4) props if it's one or two levels, context for a bigger form · 5) a data-fetching library (Lesson 15), not context
</details>

---

## Check yourself

You're ready for the project if you can answer these without looking:

- What are the two arguments of a reducer, and what must it return?
- Why describe events (`added`) rather than commands (`SET_ITEMS`)?
- What makes a reducer "pure"?
- What does `dispatch` do, and is it stable between renders?
- What are the three steps to use context?
- Why wrap `use(Context)` in a custom hook?
- Why would you split state and dispatch into two contexts?
- When is context the wrong tool?
