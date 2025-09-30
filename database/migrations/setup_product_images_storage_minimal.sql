-- Super Simple Supabase Storage setup (No admin permissions required)
-- Run this in your Supabase SQL editor

-- Create the storage bucket for product images (minimal setup)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- That's it! No RLS policies needed for now.