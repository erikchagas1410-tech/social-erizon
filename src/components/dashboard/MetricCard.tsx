type MetricCardProps = {
  label: string;
  value: string;
  tone: "violet" | "blue" | "cyan" | "green";
  hint: string;
};

export function MetricCard({ label, value, tone, hint }: MetricCardProps) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <span className="metric-card__label">{label}</span>
      <strong className="metric-card__value">{value}</strong>
      <p className="metric-card__hint">{hint}</p>
    </article>
  );
}
