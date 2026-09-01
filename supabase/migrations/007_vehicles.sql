-- ==============================================================================
-- 007_vehicles.sql
-- Fleet Asset Registry with DB-level business constraints
-- ==============================================================================

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    police_number TEXT NOT NULL UNIQUE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    variant TEXT,
    year INTEGER NOT NULL,
    color TEXT NOT NULL,
    transmission TEXT NOT NULL DEFAULT 'Automatic',
    fuel_type TEXT NOT NULL DEFAULT 'Bensin',
    seat_capacity INTEGER NOT NULL DEFAULT 7,
    vin TEXT UNIQUE,
    engine_number TEXT,
    ownership_type vehicle_ownership_type NOT NULL DEFAULT 'JAJA',
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    status vehicle_status NOT NULL DEFAULT 'AVAILABLE',
    current_odometer INTEGER NOT NULL DEFAULT 0,
    next_service_odometer INTEGER,
    business_b2c_enabled BOOLEAN NOT NULL DEFAULT true,
    business_b2b_enabled BOOLEAN NOT NULL DEFAULT true,
    daily_rate_b2c NUMERIC,
    monthly_rate_b2b NUMERIC,
    location_city TEXT NOT NULL DEFAULT 'Jakarta',
    location_area TEXT NOT NULL DEFAULT 'Pool Pusat',
    gps_device_id TEXT,
    current_location_lat NUMERIC(10, 6),
    current_location_lng NUMERIC(10, 6),
    last_gps_update TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- Constraint: Vendor-owned vehicle MUST have a valid vendor_id
    CONSTRAINT vendor_ownership_check CHECK (
        (ownership_type = 'JAJA') OR 
        (ownership_type = 'VENDOR' AND vendor_id IS NOT NULL)
    ),

    -- Constraint: Vendor-owned vehicle can NEVER be enabled for B2C retail rental
    CONSTRAINT vendor_b2c_forbidden_check CHECK (
        NOT (ownership_type = 'VENDOR' AND business_b2c_enabled = true)
    )
);

