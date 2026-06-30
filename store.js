// ─────────────────────────────────────────────────────────────────────────────
// Armazenamento do conhecimento ensinado pelo Tutor.
//
// Modos (escolhidos automaticamente):
//   • "kv"   — Vercel KV / Upstash Redis (REST). Permanente, recomendado p/ produção.
//   • "file" — arquivo local data/tutor-knowledge.json. Usado no seu PC.
//   • "none" — Vercel sem KV: leitura ok, gravar bloqueado (fs somente leitura).
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "data");
const FILE = join(DATA_DIR, "tutor-knowledge.json");

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const KV_KEY = "detranpa:tutor:knowledge";
const ON_VERCEL = Boolean(process.env.VERCEL);

export function storageMode() {
  if (KV_URL && KV_TOKEN) return "kv";
  if (!ON_VERCEL) return "file";
  return "none";
}

async function kv(command) {
  const res = await fetch(KV_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error("KV_HTTP_" + res.status);
  const data = await res.json();
  return data.result;
}

async function readAll() {
  const mode = storageMode();
  if (mode === "kv") {
    const raw = await kv(["GET", KV_KEY]);
    return raw ? JSON.parse(raw) : [];
  }
  if (existsSync(FILE)) {
    try { return JSON.parse(readFileSync(FILE, "utf8")); } catch { return []; }
  }
  return [];
}

async function writeAll(entries) {
  const mode = storageMode();
  if (mode === "kv") { await kv(["SET", KV_KEY, JSON.stringify(entries)]); return; }
  if (mode === "file") {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(FILE, JSON.stringify(entries, null, 2), "utf8");
    return;
  }
  throw new Error("PERSIST_NONE"); // Vercel sem KV
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export async function listEntries() {
  const all = await readAll();
  return all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function addEntry({ title, content, source }) {
  const entries = await readAll();
  const now = Date.now();
  const entry = {
    id: genId(),
    title: String(title).trim(),
    content: String(content).trim(),
    source: source ? String(source) : "texto", // "texto" ou "documento"
    createdAt: now,
    updatedAt: now,
  };
  entries.push(entry);
  await writeAll(entries);
  return entry;
}

export async function updateEntry(id, { title, content }) {
  const entries = await readAll();
  const e = entries.find((x) => x.id === id);
  if (!e) return null;
  if (title != null) e.title = String(title).trim();
  if (content != null) e.content = String(content).trim();
  e.updatedAt = Date.now();
  await writeAll(entries);
  return e;
}

export async function deleteEntry(id) {
  const entries = await readAll();
  const next = entries.filter((x) => x.id !== id);
  if (next.length === entries.length) return false;
  await writeAll(next);
  return true;
}

// Texto pronto para injetar no system prompt do assistente.
export async function knowledgeText() {
  const entries = await readAll();
  if (!entries.length) return "";
  return entries
    .map((e) => `• ${e.title}\n${e.content}`)
    .join("\n\n");
}
