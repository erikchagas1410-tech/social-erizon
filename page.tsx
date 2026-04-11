"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  role: "user" | "agent";
  content?: string;
  data?: any; // Para armazenar o JSON estruturado do agente
  isLoading?: boolean;
};

export default function TrafficAgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "agent",
      content: "Olá. Eu sou o ERIZON TRAFFIC AI. Me diga o nicho ou modelo de negócio e eu montarei a máquina de aquisição e vendas perfeita para você.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isAggressive, setIsAggressive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    const loadingMsg: Message = { id: "loading", role: "agent", isLoading: true };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");

    try {
      const res = await fetch("/api/traffic-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: userMsg.content,
          mode: isAggressive ? "agressivo" : "padrao",
        }),
      });

      const data = await res.json();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === "loading"
            ? { id: Date.now().toString(), role: "agent", data }
            : msg
        )
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === "loading"
            ? { id: Date.now().toString(), role: "agent", content: "Erro de conexão com o núcleo de inteligência. Tente novamente." }
            : msg
        )
      );
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>ERIZON TRAFFIC AI</h1>
          <p style={styles.subtitle}>Estrategista Supremo de Aquisição & Conversão</p>
        </div>
        <label style={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={isAggressive}
            onChange={(e) => setIsAggressive(e.target.checked)}
            style={styles.checkbox}
          />
          Modo Monstro (Oferta Agressiva)
        </label>
      </header>

      {/* CHAT AREA */}
      <main style={styles.chatArea}>
        <div style={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                ...styles.messageRow,
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  ...styles.messageBubble,
                  ...(msg.role === "user" ? styles.userBubble : styles.agentBubble),
                }}
              >
                {msg.role === "agent" && <div style={styles.agentName}>ERIZON AI</div>}
                
                {/* Texto simples */}
                {msg.content && <p style={{ margin: 0 }}>{msg.content}</p>}
                
                {/* Loading state */}
                {msg.isLoading && (
                  <div style={styles.loadingPulse}>
                    Analisando mercado e estruturando máquina de aquisição...
                  </div>
                )}

                {/* Renderizador do JSON (Estratégia Completa) */}
                {msg.data && !msg.data.error && <StructuredReport data={msg.data} />}
                {msg.data?.error && <p style={{ color: "#ff4d4d" }}>Erro: {msg.data.error}</p>}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* INPUT AREA */}
      <footer style={styles.inputArea}>
        <form onSubmit={handleSend} style={styles.inputForm}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite o nicho (ex: Clínica de estética premium, Advogado trabalhista)..."
            style={styles.input}
            autoFocus
          />
          <button type="submit" disabled={!input.trim()} style={styles.sendButton}>
            Gerar Estratégia
          </button>
        </form>
      </footer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPONENTE PARA RENDERIZAR O JSON DE FORMA BONITA                          */
