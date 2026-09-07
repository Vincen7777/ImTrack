import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../auth/AuthLayout";
import GoogleButton from "../ui/GoogleButton";
import PasswordInput from "../ui/PasswordInput";
import { usePasswordVisibility } from "../../hooks/usePasswordVisibility";
import { mockAuthRequest } from "../../lib/mockAuth";

const REMEMBER_KEY = "imtrack_remember_email";

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [pwdVisible, togglePwdVisible] = usePasswordVisibility();

  useEffect(() => {
    document.title = "Masuk — ImTrack";
  }, []);

  // Restore remembered email on mount.
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  // ⚠️ MOCKUP ONLY — di production, jangan simpan email mentah di
  // localStorage. Gunakan secure httpOnly cookie atau session token.
  useEffect(() => {
    if (remember && email.trim()) {
      localStorage.setItem(REMEMBER_KEY, email.trim());
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }
  }, [remember, email]);

  function handleForgot() {
    if (!email.trim()) {
      setError("Masukkan email dulu untuk reset password.");
      return;
    }
    setError("");
    alert(
      `Link reset password telah dikirim ke ${email.trim()}\n\n(Ini adalah mockup — di aplikasi nyata akan dikirim via Supabase Auth)`,
    );
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }
    if (!password) {
      setError("Password wajib diisi.");
      return;
    }
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
      title="Masuk"
      subtitle="Masukkan akun kamu untuk melanjutkan"
      footer={
        <>
          Belum punya akun? <Link to="/sign-up">Daftar gratis</Link>
        </>
      }
    >
      <GoogleButton label="Masuk dengan Google" onClick={handleGoogle} disabled={googleLoading} />

      <div className="divider">atau</div>

      <form onSubmit={handleSignIn} noValidate>
        <div className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="kamu@example.com"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <button type="button" className="forgot-btn" onClick={handleForgot}>
                Lupa password?
              </button>
            </div>
            <PasswordInput
              id="password"
              name="password"
              value={password}
              onChange={setPassword}
              visible={pwdVisible}
              onToggleVisible={togglePwdVisible}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="remember-row">
            <input
              type="checkbox"
              id="remember"
              name="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <label htmlFor="remember">Ingat saya</label>
          </div>

          <p id="err" className="err" role="alert">
            {error}
          </p>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Memproses..." : "Masuk"}
          </button>
        </div>
      </form>
    </AuthLayout>  
    </>
  );
}

export default SignIn