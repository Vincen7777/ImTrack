/* ============================================================
   services/api/taskApi.ts
   Semua fungsi API call untuk entitas Task:
     - getTasks   → GET    /tasks
     - createTask → POST   /tasks
     - updateTask → PUT    /tasks/:id
     - deleteTask → DELETE /tasks/:id
   ============================================================ */

import axiosInstance from './axiosInstance';
import type { Task } from '../../types/task';

/** Shape yang diterima dari / dikirim ke API (id selalu string) */
export type TaskPayload = Omit<Task, 'id'>;

/* ── GET all tasks ──────────────────────────────────────── */
export async function getTasks(): Promise<Task[]> {
  const { data } = await axiosInstance.get<Task[]>('/task');
  return data;
}

/* ── POST — tambah task baru ────────────────────────────── */
export async function createTask(payload: TaskPayload): Promise<Task> {
  const { data } = await axiosInstance.post<Task>('/task', payload);
  return data;
}

/* ── PUT — update task berdasarkan id ───────────────────── */
export async function updateTask(
  id: string,
  payload: Partial<TaskPayload>
): Promise<Task> {
  const { data } = await axiosInstance.put<Task>(`/task/${id}`, payload);
  return data;
}

/* ── DELETE — hapus task berdasarkan id ─────────────────── */
export async function deleteTask(id: string): Promise<void> {
  await axiosInstance.delete(`/task/${id}`);
}
