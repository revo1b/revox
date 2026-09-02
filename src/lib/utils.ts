export const CURRENCY = process.env.APP_CURRENCY || 'TSh';

export function money(amount: number | null | undefined): string {
  const n = amount ?? 0;
  if (n >= 1_000_000) return `${CURRENCY} ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${CURRENCY} ${Math.round(n / 1000)}K`;
  return `${CURRENCY} ${Math.round(n).toLocaleString()}`;
}

export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function daysAgo(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

export function formatDate(dateStr: string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', opts ?? { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function initials(name: string | null | undefined): string {
  return (name || '?').trim().charAt(0).toUpperCase();
}

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
