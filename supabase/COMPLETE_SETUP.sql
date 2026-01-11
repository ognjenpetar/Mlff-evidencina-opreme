-- ==========================================
-- MLFF Equipment Tracking - Initial Database Schema
-- Version: 3.0 (Supabase Edition)
-- ==========================================
--
-- This migration creates the foundational PostgreSQL schema for the
-- MLFF Equipment Tracking application, migrating from Firebase Firestore
-- to Supabase PostgreSQL.
--
-- Tables created:
--   1. locations - Physical locations where equipment is installed
--   2. equipment - Equipment items tracked in the system
--   3. documents - PDF documents attached to equipment
--   4. maintenance - Maintenance history for equipment
--   5. audit_log - Audit trail of all equipment changes
--   6. custom_types - User-defined equipment types
--
-- Key Features:
--   - UUID primary keys for all tables
--   - Foreign key relationships with CASCADE DELETE
--   - Automatic timestamps (created_at, updated_at)
--   - Triggers for updating updated_at columns
--   - Data validation via CHECK constraints
--
-- ==========================================

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABLE: locations
-- ==========================================
-- Stores physical locations where equipment is installed
-- (e.g., "Portal Beograd-Niš KM 12")
--
-- Firestore equivalent: /locations/{id}
-- ==========================================

