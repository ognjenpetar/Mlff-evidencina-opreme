-- ==========================================
-- MLFF Equipment Tracking - Index Cleanup
-- Version: 3.0 (Supabase Edition)
-- ==========================================
--
-- This script drops all indexes created by 003_indexes.sql
-- Run this BEFORE running 003_indexes.sql if you get "already exists" errors
--
-- ==========================================

-- Drop composite indexes
DROP INDEX IF EXISTS idx_equipment_location_status;
DROP INDEX IF EXISTS idx_equipment_location_type;
DROP INDEX IF EXISTS idx_equipment_type_status;
DROP INDEX IF EXISTS idx_equipment_status_created;

-- Drop maintenance indexes
DROP INDEX IF EXISTS idx_maintenance_equipment_date;
DROP INDEX IF EXISTS idx_maintenance_next_service;
DROP INDEX IF EXISTS idx_maintenance_upcoming;
DROP INDEX IF EXISTS idx_maintenance_overdue;

-- Drop documents indexes
DROP INDEX IF EXISTS idx_documents_equipment_type;
DROP INDEX IF EXISTS idx_documents_uploaded_at;

-- Drop audit log indexes
DROP INDEX IF EXISTS idx_audit_equipment_timestamp;
DROP INDEX IF EXISTS idx_audit_user_timestamp;
DROP INDEX IF EXISTS idx_audit_timestamp;
DROP INDEX IF EXISTS idx_audit_recent;

-- Drop text search indexes
DROP INDEX IF EXISTS idx_locations_name_text;
DROP INDEX IF EXISTS idx_locations_address_text;
DROP INDEX IF EXISTS idx_equipment_inventory_text;
DROP INDEX IF EXISTS idx_equipment_model_text;
DROP INDEX IF EXISTS idx_equipment_serial_text;
DROP INDEX IF EXISTS idx_equipment_notes_text;

-- Drop partial indexes
DROP INDEX IF EXISTS idx_equipment_active;
DROP INDEX IF EXISTS idx_equipment_needs_service;
DROP INDEX IF EXISTS idx_equipment_warranty;
DROP INDEX IF EXISTS idx_equipment_warranty_active;
DROP INDEX IF EXISTS idx_equipment_warranty_expired;

-- Drop covering indexes
DROP INDEX IF EXISTS idx_equipment_list_covering;
DROP INDEX IF EXISTS idx_maintenance_history_covering;

-- ==========================================
-- CLEANUP COMPLETE
-- ==========================================
-- All indexes from 003_indexes.sql have been dropped.
--
-- Next step:
--   Run 003_indexes.sql to recreate indexes with fixes
-- ==========================================
