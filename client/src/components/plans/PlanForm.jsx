import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import Input, { Textarea, Select } from '../ui/Input';
import Button from '../ui/Button';
import {
  TEST_TYPES,
  PRIORITIES,
  PLAN_STATUSES,
  TEST_CASE_STATUSES,
  EMPTY_TEST_CASE,
  EMPTY_ACCEPTANCE_CRITERION,
  formatLabel,
} from '../../utils/constants';

export default function TestCaseEditor({ testCases, onChange, errors = {} }) {
  const addTestCase = () => {
    onChange([...testCases, { ...EMPTY_TEST_CASE }]);
  };

  const removeTestCase = (index) => {
    onChange(testCases.filter((_, i) => i !== index));
  };

  const updateTestCase = (index, field, value) => {
    const updated = testCases.map((tc, i) =>
      i === index ? { ...tc, [field]: value } : tc
    );
    onChange(updated);
  };

  const updateStep = (tcIndex, stepIndex, value) => {
    const updated = testCases.map((tc, i) => {
      if (i !== tcIndex) return tc;
      const steps = [...tc.steps];
      steps[stepIndex] = value;
      return { ...tc, steps };
    });
    onChange(updated);
  };

  const addStep = (tcIndex) => {
    const updated = testCases.map((tc, i) =>
      i === tcIndex ? { ...tc, steps: [...tc.steps, ''] } : tc
    );
    onChange(updated);
  };

  const removeStep = (tcIndex, stepIndex) => {
    const updated = testCases.map((tc, i) => {
      if (i !== tcIndex) return tc;
      return { ...tc, steps: tc.steps.filter((_, si) => si !== stepIndex) };
    });
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Test Cases ({testCases.length})
        </h3>
        <Button type="button" variant="secondary" onClick={addTestCase}>
          <Plus className="h-4 w-4" />
          Add Test Case
        </Button>
      </div>

      {testCases.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-slate-200 p-8 text-center">
          <p className="text-sm text-slate-500">No test cases yet. Add one manually or wait for AI generation.</p>
        </div>
      )}

      {testCases.map((tc, index) => (
        <div key={index} className="card space-y-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-slate-300" />
              <span className="text-sm font-medium text-slate-700">
                Test Case #{index + 1}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeTestCase(index)}
              className="rounded p-1 text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Title"
              required
              value={tc.title}
              onChange={(e) => updateTestCase(index, 'title', e.target.value)}
              error={errors[`testCases.${index}.title`]}
              placeholder="e.g. Verify login with valid credentials"
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Priority"
                value={tc.priority}
                onChange={(e) => updateTestCase(index, 'priority', e.target.value)}
                options={PRIORITIES.map((p) => ({ value: p, label: formatLabel(p) }))}
              />
              <Select
                label="Status"
                value={tc.status}
                onChange={(e) => updateTestCase(index, 'status', e.target.value)}
                options={TEST_CASE_STATUSES.map((s) => ({ value: s, label: formatLabel(s) }))}
              />
            </div>
          </div>

          <Textarea
            label="Description"
            value={tc.description}
            onChange={(e) => updateTestCase(index, 'description', e.target.value)}
            placeholder="Describe what this test case validates"
            rows={2}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Test Steps
            </label>
            <div className="space-y-2">
              {tc.steps.map((step, stepIndex) => (
                <div key={stepIndex} className="flex gap-2">
                  <span className="flex h-9 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-medium text-slate-500">
                    {stepIndex + 1}
                  </span>
                  <input
                    className="input-field flex-1"
                    value={step}
                    onChange={(e) => updateStep(index, stepIndex, e.target.value)}
                    placeholder={`Step ${stepIndex + 1}`}
                  />
                  {tc.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index, stepIndex)}
                      className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addStep(index)}
              className="mt-2 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              + Add Step
            </button>
          </div>

          <Input
            label="Expected Result"
            value={tc.expectedResult}
            onChange={(e) => updateTestCase(index, 'expectedResult', e.target.value)}
            placeholder="What should happen when steps are executed"
          />
        </div>
      ))}
    </div>
  );
}

