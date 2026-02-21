import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Plus, Database, BarChart3, Sparkles } from 'lucide-react';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';
import GlobalSearch from './GlobalSearch';

const Layout: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navLink = (to: string, label: string, icon: React.ReactNode) => (
    <Link to={to} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(to) ? 'bg-angelina-50 text-angelina-700' : 'text-gray-600 hover:bg-gray-100'
    }`}>
      {icon}{label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/app" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-angelina-500 to-angelina-700 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Angelina BOQ</h1>
                <p className="text-xs text-gray-500">AI Interior Design Estimation</p>
              </div>
            </Link>

            <nav className="flex items-center gap-1">
              {navLink('/app', 'Dashboard', <Home className="w-4 h-4" />)}
              {navLink('/app/rates', 'Rates', <Database className="w-4 h-4" />)}
              {navLink('/app/compare', 'Compare', <BarChart3 className="w-4 h-4" />)}
              <Link to="/app/new" className="flex items-center gap-2 px-4 py-2 bg-angelina-600 text-white rounded-lg text-sm font-medium hover:bg-angelina-700 transition-colors ml-2">
                <Plus className="w-4 h-4" /> New Project
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <GlobalSearch />
              <NotificationBell />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
