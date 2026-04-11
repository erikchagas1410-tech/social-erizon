import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing-shell">
      <div className="landing-card">
        <p className="section-kicker">ERIZON SOCIAL AI</p>
        <h1>Command Center pronto para operar.</h1>
        <p>
          Central de operacao de conteudo com IA — aprovacao, agendamento,
          monitoramento e publicacao em tempo real.
        </p>
        <div className="landing-actions">
          <Link href="/command-center" className="primary-button">
            Abrir Command Center
          </Link>
          <Link href="/traffic-agent" className="primary-button" style={{ marginLeft: "8px", marginRight: "8px", backgroundColor: "#BC13FE" }}>
            Traffic Agent
          </Link>
          <Link href="/growth-analyst" className="primary-button primary-button--growth">
            Analista de Growth
          </Link>
        </div>
      </div>
    </main>
  );
}
