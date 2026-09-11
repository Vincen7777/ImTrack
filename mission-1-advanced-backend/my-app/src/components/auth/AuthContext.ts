import { createContext, useContext } from 'react';
import type { User } from '../../services/api/authApi';
export const AuthContext = createContext<{
  user: User | null; loading: boolean; error: string;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void; refreshUser: () => Promise<void>;
} | null>(null);
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider diperlukan');
  return context;
}
