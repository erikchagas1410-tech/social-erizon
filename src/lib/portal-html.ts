export function getPortalHtml(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ERIZON · Agency Portal</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
:root{--bg:#020010;--surface:rgba(255,255,255,0.03);--surface-hover:rgba(255,255,255,0.06);--border:rgba(255,255,255,0.08);--cyan:#00F2FF;--purple:#BC13FE;--pink:#FF00E5;--green:#00FF88;--amber:#FFB800;--red:#FF3366;--muted:rgba(255,255,255,0.5);--dim:rgba(255,255,255,0.2);--sidebar:240px;}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg);color:#fff;font-family:'Plus Jakarta Sans',sans-serif;min-height:100vh;overflow-x:hidden;}
body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(0,242,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,242,255,0.025) 1px,transparent 1px);background-size:44px 44px;pointer-events:none;z-index:0;}
body::after{content:'';position:fixed;width:700px;height:700px;top:-200px;right:-150px;background:radial-gradient(circle,rgba(188,19,254,0.07) 0%,transparent 70%);pointer-events:none;z-index:0;}
.mono{font-family:'JetBrains Mono',monospace;}
.syne{font-family:'Syne',sans-serif;}
.sidebar{position:fixed;left:0;top:0;bottom:0;width:var(--sidebar);background:rgba(2,0,16,0.97);border-right:1px solid rgba(0,242,255,0.08);z-index:100;display:flex;flex-direction:column;backdrop-filter:blur(20px);}
.sb-logo{padding:22px 18px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;gap:12px;}
.logo-mark{width:36px;height:36px;background:linear-gradient(135deg,#BC13FE,#00F2FF);border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:900;font-size:15px;flex-shrink:0;box-shadow:0 0 24px rgba(188,19,254,0.45);}
.logo-text{font-family:'Syne',sans-serif;font-weight:800;font-size:17px;letter-spacing:2px;background:linear-gradient(135deg,#00F2FF,#BC13FE);-webkit-background-clip:text;background-clip:text;color:transparent;}
.logo-sub{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(0,242,255,0.5);letter-spacing:1px;margin-top:1px;}
.nav-group{padding:14px 10px 6px;}
.nav-lbl{font-size:9px;font-weight:700;color:rgba(255,255,255,0.18);letter-spacing:2px;text-transform:uppercase;padding:0 8px;margin-bottom:4px;}
.nav-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;cursor:pointer;transition:all 0.18s;color:var(--muted);font-size:13px;font-weight:500;position:relative;margin-bottom:1px;user-select:none;}
.nav-item:hover{background:rgba(0,242,255,0.05);color:#fff;}
.nav-item.active{background:rgba(0,242,255,0.08);color:var(--cyan);}
.nav-item.active::before{content:'';position:absolute;left:0;top:5px;bottom:5px;width:3px;background:var(--cyan);border-radius:0 2px 2px 0;box-shadow:0 0 8px var(--cyan);}
.nav-ico{font-size:15px;width:20px;text-align:center;flex-shrink:0;}
.nav-badge{margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:10px;padding:1px 6px;border-radius:8px;background:rgba(255,51,102,0.18);color:#FF3366;border:1px solid rgba(255,51,102,0.28);}
.nav-badge.cyan{background:rgba(0,242,255,0.1);color:var(--cyan);border-color:rgba(0,242,255,0.2);}
.sb-footer{margin-top:auto;padding:14px;}
.status-pill{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:8px;background:rgba(0,255,136,0.05);border:1px solid rgba(0,255,136,0.1);}
.dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green);animation:blink 2s infinite;flex-shrink:0;}
@keyframes blink{0%,100%{opacity:1;box-shadow:0 0 8px var(--green);}50%{opacity:.5;box-shadow:0 0 16px var(--green);}}
.main{margin-left:var(--sidebar);min-height:100vh;position:relative;z-index:1;}
.ph{padding:28px 32px 0;display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;}
.pt{font-family:'Syne',sans-serif;font-weight:800;font-size:26px;}
.ps{font-size:13px;color:var(--muted);margin-top:3px;}
.ha{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
.ca{padding:22px 32px 48px;}
.card{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:all 0.2s;}
.card:hover{border-color:rgba(0,242,255,0.18);}
.card-c{border-color:rgba(0,242,255,0.13);box-shadow:0 0 20px rgba(0,242,255,0.04);}
.card-p{border-color:rgba(188,19,254,0.18);box-shadow:0 0 20px rgba(188,19,254,0.04);}
.ch{padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.ct{font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1px;}
.cb{padding:18px;}
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:22px;}
.kpi{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;position:relative;overflow:hidden;transition:all 0.2s;}
.kpi::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}
.kpi-c::before{background:linear-gradient(90deg,transparent,var(--cyan),transparent);}
.kpi-p::before{background:linear-gradient(90deg,transparent,var(--purple),transparent);}
.kpi-g::before{background:linear-gradient(90deg,transparent,var(--green),transparent);}
.kpi-k::before{background:linear-gradient(90deg,transparent,var(--pink),transparent);}
.kpi:hover{transform:translateY(-2px);border-color:rgba(0,242,255,0.18);}
.kpi-lbl{font-size:10px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;}
.kpi-val{font-family:'Syne',sans-serif;font-weight:900;font-size:38px;line-height:1;margin-bottom:5px;}
.kpi-c .kpi-val{color:var(--cyan);text-shadow:0 0 24px rgba(0,242,255,0.5);}
.kpi-p .kpi-val{color:var(--purple);text-shadow:0 0 24px rgba(188,19,254,0.5);}
.kpi-g .kpi-val{color:var(--green);text-shadow:0 0 24px rgba(0,255,136,0.5);}
.kpi-k .kpi-val{color:var(--pink);text-shadow:0 0 24px rgba(255,0,229,0.5);}
.kpi-sub{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.18s;border:1px solid transparent;text-decoration:none;white-space:nowrap;font-family:'Plus Jakarta Sans',sans-serif;}
.btn-p{background:linear-gradient(135deg,rgba(0,242,255,.13),rgba(188,19,254,.13));border-color:rgba(0,242,255,.35);color:var(--cyan);}
.btn-p:hover{background:linear-gradient(135deg,rgba(0,242,255,.22),rgba(188,19,254,.22));box-shadow:0 0 20px rgba(0,242,255,.18);}
.btn-ok{background:rgba(0,255,136,.1);border-color:rgba(0,255,136,.28);color:var(--green);}
.btn-ok:hover{background:rgba(0,255,136,.18);box-shadow:0 0 14px rgba(0,255,136,.18);}
.btn-no{background:rgba(255,51,102,.1);border-color:rgba(255,51,102,.28);color:var(--red);}
.btn-no:hover{background:rgba(255,51,102,.18);box-shadow:0 0 14px rgba(255,51,102,.18);}
.btn-g{background:transparent;border-color:rgba(255,255,255,.1);color:var(--muted);}
.btn-g:hover{background:rgba(255,255,255,.05);color:#fff;}
.btn-neon{background:linear-gradient(135deg,#BC13FE,#00F2FF);border:none;color:#000;font-weight:700;box-shadow:0 0 20px rgba(188,19,254,.4);}
.btn-neon:hover{box-shadow:0 0 32px rgba(188,19,254,.6);transform:translateY(-1px);}
.ap-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
.post-card{background:rgba(255,255,255,.02);border:1px solid rgba(188,19,254,.13);border-radius:14px;overflow:hidden;transition:all .3s;position:relative;}
.post-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--cyan),var(--purple));}
.post-card:hover{border-color:rgba(0,242,255,.28);transform:translateY(-3px);box-shadow:0 20px 40px rgba(0,0,0,.4),0 0 28px rgba(0,242,255,.08);}
.post-img{width:100%;height:250px;object-fit:contain;object-position:center top;border-bottom:1px solid rgba(255,255,255,.05);background:#050711;display:block;padding:10px;}
.post-img-ph{width:100%;height:250px;background:#050711;display:flex;align-items:center;justify-content:center;color:var(--dim);font-size:13px;border-bottom:1px solid rgba(255,255,255,.05);}
.post-body{padding:14px;}
.post-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px;}
.ai-score{font-family:'JetBrains Mono',monospace;font-size:10px;padding:3px 8px;border-radius:4px;background:rgba(0,242,255,.1);color:var(--cyan);border:1px solid rgba(0,242,255,.2);}
.type-badge{font-family:'JetBrains Mono',monospace;font-size:9px;padding:3px 7px;border-radius:4px;background:rgba(255,255,255,.05);color:var(--muted);}
.post-caption{font-size:12px;color:rgba(255,255,255,.6);line-height:1.6;margin-bottom:12px;height:56px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;}
.post-acts{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:rgba(255,255,255,.05);border-radius:12px;overflow:hidden;}
.cal-hd{padding:10px;text-align:center;font-size:10px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:1px;background:rgba(0,242,255,.05);}
.cal-day{background:var(--bg);min-height:76px;padding:7px;transition:background .2s;}
.cal-day:hover{background:rgba(255,255,255,.02);}
.cal-num{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--dim);margin-bottom:4px;}
.cal-num.today{background:rgba(0,242,255,.15);color:var(--cyan);width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;}
.cal-dot{font-size:9px;padding:2px 5px;border-radius:3px;margin-bottom:2px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cal-dot.pending_approval{background:rgba(255,184,0,.18);color:var(--amber);}
.cal-dot.scheduled{background:rgba(0,242,255,.13);color:var(--cyan);}
.cal-dot.published{background:rgba(0,255,136,.13);color:var(--green);}
.cal-dot.rejected{background:rgba(255,51,102,.13);color:var(--red);}
.intel-grid{display:grid;grid-template-columns:2fr 1fr;gap:18px;}
.insight-item{display:flex;align-items:flex-start;gap:10px;padding:13px;border-radius:9px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);margin-bottom:8px;transition:all .18s;}
.insight-item:hover{background:rgba(0,242,255,.03);border-color:rgba(0,242,255,.1);}
.ins-ico{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;}
.ins-ico.c{background:rgba(0,242,255,.1);}
.ins-ico.p{background:rgba(188,19,254,.1);}
.ins-ico.k{background:rgba(255,0,229,.1);}
.ins-ico.g{background:rgba(0,255,136,.1);}
.ins-ico.a{background:rgba(255,184,0,.1);}
.ins-title{font-size:13px;font-weight:600;margin-bottom:3px;}
.ins-body{font-size:12px;color:var(--muted);line-height:1.5;}
.hmap{display:grid;grid-template-columns:auto repeat(24,1fr);gap:2px;font-size:9px;}
.hmap-lbl{padding:0 6px;display:flex;align-items:center;color:var(--dim);font-family:'JetBrains Mono',monospace;font-size:9px;justify-content:flex-end;}
.hmap-h{text-align:center;color:var(--dim);font-family:'JetBrains Mono',monospace;padding-bottom:3px;font-size:9px;}
.hmap-cell{height:18px;border-radius:2px;cursor:pointer;transition:opacity .2s,transform .2s;}
.hmap-cell:hover{opacity:1!important;transform:scale(1.3);}
.act-item{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.04);}
.act-item:last-child{border-bottom:none;}
.act-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:5px;}
.act-dot.c{background:var(--cyan);box-shadow:0 0 6px var(--cyan);}
.act-dot.g{background:var(--green);box-shadow:0 0 6px var(--green);}
.act-dot.p{background:var(--purple);box-shadow:0 0 6px var(--purple);}
.act-dot.a{background:var(--amber);box-shadow:0 0 6px var(--amber);}
.act-txt{font-size:12px;color:var(--muted);line-height:1.5;flex:1;}
.act-time{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--dim);flex-shrink:0;}
.bar-row{margin-bottom:11px;}
.bar-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;}
.bar-lbl{font-size:12px;color:rgba(255,255,255,.7);}
.bar-pct{font-family:'JetBrains Mono',monospace;font-size:11px;}
.bar-bg{height:4px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden;}
.bar-fill{height:100%;border-radius:2px;transition:width .8s ease;}
.sec{display:none;}
.sec.active{display:block;}
.spin{display:inline-block;width:16px;height:16px;border:2px solid rgba(0,242,255,.18);border-top-color:var(--cyan);border-radius:50%;animation:rot .8s linear infinite;}
@keyframes rot{to{transform:rotate(360deg);}}
.sk{background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 75%);background-size:200% 100%;animation:sh 1.5s infinite;border-radius:6px;}
@keyframes sh{to{background-position:-200% 0;}}
.tc{position:fixed;bottom:22px;right:22px;z-index:1000;display:flex;flex-direction:column;gap:7px;}
.toast{padding:11px 18px;border-radius:9px;font-size:13px;font-weight:500;backdrop-filter:blur(20px);animation:tin .3s ease;max-width:300px;display:flex;align-items:center;gap:9px;}
.toast.ok{background:rgba(0,255,136,.13);border:1px solid rgba(0,255,136,.28);color:var(--green);}
.toast.err{background:rgba(255,51,102,.13);border:1px solid rgba(255,51,102,.28);color:var(--red);}
.toast.inf{background:rgba(0,242,255,.1);border:1px solid rgba(0,242,255,.2);color:var(--cyan);}
@keyframes tin{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}
.mo{position:fixed;inset:0;background:rgba(2,0,16,.82);backdrop-filter:blur(12px);z-index:200;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .3s;}
.mo.open{opacity:1;pointer-events:all;}
.modal{background:#080018;border:1px solid rgba(0,242,255,.18);border-radius:14px;padding:26px;max-width:580px;width:92%;max-height:82vh;overflow-y:auto;box-shadow:0 0 60px rgba(188,19,254,.14);transform:scale(.96);transition:transform .3s;}
.mo.open .modal{transform:scale(1);}
.fbtn{font-size:11px!important;padding:5px 12px!important;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(0,242,255,.18);border-radius:2px;}
@media(max-width:900px){:root{--sidebar:58px;}.logo-text,.logo-sub,.nav-lbl,.nav-item span:not(.nav-ico),.nav-badge,.sb-footer .status-pill>div{display:none;}.nav-item{justify-content:center;}.ap-grid{grid-template-columns:1fr 1fr;}.kpi-grid{grid-template-columns:1fr 1fr;}.intel-grid{grid-template-columns:1fr;}}
</style>
</head>
<body>

<nav class="sidebar">
  <div class="sb-logo">
    <div class="logo-mark">E</div>
    <div>
      <div class="logo-text">ERIZON</div>
      <div class="logo-sub">AGENCY OS v2.0</div>
    </div>
  </div>
  <div class="nav-group">
    <div class="nav-lbl">Principal</div>
    <div class="nav-item active" onclick="show('command')"><span class="nav-ico">⚡</span><span>Command Center</span></div>
    <div class="nav-item" onclick="show('approval')"><span class="nav-ico">✅</span><span>Aprovação</span><span class="nav-badge" id="nb" style="display:none">0</span></div>
    <div class="nav-item" onclick="show('calendar')"><span class="nav-ico">📅</span><span>Calendário</span></div>
  </div>
  <div class="nav-group">
    <div class="nav-lbl">Inteligência</div>
    <div class="nav-item" onclick="show('intelligence')"><span class="nav-ico">🧠</span><span>Audiência IA</span></div>
    <div class="nav-item" onclick="show('analytics')"><span class="nav-ico">📊</span><span>Analytics</span></div>
  </div>
  <div class="nav-group">
    <div class="nav-lbl">Produção</div>
    <div class="nav-item" onclick="show('generate')"><span class="nav-ico">✨</span><span>Gerar Conteúdo</span></div>
    <div class="nav-item" onclick="show('studio')"><span class="nav-ico">🎨</span><span>Estúdio de Design</span></div>
  </div>
  <div class="sb-footer">
    <div class="status-pill">
      <div class="dot"></div>
      <div>
        <div style="font-size:11px;font-weight:600;color:#00FF88;">IA Ativa 24/7</div>
        <div class="mono" style="font-size:9px;color:rgba(255,255,255,.3);">Monitorando agendamentos</div>
      </div>
    </div>
  </div>
</nav>

<main class="main">

<!-- COMMAND CENTER -->
<div id="sec-command" class="sec active">
  <div class="ph">
    <div><div class="pt syne">Command Center</div><div class="ps">Visão geral em tempo real da operação de conteúdo</div></div>
    <div class="ha">
      <button class="btn btn-g" onclick="refreshAll()">🔄 Atualizar</button>
      <button class="btn btn-p" onclick="show('generate')">✨ Gerar Post</button>
      <button class="btn btn-neon" onclick="show('approval');setTimeout(genMonthPlan,200)">🗓️ Gerar Mês</button>
    </div>
  </div>
  <div class="ca">
    <div class="kpi-grid">
      <div class="kpi kpi-c"><div class="kpi-lbl">Aguardando Aprovação</div><div class="kpi-val" id="kv-p">—</div><div class="kpi-sub">posts na fila</div></div>
      <div class="kpi kpi-p"><div class="kpi-lbl">Agendados</div><div class="kpi-val" id="kv-s">—</div><div class="kpi-sub">IA vai postar</div></div>
      <div class="kpi kpi-g"><div class="kpi-lbl">Publicados</div><div class="kpi-val" id="kv-pub">—</div><div class="kpi-sub">total no ar</div></div>
      <div class="kpi kpi-k"><div class="kpi-lbl">Taxa de Aprovação</div><div class="kpi-val" id="kv-r">—</div><div class="kpi-sub">aprovados vs gerados</div></div>
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:18px;">
      <div class="card card-c">
        <div class="ch"><span class="ct">📋 Próximos Agendados</span><button class="btn btn-g" style="font-size:11px;padding:4px 10px;" onclick="show('calendar')">Ver calendário →</button></div>
        <div class="cb" id="next-sched"><div style="display:flex;gap:8px;align-items:center;color:var(--muted);font-size:13px;padding:16px 0;"><div class="spin"></div><span>Carregando...</span></div></div>
      </div>
      <div class="card">
        <div class="ch"><span class="ct">⚡ Atividade</span></div>
        <div class="cb" id="act-feed"><div style="display:flex;gap:8px;align-items:center;color:var(--muted);font-size:13px;padding:16px 0;"><div class="spin"></div><span>Carregando...</span></div></div>
      </div>
    </div>
    <div style="margin-top:18px;" class="card card-p">
      <div class="ch"><span class="ct">🚀 Ações Rápidas</span></div>
      <div class="cb">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
          <button class="btn btn-p" style="justify-content:center;flex-direction:column;height:78px;gap:4px;" onclick="show('approval')"><span style="font-size:22px;">✅</span><span style="font-size:11px;">Revisar Fila</span></button>
          <button class="btn btn-g" style="justify-content:center;flex-direction:column;height:78px;gap:4px;border-color:rgba(188,19,254,.2);color:rgba(188,19,254,.8);" onclick="gotoIntel()"><span style="font-size:22px;">🧠</span><span style="font-size:11px;">Analisar Audiência</span></button>
          <button class="btn btn-g" style="justify-content:center;flex-direction:column;height:78px;gap:4px;border-color:rgba(255,0,229,.2);color:rgba(255,0,229,.8);" onclick="show('generate')"><span style="font-size:22px;">✨</span><span style="font-size:11px;">Novo Post IA</span></button>
          <button class="btn btn-g" style="justify-content:center;flex-direction:column;height:78px;gap:4px;" onclick="show('analytics')"><span style="font-size:22px;">📊</span><span style="font-size:11px;">Analytics</span></button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- APPROVAL -->
<div id="sec-approval" class="sec">
  <div class="ph">
    <div><div class="pt syne">Fila de Aprovação</div><div class="ps">Posts gerados pela IA aguardando autorização</div></div>
    <div class="ha">
      <button class="btn btn-g" onclick="loadQueue()">🔄 Atualizar</button>
      <button class="btn btn-p" onclick="genAndQueue()">+ Gerar Post</button>
      <button class="btn btn-neon" onclick="genMonthPlan()" id="month-btn">🗓️ Gerar Mês Completo</button>
    </div>
  </div>
  <div id="month-progress" style="display:none;margin:0 32px 0;padding:14px 18px;background:rgba(0,242,255,0.05);border:1px solid rgba(0,242,255,0.18);border-radius:10px;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
      <div class="spin"></div>
      <span class="mono" style="font-size:12px;color:var(--cyan);" id="month-progress-lbl">Gerando plano mensal... aguarde (~2 min)</span>
    </div>
    <div style="height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden;">
      <div id="month-progress-bar" style="height:100%;width:5%;background:linear-gradient(90deg,#00F2FF,#BC13FE);border-radius:2px;transition:width 3s linear;"></div>
    </div>
  </div>
  <div class="ca">
    <div style="display:flex;gap:8px;margin-bottom:18px;align-items:center;flex-wrap:wrap;">
      <span style="font-size:12px;color:var(--dim);">Filtrar:</span>
      <button class="btn btn-p fbtn" id="fb-pend" onclick="fq(this,'pending_approval')">Pendentes (<span id="cp">0</span>)</button>
      <button class="btn btn-g fbtn" id="fb-sched" onclick="fq(this,'scheduled')">Agendados (<span id="cs">0</span>)</button>
      <button class="btn btn-g fbtn" id="fb-pub" onclick="fq(this,'published')">Publicados (<span id="cpub">0</span>)</button>
      <button class="btn btn-g fbtn" id="fb-all" onclick="fq(this,'all')">Todos</button>
    </div>
    <div class="ap-grid" id="ap-queue"><div style="grid-column:1/-1;display:flex;gap:12px;align-items:center;color:var(--muted);padding:60px 0;justify-content:center;"><div class="spin"></div><span>Carregando fila...</span></div></div>
  </div>
</div>

<!-- CALENDAR -->
<div id="sec-calendar" class="sec">
  <div class="ph">
    <div><div class="pt syne">Calendário Editorial</div><div class="ps">Posts agendados e publicados</div></div>
    <div class="ha">
      <button class="btn btn-g" onclick="cm(-1)">← Anterior</button>
      <span class="mono" style="font-size:13px;padding:7px 14px;background:rgba(0,242,255,.05);border:1px solid rgba(0,242,255,.1);border-radius:8px;color:var(--cyan);" id="ml">—</span>
      <button class="btn btn-g" onclick="cm(1)">Próximo →</button>
    </div>
  </div>
  <div class="ca">
    <div style="display:flex;gap:14px;margin-bottom:14px;flex-wrap:wrap;">
      <div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted);"><div style="width:10px;height:10px;border-radius:2px;background:rgba(255,184,0,.28);"></div>Aguardando</div>
      <div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted);"><div style="width:10px;height:10px;border-radius:2px;background:rgba(0,242,255,.2);"></div>Agendado</div>
      <div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted);"><div style="width:10px;height:10px;border-radius:2px;background:rgba(0,255,136,.18);"></div>Publicado</div>
      <div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted);"><div style="width:10px;height:10px;border-radius:2px;background:rgba(255,51,102,.18);"></div>Rejeitado</div>
    </div>
    <div class="card" id="cal-wrap"></div>
  </div>
