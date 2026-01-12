-- ==========================================
-- ADD "Neaktivna" STATUS TO EQUIPMENT
-- ==========================================
-- This script adds "Neaktivna" status to the allowed equipment statuses
-- Run this in Supabase SQL Editor
-- ==========================================

-- Check current trigger/constraint
SELECT 'Current status validation:' AS info;
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%status%'
  AND constraint_schema = 'public';

-- Show current trigger definition
SELECT 'Current triggers on equipment table:' AS info;
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'equipment'
  AND trigger_schema = 'public';

-- ==========================================
-- DROP OLD TRIGGER (if exists)
-- ==========================================
DROP TRIGGER IF EXISTS validate_equipment_status ON equipment;
DROP FUNCTION IF EXISTS validate_equipment_status();

-- ==========================================
-- CREATE NEW TRIGGER WITH "Neaktivna" STATUS
-- ==========================================
CREATE OR REPLACE FUNCTION validate_equipment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate status values (including "Neaktivna")
    IF NEW.status NOT IN ('Aktivna', 'Neaktivna', 'Na servisu', 'Neispravna', 'Povučena') THEN
        RAISE EXCEPTION 'Invalid status: %. Must be one of: Aktivna, Neaktivna, Na servisu, Neispravna, Povučena', NEW.status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER validate_equipment_status
    BEFORE INSERT OR UPDATE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION validate_equipment_status();

-- ==========================================
-- TEST THE UPDATE
-- ==========================================
SELECT 'Testing status validation...' AS info;

-- This should succeed
SELECT 'Test 1: Valid status "Neaktivna"' AS test;
-- (Actual insert will be done by application)

-- ==========================================
-- VERIFY TRIGGER
-- ==========================================
SELECT 'Verification:' AS info;
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE event_object_table = 'equipment'
  AND trigger_name = 'validate_equipment_status';

SELECT '✅ Status validation updated! "Neaktivna" is now allowed.' AS result;
