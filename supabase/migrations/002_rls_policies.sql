-- ==========================================
-- MLFF Equipment Tracking - Row Level Security Policies
-- Version: 3.0 (Supabase Edition)
-- ==========================================
--
-- This migration sets up Row Level Security (RLS) policies that replicate
-- the Firebase Firestore security rules from v2.0.
--
-- Security Model:
--   - PUBLIC READ: Anyone can view data (required for QR codes to work)
--   - AUTHENTICATED WRITE: Only logged-in users can create/update/delete
--
-- This ensures:
--   ✅ QR codes work without login (public can scan and view reports)
--   ✅ Data is protected from unauthorized modifications
--   ✅ Admin operations require Google OAuth authentication
--
-- Tables covered:
--   1. locations
--   2. equipment
--   3. documents
--   4. maintenance
--   5. audit_log
--   6. custom_types
--
-- ==========================================

-- ==========================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================
-- Enable RLS on all tables
-- (Without policies, no one can access data)
-- ==========================================

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_types ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- LOCATIONS TABLE POLICIES
-- ==========================================

-- Public READ: Anyone can view locations (required for QR codes)
CREATE POLICY "locations_public_read"
    ON locations
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Authenticated INSERT: Only logged-in users can create locations
CREATE POLICY "locations_authenticated_insert"
    ON locations
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated UPDATE: Only logged-in users can update locations
CREATE POLICY "locations_authenticated_update"
    ON locations
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated DELETE: Only logged-in users can delete locations
CREATE POLICY "locations_authenticated_delete"
    ON locations
    FOR DELETE
    TO authenticated
    USING (true);

-- ==========================================
-- EQUIPMENT TABLE POLICIES
-- ==========================================

-- Public READ: Anyone can view equipment (required for QR codes)
CREATE POLICY "equipment_public_read"
    ON equipment
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Authenticated INSERT: Only logged-in users can create equipment
CREATE POLICY "equipment_authenticated_insert"
    ON equipment
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated UPDATE: Only logged-in users can update equipment
CREATE POLICY "equipment_authenticated_update"
    ON equipment
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated DELETE: Only logged-in users can delete equipment
CREATE POLICY "equipment_authenticated_delete"
    ON equipment
    FOR DELETE
    TO authenticated
    USING (true);

-- ==========================================
-- DOCUMENTS TABLE POLICIES
-- ==========================================

-- Public READ: Anyone can view documents (required for QR code reports)
CREATE POLICY "documents_public_read"
    ON documents
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Authenticated INSERT: Only logged-in users can upload documents
CREATE POLICY "documents_authenticated_insert"
    ON documents
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated UPDATE: Only logged-in users can update document metadata
CREATE POLICY "documents_authenticated_update"
    ON documents
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated DELETE: Only logged-in users can delete documents
CREATE POLICY "documents_authenticated_delete"
    ON documents
    FOR DELETE
    TO authenticated
    USING (true);

-- ==========================================
-- MAINTENANCE TABLE POLICIES
-- ==========================================

-- Public READ: Anyone can view maintenance history (for QR code reports)
CREATE POLICY "maintenance_public_read"
    ON maintenance
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Authenticated INSERT: Only logged-in users can add maintenance records
CREATE POLICY "maintenance_authenticated_insert"
    ON maintenance
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated UPDATE: Only logged-in users can update maintenance records
CREATE POLICY "maintenance_authenticated_update"
    ON maintenance
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated DELETE: Only logged-in users can delete maintenance records
CREATE POLICY "maintenance_authenticated_delete"
    ON maintenance
    FOR DELETE
    TO authenticated
    USING (true);

-- ==========================================
-- AUDIT_LOG TABLE POLICIES
-- ==========================================

-- Public READ: Anyone can view audit logs (for transparency in QR reports)
CREATE POLICY "audit_log_public_read"
    ON audit_log
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Authenticated INSERT: Only logged-in users can create audit entries
-- (This happens automatically when equipment is modified)
CREATE POLICY "audit_log_authenticated_insert"
    ON audit_log
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated UPDATE: Only logged-in users can update audit logs
-- (Typically audit logs are immutable, but allowing for corrections)
CREATE POLICY "audit_log_authenticated_update"
    ON audit_log
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated DELETE: Only logged-in users can delete audit logs
-- (Admin cleanup of sensitive or erroneous logs)
CREATE POLICY "audit_log_authenticated_delete"
    ON audit_log
    FOR DELETE
    TO authenticated
    USING (true);

-- ==========================================
-- CUSTOM_TYPES TABLE POLICIES
-- ==========================================

-- Public READ: Anyone can view equipment types (needed for QR reports)
CREATE POLICY "custom_types_public_read"
    ON custom_types
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Authenticated INSERT: Only logged-in users can add new types
CREATE POLICY "custom_types_authenticated_insert"
    ON custom_types
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated UPDATE: Only logged-in users can rename types
CREATE POLICY "custom_types_authenticated_update"
    ON custom_types
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated DELETE: Only logged-in users can delete types
CREATE POLICY "custom_types_authenticated_delete"
    ON custom_types
    FOR DELETE
    TO authenticated
    USING (true);

-- ==========================================
-- POLICY VERIFICATION
-- ==========================================
-- Verify policies are enabled correctly:
--
-- SELECT tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
--
-- Expected result: 24 policies (6 tables × 4 operations each)
-- ==========================================

-- ==========================================
-- TESTING POLICIES
-- ==========================================
-- To test policies work correctly:
--
-- 1. Public READ test (no authentication):
--    SELECT * FROM equipment LIMIT 1;
--    ✅ Should succeed (required for QR codes)
--
-- 2. Public WRITE test (no authentication):
--    INSERT INTO equipment (...) VALUES (...);
--    ❌ Should fail (authentication required)
--
-- 3. Authenticated WRITE test (with auth):
--    -- Login first via Supabase Auth
--    INSERT INTO equipment (...) VALUES (...);
--    ✅ Should succeed
--
-- ==========================================

-- ==========================================
-- NOTES
-- ==========================================
-- Why PUBLIC READ is safe:
--   - Equipment data is not sensitive (location, model, etc.)
--   - QR codes MUST work without login for field technicians
--   - Audit log provides transparency (who changed what)
--
-- Why AUTHENTICATED WRITE is important:
--   - Prevents vandalism and data corruption
--   - Ensures accountability (audit log tracks user_id)
--   - Only authorized personnel can modify inventory
--
-- Firebase equivalent (firestore.rules):
--   match /equipment/{id} {
--     allow read: if true;  // Public read
--     allow write: if request.auth != null;  // Authenticated write
--   }
--
-- ==========================================

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
-- Row Level Security policies configured!
--
-- Next steps:
--   1. Run 003_indexes.sql for additional performance indexes
--   2. Run 004_storage_setup.sql for Supabase Storage configuration
--   3. Test policies using Supabase Dashboard SQL Editor
--
-- Total policies created: 24 (6 tables × 4 CRUD operations)
-- ==========================================
