import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import CreatePlan from './pages/CreatePlan';
import EditPlan from './pages/EditPlan';
import SavedPlans from './pages/SavedPlans';
import VersionHistory from './pages/VersionHistory';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="create" element={<CreatePlan />} />
            <Route path="saved-plans" element={<SavedPlans />} />
            <Route path="version-history" element={<VersionHistory />} />
            <Route path="plans/:id/edit" element={<EditPlan />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
