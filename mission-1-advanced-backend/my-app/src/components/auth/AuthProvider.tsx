import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { getMe, login, type User } from '../../services/api/authApi';
import { apiError } from '../../services/api/axiosInstance';
import { getToken, saveToken, clearToken } from '../../lib/authSession';
import { useAppDispatch } from '../../store/redux/hooks';
import { resetTasks } from '../../store/redux/taskSlice';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(getToken()));
  const [error, setError] = useState('');
  const signOut = useCallback(() => {
    clearToken(); setUser(null); setLoading(false); setError(''); dispatch(resetTasks());
  }, [dispatch]);
  const refreshUser = useCallback(async () => {
    const token = getToken();
    setLoading(true); setError('');
    try { const value = await getMe(); if (getToken() === token) setUser(value); }
    catch (err) { if (getToken() === token) setError(apiError(err)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    const token = getToken();
    if (token) {
      getMe().then((value) => { if (active && getToken() === token) setUser(value); })
        .catch((err: unknown) => { if (active && getToken() === token) setError(apiError(err)); })
        .finally(() => { if (active) setLoading(false); });
    }
    window.addEventListener('imtrack:session-expired', signOut);
    return () => { active = false; window.removeEventListener('imtrack:session-expired', signOut); };
  }, [signOut]);
  async function signIn(email: string, password: string) {
    const result = await login(email, password);
    dispatch(resetTasks()); saveToken(result.token); setUser(result.user); setError('');
  }
  return <AuthContext.Provider value={{ user, loading, error, signIn, signOut, refreshUser }}>{children}</AuthContext.Provider>;
}
