-- =====================================================
-- FIND YOUR USER INFORMATION
-- =====================================================
-- Run this query first to find your email and user IDs
-- Then use those values in grant-admin-pro-subscription.sql
-- =====================================================

-- Option 1: List all users (if you're not sure of your email)
SELECT 
  p."id" as profile_id,
  p."supabaseId",
  p."name",
  au.email,
  p."isAdmin",
  p."role",
  p."isPro",
  p."proStatus",
  p."createdAt"
FROM "Profile" p
LEFT JOIN auth.users au ON p."supabaseId" = au.id::text
ORDER BY p."createdAt" DESC
LIMIT 20;

-- Option 2: Find yourself by email (if you know it)
-- Replace 'YOUR_EMAIL' with your actual email
SELECT 
  p."id" as profile_id,
  p."supabaseId",
  p."name",
  au.email,
  p."isAdmin",
  p."role",
  p."isPro",
  p."proStatus",
  p."proActivatedAt",
  p."proRenewalDate"
FROM "Profile" p
JOIN auth.users au ON p."supabaseId" = au.id::text
WHERE au.email ILIKE '%YOUR_EMAIL%';

-- Option 3: Find admin users
SELECT 
  p."id" as profile_id,
  p."supabaseId",
  p."name",
  au.email,
  p."isAdmin",
  p."role",
  p."isPro"
FROM "Profile" p
JOIN auth.users au ON p."supabaseId" = au.id::text
WHERE p."isAdmin" = true OR p."role" = 'admin';

-- Option 4: Find users with Pro subscription
SELECT 
  p."id" as profile_id,
  p."name",
  au.email,
  p."isPro",
  p."proStatus",
  s."plan",
  s."provider",
  s."currentPeriodEnd"
FROM "Profile" p
JOIN auth.users au ON p."supabaseId" = au.id::text
LEFT JOIN "ProSubscription" s ON s."userId" = p."id"
WHERE p."isPro" = true;

-- =====================================================
-- AFTER YOU FIND YOUR INFO
-- =====================================================
/*
Once you identify your email from the queries above:

1. Copy your email address
2. Open: grant-admin-pro-subscription.sql
3. Replace 'YOUR_EMAIL@example.com' with your actual email
4. Run that script to grant yourself Pro subscription

Example:
If the query shows: email = 'zach@umass.edu'
Then in the other script, change:
  WHERE au.email = 'YOUR_EMAIL@example.com'
To:
  WHERE au.email = 'zach@umass.edu'
*/
