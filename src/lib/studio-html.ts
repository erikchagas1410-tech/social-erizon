export function getStudioHtml(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Estúdio Erizon</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0;}
:root{--bg:#020010;--surface:rgba(255,255,255,0.03);--border:rgba(255,255,255,0.08);--cyan:#00F2FF;--purple:#BC13FE;--pink:#FF00E5;--green:#00FF88;--amber:#FFB800;--red:#FF3366;--muted:rgba(255,255,255,0.5);--dim:rgba(255,255,255,0.2);}
body{background:var(--bg);color:#fff;font-family:'Plus Jakarta Sans',sans-serif;min-height:100vh;padding:24px;}
body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(0,242,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,242,255,0.025) 1px,transparent 1px);background-size:44px 44px;pointer-events:none;z-index:0;}
.mono{font-family:'JetBrains Mono',monospace;}
.syne{font-family:'Syne',sans-serif;}
.wrap{position:relative;z-index:1;max-width:1100px;margin:0 auto;}
h1{font-family:'Syne',sans-serif;font-weight:800;font-size:22px;background:linear-gradient(135deg,#00F2FF,#BC13FE);-webkit-background-clip:text;background-clip:text;color:transparent;margin-bottom:4px;}
.sub{font-size:12px;color:var(--muted);margin-bottom:20px;}

/* GENERATE FORM */
.gen-box{background:var(--surface);border:1px solid rgba(0,242,255,0.13);border-radius:12px;padding:18px;margin-bottom:22px;}
.gen-box h2{font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;}
.fields{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:10px;align-items:end;}
select,input{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:#fff;padding:9px 12px;border-radius:8px;font-size:12px;font-family:'Plus Jakarta Sans',sans-serif;}
select option{background:#0b0020;color:#fff;}
label{font-size:11px;color:var(--dim);display:block;margin-bottom:4px;}
.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;transition:all .18s;border:none;white-space:nowrap;font-family:'Plus Jakarta Sans',sans-serif;}
.btn-neon{background:linear-gradient(135deg,#BC13FE,#00F2FF);color:#000;box-shadow:0 0 20px rgba(188,19,254,.4);}
.btn-neon:hover{box-shadow:0 0 32px rgba(188,19,254,.6);transform:translateY(-1px);}
.btn-neon:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.btn-g{background:transparent;border:1px solid rgba(255,255,255,.1);color:var(--muted);}
.btn-g:hover{background:rgba(255,255,255,.05);color:#fff;}

/* PROGRESS */
.progress-bar{height:3px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden;margin-top:12px;display:none;}
.progress-fill{height:100%;background:linear-gradient(90deg,#00F2FF,#BC13FE);border-radius:2px;transition:width 2s ease;width:0%;}
#gen-status{font-size:11px;color:var(--cyan);margin-top:8px;font-family:'JetBrains Mono',monospace;display:none;}

/* GALLERY */
.section-title{font-size:11px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;}
.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px;}
.post-card{background:var(--surface);border:1px solid rgba(188,19,254,.13);border-radius:12px;overflow:hidden;transition:all .3s;position:relative;cursor:pointer;}
.post-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--cyan),var(--purple));}
.post-card:hover{border-color:rgba(0,242,255,.3);transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,.4),0 0 24px rgba(0,242,255,.08);}
.post-img{width:100%;aspect-ratio:1;object-fit:cover;object-position:center top;background:#050711;display:block;}
.post-img-ph{width:100%;aspect-ratio:1;background:linear-gradient(135deg,rgba(188,19,254,.08),rgba(0,242,255,.08));display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;}
.post-info{padding:12px;}
.post-type{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--cyan);background:rgba(0,242,255,.08);border:1px solid rgba(0,242,255,.15);border-radius:4px;padding:2px 7px;display:inline-block;margin-bottom:7px;}
.post-hook{font-size:12px;font-weight:600;color:rgba(255,255,255,.85);line-height:1.4;margin-bottom:6px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}
.post-cap{font-size:11px;color:var(--muted);line-height:1.5;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;margin-bottom:10px;}
.post-status{font-family:'JetBrains Mono',monospace;font-size:9px;padding:3px 7px;border-radius:4px;}
.status-pending{background:rgba(255,184,0,.15);color:var(--amber);}
.status-scheduled{background:rgba(0,242,255,.1);color:var(--cyan);}
.status-published{background:rgba(0,255,136,.1);color:var(--green);}
.status-rejected{background:rgba(255,51,102,.1);color:var(--red);}

/* BRAND PANEL */
.brand-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;}
.brand-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px;}
.brand-title{font-size:9px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;}
.brand-item{font-size:11px;color:var(--muted);padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04);display:flex;align-items:center;gap:6px;}
.brand-item:last-child{border-bottom:none;}
.color-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}

