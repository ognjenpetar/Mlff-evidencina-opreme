-- ==========================================
-- TEMPORARY: Allow Anonymous Photo Uploads
-- ==========================================
-- This migration temporarily allows unauthenticated users to upload photos
-- for testing purposes. This should be removed in production.
--
-- WARNING: This reduces security! Anyone can upload files to your buckets.
-- Use this only for testing, then revert to authenticated-only uploads.
-- ==========================================

-- ==========================================
-- DROP EXISTING AUTHENTICATED-ONLY POLICIES
-- ==========================================

-- Drop location-photos INSERT policy
DROP POLICY IF EXISTS "location_photos_authenticated_insert" ON storage.objects;

-- Drop equipment-photos INSERT policy
DROP POLICY IF EXISTS "equipment_photos_authenticated_insert" ON storage.objects;

-- Drop equipment-documents INSERT policy
DROP POLICY IF EXISTS "equipment_documents_authenticated_insert" ON storage.objects;

-- ==========================================
-- CREATE NEW PUBLIC INSERT POLICIES
-- ==========================================
-- These allow ANYONE (authenticated OR anonymous) to upload files
-- ==========================================

-- Allow PUBLIC INSERT for location photos
CREATE POLICY "location_photos_public_insert"
    ON storage.objects
    FOR INSERT
    TO public
    WITH CHECK (
        bucket_id = 'location-photos'
        AND (storage.foldername(name))[1] IS NOT NULL  -- Still require folder structure
    );

-- Allow PUBLIC INSERT for equipment photos
CREATE POLICY "equipment_photos_public_insert"
    ON storage.objects
    FOR INSERT
    TO public
    WITH CHECK (
        bucket_id = 'equipment-photos'
        AND (storage.foldername(name))[1] IS NOT NULL
    );

-- Allow PUBLIC INSERT for equipment documents
CREATE POLICY "equipment_documents_public_insert"
    ON storage.objects
    FOR INSERT
    TO public
    WITH CHECK (
        bucket_id = 'equipment-documents'
        AND (storage.foldername(name))[1] IS NOT NULL
    );

-- ==========================================
-- DROP EXISTING AUTHENTICATED-ONLY UPDATE POLICIES
-- ==========================================

DROP POLICY IF EXISTS "location_photos_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "equipment_photos_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "equipment_documents_authenticated_update" ON storage.objects;

-- ==========================================
-- CREATE NEW PUBLIC UPDATE POLICIES
-- ==========================================

CREATE POLICY "location_photos_public_update"
    ON storage.objects
    FOR UPDATE
    TO public
    USING (bucket_id = 'location-photos')
    WITH CHECK (bucket_id = 'location-photos');

CREATE POLICY "equipment_photos_public_update"
    ON storage.objects
    FOR UPDATE
    TO public
    USING (bucket_id = 'equipment-photos')
    WITH CHECK (bucket_id = 'equipment-photos');

CREATE POLICY "equipment_documents_public_update"
    ON storage.objects
    FOR UPDATE
    TO public
    USING (bucket_id = 'equipment-documents')
    WITH CHECK (bucket_id = 'equipment-documents');

-- ==========================================
-- DROP EXISTING AUTHENTICATED-ONLY DELETE POLICIES
-- ==========================================

DROP POLICY IF EXISTS "location_photos_authenticated_delete" ON storage.objects;
DROP POLICY IF EXISTS "equipment_photos_authenticated_delete" ON storage.objects;
DROP POLICY IF EXISTS "equipment_documents_authenticated_delete" ON storage.objects;

-- ==========================================
-- CREATE NEW PUBLIC DELETE POLICIES
-- ==========================================

CREATE POLICY "location_photos_public_delete"
    ON storage.objects
    FOR DELETE
    TO public
    USING (bucket_id = 'location-photos');

CREATE POLICY "equipment_photos_public_delete"
    ON storage.objects
    FOR DELETE
    TO public
    USING (bucket_id = 'equipment-photos');

CREATE POLICY "equipment_documents_public_delete"
    ON storage.objects
    FOR DELETE
    TO public
    USING (bucket_id = 'equipment-documents');

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
-- Storage policies updated:
--   ✅ INSERT: public (anyone can upload)
--   ✅ UPDATE: public (anyone can update metadata)
--   ✅ DELETE: public (anyone can delete)
--   ✅ SELECT: public (already set in 004_storage_setup.sql)
--
-- ⚠️ WARNING: This is less secure than authenticated-only access!
-- ⚠️ Use this for testing, then revert to authenticated policies in production.
--
-- To revert to authenticated-only access, run:
--   supabase/migrations/004_storage_setup.sql (lines 75-170)
-- ==========================================
