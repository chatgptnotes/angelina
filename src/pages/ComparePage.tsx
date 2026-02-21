import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { BarChart3, Plus, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BOQService } from '../services/boqService';
import type { BOQProject, BOQItem } from '../types/boq';

const COLORS = ['#c026d3', '#7c3aed', '#2563eb'];
const CATEGORY_LABELS: Record<string, string> = {
  civil: 'Civil', flooring: 'Flooring', wall_finish: 'Wall Finish', ceiling: 'Ceiling',
  furniture: 'Furniture', fixtures: 'Fixtures', electrical: 'Electrical', plumbing: 'Plumbing',
  doors_windows: 'Doors/Win', kitchen: 'Kitchen', decorative: 'Decorative', miscellaneous: 'Misc',
};

const ComparePage: React.FC = () => {
  const [allProjects, setAllProjects] = useState<BOQProject[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [projectItems, setProjectItems] = useState<Record<string, BOQItem[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BOQService.getProjects().then(p => { setAllProjects(p); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const addProject = async (id: string) => {
    if (selected.includes(id) || selected.length >= 3) return;
    setSelected([...selected, id]);
    if (!projectItems[id]) {
      const items = await BOQService.getItems(id);
      setProjectItems(prev => ({ ...prev, [id]: items }));
    }
  };

  const removeProject = (id: string) => {
    setSelected(selected.filter(s => s !== id));
  };

  const fmt = (n: number) => `₹${Math.round(n / 1000)}K`;
  const fmtFull = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  // Build comparison data
  const categories = Object.keys(CATEGORY_LABELS);
  const chartData = categories.map(cat => {
    const row: any = { category: CATEGORY_LABELS[cat] };
    selected.forEach(id => {
      const proj = allProjects.find(p => p.id === id);
      const items = projectItems[id] || [];
      row[proj?.name || id] = items.filter(i => i.category === cat).reduce((s, i) => s + (i.amount || 0), 0);
    });
    return row;
  }).filter(row => selected.some(id => {
    const proj = allProjects.find(p => p.id === id);
    return row[proj?.name || id] > 0;
  }));

  const totals = selected.map(id => {
    const proj = allProjects.find(p => p.id === id);
    const items = projectItems[id] || [];
    return { name: proj?.name || id, total: items.reduce((s, i) => s + (i.amount || 0), 0) };
  });

  const totalChartData = totals.map(t => ({ name: t.name, Total: t.total }));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-angelina-600" /> Compare Estimates
        </h2>
        <p className="text-gray-500 text-sm">Select 2-3 projects to compare side by side</p>
      </div>

      {/* Project selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          {selected.map((id, i) => {
            const proj = allProjects.find(p => p.id === id);
            return (
              <div key={id} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white" style={{ backgroundColor: COLORS[i] }}>
                {proj?.name}
                <button onClick={() => removeProject(id)}><X className="w-3.5 h-3.5" /></button>
              </div>
            );
          })}
          {selected.length < 3 && (
            <select onChange={e => { if (e.target.value) addProject(e.target.value); e.target.value = ''; }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm" defaultValue="">
              <option value="" disabled>+ Add project...</option>
              {allProjects.filter(p => !selected.includes(p.id)).map(p => (
                <option key={p.id} value={p.id}>{p.name} - {p.client}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {selected.length >= 2 && (
        <div className="space-y-6">
          {/* Total comparison */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Total Comparison</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={totalChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => fmtFull(v)} />
                <Bar dataKey="Total" fill="#c026d3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-8 mt-3">
              {totals.map((t, i) => (
                <div key={i} className="text-center">
                  <div className="text-xs text-gray-500">{t.name}</div>
                  <div className="text-lg font-bold" style={{ color: COLORS[i] }}>{fmtFull(t.total)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Category comparison */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Category-wise Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => fmtFull(v)} />
                <Legend />
                {selected.map((id, i) => {
                  const proj = allProjects.find(p => p.id === id);
                  return <Bar key={id} dataKey={proj?.name || id} fill={COLORS[i]} radius={[4, 4, 0, 0]} />;
                })}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selected.length < 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Select at least 2 projects to compare</p>
        </div>
      )}
    </div>
  );
};

export default ComparePage;
