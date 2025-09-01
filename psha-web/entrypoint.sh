#!/bin/sh
set -e

# Ganti placeholder dengan env Railway
envsubst < /usr/share/nginx/html/config.js > /usr/share/nginx/html/config.runtime.js
mv /usr/share/nginx/html/config.runtime.js /usr/share/nginx/html/config.js

# Start nginx
exec nginx -g 'daemon off;'
