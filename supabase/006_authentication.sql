-- ==========================================
-- MLFF Equipment Tracking - Authentication & RBAC
-- Version: 5.0 (Authentication Edition)
-- ==========================================
--
-- This migration implements:
--   1. allowed_users table for whitelist-based access
--   2. Role-based access control (Super Admin, Editor, Viewer)
--   3. Updated RLS policies for authenticated-only access
--
-- Roles:
--   - super_admin: Full access (CRUD + user management)
--   - editor: Read + Create + Update (no delete)
--   - viewer: Read only
--
-- ==========================================

-- ==========================================
-- STEP 1: Create allowed_users table
-- ==========================================

CREATE TABLE IF NOT EXISTS allowed_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'editor', 'viewer')),
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- Add comments
COMMENT ON TABLE allowed_users IS 'Whitelist of users allowed to access the application';
COMMENT ON COLUMN allowed_users.email IS 'Google email address of the user';
COMMENT ON COLUMN allowed_users.role IS 'User role: super_admin, editor, or viewer';
COMMENT ON COLUMN allowed_users.display_name IS 'Display name for the user';

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_allowed_users_email ON allowed_users(email);
CREATE INDEX IF NOT EXISTS idx_allowed_users_role ON allowed_users(role);

-- Insert default super admin
INSERT INTO allowed_users (email, role, display_name)
VALUES ('ognjenpetar@gmail.com', 'super_admin', 'Ognjen Petar')
ON CONFLICT (email) DO UPDATE SET role = 'super_admin';

-- Enable RLS on allowed_users
ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_allowed_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_allowed_users_updated_at ON allowed_users;
CREATE TRIGGER trigger_allowed_users_updated_at
    BEFORE UPDATE ON allowed_users
    FOR EACH ROW
    EXECUTE FUNCTION update_allowed_users_updated_at();

-- ==========================================
-- STEP 2: Create helper function to get user role
-- ==========================================

