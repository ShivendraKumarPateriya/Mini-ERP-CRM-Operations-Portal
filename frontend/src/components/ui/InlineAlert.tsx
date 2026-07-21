import { AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export function InlineAlert({ variant = 'warn', title, children }: { variant?: 'warn' | 'critical'; title: string; children: React.ReactNode }) {
  return (
    <div className={clsx('inline-alert', variant === 'critical' && 'critical')}>
      <AlertTriangle size={16} />
      <div>
        <strong>{title}</strong>
        <div>{children}</div>
      </div>
    </div>
  );
}
