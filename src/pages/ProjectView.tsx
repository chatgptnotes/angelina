import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Upload, Sparkles, Download, FileText, Trash2, Plus,
  ChevronDown, ChevronUp, DollarSign, BarChart3, Eye,
  Edit3, Save, Check, X
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { BOQService } from '../services/boqService';
import { AIExtractor } from '../services/aiExtractor';
import type { BOQProject, BOQRoom, BOQItem, BOQDocument, BOQCategory } from '../types/boq';

const CATEGORIES: { value: BOQCategory; label: string; color: string }[] = [
  { value: 'civil', label: 'Civil', color: '#6B7280' },
  { value: 'flooring', label: 'Flooring', color: '#D97706' },
  { value: 'wall_finish', label: 'Wall Finish', color: '#7C3AED' },
  { value: 'ceiling', label: 'Ceiling', color: '#2563EB' },
  { value: 'furniture', label: 'Furniture', color: '#059669' },
  { value: 'fixtures', label: 'Fixtures', color: '#DB2777' },
  { value: 'electrical', label: 'Electrical', color: '#F59E0B' },
  { value: 'plumbing', label: 'Plumbing', color: '#0EA5E9' },
  { value: 'doors_windows', label: 'Doors & Windows', color: '#8B5CF6' },
  { value: 'kitchen', label: 'Kitchen', color: '#EF4444' },
  { value: 'decorative', label: 'Decorative', color: '#EC4899' },
  { value: 'miscellaneous', label: 'Misc', color: '#6B7280' },
];

