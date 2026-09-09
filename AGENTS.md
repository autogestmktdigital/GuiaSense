# GuiaSense — contexto do projeto

Monorepo com dois apps:

| Diretório  | Stack                                                         | Local dev          | Produção (auto-deploy) |
| ---------- | ------------------------------------------------------------- | ------------------ | ---------------------- |
| `backend/` | Node + Express + TypeScript + Prisma + PostgreSQL (`tsx`)     | `npm run dev`      | Railway (porta 4000)   |
| `frontend/`| Next.js 16 (Turbopack) + React 19 + Tailwind 4 + `output: export` | `npm run dev` | Netlify (pasta `out`)  |

## Comandos úteis

- Backend: `npm run typecheck`, `npm run lint` (se existir script), `npm run seed:demo`
- Frontend: `npm run lint` (eslint), `npx tsc --noEmit`, `npm run build`
- Seed do usuário demo: `npm run seed:demo` (cria `demo@guiasense.com` / `Demo1234!`; bloqueia se `DATABASE_URL` não for localhost)

## Banco local

- PostgreSQL em `localhost:5432`, banco `guiasense` (usuário/senha `postgres`/`postgres` no `.env` local)

## Deploy — regra de release

- Flow: **commit + push em `master`** → GitHub → **auto-deploy** em Railway (backend) e Netlify (frontend).
- Publicar **sempre onde houve alteração** (backend e/ou frontend conforme os arquivos modificados).
- Nunca commit de `backup/*.zip`, logs, `.env*`, `node_modules`, `.next`, `out`, `dist`.
- Não fazer deploy automático sem solicitação explícita do usuário.

## Decisões reincidentes (para não repetir em cada sessão)

- Não há CI/CD por GitHub Actions; o deploy é via push + integração dos dashboards (Railway/Netlify).
- `gh` não fica autenticado neste ambiente; o git usa o Windows Credential Manager.
- Questões de "método/escopo de deploy" já respondidas: usar push em `master` e publicar todas as áreas alteradas.