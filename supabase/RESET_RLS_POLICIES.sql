-- ==========================================
-- MLFF EQUIPMENT TRACKING - RESET RLS POLICIES
-- ==========================================
-- This script completely resets all RLS policies
-- Use this if you get "policy already exists" errors
-- ==========================================

-- STEP 1: Drop ALL existing policies (authenticated AND public)
-- ==========================================
SELECT 'STEP 1: Removing all existing policies...' AS status;

-- Drop locations policies (all variants)
DROP POLICY IF EXISTS "locations_authenticated_select" ON locations;
DROP POLICY IF EXISTS "locations_authenticated_insert" ON locations;
DROP POLICY IF EXISTS "locations_authenticated_update" ON locations;
DROP POLICY IF EXISTS "locations_authenticated_delete" ON locations;
DROP POLICY IF EXISTS "locations_public_select" ON locations;
DROP POLICY IF EXISTS "locations_public_insert" ON locations;
DROP POLICY IF EXISTS "locations_public_update" ON locations;
DROP POLICY IF EXISTS "locations_public_delete" ON locations;

-- Drop equipment policies (all variants)
DROP POLICY IF EXISTS "equipment_authenticated_select" ON equipment;
DROP POLICY IF EXISTS "equipment_authenticated_insert" ON equipment;
DROP POLICY IF EXISTS "equipment_authenticated_update" ON equipment;
DROP POLICY IF EXISTS "equipment_authenticated_delete" ON equipment;
DROP POLICY IF EXISTS "equipment_public_select" ON equipment;
DROP POLICY IF EXISTS "equipment_public_insert" ON equipment;
DROP POLICY IF EXISTS "equipment_public_update" ON equipment;
DROP POLICY IF EXISTS "equipment_public_delete" ON equipment;

-- Drop documents policies (all variants)
DROP POLICY IF EXISTS "documents_authenticated_select" ON documents;
DROP POLICY IF EXISTS "documents_authenticated_insert" ON documents;
DROP POLICY IF EXISTS "documents_authenticated_update" ON documents;
DROP POLICY IF EXISTS "documents_authenticated_delete" ON documents;
DROP POLICY IF EXISTS "documents_public_select" ON documents;
DROP POLICY IF EXISTS "documents_public_insert" ON documents;
DROP POLICY IF EXISTS "documents_public_update" ON documents;
DROP POLICY IF EXISTS "documents_public_delete" ON documents;

-- Drop maintenance policies (all variants)
DROP POLICY IF EXISTS "maintenance_authenticated_select" ON maintenance;
DROP POLICY IF EXISTS "maintenance_authenticated_insert" ON maintenance;
DROP POLICY IF EXISTS "maintenance_authenticated_update" ON maintenance;
DROP POLICY IF EXISTS "maintenance_authenticated_delete" ON maintenance;
DROP POLICY IF EXISTS "maintenance_public_select" ON maintenance;
DROP POLICY IF EXISTS "maintenance_public_insert" ON maintenance;
DROP POLICY IF EXISTS "maintenance_public_update" ON maintenance;
DROP POLICY IF EXISTS "maintenance_public_delete" ON maintenance;

-- Drop audit_log policies (all variants)
DROP POLICY IF EXISTS "audit_log_authenticated_select" ON audit_log;
DROP POLICY IF EXISTS "audit_log_authenticated_insert" ON audit_log;
DROP POLICY IF EXISTS "audit_log_public_select" ON audit_log;
DROP POLICY IF EXISTS "audit_log_public_insert" ON audit_log;

-- Drop custom_types policies (all variants)
DROP POLICY IF EXISTS "custom_types_authenticated_select" ON custom_types;
DROP POLICY IF EXISTS "custom_types_authenticated_insert" ON custom_types;
DROP POLICY IF EXISTS "custom_types_authenticated_update" ON custom_types;
DROP POLICY IF EXISTS "custom_types_authenticated_delete" ON custom_types;
DROP POLICY IF EXISTS "custom_types_public_select" ON custom_types;
DROP POLICY IF EXISTS "custom_types_public_insert" ON custom_types;
DROP POLICY IF EXISTS "custom_types_public_update" ON custom_types;
DROP POLICY IF EXISTS "custom_types_public_delete" ON custom_types;

