import { Link } from 'react-router-dom';
import { PriorityBadge, StatusBadge } from '../ui/Badge';
import { formatDate } from '../../utils/constants';
import { Eye, Pencil, Trash2 } from 'lucide-react';

export default function PlanCard({ plan, onDelete }) {
  return (
    <div className="card group p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            to={`/plans/${plan._id}/edit`}
            className="truncate text-base font-semibold text-slate-900 transition hover:text-brand-600"
          >
            {plan.title}
          </Link>
          <p className="mt-0.5 text-sm text-slate-500">{plan.projectName}</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <PriorityBadge priority={plan.priority} />
          <StatusBadge status={plan.status} />
        </div>
      </div>

      {plan.description && (
        <p className="mt-3 line-clamp-2 text-sm text-slate-600">{plan.description}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span>{plan.testCases?.length || 0} test cases</span>
        <span>{plan.acceptanceCriteria?.length || 0} acceptance criteria</span>
        <span>v{plan.version}</span>
        <span>Updated {formatDate(plan.updatedAt)}</span>
      </div>
      {plan.acceptanceCriteria?.length > 0 && (
        <div className="mt-3 text-xs text-slate-500">
          <p className="font-medium text-slate-700">Top Acceptance Criteria</p>
          <p className="truncate">
            {plan.acceptanceCriteria.slice(0, 2).map((ac) => ac.id).join(', ')}
          </p>
        </div>
      )}

      {plan.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {plan.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4 opacity-0 transition group-hover:opacity-100">
        <Link
          to={`/plans/${plan._id}/edit`}
          className="btn-secondary flex-1 py-1.5 text-xs"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Link>
        <Link
          to={`/version-history?planId=${plan._id}`}
          className="btn-secondary flex-1 py-1.5 text-xs"
        >
          <Eye className="h-3.5 w-3.5" />
          History
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(plan)}
            className="btn-secondary py-1.5 text-xs text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
