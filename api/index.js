// ─────────────────────────────────────────────────────────────────────────────
// Aplicação Express do Assistente DETRAN-PA.
//
// Este arquivo monta o app e o EXPORTA (sem "ouvir" uma porta), para que possa
// rodar tanto localmente (server.js chama app.listen) quanto no Vercel
// (que usa este export como função serverless).
//
// A chave da Anthropic vive só no servidor (variável de ambiente). O navegador
// fala apenas com /api/*.
// ─────────────────────────────────────────────────────────────────────────────

import "dotenv/config";
import express from "express";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { FORMS, FORM_INDEX } from "../forms-data.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, ".."); // raiz do projeto (api/ fica um nível abaixo)

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const MAX_TOKENS = Number(process.env.MAX_TOKENS || 2048);

// Limites de proteção (em memória; em serverless servem de barreira leve)
const MAX_MESSAGES = 24;
const MAX_CHARS_PER_MSG = 4000;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;

// ── Base de conhecimento (pasta /knowledge) ─────────────────────────────────
function carregarBaseConhecimento() {
  const dir = join(ROOT, "knowledge");
  if (!existsSync(dir)) {
    console.warn("[aviso] Pasta /knowledge não encontrada.");
    return "";
  }
  const arquivos = readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
  return arquivos
    .map((f) => `\n\n===== ARQUIVO: ${f} =====\n\n${readFileSync(join(dir, f), "utf8")}`)
    .join("");
}

const BASE_CONHECIMENTO = carregarBaseConhecimento();
const LISTA_FORMS = FORM_INDEX.map((f) => `   - ${f.id}: ${f.title} — ${f.desc}`).join("\n");

const SYSTEM_PROMPT = `Você é o "Assistente DETRAN-PA", um atendente virtual que ajuda os cidadãos do Pará a entender e resolver os serviços do Departamento de Trânsito do Estado (habilitação/CNH, veículos, multas e licenciamento).

PÚBLICO: pessoas leigas, que não conhecem os termos técnicos do trânsito. Escreva como se estivesse explicando com calma para alguém que nunca lidou com o DETRAN.

COMO RESPONDER (linguagem simples e detalhada):
1. Responda SEMPRE em português do Brasil, com tom acolhedor, paciente e gentil. Trate o usuário por "você".
2. Use palavras do dia a dia. Evite "juridiquês" e termos técnicos; quando precisar usar uma sigla ou termo do trânsito, EXPLIQUE entre parênteses na primeira vez. Exemplos:
   - CNH (a carteira de motorista)
   - CRLV (o documento anual do veículo, que prova que ele está licenciado)
   - CRV (o antigo "documento/recibo" do carro, usado para passar o veículo para outra pessoa)
   - ATPV-e (a autorização digital para transferir o veículo na hora da venda)
   - DAE (o boleto de pagamento das taxas do estado)
   - Portal Venus (o site do DETRAN onde você contesta multas pela internet)
   - JARI (a junta que julga os recursos contra multas)
   - EAR (anotação na carteira de quem dirige trabalhando, tipo motorista de app, ônibus ou caminhão)
   - PPD (a carteira provisória, válida no primeiro ano)
3. Seja DETALHADO e organizado. Quando a pergunta envolver um processo, explique passo a passo, numerando as etapas. Para cada serviço, sempre que fizer sentido, cubra:
   - O que é / quando se aplica
   - Quais documentos a pessoa precisa levar ou ter em mãos
   - O passo a passo, em ordem
   - Prazos importantes (e o que acontece se perder o prazo)
   - Quanto custa (lembrando que o valor é só uma referência)
   - Onde fazer / link oficial
4. Sempre que possível, termine com um resumo curto ("Resumindo:") e ofereça ajuda no próximo passo ("Quer que eu te explique como fazer X?").
5. Anuncie boas práticas de cuidado: se algo tem prazo curto ou risco de multa, destaque isso de forma clara.

REGRAS DE CONTEÚDO (não podem ser quebradas):
6. Baseie-se EXCLUSIVAMENTE na BASE DE CONHECIMENTO abaixo. NÃO invente taxas, prazos, documentos ou links. Se algo não estiver na base, diga com sinceridade que não tem essa informação específica e oriente a confirmar no portal https://www.detran.pa.gov.br ou pelo telefone 154.
7. Valores de taxas são apenas uma REFERÊNCIA — explique que o valor exato é o que aparece no boleto/DAE gerado no site oficial.
8. Encaminhe para o lugar certo:
   - IPVA, DPVAT e impostos do veículo NÃO são com o DETRAN, e sim com a SEFA-PA (Secretaria da Fazenda). Site: app.sefa.pa.gov.br/consulta-ipva — Telefone: 0800-725-5533.
   - Multas: o DETRAN só resolve as multas aplicadas por ele mesmo (pelo Portal Venus). Multas de rodovia estadual são com o DER-PA; de rodovia federal (BR), com a PRF; de ruas da cidade, com a Prefeitura/SEMOB. Explique isso de forma simples se o caso pedir.
   - Para contestar multa (defesa ou recurso): Portal Venus (cidadao.detran.pa.gov.br), com login da conta gov.br.
9. Inclua os links oficiais quando ajudarem. Liste com bullets quando facilitar a leitura.
10. Você é um assistente informativo: ajuda a entender e a se organizar, mas não substitui o atendimento oficial e não dá aconselhamento jurídico. Diga isso de forma leve quando for um caso mais delicado.

DOCUMENTOS QUE O USUÁRIO PODE PREENCHER NA TELA:
A interface tem um preenchedor de documentos. Quando UM destes formulários for claramente útil para o que a pessoa pediu (ex.: vender o veículo, comunicar a venda, declarar residência, dar procuração), inclua NO FINAL da resposta, em UMA LINHA ISOLADA, o marcador [[FORM:id]] com o id correto. A interface vai transformar isso num botão "Abrir e preencher". Regras: use NO MÁXIMO um marcador por resposta; só inclua quando fizer sentido; nunca explique o marcador nem o coloque no meio do texto. Ids válidos:
${LISTA_FORMS}

BASE DE CONHECIMENTO:
${BASE_CONHECIMENTO}`;

