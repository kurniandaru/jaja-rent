-- ==============================================================================
-- 011_inspections.sql
-- Vehicle Safety Inspections & Multi-point Checklists
-- ==============================================================================

CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    rental_id UUID REFERENCES rentals(id) ON DELETE SET NULL,
    inspection_type inspection_type NOT NULL DEFAULT 'PERIODIC',
    inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    inspector_name TEXT NOT NULL,
    odometer INTEGER NOT NULL DEFAULT 0,
    result inspection_result NOT NULL DEFAULT 'PASSED',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS inspection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- Exterior, Interior, Engine, Safety
    item_name TEXT NOT NULL, -- Body, Glass, Tire, Lamp, etc.
    status BOOLEAN NOT NULL DEFAULT true, -- true = Passed, false = Failed / Defect
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

