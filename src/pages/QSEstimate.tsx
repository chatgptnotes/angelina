import { fmtMoney } from '../utils/format';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Calculator, ArrowLeft, Edit3, Save, Download, FileText,
  ChevronDown, ChevronUp, DollarSign, Percent, Building2
} from 'lucide-react';
import { BOQService } from '../services/boqService';
import { ExportService } from '../services/exportService';
import type { BOQProject, BOQRoom, BOQItem } from '../types/boq';



const QSEstimate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<BOQProject | null>(null);
  const [rooms, setRooms] = useState<BOQRoom[]>([]);
  const [items, setItems] = useState<BOQItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [preliminariesPct, setPreliminariesPct] = useState(12);
  const [contingencyPct, setContingencyPct] = useState(5);
  const [designFeePct, setDesignFeePct] = useState(5);
  const [ohpPct, setOhpPct] = useState(10);
  const vatPct = 5; // UAE VAT fixed
  const [editingPcts, setEditingPcts] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['measured', 'summary']));

  useEffect(() => { if (id) loadData(); }, [id]);

  const loadData = async () => {
    if (!id) return;
    try {
      const [proj, rms, itms] = await Promise.all([
        BOQService.getProject(id), BOQService.getRooms(id), BOQService.getItems(id),
      ]);
      setProject(proj);
      setRooms(rms);
      setItems(itms);
    } catch { toast.error('Failed to load project data'); }
    finally { setLoading(false); }
  };

  const fmt = fmtMoney;

  const toggleSection = (s: string) => {
    const next = new Set(expandedSections);
    next.has(s) ? next.delete(s) : next.add(s);
    setExpandedSections(next);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-angelina-200 border-t-angelina-600 rounded-full" /></div>;
  if (!project) return <div className="text-center py-20 text-gray-500">Project not found</div>;

  const measuredWorks = items.reduce((s, i) => s + (i.amount || 0), 0);
  const preliminariesAmt = measuredWorks * (preliminariesPct / 100);
  const subtotal1 = measuredWorks + preliminariesAmt;
  const contingencyAmt = subtotal1 * (contingencyPct / 100);
  const designFeeAmt = subtotal1 * (designFeePct / 100);
  const ohpAmt = subtotal1 * (ohpPct / 100);
  const subtotal2 = subtotal1 + contingencyAmt + designFeeAmt + ohpAmt;
  const vatAmt = subtotal2 * (vatPct / 100);
  const grandTotal = subtotal2 + vatAmt;

  // Group items by category
  const byCategory: Record<string, { items: BOQItem[]; total: number }> = {};
  items.forEach(item => {
    const cat = item.category || 'miscellaneous';
    if (!byCategory[cat]) byCategory[cat] = { items: [], total: 0 };
    byCategory[cat].items.push(item);
    byCategory[cat].total += item.amount || 0;
  });

  const CATEGORY_LABELS: Record<string, string> = {
    civil: 'Civil Works', flooring: 'Flooring', wall_finish: 'Wall Finish',
    ceiling: 'Ceiling', furniture: 'Furniture & Joinery', fixtures: 'Fixtures',
    electrical: 'Electrical', plumbing: 'Plumbing', doors_windows: 'Doors & Windows',
    kitchen: 'Kitchen', decorative: 'Decorative', hvac: 'HVAC',
    fire_fighting: 'Fire Fighting', low_current: 'Low Current Systems',
    drainage: 'Drainage', external_works: 'External Works',
    preliminaries: 'Preliminaries', miscellaneous: 'Miscellaneous',
  };

  const SummaryRow = ({ label, amount, pct, bold, accent }: { label: string; amount: number; pct?: number; bold?: boolean; accent?: boolean }) => (
    <div className={`flex items-center justify-between py-3 px-4 ${bold ? 'font-bold text-lg' : 'text-sm'} ${accent ? 'bg-angelina-50 rounded-lg' : ''}`}>
      <div className="flex items-center gap-2">
        <span className={bold ? 'text-gray-900' : 'text-gray-700'}>{label}</span>
        {pct !== undefined && <span className="text-xs text-gray-400">({pct}%)</span>}
      </div>
      <span className={bold ? 'text-gray-900' : 'text-gray-900'}>{fmt(amount)}</span>
    </div>
  );

  return (
    <div>
      <Link to={`/app/project/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Project
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-angelina-600" />
            QS Estimate
          </h2>
          <p className="text-gray-500 text-sm mt-1">{project.name} - {project.client}</p>
        </div>
        <div className="flex items-center gap-2">

          <button onClick={() => ExportService.exportExcel(project, rooms, items)}
            className="flex items-center gap-1.5 px-3 py-2 bg-angelina-600 text-white rounded-lg text-sm font-medium hover:bg-angelina-700">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Measured Works Section */}
      <div className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
        <button onClick={() => toggleSection('measured')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-angelina-600" />
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Measured Works (from BOQ)</h3>
              <p className="text-xs text-gray-500">{items.length} items across {rooms.length} rooms</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-900">{fmt(measuredWorks)}</span>
            {expandedSections.has('measured') ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </button>
        {expandedSections.has('measured') && (
          <div className="border-t border-gray-100 p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">CSI Section</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Items</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Amount</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byCategory)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([cat, data]) => (
                    <tr key={cat} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-700">{CATEGORY_LABELS[cat] || cat}</td>
                      <td className="py-2 px-3 text-right text-gray-500">{data.items.length}</td>
                      <td className="py-2 px-3 text-right font-medium text-gray-900">{fmt(data.total)}</td>
                      <td className="py-2 px-3 text-right text-gray-500">
                        {measuredWorks > 0 ? (data.total / measuredWorks * 100).toFixed(1) : '0'}%
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-gray-50">
                  <td className="py-2 px-3">Total Measured Works</td>
                  <td className="py-2 px-3 text-right">{items.length}</td>
                  <td className="py-2 px-3 text-right">{fmt(measuredWorks)}</td>
                  <td className="py-2 px-3 text-right">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Estimate Summary */}
      <div className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
        <button onClick={() => toggleSection('summary')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Estimate Summary</h3>
          </div>
          <div className="flex items-center gap-3">
            {!editingPcts ? (
              <button onClick={(e) => { e.stopPropagation(); setEditingPcts(true); }}
                className="text-xs text-angelina-600 hover:text-angelina-700 flex items-center gap-1">
                <Edit3 className="w-3.5 h-3.5" /> Edit %
              </button>
            ) : (
              <button onClick={(e) => { e.stopPropagation(); setEditingPcts(false); }}
                className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1">
                <Save className="w-3.5 h-3.5" /> Done
              </button>
            )}
            {expandedSections.has('summary') ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </button>
        {expandedSections.has('summary') && (
          <div className="border-t border-gray-100">
            <SummaryRow label="Measured Works" amount={measuredWorks} bold />
            <div className="border-t border-gray-100" />

            {/* Preliminaries */}
            <div className="flex items-center justify-between py-3 px-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Preliminaries (Site setup, insurance, bonds)</span>
                {editingPcts ? (
                  <div className="flex items-center gap-1">
                    <input type="number" value={preliminariesPct} onChange={e => setPreliminariesPct(+e.target.value)}
                      className="w-16 px-2 py-0.5 border rounded text-xs text-right" step="0.5" />
                    <Percent className="w-3 h-3 text-gray-400" />
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">({preliminariesPct}%)</span>
                )}
              </div>
              <span className="text-gray-900">{fmt(preliminariesAmt)}</span>
            </div>

            <div className="border-t border-gray-100" />
            <SummaryRow label="Subtotal" amount={subtotal1} bold accent />
            <div className="border-t border-gray-100" />

            {/* Contingency */}
            <div className="flex items-center justify-between py-3 px-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Contingency</span>
                {editingPcts ? (
                  <div className="flex items-center gap-1">
                    <input type="number" value={contingencyPct} onChange={e => setContingencyPct(+e.target.value)}
                      className="w-16 px-2 py-0.5 border rounded text-xs text-right" step="0.5" />
                    <Percent className="w-3 h-3 text-gray-400" />
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">({contingencyPct}%)</span>
                )}
              </div>
              <span className="text-gray-900">{fmt(contingencyAmt)}</span>
            </div>

            {/* Design Fee */}
            <div className="flex items-center justify-between py-3 px-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Design Fee</span>
                {editingPcts ? (
                  <div className="flex items-center gap-1">
                    <input type="number" value={designFeePct} onChange={e => setDesignFeePct(+e.target.value)}
                      className="w-16 px-2 py-0.5 border rounded text-xs text-right" step="0.5" />
                    <Percent className="w-3 h-3 text-gray-400" />
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">({designFeePct}%)</span>
                )}
              </div>
              <span className="text-gray-900">{fmt(designFeeAmt)}</span>
            </div>

            {/* OH&P */}
            <div className="flex items-center justify-between py-3 px-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Overheads & Profit (OH&P)</span>
                {editingPcts ? (
                  <div className="flex items-center gap-1">
                    <input type="number" value={ohpPct} onChange={e => setOhpPct(+e.target.value)}
                      className="w-16 px-2 py-0.5 border rounded text-xs text-right" step="0.5" />
                    <Percent className="w-3 h-3 text-gray-400" />
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">({ohpPct}%)</span>
                )}
              </div>
              <span className="text-gray-900">{fmt(ohpAmt)}</span>
            </div>

            <div className="border-t border-gray-100" />
            <SummaryRow label="Subtotal before VAT" amount={subtotal2} bold accent />
            <div className="border-t border-gray-100" />

            {/* VAT */}
            <SummaryRow label="VAT (UAE)" amount={vatAmt} pct={vatPct} />

            <div className="border-t border-gray-200" />

            {/* Grand Total */}
            <div className="bg-gradient-to-r from-angelina-600 to-purple-600 p-5 flex items-center justify-between text-white">
              <div>
                <div className="text-sm text-angelina-200">Grand Total (incl. VAT)</div>
                <div className="text-3xl font-bold mt-1">{fmt(grandTotal)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => ExportService.exportExcel(project, rooms, items)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white text-angelina-700 rounded-lg text-sm font-medium hover:bg-angelina-50">
                  <Download className="w-4 h-4" /> Excel
                </button>
                <button onClick={() => ExportService.exportPDF(project, rooms, items)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 border border-white/30">
                  <FileText className="w-4 h-4" /> PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Material Takeoff */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button onClick={() => toggleSection('takeoff')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Material Takeoff</h3>
          </div>
          {expandedSections.has('takeoff') ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSections.has('takeoff') && (
          <div className="border-t border-gray-100 p-4">
            {rooms.map(room => {
              const rItems = items.filter(i => i.room_id === room.id);
              if (rItems.length === 0) return null;
              return (
                <div key={room.id} className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">{room.name} {room.area_sqft ? `(${room.area_sqft} sqft)` : ''}</h4>
                  <table className="w-full text-xs mb-3">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-1 px-2 text-gray-500">Description</th>
                        <th className="text-left py-1 px-2 text-gray-500">Specification</th>
                        <th className="text-right py-1 px-2 text-gray-500">Qty</th>
                        <th className="text-left py-1 px-2 text-gray-500">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rItems.map(item => (
                        <tr key={item.id} className="border-b border-gray-50">
                          <td className="py-1 px-2 text-gray-700">{item.description}</td>
                          <td className="py-1 px-2 text-gray-500">{item.specification || '-'}</td>
                          <td className="py-1 px-2 text-right text-gray-900">{item.quantity}</td>
                          <td className="py-1 px-2 text-gray-500">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
            {items.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No items in BOQ yet</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default QSEstimate;