CREATE OR REPLACE FUNCTION get_user_role(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM allowed_users
    WHERE email = user_email;
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can edit (super_admin or editor)
CREATE OR REPLACE FUNCTION can_user_edit(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM allowed_users
        WHERE email = user_email
        AND role IN ('super_admin', 'editor')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can delete (super_admin only)
CREATE OR REPLACE FUNCTION can_user_delete(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM allowed_users
        WHERE email = user_email
        AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is allowed
CREATE OR REPLACE FUNCTION is_user_allowed(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM allowed_users
        WHERE email = user_email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- STEP 3: Drop ALL existing public policies
-- ==========================================

-- Drop locations policies
DROP POLICY IF EXISTS "locations_public_read" ON locations;
DROP POLICY IF EXISTS "locations_public_select" ON locations;
DROP POLICY IF EXISTS "locations_public_insert" ON locations;
DROP POLICY IF EXISTS "locations_public_update" ON locations;
DROP POLICY IF EXISTS "locations_public_delete" ON locations;
DROP POLICY IF EXISTS "locations_authenticated_insert" ON locations;
DROP POLICY IF EXISTS "locations_authenticated_update" ON locations;
DROP POLICY IF EXISTS "locations_authenticated_delete" ON locations;

-- Drop equipment policies
DROP POLICY IF EXISTS "equipment_public_read" ON equipment;
DROP POLICY IF EXISTS "equipment_public_select" ON equipment;
DROP POLICY IF EXISTS "equipment_public_insert" ON equipment;
DROP POLICY IF EXISTS "equipment_public_update" ON equipment;
DROP POLICY IF EXISTS "equipment_public_delete" ON equipment;
DROP POLICY IF EXISTS "equipment_authenticated_insert" ON equipment;
DROP POLICY IF EXISTS "equipment_authenticated_update" ON equipment;
DROP POLICY IF EXISTS "equipment_authenticated_delete" ON equipment;

-- Drop documents policies
DROP POLICY IF EXISTS "documents_public_read" ON documents;
DROP POLICY IF EXISTS "documents_public_select" ON documents;
DROP POLICY IF EXISTS "documents_public_insert" ON documents;
DROP POLICY IF EXISTS "documents_public_update" ON documents;
DROP POLICY IF EXISTS "documents_public_delete" ON documents;
DROP POLICY IF EXISTS "documents_authenticated_insert" ON documents;
DROP POLICY IF EXISTS "documents_authenticated_update" ON documents;
DROP POLICY IF EXISTS "documents_authenticated_delete" ON documents;

-- Drop maintenance policies
DROP POLICY IF EXISTS "maintenance_public_read" ON maintenance;
DROP POLICY IF EXISTS "maintenance_public_select" ON maintenance;
DROP POLICY IF EXISTS "maintenance_public_insert" ON maintenance;
DROP POLICY IF EXISTS "maintenance_public_update" ON maintenance;
DROP POLICY IF EXISTS "maintenance_public_delete" ON maintenance;
DROP POLICY IF EXISTS "maintenance_authenticated_insert" ON maintenance;
DROP POLICY IF EXISTS "maintenance_authenticated_update" ON maintenance;
DROP POLICY IF EXISTS "maintenance_authenticated_delete" ON maintenance;

-- Drop audit_log policies
DROP POLICY IF EXISTS "audit_log_public_read" ON audit_log;
DROP POLICY IF EXISTS "audit_log_public_select" ON audit_log;
DROP POLICY IF EXISTS "audit_log_public_insert" ON audit_log;
DROP POLICY IF EXISTS "audit_log_public_update" ON audit_log;
DROP POLICY IF EXISTS "audit_log_public_delete" ON audit_log;
DROP POLICY IF EXISTS "audit_log_authenticated_insert" ON audit_log;
DROP POLICY IF EXISTS "audit_log_authenticated_update" ON audit_log;
DROP POLICY IF EXISTS "audit_log_authenticated_delete" ON audit_log;

-- Drop custom_types policies
DROP POLICY IF EXISTS "custom_types_public_read" ON custom_types;
DROP POLICY IF EXISTS "custom_types_public_select" ON custom_types;
DROP POLICY IF EXISTS "custom_types_public_insert" ON custom_types;
DROP POLICY IF EXISTS "custom_types_public_update" ON custom_types;
DROP POLICY IF EXISTS "custom_types_public_delete" ON custom_types;
DROP POLICY IF EXISTS "custom_types_authenticated_insert" ON custom_types;
DROP POLICY IF EXISTS "custom_types_authenticated_update" ON custom_types;
DROP POLICY IF EXISTS "custom_types_authenticated_delete" ON custom_types;

-- ==========================================
-- STEP 4: Create new authenticated + role-based policies
-- ==========================================

-- ==========================================
-- LOCATIONS TABLE POLICIES
-- ==========================================

-- SELECT: All allowed authenticated users can read
CREATE POLICY "locations_auth_select" ON locations
    FOR SELECT TO authenticated
    USING (is_user_allowed(auth.jwt()->>'email'));

-- INSERT: Editors and Super Admins can create
CREATE POLICY "locations_auth_insert" ON locations
    FOR INSERT TO authenticated
    WITH CHECK (can_user_edit(auth.jwt()->>'email'));

-- UPDATE: Editors and Super Admins can update
CREATE POLICY "locations_auth_update" ON locations
    FOR UPDATE TO authenticated
    USING (can_user_edit(auth.jwt()->>'email'))
    WITH CHECK (can_user_edit(auth.jwt()->>'email'));

-- DELETE: Only Super Admins can delete
CREATE POLICY "locations_auth_delete" ON locations
    FOR DELETE TO authenticated
    USING (can_user_delete(auth.jwt()->>'email'));

-- ==========================================
-- EQUIPMENT TABLE POLICIES
-- ==========================================

CREATE POLICY "equipment_auth_select" ON equipment
    FOR SELECT TO authenticated
    USING (is_user_allowed(auth.jwt()->>'email'));

CREATE POLICY "equipment_auth_insert" ON equipment
    FOR INSERT TO authenticated
    WITH CHECK (can_user_edit(auth.jwt()->>'email'));

CREATE POLICY "equipment_auth_update" ON equipment
    FOR UPDATE TO authenticated
    USING (can_user_edit(auth.jwt()->>'email'))
    WITH CHECK (can_user_edit(auth.jwt()->>'email'));

CREATE POLICY "equipment_auth_delete" ON equipment
    FOR DELETE TO authenticated
    USING (can_user_delete(auth.jwt()->>'email'));

-- ==========================================
-- DOCUMENTS TABLE POLICIES
-- ==========================================

CREATE POLICY "documents_auth_select" ON documents
    FOR SELECT TO authenticated
    USING (is_user_allowed(auth.jwt()->>'email'));

CREATE POLICY "documents_auth_insert" ON documents
    FOR INSERT TO authenticated
    WITH CHECK (can_user_edit(auth.jwt()->>'email'));

CREATE POLICY "documents_auth_update" ON documents
    FOR UPDATE TO authenticated
    USING (can_user_edit(auth.jwt()->>'email'))
    WITH CHECK (can_user_edit(auth.jwt()->>'email'));

CREATE POLICY "documents_auth_delete" ON documents
    FOR DELETE TO authenticated
    USING (can_user_delete(auth.jwt()->>'email'));

-- ==========================================
-- MAINTENANCE TABLE POLICIES
-- ==========================================

CREATE POLICY "maintenance_auth_select" ON maintenance
    FOR SELECT TO authenticated
    USING (is_user_allowed(auth.jwt()->>'email'));

CREATE POLICY "maintenance_auth_insert" ON maintenance
    FOR INSERT TO authenticated
    WITH CHECK (can_user_edit(auth.jwt()->>'email'));

CREATE POLICY "maintenance_auth_update" ON maintenance
    FOR UPDATE TO authenticated
    USING (can_user_edit(auth.jwt()->>'email'))
    WITH CHECK (can_user_edit(auth.jwt()->>'email'));

CREATE POLICY "maintenance_auth_delete" ON maintenance
    FOR DELETE TO authenticated
    USING (can_user_delete(auth.jwt()->>'email'));

-- ==========================================
-- AUDIT_LOG TABLE POLICIES
-- ==========================================

CREATE POLICY "audit_log_auth_select" ON audit_log
    FOR SELECT TO authenticated
    USING (is_user_allowed(auth.jwt()->>'email'));

CREATE POLICY "audit_log_auth_insert" ON audit_log
    FOR INSERT TO authenticated
    WITH CHECK (can_user_edit(auth.jwt()->>'email'));

-- No update/delete for audit_log (immutable)

-- ==========================================
-- CUSTOM_TYPES TABLE POLICIES
-- ==========================================

CREATE POLICY "custom_types_auth_select" ON custom_types
    FOR SELECT TO authenticated
    USING (is_user_allowed(auth.jwt()->>'email'));

CREATE POLICY "custom_types_auth_insert" ON custom_types
    FOR INSERT TO authenticated
    WITH CHECK (can_user_edit(auth.jwt()->>'email'));

CREATE POLICY "custom_types_auth_update" ON custom_types
    FOR UPDATE TO authenticated
    USING (can_user_edit(auth.jwt()->>'email'))
    WITH CHECK (can_user_edit(auth.jwt()->>'email'));

CREATE POLICY "custom_types_auth_delete" ON custom_types
    FOR DELETE TO authenticated
    USING (can_user_delete(auth.jwt()->>'email'));

-- ==========================================
-- ALLOWED_USERS TABLE POLICIES
-- ==========================================

-- SELECT: All authenticated users can see allowed_users (for admin panel)
CREATE POLICY "allowed_users_auth_select" ON allowed_users
    FOR SELECT TO authenticated
    USING (is_user_allowed(auth.jwt()->>'email'));

-- INSERT: Only Super Admins can add users
CREATE POLICY "allowed_users_auth_insert" ON allowed_users
    FOR INSERT TO authenticated
    WITH CHECK (can_user_delete(auth.jwt()->>'email'));

-- UPDATE: Only Super Admins can update users
CREATE POLICY "allowed_users_auth_update" ON allowed_users
    FOR UPDATE TO authenticated
    USING (can_user_delete(auth.jwt()->>'email'))
    WITH CHECK (can_user_delete(auth.jwt()->>'email'));

-- DELETE: Only Super Admins can delete users (but not themselves)
CREATE POLICY "allowed_users_auth_delete" ON allowed_users
    FOR DELETE TO authenticated
    USING (
        can_user_delete(auth.jwt()->>'email')
        AND email != auth.jwt()->>'email'  -- Cannot delete yourself
    );

-- ==========================================
-- STEP 5: Update Storage Policies
-- ==========================================

-- Drop existing storage policies
DROP POLICY IF EXISTS "location_photos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "location_photos_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "location_photos_public_update" ON storage.objects;
DROP POLICY IF EXISTS "location_photos_public_delete" ON storage.objects;
DROP POLICY IF EXISTS "location_photos_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "location_photos_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "location_photos_authenticated_delete" ON storage.objects;

DROP POLICY IF EXISTS "equipment_photos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "equipment_photos_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "equipment_photos_public_update" ON storage.objects;
DROP POLICY IF EXISTS "equipment_photos_public_delete" ON storage.objects;
DROP POLICY IF EXISTS "equipment_photos_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "equipment_photos_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "equipment_photos_authenticated_delete" ON storage.objects;

DROP POLICY IF EXISTS "equipment_documents_public_read" ON storage.objects;
DROP POLICY IF EXISTS "equipment_documents_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "equipment_documents_public_update" ON storage.objects;
DROP POLICY IF EXISTS "equipment_documents_public_delete" ON storage.objects;
DROP POLICY IF EXISTS "equipment_documents_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "equipment_documents_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "equipment_documents_authenticated_delete" ON storage.objects;

-- Storage: Authenticated users can read all files
CREATE POLICY "storage_auth_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id IN ('location-photos', 'equipment-photos', 'equipment-documents')
        AND is_user_allowed(auth.jwt()->>'email')
    );

-- Storage: Editors and Super Admins can upload
CREATE POLICY "storage_auth_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id IN ('location-photos', 'equipment-photos', 'equipment-documents')
        AND can_user_edit(auth.jwt()->>'email')
    );

-- Storage: Editors and Super Admins can update
CREATE POLICY "storage_auth_update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id IN ('location-photos', 'equipment-photos', 'equipment-documents')
        AND can_user_edit(auth.jwt()->>'email')
    )
    WITH CHECK (
        bucket_id IN ('location-photos', 'equipment-photos', 'equipment-documents')
        AND can_user_edit(auth.jwt()->>'email')
    );

-- Storage: Only Super Admins can delete
CREATE POLICY "storage_auth_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id IN ('location-photos', 'equipment-photos', 'equipment-documents')
        AND can_user_delete(auth.jwt()->>'email')
    );

