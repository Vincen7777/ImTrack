import { useEffect, useState, type ChangeEvent } from 'react';
import { useAuth } from './AuthContext';
import api, { apiError } from '../../services/api/axiosInstance';
import { uploadAvatar } from '../../services/api/authApi';

export default function ProfileAvatar() {
  const { user, refreshUser } = useAuth();
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!user?.avatarUrl) return;
    let active = true;
    let objectUrl = '';
    api.get<Blob>(user.avatarUrl, { responseType: 'blob' }).then(({ data }) => {
      if (active) { objectUrl = URL.createObjectURL(data); setPreview(objectUrl); }
    }).catch(() => {});
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [user?.avatarUrl]);
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    if (file.size > 5 * 1024 * 1024) { setError('Ukuran gambar maksimal 5 MB.'); return; }
    setBusy(true); setError('');
    try { await uploadAvatar(file); await refreshUser(); }
    catch (err) { setError(apiError(err)); }
    finally { setBusy(false); }
  }
  return <div className="profile-upload">
    <div className="sb-user">
      {preview ? <img src={preview} className="avatar avatar-md" alt="Foto profil" /> : <span className="avatar avatar-md">{user?.fullname.charAt(0).toUpperCase()}</span>}
      <div className="sb-user-info"><p className="sb-user-name">{user?.fullname}</p><p className="sb-user-email">{user?.email}</p></div>
    </div>
    <label className="avatar-picker">{busy ? 'Mengunggah...' : 'Ubah foto profil'}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={busy} onChange={(event) => void upload(event)} aria-label="Unggah foto profil" /></label>
    {error && <p className="err on" role="alert">{error}</p>}
  </div>;
}
