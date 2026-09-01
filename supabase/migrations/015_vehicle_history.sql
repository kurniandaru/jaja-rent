-- ==============================================================================
-- 015_vehicle_history.sql
-- Vehicle Lifecycle Event Log & Audit Trail
-- ==============================================================================

CREATE TABLE IF NOT EXISTS vehicle_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    title TEXT NOT NULL,
    reference_type TEXT, -- RENTAL, CONTRACT, MAINTENANCE, INSPECTION, DOCUMENT, STATUS
    reference_id UUID,
    description TEXT NOT NULL,
    actor TEXT,
    odometer INTEGER,
    tag TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

