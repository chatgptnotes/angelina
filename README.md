# Angelina BOQ — AI Interior Design Estimation

> Replaces human Quantity Surveyors (QS). Reduces estimation from **1 week to 1 day**.

## What it does

1. **Upload** 3D renders or 2D design documents (PDF floor plans, elevations, material sheets)
2. **AI extracts** Bill of Quantities — identifies rooms, materials, quantities, specifications
3. **Review & edit** the extracted BOQ in a structured table
4. **Export** as Excel or PDF for client sharing

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase (Postgres + Storage + Auth)
- **AI:** Claude API for document understanding and BOQ extraction
- **Export:** xlsx library for Excel generation

## Setup

```bash
npm install
cp .env.example .env  # Add your Supabase + AI API keys
npm run dev
```

Run `supabase/schema.sql` in Supabase SQL Editor to create tables.

## Project Structure

```
src/
  types/boq.ts          — TypeScript types for BOQ data model
  services/
    supabase.ts         — Supabase client
    boqService.ts       — CRUD operations for projects, rooms, items, documents
    aiExtractor.ts      — AI document analysis + BOQ extraction
  pages/
    Dashboard.tsx       — Project listing + stats
    NewProject.tsx      — Create new BOQ project
    ProjectView.tsx     — Full BOQ view with rooms, items, upload, export
  components/
    Layout.tsx          — App shell with navigation
```

## BOQ Categories

Civil | Flooring | Wall Finish | Ceiling | Furniture | Fixtures | Electrical | Plumbing | Doors & Windows | Kitchen | Decorative | Miscellaneous

## Client: Angelina (BNI Network)
