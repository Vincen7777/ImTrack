import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * hooks/useAuthMock.ts
 * Pengganti Im.signOut(), Im.handleMockOAuth(), dan Im.mockSubmitRedirect()
 * dari app.js lama.
 *
 * Dulu: cari tombol lewat getElementById, ubah disabled/textContent secara
 * manual, lalu redirect dengan window.location.href setelah delay.
 * Sekarang: state loading di React yang menentukan tampilan tombol
 * (disabled + label), dan navigasi memakai react-router-dom.
 */

/** Pengganti Im.signOut() — konfirmasi lalu arahkan ke halaman sign-in. */
export function useConfirmSignOut(redirectTo = "/sign-in"): () => void {
  const navigate = useNavigate();
  return useCallback(() => {
    if (window.confirm("Keluar dari ImTrack?")) {
      navigate(redirectTo);
    }
  }, [navigate, redirectTo]);
}

interface MockRedirectState {
  connecting: boolean;
  start: () => void;
  label: string | null;
}

/** Pengganti Im.handleMockOAuth(btnId, redirectUrl). */
export function useMockOAuth(
  redirectTo = "/beranda",
  delayMs = 700,
): MockRedirectState {
  const [connecting, setConnecting] = useState(false);
  const navigate = useNavigate();

  const start = useCallback(() => {
    setConnecting(true);
    setTimeout(() => navigate(redirectTo), delayMs);
  }, [navigate, redirectTo, delayMs]);

  return { connecting, start, label: connecting ? "Menghubungkan..." : null };
}

interface MockSubmitState {
  submitting: boolean;
  submit: () => void;
  label: string | null;
}

/** Pengganti Im.mockSubmitRedirect(btnId, redirectUrl, delayMs). */
export function useMockSubmitRedirect(
  redirectTo = "/beranda",
  delayMs = 800,
): MockSubmitState {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const submit = useCallback(() => {
    setSubmitting(true);
    setTimeout(() => navigate(redirectTo), delayMs);
  }, [navigate, redirectTo, delayMs]);

  return { submitting, submit, label: submitting ? "Memproses..." : null };
}
