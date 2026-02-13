FROM node:22-alpine AS base

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable && pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

ENV NODE_ENV=production

EXPOSE 3333

CMD ["node", "dist/index.js"]
