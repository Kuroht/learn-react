# Contributing

Thanks for helping make this repo better. This guide covers how we work together, whether you are doing a lesson or adding to the repo.

---

## Two ways to contribute

1. **Learner submissions**: you build a lesson project and open a pull request so friends can review it.
2. **Repo improvements**: you fix a typo, improve an explanation, or add a lesson.

---

## Branch naming

| Purpose | Format | Example |
|---------|--------|---------|
| Lesson project | `yourname/lesson-XX` | `ana/lesson-04` |
| Docs or fixes | `fix/short-description` | `fix/typo-in-lesson-02` |
| New lesson | `lesson/XX-topic` | `lesson/13-custom-hooks` |

Never commit directly to `main`.

---

## Commit messages

Write short, clear messages in the imperative mood:

```
Add todo list project
Fix typo in lesson 03 guide
Refactor cart into feature folder
```

Avoid messages like `update`, `stuff`, or `fix`.

---

## Pull requests

1. Push your branch and open a pull request against `main`.
2. Fill in the pull request template.
3. Ask at least one friend to review.
4. Address review comments with new commits.
5. Merge once you have an approval and the checks pass.

### Reviewing a friend's code

Be kind and specific. A good review:

- Says what works well
- Asks questions instead of giving orders ("what happens if the list is empty?")
- Points out one or two things to improve, not twenty
- Checks that it runs, and that the code is easy to read

---

## Code style

- **TypeScript strict mode**, no `any`
- **Function components** only
- **ESLint and Prettier** must pass before you open a pull request
- One component per file, named in `PascalCase` (`ProductCard.tsx`)
- Hooks start with `use` and are named in `camelCase` (`useLocalStorage.ts`)
- Prefer small components with a single responsibility
- Keep logic in hooks and presentation in components

Run before every push:

```bash
npm run lint
npm run build
```

---

## Adding a new lesson

Copy this structure:

```
lessons/XX-topic/
├── README.md          # the lesson guide
├── exercises.md       # short practice tasks
├── examples/          # small runnable demos (optional)
└── project/
    ├── README.md      # brief, requirements, hints, how to submit
    ├── starter/       # starting code
    └── solution/      # reference solution
```

### Lesson guide template

Each lesson `README.md` should have:

1. **Goal, time, and prerequisites**
2. **What you will learn**: a short bullet list
3. **Explanation sections** with small code examples
4. **Key takeaways**
5. **Next steps** linking to exercises and project

### Project brief template

Each project `README.md` should have:

1. **Brief**: what to build, in two or three sentences
2. **Requirements**: split into must-have and nice-to-have checklists
3. **Hints**: use `<details>` blocks so learners can choose when to peek
4. **How to submit**
5. **Done when**: clear, testable criteria

### Solutions

Add the `solution/` folder only after someone has attempted the project. Learners should be able to compare their own work against it.

---

## Reporting problems

Open a GitHub issue with:

- What you expected
- What happened instead
- The lesson number and the steps to reproduce

---

## Be kind

Everyone here is learning. No question is too basic, and no code review should make someone feel small.
