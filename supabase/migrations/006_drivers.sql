-- ==============================================================================
-- 006_drivers.sql
-- Operational Driver Roster
-- ==============================================================================

CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    license_number TEXT NOT NULL,
    license_type TEXT NOT NULL DEFAULT 'SIM A',
    license_expiry DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE / ASSIGNED / OFF_DUTY
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

