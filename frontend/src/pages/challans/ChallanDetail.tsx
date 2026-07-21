import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { challansApi } from '../../api/resources';
import { errorMessage } from '../../api/client';
import { HeaderBlock } from '../../components/layout/AppLayout';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { StatusChip } from '../../components/ui/StatusChip';
import { dateShort, money, statusTone } from '../../utils/format';
import { useState } from 'react';

export function ChallanDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const query = useQuery({ queryKey: ['challan', id], queryFn: () => challansApi.detail(id!) });
  const confirm = useMutation({
    mutationFn: () => challansApi.confirm(id!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['challan', id] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => setError(errorMessage(err))
  });
  const cancel = useMutation({
    mutationFn: () => challansApi.cancel(id!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['challan', id] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => setError(errorMessage(err))
  });

  const challan = query.data;
  if (!challan) return <HeaderBlock title="Challan" subtitle="Loading challan details..." />;
  const total = (challan.items ?? []).reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);

  return (
    <>
      <HeaderBlock title={challan.challanNumber} subtitle={`${challan.customer?.businessName} - created ${dateShort(challan.createdAt)}`} />
      {error ? <InlineAlert variant="critical" title="Action failed">{error}</InlineAlert> : null}
      <div className="detail-grid">
        <div className="panel">
          <div className="panel-head">
            <div className="section-title">Items</div>
            <StatusChip tone={statusTone(challan.status)}>{challan.status}</StatusChip>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Product snapshot</th><th>SKU</th><th>Unit price</th><th>Qty</th><th>Total</th></tr></thead>
              <tbody>
                {(challan.items ?? []).map((item) => (
                  <tr key={item.id}>
                    <td className="cell-primary">{item.productName}</td>
                    <td className="cell-mono">{item.productSku}</td>
                    <td className="cell-mono">{money(item.unitPrice)}</td>
                    <td>{item.quantity}</td>
                    <td className="cell-mono">{money(Number(item.unitPrice) * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="dispatch-summary">
          <div className="dispatch-summary-label">Challan Summary</div>
          <div className="dispatch-summary-title">{challan.customer?.businessName}</div>
          <div className="summary-row"><span>Total quantity</span><span>{challan.totalQuantity}</span></div>
          <div className="summary-row"><span>Created by</span><span>{challan.user?.name}</span></div>
          <div className="summary-row"><span>Created date</span><span>{dateShort(challan.createdAt)}</span></div>
          <div className="summary-total"><span className="summary-total-label">Total</span><span className="summary-total-value">{money(total)}</span></div>
          <div className="summary-actions">
            {challan.status === 'DRAFT' ? <button className="btn btn-green" onClick={() => confirm.mutate()} disabled={confirm.isPending}>Confirm Challan</button> : null}
            {challan.status === 'CONFIRMED' ? <button className="btn btn-secondary" onClick={() => cancel.mutate()} disabled={cancel.isPending}>Cancel and Restore Stock</button> : null}
            <Link className="btn btn-secondary" to="/challans">Back to Challans</Link>
          </div>
        </div>
      </div>
    </>
  );
}
