import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar, { Navbar } from './Sidebar';

const pageTitles = {
  '/': 'Dashboard',
  '/create': 'Create QA Plan',
  '/saved-plans': 'Saved Plans',
  '/version-history': 'Version History',
};

function getPageTitle(pathname) {
  if (pathname.startsWith('/plans/')) return 'Edit QA Plan';
  return pageTitles[pathname] || 'Agentic QA Planning Assistant';
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col lg:ml-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
