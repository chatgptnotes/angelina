import React, { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Upload, ZoomIn, ZoomOut, RotateCw,
  FileText, Layers, Maximize2, Image, Ruler
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import supabase from '../services/supabase';

interface DrawingFile {
  id: string;
  file: File;
  preview: string;
  type: 'floor_plan' | 'elevation' | 'section' | 'mep_layout' | 'other';
  name: string;
  analyzing: boolean;
  results: AnalysisResult | null;
}

interface AnalysisResult {
  areas: { name: string; area_sqft: number; type: string }[];
  measurements: { description: string; value: string; unit: string }[];
  notes: string[];
}

const DRAWING_TYPES = [
  { value: 'floor_plan', label: 'Floor Plan', icon: Layers },
  { value: 'elevation', label: 'Elevation', icon: Maximize2 },
  { value: 'section', label: 'Section', icon: FileText },
  { value: 'mep_layout', label: 'MEP Layout', icon: Ruler },
  { value: 'other', label: 'Other', icon: Image },
] as const;

const DrawingAnalysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [drawings, setDrawings] = useState<DrawingFile[]>([]);
  const [selectedDrawing, setSelectedDrawing] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadToast = toast.loading(`Uploading ${acceptedFiles.length} drawing(s)...`);
    const newDrawings: DrawingFile[] = [];

    for (const file of acceptedFiles) {
      const drawingId = crypto.randomUUID();
      const localPreview = URL.createObjectURL(file);
      const drawingType = file.type.includes('pdf') ? 'floor_plan' as const : 'other' as const;

      // Add locally first for instant feedback
      const localDrawing: DrawingFile = {
        id: drawingId,
        file,
        preview: localPreview,
        type: drawingType,
        name: file.name,
        analyzing: false,
        results: null,
      };
      newDrawings.push(localDrawing);

      try {
        // Upload to Supabase Storage
        const filePath = `${id}/drawings/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('boq-documents')
          .upload(filePath, file, { contentType: file.type });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('boq-documents')
          .getPublicUrl(filePath);

        // Save record to boq_documents table
        await supabase.from('boq_documents').insert({
          project_id: id,
          filename: file.name,
          file_url: urlData.publicUrl,
          file_type: drawingType,
          file_size: file.size,
          processing_status: 'pending',
        });

        // Update preview to use Supabase URL
        localDrawing.preview = urlData.publicUrl;
      } catch (err) {
        console.error('Upload failed for', file.name, err);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setDrawings(prev => [...prev, ...newDrawings]);
    if (newDrawings.length > 0 && !selectedDrawing) {
      setSelectedDrawing(newDrawings[0].id);
    }
    toast.dismiss(uploadToast);
    toast.success(`${acceptedFiles.length} drawing(s) uploaded and saved`);
  }, [id, selectedDrawing]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.dwg'],
    },
  });

  const analyzeDrawing = async (drawingId: string) => {
    setDrawings(prev => prev.map(d =>
      d.id === drawingId ? { ...d, analyzing: true } : d
    ));

    // Simulate analysis (in production, this would call the AI API)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const demoResults: AnalysisResult = {
      areas: [
        { name: 'Reception', area_sqft: 450, type: 'living' },
        { name: 'Open Office', area_sqft: 1200, type: 'office' },
        { name: 'Meeting Room 1', area_sqft: 200, type: 'office' },
        { name: 'Meeting Room 2', area_sqft: 180, type: 'office' },
        { name: 'Pantry', area_sqft: 120, type: 'kitchen' },
        { name: 'Server Room', area_sqft: 80, type: 'other' },
        { name: 'Corridor', area_sqft: 250, type: 'corridor' },
      ],
      measurements: [
        { description: 'Total floor area', value: '2,480', unit: 'sqft' },
        { description: 'Perimeter walls', value: '320', unit: 'rft' },
        { description: 'Partition walls', value: '180', unit: 'rft' },
        { description: 'Door openings', value: '12', unit: 'nos' },
        { description: 'Window openings', value: '8', unit: 'nos' },
        { description: 'Ceiling height', value: '3.2', unit: 'm' },
      ],
      notes: [
        'Drawing scale: 1:100',
        'North orientation detected from compass indicator',
        'MEP services zones identified near core area',
        'Fire escape routes comply with Dubai Civil Defense requirements',
        'Accessibility provisions per UAE accessibility code',
      ],
    };

    setDrawings(prev => prev.map(d =>
      d.id === drawingId ? { ...d, analyzing: false, results: demoResults } : d
    ));
    toast.success('Drawing analysis complete');
  };

  const setDrawingType = (drawingId: string, type: DrawingFile['type']) => {
    setDrawings(prev => prev.map(d =>
      d.id === drawingId ? { ...d, type } : d
    ));
  };

  const removeDrawing = (drawingId: string) => {
    setDrawings(prev => prev.filter(d => d.id !== drawingId));
    if (selectedDrawing === drawingId) {
      setSelectedDrawing(drawings.find(d => d.id !== drawingId)?.id || null);
    }
  };

  const selected = drawings.find(d => d.id === selectedDrawing);

  return (
    <div>
      <Link to={`/app/project/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Project
      </Link>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Layers className="w-6 h-6 text-angelina-600" />
          Cre8 — Drawing Analysis
        </h2>
        <p className="text-gray-500 text-sm mt-1">Upload and analyze construction drawings</p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left sidebar - Drawing list */}
        <div className="col-span-3 space-y-3">
          <div {...getRootProps()}
            className={`rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-angelina-500 bg-angelina-50' : 'border-gray-300 hover:border-angelina-400'
            }`}>
            <input {...getInputProps()} />
            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-600 font-medium">Upload Drawings</p>
            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG</p>
          </div>

          {drawings.map(d => (
            <div key={d.id}
              onClick={() => setSelectedDrawing(d.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedDrawing === d.id ? 'border-angelina-500 bg-angelina-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
              <div className="flex items-center gap-2 mb-1">
                <Image className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm font-medium text-gray-700 truncate">{d.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <select value={d.type} onChange={e => setDrawingType(d.id, e.target.value as DrawingFile['type'])}
                  onClick={e => e.stopPropagation()}
                  className="text-xs px-1.5 py-0.5 border rounded bg-white text-gray-600">
                  {DRAWING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {d.results && <span className="text-xs text-green-600 font-medium">Analyzed</span>}
              </div>
            </div>
          ))}

          {drawings.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-xs">
              No drawings uploaded yet
            </div>
          )}
        </div>

        {/* Center - Drawing preview */}
        <div className="col-span-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {selected ? (
            <div>
              {/* Toolbar */}
              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">{selected.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="p-1.5 hover:bg-gray-100 rounded">
                    <ZoomOut className="w-4 h-4 text-gray-500" />
                  </button>
                  <span className="text-xs text-gray-500 w-10 text-center">{zoom}%</span>
                  <button onClick={() => setZoom(z => Math.min(300, z + 25))} className="p-1.5 hover:bg-gray-100 rounded">
                    <ZoomIn className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => setZoom(100)} className="p-1.5 hover:bg-gray-100 rounded" title="Reset zoom">
                    <RotateCw className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="h-[500px] overflow-auto bg-gray-100 flex items-center justify-center p-4">
                {selected.file.type.includes('pdf') ? (
                  <iframe
                    src={selected.preview}
                    title={selected.name}
                    className="w-full rounded"
                    style={{ height: '480px', border: 'none' }}
                  />
                ) : (
                  <img src={selected.preview} alt={selected.name}
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
                    className="max-w-full max-h-full object-contain transition-transform" />
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between p-3 border-t border-gray-100">
                <button onClick={() => removeDrawing(selected.id)}
                  className="text-xs text-red-500 hover:text-red-700">Remove</button>
                <button onClick={() => analyzeDrawing(selected.id)}
                  disabled={selected.analyzing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-angelina-600 text-white rounded-lg text-sm font-medium hover:bg-angelina-700 disabled:opacity-50">
                  {selected.analyzing ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Ruler className="w-4 h-4" />
                  )}
                  {selected.analyzing ? 'Analyzing...' : 'Analyze Drawing'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-gray-400">
              <Layers className="w-12 h-12 mb-3" />
              <p className="text-sm">Select a drawing to preview</p>
              <p className="text-xs mt-1">or upload new drawings</p>
            </div>
          )}
        </div>

        {/* Right sidebar - Analysis results */}
        <div className="col-span-3 space-y-3">
          {selected?.results ? (
            <>
              {/* Areas */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-angelina-600" /> Areas Identified
                </h4>
                <div className="space-y-1.5">
                  {selected.results.areas.map((area, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700">{area.name}</span>
                      <span className="font-medium text-gray-900">{area.area_sqft} sqft</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Measurements */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-blue-600" /> Measurements
                </h4>
                <div className="space-y-1.5">
                  {selected.results.measurements.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700">{m.description}</span>
                      <span className="font-medium text-gray-900">{m.value} {m.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Analysis Notes</h4>
                <ul className="space-y-1.5">
                  {selected.results.notes.map((note, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="text-angelina-500 mt-0.5 shrink-0">-</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <Ruler className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">
                {selected ? 'Click "Analyze Drawing" to extract measurements' : 'Select a drawing to see analysis'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrawingAnalysis;