/* LIGHTBOX */
.lb{position:fixed;inset:0;background:rgba(2,0,16,.9);backdrop-filter:blur(16px);z-index:100;display:none;align-items:center;justify-content:center;}
.lb.open{display:flex;}
.lb-inner{max-width:520px;width:92%;max-height:90vh;overflow-y:auto;background:rgba(8,0,24,.95);border:1px solid rgba(0,242,255,.18);border-radius:14px;padding:22px;box-shadow:0 0 60px rgba(188,19,254,.15);}
.lb img{width:100%;border-radius:8px;margin-bottom:14px;}
.lb-cap{font-size:13px;color:rgba(255,255,255,.75);line-height:1.6;white-space:pre-wrap;max-height:200px;overflow-y:auto;padding:12px;background:rgba(255,255,255,.02);border-radius:8px;border:1px solid rgba(255,255,255,.05);}

/* TOAST */
.tc{position:fixed;bottom:18px;right:18px;z-index:200;display:flex;flex-direction:column;gap:6px;}
.toast{padding:10px 16px;border-radius:8px;font-size:12px;font-weight:500;backdrop-filter:blur(20px);animation:tin .3s ease;display:flex;align-items:center;gap:8px;}
.toast.ok{background:rgba(0,255,136,.13);border:1px solid rgba(0,255,136,.28);color:var(--green);}
.toast.err{background:rgba(255,51,102,.13);border:1px solid rgba(255,51,102,.28);color:var(--red);}
.toast.inf{background:rgba(0,242,255,.1);border:1px solid rgba(0,242,255,.2);color:var(--cyan);}
@keyframes tin{from{opacity:0;transform:translateX(16px);}to{opacity:1;transform:translateX(0);}}
.spin{display:inline-block;width:14px;height:14px;border:2px solid rgba(0,242,255,.18);border-top-color:var(--cyan);border-radius:50%;animation:rot .8s linear infinite;}
@keyframes rot{to{transform:rotate(360deg);}}
.empty{text-align:center;padding:40px 20px;color:var(--muted);}
.empty-ico{font-size:36px;margin-bottom:10px;}
</style>
</head>
<body>
<div class="wrap">
  <h1 class="syne">🎨 Estúdio de Design</h1>
  <p class="sub">Gere, visualize e gerencie os criativos visuais da Erizon</p>

  <!-- GENERATOR -->
  <div class="gen-box">
    <h2>⚡ Gerar Novo Criativo</h2>
    <div class="fields">
      <div>
        <label>Tipo de Post</label>
        <select id="postType">
          <option value="instagram-feed">Instagram Feed (1:1)</option>
          <option value="instagram-carousel">Instagram Carrossel</option>
          <option value="instagram-story">Instagram Story (9:16)</option>
        </select>
      </div>
      <div>
        <label>Aba Editorial</label>
        <select id="editorialTab">
          <option value="diagnostics">Diagnósticos (Dor/Problema)</option>
          <option value="authority">Autoridade / Posição Forte</option>
          <option value="anti-myth">Anti-Mitos do Mercado</option>
          <option value="social-proof">Prova Social</option>
          <option value="tweet-style">Tweet Style (Viral)</option>
          <option value="deep-dive">Deep Dive Técnico</option>
          <option value="erizon">Produto Erizon</option>
          <option value="specialists">Especialistas</option>
        </select>
      </div>
      <div>
        <label>Pilar de Conteúdo</label>
        <select id="pillar">
          <option value="">Auto (IA decide)</option>
          <option value="autoridade">Autoridade</option>
          <option value="educacao">Educação</option>
          <option value="desejo">Desejo</option>
          <option value="conexao">Conexão</option>
          <option value="prova">Prova Social</option>
          <option value="conversao_indireta">Conversão Indireta</option>
        </select>
      </div>
      <button class="btn btn-neon" id="gen-btn" onclick="generate()">✨ Gerar</button>
    </div>
    <div class="progress-bar" id="prog">
      <div class="progress-fill" id="prog-fill"></div>
    </div>
    <div id="gen-status"></div>
  </div>

  <!-- GALLERY -->
  <div class="section-title">
    <span>📸 Criativos Gerados</span>
    <button class="btn btn-g" style="font-size:11px;padding:5px 12px;" onclick="loadGallery()">🔄 Atualizar</button>
  </div>
  <div class="gallery" id="gallery">
    <div class="empty" style="grid-column:1/-1;">
      <div class="spin" style="width:20px;height:20px;border-width:2px;margin:0 auto 12px;display:block;"></div>
      <div>Carregando criativos...</div>
    </div>
  </div>

  <!-- BRAND IDENTITY -->
  <div class="section-title"><span>🏷️ Identidade Visual Erizon</span></div>
  <div class="brand-grid">
    <div class="brand-card">
      <div class="brand-title">Cores da Marca</div>
      <div class="brand-item"><div class="color-dot" style="background:#6C2BFF;box-shadow:0 0 6px #6C2BFF;"></div>Violeta Erizon #6C2BFF</div>
      <div class="brand-item"><div class="color-dot" style="background:#00E5FF;box-shadow:0 0 6px #00E5FF;"></div>Ciano Decisão #00E5FF</div>
      <div class="brand-item"><div class="color-dot" style="background:#38BDF8;box-shadow:0 0 6px #38BDF8;"></div>Azul Clareza #38BDF8</div>
      <div class="brand-item"><div class="color-dot" style="background:#07080f;"></div>Fundo Profundo #07080F</div>
    </div>
    <div class="brand-card">
      <div class="brand-title">Tom de Voz</div>
      <div class="brand-item">📌 Direto e sem enrolação</div>
      <div class="brand-item">💡 Técnico mas acessível</div>
      <div class="brand-item">🎯 Foca em dinheiro e decisão</div>
      <div class="brand-item">🚫 Zero hype e linguagem genérica</div>
      <div class="brand-item">⚡ Urgência sem sensacionalismo</div>
    </div>
    <div class="brand-card">
      <div class="brand-title">Formatos que Performam</div>
      <div class="brand-item">🏆 Carrossel Educativo → 94%</div>
      <div class="brand-item">🔥 Tweet Style Viral → 87%</div>
      <div class="brand-item">🎯 Diagnóstico / Dor → 79%</div>
      <div class="brand-item">✅ Prova Social → 72%</div>
      <div class="brand-item">⏰ Melhores horários: 18h–20h</div>
    </div>
  </div>