export function PlanForm({ initialData, onSubmit, loading, submitLabel = 'Save Plan' }) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const toggleTestType = (type) => {
    const current = formData.testTypes || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    updateField('testTypes', updated);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !(formData.tags || []).includes(tag)) {
      updateField('tags', [...(formData.tags || []), tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    updateField('tags', formData.tags.filter((t) => t !== tag));
  };

  const normalizeAcceptanceCriteria = (criteria) =>
    criteria.map((item, index) => ({
      ...item,
      id: `AC-${index + 1}`,
    }));

  const addAcceptanceCriterion = () => {
    const current = formData.acceptanceCriteria || [];
    updateField('acceptanceCriteria', normalizeAcceptanceCriteria([
      ...current,
      { ...EMPTY_ACCEPTANCE_CRITERION },
    ]));
  };

  const removeAcceptanceCriterion = (index) => {
    const current = formData.acceptanceCriteria || [];
    updateField(
      'acceptanceCriteria',
      normalizeAcceptanceCriteria(current.filter((_, i) => i !== index))
    );
  };

  const updateAcceptanceCriterion = (index, value) => {
    const current = formData.acceptanceCriteria || [];
    const updated = current.map((item, i) =>
      i === index ? { ...item, description: value } : item
    );
    updateField('acceptanceCriteria', normalizeAcceptanceCriteria(updated));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title?.trim()) newErrors.title = 'Title is required';
    if (!formData.projectName?.trim()) newErrors.projectName = 'Project name is required';

    if (!formData.acceptanceCriteria?.length) {
      newErrors.acceptanceCriteria = 'At least one acceptance criterion is required';
    } else {
      formData.acceptanceCriteria.forEach((ac, i) => {
        if (!ac.description?.trim()) {
          newErrors[`acceptanceCriteria.${i}.description`] =
            'Acceptance criteria description is required';
        }
      });
    }

    formData.testCases?.forEach((tc, i) => {
      if (!tc.title?.trim()) {
        newErrors[`testCases.${i}.title`] = 'Test case title is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const cleaned = {
      ...formData,
      acceptanceCriteria: normalizeAcceptanceCriteria(formData.acceptanceCriteria || []),
      testCases: formData.testCases.map((tc) => ({
        ...tc,
        steps: tc.steps.filter((s) => s.trim()),
      })),
    };

    onSubmit(cleaned);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="card space-y-4 p-6">
        <h3 className="text-base font-semibold text-slate-900">Plan Details</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Plan Title"
            required
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            error={errors.title}
            placeholder="e.g. Sprint 12 Regression Plan"
          />
          <Input
            label="Project Name"
            required
            value={formData.projectName}
            onChange={(e) => updateField('projectName', e.target.value)}
            error={errors.projectName}
            placeholder="e.g. E-Commerce Platform"
          />
        </div>

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Brief overview of this QA plan"
        />

        <Textarea
          label="Test Scope"
          value={formData.testScope}
          onChange={(e) => updateField('testScope', e.target.value)}
          placeholder="Define what is in and out of scope for this plan"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => updateField('priority', e.target.value)}
            options={PRIORITIES.map((p) => ({ value: p, label: formatLabel(p) }))}
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => updateField('status', e.target.value)}
            options={PLAN_STATUSES.map((s) => ({ value: s, label: formatLabel(s) }))}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Test Types
          </label>
          <div className="flex flex-wrap gap-2">
            {TEST_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleTestType(type)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  formData.testTypes?.includes(type)
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {formatLabel(type)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Tags</label>
          <div className="flex gap-2">
            <input
              className="input-field flex-1"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add a tag and press Enter"
            />
            <Button type="button" variant="secondary" onClick={addTag}>
              Add
            </Button>
          </div>
          {formData.tags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-slate-400 hover:text-red-500">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="card p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Acceptance Criteria</h3>
              <p className="text-sm text-slate-500">
                Define the conditions that must be met for the plan to be accepted.
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={addAcceptanceCriterion}>
              <Plus className="h-4 w-4" />
              Add Criterion
            </Button>
          </div>

          {errors.acceptanceCriteria && (
            <p className="text-sm text-red-600">{errors.acceptanceCriteria}</p>
          )}

          {(formData.acceptanceCriteria || []).length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No acceptance criteria yet. Add one to continue.
            </div>
          ) : (
            <div className="space-y-4">
              {(formData.acceptanceCriteria || []).map((ac, index) => (
                <div key={ac.id || index} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{ac.id}</p>
                      <p className="text-xs text-slate-500">Acceptance criterion</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAcceptanceCriterion(index)}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Textarea
                    label="Description"
                    required
                    value={ac.description}
                    onChange={(e) => updateAcceptanceCriterion(index, e.target.value)}
                    error={errors[`acceptanceCriteria.${index}.description`]}
                    placeholder="Describe the acceptance criterion"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="card p-6">
        <TestCaseEditor
          testCases={formData.testCases || []}
          onChange={(tcs) => updateField('testCases', tcs)}
          errors={errors}
        />
      </section>

      {formData._id && (
        <section className="card p-6">
          <Textarea
            label="Change Notes"
            value={formData.changeNotes || ''}
            onChange={(e) => updateField('changeNotes', e.target.value)}
            placeholder="Describe what changed in this update"
            rows={2}
          />
        </section>
      )}

      <div className="flex justify-end gap-3">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
