# Lesson 01: Setup

**Goal:** get a working React + TypeScript development environment and understand what each piece does.

**Time:** about 1 to 2 hours

**You will need:** a computer, an internet connection, and a GitHub account.

> **Last verified:** October 2026, with Node 24, npm 11, and Vite's `react-ts` template.
> Tools change quickly. If a command here fails or looks different, read [Tools change](#tools-change-check-the-official-docs) below.

---

## What you will learn

- What React is and what problem it solves
- How to install Node.js and why you need it
- How to create a project with Vite
- What TypeScript adds on top of JavaScript
- The basic Git workflow we use in this repo
- What every file in a fresh Vite project does

---

## 1. What is React?

React is a JavaScript library for building user interfaces out of **components**: small, reusable pieces that describe what part of the screen should look like.

Instead of manually updating the page when data changes, you describe the UI for a given state, and React updates the page for you.

```tsx
function Greeting() {
  return <h1>Hello, world!</h1>;
}
```

That function is a component. You will write hundreds of them.

---

## 2. Install the tools

### Node.js
React tooling runs on Node.js. Install version **20 or newer** from [nodejs.org](https://nodejs.org) (the LTS version is fine).

Check it worked:

```bash
node --version
npm --version
```

### Git
Install from [git-scm.com](https://git-scm.com), then set your identity once:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

### Editor
We recommend [VS Code](https://code.visualstudio.com) with these extensions:

- ESLint
- Prettier
- Tailwind CSS IntelliSense (used from Lesson 07)

---

## 3. Create a project with Vite

Vite is a fast build tool and dev server. It is the standard way to start a React project today.

```bash
npm create vite@latest my-first-app -- --template react-ts
cd my-first-app
npm install
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173`). You should see the Vite + React starter page.

Edit `src/App.tsx`, save, and watch the browser update instantly. This is called **hot module replacement**.

---

## 4. Tour of the project

```
my-first-app/
├── index.html          # the single HTML page; React mounts into it
├── package.json        # dependencies and scripts
├── tsconfig.json       # TypeScript settings
├── vite.config.ts      # Vite settings
├── public/             # static files served as-is
└── src/
    ├── main.tsx        # entry point: mounts <App /> into the page
    ├── App.tsx         # your root component
    ├── App.css         # styles for App
    └── index.css       # global styles
```

The key line is in `main.tsx`:

```tsx
createRoot(document.getElementById('root')!).render(<App />);
```

It finds the `<div id="root">` in `index.html` and tells React to render your app there.

### Useful scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## 5. Why TypeScript?

TypeScript is JavaScript with **types**. It catches mistakes while you type, before you run the code.

```tsx
type GreetingProps = {
  name: string;
};

function Greeting({ name }: GreetingProps) {
  return <h1>Hello, {name}!</h1>;
}

<Greeting name="Ana" />;   // ok
<Greeting name={42} />;    // error: number is not assignable to string
```

You will learn TypeScript gradually, one lesson at a time. For now, just read the red squiggles in your editor: they are helping you.

---

## 6. Git workflow for this repo

We work in branches and open pull requests so friends can review each other's code.

```bash
git checkout -b yourname/lesson-01
# ...do the work...
git add .
git commit -m "Complete lesson 01 project"
git push -u origin yourname/lesson-01
```

Then open a pull request on GitHub and ask a friend to review it.

---

## Tools change: check the official docs

The commands in this lesson were correct when we last verified them, but the way to start a React project has already changed over the years (Create React App, for example, is deprecated and no longer recommended). In a year or two, parts of Section 3 may be out of date.

**Before you create a project, always check the official page:**

[react.dev/learn/installation](https://react.dev/learn/installation)

It explains how the React team currently recommends starting a new app. As of our last check, it offers three routes:

1. **Use a framework** (recommended for production apps)
2. **Build from scratch**, if a framework isn't a good fit or you want to learn the basics
3. **Add React to an existing project**

We use Vite in this repo because it is a simple way to learn React itself without framework features getting in the way. If the official page now says something different, follow it and tell the group so we can update the lessons.

**If a command fails or the prompts look different:**

1. Read the whole error message. It usually says what is wrong.
2. Check the official page above for the current instructions.
3. Compare your Node version with the one in the "Last verified" note (`node --version`).
4. Ask the group, and paste the full error rather than describing it.

**Keeping lessons fresh:** whenever someone re-checks a lesson and it still works, update its "Last verified" line. If something changed, fix the lesson in a pull request.

---

## Key takeaways

- React builds UIs from components.
- Node.js runs the tooling, Vite is the dev server and bundler.
- TypeScript catches errors early.
- `main.tsx` mounts `<App />` into `index.html`.
- Work in branches and use pull requests.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to Lesson 02: JSX and components.