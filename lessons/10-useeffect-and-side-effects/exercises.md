# Lesson 10: Exercises

Do these in a scratch Vite project or on a practice branch. Try each one **before** reading the answer.

---

## Exercise 1: When does it run?

For each effect, say when it runs:

```tsx
useEffect(() => { console.log('A'); });
useEffect(() => { console.log('B'); }, []);
useEffect(() => { console.log('C'); }, [count]);
useEffect(() => { console.log('D'); return () => console.log('E'); }, [count]);
```

What is logged when the component mounts, then when `count` changes, then when it unmounts? (Ignore Strict Mode for now.)

<details>
<summary>Answers</summary>

- Mount: `A B C D`
- `count` changes: `A`, then cleanup `E`, then `C D` (cleanup runs before the effect re-runs)
- Unmount: `E`
</details>

---

## Exercise 2: A live clock

Build a `Clock` that shows the current time, updating every second.

1. Use `setInterval` in an effect, with cleanup.
2. Test in Strict Mode. Does it tick once per second or twice?
3. Remove the cleanup. What changes? Put it back.
4. Add a "Pause" button. Make the interval start and stop based on a `running` state (a dependency).

---

## Exercise 3: Window size and online status

Build two small components:

- `WindowSize`: shows `width × height`, updated on `resize`
- `OnlineStatus`: shows "Online" or "Offline" using the `online` and `offline` window events (initial value from `navigator.onLine`)

For both, make sure you remove the listeners in cleanup. Verify by toggling "Offline" in DevTools Network.

---

## Exercise 4: Fix the effect

Find and fix the problems:

```tsx
function Greeting({ name }: { name: string }) {
  const [text, setText] = useState('');

  useEffect(() => {
    setText(`Hello, ${name}!`);
  }, []);

  return <h1>{text}</h1>;
}
```

<details>
<summary>Answer</summary>

Two issues: `name` is missing from the dependencies (so the greeting never updates), and the effect isn't needed at all. Derive it: `const text = \`Hello, ${name}!\`;`.
</details>

---

## Exercise 5: Fetch a user

Using `https://jsonplaceholder.typicode.com/users/{id}`:

1. Write a `UserCard` with a `userId` prop and the `State` union (loading, error, success).
2. Add "Previous" and "Next" buttons in the parent that change `userId` between 1 and 10.
3. Use `AbortController` and ignore `AbortError`.
4. Check `res.ok`. Try `userId = 9999` and see the error state.
5. In DevTools, throttle the network to "Slow 3G" and click Next quickly. Does the card ever show the wrong user?

---

## Exercise 6: Race condition lab

1. Write a version **without** abort or ignore.
2. Use DevTools throttling and click quickly between users. Can you make it show the wrong data?
3. Fix it two ways: `AbortController` and an `ignore` flag.
4. Explain in one sentence why the cleanup function solves it.

<details>
<summary>Answer</summary>

When `userId` changes, React runs the old effect's cleanup first, which aborts (or marks as ignored) the stale request, so it can never update the state afterwards.
</details>

---

## Exercise 7: Debounced search

Build a search box that fetches `https://jsonplaceholder.typicode.com/posts?q=...` (it filters by text) **300ms after** the user stops typing.

1. Keep `query` (immediate) and `debouncedQuery` (delayed) in state.
2. Update `debouncedQuery` in an effect with `setTimeout` and cleanup.
3. Fetch in a second effect that depends on `debouncedQuery`.
4. Open the Network tab. How many requests do you see when typing "react" quickly?

---

## Exercise 8: Do you need an effect?

For each case decide: **effect**, **event handler**, or **just calculate during render**.

1. Show a total price from a list of items
2. Send an analytics event when the user clicks "Buy"
3. Update `document.title` when the unread count changes
4. Filter a list when the search text changes
5. Open a WebSocket connection while a chat room is shown
6. Clear a form after it's submitted

<details>
<summary>Answers</summary>

1) calculate · 2) event handler · 3) effect · 4) calculate · 5) effect (with cleanup) · 6) event handler
</details>

---

## Check yourself

You're ready for the project if you can answer these without looking:

- What is a side effect, and why not do it during render?
- What do `[]`, `[a]`, and no array mean?
- When does the cleanup function run?
- Why does Strict Mode run effects twice in development?
- Why can't the effect function be `async`?
- Why check `res.ok`?
- What is a race condition and how do you prevent it?
- Name two things that don't need an effect.
