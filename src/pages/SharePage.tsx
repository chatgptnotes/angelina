import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, FileText } from 'lucide-react';
import supabase from '../services/supabase';
import type { BOQProject, BOQRoom, BOQItem } from '../types/boq';

const CATEGORY_LABELS: Record<string, string> = {
  civil: 'Civil', flooring: 'Flooring', wall_finish: 'Wall Finish', ceiling: 'Ceiling',
  furniture: 'Furniture', fixtures: 'Fixtures', electrical: 'Electrical', plumbing: 'Plumbing',
  doors_windows: 'Doors & Windows', kitchen: 'Kitchen', decorative: 'Decorative', miscellaneous: 'Misc',
};

const SharePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<BOQProject | null>(null);
  const [rooms, setRooms] = useState<BOQRoom[]>([]);
  const [items, setItems] = useState<BOQItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('boq_projects').select('*').eq('id', id).single(),
      supabase.from('boq_rooms').select('*').eq('project_id', id).order('order'),
      supabase.from('boq_items').select('*').eq('project_id', id).order('order'),
    ]).then(([pRes, rRes, iRes]) => {
      setProject(pRes.data);
      setRooms(rRes.data || []);
      setItems(iRes.data || []);
    }).finally(() => setLoading(false));
  }, [id]);

  const fmt = (n: number) => { const v = Math.round(n); return v >= 1000000 ? (v/1000000).toFixed(2)+'M' : v >= 1000 ? (v/1000).toFixed(1)+'K' : String(v); };
  const grandTotal = items.reduce((s, i) => s + (i.amount || 0), 0);
  const marginPct = (project as any)?.margin_percentage || 0;
  const clientTotal = grandTotal * (1 + marginPct / 100);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full" /></div>;
  if (!project) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Project not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-pink-600 text-white py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-2 text-purple-200 text-sm">
            <Sparkles className="w-4 h-4" /> Cre8
          </div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-purple-200 mt-1">{project.client} {project.location && `• ${project.location}`}</p>
          <div className="flex items-center gap-6 mt-4">
            {project.style && <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{project.style}</span>}
            {project.total_area_sqft && <span className="text-sm">{project.total_area_sqft} sqft</span>}
            <span className="text-sm">{rooms.length} rooms • {items.length} items</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-6 space-y-6">
        {rooms.map(room => {
          const rItems = items.filter(i => i.room_id === room.id);
          if (rItems.length === 0) return null;
          const rTotal = rItems.reduce((s, i) => s + (i.amount || 0), 0);

          const grouped: Record<string, BOQItem[]> = {};
          rItems.forEach(item => {
            const cat = item.category || 'miscellaneous';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(item);
          });

          return (
            <div key={room.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-purple-50 border-b border-purple-100">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{room.name}</h3>
                    <p className="text-xs text-gray-500">{rItems.length} items {room.area_sqft && `• ${room.area_sqft} sqft`}</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-gray-900">{fmt(rTotal)}</span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Unit</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qty</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Rate</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {Object.entries(grouped).map(([cat, catItems]) => (
                    <React.Fragment key={cat}>
                      <tr className="bg-purple-50/50"><td colSpan={6} className="px-4 py-1.5 text-xs font-semibold text-purple-700">{CATEGORY_LABELS[cat] || cat}</td></tr>
                      {catItems.map(item => (
                        <tr key={item.id}>
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2"><div className="font-medium text-gray-900">{item.description}</div>{item.specification && <div className="text-xs text-gray-400">{item.specification}</div>}</td>
                          <td className="px-4 py-2 text-gray-500">{item.unit}</td>
                          <td className="px-4 py-2 text-right">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">{fmt(item.rate)}</td>
                          <td className="px-4 py-2 text-right font-medium">{fmt(item.amount)}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}

        {/* Grand Total */}
        <div className="bg-gradient-to-r from-purple-700 to-pink-600 rounded-xl p-6 text-white text-center">
          <div className="text-sm text-purple-200">Grand Total</div>
          <div className="text-4xl font-bold mt-1">{fmt(marginPct > 0 ? clientTotal : grandTotal)}</div>
          {marginPct > 0 && <div className="text-sm text-purple-200 mt-1">Inclusive of charges</div>}
        </div>

        <div className="text-center text-xs text-gray-400 py-4">
          Generated by Cre8 • {new Date().toLocaleDateString('en-IN')}
        </div>
      </div>
    </div>
  );
};

export default SharePage;
