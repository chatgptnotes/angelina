// BOQ (Bill of Quantities) Types

export interface BOQProject {
  id: string;
  name: string;
  client: string;
  location?: string;
  style?: 'Mediterranean' | 'Minimalistic' | 'Luxurious' | 'Modern' | 'Classic' | 'Industrial' | 'Other';
  total_area_sqft?: number;
  num_rooms?: number;
  status: 'draft' | 'processing' | 'review' | 'approved' | 'sent';
  created_at: string;
  updated_at: string;
  total_estimate?: number;
  currency: string;
}

export interface BOQRoom {
  id: string;
  project_id: string;
  name: string; // e.g., "Master Bedroom", "Living Room", "Kitchen"
  type: 'bedroom' | 'living' | 'kitchen' | 'bathroom' | 'dining' | 'office' | 'balcony' | 'corridor' | 'other';
  area_sqft?: number;
  floor_level?: number;
  ceiling_height_ft?: number;
  order: number;
}

export interface BOQItem {
  id: string;
  project_id: string;
  room_id?: string;
  category: BOQCategory;
  sub_category?: string;
  description: string;
  specification?: string; // Material spec, brand, finish
  unit: 'sqft' | 'sqm' | 'rft' | 'nos' | 'set' | 'lot' | 'kg' | 'ltr' | 'cum' | 'bag';
  quantity: number;
  rate: number;
  amount: number; // quantity * rate
  notes?: string;
  source: 'ai_extracted' | 'manual' | 'template';
  confidence?: number; // AI confidence 0-100
  order: number;
}

export type BOQCategory =
  | 'civil'        // Demolition, masonry, plastering, waterproofing
  | 'flooring'     // Tiles, marble, wood, vinyl, carpet
  | 'wall_finish'  // Paint, wallpaper, cladding, paneling
  | 'ceiling'      // False ceiling, POP, gypsum, wood
  | 'furniture'    // Wardrobes, cabinets, tables, beds, sofas
  | 'fixtures'     // Sanitary, bathroom fittings, kitchen sink
  | 'electrical'   // Wiring, switches, lights, fans, AC
  | 'plumbing'     // Pipes, fittings, water heater, drainage
  | 'doors_windows' // Doors, windows, hardware, glass
  | 'kitchen'      // Modular kitchen, countertop, chimney, hob
  | 'decorative'   // Curtains, blinds, art, mirrors, accessories
  | 'hvac'         // HVAC ducting, FCU, AHU, Chiller, VRF
  | 'fire_fighting' // Sprinklers, FM200, fire alarm, smoke detectors
  | 'low_current'  // CCTV, access control, PA system, structured cabling
  | 'drainage'     // UPVC drainage, manholes, grease traps
  | 'external_works' // Landscaping, paving, fencing, signage
  | 'preliminaries' // Site setup, insurance, bonds, mobilization
  | 'miscellaneous';

export interface BOQDocument {
  id: string;
  project_id: string;
  filename: string;
  file_url: string;
  file_type: '2d_pdf' | '3d_render' | 'floor_plan' | 'elevation' | 'material_sheet' | 'mood_board' | 'other';
  file_size: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  extracted_data?: any; // Raw AI extraction output
  created_at: string;
}

export interface BOQTemplate {
  id: string;
  name: string;
  style: string;
  items: Omit<BOQItem, 'id' | 'project_id' | 'room_id' | 'amount'>[];
}

export interface BOQExport {
  format: 'excel' | 'pdf';
  include_rooms: boolean;
  include_specifications: boolean;
  include_notes: boolean;
  group_by: 'room' | 'category';
}

// AI Extraction types
export interface AIExtractionRequest {
  document_id: string;
  document_url: string;
  document_type: string;
  project_context: {
    style?: string;
    total_area?: number;
    num_rooms?: number;
  };
}

export interface AIExtractionResult {
  rooms: {
    name: string;
    type: string;
    area_sqft?: number;
    items: {
      category: BOQCategory;
      description: string;
      specification?: string;
      unit: string;
      quantity: number;
      rate: number;
      confidence: number;
    }[];
  }[];
  total_estimate: number;
  extraction_notes: string[];
}
