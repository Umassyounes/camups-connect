-- =============================================
-- SAVED/FAVORITED LISTINGS FEATURE
-- Run this in your Supabase SQL Editor
-- =============================================

-- Create SavedListing table
CREATE TABLE IF NOT EXISTS "SavedListing" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "listingId" INTEGER NOT NULL REFERENCES "Listing"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure a user can only save a listing once
  UNIQUE ("userId", "listingId")
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_saved_listing_user" ON "SavedListing"("userId");
CREATE INDEX IF NOT EXISTS "idx_saved_listing_listing" ON "SavedListing"("listingId");
CREATE INDEX IF NOT EXISTS "idx_saved_listing_created" ON "SavedListing"("createdAt" DESC);

-- Enable RLS
ALTER TABLE "SavedListing" ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own saved listings
CREATE POLICY "Users can view own saved listings"
  ON "SavedListing"
  FOR SELECT
  USING (
    "userId" IN (
      SELECT id FROM "Profile" WHERE "supabaseId" = auth.uid()::text
    )
  );

-- Users can save listings (insert)
CREATE POLICY "Users can save listings"
  ON "SavedListing"
  FOR INSERT
  WITH CHECK (
    "userId" IN (
      SELECT id FROM "Profile" WHERE "supabaseId" = auth.uid()::text
    )
  );

-- Users can unsave their own listings (delete)
CREATE POLICY "Users can unsave own listings"
  ON "SavedListing"
  FOR DELETE
  USING (
    "userId" IN (
      SELECT id FROM "Profile" WHERE "supabaseId" = auth.uid()::text
    )
  );

-- Grant permissions
GRANT ALL ON "SavedListing" TO authenticated;
GRANT SELECT ON "SavedListing" TO anon;
GRANT USAGE, SELECT ON SEQUENCE "SavedListing_id_seq" TO authenticated;

-- =============================================
-- Verify the table was created
-- =============================================
SELECT 'SavedListing table created successfully!' as status;
