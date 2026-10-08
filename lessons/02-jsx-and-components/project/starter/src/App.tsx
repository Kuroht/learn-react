import type { ReactNode } from 'react';

/*
  Lesson 02: exercise solutions

  Everything is in one file so you can read it top to bottom.
  In a real project each component would live in its own file
  inside src/components/ (see docs/architecture.md).
*/

// ---------------------------------------------------------------------------
// Exercise 1: Fix the JSX
// ---------------------------------------------------------------------------
function Exercise1() {
  return (
    <section>
      <h2>Exercise 1: Fixed JSX</h2>

      {/* a) one root: a fragment wraps the two siblings without adding an element */}
      <>
        <h3>Title</h3>
        <p>Text</p>
      </>

      {/* b) every tag must be closed: <img ... /> */}
      <img src="cat.png" alt="A cat" width={80} />

      {/* c) className, not class */}
      <div className="box">Hello</div>

      {/* d) style takes an object: outer braces = JavaScript, inner braces = object */}
      <p style={{ color: 'red' }}>Hello</p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Exercise 2: Curly braces
// ---------------------------------------------------------------------------
function Exercise2() {
  const user = { name: 'Nathan', age: 30 };
  const language = 'TypeScript';

  return (
    <section>
      <h2>Exercise 2: Curly braces</h2>
      <p>Hello, {user.name}!</p>
      <p>
        {user.name} is {user.age} years old.
      </p>
      <p>
        Next year {user.name} will be {user.age + 1}.
      </p>
      <p>I'm learning {language.toUpperCase()}</p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Exercise 3: Your first prop
// ---------------------------------------------------------------------------
type GreetingProps = {
  name?: string; // the ? makes it optional
};

function Greeting({ name = 'stranger' }: GreetingProps) {
  return <p>Hello, {name}!</p>;
}

function Exercise3() {
  return (
    <section>
      <h2>Exercise 3: Props</h2>
      <Greeting name="Nathan" />
      <Greeting name="Ana" />
      <Greeting name="Rui" />
      <Greeting /> {/* no prop: falls back to 'stranger' */}

      {/*
        Try this to see TypeScript complain (then delete it):
        <Greeting name={42} />
        Error: Type 'number' is not assignable to type 'string'.
      */}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Exercise 4: Props with different types
// ---------------------------------------------------------------------------
type BadgeProps = {
  label: string;
  count: number;
  highlighted?: boolean;
};

function Badge({ label, count, highlighted = false }: BadgeProps) {
  return (
    <span className={highlighted ? 'badge highlighted' : 'badge'}>
      {label} ({count})
    </span>
  );
}

function Exercise4() {
  return (
    <section>
      <h2>Exercise 4: Badge</h2>
      <Badge label="Messages" count={3} />
      <Badge label="Alerts" count={12} highlighted />
    </section>
  );
}

// ---------------------------------------------------------------------------
// Exercise 5: children
// ---------------------------------------------------------------------------
type CardProps = {
  children: ReactNode;
};

function Card({ children }: CardProps) {
  return <div className="card">{children}</div>;
}

function Exercise5() {
  return (
    <section>
      <h2>Exercise 5: Card with children</h2>

      <Card>
        <p>Just a paragraph inside a card.</p>
      </Card>

      <Card>
        <h3>Things I want to build</h3>
        <ul>
          <li>A to-do app</li>
          <li>A weather app</li>
          <li>A portfolio site</li>
        </ul>
      </Card>

      <Card>
        <img src="cat.png" alt="A cat" width={120} />
        <p>A cat, with a caption.</p>
      </Card>

      {/*
        Props vs children:
        - Use a prop for a specific piece of data (a name, a number, a URL).
        - Use children when the component is a container that wraps
          whatever content the parent decides to put inside.
      */}
    </section>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
function App() {
  return (
    <main className="page">
      <Exercise1 />
      <Exercise2 />
      <Exercise3 />
      <Exercise4 />
      <Exercise5 />
    </main>
  );
}

export default App;