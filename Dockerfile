# syntax=docker/dockerfile:1

FROM node:22-alpine AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm npm ci

FROM base AS builder

ARG LARAVEL_API_URL=http://host.docker.internal:8000
ARG MEDIA_BASE_URL=http://host.docker.internal:8000

ENV LARAVEL_API_URL=${LARAVEL_API_URL}
ENV MEDIA_BASE_URL=${MEDIA_BASE_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ARG LARAVEL_API_URL=http://host.docker.internal:8000
ARG MEDIA_BASE_URL=http://host.docker.internal:8000

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV LARAVEL_API_URL=${LARAVEL_API_URL}
ENV MEDIA_BASE_URL=${MEDIA_BASE_URL}

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next \
    && chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
