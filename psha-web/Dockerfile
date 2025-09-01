# ============================
# Stage 1: Build
# ============================
FROM node:20 AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# ============================
# Stage 2: Serve
# ============================
FROM node:20-alpine AS runner
WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

# Railway injects PORT → fallback ke 3000
ENV PORT=3000
EXPOSE 3000

# ✅ pakai sh -c agar ekspansi ${PORT} jalan
CMD ["sh", "-c", "serve -s dist -l :${PORT:-3000}"]
