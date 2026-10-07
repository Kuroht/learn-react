# Lesson 01: Exercises

Do these in a scratch Vite project (`npm create vite@latest scratch -- --template react-ts`). They are quick, and you do not need to commit them.

---

## Exercise 1: Check your tools

Run these commands and write down the versions you see:

```bash
node --version
npm --version
git --version
```

**Goal:** Node is 20 or newer, and all three commands work.

---

## Exercise 2: Change the page

In `src/App.tsx`:

1. Delete everything inside the returned JSX.
2. Return a single `<h1>` with your name.
3. Save and confirm the browser updates without a manual refresh.

**Question to answer:** Which file tells React where to put your app in the page?

---

## Exercise 3: Make your first component

1. Create `src/components/Greeting.tsx`.
2. Write a `Greeting` component that returns `<p>Hello from a component!</p>`.
3. Import it in `App.tsx` and render it three times.

```tsx
export function Greeting() {
  return <p>Hello from a component!</p>;
}
```

**Goal:** see that one component can be reused many times.

---

## Exercise 4: Meet the TypeScript compiler

Add this to `App.tsx`:

```tsx
const age: number = "twenty";
```

1. Read the error your editor shows.
2. Run `npm run build` and find the same error in the terminal.
3. Fix it, then run the build again until it passes.

**Question to answer:** Why is it better to see this error now than in the browser later?

---

## Exercise 5: Break and read

Introduce each mistake one at a time, read the error message, then fix it:

- Remove a closing `</div>` tag
- Misspell an import path
- Return two sibling elements without a wrapper

**Goal:** get comfortable reading error messages. You will see these a lot.

---

## Exercise 6: Git practice

In a practice branch of your cloned repo:

1. Create a file `notes/hello.md` with one sentence.
2. Commit it with a clear message.
3. Push the branch and open a pull request.
4. Ask a friend to leave one review comment.

**Goal:** go through the full branch, commit, push, and PR cycle once before the real projects.

---

## Check yourself

You are ready for the project if you can answer these without looking:

- What does `npm run dev` do?
- What is the role of `index.html` versus `main.tsx`?
- What does TypeScript do that plain JavaScript does not?
- How do you start a new branch?
