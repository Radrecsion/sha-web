// src/config.js
export const API_URL =
  // jika dijalankan di GitHub Pages / browser, pakai production API
  window.location.hostname.includes("github.io")
    ? "https://sha-api-production.up.railway.app/api/v1"
    : import.meta.env.VITE_API_URL;
