import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  GitBranch,
  TestTube2,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';
import { planService } from '../services/planService';
import { useAsync } from '../hooks/useAsync';
import { PageLoader } from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { formatDate } from '../utils/constants';

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, error, execute } = useAsync(
    () => planService.getDashboardStats(),
    true,
    []
  );

  if (loading) return <PageLoader message="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error.message} onRetry={execute} />;

  const stats = data?.data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your QA plans, track versions, and organize test cases.
          </p>
        </div>
        <Link to="/create" className="btn-primary">
          <PlusCircle className="h-4 w-4" />
          Create New Plan
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileText} label="Total Plans" value={stats?.totalPlans || 0} color="brand" />
        <StatCard icon={TestTube2} label="Test Cases" value={stats?.totalTestCases || 0} color="blue" />
        <StatCard icon={GitBranch} label="Versions" value={stats?.totalVersions || 0} color="amber" />
        <StatCard
          icon={CheckCircle2}
          label="Active Plans"
          value={stats?.statusBreakdown?.active || 0}
          color="emerald"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-base font-semibold text-slate-900">Plans by Status</h2>
          <div className="mt-4 space-y-3">
            {['draft', 'active', 'completed', 'archived'].map((status) => {
              const count = stats?.statusBreakdown?.[status] || 0;
              const total = stats?.totalPlans || 1;
              const percentage = Math.round((count / total) * 100) || 0;

              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <StatusBadge status={status} />
                    <span className="text-slate-500">{count} plans</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent Plans</h2>
            <Link to="/saved-plans" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              View all
              <ArrowRight className="ml-1 inline h-4 w-4" />
            </Link>
          </div>

          {stats?.recentPlans?.length === 0 ? (
            <p className="mt-6 text-center text-sm text-slate-500">No plans yet. Create your first QA plan!</p>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {stats?.recentPlans?.map((plan) => (
                <Link
                  key={plan._id}
                  to={`/plans/${plan._id}/edit`}
                  className="flex items-center justify-between py-3 transition hover:bg-slate-50 -mx-2 px-2 rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{plan.title}</p>
                    <p className="text-xs text-slate-500">{plan.projectName}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <PriorityBadge priority={plan.priority} />
                    <span className="text-xs text-slate-400">{formatDate(plan.updatedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