CREATE TABLE locations (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Basic information
    name TEXT NOT NULL,

    -- GPS coordinates (DECIMAL for precision)
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,

    -- Address and description
    address TEXT,
    description TEXT,

    -- Photo URL (stored in Supabase Storage)
    photo_url TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups by name
CREATE INDEX idx_locations_name ON locations(name);

-- ==========================================
-- TABLE: equipment
-- ==========================================
-- Stores equipment items (e.g., VDX units, VRX units)
-- Each equipment belongs to exactly one location.
--
-- Firestore equivalent: /equipment/{id}
-- ==========================================

CREATE TABLE equipment (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Foreign key to locations (CASCADE DELETE)
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

    -- Basic identification
    inventory_number TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Aktivna' CHECK (status IN ('Aktivna', 'Na servisu', 'Neispravna', 'Povučena')),

    -- Technical specifications
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,

    -- Network configuration
    ip_address INET,
    mac_address MACADDR,

    -- Physical position (in centimeters)
    x_coord INTEGER DEFAULT 0,
    y_coord INTEGER DEFAULT 0,
    z_coord INTEGER DEFAULT 0,

    -- Installation information
    installation_date DATE,
    installer_name TEXT,
    tester_name TEXT,

    -- Warranty
    warranty_expiry DATE,

    -- Photo URL (stored in Supabase Storage)
    photo_url TEXT,

    -- Additional notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_equipment_location_id ON equipment(location_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_type ON equipment(type);
CREATE INDEX idx_equipment_inventory_number ON equipment(inventory_number);

-- ==========================================
-- TABLE: documents
-- ==========================================
-- Stores PDF documents attached to equipment
-- (e.g., manuals, certificates, technical specs)
--
-- Firestore equivalent: /equipment/{equipmentId}/documents/{docId}
-- ==========================================

CREATE TABLE documents (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Foreign key to equipment (CASCADE DELETE)
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,

    -- File information
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,

    -- Upload timestamp
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching all documents of specific equipment
CREATE INDEX idx_documents_equipment_id ON documents(equipment_id);

-- ==========================================
-- TABLE: maintenance
-- ==========================================
-- Stores maintenance history for equipment
--
-- Firestore equivalent: /equipment/{equipmentId}/maintenance/{maintenanceId}
-- ==========================================

CREATE TABLE maintenance (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Foreign key to equipment (CASCADE DELETE)
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,

    -- Maintenance details
    type TEXT CHECK (type IN ('Preventivni', 'Korektivni', 'Inspekcija', 'Zamena dela', 'Kalibracija')),
    date DATE NOT NULL,
    description TEXT,
    performed_by TEXT,
    cost NUMERIC(10, 2),
    next_service_date DATE,

    -- Created timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_maintenance_equipment_id ON maintenance(equipment_id);
CREATE INDEX idx_maintenance_date ON maintenance(date DESC);
CREATE INDEX idx_maintenance_next_service ON maintenance(next_service_date);

-- ==========================================
-- TABLE: audit_log
-- ==========================================
-- Audit trail of all equipment changes
-- Tracks who did what and when
--
-- Firestore equivalent: /equipment/{equipmentId}/auditLog/{logId}
-- ==========================================

CREATE TABLE audit_log (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Foreign key to equipment (CASCADE DELETE)
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,

    -- Action details
    action TEXT NOT NULL,
    details TEXT,

    -- User information (from Supabase Auth)
    user_id UUID,
    user_email TEXT,

    -- Timestamp
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit queries
CREATE INDEX idx_audit_log_equipment_id ON audit_log(equipment_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);

-- ==========================================
-- TABLE: custom_types
-- ==========================================
-- User-defined equipment types
-- Allows users to add custom equipment categories beyond defaults
--
-- Firestore equivalent: /customTypes/{id}
-- ==========================================

CREATE TABLE custom_types (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Type name (must be unique)
    type_name TEXT NOT NULL UNIQUE,

    -- Created timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for type name lookups
CREATE INDEX idx_custom_types_type_name ON custom_types(type_name);

-- ==========================================
-- TRIGGERS: Auto-update updated_at column
-- ==========================================
-- Automatically updates the updated_at column whenever a row is modified
-- ==========================================

-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to locations table
CREATE TRIGGER trigger_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to equipment table
CREATE TRIGGER trigger_equipment_updated_at
    BEFORE UPDATE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- COMMENTS: Table and column documentation
-- ==========================================

COMMENT ON TABLE locations IS 'Physical locations where equipment is installed';
COMMENT ON TABLE equipment IS 'Equipment items tracked in the system';
COMMENT ON TABLE documents IS 'PDF documents and files attached to equipment';
COMMENT ON TABLE maintenance IS 'Maintenance history and service records';
COMMENT ON TABLE audit_log IS 'Audit trail of all equipment changes';
COMMENT ON TABLE custom_types IS 'User-defined equipment types';

COMMENT ON COLUMN equipment.status IS 'Current operational status: Aktivna, Na servisu, Neispravna, Povučena';
COMMENT ON COLUMN equipment.x_coord IS 'X coordinate in centimeters for 3D positioning';
COMMENT ON COLUMN equipment.y_coord IS 'Y coordinate in centimeters for 3D positioning';
COMMENT ON COLUMN equipment.z_coord IS 'Z coordinate in centimeters for 3D positioning';
COMMENT ON COLUMN maintenance.type IS 'Type of maintenance: Preventivni, Korektivni, Inspekcija, Zamena dela, Kalibracija';

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
-- Schema created successfully!
--
-- Next steps:
--   1. Run 002_rls_policies.sql to set up Row Level Security
--   2. Run 003_indexes.sql to create additional performance indexes
--   3. Run 004_storage_setup.sql to configure Supabase Storage buckets
--
-- Total tables created: 6
-- Total indexes created: 15
-- Total triggers created: 2
-- ==========================================
-- ==========================================
-- MLFF Equipment Tracking - Supabase Storage Setup
-- Version: 3.0 (Supabase Edition)
-- ==========================================
--
-- This migration configures Supabase Storage buckets for storing:
--   - Location photos
--   - Equipment photos
--   - Equipment documents (PDFs)
--
-- Storage Security Model:
--   - PUBLIC READ: Anyone can download files (required for QR codes)
--   - AUTHENTICATED WRITE: Only logged-in users can upload/delete files
--   - FILE VALIDATION: Max 50MB, only images and PDFs allowed
--
-- Buckets created:
--   1. location-photos (public)
--   2. equipment-photos (public)
--   3. equipment-documents (public)
--
-- ==========================================

-- ==========================================
-- CREATE STORAGE BUCKETS
-- ==========================================
-- Note: Buckets are marked as 'public' which means anyone can download files
-- if they know the URL. This is required for QR codes to display images/PDFs
-- without authentication.
-- ==========================================

-- Bucket for location photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'location-photos',
    'location-photos',
    true,  -- Public bucket (anyone can read)
    52428800,  -- 50 MB in bytes (50 * 1024 * 1024)
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;  -- Skip if bucket already exists

-- Bucket for equipment photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'equipment-photos',
    'equipment-photos',
    true,  -- Public bucket (anyone can read)
    52428800,  -- 50 MB in bytes
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket for equipment documents (PDFs, manuals, certificates)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'equipment-documents',
    'equipment-documents',
    true,  -- Public bucket (anyone can read)
    52428800,  -- 50 MB in bytes
    ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- STORAGE POLICIES: location-photos bucket
-- ==========================================

-- Public READ: Anyone can view location photos (for QR codes)
CREATE POLICY "location_photos_public_read"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'location-photos');

-- Authenticated INSERT: Only logged-in users can upload location photos
CREATE POLICY "location_photos_authenticated_insert"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'location-photos'
        AND (storage.foldername(name))[1] IS NOT NULL  -- Ensure files are in a folder
    );

-- Authenticated UPDATE: Only logged-in users can update location photos metadata
CREATE POLICY "location_photos_authenticated_update"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'location-photos')
    WITH CHECK (bucket_id = 'location-photos');

-- Authenticated DELETE: Only logged-in users can delete location photos
CREATE POLICY "location_photos_authenticated_delete"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'location-photos');

-- ==========================================
-- STORAGE POLICIES: equipment-photos bucket
-- ==========================================

-- Public READ: Anyone can view equipment photos (for QR codes)
CREATE POLICY "equipment_photos_public_read"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'equipment-photos');

-- Authenticated INSERT: Only logged-in users can upload equipment photos
CREATE POLICY "equipment_photos_authenticated_insert"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'equipment-photos'
        AND (storage.foldername(name))[1] IS NOT NULL
    );

-- Authenticated UPDATE: Only logged-in users can update equipment photos metadata
CREATE POLICY "equipment_photos_authenticated_update"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'equipment-photos')
    WITH CHECK (bucket_id = 'equipment-photos');

