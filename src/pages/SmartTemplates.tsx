import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Home, Building2, UtensilsCrossed, Briefcase, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { BOQService } from '../services/boqService';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  style: string;
  area: number;
  rooms: { name: string; type: string; area_sqft: number; items: { category: string; description: string; specification: string; unit: string; quantity: number; rate: number }[] }[];
  totalEstimate: number;
}

const TEMPLATES: Template[] = [
  {
    id: 'modern-2bhk', name: 'Modern 2BHK', description: 'Clean lines, neutral palette, functional furniture', icon: <Home className="w-6 h-6" />,
    style: 'Modern', area: 1000, totalEstimate: 1250000,
    rooms: [
      { name: 'Living Room', type: 'living', area_sqft: 250, items: [
        { category: 'flooring', description: 'Vitrified Tiles 600x600', specification: 'Kajaria Glossy', unit: 'sqft', quantity: 250, rate: 55 },
        { category: 'wall_finish', description: 'Premium Emulsion Paint', specification: 'Asian Paints Royale', unit: 'sqft', quantity: 600, rate: 14 },
        { category: 'ceiling', description: 'Gypsum False Ceiling (Peripheral)', specification: 'Gyproc with LED cove', unit: 'sqft', quantity: 80, rate: 95 },
        { category: 'electrical', description: 'LED Downlights 12W', specification: 'Philips Warm White', unit: 'nos', quantity: 8, rate: 550 },
        { category: 'furniture', description: 'TV Unit with Storage', specification: 'Laminate finish, soft-close', unit: 'rft', quantity: 8, rate: 1800 },
        { category: 'decorative', description: 'Curtains with Track', specification: 'Blackout + Sheer', unit: 'rft', quantity: 12, rate: 350 },
      ]},
      { name: 'Master Bedroom', type: 'bedroom', area_sqft: 180, items: [
        { category: 'flooring', description: 'Wooden Laminate 8mm', specification: 'Pergo Oak', unit: 'sqft', quantity: 180, rate: 110 },
        { category: 'wall_finish', description: 'Premium Emulsion + Accent Wall', specification: 'Asian Paints + Texture', unit: 'sqft', quantity: 500, rate: 18 },
        { category: 'ceiling', description: 'POP False Ceiling', specification: 'Simple cove design', unit: 'sqft', quantity: 180, rate: 75 },
        { category: 'furniture', description: 'Wardrobe (Sliding)', specification: 'Hettich hardware, laminate', unit: 'sqft', quantity: 56, rate: 1200 },
        { category: 'furniture', description: 'Bed Back Panel', specification: 'Upholstered, fabric', unit: 'sqft', quantity: 35, rate: 800 },
        { category: 'electrical', description: 'Modular Switches + Wiring', specification: 'Schneider 6M', unit: 'nos', quantity: 6, rate: 600 },
      ]},
      { name: 'Kitchen', type: 'kitchen', area_sqft: 80, items: [
        { category: 'kitchen', description: 'Modular Kitchen (L-Shape)', specification: 'Marine ply + Laminate + SS Basket', unit: 'rft', quantity: 14, rate: 2200 },
        { category: 'kitchen', description: 'Quartz Countertop', specification: 'Kalinga 20mm', unit: 'sqft', quantity: 25, rate: 450 },
        { category: 'kitchen', description: 'Wall Tiles Dado', specification: 'Somany 300x450', unit: 'sqft', quantity: 60, rate: 45 },
        { category: 'kitchen', description: 'Chimney + Hob', specification: 'Faber Auto-clean', unit: 'set', quantity: 1, rate: 25000 },
        { category: 'plumbing', description: 'Kitchen Sink + Faucet', specification: 'Franke SS + Jaquar mixer', unit: 'set', quantity: 1, rate: 8000 },
      ]},
      { name: 'Bathroom', type: 'bathroom', area_sqft: 45, items: [
        { category: 'flooring', description: 'Anti-skid Tiles', specification: 'Kajaria 300x300', unit: 'sqft', quantity: 45, rate: 50 },
        { category: 'wall_finish', description: 'Wall Tiles (Full Height)', specification: 'Kajaria 600x300', unit: 'sqft', quantity: 150, rate: 55 },
        { category: 'fixtures', description: 'EWC + Seat Cover', specification: 'Hindware Wall-hung', unit: 'nos', quantity: 1, rate: 8500 },
        { category: 'fixtures', description: 'Rain Shower + Mixer', specification: 'Kohler Chrome', unit: 'set', quantity: 1, rate: 15000 },
        { category: 'fixtures', description: 'Vanity Basin + Cabinet', specification: 'Hindware + PVC cabinet', unit: 'set', quantity: 1, rate: 6000 },
      ]},
    ]
  },
  {
    id: 'luxury-3bhk', name: 'Luxury 3BHK', description: 'Premium materials, Italian marble, high-end brands', icon: <Sparkles className="w-6 h-6" />,
    style: 'Luxurious', area: 1800, totalEstimate: 4500000,
    rooms: [
      { name: 'Grand Living', type: 'living', area_sqft: 400, items: [
        { category: 'flooring', description: 'Italian Marble (Statuario)', specification: 'Imported, book-matched', unit: 'sqft', quantity: 400, rate: 350 },
        { category: 'wall_finish', description: 'Veneer Paneling + Paint', specification: 'Teak veneer + Asian Paints', unit: 'sqft', quantity: 200, rate: 120 },
        { category: 'ceiling', description: 'Multi-level False Ceiling', specification: 'Gyproc + POP + LED strips', unit: 'sqft', quantity: 400, rate: 130 },
        { category: 'furniture', description: 'Custom Entertainment Unit', specification: 'Veneer + back-painted glass', unit: 'rft', quantity: 12, rate: 3500 },
        { category: 'electrical', description: 'Chandelier + Cove Lighting', specification: 'Crystal + Warm LED', unit: 'lot', quantity: 1, rate: 35000 },
      ]},
      { name: 'Master Suite', type: 'bedroom', area_sqft: 280, items: [
        { category: 'flooring', description: 'Engineered Wood Flooring', specification: 'European Oak, Herringbone', unit: 'sqft', quantity: 280, rate: 250 },
        { category: 'furniture', description: 'Walk-in Wardrobe', specification: 'Premium hardware, LED, mirror', unit: 'sqft', quantity: 80, rate: 2200 },
        { category: 'wall_finish', description: 'Wallpaper + Moulding', specification: 'Imported + PU moulding', unit: 'sqft', quantity: 300, rate: 85 },
        { category: 'furniture', description: 'Upholstered King Bed Panel', specification: 'Italian fabric, tufted', unit: 'sqft', quantity: 50, rate: 1500 },
        { category: 'ceiling', description: 'Coffered Ceiling', specification: 'POP + indirect lighting', unit: 'sqft', quantity: 280, rate: 150 },
      ]},
      { name: 'Kitchen', type: 'kitchen', area_sqft: 120, items: [
        { category: 'kitchen', description: 'Premium Modular Kitchen', specification: 'Acrylic finish + Hettich Cargo', unit: 'rft', quantity: 18, rate: 3800 },
        { category: 'kitchen', description: 'Granite Island Countertop', specification: 'Black Galaxy, waterfall edge', unit: 'sqft', quantity: 40, rate: 600 },
        { category: 'kitchen', description: 'Built-in Appliances', specification: 'Bosch oven + microwave + dishwasher', unit: 'lot', quantity: 1, rate: 120000 },
      ]},
    ]
  },
  {
    id: 'office-space', name: 'Office Space', description: 'Professional, ergonomic, branded interiors', icon: <Briefcase className="w-6 h-6" />,
    style: 'Modern', area: 1500, totalEstimate: 2200000,
    rooms: [
      { name: 'Reception', type: 'other', area_sqft: 200, items: [
        { category: 'flooring', description: 'Porcelain Tiles 800x800', specification: 'Matt grey', unit: 'sqft', quantity: 200, rate: 75 },
        { category: 'furniture', description: 'Reception Counter', specification: 'Corian top + backlit logo', unit: 'rft', quantity: 8, rate: 4500 },
        { category: 'ceiling', description: 'Metal Grid Ceiling', specification: 'Armstrong 600x600', unit: 'sqft', quantity: 200, rate: 85 },
        { category: 'wall_finish', description: 'Logo Wall + Branding', specification: 'ACP + acrylic letters', unit: 'lot', quantity: 1, rate: 25000 },
      ]},
      { name: 'Open Office', type: 'office', area_sqft: 800, items: [
        { category: 'flooring', description: 'Carpet Tiles', specification: 'Interface, loop pile', unit: 'sqft', quantity: 800, rate: 65 },
        { category: 'furniture', description: 'Workstations (4-seater)', specification: 'Featherlite + wire management', unit: 'nos', quantity: 12, rate: 18000 },
        { category: 'electrical', description: 'Floor Boxes + Data Points', specification: 'Cat6 + power', unit: 'nos', quantity: 12, rate: 3500 },
        { category: 'ceiling', description: 'Acoustic False Ceiling', specification: 'Mineral fiber + T-grid', unit: 'sqft', quantity: 800, rate: 75 },
      ]},
      { name: 'Conference Room', type: 'other', area_sqft: 200, items: [
        { category: 'furniture', description: 'Conference Table (12-seater)', specification: 'Veneer top + cable ports', unit: 'nos', quantity: 1, rate: 45000 },
        { category: 'electrical', description: 'AV System + Projector', specification: 'Epson + Screen + Sound', unit: 'lot', quantity: 1, rate: 85000 },
        { category: 'wall_finish', description: 'Acoustic Panels', specification: 'Fabric-wrapped, NRC 0.8', unit: 'sqft', quantity: 100, rate: 120 },
      ]},
    ]
  },
  {
    id: 'restaurant', name: 'Restaurant', description: 'Commercial kitchen, dining ambiance, bar setup', icon: <UtensilsCrossed className="w-6 h-6" />,
    style: 'Industrial', area: 2000, totalEstimate: 3500000,
    rooms: [
      { name: 'Dining Hall', type: 'other', area_sqft: 1000, items: [
        { category: 'flooring', description: 'Designer Tiles Pattern', specification: 'Moroccan/Geometric', unit: 'sqft', quantity: 1000, rate: 85 },
        { category: 'ceiling', description: 'Exposed Ceiling + Industrial Lights', specification: 'Painted ducts + Edison bulbs', unit: 'sqft', quantity: 1000, rate: 45 },
        { category: 'furniture', description: 'Custom Seating (2-top)', specification: 'Solid wood + upholstered', unit: 'nos', quantity: 20, rate: 12000 },
        { category: 'furniture', description: 'Banquette Seating', specification: 'Built-in, leather finish', unit: 'rft', quantity: 30, rate: 4500 },
        { category: 'wall_finish', description: 'Feature Wall + Art', specification: 'Exposed brick + murals', unit: 'sqft', quantity: 200, rate: 150 },
      ]},
      { name: 'Commercial Kitchen', type: 'kitchen', area_sqft: 500, items: [
        { category: 'kitchen', description: 'SS Commercial Kitchen Setup', specification: 'Work tables + sinks + shelving', unit: 'lot', quantity: 1, rate: 350000 },
        { category: 'plumbing', description: 'Grease Trap + Drainage', specification: 'SS grease trap + floor drains', unit: 'lot', quantity: 1, rate: 45000 },
        { category: 'electrical', description: 'Commercial Exhaust System', specification: 'Hood + duct + fresh air', unit: 'lot', quantity: 1, rate: 150000 },
      ]},
      { name: 'Bar Counter', type: 'other', area_sqft: 100, items: [
        { category: 'furniture', description: 'Bar Counter with Display', specification: 'Granite + backlit shelving + tap system', unit: 'rft', quantity: 12, rate: 8000 },
        { category: 'electrical', description: 'Bar Ambient Lighting', specification: 'LED strips + pendant + dimmers', unit: 'lot', quantity: 1, rate: 25000 },
      ]},
    ]
  },
];

const SmartTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');

  const applyTemplate = async (template: Template) => {
    if (!clientName) { toast.error('Enter client name'); return; }
    setCreating(true);
    try {
      const project = await BOQService.createProject({
        name: projectName || `${template.name} - ${clientName}`,
        client: clientName,
        style: template.style as any,
        total_area_sqft: template.area,
        num_rooms: template.rooms.length,
        status: 'draft',
        currency: 'INR',
      });
      for (const room of template.rooms) {
        const newRoom = await BOQService.createRoom({
          project_id: project.id, name: room.name, type: room.type as any,
          area_sqft: room.area_sqft, order: template.rooms.indexOf(room) + 1,
        });
        await BOQService.bulkCreateItems(room.items.map((item, idx) => ({
          project_id: project.id, room_id: newRoom.id, category: item.category as any,
          description: item.description, specification: item.specification,
          unit: item.unit as any, quantity: item.quantity, rate: item.rate,
          source: 'template' as any, order: idx + 1,
        })));
      }
      toast.success('Template applied!');
      navigate(`/app/project/${project.id}`);
    } catch (e: any) {
      toast.error('Failed: ' + (e.message || 'Unknown'));
    } finally { setCreating(false); }
  };

  const fmt = (n: number) => `₹${(n / 100000).toFixed(1)}L`;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-angelina-600" /> Smart Templates
        </h2>
        <p className="text-gray-500 text-sm">One-click BOQ generation from pre-built templates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TEMPLATES.map(t => (
          <motion.div key={t.id} whileHover={{ y: -4 }} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-r from-angelina-500 to-purple-600 p-5 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">{t.icon}</div>
                <div>
                  <h3 className="text-lg font-bold">{t.name}</h3>
                  <p className="text-sm text-angelina-100">{t.description}</p>
                </div>
              </div>
              <div className="flex gap-4 mt-3 text-sm">
                <span>{t.area} sqft</span>
                <span>{t.rooms.length} rooms</span>
                <span>{t.rooms.reduce((s, r) => s + r.items.length, 0)} items</span>
                <span className="font-bold">{fmt(t.totalEstimate)}</span>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2 mb-4">
                {t.rooms.map(r => (
                  <div key={r.name} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{r.name}</span>
                    <span className="text-gray-400">{r.items.length} items • {r.area_sqft} sqft</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setSelectedTemplate(t)}
                className="w-full py-2.5 bg-angelina-600 text-white rounded-lg font-medium hover:bg-angelina-700 flex items-center justify-center gap-2">
                Use Template <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Apply Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTemplate(null)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-1">Apply: {selectedTemplate.name}</h3>
            <p className="text-sm text-gray-500 mb-4">This will create a new project with {selectedTemplate.rooms.length} rooms and {selectedTemplate.rooms.reduce((s, r) => s + r.items.length, 0)} items</p>
            <div className="space-y-3">
              <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client Name *"
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-angelina-500" />
              <input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder={`Project Name (default: ${selectedTemplate.name} - Client)`}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-angelina-500" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setSelectedTemplate(null)} className="flex-1 py-2.5 border rounded-lg text-gray-600">Cancel</button>
              <button onClick={() => applyTemplate(selectedTemplate)} disabled={creating}
                className="flex-1 py-2.5 bg-angelina-600 text-white rounded-lg font-medium hover:bg-angelina-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {creating ? 'Creating...' : <><Check className="w-4 h-4" /> Create Project</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SmartTemplates;
