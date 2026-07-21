import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { productsApi } from '../../api/resources';
import { errorMessage } from '../../api/client';
import { HeaderBlock, TabButton } from '../../components/layout/AppLayout';
import { StockStripe } from '../../components/inventory/StockStripe';
import { getStockStatus } from '../../components/inventory/stockStatus';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { LoadingRows } from '../../components/ui/LoadingRows';
import { StatusChip } from '../../components/ui/StatusChip';
import type { Product, StockStatus } from '../../types';
import { money, statusTone } from '../../utils/format';

type Filter = 'all' | 'low' | 'critical';

export function ProductList() {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const query = useQuery({ queryKey: ['products', search], queryFn: () => productsApi.list({ search: search || undefined, limit: 100 }) });
  const products = (query.data?.data ?? []).filter((product) => {
    const status = getStockStatus(product.currentStock, product.minStockAlert);
    if (filter === 'all') return true;
    return status === filter;
  });

  return (
    <>
      <HeaderBlock title="Products & Inventory" subtitle={`${query.data?.meta?.total ?? 0} SKUs with stock thresholds and movement history.`} actionTo="/products/new" actionLabel="New Product" />
      <div className="panel">
        <div className="panel-head">
          <div className="filter-tabs">
            <TabButton active={filter === 'all'} onClick={() => setFilter('all')}>All Stock</TabButton>
            <TabButton active={filter === 'low'} onClick={() => setFilter('low')}>Low</TabButton>
            <TabButton active={filter === 'critical'} onClick={() => setFilter('critical')}>Critical</TabButton>
          </div>
          <input className="input" style={{ maxWidth: 260 }} placeholder="Search SKU, name, category" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 24 }}></th>
                <th>Product</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Stock / Min</th>
                <th>Status</th>
                <th>Location</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading ? <LoadingRows /> : null}
              {!query.isLoading && products.length === 0 ? <tr><td colSpan={8}><EmptyState label="No products yet" cta="New Product" to="/products/new" /></td></tr> : null}
              {products.map((product) => {
                const status = getStockStatus(product.currentStock, product.minStockAlert);
                return (
                  <tr key={product.id}>
                    <td><StockStripe currentStock={product.currentStock} minStockAlert={product.minStockAlert} /></td>
                    <td><div className="cell-primary"><Link to={`/products/${product.id}`}>{product.name}</Link></div><div className="li-product-sku">{product.sku}</div></td>
                    <td>{product.category}</td>
                    <td className="cell-mono">{money(product.unitPrice)}</td>
                    <td><span className={`stock-num ${status}`}>{product.currentStock}</span> <span className="stock-min">/ {product.minStockAlert}</span></td>
                    <td><StatusChip tone={statusTone(status)}>{status}</StatusChip></td>
                    <td className="cell-mono">{product.warehouseLocation ?? 'Unassigned'}</td>
                    <td className="cell-flex">
                      <button className="btn btn-secondary btn-sm" onClick={() => setAdjusting(product)}>Adjust</button>
                      <Link className="btn btn-secondary btn-sm" to={`/products/${product.id}/edit`}>Edit</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {adjusting ? <StockAdjust product={adjusting} onClose={() => setAdjusting(null)} /> : null}
    </>
  );
}

function StockAdjust({ product, onClose }: { product: Product; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: () => productsApi.adjustStock({ productId: product.id, type, quantity, reason }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
    onError: (err) => setError(errorMessage(err))
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    mutation.mutate();
  }

  return (
    <div className="login-page" style={{ position: 'fixed', inset: 0, background: 'rgba(28,35,33,.32)', zIndex: 40 }}>
      <form className="login-card" onSubmit={submit}>
        <h2 className="page-title">Adjust Stock</h2>
        <p className="page-sub">{product.name} - {product.currentStock} units available</p>
        {error ? <InlineAlert variant="critical" title="Stock adjustment failed">{error}</InlineAlert> : null}
        <div className="form-grid" style={{ marginTop: 16 }}>
          <label className="field">Type<select className="select" value={type} onChange={(event) => setType(event.target.value as 'IN' | 'OUT')}><option>IN</option><option>OUT</option></select></label>
          <label className="field">Quantity<input className="input" type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /></label>
        </div>
        <label className="field" style={{ marginTop: 12 }}>Reason<input className="input" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Purchase receipt, damaged stock, recount..." /></label>
        <div className="form-actions">
          <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={mutation.isPending || !reason.trim()}>Save Movement</button>
        </div>
      </form>
    </div>
  );
}