</div>

<!-- INTELLIGENCE -->
<div id="sec-intelligence" class="sec">
  <div class="ph">
    <div><div class="pt syne">Inteligência de Audiência</div><div class="ps">IA analisa comportamento, nicho e sugere estratégias</div></div>
    <div class="ha"><button class="btn btn-neon" onclick="runAnalysis()" id="ai-btn">🧠 Rodar Análise IA</button></div>
  </div>
  <div class="ca">
    <div class="intel-grid">
      <div>
        <div class="card card-c" style="margin-bottom:18px;">
          <div class="ch"><span class="ct">🎯 Insights Estratégicos</span><span class="mono" style="font-size:10px;color:rgba(0,242,255,.5);" id="ai-status">Clique em Rodar Análise IA</span></div>
          <div class="cb" id="insights-wrap">
            <div style="text-align:center;padding:38px 0;color:rgba(255,255,255,.2);">
              <div style="font-size:36px;margin-bottom:10px;">🧠</div>
              <div style="font-size:13px;">Clique em "Rodar Análise IA" para gerar insights</div>
              <div style="font-size:11px;margin-top:5px;color:rgba(255,255,255,.12);">Analisa nicho, padrões e comportamento da audiência via IA</div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="ch"><span class="ct">⏰ Melhores Horários</span></div>
          <div class="cb">
            <div style="overflow-x:auto;"><div class="hmap" id="hmap" style="min-width:560px;"></div></div>
            <div style="margin-top:10px;display:flex;gap:8px;align-items:center;font-size:10px;color:rgba(255,255,255,.28);">
              <span>Baixo</span>
              <div style="width:36px;height:7px;background:linear-gradient(90deg,rgba(0,242,255,.1),rgba(0,242,255,.8));border-radius:2px;"></div>
              <span>Alto Engajamento</span>
              <span style="margin-left:auto;font-family:'JetBrains Mono',monospace;">Nicho: tráfego pago BR</span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="card card-p" style="margin-bottom:18px;">
          <div class="ch"><span class="ct">👥 Perfil de Audiência</span></div>
          <div class="cb">
            <div style="margin-bottom:14px;">
              <div class="mono" style="font-size:9px;color:var(--dim);margin-bottom:6px;">NICHO PRINCIPAL</div>
              <div style="font-size:13px;font-weight:600;color:#BC13FE;">Gestores de Tráfego Pago</div>
              <div style="font-size:11px;color:var(--muted);margin-top:2px;">Meta Ads · Google Ads · TikTok Ads</div>
            </div>
            <div class="mono" style="font-size:9px;color:var(--dim);margin-bottom:8px;">PERFIS QUE MAIS ENGAJAM</div>
            <div class="insight-item"><div class="ins-ico p">🏆</div><div><div class="ins-title" style="font-size:12px;">Gestores sênior 3-7 anos</div><div class="ins-body" style="font-size:11px;">Alto poder de decisão, buscam eficiência</div></div></div>
            <div class="insight-item"><div class="ins-ico c">🏢</div><div><div class="ins-title" style="font-size:12px;">Donos de agências digitais</div><div class="ins-body" style="font-size:11px;">Múltiplos clientes, buscam escala</div></div></div>
            <div class="insight-item"><div class="ins-ico k">🎯</div><div><div class="ins-title" style="font-size:12px;">Profissionais de marketing</div><div class="ins-body" style="font-size:11px;">Budget expressivo, foco em ROAS e CPL</div></div></div>
          </div>
        </div>
        <div class="card">
          <div class="ch"><span class="ct">📈 Formato + Engajante</span></div>
          <div class="cb">
            <div class="bar-row"><div class="bar-top"><span class="bar-lbl">Carrossel Educativo</span><span class="bar-pct" style="color:var(--cyan);">94%</span></div><div class="bar-bg"><div class="bar-fill" style="width:94%;background:linear-gradient(90deg,#00F2FF,#BC13FE);"></div></div></div>
            <div class="bar-row"><div class="bar-top"><span class="bar-lbl">Tweet Style Viral</span><span class="bar-pct" style="color:var(--purple);">87%</span></div><div class="bar-bg"><div class="bar-fill" style="width:87%;background:linear-gradient(90deg,#BC13FE,#FF00E5);"></div></div></div>
            <div class="bar-row"><div class="bar-top"><span class="bar-lbl">Diagnóstico / Dor</span><span class="bar-pct" style="color:var(--pink);">79%</span></div><div class="bar-bg"><div class="bar-fill" style="width:79%;background:linear-gradient(90deg,#FF00E5,#FF4488);"></div></div></div>
            <div class="bar-row"><div class="bar-top"><span class="bar-lbl">Prova Social Antes/Depois</span><span class="bar-pct" style="color:var(--green);">72%</span></div><div class="bar-bg"><div class="bar-fill" style="width:72%;background:linear-gradient(90deg,#00FF88,#00F2FF);"></div></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ANALYTICS -->
