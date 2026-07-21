import clsx from 'clsx';

type StatusChipProps = {
  children: string;
  tone?: 'ok' | 'low' | 'critical' | 'blue';
};

export function StatusChip({ children, tone = 'blue' }: StatusChipProps) {
  return <span className={clsx('status-chip', `chip-${tone}`)}>{children}</span>;
}
