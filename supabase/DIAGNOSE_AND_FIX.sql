-- ==========================================
-- MLFF EQUIPMENT TRACKING - DIAGNOSIS & FIX
-- ==========================================
-- This script checks your Supabase setup and fixes common issues
-- Run this in Supabase SQL Editor
-- ==========================================

-- STEP 1: Check if tables exist
-- ==========================================
SELECT 'STEP 1: Checking tables...' AS status;

SELECT
    table_name,
    CASE
        WHEN table_name IN ('locations', 'equipment', 'documents', 'maintenance', 'audit_log', 'custom_types')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END AS status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('locations', 'equipment', 'documents', 'maintenance', 'audit_log', 'custom_types')
ORDER BY table_name;

-- STEP 2: Check locations table columns
-- ==========================================
SELECT 'STEP 2: Checking locations columns...' AS status;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'locations'
ORDER BY ordinal_position;

-- STEP 3: Check equipment table columns
-- ==========================================
SELECT 'STEP 3: Checking equipment columns...' AS status;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'equipment'
ORDER BY ordinal_position;

-- STEP 4: Check RLS policies for anonymous access
-- ==========================================
SELECT 'STEP 4: Checking RLS policies...' AS status;

SELECT
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    CASE
        WHEN 'anon' = ANY(roles) OR 'public' = ANY(roles) THEN '✅ ALLOWS ANONYMOUS'
        ELSE '❌ BLOCKS ANONYMOUS'
    END AS anonymous_access
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('locations', 'equipment', 'documents', 'maintenance')
ORDER BY tablename, cmd;

-- STEP 5: Check Storage buckets
-- ==========================================
SELECT 'STEP 5: Checking Storage buckets...' AS status;

SELECT
    name AS bucket_name,
    public,
    CASE
        WHEN public THEN '✅ PUBLIC'
        ELSE '⚠️ PRIVATE'
    END AS access_type
FROM storage.buckets
WHERE name IN ('location-photos', 'equipment-photos', 'equipment-documents');

-- STEP 6: Check Storage RLS policies
-- ==========================================
SELECT 'STEP 6: Checking Storage RLS policies...' AS status;

SELECT
    policyname,
    cmd AS operation,
    CASE
        WHEN policyname LIKE '%public%' OR policyname LIKE '%anon%' THEN '✅ ALLOWS ANONYMOUS'
        WHEN policyname LIKE '%authenticated%' THEN '❌ BLOCKS ANONYMOUS'
        ELSE '⚠️ UNKNOWN'
    END AS status
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;

-- ==========================================
-- STEP 7: FIX - Enable RLS on all tables (if not enabled)
-- ==========================================
SELECT 'STEP 7: Enabling RLS on tables...' AS status;

ALTER TABLE IF EXISTS locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS custom_types ENABLE ROW LEVEL SECURITY;

SELECT '✅ RLS enabled on all tables' AS result;

-- ==========================================
-- STEP 8: FIX - Create PERMISSIVE anonymous policies
-- ==========================================
SELECT 'STEP 8: Creating anonymous access policies...' AS status;

-- Drop old restrictive policies
DROP POLICY IF EXISTS "locations_authenticated_select" ON locations;
DROP POLICY IF EXISTS "locations_authenticated_insert" ON locations;
DROP POLICY IF EXISTS "locations_authenticated_update" ON locations;
DROP POLICY IF EXISTS "locations_authenticated_delete" ON locations;

DROP POLICY IF EXISTS "equipment_authenticated_select" ON equipment;
DROP POLICY IF EXISTS "equipment_authenticated_insert" ON equipment;
DROP POLICY IF EXISTS "equipment_authenticated_update" ON equipment;
DROP POLICY IF EXISTS "equipment_authenticated_delete" ON equipment;

DROP POLICY IF EXISTS "documents_authenticated_select" ON documents;
DROP POLICY IF EXISTS "documents_authenticated_insert" ON documents;
DROP POLICY IF EXISTS "documents_authenticated_update" ON documents;
DROP POLICY IF EXISTS "documents_authenticated_delete" ON documents;

DROP POLICY IF EXISTS "maintenance_authenticated_select" ON maintenance;
DROP POLICY IF EXISTS "maintenance_authenticated_insert" ON maintenance;
DROP POLICY IF EXISTS "maintenance_authenticated_update" ON maintenance;
DROP POLICY IF EXISTS "maintenance_authenticated_delete" ON maintenance;

-- Create new PERMISSIVE anonymous policies for locations
CREATE POLICY "locations_public_select" ON locations FOR SELECT USING (true);
CREATE POLICY "locations_public_insert" ON locations FOR INSERT WITH CHECK (true);
CREATE POLICY "locations_public_update" ON locations FOR UPDATE USING (true);
CREATE POLICY "locations_public_delete" ON locations FOR DELETE USING (true);

-- Create new PERMISSIVE anonymous policies for equipment
CREATE POLICY "equipment_public_select" ON equipment FOR SELECT USING (true);
CREATE POLICY "equipment_public_insert" ON equipment FOR INSERT WITH CHECK (true);
CREATE POLICY "equipment_public_update" ON equipment FOR UPDATE USING (true);
CREATE POLICY "equipment_public_delete" ON equipment FOR DELETE USING (true);

-- Create new PERMISSIVE anonymous policies for documents
CREATE POLICY "documents_public_select" ON documents FOR SELECT USING (true);
CREATE POLICY "documents_public_insert" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "documents_public_update" ON documents FOR UPDATE USING (true);
CREATE POLICY "documents_public_delete" ON documents FOR DELETE USING (true);

-- Create new PERMISSIVE anonymous policies for maintenance
CREATE POLICY "maintenance_public_select" ON maintenance FOR SELECT USING (true);
CREATE POLICY "maintenance_public_insert" ON maintenance FOR INSERT WITH CHECK (true);
CREATE POLICY "maintenance_public_update" ON maintenance FOR UPDATE USING (true);
CREATE POLICY "maintenance_public_delete" ON maintenance FOR DELETE USING (true);

SELECT '✅ Anonymous access policies created' AS result;

-- ==========================================
-- STEP 9: Test queries
-- ==========================================
SELECT 'STEP 9: Testing queries...' AS status;

-- Test SELECT
SELECT COUNT(*) AS location_count FROM locations;
SELECT COUNT(*) AS equipment_count FROM equipment;

-- ==========================================
-- DIAGNOSIS COMPLETE
-- ==========================================
SELECT '🎉 Diagnosis and fixes complete!' AS status;
SELECT 'If you still get 400 errors, check the output above for missing tables or columns.' AS note;
