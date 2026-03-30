-- ============================================
-- CriativImob — Gemini Integration Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create prompt_categories table
CREATE TABLE IF NOT EXISTS prompt_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  prompt_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Seed initial categories
INSERT INTO prompt_categories (slug, label, description, prompt_template) VALUES
  ('luxo', 'Imóvel de Luxo', 'Propriedades de alto padrão e sofisticadas',
   'Create a luxury real estate advertisement image. Ultra high-end property with premium finishes, sophisticated warm lighting, elegant architecture, marble and gold accents. {property_details}. Brand context: {briefing}. Style: clean, editorial, aspirational, magazine-quality. Format: {format}.'),

  ('lancamento', 'Lançamento', 'Empreendimentos novos em pré-venda',
   'Create a real estate launch campaign image. Modern architecture with fresh construction, vibrant community spaces, contemporary design, bright and optimistic mood. {property_details}. Brand context: {briefing}. Style: contemporary, exciting, investment-focused, professional. Format: {format}.'),

  ('praia', 'Praia', 'Imóveis litorâneos e costeiros',
   'Create a beachfront property advertisement image. Stunning ocean views, coastal lifestyle, tropical vegetation, golden sunset lighting, crystal blue water. {property_details}. Brand context: {briefing}. Style: relaxing, aspirational, lifestyle-focused, warm tones. Format: {format}.'),

  ('centro', 'Centro / Urbano', 'Imóveis em região central e urbana',
   'Create a downtown urban property advertisement image. City skyline backdrop, urban convenience, modern infrastructure, night city lights, sophisticated urban living. {property_details}. Brand context: {briefing}. Style: metropolitan, connected, dynamic, modern. Format: {format}.'),

  ('campo', 'Campo / Chácara', 'Imóveis rurais e sítios',
   'Create a countryside property advertisement image. Lush green landscapes, tranquility, nature surroundings, spacious open areas, rustic charm with modern comfort. {property_details}. Brand context: {briefing}. Style: peaceful, natural, family-oriented, warm. Format: {format}.'),

  ('comercial', 'Comercial', 'Salas comerciais e pontos de negócio',
   'Create a commercial property advertisement image. Professional business environment, strategic location visualization, modern office spaces, corporate aesthetic. {property_details}. Brand context: {briefing}. Style: professional, strategic, ROI-focused, clean. Format: {format}.')
ON CONFLICT (slug) DO NOTHING;

-- 3. RLS for prompt_categories
ALTER TABLE prompt_categories ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read active categories
CREATE POLICY "Authenticated users can read active categories"
  ON prompt_categories FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Service role has full access (for admin API)
-- No explicit policy needed — service role bypasses RLS

-- 4. Add briefing columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS company_description TEXT,
  ADD COLUMN IF NOT EXISTS brand_personality TEXT,
  ADD COLUMN IF NOT EXISTS target_audience TEXT,
  ADD COLUMN IF NOT EXISTS preferred_style TEXT;

-- 5. Add variation/copy columns to creatives
ALTER TABLE creatives
  ADD COLUMN IF NOT EXISTS generated_copy TEXT,
  ADD COLUMN IF NOT EXISTS variation_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS variation_group_id UUID;

-- 6. Create storage bucket for generated creatives (if not exists)
-- Note: Run this via Supabase Dashboard > Storage > New Bucket
-- Bucket name: "creatives"
-- Public: true

-- Done!
