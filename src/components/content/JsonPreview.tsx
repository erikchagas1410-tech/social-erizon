type JsonPreviewProps = {
  title: string;
  value: unknown;
};

export function JsonPreview({ title, value }: JsonPreviewProps) {
  return (
    <section className="panel-shell">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Saida estruturada</p>
          <h3>{title}</h3>
          <p className="panel-header__copy">
            Formato previsivel para persistencia, aprovacao e automacao.
          </p>
        </div>
      </div>

      <pre className="json-preview">{JSON.stringify(value, null, 2)}</pre>
    </section>
  );
}