// ── App ─────────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json({ limit: "256kb" }));

// Servir os arquivos estáticos (usado localmente; no Vercel o /public é servido
// direto pela CDN, então esta linha praticamente não é acionada lá).
app.use(express.static(join(ROOT, "public")));

const hits = new Map();
function rateLimited(ip) {
  const agora = Date.now();
  const reg = hits.get(ip) || { count: 0, reset: agora + RATE_WINDOW_MS };
  if (agora > reg.reset) { reg.count = 0; reg.reset = agora + RATE_WINDOW_MS; }
  reg.count += 1; hits.set(ip, reg);
  return reg.count > RATE_MAX;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, model: MODEL, keyConfigured: Boolean(API_KEY) });
});

app.get("/api/forms", (_req, res) => {
  res.json({ forms: FORM_INDEX });
});

app.get("/api/forms/:id", (req, res) => {
  const form = FORMS.find((f) => f.id === req.params.id);
  if (!form) return res.status(404).json({ error: "Documento não encontrado." });
  res.json({ form });
});

app.post("/api/chat", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({
      error: "Servidor sem ANTHROPIC_API_KEY configurada. Defina a chave nas variáveis de ambiente.",
    });
  }

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "anon";
  if (rateLimited(ip)) {
    return res.status(429).json({ error: "Muitas perguntas em sequência. Aguarde um instante e tente de novo." });
  }

  let { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Envie ao menos uma mensagem." });
  }
  messages = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS_PER_MSG) }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return res.status(400).json({ error: "A última mensagem deve ser do usuário." });
  }

  try {
    const resposta = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, system: SYSTEM_PROMPT, messages }),
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      console.error("[anthropic]", resposta.status, detalhe);
      return res.status(502).json({ error: "Não foi possível obter a resposta agora. Tente novamente em instantes." });
    }

    const data = await resposta.json();
    const texto = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    res.json({ reply: texto || "Não consegui gerar uma resposta. Pode reformular a pergunta?" });
  } catch (err) {
    console.error("[erro]", err);
    res.status(500).json({ error: "Erro interno ao processar a pergunta." });
  }
});

export default app;
export { MODEL, FORMS };
