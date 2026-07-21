import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { challansApi, customersApi, productsApi } from '../api/resources';
import { HeaderBlock } from '../components/layout/AppLayout';
import { StockStripe } from '../components/inventory/StockStripe';
import { getStockStatus } from '../components/inventory/stockStatus';
import { StatusChip } from '../components/ui/StatusChip';
import { LoadingRows } from '../components/ui/LoadingRows';
import { dateShort, money, statusTone } from '../utils/format';

export function Dashboard() {
  const customers = useQuery({ queryKey: ['customers', 'dashboard'], queryFn: () => customersApi.list({ limit: 10 }) });
  const products = useQuery({ queryKey: ['products', 'dashboard'], queryFn: () => productsApi.list({ limit: 50 }) });
  const challans = useQuery({ queryKey: ['challans', 'dashboard'], queryFn: () => challansApi.list({ limit: 10 }) });

  const productRows = products.data?.data ?? [];
  const lowStock = productRows.filter((product) => getStockStatus(product.currentStock, product.minStockAlert) !== 'ok');
  const draftCount = (challans.data?.data ?? []).filter((challan) => challan.status === 'DRAFT').length;
  const confirmed = (challans.data?.data ?? []).filter((challan) => challan.status === 'CONFIRMED').length;

  return (
    <>
      <HeaderBlock title="Operations Dashboard" subtitle="Daily dispatch, CRM follow-up, and inventory health at a glance." />
      <div className="kpi-row">
        <div className="kpi-card k-neutral">
          <div className="kpi-label">Customers</div>
          <div className="kpi-value">{customers.data?.meta?.total ?? 0}</div>
          <div className="kpi-delta">Across lead, active, inactive</div>
        </div>
        <div className="kpi-card k-green">
          <div className="kpi-label">Confirmed challans</div>
          <div className="kpi-value">{confirmed}</div>
          <div className="kpi-delta">Latest page total</div>
        </div>
        <div className="kpi-card k-amber">
          <div className="kpi-label">Draft challans</div>
          <div className="kpi-value">{draftCount}</div>
          <div className="kpi-delta">Awaiting confirmation</div>
        </div>
        <div className="kpi-card k-rust">
          <div className="kpi-label">Low stock SKUs</div>
          <div className="kpi-value">{lowStock.length}</div>
          <div className="kpi-delta">At or below reserve band</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-head">
            <div className="section-title">Recent Challans</div>
            <Link className="btn btn-secondary btn-sm" to="/challans/new">
              New Challan
            </Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Challan</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {challans.isLoading ? <LoadingRows rows={4} /> : null}
                {(challans.data?.data ?? []).map((challan) => (
                  <tr key={challan.id}>
                    <td className="cell-mono"><Link to={`/challans/${challan.id}`}>{challan.challanNumber}</Link></td>
                    <td className="cell-primary">{challan.customer?.businessName}</td>
                    <td>{challan.totalQuantity}</td>
                    <td><StatusChip tone={statusTone(challan.status)}>{challan.status}</StatusChip></td>
                    <td className="cell-mono">{dateShort(challan.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="section-title">Stock Watch</div>
            <Link className="btn btn-secondary btn-sm" to="/products">View All</Link>
          </div>
          <div className="timeline">
            {lowStock.slice(0, 6).map((product) => {
              const status = getStockStatus(product.currentStock, product.minStockAlert);
              return (
                <Link className="cell-flex" key={product.id} to={`/products/${product.id}`}>
                  <StockStripe currentStock={product.currentStock} minStockAlert={product.minStockAlert} />
                  <div style={{ flex: 1 }}>
                    <div className="cell-primary">{product.name}</div>
                    <div className="cell-mono">{product.sku} - {money(product.unitPrice)}</div>
                  </div>
                  <span className={`stock-num ${status}`}>{product.currentStock}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
