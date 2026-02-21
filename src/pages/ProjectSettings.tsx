import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Settings, Trash2, Save, ArrowLeft } from 'lucide-react';
import { BOQService } from '../services/boqService';
import type { BOQProject } from '../types/boq';

const STYLES = ['Mediterranean', 'Minimalistic', 'Luxurious', 'Modern', 'Classic', 'Industrial', 'Other'];
const STATUSES = ['draft', 'processing', 'review', 'approved', 'sent'] as const;

const ProjectSettings: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<BOQProject | null>(null);
  const [form, setForm] = useState({ name: '', client: '', location: '', style: '', total_area_sqft: '', status: 'draft', margin_percentage: '0' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    BOQService.getProject(id).then(p => {
      if (p) {
        setProject(p);
        setForm({
          name: p.name, client: p.client, location: p.location || '',
          style: p.style || 'Modern', total_area_sqft: p.total_area_sqft?.toString() || '',
          status: p.status, margin_percentage: (p as any).margin_percentage?.toString() || '0'
        });
      }
    });
  }, [id]);

  const handleSave = async () => {
    if (!id || !form.name || !form.client) { toast.error('Name and client required'); return; }
    setSaving(true);
    try {
      await BOQService.updateProject(id, {
        name: form.name, client: form.client, location: form.location || undefined,
        style: form.style as any, total_area_sqft: form.total_area_sqft ? +form.total_area_sqft : undefined,
        status: form.status as any,
      } as any);
      // Update margin separately via direct supabase
      const { default: supabase } = await import('../services/supabase');
      await supabase.from('boq_projects').update({ margin_percentage: +form.margin_percentage }).eq('id', id);
      toast.success('Project updated');
      navigate(`/project/${id}`);
    } catch (e: any) { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Delete this project and all its data? This cannot be undone.')) return;
    try {
      const { default: supabase } = await import('../services/supabase');
      await supabase.from('boq_items').delete().eq('project_id', id);
      await supabase.from('boq_rooms').delete().eq('project_id', id);
      await supabase.from('boq_documents').delete().eq('project_id', id);
      await supabase.from('boq_projects').delete().eq('id', id);
      toast.success('Project deleted');
      navigate('/');
    } catch { toast.error('Delete failed'); }
  };

  if (!project) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-angelina-200 border-t-angelina-600 rounded-full" /></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(`/project/${id}`)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to project
      </button>
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6 text-angelina-600" /> Project Settings
      </h2>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <input value={form.client} onChange={e => setForm({...form, client: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input value={form.location} onChange={e => setForm({...form, location: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
            <select value={form.style} onChange={e => setForm({...form, style: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent">
              {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area (sqft)</label>
            <input type="number" value={form.total_area_sqft} onChange={e => setForm({...form, total_area_sqft: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profit Margin %</label>
            <input type="number" value={form.margin_percentage} onChange={e => setForm({...form, margin_percentage: e.target.value})}
              placeholder="e.g. 15" min="0" max="100"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium">
            <Trash2 className="w-4 h-4" /> Delete Project
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-angelina-600 text-white rounded-lg font-medium hover:bg-angelina-700 disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettings;