<div id="sec-analytics" class="sec">
  <div class="ph">
    <div><div class="pt syne">Analytics</div><div class="ps">Performance dos posts e crescimento do perfil</div></div>
    <div class="ha">
      <select style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.7);padding:8px 12px;border-radius:8px;font-size:12px;cursor:pointer;" id="ap" onchange="loadAnalytics()">
        <option value="7">Últimos 7 dias</option>
        <option value="30" selected>Últimos 30 dias</option>
        <option value="90">Últimos 90 dias</option>
      </select>
      <button class="btn btn-g" onclick="loadAnalytics()">🔄</button>
    </div>
  </div>
  <div class="ca">
    <div class="kpi-grid" style="margin-bottom:22px;">
      <div class="kpi kpi-c"><div class="kpi-lbl">Alcance Total</div><div class="kpi-val" id="an-r">—</div><div class="kpi-sub">pessoas alcançadas</div></div>
      <div class="kpi kpi-p"><div class="kpi-lbl">Impressões</div><div class="kpi-val" id="an-i">—</div><div class="kpi-sub">visualizações totais</div></div>
      <div class="kpi kpi-g"><div class="kpi-lbl">Engajamento</div><div class="kpi-val" id="an-e">—</div><div class="kpi-sub">likes + comentários + salvos</div></div>
      <div class="kpi kpi-k"><div class="kpi-lbl">Novos Seguidores</div><div class="kpi-val" id="an-f">—</div><div class="kpi-sub">crescimento no período</div></div>
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:18px;">
      <div class="card card-c"><div class="ch"><span class="ct">📈 Crescimento</span></div><div class="cb" style="height:220px;position:relative;"><canvas id="gc"></canvas></div></div>
      <div class="card"><div class="ch"><span class="ct">🏆 Top Posts</span></div><div class="cb" id="top-posts"><div style="color:var(--muted);font-size:12px;text-align:center;padding:20px 0;"><div class="spin" style="margin:0 auto 8px;display:block;"></div>Carregando...</div></div></div>
    </div>
  </div>
