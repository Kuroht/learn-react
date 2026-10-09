// ---------------------------------------------------------------------------
// Exercise 2: Curly braces
// ---------------------------------------------------------------------------

export function Exercise2() {
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