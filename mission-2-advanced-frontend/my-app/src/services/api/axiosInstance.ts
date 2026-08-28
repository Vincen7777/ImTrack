/* ============================================================
   services/api/axiosInstance.ts
   Axios instance terpusat — baseURL dari .env, interceptor
   untuk logging request/response dan error handling.
   ============================================================ */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!BASE_URL) {
  console.warn(
    '[ImTrack] VITE_API_BASE_URL tidak ditemukan di .env. ' +
    'Pastikan file .env sudah dikonfigurasi dengan benar.'
  );
}

/** Axios instance dengan baseURL dari environment variable */
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000, // 10 detik timeout
});

/* ── Request Interceptor ─────────────────────────────────── */
axiosInstance.interceptors.request.use(
  (config) => {
    // Logging tiap request (bisa ditambah Authorization header di sini)
    console.log(`[API ➤] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API ➤ Request Error]', error);
    return Promise.reject(error);
  }
);

/* ── Response Interceptor ────────────────────────────────── */
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[API ✓] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    console.error(`[API ✗] ${status ?? 'Network Error'} ${url ?? ''}`);
    return Promise.reject(error);
  }
);

export default axiosInstance;
