// ---------------------------------------------------------------------------
// Exercise 1: Fix the JSX
// ---------------------------------------------------------------------------

export function Exercise1() {
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