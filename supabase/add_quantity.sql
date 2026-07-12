-- Run this in Supabase Dashboard → SQL Editor
-- Adds quantity tracking to wishlist items

ALTER TABLE wishlist_items
  ADD COLUMN IF NOT EXISTS quantity        INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS purchased_count INTEGER NOT NULL DEFAULT 0;

-- Backfill: items already marked purchased get purchased_count = quantity
UPDATE wishlist_items SET purchased_count = quantity WHERE is_purchased = TRUE;
