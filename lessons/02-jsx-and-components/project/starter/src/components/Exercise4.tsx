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

export function Exercise4() {
  return (
    <section>
      <h2>Exercise 4: Badge</h2>
      <Badge label="Messages" count={3} />
      <Badge label="Alerts" count={12} highlighted />
    </section>
  );
}