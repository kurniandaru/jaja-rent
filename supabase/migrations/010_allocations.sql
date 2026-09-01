-- ==============================================================================
-- 010_allocations.sql
-- Vehicle Allocations for Rentals and Corporate Contracts (including Replacement Unit Tracking)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS rental_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    returned_at TIMESTAMPTZ,
    starting_odometer INTEGER NOT NULL DEFAULT 0,
    ending_odometer INTEGER,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS contract_vehicle_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES corporate_contracts(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    allocated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deployed_at TIMESTAMPTZ,
    returned_at TIMESTAMPTZ,
    status allocation_status NOT NULL DEFAULT 'ACTIVE',
    is_replacement BOOLEAN NOT NULL DEFAULT false,
    replacement_for_allocation_id UUID REFERENCES contract_vehicle_allocations(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

