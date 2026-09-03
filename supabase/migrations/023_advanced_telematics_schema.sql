-- ==============================================================================
-- 023_advanced_telematics_schema.sql
-- Jaja Rent Phase 4: Advanced Fleet & Telematics Schema
-- Trips, Geofences, Operational Alerts, Telemetry Extension & Deduplication
-- ==============================================================================

-- 1. Extend gps_devices table
DO $$ BEGIN
    ALTER TABLE gps_devices ADD COLUMN IF NOT EXISTS device_status TEXT DEFAULT 'ONLINE';
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE gps_devices ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE gps_devices ADD COLUMN IF NOT EXISTS firmware_version TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE gps_devices ADD COLUMN IF NOT EXISTS external_device_id TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- 2. Extend gps_locations table
DO $$ BEGIN
    ALTER TABLE gps_locations ADD COLUMN IF NOT EXISTS engine_status TEXT DEFAULT 'RUNNING';
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE gps_locations ADD COLUMN IF NOT EXISTS fuel_level INTEGER DEFAULT 100;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE gps_locations ADD COLUMN IF NOT EXISTS temperature NUMERIC(5, 2);
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE gps_locations ADD COLUMN IF NOT EXISTS signal_strength INTEGER DEFAULT 5;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE gps_locations ADD COLUMN IF NOT EXISTS satellites INTEGER DEFAULT 12;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE gps_locations ADD COLUMN IF NOT EXISTS external_event_id TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- 3. Vehicle Trips Table (Trip Detection Engine)
CREATE TABLE IF NOT EXISTS vehicle_trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    rental_id TEXT,
    driver_id TEXT,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    start_latitude NUMERIC(10, 6),
    start_longitude NUMERIC(10, 6),
    end_latitude NUMERIC(10, 6),
    end_longitude NUMERIC(10, 6),
    distance_km NUMERIC(10, 2) DEFAULT 0,
    duration_seconds INT DEFAULT 0,
    max_speed INT DEFAULT 0,
    average_speed NUMERIC(5, 2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'INVALID')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Geofences Table
CREATE TABLE IF NOT EXISTS geofences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('BRANCH', 'WORKSHOP', 'PARKING', 'OPERATING_AREA', 'RESTRICTED_AREA', 'CUSTOM')),
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    radius_meters NUMERIC(10, 2) NOT NULL DEFAULT 500,
    severity TEXT DEFAULT 'WARNING' CHECK (severity IN ('CRITICAL', 'WARNING', 'INFO')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Operational Alerts Table (Alert Lifecycle & Deduplication)
CREATE TABLE IF NOT EXISTS operational_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'WARNING', 'INFO')),
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED')),
    vehicle_id TEXT NOT NULL,
    vehicle_plate TEXT,
    rental_id TEXT,
    customer_id TEXT,
    driver_id TEXT,
    event_id TEXT,
    incident_key TEXT UNIQUE, -- Ensures 1 incident record per ongoing situation
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location_lat NUMERIC(10, 6),
    location_lng NUMERIC(10, 6),
    speed INT DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    ended_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT,
    resolution_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_gps_locations_vehicle_recorded ON gps_locations (vehicle_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_vehicle_trips_vehicle_started ON vehicle_trips (vehicle_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_operational_alerts_vehicle_status ON operational_alerts (vehicle_id, status);

CREATE INDEX IF NOT EXISTS idx_operational_alerts_started ON operational_alerts (started_at DESC);

CREATE INDEX IF NOT EXISTS idx_operational_alerts_incident_key ON operational_alerts (incident_key);

CREATE INDEX IF NOT EXISTS idx_geofences_status ON geofences (status);

-- 7. Seed Initial Geofences (Operational Boundaries & Restricted Areas)
INSERT INTO geofences (id, name, type, latitude, longitude, radius_meters, severity, description) VALUES
    ('11111111-1111-1111-1111-111111111101', 'Pool Pusat Jaja SCBD Lot 8', 'BRANCH', -6.225500, 106.809500, 400, 'INFO', 'Kantor pusat & pool utama Jaja Rent Jakarta'),
    ('11111111-1111-1111-1111-111111111102', 'Bengkel Rekanan Auto2000 Tebet', 'WORKSHOP', -6.241500, 106.852100, 300, 'INFO', 'Bengkel rekanan pemeliharaan & servis berkala armada'),
    ('11111111-1111-1111-1111-111111111103', 'Bandara Soekarno-Hatta (Pickup Hub)', 'OPERATING_AREA', -6.127500, 106.653700, 2500, 'INFO', 'Area serah terima armada khusus penjemputan bandara'),
    ('11111111-1111-1111-1111-111111111104', 'Zona Terlarang Pelabuhan Merak (Luar Jabodetabek)', 'RESTRICTED_AREA', -5.932500, 105.998500, 1500, 'CRITICAL', 'Batas penyeberangan luar pulau yang dilarang tanpa izin operasional')
ON CONFLICT (id) DO NOTHING;

-- 8. Enable Row Level Security (RLS)
ALTER TABLE vehicle_trips ENABLE ROW LEVEL SECURITY;

ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;

ALTER TABLE operational_alerts ENABLE ROW LEVEL SECURITY;

-- 9. Strict Role-Based RLS Policies (Zero Public Anon Access)
CREATE POLICY "Auth users read geofences" ON geofences FOR
SELECT TO authenticated USING (true);

CREATE POLICY "Admin & Fleet manage geofences" ON geofences FOR ALL TO authenticated USING (
    current_user_role () IN (
        'ADMIN',
        'SUPER_ADMIN',
        'OPERATIONS',
        'FLEET_MANAGER'
    )
)
WITH
    CHECK (
        current_user_role () IN (
            'ADMIN',
            'SUPER_ADMIN',
            'OPERATIONS',
            'FLEET_MANAGER'
        )
    );

CREATE POLICY "Auth users read vehicle_trips" ON vehicle_trips FOR
SELECT TO authenticated USING (
        current_user_role () IN (
            'ADMIN', 'SUPER_ADMIN', 'OPERATIONS', 'FLEET_MANAGER', 'MANAGEMENT'
        )
    );

CREATE POLICY "Operations insert vehicle_trips" ON vehicle_trips FOR
INSERT
    TO authenticated
WITH
    CHECK (true);

CREATE POLICY "Auth users read operational_alerts" ON operational_alerts FOR
SELECT TO authenticated USING (
        current_user_role () IN (
            'ADMIN', 'SUPER_ADMIN', 'OPERATIONS', 'FLEET_MANAGER', 'MANAGEMENT', 'FINANCE', 'WORKSHOP'
        )
    );

CREATE POLICY "Operations manage operational_alerts" ON operational_alerts FOR ALL TO authenticated USING (
    current_user_role () IN (
        'ADMIN',
        'SUPER_ADMIN',
        'OPERATIONS',
        'FLEET_MANAGER'
    )
)
WITH
    CHECK (
        current_user_role () IN (
            'ADMIN',
            'SUPER_ADMIN',
            'OPERATIONS',
            'FLEET_MANAGER'
        )
    );