import type { AIExtractionResult, BOQCategory } from '../types/boq';

/**
 * AI Document Extractor for BOQ
 * Sends design documents to Claude API for analysis.
 * Extracts rooms, items, quantities, and estimates.
 */

const EXTRACTION_PROMPT = `You are an expert Quantity Surveyor (QS) for interior design projects.
Analyze this design document and extract a detailed Bill of Quantities (BOQ).

For each room visible in the document, identify:
1. Room name and type (bedroom, living, kitchen, bathroom, etc.)
2. Estimated area in sqft
3. All interior work items with:
   - Category (civil, flooring, wall_finish, ceiling, furniture, fixtures, electrical, plumbing, doors_windows, kitchen, decorative, miscellaneous)
   - Detailed description
   - Material specification (brand, finish, grade)
   - Unit of measurement (sqft, sqm, rft, nos, set, lot, kg, ltr, cum, bag)
   - Quantity (measured or estimated)
   - Rate per unit (in INR, based on current market rates for the specified quality)
   - Confidence level (0-100) in the extraction

Include ALL items: flooring, wall treatment, ceiling, furniture, fixtures, electrical points, 
plumbing, doors, windows, kitchen items, decorative elements.

For 3D renders: identify materials from visual appearance (marble, wood, paint color, etc.)
For 2D PDFs: extract from annotations, legends, material schedules, and dimensions.

IMPORTANT: Be thorough. A typical room BOQ has 15-30 line items. Don't miss anything.

Respond ONLY with valid JSON in this exact format:
{
  "rooms": [
    {
      "name": "Master Bedroom",
      "type": "bedroom",
      "area_sqft": 200,
      "items": [
        {
          "category": "flooring",
          "description": "Italian marble flooring - Statuario finish",
          "specification": "20mm thick, mirror polished, Statuario pattern",
          "unit": "sqft",
          "quantity": 200,
          "rate": 450,
          "confidence": 85
        }
      ]
    }
  ],
  "total_estimate": 0,
  "extraction_notes": ["Notes about assumptions made"]
}`;

