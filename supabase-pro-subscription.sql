-- =====================================================
-- PRO SUBSCRIPTION & MONETIZATION SYSTEM
-- =====================================================
-- Provides support for paid Pro accounts, featured perks,
-- and future monetization add-ons (boosts, sponsorships).
-- =====================================================

-- =====================================================
-- 1. ENUMS
-- =====================================================

CREATE TYPE pro_plan_type AS ENUM ('pro_monthly');
CREATE TYPE pro_subscription_status AS ENUM ('none', 'active', 'grace', 'past_due', 'cancelled');

-- =====================================================
-- 2. PROFILE ENHANCEMENTS
-- =====================================================

ALTER TABLE "Profile"
  ADD COLUMN IF NOT EXISTS "isPro" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "proStatus" pro_subscription_status DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS "proPlan" pro_plan_type,
  ADD COLUMN IF NOT EXISTS "proActivatedAt" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "proRenewalDate" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "proCancelledAt" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "proAutoRenew" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "proHomepageEligible" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "proUnlimitedBoosts" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "proFeaturedCredits" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "proBoostCredits" INTEGER DEFAULT 0;

-- =====================================================
-- 3. SUBSCRIPTION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS "ProSubscription" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "plan" pro_plan_type NOT NULL,
  "status" pro_subscription_status NOT NULL DEFAULT 'active',
  "provider" TEXT NOT NULL DEFAULT 'manual',
  "providerCustomerId" TEXT,
  "providerSubscriptionId" TEXT,
  "priceCents" INTEGER NOT NULL DEFAULT 499,
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "billingInterval" TEXT NOT NULL DEFAULT 'month',
  "currentPeriodStart" TIMESTAMPTZ NOT NULL,
  "currentPeriodEnd" TIMESTAMPTZ NOT NULL,
  "cancelAtPeriodEnd" BOOLEAN DEFAULT false,
  "canceledAt" TIMESTAMPTZ,
  "metadata" JSONB,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_pro_subscription_user" ON "ProSubscription"("userId");
CREATE INDEX IF NOT EXISTS "idx_pro_subscription_status" ON "ProSubscription"("status");

-- =====================================================
-- 4. FEATURED SLOT TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS "FeaturedListingSlot" (
  "id" SERIAL PRIMARY KEY,
  "listingId" INTEGER NOT NULL REFERENCES "Listing"("id") ON DELETE CASCADE,
  "userId" INTEGER NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "slotType" TEXT NOT NULL DEFAULT 'homepage',
  "startsAt" TIMESTAMPTZ NOT NULL,
  "endsAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "createdBySubscriptionId" INTEGER REFERENCES "ProSubscription"("id")
);

CREATE INDEX IF NOT EXISTS "idx_featured_slot_active" ON "FeaturedListingSlot"("slotType", "startsAt", "endsAt");
CREATE INDEX IF NOT EXISTS "idx_featured_slot_listing" ON "FeaturedListingSlot"("listingId");

-- =====================================================
-- 5. RLS POLICIES
-- =====================================================

ALTER TABLE "ProSubscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FeaturedListingSlot" ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view their pro subscriptions"
  ON "ProSubscription" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Profile"
      WHERE "Profile"."id" = "ProSubscription"."userId"
      AND "Profile"."supabaseId" = auth.uid()::text
    )
  );

-- Users can create subscription records for themselves
CREATE POLICY "Users can start pro subscriptions"
  ON "ProSubscription" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Profile"
      WHERE "Profile"."id" = "ProSubscription"."userId"
      AND "Profile"."supabaseId" = auth.uid()::text
    )
  );

-- Users can manage active subscriptions they own
CREATE POLICY "Users can update their pro subscriptions"
  ON "ProSubscription" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Profile"
      WHERE "Profile"."id" = "ProSubscription"."userId"
      AND "Profile"."supabaseId" = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Profile"
      WHERE "Profile"."id" = "ProSubscription"."userId"
      AND "Profile"."supabaseId" = auth.uid()::text
    )
  );

-- Featured slots: public can read, owners can manage
CREATE POLICY "Anyone can view featured slots"
  ON "FeaturedListingSlot" FOR SELECT
  USING (true);

CREATE POLICY "Pro owners manage their featured slots"
  ON "FeaturedListingSlot" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Profile"
      WHERE "Profile"."id" = "FeaturedListingSlot"."userId"
      AND "Profile"."supabaseId" = auth.uid()::text
    )
  );

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_pro_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pro_subscription_updated_at
  BEFORE UPDATE ON "ProSubscription"
  FOR EACH ROW
  EXECUTE FUNCTION update_pro_subscription_updated_at();

-- =====================================================
-- 7. COMMENTS
-- =====================================================

COMMENT ON TABLE "ProSubscription" IS 'Tracks paid Pro memberships per user';
COMMENT ON TABLE "FeaturedListingSlot" IS 'Schedules homepage/feature placements for listings';
COMMENT ON COLUMN "Profile"."isPro" IS 'Indicates if user currently has an active Pro subscription';

-- =====================================================
-- END
-- =====================================================
