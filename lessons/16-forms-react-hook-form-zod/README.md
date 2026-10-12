# Lesson 16: Forms with React Hook Form + Zod

**Goal:** build serious forms with less code and more safety. You'll define a schema once with Zod, get TypeScript types for free, validate inputs and API data, and wire it all to React Hook Form.

**Time:** about 3 hours

**Prerequisite:** [Lesson 15](../15-data-fetching-tanstack-query/README.md)

> **Last verified:** October 2026, with React Hook Form v7 and Zod v4. Both libraries evolve, and Zod 4 renamed some APIs (for example `z.email()` replaces `z.string().email()`, which still works but is deprecated). Check [react-hook-form.com](https://react-hook-form.com), [zod.dev](https://zod.dev), and [github.com/react-hook-form/resolvers](https://github.com/react-hook-form/resolvers) if anything here doesn't match what you see.

---

## What you will learn

- Why a form library, after Lesson 05's manual forms
- Zod schemas: primitives, objects, refinements, transforms
- Inferring TypeScript types from a schema
- `useForm` with `zodResolver`
- `register`, `handleSubmit`, and `formState.errors`
- Controlled components with `Controller`
- Submitting to a server, server errors, and `isSubmitting`
- Dynamic fields with `useFieldArray`
- Multi-step forms
- Validating API data (closing the loop from Lesson 03)

---

## 1. Why a library?

In Lesson 05 you wrote controlled inputs, touched state, and validation by hand. It works, but it scales badly:

- One `useState` update per keystroke re-renders the whole form
- Every field needs a value, an `onChange`, an `onBlur`, and error plumbing
- Types for values, errors, and touched all have to be kept in sync manually

**React Hook Form (RHF)** registers inputs and reads their values when needed, so typing doesn't re-render the form. **Zod** describes the shape and rules of your data once, and validates at runtime.

---

## 2. Zod basics

```bash
npm install zod react-hook-form @hookform/resolvers
```

A schema describes what valid data looks like:

```ts
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  email: z.email('Enter a valid email'),
  age: z.number().int().min(18, 'You must be 18 or older'),
  role: z.enum(['dev', 'design', 'pm']),
  newsletter: z.boolean(),
  website: z.url().optional(),
});
```

### Types come for free

```ts
type SignupValues = z.infer<typeof signupSchema>;
// { name: string; email: string; age: number; role: 'dev' | 'design' | 'pm'; newsletter: boolean; website?: string }
```

You never write the type by hand. The schema is the **single source of truth** for the type *and* the validation.

### Parsing

```ts
signupSchema.parse(data);            // returns typed data, or throws a ZodError
const result = signupSchema.safeParse(data);
if (result.success) result.data;     // typed
else result.error.issues;            // [{ path: ['email'], message: '...' }]
```

### Useful building blocks

```ts
z.string().trim().min(1, 'Required')
z.string().regex(/^\d{9}$/, 'Must be 9 digits')
z.number().positive()
z.array(z.string()).min(1, 'Add at least one tag')
z.literal('yes')
z.union([z.string(), z.number()])
z.string().nullable()         // string | null
schema.partial()              // all fields optional
schema.pick({ name: true })   // a subset
schema.extend({ extra: z.string() })
```

### Cross-field rules with `refine`

```ts
const passwordSchema = z
  .object({
    password: z.string().min(8, 'At least 8 characters').regex(/\d/, 'Needs a number'),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],      // attach the error to this field
  });
```

### Transforms and coercion

Inputs produce **strings**. Convert them in the schema:

```ts
z.coerce.number()                       // '42' -> 42
z.string().transform((s) => s.trim().toLowerCase())
```

With transforms, a schema has an **input** type (what the form holds) and an **output** type (what you get after parsing): `z.input<typeof schema>` and `z.output<typeof schema>`. `z.infer` gives the output.

---

## 3. `useForm` + `zodResolver`

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  name: z.string().min(2, 'At least 2 characters'),
  email: z.email('Enter a valid email'),
});

