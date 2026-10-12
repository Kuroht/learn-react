# Lesson 04: State with `useState`

**Goal:** make components remember things and react to change. You'll learn what state is, how `useState` works, and the rules that keep it predictable.

**Time:** about 2 to 3 hours

**Prerequisite:** [Lesson 03](../03-props-and-typescript/README.md)

> **Last verified:** October 2026, with React 19 and TypeScript. Check [react.dev/learn/state-a-components-memory](https://react.dev/learn/state-a-components-memory) if anything here doesn't match what you see.

---

## What you will learn

- Why a normal variable can't make a component update
- What state is and how `useState` works
- Typing state with TypeScript
- How React re-renders when state changes
- Updating state based on the previous value
- State with objects and arrays (never mutate!)
- Deriving values instead of storing them
- Lifting state up to share it between components
- The rules of hooks

---

## 1. Why a variable isn't enough

```tsx
function Counter() {
  let count = 0;

  return <button onClick={() => count++}>Clicked {count} times</button>;
}
```

Click it and nothing happens. Two problems:

1. Changing a local variable doesn't tell React to re-render.
2. Even if it did re-render, the function runs again from the top and `count` goes back to `0`.

A component needs a place to **remember** values between renders, and a way to **tell React** that something changed. That's what state is.

---

## 2. `useState`

```tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>;
}
```

`useState(0)` returns a pair:

- `count`: the current value (starts as `0`)
- `setCount`: a function that updates it **and** asks React to re-render

The naming convention is `[thing, setThing]`.

### What happens on a click

1. You call `setCount(1)`.
2. React schedules a re-render of `Counter`.
3. `Counter` runs again. This time `useState(0)` returns `1` (React remembers it).
4. The new JSX is compared to the old one and only the changed text is updated in the DOM.

The `0` in `useState(0)` is only used on the **first** render.

---

## 3. Typing state

Most of the time TypeScript infers the type from the initial value:

```tsx
const [count, setCount] = useState(0);        // number
const [name, setName] = useState('');         // string
const [isOpen, setIsOpen] = useState(false);  // boolean
```

When the initial value doesn't tell the full story, write the type in angle brackets:

```tsx
type Status = 'idle' | 'loading' | 'done';

const [status, setStatus] = useState<Status>('idle');
const [user, setUser] = useState<User | null>(null);
const [tags, setTags] = useState<string[]>([]);
```

Without `<string[]>`, TypeScript would infer `never[]` for an empty array and complain when you add something.

---

## 4. State belongs to one component instance

Each component instance has its own state:

```tsx
<Counter />
<Counter />
```

Clicking the first one doesn't affect the second. State is **local** and **private** to where it's used. If you render a component in two places, you get two independent states.

---

## 5. Updating from the previous value

State updates are **scheduled**, not instant. This surprises almost everyone:

```tsx
function handleClick() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
  console.log(count); // still the old value!
}
```

This adds **1**, not 3. Inside one render, `count` is a fixed snapshot. All three calls say "set it to old value + 1".

When the new value depends on the old one, pass a function (an *updater*):

```tsx
setCount((c) => c + 1);
setCount((c) => c + 1);
setCount((c) => c + 1); // now it adds 3
```

**Rule of thumb:** if the next value is calculated from the current one, use the updater form.

---

## 6. Objects in state

State must be treated as **read-only**. To change an object, create a **new** one:

```tsx
type Profile = { name: string; age: number };

const [profile, setProfile] = useState<Profile>({ name: 'Nathan', age: 30 });

// Wrong: mutates the existing object, React doesn't notice
profile.age = 31;

// Right: a new object, with one field changed
setProfile({ ...profile, age: 31 });
```

`...profile` (the spread operator) copies all the fields, then `age: 31` overrides one.

For nested objects, spread each level you change:

```tsx
setProfile({ ...profile, address: { ...profile.address, city: 'Porto' } });
```

If this gets painful, your state is probably too nested. Flatten it, or wait for `useReducer` in Lesson 12.

---

## 7. Arrays in state

Same rule: never mutate. Use methods that return a **new** array.

| Goal | Don't use | Use |
|------|-----------|-----|
| Add | `push`, `unshift` | `[...items, newItem]` |
| Remove | `splice`, `pop` | `items.filter(i => i.id !== id)` |
| Change one | `items[0] = x` | `items.map(i => i.id === id ? { ...i, done: true } : i)` |
| Sort | `sort` (it mutates!) | `[...items].sort(...)` |

```tsx
const [todos, setTodos] = useState<Todo[]>([]);

function addTodo(title: string) {
  setTodos((current) => [...current, { id: Date.now(), title, done: false }]);
}

function toggleTodo(id: number) {
  setTodos((current) =>
    current.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
  );
}

function removeTodo(id: number) {
  setTodos((current) => current.filter((t) => t.id !== id));
}
```

Why does React insist on new objects? It decides whether to re-render by checking if the value **changed** (is it a different reference?). If you mutate in place, the reference is the same and React skips the update.

---

## 8. Don't store what you can calculate

```tsx
// Avoid: two states that must always agree
const [todos, setTodos] = useState<Todo[]>([]);
const [doneCount, setDoneCount] = useState(0);

// Better: calculate during render
const doneCount = todos.filter((t) => t.done).length;
```

Duplicated state goes out of sync. Store the **minimum**, derive the rest. Derived values are just normal variables computed each render, and that's fast enough almost always.

---

## 9. Lifting state up

Two components need the same data? Move the state to their closest common parent and pass it down as props.

```tsx
function App() {
  const [query, setQuery] = useState('');

  return (
    <>
      <SearchBox value={query} onChange={setQuery} />
      <Results query={query} />
    </>
  );
}

type SearchBoxProps = { value: string; onChange: (value: string) => void };
```

- The parent **owns** the state.
- Children receive the value as a prop and a callback to request changes.

This is why Lesson 03's function props matter. The data flows down, the events flow up.

---

## 10. The rules of hooks

Hooks (functions starting with `use`) follow two rules. ESLint checks them for you:

1. **Only call hooks at the top level** of a component. Not inside `if`, loops, or nested functions.
2. **Only call hooks from components or custom hooks**, not from regular functions.

```tsx
function Bad({ show }: { show: boolean }) {
  if (show) {
    const [x, setX] = useState(0); // error: conditional hook
  }
}
```

React tracks state by the **order** hooks are called. Changing the order between renders breaks that tracking.

---

## 11. Strict Mode and double rendering

In development, `<StrictMode>` (already in your `main.tsx`) renders components **twice** on purpose to help you find impure code. If you see a `console.log` run twice, that's why. It doesn't happen in production.

This is also why render functions must be **pure**: same props and state in, same JSX out, no changing outside variables.

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| `count++` or `count = count + 1` | Doesn't re-render. Use `setCount` |
| `setCount(count + 1)` three times | Only adds 1. Use `setCount(c => c + 1)` |
| `todos.push(item)` then `setTodos(todos)` | Same reference, no re-render |
| Reading state right after setting it | You get the old snapshot |
| `useState` inside an `if` or a loop | Error. Hooks go at the top level |
| Storing derived data in state | Values go out of sync |
| Putting state too high up | Everything re-renders more than it needs to |

---

## Key takeaways

- State is a component's memory. Changing it triggers a re-render.
- `const [value, setValue] = useState(initial)`. The initial value is used once.
- Type state with `useState<Type>()` when it can't be inferred.
- Use the updater form `setX(prev => ...)` when the new value depends on the old one.
- Never mutate objects or arrays in state. Create new ones with spread, `map`, and `filter`.
- Derive values instead of storing them twice.
- Lift state up to the nearest common parent when components need to share it.
- Call hooks at the top level only.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to [Lesson 05: Events and forms](../05-events-and-forms/README.md).
