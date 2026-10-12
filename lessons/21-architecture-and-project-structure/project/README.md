# Lesson 21 Project: Refactor the Kanban Board to Feature-based Folders

Take your Lesson 17 Kanban board and restructure it using the feature-based architecture, without changing what it does. Then prove the boundaries hold with tooling.

> **Last verified:** October 2026. Check the docs of [`eslint-plugin-boundaries`](https://github.com/javierbrea/eslint-plugin-boundaries), [`dependency-cruiser`](https://github.com/sverweij/dependency-cruiser), and [`knip`](https://knip.dev) for current configuration.

---

## Brief

Your Kanban board works, but it was built in a flat structure and keeps growing. You'll:

1. Capture the current behavior (so you can tell you didn't break it)
2. Split the app into **features** (`board`, `filters`, `theme`, plus maybe `undo`)
3. Extract shared UI, hooks, and utilities
4. Give each feature a public API
5. Add lint rules and tools that **enforce** the rules
6. Document the architecture for the next contributor

You add **no** new user-visible features. Success means the app behaves identically but is easier to change.

This is also a good moment to add a **new feature** at the end (as the real test of the architecture).

Every stage ends with a **checkpoint**: something you can run or check.

---

## Getting started

Start from your Lesson 17 project (and, ideally, the Lesson 19 tests):

```bash
git checkout -b yourname/lesson-21
cp -r <your-lesson-17-project> lessons/21-architecture-and-project-structure/project/starter
cd lessons/21-architecture-and-project-structure/project/starter
npm install
npm install -D eslint-plugin-boundaries dependency-cruiser knip madge
```

Don't have a Kanban board? Use any project with at least three distinct areas of behavior (for example the GitHub explorer or the shopping cart).

---

## Stage 0: Safety net

Before moving anything:

- [ ] `npm run build` and `npm run lint` pass
- [ ] If you have tests, they pass. If not, write at least: pure-logic tests for `moveCard`/`deleteColumn`/undo, and one component test for adding and moving a card
- [ ] Write a **manual regression checklist** in `REFACTOR.md` (10 to 15 steps: add a card, drag it, rename a column, filter, undo, reload, switch theme, ...)
- [ ] Take screenshots of the main states
- [ ] Commit this as "Baseline before refactor"

**Checkpoint:** you can run the checklist and everything passes.

---

## Stage 1: Map the code

In `REFACTOR.md`:

- [ ] List every file in `src/` with a one-line purpose
- [ ] Propose the target structure. For each file write its destination
- [ ] Identify the **features** and which pieces are truly **shared**
- [ ] Draw the intended dependency direction (a simple diagram or ASCII art)
- [ ] List the risks (circular imports, a store used everywhere, components that know too much)

**Checkpoint:** a reviewer could read this and know exactly what you will do.

---

## Stage 2: Foundations

- [ ] Add the `@/` alias to `tsconfig.app.json` and `vite.config.ts` (and the test config)
- [ ] Create the empty skeleton: `app/`, `features/`, `components/`, `hooks/`, `lib/`, `types/`
- [ ] Move `main.tsx`, providers, global CSS, and the root `App` into `app/`
- [ ] Add `eslint-plugin-boundaries` (or the `no-restricted-imports` patterns from the lesson), configured but starting in `warn` mode
- [ ] Commit, with the app running exactly as before

**Checkpoint:** build, lint, and the app all work with the new alias.

---

## Stage 3: Extract shared code first

Shared pieces stabilize first, because everything depends on them.

- [ ] Generic UI (`Button`, `Dialog`, `Input`, `Skeleton`, `ErrorFallback`) to `components/`
- [ ] Generic hooks (`useDebounce`, `useLocalStorage`, `useOnClickOutside`) to `hooks/`
- [ ] Generic helpers (`cn`, `formatDate`, `clamp`, ID generation) to `lib/`
- [ ] Split any `utils.ts` junk drawer by purpose
- [ ] Make sure none of these import from features
- [ ] **One commit per group of moves**, with no behavior changes

**Checkpoint:** shared folders contain no business knowledge (search for "card" or "column" in them: you should find nothing).

---

## Stage 4: Create the features

For each feature (`board`, `filters`, and `theme` at least):

- [ ] Create `features/<name>/` with `components/`, `hooks/`, `lib/` (pure functions), `types.ts`, and `store.ts` as needed
- [ ] Move the files in. Use relative imports inside the feature
- [ ] Separate logic from UI: components call hooks (`useBoard`, `useVisibleCards`), and hooks call selectors and pure functions
- [ ] Put pure logic (`moveCard`, `assertConsistent`, `isOverdue`) in `lib/` with **no React imports** (and test it)
- [ ] Split the board store into the data store and any UI-only state; keep persistence config in the feature
- [ ] Move tests next to the code they test
- [ ] Commit each feature separately

**Checkpoint:** each feature folder can be read in isolation. `features/board` doesn't import `features/theme`.

---

## Stage 5: Public APIs

- [ ] Add an `index.ts` to each feature exporting **only** what others need (for example `BoardPage`, `useBoardStats`, the types)
- [ ] Update all cross-feature imports to use the public API (`@/features/board`)
- [ ] Remove any import of another feature's internals
- [ ] If two features needed each other's internals, resolve it: lift to shared, create a deliberate export, or compose in `app/`
- [ ] Turn the boundary lint rules from `warn` to `error`
- [ ] Write the "public API" of each feature as a short list in its own `README.md`

**Checkpoint:** `npm run lint` is clean with the rules on `error`. Deliberately add a forbidden import and watch it fail.

---

## Stage 6: Thin pages and the API layer

- [ ] `app/` composes the screen: a thin `BoardPage` (or route) that arranges feature components
- [ ] If you had any server calls, move them into `features/*/api/` and wrap them in hooks. Components never call `fetch`
- [ ] Add a `lib/apiClient.ts` if it applies
- [ ] Types shared by several features go in `types/`, but only if truly shared
- [ ] Each page file is under about 60 lines

**Checkpoint:** you can describe each folder in a sentence, and each page reads like a table of contents.

---

## Stage 7: Tooling that keeps it clean

- [ ] `dependency-cruiser` (or `madge --circular`): no circular dependencies. Add an npm script (`npm run deps:check`)
- [ ] `knip`: remove unused files, exports, and dependencies. Add an npm script (`npm run deps:unused`)
- [ ] Optional: generate a dependency graph image and put it in `docs/`
- [ ] Add these checks to your `lint` workflow or a `check` script (Lesson 24 will run them in CI)
- [ ] Add `import/no-default-export` style rules if you want named exports enforced

**Checkpoint:** no cycles, no dead code, and a single `npm run check` runs build, lint, tests, and dependency checks.

---

## Stage 8: Prove it with a new feature

Add one small feature to test the structure: for example **card labels**, **a statistics panel**, or **export to JSON**.

- [ ] Count how many folders you touch. The goal is one feature folder plus a line or two in `app/`
- [ ] Did you want to import something you shouldn't? What did the lint rule force you to do instead?
- [ ] Note in `REFACTOR.md` how the new feature went versus how it would have gone in the flat structure

**Checkpoint:** the new feature lives in its own folder, and removing the folder plus its one import in `app/` removes the feature cleanly.

---

## Stage 9: Document and verify

- [ ] Run the full manual regression checklist from Stage 0. Everything still works
- [ ] Update `README.md` for the project with the structure and the rules
- [ ] Write a short `ARCHITECTURE.md` (or a section) with: the layers, the import rules, "where does this go?" guidance, and how to add a feature
- [ ] Finish `REFACTOR.md`: what moved, what surprised you, what you'd do differently, how long it took
- [ ] `git log --stat` shows small, single-purpose commits

```bash
npm run build
npm run lint
npm test
```

All pass. No `any`.

---

## Requirements checklist

**Must have**

- [ ] Behavior unchanged (the manual checklist passes, and tests pass)
- [ ] Feature-based structure with `app/`, `features/`, and shared `components/`, `hooks/`, `lib/`, `types/`
- [ ] `@/` alias configured everywhere
- [ ] Each feature has a public `index.ts`, and no cross-feature internal imports
- [ ] Shared code doesn't import from features
- [ ] Logic separated from UI: pure functions in `lib/`, hooks for stateful logic
- [ ] Lint rules enforcing the boundaries at `error` level
- [ ] No circular dependencies, and unused code removed
- [ ] `REFACTOR.md` and `ARCHITECTURE.md`
- [ ] Small commits (moves separate from changes)
- [ ] `npm run build`, `npm run lint`, and tests pass

**Nice to have**

- [ ] A generator script (`npm run new:feature <name>`) that scaffolds a feature folder
- [ ] A dependency graph in the docs, generated automatically
- [ ] Per-feature tests colocated and a coverage report per feature
- [ ] Route-level code splitting that follows the feature boundaries
- [ ] Migrate a second project to the same structure and compare

---

## Hints

<details>
<summary>VS Code didn't update my imports when I moved a file</summary>

Move files with the Explorer (drag and drop) or Rename, and accept the "Update imports" prompt. Set `"typescript.updateImportsOnFileMove.enabled": "always"`. After moves, run `npx tsc -b` to find any broken imports.
</details>

<details>
<summary>I get circular dependency warnings</summary>

Run `npx madge --circular src` or `dependency-cruiser` to see the cycle. Usual fixes: move the shared type or function to a lower layer, import from the public API rather than the internals, or combine the two features in `app/`.
</details>

<details>
<summary>Two features both need the same component</summary>

If it's generic, move it to `components/`. If it has business knowledge from feature A, B shouldn't render it directly. Export a deliberate, narrow component from A's public API (like `CardPreview`), or invert the dependency by passing it in as a prop or `children`.
</details>

<details>
<summary>The alias works in Vite but not in Vitest or ESLint</summary>

Vitest reads `vite.config.ts` automatically (put the alias there, or use `vite-tsconfig-paths`). For ESLint's import resolution, install `eslint-import-resolver-typescript` if you use `eslint-plugin-import`.
</details>

<details>
<summary><code>knip</code> reports false positives</summary>

Add the entry files (`src/main.tsx`) and config files in `knip.json`, and mark intentional public exports. Review each report and don't blindly delete.
</details>

<details>
<summary>Where do global CSS and the theme provider go?</summary>

Global CSS and providers that wrap the whole app go in `app/`. The theme **logic** (store, hook, toggle component) is a feature (`features/theme`), which `app/` mounts.
</details>

---

## How to submit

1. Work in your own branch, with a clean, step-by-step history.
2. Push and open a pull request titled `Lesson 21: yourname`, including the before/after folder trees in the description.
3. Ask a friend to review it. A good review asks: can I find the code for any behavior in under a minute, and can I add a feature without touching more than one folder?

---

## Done when

- The app behaves exactly as before, with a structure that's easier to navigate
- Boundaries are enforced by tooling, not by memory
- The new feature was cheap to add
- Build, lint, and tests pass
- Your PR is open and a friend has reviewed it

You've finished Module 5! Next up: **Module 6, Lesson 22: Next.js basics**.
