# Lesson 05: Exercises

Do these in a scratch Vite project or on a practice branch. Try each one **before** reading the answer.

---

## Exercise 1: Spot the bug

What's wrong in each line, and how do you fix it?

```tsx
// a
<button onClick={deleteItem(5)}>Delete</button>

// b
<form onSubmit={handleSubmit}> ... </form>
function handleSubmit() { save(values); }

// c
<input value={name} />

// d
<label for="email">Email</label>
```

<details>
<summary>Answers</summary>

- a) It calls `deleteItem(5)` during render. Use `onClick={() => deleteItem(5)}`.
- b) Missing `e.preventDefault()`, so the page reloads. Add the `event` parameter and call it.
- c) `value` without `onChange` makes a frozen input. Add `onChange={(e) => setName(e.target.value)}`.
- d) In JSX it's `htmlFor`.
</details>

---

## Exercise 2: Live character counter

Build a `TweetBox`: a `textarea` with a maximum of 140 characters.

- Show "23 / 140" below it, calculated from the text (no extra state)
- The counter turns red when fewer than 10 characters remain
- The "Post" button is disabled when the text is empty or too long

---

## Exercise 3: Every input type

Create a `Preferences` form with:

- a text input `nickname`
- a `select` for `theme` (`'light' | 'dark' | 'system'`)
- a checkbox `newsletter`
- radio buttons for `size` (`'s' | 'm' | 'l'`)

Keep it all in **one** state object. Below the form, show the state as JSON (`<pre>{JSON.stringify(values, null, 2)}</pre>`). Type the state with a `Preferences` type that uses the unions.

---

## Exercise 4: Typed events

Write the correct type for the `e` parameter in each separately-defined handler:

```tsx
function a(e) { console.log(e.target.value); }          // <input onChange>
function b(e) { e.preventDefault(); }                     // <form onSubmit>
function c(e) { console.log(e.key); }                     // <input onKeyDown>
function d(e) { console.log(e.currentTarget.textContent) } // <button onClick>
```

<details>
<summary>Answers</summary>

```tsx
function a(e: React.ChangeEvent<HTMLInputElement>) {}
function b(e: React.FormEvent<HTMLFormElement>) {}
function c(e: React.KeyboardEvent<HTMLInputElement>) {}
function d(e: React.MouseEvent<HTMLButtonElement>) {}
```
</details>

---

## Exercise 5: A reusable `TextField`

Create `TextField` with:

- the props `label: string`, `error?: string`, and everything a native `<input>` accepts (`React.ComponentProps<'input'>`)
- a `<label>` linked with `useId()`
- the error shown in a `<p role="alert">` and linked with `aria-describedby`
- `aria-invalid` set when there is an error

Use it three times in a form. (You'll reuse it in the project.)

---

## Exercise 6: Validation function

Write a pure function `validateSignup(values)` for `{ username: string; password: string; confirm: string }` that returns errors for:

- `username`: 3 to 15 characters, letters and numbers only
- `password`: at least 8 characters with at least one number
- `confirm`: must match `password`

Type the return value with `Partial<Record<keyof SignupValues, string>>`. Test it by calling it with a few inputs in the console, before you build any UI.

---

## Exercise 7: Touched fields

Build the signup form for Exercise 6.

1. Show errors only for fields the user has left (`onBlur`).
2. On submit, if there are errors, mark everything as touched and don't "send".
3. If it's valid, `console.log` the values and reset the form.
4. Disable the submit button while the form is invalid. Then think: is that better or worse UX than showing errors on submit?

---

## Exercise 8: Uncontrolled, with an action

Rebuild a tiny "Search" form using React 19's `action` prop and `FormData` (no state at all). Log the `q` value from `formData.get('q')`.

Compare it with a controlled version. When would you pick each?

<details>
<summary>Hint</summary>

Controlled when you need the value *while typing* (live validation, formatting, filtering). An action/uncontrolled form is simpler when you only need the values on submit.
</details>

---

## Check yourself

You're ready for the project if you can answer these without looking:

- What's the difference between `onClick={fn}` and `onClick={fn()}`?
- What is a controlled input?
- Why do you call `e.preventDefault()` in `onSubmit`?
- Why is `e.target.value` not a number for `type="number"`?
- How can one `handleChange` update many fields?
- Why should validation errors be derived instead of stored?
- What do `htmlFor`, `aria-invalid`, and `aria-describedby` do?
- Why is client-side validation never enough?