/* -------------------------------------------------------------------------- */
function StructuredReport({ data }: { data: any }) {
  const {
    raio_x, icp, segmentacao, estrutura_campanha,
    criativos, copy_completa, funil, script_vendas,
    metricas, plano_otimizacao, estrategia_escala, pitch_venda_servico
  } = data;

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#111424", borderRadius: "12px", border: "1px solid #2A2E45" }}>
      <h3 style={{ margin: "0 0 12px 0", color: "#00F2FF", fontSize: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>
        {title}
      </h3>
      <div style={{ fontSize: "14px", color: "#D1D5DB", lineHeight: "1.6" }}>{children}</div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {raio_x && (
        <Section title="🧠 1. Raio-X do Negócio">
          <p><strong>Produto/Serviço:</strong> {raio_x.produto}</p>
          <p><strong>Ticket Médio:</strong> {raio_x.ticket_medio}</p>
          <p><strong>Margem:</strong> {raio_x.margem}</p>
          <p><strong>Tipo de Venda:</strong> {raio_x.tipo_venda}</p>
          <p><strong>Nível de Consciência:</strong> {raio_x.nivel_consciencia}</p>
        </Section>
      )}

      {icp && (
        <Section title="🎯 2. Cliente Ideal (ICP)">
          <p><strong>Perfil:</strong> {icp.idade}, {icp.genero}, {icp.localizacao}, {icp.renda} ({icp.profissao})</p>
          <p><strong>Dores:</strong> {icp.dores?.join(" | ")}</p>
          <p><strong>Desejos:</strong> {icp.desejos?.join(" | ")}</p>
          <p><strong>Objeções:</strong> {icp.objecoes?.join(" | ")}</p>
          <p><strong>Gatilhos de Decisão:</strong> {icp.gatilhos_decisao?.join(" | ")}</p>
        </Section>
      )}

      {estrutura_campanha && (
        <Section title="⚙️ 3. Estrutura de Campanha (Meta Ads)">
          <p><strong>Objetivo:</strong> {estrutura_campanha.objetivo}</p>
          <p><strong>Setup:</strong> {estrutura_campanha.qtd_campanhas} Campanhas, {estrutura_campanha.qtd_conjuntos} Conjuntos, {estrutura_campanha.qtd_anuncios} Anúncios</p>
          <p><strong>Orçamento:</strong> {estrutura_campanha.orcamento_sugerido}</p>
          <p><strong>Posicionamentos:</strong> {estrutura_campanha.posicionamentos?.join(", ")}</p>
        </Section>
      )}

      {criativos && Array.isArray(criativos) && (
        <Section title="🔥 4. Criativos Sugeridos">
          <ul style={{ paddingLeft: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {criativos.map((cr: any, i: number) => (
              <li key={i}>
                <strong>[{cr.foco}]</strong> {cr.gancho}
                <br /><span style={{ color: "#9CA3AF" }}>Visual: {cr.visual} | Formato: {cr.formato}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {copy_completa && (
        <Section title="✍️ 5. Copy Principal">
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{copy_completa.texto}</p>
        </Section>
      )}

      {script_vendas && (
        <Section title="💬 6. Script de Vendas (WhatsApp)">
          <p><strong>Abertura:</strong> {script_vendas.primeira_mensagem}</p>
          <p><strong>Diagnóstico:</strong> {script_vendas.diagnostico}</p>
          <p><strong>Quebra Objeção:</strong> {script_vendas.quebra_objecao}</p>
          <p><strong>Fechamento:</strong> {script_vendas.fechamento}</p>
        </Section>
      )}

      {metricas && (
        <Section title="📊 7. Métricas Alvo">
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <span><strong>CPA:</strong> {metricas.cpa_ideal}</span>
            <span><strong>CPL:</strong> {metricas.cpl_ideal}</span>
            <span><strong>CTR:</strong> {metricas.ctr_minimo}</span>
            <span><strong>ROAS:</strong> {metricas.roas_esperado}</span>
          </div>
        </Section>
      )}

      {pitch_venda_servico && (
        <Section title="💼 Pitch para Fechar o Cliente">
          <p style={{ fontStyle: "italic", color: "#FF00E5" }}>"{pitch_venda_servico}"</p>
        </Section>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ESTILOS (Alinhados com a Identidade Erizon)                                */
/* -------------------------------------------------------------------------- */
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#0B0112", // near_black
    color: "#FFFFFF",
    fontFamily: "Inter, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    backgroundColor: "rgba(11, 1, 18, 0.8)",
    backdropFilter: "blur(12px)",
    zIndex: 10,
  },
  title: { margin: 0, fontSize: "20px", fontWeight: 800, letterSpacing: "1px", color: "#BC13FE" },
  subtitle: { margin: "4px 0 0 0", fontSize: "12px", color: "#A0AEC0", textTransform: "uppercase", letterSpacing: "2px" },
  toggleLabel: { display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600, color: "#FF00E5", cursor: "pointer" },
  checkbox: { accentColor: "#FF00E5", width: "16px", height: "16px", cursor: "pointer" },
  chatArea: {
    flex: 1,
    overflowY: "auto",
    padding: "40px",
    backgroundImage: "radial-gradient(circle at center, rgba(37, 99, 235, 0.05) 0, transparent 100%)", // subtle glow
  },
  messagesContainer: { maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" },
  messageRow: { display: "flex", width: "100%" },
  messageBubble: { maxWidth: "85%", padding: "20px", borderRadius: "16px", lineHeight: "1.5", fontSize: "15px" },
  userBubble: { backgroundColor: "#2563EB", color: "#FFFFFF", borderBottomRightRadius: "4px" },
  agentBubble: { backgroundColor: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#E5E7EB", borderBottomLeftRadius: "4px", boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)" },
  agentName: { fontSize: "12px", fontWeight: 700, color: "#00F2FF", marginBottom: "8px", letterSpacing: "1px" },
  loadingPulse: { color: "#22D3EE", fontStyle: "italic", animation: "pulse 1.5s infinite" },
  inputArea: {
    padding: "24px 40px",
    backgroundColor: "#0B0112",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
  },
  inputForm: { maxWidth: "900px", margin: "0 auto", display: "flex", gap: "12px" },
  input: {
    flex: 1, padding: "16px 24px", borderRadius: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#FFFFFF", fontSize: "16px", outline: "none",
  },
  sendButton: {
    padding: "0 32px", borderRadius: "12px", backgroundColor: "#7C3AED", color: "#FFFFFF",
    fontWeight: 700, fontSize: "16px", border: "none", cursor: "pointer", transition: "background 0.2s",
  }
};