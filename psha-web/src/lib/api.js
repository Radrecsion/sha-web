import axios from "axios";

// Ambil API URL dari runtime config kalau ada
const API_URL =
  window.RUNTIME_CONFIG?.API_URL || import.meta.env.VITE_API_URL;

console.log("🔗 Using API URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
});

export default api;
