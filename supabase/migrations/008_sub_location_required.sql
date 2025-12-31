-- ==========================================
-- MIGRATION 008: Sub-Location Required
-- ==========================================
-- Purpose: Make sub_location field required and add validation
-- Created: 2025-12-30
-- Version: 4.1 (Sub-Location Architecture)
-- ==========================================

-- STEP 1: Assign default sub_location values based on equipment type
-- Gentri equipment types
UPDATE equipment
SET sub_location = 'Gentri'
WHERE type IN ('Antena', 'VDX', 'VRX', 'IUX', 'IUV')
  AND sub_location IS NULL;

-- Ormar equipment types
UPDATE equipment
SET sub_location = 'Ormar'
WHERE type IN ('TRC', 'TCM', 'Switch', 'Router', 'Jetson', 'Intel', 'Napajanje')
  AND sub_location IS NULL;

-- Assign remaining NULL values to 'Ormar' as default
UPDATE equipment
SET sub_location = 'Ormar'
WHERE sub_location IS NULL;

-- STEP 2: Make sub_location field NOT NULL
ALTER TABLE equipment
ALTER COLUMN sub_location SET NOT NULL;

-- STEP 3: Update CHECK constraint to only allow 'Gentri' or 'Ormar'
ALTER TABLE equipment
DROP CONSTRAINT IF EXISTS equipment_sub_location_check;

ALTER TABLE equipment
ADD CONSTRAINT equipment_sub_location_check
CHECK (sub_location IN ('Gentri', 'Ormar'));

-- STEP 4: Create validation function for equipment type based on sub-location
CREATE OR REPLACE FUNCTION validate_equipment_type_for_sublocation()
RETURNS TRIGGER AS $$
DECLARE
    valid_types TEXT[];
BEGIN
    -- Define valid types based on sub_location
    IF NEW.sub_location = 'Gentri' THEN
        valid_types := ARRAY['Antena', 'VDX', 'VRX', 'IUX', 'IUV'];
    ELSIF NEW.sub_location = 'Ormar' THEN
        valid_types := ARRAY['TRC', 'TCM', 'Switch', 'Router', 'Jetson', 'Intel', 'Napajanje'];
    ELSE
        RAISE EXCEPTION 'Invalid sub_location: %. Must be Gentri or Ormar', NEW.sub_location;
    END IF;

    -- Validate that equipment type matches sub-location
    IF NOT (NEW.type = ANY(valid_types)) THEN
        RAISE EXCEPTION 'Equipment type "%" is not valid for sub-location "%". Valid types: %',
            NEW.type, NEW.sub_location, array_to_string(valid_types, ', ');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 5: Create trigger to validate equipment type on INSERT/UPDATE
DROP TRIGGER IF EXISTS trigger_validate_equipment_type ON equipment;

CREATE TRIGGER trigger_validate_equipment_type
    BEFORE INSERT OR UPDATE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION validate_equipment_type_for_sublocation();

-- STEP 6: Add helpful comments
COMMENT ON COLUMN equipment.sub_location IS 'Required field: Gentri (Antena, VDX, VRX, IUX, IUV) or Ormar (TRC, TCM, Switch, Router, Jetson, Intel, Napajanje)';

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================
/*
-- Check that all equipment has sub_location assigned
SELECT COUNT(*) as total_equipment,
       COUNT(sub_location) as with_sublocation
FROM equipment;

-- View distribution by sub_location
SELECT sub_location, COUNT(*) as count
FROM equipment
GROUP BY sub_location;

-- Test validation (should fail)
-- INSERT INTO equipment (sub_location, type, inventory_number)
-- VALUES ('Gentri', 'Switch', 'TEST-001');  -- Should fail: Switch is for Ormar

-- Test validation (should succeed)
-- INSERT INTO equipment (sub_location, type, inventory_number)
-- VALUES ('Gentri', 'Antena', 'TEST-002');  -- Should succeed
*/

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
-- Changes made:
-- ✅ All existing equipment assigned to Gentri or Ormar based on type
-- ✅ sub_location field is now NOT NULL (required)
-- ✅ CHECK constraint limits values to 'Gentri' or 'Ormar'
-- ✅ Database trigger validates type/sub-location match on INSERT/UPDATE
--
-- Next step:
--   Run 009_type_shared_documents.sql to create shared documents table
-- ==========================================
