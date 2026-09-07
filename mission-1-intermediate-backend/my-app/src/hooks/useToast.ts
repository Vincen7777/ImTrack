import { useContext } from "react";
import { ToastContext } from "../components/common/ToastProvider.tsx";
import type { ShowToast } from "../components/common/ToastProvider.tsx";

/**
 * hooks/useToast.ts
 * Pengganti pemanggilan global Im.toast(msg, ms) dari app.js lama.
 * Pakai di dalam komponen yang dibungkus <ToastProvider>:
 *
 *   const toast = useToast();
 *   toast("Tersimpan!");
 */
export function useToast(): ShowToast {
  const showToast = useContext(ToastContext);
  if (!showToast) {
    throw new Error("useToast() harus dipanggil di dalam <ToastProvider>");
  }
  return showToast;
}

/**
 * Pengganti Im.notImpl(name) — menampilkan toast "belum tersedia" dan
 * mengembalikan false (dipakai supaya bisa dirangkai di handler event
 * seperti: onClick={() => notImpl("Ekspor CSV")}).
 */
export function useNotImpl(): (name: string) => boolean {
  const toast = useToast();
  return (name: string) => {
    toast(`"${name}" belum tersedia di mockup ini`);
    return false;
  };
}
