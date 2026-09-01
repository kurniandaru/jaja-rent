-- ==============================================================================
-- 016_indexes.sql
-- High-Performance Query Indexes for Fleet Operations Dashboard
-- ==============================================================================

-- Vehicles indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_ownership_type ON vehicles(ownership_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_police_number ON vehicles(police_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_b2c_enabled ON vehicles(business_b2c_enabled);
CREATE INDEX IF NOT EXISTS idx_vehicles_b2b_enabled ON vehicles(business_b2b_enabled);
CREATE INDEX IF NOT EXISTS idx_vehicles_vendor_id ON vehicles(vendor_id);

-- Rentals indexes
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_rental_type ON rentals(rental_type);
CREATE INDEX IF NOT EXISTS idx_rentals_start_date ON rentals(start_date);
CREATE INDEX IF NOT EXISTS idx_rentals_end_date ON rentals(end_date);
CREATE INDEX IF NOT EXISTS idx_rentals_customer_id ON rentals(customer_id);
CREATE INDEX IF NOT EXISTS idx_rentals_corporate_customer_id ON rentals(corporate_customer_id);
CREATE INDEX IF NOT EXISTS idx_rentals_contract_id ON rentals(contract_id);

-- Corporate Contracts indexes
CREATE INDEX IF NOT EXISTS idx_contracts_status ON corporate_contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_customer_id ON corporate_contracts(corporate_customer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_dates ON corporate_contracts(start_date, end_date);

-- Allocations indexes
CREATE INDEX IF NOT EXISTS idx_allocations_contract_id ON contract_vehicle_allocations(contract_id);
CREATE INDEX IF NOT EXISTS idx_allocations_vehicle_id ON contract_vehicle_allocations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_allocations_status ON contract_vehicle_allocations(status);
CREATE INDEX IF NOT EXISTS idx_rental_vehicles_rental_id ON rental_vehicles(rental_id);
CREATE INDEX IF NOT EXISTS idx_rental_vehicles_vehicle_id ON rental_vehicles(vehicle_id);

-- Inspections indexes
CREATE INDEX IF NOT EXISTS idx_inspections_vehicle_id ON inspections(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_inspections_date ON inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_inspections_result ON inspections(result);

-- Maintenance indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle_id ON maintenance_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_records(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_scheduled_date ON maintenance_records(scheduled_date);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_vehicle_id ON vehicle_documents(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_documents_expiry_date ON vehicle_documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_documents_type ON vehicle_documents(document_type);

-- GPS Telemetry indexes
CREATE INDEX IF NOT EXISTS idx_gps_locations_vehicle_rec ON gps_locations(vehicle_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_gps_devices_vehicle_id ON gps_devices(vehicle_id);

-- History indexes
CREATE INDEX IF NOT EXISTS idx_history_vehicle_date ON vehicle_history(vehicle_id, event_date DESC);

