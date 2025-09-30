-- Alternative Supabase Storage setup (Simplified for development)
-- Run this if the main setup still has issues

-- Create the storage bucket for product images (simple version)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Disable RLS temporarily for development (WARNING: Only for development!)
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Or use very permissive policies:
DROP POLICY IF EXISTS "Allow all for product images" ON storage.objects;

CREATE POLICY "Allow all for product images" 
ON storage.objects 
USING (bucket_id = 'product-images');

-- Alternative: Enable RLS with permissive policy
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permissive product images policy" ON storage.objects;

CREATE POLICY "Permissive product images policy" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'product-images');