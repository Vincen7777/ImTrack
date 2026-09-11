import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, error, refreshUser, signOut } = useAuth();
  if (loading) return <main className="auth-root" role="status">Memuat akun...</main>;
  if (error) return <main className="auth-root"><p role="alert">{error}</p><button className="btn btn-primary" onClick={() => void refreshUser()}>Coba lagi</button><button className="btn" onClick={signOut}>Kembali masuk</button></main>;
  return user ? children : <Navigate to="/sign-in" replace />;
}
