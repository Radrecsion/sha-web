# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app

# Copy dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source
COPY . ./

# Build Vite
RUN npm run build

# Stage 2: Serve
FROM node:20-alpine AS runner
WORKDIR /app

RUN npm install -g serve

# Copy hasil build
COPY --from=builder /app/dist ./dist

# Railway akan inject $PORT
ENV PORT=3000
EXPOSE 3000

# ✅ serve butuh format -l :$PORT
CMD ["sh", "-c", "serve -s dist -l :${PORT}"]
