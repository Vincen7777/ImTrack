/* ============================================================
   hooks/useTaskRedux.ts
   Custom hook untuk manajemen Task menggunakan Redux Toolkit.
   Menggunakan useSelector untuk membaca state dari Redux store
   dan useDispatch untuk mengirim action/thunk ke store.

   Ini menggantikan pendekatan state lokal di useTaskStore.ts
   dengan state management global (Redux).
   ============================================================ */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/redux/hooks';
import {
  fetchTasksThunk,
  addTaskThunk,
  updateTaskThunk,
  deleteTaskThunk,
  markNotifRead,
} from '../store/redux/taskSlice';
import type { Task } from '../types/task';

export function useTaskRedux() {
  const dispatch = useAppDispatch();

  /* ── Ambil state dari Redux store via useSelector ──────── */
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const loading = useAppSelector((state) => state.tasks.loading);
  const error = useAppSelector((state) => state.tasks.error);
  const notifications = useAppSelector((state) => state.tasks.notifications);

  /* ── FETCH — GET /task ─────────────────────────────────── */
  const fetchTasks = useCallback(() => {
    dispatch(fetchTasksThunk());
  }, [dispatch]);

  /* ── ADD — POST /task ──────────────────────────────────── */
  const addTask = useCallback(
    async (task: Omit<Task, 'id' | 'status'>) => {
      const result = await dispatch(addTaskThunk(task));
      if (addTaskThunk.rejected.match(result)) {
        throw new Error(result.payload as string);
      }
      return result.payload as Task;
    },
    [dispatch]
  );

  /* ── UPDATE — PUT /task/:id ────────────────────────────── */
  const updateTask = useCallback(
    async (id: string, changes: Omit<Task, 'id' | 'status'>) => {
      const result = await dispatch(updateTaskThunk({ id, changes }));
      if (updateTaskThunk.rejected.match(result)) {
        throw new Error(result.payload as string);
      }
      return result.payload as Task;
    },
    [dispatch]
  );

  /* ── TOGGLE STATUS — PUT /task/:id (hanya ubah status) ── */
  const toggleTask = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const newStatus = task.status === 'done' ? 'todo' : 'done';
      const result = await dispatch(
        updateTaskThunk({ id, changes: { status: newStatus } })
      );
      if (updateTaskThunk.rejected.match(result)) {
        throw new Error(result.payload as string);
      }
    },
    [dispatch, tasks]
  );

  /* ── DELETE — DELETE /task/:id ─────────────────────────── */
  const deleteTask = useCallback(
    async (id: string) => {
      const result = await dispatch(deleteTaskThunk(id));
      if (deleteTaskThunk.rejected.match(result)) {
        throw new Error(result.payload as string);
      }
    },
    [dispatch]
  );

  /* ── SEND TO GROUP (hapus dari daftar pribadi) ─────────── */
  const sendToGroup = useCallback(
    async (taskId: string) => {
      const result = await dispatch(deleteTaskThunk(taskId));
      if (deleteTaskThunk.rejected.match(result)) {
        throw new Error(result.payload as string);
      }
    },
    [dispatch]
  );

  /* ── MARK NOTIFICATION READ ────────────────────────────── */
  const markRead = useCallback(
    (id: string) => {
      dispatch(markNotifRead(id));
    },
    [dispatch]
  );

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
