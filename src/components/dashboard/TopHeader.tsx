type TopHeaderProps = {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
};

export function TopHeader({ title, subtitle, actions }: TopHeaderProps) {
  return (
    <header className="top-header">
      <div>
        <p className="section-kicker">Painel ao vivo</p>
        <h2>{title}</h2>
        <p className="top-header__subtitle">{subtitle}</p>
      </div>

      {actions ?? <div className="top-header__actions" />}
    </header>
  );
}
