-- ==============================================================================
-- 014_gps.sql
-- GPS Telemetry Devices & Real-time Location History
-- ==============================================================================

CREATE TABLE IF NOT EXISTS gps_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    device_serial TEXT NOT NULL UNIQUE,
    provider TEXT NOT NULL DEFAULT 'Teltonika GPS Tracker',
    status TEXT NOT NULL DEFAULT 'ONLINE', -- ONLINE, OFFLINE, IDLE
    installed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS gps_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    gps_device_id UUID REFERENCES gps_devices(id) ON DELETE SET NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    speed INTEGER NOT NULL DEFAULT 0,
    heading TEXT DEFAULT 'North-East',
    odometer INTEGER,
    battery_level INTEGER DEFAULT 100,
    ignition BOOLEAN DEFAULT true,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