</div>

<!-- GENERATE -->
<div id="sec-generate" class="sec">
  <div class="ph">
    <div><div class="pt syne">Centro de Geração</div><div class="ps">Gere conteúdo com IA e envie para aprovação</div></div>
    <div class="ha">
      <div style="padding:11px 16px;background:rgba(0,242,255,.05);border:1px solid rgba(0,242,255,.1);border-radius:8px;display:flex;align-items:center;gap:8px;">
        <div class="mono" style="font-size:10px;color:rgba(0,242,255,.7);">💡 MELHOR HORÁRIO HOJE</div>
        <span style="color:var(--cyan);font-weight:700;font-size:13px;" id="btt">Calculando...</span>
      </div>
    </div>
  </div>
  <div class="ca">
    <div style="display:grid;grid-template-columns:300px 1fr;gap:18px;margin-bottom:18px;align-items:start;">
      <div class="card card-c" style="position:sticky;top:20px;">
        <div class="ch"><span class="ct">⚡ Geração Rápida IA</span></div>
        <div class="cb">
          <div style="margin-bottom:14px;">
            <label style="font-size:12px;color:var(--muted);display:block;margin-bottom:5px;">Tipo de Post</label>
            <select id="gt" style="width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:#fff;padding:9px 12px;border-radius:8px;font-size:13px;">
              <option value="instagram-feed">Instagram Feed (Imagem Única)</option>
              <option value="instagram-carousel">Instagram Carrossel</option>
              <option value="instagram-story">Instagram Story (9:16)</option>
            </select>
          </div>
          <div style="margin-bottom:16px;">
            <label style="font-size:12px;color:var(--muted);display:block;margin-bottom:5px;">Aba Editorial</label>
            <select id="ge" style="width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:#fff;padding:9px 12px;border-radius:8px;font-size:13px;">
              <option value="diagnostics">Diagnósticos (Dor/Problema)</option>
              <option value="erizon">Produto Erizon</option>
              <option value="authority">Autoridade / Posição Forte</option>
              <option value="anti-myth">Anti-Mitos do Mercado</option>
              <option value="social-proof">Prova Social</option>
              <option value="tweet-style">Tweet Style (Viral)</option>
              <option value="deep-dive">Deep Dive Técnico</option>
              <option value="specialists">Especialistas</option>
            </select>
          </div>
          <button class="btn btn-neon" style="width:100%;justify-content:center;" onclick="genAndQueue()" id="gen-btn">✨ Gerar e Adicionar à Fila</button>
          <div style="margin-top:10px;">
            <button class="btn btn-ok" style="width:100%;justify-content:center;" onclick="show('approval')">✅ Ver Fila de Aprovação</button>
          </div>
        </div>
        <div class="ch" style="border-top:1px solid var(--border);border-bottom:none;margin-top:0;"><span class="ct">📋 Últimos na Fila</span></div>
        <div style="padding:14px;" id="rg"><div style="display:flex;gap:8px;align-items:center;color:var(--muted);font-size:12px;padding:8px 0;"><div class="spin"></div><span>Carregando...</span></div></div>
      </div>
      <div class="card card-p">
        <div class="ch" style="justify-content:space-between;">
          <span class="ct">🎨 Estúdio de Design Completo</span>
          <button class="btn btn-g" style="font-size:11px;padding:4px 10px;" onclick="document.getElementById('studio-frame').src='/api/estudio'">🔄 Recarregar</button>
        </div>
        <div style="padding:0;overflow:hidden;border-radius:0 0 12px 12px;">
          <iframe id="studio-frame" src="/api/estudio" style="width:100%;height:calc(100vh - 160px);min-height:700px;border:none;display:block;" loading="lazy"></iframe>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- STUDIO -->
