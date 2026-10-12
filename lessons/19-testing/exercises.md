# Lesson 19: Exercises

Do these in a scratch Vite project with Vitest and Testing Library installed (see the lesson's setup), or on a practice branch. Try each one **before** reading the answer.

---

## Exercise 1: Unit vs integration vs E2E

Where would you test each? Choose **unit**, **component/integration**, or **E2E**.

1. `formatPrice(1290)` returns `"€12.90"`
2. Typing an invalid email shows an error message
3. A user registers, logs in, adds a product, and pays
4. `cartReducer` removes an item whose quantity drops to 0
5. A list shows "No results" when the server returns an empty array

<details>
<summary>Suggested answers</summary>

1) unit · 2) component · 3) E2E · 4) unit · 5) component with a mocked network
</details>

---

## Exercise 2: Test a pure function

Write `slugify(text: string)` (lowercase, trim, spaces to `-`, remove characters that aren't letters, numbers, or `-`). Then write tests first (TDD style):

1. basic: `"Hello World"` → `"hello-world"`
2. extra spaces and symbols: `"  React & TypeScript! "` → `"react-typescript"`
3. empty string → `""`
4. Use `it.each` for at least five more cases

Write the tests, watch them fail, and then implement the function.

---

## Exercise 3: Test a reducer

Take your `todosReducer` or `cartReducer` and test:

1. each action type
2. an unknown id (no change)
3. that the original state is not mutated (freeze it with `Object.freeze`)
4. a sequence of actions that ends in the expected state

---

## Exercise 4: Component with a user

Test a `LoginForm` (email, password, "Log in" button, `onSubmit` prop):

1. It renders both fields, found by label
2. Submitting empty shows two alerts
3. Valid input calls `onSubmit` once, with the values
4. The button is disabled while `isSubmitting` is true (pass a prop)

Use `getByRole` and `getByLabelText` only. No test ids.

---

## Exercise 5: Spot the problem

What's wrong with these tests?

```tsx
// a
it('works', () => {
  render(<Counter />);
  userEvent.click(screen.getByText('Increment'));
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});

// b
it('shows no error', () => {
  render(<Form />);
  expect(screen.getByText('Error')).not.toBeInTheDocument();
});

// c
it('loads', () => {
  render(<UserList />);
  expect(screen.getByText('Ana')).toBeInTheDocument();
});

// d
it('sets state', () => {
  const { container } = render(<Toggle />);
  expect(container.querySelector('.on')).toBeTruthy();
});
```

<details>
<summary>Answers</summary>

a) `userEvent.click` isn't awaited (and not created with `setup()`), so the assertion runs too early. b) `getByText` throws if missing. Use `queryByText` for absence. c) The data loads asynchronously, so use `await screen.findByText('Ana')`. d) It tests a CSS class (implementation detail) instead of what the user perceives, so use a role/name or `aria-pressed`.
</details>

---

## Exercise 6: Mock the network

For a component that fetches `/api/users`:

1. Set up MSW with a handler returning two users, and test that both appear
2. Override the handler to return `500` and test the error message
3. Override it to return `[]` and test the empty state
4. Add a delayed response and check that the loading state shows first (`delay()` from `msw/utils/delay`)
5. Turn on `onUnhandledFrame: 'error'` (called `onUnhandledRequest` before MSW 3). What happens if the component calls a URL you forgot to handle?

---

## Exercise 7: Test a hook

Write tests for `useDebounce` and `useLocalStorage` (Lesson 13):

1. `useDebounce`: the value doesn't change before the delay, and does after it (fake timers)
2. `useLocalStorage`: reads an existing value, writes on change, and falls back on invalid JSON
3. Clean `localStorage` in `beforeEach`

---

## Exercise 8: Wrapper helper

Create `renderWithProviders` that provides a router and a fresh `QueryClient` (`retry: false`). Use it to test a page that has a link to another route and loads data. Check:

1. it renders data from MSW
2. clicking the link navigates (assert on the content of the destination)

---

## Exercise 9: Accessibility test

Add `vitest-axe` and write an accessibility test for two of your components. Break the markup on purpose (remove a label, use a `div` button) and watch the violation message. Then fix it.

---

## Exercise 10: Bug-first

1. Find or introduce a bug in one of your components (for example a total that rounds incorrectly)
2. Write a failing test that reproduces it
3. Fix the bug
4. Explain why the test now protects you

---

## Exercise 11: Playwright

Install Playwright and write one E2E test for the main flow of an earlier project (add a todo, add to cart, or search). Locate everything by role or label. Run it headed (`--headed`) and with `--ui`.

---

## Check yourself

You're ready for the project if you can answer these without looking:

- Why test behavior rather than implementation?
- Which query should you try first, and why?
- When do you use `getBy`, `queryBy`, and `findBy`?
- Why `userEvent` rather than `fireEvent`, and why `await` it?
- What does MSW do and why is it better than mocking `fetch` by hand?
- Why create a new `QueryClient` for every test?
- What does coverage tell you, and what doesn't it tell you?
- What should you test with E2E and what should you leave to lower levels?
