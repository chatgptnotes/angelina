import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BOQService } from '../services/boqService';
import type { BOQProject } from '../types/boq';

const GlobalSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BOQProject[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setOpen(true); }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const projects = await BOQService.getProjects();
        const q = query.toLowerCase();
        setResults(projects.filter(p =>
          p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q)
        ));
      } catch { setResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 border border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-500 transition-colors">
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline text-xs bg-gray-100 px-1.5 py-0.5 rounded">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-start justify-center pt-[20vh]" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search projects, clients..." className="flex-1 py-4 text-sm outline-none" />
          <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        {results.length > 0 && (
          <div className="max-h-64 overflow-y-auto">
            {results.map(p => (
              <button key={p.id} onClick={() => { navigate(`/app/project/${p.id}`); setOpen(false); setQuery(''); }} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-left">
                <Folder className="w-5 h-5 text-angelina-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500 truncate">{p.client} {p.location && `· ${p.location}`}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {query && results.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-400">No results found</div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearch;
