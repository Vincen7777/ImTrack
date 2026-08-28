/* ============================================================
   hooks/useTaskStore.ts
   Custom hook untuk manajemen task secara async via API.
   Menggantikan data statis (INITIAL_TASKS) dengan HTTP calls
   ke MockAPI melalui service layer di services/api/taskApi.ts
   ============================================================ */

import { useState, useCallback } from 'react';
import type { Task, Notification } from '../types/task';
import {
  getTasks,
  createTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
} from '../services/api/taskApi';

/* ── Initial notifications (tetap lokal, bukan dari API) ── */
const INITIAL_NOTIFS: Notification[] = [
  {
    id: 'n1',
    text: 'Sari mention kamu di tugas "Review UI komponen"',
    time: '5 menit lalu',
    read: false,
  },
  {
    id: 'n2',
    text: 'Dimas assign tugas ke kamu: "Review UI komponen"',
    time: '30 menit lalu',
    read: false,
  },
  {
    id: 'n3',
    text: 'Tugas "Deploy ke staging" jatuh tempo hari ini',
    time: '1 jam lalu',
    read: true,
  },
];

export function useTaskStore() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFS);

  /* ── FETCH — GET /tasks ─────────────────────────────────── */
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error('fetchTasks gagal:', err);
      setError('Gagal memuat tugas. Periksa koneksi atau konfigurasi API.');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── ADD — POST /tasks ──────────────────────────────────── */
  const addTask = useCallback(
    async (task: Omit<Task, 'id' | 'status'>) => {
      try {
        const newTask = await createTask({ ...task, status: 'todo' });
        setTasks((prev) => [newTask, ...prev]);
        setNotifications((prev) => [
          {
            id: 'n' + Date.now(),
            text: `Tugas baru: "${task.title}"`,
            time: 'Baru saja',
            read: false,
          },
          ...prev,
        ]);
        return newTask;
      } catch (err) {
        console.error('addTask gagal:', err);
        throw err; // Lempar ke pemanggil agar bisa tampilkan toast error
      }
    },
    []
  );

  /* ── UPDATE — PUT /tasks/:id ────────────────────────────── */
  const updateTask = useCallback(
    async (id: string, changes: Omit<Task, 'id' | 'status'>) => {
      try {
        const updated = await apiUpdateTask(id, changes);
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
        );
        return updated;
      } catch (err) {
        console.error('updateTask gagal:', err);
        throw err;
      }
    },
    []
  );

  /* ── TOGGLE STATUS — PUT /tasks/:id (hanya ubah status) ── */
  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      const updated = await apiUpdateTask(id, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
      );
    } catch (err) {
      console.error('toggleTask gagal:', err);
      throw err;
    }
  }, [tasks]);

  /* ── DELETE — DELETE /tasks/:id ────────────────────────── */
  const deleteTask = useCallback(async (id: string) => {
    try {
      await apiDeleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('deleteTask gagal:', err);
      throw err;
    }
  }, []);

  /* ── SEND TO GROUP (lokal — hapus dari daftar pribadi) ─── */
  const sendToGroup = useCallback(async (taskId: string) => {
    try {
      await apiDeleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('sendToGroup gagal:', err);
      throw err;
    }
  }, []);

  /* ── MARK NOTIFICATION READ (lokal) ───────────────────── */
  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  return {
    tasks,
    loading,
    error,
    notifications,
    fetchTasks,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    sendToGroup,
    markRead,
  };
}