<div id="sec-studio" class="sec">
  <div class="ph">
    <div><div class="pt syne">Estúdio de Design</div><div class="ps">Criação visual completa com IA</div></div>
    <div class="ha">
      <button class="btn btn-g" onclick="show('generate')">← Voltar</button>
      <button class="btn btn-g" onclick="document.getElementById('studio-full').src='/estudio'">🔄 Recarregar</button>
    </div>
  </div>
  <div style="padding:0 0 0 0;height:calc(100vh - 80px);">
    <iframe id="studio-full" src="/estudio" style="width:100%;height:100%;border:none;display:block;" loading="lazy"></iframe>
  </div>
</div>

</main>

<div class="mo" id="modal" onclick="closeMo(event)">
  <div class="modal" id="modal-body"></div>
</div>
<div class="tc" id="tc"></div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
var allPosts = [];
var curFilter = 'pending_approval';
var curMonth = new Date();
var gchart = null;
var analyzing = false;
var TYPE_ICONS = { 'instagram-feed':'📷', 'instagram-carousel':'🖼', 'instagram-story':'📱', 'linkedin':'💼' };
var TYPE_SHORT = { 'instagram-feed':'FEED', 'instagram-carousel':'CARR', 'instagram-story':'STORY', 'linkedin':'LI' };

function goApproval(){show('approval');}
function doApprove(el){approvePost(el.getAttribute('data-pid'));}
function doReject(el){rejectPost(el.getAttribute('data-pid'));}
function doApproveClose(el){approvePost(el.getAttribute('data-pid'));closeMo();}
function doRejectClose(el){rejectPost(el.getAttribute('data-pid'));closeMo();}
function doModal(el){openModal(el.getAttribute('data-pid'));}

function show(name) {
  var secs = document.querySelectorAll('.sec');
  for (var i = 0; i < secs.length; i++) secs[i].classList.remove('active');
  var navs = document.querySelectorAll('.nav-item');
  for (var i = 0; i < navs.length; i++) navs[i].classList.remove('active');
  var sec = document.getElementById('sec-' + name);
  if (sec) sec.classList.add('active');
  for (var i = 0; i < navs.length; i++) {
    var oc = navs[i].getAttribute('onclick') || '';
    if (oc.indexOf("'" + name + "'") !== -1) navs[i].classList.add('active');
  }
  if (name === 'approval') loadQueue();
  if (name === 'calendar') renderCal();
  if (name === 'analytics') loadAnalytics();
  if (name === 'generate') { loadRG(); getBTT(); }
  if (name === 'studio') { loadRG(); getBTT(); }
  if (name === 'command') loadDash();
}

function gotoIntel() { show('intelligence'); setTimeout(function() { var b = document.getElementById('ai-btn'); if (b) b.click(); }, 200); }

async function apiFetch(url, opts) {
  var res = await fetch(url, opts || {});
  if (!res.ok) { var t = await res.text(); throw new Error(t); }
  return res.json();
}

async function loadDash() {
  try {
    var data = await apiFetch('/api/approval-queue');
    allPosts = data.items || [];
    var pend = allPosts.filter(function(p) { return p.status === 'pending_approval'; }).length;
    var sched = allPosts.filter(function(p) { return p.status === 'scheduled'; }).length;
    var pub = allPosts.filter(function(p) { return p.status === 'published'; }).length;
    var total = allPosts.length;
    var rate = total > 0 ? Math.round(((pub + sched) / total) * 100) : 0;
    setText('kv-p', pend);
    setText('kv-s', sched);
    setText('kv-pub', pub);
    setText('kv-r', rate + '%');
    var nb = document.getElementById('nb');
    if (nb) { nb.textContent = pend; nb.style.display = pend > 0 ? 'block' : 'none'; }
    renderNextSched(allPosts);
    renderActivity(allPosts);
  } catch(e) { console.error(e); }
}

function renderNextSched(posts) {
  var el = document.getElementById('next-sched');
  if (!el) return;
  var list = posts.filter(function(p) { return p.status === 'scheduled' && p.scheduledAt; });
  list.sort(function(a,b) { return new Date(a.scheduledAt) - new Date(b.scheduledAt); });
  list = list.slice(0, 3);
  if (list.length === 0) {
    el.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:16px 0;text-align:center;">Nenhum post agendado. <button class="btn btn-g" style="font-size:12px;display:inline-flex;margin-left:8px;" onclick="goApproval()">Aprovar posts →</button></div>';
    return;
  }
  var html = '';
  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    var img = p.images && p.images[0] ? p.images[0] : '';
    var cap = p.caption ? p.caption.slice(0,60) + '...' : 'Post sem legenda';
    var dt = p.scheduledAt ? new Date(p.scheduledAt).toLocaleString('pt-BR') : '—';
    html += '<div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.04);">';
    if (img) html += '<img src="' + img + '" style="width:42px;height:42px;border-radius:6px;object-fit:cover;background:rgba(255,255,255,.04);flex-shrink:0;" onerror="this.hidden=true">';
    else html += '<div style="width:42px;height:42px;border-radius:6px;background:rgba(255,255,255,.04);flex-shrink:0;"></div>';
    html += '<div style="flex:1;min-width:0;"><div style="font-size:12px;color:rgba(255,255,255,.8);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + cap + '</div>';
    html += '<div class="mono" style="font-size:10px;color:var(--cyan);margin-top:2px;">' + dt + '</div></div>';
    html += '<span class="mono" style="font-size:10px;padding:3px 8px;background:rgba(0,242,255,.1);color:var(--cyan);border-radius:4px;border:1px solid rgba(0,242,255,.18);">AGENDADO</span></div>';
  }
  el.innerHTML = html;
}

function renderActivity(posts) {
  var el = document.getElementById('act-feed');
  if (!el) return;
  var sorted = posts.slice().sort(function(a,b) { return new Date(b.createdAt||0) - new Date(a.createdAt||0); }).slice(0,6);
  if (sorted.length === 0) { el.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:16px 0;text-align:center;">Nenhuma atividade ainda.</div>'; return; }
  var clrs = { pending_approval:'a', scheduled:'c', published:'g', rejected:'err' };
  var lbls = { pending_approval:'aguardando aprovação', scheduled:'agendado para postar', published:'publicado com sucesso', rejected:'rejeitado' };
  var html = '';
  for (var i = 0; i < sorted.length; i++) {
    var p = sorted[i];
    var t = p.createdAt ? new Date(p.createdAt).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}) : '—';
    html += '<div class="act-item"><div class="act-dot ' + (clrs[p.status]||'c') + '"></div>';
    html += '<div class="act-txt">Post <strong>' + (p.postType||'instagram') + '</strong> ' + (lbls[p.status]||p.status) + '</div>';
    html += '<div class="act-time">' + t + '</div></div>';
  }
  el.innerHTML = html;
}

async function loadQueue() {
  var qel = document.getElementById('ap-queue');
  if (qel) qel.innerHTML = '<div style="grid-column:1/-1;display:flex;gap:12px;align-items:center;color:var(--muted);padding:60px 0;justify-content:center;"><div class="spin"></div><span>Carregando fila...</span></div>';
  try {
    var data = await apiFetch('/api/approval-queue');
    allPosts = data.items || [];
    setText('cp', allPosts.filter(function(p){return p.status==='pending_approval';}).length);
    setText('cs', allPosts.filter(function(p){return p.status==='scheduled';}).length);
    setText('cpub', allPosts.filter(function(p){return p.status==='published';}).length);
    renderQ(curFilter);
  } catch(e) {
    if (qel) qel.innerHTML = '<div style="grid-column:1/-1;color:var(--red);font-size:13px;padding:40px 0;text-align:center;">Erro: ' + e.message + '</div>';
  }
}

