import type { StockStatus } from '../../types';

export function getStockStatus(currentStock: number, minStockAlert: number): StockStatus {
  const pct = currentStock / minStockAlert;
  if (pct <= 1) return 'critical';
  if (pct <= 2) return 'low';
  return 'ok';
}

export function stockFill(currentStock: number, minStockAlert: number) {
  const pct = currentStock / minStockAlert;
  return Math.min(100, (pct / 3) * 100);
}
