import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Heart, ShoppingCart, Star, ChevronDown, X, ExternalLink } from 'lucide-react';

interface Material {
  id: string;
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  unit: string;
  priceRange: { low: number; mid: number; high: number };
  image: string;
  finish: string;
  rating: number;
  modelNo: string;
  tags: string[];
}

const MATERIALS: Material[] = [
  // Tiles
  { id: 't1', name: 'Glossy Vitrified Tile 600x600', brand: 'Kajaria', category: 'flooring', subCategory: 'Vitrified Tiles', unit: 'sqft', priceRange: { low: 35, mid: 55, high: 85 }, image: '🏗️', finish: 'Glossy', rating: 4.5, modelNo: 'KAJ-VT-600G', tags: ['glossy', 'vitrified', 'living room'] },
  { id: 't2', name: 'Matt Porcelain Tile 800x800', brand: 'Somany', category: 'flooring', subCategory: 'Porcelain Tiles', unit: 'sqft', priceRange: { low: 45, mid: 75, high: 120 }, image: '🪨', finish: 'Matt', rating: 4.3, modelNo: 'SOM-PT-800M', tags: ['matt', 'porcelain', 'bedroom'] },
  { id: 't3', name: 'Italian Marble Statuario', brand: 'Imported', category: 'flooring', subCategory: 'Marble', unit: 'sqft', priceRange: { low: 150, mid: 350, high: 800 }, image: '💎', finish: 'Polished', rating: 4.9, modelNo: 'IMP-MS-001', tags: ['marble', 'luxury', 'italian'] },
  { id: 't4', name: 'Wooden Laminate 8mm', brand: 'Pergo', category: 'flooring', subCategory: 'Laminate', unit: 'sqft', priceRange: { low: 65, mid: 110, high: 180 }, image: '🪵', finish: 'Wood Grain', rating: 4.2, modelNo: 'PER-LAM-8WG', tags: ['wood', 'laminate', 'warm'] },
  // Paints
  { id: 'p1', name: 'Premium Emulsion (Interior)', brand: 'Asian Paints', category: 'wall_finish', subCategory: 'Paint', unit: 'sqft', priceRange: { low: 8, mid: 14, high: 22 }, image: '🎨', finish: 'Smooth', rating: 4.6, modelNo: 'AP-ROY-LUX', tags: ['paint', 'interior', 'premium'] },
  { id: 'p2', name: 'Texture Paint Rustic', brand: 'Asian Paints', category: 'wall_finish', subCategory: 'Texture', unit: 'sqft', priceRange: { low: 25, mid: 45, high: 80 }, image: '🖌️', finish: 'Textured', rating: 4.4, modelNo: 'AP-TEX-RST', tags: ['texture', 'rustic', 'accent'] },
  { id: 'p3', name: 'PU Paint (Wood Finish)', brand: 'Berger', category: 'wall_finish', subCategory: 'PU Paint', unit: 'sqft', priceRange: { low: 30, mid: 55, high: 90 }, image: '✨', finish: 'High Gloss', rating: 4.1, modelNo: 'BER-PU-HG', tags: ['PU', 'wood', 'furniture'] },
  // Fixtures
  { id: 'f1', name: 'Wall-Mounted Basin', brand: 'Hindware', category: 'fixtures', subCategory: 'Sanitary', unit: 'nos', priceRange: { low: 2500, mid: 5500, high: 12000 }, image: '🚿', finish: 'Ceramic White', rating: 4.3, modelNo: 'HW-WMB-001', tags: ['basin', 'wall-mount', 'bathroom'] },
  { id: 'f2', name: 'Rain Shower Set', brand: 'Kohler', category: 'fixtures', subCategory: 'Shower', unit: 'set', priceRange: { low: 8000, mid: 18000, high: 45000 }, image: '🚿', finish: 'Chrome', rating: 4.7, modelNo: 'KOH-RS-200', tags: ['shower', 'rain', 'premium'] },
  { id: 'f3', name: 'Single Lever Basin Mixer', brand: 'Jaquar', category: 'fixtures', subCategory: 'Faucet', unit: 'nos', priceRange: { low: 3000, mid: 6000, high: 15000 }, image: '🔧', finish: 'Chrome', rating: 4.5, modelNo: 'JAQ-SLB-100', tags: ['faucet', 'mixer', 'basin'] },
  // Hardware
  { id: 'h1', name: 'Soft-Close Hinge (pair)', brand: 'Hettich', category: 'furniture', subCategory: 'Hardware', unit: 'nos', priceRange: { low: 120, mid: 250, high: 500 }, image: '⚙️', finish: 'Nickel', rating: 4.8, modelNo: 'HET-SC-HNG', tags: ['hinge', 'soft-close', 'cabinet'] },
  { id: 'h2', name: 'Telescopic Channel 18"', brand: 'Hettich', category: 'furniture', subCategory: 'Hardware', unit: 'nos', priceRange: { low: 200, mid: 450, high: 800 }, image: '🔩', finish: 'Zinc', rating: 4.6, modelNo: 'HET-TC-18', tags: ['drawer', 'channel', 'telescopic'] },
  // Kitchen
  { id: 'k1', name: 'Quartz Countertop', brand: 'Kalinga Stone', category: 'kitchen', subCategory: 'Countertop', unit: 'sqft', priceRange: { low: 250, mid: 450, high: 900 }, image: '🪨', finish: 'Polished', rating: 4.5, modelNo: 'KS-QZ-001', tags: ['quartz', 'countertop', 'kitchen'] },
  { id: 'k2', name: 'Auto-Lift Chimney 90cm', brand: 'Faber', category: 'kitchen', subCategory: 'Appliance', unit: 'nos', priceRange: { low: 12000, mid: 25000, high: 55000 }, image: '🌬️', finish: 'Steel/Glass', rating: 4.4, modelNo: 'FAB-ALF-90', tags: ['chimney', 'auto-lift', 'kitchen'] },
  // Electrical
  { id: 'e1', name: 'Modular Switch Plate 6M', brand: 'Schneider', category: 'electrical', subCategory: 'Switches', unit: 'nos', priceRange: { low: 250, mid: 600, high: 1200 }, image: '💡', finish: 'White/Grey', rating: 4.4, modelNo: 'SCH-MS-6M', tags: ['switch', 'modular', '6M'] },
  { id: 'e2', name: 'LED Panel Light 18W', brand: 'Philips', category: 'electrical', subCategory: 'Lighting', unit: 'nos', priceRange: { low: 350, mid: 650, high: 1200 }, image: '💡', finish: 'Warm/Cool White', rating: 4.6, modelNo: 'PHI-LP-18W', tags: ['LED', 'panel', 'ceiling'] },
  // Ceiling
  { id: 'c1', name: 'Gypsum False Ceiling', brand: 'Gyproc', category: 'ceiling', subCategory: 'Gypsum', unit: 'sqft', priceRange: { low: 55, mid: 85, high: 130 }, image: '🏠', finish: 'Smooth POP', rating: 4.3, modelNo: 'GYP-FC-STD', tags: ['gypsum', 'false ceiling', 'flat'] },
];

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'wall_finish', label: 'Wall Finish' },
  { value: 'ceiling', label: 'Ceiling' },
  { value: 'furniture', label: 'Furniture & Hardware' },
  { value: 'fixtures', label: 'Fixtures' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'electrical', label: 'Electrical' },
];

