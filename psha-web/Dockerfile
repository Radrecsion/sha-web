# Stage 1: Build React
FROM node:20 AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . ./
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.27-alpine AS runner
WORKDIR /usr/share/nginx/html

# Hapus file default
RUN rm -rf ./*

# Copy hasil build dari stage builder
COPY --from=builder /app/dist ./

# Copy konfigurasi nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
