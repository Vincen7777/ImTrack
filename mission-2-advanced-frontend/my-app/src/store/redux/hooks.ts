/* ============================================================
   store/redux/hooks.ts
   Typed hooks untuk useSelector dan useDispatch agar tidak
   perlu mendefinisikan type RootState/AppDispatch di setiap
   komponen yang menggunakan Redux.
   ============================================================ */

import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

/** Typed useDispatch hook — sudah mengenal async thunks */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/** Typed useSelector hook — sudah mengenal RootState */
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector<RootState, T>(selector);
