# GuiaSense

Gestão financeira pessoal simples, visual e intuitiva. O GuiaSense guia o usuário: entradas, saídas, orçamento, alertas e orientações inteligentes — sem complexidade.

## Estrutura

```
guiaSense/
├── frontend/   # Next.js + Tailwind (hospedado na Vercel)
└── backend/    # Node.js + Express + TypeScript + Prisma/PostgreSQL (hospedado na Railway)
```

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js (React), Tailwind CSS, recharts |
| Backend | Node.js, Express, TypeScript |
| Banco | PostgreSQL via Prisma ORM |
| IA | OpenAI API |
| Pagamento | Mercado Pago (webhooks) |

## Como rodar local

### Backend

```bash
cd backend
npm install
cp .env.example .env   # preencha as variáveis
npx prisma migrate dev --name init
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # preencha NEXT_PUBLIC_API_URL
npm run dev
```

Acesse http://localhost:3000.

## Deploy

- Frontend → Vercel (auto-deploy no push para `main`)
- Backend → Railway (auto-deploy; adicionar o PostgreSQL e as env vars)

Veja o documento mestre em `PROMPT MESTRE — DESENVOLVIMENTO DO GUIASENSE.md`.
