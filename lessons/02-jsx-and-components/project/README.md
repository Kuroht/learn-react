# Lesson 02 Project: Personal Profile Card

Build a profile card, first as plain HTML, then as a reusable component you can show many times with different people.

> **Last verified:** October 2026. Check [react.dev/learn/installation](https://react.dev/learn/installation) for the current way to start a project.

---

## Brief

By the end you will have a page with several profile cards, each showing a photo, a name, a role, a short bio, and some links. All of them come from one `ProfileCard` component.

Every stage ends with a **checkpoint**: something you should see in the browser. Don't move on until it works.

---

## Getting started

Create a new project for this lesson, or reuse your Lesson 01 setup in a new folder:

```bash
cd lessons/02-jsx-and-components/project
npm create vite@latest starter -- --template react-ts
cd starter
npm install
npm run dev
```

Work in your own branch: `git checkout -b yourname/lesson-02`

---

## Stage 1: One card, all in `App.tsx`

Goal: build the card as plain JSX, with no components yet.

Replace `App.tsx` with a single card. Put it inside `<main>`:

```tsx
<article className="card">
  <img src="..." alt="..." />
  <h2>Your name</h2>
  <p>Your role</p>
  <p>A one or two sentence bio.</p>
  <ul>
    <li><a href="...">GitHub</a></li>
  </ul>
</article>
```

- [ ] A photo or avatar (use any image URL, or a file in `public/`)
- [ ] Name, role, and a short bio
- [ ] At least two links

**Checkpoint:** one card shows on the page.

---

## Stage 2: Style it

Goal: make it look like a card.

Put your CSS in `src/index.css` and use `className` in the JSX.

- [ ] A border or shadow, rounded corners, and padding
- [ ] A fixed width, with the content centered
- [ ] A round avatar (`border-radius: 50%`)

**Checkpoint:** it looks like a card you'd be happy to show.

---

## Stage 3: Turn it into a component

Goal: move the card out of `App.tsx`.

1. Create `src/components/ProfileCard.tsx` and move the JSX in.
2. Import and use `<ProfileCard />` in `App.tsx`.
3. Render it **three times**.

**Checkpoint:** you see three identical cards. That's the problem the next stage fixes.

---

## Stage 4: Add props

Goal: make each card show different data.

Define a props type and use it:

```tsx
type ProfileCardProps = {
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
};

export function ProfileCard({ name, role, bio, avatarUrl }: ProfileCardProps) {
  // use the props in your JSX with { }
}
```

- [ ] Pass different values for each of the three cards
- [ ] Use the name in the image's `alt` text, for example `alt={`Photo of ${name}`}`
- [ ] Try leaving a prop out and read the TypeScript error

**Checkpoint:** three different cards from one component.

---

## Stage 5: Optional props and defaults

Goal: handle data that might not exist.

- [ ] Add an optional `location` prop. Show it only when it's passed. (Hint: `{location && <p>{location}</p>}`)
- [ ] Add an optional `isAvailable` boolean with a default of `false`, and show a small "Open to work" badge when it's `true`.

**Checkpoint:** some cards show the extra info and others don't.

---

## Stage 6: Use `children`

Goal: let each card hold custom content at the bottom.

1. Create a `Card` component that only provides the box styling and renders `{children}`.
2. Make `ProfileCard` use `Card` as its outer wrapper.
3. Move the border, shadow, and padding styles to `Card`.

**Checkpoint:** the cards look the same, but the box styling now lives in a reusable `Card`.

---

## Stage 7: Check your work

```bash
npm run build
```

It should pass with no TypeScript errors.

---

## Requirements checklist

**Must have**

- [ ] `ProfileCard` component in `src/components/`
- [ ] Typed props (`ProfileCardProps`), no `any`
- [ ] At least three cards with different data
- [ ] At least one optional prop
- [ ] A `Card` component that uses `children`
- [ ] Your own CSS, with `className` used correctly
- [ ] `npm run build` passes

**Nice to have**

- [ ] Links rendered from an array (you'll learn lists properly in Lesson 06)
- [ ] A hover effect on the card
- [ ] A dark card variant chosen with a prop

---

## Hints

<details>
<summary>How do I use a template string in JSX?</summary>

Use braces and backticks:

```tsx
<img src={avatarUrl} alt={`Photo of ${name}`} />
```
</details>

<details>
<summary>How do I show something only when a prop exists?</summary>

```tsx
{location && <p>{location}</p>}
```

If `location` is `undefined` or an empty string, nothing is rendered.
</details>

<details>
<summary>My component doesn't render</summary>

Check that the name starts with a capital letter, that you imported it, and that you used it with a closing slash (`<ProfileCard />`). Then read the first red error in the browser console.
</details>

---

## How to submit

1. Work in your own branch: `git checkout -b yourname/lesson-02`
2. Commit your work with a clear message.
3. Push and open a pull request titled `Lesson 02: yourname`.
4. Ask a friend to review it.

---

## Done when

- `npm run dev` shows your cards
- `npm run build` passes with no TypeScript errors
- Your PR is open and a friend has reviewed it

Next up: **Lesson 03: Props and TypeScript basics**.
