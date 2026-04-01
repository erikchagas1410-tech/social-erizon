# ERIZON SOCIAL AI

Central operacional em Next.js para aprovacao, agendamento, publicacao e monitoramento de conteudo.

## Rodando localmente

1. Instale as dependencias com `npm install`
2. Copie `.env.example` para `.env.local`
3. O projeto Supabase informado usa a URL `https://ibyrzjkcehurueiwntzv.supabase.co`
4. Preencha `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`
5. Rode `npm run dev`

## Estrutura principal

- `src/app/command-center/page.tsx`: tela principal da central
- `src/components/dashboard/*`: componentes visuais da operacao
- `src/lib/dashboard.ts`: agregacao dos dados do painel
- `src/app/command-center/actions.ts`: acoes server-side para aprovacao e agendamento
- `supabase/command-center.sql`: schema inicial do banco

## Comportamento

- Sem credenciais Supabase, a central usa mock tipado
- Com `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`, a central carrega metricas, proximos posts e feed de atividade
- Os botoes de aprovacao e agendamento passam a operar via server actions

## Git

- O repositório local foi inicializado e conectado ao remoto `https://github.com/erikchagas1410-tech/social-erizon.git`
- O remoto atualmente está vazio, entao esta base pode servir como primeira estrutura do projeto
