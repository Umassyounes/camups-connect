-- =====================================================
-- CLEANUP UNUSED PAYMENT/SUBSCRIPTION TABLES
-- Run this in your Supabase SQL Editor to remove unused tables
-- =====================================================

-- WARNING: This will delete all data in these tables!
-- Make sure you have a backup if needed.

-- Drop views first (views depend on tables)
DROP VIEW IF EXISTS "ActivePaymentTransactionsView";

-- Drop functions that reference these tables
DROP FUNCTION IF EXISTS update_payment_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS log_payment_transaction_status_change() CASCADE;
DROP FUNCTION IF EXISTS ensure_single_preferred_payment_method() CASCADE;
DROP FUNCTION IF EXISTS update_pro_subscription_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_sponsored_event_slot_updated_at() CASCADE;

-- Drop triggers (should be dropped with CASCADE above, but being explicit)
DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON "PaymentMethod";
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON "PaymentTransaction";
DROP TRIGGER IF EXISTS log_payment_transaction_status ON "PaymentTransaction";
DROP TRIGGER IF EXISTS ensure_single_preferred ON "PaymentMethod";
DROP TRIGGER IF EXISTS pro_subscription_updated_at ON "ProSubscription";
DROP TRIGGER IF EXISTS sponsored_event_slot_updated_at ON "SponsoredEventSlot";

-- Drop payment system tables
DROP TABLE IF EXISTS "PaymentTransactionHistory" CASCADE;
DROP TABLE IF EXISTS "PaymentTransaction" CASCADE;
DROP TABLE IF EXISTS "ListingPaymentOption" CASCADE;
DROP TABLE IF EXISTS "PaymentMethod" CASCADE;

-- Drop pro subscription table
DROP TABLE IF EXISTS "ProSubscription" CASCADE;

-- Drop sponsored events table  
DROP TABLE IF EXISTS "SponsoredEventSlot" CASCADE;

-- Drop enum types used only by payment system
DROP TYPE IF EXISTS "payment_method_type" CASCADE;
DROP TYPE IF EXISTS "transaction_status" CASCADE;
DROP TYPE IF EXISTS "subscription_status" CASCADE;

-- Remove columns from Profile table if they exist (pro subscription related)
ALTER TABLE "Profile" 
DROP COLUMN IF EXISTS "isPro",
DROP COLUMN IF EXISTS "stripeCustomerId",
DROP COLUMN IF EXISTS "stripeSubscriptionId";

-- Remove columns from Event table if they exist (sponsored events related)
ALTER TABLE "Event"
DROP COLUMN IF EXISTS "isSponsored",
DROP COLUMN IF EXISTS "sponsoredUntil";

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check that tables are gone
SELECT 
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN (
    'PaymentMethod',
    'PaymentTransaction',
    'PaymentTransactionHistory',
    'ListingPaymentOption',
    'ProSubscription',
    'SponsoredEventSlot'
  )
ORDER BY table_name;

-- If the query above returns no rows, cleanup was successful!

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Cleanup complete! All payment/subscription tables removed.';
  RAISE NOTICE 'Your marketplace now only uses the Transaction system for recording completed sales.';
END $$;
