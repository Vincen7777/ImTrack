import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import { verifyEmail } from '../services/api/authApi';
import { apiError } from '../services/api/axiosInstance';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function verify() {
    setLoading(true); setError('');
    try { setStatus((await verifyEmail(token)).message); window.history.replaceState(null, '', '/verify-email'); }
    catch (err) { setError(apiError(err)); }
    finally { setLoading(false); }
  }
  return <AuthLayout title="Verifikasi email" subtitle="Aktifkan akun ImTrack kamu" footer={<Link to="/sign-in">Kembali ke halaman masuk</Link>}>
    {status ? <p className="auth-message" role="status">{status}. Akun kamu siap digunakan.</p> : <>
      <p>Tautan verifikasi berlaku 24 jam. Klik tombol di bawah untuk mengaktifkan akun.</p>
      {(!token || error) && <p className="err on" role="alert">{error || 'Token verifikasi tidak ditemukan.'}</p>}
      <button className="btn btn-primary btn-block" disabled={!token || loading} onClick={() => void verify()}>{loading ? 'Memverifikasi...' : 'Verifikasi email'}</button>
    </>}
  </AuthLayout>;
}