export class AIExtractor {
  /**
   * Extract BOQ from a document image/PDF using AI
   */
  static async extractFromDocument(
    documentUrl: string,
    documentType: string,
    projectContext: { style?: string; total_area?: number; num_rooms?: number }
  ): Promise<AIExtractionResult> {
    const apiKey = import.meta.env.VITE_AI_API_KEY;
    
    if (!apiKey) {
      // Demo mode — return sample extraction
      console.warn('No AI API key configured, using demo extraction');
      return this.getDemoExtraction(projectContext);
    }

    const contextNote = [
      projectContext.style ? `Design style: ${projectContext.style}` : '',
      projectContext.total_area ? `Total area: ${projectContext.total_area} sqft` : '',
      projectContext.num_rooms ? `Number of rooms: ${projectContext.num_rooms}` : '',
    ].filter(Boolean).join('. ');

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: import.meta.env.VITE_AI_MODEL || 'claude-sonnet-4-20250514',
          max_tokens: 8000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'url', url: documentUrl }
              },
              {
                type: 'text',
                text: `${EXTRACTION_PROMPT}\n\nProject context: ${contextNote}\nDocument type: ${documentType}`
              }
            ]
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const content = result.content[0]?.text || '';
      
      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in AI response');
      
      const extracted: AIExtractionResult = JSON.parse(jsonMatch[0]);
      
      // Calculate total estimate
      extracted.total_estimate = extracted.rooms.reduce((roomTotal, room) => 
        roomTotal + room.items.reduce((itemTotal, item) => 
          itemTotal + (item.quantity * item.rate), 0
        ), 0
      );

      return extracted;
    } catch (error) {
      console.error('AI extraction failed:', error);
      throw error;
    }
  }

  /**
   * Demo extraction for testing without AI API key
   */
  static getDemoExtraction(context: any): AIExtractionResult {
    return {
      rooms: [
        {
          name: 'Living Room',
          type: 'living',
          area_sqft: 350,
          items: [
            { category: 'flooring' as BOQCategory, description: 'Italian marble flooring - Botticino', specification: '20mm polished, anti-skid', unit: 'sqft', quantity: 350, rate: 380, confidence: 90 },
            { category: 'wall_finish' as BOQCategory, description: 'Asian Paints Royale Luxury Emulsion', specification: 'Matte finish, 2 coats + primer', unit: 'sqft', quantity: 840, rate: 45, confidence: 85 },
            { category: 'wall_finish' as BOQCategory, description: 'Decorative wall paneling - WPC', specification: '8mm WPC panels, walnut finish', unit: 'sqft', quantity: 120, rate: 250, confidence: 75 },
            { category: 'ceiling' as BOQCategory, description: 'Gypsum false ceiling with cove', specification: '12.5mm gypsum board, L-box cove', unit: 'sqft', quantity: 350, rate: 120, confidence: 88 },
            { category: 'electrical' as BOQCategory, description: 'LED recessed downlights 12W', specification: 'Philips, warm white 3000K', unit: 'nos', quantity: 16, rate: 850, confidence: 80 },
            { category: 'electrical' as BOQCategory, description: 'LED strip light for cove', specification: '14.4W/m, warm white, with driver', unit: 'rft', quantity: 60, rate: 180, confidence: 82 },
            { category: 'electrical' as BOQCategory, description: 'Modular switches & sockets', specification: 'Legrand Myrius, white', unit: 'nos', quantity: 12, rate: 450, confidence: 78 },
            { category: 'furniture' as BOQCategory, description: 'TV unit with storage', specification: 'Marine plywood, laminate finish, 8ft', unit: 'nos', quantity: 1, rate: 65000, confidence: 70 },
            { category: 'furniture' as BOQCategory, description: 'Display cabinet / bookshelf', specification: 'Plywood + glass, spot lit', unit: 'nos', quantity: 1, rate: 45000, confidence: 65 },
            { category: 'decorative' as BOQCategory, description: 'Curtain rod with motorized curtains', specification: 'Double track, blackout + sheer', unit: 'set', quantity: 2, rate: 18000, confidence: 72 },
          ]
        },
        {
          name: 'Master Bedroom',
          type: 'bedroom',
          area_sqft: 220,
          items: [
            { category: 'flooring' as BOQCategory, description: 'Engineered wood flooring', specification: 'Oak, 14mm, click-lock', unit: 'sqft', quantity: 220, rate: 320, confidence: 88 },
            { category: 'wall_finish' as BOQCategory, description: 'Wall paint - premium emulsion', specification: 'Dulux Velvet Touch, 2 coats', unit: 'sqft', quantity: 600, rate: 42, confidence: 86 },
            { category: 'wall_finish' as BOQCategory, description: 'Accent wall - fabric paneling', specification: 'Upholstered fabric panel behind bed', unit: 'sqft', quantity: 80, rate: 350, confidence: 70 },
            { category: 'ceiling' as BOQCategory, description: 'Gypsum false ceiling - peripheral', specification: '12.5mm board, peripheral cove only', unit: 'sqft', quantity: 220, rate: 110, confidence: 85 },
            { category: 'furniture' as BOQCategory, description: 'Wardrobe - sliding doors', specification: 'BWP plywood, laminate, 10ft x 7ft', unit: 'nos', quantity: 1, rate: 125000, confidence: 75 },
            { category: 'furniture' as BOQCategory, description: 'Bedside tables', specification: 'Matching laminate, 2 drawers each', unit: 'nos', quantity: 2, rate: 12000, confidence: 70 },
            { category: 'furniture' as BOQCategory, description: 'Dresser with mirror', specification: 'Plywood, soft-close drawers', unit: 'nos', quantity: 1, rate: 28000, confidence: 68 },
            { category: 'electrical' as BOQCategory, description: 'LED downlights 10W', specification: 'Warm white, dimmable', unit: 'nos', quantity: 10, rate: 950, confidence: 82 },
            { category: 'electrical' as BOQCategory, description: 'Bedside pendant lights', specification: 'Designer, E27', unit: 'nos', quantity: 2, rate: 3500, confidence: 65 },
            { category: 'doors_windows' as BOQCategory, description: 'Bedroom door - flush', specification: 'Teak frame, laminate skin, 7ft x 3ft', unit: 'nos', quantity: 1, rate: 18000, confidence: 80 },
            { category: 'decorative' as BOQCategory, description: 'Blackout roller blinds', specification: 'Motorized, custom size', unit: 'nos', quantity: 2, rate: 8500, confidence: 75 },
          ]
        },
        {
          name: 'Kitchen',
          type: 'kitchen',
          area_sqft: 120,
          items: [
            { category: 'kitchen' as BOQCategory, description: 'Modular kitchen - L-shaped', specification: 'Marine ply, acrylic finish, soft-close', unit: 'rft', quantity: 18, rate: 4500, confidence: 82 },
            { category: 'kitchen' as BOQCategory, description: 'Kitchen countertop - granite', specification: 'Black galaxy, 20mm, bullnose edge', unit: 'rft', quantity: 18, rate: 950, confidence: 85 },
            { category: 'kitchen' as BOQCategory, description: 'Kitchen backsplash tiles', specification: 'Ceramic subway tiles, white', unit: 'sqft', quantity: 45, rate: 120, confidence: 80 },
            { category: 'kitchen' as BOQCategory, description: 'Chimney - auto-clean', specification: 'Elica/Faber, 90cm, 1200 m3/hr', unit: 'nos', quantity: 1, rate: 22000, confidence: 78 },
            { category: 'kitchen' as BOQCategory, description: 'Built-in hob - 4 burner', specification: 'Bosch/Elica, tempered glass', unit: 'nos', quantity: 1, rate: 18000, confidence: 76 },
            { category: 'fixtures' as BOQCategory, description: 'Kitchen sink - double bowl', specification: 'Stainless steel, Franke/Carysil', unit: 'nos', quantity: 1, rate: 12000, confidence: 80 },
            { category: 'fixtures' as BOQCategory, description: 'Kitchen tap - pull-out', specification: 'SS, single lever, Grohe', unit: 'nos', quantity: 1, rate: 8500, confidence: 75 },
            { category: 'flooring' as BOQCategory, description: 'Anti-skid vitrified tiles', specification: '2x2, matte, double charge', unit: 'sqft', quantity: 120, rate: 95, confidence: 85 },
            { category: 'electrical' as BOQCategory, description: 'Under-cabinet LED strip', specification: 'Warm white, with sensor', unit: 'rft', quantity: 12, rate: 200, confidence: 72 },
          ]
        }
      ],
      total_estimate: 0, // Will be calculated
      extraction_notes: [
        'Rates based on Nagpur/Pune market prices as of 2026',
        'Demo extraction — upload actual design documents for AI-powered extraction',
        'Quantities estimated from typical room sizes',
        'Material specifications are suggested based on style context'
      ]
    };
  }
}
