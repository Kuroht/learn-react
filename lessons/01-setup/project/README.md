# Lesson 01 Project: Hello World with a Custom Layout

Build a small "Hello, I'm learning React" page, one small step at a time. You start with plain HTML, add some style, and only then turn the page into components.

---

## Brief

By the end you will have a one-page app that shows who you are and what you want to build. It is made of three components (`Header`, `Main`, `Footer`) and written in TypeScript.

Every stage ends with a **checkpoint**: something you should see in the browser. Don't move on until it works.

---

## Getting started

```bash
cd lessons/01-setup/project/starter
npm install
npm run dev
```

If the `starter` folder is empty, create it first:

```bash
cd lessons/01-setup/project
npm create vite@latest starter -- --template react-ts
cd starter
npm install
npm run dev
```

Open the address the terminal prints (usually `http://localhost:5173`). Keep the dev server running while you work. The page updates every time you save.

Work in your own branch: `git checkout -b yourname/lesson-01`

---

## Stage 1: Erase everything

Goal: start from a blank page, so you know where every line comes from.

1. Open `src/App.tsx`, delete everything, and paste this:

   ```tsx
   function App() {
     return <h1>Hello, World!</h1>;
   }

   export default App;
   ```

2. Open `src/index.css` and delete everything in it, leaving an empty file.
3. You can ignore `App.css`. Nothing uses it any more.

**Checkpoint:** the browser shows a plain "Hello, World!" on a white page.

---

## Stage 2: Write some HTML

Goal: see that JSX is HTML inside JavaScript.

A component can only return **one root element**, so wrap your content in `<main>`:

```tsx
function App() {
  return (
    <main>
      <h1>Hello, World!</h1>
      <p>I'm learning React.</p>
    </main>
  );
}

export default App;
```

Now add your own content inside `<main>`:

- [ ] A paragraph about yourself
- [ ] A list (`<ul>` with three `<li>`) of things you want to build
- [ ] A link to your GitHub profile

**Checkpoint:** all of it shows on the page. Then break something on purpose (delete a closing tag) and read the error message. Fix it.

---

## Stage 3: Add style

Goal: make it look like yours using plain CSS.

1. Put your styles in `src/index.css`. It is already loaded by `main.tsx`.
2. In JSX, use `className` instead of `class`:

   ```tsx
   <main className="page">
   ```

   ```css
   .page {
     max-width: 40rem;
     margin: 0 auto;
     padding: 2rem;
     font-family: system-ui, sans-serif;
   }
   ```

- [ ] A centered layout with a readable width
- [ ] A font, a text color, and a background color you chose
- [ ] The list and the link styled

**Checkpoint:** the page looks different from the default, and you made every decision.

---

## Stage 4: Your first component

Goal: move one piece of the page into its own component.

1. Create the folder `src/components/` and a file `Header.tsx` inside it:

   ```tsx
   export function Header() {
     return (
       <header>
         <h1>Your name</h1>
         <p>Your tagline</p>
       </header>
     );
   }
   ```

2. Import it in `App.tsx` and use it like an HTML tag:

   ```tsx
   import { Header } from './components/Header';

   function App() {
     return (
       <main className="page">
         <Header />
         {/* the rest of your page */}
       </main>
     );
   }
   ```

3. Remove the old `<h1>` from `App.tsx`, since the `Header` now does that job.

Remember: component names start with a **capital letter**.

**Checkpoint:** the page looks the same as before, but the header now comes from `Header.tsx`.

---

## Stage 5: Two more components

Goal: repeat the pattern until it feels natural.

- [ ] `Main.tsx`: a paragraph about why you are learning React, plus your list of things to build
- [ ] `Footer.tsx`: your GitHub username and the current year
- [ ] Both live in `src/components/` and are used in `App.tsx`

**Checkpoint:** `App.tsx` is now short and mostly reads like a table of contents:

```tsx
<>
  <Header />
  <Main />
  <Footer />
</>
```

`<>...</>` is a fragment: a wrapper that doesn't add an extra element to the page.

---

## Stage 6: Check your work

```bash
npm run build
```

It should finish without errors. TypeScript is checking your code here, so read any error carefully.

---

## Requirements checklist

**Must have**

- [ ] Created with Vite using the `react-ts` template
- [ ] A `Header` component with your name and a short tagline
- [ ] A `Main` component with a paragraph about why you are learning React
- [ ] A `Footer` component with your GitHub username and the current year
- [ ] All three components live in `src/components/` and are used in `App.tsx`
- [ ] Your own CSS replaces the default Vite styles
- [ ] The app builds without errors (`npm run build`)

**Nice to have**

- [ ] A list of three things you want to build, rendered from an array
- [ ] A favicon and page title that match your app

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

Use `.map()` and give each item a `key`:

```tsx
const ideas = ['A to-do app', 'A weather app', 'A portfolio site'];

<ul>
  {ideas.map((idea) => (
    <li key={idea}>{idea}</li>
  ))}
</ul>
```

You will cover this properly in Lesson 06, so a simple version is enough here.
</details>

<details>
<summary>Nothing shows up, or the page is blank</summary>

Open the browser console (`F12`) and read the first red error. The usual causes are a typo in an import path, a missing closing tag, or a component name that doesn't start with a capital letter.
</details>

<details>
<summary>I deleted a file and now it errors</summary>

Look for an `import` line that points at the deleted file and remove it.
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