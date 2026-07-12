-- Run this in Supabase: Dashboard → SQL Editor → New query
-- Adds spoiler-free mode to wishlists so owners are surprised on their birthday.

ALTER TABLE wishlists
  ADD COLUMN IF NOT EXISTS spoiler_free BOOLEAN NOT NULL DEFAULT FALSE;
