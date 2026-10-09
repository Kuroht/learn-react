// ---------------------------------------------------------------------------
// Exercise 5: children
// ---------------------------------------------------------------------------

import type { ReactNode } from 'react';


type CardProps = {
  children: ReactNode;
};

function Card({ children }: CardProps) {
  return <div className="card">{children}</div>;
}

export function Exercise5() {
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