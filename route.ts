import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { niche, mode = "padrao" } = body;

    if (!niche) {
      return NextResponse.json(
        { error: "O nicho ou modelo de negócio não foi informado." },
        { status: 400 }
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY não configurada.");
    }

    // 1. Prompt Master (Cérebro do Agente) + Erizon Tone
    const systemPrompt = `Você é o ERIZON TRAFFIC AI, um especialista supremo em tráfego pago, aquisição de clientes e crescimento de negócios.
Você não executa pedidos — você analisa, diagnostica e constrói estratégias lucrativas.
Seu foco é gerar clientes e lucro previsível.
Sempre que receber um nicho ou negócio, entregue uma estratégia COMPLETA, detalhada e executável em JSON estrito.
Você pensa como dono do negócio, não como gestor de anúncios.
Você é direto, estratégico e orientado a ROI. Nunca seja genérico.
Sempre priorize clareza e execução rápida. Se identificar que o problema é oferta, avise no diagnóstico.
Aja também como vendedor do serviço, sugerindo como posicionar essa estratégia para fechar clientes.
Tom de voz: direto, inteligente, premium, anti-genérico. Foco em decisão e dinheiro.

Frases de base mental: 
- "Tráfego não salva oferta ruim."
- "Sem conversão, você só está pagando pra aparecer."
- "Mais importante que tráfego é o que você faz com ele."
- "Escala sem base é prejuízo maior."`;

    // 2. Estrutura Obrigatória de Resposta em JSON Estrito
    const userPrompt = `Construa a máquina de aquisição e vendas suprema para o nicho: "${niche}".
Modo: ${mode} ${
      mode === "agressivo"
        ? "(Modo monstro ativado: seja mais direto, foque em venda rápida, crie urgência e sugira ofertas mais fortes)"
        : ""
    }

Sua resposta DEVE ser um JSON válido com a EXATA estrutura abaixo, sem markdown adicional ou explicações fora do JSON:
{
  "raio_x": { "produto": "", "ticket_medio": "", "margem": "", "tipo_venda": "", "nivel_consciencia": "" },
  "icp": { "idade": "", "genero": "", "localizacao": "", "renda": "", "profissao": "", "interesses_especificos": [], "dores": [], "desejos": [], "medos": [], "objecoes": [], "gatilhos_decisao": [], "comportamento_digital": "" },
  "segmentacao": {
    "frio": { "interesses_diretos": [], "interesses_indiretos": [], "marcas_influenciadores": [], "comportamentos": [] },
    "morno": { "engajamento": [], "video": [], "perfil": [] },
    "quente": { "leads": [], "visitantes": [], "clientes": [], "remarketing": [] }
  },
  "estrutura_campanha": { "objetivo": "", "tipo": "", "qtd_campanhas": 0, "qtd_conjuntos": 0, "qtd_anuncios": 0, "orcamento_sugerido": "", "posicionamentos": [] },
  "criativos": [ 
    { "foco": "Dor forte", "gancho": "", "copy": "", "visual": "", "formato": "", "cta": "" },
    { "foco": "Desejo aspiracional", "gancho": "", "copy": "", "visual": "", "formato": "", "cta": "" },
    { "foco": "Prova/autoridade", "gancho": "", "copy": "", "visual": "", "formato": "", "cta": "" },
    { "foco": "Quebra de objeção", "gancho": "", "copy": "", "visual": "", "formato": "", "cta": "" },
    { "foco": "Direto/oferta", "gancho": "", "copy": "", "visual": "", "formato": "", "cta": "" }
  ],
  "copy_completa": { "texto": "", "estrutura": "Gancho -> Dor -> Solução -> Prova -> CTA" },
  "funil": { "entrada": "", "meio": "", "conversao": "", "pos_venda": "" },
  "script_vendas": { "primeira_mensagem": "", "diagnostico": "", "quebra_objecao": "", "fechamento": "" },
  "metricas": { "cpa_ideal": "", "cpl_ideal": "", "ctr_minimo": "", "taxa_conversao": "", "roas_esperado": "" },
  "plano_otimizacao": { "analise_3_dias": [], "pausar": [], "escalar": [], "novos_testes": [] },
  "estrategia_escala": { "quando_escalar": "", "como_escalar": "", "duplicacao": "", "aumento_orcamento": "", "expansao_publico": "" },
  "pitch_venda_servico": ""
}`;

    // Execução usando o modelo Llama 3.3 de alta performance via Groq
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
        temperature: mode === "agressivo" ? 0.75 : 0.6,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      cache: "no-store",
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message ?? "Falha ao chamar a API da Groq.");
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("A Groq não retornou conteúdo.");
    }

    const parsedJson = JSON.parse(content);

    return NextResponse.json(parsedJson);
  } catch (error) {
    console.error("[TRAFFIC_AGENT_ERROR]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao processar o Agente." },
      { status: 500 }
    );
  }
}