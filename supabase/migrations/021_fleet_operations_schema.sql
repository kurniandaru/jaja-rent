-- ==============================================================================
-- 021_fleet_operations_schema.sql
-- Phase 2: Fleet Operations Core Schema
-- Tables: vehicle_allocations, vehicle_handovers, vehicle_damages,
--         inspection_photos, maintenance_qc
-- Enums: operational & lifecycle statuses, damage area & severity, QC results
-- ==============================================================================

-- 1. Extend vehicle_status enum if needed
DO $$ BEGIN
    ALTER TYPE vehicle_status ADD VALUE IF NOT EXISTS 'ALLOCATED';
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TYPE vehicle_status ADD VALUE IF NOT EXISTS 'RETURNED';
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TYPE vehicle_status ADD VALUE IF NOT EXISTS 'ACCIDENT';
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TYPE vehicle_status ADD VALUE IF NOT EXISTS 'SOLD';
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TYPE vehicle_status ADD VALUE IF NOT EXISTS 'QC';
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Add lifecycle_status to vehicles table
DO $$ BEGIN
    ALTER TABLE vehicles 
    ADD COLUMN IF NOT EXISTS lifecycle_status TEXT NOT NULL DEFAULT 'ACTIVE' 
    CHECK (lifecycle_status IN ('ACTIVE', 'INACTIVE', 'SOLD'));
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- 3. Vehicle Allocations Table (bridges reservation & vehicle with strict date constraints)
CREATE TABLE IF NOT EXISTS vehicle_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    allocation_number TEXT UNIQUE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
    rental_id UUID REFERENCES rentals(id) ON DELETE SET NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'ALLOCATED' CHECK (status IN ('PENDING', 'ALLOCATED', 'RELEASED', 'CANCELLED')),
    allocated_by TEXT NOT NULL,
    allocated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    released_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT allocation_dates_check CHECK (start_at < end_at)
);

CREATE SEQUENCE IF NOT EXISTS vehicle_allocation_seq START
WITH
    10001;

-- 4. Vehicle Handovers Table (physical handover before rental activation)
CREATE TABLE IF NOT EXISTS vehicle_handovers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    handover_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    handover_location TEXT NOT NULL,
    starting_odometer INTEGER NOT NULL,
    starting_fuel_percent INTEGER NOT NULL DEFAULT 100,
    performed_by TEXT NOT NULL,
    customer_acknowledged_at TIMESTAMPTZ,
    signature_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Vehicle Damages Table (Tracks condition defects across 10 areas)
CREATE TABLE IF NOT EXISTS vehicle_damages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    damage_number TEXT UNIQUE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    rental_id UUID REFERENCES rentals(id) ON DELETE SET NULL,
    inspection_id UUID REFERENCES inspections(id) ON DELETE SET NULL,
    area TEXT NOT NULL CHECK (area IN (
        'BODY', 'GLASS', 'LIGHTS', 'TIRES', 'ENGINE', 
        'INTERIOR', 'ELECTRICAL', 'AC', 'SAFETY', 'OTHER'
    )),
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'MINOR' CHECK (severity IN ('NORMAL', 'MINOR', 'MAJOR', 'CRITICAL')),
    estimated_cost NUMERIC NOT NULL DEFAULT 0,
    actual_cost NUMERIC DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN (
        'OPEN', 'UNDER_REVIEW', 'CHARGED', 'REPAIRED', 'WAIVED', 'CLOSED'
    )),
    reported_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE SEQUENCE IF NOT EXISTS vehicle_damage_seq START WITH 1001;

-- 6. Inspection Photos Table (Access-controlled photo documentation)
CREATE TABLE IF NOT EXISTS inspection_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    inspection_item_id UUID REFERENCES inspection_items(id) ON DELETE SET NULL,
    file_path TEXT NOT NULL,
    photo_type TEXT NOT NULL CHECK (photo_type IN (
        'OVERVIEW', 'DAMAGE', 'ODOMETER', 'FUEL', 'INTERIOR', 'EXTERIOR', 'OTHER'
    )),
    uploaded_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Maintenance QC Table (Quality Control Gate post-service)
CREATE TABLE IF NOT EXISTS maintenance_qc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_id UUID NOT NULL REFERENCES maintenance_records(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    checked_by TEXT NOT NULL,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    result TEXT NOT NULL CHECK (result IN ('PASS', 'FAIL')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_allocations_vehicle_dates ON vehicle_allocations (
    vehicle_id,
    start_at,
    end_at,
    status
);

CREATE INDEX IF NOT EXISTS idx_allocations_reservation ON vehicle_allocations (reservation_id);

CREATE INDEX IF NOT EXISTS idx_damages_vehicle ON vehicle_damages (vehicle_id, status);

CREATE INDEX IF NOT EXISTS idx_damages_rental ON vehicle_damages (rental_id);

CREATE INDEX IF NOT EXISTS idx_inspection_photos_inspection ON inspection_photos (inspection_id);

CREATE INDEX IF NOT EXISTS idx_maintenance_qc_maintenance ON maintenance_qc (maintenance_id);

-- 9. RBAC & RLS for new Phase 2 Fleet Operations tables
ALTER TABLE vehicle_allocations ENABLE ROW LEVEL SECURITY;

ALTER TABLE vehicle_handovers ENABLE ROW LEVEL SECURITY;

ALTER TABLE vehicle_damages ENABLE ROW LEVEL SECURITY;

ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;

ALTER TABLE maintenance_qc ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fleet_allocations_select" ON vehicle_allocations FOR
SELECT TO authenticated USING (true);

CREATE POLICY "fleet_allocations_modify" ON vehicle_allocations FOR ALL TO authenticated USING (
    current_user_role () IN (
        'ADMIN',
        'OPERATIONS',
        'FLEET'
    )
)
WITH
    CHECK (
        current_user_role () IN (
            'ADMIN',
            'OPERATIONS',
            'FLEET'
        )
    );

CREATE POLICY "fleet_handovers_select" ON vehicle_handovers FOR
SELECT TO authenticated USING (true);

CREATE POLICY "fleet_handovers_modify" ON vehicle_handovers FOR ALL TO authenticated USING (
    current_user_role () IN (
        'ADMIN',
        'OPERATIONS',
        'FLEET'
    )
)
WITH
    CHECK (
        current_user_role () IN (
            'ADMIN',
            'OPERATIONS',
            'FLEET'
        )
    );

CREATE POLICY "fleet_damages_select" ON vehicle_damages FOR
SELECT TO authenticated USING (true);

CREATE POLICY "fleet_damages_modify" ON vehicle_damages FOR ALL TO authenticated USING (
    current_user_role () IN (
        'ADMIN',
        'OPERATIONS',
        'FLEET',
        'MAINTENANCE',
        'WORKSHOP'
    )
)
WITH
    CHECK (
        current_user_role () IN (
            'ADMIN',
            'OPERATIONS',
            'FLEET',
            'MAINTENANCE',
            'WORKSHOP'
        )
    );

CREATE POLICY "fleet_qc_select" ON maintenance_qc FOR
SELECT TO authenticated USING (true);

CREATE POLICY "fleet_qc_modify" ON maintenance_qc FOR ALL TO authenticated USING (
    current_user_role () IN (
        'ADMIN',
        'OPERATIONS',
        'FLEET',
        'MAINTENANCE',
        'WORKSHOP'
    )
)
WITH
    CHECK (
        current_user_role () IN (
            'ADMIN',
            'OPERATIONS',
            'FLEET',
            'MAINTENANCE',
            'WORKSHOP'
        )
    );