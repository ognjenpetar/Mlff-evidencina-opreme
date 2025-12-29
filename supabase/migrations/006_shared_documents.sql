-- ==========================================
-- MIGRATION 006: Shared Documents
-- ==========================================
-- Purpose: Create shared_documents table for general documentation not tied to specific equipment
-- Created: 2025-12-29
-- Version: 4.0 (Feature Enhancements)
-- ==========================================

-- Create shared_documents table
CREATE TABLE shared_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    category TEXT CHECK (category IN ('Procedure', 'Standardi', 'Pravila', 'Uputstva')),
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add table comment
COMMENT ON TABLE shared_documents IS 'General documentation shared across all users and locations';

-- Add column comments
COMMENT ON COLUMN shared_documents.category IS 'Document category: Procedure, Standardi, Pravila, or Uputstva';
COMMENT ON COLUMN shared_documents.storage_path IS 'Path in Supabase Storage bucket';

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS
ALTER TABLE shared_documents ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view shared documents
CREATE POLICY "Users can view shared documents"
    ON shared_documents FOR SELECT
    TO authenticated
    USING (true);

-- Policy: All authenticated users can upload shared documents
CREATE POLICY "Users can upload shared documents"
    ON shared_documents FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Users can update shared documents they uploaded
CREATE POLICY "Users can update their own shared documents"
    ON shared_documents FOR UPDATE
    TO authenticated
    USING (uploaded_by = auth.uid());

-- Policy: Users can delete shared documents they uploaded
CREATE POLICY "Users can delete their own shared documents"
    ON shared_documents FOR DELETE
    TO authenticated
    USING (uploaded_by = auth.uid());

-- ==========================================
-- INDEXES
-- ==========================================

-- Index for filtering by category
CREATE INDEX idx_shared_docs_category
    ON shared_documents(category)
    WHERE category IS NOT NULL;

-- Index for ordering by upload date
CREATE INDEX idx_shared_docs_uploaded_at
    ON shared_documents(uploaded_at DESC);

-- Index for finding documents by uploader
CREATE INDEX idx_shared_docs_uploaded_by
    ON shared_documents(uploaded_by)
    WHERE uploaded_by IS NOT NULL;

-- Full-text search on document name
CREATE INDEX idx_shared_docs_name_search
    ON shared_documents USING GIN (to_tsvector('simple', name));

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shared_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_shared_documents_timestamp
    BEFORE UPDATE ON shared_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_shared_documents_updated_at();

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
-- Created shared_documents table with:
-- - Full RLS policies for authenticated users
-- - Indexes for performance
-- - Auto-updated timestamps
--
-- Next step:
--   Run 007_enhanced_audit_log.sql to add old/new value tracking
-- ==========================================
