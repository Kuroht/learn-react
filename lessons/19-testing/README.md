# Lesson 19: Unit and Component Testing

**Goal:** write tests that give you confidence to change code. You'll set up Vitest and React Testing Library, test pure functions, components, hooks, forms, and async UI, mock the network with MSW, and get a first look at end-to-end testing.

**Time:** about 3 hours

**Prerequisite:** [Lesson 18](../18-error-loading-accessibility/README.md)

> **Last verified:** October 2026, with Vitest, React Testing Library 16, and MSW 2. Tooling versions move quickly. Check [vitest.dev](https://vitest.dev), [testing-library.com/docs/react-testing-library/intro](https://testing-library.com/docs/react-testing-library/intro), and [mswjs.io](https://mswjs.io) if anything here doesn't match what you see.

---

## What you will learn

- Why test, and what to test
- Setting up Vitest, jsdom, and Testing Library
- Anatomy of a test: arrange, act, assert
- Testing pure functions and reducers
- Rendering components and querying by role
- Simulating users with `user-event`
- Testing async UI: `findBy`, `waitFor`
- Mocking the network with MSW
- Testing hooks and context
- Accessibility checks in tests
- Coverage, and why 100% is not the goal
- A first look at Playwright (end-to-end)

---

## 1. Why test?

- Change code without fear: a failing test tells you what you broke
- Document behavior: tests are examples of how things should work
- Catch regressions before users do
- Better design: code that's hard to test is often too tangled

But tests cost time to write and maintain. Test **behavior that matters**, not every line.

### The testing trophy

| Type | What | Speed | Confidence |
|------|------|-------|------------|
| Static | TypeScript, ESLint | Instant | Catches typos and type errors |
| Unit | Pure functions, reducers, hooks | Very fast | Logic is right |
| **Integration / component** | A component with its children, state, and (mocked) network | Fast | The UI works for users |
| End-to-end | A real browser against a running app | Slow | The whole system works |

Most of your tests should be **component/integration tests** that act like a user. Use unit tests for tricky logic, and a few end-to-end tests for critical journeys (sign up, checkout).

---

## 2. Setup

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

```ts
// vite.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
    css: true,
  },
});
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());
```

Add `"test": "vitest"` to `package.json` scripts, and add `"types": ["vitest/globals", "@testing-library/jest-dom"]` to `tsconfig.app.json`'s `compilerOptions` so `describe`, `it`, and `expect` type-check.

- **Vitest** runs tests. It reuses your Vite config, so imports, aliases, and TypeScript just work, and it's very fast in watch mode.
- **jsdom** simulates a browser DOM in Node.
- **Testing Library** renders components and queries them like a user would.
- **jest-dom** adds matchers like `toBeInTheDocument()`.

Run `npm test` (watch mode) or `npx vitest run` (once, for CI).

---

## 3. Anatomy of a test

```ts
import { describe, it, expect } from 'vitest';

describe('formatPrice', () => {
  it('formats euros with two decimals', () => {
    // Arrange
    const price = 12.5;

    // Act
    const result = formatPrice(price);

    // Assert
    expect(result).toBe('€12.50');
  });
});
```

Good test names read like sentences: *"it adds the same product twice as quantity 2"*. Keep each test focused on **one behavior**.

Common matchers: `toBe` (identity), `toEqual` (deep equality), `toContain`, `toHaveLength`, `toThrow`, `toBeNull`, `toMatchObject`.

---

## 4. Testing pure logic

Reducers, selectors, validators, and formatters are the easiest and most valuable things to test. No React needed:

```ts
describe('cartReducer', () => {
  const product = { id: 1, name: 'Mug', price: 1290, imageUrl: '/mug.png' };

  it('adds a new item with quantity 1', () => {
    const next = cartReducer({ items: [], promoCode: null }, { type: 'itemAdded', product });
    expect(next.items).toEqual([{ ...product, quantity: 1 }]);
  });

  it('increments the quantity when adding the same product', () => {
    const start = cartReducer({ items: [], promoCode: null }, { type: 'itemAdded', product });
    const next = cartReducer(start, { type: 'itemAdded', product });
    expect(next.items).toHaveLength(1);
    expect(next.items[0].quantity).toBe(2);
  });

  it('does not mutate the previous state', () => {
    const start = Object.freeze({ items: Object.freeze([]), promoCode: null }) as CartState;
    expect(() => cartReducer(start, { type: 'itemAdded', product })).not.toThrow();
  });
});
```

Table tests keep many cases compact:

```ts
it.each([
  ['', false],
  ['a@b', false],
  ['a@b.co', true],
])('isValidEmail(%j) is %s', (input, expected) => {
  expect(isValidEmail(input)).toBe(expected);
});
```

---

## 5. Testing components

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </>
  );
}

