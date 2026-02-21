import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, Star, MapPin, Phone, Globe, Package } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  category: string[];
  brands: string[];
  city: string;
  rating: number;
  contact: string;
  website: string;
  speciality: string;
  priceRange: 'Budget' | 'Mid-Range' | 'Premium';
}

const VENDORS: Vendor[] = [
  { id: 'v1', name: 'Asian Paints', category: ['wall_finish'], brands: ['Royale', 'Apex', 'Tractor'], city: 'Pan India', rating: 4.7, contact: '1800-209-5678', website: 'asianpaints.com', speciality: 'Interior & Exterior Paints, Textures, Waterproofing', priceRange: 'Mid-Range' },
  { id: 'v2', name: 'Kajaria Ceramics', category: ['flooring', 'wall_finish'], brands: ['Eternity', 'Ultima', 'Prima'], city: 'Pan India', rating: 4.6, contact: '1800-11-5252', website: 'kajariaceramics.com', speciality: 'Vitrified Tiles, Ceramic Tiles, Sanitaryware', priceRange: 'Mid-Range' },
  { id: 'v3', name: 'Somany Ceramics', category: ['flooring', 'wall_finish'], brands: ['Duragres', 'Slip Shield'], city: 'Pan India', rating: 4.3, contact: '1800-114-050', website: 'somanyceramics.com', speciality: 'Floor Tiles, Wall Tiles, Sanitary', priceRange: 'Budget' },
  { id: 'v4', name: 'Hindware', category: ['fixtures'], brands: ['Italian Collection', 'Art', 'Enigma'], city: 'Pan India', rating: 4.4, contact: '1800-102-2202', website: 'hindware.com', speciality: 'Sanitaryware, Faucets, Bathroom Accessories', priceRange: 'Mid-Range' },
  { id: 'v5', name: 'Kohler', category: ['fixtures'], brands: ['Kohler', 'Kohler Bold'], city: 'Pan India', rating: 4.8, contact: '1800-102-6002', website: 'kohler.co.in', speciality: 'Premium Sanitaryware, Faucets, Shower Systems', priceRange: 'Premium' },
  { id: 'v6', name: 'Jaquar', category: ['fixtures', 'plumbing'], brands: ['Artize', 'Jaquar', 'Essco'], city: 'Pan India', rating: 4.5, contact: '1800-102-4242', website: 'jaquar.com', speciality: 'Faucets, Showers, Sanitaryware, Lighting', priceRange: 'Mid-Range' },
  { id: 'v7', name: 'Hettich', category: ['furniture'], brands: ['Hettich', 'InnoTech'], city: 'Pan India', rating: 4.8, contact: '1800-209-2727', website: 'hettich.com', speciality: 'Cabinet Hardware, Hinges, Drawer Systems, Sliding', priceRange: 'Premium' },
  { id: 'v8', name: 'Hafele', category: ['furniture', 'kitchen'], brands: ['Hafele', 'Nagold'], city: 'Pan India', rating: 4.7, contact: '1800-266-6667', website: 'hafele.co.in', speciality: 'Kitchen Fittings, Appliances, Furniture Hardware', priceRange: 'Premium' },
  { id: 'v9', name: 'Schneider Electric', category: ['electrical'], brands: ['Schneider', 'Livia', 'ZENcelo'], city: 'Pan India', rating: 4.6, contact: '1800-180-1707', website: 'se.com', speciality: 'Switches, MCBs, Home Automation', priceRange: 'Mid-Range' },
  { id: 'v10', name: 'Philips Lighting', category: ['electrical'], brands: ['Philips', 'Hue'], city: 'Pan India', rating: 4.5, contact: '1800-102-2929', website: 'philips.co.in', speciality: 'LED Lights, Panel Lights, Smart Lighting', priceRange: 'Mid-Range' },
  { id: 'v11', name: 'Gyproc Saint-Gobain', category: ['ceiling'], brands: ['Gyproc', 'Habito'], city: 'Pan India', rating: 4.4, contact: '1800-103-3466', website: 'gyproc.in', speciality: 'False Ceiling, Gypsum Boards, Drywall', priceRange: 'Mid-Range' },
  { id: 'v12', name: 'Faber', category: ['kitchen'], brands: ['Faber', 'Franke'], city: 'Pan India', rating: 4.3, contact: '1800-209-1016', website: 'faberindia.com', speciality: 'Chimneys, Hobs, Built-in Ovens', priceRange: 'Mid-Range' },
  { id: 'v13', name: 'Kalinga Stone', category: ['kitchen', 'flooring'], brands: ['Kalinga'], city: 'Pan India', rating: 4.5, contact: '9999-000-000', website: 'kalingastone.com', speciality: 'Quartz Surfaces, Engineered Stone', priceRange: 'Premium' },
  { id: 'v14', name: 'Berger Paints', category: ['wall_finish'], brands: ['Silk', 'WeatherCoat', 'Express'], city: 'Pan India', rating: 4.2, contact: '1800-103-6030', website: 'bergerpaints.com', speciality: 'Interior Paints, Wood Finishes, Waterproofing', priceRange: 'Budget' },
  { id: 'v15', name: 'Pergo', category: ['flooring'], brands: ['Pergo', 'Sensation'], city: 'Pan India', rating: 4.6, contact: '011-4050-5050', website: 'pergo.com', speciality: 'Laminate Flooring, Engineered Wood, Vinyl', priceRange: 'Premium' },
];

const CATEGORY_LABELS: Record<string, string> = {
  flooring: 'Flooring', wall_finish: 'Wall Finish', ceiling: 'Ceiling', furniture: 'Furniture',
  fixtures: 'Fixtures', electrical: 'Electrical', plumbing: 'Plumbing', kitchen: 'Kitchen',
};

const VendorDatabase: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterPrice, setFilterPrice] = useState('');

  const filtered = VENDORS.filter(v => {
    if (filterCat && !v.category.includes(filterCat)) return false;
    if (filterPrice && v.priceRange !== filterPrice) return false;
    if (search) {
      const s = search.toLowerCase();
      return v.name.toLowerCase().includes(s) || v.brands.some(b => b.toLowerCase().includes(s)) || v.speciality.toLowerCase().includes(s);
    }
    return true;
  });

  const priceColors = { 'Budget': 'bg-green-100 text-green-700', 'Mid-Range': 'bg-blue-100 text-blue-700', 'Premium': 'bg-purple-100 text-purple-700' };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-6 h-6 text-angelina-600" /> Vendor & Brand Database
        </h2>
        <p className="text-gray-500 text-sm">{VENDORS.length} verified vendors with model numbers and pricing tiers</p>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors, brands..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-angelina-500" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={filterPrice} onChange={e => setFilterPrice(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All Price Ranges</option>
          <option value="Budget">Budget</option>
          <option value="Mid-Range">Mid-Range</option>
          <option value="Premium">Premium</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((v, i) => (
          <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900">{v.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= v.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />)}
                  <span className="text-xs text-gray-400 ml-1">{v.rating}</span>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priceColors[v.priceRange]}`}>{v.priceRange}</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{v.speciality}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {v.brands.map(b => <span key={b} className="text-xs px-2 py-0.5 bg-angelina-50 text-angelina-700 rounded-full">{b}</span>)}
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {v.category.map(c => <span key={c} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{CATEGORY_LABELS[c]}</span>)}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{v.city}</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{v.contact}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VendorDatabase;
