# Lesson 01 Project: Hello World with a Custom Layout

Build a small page that proves your environment works and gives you a first taste of components.

---

## Brief

Create a one-page "Hello, I'm learning React" app that shows who you are and what you want to build. It should be made of at least three components and be written in TypeScript.

---

## Requirements

**Must have**

- [ ] Created with Vite using the `react-ts` template
- [ ] A `Header` component with your name and a short tagline
- [ ] A `Main` section component with a paragraph about why you are learning React
- [ ] A `Footer` component with your GitHub username and the current year
- [ ] All three components live in `src/components/` and are used in `App.tsx`
- [ ] The app builds without errors (`npm run build`)

**Nice to have**

- [ ] Replace the default Vite styles with your own CSS (plain CSS is fine; Tailwind comes in Lesson 07)
- [ ] A list of three things you want to build, rendered from an array
- [ ] A favicon and page title that match your app

---

## Getting started

```bash
cd lessons/01-setup/project/starter
npm install
npm run dev
```

If the `starter` folder is empty, create it from the repo root:

```bash
cd lessons/01-setup/project
npm create vite@latest starter -- --template react-ts
cd starter
npm install
```

---

## Suggested structure

```
src/
├── components/
│   ├── Header.tsx
│   ├── Main.tsx
│   └── Footer.tsx
├── App.tsx
├── main.tsx
└── index.css
```

---

## Hints

<details>
<summary>How do I show the current year?</summary>

JavaScript can give you the year, and JSX can display it inside curly braces:

```tsx
<p>© {new Date().getFullYear()} yourname</p>
```
</details>

<details>
<summary>How do I render a list from an array?</summary>

Use `.map()` and give each item a `key`. You will cover this properly in Lesson 06, so a simple version is enough here.
</details>

---

## How to submit

1. Work in your own branch: `git checkout -b yourname/lesson-01`
2. Commit your work with a clear message.
3. Push and open a pull request titled `Lesson 01: yourname`.
4. Ask a friend to review it. A good review answers two questions: does it run, and is the code easy to read?
5. After review, compare with `solution/` if one exists.

---

## Done when

- `npm run dev` shows your page
- `npm run build` passes with no TypeScript errors
- Your PR is open and a friend has reviewed it

Next up: **Lesson 02: JSX and components**.
