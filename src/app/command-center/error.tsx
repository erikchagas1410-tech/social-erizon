"use client";

type CommandCenterErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CommandCenterError({
  error,
  reset
}: CommandCenterErrorProps) {
  return (
    <main className="command-center-shell">
      <div className="error-shell">
        <span className="section-kicker">Dados reais obrigatorios</span>
        <h1>O Command Center nao conseguiu ler a operacao real.</h1>
        <p>
          A central continua sem fallback. Se algum erro escapar da camada
          principal de leitura, ele aparece aqui de forma diagnostica para
          acelerar a correcao do ambiente real.
        </p>
        <p className="error-shell__detail">{error.message}</p>
        <button type="button" className="primary-button" onClick={reset}>
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