it('increments when the button is clicked', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  expect(screen.getByText('Count: 0')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Increment' }));

  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### The guiding principle

> The more your tests resemble the way your software is used, the more confidence they can give you.

So test **what the user sees and does**, not implementation details (state variables, component names, CSS classes). If you refactor internals without changing behavior, tests should still pass.

### Querying: prefer accessible queries

Priority order:

1. `getByRole('button', { name: /save/i })`: how assistive tech sees the page. **Use this first.**
2. `getByLabelText('Email')`: form fields
3. `getByPlaceholderText`, `getByText`: when no role/label fits
4. `getByAltText`, `getByTitle`
5. `getByTestId`: last resort (`data-testid`)

Using roles means your tests double as accessibility checks. If you can't find a button by role, a screen reader can't either.

### Query variants

| Prefix | Missing element | Use for |
|--------|------------------|---------|
| `getBy…` | Throws | Elements that should be there |
| `queryBy…` | Returns `null` | Asserting something is **absent** (`expect(queryByText('x')).not.toBeInTheDocument()`) |
| `findBy…` | Waits, then throws | Elements that appear **asynchronously** |
| `…AllBy…` | Arrays | Multiple matches |

### Always `userEvent`, not `fireEvent`

`userEvent` simulates full interactions (focus, typing char by char, pointer events). `await` every call and create it with `userEvent.setup()`.

---

## 6. Testing forms and callbacks

```tsx
it('submits valid values', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<ContactForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText(/name/i), 'Ana');
  await user.type(screen.getByLabelText(/email/i), 'ana@example.com');
  await user.click(screen.getByRole('button', { name: /send/i }));

  expect(onSubmit).toHaveBeenCalledWith({ name: 'Ana', email: 'ana@example.com' });
});

it('shows an error for an invalid email', async () => {
  const user = userEvent.setup();
  render(<ContactForm onSubmit={vi.fn()} />);

  await user.type(screen.getByLabelText(/email/i), 'nope');
  await user.click(screen.getByRole('button', { name: /send/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent(/valid email/i);
});
```

`vi.fn()` creates a mock function you can inspect (`toHaveBeenCalledTimes`, `toHaveBeenCalledWith`).

---

## 7. Async UI and mocking the network with MSW

**Mock Service Worker** intercepts `fetch` requests at the network level, so your component code is tested **unchanged**:

```bash
npm install -D msw
```

```ts
// src/test/server.ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://api.example.com/todos', () =>
    HttpResponse.json([{ id: 1, title: 'Write tests', completed: false }]),
  ),
];

export const server = setupServer(...handlers);
```

```ts
// src/test/setup.ts (add)
import { server } from './server';
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Test the happy path, and **override** the handler for failures:

```tsx
it('shows todos', async () => {
  render(<Todos />, { wrapper: createWrapper() });
  expect(await screen.findByText('Write tests')).toBeInTheDocument();
});

it('shows an error when the request fails', async () => {
  server.use(http.get('https://api.example.com/todos', () => new HttpResponse(null, { status: 500 })));
  render(<Todos />, { wrapper: createWrapper() });
  expect(await screen.findByRole('alert')).toBeInTheDocument();
});
```

- `findBy…` waits (up to 1s by default) for the element to appear
- `waitFor(() => expect(...))` retries an assertion until it passes
- Don't put multiple assertions or side effects inside `waitFor`

### Wrapping providers

Components that use TanStack Query, a router, or context need their providers. Create a reusable helper:

```tsx
// src/test/utils.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';

export function renderWithProviders(ui: ReactElement, { route = '/' } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}
```

**A fresh `QueryClient` per test** (with `retry: false`) prevents shared cache and slow retries from leaking between tests.

---

## 8. Testing hooks and context

```tsx
import { renderHook, act } from '@testing-library/react';

it('toggles', () => {
  const { result } = renderHook(() => useToggle(false));

  expect(result.current.value).toBe(false);
  act(() => result.current.toggle());
  expect(result.current.value).toBe(true);
});
```

`act` wraps updates that happen outside React's event system. Testing Library's helpers (`user.click`, `findBy`) already handle it.

For hooks that need providers: `renderHook(() => useCart(), { wrapper: CartProvider })`.

Timers (debounce) work with fake timers:

```ts
vi.useFakeTimers();
const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), { initialProps: { v: 'a' } });
rerender({ v: 'ab' });
act(() => { vi.advanceTimersByTime(300); });
expect(result.current).toBe('ab');
vi.useRealTimers();
```

---

## 9. Accessibility in tests

```bash
npm install -D vitest-axe
```

```tsx
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
expect.extend(matchers);

