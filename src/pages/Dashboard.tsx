import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Clock, DollarSign, Sparkles, ArrowRight, Building2, Search } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BOQService } from '../services/boqService';
import type { BOQProject } from '../types/boq';

const CATEGORY_COLORS: Record<string, string> = {
  civil: '#6B7280', flooring: '#D97706', wall_finish: '#7C3AED', ceiling: '#2563EB',
  furniture: '#059669', fixtures: '#DB2777', electrical: '#F59E0B', plumbing: '#0EA5E9',
  doors_windows: '#8B5CF6', kitchen: '#EF4444', decorative: '#EC4899', miscellaneous: '#9CA3AF',
};
const CATEGORY_LABELS: Record<string, string> = {
  civil: 'Civil', flooring: 'Flooring', wall_finish: 'Wall Finish', ceiling: 'Ceiling',
  furniture: 'Furniture', fixtures: 'Fixtures', electrical: 'Electrical', plumbing: 'Plumbing',
  doors_windows: 'Doors/Win', kitchen: 'Kitchen', decorative: 'Decorative', miscellaneous: 'Misc',
};

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<BOQProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryData, setCategoryData] = useState<{name:string;value:number;color:string}[]>([]);

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      const data = await BOQService.getProjects();
      setProjects(data);
      // Load category totals across all projects
      const allCats: Record<string, number> = {};
      for (const p of data.slice(0, 5)) { // top 5 projects for perf
        try {
          const totals = await BOQService.getProjectTotals(p.id);
          Object.entries(totals.byCategory).forEach(([cat, d]: [string, any]) => {
            allCats[cat] = (allCats[cat] || 0) + d.amount;
          });
        } catch {}
      }
      setCategoryData(
        Object.entries(allCats)
          .filter(([, v]) => v > 0)
          .map(([cat, amount]) => ({ name: CATEGORY_LABELS[cat] || cat, value: amount, color: CATEGORY_COLORS[cat] || '#9CA3AF' }))
          .sort((a, b) => b.value - a.value)
      );
    } catch { setProjects([]); }
    finally { setLoading(false); }
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600', processing: 'bg-blue-100 text-blue-700',
    review: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700',
    sent: 'bg-purple-100 text-purple-700',
  };

  const filtered = projects.filter(p => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.name.toLowerCase().includes(s) || p.client.toLowerCase().includes(s) || (p.location || '').toLowerCase().includes(s);
  });

  const recentProjects = [...projects].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5);

  const fmtCurrency = (n: number) => `₹${(n / 100000).toFixed(1)}L`;

  return (
    <div>
      {/* Hero */}
      <div className="mb-8 bg-gradient-to-r from-angelina-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">AI-Powered BOQ Extraction</h2>
            <p className="text-angelina-100 max-w-xl">
              Upload 3D renders or 2D design documents. AI extracts Bill of Quantities automatically.
              Reduce estimation time from <strong>1 week to 1 day</strong>.
            </p>
          </div>
          <Link to="/app/new" className="flex items-center gap-2 px-5 py-3 bg-white text-angelina-700 rounded-xl font-semibold hover:bg-angelina-50 transition-colors shadow-lg">
            <Sparkles className="w-5 h-5" /> New BOQ Project
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{projects.length}</div>
            <div className="text-xs text-angelina-200">Projects</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{projects.filter(p => p.status === 'processing').length}</div>
            <div className="text-xs text-angelina-200">Processing</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{projects.filter(p => p.status === 'approved').length}</div>
            <div className="text-xs text-angelina-200">Approved</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">₹{(projects.reduce((s, p) => s + (p.total_estimate || 0), 0) / 100000).toFixed(1)}L</div>
            <div className="text-xs text-angelina-200">Total Value</div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-angelina-500" /> Recent Activity
          </h3>
          {recentProjects.length > 0 ? (
            <div className="space-y-3">
              {recentProjects.map(p => (
                <Link key={p.id} to={`/app/project/${p.id}`} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-angelina-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.client}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[p.status]}`}>{p.status}</span>
                    <span className="text-xs text-gray-400">{new Date(p.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No projects yet</p>
          )}
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Cost by Category</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmtCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {categoryData.slice(0, 5).map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-gray-600">{d.name}</span>
                    </div>
                    <span className="text-gray-900 font-medium">{fmtCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">No data yet</p>
          )}
        </div>
      </div>

      {/* How It Works */}
      {projects.length === 0 && !loading && (
        <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-angelina-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-angelina-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">1. Upload Documents</h4>
              <p className="text-sm text-gray-500">Upload 3D renders, 2D floor plans, elevations, or material sheets</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">2. AI Extracts BOQ</h4>
              <p className="text-sm text-gray-500">AI identifies rooms, materials, quantities, and calculates costs</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">3. Review & Export</h4>
              <p className="text-sm text-gray-500">Edit, approve, and export as Excel or PDF for client sharing</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link to="/app/new" className="inline-flex items-center gap-2 px-6 py-3 bg-angelina-600 text-white rounded-xl font-semibold hover:bg-angelina-700 transition-colors">
              <Plus className="w-5 h-5" /> Create Your First BOQ Project
            </Link>
          </div>
        </div>
      )}

      {/* Project List */}
      {projects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Your Projects</h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-angelina-500 focus:border-transparent w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(project => (
              <Link key={project.id} to={`/app/project/${project.id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-angelina-300 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-angelina-50 rounded-lg"><Building2 className="w-5 h-5 text-angelina-600" /></div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[project.status]}`}>{project.status}</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-angelina-700 transition-colors">{project.name}</h4>
                <p className="text-sm text-gray-500 mb-3">{project.client}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(project.updated_at).toLocaleDateString()}</div>
                  {project.total_estimate && (
                    <div className="flex items-center gap-1 font-medium text-gray-600"><DollarSign className="w-3 h-3" />₹{(project.total_estimate / 100000).toFixed(2)}L</div>
                  )}
                  <ArrowRight className="w-3 h-3 group-hover:text-angelina-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
          {filtered.length === 0 && search && <p className="text-center text-gray-400 py-8">No projects match "{search}"</p>}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-angelina-200 border-t-angelina-600 rounded-full" />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
