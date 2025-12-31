-- ==========================================
-- MIGRATION 009: Type Shared Documents
-- ==========================================
-- Purpose: Create table for type-based shared documents
-- Created: 2025-12-30
-- Version: 4.1 (Sub-Location Architecture)
-- ==========================================

-- STEP 1: Create type_shared_documents table
CREATE TABLE type_shared_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 2: Add constraint for valid equipment types only
ALTER TABLE type_shared_documents
ADD CONSTRAINT check_valid_equipment_type
CHECK (equipment_type IN (
    'Antena', 'VDX', 'VRX', 'IUX', 'IUV',
    'TRC', 'TCM', 'Switch', 'Router', 'Jetson', 'Intel', 'Napajanje'
));

-- STEP 3: Create indexes for performance
CREATE INDEX idx_type_shared_docs_type
    ON type_shared_documents(equipment_type);

CREATE INDEX idx_type_shared_docs_uploaded_at
    ON type_shared_documents(uploaded_at DESC);

-- STEP 4: Add helpful comments
COMMENT ON TABLE type_shared_documents IS 'Shared documents for all equipment of the same type';
COMMENT ON COLUMN type_shared_documents.equipment_type IS 'Type of equipment this document applies to (e.g., Antena, Switch)';
COMMENT ON COLUMN type_shared_documents.name IS 'Display name of the document';
COMMENT ON COLUMN type_shared_documents.file_url IS 'Public URL to the document file in Supabase Storage';
COMMENT ON COLUMN type_shared_documents.storage_path IS 'Storage path in the equipment-documents bucket';

-- STEP 5: Enable Row Level Security
ALTER TABLE type_shared_documents ENABLE ROW LEVEL SECURITY;

-- STEP 6: Create RLS Policies
-- Policy: Public can view type_shared_documents
CREATE POLICY "Public can view type_shared_documents"
ON type_shared_documents FOR SELECT
TO anon
USING (true);

-- Policy: Authenticated users can view type_shared_documents
CREATE POLICY "Authenticated users can view type_shared_documents"
ON type_shared_documents FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated users can insert type_shared_documents
CREATE POLICY "Authenticated users can insert type_shared_documents"
ON type_shared_documents FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Authenticated users can update type_shared_documents
CREATE POLICY "Authenticated users can update type_shared_documents"
ON type_shared_documents FOR UPDATE
TO authenticated
USING (true);

-- Policy: Authenticated users can delete type_shared_documents
CREATE POLICY "Authenticated users can delete type_shared_documents"
ON type_shared_documents FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================
/*
-- View all type shared documents
SELECT equipment_type, COUNT(*) as document_count
FROM type_shared_documents
GROUP BY equipment_type
ORDER BY equipment_type;

-- Find all shared documents for a specific equipment type
SELECT id, name, description, file_url, uploaded_at
FROM type_shared_documents
WHERE equipment_type = 'Antena'
ORDER BY uploaded_at DESC;

-- Test insert (should succeed)
-- INSERT INTO type_shared_documents (equipment_type, name, file_url, storage_path)
-- VALUES ('Antena', 'Test Manual', 'https://example.com/manual.pdf', 'type_shared/Antena/manual.pdf');

-- Test invalid type (should fail)
-- INSERT INTO type_shared_documents (equipment_type, name, file_url, storage_path)
-- VALUES ('InvalidType', 'Test', 'https://example.com/test.pdf', 'test.pdf');
*/

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
-- Changes made:
-- ✅ Created type_shared_documents table with proper schema
-- ✅ Added CHECK constraint for valid equipment types
-- ✅ Created indexes for equipment_type and uploaded_at
-- ✅ Enabled Row Level Security
-- ✅ Created RLS policies for public read and authenticated full access
--
-- Next step:
--   Update frontend (js/app.js, index.html, css/styles.css) to use this table
-- ==========================================
