# Lesson 05: Events and Forms

**Goal:** handle user input the React way. You'll learn event handlers, controlled inputs, form submission, and simple live validation, all typed with TypeScript.

**Time:** about 2 to 3 hours

**Prerequisite:** [Lesson 04](../04-state-with-usestate/README.md)

> **Last verified:** October 2026, with React 19 and TypeScript. Check [react.dev/learn/responding-to-events](https://react.dev/learn/responding-to-events) and [react.dev/reference/react-dom/components/input](https://react.dev/reference/react-dom/components/input) if anything here doesn't match what you see.

---

## What you will learn

- Adding event handlers (`onClick`, `onChange`, `onSubmit`)
- Typing events in TypeScript
- Controlled inputs: text, checkbox, radio, select, textarea
- One state object for a whole form
- Submitting a form and preventing the page reload
- Live validation and showing errors
- Accessible forms: labels, errors, and focus
- A first look at form actions in React 19

---

## 1. Events in React

You attach handlers with camelCase props and pass a **function**:

```tsx
function Button() {
  function handleClick() {
    alert('Clicked!');
  }

  return <button onClick={handleClick}>Click me</button>;
}
```

Common mistake: **calling** the function instead of passing it.

```tsx
<button onClick={handleClick()}>  // runs during render, wrong
<button onClick={handleClick}>    // runs on click, right
<button onClick={() => handleDelete(id)}> // wrap it when you need arguments
```

By convention, handlers are named `handleSomething` and props are named `onSomething`.

### Common events

| Event | When |
|-------|------|
| `onClick` | Element clicked |
| `onChange` | Input value changed (fires on every keystroke in React) |
| `onSubmit` | Form submitted |
| `onFocus` / `onBlur` | Element gained / lost focus |
| `onKeyDown` | A key was pressed |
| `onMouseEnter` / `onMouseLeave` | Pointer moves in or out |

---

## 2. The event object and TypeScript

Handlers receive an event. React wraps the browser event in a typed object:

```tsx
function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
  console.log(event.currentTarget); // the button
}

function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
  console.log(event.target.value); // a string
}

function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
}
```

The pattern is `React.<Kind>Event<ElementType>`. When you write the handler **inline**, TypeScript infers it, so you don't type anything:

```tsx
<input onChange={(e) => setName(e.target.value)} />
```

Write the explicit type only when the function is defined separately.

### Stopping defaults and bubbling

- `event.preventDefault()` stops the browser's default action (a form reload, a link navigation).
- `event.stopPropagation()` stops the event from bubbling up to parents.

---

## 3. Controlled inputs

In React, an input's value usually lives in **state**. The input shows the state, and typing updates the state:

```tsx
function NameField() {
  const [name, setName] = useState('');

  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  );
}
```

This is a **controlled input**: React is the single source of truth. Benefits: you can validate, format, or reset the value anytime.

Two things to remember:

- If you set `value` without `onChange`, the input becomes read-only and React warns you.
- Never initialize with `undefined`. Use `''` so the input doesn't switch from uncontrolled to controlled.

### Other input types

```tsx
// Checkbox: use `checked`, not `value`
<input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />

// Select
<select value={country} onChange={(e) => setCountry(e.target.value)}>
  <option value="pt">Portugal</option>
  <option value="es">Spain</option>
</select>

// Textarea: also uses `value` in React
<textarea value={message} onChange={(e) => setMessage(e.target.value)} />

// Radio: checked when the value matches
<input type="radio" name="plan" value="free"
  checked={plan === 'free'} onChange={() => setPlan('free')} />
```

Numbers: `e.target.value` is always a **string**. Convert with `Number(e.target.value)` when you need a number.

---

## 4. One state for the whole form

One `useState` per field gets noisy. Use one object and one handler:

```tsx
type FormValues = {
  name: string;
  email: string;
  message: string;
};

const initialValues: FormValues = { name: '', email: '', message: '' };

function ContactForm() {
  const [values, setValues] = useState<FormValues>(initialValues);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  return (
    <form>
      <input name="name" value={values.name} onChange={handleChange} />
      <input name="email" value={values.email} onChange={handleChange} />
      <textarea name="message" value={values.message} onChange={handleChange} />
    </form>
  );
}
```

Each input's `name` attribute must match a key in `FormValues`. `[name]: value` is a **computed property**: it uses the variable's value as the key.

> TypeScript note: `[name]: value` is loosely typed because `name` is just a `string`. It's a good trade-off for small forms. Lesson 16 introduces React Hook Form and Zod for fully typed forms.

---

## 5. Submitting

```tsx
function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault(); // otherwise the page reloads
  console.log('Sending', values);
  setValues(initialValues); // reset
}

<form onSubmit={handleSubmit}>
  ...
  <button type="submit">Send</button>
</form>
```

Put the handler on the **form**'s `onSubmit`, not on the button's `onClick`. That way pressing Enter in an input also submits, and browsers can run built-in validation.

A `<button>` inside a form defaults to `type="submit"`. Give other buttons `type="button"` so they don't submit by accident.

---

## 6. Validation

Write a plain function that takes values and returns errors:

```tsx
type FormErrors = Partial<Record<keyof FormValues, string>>;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = 'Name must have at least 2 characters.';
  }
  if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (values.message.trim().length < 10) {
    errors.message = 'Message must have at least 10 characters.';
  }

  return errors;
}
```

- `keyof FormValues` is `'name' | 'email' | 'message'`.
- `Record<K, V>` is an object with keys `K` and values `V`.
- `Partial<...>` makes every key optional, since a field can have no error.

Because errors are **derived** from the values, don't put them in state:

```tsx
const errors = validate(values);
const isValid = Object.keys(errors).length === 0;
```

### When to show errors

Showing "invalid email" on the first keystroke is annoying. Track which fields the user has **touched**:

```tsx
const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});

<input
  name="email"
  value={values.email}
  onChange={handleChange}
  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
/>
{touched.email && errors.email && <p className="error">{errors.email}</p>}
```

On submit, if the form is invalid, mark all fields as touched so every error appears.

---

## 7. Accessible forms

- Every input needs a **label**. Use `htmlFor` (the React name for `for`) with the input's `id`:

  ```tsx
  <label htmlFor="email">Email</label>
  <input id="email" name="email" type="email" />
  ```

- Use the right `type` (`email`, `tel`, `number`, `password`). Mobile keyboards and autofill depend on it.
- Link errors to inputs so screen readers announce them:

  ```tsx
  <input aria-invalid={Boolean(errors.email)} aria-describedby="email-error" />
  <p id="email-error" role="alert">{errors.email}</p>
  ```

- Don't rely on color alone for errors. Add text.
- Use `useId()` for ids when a component is rendered more than once:

  ```tsx
  const id = useId();
  <label htmlFor={id}>Name</label>
  <input id={id} />
  ```

---

## 8. A first look at form actions (React 19)

React 19 lets `<form>` take an `action` function that receives `FormData`:

```tsx
function Newsletter() {
  function subscribe(formData: FormData) {
    const email = formData.get('email');
    console.log('Subscribe', email);
  }

  return (
    <form action={subscribe}>
      <input name="email" type="email" />
      <button>Subscribe</button>
    </form>
  );
}
```

React resets uncontrolled fields after the action finishes. Actions shine with pending states, `useActionState`, and servers (Lessons 16 and 22). In this lesson we stick with the controlled `onSubmit` approach, because it works everywhere and teaches how state drives the UI.

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| `onClick={handleClick()}` | Runs immediately during render |
| Forgetting `e.preventDefault()` in `onSubmit` | The page reloads and state is lost |
| `value` without `onChange` | The input is frozen |
| `useState()` (undefined) for a text input | "Changing an uncontrolled input to be controlled" warning |
| Using `e.target.value` as a number | It's always a string. Convert it |
| Using `checked` vs `value` mix-up on checkboxes | The checkbox doesn't toggle |
| Using `for` instead of `htmlFor` | React warning, label not linked |
| Showing every error at once, from the first keystroke | Annoying. Use `touched` |
| Storing `errors` in state | They go out of sync. Derive them |
| Relying only on client validation | Users can bypass it. Always validate on the server too |

---

## Key takeaways

- Pass a function to `onClick`, don't call it.
- `React.ChangeEvent<HTMLInputElement>` and friends type your events. Inline handlers are inferred.
- Controlled inputs: `value` (or `checked`) comes from state, `onChange` updates it.
- Use one state object and `name` attributes for bigger forms.
- Handle `onSubmit` on the form and call `preventDefault()`.
- Derive validation errors from the values, and show them after a field is touched.
- Labels, the right input types, and `aria-*` attributes make forms usable for everyone.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to [Lesson 06: Lists, keys, and conditional rendering](../06-lists-keys-conditional-rendering/README.md).
