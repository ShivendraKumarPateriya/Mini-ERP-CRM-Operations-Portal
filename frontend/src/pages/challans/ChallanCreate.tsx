import { useMemo, useState } from 'react';
import { Check, ChevronDown, Plus, Trash2, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { challansApi, customersApi, productsApi } from '../../api/resources';
import { errorMessage } from '../../api/client';
import { HeaderBlock } from '../../components/layout/AppLayout';
import { StockStripe } from '../../components/inventory/StockStripe';
import { getStockStatus } from '../../components/inventory/stockStatus';
import { InlineAlert } from '../../components/ui/InlineAlert';
import type { Product } from '../../types';
import { initials, money } from '../../utils/format';

type Line = {
  productId: string;
  quantity: number;
};

export function ChallanCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const customers = useQuery({ queryKey: ['customers', 'select'], queryFn: () => customersApi.list({ limit: 100 }) });
  const products = useQuery({ queryKey: ['products', 'select'], queryFn: () => productsApi.list({ limit: 100 }) });
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [newProductId, setNewProductId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const selectedCustomer = customers.data?.data.find((customer) => customer.id === customerId);
  const productById = useMemo(() => new Map((products.data?.data ?? []).map((product) => [product.id, product])), [products.data?.data]);
  const lineProducts = lines.map((line) => ({ line, product: productById.get(line.productId) })).filter((item): item is { line: Line; product: Product } => Boolean(item.product));
  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lineProducts.reduce((sum, { line, product }) => sum + Number(product.unitPrice) * line.quantity, 0);
  const blockedLine = lineProducts.find(({ line, product }) => line.quantity > product.currentStock);
  const mutation = useMutation({
    mutationFn: (status: 'DRAFT' | 'CONFIRMED') => challansApi.create({ customerId, status, items: lines }),
    onSuccess: async (challan) => {
      await queryClient.invalidateQueries({ queryKey: ['challans'] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate(`/challans/${challan.id}`);
    },
    onError: (err) => setError(errorMessage(err))
  });

  function addLine() {
    if (!newProductId || lines.some((line) => line.productId === newProductId)) return;
    setLines((current) => [...current, { productId: newProductId, quantity: 1 }]);
    setNewProductId('');
  }

  function updateQty(productId: string, quantity: number) {
    setLines((current) => current.map((line) => (line.productId === productId ? { ...line, quantity: Math.max(1, quantity) } : line)));
  }

  function removeLine(productId: string) {
    setLines((current) => current.filter((line) => line.productId !== productId));
  }

  const canSave = Boolean(customerId) && lines.length > 0;
  const canConfirm = canSave && !blockedLine;

  return (
    <>
      <div className="manifest-header">
        <div className="manifest-title-block">
          <h1 className="page-title">New Dispatch Challan</h1>
          <div className="manifest-number">CH-YYYY-#### - auto-assigned on save</div>
        </div>
        <Link className="btn btn-ghost" to="/challans">Discard</Link>
      </div>
      <div className="manifest-shell">
        <div>
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Customer</label>
            <select className="select" value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
              <option value="">Select customer</option>
              {(customers.data?.data ?? []).map((customer) => <option value={customer.id} key={customer.id}>{customer.businessName} - {customer.mobile}</option>)}
            </select>
            {selectedCustomer ? (
              <div className="customer-select-card">
                <div className="customer-avatar-sm">{initials(selectedCustomer.businessName)}</div>
                <div>
                  <div className="cell-primary">{selectedCustomer.businessName}</div>
                  <div className="cell-mono">{selectedCustomer.type} - {selectedCustomer.mobile}</div>
                </div>
                <ChevronDown size={16} style={{ marginLeft: 'auto', color: 'var(--ink-faint)' }} />
              </div>
            ) : null}
          </div>

          <div className="panel">
            <div className="panel-head">
              <div className="section-title">Line Items</div>
              <span className="cell-mono">{lines.length} items</span>
            </div>
            {lineProducts.map(({ line, product }) => {
              const status = getStockStatus(product.currentStock, product.minStockAlert);
              const exceeded = line.quantity > product.currentStock;
              return (
                <div className="line-item-row" key={product.id}>
                  <StockStripe currentStock={product.currentStock} minStockAlert={product.minStockAlert} />
                  <div><div className="li-product-name">{product.name}</div><div className="li-product-sku">{product.sku} - {product.currentStock} in stock</div></div>
                  <div className="qty-stepper">
                    <button type="button" onClick={() => updateQty(product.id, line.quantity - 1)}>-</button>
                    <input value={line.quantity} onChange={(event) => updateQty(product.id, Number(event.target.value))} style={exceeded ? { color: 'var(--rust)' } : undefined} />
                    <button type="button" onClick={() => updateQty(product.id, line.quantity + 1)}>+</button>
                  </div>
                  <div className="li-line-total" style={exceeded ? { color: 'var(--rust)' } : undefined}>{money(Number(product.unitPrice) * line.quantity)}</div>
                  <button className="icon-btn" type="button" onClick={() => removeLine(product.id)} aria-label="Remove line"><Trash2 size={15} /></button>
                  {status === 'critical' && !exceeded ? <div className="cell-mono" style={{ gridColumn: '2 / -1', color: 'var(--rust)' }}>This SKU is already at critical reserve.</div> : null}
                </div>
              );
            })}
            <div className="add-line-row">
              <select className="select" value={newProductId} onChange={(event) => setNewProductId(event.target.value)}>
                <option value="">Add product line</option>
                {(products.data?.data ?? []).filter((product) => !lines.some((line) => line.productId === product.id)).map((product) => <option value={product.id} key={product.id}>{product.name} - {product.sku} - {product.currentStock} in stock</option>)}
              </select>
              <button className="btn btn-secondary" type="button" onClick={addLine}><Plus size={15} /> Add</button>
            </div>
          </div>

          {blockedLine ? (
            <InlineAlert variant="critical" title={`${blockedLine.product.name} exceeds available stock`}>
              Requested {blockedLine.line.quantity}, only {blockedLine.product.currentStock} in stock. Reduce quantity or this line will block confirmation.
            </InlineAlert>
          ) : null}
          {error ? <InlineAlert variant="critical" title="Challan could not be saved">{error}</InlineAlert> : null}
        </div>

        <div className="dispatch-summary">
          <div className="dispatch-summary-label">Dispatch Summary</div>
          <div className="dispatch-summary-title">{selectedCustomer?.businessName ?? 'Select customer'}</div>
          <div className="summary-row"><span>Line items</span><span>{lines.length}</span></div>
          <div className="summary-row"><span>Total quantity</span><span>{totalQuantity} units</span></div>
          <div className="summary-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div style={{ marginTop: 14 }}>
            {lineProducts.map(({ line, product }) => {
              const exceeded = line.quantity > product.currentStock;
              const status = getStockStatus(product.currentStock, product.minStockAlert);
              return (
                <div className={`stock-check-line ${exceeded ? 'critical' : ''}`} key={product.id}>
                  {exceeded ? <X size={14} color="var(--rust)" /> : <Check size={14} color={status === 'low' ? 'var(--amber)' : 'var(--green)'} />}
                  {product.name} - {exceeded ? 'exceeds available stock' : status === 'low' ? 'stock sufficient, low reserve' : 'stock sufficient'}
                </div>
              );
            })}
          </div>
          <div className="summary-total"><span className="summary-total-label">Total</span><span className="summary-total-value">{money(subtotal)}</span></div>
          <div className="summary-actions">
            <button className="btn btn-green" disabled={!canConfirm || mutation.isPending} onClick={() => mutation.mutate('CONFIRMED')}>Confirm Challan{blockedLine ? ' - blocked' : ''}</button>
            <button className="btn btn-secondary" disabled={!canSave || mutation.isPending} onClick={() => mutation.mutate('DRAFT')}>Save as Draft</button>
          </div>
        </div>
      </div>
    </>
  );
}
