-- ==========================================
-- Maintenance Functions
-- ==========================================
-- This migration creates stored procedures for maintenance operations
-- ==========================================

-- ==========================================
-- Function: get_upcoming_maintenance
-- ==========================================
-- Returns all maintenance records with upcoming service dates (next 30 days)
-- Used by the dashboard to show maintenance alerts
-- ==========================================

CREATE OR REPLACE FUNCTION get_upcoming_maintenance()
RETURNS TABLE (
    equipment_id UUID,
    equipment_inventory_number VARCHAR,
    equipment_type VARCHAR,
    maintenance_type VARCHAR,
    next_service_date DATE,
    days_until_service INT,
    location_name VARCHAR,
    location_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id AS equipment_id,
        e.inventory_number AS equipment_inventory_number,
        e.type AS equipment_type,
        m.type AS maintenance_type,
        m.next_service_date,
        (m.next_service_date - CURRENT_DATE)::INT AS days_until_service,
        l.name AS location_name,
        l.id AS location_id
    FROM maintenance m
    INNER JOIN equipment e ON m.equipment_id = e.id
    INNER JOIN locations l ON e.location_id = l.id
    WHERE m.next_service_date IS NOT NULL
      AND m.next_service_date >= CURRENT_DATE
      AND m.next_service_date <= CURRENT_DATE + INTERVAL '30 days'
    ORDER BY m.next_service_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public (anyone can call this function)
GRANT EXECUTE ON FUNCTION get_upcoming_maintenance() TO public;

-- ==========================================
-- Function: get_overdue_maintenance
-- ==========================================
-- Returns all maintenance records that are overdue
-- Used by the dashboard to show overdue alerts
-- ==========================================

CREATE OR REPLACE FUNCTION get_overdue_maintenance()
RETURNS TABLE (
    equipment_id UUID,
    equipment_inventory_number VARCHAR,
    equipment_type VARCHAR,
    maintenance_type VARCHAR,
    next_service_date DATE,
    days_overdue INT,
    location_name VARCHAR,
    location_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id AS equipment_id,
        e.inventory_number AS equipment_inventory_number,
        e.type AS equipment_type,
        m.type AS maintenance_type,
        m.next_service_date,
        (CURRENT_DATE - m.next_service_date)::INT AS days_overdue,
        l.name AS location_name,
        l.id AS location_id
    FROM maintenance m
    INNER JOIN equipment e ON m.equipment_id = e.id
    INNER JOIN locations l ON e.location_id = l.id
    WHERE m.next_service_date IS NOT NULL
      AND m.next_service_date < CURRENT_DATE
    ORDER BY m.next_service_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION get_overdue_maintenance() TO public;

-- ==========================================
-- Function: get_equipment_summary
-- ==========================================
-- Returns summary statistics for equipment
-- Used by the dashboard for stat cards
-- ==========================================

CREATE OR REPLACE FUNCTION get_equipment_summary()
RETURNS TABLE (
    total_equipment BIGINT,
    active_equipment BIGINT,
    inactive_equipment BIGINT,
    maintenance_equipment BIGINT,
    retired_equipment BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT AS total_equipment,
        COUNT(*) FILTER (WHERE status = 'Aktivna')::BIGINT AS active_equipment,
        COUNT(*) FILTER (WHERE status = 'Neaktivna')::BIGINT AS inactive_equipment,
        COUNT(*) FILTER (WHERE status = 'U servisu')::BIGINT AS maintenance_equipment,
        COUNT(*) FILTER (WHERE status = 'Rashodovana')::BIGINT AS retired_equipment
    FROM equipment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION get_equipment_summary() TO public;

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
-- Created functions:
--   1. get_upcoming_maintenance() - Returns upcoming maintenance (next 30 days)
--   2. get_overdue_maintenance() - Returns overdue maintenance
--   3. get_equipment_summary() - Returns equipment statistics
--
-- All functions are callable by public (no authentication required)
-- ==========================================
