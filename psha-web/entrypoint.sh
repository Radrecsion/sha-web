#!/bin/sh
set -e

# Ganti placeholder config.js dengan environment variable Railway
envsubst < /usr/share/nginx/html/config.js > /usr/share/nginx/html/config.runtime.js
mv /usr/share/nginx/html/config.runtime.js /usr/share/nginx/html/config.js

# Start nginx (foreground)
exec nginx -g 'daemon off;'