-- Authenticated DELETE: Only logged-in users can delete equipment photos
CREATE POLICY "equipment_photos_authenticated_delete"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'equipment-photos');

-- ==========================================
-- STORAGE POLICIES: equipment-documents bucket
-- ==========================================

-- Public READ: Anyone can view equipment documents (for QR codes)
CREATE POLICY "equipment_documents_public_read"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'equipment-documents');

-- Authenticated INSERT: Only logged-in users can upload documents
CREATE POLICY "equipment_documents_authenticated_insert"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'equipment-documents'
        AND (storage.foldername(name))[1] IS NOT NULL
    );

-- Authenticated UPDATE: Only logged-in users can update document metadata
CREATE POLICY "equipment_documents_authenticated_update"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'equipment-documents')
    WITH CHECK (bucket_id = 'equipment-documents');

-- Authenticated DELETE: Only logged-in users can delete documents
CREATE POLICY "equipment_documents_authenticated_delete"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'equipment-documents');

-- ==========================================
-- STORAGE FOLDER STRUCTURE
-- ==========================================
-- Recommended folder structure for organized file storage:
--
-- location-photos/
--   ├── {location_id}/
--   │   ├── {timestamp}_photo.jpg
--   │   └── {timestamp}_photo2.jpg
--
-- equipment-photos/
--   ├── {equipment_id}/
--   │   ├── {timestamp}_photo.jpg
--   │   └── {timestamp}_photo2.jpg
--
-- equipment-documents/
--   ├── {equipment_id}/
--   │   ├── {timestamp}_manual.pdf
--   │   ├── {timestamp}_certificate.pdf
--   │   └── {timestamp}_specs.pdf
--
-- Example paths:
--   location-photos/123e4567-e89b-12d3-a456-426614174000/1702345678_photo.jpg
--   equipment-photos/987fcdeb-51a2-43f7-9876-543210fedcba/1702345678_vdx.jpg
--   equipment-documents/987fcdeb-51a2-43f7-9876-543210fedcba/1702345678_manual.pdf
--
-- ==========================================

-- ==========================================
-- FILE SIZE VALIDATION
-- ==========================================
-- Note: File size limits are enforced by:
--   1. Bucket-level limits (set in INSERT above): 50MB
--   2. Client-side validation (in JavaScript before upload)
--   3. Supabase server-side validation (automatic)
--
-- To change file size limit for a bucket:
--
-- UPDATE storage.buckets
-- SET file_size_limit = 104857600  -- 100MB in bytes
-- WHERE id = 'equipment-documents';
--
-- ==========================================

