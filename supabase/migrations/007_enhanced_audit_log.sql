-- ==========================================
-- MIGRATION 007: Enhanced Audit Log
-- ==========================================
-- Purpose: Add old_value and new_value JSONB columns to audit_log for detailed change tracking
-- Created: 2025-12-29
-- Version: 4.0 (Feature Enhancements)
-- ==========================================

-- Add new columns to audit_log table
ALTER TABLE audit_log
ADD COLUMN old_value JSONB,
ADD COLUMN new_value JSONB,
ADD COLUMN field_name TEXT;

-- Add column comments
COMMENT ON COLUMN audit_log.old_value IS 'Previous value before change (JSONB format for structured data)';
COMMENT ON COLUMN audit_log.new_value IS 'New value after change (JSONB format for structured data)';
COMMENT ON COLUMN audit_log.field_name IS 'Name of the field that was changed (e.g., status, type, ip_address)';

-- ==========================================
-- INDEXES
-- ==========================================

-- Index for searching changes by field name
CREATE INDEX idx_audit_field_changes
    ON audit_log(field_name, timestamp DESC)
    WHERE field_name IS NOT NULL;

-- GIN indexes for searching within JSONB values
CREATE INDEX idx_audit_old_value_gin
    ON audit_log USING GIN (old_value)
    WHERE old_value IS NOT NULL;

CREATE INDEX idx_audit_new_value_gin
    ON audit_log USING GIN (new_value)
    WHERE new_value IS NOT NULL;

-- Composite index for field-specific queries
CREATE INDEX idx_audit_equipment_field_timestamp
    ON audit_log(equipment_id, field_name, timestamp DESC)
    WHERE field_name IS NOT NULL;

-- ==========================================
-- EXAMPLE QUERIES
-- ==========================================
/*
-- Find all status changes for specific equipment:
SELECT
    timestamp,
    user_email,
    field_name,
    old_value->>'status' AS old_status,
    new_value->>'status' AS new_status
FROM audit_log
WHERE equipment_id = 'some-uuid'
  AND field_name = 'status'
ORDER BY timestamp DESC;

-- Find all changes made by a specific user:
SELECT
    timestamp,
    field_name,
    old_value,
    new_value
FROM audit_log
WHERE user_email = 'user@example.com'
  AND old_value IS NOT NULL
ORDER BY timestamp DESC;

-- Track all IP address changes across all equipment:
SELECT
    equipment_id,
    timestamp,
    old_value->>'ip_address' AS old_ip,
    new_value->>'ip_address' AS new_ip
FROM audit_log
WHERE field_name = 'ip_address'
ORDER BY timestamp DESC;
*/

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
-- Enhanced audit_log table with:
-- - old_value JSONB column for previous values
-- - new_value JSONB column for new values
-- - field_name TEXT column for field identification
-- - GIN indexes for JSONB searching
-- - Composite indexes for efficient queries
--
-- Backward compatibility: 100% maintained
-- - Existing audit_log entries still have action and details fields
-- - New entries can optionally include old_value, new_value, and field_name
-- ==========================================
