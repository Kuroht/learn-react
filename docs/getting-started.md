# Getting Started

Everything you need to go from nothing to running your first lesson.

---

## 1. Install the tools

| Tool | Version | Get it |
|------|---------|--------|
| Node.js | 20 or newer (LTS) | [nodejs.org](https://nodejs.org) |
| Git | any recent version | [git-scm.com](https://git-scm.com) |
| VS Code | latest | [code.visualstudio.com](https://code.visualstudio.com) |

Check everything works:

```bash
node --version
npm --version
git --version
```

### VS Code extensions

- **ESLint**: shows lint errors as you type
- **Prettier - Code formatter**: formats your code on save
- **Tailwind CSS IntelliSense**: autocomplete for classes (needed from Lesson 07)

Turn on format on save: open Settings, search for "format on save", and tick it.

---

## 2. Set up Git

Tell Git who you are (once per computer):

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Use the same email as your GitHub account so your commits link to your profile.

---

## 3. Get the repo

```bash
git clone https://github.com/kuroht/learn-react.git
cd learn-react
```

If you are a friend joining the group, you can either:

- **Be added as a collaborator** and push branches directly to this repo, or
- **Fork it** on GitHub and clone your own fork.

---

## 4. Run a lesson project

Each lesson project is its own small app with its own dependencies.

```bash
cd lessons/01-setup/project/starter
npm install
npm run dev
```

Open the address shown in the terminal (usually `http://localhost:5173`).

Stop the server with `Ctrl + C`.

---

## 5. Work through a lesson

1. Read the lesson's `README.md`.
2. Try the `exercises.md` in a scratch project.
3. Open the project's `README.md` and read the brief and requirements.
4. Create a branch and build it.
5. Open a pull request and ask a friend to review.

See [`CONTRIBUTING.md`](../CONTRIBUTING.md) for the branch and pull request rules.

---

## Troubleshooting

**`npm install` fails.** Check `node --version`. If it is lower than 20, update Node.

**Port 5173 is already in use.** Another dev server is running. Stop it, or Vite will pick the next free port and print it.

**The page is blank.** Open the browser console (`F12`) and read the first red error. Most are a typo in an import path or a missing closing tag.

**Red squiggles everywhere in VS Code.** Run `npm install` in the project folder, then restart the TypeScript server (`Ctrl/Cmd + Shift + P`, then "TypeScript: Restart TS Server").

**I committed to the wrong branch.** Don't panic. Ask in the group chat and we will fix it together.

---

## Useful commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `git status` | See what changed |
| `git checkout -b name/lesson-XX` | Start a new branch |
| `git add . && git commit -m "message"` | Save your work |
| `git push -u origin name/lesson-XX` | Upload your branch |