type FormValues = z.infer<typeof schema>;

function SignupForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '' },
  });

  async function onSubmit(values: FormValues) {
    await saveUser(values);        // values are validated and typed
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="name">Name</label>
      <input id="name" {...register('name')} aria-invalid={!!errors.name} />
      {errors.name && <p role="alert">{errors.name.message}</p>}

      <label htmlFor="email">Email</label>
      <input id="email" type="email" {...register('email')} aria-invalid={!!errors.email} />
      {errors.email && <p role="alert">{errors.email.message}</p>}

      <button disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Sign up'}</button>
    </form>
  );
}
```

How it works:

- `register('name')` returns `{ name, onChange, onBlur, ref }`, which you spread on the input. RHF reads the value from the DOM, so there's **no state per keystroke**.
- `handleSubmit(onSubmit)` prevents the default, runs validation, and calls `onSubmit` **only if valid**, with typed values. Otherwise it fills `errors`.
- `register('nmae')` is a **type error**, since keys come from `FormValues`.
- `noValidate` turns off the browser's own popups so your messages show.
- `isSubmitting` is `true` while your async `onSubmit` is running.

### Validation timing

```ts
useForm({ resolver, mode: 'onBlur' })       // validate when leaving a field
useForm({ resolver, mode: 'onTouched' })    // on blur first, then on every change (a good UX)
useForm({ resolver, reValidateMode: 'onChange' })  // after the first submit
```

The default is `onSubmit`.

### Numbers, checkboxes, selects

```tsx
<input type="number" {...register('age', { valueAsNumber: true })} />
<input type="checkbox" {...register('newsletter')} />
<select {...register('role')}>...</select>
```

`valueAsNumber` turns the string into a number (empty becomes `NaN`, so pair it with a clear message), or use `z.coerce.number()` in the schema.

---

## 4. Reading and controlling values

```tsx
const { watch, setValue, getValues, trigger, setFocus } = useForm<FormValues>();

const plan = watch('plan');               // re-renders on change (use sparingly)
setValue('country', 'PT', { shouldValidate: true });
getValues('email');                       // read without subscribing
setFocus('email');
```

`watch` re-renders the component on each change. For isolated reads in a child component, prefer `useWatch({ control, name })`.

### `Controller` for custom components

Libraries (date pickers, select widgets) and your own controlled components don't expose a `ref`. Use `Controller`:

```tsx
import { Controller } from 'react-hook-form';

<Controller
  name="rating"
  control={control}
  render={({ field, fieldState }) => (
    <StarRating value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
  )}
/>
```

In React 19, a function component can accept `ref` as a normal prop, so your own `Input` can work with `register` directly if it passes `ref` and `...props` through to the `<input>`.

---

## 5. Server errors

Validation on the server can fail too (the email is already taken). Put the message on the field or the whole form:

```tsx
async function onSubmit(values: FormValues) {
  try {
    await api.signup(values);
  } catch (err) {
    if (err instanceof ApiError && err.field === 'email') {
      setError('email', { type: 'server', message: err.message });
    } else {
      setError('root', { type: 'server', message: 'Something went wrong. Try again.' });
    }
  }
}

{errors.root && <p role="alert">{errors.root.message}</p>}
```

**Client validation is for UX. The server must validate again.** Anyone can skip your form and call your API directly.

With TanStack Query, call `mutation.mutateAsync(values)` inside `onSubmit` (or `mutate` with `onError`) and map errors the same way.

---

## 6. Dynamic lists: `useFieldArray`

```tsx
const schema = z.object({
  name: z.string().min(1, 'Required'),
  items: z
    .array(z.object({ product: z.string().min(1, 'Required'), qty: z.number().min(1) }))
    .min(1, 'Add at least one item'),
});

const { control, register } = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { name: '', items: [{ product: '', qty: 1 }] },
});

const { fields, append, remove } = useFieldArray({ control, name: 'items' });