function fq(btn, filter) {
  var btns = document.querySelectorAll('.fbtn');
  for (var i = 0; i < btns.length; i++) { btns[i].classList.remove('btn-p'); btns[i].classList.add('btn-g'); }
  btn.classList.remove('btn-g'); btn.classList.add('btn-p');
  curFilter = filter;
  renderQ(filter);
}

function renderQ(filter) {
  var posts = filter === 'all' ? allPosts : allPosts.filter(function(p){return p.status===filter;});
  var el = document.getElementById('ap-queue');
  if (!el) return;
  if (posts.length === 0) {
    var msgs = { pending_approval:'✅ Nenhum post aguardando. A IA está ociosa.', scheduled:'📅 Nenhum post agendado.', published:'🟢 Nenhum post publicado ainda.', all:'😭 Nenhum post encontrado.' };
    el.innerHTML = '<div style="grid-column:1/-1;color:var(--muted);font-size:13px;padding:60px 0;text-align:center;">' + (msgs[filter]||'Vazio.') + '</div>';
    return;
  }
  var html = '';
  for (var i = 0; i < posts.length; i++) html += buildPostCard(posts[i]);
  el.innerHTML = html;
}

function buildPostCard(p) {
  var scols = { pending_approval:'#FFB800', scheduled:'#00F2FF', published:'#00FF88', rejected:'#FF3366' };
  var slbls = { pending_approval:'AGUARDANDO', scheduled:'AGENDADO', published:'PUBLICADO', rejected:'REJEITADO' };
  var col = scols[p.status]||'#fff';
  var lbl = slbls[p.status]||p.status;
  var img = p.images && p.images[0] ? p.images[0] : '';
  var cap = p.caption ? p.caption.slice(0,140) + '...' : 'Sem legenda';
  var acts = '';
  if (p.status === 'pending_approval') {
    acts = '<div class="post-acts"><button class="btn btn-ok" data-pid="' + p.id + '" onclick="doApprove(this)">✅ Aprovar</button><button class="btn btn-no" data-pid="' + p.id + '" onclick="doReject(this)">❌ Rejeitar</button></div>';
  } else {
    var info = p.status === 'scheduled' ? ('⏰ ' + (p.scheduledAt ? new Date(p.scheduledAt).toLocaleString('pt-BR') : '—')) : (p.status === 'published' ? '✅ Publicado' : '❌ Rejeitado');
    acts = '<div class="mono" style="font-size:10px;color:' + col + ';padding:7px;background:rgba(255,255,255,.03);border-radius:6px;text-align:center;">' + info + '</div>';
  }
  var imgHtml = img ? '<img src="' + img + '" class="post-img" onerror="this.hidden=true">' : '<div class="post-img-ph">Sem imagem</div>';
  return '<div id="pc-' + p.id + '" class="post-card">' + imgHtml + '<div class="post-body"><div class="post-meta"><span class="ai-score">Match IA: 98%</span><span class="type-badge">' + (p.postType||'feed') + '</span></div><p class="post-caption">' + cap + '</p>' + acts + '<button class="btn btn-g" style="width:100%;justify-content:center;margin-top:7px;font-size:11px;" data-pid="' + p.id + '" onclick="doModal(this)">Ver Detalhes</button></div></div>';
}

async function approvePost(id) {
  var card = document.getElementById('pc-' + id);
  if (card) card.style.opacity = '0.4';
  try {
    var data = await apiFetch('/api/agency-approve', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:id}) });
    var dt = data.post && data.post.scheduledAt ? new Date(data.post.scheduledAt).toLocaleString('pt-BR') : 'em breve';
    toast('ok', '✅ Aprovado! IA agendou para ' + dt);
    loadQueue(); loadDash();
  } catch(e) { if (card) card.style.opacity = '1'; toast('err', 'Erro: ' + e.message); }
}

async function rejectPost(id) {
  if (!confirm('Rejeitar este post?')) return;
  var card = document.getElementById('pc-' + id);
  if (card) card.style.opacity = '0.4';
  try {
    await apiFetch('/api/reject-post', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:id}) });
    toast('inf', '❌ Post rejeitado.');
    loadQueue(); loadDash();
  } catch(e) { if (card) card.style.opacity = '1'; toast('err', 'Erro: ' + e.message); }
}

function openModal(id) {
  var p = allPosts.find(function(x){return x.id===id;});
  if (!p) return;
  var img = p.images && p.images[0] ? p.images[0] : '';
  var capFull = p.caption || 'Sem legenda';
  var isStory = p.postType === 'instagram-story';
  var imgHtml = img ? '<img src="' + img + '" style="width:100%;border-radius:9px;margin-bottom:14px;max-height:' + (isStory?'420px':'280px') + ';object-fit:cover;">' : '';
  var dt = p.scheduledAt ? new Date(p.scheduledAt).toLocaleString('pt-BR') : 'Aguardando aprovação';
  var statusColors = { pending_approval:'#FFB800', scheduled:'#00F2FF', published:'#00FF88', rejected:'#FF3366' };
  var stCol = statusColors[p.status] || '#fff';
  var typeIco = TYPE_ICONS[p.postType] || '📷';
  var typeLabel = p.postType === 'instagram-carousel' ? 'Carrossel' : p.postType === 'instagram-story' ? 'Story' : p.postType === 'linkedin' ? 'LinkedIn' : 'Feed';
  var acts = '';
  if (p.status === 'pending_approval') {
    acts = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px;"><button class="btn btn-ok" style="justify-content:center;" data-pid="' + p.id + '" onclick="doApproveClose(this)">✅ Aprovar e Agendar</button><button class="btn btn-no" style="justify-content:center;" data-pid="' + p.id + '" onclick="doRejectClose(this)">❌ Rejeitar</button></div>';
  }
  var multiImgHtml = '';
  if (p.images && p.images.length > 1) {
    multiImgHtml = '<div style="margin-bottom:14px;"><div class="mono" style="font-size:9px;color:var(--dim);margin-bottom:7px;">SLIDES DO CARROSSEL (' + p.images.length + ')</div><div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;">';
    for (var si=0; si<p.images.length; si++) {
      multiImgHtml += '<img src="' + p.images[si] + '" style="width:90px;height:90px;border-radius:6px;object-fit:cover;flex-shrink:0;border:1px solid rgba(0,242,255,.15);" onerror="this.hidden=true">';
    }
    multiImgHtml += '</div></div>';
  }
  var body = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">';
  body += '<div><h2 class="syne" style="font-size:18px;">' + typeIco + ' ' + typeLabel + '</h2>';
  body += '<div class="mono" style="font-size:10px;color:' + stCol + ';margin-top:2px;">' + (p.status||'').toUpperCase() + '</div></div>';
  body += '<button onclick="closeMo()" class="btn btn-g" style="font-size:18px;padding:4px 10px;">×</button></div>';
  body += imgHtml;
  body += multiImgHtml;
  body += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">';
  body += '<div style="padding:10px;background:rgba(255,255,255,.03);border-radius:8px;"><div class="mono" style="font-size:9px;color:var(--dim);margin-bottom:3px;">ABA EDITORIAL</div><div style="font-size:13px;color:var(--cyan);">' + (p.editorialTab||'—') + '</div></div>';
  body += '<div style="padding:10px;background:rgba(255,255,255,.03);border-radius:8px;"><div class="mono" style="font-size:9px;color:var(--dim);margin-bottom:3px;">AGENDADO PARA</div><div style="font-size:12px;">' + dt + '</div></div>';
  body += '</div>';
  body += '<div style="margin-bottom:14px;"><div class="mono" style="font-size:9px;color:var(--dim);margin-bottom:7px;">LEGENDA COMPLETA</div><div style="font-size:13px;color:rgba(255,255,255,.7);line-height:1.6;max-height:200px;overflow-y:auto;padding:12px;background:rgba(255,255,255,.02);border-radius:8px;border:1px solid rgba(255,255,255,.05);white-space:pre-wrap;">' + capFull + '</div></div>';
  body += acts;
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal').classList.add('open');
}

function closeMo(e) {
  if (!e || e.target === document.getElementById('modal')) {
    document.getElementById('modal').classList.remove('open');
  }
}

