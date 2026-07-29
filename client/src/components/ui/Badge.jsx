import { PRIORITY_COLORS, STATUS_COLORS, TEST_CASE_STATUS_COLORS, formatLabel } from '../../utils/constants';

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    brand: 'bg-brand-100 text-brand-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <Badge className={PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium}>
      {formatLabel(priority)}
    </Badge>
  );
}

export function StatusBadge({ status }) {
  return (
    <Badge className={STATUS_COLORS[status] || STATUS_COLORS.draft}>
      {formatLabel(status)}
    </Badge>
  );
}

export function TestCaseStatusBadge({ status }) {
  return (
    <Badge className={TEST_CASE_STATUS_COLORS[status] || TEST_CASE_STATUS_COLORS.pending}>
      {formatLabel(status)}
    </Badge>
  );
}
