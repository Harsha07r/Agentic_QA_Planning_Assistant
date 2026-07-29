import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { History, RotateCcw, Eye } from 'lucide-react';
import { planService } from '../services/planService';
import { useToast } from '../context/ToastContext';
import { PageLoader, InlineLoader } from '../components/ui/LoadingSpinner';
import ErrorMessage, { EmptyState } from '../components/ui/ErrorMessage';
import Pagination from '../components/ui/Pagination';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { formatDate } from '../utils/constants';

export default function VersionHistory() {
  const [searchParams] = useSearchParams();
  const planIdFilter = searchParams.get('planId') || '';
  const toast = useToast();

  const [versions, setVersions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [versionDetail, setVersionDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const fetchVersions = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 15 };
      if (planIdFilter) params.planId = planIdFilter;

      const response = await planService.getAllVersions(params);
      setVersions(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [planIdFilter]);

  useEffect(() => {
    fetchVersions(1);
  }, [fetchVersions]);

  const viewVersion = async (version) => {
    setSelectedVersion(version);
    setDetailLoading(true);
    try {
      const planId = version.planId._id || version.planId;
      const response = await planService.getVersionById(planId, version._id);
      setVersionDetail(response.data.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load version details');
      setSelectedVersion(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedVersion || !versionDetail) return;
    setRestoring(true);
    try {
      const planId = selectedVersion.planId._id || selectedVersion.planId;
      await planService.restoreVersion(planId, selectedVersion._id);
      toast.success(`Restored to version ${selectedVersion.versionNumber}`);
      setSelectedVersion(null);
      setVersionDetail(null);
      fetchVersions(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to restore version');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Version History</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track all plan changes and restore previous versions when needed.
          {planIdFilter && (
            <Link to="/version-history" className="ml-2 text-brand-600 hover:text-brand-700">
              Clear filter
            </Link>
          )}
        </p>
      </div>

      {loading && versions.length === 0 ? (
        <PageLoader message="Loading version history..." />
      ) : error ? (
        <ErrorMessage message={error.message} onRetry={() => fetchVersions(pagination.page)} />
      ) : versions.length === 0 ? (
        <EmptyState
          icon={History}
          title="No version history"
          description="Versions are created automatically when you create or update a plan."
        />
      ) : (
        <>
          {loading && <InlineLoader />}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-600">Plan</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Version</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Change Notes</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {versions.map((version) => {
                    const plan = version.planId;
                    const planTitle = plan?.title || 'Unknown Plan';
                    const planId = plan?._id || version.planId;

                    return (
                      <tr key={version._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <Link
                            to={`/plans/${planId}/edit`}
                            className="font-medium text-slate-900 hover:text-brand-600"
                          >
                            {planTitle}
                          </Link>
                          {plan?.projectName && (
                            <p className="text-xs text-slate-500">{plan.projectName}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                            v{version.versionNumber}
                          </span>
                        </td>
                        <td className="max-w-xs truncate px-4 py-3 text-slate-600">
                          {version.changeNotes || '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                          {formatDate(version.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => viewVersion(version)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={fetchVersions}
          />
        </>
      )}

      <Modal
        isOpen={!!selectedVersion}
        onClose={() => {
          setSelectedVersion(null);
          setVersionDetail(null);
        }}
        title={`Version ${selectedVersion?.versionNumber} Details`}
        footer={
          versionDetail && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedVersion(null);
                  setVersionDetail(null);
                }}
              >
                Close
              </Button>
              <Button onClick={handleRestore} loading={restoring}>
                <RotateCcw className="h-4 w-4" />
                Restore This Version
              </Button>
            </>
          )
        }
      >
        {detailLoading ? (
          <InlineLoader />
        ) : versionDetail ? (
          <div className="max-h-96 space-y-4 overflow-y-auto">
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">Change Notes</p>
              <p className="mt-1 text-sm text-slate-700">
                {versionDetail.changeNotes || 'No notes provided'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">Snapshot</p>
              <div className="mt-2 space-y-2 rounded-lg bg-slate-50 p-4 text-sm">
                <p><span className="font-medium">Title:</span> {versionDetail.snapshot.title}</p>
                <p><span className="font-medium">Project:</span> {versionDetail.snapshot.projectName}</p>
                <p><span className="font-medium">Status:</span> {versionDetail.snapshot.status}</p>
                <p><span className="font-medium">Priority:</span> {versionDetail.snapshot.priority}</p>
                <p><span className="font-medium">Test Cases:</span> {versionDetail.snapshot.testCases?.length || 0}</p>
                {versionDetail.snapshot.testTypes?.length > 0 && (
                  <p><span className="font-medium">Test Types:</span> {versionDetail.snapshot.testTypes.join(', ')}</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
