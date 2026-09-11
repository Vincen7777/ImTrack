import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../auth/AuthLayout';
import PasswordInput from '../ui/PasswordInput';
import { usePasswordVisibility } from '../../hooks/usePasswordVisibility';
import { useAuth } from '../auth/AuthContext';
import { resendVerification } from '../../services/api/authApi';
import { apiError } from '../../services/api/axiosInstance';

const REMEMBER_KEY = 'imtrack_remember_email';
export default function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBER_KEY) || '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem(REMEMBER_KEY)));
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [visible, toggleVisible] = usePasswordVisibility();
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setMessage(''); setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      if (remember) localStorage.setItem(REMEMBER_KEY, email.trim()); else localStorage.removeItem(REMEMBER_KEY);
      navigate('/beranda', { replace: true });
    } catch (err) { setError(apiError(err)); }
    finally { setSubmitting(false); }
  }
  async function resend() {
    setError(''); setMessage(''); setSubmitting(true);
    try { setMessage((await resendVerification(email.trim())).message); }
    catch (err) { setError(apiError(err)); }
    finally { setSubmitting(false); }
  }
  return <AuthLayout title="Masuk" subtitle="Masuk dengan akun yang sudah diverifikasi" footer={<>Belum punya akun? <Link to="/sign-up">Daftar gratis</Link></>}>
    <form onSubmit={submit} className="auth-form">
      <div className="form-group"><label htmlFor="email" className="form-label">Email</label><input id="email" type="email" className="form-input" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kamu@example.com" /></div>
      <div className="form-group"><label htmlFor="password" className="form-label">Password</label><PasswordInput id="password" name="password" value={password} onChange={setPassword} visible={visible} onToggleVisible={toggleVisible} required autoComplete="current-password" /></div>
      <div className="remember-row"><input id="remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /><label htmlFor="remember">Ingat email saya</label></div>
      {error && <p className="err on" role="alert">{error}</p>}
      {message && <p className="auth-message" role="status">{message}</p>}
      <button className="btn btn-primary btn-block" disabled={submitting}>{submitting ? 'Memproses...' : 'Masuk'}</button>
      <button type="button" className="btn btn-block" disabled={submitting || !email.trim()} onClick={() => void resend()}>Kirim ulang verifikasi email</button>
    </form>
  </AuthLayout>;
}
