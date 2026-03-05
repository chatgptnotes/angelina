import React, { useState, useEffect, useCallback } from 'react';
import { fmtMoney } from '../utils/format';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Upload, Sparkles, Download, FileText, Trash2, Plus,
  ChevronDown, ChevronUp, Settings, Copy,
  Share2, Edit3, Save, X, RefreshCw,
  Calculator, Layers, ZoomIn, ExternalLink
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { BOQService } from '../services/boqService';
import { AIExtractor } from '../services/aiExtractor';
import { ExportService } from '../services/exportService';
import supabase from '../services/supabase';
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
  { value: 'hvac', label: 'HVAC', color: '#14B8A6' },
  { value: 'fire_fighting', label: 'Fire Fighting', color: '#DC2626' },
  { value: 'low_current', label: 'Low Current', color: '#6366F1' },
  { value: 'drainage', label: 'Drainage', color: '#0891B2' },
  { value: 'external_works', label: 'External Works', color: '#65A30D' },
  { value: 'preliminaries', label: 'Preliminaries', color: '#78716C' },
  { value: 'miscellaneous', label: 'Misc', color: '#6B7280' },
];

const UNITS = ['sqft','sqm','rft','nos','set','lot','kg','ltr','cum','bag'] as const;
const ROOM_TYPES = ['bedroom','living','kitchen','bathroom','dining','office','balcony','corridor','other'] as const;

