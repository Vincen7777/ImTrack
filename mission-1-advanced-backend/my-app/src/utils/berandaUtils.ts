import { useMemo } from 'react';
import type { Priority } from '../types/task';

export interface PrioCfg {
  label: string;
  icon: string;
  iconColor: string;
  headCls: string;
  secCls: string;
  cbCls: string;
  badge: string | null;
  badgeBg?: string;
  badgeColor?: string;
}

export const PRIO_CFG: Record<Priority, PrioCfg> = {
  Sekarang: {
    label: "Tugas 'Sekarang'",
    icon: 'ph-fill ph-fire',
    iconColor: 'var(--red-500)',
    headCls: 's',
    secCls: 's',
    cbCls: 'red',
    badge: 'Fokus Utama',
    badgeBg: 'var(--red-50)',
    badgeColor: 'var(--red-500)',
  },
  Nanti: {
    label: "Tugas 'Nanti'",
    icon: 'ph-fill ph-clock',
    iconColor: 'var(--blue-500)',
    headCls: 'n',
    secCls: 'n',
    cbCls: 'blue',
    badge: null,
  },
  Someday: {
    label: "Tugas 'Someday'",
    icon: 'ph-fill ph-archive',
    iconColor: 'var(--gray-500)',
    headCls: 'd',
    secCls: 'd',
    cbCls: 'gray',
    badge: null,
  },
};

export const PRIORITIES: Priority[] = ['Sekarang', 'Nanti', 'Someday'];

/** Format date string (YYYY-MM-DD) to Indonesian short format */
export function fmtDate(dateStr: string): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  const [, m, d] = dateStr.split('-');
  return `${parseInt(d)} ${months[parseInt(m) - 1]}`;
}

/** Format today's date to full Indonesian format */
export function fmtFullDate(): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const now = new Date();
  return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

export function useTodayDate(): string {
  return useMemo(() => fmtFullDate(), []);
}
