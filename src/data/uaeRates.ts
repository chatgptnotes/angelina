export interface UAERate {
  item: string;
  description: string;
  unit: string;
  rate_aed: number;
  category: string;
  subcategory: string;
}

export const UAE_RATES: UAERate[] = [
  // === CIVIL ===
  { item: 'Concrete Grade 40', description: 'Ready-mix concrete Grade C40, supply and pour', unit: 'cum', rate_aed: 850, category: 'civil', subcategory: 'Concrete' },
  { item: 'Concrete Grade 50', description: 'Ready-mix concrete Grade C50, supply and pour', unit: 'cum', rate_aed: 950, category: 'civil', subcategory: 'Concrete' },
  { item: 'Blockwork 200mm', description: '200mm hollow concrete blockwork, laid in cement mortar', unit: 'sqm', rate_aed: 120, category: 'civil', subcategory: 'Blockwork' },
  { item: 'Blockwork 150mm', description: '150mm hollow concrete blockwork, laid in cement mortar', unit: 'sqm', rate_aed: 95, category: 'civil', subcategory: 'Blockwork' },
  { item: 'Internal Plastering', description: 'Cement plaster 15mm thick, float finish', unit: 'sqm', rate_aed: 35, category: 'civil', subcategory: 'Plastering' },
  { item: 'External Plastering', description: 'Cement plaster 20mm thick, external render', unit: 'sqm', rate_aed: 45, category: 'civil', subcategory: 'Plastering' },
  { item: 'Waterproofing - Membrane', description: 'Torch-applied bituminous membrane waterproofing', unit: 'sqm', rate_aed: 85, category: 'civil', subcategory: 'Waterproofing' },
  { item: 'Waterproofing - Crystalline', description: 'Crystalline waterproofing coating, 2 coats', unit: 'sqm', rate_aed: 65, category: 'civil', subcategory: 'Waterproofing' },

  // === MEP - HVAC ===
  { item: 'GI Ducting', description: 'Galvanized iron ductwork, fabricated and installed', unit: 'kg', rate_aed: 32, category: 'hvac', subcategory: 'Ducting' },
  { item: 'Insulated Ducting', description: 'Pre-insulated ducting panels, supply and install', unit: 'sqm', rate_aed: 180, category: 'hvac', subcategory: 'Ducting' },
  { item: 'FCU 2-Pipe', description: 'Fan Coil Unit, 2-pipe, ceiling concealed, 12,000 BTU', unit: 'nos', rate_aed: 3500, category: 'hvac', subcategory: 'FCU' },
  { item: 'FCU 4-Pipe', description: 'Fan Coil Unit, 4-pipe, ceiling concealed, 18,000 BTU', unit: 'nos', rate_aed: 5200, category: 'hvac', subcategory: 'FCU' },
  { item: 'AHU', description: 'Air Handling Unit, double skin, with filters and coil', unit: 'nos', rate_aed: 45000, category: 'hvac', subcategory: 'AHU' },
  { item: 'Chiller - Air Cooled', description: 'Air-cooled chiller, 100 TR capacity', unit: 'nos', rate_aed: 280000, category: 'hvac', subcategory: 'Chiller' },
  { item: 'VRF Outdoor Unit', description: 'VRF outdoor condensing unit, 10 HP', unit: 'nos', rate_aed: 65000, category: 'hvac', subcategory: 'VRF' },
  { item: 'VRF Indoor Unit', description: 'VRF indoor cassette unit, 2.2 kW', unit: 'nos', rate_aed: 4800, category: 'hvac', subcategory: 'VRF' },
  { item: 'Split DX Unit', description: 'Wall-mounted split AC, 2 ton, inverter', unit: 'nos', rate_aed: 3200, category: 'hvac', subcategory: 'DX Units' },

  // === ELECTRICAL ===
  { item: 'DB Board - 12 Way', description: 'Distribution board, 12-way, TP+N, MCB fitted', unit: 'nos', rate_aed: 2800, category: 'electrical', subcategory: 'DB Boards' },
  { item: 'DB Board - 24 Way', description: 'Distribution board, 24-way, TP+N, MCB fitted', unit: 'nos', rate_aed: 4500, category: 'electrical', subcategory: 'DB Boards' },
  { item: 'Cable 1.5mm 3C', description: 'XLPE/PVC cable 1.5mm 3-core, installed in trunking', unit: 'rft', rate_aed: 8, category: 'electrical', subcategory: 'Cables' },
  { item: 'Cable 2.5mm 3C', description: 'XLPE/PVC cable 2.5mm 3-core, installed in trunking', unit: 'rft', rate_aed: 12, category: 'electrical', subcategory: 'Cables' },
  { item: 'Cable 4mm 3C', description: 'XLPE/PVC cable 4mm 3-core, installed in trunking', unit: 'rft', rate_aed: 18, category: 'electrical', subcategory: 'Cables' },
  { item: 'Cable 16mm 4C', description: 'XLPE/PVC cable 16mm 4-core, power cable', unit: 'rft', rate_aed: 45, category: 'electrical', subcategory: 'Cables' },
  { item: 'Cable Trunking 100x50', description: 'PVC cable trunking 100x50mm with cover', unit: 'rft', rate_aed: 22, category: 'electrical', subcategory: 'Containment' },
  { item: 'Cable Tray 300mm', description: 'Hot-dip galvanized cable tray 300mm wide', unit: 'rft', rate_aed: 55, category: 'electrical', subcategory: 'Containment' },
  { item: 'LED Downlight 15W', description: 'LED recessed downlight, 15W, 4000K, IP44', unit: 'nos', rate_aed: 120, category: 'electrical', subcategory: 'Lighting' },
  { item: 'LED Panel 600x600', description: 'LED panel light 600x600mm, 40W, recessed', unit: 'nos', rate_aed: 280, category: 'electrical', subcategory: 'Lighting' },
  { item: 'LED Strip Light', description: 'LED strip light 14.4W/m with aluminum profile', unit: 'rft', rate_aed: 35, category: 'electrical', subcategory: 'Lighting' },

  // === PLUMBING ===
  { item: 'PPR Pipe 20mm', description: 'PPR hot/cold water pipe 20mm, PN20', unit: 'rft', rate_aed: 12, category: 'plumbing', subcategory: 'PPR Pipes' },
  { item: 'PPR Pipe 25mm', description: 'PPR hot/cold water pipe 25mm, PN20', unit: 'rft', rate_aed: 16, category: 'plumbing', subcategory: 'PPR Pipes' },
  { item: 'PPR Pipe 32mm', description: 'PPR hot/cold water pipe 32mm, PN20', unit: 'rft', rate_aed: 22, category: 'plumbing', subcategory: 'PPR Pipes' },
  { item: 'UPVC Drainage 110mm', description: 'UPVC soil pipe 110mm dia, with fittings', unit: 'rft', rate_aed: 28, category: 'plumbing', subcategory: 'Drainage' },
  { item: 'UPVC Drainage 50mm', description: 'UPVC waste pipe 50mm dia, with fittings', unit: 'rft', rate_aed: 15, category: 'plumbing', subcategory: 'Drainage' },
  { item: 'WC - Wall Hung', description: 'Wall-hung WC, concealed cistern, soft-close seat', unit: 'nos', rate_aed: 2800, category: 'plumbing', subcategory: 'Fixtures' },
  { item: 'Wash Basin - Counter', description: 'Counter-top wash basin with mixer tap', unit: 'nos', rate_aed: 1800, category: 'plumbing', subcategory: 'Fixtures' },
  { item: 'Shower Set', description: 'Thermostatic shower set, rain head + hand shower', unit: 'set', rate_aed: 3500, category: 'plumbing', subcategory: 'Fixtures' },
  { item: 'Booster Pump', description: 'Water booster pump set, multi-stage, 2 HP', unit: 'nos', rate_aed: 8500, category: 'plumbing', subcategory: 'Pumps' },

  // === FIRE FIGHTING ===
  { item: 'Sprinkler Head - Pendant', description: 'Pendant sprinkler head, K5.6, chrome, 68C', unit: 'nos', rate_aed: 85, category: 'fire_fighting', subcategory: 'Sprinklers' },
  { item: 'Sprinkler Head - Concealed', description: 'Concealed sprinkler head, K5.6, white cover plate', unit: 'nos', rate_aed: 150, category: 'fire_fighting', subcategory: 'Sprinklers' },
  { item: 'FM200 System', description: 'FM200 clean agent fire suppression system, per kg', unit: 'kg', rate_aed: 450, category: 'fire_fighting', subcategory: 'FM200' },
  { item: 'Fire Alarm Panel', description: 'Addressable fire alarm control panel, 2-loop', unit: 'nos', rate_aed: 12000, category: 'fire_fighting', subcategory: 'Fire Alarm' },
  { item: 'Smoke Detector', description: 'Addressable optical smoke detector with base', unit: 'nos', rate_aed: 280, category: 'fire_fighting', subcategory: 'Fire Alarm' },
  { item: 'Heat Detector', description: 'Addressable heat detector, rate of rise, with base', unit: 'nos', rate_aed: 250, category: 'fire_fighting', subcategory: 'Fire Alarm' },
  { item: 'Manual Call Point', description: 'Addressable manual call point, break glass', unit: 'nos', rate_aed: 320, category: 'fire_fighting', subcategory: 'Fire Alarm' },
  { item: 'Fire Extinguisher 6kg', description: 'ABC dry powder fire extinguisher, 6kg', unit: 'nos', rate_aed: 180, category: 'fire_fighting', subcategory: 'Extinguishers' },

  // === LOW CURRENT ===
  { item: 'CCTV Camera - Dome', description: 'IP dome camera, 4MP, IR, PoE, indoor', unit: 'nos', rate_aed: 850, category: 'low_current', subcategory: 'CCTV' },
  { item: 'CCTV Camera - Bullet', description: 'IP bullet camera, 4MP, IR, PoE, outdoor', unit: 'nos', rate_aed: 1200, category: 'low_current', subcategory: 'CCTV' },
  { item: 'NVR 16-Channel', description: 'Network video recorder, 16-channel, 4TB HDD', unit: 'nos', rate_aed: 4500, category: 'low_current', subcategory: 'CCTV' },
  { item: 'Access Control Reader', description: 'Proximity card reader with controller', unit: 'nos', rate_aed: 1800, category: 'low_current', subcategory: 'Access Control' },
  { item: 'Electromagnetic Lock', description: 'EM lock, 600 lbs holding force', unit: 'nos', rate_aed: 650, category: 'low_current', subcategory: 'Access Control' },
  { item: 'PA Speaker - Ceiling', description: 'Ceiling-mounted PA speaker, 6W, EN54', unit: 'nos', rate_aed: 380, category: 'low_current', subcategory: 'PA System' },
  { item: 'Structured Cabling - Cat6A', description: 'Cat6A UTP cable, single point, tested', unit: 'nos', rate_aed: 350, category: 'low_current', subcategory: 'Structured Cabling' },
  { item: 'Patch Panel 24-Port', description: '24-port Cat6A patch panel, loaded', unit: 'nos', rate_aed: 950, category: 'low_current', subcategory: 'Structured Cabling' },

  // === FINISHING - FLOORING ===
  { item: 'Porcelain Tiles 600x600', description: 'Porcelain floor tiles 600x600mm, rectified, installed', unit: 'sqm', rate_aed: 180, category: 'flooring', subcategory: 'Porcelain' },
  { item: 'Porcelain Tiles 800x800', description: 'Porcelain floor tiles 800x800mm, polished, installed', unit: 'sqm', rate_aed: 250, category: 'flooring', subcategory: 'Porcelain' },
  { item: 'Marble Flooring', description: 'Natural marble flooring, 20mm polished, installed', unit: 'sqm', rate_aed: 450, category: 'flooring', subcategory: 'Marble' },
  { item: 'Marble Flooring Premium', description: 'Premium marble (Statuario/Calacatta), 20mm, installed', unit: 'sqm', rate_aed: 850, category: 'flooring', subcategory: 'Marble' },
  { item: 'Vinyl Flooring - LVT', description: 'Luxury vinyl tile, 3mm, click-lock, installed', unit: 'sqm', rate_aed: 120, category: 'flooring', subcategory: 'Vinyl' },
  { item: 'Vinyl Flooring - SPC', description: 'SPC vinyl plank, 5mm, waterproof, installed', unit: 'sqm', rate_aed: 160, category: 'flooring', subcategory: 'Vinyl' },

  // === FINISHING - PAINTING ===
  { item: 'Emulsion Paint', description: 'Premium emulsion paint, 2 coats + primer, walls', unit: 'sqm', rate_aed: 25, category: 'wall_finish', subcategory: 'Painting' },
  { item: 'Textured Paint', description: 'Textured wall coating, decorative finish', unit: 'sqm', rate_aed: 55, category: 'wall_finish', subcategory: 'Painting' },
  { item: 'Epoxy Paint', description: 'Epoxy paint, 2-component, high-build, floors/walls', unit: 'sqm', rate_aed: 75, category: 'wall_finish', subcategory: 'Painting' },

  // === FINISHING - CEILING ===
  { item: 'Mineral Fiber Ceiling', description: 'Mineral fiber ceiling tiles 600x600, T-grid system', unit: 'sqm', rate_aed: 85, category: 'ceiling', subcategory: 'Mineral Fiber' },
  { item: 'Gypsum Board Ceiling', description: 'Gypsum board false ceiling, 12.5mm, plain', unit: 'sqm', rate_aed: 110, category: 'ceiling', subcategory: 'Gypsum' },
  { item: 'Gypsum Ceiling with Cove', description: 'Gypsum board false ceiling with L-box cove lighting', unit: 'sqm', rate_aed: 165, category: 'ceiling', subcategory: 'Gypsum' },
  { item: 'Metal Ceiling', description: 'Aluminum metal ceiling tiles, lay-in type', unit: 'sqm', rate_aed: 195, category: 'ceiling', subcategory: 'Metal' },

  // === DOORS & WINDOWS ===
  { item: 'Fire Rated Door 1hr', description: 'Fire rated door, 1-hour rating, single leaf, with hardware', unit: 'nos', rate_aed: 4500, category: 'doors_windows', subcategory: 'Fire Rated Doors' },
  { item: 'Fire Rated Door 2hr', description: 'Fire rated door, 2-hour rating, single leaf, with hardware', unit: 'nos', rate_aed: 6500, category: 'doors_windows', subcategory: 'Fire Rated Doors' },
  { item: 'Aluminum Window', description: 'Aluminum window, powder coated, 6mm DGU glass', unit: 'sqm', rate_aed: 650, category: 'doors_windows', subcategory: 'Aluminum Windows' },
  { item: 'Aluminum Curtain Wall', description: 'Aluminum curtain wall system, structural glazing', unit: 'sqm', rate_aed: 1200, category: 'doors_windows', subcategory: 'Aluminum Windows' },
  { item: 'Automatic Sliding Door', description: 'Automatic sliding door, sensor operated, aluminum frame', unit: 'set', rate_aed: 18000, category: 'doors_windows', subcategory: 'Automatic Doors' },
  { item: 'Wooden Door - Flush', description: 'Flush door, hardwood frame, laminate finish, hardware', unit: 'nos', rate_aed: 2200, category: 'doors_windows', subcategory: 'Wooden Doors' },

  // === EXTERNAL WORKS ===
  { item: 'Landscaping - Softscape', description: 'Soft landscaping including topsoil, plants, irrigation', unit: 'sqm', rate_aed: 180, category: 'external_works', subcategory: 'Landscaping' },
  { item: 'Landscaping - Hardscape', description: 'Hard landscaping, interlock paving, edges', unit: 'sqm', rate_aed: 220, category: 'external_works', subcategory: 'Landscaping' },
  { item: 'Interlock Paving', description: 'Interlock paving blocks, 80mm, herringbone pattern', unit: 'sqm', rate_aed: 120, category: 'external_works', subcategory: 'Paving' },
  { item: 'Asphalt Paving', description: 'Asphalt road surface, 50mm wearing course', unit: 'sqm', rate_aed: 85, category: 'external_works', subcategory: 'Paving' },
  { item: 'Boundary Wall', description: 'Precast concrete boundary wall, 2.4m height', unit: 'rft', rate_aed: 350, category: 'external_works', subcategory: 'Fencing' },
  { item: 'Chain Link Fence', description: 'Chain link fence, 2m height, galvanized, with posts', unit: 'rft', rate_aed: 85, category: 'external_works', subcategory: 'Fencing' },
  { item: 'External Signage', description: 'Illuminated external signage, aluminum composite', unit: 'sqm', rate_aed: 1500, category: 'external_works', subcategory: 'Signage' },

  // === PRELIMINARIES ===
  { item: 'Site Setup', description: 'Site offices, storage, welfare facilities', unit: 'lot', rate_aed: 50000, category: 'preliminaries', subcategory: 'Site Establishment' },
  { item: 'Insurance - CAR', description: 'Contractors All Risk insurance policy', unit: 'lot', rate_aed: 25000, category: 'preliminaries', subcategory: 'Insurance' },
  { item: 'Performance Bond', description: 'Performance bond, 10% of contract value', unit: 'lot', rate_aed: 15000, category: 'preliminaries', subcategory: 'Bonds' },
  { item: 'Health & Safety', description: 'H&S equipment, signage, first aid, PPE', unit: 'lot', rate_aed: 20000, category: 'preliminaries', subcategory: 'Safety' },
  { item: 'Mobilization', description: 'Site mobilization, equipment transport, setup', unit: 'lot', rate_aed: 35000, category: 'preliminaries', subcategory: 'Mobilization' },

  // === DRAINAGE ===
  { item: 'UPVC Drainage Pipe 160mm', description: 'UPVC drainage pipe 160mm dia, underground', unit: 'rft', rate_aed: 45, category: 'drainage', subcategory: 'Pipes' },
  { item: 'Manhole 600x600', description: 'Precast concrete manhole, 600x600mm, complete', unit: 'nos', rate_aed: 3500, category: 'drainage', subcategory: 'Manholes' },
  { item: 'Grease Trap', description: 'Grease trap, GRP, 500 litre capacity', unit: 'nos', rate_aed: 4500, category: 'drainage', subcategory: 'Grease Traps' },
  { item: 'Floor Drain', description: 'Stainless steel floor drain, 150x150mm, with trap', unit: 'nos', rate_aed: 120, category: 'drainage', subcategory: 'Drains' },

  // === FURNITURE ===
  { item: 'Office Workstation', description: 'Modular office workstation, L-shaped, with pedestal', unit: 'nos', rate_aed: 3500, category: 'furniture', subcategory: 'Office' },
  { item: 'Wardrobe - Built-in', description: 'Built-in wardrobe, melamine finish, soft-close', unit: 'rft', rate_aed: 1200, category: 'furniture', subcategory: 'Wardrobes' },
  { item: 'Kitchen Cabinet', description: 'Modular kitchen cabinets, acrylic/lacquer finish', unit: 'rft', rate_aed: 1800, category: 'furniture', subcategory: 'Kitchen' },

  // === FIXTURES ===
  { item: 'Vanity Unit', description: 'Bathroom vanity unit with basin and mirror', unit: 'nos', rate_aed: 4500, category: 'fixtures', subcategory: 'Bathroom' },
  { item: 'Bathtub - Freestanding', description: 'Freestanding acrylic bathtub with waste', unit: 'nos', rate_aed: 8500, category: 'fixtures', subcategory: 'Bathroom' },
];

export const UAE_RATE_CATEGORIES = [
  'civil', 'hvac', 'electrical', 'plumbing', 'fire_fighting', 'low_current',
  'flooring', 'wall_finish', 'ceiling', 'doors_windows', 'external_works',
  'preliminaries', 'drainage', 'furniture', 'fixtures',
];
