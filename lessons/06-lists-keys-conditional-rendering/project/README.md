# Lesson 06 Project: Movie Watchlist

Build a watchlist app where you can add movies, mark them as watched, rate them, search and filter, and handle empty states well.

> **Last verified:** October 2026. Check [react.dev/learn/installation](https://react.dev/learn/installation) for the current way to start a project.

---

## Brief

A single-page app with a form to add movies, and a list of movie cards. Each card shows the title, year, genre, a watched toggle, a star rating, and a remove button. A toolbar lets the user search by title, filter by status and genre, and sort. Stats at the top show how many movies are watched.

This is the end of Module 1. It combines **props and types (03)**, **state (04)**, **forms (05)**, and **lists and conditionals (06)**.

Every stage ends with a **checkpoint**: something you should see in the browser.

---

## Getting started

```bash
cd lessons/06-lists-keys-conditional-rendering/project
npm create vite@latest starter -- --template react-ts
cd starter
npm install
npm run dev
```

Clear the template code as in earlier lessons.

Work in your own branch: `git checkout -b yourname/lesson-06`

---

## Stage 1: Types and seed data

Create `src/types.ts`:

```ts
export type Genre = 'drama' | 'comedy' | 'action' | 'sci-fi' | 'animation';

export type Movie = {
  id: string;
  title: string;
  year: number;
  genre: Genre;
  watched: boolean;
  rating?: 1 | 2 | 3 | 4 | 5;
};

export type StatusFilter = 'all' | 'to-watch' | 'watched';
export type SortKey = 'title' | 'year' | 'rating';
```

- [ ] Types are exported
- [ ] `src/data/movies.ts` has at least six typed movies across at least three genres, with different `watched` and `rating` values (some without a rating)

**Checkpoint:** no TypeScript errors.

---

## Stage 2: Render the list

- [ ] `MovieCard` shows title, year, genre, and a "Watched" or "To watch" label
- [ ] `MovieList` renders the movies with `.map()` and stable `key`s
- [ ] `App` owns the `movies` state (`useState<Movie[]>(seed)`)

**Checkpoint:** all movies appear, with no key warnings.

---

## Stage 3: Toggle and remove

- [ ] A button on each card toggles `watched` (immutably)
- [ ] A button on each card removes it
- [ ] Watched cards look different (dimmed, or with a check)
- [ ] Callbacks take the `id`, for example `onToggleWatched(id: string)`

**Checkpoint:** toggling and removing affects only the clicked movie.

---

## Stage 4: Add a movie

Reuse what you learned in Lesson 05.

- [ ] `AddMovieForm` with title (text), year (number), and genre (select)
- [ ] Controlled inputs, one state object
- [ ] Validation: title is required, year is between 1888 and next year
- [ ] Errors appear after blur or submit
- [ ] A valid submit adds the movie with `crypto.randomUUID()` and resets the form
- [ ] The new movie starts as unwatched with no rating

**Checkpoint:** you can add a movie and see it at the end of the list.

---

## Stage 5: Rating

- [ ] A `StarRating` component with the props `value?: number` and `onChange(rating: 1 | 2 | 3 | 4 | 5)`
- [ ] Shows five clickable stars; filled up to the current value
- [ ] Only shown for **watched** movies (conditional rendering)
- [ ] Unwatched movies show "Watch it first!" or nothing, instead of the stars
- [ ] Stars are real `<button>`s with an `aria-label` like "Rate 4 out of 5"

**Checkpoint:** rating persists in state, and un-watching a movie hides its stars.

---

## Stage 6: Search, filter, sort

All of this is **derived**. Keep only the control values in state.

- [ ] A search input that filters by title (case-insensitive)
- [ ] A status filter (`StatusFilter`): all / to watch / watched
- [ ] A genre filter with an "All genres" option
- [ ] A sort select (`SortKey`). Never mutate the original array, copy first
- [ ] A "Clear filters" button, shown only when some filter is active

**Checkpoint:** combining filters works and the original list is unchanged.

---

## Stage 7: Every state of the screen

- [ ] **Empty list:** "Your watchlist is empty. Add your first movie!" with a hint to use the form
- [ ] **No results:** "No movies match your filters." with a "Clear filters" button
- [ ] A stats bar: total, watched, to watch, and average rating of rated movies (hide the average when there are no ratings, and watch out for the `0` trap and dividing by zero)

**Checkpoint:** you can reach each of the screens by removing movies or using weird filters.

---

## Stage 8: Check your work

```bash
npm run build
npm run lint
```

Both should pass. No `any`, no `key={index}`, and no mutating of state.

---

## Requirements checklist

**Must have**

- [ ] `Movie`, `Genre`, `StatusFilter`, and `SortKey` types with unions
- [ ] Add, toggle watched, rate, and remove
- [ ] Search, status filter, genre filter, and sort, all derived
- [ ] Rating only visible for watched movies
- [ ] Empty and no-results states
- [ ] Stable keys, immutable updates
- [ ] No `any`
- [ ] `npm run build` and `npm run lint` pass

**Nice to have**

- [ ] Group the list by genre with counts
- [ ] Persist movies in `localStorage` (a taste of Lesson 13)
- [ ] Edit a movie's title in place
- [ ] Undo the last removal
- [ ] Responsive layout tested at phone width

---

## Hints

<details>
<summary>How do I combine several filters?</summary>

Chain them, or use one `filter` with all conditions:

```tsx
const visible = movies
  .filter((m) => m.title.toLowerCase().includes(query.trim().toLowerCase()))
  .filter((m) => status === 'all' || (status === 'watched') === m.watched)
  .filter((m) => genre === 'all' || m.genre === genre);
```
</details>

<details>
<summary>How do I sort without mutating?</summary>

```tsx
const sorted = [...visible].sort((a, b) => {
  if (sortKey === 'title') return a.title.localeCompare(b.title);
  if (sortKey === 'year') return b.year - a.year;
  return (b.rating ?? 0) - (a.rating ?? 0);
});
```
</details>

<details>
<summary>The average shows NaN or 0</summary>

Filter to rated movies first, and only compute if there are any:

```tsx
const rated = movies.filter((m) => m.rating !== undefined);
const average = rated.length > 0
  ? rated.reduce((sum, m) => sum + (m.rating ?? 0), 0) / rated.length
  : null;
```

Then render with `average !== null && ...`.
</details>

<details>
<summary>TypeScript doesn't like my rating type</summary>

`1 | 2 | 3 | 4 | 5` is a union of literals. When you create the stars with `[1, 2, 3, 4, 5]`, write `([1, 2, 3, 4, 5] as const).map(...)` so each value keeps its literal type.
</details>

<details>
<summary>My form lost its values when I added a movie</summary>

Make sure the form resets *after* calling `onAdd`, and that `AddMovieForm` keeps its own form state while `App` only owns the `movies` list.
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per stage.
3. Push and open a pull request titled `Lesson 06: yourname`.
4. Ask a friend to review it. A good review asks: does every screen state have a sensible UI, and is any state stored that could be derived?

---

## Done when

- You can manage a watchlist end to end, with every state handled
- `npm run build` and `npm run lint` pass
- Your PR is open and a friend has reviewed it

You've finished Module 1! Next up: **Module 2, Lesson 07: Tailwind fundamentals**.
