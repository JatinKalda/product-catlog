FROM node:20-alpine AS base
WORKDIR /app

# Install deps first (cached layer)
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Production image ──────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist         ./dist
COPY --from=base /app/prisma       ./prisma
COPY package.json ./

EXPOSE 3000

# Run migrations then start — safe to run on every deploy (idempotent)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
