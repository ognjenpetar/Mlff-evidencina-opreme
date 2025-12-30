-- ==========================================
-- MIGRATION 005: Sub-location Field
-- ==========================================
-- Purpose: Add sub_location field to equipment table for Gentri/Ormar categorization
-- Created: 2025-12-29
-- Version: 4.0 (Feature Enhancements)
-- ==========================================

-- Add sub_location column to equipment table
ALTER TABLE equipment
ADD COLUMN sub_location TEXT CHECK (sub_location IN ('Gentri', 'Ormar'));

-- Add comment for documentation
COMMENT ON COLUMN equipment.sub_location IS 'Type of cabinet/enclosure: Gentri or Ormar. NULL if not applicable.';

-- Create index for efficient filtering by sub-location
CREATE INDEX idx_equipment_sub_location
    ON equipment(sub_location)
    WHERE sub_location IS NOT NULL;

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
-- Added sub_location field to equipment table
--
-- Next step:
--   Run 006_shared_documents.sql to create shared documents table
--
-- This field is optional (nullable) for backward compatibility
-- ==========================================
