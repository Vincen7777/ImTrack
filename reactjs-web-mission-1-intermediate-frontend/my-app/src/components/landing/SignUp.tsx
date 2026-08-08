import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import GoogleButton from "../../components/ui/GoogleButton";
import PasswordInput from "../../components/ui/PasswordInput";
import FormField from "../../components/ui/FormField";
import { usePasswordVisibility } from "../../hooks/usePasswordVisibility";
import { mockAuthRequest } from "../../lib/mockAuth";

function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  // Shared instance — password + confirm-password toggle together,
  // mirroring the old Im.togglePwdPair behaviour.
  const [pwdVisible, togglePwdVisible] = usePasswordVisibility();

  useEffect(() => {
    document.title = "Daftar — ImTrack";
  }, []);

  function validate(): boolean {
    if (!name.trim()) {
      setError("Nama lengkap wajib diisi.");
      return false;
    }
    if (!email.trim()) {
      setError("Email wajib diisi.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Format email tidak valid.");
      return false;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi tidak cocok.");
      return false;
    }
    if (!privacy) {
      setError("Kamu harus menyetujui Syarat & Ketentuan.");
      return false;
    }
    return true;
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setSubmitting(true);
    await mockAuthRequest({ delay: 900 });
    setSubmitting(false);
    navigate("/beranda");
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await mockAuthRequest({ delay: 900 });
    setGoogleLoading(false);
    navigate("/beranda");
  }
  return (
    <>
    <AuthLayout
      title="Buat Akun"
      subtitle="Daftar untuk mulai menggunakan ImTrack"
      footer={
        <>
          Sudah punya akun? <Link to="/sign-in">Masuk</Link>
        </>
      }
    >
      <GoogleButton label="Daftar dengan Google" onClick={handleGoogle} disabled={googleLoading} />

      <div className="divider">atau</div>

      <form onSubmit={handleSignUp} noValidate>
        <div className="auth-form">
          <FormField
            id="name"
            name="name"
            label="Nama Lengkap"
            placeholder="Nama kamu"
            required
            autoFocus
            autoComplete="name"
            value={name}
            onChange={setName}
          />

          <FormField
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="kamu@example.com"
            required
            autoComplete="email"
            value={email}
            onChange={setEmail}
          />

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <PasswordInput
              id="password"
              name="password"
              value={password}
              onChange={setPassword}
              visible={pwdVisible}
              onToggleVisible={togglePwdVisible}
              placeholder="Minimal 6 karakter"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">
              Konfirmasi Password
            </label>
            <PasswordInput
              id="confirm-password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={pwdVisible}
              showToggleButton={false}
              placeholder="Ulangi password"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="privacy-row">
            <input
              type="checkbox"
              id="privacy"
              name="agreePrivacy"
              required
              checked={privacy}
              onChange={(e) => setPrivacy(e.target.checked)}
            />
            <label htmlFor="privacy">
              Saya menyetujui{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>
                Syarat &amp; Ketentuan
              </a>{" "}
              dan{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>
                Kebijakan Privasi
              </a>{" "}
              ImTrack
            </label>
          </div>

          <p id="err" className="err" role="alert">
            {error}
          </p>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Memproses..." : "Daftar"}
          </button>
        </div>
      </form>
    </AuthLayout> 
    </>
  );
}

export default SignUp