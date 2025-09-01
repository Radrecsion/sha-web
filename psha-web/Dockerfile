# Stage 1: Build React
FROM node:20 AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy seluruh source dan build
COPY . ./
RUN npm run build

# Stage 2: Serve dengan Nginx
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Copy hasil build React
COPY --from=builder /app/dist ./

# Copy config.js placeholder
COPY public/config.js ./

# Copy nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Tambahkan gettext untuk envsubst
RUN apk add --no-cache gettext

# Gunakan entrypoint
ENTRYPOINT ["/entrypoint.sh"]
