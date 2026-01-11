-- ==========================================
-- CHECK: Which version of get_upcoming_maintenance() exists?
-- ==========================================
-- Run this in Supabase SQL Editor to see the function details
-- ==========================================

-- Query 1: Check if function exists and its return type
SELECT
    p.proname AS function_name,
    pg_catalog.pg_get_function_result(p.oid) AS return_type,
    pg_catalog.pg_get_function_arguments(p.oid) AS arguments,
    pg_catalog.obj_description(p.oid, 'pg_proc') AS description
FROM pg_catalog.pg_proc p
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname = 'get_upcoming_maintenance'
  AND n.nspname = 'public';

-- ==========================================
-- Expected Results:
-- ==========================================
-- ✅ If you see "return_type: jsonb" → You have the CORRECT (008) version
-- ❌ If you see "return_type: TABLE(...)" → You have the OLD (010) version
-- ==========================================

-- Query 2: Test the function (works with both versions)
SELECT get_upcoming_maintenance();

-- ==========================================
-- If Query 2 returns data, the function is working!
-- ==========================================
