import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlanForm } from '../components/plans/PlanForm';
import { planService } from '../services/planService';
import { useToast } from '../context/ToastContext';
import { PageLoader } from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { EMPTY_PLAN } from '../utils/constants';

export default function EditPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await planService.getPlanById(id);
      setPlan(response.data.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      const { changeNotes, ...updateData } = formData;
      const response = await planService.updatePlan(id, { ...updateData, changeNotes });
      setPlan(response.data.data);
      toast.success(`Plan updated to version ${response.data.data.version}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader message="Loading plan..." />;
  if (error) return <ErrorMessage message={error.message} onRetry={fetchPlan} />;
  if (!plan) return <ErrorMessage message="Plan not found" onRetry={() => navigate('/saved-plans')} />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit QA Plan</h1>
          <p className="mt-1 text-sm text-slate-500">
            {plan.projectName} · Version {plan.version}
          </p>
        </div>
      </div>

      <PlanForm
        key={plan._id + plan.version}
        initialData={{ ...EMPTY_PLAN, ...plan, changeNotes: '' }}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel="Update Plan"
      />
    </div>
  );
}
