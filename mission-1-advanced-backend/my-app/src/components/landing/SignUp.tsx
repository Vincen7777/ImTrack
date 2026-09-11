import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../auth/AuthLayout';
import FormField from '../ui/FormField';
import PasswordInput from '../ui/PasswordInput';
import { usePasswordVisibility } from '../../hooks/usePasswordVisibility';
import { register } from '../../services/api/authApi';
import { apiError } from '../../services/api/axiosInstance';

export default function SignUp() {
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [visible, toggleVisible] = usePasswordVisibility();
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if (password.length < 8 || new TextEncoder().encode(password).length > 72) { setError('Password minimal 8 karakter, maksimal 72 byte.'); return; }
    if (password !== confirm) { setError('Password dan konfirmasi tidak cocok.'); return; }
    setSubmitting(true);
    try {
      const result = await register({ fullname, username, email, password });
      setMessage(result.message); setPassword(''); setConfirm('');
    } catch (err) { setError(apiError(err)); }
    finally { setSubmitting(false); }
  }
  return <AuthLayout title={message ? 'Periksa email kamu' : 'Buat Akun'} subtitle={message ? 'Verifikasi email untuk mengaktifkan akun' : 'Mulai mengatur tugas bersama ImTrack'} footer={<>Sudah punya akun? <Link to="/sign-in">Masuk</Link></>}>
    {message ? <div className="auth-message" role="status"><p>{message}</p><Link className="btn btn-primary btn-block" to="/sign-in">Lanjut ke halaman masuk</Link></div> :
    <form className="auth-form" onSubmit={submit}>
      <FormField id="fullname" name="fullname" label="Nama lengkap" value={fullname} onChange={setFullname} required autoComplete="name" placeholder="Nama lengkap kamu" />
      <FormField id="username" name="username" label="Username" value={username} onChange={setUsername} required autoComplete="username" placeholder="3-50 huruf, angka, atau underscore" />
      <FormField id="email" name="email" type="email" label="Email" value={email} onChange={setEmail} required autoComplete="email" placeholder="kamu@example.com" />
      <div className="form-group"><label className="form-label" htmlFor="password">Password</label><PasswordInput id="password" name="password" value={password} onChange={setPassword} visible={visible} onToggleVisible={toggleVisible} required autoComplete="new-password" placeholder="Minimal 8 karakter" /></div>
      <div className="form-group"><label className="form-label" htmlFor="confirm-password">Konfirmasi password</label><PasswordInput id="confirm-password" name="confirm-password" value={confirm} onChange={setConfirm} visible={visible} onToggleVisible={toggleVisible} required autoComplete="new-password" /></div>
      {error && <p className="err on" role="alert">{error}</p>}
      <button className="btn btn-primary btn-block" disabled={submitting}>{submitting ? 'Mendaftarkan...' : 'Daftar'}</button>
    </form>}
  </AuthLayout>;
}
