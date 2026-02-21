-- =====================================================
-- Angelina BOQ — Database Schema
-- AI Interior Design Estimation Platform
-- Run in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== PROJECTS =====
CREATE TABLE IF NOT EXISTS boq_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  location TEXT,
  style TEXT CHECK (style IN ('Mediterranean', 'Minimalistic', 'Luxurious', 'Modern', 'Classic', 'Industrial', 'Other')),
  total_area_sqft NUMERIC,
  num_rooms INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'review', 'approved', 'sent')),
  total_estimate NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== ROOMS =====
CREATE TABLE IF NOT EXISTS boq_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES boq_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('bedroom', 'living', 'kitchen', 'bathroom', 'dining', 'office', 'balcony', 'corridor', 'other')),
  area_sqft NUMERIC,
  floor_level INTEGER DEFAULT 0,
  ceiling_height_ft NUMERIC DEFAULT 10,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== BOQ ITEMS =====
CREATE TABLE IF NOT EXISTS boq_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES boq_projects(id) ON DELETE CASCADE,
  room_id UUID REFERENCES boq_rooms(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'civil', 'flooring', 'wall_finish', 'ceiling', 'furniture', 
    'fixtures', 'electrical', 'plumbing', 'doors_windows', 
    'kitchen', 'decorative', 'miscellaneous'
  )),
  sub_category TEXT,
  description TEXT NOT NULL,
  specification TEXT,
  unit TEXT NOT NULL CHECK (unit IN ('sqft', 'sqm', 'rft', 'nos', 'set', 'lot', 'kg', 'ltr', 'cum', 'bag')),
  quantity NUMERIC NOT NULL DEFAULT 0,
  rate NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC GENERATED ALWAYS AS (quantity * rate) STORED,
  notes TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('ai_extracted', 'manual', 'template')),
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== DOCUMENTS =====
CREATE TABLE IF NOT EXISTS boq_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES boq_projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('2d_pdf', '3d_render', 'floor_plan', 'elevation', 'material_sheet', 'mood_board', 'other')),
  file_size INTEGER,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  extracted_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== RATE DATABASE =====
CREATE TABLE IF NOT EXISTS boq_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  specification TEXT,
  unit TEXT NOT NULL,
  rate_low NUMERIC,
  rate_mid NUMERIC,
  rate_high NUMERIC,
  city TEXT DEFAULT 'National Average',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_boq_rooms_project ON boq_rooms(project_id);
CREATE INDEX IF NOT EXISTS idx_boq_items_project ON boq_items(project_id);
CREATE INDEX IF NOT EXISTS idx_boq_items_room ON boq_items(room_id);
CREATE INDEX IF NOT EXISTS idx_boq_items_category ON boq_items(category);
CREATE INDEX IF NOT EXISTS idx_boq_documents_project ON boq_documents(project_id);

-- ===== GRANTS (allow anon/authenticated access) =====
GRANT ALL ON boq_projects TO anon, authenticated;
GRANT ALL ON boq_rooms TO anon, authenticated;
GRANT ALL ON boq_items TO anon, authenticated;
GRANT ALL ON boq_documents TO anon, authenticated;
GRANT ALL ON boq_rates TO anon, authenticated;

-- ===== STORAGE BUCKET =====
-- Run this separately or via Supabase dashboard:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('boq-documents', 'boq-documents', true);

-- ===== SEED: Sample Market Rates =====
INSERT INTO boq_rates (category, item_name, specification, unit, rate_low, rate_mid, rate_high, city) VALUES
('flooring', 'Italian Marble', 'Statuario, 20mm polished', 'sqft', 350, 450, 700, 'Nagpur'),
('flooring', 'Vitrified Tiles', 'Double charge, 2x2', 'sqft', 55, 80, 120, 'Nagpur'),
('flooring', 'Engineered Wood', 'Oak, 14mm click-lock', 'sqft', 250, 320, 450, 'Nagpur'),
('wall_finish', 'Premium Emulsion Paint', 'Asian Paints Royale, 2 coats', 'sqft', 35, 45, 65, 'Nagpur'),
('wall_finish', 'WPC Wall Paneling', '8mm panels, walnut finish', 'sqft', 180, 250, 380, 'Nagpur'),
('wall_finish', 'Wallpaper', 'Imported, non-woven', 'sqft', 80, 150, 300, 'Nagpur'),
('ceiling', 'Gypsum False Ceiling', '12.5mm board with cove', 'sqft', 90, 120, 180, 'Nagpur'),
('ceiling', 'POP Ceiling', 'Plain with cornice', 'sqft', 70, 95, 130, 'Nagpur'),
('furniture', 'Modular Kitchen', 'Marine ply, acrylic finish', 'rft', 3500, 4500, 7000, 'Nagpur'),
('furniture', 'Wardrobe - Sliding', 'BWP plywood, laminate', 'sqft', 1200, 1500, 2200, 'Nagpur'),
('electrical', 'LED Downlight 12W', 'Philips, warm white', 'nos', 600, 850, 1200, 'Nagpur'),
('electrical', 'LED Strip Light', '14.4W/m, with driver', 'rft', 120, 180, 280, 'Nagpur'),
('plumbing', 'CP Fittings Set', 'Bathroom set, Jaquar', 'set', 8000, 15000, 30000, 'Nagpur'),
('kitchen', 'Granite Countertop', 'Black Galaxy, 20mm', 'rft', 700, 950, 1500, 'Nagpur'),
('doors_windows', 'Flush Door', 'Teak frame, laminate', 'nos', 12000, 18000, 28000, 'Nagpur');
