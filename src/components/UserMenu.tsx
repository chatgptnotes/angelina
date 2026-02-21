import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, CreditCard, Users, LogOut, Activity, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserMenu: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || user?.email?.charAt(0).toUpperCase() || '?';

  const menuItems = [
    { to: '/app/profile', icon: User, label: 'Profile' },
    { to: '/app/team', icon: Users, label: 'Team' },
    { to: '/app/billing', icon: CreditCard, label: 'Billing' },
    { to: '/app/activity', icon: Activity, label: 'Activity' },
    { to: '/app/help', icon: HelpCircle, label: 'Help' },
  ];

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="w-9 h-9 rounded-full bg-angelina-100 flex items-center justify-center text-angelina-600 text-sm font-bold hover:bg-angelina-200 transition-colors">
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            {profile?.plan && <span className="inline-block mt-1 px-2 py-0.5 bg-angelina-100 text-angelina-700 text-xs font-medium rounded-full capitalize">{profile.plan}</span>}
          </div>
          <div className="py-1">
            {menuItems.map(item => (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <item.icon className="w-4 h-4 text-gray-400" /> {item.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-100 py-1">
            <button onClick={() => { setOpen(false); signOut(); }} className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