const TIERS = ['Budget', 'Standard', 'Premium'] as const;

const MaterialLibrary: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [tier, setTier] = useState<'' | 'Budget' | 'Standard' | 'Premium'>('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const filtered = MATERIALS.filter(m => {
    if (category && m.category !== category) return false;
    if (search) {
      const s = search.toLowerCase();
      return m.name.toLowerCase().includes(s) || m.brand.toLowerCase().includes(s) || m.tags.some(t => t.includes(s));
    }
    return true;
  });

  const toggleFav = (id: string) => {
    setFavorites(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Visual Material Library</h2>
        <p className="text-gray-500 text-sm">Browse materials with live pricing • {MATERIALS.length} materials from top Indian brands</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search materials, brands..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-angelina-500" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          {['', ...TIERS].map(t => (
            <button key={t} onClick={() => setTier(t as any)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${tier === t ? 'bg-angelina-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {t || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filtered.map(m => (
            <motion.div key={m.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => setSelectedMaterial(m)}>
              <div className="h-32 bg-gradient-to-br from-angelina-50 to-purple-50 flex items-center justify-center text-5xl relative">
                {m.image}
                <button onClick={e => { e.stopPropagation(); toggleFav(m.id); }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors">
                  <Heart className={`w-4 h-4 ${favorites.has(m.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-white/90 text-xs font-medium text-angelina-700">
                  {m.brand}
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{m.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{m.subCategory} • {m.finish} • {m.modelNo}</p>
                <div className="flex items-center gap-1 mb-2">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= m.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />)}
                  <span className="text-xs text-gray-400 ml-1">{m.rating}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div className="bg-green-50 rounded px-1 py-0.5">
                    <div className="text-[10px] text-green-600">Budget</div>
                    <div className="text-xs font-bold text-green-700">{fmt(m.priceRange.low)}</div>
                  </div>
                  <div className="bg-blue-50 rounded px-1 py-0.5">
                    <div className="text-[10px] text-blue-600">Standard</div>
                    <div className="text-xs font-bold text-blue-700">{fmt(m.priceRange.mid)}</div>
                  </div>
                  <div className="bg-purple-50 rounded px-1 py-0.5">
                    <div className="text-[10px] text-purple-600">Premium</div>
                    <div className="text-xs font-bold text-purple-700">{fmt(m.priceRange.high)}</div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 text-right mt-1">per {m.unit}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && <div className="text-center py-12 text-gray-400">No materials found</div>}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedMaterial && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMaterial(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedMaterial.name}</h3>
                  <p className="text-gray-500">{selectedMaterial.brand} • {selectedMaterial.modelNo}</p>
                </div>
                <button onClick={() => setSelectedMaterial(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="h-40 bg-gradient-to-br from-angelina-50 to-purple-50 rounded-xl flex items-center justify-center text-7xl mb-4">
                {selectedMaterial.image}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div><span className="text-gray-500">Category:</span> <strong>{selectedMaterial.subCategory}</strong></div>
                <div><span className="text-gray-500">Finish:</span> <strong>{selectedMaterial.finish}</strong></div>
                <div><span className="text-gray-500">Unit:</span> <strong>{selectedMaterial.unit}</strong></div>
                <div><span className="text-gray-500">Rating:</span> <strong>{selectedMaterial.rating}/5</strong></div>
              </div>
              <h4 className="font-semibold text-sm mb-2">Price Tiers (per {selectedMaterial.unit})</h4>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {(['low', 'mid', 'high'] as const).map((t, i) => (
                  <div key={t} className={`text-center p-3 rounded-xl ${i === 0 ? 'bg-green-50 border border-green-200' : i === 1 ? 'bg-blue-50 border border-blue-200' : 'bg-purple-50 border border-purple-200'}`}>
                    <div className="text-xs text-gray-500">{TIERS[i]}</div>
                    <div className="text-lg font-bold">{fmt(selectedMaterial.priceRange[t])}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {selectedMaterial.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
                ))}
              </div>
              <button className="w-full py-2.5 bg-angelina-600 text-white rounded-xl font-medium hover:bg-angelina-700 transition-colors flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Add to BOQ
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MaterialLibrary;
