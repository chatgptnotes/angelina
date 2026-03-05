// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Plus, Trash2, Package, Filter } from 'lucide-react';
import { BOQService } from '../services/boqService';

const CATEGORY_LABELS = {
  civil: 'Civil Works', flooring: 'Flooring', wall_finish: 'Wall Finish',
  ceiling: 'Ceiling', furniture: 'Furniture & Joinery', fixtures: 'Fixtures',
  electrical: 'Electrical', plumbing: 'Plumbing', doors_windows: 'Doors & Windows',
  kitchen: 'Kitchen', decorative: 'Decorative', hvac: 'HVAC',
  fire_fighting: 'Fire Fighting', low_current: 'Low Current / ELV',
  drainage: 'Drainage', external_works: 'External Works',
  preliminaries: 'Preliminaries', miscellaneous: 'Miscellaneous',
};

const BillOfMaterial = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [rows, setRows] = useState([]);
  const [filterCat, setFilterCat] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) loadData(); }, [id]);

  const loadData = async () => {
    try {
      const [proj, items] = await Promise.all([BOQService.getProject(id), BOQService.getItems(id)]);
      setProject(proj);
      setRows(items.map(item => ({
        id: item.id, description: item.description || '', specification: item.specification || '',
        unit: item.unit || 'No.', qty: item.quantity || 0, rate_aed: item.unit_rate || 0,
        total: item.amount || 0, category: item.category || 'miscellaneous', supplier: '', lead_time: '',
      })));
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const updateRow = (rowId, field, value) =>
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, [field]: value } : r));

  const addRow = () => setRows(prev => [...prev, {
    id: `custom-${Date.now()}`, description: 'New Material', specification: '', unit: 'No.',
    qty: 1, rate_aed: 0, total: 0, category: filterCat === 'all' ? 'miscellaneous' : filterCat,
    supplier: '', lead_time: '',
  }]);

  const exportCSV = () => {
    const header = ['Sr','Description','Specification','Unit','Qty','Rate','Total','Category','Supplier','Lead Time'];
    const dataRows = filteredRows.map((r, i) => [i+1, `"${r.description}"`, `"${r.specification}"`,
      r.unit, r.qty, r.rate_aed, r.total, CATEGORY_LABELS[r.category]||r.category, `"${r.supplier}"`, `"${r.lead_time}"`]);
    const csv = [header, ...dataRows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'}));
    a.download = `${project?.name||'bom'}_bill_of_materials.csv`; a.click();
    toast.success('Exported to CSV');
  };

  const categories = ['all', ...Array.from(new Set(rows.map(r => r.category)))];
  const filteredRows = filterCat === 'all' ? rows : rows.filter(r => r.category === filterCat);
  const grandTotal = filteredRows.reduce((s, r) => s + (r.total || 0), 0);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-angelina-200 border-t-angelina-600 rounded-full"/></div>;

  return (
    <div>
      <Link to={`/app/project/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4"/> Back to Project
      </Link>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-angelina-600"/> Bill of Material
          </h2>
          <p className="text-gray-500 text-sm mt-1">{project?.name} — {rows.length} materials</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addRow} className="flex items-center gap-1.5 px-3 py-2 border border-angelina-300 text-angelina-700 rounded-lg text-sm hover:bg-angelina-50">
            <Plus className="w-4 h-4"/> Add Row
          </button>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-angelina-600 text-white rounded-lg text-sm hover:bg-angelina-700">
            <Download className="w-4 h-4"/> Export CSV
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-4 items-center">
        <Filter className="w-4 h-4 text-gray-400"/>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterCat === cat ? 'bg-angelina-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {cat === 'all' ? 'All' : (CATEGORY_LABELS[cat]||cat)}
            <span className="ml-1 opacity-70">({cat === 'all' ? rows.length : rows.filter(r => r.category === cat).length})</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Sr','Description','Specification','Unit','Qty','Rate','Total','Supplier','Lead Time',''].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 && (
                <tr><td colSpan={10} className="py-12 text-center text-gray-400">No materials. Add BOQ items or click Add Row.</td></tr>
              )}
              {filteredRows.map((row, idx) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-400 text-xs">{idx+1}</td>
                  <td className="py-2 px-3 text-gray-800 font-medium">{row.description}</td>
                  <td className="py-2 px-3 text-gray-500 text-xs">{row.specification||'—'}</td>
                  <td className="py-2 px-3 text-center text-gray-600">{row.unit}</td>
                  <td className="py-2 px-3 text-right">{row.qty}</td>
                  <td className="py-2 px-3 text-right">{row.rate_aed.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right font-medium">{row.total.toLocaleString()}</td>
                  <td className="py-2 px-3">
                    <input value={row.supplier} onChange={e => updateRow(row.id,'supplier',e.target.value)}
                      placeholder="Supplier..." className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-angelina-400"/>
                  </td>
                  <td className="py-2 px-3">
                    <input value={row.lead_time} onChange={e => updateRow(row.id,'lead_time',e.target.value)}
                      placeholder="e.g. 4 weeks" className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-angelina-400"/>
                  </td>
                  <td className="py-2 px-3">
                    {row.id.startsWith('custom-') && (
                      <button onClick={() => setRows(p => p.filter(r => r.id !== row.id))} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-angelina-600 to-purple-600 text-white">
                <td colSpan={6} className="py-3 px-3 font-bold text-sm">Total Material Cost</td>
                <td className="py-3 px-3 text-right font-bold text-lg">{grandTotal.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-gray-300">drmhope.com | A Bettroi Product</div>
    </div>
  );
};

export default BillOfMaterial;
