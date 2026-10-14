FROM node:22-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
# NEXT_PUBLIC_* được inline lúc build (canonical URL/SEO) → phải truyền qua build-arg.
# Mặc định = canonical để `docker build` không truyền arg vẫn build được (compose/CI vẫn truyền tường minh).
ARG NEXT_PUBLIC_SITE_URL=https://ntavietnam.tech
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Image một-lần cho `nta-migrate` (compose profile tools): gate destructive + drizzle-orm migrator.
# Dùng lại node_modules của stage deps (đã có trong build cache của web) → không tốn thêm lớp node_modules.
FROM deps AS migrator
COPY drizzle ./drizzle
COPY deploy/db/migrate.ts deploy/db/migration-gate.ts ./deploy/db/
USER node
ENTRYPOINT ["node", "--import", "tsx", "deploy/db/migrate.ts"]
CMD ["check"]

# Stage cuối = image web mặc định (compose nta-web không đặt target).
FROM base AS runner
ENV NODE_ENV=production PORT=8080 HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nextjs && useradd --system --uid 1001 --gid nextjs nextjs
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public
EXPOSE 8080
USER nextjs
CMD ["node", "server.js"]
