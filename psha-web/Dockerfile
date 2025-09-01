FROM node:20 as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist ./
COPY config.js ./          # masukkan placeholder config.js
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN apk add --no-cache gettext
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
