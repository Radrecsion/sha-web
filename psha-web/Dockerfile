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

# Install serve
RUN npm install -g serve

# Copy hasil build dari stage builder
COPY --from=builder /app/dist ./dist

# Railway memberikan PORT
ENV PORT $PORT
EXPOSE $PORT

# Jalankan server
CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:$PORT"]
