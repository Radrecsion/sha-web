# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app

# Copy package.json & package-lock.json dari folder psha-web
COPY package.json package-lock.json ./
RUN npm install

# Copy semua kode
COPY . ./

# Build Vite frontend
RUN npm run build

# Stage 2: Serve
FROM node:20-alpine AS runner
WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

# Railway memberikan PORT
ENV PORT 3000
EXPOSE $PORT

# Jalankan server menggunakan port Railway
CMD ["sh", "-c", "serve -s dist -l $PORT"]

