import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref?: string;
};

export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref = "/approval"
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__orb" />
      <h3>{title}</h3>
      <p>{description}</p>
      <Link href={ctaHref} className="ghost-button">
        {ctaLabel}
      </Link>
    </div>
  );
}
