import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { customersApi } from '../../api/resources';
import { HeaderBlock, TabButton } from '../../components/layout/AppLayout';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingRows } from '../../components/ui/LoadingRows';
import { StatusChip } from '../../components/ui/StatusChip';
import type { CustomerStatus } from '../../types';
import { dateShort, statusTone } from '../../utils/format';

const tabs: Array<CustomerStatus | 'ALL'> = ['ALL', 'LEAD', 'ACTIVE', 'INACTIVE'];

export function CustomerList() {
  const [status, setStatus] = useState<CustomerStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const query = useQuery({
    queryKey: ['customers', status, search],
    queryFn: () => customersApi.list({ status: status === 'ALL' ? undefined : status, search: search || undefined })
  });
  const customers = query.data?.data ?? [];

  return (
    <>
      <HeaderBlock title="Customers" subtitle={`${query.data?.meta?.total ?? 0} records with CRM follow-up tracking.`} actionTo="/customers/new" actionLabel="Add Customer" />
      <div className="panel">
        <div className="panel-head">
          <div className="filter-tabs">
            {tabs.map((tab) => (
              <TabButton key={tab} active={status === tab} onClick={() => setStatus(tab)}>
                {tab === 'ALL' ? 'All' : tab}
              </TabButton>
            ))}
          </div>
          <input className="input" style={{ maxWidth: 260 }} placeholder="Search name, business, mobile" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Mobile</th>
                <th>Type</th>
                <th>Status</th>
                <th>Follow-up</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading ? <LoadingRows /> : null}
              {!query.isLoading && customers.length === 0 ? (
                <tr><td colSpan={6}><EmptyState label="No customers yet" cta="Add Customer" to="/customers/new" /></td></tr>
              ) : null}
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="cell-primary">{customer.businessName}</div>
                    <div className="cell-mono">{customer.name}</div>
                  </td>
                  <td className="cell-mono">{customer.mobile}</td>
                  <td>{customer.type}</td>
                  <td><StatusChip tone={statusTone(customer.status)}>{customer.status}</StatusChip></td>
                  <td className="cell-mono">{dateShort(customer.followUpDate)}</td>
                  <td><Link className="btn btn-secondary btn-sm" to={`/customers/${customer.id}`}>Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
