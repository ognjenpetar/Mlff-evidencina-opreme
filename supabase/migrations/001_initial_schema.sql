-- ==========================================
-- MLFF Equipment Tracking - Initial Database Schema
-- Version: 3.0 (Supabase Edition)
-- ==========================================
--
-- This migration creates the foundational PostgreSQL schema for the
-- MLFF Equipment Tracking application, migrating from Firebase Firestore
-- to Supabase PostgreSQL.
--
-- Tables created:
--   1. locations - Physical locations where equipment is installed
--   2. equipment - Equipment items tracked in the system
--   3. documents - PDF documents attached to equipment
--   4. maintenance - Maintenance history for equipment
--   5. audit_log - Audit trail of all equipment changes
--   6. custom_types - User-defined equipment types
--
-- Key Features:
--   - UUID primary keys for all tables
--   - Foreign key relationships with CASCADE DELETE
--   - Automatic timestamps (created_at, updated_at)
--   - Triggers for updating updated_at columns
--   - Data validation via CHECK constraints
--
-- ==========================================

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABLE: locations
-- ==========================================
-- Stores physical locations where equipment is installed
-- (e.g., "Portal Beograd-Niš KM 12")
--
-- Firestore equivalent: /locations/{id}
-- ==========================================

CREATE TABLE locations (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Basic information
    name TEXT NOT NULL,

    -- GPS coordinates (DECIMAL for precision)
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,

    -- Address and description
    address TEXT,
    description TEXT,

    -- Photo URL (stored in Supabase Storage)
    photo_url TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups by name
CREATE INDEX idx_locations_name ON locations(name);

-- ==========================================
-- TABLE: equipment
-- ==========================================
-- Stores equipment items (e.g., VDX units, VRX units)
-- Each equipment belongs to exactly one location.
--
-- Firestore equivalent: /equipment/{id}
-- ==========================================

CREATE TABLE equipment (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Foreign key to locations (CASCADE DELETE)
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

    -- Basic identification
    inventory_number TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Aktivna' CHECK (status IN ('Aktivna', 'Na servisu', 'Neispravna', 'Povučena')),

    -- Technical specifications
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,

    -- Network configuration
    ip_address INET,
    mac_address MACADDR,

    -- Physical position (in centimeters)
    x_coord INTEGER DEFAULT 0,
    y_coord INTEGER DEFAULT 0,
    z_coord INTEGER DEFAULT 0,

    -- Installation information
    installation_date DATE,
    installer_name TEXT,
    tester_name TEXT,

    -- Warranty
    warranty_expiry DATE,

    -- Photo URL (stored in Supabase Storage)
    photo_url TEXT,

    -- Additional notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_equipment_location_id ON equipment(location_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_type ON equipment(type);
CREATE INDEX idx_equipment_inventory_number ON equipment(inventory_number);

-- ==========================================
-- TABLE: documents
-- ==========================================
-- Stores PDF documents attached to equipment
-- (e.g., manuals, certificates, technical specs)
--
-- Firestore equivalent: /equipment/{equipmentId}/documents/{docId}
-- ==========================================

CREATE TABLE documents (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Foreign key to equipment (CASCADE DELETE)
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,

    -- File information
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,

    -- Upload timestamp
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching all documents of specific equipment
CREATE INDEX idx_documents_equipment_id ON documents(equipment_id);

-- ==========================================
-- TABLE: maintenance
-- ==========================================
-- Stores maintenance history for equipment
--
-- Firestore equivalent: /equipment/{equipmentId}/maintenance/{maintenanceId}
-- ==========================================

CREATE TABLE maintenance (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Foreign key to equipment (CASCADE DELETE)
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,

    -- Maintenance details
    type TEXT CHECK (type IN ('Preventivni', 'Korektivni', 'Inspekcija', 'Zamena dela', 'Kalibracija')),
    date DATE NOT NULL,
    description TEXT,
    performed_by TEXT,
    cost NUMERIC(10, 2),
    next_service_date DATE,

    -- Created timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_maintenance_equipment_id ON maintenance(equipment_id);
CREATE INDEX idx_maintenance_date ON maintenance(date DESC);
CREATE INDEX idx_maintenance_next_service ON maintenance(next_service_date);

-- ==========================================
-- TABLE: audit_log
-- ==========================================
-- Audit trail of all equipment changes
-- Tracks who did what and when
--
-- Firestore equivalent: /equipment/{equipmentId}/auditLog/{logId}
-- ==========================================

CREATE TABLE audit_log (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Foreign key to equipment (CASCADE DELETE)
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,

    -- Action details
    action TEXT NOT NULL,
    details TEXT,

    -- User information (from Supabase Auth)
    user_id UUID,
    user_email TEXT,

    -- Timestamp
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit queries
CREATE INDEX idx_audit_log_equipment_id ON audit_log(equipment_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);

-- ==========================================
-- TABLE: custom_types
-- ==========================================
-- User-defined equipment types
-- Allows users to add custom equipment categories beyond defaults
--
-- Firestore equivalent: /customTypes/{id}
-- ==========================================

CREATE TABLE custom_types (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Type name (must be unique)
    type_name TEXT NOT NULL UNIQUE,

    -- Created timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for type name lookups
CREATE INDEX idx_custom_types_type_name ON custom_types(type_name);

-- ==========================================
-- TRIGGERS: Auto-update updated_at column
-- ==========================================
-- Automatically updates the updated_at column whenever a row is modified
-- ==========================================

-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to locations table
CREATE TRIGGER trigger_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to equipment table
CREATE TRIGGER trigger_equipment_updated_at
    BEFORE UPDATE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- COMMENTS: Table and column documentation
-- ==========================================

COMMENT ON TABLE locations IS 'Physical locations where equipment is installed';
COMMENT ON TABLE equipment IS 'Equipment items tracked in the system';
COMMENT ON TABLE documents IS 'PDF documents and files attached to equipment';
COMMENT ON TABLE maintenance IS 'Maintenance history and service records';
COMMENT ON TABLE audit_log IS 'Audit trail of all equipment changes';
COMMENT ON TABLE custom_types IS 'User-defined equipment types';

COMMENT ON COLUMN equipment.status IS 'Current operational status: Aktivna, Na servisu, Neispravna, Povučena';
COMMENT ON COLUMN equipment.x_coord IS 'X coordinate in centimeters for 3D positioning';
COMMENT ON COLUMN equipment.y_coord IS 'Y coordinate in centimeters for 3D positioning';
COMMENT ON COLUMN equipment.z_coord IS 'Z coordinate in centimeters for 3D positioning';
COMMENT ON COLUMN maintenance.type IS 'Type of maintenance: Preventivni, Korektivni, Inspekcija, Zamena dela, Kalibracija';

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
-- Schema created successfully!
--
-- Next steps:
--   1. Run 002_rls_policies.sql to set up Row Level Security
--   2. Run 003_indexes.sql to create additional performance indexes
--   3. Run 004_storage_setup.sql to configure Supabase Storage buckets
--
-- Total tables created: 6
-- Total indexes created: 15
-- Total triggers created: 2
-- ==========================================
