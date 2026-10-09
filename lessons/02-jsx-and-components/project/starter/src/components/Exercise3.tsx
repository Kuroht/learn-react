// ---------------------------------------------------------------------------
// Exercise 3: Your first prop
// ---------------------------------------------------------------------------
type GreetingProps = {
  name?: string; // the ? makes it optional
};

function Greeting({ name = 'stranger' }: GreetingProps) {
  return <p>Hello, {name}!</p>;
}

export function Exercise3() {
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