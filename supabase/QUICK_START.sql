-- ==========================================
-- MLFF EQUIPMENT TRACKING - QUICK START
-- ==========================================
-- This creates all tables + anonymous access policies
-- Run this ONLY if tables don't exist
-- ==========================================

-- Check: Do tables exist?
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('locations', 'equipment');

-- If you see tables above, STOP! Don't run this script.
-- Instead, run DIAGNOSE_AND_FIX.sql

-- ==========================================
-- IF NO TABLES EXIST - Run 001_initial_schema.sql first!
-- ==========================================
-- You need to run these files in order:
-- 1. 001_initial_schema.sql (creates tables)
-- 2. 002_rls_policies.sql (creates RLS policies)
-- 3. 003_indexes.sql (creates indexes)
-- 4. 004_storage_setup.sql (creates Storage buckets)
-- 5. DIAGNOSE_AND_FIX.sql (fixes anonymous access)
-- ==========================================

SELECT 'Please run migrations in this order:' AS step;
SELECT '1. 001_initial_schema.sql' AS file;
SELECT '2. 002_rls_policies.sql' AS file;
SELECT '3. 003_indexes.sql' AS file;
SELECT '4. 004_storage_setup.sql' AS file;
SELECT '5. DIAGNOSE_AND_FIX.sql (to enable anonymous access)' AS file;
