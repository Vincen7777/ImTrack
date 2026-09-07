import { useCallback, useState } from "react";

/**
 * hooks/usePasswordVisibility.ts
 * Pengganti Im.togglePwdSingle() / Im.togglePwdPair() dari app.js lama.
 *
 * Dulu: cari elemen lewat getElementById, lalu ubah input.type dan
 * className ikon secara manual (imperative).
 * Sekarang: cukup satu state `visible` yang dipakai langsung di JSX,
 * baik untuk satu input maupun sepasang input (password + konfirmasi)
 * yang perlu toggle bersamaan — tinggal pakai `visible` yang sama
 * pada kedua <input>.
 *
 * Contoh pakai untuk field tunggal:
 *   const [visible, toggle] = usePasswordVisibility();
 *   <input type={visible ? "text" : "password"} />
 *   <button onClick={toggle}>
 *     <i className={visible ? "ph ph-eye-slash" : "ph ph-eye"} />
 *   </button>
 *
 * Contoh pakai untuk pasangan password + konfirmasi password:
 *   const [visible, toggle] = usePasswordVisibility();
 *   <input type={visible ? "text" : "password"} name="password" />
 *   <input type={visible ? "text" : "password"} name="confirmPassword" />
 */
export function usePasswordVisibility(
  initial = false,
): [boolean, () => void] {
  const [visible, setVisible] = useState(initial);
  const toggle = useCallback(() => setVisible((v) => !v), []);
  return [visible, toggle];
}
