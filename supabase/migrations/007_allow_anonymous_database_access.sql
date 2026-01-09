-- ==========================================
-- TEMPORARY: Allow Anonymous Database Access
-- ==========================================
-- This migration temporarily allows unauthenticated users to
-- INSERT/UPDATE/DELETE records in all tables for testing purposes.
--
-- WARNING: This reduces security! Anyone can modify your database.
-- Use this only for testing, then revert to authenticated-only access.
-- ==========================================

-- ==========================================
-- LOCATIONS TABLE: Allow public access
-- ==========================================

-- Drop existing authenticated-only policies
DROP POLICY IF EXISTS "locations_authenticated_insert" ON locations;
DROP POLICY IF EXISTS "locations_authenticated_update" ON locations;
DROP POLICY IF EXISTS "locations_authenticated_delete" ON locations;

-- Create public policies (anyone can INSERT/UPDATE/DELETE)
CREATE POLICY "locations_public_insert"
    ON locations
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "locations_public_update"
    ON locations
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "locations_public_delete"
    ON locations
    FOR DELETE
    TO public
    USING (true);

-- ==========================================
-- EQUIPMENT TABLE: Allow public access
-- ==========================================

-- Drop existing authenticated-only policies
DROP POLICY IF EXISTS "equipment_authenticated_insert" ON equipment;
DROP POLICY IF EXISTS "equipment_authenticated_update" ON equipment;
DROP POLICY IF EXISTS "equipment_authenticated_delete" ON equipment;

-- Create public policies
CREATE POLICY "equipment_public_insert"
    ON equipment
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "equipment_public_update"
    ON equipment
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "equipment_public_delete"
    ON equipment
    FOR DELETE
    TO public
    USING (true);

-- ==========================================
-- DOCUMENTS TABLE: Allow public access
-- ==========================================

-- Drop existing authenticated-only policies
DROP POLICY IF EXISTS "documents_authenticated_insert" ON documents;
DROP POLICY IF EXISTS "documents_authenticated_update" ON documents;
DROP POLICY IF EXISTS "documents_authenticated_delete" ON documents;

-- Create public policies
CREATE POLICY "documents_public_insert"
    ON documents
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "documents_public_update"
    ON documents
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "documents_public_delete"
    ON documents
    FOR DELETE
    TO public
    USING (true);

-- ==========================================
-- MAINTENANCE TABLE: Allow public access
-- ==========================================

-- Drop existing authenticated-only policies
DROP POLICY IF EXISTS "maintenance_authenticated_insert" ON maintenance;
DROP POLICY IF EXISTS "maintenance_authenticated_update" ON maintenance;
DROP POLICY IF EXISTS "maintenance_authenticated_delete" ON maintenance;

-- Create public policies
CREATE POLICY "maintenance_public_insert"
    ON maintenance
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "maintenance_public_update"
    ON maintenance
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "maintenance_public_delete"
    ON maintenance
    FOR DELETE
    TO public
    USING (true);

-- ==========================================
-- AUDIT_LOG TABLE: Allow public access
-- ==========================================

-- Drop existing authenticated-only policies
DROP POLICY IF EXISTS "audit_log_authenticated_insert" ON audit_log;
DROP POLICY IF EXISTS "audit_log_authenticated_update" ON audit_log;
DROP POLICY IF EXISTS "audit_log_authenticated_delete" ON audit_log;

-- Create public policies
CREATE POLICY "audit_log_public_insert"
    ON audit_log
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "audit_log_public_update"
    ON audit_log
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "audit_log_public_delete"
    ON audit_log
    FOR DELETE
    TO public
    USING (true);

-- ==========================================
-- CUSTOM_TYPES TABLE: Allow public access
-- ==========================================

-- Drop existing authenticated-only policies
DROP POLICY IF EXISTS "custom_types_authenticated_insert" ON custom_types;
DROP POLICY IF EXISTS "custom_types_authenticated_update" ON custom_types;
DROP POLICY IF EXISTS "custom_types_authenticated_delete" ON custom_types;

-- Create public policies
CREATE POLICY "custom_types_public_insert"
    ON custom_types
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "custom_types_public_update"
    ON custom_types
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "custom_types_public_delete"
    ON custom_types
    FOR DELETE
    TO public
    USING (true);

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
-- All table policies updated:
--   ✅ INSERT: public (anyone can create records)
--   ✅ UPDATE: public (anyone can update records)
--   ✅ DELETE: public (anyone can delete records)
--   ✅ SELECT: public (already set in 002_rls_policies.sql)
--
-- ⚠️ WARNING: This is VERY INSECURE!
-- ⚠️ Use this ONLY for testing/development!
-- ⚠️ For production, revert to authenticated-only policies!
--
-- Tables affected:
--   - locations
--   - equipment
--   - documents
--   - maintenance
--   - audit_log
--   - custom_types
-- ==========================================
