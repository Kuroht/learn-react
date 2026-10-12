# Lesson 16 Project: Multi-step Signup Wizard

Build a three-step signup wizard with schema validation, dynamic fields, server-error handling, a progress indicator, and a summary step.

> **Last verified:** October 2026, with React Hook Form v7 and Zod v4. Check [react-hook-form.com](https://react-hook-form.com) and [zod.dev](https://zod.dev) for the current APIs.

---

## Brief

A signup wizard for a fictional service:

1. **Account:** email, password, confirm password
2. **Profile:** full name, country, birth date, bio, and a list of links (add and remove)
3. **Preferences:** plan (`free | pro | team`), notification channels (checkboxes), terms acceptance
4. **Review:** a summary of everything with "Edit" links back to each step, and a submit button

Behind it is a **fake API** that rejects taken emails and sometimes fails. Progress is saved so a refresh doesn't lose it.

Every stage ends with a **checkpoint**: something you should see in the browser.

---

## Getting started

```bash
cd lessons/16-forms-react-hook-form-zod/project
npm create vite@latest starter -- --template react-ts
cd starter
npm install
npm install react-hook-form zod @hookform/resolvers tailwindcss @tailwindcss/vite
npm run dev
```

You can reuse your design system from Lesson 09 (`Button`, `Input`, `Field`, `Card`).

Suggested structure:

```
src/
├── features/signup/
│   ├── schema.ts            # Zod schemas and inferred types
│   ├── steps.ts             # which fields belong to which step
│   ├── fakeApi.ts
│   ├── useSignupForm.ts
│   └── components/ (Wizard, StepAccount, StepProfile, StepPreferences, StepReview, Progress)
└── components/ui/ (TextField, SelectField, CheckboxField, ...)
```

Work in your own branch: `git checkout -b yourname/lesson-16`

---

## Stage 1: The schema

In `schema.ts`, define one schema per step and combine them:

```ts
export const accountSchema = z.object({ email: ..., password: ..., confirm: ... }).refine(...);
export const profileSchema = z.object({ ... });
export const preferencesSchema = z.object({ ... });

export const signupSchema = z.object({ ...accountSchema.shape, ...profileSchema.shape, ...preferencesSchema.shape });
export type SignupValues = z.infer<typeof signupSchema>;
```

(Note: spreading `.shape` copies the **fields only**, not the refinements. In Zod 4, `accountSchema.refine(...)` still has a `.shape`, but the password-match rule won't come along when you spread it. Add the cross-field `.refine` to the **combined** `signupSchema` too, and keep it on `accountSchema` for per-step validation. In Zod 3, `.refine` returned a different schema type with no `.shape` at all.)

Rules:

- [ ] Email is valid. Password has at least 8 characters, a number, and a letter
- [ ] `confirm` must match `password` (the error shows on `confirm`)
- [ ] Name is 2 to 60 characters (trimmed)
- [ ] Country is one of a fixed list. Birth date means the user is at least 18
- [ ] Bio is up to 200 characters (optional)
- [ ] Links: 0 to 3 items, each a valid URL
- [ ] Plan is an enum. Notifications is an array with at least one channel
- [ ] Terms must be accepted (`true`)

**Checkpoint:** `signupSchema.safeParse(...)` with good and bad data in a scratch file gives the issues you expect.

---

## Stage 2: Reusable fields

- [ ] `TextField`, `SelectField`, `CheckboxField`, and `TextAreaField`, each accepting `label`, `error`, `hint`, and native props
- [ ] Labels linked with `useId()`. Errors linked with `aria-describedby`. `aria-invalid` set
- [ ] They work with `{...register('field')}` directly (React 19 passes `ref` as a prop)
- [ ] A character counter on the bio

**Checkpoint:** a test form using each field shows the errors correctly.

---

## Stage 3: The wizard shell

- [ ] A single `useForm<SignupValues>` at the wizard level, with `zodResolver(signupSchema)`, `defaultValues`, and `mode: 'onTouched'`
- [ ] A `steps` array with a title and the field names belonging to each step
- [ ] A progress indicator ("Step 2 of 4") built with an ordered list, marking `aria-current="step"`
- [ ] "Back" and "Next" buttons. "Next" calls `trigger(stepFields)` and moves only if valid
- [ ] When "Next" fails, focus moves to the first invalid field (`shouldFocus: true` in `trigger`)
- [ ] The current step is in the URL (`?step=2`). Invalid or skipped-ahead steps redirect to the first incomplete one

**Checkpoint:** you can't skip ahead past an invalid step, even by editing the URL.

---

## Stage 4: Step content

- [ ] **Account:** email, password (with a show/hide toggle and a strength hint), confirm
- [ ] **Profile:** name, country select, birth date, bio, and links with `useFieldArray` (Add link, Remove, max 3, `field.id` as key)
- [ ] **Preferences:** plan as radio cards, notification checkboxes (an array of values), terms checkbox
- [ ] Use `useWatch` (not `watch` on the whole form) for any live preview like the bio counter

**Checkpoint:** every step validates independently, and going back keeps the values.

---

## Stage 5: Review and submit

- [ ] A summary that reads values with `getValues()` and shows a clean list (hide the password)
- [ ] An "Edit" button per section that goes to that step
- [ ] A fake `submitSignup(values)` that waits ~1s, **rejects `taken@example.com`** with a field error, and fails 20% of the time with a generic error
- [ ] Use `setError('email', ...)` for the field error and send the user back to step 1 with the error visible
- [ ] Show a generic form-level error from `errors.root` and keep the data
- [ ] The submit button shows "Creating account…" and is disabled while `isSubmitting`
- [ ] On success show a confirmation screen, and clear the saved progress

**Checkpoint:** `taken@example.com` brings you back to step 1 with the right error.

---

## Stage 6: Persist progress

- [ ] Save form values (never the password!) to `localStorage` as the user types (debounced, via `watch` subscription or `useWatch` + `useDebounce`)
- [ ] On load, read them back and **validate with Zod** (`partial().safeParse`). Invalid or old data is discarded
- [ ] Use the result as `defaultValues`
- [ ] A "Start over" button clears everything
- [ ] Warn before leaving with unsaved changes (`formState.isDirty` + `beforeunload`)

**Checkpoint:** refresh in the middle of step 2 and nothing is lost, except the password fields.

---

## Stage 7: Accessibility and polish

- [ ] Whole wizard usable with the keyboard
- [ ] On step change, focus goes to the step's heading (`tabIndex={-1}` plus `focus()`), and it's announced
- [ ] Errors use `role="alert"` or an `aria-live` region
- [ ] Don't rely on color alone for errors
- [ ] Works at 360px width
- [ ] `noValidate` on the form, with your own messages

---

## Stage 8: Check your work

```bash
npm run build
npm run lint
```

Both should pass. No `any`. The form type must come from `z.infer`, not a hand-written type.

---

## Requirements checklist

**Must have**

- [ ] Zod schemas as the single source of truth, with `z.infer` types
- [ ] One `useForm` with `zodResolver` across all steps
- [ ] Per-step validation using `trigger`
- [ ] A cross-field rule (password match)
- [ ] `useFieldArray` for links
- [ ] Server error handling with `setError` (field and root)
- [ ] Review step with edit links
- [ ] Persisted progress that is validated when read (and never stores the password)
- [ ] Accessible fields and focus management
- [ ] No `any`
- [ ] `npm run build` and `npm run lint` pass

**Nice to have**

- [ ] Async validation: check email availability on blur (debounced), with a loading hint
- [ ] A password strength meter using a small scoring function
- [ ] Slide animation between steps that respects `prefers-reduced-motion`
- [ ] Use TanStack Query's `useMutation` for the submit
- [ ] Unit tests for the schema (they're pure functions!)

---

## Hints

<details>
<summary><code>trigger</code> returns true but a field is invalid</summary>

Check that you passed the exact field names of the **current** step. Nested fields use dot paths: `'links.0.url'`. For arrays, you can validate the whole array with `'links'`.
</details>

<details>
<summary>The <code>confirm</code> error doesn't update when I change <code>password</code></summary>

RHF only revalidates the changed field. Call `trigger('confirm')` when `password` changes (in `onChange` of `register`, or an effect on `useWatch`) if `confirm` has a value.
</details>

<details>
<summary>My number or date fields have the wrong type</summary>

Inputs give strings. Use `z.coerce.number()` or `valueAsNumber`, and keep dates as `YYYY-MM-DD` strings validated with a refine (compare to today).
</details>

<details>
<summary>How do I calculate "at least 18"?</summary>

```ts
.refine((v) => {
  const d = new Date(v);
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 18);
  return d <= cutoff;
}, 'You must be at least 18')
```
</details>

<details>
<summary>Values from earlier steps disappear</summary>

Don't unmount-and-unregister fields (keep `shouldUnregister` at its default `false`), and keep one `useForm` at the top. Don't call `reset()` between steps.
</details>

<details>
<summary>How do I handle checkbox groups as an array?</summary>

Register each checkbox with the same name and a `value`: `<input type="checkbox" value="email" {...register('channels')} />`. RHF gives an array of the checked values. Use `z.array(z.enum([...])).min(1)`.
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per stage.
3. Push and open a pull request titled `Lesson 16: yourname`, with screenshots of an error state and the review step.
4. Ask a friend to review it. A good review asks: can I get past a step with invalid data, and what happens if the server rejects it?

---

## Done when

- The wizard guides users through all steps with clear, accessible errors
- Server errors and refreshes are handled gracefully
- `npm run build` and `npm run lint` pass
- Your PR is open and a friend has reviewed it

Next up: **Lesson 17: Global state with Zustand**.
