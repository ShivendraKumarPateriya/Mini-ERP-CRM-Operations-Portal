import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { customersApi } from '../../api/resources';
import { errorMessage } from '../../api/client';
import { HeaderBlock } from '../../components/layout/AppLayout';
import { InlineAlert } from '../../components/ui/InlineAlert';
import type { Customer, CustomerStatus, CustomerType } from '../../types';

const emptyForm = {
  name: '',
  mobile: '+91',
  email: '',
  businessName: '',
  gstNumber: '',
  type: 'WHOLESALE' as CustomerType,
  address: '',
  status: 'LEAD' as CustomerStatus,
  followUpDate: '',
  notes: ''
};

export function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const detail = useQuery({ queryKey: ['customer', id], queryFn: () => customersApi.detail(id!), enabled: Boolean(id) });
  const mutation = useMutation({
    mutationFn: (body: Partial<Customer>) => (id ? customersApi.update(id, body) : customersApi.create(body)),
    onSuccess: async (customer) => {
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      navigate(`/customers/${customer.id}`);
    },
    onError: (err) => setError(errorMessage(err))
  });

  useEffect(() => {
    if (detail.data) {
      setForm({
        name: detail.data.name,
        mobile: detail.data.mobile,
        email: detail.data.email ?? '',
        businessName: detail.data.businessName,
        gstNumber: detail.data.gstNumber ?? '',
        type: detail.data.type,
        address: detail.data.address,
        status: detail.data.status,
        followUpDate: detail.data.followUpDate ? detail.data.followUpDate.slice(0, 10) : '',
        notes: detail.data.notes ?? ''
      });
    }
  }, [detail.data]);

  function update(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    mutation.mutate({
      ...form,
      followUpDate: form.followUpDate ? new Date(form.followUpDate).toISOString() : null
    });
  }

  return (
    <>
      <HeaderBlock title={id ? 'Edit Customer' : 'Add Customer'} subtitle="Maintain the CRM profile, GST details, and follow-up schedule." />
      <form className="panel detail-list" onSubmit={submit}>
        {error ? <InlineAlert variant="critical" title="Could not save customer">{error}</InlineAlert> : null}
        <div className="form-grid">
          <Field label="Customer name" value={form.name} onChange={(value) => update('name', value)} />
          <Field label="Business name" value={form.businessName} onChange={(value) => update('businessName', value)} />
          <Field label="Mobile" value={form.mobile} onChange={(value) => update('mobile', value)} />
          <Field label="Email" value={form.email} onChange={(value) => update('email', value)} />
          <Field label="GST number" value={form.gstNumber} onChange={(value) => update('gstNumber', value)} />
          <label className="field">Type<select className="select" value={form.type} onChange={(event) => update('type', event.target.value)}><option>RETAIL</option><option>WHOLESALE</option><option>DISTRIBUTOR</option></select></label>
          <label className="field">Status<select className="select" value={form.status} onChange={(event) => update('status', event.target.value)}><option>LEAD</option><option>ACTIVE</option><option>INACTIVE</option></select></label>
          <Field label="Follow-up date" type="date" value={form.followUpDate} onChange={(value) => update('followUpDate', value)} />
        </div>
        <label className="field">Address<textarea className="textarea" value={form.address} onChange={(event) => update('address', event.target.value)} /></label>
        <label className="field">Notes<textarea className="textarea" value={form.notes} onChange={(event) => update('notes', event.target.value)} /></label>
        <div className="form-actions">
          <Link className="btn btn-secondary" to={id ? `/customers/${id}` : '/customers'}>Cancel</Link>
          <button className="btn btn-primary" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save Customer'}</button>
        </div>
      </form>
    </>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="field">
      {label}
      <input className="input" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
