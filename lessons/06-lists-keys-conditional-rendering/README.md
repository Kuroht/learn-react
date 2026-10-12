# Lesson 06: Lists, Keys, and Conditional Rendering

**Goal:** show the right UI for the right data. You'll render lists with `.map()`, understand why keys matter, and choose between the different ways to render conditionally.

**Time:** about 2 hours

**Prerequisite:** [Lesson 05](../05-events-and-forms/README.md)

> **Last verified:** October 2026, with React 19 and TypeScript. Check [react.dev/learn/rendering-lists](https://react.dev/learn/rendering-lists) and [react.dev/learn/conditional-rendering](https://react.dev/learn/conditional-rendering) if anything here doesn't match what you see.

---

## What you will learn

- Rendering lists with `.map()`
- Filtering, sorting, and searching lists without mutating them
- What `key` does and how to choose one
- Conditional rendering: `if`, `&&`, ternary, early return
- Modeling UI states with a union type (`loading`, `error`, `empty`, `ready`)
- Rendering nothing with `null`
- Fragments, and grouping list items

---

## 1. Rendering a list

You've seen this already. Any array can become JSX:

```tsx
type Movie = { id: number; title: string; year: number };

function MovieList({ movies }: { movies: Movie[] }) {
  return (
    <ul>
      {movies.map((movie) => (
        <li key={movie.id}>
          {movie.title} ({movie.year})
        </li>
      ))}
    </ul>
  );
}
```

`.map()` takes each item and returns JSX. The result is an array of elements, which React renders in order.

Use `.map()` (not `.forEach()`), because `forEach` returns nothing.

---

## 2. Transforming before you render

`filter`, `sort`, and `slice` prepare the data:

```tsx
const visible = movies
  .filter((m) => m.title.toLowerCase().includes(query.toLowerCase()))
  .sort((a, b) => b.year - a.year);
```

Careful: `sort` **mutates** the array. If `movies` is a prop or state, copy first:

```tsx
const sorted = [...movies].sort((a, b) => a.title.localeCompare(b.title));
// or in modern runtimes: movies.toSorted(...)
```

Compute these during render (they're derived values), not in state. Keep only the `query` in state.

---

## 3. Keys

```tsx
{movies.map((movie) => (
  <MovieCard key={movie.id} movie={movie} />
))}
```

A `key` tells React **which item is which** between renders. When the list changes, React uses keys to figure out what was added, removed, or moved, and keeps each component's state attached to the right item.

### Choosing keys

| Key | Verdict |
|-----|---------|
| A stable id from your data (`movie.id`) | Best |
| An id generated when the item is created (`crypto.randomUUID()`) | Good |
| The array index | Only for lists that never reorder, insert, or delete |
| `Math.random()` during render | Never. A new key every render means everything is rebuilt |

### What goes wrong with index keys

Imagine a list of inputs keyed by index. Delete the first item and the second item "becomes" index 0, so React reuses the first item's DOM node and state. The text you typed jumps to the wrong row.

Try it yourself in the exercises.

### Where does the key go?

On the **outermost element returned by `.map()`**, not inside the component:

```tsx
// Right
{items.map((item) => <Item key={item.id} item={item} />)}

// Wrong: key inside Item has no effect
function Item({ item }) { return <li key={item.id}>...</li>; }
```

Keys only need to be unique among **siblings**, not globally. And `key` isn't a prop. Your component can't read it with `props.key`.

### Lists of fragments

When each item renders more than one element, use the long Fragment form to give it a key:

```tsx
import { Fragment } from 'react';

{items.map((item) => (
  <Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.description}</dd>
  </Fragment>
))}
```

---

## 4. Conditional rendering

JSX is just JavaScript, so you use JavaScript to choose. There are four common patterns.

### 4.1 `if` and early return

Best when the whole component changes:

```tsx
function Profile({ user }: { user: User | null }) {
  if (!user) {
    return <p>Please log in.</p>;
  }

  return <h1>Welcome, {user.name}</h1>;
}
```

After the check, TypeScript **narrows** `user` to `User`.

### 4.2 Ternary `? :`

Best when you pick between two pieces of JSX:

```tsx
<button>{isFollowing ? 'Unfollow' : 'Follow'}</button>

{isLoggedIn ? <Dashboard /> : <LoginForm />}
```

### 4.3 `&&`

Best when something shows or doesn't:

```tsx
{unreadCount > 0 && <Badge count={unreadCount} />}
{error && <p className="error">{error}</p>}
```

**The `0` trap:** if the left side is the number `0`, React renders `0`!

```tsx
{items.length && <List items={items} />}      // shows "0" when empty
{items.length > 0 && <List items={items} />}  // correct
```

Always make the left side a real boolean.

### 4.4 Variables and helper functions

When logic is long, compute the JSX beforehand:

```tsx
let content: React.ReactNode;
if (status === 'loading') content = <Spinner />;
else if (status === 'error') content = <ErrorMessage />;
else content = <List />;

return <section>{content}</section>;
```

### Rendering nothing

Return `null` to render nothing. `false`, `null`, and `undefined` inside JSX are also ignored:

```tsx
function Banner({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="banner">{message}</div>;
}
```

Avoid deeply nested ternaries. If you have more than two branches, use early returns or a variable.

---

## 5. Modeling UI states

A list screen usually has several states: loading, error, empty, and ready. Don't track them with separate booleans:

```tsx
// Possible to be "loading" and "error" at the same time
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
```

Use one union instead, so impossible states are impossible:

```tsx
type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; movies: Movie[] };
```

Then switch on `status`:

```tsx
function Watchlist({ state }: { state: State }) {
  switch (state.status) {
    case 'loading':
      return <p>Loading...</p>;
    case 'error':
      return <p role="alert">{state.message}</p>;
    case 'ready':
      return state.movies.length === 0 ? (
        <p>Nothing here yet. Add your first movie!</p>
      ) : (
        <MovieList movies={state.movies} />
      );
  }
}
```

This is called a **discriminated union**: `status` is the "tag", and TypeScript knows which other fields exist for each tag. Inside `case 'error'`, `state.message` exists. Inside `case 'ready'`, `state.movies` exists. You'll use this pattern with data fetching in Lesson 10.

Always design the **empty state** (no data) too. It's the first thing new users see.

---

## 6. Updating items in a list

Each item has its own controls, and they call callbacks with the `id`:

```tsx
function MovieList({ movies, onRemove, onToggleWatched }: MovieListProps) {
  return (
    <ul>
      {movies.map((m) => (
        <MovieItem
          key={m.id}
          movie={m}
          onRemove={() => onRemove(m.id)}
          onToggleWatched={() => onToggleWatched(m.id)}
        />
      ))}
    </ul>
  );
}
```

The state still lives in the parent, and you use the immutable patterns from Lesson 04 (`map`, `filter`, spread).

---

## 7. Grouping and counting

Sometimes you need to group items. Plain objects and `reduce` do the job:

```tsx
const byGenre = movies.reduce<Record<string, Movie[]>>((groups, movie) => {
  (groups[movie.genre] ??= []).push(movie);
  return groups;
}, {});

Object.entries(byGenre).map(([genre, list]) => (
  <section key={genre}>
    <h2>{genre} ({list.length})</h2>
    <MovieList movies={list} />
  </section>
));
```

`.push` is fine here because `groups` is a **new local object** created in this render, not state.

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| No `key` in `.map()` | Console warning, possible bugs |
| `key={index}` on a reorderable list | State sticks to the wrong item |
| `key={Math.random()}` | Everything remounts every render |
| Putting `key` inside the child component | It has no effect |
| `{count && <X />}` with `count = 0` | Renders `0` on screen |
| Calling `.sort()` on props or state | Mutates it. Copy first |
| `.map()` with `{}` and no `return` | Renders nothing (an arrow function body needs `return`) |
| Separate `isLoading` / `isError` booleans | Impossible combinations. Use a union |
| Forgetting the empty state | A blank screen that looks broken |

---

## Key takeaways

- `.map()` turns data into JSX. `.filter()` and `.sort()` (on a copy) prepare it.
- Every item in a list needs a stable, unique `key`. Prefer ids, not indexes.
- Choose conditionals by shape: early return for whole components, `? :` for either/or, `&&` for show/hide.
- Make the left side of `&&` a real boolean to avoid the `0` bug.
- A discriminated union describes UI states cleanly and gives you type narrowing.
- Always design the loading, error, and empty states.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to Module 2 with Lesson 07: Tailwind fundamentals.
