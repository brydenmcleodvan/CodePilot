import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAuthToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function downloadCSV(data: Record<string, any>[], filename = 'data.csv') {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map((row) => Object.values(row).join(',')).join('\n');
  const csv = headers + '\n' + rows;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
