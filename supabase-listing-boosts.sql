-- =====================================================
-- LISTING BOOSTS (PAID PROMOTION)
-- =====================================================
-- Allows sellers to pay $1 for 24-hour boosts that improve
-- homepage ranking. Pro members can boost with zero cost.
-- =====================================================

ALTER TABLE "Listing"
  ADD COLUMN IF NOT EXISTS "boostedUntil" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "boostedByPro" BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS "ListingBoost" (
  "id" SERIAL PRIMARY KEY,
  "listingId" INTEGER NOT NULL REFERENCES "Listing"("id") ON DELETE CASCADE,
  "userId" INTEGER NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "priceCents" INTEGER NOT NULL DEFAULT 100,
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "source" TEXT NOT NULL DEFAULT 'manual',
  "status" TEXT NOT NULL DEFAULT 'paid',
  "startsAt" TIMESTAMPTZ NOT NULL,
  "endsAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "metadata" JSONB
);

CREATE INDEX IF NOT EXISTS "idx_listing_boost_listing" ON "ListingBoost"("listingId");
CREATE INDEX IF NOT EXISTS "idx_listing_boost_active" ON "ListingBoost"("endsAt");

ALTER TABLE "ListingBoost" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ListingBoost'
      AND policyname = 'Listing owners can view boosts'
  ) THEN
    EXECUTE 'CREATE POLICY "Listing owners can view boosts"
      ON "ListingBoost" FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM "Listing"
          JOIN "Profile" ON "Listing"."sellerId" = "Profile"."id"
          WHERE "Listing"."id" = "ListingBoost"."listingId"
          AND "Profile"."supabaseId" = auth.uid()::text
        )
      )';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ListingBoost'
      AND policyname = 'Listing owners can manage boosts'
  ) THEN
    EXECUTE 'CREATE POLICY "Listing owners can manage boosts"
      ON "ListingBoost" FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM "Listing"
          JOIN "Profile" ON "Listing"."sellerId" = "Profile"."id"
          WHERE "Listing"."id" = "ListingBoost"."listingId"
          AND "Profile"."supabaseId" = auth.uid()::text
        )
      )';
  END IF;
END
$$;

COMMENT ON TABLE "ListingBoost" IS 'Tracks paid boosts for listings (24h promotion slots)';
COMMENT ON COLUMN "Listing"."boostedUntil" IS 'Timestamp until which the listing is promoted';
