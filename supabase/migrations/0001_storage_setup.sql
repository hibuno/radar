-- Create storage bucket for images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow anonymous users to upload images
CREATE POLICY "Allow anonymous uploads to images bucket"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'images');

-- Policy to allow anonymous users to read images
CREATE POLICY "Allow anonymous reads from images bucket"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'images');

-- Policy to allow anonymous users to update images (for upsert)
CREATE POLICY "Allow anonymous updates to images bucket"
ON storage.objects
FOR UPDATE
TO anon
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- Policy to allow anonymous users to delete images (optional)
CREATE POLICY "Allow anonymous deletes from images bucket"
ON storage.objects
FOR DELETE
TO anon
USING (bucket_id = 'images');