-- ==========================================
-- STEP 6: Grant function permissions
-- ==========================================

GRANT EXECUTE ON FUNCTION get_user_role(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_edit(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_delete(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_allowed(TEXT) TO authenticated;

-- ==========================================
-- VERIFICATION
-- ==========================================
/*
-- Check allowed_users table
SELECT * FROM allowed_users;

-- Check if ognjenpetar@gmail.com is super_admin
SELECT * FROM allowed_users WHERE email = 'ognjenpetar@gmail.com';

-- Test role check functions
SELECT get_user_role('ognjenpetar@gmail.com');  -- Should return 'super_admin'
SELECT can_user_edit('ognjenpetar@gmail.com');  -- Should return true
SELECT can_user_delete('ognjenpetar@gmail.com'); -- Should return true
SELECT is_user_allowed('ognjenpetar@gmail.com'); -- Should return true

-- Check policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
*/

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
-- Changes made:
--   1. Created allowed_users table with ognjenpetar@gmail.com as super_admin
--   2. Created helper functions for role checking
--   3. Replaced all public policies with authenticated + role-based policies
--   4. Updated storage policies for authenticated access
--
-- Role permissions:
--   super_admin: SELECT, INSERT, UPDATE, DELETE + user management
--   editor: SELECT, INSERT, UPDATE (no DELETE)
--   viewer: SELECT only
--
-- Next steps:
--   1. Enable Google OAuth in Supabase Dashboard
--   2. Update frontend to use Supabase Auth
--   3. Create login screen and admin panel
-- ==========================================
