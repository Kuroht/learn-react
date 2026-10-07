# Learn React

> A hands-on, project-based path to learning modern React with TypeScript, Tailwind CSS, and the tools professional teams actually use. Built by friends, for friends.

Every lesson has three parts: **a short written guide**, **runnable examples**, and **a small project** to build yourself. By the end you will have shipped a portfolio of real apps and understand how to structure a React codebase that scales.

---

## Who is this for?

- You know basic HTML, CSS, and JavaScript.
- You want to learn React the modern way: functional components, hooks, TypeScript from day one.
- You learn best by building things and reviewing each other's code.

No prior React or TypeScript experience needed.

---

## What you will learn

| Area | Topics |
|------|--------|
| **React** | Components, props, state, hooks, effects, context, reducers, custom hooks, performance, error boundaries |
| **TypeScript** | Typing props and state, generics, utility types, typing hooks and API responses |
| **Styling** | Tailwind CSS, responsive design, dark mode, component variants, accessible UI |
| **Tooling** | Vite, ESLint, Prettier, Git workflow, environment variables |
| **Data** | `fetch`, TanStack Query, REST APIs, forms with React Hook Form + Zod |
| **Routing and state** | React Router, Zustand |
| **Testing** | Vitest, React Testing Library, Playwright (intro) |
| **Frameworks** | Next.js (App Router), intro to server components |
| **Architecture** | Feature-based folders, separation of concerns, reusable component design, naming conventions |
| **Shipping** | CI with GitHub Actions, deploying to Vercel / Netlify |

---

## Curriculum

Each module lives in its own folder under `/lessons`. Work through them in order.

### Module 1: Foundations
| # | Lesson | Project |
|---|--------|---------|
| 01 | Setup: Node, Vite, TypeScript, Git | Hello World app with a custom layout |
| 02 | JSX and components | Personal profile card |
| 03 | Props and TypeScript basics | Reusable product card grid |
| 04 | State with `useState` | Counter, then a to-do list |
| 05 | Events and forms | Contact form with live validation |
| 06 | Lists, keys, conditional rendering | Movie watchlist |

### Module 2: Styling with Tailwind
| # | Lesson | Project |
|---|--------|---------|
| 07 | Tailwind fundamentals | Landing page |
| 08 | Responsive design and dark mode | Responsive pricing page with theme toggle |
| 09 | Component variants (`cva`, `clsx`) | Mini design system: Button, Badge, Card, Input |

### Module 3: Hooks in depth
| # | Lesson | Project |
|---|--------|---------|
| 10 | `useEffect` and side effects | Weather app (API calls) |
| 11 | `useRef`, `useMemo`, `useCallback` | Searchable, filterable list with debounce |
| 12 | `useReducer` and context | Shopping cart |
| 13 | Custom hooks | `useLocalStorage`, `useFetch`, `useDebounce` library |

### Module 4: Real-world apps
| # | Lesson | Project |
|---|--------|---------|
| 14 | Routing with React Router | Multi-page blog |
| 15 | Data fetching with TanStack Query | GitHub profile explorer |
| 16 | Forms with React Hook Form + Zod | Multi-step signup wizard |
| 17 | Global state with Zustand | Kanban board |
| 18 | Error handling, loading states, accessibility | Harden a previous project |

### Module 5: Quality
| # | Lesson | Project |
|---|--------|---------|
| 19 | Unit and component testing | Add tests to the shopping cart |
| 20 | Performance and profiling | Optimize a slow list of 10,000 items |
| 21 | Architecture and project structure | Refactor the Kanban board to feature-based folders |

### Module 6: Next.js and shipping
| # | Lesson | Project |
|---|--------|---------|
| 22 | Next.js basics: App Router, server vs client components | Blog migrated to Next.js |
| 23 | Authentication basics | Protected dashboard |
| 24 | CI/CD and deployment | Deploy your favorite project with a GitHub Actions pipeline |

### Final project
Pick an idea (or choose from our list), plan it together, and build it as a team using pull requests and code review.

---

## Repository structure

```
learn-react/
├── README.md
├── CONTRIBUTING.md
├── docs/
│   ├── getting-started.md
│   ├── architecture.md          # how we structure React apps and why
│   ├── typescript-cheatsheet.md
│   ├── tailwind-cheatsheet.md
│   ├── git-workflow.md
│   └── resources.md             # books, videos, articles
├── lessons/
│   ├── 01-setup/
│   │   ├── README.md            # the lesson guide
│   │   ├── examples/            # small runnable demos
│   │   ├── project/
│   │   │   ├── README.md        # project brief + requirements
│   │   │   ├── starter/         # starting code
│   │   │   └── solution/        # reference solution (peek after trying!)
│   │   └── exercises.md
│   ├── 02-jsx-and-components/
│   └── ...
├── shared/                      # reusable UI and utilities used across lessons
└── .github/
    ├── workflows/               # lint, type-check, test on every PR
    └── PULL_REQUEST_TEMPLATE.md
```

---

## Recommended app architecture

From Module 5 onward, projects follow a **feature-based structure**:

```
src/
├── app/            # app setup: providers, router, global styles
├── features/       # one folder per feature (cart, auth, board...)
│   └── cart/
│       ├── components/
│       ├── hooks/
│       ├── api/
│       ├── types.ts
│       └── index.ts   # public API of the feature
├── components/     # shared, generic UI components
├── hooks/          # shared hooks
├── lib/            # helpers, API clients, configs
└── types/          # shared types
```

Principles we follow:
- Small components with a single responsibility
- Logic in hooks, presentation in components
- Features only talk to each other through their public `index.ts`
- Strict TypeScript, no `any`
- Consistent naming and formatting enforced by ESLint and Prettier

Full details in [`docs/architecture.md`](docs/architecture.md).

---

## Getting started

```bash
# 1. Clone the repo
git clone https://github.com/kuroht/learn-react.git
cd learn-react

# 2. Go to a lesson
cd lessons/01-setup/project/starter

# 3. Install and run
npm install
npm run dev
```

**Requirements:** Node.js 20+, Git, a code editor (we recommend VS Code with the ESLint, Prettier, and Tailwind CSS IntelliSense extensions).

New here? Read the full [Getting Started guide](docs/getting-started.md).

---

## Documentation

| Doc | What it covers |
|-----|----------------|
| [Getting Started](docs/getting-started.md) | Installing tools, cloning the repo, running a lesson, troubleshooting |
| [Contributing](CONTRIBUTING.md) | Branch names, commit style, code style, how to review a friend's pull request |
| [Architecture](docs/architecture.md) | How we structure React apps and why |
| [Lesson 01: Setup](lessons/01-setup/README.md) | Start here |

---

## How to use this repo with friends

1. **Read** the lesson guide together or on your own.
2. **Build** the project in your own branch: `git checkout -b yourname/lesson-04`.
3. **Open a pull request** and ask a friend to review it.
4. **Compare** with the reference solution afterward.
5. **Meet weekly** to demo what you built and discuss what was hard.

---

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS · React Router · TanStack Query · Zustand · React Hook Form · Zod · Vitest · React Testing Library · Next.js · ESLint · Prettier · GitHub Actions

---

## Contributing

Found a typo, want to add a lesson, or have a better explanation? PRs are welcome. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for lesson templates and style guidelines.

---

## Roadmap

- [ ] Module 1 to 3 complete with solutions
- [ ] Module 4 to 6 complete with solutions
- [ ] Video walkthroughs
- [ ] Bonus modules: animations (Framer Motion), React Native intro, Storybook
- [ ] Community project gallery

---

## License

MIT. Learn, remix, and share.
