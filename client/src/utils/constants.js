export const TEST_TYPES = [
  'functional',
  'regression',
  'integration',
  'e2e',
  'performance',
  'security',
  'usability',
  'smoke',
];

export const PRIORITIES = ['low', 'medium', 'high', 'critical'];

export const PLAN_STATUSES = ['draft', 'active', 'completed', 'archived'];

export const TEST_CASE_STATUSES = ['pending', 'passed', 'failed', 'blocked', 'skipped'];

export const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
};

export const STATUS_COLORS = {
  draft: 'bg-slate-100 text-slate-700',
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  archived: 'bg-gray-100 text-gray-600',
};

export const TEST_CASE_STATUS_COLORS = {
  pending: 'bg-slate-100 text-slate-700',
  passed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  blocked: 'bg-amber-100 text-amber-700',
  skipped: 'bg-gray-100 text-gray-600',
};

export const formatLabel = (value) =>
  value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const EMPTY_PLAN = {
  title: '',
  description: '',
  projectName: '',
  testScope: '',
  testTypes: [],
  priority: 'medium',
  status: 'draft',
  tags: [],
  testCases: [],
  acceptanceCriteria: [],
};

export const EMPTY_TEST_CASE = {
  title: '',
  description: '',
  steps: [''],
  expectedResult: '',
  priority: 'medium',
  status: 'pending',
};

export const EMPTY_ACCEPTANCE_CRITERION = {
  id: '',
  description: '',
};
