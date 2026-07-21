import type { CustomerStatus, StockStatus, ChallanStatus } from '../types';

export function money(value: string | number) {
  return `INR ${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function dateShort(value?: string | null) {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

export function statusTone(status: CustomerStatus | ChallanStatus | StockStatus) {
  if (status === 'ACTIVE' || status === 'CONFIRMED' || status === 'ok') return 'ok' as const;
  if (status === 'LEAD' || status === 'DRAFT' || status === 'low') return 'low' as const;
  return 'critical' as const;
}

export function initials(name?: string) {
  return (name ?? '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