</div>

<!-- LIGHTBOX -->
<div class="lb" id="lb" onclick="closeLb(event)">
  <div class="lb-inner" id="lb-inner"></div>
</div>
<div class="tc" id="tc"></div>

<script>
var posts = [];

async function apiFetch(url, opts) {
  var res = await fetch(url, opts || {});
  if (!res.ok) { var t = await res.text(); throw new Error(t); }
  return res.json();
}

async function loadGallery() {
  var el = document.getElementById('gallery');
  el.innerHTML = '<div class="empty" style="grid-column:1/-1;"><div class="spin" style="width:20px;height:20px;border-width:2px;margin:0 auto 12px;display:block;"></div><div>Carregando...</div></div>';
  try {
    var data = await apiFetch('/api/approval-queue');
    posts = data.items || [];
    renderGallery();
  } catch(e) {
    el.innerHTML = '<div class="empty" style="grid-column:1/-1;"><div class="empty-ico">⚠️</div><div style="font-size:13px;">Erro ao carregar criativos</div><div style="font-size:11px;margin-top:4px;">' + e.message + '</div></div>';
  }
}

function statusLabel(s) {
  var m = {pending_approval:'AGUARDANDO',scheduled:'AGENDADO',published:'PUBLICADO',rejected:'REJEITADO'};
  return m[s] || s.toUpperCase();
}
function statusClass(s) {
  var m = {pending_approval:'status-pending',scheduled:'status-scheduled',published:'status-published',rejected:'status-rejected'};
  return m[s] || '';
}

function renderGallery() {
  var el = document.getElementById('gallery');
  if (!posts.length) {
    el.innerHTML = '<div class="empty" style="grid-column:1/-1;"><div class="empty-ico">🎨</div><div style="font-size:13px;">Nenhum criativo ainda</div><div style="font-size:11px;margin-top:6px;">Clique em Gerar para criar o primeiro!</div></div>';
    return;
  }
  var html = '';
  for (var i = 0; i < posts.length; i++) {
    var p = posts[i];
    var img = p.images && p.images[0] ? p.images[0] : '';
    var hook = p.caption ? p.caption.slice(0,80) : 'Post sem texto';
    var type = {instagram-feed:'FEED',instagram-carousel:'CARROSSEL',instagram-story:'STORY',linkedin:'LINKEDIN'}[p.postType] || p.postType || 'FEED';
    html += '<div class="post-card" onclick="openLb(' + i + ')">';
    if (img) {
      html += '<img class="post-img" src="' + img + '" onerror="this.parentElement.querySelector(\'.post-img-ph\').style.display=\'flex\';this.style.display=\'none\'">';
      html += '<div class="post-img-ph" style="display:none;"><span style="font-size:32px;">🎨</span><span style="font-size:11px;color:var(--dim);">Imagem não disponível</span></div>';
    } else {
      html += '<div class="post-img-ph"><span style="font-size:32px;">🖼</span><span style="font-size:11px;color:var(--dim);">Sem imagem gerada</span></div>';
    }
    html += '<div class="post-info">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">';
    html += '<span class="post-type">' + type + '</span>';
    html += '<span class="post-status ' + statusClass(p.status) + '">' + statusLabel(p.status) + '</span>';
    html += '</div>';
    html += '<div class="post-hook">' + hook + '</div>';
    html += '</div></div>';
  }
  el.innerHTML = html;
}

