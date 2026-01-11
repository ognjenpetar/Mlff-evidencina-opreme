-- ==========================================
-- CHECK: Verify table schemas and column names
-- ==========================================
-- Run this in Supabase SQL Editor
-- ==========================================

-- Check locations table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'locations'
ORDER BY ordinal_position;

-- Check equipment table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'equipment'
ORDER BY ordinal_position;

-- Check maintenance table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'maintenance'
ORDER BY ordinal_position;

-- Check documents table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'documents'
ORDER BY ordinal_position;

-- ==========================================
-- Expected column names (snake_case):
-- ==========================================
-- locations: photo_url (NOT photoURL)
-- equipment: photo_url (NOT photoURL)
-- equipment: location_id (NOT locationId)
-- equipment: inventory_number (NOT inventoryNumber)
-- etc...
-- ==========================================