const ProjectView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<BOQProject | null>(null);
  const [rooms, setRooms] = useState<BOQRoom[]>([]);
  const [items, setItems] = useState<BOQItem[]>([]);
  const [documents, setDocuments] = useState<BOQDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [activeTab, setActiveTab] = useState<'boq' | 'documents' | 'summary'>('boq');
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [totals, setTotals] = useState<any>(null);

  useEffect(() => {
    if (id) loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    if (!id) return;
    try {
      const [proj, rms, itms, docs] = await Promise.all([
        BOQService.getProject(id),
        BOQService.getRooms(id),
        BOQService.getItems(id),
        BOQService.getDocuments(id),
      ]);
      setProject(proj);
      setRooms(rms);
      setItems(itms);
      setDocuments(docs);
      // Expand all rooms by default
      setExpandedRooms(new Set(rms.map(r => r.id)));
      // Load totals
      const t = await BOQService.getProjectTotals(id);
      setTotals(t);
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  // Document upload
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!id) return;
    for (const file of acceptedFiles) {
      try {
        const fileType = file.type.includes('pdf') ? '2d_pdf' : '3d_render';
        const doc = await BOQService.uploadDocument(id, file, fileType as any);
        setDocuments(prev => [doc, ...prev]);
        toast.success(`Uploaded: ${file.name}`);
      } catch (error: any) {
        toast.error(`Upload failed: ${file.name}`);
      }
    }
  }, [id]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
    },
  });

  // AI Extraction
  const handleExtract = async (doc: BOQDocument) => {
    if (!id || !project) return;
    setExtracting(true);
    try {
      toast.loading('AI is analyzing the document...', { id: 'extracting' });
      
      const result = await AIExtractor.extractFromDocument(
        doc.file_url,
        doc.file_type,
        {
          style: project.style,
          total_area: project.total_area_sqft,
          num_rooms: project.num_rooms,
        }
      );

      // Create rooms and items from extraction
      for (const roomData of result.rooms) {
        const room = await BOQService.createRoom({
          project_id: id,
          name: roomData.name,
          type: roomData.type as any,
          area_sqft: roomData.area_sqft,
          order: rooms.length + 1,
        });

        const itemsToCreate = roomData.items.map((item, idx) => ({
          project_id: id,
          room_id: room.id,
          category: item.category,
          description: item.description,
          specification: item.specification,
          unit: item.unit as any,
          quantity: item.quantity,
          rate: item.rate,
          source: 'ai_extracted' as const,
          confidence: item.confidence,
          order: idx + 1,
        }));

        await BOQService.bulkCreateItems(itemsToCreate);
      }

      toast.success(`Extracted ${result.rooms.length} rooms with BOQ items!`, { id: 'extracting' });
      loadProjectData(); // Refresh
    } catch (error: any) {
      console.error('Extraction error:', error);
      toast.error('Extraction failed: ' + (error.message || 'Unknown error'), { id: 'extracting' });
    } finally {
      setExtracting(false);
    }
  };

  // Demo extraction (no document needed)
  const handleDemoExtract = async () => {
    if (!id || !project) return;
    setExtracting(true);
    try {
      toast.loading('Running demo extraction...', { id: 'demo' });
      const result = AIExtractor.getDemoExtraction({ style: project.style });

      for (const roomData of result.rooms) {
        const room = await BOQService.createRoom({
          project_id: id,
          name: roomData.name,
          type: roomData.type as any,
          area_sqft: roomData.area_sqft,
          order: rooms.length + 1,
        });

        const itemsToCreate = roomData.items.map((item, idx) => ({
          project_id: id,
          room_id: room.id,
          category: item.category,
          description: item.description,
          specification: item.specification,
          unit: item.unit as any,
          quantity: item.quantity,
          rate: item.rate,
          source: 'ai_extracted' as const,
          confidence: item.confidence,
          order: idx + 1,
        }));

        await BOQService.bulkCreateItems(itemsToCreate);
      }

      toast.success('Demo BOQ generated!', { id: 'demo' });
      loadProjectData();
    } catch (error: any) {
      toast.error('Demo failed: ' + error.message, { id: 'demo' });
    } finally {
      setExtracting(false);
    }
  };

  // Format currency
  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-angelina-200 border-t-angelina-600 rounded-full" />
      </div>
    );
  }

  if (!project) {
    return <div className="text-center py-20 text-gray-500">Project not found</div>;
  }

  const roomItems = (roomId: string) => items.filter(i => i.room_id === roomId);
  const roomTotal = (roomId: string) => roomItems(roomId).reduce((s, i) => s + (i.amount || 0), 0);
  const grandTotal = items.reduce((s, i) => s + (i.amount || 0), 0);

  return (
    <div>
      {/* Project Header */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
            <p className="text-gray-500">{project.client} {project.location && `• ${project.location}`}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              {project.style && <span className="px-2 py-1 bg-angelina-50 text-angelina-700 rounded-md">{project.style}</span>}
              {project.total_area_sqft && <span className="text-gray-500">{project.total_area_sqft} sqft</span>}
              <span className="text-gray-500">{rooms.length} rooms</span>
              <span className="text-gray-500">{items.length} items</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{fmt(grandTotal)}</div>
            <div className="text-sm text-gray-500">Total Estimate</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-white rounded-lg border border-gray-200 p-1">
        {(['boq', 'documents', 'summary'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab ? 'bg-angelina-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab === 'boq' ? 'Bill of Quantities' : tab}
          </button>
        ))}
      </div>

      {/* BOQ Tab */}
      {activeTab === 'boq' && (
        <div className="space-y-4">
          {rooms.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <Sparkles className="w-12 h-12 text-angelina-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No BOQ items yet</h3>
              <p className="text-gray-500 mb-4">Upload design documents for AI extraction, or generate a demo BOQ</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleDemoExtract}
                  disabled={extracting}
                  className="px-5 py-2.5 bg-angelina-600 text-white rounded-lg font-medium hover:bg-angelina-700 disabled:opacity-50"
                >
                  {extracting ? 'Generating...' : '✨ Generate Demo BOQ'}
                </button>
              </div>
            </div>
          )}

          {rooms.map(room => {
            const rItems = roomItems(room.id);
            const rTotal = roomTotal(room.id);
            const isExpanded = expandedRooms.has(room.id);

            return (
              <div key={room.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Room Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    const next = new Set(expandedRooms);
                    isExpanded ? next.delete(room.id) : next.add(room.id);
                    setExpandedRooms(next);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-angelina-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-angelina-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{room.name}</h3>
                      <p className="text-xs text-gray-500">
                        {rItems.length} items {room.area_sqft && `• ${room.area_sqft} sqft`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-gray-900">{fmt(rTotal)}</span>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {/* Items Table */}
                {isExpanded && rItems.length > 0 && (
                  <div className="border-t border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 w-24">Category</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 w-20">Unit</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 w-20">Qty</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 w-24">Rate</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 w-28">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {rItems.map(item => {
                          const cat = CATEGORIES.find(c => c.value === item.category);
                          return (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2">
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                                  style={{ backgroundColor: cat?.color + '20', color: cat?.color }}
                                >
                                  {cat?.label}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <div className="font-medium text-gray-900">{item.description}</div>
                                {item.specification && (
                                  <div className="text-xs text-gray-400 mt-0.5">{item.specification}</div>
                                )}
                                {item.source === 'ai_extracted' && item.confidence && (
                                  <div className="text-xs text-angelina-500 mt-0.5">AI • {item.confidence}% confidence</div>
                                )}
                              </td>
                              <td className="px-4 py-2 text-gray-500">{item.unit}</td>
                              <td className="px-4 py-2 text-right text-gray-900">{item.quantity}</td>
                              <td className="px-4 py-2 text-right text-gray-900">{fmt(item.rate)}</td>
                              <td className="px-4 py-2 text-right font-medium text-gray-900">{fmt(item.amount)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-semibold">
                          <td colSpan={5} className="px-4 py-2 text-right text-gray-700">Room Total</td>
                          <td className="px-4 py-2 text-right text-gray-900">{fmt(rTotal)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            );
          })}

          {/* Grand Total */}
          {items.length > 0 && (
            <div className="bg-gradient-to-r from-angelina-600 to-purple-600 rounded-xl p-5 text-white flex items-center justify-between">
              <div>
                <div className="text-sm text-angelina-200">Grand Total ({items.length} items across {rooms.length} rooms)</div>
                <div className="text-3xl font-bold mt-1">{fmt(grandTotal)}</div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-angelina-700 rounded-lg font-medium hover:bg-angelina-50">
                <Download className="w-4 h-4" />
                Export Excel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`bg-white rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-angelina-500 bg-angelina-50' : 'border-gray-300 hover:border-angelina-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="font-medium text-gray-700">
              {isDragActive ? 'Drop files here...' : 'Drag & drop design documents, or click to browse'}
            </p>
            <p className="text-sm text-gray-400 mt-1">PDF floor plans, 3D renders (JPG/PNG), material sheets</p>
          </div>

          {documents.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">{doc.filename}</div>
                  <div className="text-xs text-gray-500">
                    {doc.file_type} • {(doc.file_size / 1024).toFixed(0)} KB
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExtract(doc)}
                  disabled={extracting}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-angelina-600 text-white rounded-lg text-sm font-medium hover:bg-angelina-700 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {extracting ? 'Extracting...' : 'Extract BOQ'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === 'summary' && totals && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">By Category</h3>
            <div className="space-y-2">
              {Object.entries(totals.byCategory).map(([cat, data]: [string, any]) => {
                const catInfo = CATEGORIES.find(c => c.value === cat);
                const pct = totals.totalAmount > 0 ? (data.amount / totals.totalAmount * 100) : 0;
                return (
                  <div key={cat} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: catInfo?.color }} />
                      <span className="text-gray-700">{catInfo?.label || cat}</span>
                      <span className="text-gray-400">({data.count})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: catInfo?.color }} />
                      </div>
                      <span className="font-medium text-gray-900 w-24 text-right">{fmt(data.amount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">By Room</h3>
            <div className="space-y-2">
              {Object.entries(totals.byRoom).map(([roomId, data]: [string, any]) => {
                const pct = totals.totalAmount > 0 ? (data.amount / totals.totalAmount * 100) : 0;
                return (
                  <div key={roomId} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{data.name} ({data.count})</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-angelina-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-medium text-gray-900 w-24 text-right">{fmt(data.amount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-2">Extraction Stats</h3>
            <div className="flex items-center gap-8 text-sm">
              <div><span className="text-gray-500">AI-extracted items:</span> <strong>{totals.aiExtracted}</strong></div>
              <div><span className="text-gray-500">Manual items:</span> <strong>{totals.manualItems}</strong></div>
              <div><span className="text-gray-500">Total items:</span> <strong>{totals.totalItems}</strong></div>
              <div><span className="text-gray-500">Rooms:</span> <strong>{totals.totalRooms}</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectView;
