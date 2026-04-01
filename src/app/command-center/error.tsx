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
        <h1>O Command Center nao encontrou dados validos.</h1>
        <p>
          A central esta configurada para operar sem fallback. Se o Supabase nao
          responder, o schema nao existir ou as variaveis estiverem erradas, a
          tela para aqui de forma explicita.
        </p>
        <p className="error-shell__detail">{error.message}</p>
        <button type="button" className="primary-button" onClick={reset}>
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
