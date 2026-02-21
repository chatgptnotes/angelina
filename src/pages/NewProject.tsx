import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sparkles, Building2, Upload, ArrowRight } from 'lucide-react';
import { BOQService } from '../services/boqService';

const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    client: '',
    location: '',
    style: 'Modern',
    total_area_sqft: '',
    num_rooms: '',
  });
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.client) {
      toast.error('Project name and client are required');
      return;
    }

    setCreating(true);
    try {
      const project = await BOQService.createProject({
        name: form.name,
        client: form.client,
        location: form.location || undefined,
        style: form.style as any,
        total_area_sqft: form.total_area_sqft ? Number(form.total_area_sqft) : undefined,
        num_rooms: form.num_rooms ? Number(form.num_rooms) : undefined,
        status: 'draft',
        currency: 'INR',
      });
      toast.success('Project created!');
      navigate(`/project/${project.id}`);
    } catch (error: any) {
      console.error('Create error:', error);
      toast.error('Failed to create project: ' + (error.message || 'Unknown error'));
    } finally {
      setCreating(false);
    }
  };

  const styles = ['Mediterranean', 'Minimalistic', 'Luxurious', 'Modern', 'Classic', 'Industrial', 'Other'];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">New BOQ Project</h2>
        <p className="text-gray-500 mt-1">Enter project details, then upload design documents for AI extraction</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Villa Serenity - 3BHK Interior"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
            <input
              type="text"
              value={form.client}
              onChange={e => setForm({ ...form, client: e.target.value })}
              placeholder="Client or company name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              placeholder="City or area"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Design Style</label>
            <select
              value={form.style}
              onChange={e => setForm({ ...form, style: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent"
            >
              {styles.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Area (sqft)</label>
            <input
              type="number"
              value={form.total_area_sqft}
              onChange={e => setForm({ ...form, total_area_sqft: e.target.value })}
              placeholder="e.g., 1500"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Rooms</label>
            <input
              type="number"
              value={form.num_rooms}
              onChange={e => setForm({ ...form, num_rooms: e.target.value })}
              placeholder="e.g., 6"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-angelina-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            After creation, upload design documents for AI extraction
          </p>
          <button
            type="submit"
            disabled={creating}
            className="flex items-center gap-2 px-6 py-3 bg-angelina-600 text-white rounded-xl font-semibold hover:bg-angelina-700 transition-colors disabled:opacity-50"
          >
            {creating ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {creating ? 'Creating...' : 'Create & Upload Documents'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProject;
