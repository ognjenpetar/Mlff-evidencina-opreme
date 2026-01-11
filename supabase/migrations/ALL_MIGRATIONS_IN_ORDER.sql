-- ==========================================
-- MLFF Equipment Tracking - Complete Migration
-- Run this in Supabase SQL Editor
-- ==========================================

-- FAZA 1: Basic Schema
\i 001_initial_schema.sql
\i 002_rls_policies.sql
\i 003_indexes.sql
\i 003_indexes_cleanup.sql
\i 004_storage_setup.sql

-- FAZA 2: Additional Features
\i 005_sub_location_field.sql
\i 006_shared_documents.sql
\i 007_enhanced_audit_log.sql
\i 009_type_shared_documents.sql
\i 010_upcoming_maintenance_function.sql

-- FAZA 3: Anonymous Mode (CRITICAL!)
\i 005_allow_anonymous_upload.sql
\i 007_allow_anonymous_database_access.sql
\i 006_create_maintenance_functions.sql
\i 008_fix_maintenance_function.sql