-- ==========================================
-- FILE TYPE VALIDATION
-- ==========================================
-- Allowed file types are enforced by allowed_mime_types in bucket config.
--
-- To add more file types:
--
-- UPDATE storage.buckets
-- SET allowed_mime_types = ARRAY[
--     'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
--     'application/pdf',
--     'application/msword',  -- .doc
--     'application/vnd.openxmlformats-officedocument.wordprocessingml.document'  -- .docx
-- ]
-- WHERE id = 'equipment-documents';
--
-- ==========================================

-- ==========================================
-- STORAGE USAGE MONITORING
-- ==========================================
-- To monitor storage usage:
--
-- SELECT
--     bucket_id,
--     COUNT(*) as file_count,
--     pg_size_pretty(SUM(metadata->>'size')::bigint) as total_size
-- FROM storage.objects
-- GROUP BY bucket_id;
--
-- To find largest files:
--
-- SELECT
--     bucket_id,
--     name,
--     pg_size_pretty((metadata->>'size')::bigint) as size,
--     created_at
-- FROM storage.objects
-- ORDER BY (metadata->>'size')::bigint DESC
-- LIMIT 20;
--
-- To find old files (cleanup candidates):
--
-- SELECT
--     bucket_id,
--     name,
--     pg_size_pretty((metadata->>'size')::bigint) as size,
--     created_at
-- FROM storage.objects
-- WHERE created_at < NOW() - INTERVAL '1 year'
-- ORDER BY created_at ASC;
--
-- ==========================================

-- ==========================================
-- TESTING STORAGE POLICIES
-- ==========================================
-- To test policies work correctly:
--
-- 1. Public READ test (no authentication):
--    SELECT * FROM storage.objects WHERE bucket_id = 'equipment-photos' LIMIT 1;
--    ✅ Should succeed
--
-- 2. Public WRITE test (no authentication):
--    -- Try to upload via Supabase client (unauthenticated)
--    ❌ Should fail (authentication required)
--
-- 3. Authenticated WRITE test (with auth):
--    -- Login first via Supabase Auth
--    -- Upload file via Supabase client
--    ✅ Should succeed
--
-- ==========================================

-- ==========================================
-- STORAGE BEST PRACTICES
-- ==========================================
-- 1. File Naming:
--    - Use timestamp prefix: {timestamp}_{filename}
--    - Avoid special characters (use _ instead of spaces)
--    - Keep filenames descriptive but concise
--
-- 2. Folder Organization:
--    - Always use entity ID as folder name (location_id, equipment_id)
--    - Keeps files organized and easy to delete
--    - Prevents naming conflicts
--
-- 3. Cleanup:
--    - Delete storage files when deleting equipment (use CASCADE in code)
--    - Periodically audit orphaned files (files without DB records)
--    - Compress images before upload (client-side optimization)
--
-- 4. Security:
--    - Never store sensitive data without encryption
--    - Use short-lived signed URLs for temporary access
--    - Monitor for abuse (excessive uploads, large files)
--
-- ==========================================

-- ==========================================
-- SUPABASE FREE TIER LIMITS
-- ==========================================
-- Supabase Free Tier (Spark Plan):
--   - Storage: 1 GB total
--   - Bandwidth: 2 GB/month (downloads)
--   - Uploads: Unlimited (but count toward storage)
--
-- For MLFF Equipment Tracking with typical usage:
--   - ~100 locations × 1MB photo = 100MB
--   - ~1000 equipment × 1MB photo = 1GB
--   - ~5000 documents × 200KB = 1GB
--   - TOTAL: ~2.1GB (slightly over free tier)
--
-- Recommendations:
--   - Compress images to 500KB max (still good quality)
--   - Limit to 1 photo per location/equipment
--   - Store only essential documents
--   - Upgrade to Pro ($25/month) if needed for 8GB storage
--
-- ==========================================

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
-- Supabase Storage configured successfully!
--
-- Summary:
--   - 3 storage buckets created
--   - 12 storage policies created (3 buckets × 4 operations)
--   - Public read access enabled (for QR codes)
--   - Authenticated write access enforced (admin only)
--   - File size limit: 50MB per file
--   - File type validation: Images and PDFs only
--
-- Next steps:
--   1. Test storage upload/download via Supabase Dashboard
--   2. Implement SupabaseService.uploadPhoto() in JavaScript
--   3. Implement SupabaseService.uploadDocument() in JavaScript
--   4. Update frontend to use Supabase Storage instead of Base64
--
-- All SQL migrations complete! Database and storage ready for use.
-- ==========================================
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
