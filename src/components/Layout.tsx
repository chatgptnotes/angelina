import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Plus, Database, BarChart3, Sparkles, Menu, X, ChevronRight, BookOpen, Package, Layers, Calculator, Ruler, Globe } from 'lucide-react';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';
import GlobalSearch from './GlobalSearch';

const Layout: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isActivePrefix = (path: string) => location.pathname.startsWith(path);

  const navItems = [
    { to: '/app', label: 'Dashboard', icon: <Home className="w-4 h-4" />, exact: true },
    { to: '/app/rates', label: 'Rates', icon: <Database className="w-4 h-4" /> },
    { to: '/app/compare', label: 'Compare', icon: <BarChart3 className="w-4 h-4" /> },
    { to: '/app/templates', label: 'Templates', icon: <Layers className="w-4 h-4" /> },
    { to: '/app/materials', label: 'Materials', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/app/vendors', label: 'Vendors', icon: <Package className="w-4 h-4" /> },
  ];

  const isNavActive = (item: typeof navItems[0]) =>
    item.exact ? isActive(item.to) : isActivePrefix(item.to);

  // Breadcrumbs
  const breadcrumbs: { label: string; to?: string }[] = [];
  if (isActivePrefix('/app/project/')) {
    breadcrumbs.push({ label: 'Dashboard', to: '/app' });
    breadcrumbs.push({ label: 'Project' });
    if (location.pathname.endsWith('/settings')) {
      breadcrumbs.push({ label: 'Settings' });
    } else if (location.pathname.endsWith('/estimate')) {
      breadcrumbs.push({ label: 'QS Estimate' });
    } else if (location.pathname.endsWith('/drawings')) {
      breadcrumbs.push({ label: 'Drawing Analysis' });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/app" className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-angelina-500 to-angelina-700 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">Cre8</h1>
                <p className="text-xs text-gray-500">AI-Powered BOQ Platform</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map(item => (
                <Link key={item.to} to={item.to} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isNavActive(item) ? 'bg-angelina-50 text-angelina-700' : 'text-gray-600 hover:bg-gray-100'
                }`}>
                  {item.icon}{item.label}
                </Link>
              ))}
              <Link to="/app/new" className="flex items-center gap-2 px-4 py-2 bg-angelina-600 text-white rounded-lg text-sm font-medium hover:bg-angelina-700 transition-colors ml-2">
                <Plus className="w-4 h-4" /> New Project
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <GlobalSearch />
              <NotificationBell />
              <UserMenu />
              {/* Mobile menu button */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg" aria-label="Toggle menu">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1">
            {navItems.map(item => (
              <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isNavActive(item) ? 'bg-angelina-50 text-angelina-700' : 'text-gray-600 hover:bg-gray-100'
                }`}>
                {item.icon}{item.label}
              </Link>
            ))}
            <Link to="/app/new" onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 bg-angelina-600 text-white rounded-lg text-sm font-medium hover:bg-angelina-700 transition-colors mt-2">
              <Plus className="w-4 h-4" /> New Project
            </Link>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-angelina-600 transition-colors">{crumb.label}</Link>
                ) : (
                  <span className="text-gray-700 font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <a href="https://drmhope.com" target="_blank" rel="noopener noreferrer" className="hover:text-angelina-600 transition-colors">drmhope.com</a>
              <span>|</span>
              <span>A Bettroi Product</span>
            </div>
            <span>v2.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
