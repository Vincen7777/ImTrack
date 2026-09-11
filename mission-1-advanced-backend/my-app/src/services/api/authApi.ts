import api from './axiosInstance';
export interface User {
  id: string; fullname: string; username: string; email: string; emailVerified: boolean; avatarUrl: string | null;
}
export async function register(payload: { fullname: string; username: string; email: string; password: string }) {
  return (await api.post<{ message: string; emailDelivery: string }>('/auth/register', payload)).data;
}
export async function login(email: string, password: string) {
  return (await api.post<{ token: string; user: User }>('/auth/login', { email, password })).data;
}
export async function getMe() { return (await api.get<{ user: User }>('/auth/me')).data.user; }
export async function verifyEmail(token: string) { return (await api.post<{ message: string }>('/auth/verify-email', { token })).data; }
export async function resendVerification(email: string) { return (await api.post<{ message: string }>('/auth/resend-verification', { email })).data; }
export async function uploadAvatar(file: File) {
  const form = new FormData();
  form.append('file', file);
  return (await api.post<{ file: { url: string } }>('/upload', form)).data.file;
}
