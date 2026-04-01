type TopHeaderProps = {
  title: string;
  subtitle: string;
};

export function TopHeader({ title, subtitle }: TopHeaderProps) {
  return (
    <header className="top-header">
      <div>
        <p className="section-kicker">Painel ao vivo</p>
        <h2>{title}</h2>
        <p className="top-header__subtitle">{subtitle}</p>
      </div>

      <div className="top-header__actions">
        <button type="button" className="ghost-button">
          Atualizar
        </button>
        <button type="button" className="primary-button secondary">
          Gerar Post
        </button>
        <button type="button" className="primary-button">
          Gerar Mes
        </button>
      </div>
    </header>
  );
}