it('has no accessibility violations', async () => {
  const { container } = render(<ContactForm onSubmit={vi.fn()} />);
  expect(await axe(container)).toHaveNoViolations();
});
```

It catches missing labels, contrast problems (limited in jsdom), bad ARIA, and more. It complements, not replaces, manual checks (Lesson 18).

---

## 10. What to test, what to skip

**Test**
- Business logic (reducers, selectors, validation, formatting)
- User flows (fill form → submit → success)
- Loading, error, and empty states
- Conditional rendering with real consequences (permissions)
- Bug fixes: write the failing test first, then fix it

**Skip**
- Implementation details (internal state, private functions)
- Third-party libraries (they have their own tests)
- Purely visual styling (use visual regression tools if needed)
- Trivial code (a component that just renders a prop)

### Snapshots

`toMatchSnapshot()` records output and fails on any change. Large snapshots get approved without review and then test nothing. Use small, targeted assertions instead, and inline snapshots only for small stable output.

### Coverage

```bash
npm install -D @vitest/coverage-v8
npx vitest run --coverage
```

Coverage shows which lines ran, **not** whether they were verified. It's useful to find untested areas, but chasing 100% leads to worthless tests. 70 to 80% of meaningful code is a healthy target.

---

## 11. End-to-end tests with Playwright (a first look)

E2E tests drive a real browser against your running app: slow but realistic.

```bash
npm init playwright@latest
```

```ts
import { test, expect } from '@playwright/test';

test('a user can add a todo', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('New todo').fill('Learn Playwright');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText('Learn Playwright')).toBeVisible();
});
```

- Same philosophy: locate by role and label
- Playwright auto-waits for elements, so avoid manual sleeps
- Run `npx playwright test --ui` to debug visually
- Keep E2E to a handful of critical journeys. Lesson 24 runs them in CI

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| Testing implementation details (state, class names) | Tests break on harmless refactors |
| `getByTestId` everywhere | You skip accessibility checks |
| Forgetting `await` on `user.*` or `findBy` | Flaky tests, assertions run too early |
| `getBy` for elements that appear later | Fails immediately. Use `findBy` |
| `getBy` to assert absence | Throws. Use `queryBy` |
| Sharing a `QueryClient` between tests | Cached data leaks across tests |
| Real network calls in tests | Slow, flaky, and dependent on external services |
| Multiple unrelated assertions in one test | Hard to see what failed |
| Relying on `setTimeout` waits | Slow and flaky. Use `findBy` / `waitFor` / fake timers |
| Giant snapshots | Approved blindly, testing nothing |
| Chasing 100% coverage | Low-value tests that slow you down |
| Not cleaning up mocks and timers | Tests that pass alone but fail together |

---

## Key takeaways

- Test behavior as a user experiences it, not implementation.
- Vitest runs tests, Testing Library renders and queries, `user-event` interacts, and jest-dom adds matchers.
- Prefer `getByRole` and `getByLabelText`. Use `findBy` for async and `queryBy` for absence.
- Mock the network with MSW, create a fresh `QueryClient` per test, and wrap providers in a helper.
- Pure logic is cheap to test and high value. Do it first.
- Use a few Playwright tests for critical journeys. Don't chase coverage numbers.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to [Lesson 20: Performance and profiling](../20-performance-and-profiling/README.md).
