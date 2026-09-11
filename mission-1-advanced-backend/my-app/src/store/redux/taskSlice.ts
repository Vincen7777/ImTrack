import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Task, Notification } from '../../types/task';
import { getTasks, createTask, updateTask, deleteTask, type TaskPayload, type TaskQuery } from '../../services/api/taskApi';
import { apiError } from '../../services/api/axiosInstance';

interface TaskState {
  tasks: Task[]; loading: boolean; error: string | null; notifications: Notification[];
  query: TaskQuery; requestId: string | null;
}
const initialState: TaskState = { tasks: [], loading: false, error: null, notifications: [], query: {}, requestId: null };

export const fetchTasksThunk = createAsyncThunk('tasks/fetchAll', async (query: TaskQuery | undefined, { getState, rejectWithValue, signal }) => {
  try { return await getTasks(query ?? (getState() as { tasks: TaskState }).tasks.query, signal); }
  catch (error) { return rejectWithValue(apiError(error)); }
});
export const addTaskThunk = createAsyncThunk('tasks/add', async (payload: Omit<Task, 'id' | 'status'>, { rejectWithValue }) => {
  try { return await createTask({ ...payload, status: 'todo' }); } catch (error) { return rejectWithValue(apiError(error)); }
});
export const updateTaskThunk = createAsyncThunk('tasks/update', async ({ id, changes }: { id: string; changes: Partial<TaskPayload> }, { rejectWithValue }) => {
  try { return await updateTask(id, changes); } catch (error) { return rejectWithValue(apiError(error)); }
});
export const deleteTaskThunk = createAsyncThunk('tasks/delete', async (id: string, { rejectWithValue }) => {
  try { await deleteTask(id); return id; } catch (error) { return rejectWithValue(apiError(error)); }
});

const taskSlice = createSlice({
  name: 'tasks', initialState,
  reducers: {
    resetTasks: () => initialState,
    markNotifRead(state, action: PayloadAction<string>) { const item = state.notifications.find((n) => n.id === action.payload); if (item) item.read = true; },
  },
  extraReducers(builder) {
    builder.addCase(fetchTasksThunk.pending, (state, action) => {
      state.loading = true; state.error = null; state.requestId = action.meta.requestId;
      if (action.meta.arg) state.query = action.meta.arg;
    }).addCase(fetchTasksThunk.fulfilled, (state, action) => {
      if (state.requestId !== action.meta.requestId) return;
      state.tasks = action.payload; state.loading = false; state.requestId = null;
    }).addCase(fetchTasksThunk.rejected, (state, action) => {
      if (state.requestId !== action.meta.requestId) return;
      state.loading = false; state.requestId = null;
      if (!action.meta.aborted) state.error = action.payload as string;
    }).addCase(addTaskThunk.fulfilled, (state, action) => {
      state.notifications.unshift({ id: 'n' + Date.now(), text: 'Tugas baru: ' + action.payload.title, time: 'Baru saja', read: false });
    });
  },
});
export const { resetTasks, markNotifRead } = taskSlice.actions;
export default taskSlice.reducer;