function renderCal() {
  var yr = curMonth.getFullYear(), mo = curMonth.getMonth();
  var lbl = curMonth.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}).toUpperCase();
  setText('ml', lbl);
  var days = ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];
  var first = new Date(yr,mo,1).getDay();
  var dim = new Date(yr,mo+1,0).getDate();
  var today = new Date();
  var html = '<div class="cal-grid">';
  for (var d = 0; d < days.length; d++) html += '<div class="cal-hd">' + days[d] + '</div>';
  for (var i = 0; i < first; i++) html += '<div class="cal-day"></div>';
  for (var d = 1; d <= dim; d++) {
    var ds = new Date(yr,mo,d).toISOString().slice(0,10);
    var isT = today.getFullYear()===yr && today.getMonth()===mo && today.getDate()===d;
    var dp = allPosts.filter(function(p){ var pd = p.scheduledAt||p.createdAt; return pd && pd.slice(0,10)===ds; });
    var numHtml = isT ? '<div class="cal-num today">' + d + '</div>' : '<div class="cal-num">' + d + '</div>';
    var dotsHtml = '';
    for (var j = 0; j < dp.length && j < 3; j++) {
      var pp = dp[j];
      var ico = TYPE_ICONS[pp.postType] || '📷';
      var shortType = TYPE_SHORT[pp.postType] || pp.postType || '';
      var capTitle = pp.caption ? pp.caption.slice(0,60) : 'Post';
      dotsHtml += '<div class="cal-dot ' + (pp.status||'') + '" data-pid="' + pp.id + '" onclick="doModal(this)" title="' + capTitle + '">' + ico + ' ' + shortType + '</div>';
    }
    if (dp.length > 3) dotsHtml += '<div class="cal-dot" style="background:rgba(255,255,255,.08);color:rgba(255,255,255,.4);">+' + (dp.length-3) + '</div>';
    html += '<div class="cal-day">' + numHtml + dotsHtml + '</div>';
  }
  html += '</div>';
  var pend = allPosts.filter(function(p){ var pd=p.scheduledAt||p.createdAt; return pd && pd.slice(0,7)===(yr+'-'+String(mo+1).padStart(2,'0')) && p.status==='pending_approval'; }).length;
  var sched = allPosts.filter(function(p){ var pd=p.scheduledAt||p.createdAt; return pd && pd.slice(0,7)===(yr+'-'+String(mo+1).padStart(2,'0')) && p.status==='scheduled'; }).length;
  var pub = allPosts.filter(function(p){ var pd=p.scheduledAt||p.createdAt; return pd && pd.slice(0,7)===(yr+'-'+String(mo+1).padStart(2,'0')) && p.status==='published'; }).length;
  html += '<div style="padding:12px 16px;background:rgba(0,0,0,.3);display:flex;gap:16px;flex-wrap:wrap;align-items:center;">';
  html += '<span class="mono" style="font-size:10px;color:var(--amber);">⏳ Aguardando: ' + pend + '</span>';
  html += '<span class="mono" style="font-size:10px;color:var(--cyan);">📅 Agendado: ' + sched + '</span>';
  html += '<span class="mono" style="font-size:10px;color:var(--green);">✅ Publicado: ' + pub + '</span>';
  html += '<span class="mono" style="font-size:10px;color:var(--muted);margin-left:auto;">Total no mês: ' + (pend+sched+pub) + '</span>';
  html += '</div>';
  var wrap = document.getElementById('cal-wrap');
  if (wrap) wrap.innerHTML = html;
}

function cm(dir) { curMonth = new Date(curMonth.getFullYear(), curMonth.getMonth()+dir, 1); renderCal(); }

async function runAnalysis() {
  if (analyzing) return;
  analyzing = true;
  var btn = document.getElementById('ai-btn');
  var st = document.getElementById('ai-status');
  var wrap = document.getElementById('insights-wrap');
  if (btn) { btn.innerHTML = '<div class="spin" style="width:14px;height:14px;border-width:2px;margin-right:6px;"></div> Analisando...'; btn.disabled = true; }
  if (st) st.textContent = 'IA processando...';
  if (wrap) wrap.innerHTML = '<div style="text-align:center;padding:36px 0;"><div class="spin" style="width:28px;height:28px;border-width:3px;margin:0 auto 14px;display:block;"></div><div class="mono" style="font-size:12px;color:rgba(0,242,255,.5);">ANALISANDO AUDIÊNCIA</div><div style="font-size:12px;color:var(--muted);margin-top:8px;">Processando comportamento de seguidores e nicho...</div></div>';
  try {
    var data = await apiFetch('/api/audience-intelligence', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({niche:'trafego_pago',platform:'instagram'}) });
    var insights = data.insights || [];
    if (st) st.textContent = 'Concluído · ' + new Date().toLocaleTimeString('pt-BR');
    if (insights.length === 0) {
      if (wrap) wrap.innerHTML = '<div style="color:var(--muted);font-size:13px;text-align:center;padding:20px 0;">Nenhum insight gerado.</div>';
    } else {
      var icons = ['🎯','📈','⚡','🧠','🔥','💡','📌','🎪','💪','🚀'];
      var clrs = ['c','p','k','g','a','c','p','k','g','a'];
      var html = '';
      for (var i = 0; i < insights.length; i++) {
        var ins = insights[i];
        var title = typeof ins === 'string' ? ins : (ins.title||'Insight');
        var body = typeof ins === 'string' ? '' : (ins.body||ins.description||'');
        html += '<div class="insight-item"><div class="ins-ico ' + clrs[i%clrs.length] + '">' + icons[i%icons.length] + '</div><div><div class="ins-title">' + title + '</div>' + (body ? '<div class="ins-body">' + body + '</div>' : '') + '</div></div>';
      }
      if (wrap) wrap.innerHTML = html;
    }
    toast('ok', '🧠 Análise concluída!');
  } catch(e) {
    if (st) st.textContent = 'Erro';
    if (wrap) wrap.innerHTML = '<div style="color:var(--red);font-size:13px;text-align:center;padding:20px 0;">Erro: ' + e.message + '</div>';
    toast('err', 'Erro na análise: ' + e.message);
  }
  if (btn) { btn.innerHTML = '🧠 Rodar Análise IA'; btn.disabled = false; }
  analyzing = false;
}

function buildHeatmap() {
  var el = document.getElementById('hmap');
  if (!el) return;
  var days = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  var hrs = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
  var w = [[0,0,0,0,0,0,0.1,0.3,0.6,0.8,0.7,0.5,0.6,0.5,0.4,0.3,0.3,0.4,0.5,0.4,0.3,0.2,0.1,0],[0,0,0,0,0,0,0.1,0.4,0.7,0.9,0.8,0.6,0.7,0.6,0.5,0.4,0.4,0.6,0.8,0.7,0.5,0.3,0.1,0],[0,0,0,0,0,0,0.1,0.3,0.6,0.8,0.7,0.5,0.6,0.5,0.4,0.3,0.3,0.5,0.7,0.6,0.4,0.2,0.1,0],[0,0,0,0,0,0,0.1,0.4,0.8,1.0,0.9,0.7,0.8,0.7,0.6,0.5,0.5,0.7,0.9,0.8,0.6,0.3,0.1,0],[0,0,0,0,0,0,0.1,0.5,0.9,1.0,0.9,0.7,0.8,0.7,0.6,0.5,0.5,0.8,1.0,0.9,0.7,0.4,0.2,0],[0,0,0,0,0,0.1,0.2,0.5,0.6,0.5,0.4,0.5,0.6,0.5,0.4,0.4,0.5,0.7,0.8,0.7,0.6,0.5,0.3,0.1],[0,0,0,0,0,0.1,0.2,0.4,0.5,0.4,0.3,0.4,0.5,0.4,0.3,0.3,0.5,0.8,0.9,0.8,0.6,0.4,0.2,0.1]];
  var html = '<div></div>';
  for (var h = 0; h < hrs.length; h++) html += '<div class="hmap-h">' + String(hrs[h]).padStart(2,'0') + '</div>';
  for (var di = 0; di < days.length; di++) {
    html += '<div class="hmap-lbl">' + days[di] + '</div>';
    for (var h = 0; h < 24; h++) {
      var val = w[di][h]||0;
      var col = val > 0.7 ? 'rgba(0,242,255,' + val + ')' : val > 0.4 ? 'rgba(188,19,254,' + val + ')' : 'rgba(255,0,229,' + val + ')';
      html += '<div class="hmap-cell" style="background:' + col + ';opacity:' + (val>0?Math.max(0.1,val):0.05) + ';" title="' + days[di] + ' ' + String(h).padStart(2,'0') + 'h — Score: ' + Math.round(val*100) + '%"></div>';
    }
  }
  el.innerHTML = html;
}

