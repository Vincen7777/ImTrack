/* ============================================================
   ImTrack — Task & related types
   ============================================================ */

export type Priority = 'Sekarang' | 'Nanti' | 'Someday';
export type TaskStatus = 'todo' | 'done';

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  status: TaskStatus;
  due: string | null;
  tags: string[];
  cat: string;
  isRecurring?: boolean;
  recurrenceType?: 'daily' | 'weekly' | 'monthly';
}

export interface Group {
  id: string;
  name: string;
}

export interface Notification {
  id: string;
  text: string;
  time: string;
  read: boolean;
}
