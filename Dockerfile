FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./

FROM base AS dependencies
RUN npm ci

FROM dependencies AS builder
COPY . .
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV DATABASE_URL=postgresql://wamoro:build@127.0.0.1:5432/wamoro_farms?schema=public
RUN npm run build

FROM builder AS migrator
ENV NODE_ENV=production
CMD ["npm", "run", "db:deploy"]

FROM base AS production-dependencies
ENV NODE_ENV=production
RUN npm ci --omit=dev

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/package.json ./package.json
RUN mkdir -p /app/.next/cache /app/storage/uploads \
    && chown node:node /app/.next/cache /app/storage/uploads
USER node
EXPOSE 3000
CMD ["npm", "run", "start"]