async function loadAnalytics() {
  var period = (document.getElementById('ap')||{}).value || '30';
  ['an-r','an-i','an-e','an-f'].forEach(function(id) { var el = document.getElementById(id); if (el) el.innerHTML = '<div class="sk" style="width:50px;height:32px;display:inline-block;"></div>'; });
  try {
    var data = await apiFetch('/api/analytics-summary?days=' + period);
    setText('an-r', fmtN(data.reach||0));
    setText('an-i', fmtN(data.impressions||0));
    setText('an-e', fmtN(data.engagement||0));
    var fg = data.followerGrowth||0;
    setText('an-f', (fg>=0?'+':'') + fmtN(fg));
    renderGrowthChart(data.growthData||[]);
    renderTopPosts(data.topPosts||[]);
  } catch(e) {
    ['an-r','an-i','an-e','an-f'].forEach(function(id){var el=document.getElementById(id);if(el)el.textContent='—';});
    var tp = document.getElementById('top-posts');
    if (tp) tp.innerHTML = '<div style="color:var(--muted);font-size:12px;text-align:center;padding:20px 0;">Configure o Instagram para ver analytics reais.</div>';
  }
}

function renderGrowthChart(data) {
  var ctx = document.getElementById('gc');
  if (!ctx) return;
  if (gchart) gchart.destroy();
  var labels = data.length > 0 ? data.map(function(d){return d.date||'';}) : ['Sem dados'];
  var vals = data.length > 0 ? data.map(function(d){return d.followers||0;}) : [0];
  gchart = new Chart(ctx, { type:'line', data:{ labels:labels, datasets:[{ label:'Seguidores', data:vals, borderColor:'#00F2FF', backgroundColor:'rgba(0,242,255,0.05)', tension:0.4, fill:true, pointBackgroundColor:'#00F2FF', pointRadius:4 }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false} }, scales:{ x:{grid:{color:'rgba(255,255,255,0.05)'},ticks:{color:'rgba(255,255,255,0.3)',font:{size:10}}}, y:{grid:{color:'rgba(255,255,255,0.05)'},ticks:{color:'rgba(255,255,255,0.3)',font:{size:10}}} } } });
}

function renderTopPosts(posts) {
  var el = document.getElementById('top-posts');
  if (!posts || posts.length === 0) { if (el) el.innerHTML = '<div style="color:var(--muted);font-size:12px;text-align:center;padding:20px 0;">Sem dados de posts publicados.</div>'; return; }
  var html = '';
  for (var i = 0; i < posts.length; i++) {
    var p = posts[i];
    html += '<div style="display:flex;gap:9px;align-items:center;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.04);"><span class="mono" style="font-size:10px;color:var(--dim);width:16px;">#' + (i+1) + '</span><div style="flex:1;min-width:0;"><div style="font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (p.caption||'Post') + '</div><div class="mono" style="font-size:10px;color:var(--cyan);">' + (p.engagement||0) + ' engajamentos</div></div></div>';
  }
  if (el) el.innerHTML = html;
}

async function genAndQueue() {
  var btn = document.getElementById('gen-btn');
  var type = (document.getElementById('gt')||{}).value || 'instagram-feed';
  var tab = (document.getElementById('ge')||{}).value || 'diagnostics';
  if (btn) { btn.innerHTML = '<div class="spin" style="width:13px;height:13px;border-width:2px;"></div> Gerando...'; btn.disabled = true; }
  try {
    await apiFetch('/api/agency-generate-queue', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({postType:type,editorialTab:tab}) });
    toast('ok', '✅ Post gerado e adicionado à fila!');
    loadRG(); loadDash();
  } catch(e) { toast('err', 'Erro: ' + e.message); }
  if (btn) { btn.innerHTML = '✨ Gerar e Adicionar à Fila'; btn.disabled = false; }
}

async function loadRG() {
  try {
    var data = await apiFetch('/api/approval-queue');
    var recent = (data.items||[]).filter(function(p){return p.status==='pending_approval';}).slice(0,4);
    var el = document.getElementById('rg');
    if (!el) return;
    if (recent.length === 0) { el.innerHTML = '<div style="color:var(--muted);font-size:11px;text-align:center;padding:12px 0;">Fila vazia — gere um post!</div>'; return; }
    var scols = { pending_approval:'#FFB800', scheduled:'#00F2FF', published:'#00FF88', rejected:'#FF3366' };
    var html = '';
    for (var i = 0; i < recent.length; i++) {
      var p = recent[i];
      var img = p.images && p.images[0] ? p.images[0] : '';
      var cap = p.caption ? p.caption.slice(0,55) + '...' : 'Sem legenda';
      html += '<div style="display:flex;gap:8px;align-items:center;padding:8px;border-radius:8px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);margin-bottom:6px;cursor:pointer;" onclick="goApproval()">';
      if (img) html += '<img src="' + img + '" style="width:36px;height:36px;border-radius:5px;object-fit:cover;flex-shrink:0;" onerror="this.hidden=true">';
      else html += '<div style="width:36px;height:36px;border-radius:5px;background:rgba(255,255,255,.04);flex-shrink:0;"></div>';
      html += '<div style="flex:1;min-width:0;"><div style="font-size:11px;color:rgba(255,255,255,.7);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + cap + '</div>';
      html += '<div class="mono" style="font-size:9px;color:' + (scols[p.status]||'#fff') + ';margin-top:2px;">' + (p.status||'') + '</div></div></div>';
    }
    el.innerHTML = html;
  } catch(e) { var el2=document.getElementById('rg'); if(el2) el2.innerHTML='<div style="color:var(--muted);font-size:11px;padding:12px 0;text-align:center;">Erro ao carregar.</div>'; }
}

async function getBTT() {
  var el = document.getElementById('btt');
  if (!el) return;
  try {
    var data = await apiFetch('/api/audience-intelligence', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({niche:'trafego_pago',platform:'instagram',quickMode:true}) });
    if (el) el.textContent = data.bestTimeToday || '18h — 20h';
  } catch(e) { if (el) el.textContent = '18h — 20h (padrão do nicho)'; }
}

async function refreshAll() { await loadDash(); toast('inf', '🔄 Dashboard atualizado!'); }

async function genMonthPlan() {
  var btn = document.getElementById('month-btn');
  var prog = document.getElementById('month-progress');
  var bar = document.getElementById('month-progress-bar');
  var lbl = document.getElementById('month-progress-lbl');
  if (btn) { btn.disabled = true; btn.innerHTML = '<div class="spin" style="width:13px;height:13px;border-width:2px;"></div> Gerando...'; }
  if (prog) prog.style.display = 'block';
  if (bar) { bar.style.width = '5%'; setTimeout(function(){ bar.style.width='60%'; }, 500); }
  try {
    var d = await apiFetch('/api/generate-month-plan', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({}) });
    if (bar) bar.style.width = '100%';
    if (lbl) lbl.textContent = 'Concluído! ' + (d.generated||0) + ' posts gerados para aprovação.';
    toast('ok', '🗓️ Plano do mês pronto! ' + (d.generated||0) + ' posts na fila de aprovação.');
    setTimeout(function(){ if(prog) prog.style.display='none'; loadQueue(); loadDash(); renderCal(); }, 2500);
  } catch(e) {
    if (lbl) lbl.textContent = 'Erro: ' + e.message;
    toast('err', 'Erro ao gerar plano: ' + e.message);
    setTimeout(function(){ if(prog) prog.style.display='none'; }, 3000);
  }
  if (btn) { btn.disabled = false; btn.innerHTML = '🗓️ Gerar Mês Completo'; }
}

function setText(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
function fmtN(n) { if (n>=1000000) return (n/1000000).toFixed(1)+'M'; if (n>=1000) return (n/1000).toFixed(1)+'K'; return String(n); }

function toast(type, msg) {
  var tc = document.getElementById('tc');
  var t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  tc.appendChild(t);
  setTimeout(function() { t.style.opacity='0'; t.style.transform='translateX(20px)'; t.style.transition='all .3s'; setTimeout(function(){t.remove();},300); }, 4200);
}

document.addEventListener('DOMContentLoaded', function() {
  buildHeatmap();
  loadDash();
  renderCal();
});
</script>
</body>
</html>`;
}
