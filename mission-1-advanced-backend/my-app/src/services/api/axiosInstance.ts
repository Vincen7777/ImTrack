import axios from 'axios';
import { getToken, clearToken } from '../../lib/authSession';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30_000,
});
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});
axiosInstance.interceptors.response.use((response) => response, (error) => {
  const currentToken = getToken();
  if (error.response?.status === 401 && currentToken && error.config?.headers?.Authorization === 'Bearer ' + currentToken && !error.config?.url?.startsWith('/auth/login')) {
    clearToken();
    window.dispatchEvent(new Event('imtrack:session-expired'));
  }
  return Promise.reject(error);
});
export function apiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const details = error.response?.data?.error?.details;
    return Array.isArray(details) ? details.join('. ') : error.response?.data?.error?.message || 'Tidak dapat menghubungi server. Periksa koneksi dan coba lagi.';
  }
  return error instanceof Error ? error.message : 'Terjadi kesalahan. Coba lagi.';
}
export default axiosInstance;