function openLb(idx) {
  var p = posts[idx];
  if (!p) return;
  var img = p.images && p.images[0] ? p.images[0] : '';
  var cap = p.caption || 'Sem legenda';
  var statusColors = {pending_approval:'#FFB800',scheduled:'#00F2FF',published:'#00FF88',rejected:'#FF3366'};
  var stCol = statusColors[p.status] || '#fff';
  var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">';
  html += '<div><div class="syne" style="font-size:16px;font-weight:800;">Detalhes do Criativo</div>';
  html += '<div class="mono" style="font-size:9px;color:' + stCol + ';margin-top:2px;">' + statusLabel(p.status) + '</div></div>';
  html += '<button class="btn btn-g" style="padding:4px 10px;font-size:16px;" onclick="closeLb()">×</button></div>';
  if (img) html += '<img src="' + img + '" onerror="this.style.display=\'none\'">';
  html += '<div class="mono" style="font-size:9px;color:var(--dim);margin-bottom:6px;margin-top:' + (img ? '0' : '0') + ';">LEGENDA COMPLETA</div>';
  html += '<div class="lb-cap">' + cap + '</div>';
  if (p.editorialTab) {
    html += '<div style="margin-top:10px;padding:8px;background:rgba(255,255,255,.02);border-radius:6px;"><span class="mono" style="font-size:9px;color:var(--dim);">PILAR: </span><span style="font-size:12px;color:var(--cyan);">' + p.editorialTab + '</span></div>';
  }
  document.getElementById('lb-inner').innerHTML = html;
  document.getElementById('lb').classList.add('open');
}

function closeLb(e) {
  if (!e || e.target === document.getElementById('lb')) {
    document.getElementById('lb').classList.remove('open');
  }
}

async function generate() {
  var btn = document.getElementById('gen-btn');
  var prog = document.getElementById('prog');
  var fill = document.getElementById('prog-fill');
  var status = document.getElementById('gen-status');
  var type = document.getElementById('postType').value;
  var tab = document.getElementById('editorialTab').value;

  btn.disabled = true;
  btn.innerHTML = '<div class="spin"></div> Gerando...';
  prog.style.display = 'block';
  status.style.display = 'block';
  status.textContent = '⏳ Chamando IA para gerar conteúdo...';
  fill.style.width = '15%';

  setTimeout(function() { fill.style.width = '45%'; status.textContent = '🎨 Gerando imagem do criativo...'; }, 2000);
  setTimeout(function() { fill.style.width = '75%'; status.textContent = '☁️ Fazendo upload do criativo...'; }, 5000);

  try {
    await apiFetch('/api/agency-generate-queue', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({postType: type, editorialTab: tab})
    });
    fill.style.width = '100%';
    status.textContent = '✅ Criativo gerado com sucesso!';
    toast('ok', '✅ Criativo gerado e adicionado à fila!');
    setTimeout(function() {
      prog.style.display = 'none';
      status.style.display = 'none';
      fill.style.width = '0%';
      loadGallery();
    }, 1500);
  } catch(e) {
    fill.style.width = '0%';
    status.textContent = '❌ Erro: ' + e.message;
    toast('err', 'Erro: ' + e.message);
  }
  btn.disabled = false;
  btn.innerHTML = '✨ Gerar';
}

function toast(type, msg) {
  var tc = document.getElementById('tc');
  var t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  tc.appendChild(t);
  setTimeout(function() { t.style.opacity='0'; t.style.transform='translateX(16px)'; t.style.transition='all .3s'; setTimeout(function(){t.remove();},300); }, 4000);
}

document.addEventListener('DOMContentLoaded', loadGallery);
</script>
</body>
</html>`;
}
