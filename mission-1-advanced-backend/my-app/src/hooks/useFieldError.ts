import { useCallback, useState } from "react";

/**
 * hooks/useFieldError.ts
 * Pengganti Im.showErr(id, msg) / Im.clearErr(id) dari app.js lama.
 *
 * Dulu: cari elemen pesan error lewat getElementById, lalu toggle class
 * "on" dan set textContent secara manual.
 * Sekarang: cukup simpan pesan error di state, dan render elemen `.err`
 * hanya ketika pesannya ada.
 *
 * Contoh pakai:
 *   const [error, setError, clearError] = useFieldError();
 *   {error && <p className="err on">{error}</p>}
 */
export function useFieldError(
  initial = "",
): [string, (msg: string) => void, () => void] {
  const [error, setErrorState] = useState(initial);
  const setError = useCallback((msg: string) => setErrorState(msg), []);
  const clearError = useCallback(() => setErrorState(""), []);
  return [error, setError, clearError];
}
