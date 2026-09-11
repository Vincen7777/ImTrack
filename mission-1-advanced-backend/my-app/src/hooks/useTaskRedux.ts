import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/redux/hooks';
import { fetchTasksThunk, addTaskThunk, updateTaskThunk, deleteTaskThunk, markNotifRead } from '../store/redux/taskSlice';
import type { Task } from '../types/task';
import type { TaskQuery } from '../services/api/taskApi';

export function useTaskRedux() {
  const dispatch = useAppDispatch();
  const { tasks, loading, error, notifications } = useAppSelector((state) => state.tasks);
  const fetchTasks = useCallback((query?: TaskQuery) => dispatch(fetchTasksThunk(query)), [dispatch]);
  const addTask = useCallback(async (task: Omit<Task, 'id' | 'status'>) => {
    const result = await dispatch(addTaskThunk(task)).unwrap(); dispatch(fetchTasksThunk()); return result;
  }, [dispatch]);
  const updateTask = useCallback(async (id: string, changes: Omit<Task, 'id' | 'status'>) => {
    const result = await dispatch(updateTaskThunk({ id, changes })).unwrap(); dispatch(fetchTasksThunk()); return result;
  }, [dispatch]);
  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    await dispatch(updateTaskThunk({ id, changes: { status: task.status === 'done' ? 'todo' : 'done' } })).unwrap();
    dispatch(fetchTasksThunk());
  }, [dispatch, tasks]);
  const deleteTask = useCallback(async (id: string) => {
    await dispatch(deleteTaskThunk(id)).unwrap(); dispatch(fetchTasksThunk());
  }, [dispatch]);
  const markRead = useCallback((id: string) => { dispatch(markNotifRead(id)); }, [dispatch]);
  return { tasks, loading, error, notifications, fetchTasks, addTask, updateTask, toggleTask, deleteTask, markRead };
}
