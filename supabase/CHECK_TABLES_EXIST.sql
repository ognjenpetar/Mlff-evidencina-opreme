-- ==========================================
-- SIMPLE TEST: Do tables exist?
-- ==========================================

-- Check if locations table exists
SELECT 'locations' AS table_name,
       EXISTS (
           SELECT FROM information_schema.tables
           WHERE table_schema = 'public'
           AND table_name = 'locations'
       ) AS exists;

-- Check if equipment table exists
SELECT 'equipment' AS table_name,
       EXISTS (
           SELECT FROM information_schema.tables
           WHERE table_schema = 'public'
           AND table_name = 'equipment'
       ) AS exists;

-- Check if documents table exists
SELECT 'documents' AS table_name,
       EXISTS (
           SELECT FROM information_schema.tables
           WHERE table_schema = 'public'
           AND table_name = 'documents'
       ) AS exists;

-- Check if maintenance table exists
SELECT 'maintenance' AS table_name,
       EXISTS (
           SELECT FROM information_schema.tables
           WHERE table_schema = 'public'
           AND table_name = 'maintenance'
       ) AS exists;

-- If tables exist, show their columns
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('locations', 'equipment', 'documents', 'maintenance')
ORDER BY table_name, ordinal_position;
