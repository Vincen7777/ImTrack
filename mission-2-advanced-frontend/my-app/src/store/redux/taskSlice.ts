/* ============================================================
   store/redux/taskSlice.ts
   Redux Toolkit slice untuk manajemen state Task secara global.
   Menggunakan createAsyncThunk untuk operasi async API:
     - fetchTasksThunk → GET    /task
     - addTaskThunk    → POST   /task
     - updateTaskThunk → PUT    /task/:id
     - deleteTaskThunk → DELETE /task/:id
   ============================================================ */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Task, Notification } from '../../types/task';
import {
  getTasks,
  createTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
} from '../../services/api/taskApi';
import type { TaskPayload } from '../../services/api/taskApi';

/* ── State Shape ──────────────────────────────────────────── */
interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  notifications: Notification[];
}

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

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  notifications: INITIAL_NOTIFS,
};

/* ── Async Thunks ─────────────────────────────────────────── */

/** GET /task — ambil semua task dari API */
export const fetchTasksThunk = createAsyncThunk(
  'tasks/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await getTasks();
    } catch (err) {
      console.error('fetchTasksThunk gagal:', err);
      return rejectWithValue('Gagal memuat tugas. Periksa koneksi atau konfigurasi API.');
    }
  }
);

/** POST /task — tambah task baru */
export const addTaskThunk = createAsyncThunk(
  'tasks/add',
  async (payload: Omit<Task, 'id' | 'status'>, { rejectWithValue }) => {
    try {
      return await createTask({ ...payload, status: 'todo' });
    } catch (err) {
      console.error('addTaskThunk gagal:', err);
      return rejectWithValue('Gagal menambahkan tugas.');
    }
  }
);

/** PUT /task/:id — update task berdasarkan id */
export const updateTaskThunk = createAsyncThunk(
  'tasks/update',
  async (
    { id, changes }: { id: string; changes: Partial<TaskPayload> },
    { rejectWithValue }
  ) => {
    try {
      return await apiUpdateTask(id, changes);
    } catch (err) {
      console.error('updateTaskThunk gagal:', err);
      return rejectWithValue('Gagal memperbarui tugas.');
    }
  }
);

/** DELETE /task/:id — hapus task berdasarkan id */
export const deleteTaskThunk = createAsyncThunk(
  'tasks/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiDeleteTask(id);
      return id; // kembalikan id agar reducer bisa filter
    } catch (err) {
      console.error('deleteTaskThunk gagal:', err);
      return rejectWithValue('Gagal menghapus tugas.');
    }
  }
);

/* ── Slice ────────────────────────────────────────────────── */
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    /** Tandai notifikasi sebagai sudah dibaca */
    markNotifRead(state, action: PayloadAction<string>) {
      const notif = state.notifications.find((n) => n.id === action.payload);
      if (notif) notif.read = true;
    },
    /** Tambah notifikasi baru (lokal) */
    pushNotification(state, action: PayloadAction<Notification>) {
      state.notifications.unshift(action.payload);
    },
    /** Reset error state */
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    /* ─ fetchTasksThunk ─ */
    builder
      .addCase(fetchTasksThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasksThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    /* ─ addTaskThunk ─ */
    builder
      .addCase(addTaskThunk.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
        state.notifications.unshift({
          id: 'n' + Date.now(),
          text: `Tugas baru: "${action.payload.title}"`,
          time: 'Baru saja',
          read: false,
        });
      })
      .addCase(addTaskThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    /* ─ updateTaskThunk ─ */
    builder
      .addCase(updateTaskThunk.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      })
      .addCase(updateTaskThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    /* ─ deleteTaskThunk ─ */
    builder
      .addCase(deleteTaskThunk.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTaskThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { markNotifRead, pushNotification, clearError } = taskSlice.actions;
export default taskSlice.reducer;
