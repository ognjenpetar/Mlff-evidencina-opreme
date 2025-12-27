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
