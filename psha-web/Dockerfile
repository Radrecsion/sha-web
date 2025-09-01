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

# Install envsubst (buat replace $PORT di config)
RUN apk add --no-cache gettext

# Copy konfigurasi nginx template
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Generate config pakai envsubst dan jalankan nginx
CMD [ "sh", "-c", "envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'" ]
