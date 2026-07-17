-- Add creator (public) shipping address fields to users table.
-- Run once in the Supabase SQL editor.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS creator_street_address TEXT,
  ADD COLUMN IF NOT EXISTS creator_city           TEXT,
  ADD COLUMN IF NOT EXISTS creator_state          TEXT,
  ADD COLUMN IF NOT EXISTS creator_zip_code       TEXT;
