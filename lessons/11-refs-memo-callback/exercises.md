# Lesson 11: Exercises

Do these in a scratch Vite project or on a practice branch. Try each one **before** reading the answer. Keep React DevTools open (the Profiler tab and "Highlight updates when components render" setting).

---

## Exercise 1: Focus management

Build a `LoginForm` with email and password inputs.

1. Focus the email input when the component mounts.
2. On a failed submit (just check that the fields are non-empty), focus the first empty field.
3. Add a "Show password" checkbox. After toggling it, keep the focus on the password input.

Type every ref correctly.

---

## Exercise 2: Scroll to bottom

Build a chat log: a scrollable `div` with a list of messages and an input to add one.

1. Keep a ref to the end of the list (an empty `div`).
2. After a message is added, call `scrollIntoView({ behavior: 'smooth' })`.
3. Think about where this code goes: the event handler or an effect? Why?

<details>
<summary>Discussion</summary>

The DOM isn't updated yet inside the click handler, so scrolling there targets the old layout. An effect that depends on `messages` runs after the new message is on screen.
</details>

---

## Exercise 3: Render counter

Create a hook-free component that shows how many times it has rendered.

1. Use `useRef(0)` and increment it in an **effect**. What do you see?
2. Try `useState` for the same purpose in an effect without dependencies. What happens, and why is it dangerous?
3. Which one is correct for this job and why?

<details>
<summary>Answer</summary>

A ref: it persists and changes without triggering a render. With state, every update re-renders, which triggers the effect again, causing an infinite loop.
</details>

---

## Exercise 4: Previous value

Write a `usePrevious<T>(value: T)` hook that returns the value from the previous render. Use it to display "Count: 5 (was 4)".

Hint: store the value in a ref in an effect, and return the ref's value.

---

## Exercise 5: Find the slow code

Create a list of 20,000 strings and a text input that filters them with `.includes()`.

1. Add `console.time` and `console.timeEnd` around the filter. How long does it take?
2. Add an unrelated counter button on the same component. Does clicking it recompute the filter?
3. Wrap the filter in `useMemo` and click the counter again. Compare the timings.
4. Does the memoization matter for 200 items? Test it.

---

## Exercise 6: Make `memo` work

```tsx
function Parent() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<Item[]>(initialItems);

  function remove(id: number) {
    setItems((current) => current.filter((i) => i.id !== id));
  }

  return (
    <>
      <button onClick={() => setCount(count + 1)}>Clicked {count}</button>
      {items.map((item) => (
        <Row key={item.id} item={item} onRemove={remove} />
      ))}
    </>
  );
}
```

1. Add a `console.log` in `Row`. Click the counter. How many `Row`s render?
2. Wrap `Row` in `memo`. Does it help? Why not?
3. Add `useCallback` to `remove`. Now?
4. Remove `memo` but keep `useCallback`. What changes?

<details>
<summary>Answers</summary>

1) All rows. 2) No, because `remove` is a new function each render. 3) Now only the necessary rows re-render. 4) Nothing helps: `useCallback` is useless without `memo`.
</details>

---

## Exercise 7: A stopwatch with refs

Build a stopwatch with Start, Stop, and Reset.

- Store the interval id in a `useRef`
- Make sure it stops when the component unmounts
- Pressing Start twice must not start two timers

Then answer: why isn't the interval id in state?

---

## Exercise 8: Be honest

Look at your earlier projects (the watchlist, the weather app). Find three places where you could add `useMemo` or `useCallback`. For each, say:

1. Would it measurably help?
2. How would you prove it with the Profiler?

Often the honest answer is "no, leave it".

---

## Check yourself

You're ready for the project if you can answer these without looking:

- How do you type a DOM ref and why can `current` be `null`?
- Why doesn't changing `ref.current` update the screen?
- When is a ref better than state?
- When does a component re-render?
- What does `useMemo` do, and when is it worth it?
- Why does `useCallback` need `memo` to be useful?
- Why use the updater form of `setState` in a memoized callback?
- Why measure before optimizing?
