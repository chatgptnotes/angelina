import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Search, Plus, Save, X, Edit3, Trash2, Database } from 'lucide-react';
import supabase from '../services/supabase';

interface Rate {
  id: string;
  category: string;
  item_name: string;
  specification: string | null;
  unit: string;
  rate_low: number | null;
  rate_mid: number | null;
  rate_high: number | null;
  city: string;
  updated_at: string;
}

const CATEGORIES = [
  'civil','flooring','wall_finish','ceiling','furniture','fixtures',
  'electrical','plumbing','doors_windows','kitchen','decorative','miscellaneous'
];

const UNITS = ['sqft','sqm','rft','nos','set','lot','kg','ltr','cum','bag'];

const RatesPage: React.FC = () => {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Rate>>({});
  const [adding, setAdding] = useState(false);
  const [newRate, setNewRate] = useState<Partial<Rate>>({
    category: 'flooring', item_name: '', specification: '', unit: 'sqft',
    rate_low: 0, rate_mid: 0, rate_high: 0, city: 'All'
  });

  useEffect(() => { loadRates(); }, []);

  const loadRates = async () => {
    try {
      const { data, error } = await supabase.from('boq_rates').select('*').order('category').order('item_name');
      if (error) throw error;
      setRates(data || []);
    } catch (e: any) {
      toast.error('Failed to load rates');
    } finally { setLoading(false); }
  };

  const cities = [...new Set(rates.map(r => r.city).filter(Boolean))];

  const filtered = rates.filter(r => {
    if (filterCat && r.category !== filterCat) return false;
    if (filterCity && r.city !== filterCity) return false;
    if (search) {
      const s = search.toLowerCase();
      return r.item_name.toLowerCase().includes(s) || (r.specification || '').toLowerCase().includes(s);
    }
    return true;
  });

  const startEdit = (rate: Rate) => {
    setEditingId(rate.id);
    setEditData({ ...rate });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const { error } = await supabase.from('boq_rates').update({
        category: editData.category, item_name: editData.item_name,
        specification: editData.specification, unit: editData.unit,
        rate_low: editData.rate_low, rate_mid: editData.rate_mid,
        rate_high: editData.rate_high, city: editData.city,
        updated_at: new Date().toISOString()
      }).eq('id', editingId);
      if (error) throw error;
      toast.success('Rate updated');
      setEditingId(null);
      loadRates();
    } catch (e: any) { toast.error('Update failed'); }
  };

  const addRate = async () => {
    if (!newRate.item_name) { toast.error('Item name required'); return; }
    try {
      const { error } = await supabase.from('boq_rates').insert({
        ...newRate, updated_at: new Date().toISOString()
      });
      if (error) throw error;
      toast.success('Rate added');
      setAdding(false);
      setNewRate({ category: 'flooring', item_name: '', specification: '', unit: 'sqft', rate_low: 0, rate_mid: 0, rate_high: 0, city: 'All' });
      loadRates();
    } catch (e: any) { toast.error('Add failed'); }
  };

  const deleteRate = async (id: string) => {
    if (!confirm('Delete this rate?')) return;
    try {
      await supabase.from('boq_rates').delete().eq('id', id);
      toast.success('Deleted');
      loadRates();
    } catch { toast.error('Delete failed'); }
  };

  const fmt = (n: number | null) => n != null ? `₹${Math.round(n).toLocaleString('en-IN')}` : '-';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-angelina-600" /> Rate Database
          </h2>
          <p className="text-gray-500 text-sm">Market rates for BOQ estimation • {rates.length} rates</p>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-angelina-600 text-white rounded-lg font-medium hover:bg-angelina-700">
          <Plus className="w-4 h-4" /> Add Rate
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rates..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-angelina-500 focus:border-transparent" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
        </select>
        <select value={filterCity} onChange={e => setFilterCity(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Add Form */}
      {adding && (
        <div className="bg-angelina-50 border border-angelina-200 rounded-xl p-4 mb-4">
          <h3 className="font-semibold mb-3">Add New Rate</h3>
          <div className="grid grid-cols-4 gap-3 text-sm">
            <select value={newRate.category} onChange={e => setNewRate({...newRate, category: e.target.value})}
              className="px-3 py-2 border rounded-lg">
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
            </select>
            <input value={newRate.item_name} onChange={e => setNewRate({...newRate, item_name: e.target.value})}
              placeholder="Item name" className="px-3 py-2 border rounded-lg" />
            <input value={newRate.specification || ''} onChange={e => setNewRate({...newRate, specification: e.target.value})}
              placeholder="Specification" className="px-3 py-2 border rounded-lg" />
            <select value={newRate.unit} onChange={e => setNewRate({...newRate, unit: e.target.value})}
              className="px-3 py-2 border rounded-lg">
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input type="number" value={newRate.rate_low || ''} onChange={e => setNewRate({...newRate, rate_low: +e.target.value})}
              placeholder="Rate Low" className="px-3 py-2 border rounded-lg" />
            <input type="number" value={newRate.rate_mid || ''} onChange={e => setNewRate({...newRate, rate_mid: +e.target.value})}
              placeholder="Rate Mid" className="px-3 py-2 border rounded-lg" />
            <input type="number" value={newRate.rate_high || ''} onChange={e => setNewRate({...newRate, rate_high: +e.target.value})}
              placeholder="Rate High" className="px-3 py-2 border rounded-lg" />
            <input value={newRate.city || ''} onChange={e => setNewRate({...newRate, city: e.target.value})}
              placeholder="City" className="px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addRate} className="px-4 py-2 bg-angelina-600 text-white rounded-lg text-sm font-medium hover:bg-angelina-700">
              <Save className="w-3.5 h-3.5 inline mr-1" /> Save
            </button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Item</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Spec</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Unit</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Low</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Mid</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">High</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">City</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(rate => (
              editingId === rate.id ? (
                <tr key={rate.id} className="bg-angelina-50">
                  <td className="px-4 py-2"><select value={editData.category} onChange={e => setEditData({...editData, category: e.target.value})} className="w-full px-2 py-1 border rounded text-xs">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}</select></td>
                  <td className="px-4 py-2"><input value={editData.item_name || ''} onChange={e => setEditData({...editData, item_name: e.target.value})} className="w-full px-2 py-1 border rounded text-xs" /></td>
                  <td className="px-4 py-2"><input value={editData.specification || ''} onChange={e => setEditData({...editData, specification: e.target.value})} className="w-full px-2 py-1 border rounded text-xs" /></td>
                  <td className="px-4 py-2"><select value={editData.unit} onChange={e => setEditData({...editData, unit: e.target.value})} className="w-full px-2 py-1 border rounded text-xs">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}</select></td>
                  <td className="px-4 py-2"><input type="number" value={editData.rate_low || ''} onChange={e => setEditData({...editData, rate_low: +e.target.value})} className="w-20 px-2 py-1 border rounded text-xs text-right" /></td>
                  <td className="px-4 py-2"><input type="number" value={editData.rate_mid || ''} onChange={e => setEditData({...editData, rate_mid: +e.target.value})} className="w-20 px-2 py-1 border rounded text-xs text-right" /></td>
                  <td className="px-4 py-2"><input type="number" value={editData.rate_high || ''} onChange={e => setEditData({...editData, rate_high: +e.target.value})} className="w-20 px-2 py-1 border rounded text-xs text-right" /></td>
                  <td className="px-4 py-2"><input value={editData.city || ''} onChange={e => setEditData({...editData, city: e.target.value})} className="w-full px-2 py-1 border rounded text-xs" /></td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={saveEdit} className="text-green-600 hover:text-green-800 mr-2"><Save className="w-4 h-4 inline" /></button>
                    <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4 inline" /></button>
                  </td>
                </tr>
              ) : (
                <tr key={rate.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2"><span className="text-xs px-2 py-0.5 rounded-full bg-angelina-100 text-angelina-700">{rate.category.replace('_',' ')}</span></td>
                  <td className="px-4 py-2 font-medium text-gray-900">{rate.item_name}</td>
                  <td className="px-4 py-2 text-gray-500 text-xs">{rate.specification || '-'}</td>
                  <td className="px-4 py-2 text-gray-500">{rate.unit}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{fmt(rate.rate_low)}</td>
                  <td className="px-4 py-2 text-right font-medium text-gray-900">{fmt(rate.rate_mid)}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{fmt(rate.rate_high)}</td>
                  <td className="px-4 py-2 text-gray-500">{rate.city}</td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => startEdit(rate)} className="text-angelina-600 hover:text-angelina-800 mr-2"><Edit3 className="w-4 h-4 inline" /></button>
                    <button onClick={() => deleteRate(rate.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4 inline" /></button>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
        {loading && <div className="p-8 text-center"><div className="animate-spin w-6 h-6 border-4 border-angelina-200 border-t-angelina-600 rounded-full mx-auto" /></div>}
        {!loading && filtered.length === 0 && <div className="p-8 text-center text-gray-400">No rates found</div>}
      </div>
    </div>
  );
};

export default RatesPage;
