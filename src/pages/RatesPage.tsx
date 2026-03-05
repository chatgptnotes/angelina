import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Search, Plus, Save, X, Edit3, Trash2, Database, Download, Upload } from 'lucide-react';
import { UAE_RATES, UAE_RATE_CATEGORIES } from '../data/uaeRates';
import type { UAERate } from '../data/uaeRates';

interface EditableRate extends UAERate {
  id: string;
  isCustom?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  civil: 'Civil Works', flooring: 'Flooring', wall_finish: 'Wall Finish',
  ceiling: 'Ceiling', furniture: 'Furniture', fixtures: 'Fixtures',
  electrical: 'Electrical', plumbing: 'Plumbing', doors_windows: 'Doors & Windows',
  kitchen: 'Kitchen', decorative: 'Decorative', hvac: 'HVAC',
  fire_fighting: 'Fire Fighting', low_current: 'Low Current',
  drainage: 'Drainage', external_works: 'External Works',
  preliminaries: 'Preliminaries', miscellaneous: 'Miscellaneous',
};

const UNITS = ['sqft', 'sqm', 'rft', 'nos', 'set', 'lot', 'kg', 'ltr', 'cum', 'bag'];

const RatesPage: React.FC = () => {
  const [customRates, setCustomRates] = useState<EditableRate[]>([]);
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<EditableRate>>({});
  const [adding, setAdding] = useState(false);
  const [newRate, setNewRate] = useState<Partial<EditableRate>>({
    category: 'civil', item: '', description: '', unit: 'sqm',
    rate_aed: 0, subcategory: '',
  });

  // Combine UAE rates with custom rates
  const allRates: EditableRate[] = useMemo(() => {
    const baseRates = UAE_RATES.map((r, i) => ({
      ...r,
      id: `uae-${i}`,
      rate_aed: overrides[`uae-${i}`] ?? r.rate_aed,
    }));
    return [...baseRates, ...customRates];
  }, [customRates, overrides]);

  const filtered = allRates.filter(r => {
    if (filterCat && r.category !== filterCat) return false;
    if (search) {
      const s = search.toLowerCase();
      return r.item.toLowerCase().includes(s) || r.description.toLowerCase().includes(s) || r.subcategory.toLowerCase().includes(s);
    }
    return true;
  });

  const startEdit = (rate: EditableRate) => {
    setEditingId(rate.id);
    setEditData({ ...rate });
  };

  const saveEdit = () => {
    if (!editingId) return;
    if (editingId.startsWith('uae-')) {
      // Override base rate
      setOverrides(prev => ({ ...prev, [editingId]: editData.rate_aed || 0 }));
    } else {
      // Update custom rate
      setCustomRates(prev => prev.map(r =>
        r.id === editingId ? { ...r, ...editData } as EditableRate : r
      ));
    }
    toast.success('Rate updated');
    setEditingId(null);
  };

  const addRate = () => {
    if (!newRate.item) { toast.error('Item name required'); return; }
    const rate: EditableRate = {
      id: `custom-${Date.now()}`,
      item: newRate.item || '',
      description: newRate.description || '',
      unit: newRate.unit || 'nos',
      rate_aed: newRate.rate_aed || 0,
      category: newRate.category || 'miscellaneous',
      subcategory: newRate.subcategory || '',
      isCustom: true,
    };
    setCustomRates(prev => [...prev, rate]);
    toast.success('Rate added');
    setAdding(false);
    setNewRate({ category: 'civil', item: '', description: '', unit: 'sqm', rate_aed: 0, subcategory: '' });
  };

  const deleteRate = (id: string) => {
    if (id.startsWith('uae-')) {
      setOverrides(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      toast.success('Rate reset to default');
    } else {
      setCustomRates(prev => prev.filter(r => r.id !== id));
      toast.success('Rate deleted');
    }
  };

  const exportRates = () => {
    const data = JSON.stringify({ overrides, customRates }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uae_rates_export.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Rates exported');
  };

  const importRates = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.overrides) setOverrides(data.overrides);
        if (data.customRates) setCustomRates(data.customRates);
        toast.success('Rates imported');
      } catch { toast.error('Invalid rate file'); }
    };
    input.click();
  };

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-angelina-600" /> UAE Rate Database
          </h2>
          <p className="text-gray-500 text-sm">UAE construction market rates in AED - {allRates.length} rates</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={importRates} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button onClick={exportRates} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-angelina-600 text-white rounded-lg font-medium hover:bg-angelina-700">
            <Plus className="w-4 h-4" /> Add Rate
          </button>
        </div>
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
          {UAE_RATE_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>)}
        </select>
      </div>

      {/* Add Form */}
      {adding && (
        <div className="bg-angelina-50 border border-angelina-200 rounded-xl p-4 mb-4">
          <h3 className="font-semibold mb-3">Add New Rate</h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <select value={newRate.category} onChange={e => setNewRate({ ...newRate, category: e.target.value })}
              className="px-3 py-2 border rounded-lg">
              {UAE_RATE_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>)}
            </select>
            <input value={newRate.item} onChange={e => setNewRate({ ...newRate, item: e.target.value })}
              placeholder="Item name" className="px-3 py-2 border rounded-lg" />
            <input value={newRate.subcategory || ''} onChange={e => setNewRate({ ...newRate, subcategory: e.target.value })}
              placeholder="Subcategory" className="px-3 py-2 border rounded-lg" />
            <input value={newRate.description} onChange={e => setNewRate({ ...newRate, description: e.target.value })}
              placeholder="Description" className="px-3 py-2 border rounded-lg col-span-2" />
            <select value={newRate.unit} onChange={e => setNewRate({ ...newRate, unit: e.target.value })}
              className="px-3 py-2 border rounded-lg">
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input type="number" value={newRate.rate_aed || ''} onChange={e => setNewRate({ ...newRate, rate_aed: +e.target.value })}
              placeholder="Rate (AED)" className="px-3 py-2 border rounded-lg" />
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Unit</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Rate (AED)</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(rate => (
              editingId === rate.id ? (
                <tr key={rate.id} className="bg-angelina-50">
                  <td className="px-4 py-2"><span className="text-xs">{CATEGORY_LABELS[rate.category] || rate.category}</span></td>
                  <td className="px-4 py-2"><input value={editData.item || ''} onChange={e => setEditData({ ...editData, item: e.target.value })} className="w-full px-2 py-1 border rounded text-xs" /></td>
                  <td className="px-4 py-2"><input value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} className="w-full px-2 py-1 border rounded text-xs" /></td>
                  <td className="px-4 py-2"><select value={editData.unit || ''} onChange={e => setEditData({ ...editData, unit: e.target.value })} className="w-full px-1 py-1 border rounded text-xs">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}</select></td>
                  <td className="px-4 py-2"><input type="number" value={editData.rate_aed || ''} onChange={e => setEditData({ ...editData, rate_aed: +e.target.value })} className="w-full px-2 py-1 border rounded text-xs text-right" /></td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={saveEdit} className="text-green-600 hover:text-green-800 mr-2"><Save className="w-4 h-4 inline" /></button>
                    <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4 inline" /></button>
                  </td>
                </tr>
              ) : (
                <tr key={rate.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-angelina-100 text-angelina-700">{CATEGORY_LABELS[rate.category] || rate.category}</span>
                    {rate.subcategory && <span className="text-xs text-gray-400 ml-1">{rate.subcategory}</span>}
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-900">{rate.item}</td>
                  <td className="px-4 py-2 text-gray-500 text-xs">{rate.description}</td>
                  <td className="px-4 py-2 text-gray-500">{rate.unit}</td>
                  <td className="px-4 py-2 text-right font-medium text-gray-900">
                    {fmt(rate.rate_aed)}
                    {overrides[rate.id] !== undefined && <span className="text-xs text-angelina-500 ml-1">(modified)</span>}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => startEdit(rate)} className="text-angelina-600 hover:text-angelina-800 mr-2"><Edit3 className="w-4 h-4 inline" /></button>
                    <button onClick={() => deleteRate(rate.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-8 text-center text-gray-400">No rates found</div>}
      </div>
    </div>
  );
};

export default RatesPage;
