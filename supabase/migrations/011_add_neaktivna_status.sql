-- Migration: Add 'Neaktivna' status option to equipment
-- This allows marking equipment as inactive (not in use but not retired)

-- Update the CHECK constraint to include 'Neaktivna' status
ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_status_check;
ALTER TABLE equipment ADD CONSTRAINT equipment_status_check
    CHECK (status IN ('Aktivna', 'Na servisu', 'Neispravna', 'Neaktivna', 'Povučena'));

-- Add comment
COMMENT ON COLUMN equipment.status IS 'Current operational status: Aktivna, Na servisu, Neispravna, Neaktivna, Povučena';

-- Update any analytics views/functions if needed
CREATE OR REPLACE FUNCTION get_equipment_stats()
RETURNS TABLE (
    total_equipment BIGINT,
    active_equipment BIGINT,
    service_equipment BIGINT,
    broken_equipment BIGINT,
    inactive_equipment BIGINT,
    retired_equipment BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT AS total_equipment,
        COUNT(*) FILTER (WHERE status = 'Aktivna')::BIGINT AS active_equipment,
        COUNT(*) FILTER (WHERE status = 'Na servisu')::BIGINT AS service_equipment,
        COUNT(*) FILTER (WHERE status = 'Neispravna')::BIGINT AS broken_equipment,
        COUNT(*) FILTER (WHERE status = 'Neaktivna')::BIGINT AS inactive_equipment,
        COUNT(*) FILTER (WHERE status = 'Povučena')::BIGINT AS retired_equipment
    FROM equipment;
END;
$$ LANGUAGE plpgsql;
