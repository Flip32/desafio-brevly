# Brev.ly

Aplicacao FullStack para encurtamento de URLs com cadastro, listagem, remocao, redirecionamento, contabilizacao de acessos e exportacao de relatorio em CSV.

**Estrutura**

- `server` - API (Fastify + Drizzle + Postgres) e DevOps (Docker)
- `web` - SPA React (Vite)

**Stack**

- TypeScript
- Fastify
- Drizzle ORM
- PostgreSQL
- React
- Vite

**Checklist Backend (Desafio)**

- [ ] Deve ser possivel criar um link
- [ ] Nao deve ser possivel criar um link com URL encurtada mal formatada
- [ ] Nao deve ser possivel criar um link com URL encurtada ja existente
- [ ] Deve ser possivel deletar um link
- [ ] Deve ser possivel obter a URL original por meio de uma URL encurtada
- [ ] Deve ser possivel listar todas as URL's cadastradas
- [ ] Deve ser possivel incrementar a quantidade de acessos de um link
- [ ] Deve ser possivel exportar os links criados em um CSV
- [ ] Deve ser possivel acessar o CSV por meio de uma CDN (Cloudflare R2)
- [ ] Deve ser gerado um nome aleatorio e unico para o arquivo
- [ ] Deve ser possivel realizar a listagem de forma performatica
- [ ] O CSV deve ter campos como URL original, URL encurtada, contagem de acessos e data de criacao

**Checklist Frontend (Desafio)**

- [ ] Deve ser possivel criar um link
- [ ] Nao deve ser possivel criar um link com encurtamento mal formatado
- [ ] Nao deve ser possivel criar um link com encurtamento ja existente
- [ ] Deve ser possivel deletar um link
- [ ] Deve ser possivel obter a URL original por meio do encurtamento
- [ ] Deve ser possivel listar todas as URL's cadastradas
- [ ] Deve ser possivel incrementar a quantidade de acessos de um link
- [ ] Deve ser possivel baixar um CSV com o relatorio dos links criados
- [ ] Aplicacao React SPA com Vite
- [ ] Layout fiel ao Figma
- [ ] Boa UX (empty state, loading e bloqueio de acoes)
- [ ] Responsividade (desktop e mobile)

**Backend**

Arquivos principais:
- `server/src/index.ts`
- `server/src/http/routes/links.ts`
- `server/src/db/schema.ts`
- `server/src/db/migrations/0000_init.sql`

Variaveis de ambiente:

```env
PORT=
NODE_ENV=
DATABASE_URL=

CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_ACCESS_KEY_ID=
CLOUDFLARE_SECRET_ACCESS_KEY=
CLOUDFLARE_BUCKET=
CLOUDFLARE_PUBLIC_URL=
```

Observacoes:
- `DATABASE_URL` deve iniciar com `postgresql://`.
- As variaveis do Cloudflare R2 sao obrigatorias para a API iniciar.

Scripts:

```bash
pnpm run dev
pnpm run build
pnpm run start
pnpm run db:migrate
pnpm run lint
pnpm run lint:fix
pnpm run format
pnpm run check:fix
```

Endpoints principais:

- `POST /links`
- `GET /links`
- `GET /links/:shortCode`
- `PATCH /links/:shortCode/access`
- `DELETE /links/:shortCode`
- `GET /links/export`

CSV exportado:

Campos e ordem:
- `original_url`
- `short_code`
- `access_count`
- `created_at`

**Frontend**

Paginas:
- `/` cadastro e listagem
- `/:shortCode` redirecionamento
- `*` not found

Variaveis de ambiente:

```env
VITE_FRONTEND_URL=
VITE_BACKEND_URL=
```

Scripts:

```bash
pnpm run dev
pnpm run build
pnpm run preview
pnpm run lint
pnpm run lint:fix
pnpm run format
pnpm run check:fix
```

**Docker (Postgres)**

Arquivo:
- `server/docker-compose.yml`

Subir o banco:

```bash
cd server
pnpm exec docker-compose up -d
```

Exemplo de `DATABASE_URL`:

```
postgresql://docker:docker@localhost:5432/brevly
```

**Como rodar localmente**

1. Suba o Postgres com Docker (ou localmente)
2. Backend

```bash
cd server
pnpm install
pnpm run db:migrate
pnpm run dev
```

3. Frontend

```bash
cd web
pnpm install
pnpm run dev
```

