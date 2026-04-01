type EmptyStateProps = {
  title: string;
  description: string;
  ctaLabel: string;
};

export function EmptyState({
  title,
  description,
  ctaLabel
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__orb" />
      <h3>{title}</h3>
      <p>{description}</p>
      <button type="button" className="ghost-button">
        {ctaLabel}
      </button>
    </div>
  );
}
