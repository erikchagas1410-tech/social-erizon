import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing-shell">
      <div className="landing-card">
        <p className="section-kicker">ERIZON SOCIAL AI</p>
        <h1>Command Center pronto para operar.</h1>
        <p>
          A base da central foi estruturada para aprovacao, agendamento,
          monitoramento e atividade em tempo real.
        </p>
        <Link href="/command-center" className="primary-button">
          Abrir Command Center
        </Link>
      </div>
    </main>
  );
}
