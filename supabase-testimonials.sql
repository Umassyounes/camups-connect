-- Create Testimonial table for website reviews/feedback
-- Auto-approved after passing Sightengine moderation
CREATE TABLE IF NOT EXISTS "Testimonial" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL CHECK (char_length(comment) <= 500),
  "isApproved" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for filtering approved testimonials
CREATE INDEX IF NOT EXISTS idx_testimonial_approved ON "Testimonial"("isApproved", "createdAt" DESC);

-- Add RLS policies
ALTER TABLE "Testimonial" ENABLE ROW LEVEL SECURITY;

-- Public can read approved testimonials
CREATE POLICY "Anyone can view approved testimonials"
  ON "Testimonial"
  FOR SELECT
  USING ("isApproved" = true);

-- Anyone can submit a testimonial (will require approval)
CREATE POLICY "Anyone can submit testimonials"
  ON "Testimonial"
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can delete testimonials (for moderation purposes)
CREATE POLICY "Admins can delete testimonials"
  ON "Testimonial"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "Profile"
      WHERE "Profile"."supabaseId" = auth.uid()::text
      AND "Profile"."isAdmin" = true
    )
  );
