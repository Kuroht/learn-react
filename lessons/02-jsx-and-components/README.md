# Lesson 02: JSX and Components

**Goal:** understand what JSX really is, and how to build a page out of small components that you combine.

**Time:** about 2 hours

**Prerequisite:** [Lesson 01](../01-setup/README.md)

> **Last verified:** October 2026, with React 19 and TypeScript. If something here doesn't match what you see, check [react.dev/learn](https://react.dev/learn) and tell the group.

---

## What you will learn

- What JSX is and how it differs from HTML
- The rules of JSX
- How to put JavaScript values inside JSX with `{ }`
- How to write and combine components
- How to pass data to components with props
- How to type props with TypeScript
- What `children` is and when to use it

---

## 1. What is JSX?

JSX is a syntax that lets you write markup inside JavaScript:

```tsx
const element = <h1>Hello</h1>;
```

Browsers can't read JSX. A tool (Vite does this for you) converts it into plain JavaScript function calls before the page runs. That means JSX is not a string and not HTML. It's JavaScript that *looks* like HTML.

Why bother? Because the logic and the markup that belong together stay together, in one place.

### JSX vs TSX

You'll notice our files end in `.tsx`, not `.jsx`. They are the same syntax:

- **JSX** is the markup syntax (the HTML-looking part).
- **TSX** is JSX inside a **TypeScript** file.

| Extension | Language | Can contain JSX? |
|-----------|----------|------------------|
| `.js` | JavaScript | No |
| `.jsx` | JavaScript | Yes |
| `.ts` | TypeScript | No |
| `.tsx` | TypeScript | Yes |

Everything in this lesson about JSX applies to `.tsx` files unchanged. The only addition is TypeScript's types. A file needs the `.tsx` extension only if it contains JSX tags. A plain helper like `formatPrice.ts` doesn't. In this repo we say "JSX" for the syntax, because that's what the React docs call it.

---

## 2. The rules of JSX

### Rule 1: return one root element

```tsx
// error: two roots
return (
  <h1>Title</h1>
  <p>Text</p>
);

// ok: wrap them
return (
  <div>
    <h1>Title</h1>
    <p>Text</p>
  </div>
);
```

If you don't want an extra `div` in the page, use a **fragment**, which is an empty wrapper:

```tsx
return (
  <>
    <h1>Title</h1>
    <p>Text</p>
  </>
);
```

### Rule 2: close every tag

HTML lets you write `<img src="a.png">` or `<br>`. JSX doesn't:

```tsx
<img src="a.png" alt="A cat" />
<br />
<input type="text" />
```

### Rule 3: attributes use camelCase

Most attributes are the same as HTML, but anything that clashes with JavaScript is renamed:

| HTML | JSX |
|------|-----|
| `class` | `className` |
| `for` | `htmlFor` |
| `onclick` | `onClick` |
| `tabindex` | `tabIndex` |

---

## 3. JavaScript inside JSX: curly braces

Curly braces are a window back into JavaScript. Anything inside `{ }` is evaluated:

```tsx
const name = 'Nathan';
const year = new Date().getFullYear();

return (
  <p>
    Hello, {name}! It is {year}.
  </p>
);
```

You can put **expressions** in braces: variables, math, function calls, ternaries. You can't put statements like `if` or `for`.

```tsx
<p>{2 + 2}</p>                               // 4
<p>{name.toUpperCase()}</p>                  // NATHAN
<p>{isLoggedIn ? 'Welcome back' : 'Hi'}</p>  // a ternary works
```

Braces also set attribute values:

```tsx
<img src={avatarUrl} alt={name} />
<a href={`https://github.com/${username}`}>Profile</a>
```

### Inline styles are objects

```tsx
<p style={{ color: 'teal', fontSize: '1.25rem' }}>Hello</p>
```

The double braces aren't special syntax. The outer pair opens JavaScript, and the inner pair is an object. Property names are camelCase (`fontSize`, not `font-size`). For real styling, prefer CSS classes.

---

## 4. Components

A component is a function that returns JSX. The name **must start with a capital letter**:

```tsx
function Greeting() {
  return <p>Hello!</p>;
}
```

Use it like a tag:

```tsx
<Greeting />
```

React treats lowercase tags (`<p>`) as HTML and capitalized tags (`<Greeting />`) as your components.

### Components can contain components

```tsx
function Page() {
  return (
    <main>
      <Header />
      <Profile />
      <Footer />
    </main>
  );
}
```

That's how you build a whole app: small pieces, nested.

### One component per file

```
src/components/Greeting.tsx
```

```tsx
export function Greeting() {
  return <p>Hello!</p>;
}
```

```tsx
import { Greeting } from './components/Greeting';
```

---

## 5. Props: passing data in

Props are the inputs to a component, like function arguments. You pass them like HTML attributes:

```tsx
<Greeting name="Nathan" />
```

And receive them as an object in the component:

```tsx
type GreetingProps = {
  name: string;
};

export function Greeting({ name }: GreetingProps) {
  return <p>Hello, {name}!</p>;
}
```

Notes:

- `type GreetingProps` is TypeScript. It describes which props exist and what they look like.
- `{ name }` is destructuring: it pulls `name` out of the props object.
- String props can use quotes (`name="Nathan"`). Anything else needs braces: `age={30}`, `isOnline={true}`.

### Optional props and defaults

A `?` makes a prop optional. You can give it a default value:

```tsx
type ButtonProps = {
  label: string;
  color?: string;
};

export function Button({ label, color = 'blue' }: ButtonProps) {
  return <button style={{ background: color }}>{label}</button>;
}
```

### Props are read-only

A component must never change its own props. Data flows **down**, from parent to child. When you need data that changes, you'll use state, which starts in Lesson 04.

---

## 6. `children`: putting things inside a component

Sometimes you want a component to wrap other content, like a box:

```tsx
<Card>
  <h2>Nathan</h2>
  <p>Web developer</p>
</Card>
```

Whatever you put between the tags arrives as a special prop called `children`:

```tsx
import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
};

export function Card({ children }: CardProps) {
  return <section className="card">{children}</section>;
}
```

`ReactNode` is the TypeScript type for "anything React can render": text, elements, arrays, and so on.

Use `children` for containers (cards, layouts, modals), and regular props for specific pieces of data (a name, a URL).

---

## 7. Reusing a component

The point of components is that you write one and use it many times with different data:

```tsx
<ProfileCard name="Nathan" role="Web developer" />
<ProfileCard name="Ana" role="Designer" />
<ProfileCard name="Rui" role="Student" />
```

Same code, three different cards.

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| Component named `profileCard` | Treated as an HTML tag, renders nothing useful |
| Two sibling elements with no wrapper | "JSX expressions must have one parent element" |
| `class="card"` | Warning, use `className` |
| `<img>` without `/>` | Syntax error |
| `style="color: red"` | Error, style must be an object |
| Forgetting the import | "X is not defined" |
| Passing a number as `age="30"` | TypeScript error if the prop is typed `number` |

---

## Key takeaways

- JSX is JavaScript that looks like HTML, and it follows a few strict rules.
- `{ }` lets you use JavaScript values inside JSX.
- A component is a function that returns JSX, and its name starts with a capital letter.
- Props pass data into a component, and TypeScript types describe them.
- `children` lets a component wrap other content.
- Build big things from small, reusable components.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Move on to Lesson 03: Props and TypeScript basics.
