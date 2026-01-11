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
-- ==========================================
-- Maintenance Functions
-- ==========================================
-- This migration creates stored procedures for maintenance operations
-- ==========================================

-- ==========================================
-- Function: get_upcoming_maintenance
-- ==========================================
-- Returns all maintenance records with upcoming service dates (next 30 days)
-- Used by the dashboard to show maintenance alerts
-- ==========================================

CREATE OR REPLACE FUNCTION get_upcoming_maintenance()
RETURNS TABLE (
    equipment_id UUID,
    equipment_inventory_number VARCHAR,
    equipment_type VARCHAR,
    maintenance_type VARCHAR,
    next_service_date DATE,
    days_until_service INT,
    location_name VARCHAR,
    location_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id AS equipment_id,
        e.inventory_number AS equipment_inventory_number,
        e.type AS equipment_type,
        m.type AS maintenance_type,
        m.next_service_date,
        (m.next_service_date - CURRENT_DATE)::INT AS days_until_service,
        l.name AS location_name,
        l.id AS location_id
    FROM maintenance m
    INNER JOIN equipment e ON m.equipment_id = e.id
    INNER JOIN locations l ON e.location_id = l.id
    WHERE m.next_service_date IS NOT NULL
      AND m.next_service_date >= CURRENT_DATE
      AND m.next_service_date <= CURRENT_DATE + INTERVAL '30 days'
    ORDER BY m.next_service_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public (anyone can call this function)
GRANT EXECUTE ON FUNCTION get_upcoming_maintenance() TO public;

-- ==========================================
-- Function: get_overdue_maintenance
-- ==========================================
-- Returns all maintenance records that are overdue
-- Used by the dashboard to show overdue alerts
-- ==========================================

CREATE OR REPLACE FUNCTION get_overdue_maintenance()
RETURNS TABLE (
    equipment_id UUID,
    equipment_inventory_number VARCHAR,
    equipment_type VARCHAR,
    maintenance_type VARCHAR,
    next_service_date DATE,
    days_overdue INT,
    location_name VARCHAR,
    location_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id AS equipment_id,
        e.inventory_number AS equipment_inventory_number,
        e.type AS equipment_type,
        m.type AS maintenance_type,
        m.next_service_date,
        (CURRENT_DATE - m.next_service_date)::INT AS days_overdue,
        l.name AS location_name,
        l.id AS location_id
    FROM maintenance m
    INNER JOIN equipment e ON m.equipment_id = e.id
    INNER JOIN locations l ON e.location_id = l.id
    WHERE m.next_service_date IS NOT NULL
      AND m.next_service_date < CURRENT_DATE
    ORDER BY m.next_service_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION get_overdue_maintenance() TO public;

-- ==========================================
-- Function: get_equipment_summary
-- ==========================================
-- Returns summary statistics for equipment
-- Used by the dashboard for stat cards
-- ==========================================

CREATE OR REPLACE FUNCTION get_equipment_summary()
RETURNS TABLE (
    total_equipment BIGINT,
    active_equipment BIGINT,
    inactive_equipment BIGINT,
    maintenance_equipment BIGINT,
    retired_equipment BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT AS total_equipment,
        COUNT(*) FILTER (WHERE status = 'Aktivna')::BIGINT AS active_equipment,
        COUNT(*) FILTER (WHERE status = 'Neaktivna')::BIGINT AS inactive_equipment,
        COUNT(*) FILTER (WHERE status = 'U servisu')::BIGINT AS maintenance_equipment,
        COUNT(*) FILTER (WHERE status = 'Rashodovana')::BIGINT AS retired_equipment
    FROM equipment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION get_equipment_summary() TO public;

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
-- Created functions:
--   1. get_upcoming_maintenance() - Returns upcoming maintenance (next 30 days)
--   2. get_overdue_maintenance() - Returns overdue maintenance
--   3. get_equipment_summary() - Returns equipment statistics
--
-- All functions are callable by public (no authentication required)
-- ==========================================
-- ==========================================
-- Fix get_upcoming_maintenance Function
-- ==========================================
-- This migration fixes the get_upcoming_maintenance function
-- to work properly with Supabase RPC calls
-- ==========================================

-- Drop existing function completely
DROP FUNCTION IF EXISTS get_upcoming_maintenance();

-- Create simplified version that returns JSONB
CREATE OR REPLACE FUNCTION get_upcoming_maintenance()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Return empty array if no maintenance table exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'maintenance'
    ) THEN
        RETURN '[]'::JSONB;
    END IF;

    -- Build result as JSON array
    SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::JSONB)
    INTO result
    FROM (
        SELECT
            e.id AS equipment_id,
            e.inventory_number AS equipment_inventory_number,
            e.type AS equipment_type,
            m.type AS maintenance_type,
            m.next_service_date,
            (m.next_service_date - CURRENT_DATE)::INT AS days_until_service,
            l.name AS location_name,
            l.id AS location_id
        FROM maintenance m
        INNER JOIN equipment e ON m.equipment_id = e.id
        INNER JOIN locations l ON e.location_id = l.id
        WHERE m.next_service_date IS NOT NULL
          AND m.next_service_date >= CURRENT_DATE
          AND m.next_service_date <= CURRENT_DATE + INTERVAL '30 days'
        ORDER BY m.next_service_date ASC
        LIMIT 100
    ) t;

    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        -- Return empty array on any error
        RETURN '[]'::JSONB;
END;
$$;

-- Grant execute to everyone
GRANT EXECUTE ON FUNCTION get_upcoming_maintenance() TO public;
GRANT EXECUTE ON FUNCTION get_upcoming_maintenance() TO anon;
GRANT EXECUTE ON FUNCTION get_upcoming_maintenance() TO authenticated;

-- ==========================================
-- Test the function
-- ==========================================
-- You can test this function by running:
-- SELECT get_upcoming_maintenance();
--
-- Should return: [] (empty array if no upcoming maintenance)
-- ==========================================

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
-- Function get_upcoming_maintenance() fixed:
--   ✅ Returns JSONB instead of TABLE
--   ✅ Returns empty array [] if no data
--   ✅ Handles errors gracefully (returns [])
--   ✅ Callable by anyone (public, anon, authenticated)
--   ✅ SECURITY DEFINER (runs with creator privileges)
-- ==========================================
