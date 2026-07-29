import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, FolderOpen } from 'lucide-react';
import { planService } from '../services/planService';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useAsync';
import PlanCard from '../components/plans/PlanCard';
import { PageLoader, InlineLoader } from '../components/ui/LoadingSpinner';
import ErrorMessage, { EmptyState } from '../components/ui/ErrorMessage';
import Pagination from '../components/ui/Pagination';
import { ConfirmModal } from '../components/ui/Modal';
import { Select } from '../components/ui/Input';
import { PLAN_STATUSES, PRIORITIES, formatLabel } from '../utils/constants';

export default function SavedPlans() {
  const toast = useToast();
  const [plans, setPlans] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);

  const fetchPlans = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 9 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const response = await planService.getPlans(params);
      setPlans(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchPlans(1);
  }, [fetchPlans]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await planService.deletePlan(deleteTarget._id);
      toast.success('Plan deleted successfully');
      setDeleteTarget(null);
      fetchPlans(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete plan');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Saved Plans</h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse, search, and manage all your QA plans.
          </p>
        </div>
        <Link to="/create" className="btn-primary">
          <PlusCircle className="h-4 w-4" />
          New Plan
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input-field pl-9"
              placeholder="Search plans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="All Statuses"
            options={PLAN_STATUSES.map((s) => ({ value: s, label: formatLabel(s) }))}
            className="sm:w-40"
          />
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            placeholder="All Priorities"
            options={PRIORITIES.map((p) => ({ value: p, label: formatLabel(p) }))}
            className="sm:w-40"
          />
        </div>
      </div>

      {loading && plans.length === 0 ? (
        <PageLoader message="Loading plans..." />
      ) : error ? (
        <ErrorMessage message={error.message} onRetry={() => fetchPlans(pagination.page)} />
      ) : plans.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No plans found"
          description={
            debouncedSearch || statusFilter || priorityFilter
              ? 'Try adjusting your filters or search query.'
              : 'Get started by creating your first QA plan.'
          }
          action={
            !debouncedSearch && !statusFilter && !priorityFilter && (
              <Link to="/create" className="btn-primary">
                <PlusCircle className="h-4 w-4" />
                Create Plan
              </Link>
            )
          }
        />
      ) : (
        <>
          {loading && <InlineLoader />}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard key={plan._id} plan={plan} onDelete={setDeleteTarget} />
            ))}
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={fetchPlans}
          />
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Plan"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will also remove all version history.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}
