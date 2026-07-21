import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmptyState({ label, cta, to }: { label: string; cta?: string; to?: string }) {
  return (
    <div className="empty-state">
      <PlusCircle size={28} />
      <p>{label}</p>
      {cta && to ? (
        <Link className="btn btn-primary" to={to}>
          {cta}
        </Link>
      ) : null}
    </div>
  );
}
