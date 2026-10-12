# Lesson 17 Project: Kanban Board

Build a Kanban board with columns and cards, drag-and-drop (or buttons), persistence, search, and a global store built with Zustand.

> **Last verified:** October 2026, with Zustand v5. For drag and drop this project suggests [`@dnd-kit`](https://dndkit.com), but its API changes between versions, so check its docs. A fully working button-based "move" is the required baseline.

---

## Brief

A board with three default columns (**To do**, **Doing**, **Done**). Users can:

- Add, rename, and delete columns
- Add, edit, and delete cards (title, description, priority, optional due date)
- Move cards between columns and reorder them
- Filter cards by text and priority
- Undo the last destructive action
- See counts per column and overall progress

All state lives in a Zustand store and is saved to `localStorage`.

Every stage ends with a **checkpoint**: something you should see in the browser.

---

## Getting started

```bash
cd lessons/17-global-state-zustand/project
npm create vite@latest starter -- --template react-ts
cd starter
npm install
npm install zustand tailwindcss @tailwindcss/vite
npm install @dnd-kit/core @dnd-kit/sortable   # for drag and drop (Stage 6)
npm run dev
```

Suggested structure:

```
src/features/board/
├── types.ts
├── store.ts            # the Zustand store
├── selectors.ts        # custom hooks and pure selector helpers
├── components/ (Board, Column, Card, CardDialog, AddCard, Toolbar)
└── index.ts            # public API
```

Work in your own branch: `git checkout -b yourname/lesson-17`

---

## Stage 1: Types and normalized state

A flat, **normalized** shape is easier to update than nested arrays:

```ts
export type Priority = 'low' | 'medium' | 'high';

export type Card = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate?: string; // YYYY-MM-DD
};

export type Column = {
  id: string;
  title: string;
  cardIds: string[]; // order matters
};

export type BoardData = {
  cards: Record<string, Card>;
  columns: Record<string, Column>;
  columnOrder: string[];
};
```

- [ ] Types exported, with seed data containing 3 columns and about 6 cards
- [ ] `src/features/board/store.ts` creates the store with `create<BoardState>()(...)`, holding `BoardData` plus an `actions` object
- [ ] Why is `cardIds: string[]` on the column better than `cards: Card[]` inside it? (Write your answer in `NOTES.md`)

**Checkpoint:** `useBoardStore.getState()` in the console prints the seed data.

---

## Stage 2: Read the board

- [ ] `Board` renders the columns in `columnOrder`
- [ ] `Column` reads **its own** column with a selector (`s.columns[id]`) and renders its cards by id
- [ ] `Card` selects its own card by id
- [ ] Each component selects the smallest slice. Turn on "Highlight updates" and confirm that editing one card re-renders only that card
- [ ] Column header shows the title and card count

**Checkpoint:** the board renders, and one card changing doesn't re-render the others.

---

## Stage 3: Card actions

Under `actions` in the store:

- [ ] `addCard(columnId, input)`: creates an id with `crypto.randomUUID()`
- [ ] `updateCard(id, patch)`
- [ ] `deleteCard(id)`: also removes the id from its column
- [ ] `moveCard(cardId, toColumnId, toIndex)`: removes it from the old column and inserts it in the new position (works within the same column too)
- [ ] Everything is immutable (or use the `immer` middleware)
- [ ] UI: "Add card" form at the bottom of a column, an edit dialog (use `<dialog>`), a delete button, and **"Move to…" buttons or a select** for keyboard users

**Checkpoint:** you can create, edit, move, and delete cards without any drag and drop.

---

## Stage 4: Column actions

- [ ] `addColumn(title)`, `renameColumn(id, title)`, `deleteColumn(id)`
- [ ] Deleting a column with cards asks for confirmation and deletes its cards from `cards` too (no orphans!)
- [ ] `moveColumn(id, toIndex)` (buttons for now)
- [ ] Inline rename: double-click the title or use an edit button, Enter saves, Escape cancels

**Checkpoint:** after any sequence of actions, every card id in `columns` exists in `cards` and vice versa. Write a small `assertConsistent(state)` helper to check it in development.

---

## Stage 5: Filters and derived data

Filters are **UI state**. Keep them in a second, small store (or a slice) that isn't persisted:

- [ ] `useFilterStore` with `query` and `priority: Priority | 'all'`
- [ ] Cards that don't match are hidden (not removed) in each column. The column count shows "2 of 5" when filtering
- [ ] A progress bar: percentage of cards in the last column, computed in a selector and returned as a **primitive** so it doesn't cause extra renders
- [ ] Overdue cards (past due date and not in the last column) are highlighted
- [ ] A `useShallow` example somewhere: selecting several values at once

**Checkpoint:** typing in the filter updates the visible cards, and the progress bar changes when you move a card to "Done".

---

## Stage 6: Drag and drop

- [ ] Use `@dnd-kit` to drag cards between and within columns, calling `moveCard` on drop
- [ ] Keyboard dragging works (dnd-kit supports it). Announce changes with its `announcements` option
- [ ] A drag overlay so the card follows the pointer
- [ ] The button-based "Move to…" stays as an accessible alternative

**Checkpoint:** you can reorder cards with the mouse and with the keyboard.

---

## Stage 7: Persistence and undo

- [ ] Wrap the board store with `persist`. Use `partialize` to save only the board data (not actions, not filters), and set `version: 1`
- [ ] Validate on load: if the stored data is invalid (broken references), fall back to the seed data. A Zod schema or your `assertConsistent`
- [ ] A "Reset board" button
- [ ] **Undo:** keep a small history (last 10 snapshots of `BoardData`) before destructive actions (delete card, delete column, move). `undo()` restores the previous snapshot. Keep the history out of `persist`
- [ ] `devtools` middleware enabled in development, with action names like `board/moveCard`

**Checkpoint:** refresh and the board is intact. Delete a card, press Undo, and it's back in the same spot.

---

## Stage 8: Quality pass

- [ ] Test the store without React: write plain functions or Vitest tests for `moveCard`, `deleteColumn`, and undo (or console checks if you haven't installed Vitest yet)
- [ ] Tab through the whole board. Every action is reachable by keyboard
- [ ] Visible focus, labels on icon buttons (`aria-label`), and confirmations for destructive actions
- [ ] Works on a phone: columns scroll horizontally with snap
- [ ] Dark mode (Lesson 08) works

---

## Stage 9: Check your work

```bash
npm run build
npm run lint
```

Both should pass. No `any`.

---

## Requirements checklist

**Must have**

- [ ] Normalized, typed state (`cards`, `columns`, `columnOrder`)
- [ ] A Zustand store using `create<State>()(...)` with actions grouped under `actions`
- [ ] Components select the smallest slice they need. No bare `useStore()` calls
- [ ] Add, edit, delete, and move cards. Add, rename, delete, and reorder columns
- [ ] No orphan cards or dangling ids after any action
- [ ] Filters in a separate, non-persisted store
- [ ] `persist` with `partialize`, `version`, and validation on load
- [ ] Undo for destructive actions
- [ ] Keyboard-accessible alternatives to drag and drop
- [ ] No `any`
- [ ] `npm run build` and `npm run lint` pass

**Nice to have**

- [ ] Drag and drop for columns too
- [ ] Multiple boards with a board switcher
- [ ] Sync the board between tabs with the `storage` event
- [ ] Export and import the board as JSON (validated with Zod)
- [ ] Labels or assignees on cards
- [ ] Slices pattern if the store gets large

---

## Hints

<details>
<summary>Every card re-renders when I edit one</summary>

A component is probably selecting too much, such as the whole `cards` object. Select by id: `useBoardStore((s) => s.cards[id])`. Also check that you update only the edited card's object and keep the others' references (`{ ...s.cards, [id]: { ...s.cards[id], ...patch } }`).
</details>

<details>
<summary>I get "Maximum update depth exceeded" with a selector</summary>

The selector returns a new object or array on every call. Return a primitive, select pieces separately, or wrap with `useShallow`.
</details>

<details>
<summary>How do I implement <code>moveCard</code>?</summary>

1. Find the source column containing `cardId`.
2. Remove the id from the source's `cardIds`.
3. Insert it into the destination's `cardIds` at `toIndex`. If the same column, compute the index **after** removal.
4. Return new `columns` with only those two changed.
</details>

<details>
<summary>How do I keep undo history out of storage?</summary>

Put `history` in the store, but leave it out of `partialize`: `partialize: (s) => ({ cards: s.cards, columns: s.columns, columnOrder: s.columnOrder })`.
</details>

<details>
<summary>Persisted data from an older version breaks the app</summary>

Bump `version` and provide a `migrate` function (or discard old data). Always validate the shape when hydrating.
</details>

<details>
<summary>The filter text is saved to storage</summary>

It's in the same store as the board. Move it to a separate store without `persist`, or leave it out with `partialize`.
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per stage.
3. Push and open a pull request titled `Lesson 17: yourname`, with a short screen recording.
4. Ask a friend to review it. A good review asks: can any sequence of actions leave the board inconsistent, and is each component subscribed to the minimum?

---

## Done when

- The board is fast, persistent, and consistent after any action
- Every action can be done with the keyboard
- `npm run build` and `npm run lint` pass
- Your PR is open and a friend has reviewed it

Next up: **Lesson 18: Error handling, loading states, accessibility**.
