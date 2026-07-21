import clsx from 'clsx';
import { getStockStatus, stockFill } from './stockStatus';

type StockStripeProps = {
  currentStock: number;
  minStockAlert: number;
  orientation?: 'vertical' | 'horizontal';
};

export function StockStripe({ currentStock, minStockAlert, orientation = 'vertical' }: StockStripeProps) {
  const status = getStockStatus(currentStock, minStockAlert);
  const fill = stockFill(currentStock, minStockAlert);

  return (
    <span className={clsx('stock-stripe', orientation === 'horizontal' && 'stock-stripe-horizontal')} aria-label={`Stock ${status}`}>
      <span className={clsx('stock-stripe-fill', status)} style={orientation === 'horizontal' ? { width: `${fill}%` } : { height: `${fill}%` }} />
    </span>
  );
}
