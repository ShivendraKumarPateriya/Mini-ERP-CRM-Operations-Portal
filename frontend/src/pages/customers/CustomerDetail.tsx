import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { customersApi } from '../../api/resources';
import { errorMessage } from '../../api/client';
import { HeaderBlock } from '../../components/layout/AppLayout';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { StatusChip } from '../../components/ui/StatusChip';
import { dateShort, statusTone } from '../../utils/format';

export function CustomerDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const query = useQuery({ queryKey: ['customer', id], queryFn: () => customersApi.detail(id!) });
  const mutation = useMutation({
    mutationFn: () => customersApi.addFollowUp(id!, note),
    onSuccess: async () => {
      setNote('');
      await queryClient.invalidateQueries({ queryKey: ['customer', id] });
    },
    onError: (err) => setError(errorMessage(err))
  });

  const customer = query.data;
  if (!customer) return <HeaderBlock title="Customer" subtitle="Loading customer profile..." />;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (note.trim()) mutation.mutate();
  }

  return (
    <>
      <HeaderBlock title={customer.businessName} subtitle={`${customer.name} - ${customer.mobile}`} actionTo={`/customers/${customer.id}/edit`} actionLabel="Edit Customer" />
      <div className="detail-grid">
        <div className="panel">
          <div className="panel-head">
            <div className="section-title">Profile</div>
            <StatusChip tone={statusTone(customer.status)}>{customer.status}</StatusChip>
          </div>
          <div className="detail-list">
            <Detail label="Type" value={customer.type} />
            <Detail label="Email" value={customer.email ?? 'Not set'} />
            <Detail label="GST" value={customer.gstNumber ?? 'Not provided'} />
            <Detail label="Address" value={customer.address} />
            <Detail label="Next follow-up" value={dateShort(customer.followUpDate)} />
            <Detail label="Notes" value={customer.notes ?? 'No notes'} />
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><div className="section-title">Follow-ups</div></div>
          <form className="detail-list" onSubmit={submit}>
            {error ? <InlineAlert variant="critical" title="Could not add follow-up">{error}</InlineAlert> : null}
            <textarea className="textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a follow-up note" />
            <button className="btn btn-primary" disabled={mutation.isPending}>Add Note</button>
          </form>
          <div className="timeline">
            {(customer.followUps ?? []).map((followUp) => (
              <div className="timeline-item" key={followUp.id}>
                <div className="cell-primary">{followUp.note}</div>
                <div className="cell-mono">{dateShort(followUp.createdAt)} - {followUp.user?.name}</div>
              </div>
            ))}
            {(customer.followUps ?? []).length === 0 ? <div className="timeline-item">No follow-up notes yet.</div> : null}
          </div>
        </div>
      </div>
      <div className="form-actions"><Link className="btn btn-secondary" to="/customers">Back to Customers</Link></div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="detail-item"><span>{label}</span><strong>{value}</strong></div>;
}
