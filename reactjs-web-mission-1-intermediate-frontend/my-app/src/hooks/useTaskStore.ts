import { useState, useCallback } from 'react';
import type { Task, Notification } from '../types/task';

const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Review desain final untuk landing page',
    priority: 'Sekarang',
    status: 'todo',
    due: '2026-07-24',
    tags: ['#design', '#urgent'],
    cat: 'pekerjaan',
  },
  {
    id: 't2',
    title: 'Setup environment staging',
    priority: 'Nanti',
    status: 'todo',
    due: '2026-07-25',
    tags: ['#devops'],
    cat: 'pekerjaan',
  },
  {
    id: 't3',
    title: 'Meeting 1-on-1 dengan tim marketing',
    priority: 'Sekarang',
    status: 'todo',
    due: '2026-07-24',
    tags: ['#meeting'],
    cat: 'pekerjaan',
  },
  {
    id: 't4',
    title: 'Baca buku Atomic Habits bab 5',
    priority: 'Someday',
    status: 'todo',
    due: null,
    tags: ['#selfdev'],
    cat: 'pribadi',
  },
  {
    id: 't5',
    title: 'Olahraga pagi 30 menit',
    priority: 'Sekarang',
    status: 'done',
    due: null,
    tags: ['#health'],
    cat: 'pribadi',
  },
  {
    id: 't6',
    title: 'Update CV dan portfolio online',
    priority: 'Nanti',
    status: 'todo',
    due: '2026-07-30',
    tags: ['#career'],
    cat: 'pribadi',
  },
];

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
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFS);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const sendToGroup = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const addTask = useCallback(
    (task: Omit<Task, 'id' | 'status'>) => {
      const newTask: Task = { ...task, id: 't' + Date.now(), status: 'todo' };
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
    },
    []
  );

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  return { tasks, notifications, toggleTask, deleteTask, sendToGroup, addTask, markRead };
}
