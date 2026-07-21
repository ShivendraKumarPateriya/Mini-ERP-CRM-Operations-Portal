import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { productsApi } from '../../api/resources';
import { HeaderBlock } from '../../components/layout/AppLayout';
import { StockStripe } from '../../components/inventory/StockStripe';
import { getStockStatus } from '../../components/inventory/stockStatus';
import { StatusChip } from '../../components/ui/StatusChip';
import { dateShort, money, statusTone } from '../../utils/format';

export function ProductDetail() {
  const { id } = useParams();
  const query = useQuery({ queryKey: ['product', id], queryFn: () => productsApi.detail(id!) });
  const product = query.data;
  if (!product) return <HeaderBlock title="Product" subtitle="Loading product details..." />;
  const status = getStockStatus(product.currentStock, product.minStockAlert);

  return (
    <>
      <HeaderBlock title={product.name} subtitle={`${product.sku} - ${product.category}`} actionTo={`/products/${product.id}/edit`} actionLabel="Edit Product" />
      <div className="detail-grid">
        <div className="panel">
          <div className="panel-head">
            <div className="section-title">Inventory Profile</div>
            <StatusChip tone={statusTone(status)}>{status}</StatusChip>
          </div>
          <div className="detail-list">
            <div className="cell-flex"><StockStripe currentStock={product.currentStock} minStockAlert={product.minStockAlert} /><div><div className={`stock-num ${status}`}>{product.currentStock} units</div><div className="stock-min">Minimum alert {product.minStockAlert}</div></div></div>
            <Detail label="Unit price" value={money(product.unitPrice)} />
            <Detail label="Warehouse" value={product.warehouseLocation ?? 'Unassigned'} />
            <Detail label="Created" value={dateShort(product.createdAt)} />
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><div className="section-title">Stock Movement Log</div></div>
          <div className="timeline">
            {(product.stockMovements ?? []).map((movement) => (
              <div className="timeline-item" key={movement.id}>
                <div className="cell-primary">{movement.type} {movement.quantity} units</div>
                <div>{movement.reason}</div>
                <div className="cell-mono">{dateShort(movement.createdAt)} - {movement.user?.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="form-actions"><Link className="btn btn-secondary" to="/products">Back to Products</Link></div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="detail-item"><span>{label}</span><strong>{value}</strong></div>;
}
