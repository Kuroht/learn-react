# Lesson 25 Project: Full-stack Recipe Book

Build a server-rendered recipe book with React Router framework mode: typed loaders, forms that work without JavaScript, search in the URL, a login with cookie sessions, and pre-rendered public pages.

> **Last verified:** October 2026, with React Router 8 and Node 24. Check [reactrouter.com](https://reactrouter.com) for the current APIs.

---

## Brief

A recipe site where visitors can browse and search recipes, and logged-in cooks can add, edit, and delete **their own** recipes and save favorites.

| URL | Page | Who |
|-----|------|-----|
| `/` | Home: latest recipes and a search box | Everyone (pre-rendered shell) |
| `/about` | About page | Everyone (pre-rendered) |
| `/recipes` | All recipes, with search and tag filter in the URL | Everyone |
| `/recipes/:recipeId` | A recipe: ingredients, steps, author, favorite button | Everyone (favorite: logged in) |
| `/recipes/new`, `/recipes/:recipeId/edit` | Create and edit forms | Logged-in owner only |
| `/login`, `/logout` | Simple login | Everyone |
| `/me/favorites` | Saved recipes | Logged in |
| anything else | 404 page with a real 404 status | Everyone |

Every stage ends with a **checkpoint**: something you should see in the browser.

---

## Getting started

```bash
cd lessons/25-react-router-framework-mode/project
npx create-react-router@latest starter
cd starter
npm install zod
npm run dev
```

Data storage: keep it simple. Use a JSON file read and written with `node:fs/promises`, or SQLite through Node's built-in `node:sqlite` module. Put all data access in `*.server.ts` files.

Suggested structure:

```
app/
├── root.tsx
├── routes.ts
├── routes/            # thin route modules
├── features/
│   ├── recipes/ (data.server.ts, schemas.ts, components/)
│   └── auth/ (session.server.ts, password.server.ts, context.ts)
└── components/        # shared UI
```

Work in your own branch: `git checkout -b yourname/lesson-25`

---

## Stage 1: Routes and layout

- [ ] `routes.ts` with every URL from the brief (use `prefix('recipes', [...])` and a catch-all `*`)
- [ ] `root.tsx` with a header (logo, links to Recipes and About, Login/Logout), a footer, and `<Outlet />`
- [ ] A root `ErrorBoundary` that shows a friendly page for 404 and for unexpected errors
- [ ] The catch-all route's loader throws `data(null, { status: 404 })`

**Checkpoint:** every URL renders a placeholder, and `/nope` shows your 404 with status **404** in the Network tab.

---

## Stage 2: Data layer

- [ ] Zod schemas and types for `Recipe` (`id`, `title`, `description`, `ingredients: string[]`, `steps: string[]`, `tags: string[]`, `authorId`, `createdAt`) and `User`
- [ ] `data.server.ts`: `listRecipes({ q, tag })`, `getRecipe(id)`, `createRecipe(input, authorId)`, `updateRecipe(id, input, authorId)`, `deleteRecipe(id, authorId)`
- [ ] Update and delete **only** succeed when `authorId` matches (ownership in the data layer)
- [ ] Validate data read from disk with Zod too (it's outside data)
- [ ] Seed 8 to 10 recipes from two different authors

**Checkpoint:** a scratch loader can list recipes, and calling `deleteRecipe` with the wrong author does nothing.

---

## Stage 3: Browse and search

- [ ] `/recipes` loader reads `q` and `tag` from `request.url`, validates them, and returns matching recipes plus the list of all tags
- [ ] A `<Form method="get">` search with `defaultValue` from the loader, and tag links that keep `q`
- [ ] An empty state when nothing matches
- [ ] Pending UI with `useNavigation()` (dim the list while loading)
- [ ] `<Link prefetch="intent">` on recipe cards
- [ ] `meta` with a title that includes the search term

**Checkpoint:** with JavaScript disabled, search and tag filtering still work, and the results are in the HTML source.

---

## Stage 4: Recipe page

- [ ] `/recipes/:recipeId` loader returns the recipe and the author's display name. Missing recipes throw a 404 with `data()`
- [ ] A route-level `ErrorBoundary` with a "Back to recipes" link
- [ ] `meta` with the recipe title and description (check the page source)
- [ ] A `headers` export with a short `Cache-Control` for logged-out visitors (`public, max-age=60`) and `private, no-store` when logged in (decide in the loader, pass the decision through)
- [ ] Ingredients as a list, steps as an ordered list, tags as links

**Checkpoint:** view source shows the full recipe and the right `<title>`.

---

## Stage 5: Login with cookie sessions

- [ ] `session.server.ts` using `createCookieSessionStorage` with `httpOnly`, `sameSite: 'lax'`, `secure` in production, a `maxAge`, and `SESSION_SECRET` from `.env` (add `.env.example`)
- [ ] Users have hashed passwords (Argon2id or bcrypt, Lesson 23). Seed two users
- [ ] `/login` action: validate with Zod, verify the password, return a **generic** error on failure, store the user id in the session, and redirect back to a **safe** `?redirectTo` path
- [ ] `/logout` action destroys the session (use `<Form method="post" action="/logout">`, not a GET link)
- [ ] The root loader returns the current user (only the fields the UI needs) for the header

**Checkpoint:** you can log in and out, and the session cookie has `HttpOnly` and `SameSite=Lax`.

---

## Stage 6: Protected routes with middleware

- [ ] A `userContext` created with `createContext`
- [ ] A middleware that reads the session and sets the user in context (or `null`)
- [ ] A layout route for `/recipes/new`, `/recipes/:recipeId/edit`, and `/me/*` whose middleware redirects anonymous visitors to `/login?redirectTo=...`
- [ ] Loaders and actions read the user from `context.get(userContext)`

**Checkpoint:** visiting `/recipes/new` while logged out sends you to login, and back after you sign in.

---

## Stage 7: Create, edit, delete

- [ ] `/recipes/new` and `/recipes/:recipeId/edit` share a `RecipeForm` component
- [ ] Ingredients and steps are entered one per line in textareas, split and validated on the server
- [ ] Actions return field errors, typed through `actionData`, and the form keeps the submitted values on error
- [ ] Edit and delete check ownership **in the action** (not only by hiding buttons). Someone else's recipe returns 404
- [ ] Delete asks for confirmation and redirects to `/recipes`
- [ ] Pending buttons ("Saving…") with `useNavigation()`

**Checkpoint:** as user B, POST to user A's edit URL with `curl` or a copied fetch. It fails.

---

## Stage 8: Favorites with `useFetcher`

- [ ] A favorite (☆/★) button on recipe cards and pages, using `useFetcher` and posting to a resource route (a route with only an `action`)
- [ ] The star changes instantly (optimistic, from `fetcher.formData`) and rolls back if the action fails
- [ ] `aria-pressed` and an accessible label
- [ ] `/me/favorites` lists saved recipes
- [ ] Anonymous users see a "Log in to save" link instead

**Checkpoint:** starring a recipe never changes the URL, and the favorites page is up to date immediately.

---

## Stage 9: Rendering strategy and deploy

- [ ] `react-router.config.ts`: `ssr: true` and `prerender: ['/about']`
- [ ] Build and check that `build/client/about/index.html` exists
- [ ] `npm start` serves the production build. Test everything with JavaScript on and off
- [ ] Add `"typecheck": "react-router typegen && tsc"` (if missing) and a CI workflow from Lesson 24
- [ ] (Optional) Deploy to a Node host or with the template's `Dockerfile`

---

## Stage 10: Check your work

```bash
npm run typecheck
npm run build
```

Both should pass. No `any`, no hand-written loader data types.

Write `NOTES.md` with a short comparison against your Lesson 22 Next.js blog: what was easier, what was harder, and which you'd choose for this app.

---

## Requirements checklist

**Must have**

- [ ] All routes in `routes.ts`, with a 404 that returns a real 404 status
- [ ] Server loaders and actions using generated `Route` types
- [ ] Data access only in `*.server.ts` files, validated with Zod
- [ ] Search and filters in the URL, working without JavaScript
- [ ] Cookie sessions with hashed passwords and safe redirects
- [ ] Middleware for authentication, plus ownership checks in each action
- [ ] Create, edit, and delete with server validation and pending UI
- [ ] Favorites with `useFetcher` and optimistic UI
- [ ] `meta` on every page, and `Cache-Control` headers on the recipe page
- [ ] At least one pre-rendered route
- [ ] `NOTES.md` comparison
- [ ] `npm run typecheck` and `npm run build` pass

**Nice to have**

- [ ] Image upload for recipes (stored on disk, validated type and size)
- [ ] Pagination in the URL
- [ ] Server-side sessions stored in SQLite, with "log out everywhere"
- [ ] An RSS feed as a resource route (`loader` returning XML)
- [ ] Playwright tests for the main flows, with JavaScript on and off

---

## Hints

<details>
<summary>The <code>./+types/...</code> import can't be found</summary>

Types are generated by the dev server (or `npx react-router typegen`) into `.react-router/types`. Check that `tsconfig.json` includes `.react-router/types/**/*` and has `"rootDirs": [".", "./.react-router/types"]` (the template sets this up), and restart the TypeScript server in your editor.
</details>

<details>
<summary><code>actionData</code> is <code>undefined</code> after a successful submit</summary>

That's expected when the action returns `redirect(...)`. `actionData` is only set when the action returns data (usually validation errors).
</details>

<details>
<summary>How do I set a cookie and redirect at the same time?</summary>

`return redirect('/recipes', { headers: { 'Set-Cookie': await sessionStorage.commitSession(session) } });`
</details>

<details>
<summary>The page doesn't update after my favorite action</summary>

React Router re-runs the loaders of the **current page** after any action (including fetcher actions). Make sure the loader actually reads the updated data from the store (not a cached module variable that you copied at startup).
</details>

<details>
<summary>How do I keep form values after a validation error without JavaScript?</summary>

Return the submitted values from the action along with the errors (`return { errors, values }`), and use them as `defaultValue`s.
</details>

<details>
<summary>The build says a server module was imported into the client</summary>

A component (or a file a component imports) imports something from a `.server.ts` file. Only `loader`, `action`, and `middleware` may use those. Move the import, or pass the data through the loader.
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per stage.
3. Push and open a pull request titled `Lesson 25: yourname`, with screenshots of the page source and of a form working with JavaScript disabled.
4. Ask a friend to review it. A good review asks: can I edit someone else's recipe by calling the action directly, and is anything private returned by a loader?

---

## Done when

- The recipe book works with and without JavaScript, with server-rendered pages and typed data
- Only owners can change their recipes, verified by trying to break it
- `npm run typecheck` and `npm run build` pass
- Your PR is open and a friend has reviewed it

Next up: **Lesson 26: Mobile apps with Expo and React Native**.
