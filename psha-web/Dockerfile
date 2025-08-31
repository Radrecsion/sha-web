# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve
FROM node:20-alpine AS runner
WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy build output
COPY --from=builder /app/dist ./dist

# Railway memberikan port melalui env PORT
ENV PORT $PORT
EXPOSE $PORT

# Jalankan server
CMD ["serve", "-s", "dist", "-l", "0.0.0.0:$PORT"]
