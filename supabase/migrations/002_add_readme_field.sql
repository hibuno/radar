-- Add readme column for storing README content
ALTER TABLE repositories
ADD COLUMN IF NOT EXISTS readme TEXT;