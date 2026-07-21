import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productsApi } from '../../api/resources';
import { errorMessage } from '../../api/client';
import { HeaderBlock } from '../../components/layout/AppLayout';
import { InlineAlert } from '../../components/ui/InlineAlert';
import type { Product } from '../../types';

const empty = {
  name: '',
  sku: '',
  category: '',
  unitPrice: 0,
  currentStock: 0,
  minStockAlert: 10,
  warehouseLocation: ''
};

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const detail = useQuery({ queryKey: ['product', id], queryFn: () => productsApi.detail(id!), enabled: Boolean(id) });
  const mutation = useMutation({
    mutationFn: (body: Partial<Product>) => (id ? productsApi.update(id, body) : productsApi.create(body)),
    onSuccess: async (product) => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate(`/products/${product.id}`);
    },
    onError: (err) => setError(errorMessage(err))
  });

  useEffect(() => {
    if (detail.data) {
      setForm({
        name: detail.data.name,
        sku: detail.data.sku,
        category: detail.data.category,
        unitPrice: Number(detail.data.unitPrice),
        currentStock: detail.data.currentStock,
        minStockAlert: detail.data.minStockAlert,
        warehouseLocation: detail.data.warehouseLocation ?? ''
      });
    }
  }, [detail.data]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const body = id ? { ...form, currentStock: undefined } : form;
    mutation.mutate(body);
  }

  return (
    <>
      <HeaderBlock title={id ? 'Edit Product' : 'New Product'} subtitle="Create SKUs with price, stock, low-stock threshold, and warehouse location." />
      <form className="panel detail-list" onSubmit={submit}>
        {error ? <InlineAlert variant="critical" title="Could not save product">{error}</InlineAlert> : null}
        <div className="form-grid">
          <Field label="Product name" value={form.name} onChange={(value) => set('name', value)} />
          <Field label="SKU/code" value={form.sku} onChange={(value) => set('sku', value)} />
          <Field label="Category" value={form.category} onChange={(value) => set('category', value)} />
          <Field label="Warehouse location" value={form.warehouseLocation} onChange={(value) => set('warehouseLocation', value)} />
          <NumberField label="Unit price" value={form.unitPrice} onChange={(value) => set('unitPrice', value)} />
          <NumberField label="Current stock" value={form.currentStock} onChange={(value) => set('currentStock', value)} disabled={Boolean(id)} />
          <NumberField label="Minimum stock alert" value={form.minStockAlert} onChange={(value) => set('minStockAlert', value)} />
        </div>
        <div className="form-actions">
          <Link className="btn btn-secondary" to={id ? `/products/${id}` : '/products'}>Cancel</Link>
          <button className="btn btn-primary" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save Product'}</button>
        </div>
      </form>
    </>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="field">{label}<input className="input" value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function NumberField({ label, value, onChange, disabled }: { label: string; value: number; onChange: (value: number) => void; disabled?: boolean }) {
  return <label className="field">{label}<input className="input" type="number" min={0} value={value} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}
