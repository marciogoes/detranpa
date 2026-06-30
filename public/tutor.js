// Sala do Tutor — ensina o assistente em tempo real.
// A senha é guardada só durante a sessão do navegador e enviada no cabeçalho
// x-tutor-key. Toda a validação é feita no servidor.

const $ = (id) => document.getElementById(id);
let tutorKey = sessionStorage.getItem("tutorKey") || "";

const el = {
  login: $("login"), panel: $("panel"), pwd: $("pwd"), enter: $("enter"),
  loginMsg: $("login-msg"), logout: $("logout"),
  title: $("t-title"), content: $("t-content"), charCount: $("char-count"),
  save: $("save"), addMsg: $("add-msg"),
  list: $("list"), listCount: $("list-count"), banner: $("storage-banner"),
  testInput: $("test-input"), testSend: $("test-send"), testAnswer: $("test-answer"),
};

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function msg(target, text, type) {
  target.innerHTML = text ? `<div class="t-msg ${type}">${escapeHtml(text)}</div>` : "";
}
function fmtDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

async function api(path, opts = {}) {
  const headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
  if (tutorKey) headers["x-tutor-key"] = tutorKey;
  const res = await fetch(path, Object.assign({}, opts, { headers }));
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

/* ── Login ── */
el.enter.onclick = login;
el.pwd.addEventListener("keydown", (e) => { if (e.key === "Enter") login(); });

async function login() {
  const key = el.pwd.value.trim();
  if (!key) return;
  el.enter.disabled = true;
  const { ok, data } = await api("/api/tutor/auth", { method: "POST", body: JSON.stringify({ key }) });
  el.enter.disabled = false;
  if (!ok) { msg(el.loginMsg, data.error || "Não foi possível entrar.", "err"); return; }
  tutorKey = key;
  sessionStorage.setItem("tutorKey", key);
  showPanel(data.storage);
}

el.logout.onclick = () => {
  tutorKey = ""; sessionStorage.removeItem("tutorKey");
  el.panel.classList.add("hidden"); el.login.classList.remove("hidden");
  el.logout.classList.add("hidden"); el.pwd.value = ""; msg(el.loginMsg, "", "");
};

function showPanel(storage) {
  el.login.classList.add("hidden");
  el.panel.classList.remove("hidden");
  el.logout.classList.remove("hidden");
  renderBanner(storage);
  loadEntries();
}

function renderBanner(storage) {
  if (storage === "none") {
    el.banner.innerHTML = `<div class="t-msg err">⚠️ O armazenamento permanente ainda não está configurado neste ambiente. Você consegue testar, mas para <strong>salvar de verdade</strong> é preciso configurar o Vercel KV / Upstash (veja o DEPLOY.md).</div>`;
  } else {
    const nome = storage === "kv" ? "permanente (KV)" : "local (arquivo)";
    el.banner.innerHTML = `<div style="margin-bottom:14px"><span class="badge ok">● Memória ${nome} ativada</span></div>`;
  }
}

/* ── Salvar conhecimento ── */
el.content.addEventListener("input", () => { el.charCount.textContent = el.content.value.length; });
el.save.onclick = salvar;

async function salvar() {
  const title = el.title.value.trim();
  const content = el.content.value.trim();
  if (!title || !content) { msg(el.addMsg, "Preencha o título e o conteúdo.", "err"); return; }
  el.save.disabled = true;
  const { ok, data } = await api("/api/tutor/entries", { method: "POST", body: JSON.stringify({ title, content }) });
  el.save.disabled = false;
  if (!ok) { msg(el.addMsg, data.error || "Não foi possível salvar.", "err"); return; }
  msg(el.addMsg, "Conhecimento salvo! O assistente já está usando.", "ok");
  el.title.value = ""; el.content.value = ""; el.charCount.textContent = "0";
  setTimeout(() => msg(el.addMsg, "", ""), 3000);
  loadEntries();
}

/* ── Lista ── */
async function loadEntries() {
  const { ok, data } = await api("/api/tutor/entries");
  if (!ok) {
    if (data.error) el.listCount.textContent = data.error;
    return;
  }
  const entries = data.entries || [];
  el.listCount.textContent = entries.length
    ? `${entries.length} ${entries.length === 1 ? "item ensinado" : "itens ensinados"}.`
    : "Você ainda não ensinou nada. Comece pelo campo acima.";
  el.list.innerHTML = entries.map((e) => `
    <div class="entry" data-id="${e.id}">
      <h4>${escapeHtml(e.title)}</h4>
      <div class="body">${escapeHtml(e.content)}</div>
      <div class="meta">
        <span>Atualizado em ${fmtDate(e.updatedAt)}</span>
        <span class="spacer"></span>
        <button class="t-btn danger" data-del="${e.id}">Remover</button>
      </div>
    </div>`).join("");
  el.list.querySelectorAll("[data-del]").forEach((b) => {
    b.onclick = () => remover(b.getAttribute("data-del"));
  });
}

async function remover(id) {
  if (!confirm("Remover este conhecimento? O assistente deixará de usá-lo.")) return;
  const { ok, data } = await api(`/api/tutor/entries/${id}`, { method: "DELETE" });
  if (!ok) { alert(data.error || "Não foi possível remover."); return; }
  loadEntries();
}

/* ── Testar o assistente ── */
el.testSend.onclick = testar;
el.testInput.addEventListener("keydown", (e) => { if (e.key === "Enter") testar(); });

async function testar() {
  const q = el.testInput.value.trim();
  if (!q) return;
  el.testSend.disabled = true;
  el.testAnswer.innerHTML = `<div class="test-answer">Consultando o assistente…</div>`;
  try {
    const res = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: q }] }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { el.testAnswer.innerHTML = `<div class="t-msg err">${escapeHtml(data.error || "Erro ao consultar.")}</div>`; }
    else { el.testAnswer.innerHTML = `<div class="test-answer">${escapeHtml(data.reply || "")}</div>`; }
  } catch (e) {
    el.testAnswer.innerHTML = `<div class="t-msg err">Não foi possível conectar ao servidor.</div>`;
  } finally {
    el.testSend.disabled = false;
  }
}

/* ── Início: se já tem senha na sessão, tenta abrir direto ── */
(async function init() {
  const status = await api("/api/tutor/status");
  if (status.ok && !status.data.enabled) {
    el.login.innerHTML = `<div class="t-card"><h3>Sala do Tutor desativada</h3><p class="sub">Para ativar, defina a variável <strong>TUTOR_PASSWORD</strong> nas variáveis de ambiente (no Vercel ou no arquivo .env) e reinicie. Veja o DEPLOY.md.</p><a href="/" class="t-btn soft">← Voltar ao chat</a></div>`;
    return;
  }
  if (tutorKey) {
    const probe = await api("/api/tutor/entries");
    if (probe.ok) { showPanel((probe.data && probe.data.storage) || "file"); return; }
    tutorKey = ""; sessionStorage.removeItem("tutorKey");
  }
})();