const ProjectView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<BOQProject | null>(null);
  const [rooms, setRooms] = useState<BOQRoom[]>([]);
  const [items, setItems] = useState<BOQItem[]>([]);
  const [documents, setDocuments] = useState<BOQDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [activeTab, setActiveTab] = useState<'boq' | 'documents' | 'summary' | 'estimate' | 'drawings'>('boq');
  const [previewDoc, setPreviewDoc] = useState<BOQDocument | null>(null);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [totals, setTotals] = useState<any>(null);
  // Item editing
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editItemData, setEditItemData] = useState<Partial<BOQItem>>({});
  const [addingItemRoom, setAddingItemRoom] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<BOQItem>>({ category: 'miscellaneous', description: '', unit: 'nos', quantity: 1, rate: 0, specification: '' });
  // Room editing
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [editRoomData, setEditRoomData] = useState<Partial<BOQRoom>>({});
  const [addingRoom, setAddingRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', type: 'other' as string, area_sqft: '' });
  // Margin

  useEffect(() => { if (id) loadProjectData(); }, [id]);

  const loadProjectData = async () => {
    if (!id) return;
    try {
      const [proj, rms, itms, docs] = await Promise.all([
        BOQService.getProject(id), BOQService.getRooms(id),
        BOQService.getItems(id), BOQService.getDocuments(id),
      ]);
      setProject(proj);
      setRooms(rms);
      setItems(itms);
      setDocuments(docs);
      setExpandedRooms(new Set(rms.map(r => r.id)));
      const t = await BOQService.getProjectTotals(id);
      setTotals(t);
      // Load margin
    } catch (error) {
      toast.error('Failed to load project data');
    } finally { setLoading(false); }
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
      } catch { toast.error(`Upload failed: ${file.name}`); }
    }
  }, [id]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
  });

  // AI Extraction
  const handleExtract = async (doc: BOQDocument) => {
    if (!id || !project) return;
    setExtracting(true);
    try {
      toast.loading('AI is analyzing...', { id: 'extracting' });
      const result = await AIExtractor.extractFromDocument(doc.file_url, doc.file_type, {
        style: project.style, total_area: project.total_area_sqft, num_rooms: project.num_rooms,
      });
      for (const roomData of result.rooms) {
        const room = await BOQService.createRoom({ project_id: id, name: roomData.name, type: roomData.type as any, area_sqft: roomData.area_sqft, order: rooms.length + 1 });
        await BOQService.bulkCreateItems(roomData.items.map((item, idx) => ({
          project_id: id, room_id: room.id, category: item.category, description: item.description,
          specification: item.specification, unit: item.unit as any, quantity: item.quantity,
          rate: item.rate, source: 'ai_extracted' as const, confidence: item.confidence, order: idx + 1,
        })));
      }
      toast.success(`Extracted ${result.rooms.length} rooms!`, { id: 'extracting' });
      loadProjectData();
    } catch (error: any) {
      toast.error('Extraction failed: ' + (error.message || 'Unknown'), { id: 'extracting' });
    } finally { setExtracting(false); }
  };

  const handleDemoExtract = async () => {
    if (!id || !project) return;
    setExtracting(true);
    try {
      toast.loading('Generating demo...', { id: 'demo' });
      const result = AIExtractor.getDemoExtraction({ style: project.style });
      for (const roomData of result.rooms) {
        const room = await BOQService.createRoom({ project_id: id, name: roomData.name, type: roomData.type as any, area_sqft: roomData.area_sqft, order: rooms.length + 1 });
        await BOQService.bulkCreateItems(roomData.items.map((item, idx) => ({
          project_id: id, room_id: room.id, category: item.category, description: item.description,
          specification: item.specification, unit: item.unit as any, quantity: item.quantity,
          rate: item.rate, source: 'ai_extracted' as const, confidence: item.confidence, order: idx + 1,
        })));
      }
      toast.success('Demo BOQ generated!', { id: 'demo' });
      loadProjectData();
    } catch (error: any) { toast.error('Demo failed', { id: 'demo' }); }
    finally { setExtracting(false); }
  };

  // AI re-analyze for a single room
  const handleReanalyzeRoom = async (room: BOQRoom) => {
    if (!id || !project) return;
    if (documents.length === 0) { toast.error('No documents to analyze'); return; }
    setExtracting(true);
    try {
      toast.loading(`Re-analyzing ${room.name}...`, { id: 'reanalyze' });
      const roomItems = items.filter(i => i.room_id === room.id);
      for (const item of roomItems) await BOQService.deleteItem(item.id);
      const doc = documents[0];
      const result = await AIExtractor.extractFromDocument(doc.file_url, doc.file_type, {
        style: project.style, total_area: room.area_sqft, num_rooms: 1,
      });
      if (result.rooms.length > 0) {
        const roomData = result.rooms[0];
        await BOQService.bulkCreateItems(roomData.items.map((item, idx) => ({
          project_id: id, room_id: room.id, category: item.category, description: item.description,
          specification: item.specification, unit: item.unit as any, quantity: item.quantity,
          rate: item.rate, source: 'ai_extracted' as const, confidence: item.confidence, order: idx + 1,
        })));
      }
      toast.success(`${room.name} re-analyzed!`, { id: 'reanalyze' });
      loadProjectData();
    } catch (e: any) { toast.error('Re-analysis failed', { id: 'reanalyze' }); }
    finally { setExtracting(false); }
  };

  // Item CRUD
  const startEditItem = (item: BOQItem) => { setEditingItem(item.id); setEditItemData({ ...item }); };
  const saveEditItem = async () => {
    if (!editingItem) return;
    try {
      await BOQService.updateItem(editingItem, {
        description: editItemData.description, specification: editItemData.specification,
        quantity: editItemData.quantity, rate: editItemData.rate, category: editItemData.category,
        unit: editItemData.unit,
      });
      toast.success('Item updated');
      setEditingItem(null);
      loadProjectData();
    } catch { toast.error('Update failed'); }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return;
    try { await BOQService.deleteItem(itemId); toast.success('Item deleted'); loadProjectData(); }
    catch { toast.error('Delete failed'); }
  };

  const addItem = async () => {
    if (!addingItemRoom || !id || !newItem.description) { toast.error('Description required'); return; }
    try {
      await BOQService.createItem({
        project_id: id, room_id: addingItemRoom, ...newItem,
        source: 'manual', order: items.filter(i => i.room_id === addingItemRoom).length + 1,
      });
      toast.success('Item added');
      setAddingItemRoom(null);
      setNewItem({ category: 'miscellaneous', description: '', unit: 'nos', quantity: 1, rate: 0, specification: '' });
      loadProjectData();
    } catch { toast.error('Add failed'); }
  };

  // Room CRUD
  const startEditRoom = (room: BOQRoom) => { setEditingRoom(room.id); setEditRoomData({ ...room }); };
  const saveEditRoom = async () => {
    if (!editingRoom) return;
    try {
      await BOQService.updateRoom(editingRoom, { name: editRoomData.name, type: editRoomData.type, area_sqft: editRoomData.area_sqft });
      toast.success('Room updated');
      setEditingRoom(null);
      loadProjectData();
    } catch { toast.error('Update failed'); }
  };

  const deleteRoom = async (roomId: string) => {
    if (!confirm('Delete this room and all its items?')) return;
    try {
      const roomItems = items.filter(i => i.room_id === roomId);
      for (const item of roomItems) await BOQService.deleteItem(item.id);
      await BOQService.deleteRoom(roomId);
      toast.success('Room deleted');
      loadProjectData();
    } catch { toast.error('Delete failed'); }
  };

  const addRoom = async () => {
    if (!id || !newRoom.name) { toast.error('Room name required'); return; }
    try {
      await BOQService.createRoom({
        project_id: id, name: newRoom.name, type: newRoom.type as any,
        area_sqft: newRoom.area_sqft ? +newRoom.area_sqft : undefined, order: rooms.length + 1,
      });
      toast.success('Room added');
      setAddingRoom(false);
      setNewRoom({ name: '', type: 'other', area_sqft: '' });
      loadProjectData();
    } catch { toast.error('Add failed'); }
  };

  // Duplicate project
  const duplicateProject = async () => {
    if (!id || !project) return;
    try {
      toast.loading('Duplicating...', { id: 'dup' });
      const newProj = await BOQService.createProject({
        name: project.name + ' (Copy)', client: project.client, location: project.location,
        style: project.style, total_area_sqft: project.total_area_sqft, num_rooms: project.num_rooms,
        status: 'draft', currency: project.currency,
      });
      for (const room of rooms) {
        const newRm = await BOQService.createRoom({
          project_id: newProj.id, name: room.name, type: room.type,
          area_sqft: room.area_sqft, order: room.order,
        });
        const roomItems = items.filter(i => i.room_id === room.id);
        if (roomItems.length > 0) {
          await BOQService.bulkCreateItems(roomItems.map(item => ({
            project_id: newProj.id, room_id: newRm.id, category: item.category,
            description: item.description, specification: item.specification, unit: item.unit,
            quantity: item.quantity, rate: item.rate, source: 'manual' as const, order: item.order,
          })));
        }
      }
      toast.success('Project duplicated!', { id: 'dup' });
      navigate(`/app/project/${newProj.id}`);
    } catch { toast.error('Duplicate failed', { id: 'dup' }); }
  };

  const fmt = fmtMoney;

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-angelina-200 border-t-angelina-600 rounded-full" /></div>;
  if (!project) return <div className="text-center py-20 text-gray-500">Project not found</div>;

  const roomItemsFn = (roomId: string) => items.filter(i => i.room_id === roomId);
  const roomTotal = (roomId: string) => roomItemsFn(roomId).reduce((s, i) => s + (i.amount || 0), 0);
  const grandTotal = items.reduce((s, i) => s + (i.amount || 0), 0);

  const tabs = [
    { key: 'boq' as const, label: 'Bill of Quantities' },
    { key: 'documents' as const, label: 'Documents' },
    { key: 'summary' as const, label: 'Summary' },
    { key: 'estimate' as const, label: 'QS Estimate' },
    { key: 'drawings' as const, label: 'Drawing Analysis' },
    { key: 'bom' as const, label: 'Bill of Material' },
    { key: 'sabi' as const, label: 'SABI Estimate' },
  ];

  return (
    <div>
      {/* Project Header */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
            <p className="text-gray-500">{project.client} {project.location && `- ${project.location}`}</p>
            <div className="flex items-center gap-3 mt-3 text-sm flex-wrap">
              {project.style && <span className="px-2 py-1 bg-angelina-50 text-angelina-700 rounded-md">{project.style}</span>}
              {project.total_area_sqft && <span className="text-gray-500">{project.total_area_sqft} sqft</span>}
              <span className="text-gray-500">{rooms.length} rooms</span>
              <span className="text-gray-500">{items.length} items</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-3xl font-bold text-gray-900">{fmt(grandTotal)}</div>
            <div className="text-sm text-gray-500">Total Estimate</div>
            <div className="flex items-center gap-2">
              <Link to={`/app/project/${id}/qs-estimate`} className="p-2 text-angelina-500 hover:text-angelina-700 hover:bg-angelina-50 rounded-lg" title="QS Estimate">
                <Calculator className="w-4 h-4" />
              </Link>
              <Link to={`/app/project/${id}/drawing-analysis`} className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg" title="Drawing Analysis">
                <Layers className="w-4 h-4" />
              </Link>
              <Link to={`/app/project/${id}/settings`} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <Settings className="w-4 h-4" />
              </Link>
              <button onClick={duplicateProject} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" title="Duplicate">
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/share/${id}`); toast.success('Share link copied!'); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" title="Copy share link">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-white rounded-lg border border-gray-200 p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => {
            if (tab.key === 'estimate') { navigate(`/app/project/${id}/qs-estimate`); return; }
            if (tab.key === 'bom') { navigate(`/app/project/${id}/bom`); return; }
            if (tab.key === 'sabi') { navigate(`/app/project/${id}/sabi`); return; }
            if (tab.key === 'drawings') { navigate(`/app/project/${id}/drawing-analysis`); return; }
            setActiveTab(tab.key);
          }}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key ? 'bg-angelina-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}>
            {tab.label}
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
                <button onClick={handleDemoExtract} disabled={extracting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-angelina-600 text-white rounded-lg font-medium hover:bg-angelina-700 disabled:opacity-50">
                  <Sparkles className="w-4 h-4" />
                  {extracting ? 'Generating...' : 'Generate Demo BOQ'}
                </button>
              </div>
            </div>
          )}

          {/* Add Room button */}
          {!addingRoom && (
            <button onClick={() => setAddingRoom(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-angelina-600 hover:bg-angelina-50 rounded-lg border border-dashed border-angelina-300">
              <Plus className="w-4 h-4" /> Add Room
            </button>
          )}

          {addingRoom && (
            <div className="bg-angelina-50 border border-angelina-200 rounded-xl p-4">
              <h4 className="font-semibold text-sm mb-2">Add New Room</h4>
              <div className="flex items-center gap-3">
                <input value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})}
                  placeholder="Room name" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                <select value={newRoom.type} onChange={e => setNewRoom({...newRoom, type: e.target.value})}
                  className="px-3 py-2 border rounded-lg text-sm">
                  {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input type="number" value={newRoom.area_sqft} onChange={e => setNewRoom({...newRoom, area_sqft: e.target.value})}
                  placeholder="Area sqft" className="w-28 px-3 py-2 border rounded-lg text-sm" />
                <button onClick={addRoom} className="px-4 py-2 bg-angelina-600 text-white rounded-lg text-sm font-medium hover:bg-angelina-700">Add</button>
                <button onClick={() => setAddingRoom(false)} className="px-3 py-2 text-gray-500 hover:text-gray-700"><X className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {rooms.map(room => {
            const rItems = roomItemsFn(room.id);
            const rTotal = roomTotal(room.id);
            const isExpanded = expandedRooms.has(room.id);

            return (
              <div key={room.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Room Header */}
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => {
                    const next = new Set(expandedRooms);
                    isExpanded ? next.delete(room.id) : next.add(room.id);
                    setExpandedRooms(next);
                  }}>
                    <div className="w-10 h-10 bg-angelina-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-angelina-600" />
                    </div>
                    {editingRoom === room.id ? (
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <input value={editRoomData.name || ''} onChange={e => setEditRoomData({...editRoomData, name: e.target.value})}
                          className="px-2 py-1 border rounded text-sm font-semibold" />
                        <select value={editRoomData.type || ''} onChange={e => setEditRoomData({...editRoomData, type: e.target.value as any})}
                          className="px-2 py-1 border rounded text-xs">
                          {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input type="number" value={editRoomData.area_sqft || ''} onChange={e => setEditRoomData({...editRoomData, area_sqft: +e.target.value})}
                          placeholder="sqft" className="w-20 px-2 py-1 border rounded text-xs" />
                        <button onClick={saveEditRoom} className="text-green-600"><Save className="w-4 h-4" /></button>
                        <button onClick={() => setEditingRoom(null)} className="text-gray-400"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-semibold text-gray-900">{room.name}</h3>
                        <p className="text-xs text-gray-500">{rItems.length} items {room.area_sqft && `- ${room.area_sqft} sqft`}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-gray-900">{fmt(rTotal)}</span>
                    {editingRoom !== room.id && (
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); handleReanalyzeRoom(room); }} disabled={extracting}
                          className="p-1.5 text-angelina-500 hover:bg-angelina-50 rounded" title="AI Re-analyze">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); startEditRoom(room); }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded" title="Edit room">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteRoom(room.id); }}
                          className="p-1.5 text-red-400 hover:text-red-600 rounded" title="Delete room">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <button onClick={() => { const next = new Set(expandedRooms); isExpanded ? next.delete(room.id) : next.add(room.id); setExpandedRooms(next); }}>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>
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
                          <th className="px-4 py-2 w-16"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {rItems.map(item => {
                          const cat = CATEGORIES.find(c => c.value === item.category);
                          if (editingItem === item.id) {
                            return (
                              <tr key={item.id} className="bg-angelina-50">
                                <td className="px-4 py-2">
                                  <select value={editItemData.category || ''} onChange={e => setEditItemData({...editItemData, category: e.target.value as any})}
                                    className="w-full px-1 py-1 border rounded text-xs">
                                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                  </select>
                                </td>
                                <td className="px-4 py-2">
                                  <input value={editItemData.description || ''} onChange={e => setEditItemData({...editItemData, description: e.target.value})}
                                    className="w-full px-2 py-1 border rounded text-sm mb-1" />
                                  <input value={editItemData.specification || ''} onChange={e => setEditItemData({...editItemData, specification: e.target.value})}
                                    placeholder="Specification" className="w-full px-2 py-1 border rounded text-xs text-gray-500" />
                                </td>
                                <td className="px-4 py-2">
                                  <select value={editItemData.unit || ''} onChange={e => setEditItemData({...editItemData, unit: e.target.value as any})}
                                    className="w-full px-1 py-1 border rounded text-xs">
                                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                  </select>
                                </td>
                                <td className="px-4 py-2"><input type="number" value={editItemData.quantity || ''} onChange={e => setEditItemData({...editItemData, quantity: +e.target.value})}
                                  className="w-full px-2 py-1 border rounded text-xs text-right" /></td>
                                <td className="px-4 py-2"><input type="number" value={editItemData.rate || ''} onChange={e => setEditItemData({...editItemData, rate: +e.target.value})}
                                  className="w-full px-2 py-1 border rounded text-xs text-right" /></td>
                                <td className="px-4 py-2 text-right text-xs text-gray-500">{fmt((editItemData.quantity || 0) * (editItemData.rate || 0))}</td>                                <td className="px-4 py-2">
                                  <button onClick={saveEditItem} className="text-green-600 mr-1"><Save className="w-3.5 h-3.5 inline" /></button>
                                  <button onClick={() => setEditingItem(null)} className="text-gray-400"><X className="w-3.5 h-3.5 inline" /></button>
                                </td>
                              </tr>
                            );
                          }
                          return (
                            <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => startEditItem(item)}>
                              <td className="px-4 py-2">
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: cat?.color + '20', color: cat?.color }}>
                                  {cat?.label}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <div className="font-medium text-gray-900">{item.description}</div>
                                {item.specification && <div className="text-xs text-gray-400 mt-0.5">{item.specification}</div>}
                                {item.source === 'ai_extracted' && item.confidence && <div className="text-xs text-angelina-500 mt-0.5">AI - {item.confidence}%</div>}
                              </td>
                              <td className="px-4 py-2 text-gray-500">{item.unit}</td>
                              <td className="px-4 py-2 text-right text-gray-900">{item.quantity}</td>
                              <td className="px-4 py-2 text-right text-gray-900">{fmt(item.rate)}</td>
                              <td className="px-4 py-2 text-right font-medium text-gray-900">{fmt(item.amount)}</td>                              <td className="px-4 py-2" onClick={e => e.stopPropagation()}>
                                <button onClick={() => deleteItem(item.id)} className="text-red-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-semibold">
                          <td colSpan={5} className="px-4 py-2 text-right text-gray-700">Room Total</td>
                          <td className="px-4 py-2 text-right text-gray-900">{fmt(rTotal)}</td>                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                {/* Add Item */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-3">
                    {addingItemRoom === room.id ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <select value={newItem.category || ''} onChange={e => setNewItem({...newItem, category: e.target.value as any})}
                          className="px-2 py-1 border rounded text-xs">
                          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <input value={newItem.description || ''} onChange={e => setNewItem({...newItem, description: e.target.value})}
                          placeholder="Description" className="flex-1 min-w-[150px] px-2 py-1 border rounded text-xs" />
                        <input value={newItem.specification || ''} onChange={e => setNewItem({...newItem, specification: e.target.value})}
                          placeholder="Spec" className="w-32 px-2 py-1 border rounded text-xs" />
                        <select value={newItem.unit || ''} onChange={e => setNewItem({...newItem, unit: e.target.value as any})}
                          className="px-2 py-1 border rounded text-xs">
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <input type="number" value={newItem.quantity || ''} onChange={e => setNewItem({...newItem, quantity: +e.target.value})}
                          placeholder="Qty" className="w-16 px-2 py-1 border rounded text-xs" />
                        <input type="number" value={newItem.rate || ''} onChange={e => setNewItem({...newItem, rate: +e.target.value})}
                          placeholder="Rate" className="w-20 px-2 py-1 border rounded text-xs" />
                        <button onClick={addItem} className="px-3 py-1 bg-angelina-600 text-white rounded text-xs font-medium">Add</button>
                        <button onClick={() => setAddingItemRoom(null)} className="text-gray-400"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <button onClick={() => setAddingItemRoom(room.id)}
                        className="flex items-center gap-1 text-xs text-angelina-600 hover:text-angelina-700 font-medium">
                        <Plus className="w-3.5 h-3.5" /> Add Item
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Grand Total */}
          {items.length > 0 && (
            <div className="bg-gradient-to-r from-angelina-600 to-purple-600 rounded-xl p-5 text-white flex items-center justify-between">
              <div>
                <div className="text-sm text-angelina-200"> Grand Total
                  {' '}({items.length} items across {rooms.length} rooms)
                </div>
                <div className="text-3xl font-bold mt-1">{fmt(grandTotal)}</div>              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => ExportService.exportExcel(project, rooms, items)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-angelina-700 rounded-lg font-medium hover:bg-angelina-50">
                  <Download className="w-4 h-4" /> Excel
                </button>
                <button onClick={() => ExportService.exportPDF(project, rooms, items, 0)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 border border-white/30">
                  <FileText className="w-4 h-4" /> PDF
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div {...getRootProps()}
            className={`bg-white rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-angelina-500 bg-angelina-50' : 'border-gray-300 hover:border-angelina-400'
            }`}>
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="font-medium text-gray-700">{isDragActive ? 'Drop files here...' : 'Drag & drop design documents, or click to browse'}</p>
            <p className="text-sm text-gray-400 mt-1">PDF floor plans, 3D renders (JPG/PNG), material sheets</p>
          </div>

          {/* Document Grid */}
          {documents.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {documents.map(doc => {
                const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.filename);
                const isPdf = /\.pdf$/i.test(doc.filename) || ['2d_pdf','floor_plan','elevation'].includes(doc.file_type);
                return (
                  <div key={doc.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
                    {/* Preview Area */}
                    <div
                      className="relative bg-gray-50 cursor-pointer"
                      style={{ height: '160px' }}
                      onClick={() => setPreviewDoc(doc)}
                    >
                      {isImage ? (
                        <img
                          src={doc.file_url}
                          alt={doc.filename}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : isPdf ? (
                        <iframe
                          src={`${doc.file_url}#toolbar=0&navpanes=0&scrollbar=0`}
                          className="w-full h-full pointer-events-none"
                          title={doc.filename}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <ZoomIn className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    {/* Info + Actions */}
                    <div className="p-3">
                      <p className="text-xs font-medium text-gray-900 truncate mb-1" title={doc.filename}>{doc.filename}</p>
                      <p className="text-xs text-gray-400 mb-2">{(doc.file_size / 1024).toFixed(0)} KB</p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleExtract(doc)}
                          disabled={extracting}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-angelina-600 text-white rounded text-xs font-medium hover:bg-angelina-700 disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3" /> {extracting ? '...' : 'Extract BOQ'}
                        </button>
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-50"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {documents.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No documents uploaded yet.</div>
          )}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxWidth: '90vw', maxHeight: '90vh', width: '900px' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <div>
                <p className="font-semibold text-gray-900">{previewDoc.filename}</p>
                <p className="text-xs text-gray-400">{(previewDoc.file_size / 1024).toFixed(0)} KB</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  <ExternalLink className="w-4 h-4" /> Open
                </a>
                <button
                  onClick={() => handleExtract(previewDoc)}
                  disabled={extracting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-angelina-600 text-white rounded-lg hover:bg-angelina-700 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" /> {extracting ? 'Extracting...' : 'Extract BOQ'}
                </button>
                <button onClick={() => setPreviewDoc(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Preview Content */}
            <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center" style={{ minHeight: '500px' }}>
              {/\.(jpg|jpeg|png|webp|gif)$/i.test(previewDoc.filename) ? (
                <img
                  src={previewDoc.file_url}
                  alt={previewDoc.filename}
                  className="max-w-full max-h-full object-contain rounded"
                />
              ) : (/\.pdf$/i.test(previewDoc.filename) || ['2d_pdf','floor_plan','elevation'].includes(previewDoc.file_type)) ? (
                <iframe
                  src={previewDoc.file_url}
                  className="w-full rounded"
                  style={{ height: '70vh' }}
                  title={previewDoc.filename}
                />
              ) : (
                <div className="text-center text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                  <p>Preview not available</p>
                  <a href={previewDoc.file_url} target="_blank" rel="noopener noreferrer" className="text-angelina-600 underline mt-2 block">Download file</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === 'summary' && !totals && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No items in this project yet. Add BOQ items to see the summary.</p>
        </div>
      )}
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
              <div><span className="text-gray-500">AI-extracted:</span> <strong>{totals.aiExtracted}</strong></div>
              <div><span className="text-gray-500">Manual:</span> <strong>{totals.manualItems}</strong></div>
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
