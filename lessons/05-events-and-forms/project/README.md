# Lesson 05 Project: Contact Form with Live Validation

Build an accessible contact form that validates as the user types, shows helpful errors, and handles submission.

> **Last verified:** October 2026. Check [react.dev/learn/installation](https://react.dev/learn/installation) for the current way to start a project.

---

## Brief

A "Contact us" page with a form: name, email, topic, message, and a consent checkbox. Errors appear after a field has been touched. The submit button works only when everything is valid, and a success message confirms the "send".

The point is to practice **controlled inputs, derived validation, and accessible markup**.

Every stage ends with a **checkpoint**: something you should see in the browser.

---

## Getting started

```bash
cd lessons/05-events-and-forms/project
npm create vite@latest starter -- --template react-ts
cd starter
npm install
npm run dev
```

Clear the template code as in earlier lessons.

Work in your own branch: `git checkout -b yourname/lesson-05`

---

## Stage 1: The types

Goal: describe the form before building it.

Create `src/types.ts`:

```ts
export type Topic = 'general' | 'support' | 'sales';

export type ContactValues = {
  name: string;
  email: string;
  topic: Topic;
  message: string;
  consent: boolean;
};

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;
```

- [ ] The types are exported
- [ ] An `initialValues: ContactValues` constant exists with empty strings, `topic: 'general'`, and `consent: false`

**Checkpoint:** no TypeScript errors.

---

## Stage 2: A reusable `TextField`

Goal: a typed, accessible input wrapper.

Create `src/components/TextField.tsx` (see Exercise 5).

- [ ] Props: `label`, optional `error`, plus all native `<input>` props
- [ ] The label is linked with `useId()` and `htmlFor`
- [ ] The error appears in a `<p role="alert">` and is linked with `aria-describedby`
- [ ] `aria-invalid` is set when there's an error

**Checkpoint:** clicking the label focuses the input.

---

## Stage 3: Controlled fields

Goal: one state object for the whole form.

In `src/components/ContactForm.tsx`:

- [ ] `values` state typed as `ContactValues`
- [ ] A `TextField` for name and email
- [ ] A `select` for the topic with the three options
- [ ] A `textarea` for the message (with a label)
- [ ] A checkbox for consent ("I agree to be contacted")
- [ ] Handle changes with **one** `handleChange` function (watch out for the checkbox: it uses `checked`)

**Checkpoint:** every field updates as you type, and the JSON of `values` shown below the form (temporary) stays in sync.

---

## Stage 4: Validation

Goal: a pure function, and derived errors.

Create `src/validation.ts` with `validate(values: ContactValues): ContactErrors`:

- [ ] Name: at least 2 characters (after trimming)
- [ ] Email: matches a simple email pattern
- [ ] Message: between 10 and 500 characters
- [ ] Consent: must be checked

In the form, compute `const errors = validate(values)` during render.

- [ ] Errors are **not** stored in state
- [ ] `isValid` is derived from `errors`

**Checkpoint:** calling `validate` with bad data in the console returns the expected errors.

---

## Stage 5: Touched fields

Goal: show errors at the right time.

- [ ] Add `touched` state (`Partial<Record<keyof ContactValues, boolean>>`)
- [ ] Mark a field as touched on blur
- [ ] Show a field's error only if it has been touched
- [ ] Show a live counter for the message ("120 / 500")
- [ ] The counter turns red near the limit

**Checkpoint:** you can tab through the empty form and see errors appear one field at a time.

---

## Stage 6: Submit

Goal: handle submission properly.

- [ ] The form uses `onSubmit` with `e.preventDefault()`
- [ ] If invalid, mark all fields as touched and focus nothing else (the errors are now visible)
- [ ] If valid, `console.log` the values, show a success message, and reset the form
- [ ] The submit button shows "Sending..." for 1 second (use `setTimeout`) and is disabled meanwhile
- [ ] Pressing Enter in a text field submits the form

Hint for the delay: keep a `status` state typed as `'idle' | 'sending' | 'success'`.

**Checkpoint:** an invalid submit shows all errors, and a valid one shows "Thanks, we'll be in touch!".

---

## Stage 7: Accessibility and polish

- [ ] Every input has a visible label
- [ ] Use the right `type` and `autoComplete` values (`email`, `name`)
- [ ] Errors are not communicated by color alone
- [ ] The form is fully usable with the keyboard only
- [ ] Looks good at phone width

---

## Stage 8: Check your work

```bash
npm run build
npm run lint
```

Both should pass. No `any`.

---

## Requirements checklist

**Must have**

- [ ] `ContactValues`, `ContactErrors`, and `Topic` types
- [ ] Controlled inputs for text, select, textarea, and checkbox
- [ ] A pure `validate` function, with errors derived (not stored)
- [ ] Errors shown after blur or submit
- [ ] A reusable, accessible `TextField`
- [ ] A success message and a reset after submit
- [ ] No `any`
- [ ] `npm run build` and `npm run lint` pass

**Nice to have**

- [ ] The same form built a second time with the React 19 `action` prop, to compare
- [ ] A reusable `TextAreaField` and `SelectField`
- [ ] Save the draft in `localStorage` so a refresh doesn't lose it
- [ ] A "Show password" toggle on a small extra login form

---

## Hints

<details>
<summary>My checkbox doesn't toggle</summary>

For checkboxes, read `e.target.checked`, not `e.target.value`, and pass `checked={values.consent}`.

```tsx
const { name, type, value, checked } = e.target;
setValues((c) => ({ ...c, [name]: type === 'checkbox' ? checked : value }));
```
</details>

<details>
<summary>TypeScript complains about the event type in handleChange</summary>

The handler serves several element types, so use a union:
`React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>`.
To read `checked`, narrow with `e.target instanceof HTMLInputElement`.
</details>

<details>
<summary>The page reloads when I submit</summary>

Call `e.preventDefault()` at the top of `handleSubmit`, and make sure the handler is on `<form onSubmit>`.
</details>

<details>
<summary>I get "uncontrolled to controlled" warnings</summary>

An initial value is `undefined`. Initialize every string field with `''`.
</details>

<details>
<summary>How do I mark all fields as touched?</summary>

Build the object from the keys:

```tsx
const allTouched = Object.fromEntries(
  Object.keys(values).map((key) => [key, true]),
) as Record<keyof ContactValues, boolean>;
```
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per stage.
3. Push and open a pull request titled `Lesson 05: yourname`.
4. Ask a friend to review it. A good review asks: can I use this form with only a keyboard, and is every error understandable?

---

## Done when

- Errors appear at the right time and disappear when fixed
- A valid submit shows the success state and resets
- `npm run build` and `npm run lint` pass
- Your PR is open and a friend has reviewed it

Next up: **Lesson 06: Lists, keys, and conditional rendering**.
