"use client";

type GenerateContentErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GenerateContentError({
  error,
  reset
}: GenerateContentErrorProps) {
  return (
    <main className="command-center-shell">
      <div className="error-shell">
        <span className="section-kicker">Geracao indisponivel</span>
        <h1>A camada real de criacao nao conseguiu carregar.</h1>
        <p>
          Sem Supabase valido ou sem acesso ao fluxo de geracao, a tela de criacao para
          de forma explicita. Aqui nao existe demonstracao vazia.
        </p>
        <p className="error-shell__detail">{error.message}</p>
        <button type="button" className="primary-button" onClick={reset}>
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
