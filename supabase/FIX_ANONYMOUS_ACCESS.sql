-- ==========================================
-- MLFF EQUIPMENT TRACKING - FIX ANONYMOUS ACCESS
-- ==========================================
-- This script ONLY does the fixes (no diagnostics)
-- Run this if you get 400 errors on database operations
-- ==========================================

-- Enable RLS on all tables
-- ==========================================
ALTER TABLE IF EXISTS locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS custom_types ENABLE ROW LEVEL SECURITY;

-- Drop old restrictive policies
-- ==========================================
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

DROP POLICY IF EXISTS "audit_log_authenticated_select" ON audit_log;
DROP POLICY IF EXISTS "audit_log_authenticated_insert" ON audit_log;

DROP POLICY IF EXISTS "custom_types_authenticated_select" ON custom_types;
DROP POLICY IF EXISTS "custom_types_authenticated_insert" ON custom_types;
DROP POLICY IF EXISTS "custom_types_authenticated_update" ON custom_types;
DROP POLICY IF EXISTS "custom_types_authenticated_delete" ON custom_types;

-- Create new PERMISSIVE anonymous policies
-- ==========================================

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

-- Test queries
-- ==========================================
SELECT 'Testing database access...' AS status;
SELECT COUNT(*) AS location_count FROM locations;
SELECT COUNT(*) AS equipment_count FROM equipment;

-- Done!
-- ==========================================
SELECT '🎉 Anonymous access enabled!' AS status;
SELECT 'You can now use the app without authentication.' AS note;
