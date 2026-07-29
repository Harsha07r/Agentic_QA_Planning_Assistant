import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlanForm } from '../components/plans/PlanForm';
import { planService } from '../services/planService';
import { useToast } from '../context/ToastContext';
import { EMPTY_PLAN } from '../utils/constants';

export default function CreatePlan() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await planService.createPlan(formData);
      toast.success('QA plan created successfully!');
      navigate(`/plans/${response.data.data._id}/edit`);
    } catch (err) {
      toast.error(err.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create QA Plan</h1>
       <p className="mt-1 text-sm text-slate-500">
  Create QA plans manually or generate intelligent test cases using AI assistance.
</p>
      </div>

      <PlanForm
        initialData={EMPTY_PLAN}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Create Plan"
      />
    </div>
  );
}
