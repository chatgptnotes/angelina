import React, { useState } from 'react';
import { User, Mail, Phone, Building2, Save, Key, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    company: profile?.company || '',
    role: profile?.role || 'designer',
    phone: profile?.phone || '',
    currency: profile?.currency || 'INR',
    tax_rate: profile?.tax_rate ?? 18,
    margin_preset: profile?.margin_preset ?? 15,
  });
  const [loading, setLoading] = useState(false);
  const [apiKey] = useState(() => 'ak_' + Math.random().toString(36).slice(2, 18));
  const [notifPrefs, setNotifPrefs] = useState({ project_share: true, comment: true, approval: true });

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(form as Record<string, unknown> as Parameters<typeof updateProfile>[0]);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); }
    setLoading(false);
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>

      {/* Avatar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Avatar</h2>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-angelina-100 flex items-center justify-center text-angelina-600 text-2xl font-bold">
            {form.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <Camera className="w-4 h-4" /> Upload Photo
          </button>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={form.full_name} onChange={set('full_name')} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={user?.email || ''} disabled className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={form.phone} onChange={set('phone')} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" placeholder="+91 9876543210" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={form.company} onChange={set('company')} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={form.role} onChange={set('role')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent">
              <option value="designer">Interior Designer</option>
              <option value="contractor">Contractor</option>
              <option value="architect">Architect</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Defaults */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Defaults</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select value={form.currency} onChange={set('currency')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent">
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="AED">AED (د.إ)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
            <input type="number" value={form.tax_rate} onChange={set('tax_rate')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Margin Preset (%)</label>
            <input type="number" value={form.margin_preset} onChange={set('margin_preset')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" />
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
        <div className="space-y-3">
          {[
            { key: 'project_share', label: 'When a project is shared with me' },
            { key: 'comment', label: 'When someone comments on my BOQ' },
            { key: 'approval', label: 'When a client approves a BOQ' },
          ].map(item => (
            <label key={item.key} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">{item.label}</span>
              <input type="checkbox" checked={notifPrefs[item.key as keyof typeof notifPrefs]} onChange={e => setNotifPrefs(p => ({ ...p, [item.key]: e.target.checked }))} className="w-4 h-4 text-angelina-600 rounded focus:ring-angelina-500" />
            </label>
          ))}
        </div>
      </div>

      {/* API Key */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Key</h2>
        <p className="text-sm text-gray-500 mb-3">Use this key for integrations. Keep it secret.</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={apiKey} readOnly className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm" />
          </div>
          <button onClick={() => { navigator.clipboard.writeText(apiKey); toast.success('Copied!'); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Copy</button>
        </div>
      </div>

      <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-angelina-500 to-angelina-700 text-white rounded-lg font-medium hover:from-angelina-600 hover:to-angelina-800 transition-all disabled:opacity-50">
        <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
};

export default ProfilePage;
