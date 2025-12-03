# ============================================
# Stage 1 — Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build


# ============================================
# Stage 2 — Production
# ============================================
FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache openssl

# Copy package files (IMPORTANT for prisma.seed)
COPY package.json package-lock.json ./

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy built code
COPY --from=builder /app/dist ./dist

# Copy prisma (schema + seed.ts)
COPY --from=builder /app/prisma ./prisma

EXPOSE 3333

# Correct entrypoint
CMD ["node", "dist/src/main.js"]