SELECT '✅ All old policies removed' AS result;

-- STEP 2: Ensure RLS is enabled
-- ==========================================
SELECT 'STEP 2: Enabling RLS on all tables...' AS status;

ALTER TABLE IF EXISTS locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS custom_types ENABLE ROW LEVEL SECURITY;

SELECT '✅ RLS enabled on all tables' AS result;

-- STEP 3: Create NEW anonymous policies (fresh start)
-- ==========================================
SELECT 'STEP 3: Creating new anonymous access policies...' AS status;

-- Locations
CREATE POLICY "locations_public_select" ON locations FOR SELECT USING (true);
CREATE POLICY "locations_public_insert" ON locations FOR INSERT WITH CHECK (true);
CREATE POLICY "locations_public_update" ON locations FOR UPDATE USING (true);
CREATE POLICY "locations_public_delete" ON locations FOR DELETE USING (true);

-- Equipment
CREATE POLICY "equipment_public_select" ON equipment FOR SELECT USING (true);
CREATE POLICY "equipment_public_insert" ON equipment FOR INSERT WITH CHECK (true);
CREATE POLICY "equipment_public_update" ON equipment FOR UPDATE USING (true);
CREATE POLICY "equipment_public_delete" ON equipment FOR DELETE USING (true);

-- Documents
CREATE POLICY "documents_public_select" ON documents FOR SELECT USING (true);
CREATE POLICY "documents_public_insert" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "documents_public_update" ON documents FOR UPDATE USING (true);
CREATE POLICY "documents_public_delete" ON documents FOR DELETE USING (true);

-- Maintenance
CREATE POLICY "maintenance_public_select" ON maintenance FOR SELECT USING (true);
CREATE POLICY "maintenance_public_insert" ON maintenance FOR INSERT WITH CHECK (true);
CREATE POLICY "maintenance_public_update" ON maintenance FOR UPDATE USING (true);
CREATE POLICY "maintenance_public_delete" ON maintenance FOR DELETE USING (true);

-- Audit Log
CREATE POLICY "audit_log_public_select" ON audit_log FOR SELECT USING (true);
CREATE POLICY "audit_log_public_insert" ON audit_log FOR INSERT WITH CHECK (true);

-- Custom Types
CREATE POLICY "custom_types_public_select" ON custom_types FOR SELECT USING (true);
CREATE POLICY "custom_types_public_insert" ON custom_types FOR INSERT WITH CHECK (true);
CREATE POLICY "custom_types_public_update" ON custom_types FOR UPDATE USING (true);
CREATE POLICY "custom_types_public_delete" ON custom_types FOR DELETE USING (true);

SELECT '✅ New anonymous policies created' AS result;

-- STEP 4: Verify policies
-- ==========================================
SELECT 'STEP 4: Verifying policies...' AS status;

SELECT
    schemaname,
    tablename,
    policyname,
    CASE
        WHEN policyname LIKE '%public%' THEN '✅ ANONYMOUS'
        ELSE '⚠️ OTHER'
    END AS access_type
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('locations', 'equipment', 'documents', 'maintenance', 'audit_log', 'custom_types')
ORDER BY tablename, policyname;

-- STEP 5: Test queries
-- ==========================================
SELECT 'STEP 5: Testing database access...' AS status;

SELECT COUNT(*) AS location_count FROM locations;
SELECT COUNT(*) AS equipment_count FROM equipment;
SELECT COUNT(*) AS documents_count FROM documents;
SELECT COUNT(*) AS maintenance_count FROM maintenance;

-- Done!
-- ==========================================
SELECT '🎉 RLS policies reset complete!' AS status;
SELECT 'All tables now allow anonymous access.' AS note;
