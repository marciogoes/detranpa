# Publicar no Vercel

Este projeto já está pronto para o Vercel: o backend roda como função serverless
(`api/index.js`) e a interface (`public/`) é servida pela CDN. O arquivo
`vercel.json` cuida do roteamento.

## Antes de tudo: a chave da API

A chave da Anthropic **não vai para o Git** (o `.env` está no `.gitignore`).
No Vercel, ela é configurada como **variável de ambiente**. Como a chave antiga
já foi exposta, gere uma nova em https://console.anthropic.com/settings/keys.

Variáveis a configurar no Vercel (Project → Settings → Environment Variables):

| Nome | Obrigatória | Exemplo |
|---|---|---|
| `ANTHROPIC_API_KEY` | Sim | `sk-ant-...` |
| `ANTHROPIC_MODEL` | Não | `claude-sonnet-4-6` |
| `MAX_TOKENS` | Não | `2048` |

(Não defina `PORT` no Vercel — só é usada localmente.)

## Caminho A — pelo site do Vercel (mais fácil)

1. Suba o projeto para um repositório no GitHub (sem o `.env`).
2. Em https://vercel.com, clique em **Add New → Project** e importe o repositório.
3. Em **Framework Preset**, deixe **Other** (não é Next.js).
4. Antes de concluir, em **Environment Variables**, adicione `ANTHROPIC_API_KEY`
   (e as opcionais acima).
5. Clique em **Deploy**. Ao final, o Vercel dá uma URL pública (ex.:
   `https://detranpa.vercel.app`).

A cada `git push`, o Vercel publica a nova versão automaticamente.

## Caminho B — pela linha de comando (Vercel CLI)

```bash
npm i -g vercel        # instala a CLI (uma vez)
vercel login           # entra na sua conta
vercel                 # primeira publicação (responda às perguntas)
# defina a chave (repita para preview/production se quiser):
vercel env add ANTHROPIC_API_KEY
vercel --prod          # publica em produção
```

## Rodar localmente (continua igual)

```bash
npm install
npm start              # http://localhost:3000
```

## Observações

- **Atualizar a base de conhecimento ou os documentos:** edite os arquivos em
  `knowledge/` ou `forms-data.js`, faça commit/push (ou `vercel --prod`).
- **Limite de requisições:** o controle por IP é em memória. No Vercel
  (serverless), cada instância tem a sua contagem, então ele serve só como
  barreira leve. Para produção de verdade, considere um limitador externo
  e um teto de gastos no console da Anthropic.
- **Custo:** cada pergunta no chat consome a API da Anthropic (paga). A consulta
  e o preenchimento de documentos NÃO usam a API — rodam no navegador.
