# Task: Extend Angelina BOQ into AI Quantity Surveyor

## Context
This is an existing React+Vite+TypeScript app for BOQ extraction. Extend it to work as a full AI Quantity Surveyor for UAE construction projects.

## Changes Required

### 1. Update AI Extractor for UAE (src/services/aiExtractor.ts)
- Change default rates from INR to AED (UAE Dirhams)
- Update the EXTRACTION_PROMPT to include:
  - UAE construction standards (DEWA, SEWA, Dubai Municipality)
  - CSI MasterFormat classification
  - MEP categories: HVAC, Fire Fighting, Low Current, Plumbing, Drainage
  - Add measurement standard: RICS/NRM
- Add new categories: hvac, fire_fighting, low_current, drainage, external_works, preliminaries
- Update demo extraction with UAE-relevant items and AED rates

### 2. Add UAE Rate Database (src/data/uaeRates.ts)
Create a comprehensive UAE rate database with:
```
- Civil: Concrete (grade 40/50), Blockwork (200mm/150mm), Plastering, Waterproofing
- MEP: HVAC ducting, FCU, AHU, Chiller, VRF, DX units
- Electrical: DB boards, cables (various sizes), trunking, containment, lighting
- Plumbing: PPR pipes, UPVC drainage, fixtures, pumps
- Fire Fighting: Sprinkler heads, FM200, fire alarm, smoke detectors
- Low Current: CCTV, access control, PA system, structured cabling
- Finishing: Flooring (porcelain/marble/vinyl), painting, ceiling (mineral fiber/gypsum)
- Doors & Windows: Fire rated doors, aluminum windows, automatic doors
- External: Landscaping, paving, fencing, signage
```
Each rate: { item, description, unit, rate_aed, category, subcategory }

### 3. Add QS Estimate Page (src/pages/QSEstimate.tsx)
- Full estimate view with sections:
  - Measured Works (from BOQ)
  - Preliminaries (site setup, insurance, etc.) - default 12%
  - Contingency - default 5%
  - Design Fee - default 5%
  - OH&P - default 10%
  - VAT 5% (UAE)
  - Grand Total in AED
- Editable percentages
- Currency toggle: AED / USD / INR

### 4. Add Drawing Analysis Page (src/pages/DrawingAnalysis.tsx)
- Upload multiple drawings (PDF, images)
- Show drawing preview with zoom
- AI analyzes and highlights areas
- Shows measurement takeoff results
- Supports: Floor plans, elevations, sections, MEP layouts

### 5. Update NewProject (src/pages/NewProject.tsx)
- Add "Project Location" field with UAE cities: Dubai, Abu Dhabi, Sharjah, Ajman, RAK, UAQ, Fujairah
- Add "Project Type": Commercial, Residential, Government, Industrial, Healthcare, Education, Hospitality
- Add "Currency": AED (default), USD, INR
- Add "Measurement Standard": RICS/NRM, SMM7, CSI

### 6. Update ProjectView (src/pages/ProjectView.tsx)
- Add "QS Estimate" tab alongside existing tabs
- Add "Drawing Analysis" tab
- Show estimate summary with AED formatting
- Add "Material Takeoff" sub-section

### 7. Update RatesPage (src/pages/RatesPage.tsx)
- Load from UAE rate database
- Allow user to override rates
- Filter by category, search
- Import/export rate sets

### 8. Update Layout/Navigation
- Update sidebar to include QS Estimate, Drawing Analysis links
- Update branding: "Angelina - AI Quantity Surveyor"

### 9. Add Export Enhancements
- Excel export with UAE BOQ format (CSI sections)
- PDF with company letterhead placeholder
- Add "Preliminaries" and "Summary" sheets to Excel

### 10. Footer
- Add footer: "drmhope.com | A Bettroi Product" with version

## Design
- Keep existing dark theme
- All amounts formatted as "AED 1,234.56"
- No emojis — use Lucide React icons only
- Responsive design

## Don't Change
- Keep existing auth system
- Keep existing Supabase integration
- Keep existing routing structure (just add new routes)

## Build
After changes: `npm run build` must succeed
