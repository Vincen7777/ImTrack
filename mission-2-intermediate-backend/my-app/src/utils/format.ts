/**
 * utils/format.ts
 * Fungsi murni dari bagian ESC, FORMAT DATE).
 * Tidak menyentuh DOM, jadi tetap sebagai fungsi biasa (bukan hook).
 */

/** Escape karakter HTML pada sebuah string. */
export function esc(str: unknown): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Format tanggal ISO (yyyy-mm-dd) menjadi "12 Jan" (locale id-ID). */
export function fmtDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

/** Format tanggal hari ini menjadi "Senin, 12 Januari 2026". */
export function fmtFullDate(): string {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}