{fields.map((field, index) => (
  <div key={field.id}>
    <input {...register(`items.${index}.product`)} />
    <input type="number" {...register(`items.${index}.qty`, { valueAsNumber: true })} />
    <button type="button" onClick={() => remove(index)}>Remove</button>
  </div>
))}
<button type="button" onClick={() => append({ product: '', qty: 1 })}>Add item</button>
```

Use `field.id` as the key (not the index). The template-string paths are fully typed.

---

## 7. Multi-step forms

Keep **one** form and one schema, and show different fields per step. Validate only the current step's fields before moving on:

```tsx
const steps = [
  { title: 'Account', fields: ['email', 'password'] },
  { title: 'Profile', fields: ['name', 'country'] },
  { title: 'Confirm', fields: [] },
] as const;

async function next() {
  const ok = await trigger(steps[step].fields);   // validate only these fields
  if (ok) setStep((s) => s + 1);
}
```

Tips: keep values of earlier steps mounted (hidden) or use `shouldUnregister: false` (the default) so they aren't lost. Save progress in the URL (`?step=2`) or `localStorage` if the form is long.

---

## 8. Validating API data

Back in Lesson 03 we said types vanish at runtime. Zod closes that gap:

```ts
const userSchema = z.object({ id: z.number(), name: z.string(), email: z.email() });
const usersSchema = z.array(userSchema);

type User = z.infer<typeof userSchema>;

async function fetchUsers(): Promise<User[]> {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Request failed');
  return usersSchema.parse(await res.json());   // throws if the shape is wrong
}
```

Now `User[]` is something you've **checked**, not just claimed. The same applies to `localStorage` reads, URL params, and `postMessage`. A schema at every boundary where data enters your app is an excellent habit. Use `safeParse` when you want to handle failure without exceptions.

---

## 9. Accessible, reusable fields

Wrap the markup you keep repeating (label, input, error, hint) in a `Field` component, as you did in Lessons 05 and 09:

```tsx
type FieldProps = ComponentProps<'input'> & { label: string; error?: string };

export function TextField({ label, error, id, ...props }: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  return (
    <div>
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} aria-invalid={!!error} aria-describedby={error ? errorId : undefined} {...props} />
      {error && <p id={errorId} role="alert">{error}</p>}
    </div>
  );
}

<TextField label="Email" type="email" error={errors.email?.message} {...register('email')} />
```

On a failed submit, RHF automatically **focuses the first invalid field** (`shouldFocusError` is on by default).

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| Writing the TypeScript type and the Zod schema separately | They drift apart. Use `z.infer` |
| Forgetting `defaultValues` | Uncontrolled to controlled warnings and `undefined` values |
| Number inputs without `valueAsNumber` or coercion | Strings fail `z.number()` |
| Using `watch()` everywhere | The form re-renders on every keystroke |
| Not spreading `register(...)` on the input | The field isn't tracked |
| Missing `type="button"` on non-submit buttons in forms | They submit the form |
| Using `index` as key in `useFieldArray` | Bugs on remove. Use `field.id` |
| Trusting client validation only | Anyone can bypass it |
| Using `.parse` in a `try/catch` for flow control, then ignoring issues | Poor errors. Use `safeParse` and show the issues |
| Following Zod v3 examples blindly | Some APIs moved in v4. Check [zod.dev](https://zod.dev) |
| Putting secrets or private rules only in the client schema | Visible to everyone |

---

## Key takeaways

- A Zod schema defines the shape and the rules once. `z.infer` gives you the type.
- `useForm({ resolver: zodResolver(schema) })` connects them. `register` tracks inputs without per-keystroke state.
- `handleSubmit` validates and gives you typed, valid values.
- Show errors with `formState.errors`, and use `setError` for server problems.
- `Controller` bridges custom components. `useFieldArray` handles dynamic lists.
- Validate data at every boundary (forms, API responses, storage), and always validate again on the server.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to [Lesson 17: Global state with Zustand](../17-global-state-zustand/README.md).
