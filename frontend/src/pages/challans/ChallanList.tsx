import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { challansApi } from '../../api/resources';
import { HeaderBlock, TabButton } from '../../components/layout/AppLayout';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingRows } from '../../components/ui/LoadingRows';
import { StatusChip } from '../../components/ui/StatusChip';
import type { ChallanStatus } from '../../types';
import { dateShort, statusTone } from '../../utils/format';

const tabs: Array<ChallanStatus | 'ALL'> = ['ALL', 'DRAFT', 'CONFIRMED', 'CANCELLED'];

export function ChallanList() {
  const [status, setStatus] = useState<ChallanStatus | 'ALL'>('ALL');
  const query = useQuery({
    queryKey: ['challans', status],
    queryFn: () => challansApi.list({ status: status === 'ALL' ? undefined : status })
  });
  const challans = query.data?.data ?? [];

  return (
    <>
      <HeaderBlock title="Sales Challans" subtitle="Draft, confirmed, and cancelled dispatch documents." actionTo="/challans/new" actionLabel="New Challan" />
      <div className="panel">
        <div className="panel-head">
          <div className="filter-tabs">
            {tabs.map((tab) => <TabButton key={tab} active={status === tab} onClick={() => setStatus(tab)}>{tab === 'ALL' ? 'All' : tab}</TabButton>)}
          </div>
          <span className="cell-mono">{query.data?.meta?.total ?? 0} records</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Challan</th><th>Customer</th><th>Items</th><th>Total Qty</th><th>Status</th><th>Created</th><th></th></tr></thead>
            <tbody>
              {query.isLoading ? <LoadingRows /> : null}
              {!query.isLoading && challans.length === 0 ? <tr><td colSpan={7}><EmptyState label="No challans yet" cta="New Challan" to="/challans/new" /></td></tr> : null}
              {challans.map((challan) => (
                <tr key={challan.id}>
                  <td className="cell-mono">{challan.challanNumber}</td>
                  <td className="cell-primary">{challan.customer?.businessName}</td>
                  <td>{challan.items?.length ?? 0}</td>
                  <td>{challan.totalQuantity}</td>
                  <td><StatusChip tone={statusTone(challan.status)}>{challan.status}</StatusChip></td>
                  <td className="cell-mono">{dateShort(challan.createdAt)}</td>
                  <td><Link className="btn btn-secondary btn-sm" to={`/challans/${challan.id}`}>Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
