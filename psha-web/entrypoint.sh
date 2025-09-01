#!/bin/sh
set -e

# Path ke config.js di dalam container
CONFIG_PATH="/usr/share/nginx/html/config.js"
RUNTIME_PATH="/usr/share/nginx/html/config.runtime.js"

# Cek dulu apakah file config.js ada
if [ ! -f "$CONFIG_PATH" ]; then
  echo "⚠️  config.js tidak ditemukan di $CONFIG_PATH"
  exit 1
fi

# Ganti placeholder dengan env var Railway
echo "🔧 Mengganti placeholder config.js dengan env vars"
envsubst < "$CONFIG_PATH" > "$RUNTIME_PATH"
mv "$RUNTIME_PATH" "$CONFIG_PATH"

# Jalankan Nginx di foreground
echo "🚀 Menjalankan Nginx..."
exec nginx -g 'daemon off;'
