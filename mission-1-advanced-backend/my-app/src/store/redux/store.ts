/* ============================================================
   store/redux/store.ts
   Konfigurasi Redux store terpusat.
   Daftarkan semua reducer di sini dan ekspor RootState
   serta AppDispatch untuk digunakan di seluruh aplikasi.
   ============================================================ */

import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './taskSlice';

/** Redux store utama aplikasi ImTrack */
const store = configureStore({
  reducer: {
    tasks: taskReducer,
  },
});

/** Type untuk keseluruhan state Redux */
export type RootState = ReturnType<typeof store.getState>;

/** Type untuk dispatch Redux (mendukung async thunks) */
export type AppDispatch = typeof store.dispatch;

export default store;
