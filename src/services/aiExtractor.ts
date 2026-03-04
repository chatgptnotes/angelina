import type { AIExtractionResult, BOQCategory } from '../types/boq';

/**
 * AI Document Extractor for BOQ
 * Sends design documents to Claude API for analysis.
 * Extracts rooms, items, quantities, and estimates.
 * Configured for UAE construction standards and AED currency.
 */

const EXTRACTION_PROMPT = `You are an expert Quantity Surveyor (QS) specializing in UAE construction projects.
Analyze this design document and extract a detailed Bill of Quantities (BOQ).

Standards & References:
- UAE construction standards: DEWA, SEWA, Dubai Municipality regulations
- Classification: CSI MasterFormat
- Measurement standard: RICS/NRM (New Rules of Measurement)
- MEP categories: HVAC, Fire Fighting, Low Current, Plumbing, Drainage

For each room/area visible in the document, identify:
1. Room/area name and type
2. Estimated area in sqft
3. All work items with:
   - Category (civil, flooring, wall_finish, ceiling, furniture, fixtures, electrical, plumbing, doors_windows, kitchen, decorative, hvac, fire_fighting, low_current, drainage, external_works, preliminaries, miscellaneous)
   - Detailed description
   - Material specification (brand, finish, grade per UAE market)
   - Unit of measurement (sqft, sqm, rft, nos, set, lot, kg, ltr, cum, bag)
   - Quantity (measured or estimated)
   - Rate per unit (in AED, based on current UAE market rates)
   - Confidence level (0-100) in the extraction

Include ALL items: civil works, flooring, wall treatment, ceiling, furniture, fixtures, electrical,
plumbing, HVAC, fire fighting, low current systems, doors, windows, external works.

For 3D renders: identify materials from visual appearance (marble, wood, paint color, etc.)
For 2D PDFs: extract from annotations, legends, material schedules, and dimensions.
For MEP layouts: identify equipment, piping, ducting, cable routes.

IMPORTANT: Be thorough. A typical room BOQ has 15-30 line items. Don't miss anything.
All rates must be in AED (UAE Dirhams).

Respond ONLY with valid JSON in this exact format:
{
  "rooms": [
    {
      "name": "Reception Lobby",
      "type": "living",
      "area_sqft": 500,
      "items": [
        {
          "category": "flooring",
          "description": "Porcelain floor tiles - polished",
          "specification": "800x800mm rectified, anti-slip R10",
          "unit": "sqm",
          "quantity": 46,
          "rate": 250,
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
      // Demo mode - return sample extraction
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
   * Uses UAE-relevant items and AED rates
   */
  static getDemoExtraction(context: any): AIExtractionResult {
    return {
      rooms: [
        {
          name: 'Reception Lobby',
          type: 'living',
          area_sqft: 500,
          items: [
            { category: 'flooring' as BOQCategory, description: 'Porcelain floor tiles - polished', specification: '800x800mm rectified, anti-slip R10', unit: 'sqm', quantity: 46, rate: 250, confidence: 90 },
            { category: 'wall_finish' as BOQCategory, description: 'Wall paint - premium emulsion', specification: 'Jotun Majestic, 2 coats + primer', unit: 'sqm', quantity: 120, rate: 25, confidence: 85 },
            { category: 'wall_finish' as BOQCategory, description: 'Feature wall - stone cladding', specification: 'Natural stone veneer, beige travertine', unit: 'sqm', quantity: 15, rate: 380, confidence: 75 },
            { category: 'ceiling' as BOQCategory, description: 'Gypsum false ceiling with cove', specification: '12.5mm gypsum board, L-box cove lighting', unit: 'sqm', quantity: 46, rate: 165, confidence: 88 },
            { category: 'electrical' as BOQCategory, description: 'LED recessed downlights 15W', specification: '4000K, IP44, dimmable', unit: 'nos', quantity: 20, rate: 120, confidence: 80 },
            { category: 'electrical' as BOQCategory, description: 'LED strip light for cove', specification: '14.4W/m, warm white, with aluminum profile', unit: 'rft', quantity: 80, rate: 35, confidence: 82 },
            { category: 'hvac' as BOQCategory, description: 'Fan Coil Unit - concealed', specification: '2-pipe, ceiling concealed, 18,000 BTU', unit: 'nos', quantity: 2, rate: 5200, confidence: 78 },
            { category: 'fire_fighting' as BOQCategory, description: 'Concealed sprinkler heads', specification: 'K5.6, white cover plate, 68C', unit: 'nos', quantity: 6, rate: 150, confidence: 80 },
            { category: 'fire_fighting' as BOQCategory, description: 'Smoke detectors', specification: 'Addressable optical with base', unit: 'nos', quantity: 3, rate: 280, confidence: 82 },
            { category: 'furniture' as BOQCategory, description: 'Reception desk - custom', specification: 'Corian top, wood veneer body, LED accent', unit: 'nos', quantity: 1, rate: 25000, confidence: 70 },
          ]
        },
        {
          name: 'Open Office Area',
          type: 'office',
          area_sqft: 1200,
          items: [
            { category: 'flooring' as BOQCategory, description: 'Carpet tiles', specification: '500x500mm, nylon, heavy commercial', unit: 'sqm', quantity: 111, rate: 95, confidence: 88 },
            { category: 'ceiling' as BOQCategory, description: 'Mineral fiber ceiling tiles', specification: '600x600mm, T-grid system, tegular edge', unit: 'sqm', quantity: 111, rate: 85, confidence: 85 },
            { category: 'electrical' as BOQCategory, description: 'LED panel lights 600x600', specification: '40W, 4000K, recessed in ceiling grid', unit: 'nos', quantity: 28, rate: 280, confidence: 86 },
            { category: 'electrical' as BOQCategory, description: 'Floor boxes - power + data', specification: '4-gang with 2x Cat6A data points', unit: 'nos', quantity: 30, rate: 650, confidence: 75 },
            { category: 'hvac' as BOQCategory, description: 'Fan Coil Units - concealed', specification: '4-pipe, ceiling concealed, 24,000 BTU', unit: 'nos', quantity: 6, rate: 5200, confidence: 80 },
            { category: 'hvac' as BOQCategory, description: 'GI Ducting supply and return', specification: 'Galvanized iron, insulated, with grilles', unit: 'kg', quantity: 800, rate: 32, confidence: 72 },
            { category: 'fire_fighting' as BOQCategory, description: 'Pendant sprinkler heads', specification: 'K5.6, chrome finish, 68C', unit: 'nos', quantity: 14, rate: 85, confidence: 82 },
            { category: 'low_current' as BOQCategory, description: 'Structured cabling - Cat6A', specification: 'Single data point, tested and certified', unit: 'nos', quantity: 60, rate: 350, confidence: 78 },
            { category: 'low_current' as BOQCategory, description: 'CCTV dome cameras', specification: 'IP 4MP, IR, PoE, indoor', unit: 'nos', quantity: 4, rate: 850, confidence: 76 },
            { category: 'furniture' as BOQCategory, description: 'Office workstations', specification: 'L-shaped modular, with pedestal', unit: 'nos', quantity: 30, rate: 3500, confidence: 72 },
            { category: 'doors_windows' as BOQCategory, description: 'Glass partition - frameless', specification: '12mm tempered glass, with door', unit: 'sqm', quantity: 25, rate: 850, confidence: 70 },
          ]
        },
        {
          name: 'Executive Office',
          type: 'office',
          area_sqft: 250,
          items: [
            { category: 'flooring' as BOQCategory, description: 'SPC vinyl plank flooring', specification: '5mm, wood grain, waterproof, click-lock', unit: 'sqm', quantity: 23, rate: 160, confidence: 88 },
            { category: 'wall_finish' as BOQCategory, description: 'Wall paneling - veneer', specification: 'Natural oak veneer on MDF, lacquered', unit: 'sqm', quantity: 18, rate: 450, confidence: 70 },
            { category: 'ceiling' as BOQCategory, description: 'Gypsum false ceiling - plain', specification: '12.5mm board, skim coat, painted', unit: 'sqm', quantity: 23, rate: 110, confidence: 85 },
            { category: 'electrical' as BOQCategory, description: 'LED downlights 15W', specification: 'Dimmable, 3000K warm white', unit: 'nos', quantity: 8, rate: 120, confidence: 82 },
            { category: 'hvac' as BOQCategory, description: 'Fan Coil Unit - concealed', specification: '2-pipe, 12,000 BTU', unit: 'nos', quantity: 1, rate: 3500, confidence: 80 },
            { category: 'low_current' as BOQCategory, description: 'Access control reader', specification: 'Proximity card with EM lock', unit: 'nos', quantity: 1, rate: 1800, confidence: 75 },
            { category: 'doors_windows' as BOQCategory, description: 'Wooden door - flush', specification: 'Hardwood frame, veneer finish, hardware', unit: 'nos', quantity: 1, rate: 2200, confidence: 80 },
            { category: 'furniture' as BOQCategory, description: 'Executive desk', specification: 'L-shaped, engineered wood, cable management', unit: 'nos', quantity: 1, rate: 8500, confidence: 68 },
            { category: 'decorative' as BOQCategory, description: 'Motorized roller blinds', specification: 'Blackout fabric, remote controlled', unit: 'nos', quantity: 2, rate: 2500, confidence: 72 },
          ]
        }
      ],
      total_estimate: 0,
      extraction_notes: [
        'Rates based on UAE market prices (AED) as of 2026',
        'Demo extraction - upload actual design documents for AI-powered extraction',
        'Quantities estimated from typical commercial fit-out specifications',
        'MEP rates include supply, installation, testing and commissioning',
        'Compliant with Dubai Municipality and DEWA standards'
      ]
    };
  }
}
