# Lesson 16: Exercises

Do these in a scratch Vite project with `react-hook-form`, `zod`, and `@hookform/resolvers` installed, or on a practice branch. Try each one **before** reading the answer.

---

## Exercise 1: Read the schema

```ts
const schema = z.object({
  title: z.string().min(3),
  priority: z.enum(['low', 'high']),
  tags: z.array(z.string()).max(3),
  due: z.string().optional(),
});
```

1. Write the inferred TypeScript type by hand
2. Which of these pass? `{ title: 'ab', priority: 'low', tags: [] }`, `{ title: 'Buy milk', priority: 'urgent', tags: [] }`, `{ title: 'Buy milk', priority: 'high', tags: ['a','b','c'] }`

<details>
<summary>Answers</summary>

1. `{ title: string; priority: 'low' | 'high'; tags: string[]; due?: string | undefined }`
2. First fails (title too short), second fails (`'urgent'` isn't allowed), third passes.
</details>

---

## Exercise 2: Parse unknown data

1. Write a schema for a `Product` (`id: number`, `name: string`, `price: number > 0`, `tags: string[]`)
2. Use `safeParse` on three objects: one valid, one with a string price, one missing `name`
3. Print `result.error.issues`. What do `path` and `message` look like?
4. Use the schema to validate the response of `https://dummyjson.com/products/1` (extra fields are ignored by default)

---

## Exercise 3: Login form

Build a login form with `email` and `password` (min 8):

1. Use `useForm` + `zodResolver`, with `defaultValues`
2. Show errors with `aria-invalid` and `role="alert"`
3. Disable the button while submitting, and fake a 1s API call
4. Try `mode: 'onTouched'`. How does the UX change versus the default?
5. Intentionally mistype a field name in `register('emial')`. What does TypeScript say?

---

## Exercise 4: Cross-field validation

Create a signup schema with `password` and `confirm`, plus a `.refine` that checks they match, with the error on `confirm`.

1. Does the error appear when you edit `password` after `confirm` is filled? (Hint: revalidation of related fields.)
2. Add `trigger('confirm')` in an `onChange` to fix it
3. Add a rule that the password can't contain the email's local part (`superRefine` or a second `refine`)

---

## Exercise 5: Numbers and checkboxes

Create a "Booking" form: `guests` (1 to 10), `date` (a string in the future), `acceptTerms` (must be `true`).

1. Make `guests` work as a number (`valueAsNumber` or `z.coerce.number()`)
2. Make `acceptTerms` fail with a custom message when unchecked (hint: `z.literal(true, { error: ... })` or `.refine(v => v)`)
3. Add a `select` for `meal: 'veg' | 'meat' | 'fish'`
4. Show the submitted values as JSON and check their types

---

## Exercise 6: Server errors

Write a fake `api.signup` that rejects with `{ field: 'email', message: 'Email already in use' }` for `taken@example.com`, and with a generic error 20% of the time.

1. Show the field error under the right input using `setError`
2. Show the generic error in `errors.root`
3. Clear the server error when the user edits the field (`clearErrors`)
4. Why must the server validate again?

---

## Exercise 7: Dynamic fields

Build an "Invoice" form with a client name and a list of line items (`description`, `qty`, `price`), using `useFieldArray`.

1. At least one item is required
2. "Add item" and "Remove" buttons (disable "Remove" when only one is left)
3. Show a live total with `useWatch`
4. Make the schema validate each item
5. Use `field.id` as the key. Try `index` and remove the first row to see what breaks

---

## Exercise 8: Multi-step form

Build a 3-step form (Account, Profile, Confirm) with **one** `useForm` and one schema:

1. "Next" validates only the current step's fields with `trigger([...])`
2. "Back" keeps the entered values
3. The last step shows a read-only summary and submits
4. Keep the step in the URL (`?step=2`) and guard against invalid steps

---

## Exercise 9: Validate an API

Take any earlier project that fetches JSON (the weather app, the GitHub explorer) and add a Zod schema for the response. Make the `queryFn` use `parse`.

1. Replace the hand-written type with `z.infer`
2. Break it on purpose (change a field name in the schema). What error do users see? How could you show a friendlier message?

---

## Check yourself

You're ready for the project if you can answer these without looking:

- Why use `z.infer` instead of writing the type yourself?
- What does `register('email')` return, and why doesn't typing cause re-renders?
- What does `handleSubmit` do?
- How do you validate that two fields match, and where does the error go?
- Why do number inputs need `valueAsNumber` or `z.coerce`?
- When do you need `Controller`?
- Why must the server validate even though the form already did?
- How does Zod help with data from an API?
