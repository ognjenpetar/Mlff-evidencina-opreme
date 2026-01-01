-- ==========================================
-- MIGRATION 010: Upcoming Maintenance Function
-- ==========================================
-- Purpose: Create RPC function for preventive maintenance tracking
-- Created: 2025-12-31
-- Version: 4.2 (Analytics & Preventive Maintenance)
-- ==========================================

-- STEP 1: Create function to get upcoming maintenance (next 30 days)
CREATE OR REPLACE FUNCTION get_upcoming_maintenance()
RETURNS TABLE (
    equipment_id UUID,
    inventory_number TEXT,
    type TEXT,
    next_service_date DATE,
    days_until_service INTEGER,
    location_name TEXT,
    last_maintenance_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.inventory_number,
        e.type,
        m.next_service_date,
        (m.next_service_date - CURRENT_DATE) as days_until_service,
        l.name as location_name,
        m.date as last_maintenance_date
    FROM equipment e
    LEFT JOIN LATERAL (
        SELECT date, next_service_date
        FROM maintenance
        WHERE equipment_id = e.id
        ORDER BY date DESC
        LIMIT 1
    ) m ON true
    JOIN locations l ON e.location_id = l.id
    WHERE m.next_service_date IS NOT NULL
      AND m.next_service_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30
    ORDER BY m.next_service_date ASC;
END;
$$ LANGUAGE plpgsql;

-- STEP 2: Add helpful comment
COMMENT ON FUNCTION get_upcoming_maintenance() IS 'Returns all equipment with maintenance due in the next 30 days, ordered by due date';

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================
/*
-- Test the function
SELECT * FROM get_upcoming_maintenance();

-- Check equipment with upcoming maintenance
SELECT
    equipment_id,
    inventory_number,
    type,
    next_service_date,
    days_until_service,
    location_name
FROM get_upcoming_maintenance()
ORDER BY days_until_service ASC;

-- Count urgent items (< 7 days)
SELECT COUNT(*) as urgent_count
FROM get_upcoming_maintenance()
WHERE days_until_service <= 7;
*/

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
-- Changes made:
-- ✅ Created get_upcoming_maintenance() RPC function
-- ✅ Returns equipment with maintenance due in next 30 days
-- ✅ Includes equipment details, location, and days until service
-- ✅ Used LATERAL JOIN for efficient latest maintenance lookup
--
-- Next step:
--   Test the function with: SELECT * FROM get_upcoming_maintenance();
-- ==========================================
